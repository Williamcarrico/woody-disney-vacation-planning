import { z } from 'zod';
import { timestampSchema } from './user.schema';

// Operating hour item schema
export const operatingHourItemSchema = z.object({
    dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM format
    closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM format
    isSpecialHours: z.boolean().default(false),
    specialDate: z.string().optional(), // ISO date format for special hours
    isClosed: z.boolean().default(false),
});

export type OperatingHourItem = z.infer<typeof operatingHourItemSchema>;

// Park schema for Firebase Firestore
export const parkSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().optional(),
    }),
    operatingHours: z.array(operatingHourItemSchema).optional(),
    timezone: z.string().default('America/New_York'),
    parkType: z.enum(['themepark', 'waterpark', 'resort', 'entertainment']).default('themepark'),
    imageUrl: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    isActive: z.boolean().default(true),
    tags: z.array(z.string()).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    lastSyncedAt: timestampSchema.optional(),
    resortId: z.string().optional(), // If the park belongs to a resort
});

// Type definition derived from the schema
export type Park = z.infer<typeof parkSchema>;

// Create park input schema
export const createParkSchema = parkSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastSyncedAt: true,
}).partial({
    shortDescription: true,
    operatingHours: true,
    timezone: true,
    parkType: true,
    imageUrl: true,
    logoUrl: true,
    websiteUrl: true,
    isActive: true,
    tags: true,
    resortId: true,
});

export type CreateParkInput = z.infer<typeof createParkSchema>;

// Update park input schema
export const updateParkSchema = parkSchema.partial().omit({
    id: true,
    createdAt: true,
});

export type UpdateParkInput = z.infer<typeof updateParkSchema>;

// Park response schema (what's returned to clients)
export const parkResponseSchema = parkSchema.extend({
    // Convert timestamps to ISO strings for client response
    createdAt: z.string(),
    updatedAt: z.string(),
    lastSyncedAt: z.string().optional(),
});

export type ParkResponse = z.infer<typeof parkResponseSchema>;