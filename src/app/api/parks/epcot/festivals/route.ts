import { NextRequest, NextResponse } from 'next/server';
import * as epcotService from '@/lib/services/epcot-service';
import * as themeParksAPI from '@/lib/services/themeparks-api';

/**
 * GET /api/parks/epcot/festivals
 *
 * EPCOT Festival information endpoint
 *
 * Query parameters:
 * - type: 'active' | 'all' | 'offerings' | 'schedule'
 * - festival: Festival name (for offerings)
 * - date: ISO date string (for checking active festivals on specific date)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'active';
        const festivalName = searchParams.get('festival');
        const dateParam = searchParams.get('date');

        switch (type) {
            case 'active': {
                // Get currently active festivals
                const date = dateParam ? new Date(dateParam) : new Date();
                const activeFestivals = epcotService.getActiveFestivals(date);

                return NextResponse.json({
                    date: date.toISOString(),
                    activeFestivals,
                    count: activeFestivals.length
                });
            }

            case 'all': {
                // Get all festivals throughout the year
                return NextResponse.json({
                    festivals: epcotService.EPCOT_FESTIVALS,
                    totalFestivals: epcotService.EPCOT_FESTIVALS.length,
                    calendar: generateFestivalCalendar()
                });
            }

            case 'offerings': {
                // Get festival-specific offerings (booths, marketplaces, etc.)
                const offerings = await epcotService.getFestivalOfferings(festivalName);
                return NextResponse.json(offerings);
            }

            case 'schedule': {
                // Get festival schedule with park hours
                const year = new Date().getFullYear();
                const scheduleData = await themeParksAPI.getEpcotSchedule(year);

                // Enhance schedule with festival information
                const enhancedSchedule = scheduleData.schedule.map(day => ({
                    ...day,
                    festivals: epcotService.getActiveFestivals(new Date(day.date))
                }));

                return NextResponse.json({
                    year,
                    schedule: enhancedSchedule,
                    festivalDays: enhancedSchedule.filter(day => day.festivals.length > 0).length
                });
            }

            default: {
                return NextResponse.json(
                    {
                        error: 'Invalid type parameter',
                        validTypes: ['active', 'all', 'offerings', 'schedule'],
                        description: {
                            active: 'Get currently active festivals',
                            all: 'Get all EPCOT festivals throughout the year',
                            offerings: 'Get festival-specific booths and marketplaces',
                            schedule: 'Get park schedule with festival information'
                        }
                    },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        console.error('Error fetching EPCOT festival data:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch festival data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper function to generate festival calendar
function generateFestivalCalendar() {
    const calendar: Record<string, string[]> = {};
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    months.forEach((month, index) => {
        const monthNumber = index + 1;
        const activeFestivals = epcotService.EPCOT_FESTIVALS.filter(festival => {
            if (festival.startMonth <= festival.endMonth) {
                return monthNumber >= festival.startMonth && monthNumber <= festival.endMonth;
            } else {
                // Festival spans year boundary
                return monthNumber >= festival.startMonth || monthNumber <= festival.endMonth;
            }
        });

        calendar[month] = activeFestivals.map(f => f.name);
    });

    return calendar;
}