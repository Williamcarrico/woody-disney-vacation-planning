/**
 * Comprehensive Firebase Type Validation Schemas
 * 
 * This module provides runtime validation for all Firebase data types
 * ensuring data integrity and type safety at runtime.
 */

import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'

// ============================================
// UTILITY SCHEMAS
// ============================================

/**
 * Firebase Timestamp validation with proper error handling
 */
export const timestampSchema = z.custom<Timestamp>(
    (val) => {
        if (val instanceof Timestamp) return true
        // Handle server timestamp placeholders
        if (val && typeof val === 'object' && '_methodName' in val) return true
        return false
    },
    { message: 'Expected Firebase Timestamp or serverTimestamp()' }
)

/**
 * Convert various date formats to Timestamp
 */
export const dateToTimestampSchema = z.union([
    timestampSchema,
    z.date().transform(date => Timestamp.fromDate(date)),
    z.string().datetime().transform(str => Timestamp.fromDate(new Date(str))),
])

/**
 * Base document schema with metadata
 */
export const firebaseDocumentSchema = z.object({
    id: z.string().min(1, 'Document ID is required'),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})

// ============================================
// USER SCHEMAS
// ============================================

export const userPreferencesSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    language: z.string().optional(),
}).optional()

export const userSchema = firebaseDocumentSchema.extend({
    email: z.string().email('Invalid email format'),
    displayName: z.string().optional(),
    photoURL: z.string().url('Invalid photo URL').optional(),
    isEmailVerified: z.boolean().default(false),
    lastLoginAt: timestampSchema.optional(),
    preferences: userPreferencesSchema,
    role: z.string().default('user'),
})

export const createUserInputSchema = userSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    isEmailVerified: true,
    role: true,
})

export const updateUserInputSchema = userSchema.partial().omit({
    id: true,
    createdAt: true,
})

// ============================================
// VACATION SCHEMAS
// ============================================

const budgetCategorySchema = z.object({
    planned: z.number().min(0),
    actual: z.number().min(0),
})

const budgetSchema = z.object({
    total: z.number().min(0),
    spent: z.number().min(0),
    categories: z.record(z.string(), budgetCategorySchema),
}).optional()

const travelersSchema = z.object({
    adults: z.number().int().min(1, 'At least one adult is required'),
    children: z.number().int().min(0),
    childrenAges: z.array(z.number().int().min(0).max(17)).optional(),
}).refine(
    (data) => !data.childrenAges || data.childrenAges.length === data.children,
    { message: 'Number of children ages must match number of children' }
)

const accommodationsSchema = z.object({
    resortId: z.string().optional(),
    resortName: z.string().optional(),
    roomType: z.string().optional(),
    checkInDate: z.string().datetime().optional(),
    checkOutDate: z.string().datetime().optional(),
    confirmationNumber: z.string().optional(),
}).optional()

export const vacationSchema = firebaseDocumentSchema.extend({
    userId: z.string().min(1, 'User ID is required'),
    name: z.string().min(1, 'Vacation name is required').max(100),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    destination: z.string().default('Walt Disney World'),
    budget: budgetSchema,
    travelers: travelersSchema,
    accommodations: accommodationsSchema,
    notes: z.string().max(5000).optional(),
    isArchived: z.boolean().default(false),
}).refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'End date must be after or equal to start date' }
)

export const createVacationInputSchema = vacationSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    destination: true,
    isArchived: true,
})

// ============================================
// ITINERARY SCHEMAS
// ============================================

const activitySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Activity name is required'),
    type: z.string().min(1),
    startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    location: z.string().optional(),
    description: z.string().optional(),
    waitTime: z.number().min(0).optional(),
    walkingTime: z.number().min(0).optional(),
    notes: z.string().optional(),
})

const parkDaySchema = z.object({
    date: z.string().datetime(),
    parkId: z.string().min(1, 'Park ID is required'),
    activities: z.array(activitySchema),
})

const itineraryPreferencesSchema = z.object({
    partySize: z.number().int().min(1).optional(),
    hasChildren: z.boolean().optional(),
    childrenAges: z.array(z.number().int().min(0).max(17)).optional(),
    hasStroller: z.boolean().optional(),
    mobilityConsiderations: z.boolean().optional(),
    ridePreference: z.enum(['thrill', 'family', 'all']).optional(),
    maxWaitTime: z.number().min(0).optional(),
    walkingPace: z.enum(['slow', 'moderate', 'fast']).optional(),
    useGeniePlus: z.boolean().optional(),
    useIndividualLightningLane: z.boolean().optional(),
})

export const itinerarySchema = firebaseDocumentSchema.extend({
    userId: z.string().min(1, 'User ID is required'),
    vacationId: z.string().optional(),
    tripName: z.string().min(1, 'Trip name is required').max(100),
    parkDays: z.array(parkDaySchema),
    preferences: itineraryPreferencesSchema,
    isShared: z.boolean().default(false),
    shareCode: z.string().optional(),
})

export const createItineraryInputSchema = itinerarySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    isShared: true,
})

// ============================================
// CALENDAR EVENT SCHEMAS
// ============================================

const reminderSchema = z.object({
    enabled: z.boolean(),
    time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/),
    type: z.enum(['notification', 'email', 'sms']),
}).optional()

const reservationSchema = z.object({
    id: z.string(),
    name: z.string(),
    time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/),
    partySize: z.number().int().min(1),
    confirmed: z.boolean(),
    confirmationNumber: z.string().optional(),
    specialRequests: z.string().optional(),
    cost: z.number().min(0).optional(),
    prepaid: z.boolean().optional(),
}).optional()

const weatherSchema = z.object({
    condition: z.enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'partly-cloudy', 'windy']),
    highTemp: z.number(),
    lowTemp: z.number(),
    precipitation: z.number().min(0).max(100),
    humidity: z.number().min(0).max(100),
    windSpeed: z.number().min(0),
    uvIndex: z.number().min(0).max(11),
    visibility: z.number().min(0),
    sunrise: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/),
    sunset: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/),
    moonPhase: z.enum(['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent']),
}).optional()

const transportationSchema = z.object({
    type: z.enum(['bus', 'monorail', 'boat', 'skyliner', 'car', 'uber', 'walk']),
    pickupLocation: z.string().optional(),
    pickupTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/).optional(),
    duration: z.number().min(0).optional(),
}).optional()

const checklistItemSchema = z.object({
    id: z.string(),
    task: z.string(),
    completed: z.boolean(),
    dueTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/).optional(),
})

const attachmentSchema = z.object({
    type: z.enum(['image', 'document', 'link']),
    url: z.string().url(),
    title: z.string(),
    thumbnail: z.string().url().optional(),
})

export const calendarEventSchema = firebaseDocumentSchema.extend({
    vacationId: z.string().min(1),
    userId: z.string().min(1),
    title: z.string().min(1).max(200),
    date: timestampSchema,
    startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/).optional(),
    endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/).optional(),
    type: z.enum(['park', 'dining', 'resort', 'travel', 'rest', 'event', 'note', 'fastpass', 'photo', 'shopping', 'entertainment']),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    status: z.enum(['planned', 'confirmed', 'completed', 'cancelled', 'modified']).default('planned'),
    parkId: z.string().optional(),
    attractionId: z.string().optional(),
    locationName: z.string().optional(),
    isHighlighted: z.boolean().default(false),
    notes: z.string().max(2000).optional(),
    tags: z.array(z.string()).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
    participants: z.array(z.string()).optional(),
    reminder: reminderSchema,
    reservation: reservationSchema,
    weather: weatherSchema,
    budget: z.object({
        estimated: z.number().min(0),
        actual: z.number().min(0).optional(),
        currency: z.string().default('USD'),
        category: z.string(),
    }).optional(),
    transportation: transportationSchema,
    checklist: z.array(checklistItemSchema).optional(),
    attachments: z.array(attachmentSchema).optional(),
})

export const createCalendarEventInputSchema = calendarEventSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    priority: true,
    status: true,
    isHighlighted: true,
})

// ============================================
// LOCATION SCHEMAS
// ============================================

const locationMetadataSchema = z.object({
    deviceInfo: z.string().optional(),
    networkType: z.string().optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    isBackground: z.boolean().optional(),
    parkArea: z.string().optional(),
    attraction: z.string().optional(),
    activity: z.string().optional(),
}).optional()

export const userLocationSchema = firebaseDocumentSchema.extend({
    userId: z.string().min(1),
    vacationId: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().positive().optional(),
    altitude: z.number().optional(),
    heading: z.number().min(0).max(360).optional(),
    speed: z.number().min(0).optional(),
    timestamp: timestampSchema,
    type: z.enum(['current', 'historical', 'planned']).default('current'),
    metadata: locationMetadataSchema,
    isActive: z.boolean().default(true),
})

export const createUserLocationInputSchema = userLocationSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    timestamp: true,
    type: true,
    isActive: true,
})

// ============================================
// GEOFENCE SCHEMAS
// ============================================

const geofenceSettingsSchema = z.object({
    notifyOnEntry: z.boolean().optional(),
    notifyOnExit: z.boolean().optional(),
    cooldownMinutes: z.number().min(0).optional(),
    maxAlerts: z.number().min(0).optional(),
    triggerDistance: z.number().min(0).optional(),
    requiresMovement: z.boolean().optional(),
    parkArea: z.string().optional(),
    attraction: z.string().optional(),
    customMessage: z.string().optional(),
    soundAlert: z.boolean().optional(),
    vibrationAlert: z.boolean().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
}).optional()

export const geofenceSchema = firebaseDocumentSchema.extend({
    vacationId: z.string().optional(),
    createdBy: z.string().min(1),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(5000), // Max 5km radius
    type: z.enum(['attraction', 'meeting', 'safety', 'custom', 'directional', 'altitude']).default('custom'),
    isActive: z.boolean().default(true),
    direction: z.number().min(0).max(360).optional(),
    directionRange: z.number().min(0).max(180).optional(),
    minAltitude: z.number().optional(),
    maxAltitude: z.number().optional(),
    activeStartTime: timestampSchema.optional(),
    activeEndTime: timestampSchema.optional(),
    settings: geofenceSettingsSchema,
})

export const createGeofenceInputSchema = geofenceSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    type: true,
    isActive: true,
})

// ============================================
// RESORT SCHEMAS
// ============================================

const resortRatesSchema = z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('USD'),
})

const historicalRateSchema = z.object({
    year: z.number().int().min(1971).max(new Date().getFullYear() + 5),
    min: z.number().min(0),
    max: z.number().min(0),
})

const reviewsSchema = z.object({
    avgRating: z.number().min(0).max(5),
    reviewCount: z.number().int().min(0),
})

const mapLocationSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
})

export const resortSchema = firebaseDocumentSchema.extend({
    resortId: z.string().regex(/^[a-zA-Z0-9\-_]+$/),
    name: z.string().min(1).max(200),
    type: z.enum(['Value', 'Moderate', 'Deluxe', 'DVC Villa', 'Military Resort']),
    theme: z.string().max(200),
    location: z.string().max(200),
    category: z.enum(['VALUE_RESORTS', 'MODERATE_RESORTS', 'DELUXE_RESORTS', 'DVC_RESORTS', 'OTHER_RESORTS']),
    address: z.string().max(500),
    phone: z.string().max(50),
    website: z.string().url(),
    description: z.string().max(5000),
    amenities: z.array(z.string()),
    transportation: z.array(z.string()),
    roomTypes: z.array(z.string()),
    dining: z.array(z.string()),
    recreation: z.array(z.string()),
    images: z.array(z.string().url()),
    rates: resortRatesSchema,
    historicalRates: z.array(historicalRateSchema),
    reviews: reviewsSchema,
    promotionalTags: z.array(z.string()),
    mapLocation: mapLocationSchema,
    isDVC: z.boolean(),
    dateOpened: z.string().datetime(),
    status: z.enum(['Open', 'Closed', 'Seasonal', 'Under Renovation']),
    roomCount: z.number().int().min(0),
    eligibility: z.string().optional(),
    searchTerms: z.array(z.string()),
    areaIndex: z.string(),
    amenityIndex: z.array(z.string()),
    priceIndex: z.number().min(0),
    ratingIndex: z.number().min(0).max(5),
})

export const createResortInputSchema = resortSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    searchTerms: true,
    areaIndex: true,
    amenityIndex: true,
    priceIndex: true,
    ratingIndex: true,
})

// ============================================
// TYPE EXPORTS
// ============================================

export type User = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserInputSchema>
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>

export type Vacation = z.infer<typeof vacationSchema>
export type CreateVacationInput = z.infer<typeof createVacationInputSchema>

export type Itinerary = z.infer<typeof itinerarySchema>
export type CreateItineraryInput = z.infer<typeof createItineraryInputSchema>

export type CalendarEvent = z.infer<typeof calendarEventSchema>
export type CreateCalendarEventInput = z.infer<typeof createCalendarEventInputSchema>

export type UserLocation = z.infer<typeof userLocationSchema>
export type CreateUserLocationInput = z.infer<typeof createUserLocationInputSchema>

export type Geofence = z.infer<typeof geofenceSchema>
export type CreateGeofenceInput = z.infer<typeof createGeofenceInputSchema>

export type Resort = z.infer<typeof resortSchema>
export type CreateResortInput = z.infer<typeof createResortInputSchema> 