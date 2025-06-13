/**
 * Centralized validation utilities for API routes
 * 
 * @module api/validation
 * @category API Utilities
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createValidationError } from './error-handler'

/**
 * Request validation result
 */
export type ValidationResult<T> =
    | {
        success: true
        data: T
    }
    | {
        success: false
        error: z.ZodError
    }

/**
 * Validation options
 */
export interface ValidationOptions {
    /** Transform the data after validation */
    transform?: boolean
    /** Strip unknown keys */
    strip?: boolean
    /** Custom error message */
    errorMessage?: string
}

/**
 * Validate request body with Zod schema
 * 
 * @param request - The NextRequest object
 * @param schema - Zod schema for validation
 * @param options - Validation options
 * @returns Validated data or throws APIError
 */
export async function validateRequestBody<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>,
    options: ValidationOptions = {}
): Promise<T> {
    const { transform = true, strip = true, errorMessage } = options

    try {
        // Check content type
        const contentType = request.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            throw createValidationError(
                errorMessage || 'Invalid content type. Expected application/json',
                { expectedContentType: 'application/json', receivedContentType: contentType }
            )
        }

        const body = await request.json()
        
        let processedSchema = schema
        if (strip) {
            processedSchema = schema.strip ? schema.strip() : schema
        }

        const result = transform 
            ? processedSchema.parse(body)
            : processedSchema.safeParse(body)

        if (!transform && !result.success) {
            throw createValidationError(
                errorMessage || 'Request validation failed',
                { issues: result.error.issues }
            )
        }

        return transform ? result : result.data
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw createValidationError(
                errorMessage || 'Invalid JSON in request body',
                { parseError: error.message }
            )
        }
        
        if (error instanceof z.ZodError) {
            throw createValidationError(
                errorMessage || 'Request validation failed',
                { issues: error.issues }
            )
        }

        // Re-throw APIErrors
        throw error
    }
}

/**
 * Validate query parameters with Zod schema
 * 
 * @param request - The NextRequest object
 * @param schema - Zod schema for validation
 * @param options - Validation options
 * @returns Validated data or throws APIError
 */
export function validateQueryParams<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>,
    options: ValidationOptions = {}
): T {
    const { transform = true, strip = true, errorMessage } = options

    try {
        const searchParams = request.nextUrl.searchParams
        
        // Convert URLSearchParams to object
        const params: Record<string, string | string[]> = {}
        
        for (const [key, value] of searchParams.entries()) {
            if (params[key]) {
                // Handle multiple values for the same key
                if (Array.isArray(params[key])) {
                    (params[key] as string[]).push(value)
                } else {
                    params[key] = [params[key] as string, value]
                }
            } else {
                params[key] = value
            }
        }

        let processedSchema = schema
        if (strip) {
            processedSchema = schema.strip ? schema.strip() : schema
        }

        const result = transform 
            ? processedSchema.parse(params)
            : processedSchema.safeParse(params)

        if (!transform && !result.success) {
            throw createValidationError(
                errorMessage || 'Query parameter validation failed',
                { issues: result.error.issues }
            )
        }

        return transform ? result : result.data
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createValidationError(
                errorMessage || 'Query parameter validation failed',
                { issues: error.issues }
            )
        }

        // Re-throw APIErrors
        throw error
    }
}

/**
 * Validate path parameters with Zod schema
 * 
 * @param params - The params object from route context
 * @param schema - Zod schema for validation
 * @param options - Validation options
 * @returns Validated data or throws APIError
 */
export function validatePathParams<T>(
    params: unknown,
    schema: z.ZodSchema<T>,
    options: ValidationOptions = {}
): T {
    const { transform = true, strip = true, errorMessage } = options

    try {
        let processedSchema = schema
        if (strip) {
            processedSchema = schema.strip ? schema.strip() : schema
        }

        const result = transform 
            ? processedSchema.parse(params)
            : processedSchema.safeParse(params)

        if (!transform && !result.success) {
            throw createValidationError(
                errorMessage || 'Path parameter validation failed',
                { issues: result.error.issues }
            )
        }

        return transform ? result : result.data
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createValidationError(
                errorMessage || 'Path parameter validation failed',
                { issues: error.issues }
            )
        }

        // Re-throw APIErrors
        throw error
    }
}

/**
 * Validate request headers with Zod schema
 * 
 * @param request - The NextRequest object
 * @param schema - Zod schema for validation
 * @param options - Validation options
 * @returns Validated data or throws APIError
 */
export function validateHeaders<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>,
    options: ValidationOptions = {}
): T {
    const { transform = true, strip = true, errorMessage } = options

    try {
        // Convert Headers to object
        const headers: Record<string, string> = {}
        request.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value
        })

        let processedSchema = schema
        if (strip) {
            processedSchema = schema.strip ? schema.strip() : schema
        }

        const result = transform 
            ? processedSchema.parse(headers)
            : processedSchema.safeParse(headers)

        if (!transform && !result.success) {
            throw createValidationError(
                errorMessage || 'Header validation failed',
                { issues: result.error.issues }
            )
        }

        return transform ? result : result.data
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createValidationError(
                errorMessage || 'Header validation failed',
                { issues: error.issues }
            )
        }

        // Re-throw APIErrors
        throw error
    }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
    /** Standard pagination parameters */
    pagination: z.object({
        page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 100) : 20),
        offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0)
    }),

    /** Standard sorting parameters */
    sorting: z.object({
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
    }),

    /** Standard filtering parameters */
    filters: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional()
    }),

    /** MongoDB ObjectId validation */
    objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),

    /** UUID validation */
    uuid: z.string().uuid('Invalid UUID format'),

    /** Email validation */
    email: z.string().email('Invalid email format'),

    /** URL validation */
    url: z.string().url('Invalid URL format'),

    /** Phone number validation (basic) */
    phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format'),

    /** Geographic coordinates */
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }),

    /** Date range validation */
    dateRange: z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime()
    }).refine(
        data => new Date(data.startDate) <= new Date(data.endDate),
        { message: 'Start date must be before or equal to end date' }
    ),

    /** Disney park specific validations */
    disney: {
        parkId: z.enum(['magic-kingdom', 'epcot', 'hollywood-studios', 'animal-kingdom']),
        attractionId: z.string().min(1),
        restaurantId: z.string().min(1),
        resortId: z.string().min(1)
    }
}

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
        .substring(0, 1000) // Limit length
}

/**
 * Sanitize object inputs recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj }
    
    for (const [key, value] of Object.entries(sanitized)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value)
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value)
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
                typeof item === 'string' ? sanitizeString(item) :
                typeof item === 'object' ? sanitizeObject(item) : item
            )
        }
    }
    
    return sanitized
}

/**
 * Validation middleware decorator
 */
export interface ValidationConfig<TBody = any, TQuery = any, TParams = any, THeaders = any> {
    body?: z.ZodSchema<TBody>
    query?: z.ZodSchema<TQuery>
    params?: z.ZodSchema<TParams>
    headers?: z.ZodSchema<THeaders>
    options?: ValidationOptions
}

/**
 * Middleware that validates request data
 */
export function withValidation<TBody = any, TQuery = any, TParams = any, THeaders = any>(
    config: ValidationConfig<TBody, TQuery, TParams, THeaders>
) {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value

        descriptor.value = async function (request: NextRequest, context?: { params?: TParams }) {
            const validatedData: any = {}

            // Validate body if schema provided
            if (config.body) {
                validatedData.body = await validateRequestBody(request, config.body, config.options)
            }

            // Validate query parameters if schema provided
            if (config.query) {
                validatedData.query = validateQueryParams(request, config.query, config.options)
            }

            // Validate path parameters if schema provided
            if (config.params && context?.params) {
                validatedData.params = validatePathParams(context.params, config.params, config.options)
            }

            // Validate headers if schema provided
            if (config.headers) {
                validatedData.headers = validateHeaders(request, config.headers, config.options)
            }

            // Call original method with validated data
            return method.call(this, request, { ...context, validated: validatedData })
        }

        return descriptor
    }
}