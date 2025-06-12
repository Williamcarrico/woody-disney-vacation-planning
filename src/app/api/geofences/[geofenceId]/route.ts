import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { geofences, geofenceAlerts } from '@/db/schema/locations'
import { eq } from 'drizzle-orm'

interface RouteParams {
    params: Promise<{
        geofenceId: string
    }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { geofenceId } = await params

        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const [geofence] = await db
            .select()
            .from(geofences)
            .where(eq(geofences.id, geofenceId))
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

        if (!geofence) {
            return NextResponse.json(
                { error: 'Geofence not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(geofence)
    } catch (error) {
        console.error('Error fetching geofence:', error)
        return NextResponse.json(
            { error: 'Failed to fetch geofence' },
            { status: 500 }
        )
    }
}

interface GeofenceUpdateBody {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    type?: string;
    isActive?: boolean;
    direction?: number;
    directionRange?: number;
    minAltitude?: number;
    maxAltitude?: number;
    activeStartTime?: string | null;
    activeEndTime?: string | null;
    settings?: Record<string, unknown>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { geofenceId } = await params
        const body = await request.json() as GeofenceUpdateBody

        // Check if geofence exists
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const [existingGeofence] = await db
            .select()
            .from(geofences)
            .where(eq(geofences.id, geofenceId))
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

        if (!existingGeofence) {
            return NextResponse.json(
                { error: 'Geofence not found' },
                { status: 404 }
            )
        }

        // Validate coordinates if provided
        if (body.latitude !== undefined || body.longitude !== undefined) {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
            const lat = body.latitude ?? existingGeofence.latitude
            const lng = body.longitude ?? existingGeofence.longitude
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

            if (
                isNaN(lat) ||
                isNaN(lng) ||
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            ) {
                return NextResponse.json(
                    { error: 'Invalid coordinates' },
                    { status: 400 }
                )
            }
        }

        // Validate radius if provided
        if (body.radius !== undefined) {
            if (isNaN(body.radius) || body.radius <= 0 || body.radius > 10000) {
                return NextResponse.json(
                    { error: 'Radius must be between 1 and 10000 meters' },
                    { status: 400 }
                )
            }
        }

        // Prepare update data
        const updateData: Partial<typeof geofences.$inferInsert> & { updatedAt: Date } = {
            updatedAt: new Date()
        }

        // Basic fields
        if (body.name !== undefined) updateData.name = body.name
        if (body.description !== undefined) updateData.description = body.description
        if (body.latitude !== undefined) updateData.latitude = body.latitude
        if (body.longitude !== undefined) updateData.longitude = body.longitude
        if (body.radius !== undefined) updateData.radius = body.radius
        if (body.type !== undefined) updateData.type = body.type
        if (body.isActive !== undefined) updateData.isActive = body.isActive

        // Directional geofencing
        if (body.direction !== undefined) updateData.direction = body.direction
        if (body.directionRange !== undefined) updateData.directionRange = body.directionRange

        // Altitude geofencing
        if (body.minAltitude !== undefined) updateData.minAltitude = body.minAltitude
        if (body.maxAltitude !== undefined) updateData.maxAltitude = body.maxAltitude

        // Time-based activation
        if (body.activeStartTime !== undefined) {
            updateData.activeStartTime = body.activeStartTime ? new Date(body.activeStartTime) : null
        }
        if (body.activeEndTime !== undefined) {
            updateData.activeEndTime = body.activeEndTime ? new Date(body.activeEndTime) : null
        }

        // Settings (merge with existing settings)
        if (body.settings !== undefined) {
            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            updateData.settings = {
                ...(existingGeofence.settings as Record<string, unknown> || {}),
                ...body.settings
            }
            /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        }

        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const [updatedGeofence] = await db
            .update(geofences)
            .set(updateData)
            .where(eq(geofences.id, geofenceId))
            .returning()
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

        return NextResponse.json(updatedGeofence)
    } catch (error) {
        console.error('Error updating geofence:', error)
        return NextResponse.json(
            { error: 'Failed to update geofence' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { geofenceId } = await params

        // Check if geofence exists
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const [existingGeofence] = await db
            .select()
            .from(geofences)
            .where(eq(geofences.id, geofenceId))
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

        if (!existingGeofence) {
            return NextResponse.json(
                { error: 'Geofence not found' },
                { status: 404 }
            )
        }

        // First, delete or mark related alerts as inactive
        /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        await db
            .update(geofenceAlerts)
            .set({ isRead: true })
            .where(eq(geofenceAlerts.geofenceId, geofenceId))

        // Delete the geofence (hard delete)
        await db
            .delete(geofences)
            .where(eq(geofences.id, geofenceId))
        /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

        return NextResponse.json({
            message: 'Geofence deleted successfully',
            id: geofenceId
        })
    } catch (error) {
        console.error('Error deleting geofence:', error)
        return NextResponse.json(
            { error: 'Failed to delete geofence' },
            { status: 500 }
        )
    }
}