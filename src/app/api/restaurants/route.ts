import { NextRequest, NextResponse } from 'next/server'
import { allRestaurants } from '@/lib/data/restaurants'
import { filterRestaurants, sortRestaurants } from '@/lib/utils/restaurant'
import { DiningFilters, CuisineType, ServiceType, DiningExperience, PriceRange, SpecialFeature } from '@/types/dining'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse query parameters
        const filters: DiningFilters = {
            searchQuery: searchParams.get('search') || undefined,
            parkIds: searchParams.get('parks')?.split(',').filter(Boolean) || undefined,
            cuisineTypes: searchParams.get('cuisines')?.split(',').filter(Boolean) as CuisineType[] || undefined,
            serviceTypes: searchParams.get('serviceTypes')?.split(',').filter(Boolean) as ServiceType[] || undefined,
            diningExperiences: searchParams.get('experiences')?.split(',').filter(Boolean) as DiningExperience[] || undefined,
            priceRanges: searchParams.get('priceRanges')?.split(',').filter(Boolean) as PriceRange[] || undefined,
            specialFeatures: searchParams.get('features')?.split(',').filter(Boolean) as SpecialFeature[] || undefined,
            hasCharacterDining: searchParams.get('characterDining') === 'true',
            acceptsDiningPlan: searchParams.get('diningPlan') === 'true',
            acceptsReservations: searchParams.get('reservations') === 'true',
            openNow: searchParams.get('openNow') === 'true',
            rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
        }

        const sortBy = searchParams.get('sortBy') || 'popular'
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

        // Apply filters and sorting
        let restaurants = filterRestaurants(allRestaurants, filters)
        restaurants = sortRestaurants(restaurants, sortBy)

        // Apply pagination if limit is specified
        const total = restaurants.length
        if (limit) {
            restaurants = restaurants.slice(offset, offset + limit)
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
            averageRating: restaurants.reduce((sum, r) => sum + (r.averageRating || 0), 0) / restaurants.length || 0,
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

        return NextResponse.json({
            success: true,
            data: restaurants,
            stats,
            filters: filters,
            pagination: limit ? {
                offset,
                limit,
                total,
                hasMore: offset + limit < total
            } : null
        })

    } catch (error) {
        console.error('Error fetching restaurants:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch restaurants',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}