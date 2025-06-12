/**
 * Calendar Events Firebase Service
 *
 * Provides comprehensive Firebase operations for calendar events with advanced features
 * including conflict detection, batch operations, analytics, and caching.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    serverTimestamp,
    writeBatch,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'
import {
    CalendarEventService,
    EventHistoryService,
    VacationService,
    COLLECTIONS
} from '@/lib/firebase/firestore-service'
import type {
    CalendarEvent,
    CreateCalendarEventInput,
    EventHistory,
    CreateEventHistoryInput,
    Vacation
} from '@/lib/firebase/types'

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

export interface EventFilter {
    userId?: string
    type?: string[]
    status?: string[]
    priority?: string[]
    startDate?: Date
    endDate?: Date
    parkId?: string
    attractionId?: string
    tags?: string[]
    isHighlighted?: boolean
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

export interface EventConflict {
    id: string
    title: string
    startTime: string
    endTime: string
    type: string
}

export interface EventAnalytics {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsByStatus: Record<string, number>
    eventsByPriority: Record<string, number>
    averageEventsPerDay: number
    mostBusyDay: string
    upcomingEvents: number
    completedEvents: number
}

// =============================================================================
// CORE CRUD OPERATIONS
// =============================================================================

/**
 * Create a new calendar event with comprehensive validation
 */
export async function createEvent(data: CreateEventData): Promise<CalendarEvent> {
    // Validate vacation exists and is accessible
    const vacation = await VacationService.getVacation(data.vacationId)

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

    // Create the event data for Firebase
    const eventData: CreateCalendarEventInput = {
        vacationId: data.vacationId,
        userId: data.userId,
        title: data.title,
        date: Timestamp.fromDate(eventDate),
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
    }

    // Create the event
    const eventId = await CalendarEventService.createCalendarEvent(eventData)
    const newEvent = await CalendarEventService.getCalendarEvent(eventId)

    if (!newEvent) {
        throw new Error('Failed to create event')
    }

    // Log creation in history
    await logEventAction(eventId, data.userId, 'created', { created: data })

    return newEvent
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
        limit: limitCount = 100,
        offset = 0,
        orderBy: orderByField = 'date',
        orderDirection = 'asc',
        includeHistory = false,
        includeSharing = false // TODO: Implement sharing functionality
    } = options

    // Suppress unused variable warning - will be used when sharing is implemented
    void includeSharing

    // Build query constraints
    const constraints = []

    // Base vacation filter
    constraints.push(where('vacationId', '==', vacationId))

    // Apply filters
    if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId))
    }

    if (filters.type && filters.type.length > 0) {
        constraints.push(where('type', 'in', filters.type))
    }

    if (filters.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status))
    }

    if (filters.priority && filters.priority.length > 0) {
        constraints.push(where('priority', 'in', filters.priority))
    }

    if (filters.startDate) {
        constraints.push(where('date', '>=', Timestamp.fromDate(filters.startDate)))
    }

    if (filters.endDate) {
        constraints.push(where('date', '<=', Timestamp.fromDate(filters.endDate)))
    }

    if (filters.parkId) {
        constraints.push(where('parkId', '==', filters.parkId))
    }

    if (filters.attractionId) {
        constraints.push(where('attractionId', '==', filters.attractionId))
    }

    if (filters.isHighlighted !== undefined) {
        constraints.push(where('isHighlighted', '==', filters.isHighlighted))
    }

    // Add ordering
    const orderField = orderByField === 'created' ? 'createdAt' :
        orderByField === 'updated' ? 'updatedAt' : 'date'
    constraints.push(orderBy(orderField, orderDirection))

    // Add limit
    constraints.push(limit(limitCount + 1)) // Get one extra to check if there are more

    // Execute query
    const eventsCollection = collection(firestore, COLLECTIONS.CALENDAR_EVENTS)
    const q = query(eventsCollection, ...constraints)
    const querySnapshot = await getDocs(q)

    const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as CalendarEvent[]

    // Check if there are more results
    const hasMore = events.length > limitCount
    if (hasMore) {
        events.pop() // Remove the extra event
    }

    // Apply offset (Firebase doesn't have native offset, so we simulate it)
    const offsetEvents = events.slice(offset)

    // Get total count (this is expensive in Firebase, consider caching)
    const totalQuery = query(eventsCollection, where('vacationId', '==', vacationId))
    const totalSnapshot = await getDocs(totalQuery)
    const total = totalSnapshot.size

    // Add history if requested
    if (includeHistory) {
        for (const event of offsetEvents) {
            const historyResult = await EventHistoryService.getEventHistory(event.id)
                ; (event as any).history = historyResult.data
        }
    }

    return {
        events: offsetEvents,
        total,
        hasMore: hasMore && (offset + offsetEvents.length) < total
    }
}

/**
 * Get a single event by ID with optional history
 */
export async function getEventById(eventId: string, includeHistory = false): Promise<CalendarEvent | null> {
    const event = await CalendarEventService.getCalendarEvent(eventId)

    if (!event) {
        return null
    }

    // Add history if requested
    if (includeHistory) {
        const historyResult = await EventHistoryService.getEventHistory(eventId)
            ; (event as any).history = historyResult.data
    }

    return event
}

/**
 * Update an existing event with validation and history tracking
 */
export async function updateEvent(
    eventId: string,
    userId: string,
    updates: UpdateEventData
): Promise<CalendarEvent> {
    // Get existing event
    const existingEvent = await CalendarEventService.getCalendarEvent(eventId)
    if (!existingEvent) {
        throw new Error('Event not found')
    }

    // Check permission
    if (existingEvent.userId !== userId) {
        throw new Error('Unauthorized to update this event')
    }

    // Validate vacation if being changed
    if (updates.vacationId && updates.vacationId !== existingEvent.vacationId) {
        const vacation = await VacationService.getVacation(updates.vacationId)
        if (!vacation) {
            throw new Error('Vacation not found')
        }
    }

    // Check for conflicts if time is being changed
    if (updates.date || updates.startTime || updates.endTime) {
        const eventDate = updates.date ? new Date(updates.date) : existingEvent.date.toDate()
        const startTime = updates.startTime || existingEvent.startTime
        const endTime = updates.endTime || existingEvent.endTime

        if (startTime && endTime) {
            const conflicts = await detectEventConflicts(
                existingEvent.vacationId,
                userId,
                eventDate,
                startTime,
                endTime,
                eventId
            )
            if (conflicts.length > 0) {
                throw new Error(`Event conflicts with existing events: ${conflicts.map(c => c.title).join(', ')}`)
            }
        }
    }

    // Prepare update data
    const updateData: Partial<CreateCalendarEventInput> = {}

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.date !== undefined) updateData.date = Timestamp.fromDate(new Date(updates.date))
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.parkId !== undefined) updateData.parkId = updates.parkId
    if (updates.attractionId !== undefined) updateData.attractionId = updates.attractionId
    if (updates.locationName !== undefined) updateData.locationName = updates.locationName
    if (updates.isHighlighted !== undefined) updateData.isHighlighted = updates.isHighlighted
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.icon !== undefined) updateData.icon = updates.icon
    if (updates.participants !== undefined) updateData.participants = updates.participants
    if (updates.reminder !== undefined) updateData.reminder = updates.reminder
    if (updates.reservation !== undefined) updateData.reservation = updates.reservation
    if (updates.weather !== undefined) updateData.weather = updates.weather
    if (updates.budget !== undefined) updateData.budget = updates.budget
    if (updates.transportation !== undefined) updateData.transportation = updates.transportation
    if (updates.checklist !== undefined) updateData.checklist = updates.checklist
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments

    // Update the event
    await CalendarEventService.updateCalendarEvent(eventId, updateData)

    // Log update in history
    await logEventAction(eventId, userId, 'updated', {
        before: existingEvent,
        after: updates
    })

    // Return updated event
    const updatedEvent = await CalendarEventService.getCalendarEvent(eventId)
    if (!updatedEvent) {
        throw new Error('Failed to retrieve updated event')
    }

    return updatedEvent
}

/**
 * Delete an event with permission checking and history logging
 */
export async function deleteEvent(eventId: string, userId: string): Promise<void> {
    // Get existing event
    const existingEvent = await CalendarEventService.getCalendarEvent(eventId)
    if (!existingEvent) {
        throw new Error('Event not found')
    }

    // Check permission
    if (existingEvent.userId !== userId) {
        throw new Error('Unauthorized to delete this event')
    }

    // Log deletion in history before deleting
    await logEventAction(eventId, userId, 'deleted', { deleted: existingEvent })

    // Delete the event
    await CalendarEventService.deleteCalendarEvent(eventId)
}

/**
 * Detect conflicts with existing events
 */
export async function detectEventConflicts(
    vacationId: string,
    userId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeEventId?: string
): Promise<EventConflict[]> {
    // Get events for the same day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await CalendarEventService.getCalendarEvents(vacationId, {
        where: [
            { field: 'userId', operator: '==', value: userId },
            { field: 'date', operator: '>=', value: Timestamp.fromDate(startOfDay) },
            { field: 'date', operator: '<=', value: Timestamp.fromDate(endOfDay) }
        ]
    })

    const conflicts: EventConflict[] = []

    for (const event of result.data) {
        // Skip the event being updated
        if (excludeEventId && event.id === excludeEventId) {
            continue
        }

        // Skip events without time
        if (!event.startTime || !event.endTime) {
            continue
        }

        // Check for time overlap
        if (timeOverlaps(startTime, endTime, event.startTime, event.endTime)) {
            conflicts.push({
                id: event.id,
                title: event.title,
                startTime: event.startTime,
                endTime: event.endTime,
                type: event.type
            })
        }
    }

    return conflicts
}

/**
 * Helper function to check if two time ranges overlap
 */
function timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const [start1Hours, start1Minutes] = start1.split(':').map(Number)
    const [end1Hours, end1Minutes] = end1.split(':').map(Number)
    const [start2Hours, start2Minutes] = start2.split(':').map(Number)
    const [end2Hours, end2Minutes] = end2.split(':').map(Number)

    const start1Minutes_total = start1Hours * 60 + start1Minutes
    const end1Minutes_total = end1Hours * 60 + end1Minutes
    const start2Minutes_total = start2Hours * 60 + start2Minutes
    const end2Minutes_total = end2Hours * 60 + end2Minutes

    return start1Minutes_total < end2Minutes_total && end1Minutes_total > start2Minutes_total
}

/**
 * Get analytics for events in a vacation
 */
export async function getEventAnalytics(vacationId: string): Promise<EventAnalytics> {
    const result = await CalendarEventService.getCalendarEvents(vacationId)
    const events = result.data

    const analytics: EventAnalytics = {
        totalEvents: events.length,
        eventsByType: {},
        eventsByStatus: {},
        eventsByPriority: {},
        averageEventsPerDay: 0,
        mostBusyDay: '',
        upcomingEvents: 0,
        completedEvents: 0
    }

    const now = new Date()
    const dayEventCounts: Record<string, number> = {}

    for (const event of events) {
        // Count by type
        analytics.eventsByType[event.type] = (analytics.eventsByType[event.type] || 0) + 1

        // Count by status
        analytics.eventsByStatus[event.status] = (analytics.eventsByStatus[event.status] || 0) + 1

        // Count by priority
        analytics.eventsByPriority[event.priority] = (analytics.eventsByPriority[event.priority] || 0) + 1

        // Count upcoming vs completed
        const eventDate = event.date.toDate()
        if (eventDate > now) {
            analytics.upcomingEvents++
        }
        if (event.status === 'completed') {
            analytics.completedEvents++
        }

        // Count events per day
        const dayKey = eventDate.toISOString().split('T')[0]
        dayEventCounts[dayKey] = (dayEventCounts[dayKey] || 0) + 1
    }

    // Calculate average events per day
    const uniqueDays = Object.keys(dayEventCounts).length
    analytics.averageEventsPerDay = uniqueDays > 0 ? analytics.totalEvents / uniqueDays : 0

    // Find most busy day
    let maxEvents = 0
    for (const [day, count] of Object.entries(dayEventCounts)) {
        if (count > maxEvents) {
            maxEvents = count
            analytics.mostBusyDay = day
        }
    }

    return analytics
}

/**
 * Perform batch operations on events
 */
export async function batchEventOperations(
    operations: BatchEventOperation[],
    userId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
    const batch = writeBatch(firestore)
    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const operation of operations) {
        try {
            switch (operation.action) {
                case 'create':
                    if (!operation.data) {
                        throw new Error('Create operation requires data')
                    }
                    // For batch creates, we need to use the batch.set method
                    const newDocRef = doc(collection(firestore, COLLECTIONS.CALENDAR_EVENTS))
                    const createData: CreateCalendarEventInput = {
                        ...operation.data as CreateEventData,
                        date: Timestamp.fromDate(new Date((operation.data as CreateEventData).date))
                    }
                    batch.set(newDocRef, {
                        ...createData,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    })
                    break

                case 'update':
                    if (!operation.eventId || !operation.data) {
                        throw new Error('Update operation requires eventId and data')
                    }
                    const updateDocRef = doc(firestore, COLLECTIONS.CALENDAR_EVENTS, operation.eventId)
                    const updateData = { ...operation.data }
                    if (updateData.date) {
                        ; (updateData as any).date = Timestamp.fromDate(new Date(updateData.date))
                    }
                    batch.update(updateDocRef, {
                        ...updateData,
                        updatedAt: serverTimestamp()
                    })
                    break

                case 'delete':
                    if (!operation.eventId) {
                        throw new Error('Delete operation requires eventId')
                    }
                    const deleteDocRef = doc(firestore, COLLECTIONS.CALENDAR_EVENTS, operation.eventId)
                    batch.delete(deleteDocRef)
                    break
            }
            results.success++
        } catch (error) {
            results.failed++
            results.errors.push(`${operation.action} operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Commit the batch
    try {
        await batch.commit()
    } catch (error) {
        results.errors.push(`Batch commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.failed = operations.length
        results.success = 0
    }

    return results
}

/**
 * Get events grouped by date within a date range
 */
export async function getEventsByDateRange(
    vacationId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
): Promise<Record<string, CalendarEvent[]>> {
    const filters: EventFilter = {
        startDate,
        endDate
    }

    if (userId) {
        filters.userId = userId
    }

    const result = await getEvents(vacationId, filters, {
        orderBy: 'date',
        orderDirection: 'asc',
        limit: 1000 // Large limit to get all events in range
    })

    // Group events by date
    const eventsByDate: Record<string, CalendarEvent[]> = {}

    for (const event of result.events) {
        const dateKey = event.date.toDate().toISOString().split('T')[0]
        if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = []
        }
        eventsByDate[dateKey].push(event)
    }

    return eventsByDate
}

/**
 * Log an event action to history
 */
async function logEventAction(
    eventId: string,
    userId: string,
    action: 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed',
    changes: Record<string, unknown>
): Promise<void> {
    const historyData: CreateEventHistoryInput = {
        eventId,
        userId,
        action,
        changes
    }

    await EventHistoryService.createEventHistory(historyData)
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
        const [startHours, startMinutes] = data.startTime.split(':').map(Number)
        const [endHours, endMinutes] = data.endTime.split(':').map(Number)

        const startTotalMinutes = startHours * 60 + startMinutes
        const endTotalMinutes = endHours * 60 + endMinutes

        if (startTotalMinutes >= endTotalMinutes) {
            errors.push('End time must be after start time')
        }
    }

    if (data.budget && data.budget.estimated < 0) {
        errors.push('Budget amount cannot be negative')
    }

    return errors
}

/**
 * Check if user has permission to access an event
 */
export async function checkEventPermission(
    eventId: string,
    userId: string,
    permission: 'view' | 'edit' | 'delete' = 'view'
): Promise<boolean> {
    const event = await CalendarEventService.getCalendarEvent(eventId)

    if (!event) {
        return false
    }

    // Owner has all permissions
    if (event.userId === userId) {
        return true
    }

    // TODO: Implement sharing permissions when event sharing is added
    // For now, only the owner has access
    return false
}