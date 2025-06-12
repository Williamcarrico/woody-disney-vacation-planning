import { NextRequest, NextResponse } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';
import { parksService } from '@/lib/firebase/parks-service';

interface RouteParams {
    params: {
        parkId: string;
    };
}

/**
 * GET /api/parks/[parkId]
 *
 * Comprehensive park data endpoint supporting multiple data types
 *
 * Query parameters:
 * - entity: 'details' | 'attractions' | 'live' | 'schedule' | 'showtimes'
 * - year: YYYY (for schedule)
 * - month: MM (for schedule)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { parkId } = params;
        const searchParams = request.nextUrl.searchParams;
        const entity = searchParams.get('entity') || 'details';

        if (!parkId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Park ID is required'
                },
                { status: 400 }
            );
        }

        // Handle different entity types
        switch (entity) {
            case 'live':
                try {
                    const liveData = await themeParksAPI.getParkLiveDataBySlug(parkId);
                    return NextResponse.json({
                        success: true,
                        data: liveData
                    });
                } catch (error) {
                    console.error('Error fetching live data:', error);
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Failed to fetch live data'
                        },
                        { status: 500 }
                    );
                }

            case 'attractions':
                try {
                    const attractions = await themeParksAPI.getParkAttractionsBySlug(parkId);
                    return NextResponse.json({
                        success: true,
                        data: attractions
                    });
                } catch (error) {
                    console.error('Error fetching attractions:', error);
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Failed to fetch attractions'
                        },
                        { status: 500 }
                    );
                }

            case 'schedule':
                try {
                    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
                    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
                    const schedule = await themeParksAPI.getParkScheduleBySlug(parkId, year, month);
                    return NextResponse.json({
                        success: true,
                        data: schedule
                    });
                } catch (error) {
                    console.error('Error fetching schedule:', error);
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Failed to fetch schedule'
                        },
                        { status: 500 }
                    );
                }

            case 'details':
            default:
                try {
                    const park = await parksService.getParkById(parkId);
                    if (!park) {
                        return NextResponse.json(
                            {
                                success: false,
                                error: 'Park not found'
                            },
                            { status: 404 }
                        );
                    }

                    return NextResponse.json({
                        success: true,
                        data: park
                    });
                } catch (error) {
                    console.error('Error fetching park details:', error);
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Failed to fetch park details'
                        },
                        { status: 500 }
                    );
                }
        }
    } catch (error) {
        console.error('Error in park API:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        );
    }
}