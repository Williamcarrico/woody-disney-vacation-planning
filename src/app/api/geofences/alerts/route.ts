import { NextRequest, NextResponse } from 'next/server'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type {
    GeofenceAlert,
    NewGeofenceAlert
} from '@/db/schema/locations'

// Define alert type for validation
type AlertType = 'entry' | 'exit' | 'proximity' | 'separation' | 'safety'

// Conditional database import with error handling
let db: PostgresJsDatabase<Record<string, never>> | null = null
let geofenceAlerts: typeof import('@/db/schema/locations').geofenceAlerts | null = null
let eq: typeof import('drizzle-orm').eq | null = null
let and: typeof import('drizzle-orm').and | null = null
let desc: typeof import('drizzle-orm').desc | null = null
let gte: typeof import('drizzle-orm').gte | null = null
let lte: typeof import('drizzle-orm').lte | null = null
let count: typeof import('drizzle-orm').count | null = null
let inArray: typeof import('drizzle-orm').inArray | null = null

// Try to import database modules, but don't fail if they're not available
try {
    const dbModule = await import('@/db')
    const locationsModule = await import('@/db/schema/locations')
    const drizzleModule = await import('drizzle-orm')

    db = dbModule.db
    geofenceAlerts = locationsModule.geofenceAlerts
    eq = drizzleModule.eq
    and = drizzleModule.and
    desc = drizzleModule.desc
    gte = drizzleModule.gte
    lte = drizzleModule.lte
    count = drizzleModule.count
    inArray = drizzleModule.inArray
} catch (error) {
    console.warn('Database modules not available for geofence alerts, using fallback mode:', error)
}

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

        // If database is not available, return empty alerts
        if (!db || !geofenceAlerts) {
            console.warn('Database not available, returning empty geofence alerts array');
            return NextResponse.json({
                alerts: [],
                pagination: {
                    total: 0,
                    limit,
                    offset,
                    hasMore: false
                }
            });
        }

        // Build query conditions
        const conditions = []

        if (vacationId) {
            if (!eq || !geofenceAlerts) return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
            conditions.push(eq(geofenceAlerts.vacationId, vacationId))
        }

        if (userId) {
            if (!eq || !geofenceAlerts) return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
            conditions.push(eq(geofenceAlerts.userId, userId))
        }

        if (geofenceId) {
            if (!eq || !geofenceAlerts) return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
            conditions.push(eq(geofenceAlerts.geofenceId, geofenceId))
        }

        if (alertType) {
            // Type assertion is safe here since we validate against enum values below
            const validAlertTypes: AlertType[] = ['entry', 'exit', 'proximity', 'separation', 'safety']
            if (validAlertTypes.includes(alertType as AlertType)) {
                if (!eq || !geofenceAlerts) return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
                conditions.push(eq(geofenceAlerts.alertType, alertType as AlertType))
            }
        }

        if (isRead !== null) {
            if (!eq || !geofenceAlerts) return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
            conditions.push(eq(geofenceAlerts.isRead, isRead === 'true'))
        }

        if (startDate) {
            if (!gte || !geofenceAlerts) return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
            conditions.push(gte(geofenceAlerts.triggeredAt, new Date(startDate)))
        }

        if (endDate) {
            if (!lte || !geofenceAlerts) return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
            conditions.push(lte(geofenceAlerts.triggeredAt, new Date(endDate)))
        }

        // Build the query properly
        if (!db || !desc || !geofenceAlerts) {
            return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
        }

        const baseQuery = db
            .select()
            .from(geofenceAlerts)
            .orderBy(desc(geofenceAlerts.triggeredAt))
            .limit(limit)
            .offset(offset)

        const query = conditions.length > 0 && and
            ? baseQuery.where(and(...conditions))
            : baseQuery

        const alerts = await query

        // Get total count for pagination using proper count function
        if (!count || !geofenceAlerts) {
            return NextResponse.json({ alerts: [], pagination: { total: 0, limit, offset, hasMore: false } })
        }

        const baseCountQuery = db
            .select({ count: count() })
            .from(geofenceAlerts)

        const countQuery = conditions.length > 0 && and
            ? baseCountQuery.where(and(...conditions))
            : baseCountQuery

        const countResult = await countQuery
        const totalCount = countResult?.[0]?.count ?? 0

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
        // Return empty alerts instead of error to prevent client-side failures
        return NextResponse.json({
            alerts: [],
            pagination: {
                total: 0,
                limit: parseInt(request.nextUrl.searchParams.get('limit') || '50'),
                offset: parseInt(request.nextUrl.searchParams.get('offset') || '0'),
                hasMore: false
            }
        })
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
        const validAlertTypes: AlertType[] = ['entry', 'exit', 'proximity', 'separation', 'safety']
        if (!validAlertTypes.includes(body.alertType)) {
            return NextResponse.json(
                { error: 'Invalid alert type' },
                { status: 400 }
            )
        }

        // If database is not available, return mock success
        if (!db || !geofenceAlerts) {
            console.warn('Database not available, geofence alert creation simulated');
            const mockAlert = {
                id: Date.now().toString(),
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
                triggeredAt: body.triggeredAt ? new Date(body.triggeredAt) : new Date(),
                readAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return NextResponse.json(mockAlert, { status: 201 });
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
            {
                success: false,
                error: 'Failed to create geofence alert',
                message: 'Geofence alert creation failed, but the application will continue to work'
            },
            { status: 200 } // Return 200 to prevent client-side errors
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

        // If database is not available, return mock success
        if (!db || !geofenceAlerts) {
            console.warn('Database not available, geofence alert update simulated');
            return NextResponse.json({
                message: 'Geofence alert update simulated (database not available)',
                count: 0,
                alerts: []
            });
        }

        // Prepare update data with proper typing
        const updateData: Partial<GeofenceAlert> = {
            isRead,
            ...(isRead && { readAt: new Date() })
        }

        // Update multiple alerts using inArray for proper array handling
        if (!inArray || !geofenceAlerts) {
            return NextResponse.json({
                message: 'Database functions not available',
                count: 0,
                alerts: []
            })
        }

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
            {
                success: false,
                error: 'Failed to update geofence alerts',
                count: 0,
                alerts: []
            },
            { status: 200 } // Return 200 to prevent client-side errors
        )
    }
}