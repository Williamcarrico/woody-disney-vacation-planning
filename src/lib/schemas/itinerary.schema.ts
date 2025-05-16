import { z } from 'zod';
import { timestampSchema } from './user.schema';

// Item type enum
export const itemTypeEnum = z.enum([
    'attraction',
    'restaurant',
    'resort',
    'travel',
    'show',
    'break',
    'shopping',
    'custom'
]);

export type ItemType = z.infer<typeof itemTypeEnum>;

// Travel type enum
export const travelTypeEnum = z.enum([
    'flight',
    'car',
    'bus',
    'train',
    'boat',
    'walk',
    'rideshare',
    'taxi',
    'shuttle',
    'other'
]);

export type TravelType = z.infer<typeof travelTypeEnum>;

// Itinerary item schema
export const itineraryItemSchema = z.object({
    id: z.string().min(1),
    itineraryId: z.string().min(1),
    startTime: timestampSchema,
    endTime: timestampSchema,
    itemType: itemTypeEnum,
    title: z.string().min(1),
    description: z.string().optional(),
    location: z.object({
        name: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional(),
    // Reference IDs to different entities
    attractionId: z.string().optional(),
    restaurantId: z.string().optional(),
    resortId: z.string().optional(),
    // Travel details
    travelType: travelTypeEnum.optional(),
    departureLocation: z.string().optional(),
    arrivalLocation: z.string().optional(),
    // Additional info
    notes: z.string().optional(),
    confirmationNumber: z.string().optional(),
    cost: z.number().nonnegative().optional(),
    isReservation: z.boolean().default(false),
    isFlexible: z.boolean().default(false),
    priority: z.number().int().min(1).max(5).default(3),
    color: z.string().optional(),
    imageUrl: z.string().url().optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
});

export type ItineraryItem = z.infer<typeof itineraryItemSchema>;

// Itinerary schema for Firebase Firestore
export const itinerarySchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    startDate: timestampSchema,
    endDate: timestampSchema,
    destination: z.string().optional(),
    resortId: z.string().optional(),
    vacationId: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    isPublic: z.boolean().default(false),
    isShared: z.boolean().default(false),
    sharedWith: z.array(z.string()).optional(), // Array of user IDs
    status: z.enum(['draft', 'planning', 'finalized', 'active', 'completed', 'archived']).default('draft'),
    tags: z.array(z.string()).optional(),
    imageUrl: z.string().url().optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    lastOptimizedAt: timestampSchema.optional(),
});

// Type definition derived from the schema
export type Itinerary = z.infer<typeof itinerarySchema>;

// Create itinerary input schema
export const createItinerarySchema = itinerarySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastOptimizedAt: true,
}).partial({
    destination: true,
    resortId: true,
    vacationId: true,
    description: true,
    notes: true,
    isPublic: true,
    isShared: true,
    sharedWith: true,
    status: true,
    tags: true,
    imageUrl: true,
});

export type CreateItineraryInput = z.infer<typeof createItinerarySchema>;

// Update itinerary input schema
export const updateItinerarySchema = itinerarySchema.partial().omit({
    id: true,
    userId: true,
    createdAt: true,
});

export type UpdateItineraryInput = z.infer<typeof updateItinerarySchema>;

// Create itinerary item input schema
export const createItineraryItemSchema = itineraryItemSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    description: true,
    location: true,
    attractionId: true,
    restaurantId: true,
    resortId: true,
    travelType: true,
    departureLocation: true,
    arrivalLocation: true,
    notes: true,
    confirmationNumber: true,
    cost: true,
    isReservation: true,
    isFlexible: true,
    priority: true,
    color: true,
    imageUrl: true,
});

export type CreateItineraryItemInput = z.infer<typeof createItineraryItemSchema>;

// Update itinerary item input schema
export const updateItineraryItemSchema = itineraryItemSchema.partial().omit({
    id: true,
    itineraryId: true,
    createdAt: true,
});

export type UpdateItineraryItemInput = z.infer<typeof updateItineraryItemSchema>;

// Itinerary response schema (what's returned to clients)
export const itineraryResponseSchema = itinerarySchema.extend({
    // Convert timestamps to ISO strings for client response
    startDate: z.string(),
    endDate: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    lastOptimizedAt: z.string().optional(),
});

export type ItineraryResponse = z.infer<typeof itineraryResponseSchema>;

// Itinerary item response schema
export const itineraryItemResponseSchema = itineraryItemSchema.extend({
    // Convert timestamps to ISO strings for client response
    startTime: z.string(),
    endTime: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type ItineraryItemResponse = z.infer<typeof itineraryItemResponseSchema>;