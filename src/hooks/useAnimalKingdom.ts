'use client'

import { useQuery } from '@tanstack/react-query'
import type { EntityType } from '@/types/themeparks'

// Type definitions for Animal Kingdom data
export interface AnimalKingdomOverview {
    park: {
        id: string
        name: string
        slug: string
        location: {
            latitude: number
            longitude: number
        }
        timezone: string
    }
    currentStatus: {
        isOpen: boolean
        crowdLevel: number
        averageWaitTime: number
        totalAttractions: number
        operatingAttractions: number
        weather: {
            temp: number
            condition: string
        }
    }
    todaySchedule: any
    lands: string[]
}

export interface AnimalKingdomAttraction {
    id: string
    name: string
    slug: string | null
    land: string
    type: string
    status: string
    waitTime: number
    lightningLane: boolean
    lightningLanePrice?: {
        amount: number
        currency: string
    }
    height: string | null
    location?: {
        latitude: number
        longitude: number
    }
    nextShowtime?: any
    operatingHours?: any
}

export interface AnimalKingdomDining {
    id: string
    name: string
    slug: string | null
    type: 'table-service' | 'quick-service' | 'snack'
    land: string
    status: string
    location?: {
        latitude: number
        longitude: number
    }
    operatingHours?: any[]
}

export interface AnimalKingdomEntertainment {
    id: string
    name: string
    slug: string | null
    location: string
    status: string
    showtimes: any[]
    nextShowtime?: any
}

// Fetch functions
async function fetchAnimalKingdomData(type: string) {
    const response = await fetch(`/api/parks/animal-kingdom?type=${type}`)
    if (!response.ok) {
        throw new Error('Failed to fetch Animal Kingdom data')
    }
    return response.json()
}

// Hook for overview data
export function useAnimalKingdomOverview() {
    return useQuery<AnimalKingdomOverview>({
        queryKey: ['animal-kingdom', 'overview'],
        queryFn: () => fetchAnimalKingdomData('overview'),
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Hook for attractions data
export function useAnimalKingdomAttractions() {
    return useQuery<{ attractions: AnimalKingdomAttraction[], lastUpdate: string }>({
        queryKey: ['animal-kingdom', 'attractions'],
        queryFn: () => fetchAnimalKingdomData('attractions'),
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Hook for dining data
export function useAnimalKingdomDining() {
    return useQuery<{ dining: AnimalKingdomDining[], lastUpdate: string }>({
        queryKey: ['animal-kingdom', 'dining'],
        queryFn: () => fetchAnimalKingdomData('dining'),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Hook for entertainment data
export function useAnimalKingdomEntertainment() {
    return useQuery<{ entertainment: AnimalKingdomEntertainment[], lastUpdate: string }>({
        queryKey: ['animal-kingdom', 'entertainment'],
        queryFn: () => fetchAnimalKingdomData('entertainment'),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Hook for schedule data
export function useAnimalKingdomSchedule(year?: number, month?: number) {
    const params = new URLSearchParams({ type: 'schedule' })
    if (year) params.append('year', year.toString())
    if (month) params.append('month', month.toString())

    return useQuery({
        queryKey: ['animal-kingdom', 'schedule', year, month],
        queryFn: async () => {
            const response = await fetch(`/api/parks/animal-kingdom?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch schedule')
            }
            return response.json()
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
    })
}

// Hook for live data
export function useAnimalKingdomLive() {
    return useQuery({
        queryKey: ['animal-kingdom', 'live'],
        queryFn: () => fetchAnimalKingdomData('live'),
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60 * 1000, // Auto-refresh every minute
    })
}

// Hook for map data
export function useAnimalKingdomMap() {
    return useQuery({
        queryKey: ['animal-kingdom', 'map'],
        queryFn: () => fetchAnimalKingdomData('map'),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Hook for WDW context
export function useWDWContext() {
    return useQuery({
        queryKey: ['animal-kingdom', 'wdw-context'],
        queryFn: () => fetchAnimalKingdomData('wdw-context'),
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
    })
}