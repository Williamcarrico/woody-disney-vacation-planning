/**
 * Vacation Service
 * Comprehensive service for vacation data management with advanced features:
 * - Type-safe API interactions
 * - Sophisticated error handling with custom error types
 * - Request/response caching and optimization
 * - Retry logic with exponential backoff
 * - Data transformation and validation
 * - Performance monitoring and analytics
 */

import { z } from 'zod'
import { ApiResponse } from '@/lib/api/response'

// =============================================================================
// TYPE DEFINITIONS & SCHEMAS
// =============================================================================

// Enhanced vacation data schema with computed fields
export const VacationSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    destination: z.string(),
    budget: z.object({
        total: z.number(),
        spent: z.number(),
        categories: z.record(z.object({
            planned: z.number(),
            actual: z.number()
        }))
    }).nullable(),
    travelers: z.object({
        adults: z.number(),
        children: z.number(),
        childrenAges: z.array(z.number()).optional()
    }),
    accommodations: z.object({
        resortId: z.string().optional(),
        resortName: z.string().optional(),
        roomType: z.string().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        confirmationNumber: z.string().optional()
    }).nullable(),
    notes: z.string().nullable(),
    isArchived: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    // Computed fields
    durationDays: z.number(),
    partySize: z.number(),
    budgetPerPerson: z.number().nullable(),
    budgetPerDay: z.number().nullable(),
    status: z.enum(['upcoming', 'active', 'completed', 'archived']),
    daysUntilTrip: z.number().nullable(),
    formattedDateRange: z.string()
})

export type Vacation = z.infer<typeof VacationSchema>

// Vacation update schema for PATCH operations
export const VacationUpdateSchema = VacationSchema.partial().omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    durationDays: true,
    partySize: true,
    budgetPerPerson: true,
    budgetPerDay: true,
    status: true,
    daysUntilTrip: true,
    formattedDateRange: true
})

export type VacationUpdate = z.infer<typeof VacationUpdateSchema>

// Service response types
export interface VacationServiceResponse<T = unknown> {
    success: boolean
    data?: T
    error?: VacationServiceError
    metadata?: {
        fetchedAt: string
        cached: boolean
        requestId: string
        performance: {
            duration: number
            retryCount: number
        }
    }
}

// =============================================================================
// CUSTOM ERROR HANDLING
// =============================================================================

export class VacationServiceError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: unknown
    ) {
        super(message)
        this.name = 'VacationServiceError'
    }
}

export enum VacationErrorCodes {
    NETWORK_ERROR = 'NETWORK_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    CACHE_ERROR = 'CACHE_ERROR',
    PARSE_ERROR = 'PARSE_ERROR'
}

// =============================================================================
// CACHING LAYER
// =============================================================================

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
    etag?: string
}

class VacationCache {
    private cache = new Map<string, CacheEntry<unknown>>()
    private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

    set<T>(key: string, data: T, ttl: number = this.defaultTTL, etag?: string): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
            etag
        })
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key)
        if (!entry) return null

        const isExpired = Date.now() - entry.timestamp > entry.ttl
        if (isExpired) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    getEtag(key: string): string | undefined {
        const entry = this.cache.get(key)
        return entry?.etag
    }

    invalidate(key: string): void {
        this.cache.delete(key)
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern)
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key)
            }
        }
    }

    clear(): void {
        this.cache.clear()
    }

    size(): number {
        return this.cache.size
    }
}

// =============================================================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// =============================================================================

interface RetryOptions {
    maxRetries: number
    baseDelay: number
    maxDelay: number
    backoffFactor: number
    retryCondition?: (error: unknown) => boolean
}

const defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error) => {
        // Retry on network errors and 5xx server errors
        if (error instanceof VacationServiceError) {
            return error.statusCode >= 500 || error.code === VacationErrorCodes.NETWORK_ERROR
        }
        return false
    }
}

async function withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
): Promise<T> {
    const config = { ...defaultRetryOptions, ...options }
    let lastError: unknown

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error

            // Don't retry if this is the last attempt or if retry condition fails
            if (attempt === config.maxRetries || !config.retryCondition?.(error)) {
                throw error
            }

            // Calculate delay with exponential backoff and jitter
            const delay = Math.min(
                config.baseDelay * Math.pow(config.backoffFactor, attempt),
                config.maxDelay
            )
            const jitter = delay * 0.1 * Math.random()

            await new Promise(resolve => setTimeout(resolve, delay + jitter))
        }
    }

    throw lastError
}

// =============================================================================
// MAIN VACATION SERVICE CLASS
// =============================================================================

export class VacationService {
    private cache = new VacationCache()
    private baseUrl = '/api/vacations'
    private requestTimeout = 30000 // 30 seconds

    /**
     * Generates a unique request ID for tracking and debugging
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Creates standardized fetch options with timeout and headers
     */
    private createFetchOptions(options: RequestInit = {}): RequestInit {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), this.requestTimeout)

        return {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': this.generateRequestId(),
                ...options.headers
            }
        }
    }

    /**
     * Enhanced fetch wrapper with comprehensive error handling
     */
    private async enhancedFetch<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const startTime = Date.now()
        let retryCount = 0

        try {
            const response = await withRetry(async () => {
                retryCount++
                const fetchOptions = this.createFetchOptions(options)
                const response = await fetch(url, fetchOptions)

                if (!response.ok) {
                    let errorCode: string
                    let errorMessage: string

                    switch (response.status) {
                        case 400:
                            errorCode = VacationErrorCodes.VALIDATION_ERROR
                            errorMessage = 'Invalid request data'
                            break
                        case 401:
                            errorCode = VacationErrorCodes.UNAUTHORIZED
                            errorMessage = 'Authentication required'
                            break
                        case 403:
                            errorCode = VacationErrorCodes.FORBIDDEN
                            errorMessage = 'Access denied'
                            break
                        case 404:
                            errorCode = VacationErrorCodes.NOT_FOUND
                            errorMessage = 'Vacation not found'
                            break
                        case 408:
                            errorCode = VacationErrorCodes.TIMEOUT_ERROR
                            errorMessage = 'Request timeout'
                            break
                        default:
                            errorCode = VacationErrorCodes.SERVER_ERROR
                            errorMessage = 'Server error occurred'
                    }

                    // Try to parse error details from response
                    let errorDetails
                    try {
                        errorDetails = await response.json()
                    } catch {
                        // Ignore JSON parse errors for error responses
                    }

                    throw new VacationServiceError(
                        errorDetails?.error?.message || errorMessage,
                        errorCode,
                        response.status,
                        errorDetails
                    )
                }

                return response
            })

            const data = await response.json()

            return data

        } catch (error) {
            if (error instanceof VacationServiceError) {
                throw error
            }

            // Handle network and other errors
            if (error instanceof Error && error.name === 'AbortError') {
                throw new VacationServiceError(
                    'Request timeout',
                    VacationErrorCodes.TIMEOUT_ERROR,
                    408
                )
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw new VacationServiceError(
                'Network error occurred',
                VacationErrorCodes.NETWORK_ERROR,
                0,
                { originalError: errorMessage, duration: Date.now() - startTime, retryCount }
            )
        }
    }

    /**
     * Fetches vacation data by ID with comprehensive caching and validation
     */
    async getVacation(vacationId: string): Promise<VacationServiceResponse<Vacation>> {
        const requestId = this.generateRequestId()
        const cacheKey = `vacation:${vacationId}`
        const startTime = Date.now()

        try {
            // Input validation
            if (!vacationId || typeof vacationId !== 'string') {
                throw new VacationServiceError(
                    'Invalid vacation ID provided',
                    VacationErrorCodes.VALIDATION_ERROR,
                    400
                )
            }

            // Check cache first
            const cachedData = this.cache.get<Vacation>(cacheKey)
            if (cachedData) {
                return {
                    success: true,
                    data: cachedData,
                    metadata: {
                        fetchedAt: new Date().toISOString(),
                        cached: true,
                        requestId,
                        performance: {
                            duration: Date.now() - startTime,
                            retryCount: 0
                        }
                    }
                }
            }

            // Fetch from API
            const response = await this.enhancedFetch<{ vacation: Vacation }>(
                `${this.baseUrl}/${vacationId}`
            )

            if (!response.success || !response.data?.vacation) {
                throw new VacationServiceError(
                    'Invalid response format',
                    VacationErrorCodes.PARSE_ERROR,
                    500
                )
            }

            // Validate response data
            const validatedVacation = VacationSchema.parse(response.data.vacation)

            // Cache the validated data
            this.cache.set(cacheKey, validatedVacation, 5 * 60 * 1000) // 5 minutes TTL

            return {
                success: true,
                data: validatedVacation,
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }

        } catch (error) {
            console.error(`[VacationService] Error fetching vacation ${vacationId}:`, error)

            if (error instanceof VacationServiceError) {
                return {
                    success: false,
                    error,
                    metadata: {
                        fetchedAt: new Date().toISOString(),
                        cached: false,
                        requestId,
                        performance: {
                            duration: Date.now() - startTime,
                            retryCount: 0
                        }
                    }
                }
            }

            return {
                success: false,
                error: new VacationServiceError(
                    'Unexpected error occurred',
                    VacationErrorCodes.SERVER_ERROR,
                    500,
                    { originalError: error instanceof Error ? error.message : 'Unknown error' }
                ),
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        }
    }

    /**
     * Updates vacation data with optimistic caching
     */
    async updateVacation(
        vacationId: string,
        updates: VacationUpdate
    ): Promise<VacationServiceResponse<Vacation>> {
        const requestId = this.generateRequestId()
        const cacheKey = `vacation:${vacationId}`
        const startTime = Date.now()

        try {
            // Input validation
            if (!vacationId || typeof vacationId !== 'string') {
                throw new VacationServiceError(
                    'Invalid vacation ID provided',
                    VacationErrorCodes.VALIDATION_ERROR,
                    400
                )
            }

            // Validate update data
            const validatedUpdates = VacationUpdateSchema.parse(updates)

            // Update via API
            const response = await this.enhancedFetch<{ vacation: Vacation }>(
                `${this.baseUrl}/${vacationId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify(validatedUpdates)
                }
            )

            if (!response.success || !response.data?.vacation) {
                throw new VacationServiceError(
                    'Invalid response format',
                    VacationErrorCodes.PARSE_ERROR,
                    500
                )
            }

            // Validate response data
            const validatedVacation = VacationSchema.parse(response.data.vacation)

            // Update cache
            this.cache.set(cacheKey, validatedVacation, 5 * 60 * 1000)

            // Invalidate related caches
            this.cache.invalidatePattern(`vacation:${vacationId}:*`)

            return {
                success: true,
                data: validatedVacation,
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }

        } catch (error) {
            console.error(`[VacationService] Error updating vacation ${vacationId}:`, error)

            if (error instanceof VacationServiceError) {
                return {
                    success: false,
                    error,
                    metadata: {
                        fetchedAt: new Date().toISOString(),
                        cached: false,
                        requestId,
                        performance: {
                            duration: Date.now() - startTime,
                            retryCount: 0
                        }
                    }
                }
            }

            return {
                success: false,
                error: new VacationServiceError(
                    'Unexpected error occurred',
                    VacationErrorCodes.SERVER_ERROR,
                    500,
                    { originalError: error instanceof Error ? error.message : 'Unknown error' }
                ),
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        }
    }

    /**
     * Archives (soft deletes) a vacation
     */
    async archiveVacation(vacationId: string): Promise<VacationServiceResponse<{ vacationId: string }>> {
        const requestId = this.generateRequestId()
        const cacheKey = `vacation:${vacationId}`
        const startTime = Date.now()

        try {
            // Input validation
            if (!vacationId || typeof vacationId !== 'string') {
                throw new VacationServiceError(
                    'Invalid vacation ID provided',
                    VacationErrorCodes.VALIDATION_ERROR,
                    400
                )
            }

            // Archive via API
            const response = await this.enhancedFetch<{ vacationId: string }>(
                `${this.baseUrl}/${vacationId}`,
                { method: 'DELETE' }
            )

            if (!response.success) {
                throw new VacationServiceError(
                    'Failed to archive vacation',
                    VacationErrorCodes.SERVER_ERROR,
                    500
                )
            }

            // Invalidate all related caches
            this.cache.invalidate(cacheKey)
            this.cache.invalidatePattern(`vacation:${vacationId}:*`)

            return {
                success: true,
                data: { vacationId },
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }

        } catch (error) {
            console.error(`[VacationService] Error archiving vacation ${vacationId}:`, error)

            if (error instanceof VacationServiceError) {
                return {
                    success: false,
                    error,
                    metadata: {
                        fetchedAt: new Date().toISOString(),
                        cached: false,
                        requestId,
                        performance: {
                            duration: Date.now() - startTime,
                            retryCount: 0
                        }
                    }
                }
            }

            return {
                success: false,
                error: new VacationServiceError(
                    'Unexpected error occurred',
                    VacationErrorCodes.SERVER_ERROR,
                    500,
                    { originalError: error instanceof Error ? error.message : 'Unknown error' }
                ),
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        }
    }

    /**
     * Clears all cached vacation data
     */
    clearCache(): void {
        this.cache.clear()
    }

    /**
     * Gets cache statistics for monitoring
     */
    getCacheStats(): { size: number } {
        return {
            size: this.cache.size()
        }
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const vacationService = new VacationService()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Formats vacation data for display purposes
 */
export function formatVacationForDisplay(vacation: Vacation) {
    return {
        ...vacation,
        budgetFormatted: vacation.budget?.total
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(vacation.budget.total)
            : null,
        budgetPerPersonFormatted: vacation.budgetPerPerson
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(vacation.budgetPerPerson)
            : null,
        budgetPerDayFormatted: vacation.budgetPerDay
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(vacation.budgetPerDay)
            : null,
        startDateFormatted: new Date(vacation.startDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        endDateFormatted: new Date(vacation.endDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
}

/**
 * Determines the appropriate ticket type based on vacation data
 */
export function getRecommendedTicketType(vacation: Vacation): string {
    if (vacation.durationDays === 1) {
        return 'Single Day Ticket'
    } else if (vacation.durationDays <= 3) {
        return 'Multi-Day Ticket'
    } else if (vacation.durationDays <= 7) {
        return 'Park Hopper'
    } else {
        return 'Park Hopper Plus'
    }
}