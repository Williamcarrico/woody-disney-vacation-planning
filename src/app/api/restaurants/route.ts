import { NextRequest } from 'next/server'
import { allRestaurants } from '@/lib/data/restaurants'
import { filterRestaurants, sortRestaurants } from '@/lib/utils/restaurant'
import { DiningFilters, CuisineType, ServiceType, DiningExperience, PriceRange, SpecialFeature } from '@/types/dining'
import { withErrorHandler } from '@/lib/api/error-handler'
import { validateQueryParams, sanitizeString, CommonSchemas } from '@/lib/api/validation'
import { successResponse } from '@/lib/api/response'
import { z } from 'zod'

// Validation schema for restaurant query parameters
const RestaurantQuerySchema = z.object({
    search: z.string().optional().transform(val => val ? sanitizeString(val, 200) : undefined),
    parks: z.string().optional().transform(val => val ? val.split(',').filter(Boolean) : undefined),
    cuisines: z.string().optional().transform(val => val ? val.split(',').filter(Boolean) as CuisineType[] : undefined),
    serviceTypes: z.string().optional().transform(val => val ? val.split(',').filter(Boolean) as ServiceType[] : undefined),
    experiences: z.string().optional().transform(val => val ? val.split(',').filter(Boolean) as DiningExperience[] : undefined),
    priceRanges: z.string().optional().transform(val => val ? val.split(',').filter(Boolean) as PriceRange[] : undefined),
    features: z.string().optional().transform(val => val ? val.split(',').filter(Boolean) as SpecialFeature[] : undefined),
    characterDining: z.string().optional().transform(val => val === 'true'),
    diningPlan: z.string().optional().transform(val => val === 'true'),
    reservations: z.string().optional().transform(val => val === 'true'),
    openNow: z.string().optional().transform(val => val === 'true'),
    rating: z.string().optional().transform(val => val ? Math.max(0, Math.min(5, parseFloat(val))) : undefined),
    sortBy: z.string().optional().default('popular'),
    limit: CommonSchemas.pagination.limit,
    offset: CommonSchemas.pagination.offset
})

export const GET = withErrorHandler(async (request: NextRequest) => {
    // Validate query parameters
    const query = validateQueryParams(request, RestaurantQuerySchema)

    // Build filters object
    const filters: DiningFilters = {
        searchQuery: query.search,
        parkIds: query.parks,
        cuisineTypes: query.cuisines,
        serviceTypes: query.serviceTypes,
        diningExperiences: query.experiences,
        priceRanges: query.priceRanges,
        specialFeatures: query.features,
        hasCharacterDining: query.characterDining || false,
        acceptsDiningPlan: query.diningPlan || false,
        acceptsReservations: query.reservations || false,
        openNow: query.openNow || false,
        rating: query.rating,
    }

    // Apply filters and sorting
    let restaurants = filterRestaurants(allRestaurants, filters)
    restaurants = sortRestaurants(restaurants, query.sortBy)

    // Apply pagination if limit is specified
    const total = restaurants.length
    if (query.limit) {
        restaurants = restaurants.slice(query.offset, query.offset + query.limit)
    }

    // Calculate statistics
    const stats = {
        total,
        returned: restaurants.length,
        openNow: restaurants.filter(r => {
            try {
                const now = new Date()
                const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
                const hours = r.operatingHours[dayName]
                return hours && hours !== "Closed"
            } catch {
                return false
            }
        }).length,
        characterDining: restaurants.filter(r => r.characterDining?.hasCharacterDining).length,
        acceptsReservations: restaurants.filter(r => r.reservationInfo.acceptsReservations).length,
        acceptsDiningPlan: restaurants.filter(r => r.diningPlanInfo.acceptsDiningPlan).length,
        averageRating: restaurants.length > 0 
            ? restaurants.reduce((sum, r) => sum + (r.averageRating || 0), 0) / restaurants.length 
            : 0,
        cuisineDistribution: restaurants.reduce((acc, r) => {
            r.cuisineTypes.forEach(cuisine => {
                acc[cuisine] = (acc[cuisine] || 0) + 1
            })
            return acc
        }, {} as Record<string, number>),
        priceDistribution: restaurants.reduce((acc, r) => {
            acc[r.priceRange] = (acc[r.priceRange] || 0) + 1
            return acc
        }, {} as Record<string, number>)
    }

    const response = {
        data: restaurants,
        stats,
        filters: filters,
        pagination: query.limit ? {
            offset: query.offset,
            limit: query.limit,
            total,
            hasMore: query.offset + query.limit < total
        } : null
    }

    return successResponse(response)
})