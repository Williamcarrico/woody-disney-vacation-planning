/**
 * Calendar Events Types
 *
 * Type definitions for calendar events, filters, analytics, and related functionality
 */

// Base types from database schema
export type EventType = 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment'
export type EventPriority = 'low' | 'medium' | 'high' | 'critical'
export type EventStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified'
export type ReminderType = 'notification' | 'email' | 'sms'
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'partly-cloudy' | 'windy'
export type MoonPhase = 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'
export type TransportationType = 'bus' | 'monorail' | 'boat' | 'skyliner' | 'car' | 'uber' | 'walk'
export type AttachmentType = 'image' | 'document' | 'link'
export type SharingPermission = 'view' | 'edit' | 'admin'
export type EventAction = 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed'

// Complex nested types
export interface EventReminder {
    enabled: boolean
    time: string
    type: ReminderType
}

export interface EventReservation {
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

export interface EventWeather {
    condition: WeatherCondition
    highTemp: number
    lowTemp: number
    precipitation: number
    humidity: number
    windSpeed: number
    uvIndex: number
    visibility: number
    sunrise: string
    sunset: string
    moonPhase: MoonPhase
}

export interface EventBudget {
    estimated: number
    actual?: number
    currency: string
    category: string
}

export interface EventTransportation {
    type: TransportationType
    pickupLocation?: string
    pickupTime?: string
    duration?: number
}

export interface EventChecklistItem {
    id: string
    task: string
    completed: boolean
    dueTime?: string
}

export interface EventAttachment {
    type: AttachmentType
    url: string
    title: string
    thumbnail?: string
}

export interface EventUser {
    id: string
    email: string
    displayName: string
    photoURL: string
}

export interface EventHistoryEntry {
    id: string
    eventId: string
    userId: string
    action: EventAction
    changes: Record<string, unknown>
    timestamp: Date
    user?: EventUser
}

// Main CalendarEvent interface
export interface CalendarEvent {
    id: string
    vacationId: string
    userId: string

    // Basic event information
    title: string
    date: Date
    startTime?: string
    endTime?: string

    // Event categorization
    type: EventType
    priority: EventPriority
    status: EventStatus

    // Location information
    parkId?: string
    attractionId?: string
    locationName?: string

    // Visual and organizational
    isHighlighted: boolean
    notes?: string
    tags?: string[]
    color?: string
    icon?: string
    participants?: string[]

    // Complex nested data
    reminder?: EventReminder
    reservation?: EventReservation
    weather?: EventWeather
    budget?: EventBudget
    transportation?: EventTransportation
    checklist?: EventChecklistItem[]
    attachments?: EventAttachment[]

    // Timestamps
    createdAt: Date
    updatedAt: Date

    // Relations (optional, loaded when needed)
    user?: EventUser
    history?: EventHistoryEntry[]
}

// Filter interface for querying events
export interface EventFilter {
    status?: EventStatus
    type?: EventType
    priority?: EventPriority
    userId?: string
    startDate?: string | Date
    endDate?: string | Date
    parkId?: string
    isHighlighted?: boolean
    tags?: string[]
}

// Conflict detection
export interface EventConflict {
    eventId: string
    title: string
    startTime: string
    endTime: string
    conflictType: 'time_overlap' | 'location_conflict' | 'resource_conflict'
}

// Analytics interface
export interface EventAnalytics {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsByStatus: Record<string, number>
    eventsByPriority: Record<string, number>
    budgetAnalytics: {
        totalEstimated: number
        totalActual: number
    }
    eventsByDate: Record<string, CalendarEvent[]>
    averageEventsPerDay: number
    completionRate: number
}

// Event sharing
export interface EventSharing {
    id: string
    eventId: string
    sharedWithUserId: string
    permission: SharingPermission
    sharedBy: string
    sharedAt: Date
    event?: CalendarEvent
    sharedWithUser?: EventUser
    sharedByUser?: EventUser
}