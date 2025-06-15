/**
 * API Response Standardization Utilities
 * Tools for migrating and standardizing API responses across all endpoints
 * 
 * @module api/response-standardizer
 * @category API Utilities
 */

import { NextResponse } from 'next/server'
import { successResponse, errorResponse, ErrorCodes } from './response'

/**
 * Enhanced success response with optional metadata
 */
export interface StandardSuccessResponse<T = unknown> {
    success: true
    data: T
    meta?: {
        timestamp?: string
        cached?: boolean
        dataSource?: string
        requestId?: string
        version?: string
    }
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrevious: boolean
    }
    filters?: Record<string, unknown>
}

/**
 * Enhanced error response with detailed information
 */
export interface StandardErrorResponse {
    success: false
    error: {
        message: string
        code: string
        details?: unknown
        timestamp?: string
        requestId?: string
        path?: string
    }
}

/**
 * Creates an enhanced success response with metadata
 */
export function enhancedSuccessResponse<T>(
    data: T,
    options: {
        status?: number
        meta?: {
            cached?: boolean
            dataSource?: string
            requestId?: string
            version?: string
        }
        pagination?: {
            page: number
            limit: number
            total: number
        }
        filters?: Record<string, unknown>
    } = {}
): NextResponse {
    const { status = 200, meta, pagination, filters } = options

    const response: StandardSuccessResponse<T> = {
        success: true,
        data
    }

    // Add metadata if provided
    if (meta || true) {
        response.meta = {
            timestamp: new Date().toISOString(),
            ...meta
        }
    }

    // Add pagination if provided
    if (pagination) {
        const { page, limit, total } = pagination
        const totalPages = Math.ceil(total / limit)
        
        response.pagination = {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    }

    // Add filters if provided
    if (filters) {
        response.filters = filters
    }

    return NextResponse.json(response, { status })
}

/**
 * Creates an enhanced error response with detailed information
 */
export function enhancedErrorResponse(
    message: string,
    code: string = ErrorCodes.SERVER_ERROR,
    status: number = 500,
    options: {
        details?: unknown
        requestId?: string
        path?: string
    } = {}
): NextResponse {
    const { details, requestId, path } = options

    const response: StandardErrorResponse = {
        success: false,
        error: {
            message,
            code,
            timestamp: new Date().toISOString(),
            ...(details && { details }),
            ...(requestId && { requestId }),
            ...(path && { path })
        }
    }

    return NextResponse.json(response, { status })
}

/**
 * Migration utilities for existing endpoints
 */
export class ResponseMigrator {
    /**
     * Converts legacy response patterns to standard format
     */
    static migrateResponse(legacyResponse: unknown): NextResponse {
        // Handle already standardized responses
        if (this.isStandardResponse(legacyResponse)) {
            return NextResponse.json(legacyResponse)
        }

        // Handle raw data responses
        if (this.isRawDataResponse(legacyResponse)) {
            return enhancedSuccessResponse(legacyResponse)
        }

        // Handle partial standard responses
        if (this.isPartialStandardResponse(legacyResponse)) {
            return this.upgradePartialResponse(legacyResponse)
        }

        // Default: wrap as success response
        return enhancedSuccessResponse(legacyResponse)
    }

    /**
     * Checks if response already follows standard format
     */
    private static isStandardResponse(response: unknown): boolean {
        return (
            typeof response === 'object' &&
            response !== null &&
            'success' in response &&
            (('data' in response) || ('error' in response))
        )
    }

    /**
     * Checks if response is raw data (needs wrapping)
     */
    private static isRawDataResponse(response: unknown): boolean {
        if (typeof response !== 'object' || response === null) {
            return false
        }

        const obj = response as Record<string, unknown>
        return !('success' in obj) && !('error' in obj)
    }

    /**
     * Checks if response is partially standard (needs upgrading)
     */
    private static isPartialStandardResponse(response: unknown): boolean {
        if (typeof response !== 'object' || response === null) {
            return false
        }

        const obj = response as Record<string, unknown>
        return 'success' in obj && obj.success === true && !('meta' in obj)
    }

    /**
     * Upgrades partial standard responses
     */
    private static upgradePartialResponse(response: unknown): NextResponse {
        const obj = response as Record<string, unknown>
        
        const upgraded = {
            ...obj,
            meta: {
                timestamp: new Date().toISOString(),
                version: '2.0'
            }
        }

        return NextResponse.json(upgraded)
    }
}

/**
 * Middleware for automatic response standardization
 */
export function withResponseStandardization(
    handler: (...args: unknown[]) => Promise<NextResponse> | NextResponse
) {
    return async (...args: unknown[]) => {
        try {
            const response = await handler(...args)
            
            // If response is already a NextResponse, return as-is
            if (response instanceof NextResponse) {
                return response
            }

            // Otherwise, standardize the response
            return ResponseMigrator.migrateResponse(response)
        } catch (error) {
            // Return standardized error response
            return enhancedErrorResponse(
                error instanceof Error ? error.message : 'An unexpected error occurred',
                ErrorCodes.SERVER_ERROR,
                500,
                {
                    details: error instanceof Error ? error.stack : String(error)
                }
            )
        }
    }
}

/**
 * Response validation utilities
 */
export class ResponseValidator {
    /**
     * Validates that a response follows the standard format
     */
    static validateStandardResponse(response: unknown): {
        isValid: boolean
        errors: string[]
        suggestions: string[]
    } {
        const errors: string[] = []
        const suggestions: string[] = []

        if (typeof response !== 'object' || response === null) {
            errors.push('Response must be an object')
            return { isValid: false, errors, suggestions }
        }

        const obj = response as Record<string, unknown>

        // Check for success field
        if (!('success' in obj)) {
            errors.push('Response must include "success" field')
            suggestions.push('Add "success: true" for successful responses')
        } else if (typeof obj.success !== 'boolean') {
            errors.push('Success field must be boolean')
        }

        // Check success response structure
        if (obj.success === true) {
            if (!('data' in obj)) {
                errors.push('Success responses must include "data" field')
                suggestions.push('Wrap your response data in a "data" field')
            }

            if (!('meta' in obj)) {
                suggestions.push('Consider adding metadata with timestamp and other info')
            }
        }

        // Check error response structure
        if (obj.success === false) {
            if (!('error' in obj)) {
                errors.push('Error responses must include "error" field')
            } else {
                const error = obj.error as Record<string, unknown>
                
                if (!('message' in error)) {
                    errors.push('Error must include "message" field')
                }
                
                if (!('code' in error)) {
                    errors.push('Error must include "code" field')
                    suggestions.push('Use ErrorCodes constants for consistent error codes')
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            suggestions
        }
    }

    /**
     * Generates a migration report for an API endpoint
     */
    static generateMigrationReport(
        endpoint: string,
        sampleResponses: unknown[]
    ): {
        endpoint: string
        compliant: number
        nonCompliant: number
        issues: string[]
        recommendations: string[]
    } {
        const issues: string[] = []
        const recommendations: string[] = []
        let compliant = 0
        let nonCompliant = 0

        for (const response of sampleResponses) {
            const validation = this.validateStandardResponse(response)
            
            if (validation.isValid) {
                compliant++
            } else {
                nonCompliant++
                issues.push(...validation.errors)
                recommendations.push(...validation.suggestions)
            }
        }

        // Deduplicate issues and recommendations
        const uniqueIssues = [...new Set(issues)]
        const uniqueRecommendations = [...new Set(recommendations)]

        return {
            endpoint,
            compliant,
            nonCompliant,
            issues: uniqueIssues,
            recommendations: uniqueRecommendations
        }
    }
}

/**
 * Common response patterns for different types of endpoints
 */
export const ResponsePatterns = {
    /**
     * Pattern for paginated list endpoints
     */
    paginatedList<T>(
        items: T[],
        pagination: { page: number; limit: number; total: number },
        filters?: Record<string, unknown>
    ) {
        return enhancedSuccessResponse(items, { pagination, filters })
    },

    /**
     * Pattern for single resource endpoints
     */
    singleResource<T>(resource: T, cached: boolean = false) {
        return enhancedSuccessResponse(resource, {
            meta: { cached, dataSource: 'database' }
        })
    },

    /**
     * Pattern for aggregated data endpoints
     */
    aggregatedData<T>(
        data: T,
        metadata: { 
            dataSource: string
            aggregationPeriod?: string
            lastUpdated?: string
        }
    ) {
        return enhancedSuccessResponse(data, { meta: metadata })
    },

    /**
     * Pattern for real-time data endpoints
     */
    realTimeData<T>(data: T, lastSync: Date) {
        return enhancedSuccessResponse(data, {
            meta: {
                dataSource: 'real-time',
                lastSync: lastSync.toISOString(),
                cached: false
            }
        })
    },

    /**
     * Pattern for health check endpoints
     */
    healthCheck(status: 'ok' | 'degraded' | 'down', details?: Record<string, unknown>) {
        return enhancedSuccessResponse(
            { status, details },
            { meta: { dataSource: 'internal' } }
        )
    }
}

/**
 * Export all utilities
 */
export {
    enhancedSuccessResponse,
    enhancedErrorResponse,
    ResponseMigrator,
    ResponseValidator,
    withResponseStandardization
}