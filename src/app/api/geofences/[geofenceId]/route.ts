import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { geofences, geofenceAlerts } from '@/db/schema/locations'
import { eq, and } from 'drizzle-orm'

interface RouteParams {
    params: {
        geofenceId: string
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { geofenceId } = params

        const [geofence] = await db
            .select()
            .from(geofences)
            .where(eq(geofences.id, geofenceId))

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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { geofenceId } = params
        const body = await request.json()

        // Check if geofence exists
        const [existingGeofence] = await db
            .select()
            .from(geofences)
            .where(eq(geofences.id, geofenceId))

        if (!existingGeofence) {
            return NextResponse.json(
                { error: 'Geofence not found' },
                { status: 404 }
            )
        }

        // Validate coordinates if provided
        if (body.latitude !== undefined || body.longitude !== undefined) {
            const lat = body.latitude ?? existingGeofence.latitude
            const lng = body.longitude ?? existingGeofence.longitude

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
        const updateData: any = {
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
            updateData.settings = {
                ...existingGeofence.settings,
                ...body.settings
            }
        }

        const [updatedGeofence] = await db
            .update(geofences)
            .set(updateData)
            .where(eq(geofences.id, geofenceId))
            .returning()

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
        const { geofenceId } = params

        // Check if geofence exists
        const [existingGeofence] = await db
            .select()
            .from(geofences)
            .where(eq(geofences.id, geofenceId))

        if (!existingGeofence) {
            return NextResponse.json(
                { error: 'Geofence not found' },
                { status: 404 }
            )
        }

        // First, delete or mark related alerts as inactive
        await db
            .update(geofenceAlerts)
            .set({ isRead: true })
            .where(eq(geofenceAlerts.geofenceId, geofenceId))

        // Delete the geofence (hard delete)
        await db
            .delete(geofences)
            .where(eq(geofences.id, geofenceId))

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