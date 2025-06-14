/**
 * API validation utilities for request handling
 * 
 * @module api/validation
 * @category API Utilities
 */

import { NextRequest } from 'next/server'
import { ZodSchema, z } from 'zod'
import { createValidationError } from './error-handler'

/**
 * Validates and parses query parameters from a NextRequest
 * 
 * @param request - The NextRequest object
 * @param schema - Zod schema for validation
 * @returns Parsed and validated query parameters
 * 
 * @example
 * ```ts
 * const QuerySchema = z.object({
 *   page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
 *   limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20)
 * })
 * 
 * const query = validateQueryParams(request, QuerySchema)
 * ```
 */
export function validateQueryParams<T>(request: NextRequest, schema: ZodSchema<T>): T {
    const searchParams = request.nextUrl.searchParams
    const queryObject: Record<string, string | string[]> = {}
    
    // Convert URLSearchParams to object
    for (const [key, value] of searchParams.entries()) {
        if (queryObject[key]) {
            // Handle multiple values for same parameter
            if (Array.isArray(queryObject[key])) {
                (queryObject[key] as string[]).push(value)
            } else {
                queryObject[key] = [queryObject[key] as string, value]
            }
        } else {
            queryObject[key] = value
        }
    }
    
    try {
        return schema.parse(queryObject)
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createValidationError('Invalid query parameters', error.issues)
        }
        throw error
    }
}

/**
 * Validates query parameters and returns a result object with success/error status
 * 
 * @param request - The NextRequest object
 * @param schema - Zod schema for validation
 * @returns Object containing success status and data or error
 */
export async function validateQuery<T>(
    request: NextRequest, 
    schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: Response }> {
    try {
        const data = validateQueryParams(request, schema)
        return { success: true, data }
    } catch (error) {
        // Import error response here to avoid circular dependencies
        const { errorResponse } = await import('./response')
        
        if (error instanceof Error && error.message.includes('Invalid query parameters')) {
            return {
                success: false,
                error: errorResponse('Invalid query parameters', 'VALIDATION_ERROR', 400)
            }
        }
        
        return {
            success: false,
            error: errorResponse('Validation failed', 'VALIDATION_ERROR', 400)
        }
    }
}

/**
 * Validates and parses path parameters
 * 
 * @param params - The params object from route context
 * @param schema - Zod schema for validation
 * @returns Parsed and validated path parameters
 * 
 * @example
 * ```ts
 * const ParamsSchema = z.object({
 *   parkId: z.string().min(1, 'Park ID is required'),
 *   attractionId: z.string().min(1, 'Attraction ID is required')
 * })
 * 
 * const { parkId, attractionId } = validatePathParams(await params, ParamsSchema)
 * ```
 */
export function validatePathParams<T>(params: Record<string, string>, schema: ZodSchema<T>): T {
    try {
        return schema.parse(params)
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createValidationError('Invalid path parameters', error.issues)
        }
        throw error
    }
}

/**
 * Validates and parses JSON request body
 * 
 * @param request - The NextRequest object
 * @param schema - Zod schema for validation
 * @returns Parsed and validated request body
 * 
 * @example
 * ```ts
 * const BodySchema = z.object({
 *   name: z.string().min(1, 'Name is required'),
 *   email: z.string().email('Invalid email format')
 * })
 * 
 * const body = await validateRequestBody(request, BodySchema)
 * ```
 */
export async function validateRequestBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
    let body: unknown
    
    try {
        body = await request.json()
    } catch (error) {
        throw createValidationError('Invalid JSON in request body')
    }
    
    try {
        return schema.parse(body)
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createValidationError('Invalid request body', error.issues)
        }
        throw error
    }
}

/**
 * Sanitizes a string input to prevent injection attacks
 * 
 * @param input - The string to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 * 
 * @example
 * ```ts
 * const safeSearch = sanitizeString(searchParams.get('search'))
 * ```
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
        return ''
    }
    
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, '') // Remove basic HTML characters
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
}

/**
 * Common validation schemas for reuse across API routes
 */
export const CommonSchemas = {
    // Disney-specific schemas
    disney: {
        parkId: z.string().min(1, 'Park ID is required').regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid park ID format'),
        attractionId: z.string().min(1, 'Attraction ID is required').regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid attraction ID format'),
        restaurantId: z.string().min(1, 'Restaurant ID is required').regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid restaurant ID format'),
        resortId: z.string().min(1, 'Resort ID is required').regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid resort ID format'),
    },
    
    // Pagination schemas
    pagination: {
        page: z.string().optional().transform(val => val ? Math.max(1, parseInt(val, 10)) : 1),
        limit: z.string().optional().transform(val => val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20),
        offset: z.string().optional().transform(val => val ? Math.max(0, parseInt(val, 10)) : 0),
    },
    
    // Date/time schemas
    dateTime: {
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        year: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
        month: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
        timestamp: z.string().datetime('Invalid timestamp format'),
    },
    
    // User input schemas
    userInput: {
        search: z.string().optional().transform(val => val ? sanitizeString(val, 200) : undefined),
        email: z.string().email('Invalid email format'),
        uid: z.string().min(1, 'User ID is required'),
        displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
    },
    
    // Geographic schemas
    location: {
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radius: z.number().min(0).max(50000), // Max 50km radius
    }
}

/**
 * Validation middleware factory that creates reusable validation functions
 * 
 * @param config - Validation configuration
 * @returns Validation middleware function
 * 
 * @example
 * ```ts
 * const validateParkRequest = createValidationMiddleware({
 *   pathParams: z.object({ parkId: CommonSchemas.disney.parkId }),
 *   queryParams: z.object({ 
 *     entity: z.enum(['details', 'attractions', 'live']).optional() 
 *   })
 * })
 * 
 * export const GET = validateParkRequest(async (request, { params, query }) => {
 *   // params and query are validated and typed
 *   return successResponse({ parkId: params.parkId, entity: query.entity })
 * })
 * ```
 */
export function createValidationMiddleware<
    TPathParams = Record<string, string>,
    TQueryParams = Record<string, unknown>,
    TBody = unknown
>(config: {
    pathParams?: ZodSchema<TPathParams>
    queryParams?: ZodSchema<TQueryParams>
    body?: ZodSchema<TBody>
}) {
    return function<TContext extends Record<string, unknown>>(
        handler: (
            request: NextRequest,
            context: TContext & {
                params?: TPathParams
                query?: TQueryParams
                body?: TBody
            }
        ) => Promise<Response>
    ) {
        return async (request: NextRequest, context: TContext) => {
            const validatedContext = { ...context } as TContext & {
                params?: TPathParams
                query?: TQueryParams
                body?: TBody
            }
            
            // Validate path parameters
            if (config.pathParams && 'params' in context) {
                const params = context.params as Promise<Record<string, string>> | Record<string, string>
                const resolvedParams = params instanceof Promise ? await params : params
                validatedContext.params = validatePathParams(resolvedParams, config.pathParams)
            }
            
            // Validate query parameters
            if (config.queryParams) {
                validatedContext.query = validateQueryParams(request, config.queryParams)
            }
            
            // Validate request body
            if (config.body) {
                validatedContext.body = await validateRequestBody(request, config.body)
            }
            
            return handler(request, validatedContext)
        }
    }
}