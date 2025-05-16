import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Firebase timestamp validation
export const timestampSchema = z.custom<Timestamp>(
    (val) => val instanceof Timestamp,
    { message: 'Expected Firebase Timestamp' }
);

// User schema for Firebase Firestore
export const userSchema = z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    email: z.string().email(),
    photoUrl: z.string().url().optional(),
    emailVerified: z.boolean().default(false),
    preferences: z.record(z.any()).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    lastLoginAt: timestampSchema.optional(),
    isActive: z.boolean().default(true),
    role: z.enum(['user', 'admin']).default('user'),
});

// Type definition derived from the schema
export type User = z.infer<typeof userSchema>;

// Create user input schema
export const createUserSchema = userSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
}).partial({
    emailVerified: true,
    preferences: true,
    isActive: true,
    role: true,
});

// Update user input schema
export const updateUserSchema = userSchema.partial().omit({
    id: true,
    createdAt: true
});

// User response schema (what's returned to clients)
export const userResponseSchema = userSchema.omit({
    // Any sensitive fields to exclude
}).extend({
    // Convert timestamps to ISO strings for client response
    createdAt: z.string(),
    updatedAt: z.string(),
    lastLoginAt: z.string().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;