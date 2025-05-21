/**
 * API request validation utilities
 * Provides standardized request validation with Zod schemas
 */

import { NextRequest } from 'next/server'
import { ZodSchema, z } from 'zod'
import { errorResponse } from './response'
import { sanitizeInput } from '@/lib/utils/sanitize'

/**
 * Validates and sanitizes API request query parameters against a schema
 */
export async function validateQuery<T extends ZodSchema>(
    request: NextRequest,
    schema: T
) {
    try {
        const searchParams = request.nextUrl.searchParams
        const params: Record<string, string | string[]> = {}

        // Convert URL search params to object
        searchParams.forEach((value, key) => {
            // Sanitize input to prevent injection attacks
            const sanitizedValue = sanitizeInput(value)

            // Handle array params (param[]=value1&param[]=value2)
            if (key.endsWith('[]')) {
                const arrayKey = key.slice(0, -2)
                if (!params[arrayKey]) {
                    params[arrayKey] = []
                }
                if (Array.isArray(params[arrayKey])) {
                    (params[arrayKey] as string[]).push(sanitizedValue)
                }
            } else {
                params[key] = sanitizedValue
            }
        })

        // Parse through schema
        const result = schema.safeParse(params)

        if (!result.success) {
            return {
                success: false,
                error: errorResponse(
                    'Invalid query parameters',
                    'VALIDATION_ERROR',
                    400
                ),
                data: undefined
            }
        }

        return {
            success: true,
            error: undefined,
            data: result.data
        }
    } catch (error) {
        console.error('Error validating query parameters:', error)
        return {
            success: false,
            error: errorResponse(
                'Failed to validate request',
                'INTERNAL_SERVER_ERROR',
                500
            ),
            data: undefined
        }
    }
}

/**
 * Validates and sanitizes API request body against a schema
 */
export async function validateBody<T extends ZodSchema>(
    request: NextRequest,
    schema: T
) {
    try {
        // Parse and sanitize body
        const body = await request.json()
        const sanitizedBody = sanitizeObject(body)

        // Parse through schema
        const result = schema.safeParse(sanitizedBody)

        if (!result.success) {
            return {
                success: false,
                error: errorResponse(
                    'Invalid request body',
                    'VALIDATION_ERROR',
                    400
                ),
                data: undefined
            }
        }

        return {
            success: true,
            error: undefined,
            data: result.data
        }
    } catch (error) {
        console.error('Error validating request body:', error)
        return {
            success: false,
            error: errorResponse(
                'Failed to validate request',
                'INTERNAL_SERVER_ERROR',
                500
            ),
            data: undefined
        }
    }
}

/**
 * Recursively sanitizes an object's string values
 */
function sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? sanitizeInput(obj) : obj
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item))
    }

    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value)
    }

    return sanitized
}