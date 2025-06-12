/**
 * Unified Resort Type Definitions
 *
 * This file consolidates all resort-related types, interfaces, and enums
 * to resolve schema inconsistencies across the application.
 */

import { z } from 'zod'

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export const RESORT_CATEGORIES = {
    VALUE: 'value',
    MODERATE: 'moderate',
    DELUXE: 'deluxe',
    VILLA: 'villa',
    CAMPGROUND: 'campground'
} as const

export const RESORT_AREAS = {
    MAGIC_KINGDOM: 'Magic Kingdom Area',
    EPCOT: 'EPCOT Area',
    HOLLYWOOD_STUDIOS: 'Hollywood Studios Area',
    ANIMAL_KINGDOM: 'Animal Kingdom Area',
    DISNEY_SPRINGS: 'Disney Springs Area',
    ESPN_WIDE_WORLD: 'ESPN Wide World of Sports Area',
    OTHER: 'Other'
} as const

export const ROOM_TYPES = {
    STANDARD: 'Standard Room',
    PREFERRED: 'Preferred Room',
    CLUB_LEVEL: 'Club Level',
    SUITE: 'Suite',
    VILLA: 'Villa',
    STUDIO: 'Studio',
    ONE_BEDROOM: 'One Bedroom Villa',
    TWO_BEDROOM: 'Two Bedroom Villa',
    THREE_BEDROOM: 'Three Bedroom Villa',
    GRAND_VILLA: 'Grand Villa'
} as const

export const TRANSPORTATION_TYPES = {
    MONORAIL: 'Monorail',
    BUS: 'Bus',
    BOAT: 'Boat',
    SKYLINER: 'Disney Skyliner',
    WALKING: 'Walking Path',
    CAR: 'Car/Driving'
} as const

export const AMENITY_CATEGORIES = {
    DINING: 'Dining',
    RECREATION: 'Recreation',
    TRANSPORTATION: 'Transportation',
    SERVICES: 'Services',
    SHOPPING: 'Shopping',
    ENTERTAINMENT: 'Entertainment',
    WELLNESS: 'Wellness',
    BUSINESS: 'Business',
    ACCESSIBILITY: 'Accessibility'
} as const

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

// Base schemas for reusable components
export const coordinatesSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
})

export const priceRangeSchema = z.object({
    low: z.number().min(0).optional(),
    high: z.number().min(0).optional()
}).refine(data => !data.low || !data.high || data.low <= data.high, {
    message: "Low price must be less than or equal to high price"
})

export const contactInfoSchema = z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    fax: z.string().optional()
})

export const addressSchema = z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('United States')
})

export const locationSchema = z.object({
    address: addressSchema,
    coordinates: coordinatesSchema,
    area: z.enum([
        RESORT_AREAS.MAGIC_KINGDOM,
        RESORT_AREAS.EPCOT,
        RESORT_AREAS.HOLLYWOOD_STUDIOS,
        RESORT_AREAS.ANIMAL_KINGDOM,
        RESORT_AREAS.DISNEY_SPRINGS,
        RESORT_AREAS.ESPN_WIDE_WORLD,
        RESORT_AREAS.OTHER
    ]),
    distanceToParks: z.record(z.string(), z.number().min(0))
})

export const amenitySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.enum([
        AMENITY_CATEGORIES.DINING,
        AMENITY_CATEGORIES.RECREATION,
        AMENITY_CATEGORIES.TRANSPORTATION,
        AMENITY_CATEGORIES.SERVICES,
        AMENITY_CATEGORIES.SHOPPING,
        AMENITY_CATEGORIES.ENTERTAINMENT,
        AMENITY_CATEGORIES.WELLNESS,
        AMENITY_CATEGORIES.BUSINESS,
        AMENITY_CATEGORIES.ACCESSIBILITY
    ]),
    isAvailable: z.boolean().default(true),
    hours: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        notes: z.string().optional()
    }).optional(),
    additionalFees: z.boolean().default(false),
    reservationRequired: z.boolean().default(false)
})

export const diningLocationSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['Quick Service', 'Table Service', 'Lounge', 'Room Service', 'Snack Bar']),
    cuisine: z.string(),
    description: z.string().optional(),
    priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
    hours: z.object({
        breakfast: z.string().optional(),
        lunch: z.string().optional(),
        dinner: z.string().optional(),
        notes: z.string().optional()
    }).optional(),
    reservationsRequired: z.boolean().default(false),
    diningPlan: z.boolean().default(false),
    imageUrl: z.string().url().optional()
})

export const recreationActivitySchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    ageRestrictions: z.string().optional(),
    additionalFees: z.boolean().default(false),
    reservationRequired: z.boolean().default(false),
    hours: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        seasonal: z.boolean().default(false)
    }).optional()
})

export const transportationOptionSchema = z.object({
    id: z.string(),
    type: z.enum([
        TRANSPORTATION_TYPES.MONORAIL,
        TRANSPORTATION_TYPES.BUS,
        TRANSPORTATION_TYPES.BOAT,
        TRANSPORTATION_TYPES.SKYLINER,
        TRANSPORTATION_TYPES.WALKING,
        TRANSPORTATION_TYPES.CAR
    ]),
    destination: z.string(),
    estimatedTime: z.number().min(0), // in minutes
    operatingHours: z.object({
        start: z.string(),
        end: z.string(),
        notes: z.string().optional()
    }).optional(),
    frequency: z.string().optional(), // e.g., "Every 10-15 minutes"
    isComplimentary: z.boolean().default(true)
})

export const roomTypeSchema = z.object({
    id: z.string(),
    name: z.enum([
        ROOM_TYPES.STANDARD,
        ROOM_TYPES.PREFERRED,
        ROOM_TYPES.CLUB_LEVEL,
        ROOM_TYPES.SUITE,
        ROOM_TYPES.VILLA,
        ROOM_TYPES.STUDIO,
        ROOM_TYPES.ONE_BEDROOM,
        ROOM_TYPES.TWO_BEDROOM,
        ROOM_TYPES.THREE_BEDROOM,
        ROOM_TYPES.GRAND_VILLA
    ]),
    description: z.string(),
    maxOccupancy: z.number().min(1),
    bedConfiguration: z.string(),
    squareFootage: z.number().min(0).optional(),
    amenities: z.array(z.string()),
    view: z.string().optional(),
    accessibility: z.boolean().default(false),
    imageUrls: z.array(z.string().url()).default([])
})

export const pricingSchema = z.object({
    valueRange: priceRangeSchema.optional(),
    moderateRange: priceRangeSchema.optional(),
    deluxeRange: priceRangeSchema.optional(),
    peakSeason: priceRangeSchema.optional(),
    currency: z.string().default('USD'),
    lastUpdated: z.string().datetime().optional(),
    notes: z.string().optional()
})

// Main resort schema
export const resortSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string(),
    shortDescription: z.string().optional(),
    longDescription: z.string().optional(),
    category: z.enum([
        RESORT_CATEGORIES.VALUE,
        RESORT_CATEGORIES.MODERATE,
        RESORT_CATEGORIES.DELUXE,
        RESORT_CATEGORIES.VILLA,
        RESORT_CATEGORIES.CAMPGROUND
    ]),
    location: locationSchema,
    contact: contactInfoSchema.optional(),
    amenities: z.array(amenitySchema).default([]),
    dining: z.array(diningLocationSchema).default([]),
    recreation: z.array(recreationActivitySchema).default([]),
    transportation: z.array(transportationOptionSchema).default([]),
    roomTypes: z.array(roomTypeSchema).default([]),
    pricing: pricingSchema,

    // Media
    imageUrl: z.string().url(),
    galleryImages: z.array(z.string().url()).default([]),
    logoUrl: z.string().url().optional(),
    virtualTourUrl: z.string().url().optional(),

    // Operational details
    openingDate: z.string().datetime(),
    lastRefurbished: z.string().datetime().optional(),
    checkInTime: z.string().default('15:00'),
    checkOutTime: z.string().default('11:00'),

    // Status and metadata
    isActive: z.boolean().default(true),
    starRating: z.number().min(1).max(5).optional(),
    tags: z.array(z.string()).default([]),
    nearbyParks: z.array(z.string()).default([]),

    // Timestamps
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
})

// Schemas for API operations
export const createResortSchema = resortSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
})

export const updateResortSchema = resortSchema.partial().omit({
    id: true,
    createdAt: true
})

export const resortQuerySchema = z.object({
    // Filtering
    category: z.enum([
        RESORT_CATEGORIES.VALUE,
        RESORT_CATEGORIES.MODERATE,
        RESORT_CATEGORIES.DELUXE,
        RESORT_CATEGORIES.VILLA,
        RESORT_CATEGORIES.CAMPGROUND
    ]).optional(),
    area: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    amenities: z.string().transform(str => str.split(',')).optional(),
    search: z.string().optional(),
    tags: z.string().transform(str => str.split(',')).optional(),

    // Sorting and pagination
    sortBy: z.enum(['name', 'price', 'rating', 'distance', 'category']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),

    // Options
    includeInactive: z.coerce.boolean().default(false),
    useCache: z.coerce.boolean().default(true)
})

// ============================================================================
// TYPESCRIPT TYPES (derived from schemas)
// ============================================================================

export type ResortCategory = keyof typeof RESORT_CATEGORIES
export type ResortArea = keyof typeof RESORT_AREAS
export type RoomType = keyof typeof ROOM_TYPES
export type TransportationType = keyof typeof TRANSPORTATION_TYPES
export type AmenityCategory = keyof typeof AMENITY_CATEGORIES

export type Coordinates = z.infer<typeof coordinatesSchema>
export type PriceRange = z.infer<typeof priceRangeSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type Address = z.infer<typeof addressSchema>
export type Location = z.infer<typeof locationSchema>
export type Amenity = z.infer<typeof amenitySchema>
export type DiningLocation = z.infer<typeof diningLocationSchema>
export type RecreationActivity = z.infer<typeof recreationActivitySchema>
export type TransportationOption = z.infer<typeof transportationOptionSchema>
export type RoomTypeInfo = z.infer<typeof roomTypeSchema>
export type Pricing = z.infer<typeof pricingSchema>

export type Resort = z.infer<typeof resortSchema>
export type CreateResortInput = z.infer<typeof createResortSchema>
export type UpdateResortInput = z.infer<typeof updateResortSchema>
export type ResortQuery = z.infer<typeof resortQuerySchema>

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ResortListResponse {
    resorts: Resort[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
    }
    filters: {
        applied: Partial<ResortQuery>
        available: {
            categories: string[]
            areas: string[]
            amenities: string[]
            priceRange: { min: number; max: number }
        }
    }
    statistics: {
        totalResorts: number
        byCategory: Record<string, number>
        byArea: Record<string, number>
        averageRating: number
        priceRange: { min: number; max: number }
    }
    meta: {
        timestamp: string
        cached: boolean
        dataSource: 'firestore' | 'static' | 'hybrid'
    }
}

export interface ResortDetailResponse {
    resort: Resort
    metadata: {
        totalAmenities: number
        totalDining: number
        totalRecreation: number
        totalTransportation: number
        priceRange: { min: number; max: number }
        nearestParks: Array<{ park: string; distance: number }>
        lastUpdated: string
    }
    related?: {
        similarResorts: Resort[]
        nearbyResorts: Resort[]
    }
    meta: {
        timestamp: string
        cached: boolean
        dataSource: 'firestore' | 'static' | 'hybrid'
    }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ResortFilter {
    category?: ResortCategory[]
    area?: ResortArea[]
    priceRange?: { min?: number; max?: number }
    amenities?: string[]
    rating?: { min?: number; max?: number }
    tags?: string[]
}

export interface ResortSort {
    field: 'name' | 'price' | 'rating' | 'distance' | 'category'
    direction: 'asc' | 'desc'
}

export interface ResortSearchOptions {
    query?: string
    filters?: ResortFilter
    sort?: ResortSort
    pagination?: {
        page: number
        limit: number
    }
    includeInactive?: boolean
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateResort(data: unknown): Resort {
    return resortSchema.parse(data)
}

export function validateCreateResort(data: unknown): CreateResortInput {
    return createResortSchema.parse(data)
}

export function validateUpdateResort(data: unknown): UpdateResortInput {
    return updateResortSchema.parse(data)
}

export function validateResortQuery(data: unknown): ResortQuery {
    return resortQuerySchema.parse(data)
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isResort(data: unknown): data is Resort {
    try {
        resortSchema.parse(data)
        return true
    } catch {
        return false
    }
}

export function isValidResortCategory(category: string): category is keyof typeof RESORT_CATEGORIES {
    return Object.values(RESORT_CATEGORIES).includes(category as any)
}

export function isValidResortArea(area: string): area is keyof typeof RESORT_AREAS {
    return Object.values(RESORT_AREAS).includes(area as any)
}

// ============================================================================
// CONSTANTS FOR EXPORT
// ============================================================================

export const RESORT_CONSTANTS = {
    CATEGORIES: RESORT_CATEGORIES,
    AREAS: RESORT_AREAS,
    ROOM_TYPES,
    TRANSPORTATION_TYPES,
    AMENITY_CATEGORIES
} as const

// Default values
export const DEFAULT_RESORT_QUERY: ResortQuery = {
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
    includeInactive: false,
    useCache: true
}

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
}