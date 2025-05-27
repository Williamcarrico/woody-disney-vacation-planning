import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { geofenceAlerts, NewGeofenceAlert } from '@/db/schema/locations'
import { eq, and, desc, gte, lte, count, inArray } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const vacationId = searchParams.get('vacationId')
        const userId = searchParams.get('userId')
        const geofenceId = searchParams.get('geofenceId')
        const alertType = searchParams.get('alertType')
        const isRead = searchParams.get('isRead')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Build query conditions
        const conditions = []

        if (vacationId) {
            conditions.push(eq(geofenceAlerts.vacationId, vacationId))
        }

        if (userId) {
            conditions.push(eq(geofenceAlerts.userId, userId))
        }

        if (geofenceId) {
            conditions.push(eq(geofenceAlerts.geofenceId, geofenceId))
        }

        if (alertType) {
            // Type assertion is safe here since we validate against enum values below
            const validAlertTypes = ['entry', 'exit', 'proximity', 'separation', 'safety'] as const
            if (validAlertTypes.includes(alertType as typeof validAlertTypes[number])) {
                conditions.push(eq(geofenceAlerts.alertType, alertType as typeof validAlertTypes[number]))
            }
        }

        if (isRead !== null) {
            conditions.push(eq(geofenceAlerts.isRead, isRead === 'true'))
        }

        if (startDate) {
            conditions.push(gte(geofenceAlerts.triggeredAt, new Date(startDate)))
        }

        if (endDate) {
            conditions.push(lte(geofenceAlerts.triggeredAt, new Date(endDate)))
        }

        // Build the query properly
        const baseQuery = db
            .select()
            .from(geofenceAlerts)
            .orderBy(desc(geofenceAlerts.triggeredAt))
            .limit(limit)
            .offset(offset)

        const query = conditions.length > 0
            ? baseQuery.where(and(...conditions))
            : baseQuery

        const alerts = await query

        // Get total count for pagination using proper count function
        const baseCountQuery = db
            .select({ count: count() })
            .from(geofenceAlerts)

        const countQuery = conditions.length > 0
            ? baseCountQuery.where(and(...conditions))
            : baseCountQuery

        const [{ count: totalCount }] = await countQuery

        return NextResponse.json({
            alerts,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        })
    } catch (error) {
        console.error('Error fetching geofence alerts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch geofence alerts' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        const requiredFields = ['geofenceId', 'userId', 'alertType', 'latitude', 'longitude']
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

        // Validate alert type
        const validAlertTypes = ['entry', 'exit', 'proximity', 'separation', 'safety'] as const
        if (!validAlertTypes.includes(body.alertType)) {
            return NextResponse.json(
                { error: 'Invalid alert type' },
                { status: 400 }
            )
        }

        // Prepare alert data
        const alertData: NewGeofenceAlert = {
            geofenceId: body.geofenceId,
            userId: body.userId,
            vacationId: body.vacationId,
            alertType: body.alertType,
            latitude: body.latitude,
            longitude: body.longitude,
            distance: body.distance,
            message: body.message,
            isRead: false,
            metadata: body.metadata,
            triggeredAt: body.triggeredAt ? new Date(body.triggeredAt) : new Date()
        }

        const [newAlert] = await db
            .insert(geofenceAlerts)
            .values(alertData)
            .returning()

        return NextResponse.json(newAlert, { status: 201 })
    } catch (error) {
        console.error('Error creating geofence alert:', error)
        return NextResponse.json(
            { error: 'Failed to create geofence alert' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { alertIds, isRead } = body

        if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
            return NextResponse.json(
                { error: 'alertIds array is required' },
                { status: 400 }
            )
        }

        if (typeof isRead !== 'boolean') {
            return NextResponse.json(
                { error: 'isRead must be a boolean' },
                { status: 400 }
            )
        }

        // Prepare update data with proper typing
        const updateData: Partial<Pick<typeof geofenceAlerts.$inferSelect, 'isRead' | 'readAt'>> = {
            isRead,
            ...(isRead && { readAt: new Date() })
        }

        // Update multiple alerts using inArray for proper array handling
        const updatedAlerts = await db
            .update(geofenceAlerts)
            .set(updateData)
            .where(inArray(geofenceAlerts.id, alertIds))
            .returning()

        return NextResponse.json({
            message: `Updated ${updatedAlerts.length} alerts`,
            count: updatedAlerts.length,
            alerts: updatedAlerts
        })
    } catch (error) {
        console.error('Error updating geofence alerts:', error)
        return NextResponse.json(
            { error: 'Failed to update geofence alerts' },
            { status: 500 }
        )
    }
}