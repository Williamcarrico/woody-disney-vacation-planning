import { z } from 'zod';
import { timestampSchema } from './user.schema';

// Cuisine type enum
export const cuisineTypeEnum = z.enum([
    'american',
    'italian',
    'mexican',
    'asian',
    'seafood',
    'steakhouse',
    'french',
    'mediterranean',
    'vegetarian',
    'vegan',
    'buffet',
    'character',
    'dessert',
    'cafe',
    'quick_service',
    'table_service',
    'signature_dining',
    'bar',
    'lounge',
    'other'
]);

export type CuisineType = z.infer<typeof cuisineTypeEnum>;

// Price range enum
export const priceRangeEnum = z.enum([
    '$', // Under $15
    '$$', // $15-35
    '$$$', // $36-60
    '$$$$' // Over $60
]);

export type PriceRange = z.infer<typeof priceRangeEnum>;

// Menu item schema
export const menuItemSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    category: z.string().optional(), // appetizer, entree, dessert, etc.
    dietary: z.array(z.enum([
        'vegetarian',
        'vegan',
        'gluten_free',
        'dairy_free',
        'nut_free',
        'halal',
        'kosher',
        'keto',
        'paleo'
    ])).optional(),
    isPopular: z.boolean().default(false),
    isKidsFriendly: z.boolean().default(false),
    allergens: z.array(z.string()).optional(),
});

export type MenuItem = z.infer<typeof menuItemSchema>;

// Restaurant review schema
export const restaurantReviewSchema = z.object({
    userId: z.string().min(1),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    visitDate: timestampSchema.optional(),
    createdAt: timestampSchema,
});

export type RestaurantReview = z.infer<typeof restaurantReviewSchema>;

// Restaurant schema for Firebase Firestore
export const restaurantSchema = z.object({
    id: z.string().min(1),
    parkId: z.string().optional(), // Optional as restaurant could be in Disney Springs or Resort
    resortId: z.string().optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
    cuisineType: z.array(cuisineTypeEnum).min(1),
    priceRange: priceRangeEnum,
    location: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        areaName: z.string().optional(),
    }).optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    operatingHours: z.record(z.string()).optional(), // Map day of week to hours string
    phoneNumber: z.string().optional(),
    acceptsReservations: z.boolean().default(false),
    reservationUrl: z.string().url().optional(),
    hasCharacterDining: z.boolean().default(false),
    requiresPrePay: z.boolean().default(false),
    isDiningPlanAccepted: z.boolean().default(true),
    menu: z.array(menuItemSchema).optional(),
    averageRating: z.number().min(0).max(5).optional(),
    reviews: z.array(restaurantReviewSchema).optional(),
    imageUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    galleryImages: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    // Metadata
    isQuickService: z.boolean().default(false),
    hasTableService: z.boolean().default(false),
    hasMobileOrdering: z.boolean().default(false),
    hasDiningPlan: z.boolean().default(false),
    isPopular: z.boolean().default(false),
    requiresReservation: z.boolean().default(false),
    isKidsFriendly: z.boolean().default(false),
});

// Type definition derived from the schema
export type Restaurant = z.infer<typeof restaurantSchema>;

// Create restaurant input schema
export const createRestaurantSchema = restaurantSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    reviews: true,
    averageRating: true,
}).partial({
    shortDescription: true,
    location: true,
    address: true,
    operatingHours: true,
    phoneNumber: true,
    acceptsReservations: true,
    reservationUrl: true,
    hasCharacterDining: true,
    requiresPrePay: true,
    isDiningPlanAccepted: true,
    menu: true,
    imageUrl: true,
    thumbnailUrl: true,
    galleryImages: true,
    tags: true,
    isQuickService: true,
    hasTableService: true,
    hasMobileOrdering: true,
    hasDiningPlan: true,
    isPopular: true,
    requiresReservation: true,
    isKidsFriendly: true,
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;

// Update restaurant input schema
export const updateRestaurantSchema = restaurantSchema.partial().omit({
    id: true,
    createdAt: true,
    reviews: true, // Reviews should be managed through a separate API
});

export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;

// Restaurant response schema (what's returned to clients)
export const restaurantResponseSchema = restaurantSchema.omit({
    reviews: true, // Don't return all reviews by default
}).extend({
    // Convert timestamps to ISO strings for client response
    createdAt: z.string(),
    updatedAt: z.string(),
    // Only return count of reviews and latest few reviews
    reviewCount: z.number().int().nonnegative().optional(),
    latestReviews: z.array(z.object({
        userId: z.string(),
        rating: z.number(),
        comment: z.string().optional(),
        visitDate: z.string().optional(),
        createdAt: z.string(),
    })).optional().default([]),
});

export type RestaurantResponse = z.infer<typeof restaurantResponseSchema>;