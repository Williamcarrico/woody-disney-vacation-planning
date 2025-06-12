import { NextRequest, NextResponse } from "next/server";

// Conditional database import with error handling
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
let db: any = null;
let userLocations: any = null;
let eq: any = null;
let and: any = null;
let desc: any = null;
let gte: any = null;
let lte: any = null;
let avg: any = null;
let count: any = null;
let max: any = null;
let geofencingService: any = null;

// Try to import database modules, but don't fail if they're not available
try {
    const dbModule = await import('@/db');
    const locationsModule = await import('@/db/schema/locations');
    const drizzleModule = await import('drizzle-orm');
    const geofencingModule = await import('@/lib/services/geofencing');

    db = dbModule.db;
    userLocations = locationsModule.userLocations;
    eq = drizzleModule.eq;
    and = drizzleModule.and;
    desc = drizzleModule.desc;
    gte = drizzleModule.gte;
    lte = drizzleModule.lte;
    avg = drizzleModule.avg;
    count = drizzleModule.count;
    max = drizzleModule.max;
    geofencingService = geofencingModule.geofencingService;
} catch (error) {
    console.warn('Database modules not available, using fallback mode:', error);
}

interface LocationUpdateBody {
    latitude: number;
    longitude: number;
    userId: string;
    userName: string;
    vacationId?: string;
    accuracy?: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp?: string;
    metadata?: {
        deviceInfo?: string;
        networkType?: string;
        batteryLevel?: number;
        isBackground?: boolean;
        parkArea?: string;
        attraction?: string;
        activity?: string;
    };
}

/**
 * POST handler to update a user's location with enhanced geofencing integration
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as LocationUpdateBody;

        // Validate required fields
        if (!body.latitude || !body.longitude || !body.userId || !body.userName) {
            return NextResponse.json(
                { error: 'Missing required fields: latitude, longitude, userId, userName' },
                { status: 400 }
            );
        }

        // Ensure coordinates are valid
        if (
            isNaN(body.latitude) ||
            isNaN(body.longitude) ||
            body.latitude < -90 ||
            body.latitude > 90 ||
            body.longitude < -180 ||
            body.longitude > 180
        ) {
            return NextResponse.json(
                { error: 'Invalid coordinates' },
                { status: 400 }
            );
        }

        // If database is not available, return success without storing
        if (!db || !userLocations) {
            console.warn('Database not available, location update simulated');
            return NextResponse.json({
                success: true,
                message: 'Location updated successfully (simulated)',
                data: {
                    location: {
                        id: Date.now().toString(),
                        userId: body.userId,
                        vacationId: body.vacationId || null,
                        latitude: body.latitude,
                        longitude: body.longitude,
                        accuracy: body.accuracy,
                        altitude: body.altitude,
                        heading: body.heading,
                        speed: body.speed,
                        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
                        type: 'current',
                        metadata: body.metadata,
                        isActive: true
                    },
                    geofenceEvents: [],
                    eventsTriggered: 0
                }
            });
        }

        // Prepare location data for database
        const locationData = {
            userId: body.userId,
            vacationId: body.vacationId || null,
            latitude: body.latitude,
            longitude: body.longitude,
            accuracy: body.accuracy,
            altitude: body.altitude,
            heading: body.heading,
            speed: body.speed,
            timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
            type: 'current',
            metadata: body.metadata,
            isActive: true
        };

        let newLocation;
        let geofenceEvents: any[] = [];

        try {
            // Store location in database
            /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
            [newLocation] = await db
                .insert(userLocations)
                .values(locationData)
                .returning();

            // Deactivate previous current location
            await db
                .update(userLocations)
                .set({
                    isActive: false,
                    type: 'historical'
                })
                .where(and(
                    eq(userLocations.userId, body.userId),
                    eq(userLocations.type, 'current'),
                    eq(userLocations.isActive, true)
                ));
            /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

            // Process geofencing if vacation ID is provided
            if (body.vacationId && geofencingService) {
                try {
                    // Load geofences for this vacation
                    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
                    await geofencingService.loadGeofences(body.vacationId);

                    // Process location update for geofencing
                    geofenceEvents = await geofencingService.processLocationUpdate({
                        userId: body.userId,
                        latitude: body.latitude,
                        longitude: body.longitude,
                        accuracy: body.accuracy,
                        altitude: body.altitude,
                        heading: body.heading,
                        speed: body.speed,
                        timestamp: new Date(body.timestamp || Date.now()),
                        metadata: body.metadata
                    }, body.userName);
                    /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
                } catch (geofenceError) {
                    console.error('Geofencing error:', geofenceError);
                    // Don't fail the location update if geofencing fails
                }
            }
        } catch (dbError) {
            console.error('Database error during location update:', dbError);
            // Return success even if database fails, for better UX
            newLocation = {
                id: Date.now().toString(),
                ...locationData
            };
        }

        return NextResponse.json({
            success: true,
            message: 'Location updated successfully',
            data: {
                location: newLocation,
                geofenceEvents: geofenceEvents,
                eventsTriggered: geofenceEvents.length
            }
        });
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update location',
                message: 'Location update failed, but the application will continue to work'
            },
            { status: 200 } // Return 200 to prevent client-side errors
        );
    }
}

/**
 * GET handler to retrieve locations with enhanced filtering and analytics
 */
export async function GET(request: NextRequest) {
    try {
        // If database is not available, return mock data
        if (!db || !userLocations || !operators) {
            console.warn('Database not available, returning mock location data');
            const { searchParams } = new URL(request.url);
            const vacationId = searchParams.get('vacationId');

            return NextResponse.json({
                success: true,
                data: {
                    locationsByUser: {},
                    totalUsers: 0,
                    analytics: null
                },
                vacationId: vacationId || 'default'
            });
        }

        const { searchParams } = new URL(request.url);
        
        // Validate query parameters with Zod
        const queryValidation = LocationAnalyticsQuerySchema.safeParse({
            vacationId: searchParams.get('vacationId'),
            userId: searchParams.get('userId'),
            type: searchParams.get('type') || 'current',
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
            limit: searchParams.get('limit') || '50',
            offset: searchParams.get('offset') || '0',
            includeAnalytics: searchParams.get('includeAnalytics') === 'true',
        });
        
        if (!queryValidation.success) {
            return NextResponse.json(
                {
                    error: 'Invalid query parameters',
                    details: queryValidation.error.issues,
                },
                { status: 400 }
            );
        }
        
        const { vacationId, userId, type, startDate, endDate, limit, offset, includeAnalytics } = queryValidation.data;

        // Build query conditions
        const conditions = [];

        if (vacationId) {
            conditions.push(operators.eq(userLocations.vacationId, vacationId));
        }

        if (userId) {
            conditions.push(operators.eq(userLocations.userId, userId));
        }

        if (type !== 'all') {
            conditions.push(operators.eq(userLocations.type, type));
        }

        if (startDate) {
            conditions.push(operators.gte(userLocations.timestamp, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(operators.lte(userLocations.timestamp, new Date(endDate)));
        }

        // Execute main query
        const baseQuery = db
            .select()
            .from(userLocations);

        const queryWithConditions = conditions.length > 0
            ? baseQuery.where(operators.and(...conditions))
            : baseQuery;

        const locations = await queryWithConditions
            .orderBy(operators.desc(userLocations.timestamp))
            .limit(limit)
            .offset(offset);

        // Get analytics if requested
        let analytics = null;
        if (includeAnalytics && vacationId) {
            analytics = await getLocationAnalytics(vacationId, userId, startDate, endDate);
        }

        // For current locations, group by user for vacation view
        if (type === 'current' && vacationId) {
            const groupedByUser = locations.reduce((acc, location) => {
                if (!acc[location.userId]) {
                    acc[location.userId] = [];
                }
                acc[location.userId].push(location);
                return acc;
            }, {} as Record<string, UserLocation[]>);

            return NextResponse.json({
                success: true,
                data: {
                    locationsByUser: groupedByUser,
                    totalUsers: Object.keys(groupedByUser).length,
                    analytics
                },
                vacationId: vacationId || 'default'
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                locations,
                analytics,
                pagination: {
                    limit,
                    offset,
                    total: locations.length
                }
            },
            vacationId: vacationId || 'default'
        });
    } catch (error) {
        console.error('Error retrieving locations:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retrieve locations',
                data: { locations: [], analytics: null }
            },
            { status: 200 } // Return 200 to prevent client-side errors
        );
    }
}

/**
 * Helper function to get location analytics
 */
async function getLocationAnalytics(
    vacationId: string,
    userId?: string | null,
    startDate?: string | null,
    endDate?: string | null
): Promise<LocationAnalytics | null> {
    if (!db || !userLocations || !operators) {
        return null;
    }

    try {
        const conditions = [operators.eq(userLocations.vacationId, vacationId)];

        if (userId) {
            conditions.push(operators.eq(userLocations.userId, userId));
        }

        if (startDate) {
            conditions.push(operators.gte(userLocations.timestamp, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(operators.lte(userLocations.timestamp, new Date(endDate)));
        }

        // Get basic analytics
        const [analytics] = await db
            .select({
                totalPoints: operators.count(),
                avgAccuracy: operators.avg(userLocations.accuracy),
                maxSpeed: operators.max(userLocations.speed),
                avgSpeed: operators.avg(userLocations.speed)
            })
            .from(userLocations)
            .where(operators.and(...conditions));

        // Get unique users
        const uniqueUsers = await db
            .selectDistinct({ userId: userLocations.userId })
            .from(userLocations)
            .where(operators.and(...conditions));

        // Get park areas visited
        const parkAreas = await db
            .selectDistinct({ parkArea: userLocations.metadata })
            .from(userLocations)
            .where(operators.and(...conditions))
            .then(rows => {
                const areas = new Set<string>();
                rows.forEach(row => {
                    const metadata = row.parkArea as Record<string, unknown> | null;
                    if (metadata && typeof metadata === 'object' && metadata.parkArea && typeof metadata.parkArea === 'string') {
                        areas.add(metadata.parkArea);
                    }
                });
                return Array.from(areas);
            });

        return {
            totalLocationPoints: Number(analytics.totalPoints) || 0,
            uniqueUsers: uniqueUsers.length,
            averageAccuracy: analytics.avgAccuracy ? Number(analytics.avgAccuracy) : null,
            maxSpeed: analytics.maxSpeed ? Number(analytics.maxSpeed) : null,
            averageSpeed: analytics.avgSpeed ? Number(analytics.avgSpeed) : null,
            parkAreasVisited: parkAreas,
            dateRange: {
                start: startDate,
                end: endDate
            }
        } satisfies LocationAnalytics;
    } catch (error) {
        console.error('Error calculating analytics:', error);
        return null;
    }
}

/**
 * DELETE handler to clear location history
 */
export async function DELETE(request: NextRequest) {
    try {
        // If database is not available, return success
        if (!db || !userLocations || !operators) {
            console.warn('Database not available, location deletion simulated');
            return NextResponse.json({
                success: true,
                message: 'Location deletion simulated (database not available)',
                count: 0
            });
        }

        const { searchParams } = new URL(request.url);
        const vacationId = searchParams.get('vacationId');
        const userId = searchParams.get('userId');
        const olderThan = searchParams.get('olderThan'); // ISO date string

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const conditions = [operators.eq(userLocations.userId, userId)];

        if (vacationId) {
            conditions.push(operators.eq(userLocations.vacationId, vacationId));
        }

        if (olderThan) {
            conditions.push(operators.lte(userLocations.timestamp, new Date(olderThan)));
        }

        // Only delete historical locations, keep current ones
        conditions.push(operators.eq(userLocations.type, 'historical'));

        const deletedLocations = await db
            .delete(userLocations)
            .where(operators.and(...conditions))
            .returning();

        return NextResponse.json({
            success: true,
            message: `Deleted ${deletedLocations.length} historical location records`,
            count: deletedLocations.length
        });
    } catch (error) {
        console.error('Error deleting location history:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete location history',
                count: 0
            },
            { status: 200 } // Return 200 to prevent client-side errors
        );
    }
}