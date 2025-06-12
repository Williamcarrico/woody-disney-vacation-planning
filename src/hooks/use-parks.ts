/**
 * React hooks for fetching and managing Disney park data
 */

import { useState, useEffect } from 'react'
import type { DisneyPark, ParkFilters, AttractionFilters, DiningFilters } from '@/types/parks'

interface ApiResponse<T> {
    success: boolean
    data: T
    total?: number
    error?: string
}

interface UseParksResult {
    parks: DisneyPark[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

interface UseAttractionResult {
    attractions: Array<DisneyPark['attractions'][0] & { parkId: string; parkName: string }>
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

interface UseDiningResult {
    dining: Array<
        (DisneyPark['dining']['tableService'][0] | DisneyPark['dining']['quickService'][0] | DisneyPark['dining']['snacks'][0])
        & { parkId: string; parkName: string; type: 'tableService' | 'quickService' | 'snacks' }
    >
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

/**
 * Hook to fetch all Disney parks with optional filtering
 */
export function useParks(filters?: ParkFilters): UseParksResult {
    const [parks, setParks] = useState<DisneyPark[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchParks = async () => {
        try {
            setLoading(true)
            setError(null)

            const searchParams = new URLSearchParams()
            if (filters?.searchTerm) searchParams.set('searchTerm', filters.searchTerm)
            if (filters?.hasAttraction) searchParams.set('hasAttraction', filters.hasAttraction)
            if (filters?.hasLand) searchParams.set('hasLand', filters.hasLand)
            if (filters?.operatingStatus) searchParams.set('operatingStatus', filters.operatingStatus)

            const url = `/api/parks${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
            const response = await fetch(url)
            const data: ApiResponse<DisneyPark[]> = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch parks')
            }

            setParks(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchParks()
    }, [filters?.searchTerm, filters?.hasAttraction, filters?.hasLand, filters?.operatingStatus])

    return {
        parks,
        loading,
        error,
        refetch: fetchParks
    }
}

/**
 * Hook to fetch a specific Disney park by ID
 */
export function usePark(parkId: string | null) {
    const [park, setPark] = useState<DisneyPark | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPark = async () => {
        if (!parkId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/parks/${parkId}`)
            const data: ApiResponse<DisneyPark> = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch park')
            }

            setPark(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPark()
    }, [parkId])

    return {
        park,
        loading,
        error,
        refetch: fetchPark
    }
}

/**
 * Hook to search attractions across all parks
 */
export function useAttractions(filters?: AttractionFilters): UseAttractionResult {
    const [attractions, setAttractions] = useState<UseAttractionResult['attractions']>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAttractions = async () => {
        try {
            setLoading(true)
            setError(null)

            const searchParams = new URLSearchParams()
            if (filters?.parkId) searchParams.set('parkId', filters.parkId)
            if (filters?.landId) searchParams.set('landId', filters.landId)
            if (filters?.type) searchParams.set('type', filters.type)
            if (filters?.thrillLevel !== undefined) searchParams.set('thrillLevel', filters.thrillLevel.toString())
            if (filters?.heightRequirement) searchParams.set('heightRequirement', 'true')
            if (filters?.lightningLane) searchParams.set('lightningLane', 'true')
            if (filters?.mustDo) searchParams.set('mustDo', 'true')
            if (filters?.ageGroup) searchParams.set('ageGroup', filters.ageGroup)

            const url = `/api/attractions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
            const response = await fetch(url)
            const data: ApiResponse<UseAttractionResult['attractions']> = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch attractions')
            }

            setAttractions(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAttractions()
    }, [
        filters?.parkId,
        filters?.landId,
        filters?.type,
        filters?.thrillLevel,
        filters?.heightRequirement,
        filters?.lightningLane,
        filters?.mustDo,
        filters?.ageGroup
    ])

    return {
        attractions,
        loading,
        error,
        refetch: fetchAttractions
    }
}

/**
 * Hook to search dining options across all parks
 */
export function useDining(filters?: DiningFilters): UseDiningResult {
    const [dining, setDining] = useState<UseDiningResult['dining']>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDining = async () => {
        try {
            setLoading(true)
            setError(null)

            const searchParams = new URLSearchParams()
            if (filters?.parkId) searchParams.set('parkId', filters.parkId)
            if (filters?.landId) searchParams.set('landId', filters.landId)
            if (filters?.type) searchParams.set('type', filters.type)
            if (filters?.cuisine) searchParams.set('cuisine', filters.cuisine)
            if (filters?.priceRange) searchParams.set('priceRange', filters.priceRange)
            if (filters?.characterDining) searchParams.set('characterDining', 'true')
            if (filters?.mobileOrder) searchParams.set('mobileOrder', 'true')
            if (filters?.mealPeriod) searchParams.set('mealPeriod', filters.mealPeriod)

            const url = `/api/dining${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
            const response = await fetch(url)
            const data: ApiResponse<UseDiningResult['dining']> = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch dining')
            }

            setDining(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDining()
    }, [
        filters?.parkId,
        filters?.landId,
        filters?.type,
        filters?.cuisine,
        filters?.priceRange,
        filters?.characterDining,
        filters?.mobileOrder,
        filters?.mealPeriod
    ])

    return {
        dining,
        loading,
        error,
        refetch: fetchDining
    }
}

/**
 * Hook to get park statistics
 */
export function useParkStats(parkId: string | null) {
    const [stats, setStats] = useState<{
        totalAttractions: number
        totalDining: number
        totalLands: number
        mustDoAttractions: number
        lightningLaneAttractions: number
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = async () => {
        if (!parkId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/parks/${parkId}/stats`)
            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch park stats')
            }

            setStats(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [parkId])

    return {
        stats,
        loading,
        error,
        refetch: fetchStats
    }
}