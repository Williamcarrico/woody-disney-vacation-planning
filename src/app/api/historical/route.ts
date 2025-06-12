import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase/realtime-database';
import { ref, query, orderByChild, startAt, endAt, get, set, push } from 'firebase/database';

interface HistoricalWaitTimeRequest {
    attractionId: string;
    waitTime: number;
    timestamp: string;
    parkId?: string;
}

interface HistoryEntry {
    waitTime: number;
    timestamp: number;
    date: string;
    hour: number;
    dayOfWeek: number;
    parkId: string | null;
}

interface WaitTimeData {
    timestamp: string;
    waitTime: number;
}

interface Averages {
    overall: number;
    hourly: Record<string, number>;
    daily: Record<string, number>;
}

interface HistoricalDataResponse {
    attractionId: string;
    startDate: string;
    endDate: string;
    waitTimes: WaitTimeData[];
    averages: Averages;
}

// Mock historical data processing endpoint
// In a real application, this would fetch from a database or external API
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const attractionId = searchParams.get('attractionId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!attractionId) {
            return NextResponse.json(
                { error: 'Attraction ID is required' },
                { status: 400 }
            );
        }

        // Get historical data from Firebase
        const historicalData = await getHistoricalWaitTimes(attractionId, startDate, endDate);

        if (!historicalData || historicalData.waitTimes.length === 0) {
            return NextResponse.json(
                {
                    error: 'No historical data available for this attraction in the specified date range',
                    code: 'NO_DATA_AVAILABLE'
                },
                { status: 404 }
            );
        }

        return NextResponse.json(historicalData);
    } catch (error) {
        console.error('Error processing historical data:', error);
        return NextResponse.json(
            { error: 'Failed to process historical data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as unknown;
        
        // Type guard to validate the request body
        if (!isHistoricalWaitTimeRequest(body)) {
            return NextResponse.json(
                { error: 'attractionId, waitTime, and timestamp are required' },
                { status: 400 }
            );
        }

        const { attractionId, waitTime, timestamp, parkId } = body;

        // Store historical wait time data
        await storeHistoricalWaitTime(attractionId, waitTime, new Date(timestamp), parkId);

        return NextResponse.json(
            { message: 'Historical wait time data stored successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error storing historical data:', error);
        return NextResponse.json(
            { error: 'Failed to store historical data' },
            { status: 500 }
        );
    }
}

// Type guard for request validation
function isHistoricalWaitTimeRequest(body: unknown): body is HistoricalWaitTimeRequest {
    return (
        typeof body === 'object' &&
        body !== null &&
        'attractionId' in body &&
        'waitTime' in body &&
        'timestamp' in body &&
        typeof (body as HistoricalWaitTimeRequest).attractionId === 'string' &&
        typeof (body as HistoricalWaitTimeRequest).waitTime === 'number' &&
        typeof (body as HistoricalWaitTimeRequest).timestamp === 'string'
    );
}

// Store historical wait time data
async function storeHistoricalWaitTime(
    attractionId: string,
    waitTime: number,
    timestamp: Date,
    parkId?: string
): Promise<void> {
    const historicalRef = ref(database, `historicalWaitTimes/${attractionId}`);
    const entryRef = push(historicalRef);

    const historyEntry = {
        waitTime,
        timestamp: timestamp.getTime(),
        date: timestamp.toISOString().split('T')[0], // YYYY-MM-DD
        hour: timestamp.getHours(),
        dayOfWeek: timestamp.getDay(), // 0 = Sunday, 6 = Saturday
        parkId: parkId || null
    };

    await set(entryRef, historyEntry);
}

// Get historical wait times from Firebase
async function getHistoricalWaitTimes(
    attractionId: string,
    startDate?: string | null,
    endDate?: string | null
): Promise<HistoricalDataResponse> {
    // Default to last 30 days if dates not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const historicalRef = ref(database, `historicalWaitTimes/${attractionId}`);

    // Query data within the date range
    const dataQuery = query(
        historicalRef,
        orderByChild('timestamp'),
        startAt(start.getTime()),
        endAt(end.getTime())
    );

    const snapshot = await get(dataQuery);

    if (!snapshot.exists()) {
        return {
            attractionId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            waitTimes: [],
            averages: {
                overall: 0,
                hourly: {},
                daily: {},
            },
        };
    }

    const data = snapshot.val() as Record<string, HistoryEntry>;
    const waitTimes = Object.values(data).map((entry: HistoryEntry): WaitTimeData => ({
        timestamp: new Date(entry.timestamp).toISOString(),
        waitTime: entry.waitTime,
    }));

    // Calculate averages
    const averages = calculateAverages(Object.values(data));

    return {
        attractionId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        waitTimes,
        averages,
    };
}

// Calculate hourly and daily averages from historical data
function calculateAverages(data: HistoryEntry[]): Averages {
    if (data.length === 0) {
        return {
            overall: 0,
            hourly: {},
            daily: {},
        };
    }

    // Overall average
    const overall = Math.round(
        data.reduce((sum, entry) => sum + entry.waitTime, 0) / data.length
    );

    // Hourly averages (0-23)
    const hourlyData: Record<number, number[]> = {};
    const dailyData: Record<number, number[]> = {}; // 0 = Sunday, 6 = Saturday

    data.forEach(entry => {
        const hour = entry.hour;
        const dayOfWeek = entry.dayOfWeek;

        if (!hourlyData[hour]) hourlyData[hour] = [];
        if (!dailyData[dayOfWeek]) dailyData[dayOfWeek] = [];

        hourlyData[hour].push(entry.waitTime);
        dailyData[dayOfWeek].push(entry.waitTime);
    });

    // Calculate hourly averages
    const hourly: Record<string, number> = {};
    Object.entries(hourlyData).forEach(([hour, times]) => {
        hourly[hour] = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
    });

    // Calculate daily averages
    const daily: Record<string, number> = {};
    Object.entries(dailyData).forEach(([day, times]) => {
        daily[day] = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
    });

    return {
        overall,
        hourly,
        daily,
    };
}

// Utility function to migrate from live wait times to historical data
async function _archiveLiveWaitTimes() {
    try {
        const liveWaitTimesRef = ref(database, 'liveWaitTimes');
        const snapshot = await get(liveWaitTimesRef);

        if (!snapshot.exists()) {
            return;
        }

        const liveData = snapshot.val() as Record<string, {
            attractions?: Record<string, {
                status: string;
                standbyWait: number;
            }>;
        }>;
        const now = new Date();

        // Archive current wait times as historical data
        const archivePromises = Object.entries(liveData).flatMap(([parkId, parkData]) => {
            if (!parkData.attractions) return [];

            return Object.entries(parkData.attractions).map(async ([attractionId, attractionData]) => {
                if (attractionData.status === 'OPERATING' && attractionData.standbyWait > 0) {
                    await storeHistoricalWaitTime(
                        attractionId,
                        attractionData.standbyWait,
                        now,
                        parkId
                    );
                }
            });
        });

        await Promise.all(archivePromises);
        console.log('Live wait times archived successfully');
    } catch (error) {
        console.error('Error archiving live wait times:', error);
    }
}