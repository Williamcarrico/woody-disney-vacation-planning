import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Response types
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  metadata: {
    requestId: string
    timestamp: string
    cached?: boolean
    version: string
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    suggestion?: string
  }
  metadata: {
    requestId: string
    timestamp: string
    version: string
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// Error codes enum
export enum ApiErrorCode {
  // Client errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  
  // Business logic errors
  INVALID_OPERATION = 'INVALID_OPERATION',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR'
}

// Error code to HTTP status mapping
const errorStatusMap: Record<ApiErrorCode, number> = {
  [ApiErrorCode.BAD_REQUEST]: 400,
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.VALIDATION_ERROR]: 422,
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ApiErrorCode.INTERNAL_ERROR]: 500,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.GATEWAY_TIMEOUT]: 504,
  [ApiErrorCode.INVALID_OPERATION]: 400,
  [ApiErrorCode.RESOURCE_EXHAUSTED]: 503,
  [ApiErrorCode.DATA_INTEGRITY_ERROR]: 500
}

// API version
const API_VERSION = '1.0.0'

// Response handler class
export class ApiResponseHandler {
  private static generateMetadata(cached = false): ApiSuccessResponse['metadata'] {
    return {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      cached,
      version: API_VERSION
    }
  }

  // Success response
  static success<T>(
    data: T,
    options?: {
      cached?: boolean
      headers?: HeadersInit
    }
  ): NextResponse<ApiSuccessResponse<T>> {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      metadata: this.generateMetadata(options?.cached)
    }

    return NextResponse.json(response, {
      status: 200,
      headers: options?.headers
    })
  }

  // Error response
  static error(
    code: ApiErrorCode,
    message: string,
    options?: {
      details?: any
      suggestion?: string
      headers?: HeadersInit
    }
  ): NextResponse<ApiErrorResponse> {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details: options?.details,
        suggestion: options?.suggestion
      },
      metadata: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
        version: API_VERSION
      }
    }

    return NextResponse.json(response, {
      status: errorStatusMap[code] || 500,
      headers: options?.headers
    })
  }

  // Handle common error types
  static handleError(
    error: unknown,
    context?: { operation?: string; resource?: string }
  ): NextResponse<ApiErrorResponse> {
    console.error('API Error:', {
      error,
      context,
      timestamp: new Date().toISOString()
    })

    // Zod validation errors
    if (error instanceof ZodError) {
      return this.error(
        ApiErrorCode.VALIDATION_ERROR,
        'Invalid request data',
        {
          details: error.errors,
          suggestion: 'Please check your request data and try again'
        }
      )
    }

    // Firebase/Firestore errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string }
      
      switch (firebaseError.code) {
        case 'permission-denied':
          return this.error(
            ApiErrorCode.FORBIDDEN,
            'You do not have permission to access this resource'
          )
        case 'not-found':
          return this.error(
            ApiErrorCode.NOT_FOUND,
            `${context?.resource || 'Resource'} not found`
          )
        case 'unauthenticated':
          return this.error(
            ApiErrorCode.UNAUTHORIZED,
            'Authentication required',
            { suggestion: 'Please sign in and try again' }
          )
        case 'resource-exhausted':
          return this.error(
            ApiErrorCode.RATE_LIMIT_EXCEEDED,
            'Too many requests',
            { suggestion: 'Please try again later' }
          )
        case 'unavailable':
          return this.error(
            ApiErrorCode.SERVICE_UNAVAILABLE,
            'Service temporarily unavailable',
            { suggestion: 'Please try again in a few moments' }
          )
        default:
          return this.error(
            ApiErrorCode.INTERNAL_ERROR,
            firebaseError.message || 'An unexpected error occurred'
          )
      }
    }

    // Standard errors
    if (error instanceof Error) {
      // Check for specific error patterns
      if (error.message.includes('fetch')) {
        return this.error(
          ApiErrorCode.GATEWAY_TIMEOUT,
          'Failed to fetch external data',
          { suggestion: 'The external service may be temporarily unavailable' }
        )
      }

      if (error.message.includes('timeout')) {
        return this.error(
          ApiErrorCode.GATEWAY_TIMEOUT,
          'Request timeout',
          { suggestion: 'The operation took too long. Please try again' }
        )
      }

      return this.error(
        ApiErrorCode.INTERNAL_ERROR,
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'An unexpected error occurred'
      )
    }

    // Unknown errors
    return this.error(
      ApiErrorCode.INTERNAL_ERROR,
      'An unexpected error occurred',
      {
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }
    )
  }

  // Not found response
  static notFound(resource: string): NextResponse<ApiErrorResponse> {
    return this.error(
      ApiErrorCode.NOT_FOUND,
      `${resource} not found`
    )
  }

  // Unauthorized response
  static unauthorized(message = 'Authentication required'): NextResponse<ApiErrorResponse> {
    return this.error(
      ApiErrorCode.UNAUTHORIZED,
      message,
      { suggestion: 'Please sign in and try again' }
    )
  }

  // Forbidden response
  static forbidden(message = 'Access denied'): NextResponse<ApiErrorResponse> {
    return this.error(
      ApiErrorCode.FORBIDDEN,
      message
    )
  }

  // Bad request response
  static badRequest(message: string, details?: any): NextResponse<ApiErrorResponse> {
    return this.error(
      ApiErrorCode.BAD_REQUEST,
      message,
      { details }
    )
  }

  // Method not allowed
  static methodNotAllowed(allowedMethods: string[]): NextResponse<ApiErrorResponse> {
    return this.error(
      ApiErrorCode.METHOD_NOT_ALLOWED,
      'Method not allowed',
      {
        details: { allowedMethods },
        headers: { 'Allow': allowedMethods.join(', ') }
      }
    )
  }

  // Rate limit exceeded
  static rateLimitExceeded(
    retryAfterSeconds?: number
  ): NextResponse<ApiErrorResponse> {
    const headers: HeadersInit = {}
    if (retryAfterSeconds) {
      headers['Retry-After'] = retryAfterSeconds.toString()
    }

    return this.error(
      ApiErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      {
        suggestion: `Please try again ${retryAfterSeconds ? `in ${retryAfterSeconds} seconds` : 'later'}`,
        headers
      }
    )
  }
}

// Middleware for wrapping route handlers
export function withApiHandler<T = any>(
  handler: (request: Request, context?: any) => Promise<NextResponse<ApiSuccessResponse<T>>>
): (request: Request, context?: any) => Promise<NextResponse<ApiResponse<T>>> {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return ApiResponseHandler.handleError(error)
    }
  }
}

// Type guards
export function isApiSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true
}

export function isApiErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false
}