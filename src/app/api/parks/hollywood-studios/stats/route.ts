import { NextRequest, NextResponse } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';

const HOLLYWOOD_STUDIOS_ID = '288747d1-8b4f-4a64-867e-ea7c9b27bad8';

/**
 * GET /api/parks/hollywood-studios/stats
 *
 * Get comprehensive statistics and analytics for Hollywood Studios
 *
 * Query parameters:
 * - type: 'overview' | 'wait-times' | 'capacity' | 'trends' | 'recommendations'
 * - period: 'current' | 'today' | 'week' | 'month'
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const statsType = searchParams.get('type') || 'overview';
        const period = searchParams.get('period') || 'current';

        // Fetch all necessary data
        const [parkData, childrenData, liveData, scheduleData] = await Promise.all([
            themeParksAPI.getEntity(HOLLYWOOD_STUDIOS_ID),
            themeParksAPI.getChildren(HOLLYWOOD_STUDIOS_ID),
            themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID),
            themeParksAPI.getSchedule(HOLLYWOOD_STUDIOS_ID)
        ]);

        switch (statsType) {
            case 'overview': {
                const stats = generateOverviewStats(parkData, childrenData, liveData, scheduleData);
                return NextResponse.json(stats);
            }

            case 'wait-times': {
                const waitTimeStats = generateWaitTimeStats(liveData, period);
                return NextResponse.json(waitTimeStats);
            }

            case 'capacity': {
                const capacityStats = generateCapacityStats(liveData, childrenData);
                return NextResponse.json(capacityStats);
            }

            case 'trends': {
                const trendStats = generateTrendStats(liveData, scheduleData, period);
                return NextResponse.json(trendStats);
            }

            case 'recommendations': {
                const recommendations = generateRecommendations(liveData, scheduleData);
                return NextResponse.json(recommendations);
            }

            default: {
                return NextResponse.json(
                    {
                        error: 'Invalid stats type',
                        validTypes: ['overview', 'wait-times', 'capacity', 'trends', 'recommendations']
                    },
                    { status: 400 }
                );
            }
        }

    } catch (error) {
        console.error('Error generating Hollywood Studios stats:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Generate overview statistics
function generateOverviewStats(parkData: any, childrenData: any, liveData: any, scheduleData: any): any {
    const attractions = childrenData.children.filter((c: any) => c.entityType === 'ATTRACTION');
    const restaurants = childrenData.children.filter((c: any) => c.entityType === 'RESTAURANT');
    const shows = childrenData.children.filter((c: any) => c.entityType === 'SHOW');
    const shops = childrenData.children.filter((c: any) => c.entityType === 'MERCHANDISE');

    const operatingAttractions = liveData.liveData.filter((item: any) =>
        item.status === 'OPERATING' && item.entityType === 'ATTRACTION'
    );

    const waitTimes = liveData.liveData
        .filter((item: any) => item.queue?.STANDBY?.waitTime !== null)
        .map((item: any) => item.queue.STANDBY.waitTime);

    const todaySchedule = scheduleData.schedule.find((s: any) =>
        new Date(s.date).toDateString() === new Date().toDateString()
    );

    return {
        park: {
            name: parkData.name,
            status: 'OPERATING',
            currentDate: new Date().toISOString(),
            hoursToday: todaySchedule ? {
                open: todaySchedule.openingTime,
                close: todaySchedule.closingTime,
                type: todaySchedule.type
            } : null
        },
        totals: {
            attractions: attractions.length,
            restaurants: restaurants.length,
            shows: shows.length,
            shops: shops.length,
            total: childrenData.children.length
        },
        operational: {
            attractionsOperating: operatingAttractions.length,
            attractionsClosed: attractions.length - operatingAttractions.length,
            percentOperational: Math.round((operatingAttractions.length / attractions.length) * 100)
        },
        waitTimes: {
            current: {
                average: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a: number, b: number) => a + b) / waitTimes.length) : 0,
                median: waitTimes.length > 0 ? getMedian(waitTimes) : 0,
                peak: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
                minimum: waitTimes.length > 0 ? Math.min(...waitTimes) : 0
            },
            distribution: getWaitTimeDistribution(waitTimes),
            topWaits: getTopWaitTimes(liveData.liveData, 5)
        },
        areas: getAreaStats(childrenData, liveData),
        experienceTypes: {
            thrill: countByType(childrenData.children, 'thrill'),
            family: countByType(childrenData.children, 'family'),
            shows: shows.length,
            interactive: countByType(childrenData.children, 'interactive')
        }
    };
}

// Generate wait time statistics
function generateWaitTimeStats(liveData: any, period: string): any {
    const currentWaitTimes = liveData.liveData
        .filter((item: any) => item.queue?.STANDBY?.waitTime !== null)
        .map((item: any) => ({
            id: item.id,
            name: item.name,
            waitTime: item.queue.STANDBY.waitTime,
            status: item.status,
            area: getAreaForAttraction(item.name)
        }));

    const stats = {
        period,
        timestamp: new Date().toISOString(),
        summary: {
            totalAttractions: currentWaitTimes.length,
            averageWait: Math.round(currentWaitTimes.reduce((sum: number, item: any) => sum + item.waitTime, 0) / currentWaitTimes.length),
            medianWait: getMedian(currentWaitTimes.map((item: any) => item.waitTime)),
            peakWait: Math.max(...currentWaitTimes.map((item: any) => item.waitTime)),
            totalGuestsWaiting: estimateTotalGuestsWaiting(currentWaitTimes)
        },
        byArea: getWaitTimesByArea(currentWaitTimes),
        byIntensity: getWaitTimesByIntensity(currentWaitTimes),
        distribution: {
            under15: currentWaitTimes.filter((item: any) => item.waitTime < 15).length,
            between15and30: currentWaitTimes.filter((item: any) => item.waitTime >= 15 && item.waitTime < 30).length,
            between30and60: currentWaitTimes.filter((item: any) => item.waitTime >= 30 && item.waitTime < 60).length,
            between60and90: currentWaitTimes.filter((item: any) => item.waitTime >= 60 && item.waitTime < 90).length,
            over90: currentWaitTimes.filter((item: any) => item.waitTime >= 90).length
        },
        topWaits: currentWaitTimes
            .sort((a: any, b: any) => b.waitTime - a.waitTime)
            .slice(0, 10),
        recommendations: generateWaitTimeRecommendations(currentWaitTimes)
    };

    return stats;
}

// Generate capacity statistics
function generateCapacityStats(liveData: any, childrenData: any): any {
    const attractions = childrenData.children.filter((c: any) => c.entityType === 'ATTRACTION');

    // Estimate capacity based on wait times and operational status
    const operationalAttractions = liveData.liveData.filter((item: any) =>
        item.status === 'OPERATING' && item.entityType === 'ATTRACTION'
    );

    const waitingAttractions = operationalAttractions.filter((item: any) =>
        item.queue?.STANDBY?.waitTime !== null && item.queue.STANDBY.waitTime > 0
    );

    const avgWaitTime = waitingAttractions.length > 0
        ? waitingAttractions.reduce((sum: number, item: any) => sum + item.queue.STANDBY.waitTime, 0) / waitingAttractions.length
        : 0;

    const estimatedParkCapacity = estimateParkCapacity(avgWaitTime, operationalAttractions.length);

    return {
        timestamp: new Date().toISOString(),
        parkCapacity: {
            estimated: estimatedParkCapacity,
            level: getCapacityLevel(estimatedParkCapacity),
            percentage: estimatedParkCapacity,
            trend: 'stable' // Would need historical data for real trend
        },
        operationalCapacity: {
            attractionsOperating: operationalAttractions.length,
            totalAttractions: attractions.length,
            percentOperational: Math.round((operationalAttractions.length / attractions.length) * 100)
        },
        areas: generateAreaCapacityStats(liveData),
        recommendations: generateCapacityRecommendations(estimatedParkCapacity),
        projections: {
            nextHour: estimatedParkCapacity + 5, // Simplified projection
            peakTime: '2:00 PM',
            expectedPeakCapacity: Math.min(estimatedParkCapacity + 20, 100)
        }
    };
}

// Generate trend statistics
function generateTrendStats(liveData: any, scheduleData: any, period: string): any {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    return {
        period,
        timestamp: now.toISOString(),
        currentTrends: {
            waitTimeTrend: calculateWaitTimeTrend(liveData),
            crowdTrend: calculateCrowdTrend(hour, dayOfWeek),
            popularAreas: getPopularAreas(liveData)
        },
        patterns: {
            dayOfWeek: getDayOfWeekPattern(dayOfWeek),
            timeOfDay: getTimeOfDayPattern(hour),
            seasonal: getSeasonalPattern(now.getMonth() + 1)
        },
        predictions: {
            nextHour: predictNextHour(hour, dayOfWeek),
            peakTimes: getPredictedPeakTimes(dayOfWeek),
            recommendedVisitTimes: getRecommendedVisitTimes(dayOfWeek)
        },
        historicalComparison: {
            vsLastWeek: 'Similar crowd levels',
            vsLastMonth: 'Slightly busier',
            vsLastYear: 'Comparable wait times'
        }
    };
}

// Generate recommendations
function generateRecommendations(liveData: any, scheduleData: any): any {
    const waitTimes = liveData.liveData
        .filter((item: any) => item.queue?.STANDBY?.waitTime !== null)
        .map((item: any) => ({
            name: item.name,
            waitTime: item.queue.STANDBY.waitTime,
            area: getAreaForAttraction(item.name)
        }));

    const avgWaitTime = waitTimes.length > 0
        ? waitTimes.reduce((sum: number, item: any) => sum + item.waitTime, 0) / waitTimes.length
        : 0;

    const currentHour = new Date().getHours();

    return {
        timestamp: new Date().toISOString(),
        crowdLevel: getCrowdLevel(avgWaitTime),
        immediate: {
            attractions: getImmediateAttractionRecommendations(waitTimes),
            dining: getDiningRecommendations(currentHour),
            shows: getShowRecommendations(currentHour)
        },
        strategy: {
            touring: getTouringStrategy(avgWaitTime, currentHour),
            lightningLane: getLightningLaneStrategy(waitTimes),
            breaks: getBreakRecommendations(currentHour)
        },
        timeSpecific: {
            morning: currentHour < 12 ? getMorningStrategy() : null,
            afternoon: currentHour >= 12 && currentHour < 17 ? getAfternoonStrategy() : null,
            evening: currentHour >= 17 ? getEveningStrategy() : null
        },
        alerts: generateAlerts(liveData, avgWaitTime)
    };
}

// Helper functions
function getMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

function getWaitTimeDistribution(waitTimes: number[]): any {
    return {
        '0-15min': waitTimes.filter(t => t >= 0 && t <= 15).length,
        '16-30min': waitTimes.filter(t => t > 15 && t <= 30).length,
        '31-45min': waitTimes.filter(t => t > 30 && t <= 45).length,
        '46-60min': waitTimes.filter(t => t > 45 && t <= 60).length,
        '61-90min': waitTimes.filter(t => t > 60 && t <= 90).length,
        'over90min': waitTimes.filter(t => t > 90).length
    };
}

function getTopWaitTimes(liveData: any[], count: number): any[] {
    return liveData
        .filter(item => item.queue?.STANDBY?.waitTime !== null)
        .sort((a, b) => b.queue.STANDBY.waitTime - a.queue.STANDBY.waitTime)
        .slice(0, count)
        .map(item => ({
            name: item.name,
            waitTime: item.queue.STANDBY.waitTime,
            area: getAreaForAttraction(item.name)
        }));
}

function getAreaStats(childrenData: any, liveData: any): any {
    const areas = [
        'Hollywood Boulevard',
        'Echo Lake',
        'Grand Avenue',
        'Star Wars: Galaxy\'s Edge',
        'Toy Story Land',
        'Animation Courtyard',
        'Sunset Boulevard'
    ];

    return areas.reduce((stats: any, area: string) => {
        const areaAttractions = liveData.liveData.filter((item: any) =>
            getAreaForAttraction(item.name) === area.toLowerCase().replace(/[^a-z0-9]/g, '-')
        );

        const waitTimes = areaAttractions
            .filter((item: any) => item.queue?.STANDBY?.waitTime !== null)
            .map((item: any) => item.queue.STANDBY.waitTime);

        stats[area] = {
            totalAttractions: areaAttractions.length,
            operating: areaAttractions.filter((item: any) => item.status === 'OPERATING').length,
            averageWait: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b) / waitTimes.length) : 0,
            peakWait: waitTimes.length > 0 ? Math.max(...waitTimes) : 0
        };

        return stats;
    }, {});
}

function countByType(children: any[], type: string): number {
    // Simplified type counting - would need proper categorization
    return children.filter(child => {
        const name = child.name.toLowerCase();
        switch (type) {
            case 'thrill':
                return name.includes('roller coaster') || name.includes('tower') || name.includes('rise');
            case 'family':
                return name.includes('toy story') || name.includes('mickey') || name.includes('junior');
            case 'interactive':
                return name.includes('millennium falcon') || name.includes('mania');
            default:
                return false;
        }
    }).length;
}

function getAreaForAttraction(name: string): string {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('mickey') && nameLower.includes('minnie')) return 'hollywood-boulevard';
    if (nameLower.includes('star tours') || nameLower.includes('indiana') || nameLower.includes('frozen')) return 'echo-lake';
    if (nameLower.includes('muppet')) return 'grand-avenue';
    if (nameLower.includes('rise') || nameLower.includes('millennium') || nameLower.includes('smuggler')) return 'galaxys-edge';
    if (nameLower.includes('slinky') || nameLower.includes('toy story') || nameLower.includes('alien')) return 'toy-story-land';
    if (nameLower.includes('disney junior') || nameLower.includes('mermaid')) return 'animation-courtyard';
    if (nameLower.includes('tower') || nameLower.includes('rock') || nameLower.includes('beauty')) return 'sunset-boulevard';

    return 'unknown';
}

function estimateTotalGuestsWaiting(waitTimes: any[]): number {
    // Rough estimation based on average attraction capacity
    return waitTimes.reduce((total, item) => {
        const capacity = getEstimatedHourlyCapacity(item.name);
        const guestsWaiting = (item.waitTime / 60) * capacity;
        return total + guestsWaiting;
    }, 0);
}

function getEstimatedHourlyCapacity(attractionName: string): number {
    // Simplified capacity estimates
    const name = attractionName.toLowerCase();
    if (name.includes('rise')) return 1700;
    if (name.includes('millennium')) return 1800;
    if (name.includes('tower')) return 1600;
    if (name.includes('rock')) return 1200;
    if (name.includes('slinky')) return 1000;
    return 800; // Default
}

function estimateParkCapacity(avgWaitTime: number, operationalAttractions: number): number {
    // Simplified capacity estimation based on wait times
    if (avgWaitTime < 20) return 30;
    if (avgWaitTime < 40) return 50;
    if (avgWaitTime < 60) return 70;
    if (avgWaitTime < 80) return 85;
    return 95;
}

function getCapacityLevel(percentage: number): string {
    if (percentage < 30) return 'Low';
    if (percentage < 50) return 'Moderate';
    if (percentage < 70) return 'High';
    if (percentage < 85) return 'Very High';
    return 'At Capacity';
}

function getWaitTimesByArea(waitTimes: any[]): any {
    const byArea: any = {};

    waitTimes.forEach(item => {
        const area = item.area;
        if (!byArea[area]) {
            byArea[area] = {
                attractions: 0,
                totalWait: 0,
                averageWait: 0,
                peakWait: 0
            };
        }

        byArea[area].attractions++;
        byArea[area].totalWait += item.waitTime;
        byArea[area].peakWait = Math.max(byArea[area].peakWait, item.waitTime);
    });

    Object.keys(byArea).forEach(area => {
        byArea[area].averageWait = Math.round(byArea[area].totalWait / byArea[area].attractions);
    });

    return byArea;
}

function getWaitTimesByIntensity(waitTimes: any[]): any {
    const byIntensity: any = {
        extreme: { count: 0, avgWait: 0 },
        thrill: { count: 0, avgWait: 0 },
        moderate: { count: 0, avgWait: 0 },
        family: { count: 0, avgWait: 0 }
    };

    waitTimes.forEach(item => {
        const intensity = getIntensityLevel(item.name);
        if (byIntensity[intensity]) {
            byIntensity[intensity].count++;
            byIntensity[intensity].avgWait += item.waitTime;
        }
    });

    Object.keys(byIntensity).forEach(intensity => {
        if (byIntensity[intensity].count > 0) {
            byIntensity[intensity].avgWait = Math.round(byIntensity[intensity].avgWait / byIntensity[intensity].count);
        }
    });

    return byIntensity;
}

function getIntensityLevel(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('rock')) return 'extreme';
    if (nameLower.includes('tower') || nameLower.includes('rise')) return 'thrill';
    if (nameLower.includes('slinky') || nameLower.includes('star tours')) return 'moderate';
    return 'family';
}

function generateWaitTimeRecommendations(waitTimes: any[]): string[] {
    const recommendations = [];
    const avgWait = waitTimes.reduce((sum, item) => sum + item.waitTime, 0) / waitTimes.length;

    if (avgWait > 60) {
        recommendations.push('Consider purchasing Individual Lightning Lane for Rise of the Resistance');
        recommendations.push('Visit Toy Story Land attractions early or late in the day');
    }

    const shortWaits = waitTimes.filter(item => item.waitTime < 30);
    if (shortWaits.length > 0) {
        recommendations.push(`Low wait times at: ${shortWaits.slice(0, 3).map(item => item.name).join(', ')}`);
    }

    return recommendations;
}

function generateAreaCapacityStats(liveData: any): any {
    const areas = ['galaxys-edge', 'toy-story-land', 'sunset-boulevard'];
    return areas.reduce((stats: any, area: string) => {
        const areaAttractions = liveData.liveData.filter((item: any) =>
            getAreaForAttraction(item.name) === area
        );

        const avgWait = areaAttractions
            .filter((item: any) => item.queue?.STANDBY?.waitTime !== null)
            .reduce((sum: number, item: any) => sum + item.queue.STANDBY.waitTime, 0) / areaAttractions.length || 0;

        stats[area] = {
            capacity: avgWait < 30 ? 'Low' : avgWait < 60 ? 'Moderate' : 'High',
            recommendation: avgWait < 30 ? 'Good time to visit' : 'Consider visiting later'
        };

        return stats;
    }, {});
}

function generateCapacityRecommendations(capacity: number): string[] {
    const recommendations = [];

    if (capacity < 50) {
        recommendations.push('Excellent time to experience popular attractions');
        recommendations.push('Minimal wait times expected throughout the park');
    } else if (capacity < 80) {
        recommendations.push('Use Lightning Lane for top attractions');
        recommendations.push('Take advantage of Single Rider lines where available');
    } else {
        recommendations.push('Focus on shows and less popular attractions');
        recommendations.push('Consider park hopping if available');
    }

    return recommendations;
}

function calculateWaitTimeTrend(liveData: any): string {
    // Simplified - would need historical data
    const avgWait = liveData.liveData
        .filter((item: any) => item.queue?.STANDBY?.waitTime !== null)
        .reduce((sum: number, item: any) => sum + item.queue.STANDBY.waitTime, 0) / liveData.liveData.length || 0;

    if (avgWait < 30) return 'decreasing';
    if (avgWait > 60) return 'increasing';
    return 'stable';
}

function calculateCrowdTrend(hour: number, dayOfWeek: number): string {
    // Weekend vs weekday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (hour < 12) return 'building';
        if (hour > 18) return 'decreasing';
        return 'peak';
    }

    // Weekday patterns
    if (hour < 11) return 'building';
    if (hour > 17) return 'decreasing';
    return 'moderate';
}

function getPopularAreas(liveData: any): string[] {
    const areaWaits: any = {};

    liveData.liveData.forEach((item: any) => {
        if (item.queue?.STANDBY?.waitTime) {
            const area = getAreaForAttraction(item.name);
            if (!areaWaits[area]) areaWaits[area] = [];
            areaWaits[area].push(item.queue.STANDBY.waitTime);
        }
    });

    return Object.entries(areaWaits)
        .map(([area, waits]: [string, any]) => ({
            area,
            avgWait: waits.reduce((a: number, b: number) => a + b) / waits.length
        }))
        .sort((a, b) => b.avgWait - a.avgWait)
        .slice(0, 3)
        .map(item => item.area);
}

function getDayOfWeekPattern(dayOfWeek: number): string {
    const patterns = [
        'Sunday - Moderate to high crowds',
        'Monday - Lower crowds, good touring day',
        'Tuesday - Lower crowds, good touring day',
        'Wednesday - Moderate crowds',
        'Thursday - Moderate crowds',
        'Friday - High crowds, locals arriving',
        'Saturday - Highest crowds of the week'
    ];
    return patterns[dayOfWeek];
}

function getTimeOfDayPattern(hour: number): string {
    if (hour < 10) return 'Early morning - Lowest wait times';
    if (hour < 12) return 'Late morning - Crowds building';
    if (hour < 14) return 'Midday - Peak wait times';
    if (hour < 17) return 'Afternoon - Sustained high waits';
    if (hour < 19) return 'Early evening - Crowds beginning to thin';
    return 'Late evening - Low wait times return';
}

function getSeasonalPattern(month: number): string {
    const patterns: Record<number, string> = {
        1: 'Low season - Excellent touring conditions',
        2: 'Low season with Presidents Day crowds',
        3: 'Spring Break - High crowds',
        4: 'Spring Break and Easter - Very high crowds',
        5: 'Moderate crowds',
        6: 'Summer season begins - High crowds',
        7: 'Peak summer - Very high crowds',
        8: 'Peak summer - Very high crowds',
        9: 'Low season - Great touring after Labor Day',
        10: 'Halloween season - Moderate to high crowds',
        11: 'Thanksgiving week very crowded',
        12: 'Holiday season - Extreme crowds'
    };
    return patterns[month] || 'Moderate crowds';
}

function predictNextHour(hour: number, dayOfWeek: number): string {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (hour < 11) return 'Wait times will increase significantly';
    if (hour < 14) return 'Peak wait times expected';
    if (hour < 17) return 'Wait times remain high';
    if (hour < 19) return 'Wait times beginning to decrease';
    return 'Significant wait time decreases';
}

function getPredictedPeakTimes(dayOfWeek: number): string[] {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
        return ['11:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'];
    }
    return ['12:00 PM - 2:00 PM', '3:00 PM - 5:00 PM'];
}

function getRecommendedVisitTimes(dayOfWeek: number): string[] {
    return [
        'Park opening to 10:00 AM',
        'After 7:00 PM',
        'During parade and show times'
    ];
}

function getCrowdLevel(avgWaitTime: number): string {
    if (avgWaitTime < 20) return 'Low';
    if (avgWaitTime < 40) return 'Moderate';
    if (avgWaitTime < 60) return 'High';
    return 'Very High';
}

function getImmediateAttractionRecommendations(waitTimes: any[]): string[] {
    const shortWaits = waitTimes
        .filter(item => item.waitTime < 30)
        .sort((a, b) => a.waitTime - b.waitTime)
        .slice(0, 5);

    if (shortWaits.length === 0) {
        return ['All major attractions have significant waits', 'Consider shows or dining'];
    }

    return shortWaits.map(item => `${item.name} - ${item.waitTime} min wait`);
}

function getDiningRecommendations(hour: number): string[] {
    if (hour < 11) {
        return ['Woody\'s Lunch Box for breakfast items', 'Trolley Car Café for coffee and pastries'];
    }
    if (hour < 14) {
        return ['Mobile order lunch now to avoid peak dining rush', 'Consider Docking Bay 7 or BaseLine Tap House'];
    }
    if (hour < 17) {
        return ['Good time for table service dining', 'Make reservations for dinner if not already done'];
    }
    return ['Oga\'s Cantina for unique beverages', 'Light snacks available at various kiosks'];
}

function getShowRecommendations(hour: number): string[] {
    if (hour < 12) {
        return ['Indiana Jones Epic Stunt Spectacular at 11:30 AM', 'Frozen Sing-Along for air conditioning'];
    }
    if (hour < 17) {
        return ['Beauty and the Beast performances throughout afternoon', 'Muppet*Vision 3D for a break'];
    }
    return ['Secure Fantasmic! viewing spot 30-45 minutes early', 'Check for final Indiana Jones show'];
}

function getTouringStrategy(avgWaitTime: number, hour: number): string[] {
    const strategies = [];

    if (avgWaitTime > 50) {
        strategies.push('Focus on Tier 2 attractions with shorter waits');
        strategies.push('Utilize Single Rider lines at Millennium Falcon and Rock \'n\' Roller Coaster');
    }

    if (hour < 12) {
        strategies.push('Prioritize Galaxy\'s Edge attractions before crowds build');
    } else if (hour > 17) {
        strategies.push('Take advantage of shorter evening wait times');
    }

    return strategies;
}

function getLightningLaneStrategy(waitTimes: any[]): string[] {
    const highWaits = waitTimes.filter(item => item.waitTime > 60);

    if (highWaits.length > 0) {
        return [
            'Purchase Individual Lightning Lane for Rise of the Resistance',
            'Use Lightning Lane Multi Pass for Slinky Dog Dash and Tower of Terror'
        ];
    }

    return ['Lightning Lane may not be necessary with current wait times'];
}

function getBreakRecommendations(hour: number): string[] {
    if (hour >= 12 && hour <= 15) {
        return [
            'Peak heat and crowds - consider indoor attractions',
            'Good time for lunch at table service restaurant',
            'Watch shows in air-conditioned theaters'
        ];
    }
    return [];
}

function getMorningStrategy(): string[] {
    return [
        'Head to Rise of the Resistance first',
        'Follow with Slinky Dog Dash before crowds arrive',
        'Save indoor attractions for afternoon heat'
    ];
}

function getAfternoonStrategy(): string[] {
    return [
        'Focus on shows and indoor attractions',
        'Good time for character meet and greets',
        'Mobile order dinner to avoid wait'
    ];
}

function getEveningStrategy(): string[] {
    return [
        'Ride major attractions with reduced waits',
        'Secure Fantasmic! viewing location',
        'End night with Tower of Terror or Rock \'n\' Roller Coaster'
    ];
}

function generateAlerts(liveData: any, avgWaitTime: number): string[] {
    const alerts = [];

    // Check for ride closures
    const closedMajorRides = liveData.liveData.filter((item: any) =>
        item.status !== 'OPERATING' &&
        (item.name.includes('Rise') || item.name.includes('Slinky') || item.name.includes('Tower'))
    );

    if (closedMajorRides.length > 0) {
        closedMajorRides.forEach((ride: any) => {
            alerts.push(`${ride.name} is currently ${ride.status}`);
        });
    }

    if (avgWaitTime > 70) {
        alerts.push('Extremely high wait times - consider adjusting touring plan');
    }

    const riseWait = liveData.liveData.find((item: any) =>
        item.name.includes('Rise of the Resistance')
    )?.queue?.STANDBY?.waitTime;

    if (riseWait && riseWait > 120) {
        alerts.push('Rise of the Resistance wait exceeds 2 hours');
    }

    return alerts;
}