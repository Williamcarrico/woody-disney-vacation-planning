import { unstable_cache } from 'next/cache'
// Note: revalidateTag only works in server components
// import { revalidateTag } from 'next/cache'
import { RealtimeWeatherResponse, ForecastResponse } from '@/types/weather'

// Cache configuration
export const CACHE_CONFIG = {
    // Cache durations in seconds
    REALTIME_CACHE_DURATION: 600, // 10 minutes
    FORECAST_CACHE_DURATION: 1800, // 30 minutes
    LOCATION_CACHE_DURATION: 86400, // 24 hours

    // Cache tags for invalidation
    TAGS: {
        REALTIME: 'weather-realtime',
        FORECAST: 'weather-forecast',
        LOCATION: 'weather-location',
    },

    // Client-side cache settings
    CLIENT_CACHE_DURATION: 300000, // 5 minutes in milliseconds
    CLIENT_STALE_TIME: 600000, // 10 minutes in milliseconds
} as const

// Cache key generators
export const generateCacheKey = {
    realtime: (location: string, units: string) =>
        `realtime:${encodeURIComponent(location)}:${units}`,

    forecast: (location: string, units: string) =>
        `forecast:${encodeURIComponent(location)}:${units}`,

    location: (location: string) =>
        `location:${encodeURIComponent(location)}`,
}

// Cached API functions using Next.js unstable_cache
export const getCachedRealtimeWeather = unstable_cache(
    async (location: string, units: string): Promise<RealtimeWeatherResponse> => {
        const response = await fetch(
            `/api/weather/realtime?location=${encodeURIComponent(location)}&units=${units}`,
            {
                cache: 'force-cache',
                next: {
                    revalidate: CACHE_CONFIG.REALTIME_CACHE_DURATION,
                    tags: [CACHE_CONFIG.TAGS.REALTIME, generateCacheKey.realtime(location, units)]
                }
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to fetch realtime weather: ${response.statusText}`)
        }

        return response.json()
    },
    ['realtime-weather'],
    {
        revalidate: CACHE_CONFIG.REALTIME_CACHE_DURATION,
        tags: [CACHE_CONFIG.TAGS.REALTIME]
    }
)

export const getCachedForecastWeather = unstable_cache(
    async (location: string, units: string): Promise<ForecastResponse> => {
        const response = await fetch(
            `/api/weather/forecast?location=${encodeURIComponent(location)}&units=${units}`,
            {
                cache: 'force-cache',
                next: {
                    revalidate: CACHE_CONFIG.FORECAST_CACHE_DURATION,
                    tags: [CACHE_CONFIG.TAGS.FORECAST, generateCacheKey.forecast(location, units)]
                }
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to fetch forecast weather: ${response.statusText}`)
        }

        return response.json()
    },
    ['forecast-weather'],
    {
        revalidate: CACHE_CONFIG.FORECAST_CACHE_DURATION,
        tags: [CACHE_CONFIG.TAGS.FORECAST]
    }
)

// Cache invalidation functions
export const invalidateWeatherCache = {
    // Invalidate all weather data for a specific location
    location: async (location: string, units?: string) => {
        const tags = [
            generateCacheKey.realtime(location, units || 'metric'),
            generateCacheKey.realtime(location, units || 'imperial'),
            generateCacheKey.forecast(location, units || 'metric'),
            generateCacheKey.forecast(location, units || 'imperial'),
        ]

        // await Promise.all(tags.map(tag => revalidateTag(tag)))
        console.log('Cache invalidation requested for tags:', tags)
    },

    // Invalidate all realtime weather data
    realtime: async () => {
        // await revalidateTag(CACHE_CONFIG.TAGS.REALTIME)
        console.log('Cache invalidation requested for realtime data')
    },

    // Invalidate all forecast data
    forecast: async () => {
        // await revalidateTag(CACHE_CONFIG.TAGS.FORECAST)
        console.log('Cache invalidation requested for forecast data')
    },

    // Invalidate all weather data
    all: async () => {
        await Promise.all([
            // revalidateTag(CACHE_CONFIG.TAGS.REALTIME),
            // revalidateTag(CACHE_CONFIG.TAGS.FORECAST),
            // revalidateTag(CACHE_CONFIG.TAGS.LOCATION),
            Promise.resolve() // Placeholder
        ])
    }
}

// Client-side cache interface
export interface WeatherCacheEntry<T> {
    data: T
    timestamp: number
    expiresAt: number
    location: string
    units: string
}

// In-memory client cache for browser
class ClientWeatherCache {
    private cache = new Map<string, WeatherCacheEntry<any>>()

    set<T>(key: string, data: T, location: string, units: string, ttl: number = CACHE_CONFIG.CLIENT_CACHE_DURATION): void {
        const now = Date.now()
        const entry: WeatherCacheEntry<T> = {
            data,
            timestamp: now,
            expiresAt: now + ttl,
            location,
            units
        }

        this.cache.set(key, entry)

        // Clean up expired entries periodically
        this.cleanupExpired()
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            return null
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    invalidate(pattern?: string): void {
        if (pattern) {
            // Remove entries matching pattern
            for (const [key] of this.cache) {
                if (key.includes(pattern)) {
                    this.cache.delete(key)
                }
            }
        } else {
            // Clear all cache
            this.cache.clear()
        }
    }

    private cleanupExpired(): void {
        const now = Date.now()
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                this.cache.delete(key)
            }
        }
    }

    // Get cache statistics
    getStats() {
        const now = Date.now()
        const entries = Array.from(this.cache.values())

        return {
            totalEntries: entries.length,
            validEntries: entries.filter(entry => now <= entry.expiresAt).length,
            expiredEntries: entries.filter(entry => now > entry.expiresAt).length,
            size: this.cache.size
        }
    }
}

// Export singleton instance
export const clientWeatherCache = new ClientWeatherCache()

// Cache warming utilities
export const warmCache = {
    // Pre-fetch popular locations
    popularLocations: async (locations: string[] = ['Orlando, FL', 'Anaheim, CA', 'Paris, France']) => {
        const units = ['metric', 'imperial'] as const

        const promises = locations.flatMap(location =>
            units.flatMap(unit => [
                getCachedRealtimeWeather(location, unit).catch(console.warn),
                getCachedForecastWeather(location, unit).catch(console.warn)
            ])
        )

        await Promise.allSettled(promises)
    },

    // Pre-fetch for user's detected location
    userLocation: async (location: string, units: string = 'imperial') => {
        await Promise.allSettled([
            getCachedRealtimeWeather(location, units).catch(console.warn),
            getCachedForecastWeather(location, units).catch(console.warn)
        ])
    }
}

// Cache health monitoring
export const cacheHealth = {
    check: () => {
        const clientStats = clientWeatherCache.getStats()

        return {
            client: clientStats,
            timestamp: new Date().toISOString(),
            healthy: clientStats.validEntries > 0 || clientStats.totalEntries === 0
        }
    },

    cleanup: () => {
        clientWeatherCache.invalidate()
    }
}