import { z } from 'zod';
import { timestampSchema } from './user.schema';

// Resort category enum
export const resortCategoryEnum = z.enum([
    'value',
    'moderate',
    'deluxe',
    'villa',
    'campground',
    'partner'
]);

export type ResortCategory = z.infer<typeof resortCategoryEnum>;

// Amenity schema
export const amenitySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.enum(['pool', 'dining', 'recreation', 'transportation', 'shopping', 'service', 'other']).default('other'),
    imageUrl: z.string().url().optional(),
    isHighlighted: z.boolean().default(false),
});

export type Amenity = z.infer<typeof amenitySchema>;

// Room type schema
export const roomTypeSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    maxOccupancy: z.number().int().positive(),
    bedType: z.enum(['king', 'queen', 'double', 'twin', 'sofa', 'bunk', 'other']).array(),
    sqFt: z.number().int().positive().optional(),
    imageUrl: z.string().url().optional(),
    price: z.object({
        min: z.number().nonnegative().optional(),
        max: z.number().nonnegative().optional(),
    }).optional(),
    isAccessible: z.boolean().default(false),
    amenities: z.array(z.string()).optional(),
});

export type RoomType = z.infer<typeof roomTypeSchema>;

// Resort schema for Firebase Firestore
export const resortSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
    category: resortCategoryEnum,
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string().default('USA'),
    }),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
    phoneNumber: z.string().optional(),
    amenities: z.array(amenitySchema).optional(),
    roomTypes: z.array(roomTypeSchema).optional(),
    imageUrl: z.string().url().optional(),
    galleryImages: z.array(z.string().url()).optional(),
    logoUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    isActive: z.boolean().default(true),
    nearbyParks: z.array(z.string()).optional(), // Array of park IDs
    transportationOptions: z.array(z.string()).optional(),
    checkInTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default('16:00'), // HH:MM format
    checkOutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default('11:00'), // HH:MM format
    starRating: z.number().min(1).max(5).optional(),
    tags: z.array(z.string()).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    lastSyncedAt: timestampSchema.optional(),
});

// Type definition derived from the schema
export type Resort = z.infer<typeof resortSchema>;

// Create resort input schema
export const createResortSchema = resortSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastSyncedAt: true,
}).partial({
    shortDescription: true,
    phoneNumber: true,
    amenities: true,
    roomTypes: true,
    imageUrl: true,
    galleryImages: true,
    logoUrl: true,
    websiteUrl: true,
    isActive: true,
    nearbyParks: true,
    transportationOptions: true,
    checkInTime: true,
    checkOutTime: true,
    starRating: true,
    tags: true,
});

export type CreateResortInput = z.infer<typeof createResortSchema>;

// Update resort input schema
export const updateResortSchema = resortSchema.partial().omit({
    id: true,
    createdAt: true,
});

export type UpdateResortInput = z.infer<typeof updateResortSchema>;

// Resort response schema (what's returned to clients)
export const resortResponseSchema = resortSchema.extend({
    // Convert timestamps to ISO strings for client response
    createdAt: z.string(),
    updatedAt: z.string(),
    lastSyncedAt: z.string().optional(),
});

export type ResortResponse = z.infer<typeof resortResponseSchema>;