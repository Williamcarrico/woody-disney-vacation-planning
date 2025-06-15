import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase/realtime-database';
import { ref, query, orderByChild, startAt, get } from 'firebase/database';

interface HistoricalData {
  [key: string]: {
    waitTime?: number;
    timestamp?: number;
  };
}

interface DayPattern {
  waitTime: number;
  timestamp: number;
}

interface EventData {
  date: string;
  type: string;
  impact: number;
  description: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const parkId = searchParams.get('parkId');
        const days = parseInt(searchParams.get('days') || '7');

        // Get crowd predictions based on historical patterns and known events
        const crowdForecast = await generateCrowdForecast(parkId, days);

        return NextResponse.json(crowdForecast);
    } catch (error) {
        console.error('Error generating crowd forecast:', error);
        return NextResponse.json(
            { error: 'Failed to generate crowd forecast' },
            { status: 500 }
        );
    }
}

async function generateCrowdForecast(parkId?: string | null, days: number = 7) {
    try {
        const today = new Date();
        const forecast = [];

        // Get historical crowd patterns
        const historicalPatterns = await getHistoricalCrowdPatterns(parkId);

        // Get known events that affect crowds
        const upcomingEvents = await getUpcomingEvents(days);

        // Calculate today's crowd level
        const todayCrowdLevel = calculateCurrentCrowdLevel(today, historicalPatterns, upcomingEvents.filter(e => e.date !== undefined) as EventData[]);

        for (let i = 0; i < days; i++) {
            const forecastDate = new Date(today);
            forecastDate.setDate(today.getDate() + i);

            const crowdLevel = calculateCrowdLevel(forecastDate, historicalPatterns, upcomingEvents.filter(e => e.date !== undefined) as EventData[]);
            const notes = generateCrowdNotes(forecastDate, crowdLevel, upcomingEvents.filter(e => e.date !== undefined) as EventData[]);

            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                level: crowdLevel,
                notes
            });
        }

        // Determine overall trend
        const trend = calculateTrend(forecast);

        return {
            today: todayCrowdLevel,
            forecast,
            trend,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error in generateCrowdForecast:', error);

        // Fallback with reasonable predictions
        return generateFallbackForecast(days);
    }
}

async function getHistoricalCrowdPatterns(_parkId?: string | null) {
    try {
        // Query historical wait time data to infer crowd patterns
        const historicalRef = ref(database, 'historicalWaitTimes');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const dataQuery = query(
            historicalRef,
            orderByChild('timestamp'),
            startAt(thirtyDaysAgo.getTime())
        );

        const snapshot = await get(dataQuery);

        if (!snapshot.exists()) {
            return getDefaultPatterns();
        }

        const data = snapshot.val() as unknown;
        return analyzeHistoricalPatterns(data);
    } catch (error) {
        console.error('Error getting historical patterns:', error);
        return getDefaultPatterns();
    }
}

function analyzeHistoricalPatterns(data: unknown) {
    const patterns = {
        hourly: {} as Record<number, number>,
        daily: {} as Record<number, number>, // 0 = Sunday, 6 = Saturday
        monthly: {} as Record<number, number>,
    };

    // Analyze the data to extract crowd patterns based on wait times
    if (data && typeof data === 'object') {
        Object.values(data as HistoricalData).forEach((attractionData) => {
            if (typeof attractionData === 'object' && attractionData) {
                Object.values(attractionData as Record<string, DayPattern>).forEach((entry) => {
                    if (entry.waitTime && entry.timestamp) {
                        const date = new Date(entry.timestamp);
                        const hour = date.getHours();
                        const dayOfWeek = date.getDay();
                        const month = date.getMonth();

                        // Normalize wait times to crowd levels (1-10)
                        const crowdLevel = Math.min(10, Math.max(1, Math.round(entry.waitTime / 10)));

                        patterns.hourly[hour] = (patterns.hourly[hour] || 0) + crowdLevel;
                        patterns.daily[dayOfWeek] = (patterns.daily[dayOfWeek] || 0) + crowdLevel;
                        patterns.monthly[month] = (patterns.monthly[month] || 0) + crowdLevel;
                    }
                });
            }
        });
    }

    // Average the patterns
    Object.keys(patterns.hourly).forEach(hour => {
        const hourNum = parseInt(hour);
        if (patterns.hourly[hourNum] !== undefined) {
            patterns.hourly[hourNum] = Math.round(patterns.hourly[hourNum] / 30); // Rough average
        }
    });

    return patterns;
}

function getDefaultPatterns() {
    return {
        hourly: {
            9: 3, 10: 4, 11: 6, 12: 7, 13: 8, 14: 7, 15: 6, 16: 5, 17: 4, 18: 6, 19: 7, 20: 5, 21: 3
        },
        daily: {
            0: 8, // Sunday - high
            1: 4, // Monday - low
            2: 4, // Tuesday - low
            3: 5, // Wednesday - medium
            4: 6, // Thursday - medium-high
            5: 7, // Friday - high
            6: 9  // Saturday - very high
        },
        monthly: {
            0: 6, 1: 5, 2: 6, 3: 7, 4: 6, 5: 8, 6: 9, 7: 8, 8: 6, 9: 7, 10: 8, 11: 9
        }
    };
}

async function getUpcomingEvents(days: number) {
    // This would typically query a database of known events
    // For now, return some common event patterns
    const events = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Check for holidays and special events
        if (isHoliday(date)) {
            events.push({
                date: date.toISOString().split('T')[0],
                type: 'holiday',
                impact: 3, // +3 crowd levels
                description: getHolidayName(date)
            });
        }

        // Check for marathon weekends, conventions, etc.
        if (isSpecialEvent(date)) {
            events.push({
                date: date.toISOString().split('T')[0],
                type: 'special',
                impact: 2,
                description: 'Special Event Weekend'
            });
        }
    }

    return events;
}

function calculateCurrentCrowdLevel(date: Date, patterns: Record<string, Record<number, number>>, events: EventData[]) {
    const dayOfWeek = date.getDay();
    const month = date.getMonth();

    let baseCrowdLevel = (patterns['daily'] && patterns['daily'][dayOfWeek]) || 5;

    // Adjust for month
    const monthlyValue = (patterns['monthly'] && patterns['monthly'][month]) || 6;
    const monthlyFactor = monthlyValue / 6;
    baseCrowdLevel = Math.round(baseCrowdLevel * monthlyFactor);

    // Adjust for events
    const todayEvents = events.filter(event =>
        event.date === date.toISOString().split('T')[0]
    );

    todayEvents.forEach(event => {
        baseCrowdLevel += event.impact;
    });

    return Math.min(10, Math.max(1, baseCrowdLevel));
}

function calculateCrowdLevel(date: Date, patterns: Record<string, Record<number, number>>, events: EventData[]) {
    return calculateCurrentCrowdLevel(date, patterns, events);
}

function generateCrowdNotes(date: Date, crowdLevel: number, events: EventData[]): string {
    const dayOfWeek = date.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const dayEvents = events.filter(event =>
        event.date === date.toISOString().split('T')[0]
    );

    if (dayEvents.length > 0) {
        return dayEvents[0].description;
    }

    const dayName = dayOfWeek >= 0 && dayOfWeek < dayNames.length ? dayNames[dayOfWeek] : 'Unknown day';
    if (crowdLevel <= 3) return `${dayName}, light crowds`;
    if (crowdLevel <= 5) return `${dayName}, moderate crowds`;
    if (crowdLevel <= 7) return `${dayName}, busy`;
    return `${dayName}, very busy`;
}

function calculateTrend(forecast: { level: number }[]): string {
    if (forecast.length < 3) return 'stable';

    const recent = forecast.slice(0, 3).reduce((sum, day) => sum + day.level, 0) / 3;
    const later = forecast.slice(-3).reduce((sum, day) => sum + day.level, 0) / 3;

    if (later > recent + 1) return 'increasing';
    if (later < recent - 1) return 'decreasing';
    return 'stable';
}

function isHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Check major holidays
    if (month === 12 && (day >= 20 && day <= 31)) return true; // Christmas season
    if (month === 1 && day <= 7) return true; // New Year
    if (month === 7 && day === 4) return true; // July 4th
    if (month === 11 && day >= 20 && day <= 29) return true; // Thanksgiving week
    if (month === 3 || month === 4) return true; // Spring break season

    return false;
}

function getHolidayName(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (month === 12) return 'Christmas Season';
    if (month === 1 && day <= 7) return 'New Year Week';
    if (month === 7 && day === 4) return 'Independence Day';
    if (month === 11) return 'Thanksgiving Week';
    if (month === 3 || month === 4) return 'Spring Break';

    return 'Holiday';
}

function isSpecialEvent(_date: Date): boolean {
    // This would check against a database of special events
    // For now, just return false
    return false;
}

function generateFallbackForecast(days: number) {
    const today = new Date();
    const forecast = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Simple pattern: weekends busier than weekdays
        const dayOfWeek = date.getDay();
        let level = 5; // Base level

        if (dayOfWeek === 0 || dayOfWeek === 6) level = 7; // Weekend
        if (dayOfWeek === 1 || dayOfWeek === 2) level = 4; // Monday/Tuesday

        forecast.push({
            date: date.toISOString().split('T')[0],
            level,
            notes: generateCrowdNotes(date, level, [])
        });
    }

    return {
        today: 5,
        forecast,
        trend: 'stable',
        lastUpdated: new Date().toISOString()
    };
}