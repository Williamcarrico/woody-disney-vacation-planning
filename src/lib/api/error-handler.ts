/**
 * Centralized error handling utilities for API routes
 * 
 * @module api/error-handler
 * @category API Utilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { errorResponse, ErrorCodes } from './response'

/**
 * Enhanced error interface with additional context
 */
export interface ApiError extends Error {
    code?: string
    statusCode?: number
    details?: unknown
    isOperational?: boolean
}

/**
 * Creates a standardized API error
 */
export class APIError extends Error implements ApiError {
    public readonly code: string
    public readonly statusCode: number
    public readonly details?: unknown
    public readonly isOperational: boolean = true

    constructor(
        message: string,
        code: string = ErrorCodes.SERVER_ERROR,
        statusCode: number = 500,
        details?: unknown
    ) {
        super(message)
        this.name = 'APIError'
        this.code = code
        this.statusCode = statusCode
        this.details = details
        
        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError)
        }
    }
}

/**
 * Logger interface for secure error logging
 */
interface Logger {
    error: (message: string, context?: Record<string, unknown>) => void
    warn: (message: string, context?: Record<string, unknown>) => void
}

/**
 * Simple console logger with structured output
 */
const defaultLogger: Logger = {
    error: (message: string, context?: Record<string, unknown>) => {
        console.error(`[API_ERROR] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    },
    warn: (message: string, context?: Record<string, unknown>) => {
        console.warn(`[API_WARN] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    }
}

/**
 * Configuration for error handler behavior
 */
interface ErrorHandlerConfig {
    logger?: Logger
    includeErrorId?: boolean
    exposeStackTrace?: boolean
}

/**
 * Global error handler for API routes
 * 
 * @param error - The error that occurred
 * @param request - The NextRequest object
 * @param config - Configuration options
 * @returns Standardized error response
 * 
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   try {
 *     // Your API logic here
 *   } catch (error) {
 *     return handleApiError(error, request)
 *   }
 * }
 * ```
 */
export function handleApiError(
    error: unknown,
    request: NextRequest,
    config: ErrorHandlerConfig = {}
): NextResponse {
    const {
        logger = defaultLogger,
        includeErrorId = true,
        exposeStackTrace = process.env.NODE_ENV === 'development'
    } = config

    // Generate unique error ID for tracking
    const errorId = includeErrorId ? crypto.randomUUID() : undefined

    // Extract request context
    const requestContext = {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString(),
        errorId
    }

    // Handle different error types
    if (error instanceof APIError) {
        // Custom API errors - these are operational and expected
        logger.warn('API Error occurred', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            details: error.details,
            ...requestContext
        })

        return errorResponse(
            error.message,
            error.code,
            error.statusCode,
            errorId ? { errorId } : undefined
        )
    }

    if (error instanceof ZodError) {
        // Validation errors from Zod
        logger.warn('Validation Error occurred', {
            message: 'Request validation failed',
            issues: error.issues,
            ...requestContext
        })

        return errorResponse(
            'Invalid request data',
            ErrorCodes.VALIDATION,
            400,
            errorId ? { errorId, validationErrors: error.issues } : { validationErrors: error.issues }
        )
    }

    if (error instanceof Error) {
        // Standard JavaScript errors
        logger.error('Unexpected Error occurred', {
            message: error.message,
            name: error.name,
            stack: exposeStackTrace ? error.stack : undefined,
            ...requestContext
        })

        // Don't expose internal error details in production
        const publicMessage = process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An unexpected error occurred'

        return errorResponse(
            publicMessage,
            ErrorCodes.SERVER_ERROR,
            500,
            errorId ? { errorId } : undefined
        )
    }

    // Unknown error type
    logger.error('Unknown Error occurred', {
        error: String(error),
        type: typeof error,
        ...requestContext
    })

    return errorResponse(
        'An unexpected error occurred',
        ErrorCodes.SERVER_ERROR,
        500,
        errorId ? { errorId } : undefined
    )
}

/**
 * Middleware wrapper that automatically handles errors
 * 
 * @param handler - The API route handler
 * @param config - Configuration options
 * @returns Wrapped handler with error handling
 * 
 * @example
 * ```ts
 * export const GET = withErrorHandler(async (request: NextRequest) => {
 *   // Your API logic here - errors will be automatically handled
 *   const data = await someAsyncOperation()
 *   return successResponse(data)
 * })
 * ```
 */
export function withErrorHandler(
    handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
    config: ErrorHandlerConfig = {}
) {
    return async (request: NextRequest, context?: unknown) => {
        try {
            return await handler(request, context)
        } catch (error) {
            return handleApiError(error, request, config)
        }
    }
}

/**
 * Async wrapper that converts Promise rejections to APIErrors
 * 
 * @param promise - The promise to wrap
 * @param errorMessage - Custom error message
 * @param errorCode - Custom error code
 * @returns Promise that rejects with APIError
 */
export async function withApiError<T>(
    promise: Promise<T>,
    errorMessage: string,
    errorCode: string = ErrorCodes.SERVER_ERROR
): Promise<T> {
    try {
        return await promise
    } catch (error) {
        throw new APIError(
            errorMessage,
            errorCode,
            500,
            error instanceof Error ? error.message : String(error)
        )
    }
}

/**
 * Validation error helper
 */
export function createValidationError(message: string, details?: unknown): APIError {
    return new APIError(message, ErrorCodes.VALIDATION, 400, details)
}

/**
 * Authentication error helper
 */
export function createAuthError(message: string = 'Authentication required'): APIError {
    return new APIError(message, ErrorCodes.AUTHENTICATION, 401)
}

/**
 * Authorization error helper
 */
export function createAuthorizationError(message: string = 'Insufficient permissions'): APIError {
    return new APIError(message, ErrorCodes.AUTHORIZATION, 403)
}

/**
 * Not found error helper
 */
export function createNotFoundError(resource: string = 'Resource'): APIError {
    return new APIError(`${resource} not found`, ErrorCodes.NOT_FOUND, 404)
}

/**
 * Rate limit error helper
 */
export function createRateLimitError(message: string = 'Rate limit exceeded'): APIError {
    return new APIError(message, ErrorCodes.RATE_LIMIT, 429)
}