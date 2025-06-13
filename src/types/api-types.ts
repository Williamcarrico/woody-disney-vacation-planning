/**
 * Comprehensive type definitions for API responses and data structures
 */

// Base API response types
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: {
        message: string
        code: string
        details?: unknown
    }
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
    }
    filters?: Record<string, unknown>
}

// Location and coordinates
export interface Coordinates {
    latitude: number
    longitude: number
}

export interface Location extends Coordinates {
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
}

// Disney Parks types
export type DisneyParkId = 'magic-kingdom' | 'epcot' | 'hollywood-studios' | 'animal-kingdom'
export type DisneyResortArea = 'magic-kingdom-area' | 'epcot-area' | 'hollywood-studios-area' | 'animal-kingdom-area' | 'disney-springs-area'

// Attraction types
export interface Attraction {
    id: string
    name: string
    description?: string
    parkId: DisneyParkId
    landId?: string
    type: 'ride' | 'show' | 'character-meet' | 'dining' | 'shopping'
    thrillLevel: 1 | 2 | 3 | 4 | 5
    heightRequirement?: number
    lightningLane: boolean
    virtualQueue: boolean
    mustDo: boolean
    ageGroup: 'all-ages' | 'kids' | 'teens' | 'adults'
    duration?: number
    capacity?: number
    accessibility: {
        wheelchairAccessible: boolean
        visuallyImpaired: boolean
        hearingImpaired: boolean
        cognitiveDisability: boolean
    }
    location: Coordinates
    images: string[]
    tags: string[]
    rating: number
    reviewCount: number
    operatingStatus: 'open' | 'closed' | 'temporarily-closed' | 'refurbishment'
    fastPassAvailable?: boolean
    singleRider: boolean
    photoPass: boolean
    createdAt: string
    updatedAt: string
}

// Restaurant types
export interface Restaurant {
    id: string
    name: string
    description?: string
    parkId?: DisneyParkId
    location: string
    cuisine: string[]
    diningPlan: 'quick-service' | 'table-service' | 'signature' | 'character'
    priceRange: '$' | '$$' | '$$$' | '$$$$'
    characterDining: boolean
    signatureDining: boolean
    reservationsRequired: boolean
    reservationsAvailable: boolean
    coordinates: Coordinates
    capacity?: number
    operatingHours: {
        [key: string]: {
            open: string
            close: string
            closed?: boolean
        }
    }
    menuItems?: MenuItem[]
    dietaryOptions: {
        vegetarian: boolean
        vegan: boolean
        glutenFree: boolean
        dairyFree: boolean
        allergenFriendly: boolean
    }
    accessibility: {
        wheelchairAccessible: boolean
        brailleMenu: boolean
        assistiveListening: boolean
    }
    images: string[]
    rating: number
    reviewCount: number
    tags: string[]
    createdAt: string
    updatedAt: string
}

export interface MenuItem {
    id: string
    name: string
    description?: string
    price: number
    category: 'appetizer' | 'entree' | 'dessert' | 'beverage' | 'kids'
    dietaryRestrictions: string[]
    allergens: string[]
    calories?: number
    spicyLevel?: 1 | 2 | 3 | 4 | 5
    available: boolean
}

// Resort types
export interface Resort {
    id: string
    name: string
    description?: string
    category: 'value' | 'moderate' | 'deluxe' | 'deluxe-villa' | 'other'
    theme: string
    priceRange: '$' | '$$' | '$$$' | '$$$$'
    transportation: string[]
    amenities: string[]
    roomTypes: RoomType[]
    diningOptions: string[]
    recreation: string[]
    location: Coordinates
    images: string[]
    rating: number
    reviewCount: number
    operatingStatus: 'open' | 'closed' | 'seasonal'
    petFriendly: boolean
    accessibility: {
        wheelchairAccessible: boolean
        hearingAccessible: boolean
        visualAccessible: boolean
        mobilityAccessible: boolean
    }
    createdAt: string
    updatedAt: string
}

export interface RoomType {
    id: string
    name: string
    description?: string
    maxOccupancy: number
    bedConfiguration: string
    squareFootage?: number
    amenities: string[]
    baseRate: number
    images: string[]
    availability: boolean
}

// Wait times and operational data
export interface WaitTime {
    attractionId: string
    attractionName: string
    parkId: DisneyParkId
    currentWaitTime: number
    averageWaitTime: number
    maxWaitTime: number
    minWaitTime: number
    operatingStatus: 'open' | 'closed' | 'temporarily-closed' | 'down'
    lightningLaneAvailable: boolean
    virtualQueueAvailable: boolean
    timestamp: string
}

export interface ParkHours {
    parkId: DisneyParkId
    date: string
    openTime: string
    closeTime: string
    extraMagicHours?: {
        type: 'morning' | 'evening'
        startTime: string
        endTime: string
        eligibility: string[]
    }
    specialEvents?: SpecialEvent[]
}

export interface SpecialEvent {
    id: string
    name: string
    description?: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    location?: string
    ticketRequired: boolean
    additionalCost?: number
    category: 'seasonal' | 'holiday' | 'after-hours' | 'special-ticketed'
    ageRestrictions?: string
}

// User and vacation types
export interface User {
    id: string
    email: string
    displayName?: string
    photoURL?: string
    emailVerified: boolean
    phoneNumber?: string
    preferences: UserPreferences
    achievements: string[]
    totalVisits: number
    favoriteParks: DisneyParkId[]
    favoriteAttractions: string[]
    favoriteRestaurants: string[]
    profileCompletion: number
    lastActiveAt: string
    createdAt: string
    updatedAt: string
}

export interface UserPreferences {
    planningStyle: 'detailed' | 'flexible' | 'spontaneous'
    preferredParks: DisneyParkId[]
    diningStyle: 'quick-service' | 'table-service' | 'character-dining' | 'mixed'
    thrillTolerance: 1 | 2 | 3 | 4 | 5
    walkingTolerance: 'low' | 'medium' | 'high'
    budgetRange: 'budget' | 'moderate' | 'premium' | 'luxury'
    partyComposition: 'adults-only' | 'families-with-young-kids' | 'families-with-teens' | 'mixed'
    accessibilityNeeds: string[]
    notifications: {
        waitTimes: boolean
        diningReminders: boolean
        reservationAlerts: boolean
        specialEvents: boolean
        groupMessages: boolean
    }
    privacy: {
        shareLocation: boolean
        shareItinerary: boolean
        sharePhotos: boolean
        allowFriendRequests: boolean
    }
}

export interface Vacation {
    id: string
    userId: string
    name: string
    description?: string
    destination: string
    startDate: string
    endDate: string
    partySize: number
    partyMembers: VacationMember[]
    status: 'planning' | 'active' | 'completed' | 'cancelled'
    isPublic: boolean
    isTemplate: boolean
    isArchived: boolean
    budget?: VacationBudget
    accommodation?: {
        resortId?: string
        resortName?: string
        roomType?: string
        checkIn: string
        checkOut: string
        confirmationNumber?: string
    }
    transportation?: {
        airline?: string
        flightNumber?: string
        arrivalTime?: string
        departureTime?: string
        carRental?: string
    }
    tickets?: {
        ticketType: string
        quantity: number
        startDate: string
        endDate: string
        confirmationNumber?: string
    }
    shareCode?: string
    collaborators: string[]
    tags: string[]
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface VacationMember {
    id: string
    name: string
    age?: number
    relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'other'
    dietaryRestrictions: string[]
    accessibilityNeeds: string[]
    preferences: {
        favoriteCharacters: string[]
        favoriteAttractions: string[]
        thrillTolerance: 1 | 2 | 3 | 4 | 5
    }
}

export interface VacationBudget {
    total: number
    categories: {
        accommodation: number
        tickets: number
        food: number
        shopping: number
        transportation: number
        extras: number
    }
    spent: {
        accommodation: number
        tickets: number
        food: number
        shopping: number
        transportation: number
        extras: number
    }
    currency: string
}

// Itinerary types
export interface Itinerary {
    id: string
    vacationId: string
    userId: string
    name: string
    date: string
    parkId?: DisneyParkId
    items: ItineraryItem[]
    totalWalkingTime?: number
    totalWaitTime?: number
    optimizationScore?: number
    isOptimized: boolean
    isPublic: boolean
    shareCode?: string
    notes?: string
    weather?: WeatherData
    createdAt: string
    updatedAt: string
}

export interface ItineraryItem {
    id: string
    type: 'attraction' | 'dining' | 'show' | 'break' | 'travel' | 'shopping'
    attractionId?: string
    restaurantId?: string
    name: string
    startTime: string
    endTime?: string
    duration: number
    priority: 'low' | 'medium' | 'high'
    status: 'planned' | 'current' | 'completed' | 'skipped'
    reservationDetails?: {
        confirmationNumber?: string
        partySize?: number
        specialRequests?: string
    }
    notes?: string
    order: number
    estimatedWaitTime?: number
    actualWaitTime?: number
    location?: Coordinates
    walkingTimeFromPrevious?: number
}

// Weather types
export interface WeatherData {
    location: string
    current?: CurrentWeather
    forecast?: DailyForecast[]
    alerts?: WeatherAlert[]
    lastUpdated: string
}

export interface CurrentWeather {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    windDirection: number
    visibility: number
    uvIndex: number
    condition: string
    icon: string
    precipitationChance: number
    precipitationType?: 'rain' | 'snow' | 'sleet'
}

export interface DailyForecast {
    date: string
    temperatureHigh: number
    temperatureLow: number
    condition: string
    icon: string
    precipitationChance: number
    precipitationType?: 'rain' | 'snow' | 'sleet'
    windSpeed: number
    humidity: number
    uvIndex: number
    summary: string
}

export interface WeatherAlert {
    id: string
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    startTime: string
    endTime: string
    areas: string[]
}

// Messaging and social types
export interface Message {
    id: string
    vacationId: string
    senderId: string
    senderName: string
    senderAvatar?: string
    content: string
    type: 'text' | 'image' | 'location' | 'itinerary' | 'system'
    attachments?: MessageAttachment[]
    reactions?: MessageReaction[]
    editHistory?: MessageEdit[]
    replyTo?: string
    timestamp: string
    readBy: string[]
    deliveredTo: string[]
}

export interface MessageAttachment {
    id: string
    type: 'image' | 'document' | 'location' | 'itinerary'
    url: string
    fileName?: string
    fileSize?: number
    mimeType?: string
    metadata?: Record<string, unknown>
}

export interface MessageReaction {
    emoji: string
    userId: string
    userName: string
    timestamp: string
}

export interface MessageEdit {
    previousContent: string
    timestamp: string
    reason?: string
}

// Geofencing and location types
export interface Geofence {
    id: string
    name: string
    description?: string
    type: 'park' | 'attraction' | 'restaurant' | 'resort' | 'custom'
    center: Coordinates
    radius: number
    isActive: boolean
    alertTypes: GeofenceAlertType[]
    metadata?: Record<string, unknown>
    createdBy: string
    createdAt: string
}

export type GeofenceAlertType = 'enter' | 'exit' | 'dwell' | 'approach'

export interface GeofenceAlert {
    id: string
    geofenceId: string
    userId: string
    vacationId?: string
    alertType: GeofenceAlertType
    location: Coordinates
    distance: number
    message: string
    metadata?: Record<string, unknown>
    triggeredAt: string
    acknowledged: boolean
    acknowledgedAt?: string
}

// Error and logging types
export interface ErrorLog {
    id: string
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
    message: string
    error?: Error
    context?: Record<string, unknown>
    userId?: string
    sessionId?: string
    page?: string
    action?: string
    userAgent?: string
    timestamp: string
}

// Search and filtering types
export interface SearchFilters {
    query?: string
    category?: string
    parkId?: DisneyParkId
    type?: string
    priceRange?: string[]
    rating?: number
    accessibility?: string[]
    tags?: string[]
    location?: {
        center: Coordinates
        radius: number
    }
    dateRange?: {
        start: string
        end: string
    }
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface SearchResult<T> {
    item: T
    score: number
    highlights?: Record<string, string[]>
    matchedFields?: string[]
}

// Analytics types
export interface AnalyticsEvent {
    eventName: string
    eventCategory: string
    eventLabel?: string
    value?: number
    customParameters?: Record<string, unknown>
    userId?: string
    sessionId?: string
    timestamp: string
}

export interface UserSegment {
    id: string
    name: string
    description: string
    criteria: Record<string, unknown>
    userCount: number
    createdAt: string
    updatedAt: string
}

// Cache types
export interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
    key: string
    metadata?: Record<string, unknown>
}

// Queue and batch operation types
export interface BatchOperation<T> {
    id: string
    type: 'create' | 'update' | 'delete'
    collection: string
    data: T
    conditions?: Record<string, unknown>
}

export interface QueuedTask {
    id: string
    type: string
    payload: Record<string, unknown>
    priority: 'low' | 'normal' | 'high' | 'urgent'
    attempts: number
    maxAttempts: number
    scheduledAt: string
    executedAt?: string
    completedAt?: string
    failedAt?: string
    error?: string
    metadata?: Record<string, unknown>
}

// Form validation types
export interface ValidationRule {
    type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'pattern' | 'custom'
    message: string
    value?: unknown
    validator?: (value: unknown) => boolean
}

export interface FieldValidation {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

export interface FormValidation {
    isValid: boolean
    fields: Record<string, FieldValidation>
    generalErrors: string[]
}

// Utility types
export type Timestamp = string
export type ISO8601Date = string
export type EmailAddress = string
export type PhoneNumber = string
export type URL = string
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
export type Locale = 'en-US' | 'en-GB' | 'fr-FR' | 'es-ES' | 'de-DE' | 'ja-JP'
export type Theme = 'light' | 'dark' | 'auto'
export type Language = 'en' | 'fr' | 'es' | 'de' | 'ja' | 'pt'

// Generic utility types
export type Partial<T> = {
    [P in keyof T]?: T[P]
}

export type Required<T> = {
    [P in keyof T]-?: T[P]
}

export type Pick<T, K extends keyof T> = {
    [P in K]: T[P]
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type WithId<T> = T & { id: string }
export type WithTimestamps<T> = T & { createdAt: Timestamp; updatedAt: Timestamp }
export type WithOptionalId<T> = T & { id?: string }