import { NextRequest, NextResponse } from 'next/server';
import {
    getTyphoonLagoonParkInfo,
    getTyphoonLagoonStatus,
    getTyphoonLagoonWaitTimes,
    getTyphoonLagoonTodayHours,
    TYPHOON_LAGOON_CONSTANTS
} from '@/lib/api/typhoon-lagoon';

interface TyphoonLagoonResponse {
    parkId: string;
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    facts: typeof TYPHOON_LAGOON_CONSTANTS.FACTS;
    parkInfo?: unknown;
    status?: unknown;
    waitTimes?: Record<string, number>;
    todayHours?: { openingTime: string; closingTime: string } | null;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const include = searchParams.get('include')?.split(',') || ['basic'];

        const response: TyphoonLagoonResponse = {
            parkId: TYPHOON_LAGOON_CONSTANTS.PARK_ID,
            name: "Disney's Typhoon Lagoon Water Park",
            coordinates: TYPHOON_LAGOON_CONSTANTS.COORDINATES,
            facts: TYPHOON_LAGOON_CONSTANTS.FACTS
        };

        // Include basic park information
        if (include.includes('basic') || include.includes('all')) {
            try {
                response.parkInfo = await getTyphoonLagoonParkInfo();
            } catch (error) {
                console.error('Error fetching park info:', error);
                response.parkInfo = null;
            }
        }

        // Include current status and hours
        if (include.includes('status') || include.includes('all')) {
            try {
                response.status = await getTyphoonLagoonStatus();
            } catch (error) {
                console.error('Error fetching park status:', error);
                response.status = {
                    isOpen: false,
                    status: 'UNKNOWN',
                    lastUpdated: new Date().toISOString()
                };
            }
        }

        // Include wait times
        if (include.includes('waittimes') || include.includes('all')) {
            try {
                response.waitTimes = await getTyphoonLagoonWaitTimes();
            } catch (error) {
                console.error('Error fetching wait times:', error);
                response.waitTimes = {};
            }
        }

        // Include today's hours
        if (include.includes('hours') || include.includes('all')) {
            try {
                response.todayHours = await getTyphoonLagoonTodayHours();
            } catch (error) {
                console.error('Error fetching today\'s hours:', error);
                response.todayHours = null;
            }
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in Typhoon Lagoon API route:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch Typhoon Lagoon data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'refresh':
                // This would typically clear cache and fetch fresh data
                return NextResponse.json({
                    message: 'Cache refresh requested',
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in Typhoon Lagoon POST route:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}