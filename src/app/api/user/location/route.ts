import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db'
import { userLocations, NewUserLocation } from '@/db/schema/locations'
import { eq, and, desc, gte, lte, avg, count, max } from 'drizzle-orm'
import { geofencingService, GeofenceEvent } from '@/lib/services/geofencing'

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
        const body: LocationUpdateBody = await request.json();

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

        // Prepare location data for database
        const locationData: NewUserLocation = {
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

        // Store location in database
        const [newLocation] = await db
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

        // Process geofencing if vacation ID is provided
        let geofenceEvents: GeofenceEvent[] = [];
        if (body.vacationId) {
            try {
                // Load geofences for this vacation
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
            } catch (geofenceError) {
                console.error('Geofencing error:', geofenceError);
                // Don't fail the location update if geofencing fails
            }
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
            { error: 'Failed to update location' },
            { status: 500 }
        );
    }
}

/**
 * GET handler to retrieve locations with enhanced filtering and analytics
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const vacationId = searchParams.get('vacationId');
        const userId = searchParams.get('userId');
        const type = searchParams.get('type') || 'current'; // current, historical, or all
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

        // Build query conditions
        const conditions = [];

        if (vacationId) {
            conditions.push(eq(userLocations.vacationId, vacationId));
        }

        if (userId) {
            conditions.push(eq(userLocations.userId, userId));
        }

        if (type !== 'all') {
            conditions.push(eq(userLocations.type, type as 'current' | 'historical' | 'planned'));
        }

        if (startDate) {
            conditions.push(gte(userLocations.timestamp, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(lte(userLocations.timestamp, new Date(endDate)));
        }

        // Execute main query
        const baseQuery = db
            .select()
            .from(userLocations);

        const queryWithConditions = conditions.length > 0
            ? baseQuery.where(and(...conditions))
            : baseQuery;

        const locations = await queryWithConditions
            .orderBy(desc(userLocations.timestamp))
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
            }, {} as Record<string, typeof locations>);

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
            { error: 'Failed to retrieve locations' },
            { status: 500 }
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
) {
    try {
        const conditions = [eq(userLocations.vacationId, vacationId)];

        if (userId) {
            conditions.push(eq(userLocations.userId, userId));
        }

        if (startDate) {
            conditions.push(gte(userLocations.timestamp, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(lte(userLocations.timestamp, new Date(endDate)));
        }

        // Get basic analytics
        const [analytics] = await db
            .select({
                totalPoints: count(),
                avgAccuracy: avg(userLocations.accuracy),
                maxSpeed: max(userLocations.speed),
                avgSpeed: avg(userLocations.speed)
            })
            .from(userLocations)
            .where(and(...conditions));

        // Get unique users
        const uniqueUsers = await db
            .selectDistinct({ userId: userLocations.userId })
            .from(userLocations)
            .where(and(...conditions));

        // Get park areas visited
        const parkAreas = await db
            .selectDistinct({ parkArea: userLocations.metadata })
            .from(userLocations)
            .where(and(...conditions))
            .then(rows => {
                const areas = new Set<string>();
                rows.forEach(row => {
                    const metadata = row.parkArea as {
                        deviceInfo?: string;
                        networkType?: string;
                        batteryLevel?: number;
                        isBackground?: boolean;
                        parkArea?: string;
                        attraction?: string;
                        activity?: string;
                    } | null;
                    if (metadata?.parkArea) {
                        areas.add(metadata.parkArea);
                    }
                });
                return Array.from(areas);
            });

        return {
            totalLocationPoints: analytics.totalPoints || 0,
            uniqueUsers: uniqueUsers.length,
            averageAccuracy: analytics.avgAccuracy ? Number(analytics.avgAccuracy) : null,
            maxSpeed: analytics.maxSpeed ? Number(analytics.maxSpeed) : null,
            averageSpeed: analytics.avgSpeed ? Number(analytics.avgSpeed) : null,
            parkAreasVisited: parkAreas,
            dateRange: {
                start: startDate,
                end: endDate
            }
        };
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

        const conditions = [eq(userLocations.userId, userId)];

        if (vacationId) {
            conditions.push(eq(userLocations.vacationId, vacationId));
        }

        if (olderThan) {
            conditions.push(lte(userLocations.timestamp, new Date(olderThan)));
        }

        // Only delete historical locations, keep current ones
        conditions.push(eq(userLocations.type, 'historical'));

        const deletedLocations = await db
            .delete(userLocations)
            .where(and(...conditions))
            .returning();

        return NextResponse.json({
            success: true,
            message: `Deleted ${deletedLocations.length} historical location records`,
            count: deletedLocations.length
        });
    } catch (error) {
        console.error('Error deleting location history:', error);
        return NextResponse.json(
            { error: 'Failed to delete location history' },
            { status: 500 }
        );
    }
}