import { z } from 'zod';
import { timestampSchema } from './user.schema';

// Vacation party schema for Firebase Firestore
export const vacationPartySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    vacationId: z.string().min(1),
    ownerId: z.string().min(1),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().default(true),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
});

export type VacationParty = z.infer<typeof vacationPartySchema>;

// Vacation party member role
export const memberRoleEnum = z.enum([
    'owner',
    'admin',
    'member',
    'viewer'
]);

export type MemberRole = z.infer<typeof memberRoleEnum>;

// Vacation party member schema
export const vacationPartyMemberSchema = z.object({
    id: z.string().min(1),
    vacationPartyId: z.string().min(1),
    userId: z.string().min(1),
    role: memberRoleEnum.default('member'),
    displayName: z.string().optional(),
    photoUrl: z.string().url().optional(),
    joinedAt: timestampSchema,
    lastActiveAt: timestampSchema.optional(),
    status: z.enum(['invited', 'active', 'inactive', 'left', 'removed']).default('invited'),
    preferences: z.record(z.any()).optional(),
});

export type VacationPartyMember = z.infer<typeof vacationPartyMemberSchema>;

// Message schema for vacation party chat
export const vacationPartyMessageSchema = z.object({
    id: z.string().min(1),
    vacationPartyId: z.string().min(1),
    userId: z.string().min(1),
    userDisplayName: z.string().optional(),
    userPhotoUrl: z.string().url().optional(),
    content: z.string().min(1),
    contentType: z.enum(['text', 'image', 'link', 'location', 'itinerary']).default('text'),
    metadata: z.record(z.any()).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema.optional(),
    isEdited: z.boolean().default(false),
    isDeleted: z.boolean().default(false),
    replyToId: z.string().optional(),
    reactions: z.record(z.array(z.string())).optional(), // Map of reaction type to array of user IDs
});

export type VacationPartyMessage = z.infer<typeof vacationPartyMessageSchema>;

// Location sharing schema
export const locationShareSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    vacationPartyId: z.string().min(1),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracy: z.number().optional(),
        altitude: z.number().optional(),
        heading: z.number().optional(),
        speed: z.number().optional(),
    }),
    isSharing: z.boolean().default(true),
    timestamp: timestampSchema,
    expiresAt: timestampSchema.optional(),
    device: z.string().optional(),
});

export type LocationShare = z.infer<typeof locationShareSchema>;

// Create vacation party input schema
export const createVacationPartySchema = vacationPartySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    description: true,
    imageUrl: true,
    isActive: true,
});

export type CreateVacationPartyInput = z.infer<typeof createVacationPartySchema>;

// Update vacation party input schema
export const updateVacationPartySchema = vacationPartySchema.partial().omit({
    id: true,
    vacationId: true,
    ownerId: true,
    createdAt: true,
});

export type UpdateVacationPartyInput = z.infer<typeof updateVacationPartySchema>;

// Create vacation party member input schema
export const createVacationPartyMemberSchema = vacationPartyMemberSchema.omit({
    id: true,
    joinedAt: true,
    lastActiveAt: true,
}).partial({
    role: true,
    displayName: true,
    photoUrl: true,
    status: true,
    preferences: true,
});

export type CreateVacationPartyMemberInput = z.infer<typeof createVacationPartyMemberSchema>;

// Create message input schema
export const createMessageSchema = vacationPartyMessageSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isEdited: true,
    isDeleted: true,
    reactions: true,
}).partial({
    userDisplayName: true,
    userPhotoUrl: true,
    contentType: true,
    metadata: true,
    replyToId: true,
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

// Vacation party response schema
export const vacationPartyResponseSchema = vacationPartySchema.extend({
    // Convert timestamps to ISO strings for client response
    createdAt: z.string(),
    updatedAt: z.string(),
    // Add extra fields for response
    memberCount: z.number().int().nonnegative().optional(),
});

export type VacationPartyResponse = z.infer<typeof vacationPartyResponseSchema>;

// Vacation party member response schema
export const vacationPartyMemberResponseSchema = vacationPartyMemberSchema.extend({
    // Convert timestamps to ISO strings for client response
    joinedAt: z.string(),
    lastActiveAt: z.string().optional(),
});

export type VacationPartyMemberResponse = z.infer<typeof vacationPartyMemberResponseSchema>;

// Message response schema
export const messageResponseSchema = vacationPartyMessageSchema.extend({
    // Convert timestamps to ISO strings for client response
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;