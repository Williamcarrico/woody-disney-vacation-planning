import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

// Types
export interface DashboardStats {
    totalVisits: number
    upcomingReservations: number
    completedAttractions: number
    totalSpent: number
    averageWaitTime: number
    stepsWalked: number
    photosCapture: number
    magicMoments: number
    friendsConnected: number
    achievementsUnlocked: number
    budgetRemaining: number
    fastPassesUsed: number
    currentParkCapacity: number
    favoriteAttraction: string
}

export interface UpcomingEvent {
    id: string
    title: string
    time: string
    location: string
    type: 'reservation' | 'fastpass' | 'show' | 'event' | 'lightning_lane'
    status: 'confirmed' | 'pending' | 'cancelled' | 'modified'
    participants?: number
    confirmationNumber?: string
    partyMembers?: string[]
    notes?: string
    reminders?: boolean
}

export interface Achievement {
    id: string
    title: string
    description: string
    category: 'attractions' | 'dining' | 'social' | 'exploration' | 'special'
    progress: number
    maxProgress: number
    isCompleted: boolean
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    unlockedAt?: Date
    points: number
    icon: string
    requirements: string[]
}

export interface WeatherData {
    current: {
        temperature: number
        condition: string
        humidity: number
        windSpeed: number
        uvIndex: number
        feelsLike: number
        visibility: number
        pressure: number
    }
    forecast: Array<{
        date: string
        high: number
        low: number
        condition: string
        precipitation: number
        windSpeed: number
        humidity: number
    }>
    alerts?: Array<{
        id: string
        title: string
        description: string
        severity: 'low' | 'moderate' | 'high' | 'severe'
        startTime: string
        endTime: string
    }>
}

export interface UserProfile {
    id: string
    name: string
    email: string
    avatar?: string
    preferences: {
        favoriteParks: string[]
        dietaryRestrictions: string[]
        accessibilityNeeds: string[]
        notificationSettings: {
            waitTimes: boolean
            reservations: boolean
            weather: boolean
            social: boolean
        }
    }
    currentVacation?: {
        id: string
        startDate: string
        endDate: string
        partySize: number
        resort?: string
        ticketType: string
    }
}

export interface PartyMember {
    id: string
    name: string
    relation: string
    age?: number
    avatar?: string
    preferences: {
        favoriteCharacters: string[]
        ridePreferences: string[]
        dietaryRestrictions: string[]
    }
}

interface DashboardDataState {
    stats: DashboardStats | null
    events: UpcomingEvent[]
    achievements: Achievement[]
    weather: WeatherData | null
    userProfile: UserProfile | null
    partyMembers: PartyMember[]
    isLoading: boolean
    errors: Record<string, string>
    lastUpdated: Date | null
}

// API endpoints configuration
const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    endpoints: {
        stats: '/user/stats',
        events: '/user/events',
        achievements: '/user/achievements',
        weather: '/weather/realtime',
        profile: '/user/profile',
        party: '/user/party'
    }
}

// Cache duration (5 minutes for most data, 1 minute for weather)
const CACHE_DURATION = {
    stats: 5 * 60 * 1000,
    events: 2 * 60 * 1000,
    achievements: 10 * 60 * 1000,
    weather: 1 * 60 * 1000,
    profile: 15 * 60 * 1000,
    party: 10 * 60 * 1000
}

// Memory cache
const cache = new Map<string, { data: any; timestamp: number; duration: number }>()

// Cache utilities
const getCachedData = (key: string) => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.duration) {
        return cached.data
    }
    cache.delete(key)
    return null
}

const setCachedData = (key: string, data: any, duration: number) => {
    cache.set(key, { data, timestamp: Date.now(), duration })
}

// API fetch utility with error handling and retries
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 2): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${url}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            })

            if (!response.ok) {
                // Don't retry on client errors (4xx) or too many requests (429)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                // Only retry server errors (5xx) and only once
                if (response.status >= 500 && i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000)) // Longer delays
                    continue
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            if (i === retries - 1) throw error
            // Only retry on network errors, not HTTP errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000))
            } else {
                throw error
            }
        }
    }
}

export function useDashboardData(userId?: string) {
    const [state, setState] = useState<DashboardDataState>({
        stats: null,
        events: [],
        achievements: [],
        weather: null,
        userProfile: null,
        partyMembers: [],
        isLoading: true,
        errors: {},
        lastUpdated: null
    })

    // Fetch user stats
    const fetchStats = useCallback(async () => {
        if (!userId) return

        const cacheKey = `stats-${userId}`
        const cached = getCachedData(cacheKey)
        if (cached) {
            setState(prev => ({ ...prev, stats: cached }))
            return
        }

        try {
            const data = await fetchWithRetry(`${API_CONFIG.endpoints.stats}?userId=${userId}`)
            setCachedData(cacheKey, data, CACHE_DURATION.stats)
            setState(prev => ({ ...prev, stats: data, errors: { ...prev.errors, stats: '' } }))
        } catch (error) {
            console.error('Error fetching stats:', error)
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, stats: 'Failed to load statistics' }
            }))
            toast.error('Failed to load dashboard statistics')
        }
    }, [userId])

    // Fetch upcoming events
    const fetchEvents = useCallback(async () => {
        if (!userId) return

        const cacheKey = `events-${userId}`
        const cached = getCachedData(cacheKey)
        if (cached) {
            setState(prev => ({ ...prev, events: cached }))
            return
        }

        try {
            const data = await fetchWithRetry(`${API_CONFIG.endpoints.events}?userId=${userId}&upcoming=true&limit=10`)
            setCachedData(cacheKey, data, CACHE_DURATION.events)
            setState(prev => ({ ...prev, events: data, errors: { ...prev.errors, events: '' } }))
        } catch (error) {
            console.error('Error fetching events:', error)
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, events: 'Failed to load upcoming events' }
            }))
            toast.error('Failed to load upcoming events')
        }
    }, [userId])

    // Fetch achievements
    const fetchAchievements = useCallback(async () => {
        if (!userId) return

        const cacheKey = `achievements-${userId}`
        const cached = getCachedData(cacheKey)
        if (cached) {
            setState(prev => ({ ...prev, achievements: cached }))
            return
        }

        try {
            const data = await fetchWithRetry(`${API_CONFIG.endpoints.achievements}?userId=${userId}`)
            setCachedData(cacheKey, data, CACHE_DURATION.achievements)
            setState(prev => ({ ...prev, achievements: data, errors: { ...prev.errors, achievements: '' } }))
        } catch (error) {
            console.error('Error fetching achievements:', error)
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, achievements: 'Failed to load achievements' }
            }))
        }
    }, [userId])

    // Fetch weather data
    const fetchWeather = useCallback(async () => {
        const cacheKey = 'weather-wdw'
        const cached = getCachedData(cacheKey)
        if (cached) {
            setState(prev => ({ ...prev, weather: cached }))
            return
        }

        try {
            // Using coordinates for Walt Disney World
            const data = await fetchWithRetry(`${API_CONFIG.endpoints.weather}?lat=28.3772&lon=-81.5707`)
            setCachedData(cacheKey, data, CACHE_DURATION.weather)
            setState(prev => ({ ...prev, weather: data, errors: { ...prev.errors, weather: '' } }))
        } catch (error) {
            console.error('Error fetching weather:', error)
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, weather: 'Failed to load weather data' }
            }))
        }
    }, [])

    // Fetch user profile
    const fetchProfile = useCallback(async () => {
        if (!userId) return

        const cacheKey = `profile-${userId}`
        const cached = getCachedData(cacheKey)
        if (cached) {
            setState(prev => ({ ...prev, userProfile: cached }))
            return
        }

        try {
            const data = await fetchWithRetry(`${API_CONFIG.endpoints.profile}?userId=${userId}`)
            setCachedData(cacheKey, data, CACHE_DURATION.profile)
            setState(prev => ({ ...prev, userProfile: data, errors: { ...prev.errors, profile: '' } }))
        } catch (error) {
            console.error('Error fetching profile:', error)
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, profile: 'Failed to load user profile' }
            }))
        }
    }, [userId])

    // Fetch party members
    const fetchParty = useCallback(async () => {
        if (!userId) return

        const cacheKey = `party-${userId}`
        const cached = getCachedData(cacheKey)
        if (cached) {
            setState(prev => ({ ...prev, partyMembers: cached }))
            return
        }

        try {
            const data = await fetchWithRetry(`${API_CONFIG.endpoints.party}?userId=${userId}`)
            setCachedData(cacheKey, data, CACHE_DURATION.party)
            setState(prev => ({ ...prev, partyMembers: data, errors: { ...prev.errors, party: '' } }))
        } catch (error) {
            console.error('Error fetching party:', error)
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, party: 'Failed to load party members' }
            }))
        }
    }, [userId])

    // Refresh all data
    const refreshData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }))

        await Promise.allSettled([
            fetchStats(),
            fetchEvents(),
            fetchAchievements(),
            fetchWeather(),
            fetchProfile(),
            fetchParty()
        ])

        setState(prev => ({ ...prev, isLoading: false, lastUpdated: new Date() }))
    }, [fetchStats, fetchEvents, fetchAchievements, fetchWeather, fetchProfile, fetchParty])

    // Initial data load
    useEffect(() => {
        if (userId) {
            refreshData()
        }
    }, [userId, refreshData])

    // Auto-refresh weather data more frequently
    useEffect(() => {
        const weatherInterval = setInterval(fetchWeather, 10 * 60 * 1000) // 10 minutes
        return () => clearInterval(weatherInterval)
    }, [fetchWeather])

    // Auto-refresh events more frequently
    useEffect(() => {
        const eventsInterval = setInterval(fetchEvents, 5 * 60 * 1000) // 5 minutes
        return () => clearInterval(eventsInterval)
    }, [fetchEvents])

    // Computed values
    const hasErrors = useMemo(() =>
        Object.values(state.errors).some(error => error !== ''),
        [state.errors]
    )

    const completedAchievements = useMemo(() =>
        state.achievements.filter(achievement => achievement.isCompleted),
        [state.achievements]
    )

    const nextEvent = useMemo(() => {
        const now = new Date()
        return state.events
            .filter(event => new Date(`${now.toDateString()} ${event.time}`) > now)
            .sort((a, b) =>
                new Date(`${now.toDateString()} ${a.time}`).getTime() -
                new Date(`${now.toDateString()} ${b.time}`).getTime()
            )[0]
    }, [state.events])

    // Return state and methods
    return {
        ...state,
        hasErrors,
        completedAchievements,
        nextEvent,
        refreshData,
        fetchStats,
        fetchEvents,
        fetchAchievements,
        fetchWeather,
        fetchProfile,
        fetchParty
    }
}