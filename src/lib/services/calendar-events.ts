/**
 * Calendar Events Service
 * Handles CRUD operations for vacation calendar events
 */

import { ApiResponse } from '@/lib/api/response'

// Define the CalendarEvent type that matches the API
export interface CalendarEvent {
    id: string
    title: string
    date: Date
    startTime?: string
    endTime?: string
    type: 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment'
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified'
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

// Service Error class for better error handling
export class CalendarEventServiceError extends Error {
    constructor(
        public message: string,
        public code: string,
        public status: number
    ) {
        super(message)
        this.name = 'CalendarEventServiceError'
    }
}

/**
 * Fetches all calendar events for a vacation
 */
export async function getCalendarEvents(vacationId: string): Promise<CalendarEvent[]> {
    try {
        const response = await fetch(`/api/vacations/${vacationId}/events`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' } }))
            throw new CalendarEventServiceError(
                errorData.error?.message || 'Failed to fetch events',
                errorData.error?.code || 'FETCH_ERROR',
                response.status
            )
        }

        const data: ApiResponse<{ events: CalendarEvent[] }> = await response.json()

        if (!data.success || !data.data) {
            throw new CalendarEventServiceError(
                'Invalid response format',
                'INVALID_RESPONSE',
                500
            )
        }

        return data.data.events.map(event => ({
            ...event,
            date: new Date(event.date) // Convert date string back to Date object
        }))

    } catch (error) {
        if (error instanceof CalendarEventServiceError) {
            throw error
        }

        console.error('Error fetching calendar events:', error)
        throw new CalendarEventServiceError(
            'Failed to fetch calendar events',
            'NETWORK_ERROR',
            500
        )
    }
}

/**
 * Fetches a specific calendar event
 */
export async function getCalendarEvent(vacationId: string, eventId: string): Promise<CalendarEvent> {
    try {
        const response = await fetch(`/api/vacations/${vacationId}/events?eventId=${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' } }))
            throw new CalendarEventServiceError(
                errorData.error?.message || 'Failed to fetch event',
                errorData.error?.code || 'FETCH_ERROR',
                response.status
            )
        }

        const data: ApiResponse<{ event: CalendarEvent }> = await response.json()

        if (!data.success || !data.data) {
            throw new CalendarEventServiceError(
                'Invalid response format',
                'INVALID_RESPONSE',
                500
            )
        }

        return {
            ...data.data.event,
            date: new Date(data.data.event.date)
        }

    } catch (error) {
        if (error instanceof CalendarEventServiceError) {
            throw error
        }

        console.error('Error fetching calendar event:', error)
        throw new CalendarEventServiceError(
            'Failed to fetch calendar event',
            'NETWORK_ERROR',
            500
        )
    }
}

/**
 * Creates a new calendar event
 */
export async function createCalendarEvent(vacationId: string, eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
        // Convert Date to ISO string for API
        const apiEventData = {
            ...eventData,
            date: eventData.date.toISOString()
        }

        const response = await fetch(`/api/vacations/${vacationId}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiEventData),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' } }))
            throw new CalendarEventServiceError(
                errorData.error?.message || 'Failed to create event',
                errorData.error?.code || 'CREATE_ERROR',
                response.status
            )
        }

        const data: ApiResponse<{ event: CalendarEvent; message: string }> = await response.json()

        if (!data.success || !data.data) {
            throw new CalendarEventServiceError(
                'Invalid response format',
                'INVALID_RESPONSE',
                500
            )
        }

        return {
            ...data.data.event,
            date: new Date(data.data.event.date)
        }

    } catch (error) {
        if (error instanceof CalendarEventServiceError) {
            throw error
        }

        console.error('Error creating calendar event:', error)
        throw new CalendarEventServiceError(
            'Failed to create calendar event',
            'NETWORK_ERROR',
            500
        )
    }
}

/**
 * Updates an existing calendar event
 */
export async function updateCalendarEvent(
    vacationId: string,
    eventId: string,
    updates: Partial<Omit<CalendarEvent, 'id'>>
): Promise<CalendarEvent> {
    try {
        // Convert Date to ISO string if present in updates
        const apiUpdates = {
            ...updates,
            ...(updates.date && { date: updates.date.toISOString() })
        }

        const requestBody = {
            eventId,
            updates: apiUpdates
        }

        const response = await fetch(`/api/vacations/${vacationId}/events`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' } }))
            throw new CalendarEventServiceError(
                errorData.error?.message || 'Failed to update event',
                errorData.error?.code || 'UPDATE_ERROR',
                response.status
            )
        }

        const data: ApiResponse<{ event: CalendarEvent; message: string }> = await response.json()

        if (!data.success || !data.data) {
            throw new CalendarEventServiceError(
                'Invalid response format',
                'INVALID_RESPONSE',
                500
            )
        }

        return {
            ...data.data.event,
            date: new Date(data.data.event.date)
        }

    } catch (error) {
        if (error instanceof CalendarEventServiceError) {
            throw error
        }

        console.error('Error updating calendar event:', error)
        throw new CalendarEventServiceError(
            'Failed to update calendar event',
            'NETWORK_ERROR',
            500
        )
    }
}

/**
 * Deletes a calendar event
 */
export async function deleteCalendarEvent(vacationId: string, eventId: string): Promise<void> {
    try {
        const response = await fetch(`/api/vacations/${vacationId}/events?eventId=${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' } }))
            throw new CalendarEventServiceError(
                errorData.error?.message || 'Failed to delete event',
                errorData.error?.code || 'DELETE_ERROR',
                response.status
            )
        }

        const data: ApiResponse<{ message: string }> = await response.json()

        if (!data.success) {
            throw new CalendarEventServiceError(
                'Invalid response format',
                'INVALID_RESPONSE',
                500
            )
        }

    } catch (error) {
        if (error instanceof CalendarEventServiceError) {
            throw error
        }

        console.error('Error deleting calendar event:', error)
        throw new CalendarEventServiceError(
            'Failed to delete calendar event',
            'NETWORK_ERROR',
            500
        )
    }
}

/**
 * Batch update multiple events (useful for bulk operations)
 */
export async function updateMultipleCalendarEvents(
    vacationId: string,
    updates: Array<{ eventId: string; updates: Partial<Omit<CalendarEvent, 'id'>> }>
): Promise<CalendarEvent[]> {
    try {
        const updatePromises = updates.map(({ eventId, updates: eventUpdates }) =>
            updateCalendarEvent(vacationId, eventId, eventUpdates)
        )

        return await Promise.all(updatePromises)

    } catch (error) {
        console.error('Error updating multiple calendar events:', error)
        throw new CalendarEventServiceError(
            'Failed to update multiple calendar events',
            'BATCH_UPDATE_ERROR',
            500
        )
    }
}

/**
 * Export utility functions for common operations
 */
export const CalendarEventUtils = {
    /**
     * Check if an event is happening today
     */
    isToday: (event: CalendarEvent): boolean => {
        const today = new Date()
        return event.date.toDateString() === today.toDateString()
    },

    /**
     * Check if an event is in the future
     */
    isFuture: (event: CalendarEvent): boolean => {
        const today = new Date()
        return event.date > today
    },

    /**
     * Check if an event is in the past
     */
    isPast: (event: CalendarEvent): boolean => {
        const today = new Date()
        return event.date < today
    },

    /**
     * Sort events by date and time
     */
    sortByDateTime: (events: CalendarEvent[]): CalendarEvent[] => {
        return [...events].sort((a, b) => {
            const dateCompare = a.date.getTime() - b.date.getTime()
            if (dateCompare !== 0) return dateCompare

            // If same date, sort by start time
            if (a.startTime && b.startTime) {
                return a.startTime.localeCompare(b.startTime)
            }

            // Events with start time come before those without
            if (a.startTime && !b.startTime) return -1
            if (!a.startTime && b.startTime) return 1

            return 0
        })
    },

    /**
     * Filter events by type
     */
    filterByType: (events: CalendarEvent[], type: CalendarEvent['type']): CalendarEvent[] => {
        return events.filter(event => event.type === type)
    },

    /**
     * Filter events by status
     */
    filterByStatus: (events: CalendarEvent[], status: CalendarEvent['status']): CalendarEvent[] => {
        return events.filter(event => event.status === status)
    }
}