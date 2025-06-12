/**
 * Firebase Firestore Collection Definitions
 *
 * This file defines the Firestore collection structure and types
 * for migrating from PostgreSQL to Firebase
 */

import { Timestamp } from 'firebase/firestore'

// ====== CORE USER COLLECTION ======

export interface FirebaseUser {
  id: string // Firebase Auth UID
  email: string
  displayName?: string
  photoURL?: string
  isEmailVerified: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt?: Timestamp
  preferences: {
    theme?: 'light' | 'dark' | 'system'
    emailNotifications?: boolean
    pushNotifications?: boolean
    language?: string
  }
  role: string // 'user' | 'admin' | 'premium'
}

// ====== VACATION COLLECTION ======

export interface FirebaseVacation {
  id: string // Auto-generated document ID
  userId: string // Reference to user
  name: string
  startDate: Timestamp
  endDate: Timestamp
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
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ====== ITINERARY COLLECTION ======

export interface FirebaseItinerary {
  id: string // Auto-generated document ID
  userId: string // Reference to user
  vacationId?: string // Reference to vacation
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
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ====== LOCATION DATA SUBCOLLECTION ======

export interface FirebaseUserLocation {
  id: string
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
  createdAt: Timestamp
}

// ====== GEOFENCES SUBCOLLECTION ======

export interface FirebaseGeofence {
  id: string
  vacationId?: string
  createdBy: string
  name: string
  description?: string
  latitude: number
  longitude: number
  radius: number
  type: 'attraction' | 'meeting' | 'safety' | 'custom' | 'directional' | 'altitude'
  isActive: boolean

  // Directional geofencing support
  direction?: number
  directionRange?: number

  // Altitude geofencing support
  minAltitude?: number
  maxAltitude?: number

  // Time-based activation
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

  createdAt: Timestamp
  updatedAt: Timestamp
}

// ====== GEOFENCE ALERTS SUBCOLLECTION ======

export interface FirebaseGeofenceAlert {
  id: string
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

// ====== LOCATION SHARING SUBCOLLECTION ======

export interface FirebaseLocationSharing {
  id: string
  userId: string
  vacationId: string
  shareWith: string
  isEnabled: boolean
  shareCurrentLocation: boolean
  shareHistoricalLocation: boolean
  alertOnGeofenceEntry: boolean
  alertOnSeparation: boolean
  maxSeparationDistance: number
  settings: {
    updateInterval?: number
    accuracy?: 'high' | 'medium' | 'low'
    backgroundUpdates?: boolean
    onlyInParks?: boolean
    shareETA?: boolean
    shareActivity?: boolean
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ====== LOCATION ANALYTICS SUBCOLLECTION ======

export interface FirebaseLocationAnalytics {
  id: string
  vacationId: string
  userId: string
  date: Timestamp
  totalDistance?: number
  averageSpeed?: number
  maxSpeed?: number
  timeInParks?: number
  timeAtAttractions?: number
  attractionsVisited: string[]
  areasVisited: string[]
  geofenceTriggered: number
  stepsEstimate?: number
  caloriesEstimate?: number
  metadata?: {
    weather?: string
    temperature?: number
    crowdLevels?: string
    specialEvents?: string[]
    notes?: string
  }
  createdAt: Timestamp
}

// ====== CALENDAR EVENTS SUBCOLLECTION ======

export interface FirebaseCalendarEvent {
  id: string
  vacationId: string
  userId: string

  // Basic event information
  title: string
  date: Timestamp
  startTime?: string
  endTime?: string

  // Event categorization
  type: 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified'

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

  // Reminder settings
  reminder?: {
    enabled: boolean
    time: string
    type: 'notification' | 'email' | 'sms'
  }

  // Reservation details
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

  // Weather information
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

  // Budget tracking
  budget?: {
    estimated: number
    actual?: number
    currency: string
    category: string
  }

  // Transportation details
  transportation?: {
    type: 'bus' | 'monorail' | 'boat' | 'skyliner' | 'car' | 'uber' | 'walk'
    pickupLocation?: string
    pickupTime?: string
    duration?: number
  }

  // Task checklist
  checklist?: Array<{
    id: string
    task: string
    completed: boolean
    dueTime?: string
  }>

  // File attachments
  attachments?: Array<{
    type: 'image' | 'document' | 'link'
    url: string
    title: string
    thumbnail?: string
  }>

  createdAt: Timestamp
  updatedAt: Timestamp
}

// ====== EVENT SHARING SUBCOLLECTION ======

export interface FirebaseEventSharing {
  id: string
  eventId: string
  sharedWithUserId: string
  permission: 'view' | 'edit' | 'admin'
  sharedBy: string
  sharedAt: Timestamp
}

// ====== EVENT HISTORY SUBCOLLECTION ======

export interface FirebaseEventHistory {
  id: string
  eventId: string
  userId: string
  action: 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed'
  changes: Record<string, unknown>
  timestamp: Timestamp
}

// ====== PARKS COLLECTION ======

export interface FirebasePark {
  id: string
  name: string
  abbreviation: string
  description: string
  opened: string
  theme: string
  size: {
    acres: number
    hectares: number
  }
  location: {
    latitude: number
    longitude: number
    address: string
  }
  operatingHours: {
    typical: {
      monday: { open: string; close: string }
      tuesday: { open: string; close: string }
      wednesday: { open: string; close: string }
      thursday: { open: string; close: string }
      friday: { open: string; close: string }
      saturday: { open: string; close: string }
      sunday: { open: string; close: string }
    }
    extendedEvening: boolean
    earlyEntry: boolean
    specialEvents: string[]
  }
  lands: Array<{
    id: string
    name: string
    description: string
    theme: string
    attractions: string[]
    dining: string[]
    shops: string[]
  }>
  attractions: Array<{
    id: string
    name: string
    landId: string
    type: 'ride' | 'show' | 'experience' | 'character-meet' | 'walkthrough'
    description: string
    heightRequirement: {
      inches: number | null
      centimeters: number | null
    }
    duration: {
      minutes: number
      variableLength: boolean
    }
    capacity: {
      hourly: number
      vehicleCapacity: number
    }
    accessibility: {
      wheelchairAccessible: boolean
      transferRequired: boolean
      assistiveListening: boolean
      audioDescription: boolean
      handheldCaptioning: boolean
      signLanguage: boolean
      serviceAnimalsAllowed: boolean
    }
    lightningLane: {
      available: boolean
      tier?: 'SinglePass' | 'MultiPass'
    }
    ageAppeal: Array<'toddler' | 'preschool' | 'kids' | 'tweens' | 'teens' | 'adults' | 'seniors'>
    thrillLevel: number
    indoor: boolean
    mustDo: boolean
    tips: string[]
    bestTimes: string[]
    photoPass: boolean
    rider: {
      swap: boolean
      single: boolean
    }
    virtualQueue: boolean
    closureInfo?: {
      startDate: string
      endDate: string
      reason: string
    }
  }>
  dining: {
    tableService: Array<{
      id: string
      name: string
      landId: string
      cuisine: string[]
      description: string
      mealPeriods: Array<'breakfast' | 'lunch' | 'dinner' | 'allday'>
      priceRange: '$' | '$$' | '$$$' | '$$$$'
      reservations: {
        required: boolean
        recommended: boolean
        acceptsWalkUps: boolean
      }
      diningPlan: {
        accepted: boolean
        credits: number
      }
      menu: {
        signature: string[]
        categories: Array<{
          name: string
          items: Array<{
            name: string
            description: string
            price: string
            dietary: string[]
          }>
        }>
      }
      seating: {
        indoor: boolean
        outdoor: boolean
        capacity: number
      }
      characterDining: boolean
      characters?: string[]
      mobileOrder: boolean
      accessibility: {
        wheelchairAccessible: boolean
        brailleMenu: boolean
        allergyFriendly: boolean
      }
      tips: string[]
    }>
    quickService: Array<{
      id: string
      name: string
      landId: string
      cuisine: string[]
      description: string
      mealPeriods: Array<'breakfast' | 'lunch' | 'dinner' | 'allday'>
      priceRange: '$' | '$$' | '$$$'
      reservations: {
        required: boolean
        recommended: boolean
        acceptsWalkUps: boolean
      }
      diningPlan: {
        accepted: boolean
        credits: number
      }
      menu: {
        signature: string[]
        categories: Array<{
          name: string
          items: Array<{
            name: string
            description: string
            price: string
            dietary: string[]
          }>
        }>
      }
      seating: {
        indoor: boolean
        outdoor: boolean
        capacity: number
      }
      characterDining: boolean
      mobileOrder: boolean
      accessibility: {
        wheelchairAccessible: boolean
        brailleMenu: boolean
        allergyFriendly: boolean
      }
      tips: string[]
    }>
    snacks: Array<{
      id: string
      name: string
      landId: string
      type: 'stand' | 'kiosk' | 'cart'
      items: string[]
      specialties: string[]
      seasonal: boolean
      mobileOrder: boolean
      location: string
    }>
  }
  entertainment: Array<{
    id: string
    name: string
    landId?: string
    type: 'fireworks' | 'parade' | 'show' | 'streetmosphere' | 'character-meet'
    description: string
    duration: { minutes: number }
    showtimes: string[] | string
    location: string
    capacity?: number
    lightningLane: boolean
    seasonal: boolean
    ageAppeal: Array<'toddler' | 'preschool' | 'kids' | 'tweens' | 'teens' | 'adults' | 'seniors'>
    tips: string[]
  }>
  facilities: Array<{
    id: string
    name: string
    type: 'baby-care' | 'first-aid' | 'guest-relations' | 'locker' | 'restroom'
    locations: string[]
    features: string[]
  }>
  services: Array<{
    id: string
    name: string
    type: 'accessibility' | 'convenience' | 'photography' | 'rental' | 'experience' | 'activity'
    description: string
    locations: string[]
    cost: string
    reservation: boolean
  }>
  accessibility: {
    overview: string
    services: {
      das: {
        available: boolean
        description: string
      }
      wheelchairRental: {
        available: boolean
        locations: string[]
        cost: string
      }
      interpreterServices: boolean
      brailleGuidebooks: boolean
      audioDescription: boolean
    }
    companionRestrooms: string[]
    quietAreas: string[]
  }
  tips: Array<{
    category: string
    tips: Array<{
      title: string
      description: string
      priority: 'low' | 'medium' | 'high'
    }>
  }>
  transportation: {
    parkingLot: boolean
    monorail: boolean
    boat: boolean
    bus: boolean
    skyliner: boolean
    walkable: boolean
    resortAccess: {
      monorail?: string[]
      boat?: string[]
      walking?: string[]
      skyliner?: string[]
    }
  }
  parkingInfo: {
    available: boolean
    standard: {
      cost: string
      location: string
    }
    preferred: {
      cost: string
      location: string
    }
    trams: boolean
    tips: string[]
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ====== COLLECTION PATHS ======

export const COLLECTIONS = {
  USERS: 'users',
  VACATIONS: 'vacations',
  ITINERARIES: 'itineraries',
  PARKS: 'parks',

  // Subcollections (within vacations)
  USER_LOCATIONS: 'userLocations',
  GEOFENCES: 'geofences',
  GEOFENCE_ALERTS: 'geofenceAlerts',
  LOCATION_SHARING: 'locationSharing',
  LOCATION_ANALYTICS: 'locationAnalytics',
  CALENDAR_EVENTS: 'calendarEvents',
  EVENT_SHARING: 'eventSharing',
  EVENT_HISTORY: 'eventHistory',
} as const

// ====== HELPER TYPES ======

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]

export type FirebaseDocument =
  | FirebaseUser
  | FirebaseVacation
  | FirebaseItinerary
  | FirebasePark
  | FirebaseUserLocation
  | FirebaseGeofence
  | FirebaseGeofenceAlert
  | FirebaseLocationSharing
  | FirebaseLocationAnalytics
  | FirebaseCalendarEvent
  | FirebaseEventSharing
  | FirebaseEventHistory

// ====== CONVERSION HELPERS ======

/**
 * Convert PostgreSQL timestamp to Firebase Timestamp
 */
export const timestampToFirebase = (date: Date | string): Timestamp => {
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date))
  }
  return Timestamp.fromDate(date)
}

/**
 * Convert Firebase Timestamp to JavaScript Date
 */
export const timestampFromFirebase = (timestamp: Timestamp): Date => {
  return timestamp.toDate()
}