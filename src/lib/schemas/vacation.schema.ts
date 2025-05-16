import { z } from 'zod';
import { timestampSchema } from './user.schema';

// Vacation status enum
export const VacationStatusEnum = z.enum([
    'planning',
    'confirmed',
    'active',
    'completed',
    'cancelled'
]);

export type VacationStatus = z.infer<typeof VacationStatusEnum>;

// Vacation schema for Firebase Firestore
export const vacationSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    startDate: timestampSchema,
    endDate: timestampSchema,
    destination: z.string().min(1),
    userId: z.string().min(1),
    groupId: z.string().optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    imageUrl: z.string().url().optional(),
    notes: z.string().optional(),
    status: VacationStatusEnum,
    isPublic: z.boolean().default(false),
    budget: z.number().nonnegative().optional(),
    participants: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

// Type definition derived from the schema
export type Vacation = z.infer<typeof vacationSchema>;

// Create vacation input schema
export const createVacationSchema = vacationSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    imageUrl: true,
    notes: true,
    isPublic: true,
    budget: true,
    participants: true,
    tags: true,
});

export type CreateVacationInput = z.infer<typeof createVacationSchema>;

// Update vacation input schema
export const updateVacationSchema = vacationSchema.partial().omit({
    id: true,
    userId: true,
    createdAt: true,
});

export type UpdateVacationInput = z.infer<typeof updateVacationSchema>;

// Vacation response schema (what's returned to clients)
export const vacationResponseSchema = vacationSchema.extend({
    // Convert timestamps to ISO strings for client response
    startDate: z.string(),
    endDate: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type VacationResponse = z.infer<typeof vacationResponseSchema>;