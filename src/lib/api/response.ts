/**
 * Utility functions for standardized API responses
 *
 * @module api/response
 * @category API Utilities
 */

import { NextResponse } from 'next/server'

/**
 * Standard API response format
 *
 * @template T - The type of data returned in the response
 */
export interface ApiResponse<T = unknown> {
    /** Indicates whether the request was successful */
    success: boolean
    /** The data returned by the API (only present in successful responses) */
    data?: T
    /** Error details (only present in error responses) */
    error?: {
        /** Human-readable error message */
        message: string
        /** Machine-readable error code */
        code: string
    }
}

/**
 * Creates a standard success response
 *
 * @template T - The type of data returned in the response
 * @param data - The data to include in the response
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse object with standardized format
 *
 * @example
 * ```ts
 * // Return a successful response with data
 * return successResponse({ users: [{ id: 1, name: 'John' }] })
 *
 * // Return a created response with the new resource
 * return successResponse(newUser, 201)
 * ```
 */
export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json<ApiResponse<T>>(
        {
            success: true,
            data
        },
        { status }
    )
}

/**
 * Creates a standard error response
 *
 * @param message - Human-readable error message
 * @param code - Machine-readable error code
 * @param status - HTTP status code (defaults to 500)
 * @returns NextResponse object with standardized format
 *
 * @example
 * ```ts
 * // Return a validation error
 * return errorResponse(
 *   'Invalid request parameters',
 *   'VALIDATION_ERROR',
 *   400
 * )
 *
 * // Return a not found error
 * return errorResponse(
 *   'User not found',
 *   'USER_NOT_FOUND',
 *   404
 * )
 * ```
 */
export function errorResponse(message: string, code: string, status = 500) {
    return NextResponse.json<ApiResponse<never>>(
        {
            success: false,
            error: {
                message,
                code
            }
        },
        { status }
    )
}

/**
 * Common error codes used throughout the API
 */
export const ErrorCodes = {
    /** Resource not found */
    NOT_FOUND: "RESOURCE_NOT_FOUND",
    /** Validation failed */
    VALIDATION: "VALIDATION_ERROR",
    /** Authentication failed */
    AUTHENTICATION: "AUTHENTICATION_ERROR",
    /** Authorization failed */
    AUTHORIZATION: "AUTHORIZATION_ERROR",
    /** Rate limit exceeded */
    RATE_LIMIT: "RATE_LIMIT_EXCEEDED",
    /** Server error */
    SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const