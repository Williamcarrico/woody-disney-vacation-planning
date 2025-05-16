import { z } from 'zod';
import { timestampSchema } from './user.schema';

// Ride type enum
export const rideTypeEnum = z.enum([
    'thrill',
    'family',
    'kids',
    'water',
    'slow',
    'dark',
    'show',
    'virtual',
    'interactive',
    'character',
    'transport',
    'other'
]);

export type RideType = z.infer<typeof rideTypeEnum>;

// Height restriction schema
export const heightRestrictionSchema = z.object({
    minHeightInches: z.number().int().nonnegative().optional(),
    maxHeightInches: z.number().int().nonnegative().optional(),
    adultRequiredUnderInches: z.number().int().nonnegative().optional(),
});

export type HeightRestriction = z.infer<typeof heightRestrictionSchema>;

// Wait time history entry schema
export const waitTimeHistorySchema = z.object({
    timestamp: timestampSchema,
    waitTimeMinutes: z.number().int().nonnegative(),
    isOperating: z.boolean().default(true),
    isDowntime: z.boolean().default(false),
});

export type WaitTimeHistory = z.infer<typeof waitTimeHistorySchema>;

// Attraction schema for Firebase Firestore
export const attractionSchema = z.object({
    id: z.string().min(1),
    parkId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
    rideType: rideTypeEnum,
    currentWaitTime: z.number().int().nonnegative().optional(),
    isOperating: z.boolean().default(true),
    isFastPassAvailable: z.boolean().default(false),
    isSingleRider: z.boolean().default(false),
    heightRestriction: heightRestrictionSchema.optional(),
    location: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        areaName: z.string().optional(),
    }).optional(),
    durationMinutes: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    userRating: z.number().min(0).max(5).optional(),
    tags: z.array(z.string()).optional(),
    lastUpdated: timestampSchema,
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    waitTimeHistory: z.array(waitTimeHistorySchema).optional(),
    isWheelchairAccessible: z.boolean().default(false),
    hasPhotoSpot: z.boolean().default(false),
    hasInRidePhoto: z.boolean().default(false),
    isPaid: z.boolean().default(false),
    considerForItinerary: z.boolean().default(true),
});

// Type definition derived from the schema
export type Attraction = z.infer<typeof attractionSchema>;

// Create attraction input schema
export const createAttractionSchema = attractionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastUpdated: true,
    waitTimeHistory: true,
}).partial({
    shortDescription: true,
    currentWaitTime: true,
    isOperating: true,
    isFastPassAvailable: true,
    isSingleRider: true,
    heightRestriction: true,
    location: true,
    durationMinutes: true,
    imageUrl: true,
    thumbnailUrl: true,
    userRating: true,
    tags: true,
    isWheelchairAccessible: true,
    hasPhotoSpot: true,
    hasInRidePhoto: true,
    isPaid: true,
    considerForItinerary: true,
});

export type CreateAttractionInput = z.infer<typeof createAttractionSchema>;

// Update attraction input schema
export const updateAttractionSchema = attractionSchema.partial().omit({
    id: true,
    parkId: true,
    createdAt: true,
});

export type UpdateAttractionInput = z.infer<typeof updateAttractionSchema>;

// Attraction response schema (what's returned to clients)
export const attractionResponseSchema = attractionSchema.extend({
    // Convert timestamps to ISO strings for client response
    lastUpdated: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
}).omit({
    waitTimeHistory: true, // Typically don't return the full history
});

export type AttractionResponse = z.infer<typeof attractionResponseSchema>;