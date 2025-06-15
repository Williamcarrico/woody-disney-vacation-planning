/**
 * React hooks for fetching and managing Disney park data
 */

import type { DisneyPark, ParkFilters, AttractionFilters, DiningFilters } from '@/types/parks'
import { createQueryHook, createApiFetcher } from '@/lib/api/query-factory'

interface AttractionWithParkInfo {
  parkId: string
  parkName: string
}

interface DiningWithParkInfo {
  parkId: string
  parkName: string
  type: 'tableService' | 'quickService' | 'snacks'
}

type AttractionResult = Array<DisneyPark['attractions'][0] & AttractionWithParkInfo>
type DiningResult = Array<
  (DisneyPark['dining']['tableService'][0] | DisneyPark['dining']['quickService'][0] | DisneyPark['dining']['snacks'][0])
  & DiningWithParkInfo
>

interface ParkStats {
  totalAttractions: number
  totalDining: number
  totalLands: number
  mustDoAttractions: number
  lightningLaneAttractions: number
}

// Create fetchers for each endpoint
const parksFetcher = createApiFetcher<DisneyPark[], ParkFilters>(
  '/api/parks',
  (filters) => {
    const params = new URLSearchParams()
    if (filters?.searchTerm) params.set('searchTerm', filters.searchTerm)
    if (filters?.hasAttraction) params.set('hasAttraction', filters.hasAttraction)
    if (filters?.hasLand) params.set('hasLand', filters.hasLand)
    if (filters?.operatingStatus) params.set('operatingStatus', filters.operatingStatus)
    return params
  }
)

const parkFetcher = createApiFetcher<DisneyPark, string>(
  '/api/parks',
  (parkId) => new URLSearchParams()
)

const attractionsFetcher = createApiFetcher<AttractionResult, AttractionFilters>(
  '/api/attractions',
  (filters) => {
    const params = new URLSearchParams()
    if (filters?.parkId) params.set('parkId', filters.parkId)
    if (filters?.landId) params.set('landId', filters.landId)
    if (filters?.type) params.set('type', filters.type)
    if (filters?.thrillLevel !== undefined) params.set('thrillLevel', filters.thrillLevel.toString())
    if (filters?.heightRequirement) params.set('heightRequirement', 'true')
    if (filters?.lightningLane) params.set('lightningLane', 'true')
    if (filters?.mustDo) params.set('mustDo', 'true')
    if (filters?.ageGroup) params.set('ageGroup', filters.ageGroup)
    return params
  }
)

const diningFetcher = createApiFetcher<DiningResult, DiningFilters>(
  '/api/dining',
  (filters) => {
    const params = new URLSearchParams()
    if (filters?.parkId) params.set('parkId', filters.parkId)
    if (filters?.landId) params.set('landId', filters.landId)
    if (filters?.type) params.set('type', filters.type)
    if (filters?.cuisine) params.set('cuisine', filters.cuisine)
    if (filters?.priceRange) params.set('priceRange', filters.priceRange)
    if (filters?.characterDining) params.set('characterDining', 'true')
    if (filters?.mobileOrder) params.set('mobileOrder', 'true')
    if (filters?.mealPeriod) params.set('mealPeriod', filters.mealPeriod)
    return params
  }
)

const parkStatsFetcher = createApiFetcher<ParkStats, string>(
  '/api/parks',
  (parkId) => new URLSearchParams()
)

/**
 * Hook to fetch all Disney parks with optional filtering
 */
export const useParks = createQueryHook<DisneyPark[], ParkFilters>(
  'parks',
  parksFetcher,
  { staleTime: 10 * 60 * 1000 } // 10 minutes
)

/**
 * Hook to fetch a specific Disney park by ID
 */
export function usePark(parkId: string | null) {
  return createQueryHook<DisneyPark, string>(
    'park',
    async (id) => {
      if (!id) throw new Error('Park ID is required')
      const response = await fetch(`/api/parks/${id}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch park')
      }
      
      return data.data
    }
  )(parkId || '', { enabled: !!parkId })
}

/**
 * Hook to search attractions across all parks
 */
export const useAttractions = createQueryHook<AttractionResult, AttractionFilters>(
  'attractions',
  attractionsFetcher,
  { staleTime: 5 * 60 * 1000 } // 5 minutes
)

/**
 * Hook to search dining options across all parks
 */
export const useDining = createQueryHook<DiningResult, DiningFilters>(
  'dining',
  diningFetcher,
  { staleTime: 5 * 60 * 1000 } // 5 minutes
)

/**
 * Hook to get park statistics
 */
export function useParkStats(parkId: string | null) {
  return createQueryHook<ParkStats, string>(
    'parkStats',
    async (id) => {
      if (!id) throw new Error('Park ID is required')
      const response = await fetch(`/api/parks/${id}/stats`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch park stats')
      }
      
      return data.data
    }
  )(parkId || '', { enabled: !!parkId })
}