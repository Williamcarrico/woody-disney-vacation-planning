/**
 * Weather API Integration with Validation
 * 
 * Example implementation showing how to use the validated fetch wrapper
 * with Tomorrow.io weather API (or any weather service)
 */

import { createValidatedFetch, ThirdPartySchemas, FallbackProviders } from './third-party-validation'
import { z } from 'zod'

// Environment configuration
const WEATHER_API_BASE_URL = process.env.NEXT_PUBLIC_WEATHER_API_URL || 'https://api.tomorrow.io/v4'
const WEATHER_API_KEY = process.env.TOMORROW_IO_API_KEY

if (!WEATHER_API_KEY) {
    console.warn('Weather API key not configured, will use fallback data')
}

// Create validated fetch instance
const weatherApi = createValidatedFetch(WEATHER_API_BASE_URL, {
    headers: {
        'apikey': WEATHER_API_KEY || '',
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout
    retries: 2,
    retryDelay: 1000,
})

// Extended weather types for Tomorrow.io
const TomorrowIoCurrentSchema = z.object({
    data: z.object({
        timelines: z.array(z.object({
            timestep: z.literal('current'),
            intervals: z.array(z.object({
                startTime: z.string().datetime(),
                values: z.object({
                    temperature: z.number(),
                    humidity: z.number(),
                    windSpeed: z.number(),
                    windDirection: z.number(),
                    weatherCode: z.number(), // Tomorrow.io uses numeric codes
                    uvIndex: z.number().optional(),
                    visibility: z.number().optional(),
                    cloudCover: z.number().optional(),
                    precipitationIntensity: z.number().optional(),
                    pressureSurfaceLevel: z.number().optional(),
                })
            }))
        }))
    })
})

// Transform Tomorrow.io response to our standard format
function transformTomorrowIoResponse(data: z.infer<typeof TomorrowIoCurrentSchema>) {
    const current = data.data.timelines[0]?.intervals[0]?.values
    if (!current) throw new Error('No current weather data')
    
    return {
        temperature: current.temperature,
        humidity: current.humidity,
        windSpeed: current.windSpeed,
        windDirection: current.windDirection,
        weatherCode: mapWeatherCode(current.weatherCode),
        uvIndex: current.uvIndex,
        visibility: current.visibility,
        cloudCover: current.cloudCover,
    }
}

// Map numeric weather codes to string descriptions
function mapWeatherCode(code: number): string {
    const codeMap: Record<number, string> = {
        1000: 'clear',
        1100: 'mostly_clear',
        1101: 'partly_cloudy',
        1102: 'mostly_cloudy',
        1001: 'cloudy',
        2000: 'fog',
        2100: 'light_fog',
        4000: 'drizzle',
        4001: 'rain',
        4200: 'light_rain',
        4201: 'heavy_rain',
        5000: 'snow',
        5001: 'flurries',
        5100: 'light_snow',
        5101: 'heavy_snow',
        6000: 'freezing_drizzle',
        6001: 'freezing_rain',
        6200: 'light_freezing_rain',
        6201: 'heavy_freezing_rain',
        7000: 'ice_pellets',
        7101: 'heavy_ice_pellets',
        7102: 'light_ice_pellets',
        8000: 'thunderstorm',
    }
    
    return codeMap[code] || 'unknown'
}

/**
 * Get current weather conditions for a location
 */
export async function getCurrentWeather(lat: number, lng: number) {
    try {
        // If no API key, use fallback immediately
        if (!WEATHER_API_KEY) {
            const fallback = FallbackProviders.weather.currentConditions()
            console.log('Using fallback weather data (no API key)')
            return { data: fallback, source: 'fallback' as const }
        }

        // Make validated API request
        const response = await weatherApi.getValidated(
            `/timelines`,
            TomorrowIoCurrentSchema,
            () => ({
                data: {
                    timelines: [{
                        timestep: 'current' as const,
                        intervals: [{
                            startTime: new Date().toISOString(),
                            values: {
                                temperature: 75,
                                humidity: 50,
                                windSpeed: 5,
                                windDirection: 180,
                                weatherCode: 1000,
                                uvIndex: 5,
                                visibility: 10,
                                cloudCover: 50,
                            }
                        }]
                    }]
                }
            }),
            {
                // Query parameters via URLSearchParams
                headers: {
                    'apikey': WEATHER_API_KEY,
                },
            }
        )

        // Transform to our standard format
        const weatherData = transformTomorrowIoResponse(response)
        
        return {
            data: weatherData,
            source: 'api' as const,
        }
    } catch (error) {
        console.error('Weather API error:', error)
        
        // Return fallback data
        const fallback = FallbackProviders.weather.currentConditions()
        return {
            data: fallback,
            source: 'fallback' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Get weather forecast
 */
export async function getWeatherForecast(
    lat: number, 
    lng: number, 
    days: number = 7
) {
    try {
        if (!WEATHER_API_KEY) {
            const fallback = FallbackProviders.weather.forecast()
            return { data: fallback, source: 'fallback' as const }
        }

        // Build URL with query parameters
        const params = new URLSearchParams({
            location: `${lat},${lng}`,
            fields: 'temperature,temperatureMin,temperatureMax,humidity,precipitationProbability,weatherCode',
            timesteps: 'daily',
            units: 'imperial',
            timezone: 'America/New_York',
        })

        const url = `/timelines?${params.toString()}`

        const response = await weatherApi.getValidated(
            url,
            ThirdPartySchemas.weather.forecast,
            FallbackProviders.weather.forecast
        )

        return {
            data: response,
            source: 'api' as const,
        }
    } catch (error) {
        console.error('Weather forecast error:', error)
        
        const fallback = FallbackProviders.weather.forecast()
        return {
            data: fallback,
            source: 'fallback' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Get weather for Disney parks with caching
 */
const DISNEY_LOCATIONS = {
    'magic-kingdom': { lat: 28.4177, lng: -81.5812, name: 'Magic Kingdom' },
    'epcot': { lat: 28.3747, lng: -81.5494, name: 'EPCOT' },
    'hollywood-studios': { lat: 28.3575, lng: -81.5582, name: 'Hollywood Studios' },
    'animal-kingdom': { lat: 28.3553, lng: -81.5901, name: 'Animal Kingdom' },
} as const

export type DisneyParkId = keyof typeof DISNEY_LOCATIONS

// Simple in-memory cache
const weatherCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export async function getDisneyParkWeather(parkId: DisneyParkId) {
    const location = DISNEY_LOCATIONS[parkId]
    if (!location) {
        throw new Error(`Invalid park ID: ${parkId}`)
    }

    // Check cache
    const cacheKey = `weather:${parkId}`
    const cached = weatherCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, source: 'cache' as const }
    }

    // Fetch fresh data
    const result = await getCurrentWeather(location.lat, location.lng)
    
    // Cache successful API responses
    if (result.source === 'api') {
        weatherCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
        })
    }

    return {
        ...result,
        parkName: location.name,
    }
}

/**
 * Batch fetch weather for all Disney parks
 */
export async function getAllDisneyParksWeather() {
    const parks = Object.keys(DISNEY_LOCATIONS) as DisneyParkId[]
    
    const results = await Promise.allSettled(
        parks.map(parkId => getDisneyParkWeather(parkId))
    )

    return results.reduce((acc, result, index) => {
        const parkId = parks[index]!
        
        if (result.status === 'fulfilled') {
            acc[parkId] = result.value
        } else {
            // Use fallback for failed requests
            acc[parkId] = {
                data: FallbackProviders.weather.currentConditions(),
                source: 'fallback' as const,
                parkName: DISNEY_LOCATIONS[parkId].name,
                error: result.reason?.message || 'Failed to fetch weather',
            }
        }
        
        return acc
    }, {} as Record<DisneyParkId, any>)
}

// Export types for consumers
export type WeatherData = z.infer<typeof ThirdPartySchemas.weather.currentConditions>
export type WeatherForecast = z.infer<typeof ThirdPartySchemas.weather.forecast>
export type WeatherResult = {
    data: WeatherData
    source: 'api' | 'fallback' | 'cache'
    error?: string
    parkName?: string
} 