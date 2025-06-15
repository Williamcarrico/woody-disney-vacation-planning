/**
 * Third-party API Validation Middleware
 * 
 * Validates incoming data from external APIs with fallback logic
 * to ensure application stability when third-party services
 * return unexpected data structures.
 */

import { z, ZodError, ZodSchema } from 'zod'
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Validation result types
export interface ValidationResult<T> {
    success: true
    data: T
    warnings?: string[]
}

export interface ValidationFailure {
    success: false
    error: ZodError
    partialData?: unknown
    fallbackUsed: boolean
    fallbackData?: unknown
}

export type ValidatedResponse<T> = ValidationResult<T> | ValidationFailure

// Common third-party API schemas
export const ThirdPartySchemas = {
    // Weather API schemas (Tomorrow.io)
    weather: {
        currentConditions: z.object({
            temperature: z.number(),
            humidity: z.number().min(0).max(100),
            windSpeed: z.number().min(0),
            windDirection: z.number().min(0).max(360),
            weatherCode: z.string(),
            uvIndex: z.number().min(0).max(11).optional(),
            visibility: z.number().min(0).optional(),
            cloudCover: z.number().min(0).max(100).optional(),
        }),
        
        forecast: z.object({
            timelines: z.array(z.object({
                timestep: z.string(),
                intervals: z.array(z.object({
                    startTime: z.string().datetime(),
                    values: z.object({
                        temperature: z.number(),
                        temperatureMin: z.number().optional(),
                        temperatureMax: z.number().optional(),
                        humidity: z.number().min(0).max(100),
                        precipitationProbability: z.number().min(0).max(100),
                        weatherCode: z.string(),
                    })
                }))
            }))
        }),
    },

    // Theme Park API schemas
    themePark: {
        waitTime: z.object({
            attractionId: z.string(),
            name: z.string(),
            waitTime: z.number().min(0).nullable(),
            status: z.enum(['Operating', 'Closed', 'Down', 'Refurbishment']),
            lastUpdate: z.string().datetime(),
            fastPassAvailable: z.boolean().optional(),
        }),

        parkHours: z.object({
            parkId: z.string(),
            date: z.string().datetime(),
            openTime: z.string().regex(/^\d{2}:\d{2}$/),
            closeTime: z.string().regex(/^\d{2}:\d{2}$/),
            magicHours: z.object({
                morning: z.object({
                    start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
                    end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
                }).optional(),
                evening: z.object({
                    start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
                    end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
                }).optional(),
            }).optional(),
        }),
    },

    // Maps/Geocoding API schemas
    maps: {
        geocodeResult: z.object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180),
            formattedAddress: z.string(),
            placeId: z.string().optional(),
            types: z.array(z.string()).optional(),
        }),

        directions: z.object({
            routes: z.array(z.object({
                distance: z.number(),
                duration: z.number(),
                steps: z.array(z.object({
                    distance: z.number(),
                    duration: z.number(),
                    instruction: z.string(),
                    startLocation: z.object({
                        lat: z.number(),
                        lng: z.number(),
                    }),
                    endLocation: z.object({
                        lat: z.number(),
                        lng: z.number(),
                    }),
                })),
            })),
        }),
    },
}

// Fallback data providers
export const FallbackProviders = {
    weather: {
        currentConditions: () => ({
            temperature: 75,
            humidity: 50,
            windSpeed: 5,
            windDirection: 180,
            weatherCode: 'partly_cloudy',
            uvIndex: 5,
            visibility: 10,
            cloudCover: 50,
        }),

        forecast: () => ({
            timelines: [{
                timestep: 'daily',
                intervals: Array.from({ length: 7 }, (_, i) => ({
                    startTime: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
                    values: {
                        temperature: 75,
                        temperatureMin: 65,
                        temperatureMax: 85,
                        humidity: 55,
                        precipitationProbability: 20,
                        weatherCode: 'partly_cloudy',
                    }
                }))
            }]
        }),
    },

    themePark: {
        waitTime: (attractionId: string, name: string) => ({
            attractionId,
            name,
            waitTime: null,
            status: 'Operating' as const,
            lastUpdate: new Date().toISOString(),
            fastPassAvailable: false,
        }),

        parkHours: (parkId: string) => ({
            parkId,
            date: new Date().toISOString(),
            openTime: '09:00',
            closeTime: '22:00',
            magicHours: undefined,
        }),
    },

    maps: {
        geocodeResult: () => ({
            latitude: 28.3772,
            longitude: -81.5707,
            formattedAddress: 'Walt Disney World Resort, FL',
            placeId: 'disney-world-default',
            types: ['amusement_park', 'point_of_interest'],
        }),

        directions: () => ({
            routes: [{
                distance: 1000,
                duration: 600,
                steps: [{
                    distance: 1000,
                    duration: 600,
                    instruction: 'Service temporarily unavailable',
                    startLocation: { lat: 0, lng: 0 },
                    endLocation: { lat: 0, lng: 0 },
                }],
            }],
        }),
    },
}

/**
 * Validates third-party API response with fallback
 */
export function validateThirdPartyResponse<T>(
    data: unknown,
    schema: ZodSchema<T>,
    fallbackProvider?: () => T,
    options: {
        allowPartial?: boolean
        logErrors?: boolean
        transformBeforeValidation?: (data: unknown) => unknown
    } = {}
): ValidatedResponse<T> {
    const { allowPartial = false, logErrors = true, transformBeforeValidation } = options

    try {
        // Apply transformation if provided
        const dataToValidate = transformBeforeValidation ? transformBeforeValidation(data) : data

        // Attempt validation
        const result = schema.safeParse(dataToValidate)

        if (result.success) {
            return {
                success: true,
                data: result.data,
            }
        }

        // Validation failed
        if (logErrors) {
            console.error('Third-party API validation failed:', result.error.errors)
        }

        // Try fallback if available
        if (fallbackProvider) {
            const fallbackData = fallbackProvider()
            const fallbackResult = schema.safeParse(fallbackData)

            if (fallbackResult.success) {
                return {
                    success: false,
                    error: result.error,
                    partialData: dataToValidate,
                    fallbackUsed: true,
                    fallbackData: fallbackResult.data,
                }
            }
        }

        // No valid fallback
        return {
            success: false,
            error: result.error,
            partialData: allowPartial ? dataToValidate : undefined,
            fallbackUsed: false,
        }
    } catch (error) {
        if (logErrors) {
            console.error('Unexpected error during validation:', error)
        }

        // Try fallback on unexpected errors
        if (fallbackProvider) {
            try {
                const fallbackData = fallbackProvider()
                return {
                    success: true,
                    data: fallbackData,
                    warnings: ['Using fallback data due to validation error'],
                }
            } catch (fallbackError) {
                // Fallback also failed
            }
        }

        // Create a ZodError for consistency
        return {
            success: false,
            error: new ZodError([{
                code: 'custom',
                message: 'Unexpected validation error',
                path: [],
            }]),
            partialData: undefined,
            fallbackUsed: false,
        }
    }
}

/**
 * Creates an Axios instance with response validation
 */
export function createValidatedAxiosInstance(
    baseURL: string,
    defaultHeaders?: Record<string, string>
): AxiosInstance & {
    getValidated: <T>(url: string, schema: ZodSchema<T>, fallback?: () => T) => Promise<T>
    postValidated: <T>(url: string, data: any, schema: ZodSchema<T>, fallback?: () => T) => Promise<T>
} {
    const instance = axios.create({
        baseURL,
        headers: defaultHeaders,
        timeout: 30000, // 30 second timeout
    })

    // Add response interceptor for logging
    instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            console.error(`API request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response?.status,
                data: error.response?.data,
            })
            return Promise.reject(error)
        }
    )

    // Add validated methods
    const validatedInstance = instance as any

    validatedInstance.getValidated = async <T>(
        url: string,
        schema: ZodSchema<T>,
        fallback?: () => T
    ): Promise<T> => {
        try {
            const response = await instance.get(url)
            const validation = validateThirdPartyResponse(response.data, schema, fallback)

            if (validation.success) {
                return validation.data
            } else if (validation.fallbackUsed && validation.fallbackData) {
                console.warn(`Using fallback data for ${url}`)
                return validation.fallbackData as T
            } else {
                throw new Error(`Validation failed for ${url}: ${validation.error.message}`)
            }
        } catch (error) {
            if (fallback) {
                console.warn(`Request failed, using fallback for ${url}`)
                return fallback()
            }
            throw error
        }
    }

    validatedInstance.postValidated = async <T>(
        url: string,
        data: any,
        schema: ZodSchema<T>,
        fallback?: () => T
    ): Promise<T> => {
        try {
            const response = await instance.post(url, data)
            const validation = validateThirdPartyResponse(response.data, schema, fallback)

            if (validation.success) {
                return validation.data
            } else if (validation.fallbackUsed && validation.fallbackData) {
                console.warn(`Using fallback data for ${url}`)
                return validation.fallbackData as T
            } else {
                throw new Error(`Validation failed for ${url}: ${validation.error.message}`)
            }
        } catch (error) {
            if (fallback) {
                console.warn(`Request failed, using fallback for ${url}`)
                return fallback()
            }
            throw error
        }
    }

    return validatedInstance
}

/**
 * Rate-limited validation wrapper
 */
export class RateLimitedValidator<T> {
    private lastValidation: number = 0
    private cachedResult: T | null = null
    private readonly minInterval: number

    constructor(
        private schema: ZodSchema<T>,
        private fallbackProvider: () => T,
        minIntervalMs: number = 1000
    ) {
        this.minInterval = minIntervalMs
    }

    validate(data: unknown): ValidatedResponse<T> {
        const now = Date.now()
        
        // Return cached result if within rate limit
        if (this.cachedResult && (now - this.lastValidation) < this.minInterval) {
            return {
                success: true,
                data: this.cachedResult,
                warnings: ['Using cached validation result due to rate limiting'],
            }
        }

        const result = validateThirdPartyResponse(data, this.schema, this.fallbackProvider)
        
        if (result.success) {
            this.cachedResult = result.data
            this.lastValidation = now
        }

        return result
    }

    clearCache(): void {
        this.cachedResult = null
        this.lastValidation = 0
    }
}

/**
 * Batch validation for multiple items
 */
export function validateBatch<T>(
    items: unknown[],
    schema: ZodSchema<T>,
    options: {
        maxFailures?: number
        fallbackProvider?: (index: number, item: unknown) => T
        continueOnError?: boolean
    } = {}
): {
    valid: T[]
    invalid: Array<{ index: number; error: ZodError; item: unknown }>
    fallbackUsed: number
} {
    const { maxFailures = Infinity, fallbackProvider, continueOnError = true } = options
    const valid: T[] = []
    const invalid: Array<{ index: number; error: ZodError; item: unknown }> = []
    let fallbackUsed = 0
    let failureCount = 0

    for (let i = 0; i < items.length; i++) {
        if (failureCount >= maxFailures && !continueOnError) {
            break
        }

        const result = schema.safeParse(items[i])

        if (result.success) {
            valid.push(result.data)
        } else {
            failureCount++
            invalid.push({ index: i, error: result.error, item: items[i] })

            // Try fallback
            if (fallbackProvider) {
                try {
                    const fallbackData = fallbackProvider(i, items[i])
                    const fallbackResult = schema.safeParse(fallbackData)
                    if (fallbackResult.success) {
                        valid.push(fallbackResult.data)
                        fallbackUsed++
                        failureCount-- // Don't count as failure if fallback worked
                    }
                } catch (error) {
                    // Fallback failed, keep original error
                }
            }
        }
    }

    return { valid, invalid, fallbackUsed }
}

// Export pre-configured validators for common third-party services
export const validators = {
    weather: {
        current: new RateLimitedValidator(
            ThirdPartySchemas.weather.currentConditions,
            FallbackProviders.weather.currentConditions,
            60000 // 1 minute cache
        ),
        forecast: new RateLimitedValidator(
            ThirdPartySchemas.weather.forecast,
            FallbackProviders.weather.forecast,
            300000 // 5 minute cache
        ),
    },
    themePark: {
        waitTime: (attractionId: string, name: string) => new RateLimitedValidator(
            ThirdPartySchemas.themePark.waitTime,
            () => FallbackProviders.themePark.waitTime(attractionId, name),
            30000 // 30 second cache
        ),
        parkHours: (parkId: string) => new RateLimitedValidator(
            ThirdPartySchemas.themePark.parkHours,
            () => FallbackProviders.themePark.parkHours(parkId),
            3600000 // 1 hour cache
        ),
    },
} 