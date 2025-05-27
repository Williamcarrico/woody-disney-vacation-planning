/**
 * Calendar Events Database Service
 *
 * Provides comprehensive database operations for calendar events with advanced features
 * including conflict detection, batch operations, analytics, and caching.
 */

import { db, calendarEvents, eventHistory, eventSharing, vacations } from '@/db'
import { eq, and, gte, lte, between, desc, asc, count, sql } from 'drizzle-orm'
import type { CalendarEvent, EventFilter, EventAnalytics, EventConflict } from '@/types/calendar-events'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CreateEventData {
    vacationId: string
    userId: string
    title: string
    date: Date
    startTime?: string
    endTime?: string
    type: 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    status?: 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified'
    parkId?: string
    attractionId?: string
    locationName?: string
    isHighlighted?: boolean
    notes?: string
    tags?: string[]
    color?: string
    icon?: string
    participants?: string[]
    reminder?: {
        enabled: boolean
        time: string
        type: 'notification' | 'email' | 'sms'
    }
    reservation?: {
        id: string
        name: string
        time: string
        partySize: number
        confirmed: boolean
        confirmationNumber?: string
        specialRequests?: string
        cost?: number
        prepaid?: boolean
    }
    weather?: {
        condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'partly-cloudy' | 'windy'
        highTemp: number
        lowTemp: number
        precipitation: number
        humidity: number
        windSpeed: number
        uvIndex: number
        visibility: number
        sunrise: string
        sunset: string
        moonPhase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'
    }
    budget?: {
        estimated: number
        actual?: number
        currency: string
        category: string
    }
    transportation?: {
        type: 'bus' | 'monorail' | 'boat' | 'skyliner' | 'car' | 'uber' | 'walk'
        pickupLocation?: string
        pickupTime?: string
        duration?: number
    }
    checklist?: Array<{
        id: string
        task: string
        completed: boolean
        dueTime?: string
    }>
    attachments?: Array<{
        type: 'image' | 'document' | 'link'
        url: string
        title: string
        thumbnail?: string
    }>
}

export interface UpdateEventData extends Partial<CreateEventData> {
    id?: never // Prevent ID from being updated
}

export interface EventQueryOptions {
    limit?: number
    offset?: number
    orderBy?: 'date' | 'created' | 'updated' | 'priority'
    orderDirection?: 'asc' | 'desc'
    includeHistory?: boolean
    includeSharing?: boolean
}

export interface BatchEventOperation {
    action: 'create' | 'update' | 'delete'
    eventId?: string
    data?: CreateEventData | UpdateEventData
}

// =============================================================================
// CORE CRUD OPERATIONS
// =============================================================================

/**
 * Create a new calendar event with comprehensive validation
 */
export async function createEvent(data: CreateEventData): Promise<CalendarEvent> {
    // Validate vacation exists and is accessible
    const vacation = await db.query.vacations.findFirst({
        where: eq(vacations.id, data.vacationId)
    })

    if (!vacation) {
        throw new Error('Vacation not found')
    }

    // Validate date is within vacation range
    const eventDate = new Date(data.date)
    const vacationStart = new Date(vacation.startDate)
    const vacationEnd = new Date(vacation.endDate)

    if (eventDate < vacationStart || eventDate > vacationEnd) {
        throw new Error('Event date must be within vacation date range')
    }

    // Check for conflicts if this is a timed event
    if (data.startTime && data.endTime) {
        const conflicts = await detectEventConflicts(data.vacationId, data.userId, eventDate, data.startTime, data.endTime)
        if (conflicts.length > 0) {
            throw new Error(`Event conflicts with existing events: ${conflicts.map(c => c.title).join(', ')}`)
        }
    }

    // Create the event
    const [newEvent] = await db.insert(calendarEvents).values({
        vacationId: data.vacationId,
        userId: data.userId,
        title: data.title,
        date: eventDate,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        priority: data.priority || 'medium',
        status: data.status || 'planned',
        parkId: data.parkId,
        attractionId: data.attractionId,
        locationName: data.locationName,
        isHighlighted: data.isHighlighted || false,
        notes: data.notes,
        tags: data.tags,
        color: data.color,
        icon: data.icon,
        participants: data.participants,
        reminder: data.reminder,
        reservation: data.reservation,
        weather: data.weather,
        budget: data.budget,
        transportation: data.transportation,
        checklist: data.checklist,
        attachments: data.attachments
    }).returning()

    // Log creation in history
    await logEventAction(newEvent.id, data.userId, 'created', { created: data })

    return newEvent as CalendarEvent
}

/**
 * Get events with advanced filtering and pagination
 */
export async function getEvents(
    vacationId: string,
    filters: EventFilter = {},
    options: EventQueryOptions = {}
): Promise<{
    events: CalendarEvent[]
    total: number
    hasMore: boolean
}> {
    const {
        limit = 100,
        offset = 0,
        orderBy = 'date',
        orderDirection = 'asc',
        includeHistory = false,
        includeSharing = false // TODO: Implement sharing functionality
    } = options

    // Suppress unused variable warning - will be used when sharing is implemented
    void includeSharing

    // Build where conditions
    const whereConditions = [eq(calendarEvents.vacationId, vacationId)]

    if (filters.status) {
        whereConditions.push(eq(calendarEvents.status, filters.status))
    }

    if (filters.type) {
        whereConditions.push(eq(calendarEvents.type, filters.type))
    }

    if (filters.priority) {
        whereConditions.push(eq(calendarEvents.priority, filters.priority))
    }

    if (filters.userId) {
        whereConditions.push(eq(calendarEvents.userId, filters.userId))
    }

    if (filters.startDate && filters.endDate) {
        whereConditions.push(
            between(calendarEvents.date, new Date(filters.startDate), new Date(filters.endDate))
        )
    } else if (filters.startDate) {
        whereConditions.push(gte(calendarEvents.date, new Date(filters.startDate)))
    } else if (filters.endDate) {
        whereConditions.push(lte(calendarEvents.date, new Date(filters.endDate)))
    }

    if (filters.parkId) {
        whereConditions.push(eq(calendarEvents.parkId, filters.parkId))
    }

    if (filters.isHighlighted !== undefined) {
        whereConditions.push(eq(calendarEvents.isHighlighted, filters.isHighlighted))
    }

    if (filters.tags && filters.tags.length > 0) {
        // Use JSONB contains operator for tag filtering
        whereConditions.push(
            sql`${calendarEvents.tags} @> ${JSON.stringify(filters.tags)}`
        )
    }

    // Determine order by clause
    let orderByClause
    switch (orderBy) {
        case 'created':
            orderByClause = orderDirection === 'asc' ? asc(calendarEvents.createdAt) : desc(calendarEvents.createdAt)
            break
        case 'updated':
            orderByClause = orderDirection === 'asc' ? asc(calendarEvents.updatedAt) : desc(calendarEvents.updatedAt)
            break
        case 'priority':
            // Custom priority ordering: critical > high > medium > low
            orderByClause = sql`CASE
                WHEN ${calendarEvents.priority} = 'critical' THEN 1
                WHEN ${calendarEvents.priority} = 'high' THEN 2
                WHEN ${calendarEvents.priority} = 'medium' THEN 3
                WHEN ${calendarEvents.priority} = 'low' THEN 4
                ELSE 5
            END ${orderDirection === 'asc' ? sql`ASC` : sql`DESC`}`
            break
        default: // date
            orderByClause = orderDirection === 'asc' ? asc(calendarEvents.date) : desc(calendarEvents.date)
    }

    // Get events with user information
    const events = await db.query.calendarEvents.findMany({
        where: and(...whereConditions),
        orderBy: orderByClause,
        limit: Math.min(limit, 500), // Cap at 500
        offset,
        with: {
            user: {
                columns: {
                    id: true,
                    email: true,
                    displayName: true,
                    photoURL: true
                }
            },
            ...(includeHistory && {
                // Note: This would require setting up the relation in schema
                // history: {
                //     orderBy: desc(eventHistory.timestamp),
                //     limit: 10
                // }
            })
        }
    })

    // Get total count
    const [{ total }] = await db
        .select({ total: count() })
        .from(calendarEvents)
        .where(and(...whereConditions))

    return {
        events: events as CalendarEvent[],
        total,
        hasMore: offset + events.length < total
    }
}

/**
 * Get a single event by ID with full details
 */
export async function getEventById(eventId: string, includeHistory = false): Promise<CalendarEvent | null> {
    const event = await db.query.calendarEvents.findFirst({
        where: eq(calendarEvents.id, eventId),
        with: {
            user: {
                columns: {
                    id: true,
                    email: true,
                    displayName: true,
                    photoURL: true
                }
            }
        }
    })

    if (!event) {
        return null
    }

    let history: Array<{
        id: string
        eventId: string
        userId: string
        action: 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed'
        changes: Record<string, unknown> | null
        timestamp: Date
        user?: {
            id: string
            displayName: string
            photoURL: string
        }
    }> = []

    if (includeHistory) {
        history = await db.query.eventHistory.findMany({
            where: eq(eventHistory.eventId, eventId),
            orderBy: desc(eventHistory.timestamp),
            limit: 50,
            with: {
                user: {
                    columns: {
                        id: true,
                        displayName: true,
                        photoURL: true
                    }
                }
            }
        })
    }

    return {
        ...event,
        history
    } as CalendarEvent
}

/**
 * Update an event with conflict checking and history logging
 */
export async function updateEvent(
    eventId: string,
    userId: string,
    updates: UpdateEventData
): Promise<CalendarEvent> {
    // Get existing event
    const existingEvent = await db.query.calendarEvents.findFirst({
        where: eq(calendarEvents.id, eventId)
    })

    if (!existingEvent) {
        throw new Error('Event not found')
    }

    // Check for conflicts if time is being updated
    if ((updates.startTime || updates.endTime) && (updates.date || existingEvent.date)) {
        const eventDate = updates.date ? new Date(updates.date) : existingEvent.date
        const startTime = updates.startTime || existingEvent.startTime
        const endTime = updates.endTime || existingEvent.endTime

        if (startTime && endTime) {
            const conflicts = await detectEventConflicts(
                existingEvent.vacationId,
                existingEvent.userId,
                eventDate,
                startTime,
                endTime,
                eventId // Exclude current event
            )

            if (conflicts.length > 0) {
                throw new Error(`Updated event conflicts with: ${conflicts.map(c => c.title).join(', ')}`)
            }
        }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    Object.keys(updates).forEach(key => {
        if (updates[key as keyof UpdateEventData] !== undefined) {
            updateData[key] = updates[key as keyof UpdateEventData]
        }
    })

    if (updates.date) {
        updateData.date = new Date(updates.date)
    }

    updateData.updatedAt = new Date()

    // Update the event
    await db.update(calendarEvents)
        .set(updateData)
        .where(eq(calendarEvents.id, eventId))

    // Log the update
    await logEventAction(eventId, userId, 'updated', {
        before: existingEvent,
        after: updateData,
        fieldsChanged: Object.keys(updateData).filter(key => key !== 'updatedAt')
    })

    // Return updated event
    const updatedEvent = await getEventById(eventId)
    if (!updatedEvent) {
        throw new Error('Failed to retrieve updated event')
    }

    return updatedEvent
}

/**
 * Delete an event with validation and history logging
 */
export async function deleteEvent(eventId: string, userId: string): Promise<void> {
    // Get existing event for validation and history
    const existingEvent = await db.query.calendarEvents.findFirst({
        where: eq(calendarEvents.id, eventId)
    })

    if (!existingEvent) {
        throw new Error('Event not found')
    }

    // Check if event can be deleted
    if (existingEvent.status === 'confirmed' && existingEvent.reservation) {
        throw new Error('Cannot delete confirmed reservation. Please cancel the reservation first.')
    }

    // Log deletion before removing
    await logEventAction(eventId, userId, 'deleted', { deletedEvent: existingEvent })

    // Delete the event
    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId))
}

// =============================================================================
// ADVANCED FEATURES
// =============================================================================

/**
 * Detect conflicts between events
 */
export async function detectEventConflicts(
    vacationId: string,
    userId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeEventId?: string
): Promise<EventConflict[]> {
    const whereConditions = [
        eq(calendarEvents.vacationId, vacationId),
        eq(calendarEvents.userId, userId),
        eq(calendarEvents.date, date),
        eq(calendarEvents.status, 'confirmed')
    ]

    if (excludeEventId) {
        whereConditions.push(sql`${calendarEvents.id} != ${excludeEventId}`)
    }

    const existingEvents = await db.query.calendarEvents.findMany({
        where: and(...whereConditions)
    })

    const conflicts: EventConflict[] = []

    existingEvents.forEach(event => {
        if (!event.startTime || !event.endTime) return

        // Check if times overlap
        if (startTime < event.endTime && endTime > event.startTime) {
            conflicts.push({
                eventId: event.id,
                title: event.title,
                startTime: event.startTime,
                endTime: event.endTime,
                conflictType: 'time_overlap'
            })
        }
    })

    return conflicts
}

/**
 * Get event analytics for a vacation
 */
export async function getEventAnalytics(vacationId: string): Promise<EventAnalytics> {
    // Get all events for the vacation
    const events = await db.query.calendarEvents.findMany({
        where: eq(calendarEvents.vacationId, vacationId)
    })

    // Calculate analytics
    const totalEvents = events.length
    const eventsByType = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const eventsByStatus = events.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const eventsByPriority = events.reduce((acc, event) => {
        acc[event.priority] = (acc[event.priority] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Calculate budget totals
    const budgetAnalytics = events.reduce((acc, event) => {
        if (event.budget) {
            acc.totalEstimated += event.budget.estimated || 0
            acc.totalActual += event.budget.actual || 0
        }
        return acc
    }, { totalEstimated: 0, totalActual: 0 })

    // Get events by date for timeline
    const eventsByDate = events.reduce((acc, event) => {
        const dateKey = event.date.toISOString().split('T')[0]
        if (!acc[dateKey]) acc[dateKey] = []
        // Transform null values to undefined to match CalendarEvent type
        const transformedEvent: CalendarEvent = {
            id: event.id,
            vacationId: event.vacationId,
            userId: event.userId,
            title: event.title,
            date: event.date,
            type: event.type,
            priority: event.priority,
            status: event.status,
            isHighlighted: event.isHighlighted ?? false,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            startTime: event.startTime ?? undefined,
            endTime: event.endTime ?? undefined,
            parkId: event.parkId ?? undefined,
            attractionId: event.attractionId ?? undefined,
            locationName: event.locationName ?? undefined,
            notes: event.notes ?? undefined,
            tags: event.tags ?? undefined,
            color: event.color ?? undefined,
            icon: event.icon ?? undefined,
            participants: event.participants ?? undefined,
            reminder: event.reminder ?? undefined,
            reservation: event.reservation ?? undefined,
            weather: event.weather ?? undefined,
            budget: event.budget ?? undefined,
            transportation: event.transportation ?? undefined,
            checklist: event.checklist ?? undefined,
            attachments: event.attachments ?? undefined
        }
        acc[dateKey].push(transformedEvent)
        return acc
    }, {} as Record<string, CalendarEvent[]>)

    return {
        totalEvents,
        eventsByType,
        eventsByStatus,
        eventsByPriority,
        budgetAnalytics,
        eventsByDate,
        averageEventsPerDay: totalEvents / Object.keys(eventsByDate).length || 0,
        completionRate: eventsByStatus.completed ? (eventsByStatus.completed / totalEvents) * 100 : 0
    }
}

/**
 * Batch operations for multiple events
 */
export async function batchEventOperations(
    operations: BatchEventOperation[],
    userId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const operation of operations) {
        try {
            switch (operation.action) {
                case 'create':
                    if (operation.data) {
                        await createEvent(operation.data as CreateEventData)
                        success++
                    }
                    break
                case 'update':
                    if (operation.eventId && operation.data) {
                        await updateEvent(operation.eventId, userId, operation.data as UpdateEventData)
                        success++
                    }
                    break
                case 'delete':
                    if (operation.eventId) {
                        await deleteEvent(operation.eventId, userId)
                        success++
                    }
                    break
            }
        } catch (error) {
            failed++
            errors.push(error instanceof Error ? error.message : 'Unknown error')
        }
    }

    return { success, failed, errors }
}

/**
 * Get events for a specific date range with optimization
 */
export async function getEventsByDateRange(
    vacationId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
): Promise<Record<string, CalendarEvent[]>> {
    const whereConditions = [
        eq(calendarEvents.vacationId, vacationId),
        between(calendarEvents.date, startDate, endDate)
    ]

    if (userId) {
        whereConditions.push(eq(calendarEvents.userId, userId))
    }

    const events = await db.query.calendarEvents.findMany({
        where: and(...whereConditions),
        orderBy: [asc(calendarEvents.date), asc(calendarEvents.startTime)],
        with: {
            user: {
                columns: {
                    id: true,
                    displayName: true,
                    photoURL: true
                }
            }
        }
    })

    // Group events by date
    return events.reduce((acc, event) => {
        const dateKey = event.date.toISOString().split('T')[0]
        if (!acc[dateKey]) acc[dateKey] = []
        // Transform null values to undefined to match CalendarEvent type
        const transformedEvent: CalendarEvent = {
            id: event.id,
            vacationId: event.vacationId,
            userId: event.userId,
            title: event.title,
            date: event.date,
            type: event.type,
            priority: event.priority,
            status: event.status,
            isHighlighted: event.isHighlighted ?? false,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            startTime: event.startTime ?? undefined,
            endTime: event.endTime ?? undefined,
            parkId: event.parkId ?? undefined,
            attractionId: event.attractionId ?? undefined,
            locationName: event.locationName ?? undefined,
            notes: event.notes ?? undefined,
            tags: event.tags ?? undefined,
            color: event.color ?? undefined,
            icon: event.icon ?? undefined,
            participants: event.participants ?? undefined,
            reminder: event.reminder ?? undefined,
            reservation: event.reservation ?? undefined,
            weather: event.weather ?? undefined,
            budget: event.budget ?? undefined,
            transportation: event.transportation ?? undefined,
            checklist: event.checklist ?? undefined,
            attachments: event.attachments ?? undefined,
            user: event.user
        }
        acc[dateKey].push(transformedEvent)
        return acc
    }, {} as Record<string, CalendarEvent[]>)
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Log an action in event history
 */
async function logEventAction(
    eventId: string,
    userId: string,
    action: 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed',
    changes: Record<string, unknown>
): Promise<void> {
    await db.insert(eventHistory).values({
        eventId,
        userId,
        action,
        changes
    })
}

/**
 * Validate event data
 */
export function validateEventData(data: Partial<CreateEventData>): string[] {
    const errors: string[] = []

    if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required')
    }

    if (!data.date) {
        errors.push('Date is required')
    }

    if (!data.type) {
        errors.push('Event type is required')
    }

    if (data.startTime && data.endTime) {
        if (data.startTime >= data.endTime) {
            errors.push('Start time must be before end time')
        }
    }

    if (data.budget && data.budget.estimated < 0) {
        errors.push('Budget amount cannot be negative')
    }

    return errors
}

/**
 * Check if user has permission to access event
 */
export async function checkEventPermission(
    eventId: string,
    userId: string,
    permission: 'view' | 'edit' | 'delete' = 'view'
): Promise<boolean> {
    const event = await db.query.calendarEvents.findFirst({
        where: eq(calendarEvents.id, eventId)
    })

    if (!event) {
        return false
    }

    // Owner has all permissions
    if (event.userId === userId) {
        return true
    }

    // Check vacation access
    const vacation = await db.query.vacations.findFirst({
        where: eq(vacations.id, event.vacationId)
    })

    if (vacation && vacation.userId === userId) {
        return true
    }

    // Check shared permissions
    const sharing = await db.query.eventSharing.findFirst({
        where: and(
            eq(eventSharing.eventId, eventId),
            eq(eventSharing.sharedWithUserId, userId)
        )
    })

    if (!sharing) {
        return false
    }

    // Check permission level
    switch (permission) {
        case 'view':
            return true
        case 'edit':
            return sharing.permission === 'edit' || sharing.permission === 'admin'
        case 'delete':
            return sharing.permission === 'admin'
        default:
            return false
    }
}