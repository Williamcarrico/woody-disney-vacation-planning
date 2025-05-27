import { useState, useEffect, useMemo, useCallback } from 'react'
import { DisneyRestaurant, DiningFilters } from '@/types/dining'

interface UseRestaurantsOptions {
    filters?: DiningFilters
    sortBy?: string
    limit?: number
    offset?: number
    enabled?: boolean
}

interface UseRestaurantsResult {
    restaurants: DisneyRestaurant[]
    isLoading: boolean
    error: string | null
    stats: {
        total: number
        returned: number
        openNow: number
        characterDining: number
        acceptsReservations: number
        acceptsDiningPlan: number
        averageRating: number
        cuisineDistribution: Record<string, number>
        priceDistribution: Record<string, number>
    } | null
    refetch: () => Promise<void>
    hasMore: boolean
}

export function useRestaurants(options: UseRestaurantsOptions = {}): UseRestaurantsResult {
    const { filters = {}, sortBy = 'popular', limit, offset = 0, enabled = true } = options

    const [restaurants, setRestaurants] = useState<DisneyRestaurant[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<UseRestaurantsResult['stats']>(null)
    const [hasMore, setHasMore] = useState(false)

    // Create query string from filters and options
    const queryString = useMemo(() => {
        const params = new URLSearchParams()

        if (filters.searchQuery) params.set('search', filters.searchQuery)
        if (filters.parkIds?.length) params.set('parks', filters.parkIds.join(','))
        if (filters.cuisineTypes?.length) params.set('cuisines', filters.cuisineTypes.join(','))
        if (filters.serviceTypes?.length) params.set('serviceTypes', filters.serviceTypes.join(','))
        if (filters.diningExperiences?.length) params.set('experiences', filters.diningExperiences.join(','))
        if (filters.priceRanges?.length) params.set('priceRanges', filters.priceRanges.join(','))
        if (filters.specialFeatures?.length) params.set('features', filters.specialFeatures.join(','))
        if (filters.hasCharacterDining) params.set('characterDining', 'true')
        if (filters.acceptsDiningPlan) params.set('diningPlan', 'true')
        if (filters.acceptsReservations) params.set('reservations', 'true')
        if (filters.openNow) params.set('openNow', 'true')
        if (filters.rating) params.set('rating', filters.rating.toString())

        params.set('sortBy', sortBy)
        if (limit) params.set('limit', limit.toString())
        if (offset > 0) params.set('offset', offset.toString())

        return params.toString()
    }, [filters, sortBy, limit, offset])

    const fetchRestaurants = useCallback(async () => {
        if (!enabled) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/restaurants?${queryString}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch restaurants')
            }

            if (result.success) {
                setRestaurants(result.data)
                setStats(result.stats)
                setHasMore(result.pagination?.hasMore || false)
            } else {
                throw new Error(result.error || 'Unknown error occurred')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants'
            setError(errorMessage)
            console.error('Error fetching restaurants:', err)
        } finally {
            setIsLoading(false)
        }
    }, [queryString, enabled])

    useEffect(() => {
        fetchRestaurants()
    }, [fetchRestaurants])

    return {
        restaurants,
        isLoading,
        error,
        stats,
        refetch: fetchRestaurants,
        hasMore
    }
}

interface UseRestaurantOptions {
    restaurantId: string
    enabled?: boolean
}

interface UseRestaurantResult {
    restaurant: DisneyRestaurant | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useRestaurant(options: UseRestaurantOptions): UseRestaurantResult {
    const { restaurantId, enabled = true } = options

    const [restaurant, setRestaurant] = useState<DisneyRestaurant | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRestaurant = useCallback(async () => {
        if (!enabled || !restaurantId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/restaurants/${restaurantId}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch restaurant')
            }

            if (result.success) {
                setRestaurant(result.data)
            } else {
                throw new Error(result.error || 'Unknown error occurred')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurant'
            setError(errorMessage)
            console.error('Error fetching restaurant:', err)
        } finally {
            setIsLoading(false)
        }
    }, [restaurantId, enabled])

    useEffect(() => {
        fetchRestaurant()
    }, [fetchRestaurant])

    return {
        restaurant,
        isLoading,
        error,
        refetch: fetchRestaurant
    }
}

// Hook for restaurant recommendations
interface UseRestaurantRecommendationsOptions {
    userPreferences?: {
        cuisineTypes?: string[]
        priceRange?: string[]
        hasCharacterDining?: boolean
        parkLocation?: string
        partySize?: number
        mealTime?: 'breakfast' | 'lunch' | 'dinner'
    }
    limit?: number
    enabled?: boolean
}

interface UseRestaurantRecommendationsResult {
    recommendations: DisneyRestaurant[]
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useRestaurantRecommendations(
    options: UseRestaurantRecommendationsOptions = {}
): UseRestaurantRecommendationsResult {
    const { userPreferences = {}, limit = 10, enabled = true } = options

    const [recommendations, setRecommendations] = useState<DisneyRestaurant[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRecommendations = useCallback(async () => {
        if (!enabled) return

        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()

            if (userPreferences.cuisineTypes?.length) {
                params.set('cuisines', userPreferences.cuisineTypes.join(','))
            }
            if (userPreferences.priceRange?.length) {
                params.set('priceRanges', userPreferences.priceRange.join(','))
            }
            if (userPreferences.hasCharacterDining) {
                params.set('characterDining', 'true')
            }
            if (userPreferences.parkLocation) {
                params.set('parks', userPreferences.parkLocation)
            }

            params.set('sortBy', 'popular')
            params.set('limit', limit.toString())

            const response = await fetch(`/api/restaurants?${params.toString()}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch recommendations')
            }

            if (result.success) {
                setRecommendations(result.data)
            } else {
                throw new Error(result.error || 'Unknown error occurred')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations'
            setError(errorMessage)
            console.error('Error fetching recommendations:', err)
        } finally {
            setIsLoading(false)
        }
    }, [userPreferences, limit, enabled])

    useEffect(() => {
        fetchRecommendations()
    }, [fetchRecommendations])

    return {
        recommendations,
        isLoading,
        error,
        refetch: fetchRecommendations
    }
}