/**
 * Unified Error Handling System
 * Consolidates all API error handling into a single, comprehensive system
 * 
 * @module api/unified-error-handler
 * @category API Utilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { errorResponse, ErrorCodes } from './response'

/**
 * Base API Error class with enhanced functionality
 */
export class APIError extends Error {
    public readonly code: string
    public readonly statusCode: number
    public readonly details?: unknown
    public readonly isOperational: boolean = true
    public readonly retryAfter?: number

    constructor(
        message: string,
        code: string = ErrorCodes.SERVER_ERROR,
        statusCode: number = 500,
        details?: unknown,
        retryAfter?: number
    ) {
        super(message)
        this.name = 'APIError'
        this.code = code
        this.statusCode = statusCode
        this.details = details
        this.retryAfter = retryAfter
        
        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError)
        }
    }
}

/**
 * Validation Error - for request validation failures
 */
export class ValidationError extends APIError {
    constructor(message: string, details?: unknown) {
        super(message, ErrorCodes.VALIDATION, 400, details)
        this.name = 'ValidationError'
    }
}

/**
 * Authentication Error - for authentication failures
 */
export class AuthenticationError extends APIError {
    constructor(message: string = 'Authentication required') {
        super(message, ErrorCodes.AUTHENTICATION, 401)
        this.name = 'AuthenticationError'
    }
}

/**
 * Authorization Error - for insufficient permissions
 */
export class AuthorizationError extends APIError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, ErrorCodes.AUTHORIZATION, 403)
        this.name = 'AuthorizationError'
    }
}

/**
 * Not Found Error - for missing resources
 */
export class NotFoundError extends APIError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, ErrorCodes.NOT_FOUND, 404)
        this.name = 'NotFoundError'
    }
}

/**
 * Rate Limit Error - for rate limiting violations
 */
export class RateLimitError extends APIError {
    constructor(tier: string, retryAfter: number) {
        super(
            `Rate limit exceeded for ${tier} tier`,
            ErrorCodes.RATE_LIMIT,
            429,
            { tier, retryAfter },
            retryAfter
        )
        this.name = 'RateLimitError'
    }
}

/**
 * External Service Error - for third-party service failures
 */
export class ExternalServiceError extends APIError {
    constructor(service: string, originalError?: Error) {
        super(
            `External service error: ${service}`,
            'EXTERNAL_SERVICE_ERROR',
            502,
            { service, originalError: originalError?.message }
        )
        this.name = 'ExternalServiceError'
    }
}

/**
 * Logger interface for secure error logging
 */
interface Logger {
    error: (message: string, context?: Record<string, unknown>) => void
    warn: (message: string, context?: Record<string, unknown>) => void
    info: (message: string, context?: Record<string, unknown>) => void
}

/**
 * Enhanced console logger with structured output
 */
const defaultLogger: Logger = {
    error: (message: string, context?: Record<string, unknown>) => {
        console.error(`[API_ERROR] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    },
    warn: (message: string, context?: Record<string, unknown>) => {
        console.warn(`[API_WARN] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    },
    info: (message: string, context?: Record<string, unknown>) => {
        console.info(`[API_INFO] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    }
}

/**
 * Configuration for error handler behavior
 */
interface ErrorHandlerConfig {
    logger?: Logger
    includeErrorId?: boolean
    exposeStackTrace?: boolean
    enableMetrics?: boolean
}

/**
 * Global error handler for API routes with enhanced logging and metrics
 * 
 * @param error - The error that occurred
 * @param request - The NextRequest object
 * @param config - Configuration options
 * @returns Standardized error response
 */
export function handleApiError(
    error: unknown,
    request: NextRequest,
    config: ErrorHandlerConfig = {}
): NextResponse {
    const {
        logger = defaultLogger,
        includeErrorId = true,
        exposeStackTrace = process.env.NODE_ENV === 'development',
        enableMetrics = true
    } = config

    // Generate unique error ID for tracking
    const errorId = includeErrorId ? crypto.randomUUID() : undefined

    // Extract request context
    const requestContext = {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        ip: getClientIP(request),
        timestamp: new Date().toISOString(),
        errorId
    }

    // Metrics collection (if enabled)
    if (enableMetrics) {
        collectErrorMetrics(error, requestContext)
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

        const response = errorResponse(
            error.message,
            error.code,
            error.statusCode,
            errorId ? { errorId, ...(error.details && { details: error.details }) } : error.details
        )

        // Add retry-after header if specified
        if (error.retryAfter) {
            response.headers.set('Retry-After', error.retryAfter.toString())
        }

        return response
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
 * Helper functions for creating specific error types
 */
export const createValidationError = (message: string, details?: unknown): ValidationError =>
    new ValidationError(message, details)

export const createAuthError = (message: string = 'Authentication required'): AuthenticationError =>
    new AuthenticationError(message)

export const createAuthorizationError = (message: string = 'Insufficient permissions'): AuthorizationError =>
    new AuthorizationError(message)

export const createNotFoundError = (resource: string = 'Resource'): NotFoundError =>
    new NotFoundError(resource)

export const createRateLimitError = (tier: string, retryAfter: number): RateLimitError =>
    new RateLimitError(tier, retryAfter)

export const createExternalServiceError = (service: string, originalError?: Error): ExternalServiceError =>
    new ExternalServiceError(service, originalError)

/**
 * Utility function to extract client IP
 */
function getClientIP(request: NextRequest): string {
    const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip',
        'x-client-ip',
        'x-cluster-client-ip'
    ]
    
    for (const header of headers) {
        const value = request.headers.get(header)
        if (value) {
            return value.split(',')[0].trim()
        }
    }
    
    return 'unknown'
}

/**
 * Metrics collection function (placeholder for future implementation)
 */
function collectErrorMetrics(error: unknown, context: Record<string, unknown>) {
    // TODO: Implement metrics collection (e.g., send to monitoring service)
    // This could send data to services like DataDog, New Relic, etc.
    if (process.env.NODE_ENV === 'development') {
        console.debug('[METRICS] Error occurred:', {
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            ...context
        })
    }
}

/**
 * Export all error classes and utilities
 */
export {
    APIError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    ExternalServiceError
}