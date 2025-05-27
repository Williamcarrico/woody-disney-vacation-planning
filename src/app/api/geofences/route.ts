import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { geofences, NewGeofence } from '@/db/schema/locations'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const vacationId = searchParams.get('vacationId')
        const userId = searchParams.get('userId')
        const type = searchParams.get('type')
        const isActive = searchParams.get('isActive')

        if (!vacationId) {
            return NextResponse.json(
                { error: 'vacationId is required' },
                { status: 400 }
            )
        }

        // Build query conditions
        const conditions = [eq(geofences.vacationId, vacationId)]

        if (userId) {
            conditions.push(eq(geofences.createdBy, userId))
        }

        if (type) {
            // Validate type is a valid geofence type
            const validTypes = ['attraction', 'meeting', 'safety', 'custom', 'directional', 'altitude'] as const
            type GeofenceType = typeof validTypes[number]
            if (validTypes.includes(type as GeofenceType)) {
                conditions.push(eq(geofences.type, type as GeofenceType))
            }
        }

        if (isActive !== null) {
            conditions.push(eq(geofences.isActive, isActive === 'true'))
        }

        const result = await db
            .select()
            .from(geofences)
            .where(and(...conditions))
            .orderBy(geofences.createdAt)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching geofences:', error)
        return NextResponse.json(
            { error: 'Failed to fetch geofences' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        const requiredFields = ['name', 'latitude', 'longitude', 'radius', 'vacationId', 'createdBy']
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                )
            }
        }

        // Validate coordinates
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
            )
        }

        // Validate radius
        if (isNaN(body.radius) || body.radius <= 0 || body.radius > 10000) {
            return NextResponse.json(
                { error: 'Radius must be between 1 and 10000 meters' },
                { status: 400 }
            )
        }

        // Prepare geofence data
        const geofenceData: NewGeofence = {
            name: body.name,
            description: body.description,
            latitude: body.latitude,
            longitude: body.longitude,
            radius: body.radius,
            type: body.type || 'custom',
            vacationId: body.vacationId,
            createdBy: body.createdBy,
            isActive: body.isActive ?? true,

            // Directional geofencing
            direction: body.direction,
            directionRange: body.directionRange,

            // Altitude geofencing
            minAltitude: body.minAltitude,
            maxAltitude: body.maxAltitude,

            // Time-based activation
            activeStartTime: body.activeStartTime ? new Date(body.activeStartTime) : null,
            activeEndTime: body.activeEndTime ? new Date(body.activeEndTime) : null,

            // Settings
            settings: {
                notifyOnEntry: body.settings?.notifyOnEntry ?? true,
                notifyOnExit: body.settings?.notifyOnExit ?? true,
                cooldownMinutes: body.settings?.cooldownMinutes ?? 5,
                maxAlerts: body.settings?.maxAlerts ?? 10,
                triggerDistance: body.settings?.triggerDistance,
                requiresMovement: body.settings?.requiresMovement ?? false,
                parkArea: body.settings?.parkArea,
                attraction: body.settings?.attraction,
                customMessage: body.settings?.customMessage,
                soundAlert: body.settings?.soundAlert ?? true,
                vibrationAlert: body.settings?.vibrationAlert ?? true,
                priority: body.settings?.priority ?? 'medium'
            }
        }

        const [newGeofence] = await db
            .insert(geofences)
            .values(geofenceData)
            .returning()

        return NextResponse.json(newGeofence, { status: 201 })
    } catch (error) {
        console.error('Error creating geofence:', error)
        return NextResponse.json(
            { error: 'Failed to create geofence' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const vacationId = searchParams.get('vacationId')
        const userId = searchParams.get('userId')

        if (!vacationId || !userId) {
            return NextResponse.json(
                { error: 'vacationId and userId are required' },
                { status: 400 }
            )
        }

        // Delete all geofences for the vacation (soft delete by setting isActive to false)
        const result = await db
            .update(geofences)
            .set({
                isActive: false,
                updatedAt: new Date()
            })
            .where(and(
                eq(geofences.vacationId, vacationId),
                eq(geofences.createdBy, userId)
            ))
            .returning()

        return NextResponse.json({
            message: `Deactivated ${result.length} geofences`,
            count: result.length
        })
    } catch (error) {
        console.error('Error deleting geofences:', error)
        return NextResponse.json(
            { error: 'Failed to delete geofences' },
            { status: 500 }
        )
    }
}