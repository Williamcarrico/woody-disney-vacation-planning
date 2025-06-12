import { Timestamp } from 'firebase/firestore'

// Base interface for all Firebase documents
export interface FirebaseDocument {
    id: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

// User interface
export interface User extends FirebaseDocument {
    email: string
    displayName?: string
    photoURL?: string
    isEmailVerified: boolean
    lastLoginAt?: Timestamp
    preferences: {
        theme?: 'light' | 'dark' | 'system'
        emailNotifications?: boolean
        pushNotifications?: boolean
        language?: string
    }
    role: string
}

export interface CreateUserInput {
    email: string
    displayName?: string
    photoURL?: string
    isEmailVerified?: boolean
    lastLoginAt?: Timestamp
    preferences?: {
        theme?: 'light' | 'dark' | 'system'
        emailNotifications?: boolean
        pushNotifications?: boolean
        language?: string
    }
    role?: string
}

// Vacation interface
export interface Vacation extends FirebaseDocument {
    userId: string
    name: string
    startDate: string // ISO date string
    endDate: string // ISO date string
    destination: string
    budget?: {
        total: number
        spent: number
        categories: {
            [key: string]: {
                planned: number
                actual: number
            }
        }
    }
    travelers: {
        adults: number
        children: number
        childrenAges?: number[]
    }
    accommodations?: {
        resortId?: string
        resortName?: string
        roomType?: string
        checkInDate?: string
        checkOutDate?: string
        confirmationNumber?: string
    }
    notes?: string
    isArchived: boolean
}

export interface CreateVacationInput {
    userId: string
    name: string
    startDate: string
    endDate: string
    destination?: string
    budget?: {
        total: number
        spent: number
        categories: {
            [key: string]: {
                planned: number
                actual: number
            }
        }
    }
    travelers: {
        adults: number
        children: number
        childrenAges?: number[]
    }
    accommodations?: {
        resortId?: string
        resortName?: string
        roomType?: string
        checkInDate?: string
        checkOutDate?: string
        confirmationNumber?: string
    }
    notes?: string
    isArchived?: boolean
}

// Itinerary interface
export interface Itinerary extends FirebaseDocument {
    userId: string
    vacationId?: string
    tripName: string
    parkDays: Array<{
        date: string
        parkId: string
        activities: Array<{
            id?: string
            name: string
            type: string
            startTime: string
            endTime: string
            location?: string
            description?: string
            waitTime?: number
            walkingTime?: number
            notes?: string
        }>
    }>
    preferences: {
        partySize?: number
        hasChildren?: boolean
        childrenAges?: number[]
        hasStroller?: boolean
        mobilityConsiderations?: boolean
        ridePreference?: 'thrill' | 'family' | 'all'
        maxWaitTime?: number
        walkingPace?: 'slow' | 'moderate' | 'fast'
        useGeniePlus?: boolean
        useIndividualLightningLane?: boolean
    }
    isShared: boolean
    shareCode?: string
}

export interface CreateItineraryInput {
    userId: string
    vacationId?: string
    tripName: string
    parkDays: Array<{
        date: string
        parkId: string
        activities: Array<{
            id?: string
            name: string
            type: string
            startTime: string
            endTime: string
            location?: string
            description?: string
            waitTime?: number
            walkingTime?: number
            notes?: string
        }>
    }>
    preferences: {
        partySize?: number
        hasChildren?: boolean
        childrenAges?: number[]
        hasStroller?: boolean
        mobilityConsiderations?: boolean
        ridePreference?: 'thrill' | 'family' | 'all'
        maxWaitTime?: number
        walkingPace?: 'slow' | 'moderate' | 'fast'
        useGeniePlus?: boolean
        useIndividualLightningLane?: boolean
    }
    isShared?: boolean
    shareCode?: string
}

// Calendar Event interface
export interface CalendarEvent extends FirebaseDocument {
    vacationId: string
    userId: string
    title: string
    date: Timestamp
    startTime?: string // Format: "HH:MM"
    endTime?: string // Format: "HH:MM"
    type: 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment'
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified'
    parkId?: string
    attractionId?: string
    locationName?: string
    isHighlighted: boolean
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

export interface CreateCalendarEventInput {
    vacationId: string
    userId: string
    title: string
    date: Timestamp
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

// Event Sharing interface
export interface EventSharing extends FirebaseDocument {
    eventId: string
    sharedWithUserId: string
    permission: 'view' | 'edit' | 'admin'
    sharedBy: string
    sharedAt: Timestamp
}

export interface CreateEventSharingInput {
    eventId: string
    sharedWithUserId: string
    permission?: 'view' | 'edit' | 'admin'
    sharedBy: string
}

// Event History interface
export interface EventHistory extends FirebaseDocument {
    eventId: string
    userId: string
    action: 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed'
    changes: Record<string, unknown>
    timestamp: Timestamp
}

export interface CreateEventHistoryInput {
    eventId: string
    userId: string
    action: 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed'
    changes: Record<string, unknown>
    timestamp?: Timestamp
}

// User Location interface
export interface UserLocation extends FirebaseDocument {
    userId: string
    vacationId?: string
    latitude: number
    longitude: number
    accuracy?: number
    altitude?: number
    heading?: number
    speed?: number
    timestamp: Timestamp
    type: 'current' | 'historical' | 'planned'
    metadata?: {
        deviceInfo?: string
        networkType?: string
        batteryLevel?: number
        isBackground?: boolean
        parkArea?: string
        attraction?: string
        activity?: string
    }
    isActive: boolean
}

export interface CreateUserLocationInput {
    userId: string
    vacationId?: string
    latitude: number
    longitude: number
    accuracy?: number
    altitude?: number
    heading?: number
    speed?: number
    timestamp?: Timestamp
    type?: 'current' | 'historical' | 'planned'
    metadata?: {
        deviceInfo?: string
        networkType?: string
        batteryLevel?: number
        isBackground?: boolean
        parkArea?: string
        attraction?: string
        activity?: string
    }
    isActive?: boolean
}

// Geofence interface
export interface Geofence extends FirebaseDocument {
    vacationId?: string
    createdBy: string
    name: string
    description?: string
    latitude: number
    longitude: number
    radius: number
    type: 'attraction' | 'meeting' | 'safety' | 'custom' | 'directional' | 'altitude'
    isActive: boolean
    direction?: number
    directionRange?: number
    minAltitude?: number
    maxAltitude?: number
    activeStartTime?: Timestamp
    activeEndTime?: Timestamp
    settings: {
        notifyOnEntry?: boolean
        notifyOnExit?: boolean
        cooldownMinutes?: number
        maxAlerts?: number
        triggerDistance?: number
        requiresMovement?: boolean
        parkArea?: string
        attraction?: string
        customMessage?: string
        soundAlert?: boolean
        vibrationAlert?: boolean
        priority?: 'low' | 'medium' | 'high' | 'urgent'
    }
}

export interface CreateGeofenceInput {
    vacationId?: string
    createdBy: string
    name: string
    description?: string
    latitude: number
    longitude: number
    radius: number
    type?: 'attraction' | 'meeting' | 'safety' | 'custom' | 'directional' | 'altitude'
    isActive?: boolean
    direction?: number
    directionRange?: number
    minAltitude?: number
    maxAltitude?: number
    activeStartTime?: Timestamp
    activeEndTime?: Timestamp
    settings?: {
        notifyOnEntry?: boolean
        notifyOnExit?: boolean
        cooldownMinutes?: number
        maxAlerts?: number
        triggerDistance?: number
        requiresMovement?: boolean
        parkArea?: string
        attraction?: string
        customMessage?: string
        soundAlert?: boolean
        vibrationAlert?: boolean
        priority?: 'low' | 'medium' | 'high' | 'urgent'
    }
}

// Geofence Alert interface
export interface GeofenceAlert extends FirebaseDocument {
    geofenceId: string
    userId: string
    vacationId?: string
    alertType: 'entry' | 'exit' | 'proximity' | 'separation' | 'safety'
    latitude: number
    longitude: number
    distance?: number
    message?: string
    isRead: boolean
    metadata?: {
        accuracy?: number
        speed?: number
        heading?: number
        triggeredAt?: string
        deviceInfo?: string
        userAgent?: string
    }
    triggeredAt: Timestamp
    readAt?: Timestamp
}

export interface CreateGeofenceAlertInput {
    geofenceId: string
    userId: string
    vacationId?: string
    alertType: 'entry' | 'exit' | 'proximity' | 'separation' | 'safety'
    latitude: number
    longitude: number
    distance?: number
    message?: string
    isRead?: boolean
    metadata?: {
        accuracy?: number
        speed?: number
        heading?: number
        triggeredAt?: string
        deviceInfo?: string
        userAgent?: string
    }
    triggeredAt?: Timestamp
    readAt?: Timestamp
}

// Resort and Accommodation types
export interface Resort extends FirebaseDocument {
    // Basic Information
    resortId: string // Unique identifier (e.g., "all-star-movies-resort")
    name: string
    type: 'Value' | 'Moderate' | 'Deluxe' | 'DVC Villa' | 'Military Resort'
    theme: string
    location: string // Resort area (e.g., "Animal Kingdom Resort Area")
    category: 'VALUE_RESORTS' | 'MODERATE_RESORTS' | 'DELUXE_RESORTS' | 'DVC_RESORTS' | 'OTHER_RESORTS'

    // Contact Information
    address: string
    phone: string
    website: string

    // Descriptions
    description: string

    // Amenities and Features
    amenities: string[]
    transportation: string[]
    roomTypes: string[]
    dining: string[]
    recreation: string[]

    // Images
    images: string[]

    // Pricing
    rates: {
        min: number
        max: number
        currency: string
    }
    historicalRates: Array<{
        year: number
        min: number
        max: number
    }>

    // Reviews and Ratings
    reviews: {
        avgRating: number
        reviewCount: number
    }

    // Tags and Metadata
    promotionalTags: string[]

    // Location Data
    mapLocation: {
        lat: number
        lng: number
    }

    // DVC and Status Information
    isDVC: boolean
    dateOpened: string // ISO date string
    status: 'Open' | 'Closed' | 'Seasonal' | 'Under Renovation'
    roomCount: number

    // Optional Fields
    eligibility?: string // For special resorts like military-only

    // Search and Filter Indexes
    searchTerms: string[] // For full-text search
    areaIndex: string // For area-based filtering
    amenityIndex: string[] // For amenity-based filtering
    priceIndex: number // For price-based sorting
    ratingIndex: number // For rating-based sorting
}

export interface CreateResortInput {
    resortId: string
    name: string
    type: 'Value' | 'Moderate' | 'Deluxe' | 'DVC Villa' | 'Military Resort'
    theme: string
    location: string
    category: 'VALUE_RESORTS' | 'MODERATE_RESORTS' | 'DELUXE_RESORTS' | 'DVC_RESORTS' | 'OTHER_RESORTS'
    address: string
    phone: string
    website: string
    description: string
    amenities: string[]
    transportation: string[]
    roomTypes: string[]
    dining: string[]
    recreation: string[]
    images: string[]
    rates: {
        min: number
        max: number
        currency: string
    }
    historicalRates: Array<{
        year: number
        min: number
        max: number
    }>
    reviews: {
        avgRating: number
        reviewCount: number
    }
    promotionalTags: string[]
    mapLocation: {
        lat: number
        lng: number
    }
    isDVC: boolean
    dateOpened: string
    status: 'Open' | 'Closed' | 'Seasonal' | 'Under Renovation'
    roomCount: number
    eligibility?: string
}

// Resort Categories Collection
export interface ResortCategory extends FirebaseDocument {
    categoryId: string // e.g., "VALUE_RESORTS"
    name: string // e.g., "Value Resorts"
    description: string
    priceRange: {
        min: number
        max: number
    }
    resortCount: number
    features: string[]
    targetAudience: string[]
}

// Resort Statistics and Metadata
export interface ResortStats extends FirebaseDocument {
    totalResorts: number
    lastUpdated: string
    dataSource: string
    categories: {
        value: number
        moderate: number
        deluxe: number
        dvc: number
        other: number
    }
    averageRating: number
    priceRanges: {
        overall: { min: number; max: number }
        byCategory: Record<string, { min: number; max: number }>
    }
    popularAmenities: Array<{
        name: string
        count: number
        percentage: number
    }>
    locationDistribution: Record<string, number>
}