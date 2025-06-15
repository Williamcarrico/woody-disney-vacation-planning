/**
 * Enhanced API Middleware
 * Comprehensive error handling, rate limiting, and security
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Enhanced rate limiting with different tiers
export interface RateLimitTier {
  name: string
  limit: number
  windowMs: number
  skipOnSuccess?: boolean
  skipOnError?: boolean
  keyGenerator?: (req: NextRequest) => string
  message?: string
}

// Predefined rate limit tiers
export const rateLimitTiers = {
  // Public endpoints - more restrictive
  public: {
    name: 'public',
    limit: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Authentication endpoints - very restrictive
  auth: {
    name: 'auth',
    limit: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  },
  
  // Search/query endpoints - moderate
  search: {
    name: 'search',
    limit: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipOnSuccess: true
  },
  
  // AI/computation endpoints - restrictive
  ai: {
    name: 'ai',
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    message: 'AI service rate limit exceeded, please wait before making more requests.'
  },
  
  // Data modification endpoints - moderate
  mutation: {
    name: 'mutation',
    limit: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipOnError: true
  }
} as const

// Enhanced error types
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: Record<string, unknown>,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403)
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class RateLimitError extends APIError {
  constructor(tier: string, retryAfter: number) {
    super(
      `Rate limit exceeded for ${tier} tier`,
      'RATE_LIMIT_EXCEEDED',
      429,
      { tier, retryAfter },
      retryAfter
    )
  }
}

export class ExternalServiceError extends APIError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { service, originalError: originalError?.message }
    )
  }
}

// In-memory storage for rate limiting (use Redis in production)
class MemoryRateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) {
          this.store.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const entry = this.store.get(key)
    
    if (!entry || entry.resetTime < now) {
      const newEntry = { count: 1, resetTime: now + windowMs }
      this.store.set(key, newEntry)
      return newEntry
    }
    
    entry.count++
    this.store.set(key, entry)
    return entry
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const entry = this.store.get(key)
    if (!entry || entry.resetTime < Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry
  }

  destroy() {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

const rateLimitStore = new MemoryRateLimitStore()

// Enhanced rate limiting middleware
export function createRateLimitMiddleware(tier: RateLimitTier) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      const key = tier.keyGenerator 
        ? tier.keyGenerator(request)
        : `${tier.name}:${getClientIP(request)}`
      
      const result = await rateLimitStore.increment(key, tier.windowMs)
      
      // Add rate limit headers
      const headers = {
        'X-RateLimit-Limit': tier.limit.toString(),
        'X-RateLimit-Remaining': Math.max(0, tier.limit - result.count).toString(),
        'X-RateLimit-Reset': result.resetTime.toString(),
        'X-RateLimit-Tier': tier.name
      }
      
      if (result.count > tier.limit) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
        
        return NextResponse.json(
          {
            success: false,
            error: tier.message || 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            details: {
              tier: tier.name,
              limit: tier.limit,
              retryAfter
            }
          },
          {
            status: 429,
            headers: {
              ...headers,
              'Retry-After': retryAfter.toString()
            }
          }
        )
      }
      
      // Add headers to successful requests
      const response = NextResponse.next()
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return null // Continue to next middleware
    } catch (error) {
      console.error('Rate limiting error:', error)
      return null // Continue on error to avoid blocking requests
    }
  }
}

// Security headers middleware
export function createSecurityMiddleware() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
    
    // CORS headers for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.headers.set('Access-Control-Max-Age', '86400')
    }
    
    return null
  }
}

// Request validation middleware
export function createValidationMiddleware<T extends z.ZodTypeAny>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (request: NextRequest): Promise<{ data: z.infer<T> } | NextResponse> => {
    try {
      let data: unknown
      
      switch (source) {
        case 'query': {
          const url = new URL(request.url)
          data = Object.fromEntries(url.searchParams.entries())
          break
        }
        case 'params': {
          // This would need to be handled differently for dynamic routes
          data = {}
          break
        }
        case 'body':
        default: {
          if (request.method === 'GET' || request.method === 'HEAD') {
            data = {}
          } else {
            const contentType = request.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
              data = await request.json()
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
              const formData = await request.formData()
              data = Object.fromEntries(formData.entries())
            } else {
              throw new ValidationError('Unsupported content type')
            }
          }
          break
        }
      }
      
      const result = schema.safeParse(data)
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: { errors }
          },
          { status: 400 }
        )
      }
      
      return { data: result.data }
    } catch (error) {
      if (error instanceof APIError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
          },
          { status: error.status }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      )
    }
  }
}

// Authentication middleware
export function createAuthMiddleware(required: boolean = true) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      const authHeader = request.headers.get('authorization')
      const sessionCookie = request.cookies.get('session')?.value
      
      if (!authHeader && !sessionCookie) {
        if (required) {
          return NextResponse.json(
            {
              success: false,
              error: 'Authentication required',
              code: 'AUTHENTICATION_ERROR'
            },
            { status: 401 }
          )
        }
        return null
      }
      
      // Validate authentication token/session
      // This would integrate with your Firebase Auth or other auth system
      let isValid = false
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        // Validate JWT token
        isValid = await validateAuthToken(token)
      } else if (sessionCookie) {
        // Validate session cookie
        isValid = await validateSessionCookie(sessionCookie)
      }
      
      if (!isValid && required) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid authentication credentials',
            code: 'AUTHENTICATION_ERROR'
          },
          { status: 401 }
        )
      }
      
      return null
    } catch (error) {
      console.error('Authentication middleware error:', error)
      
      if (required) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication service unavailable',
            code: 'AUTHENTICATION_SERVICE_ERROR'
          },
          { status: 503 }
        )
      }
      
      return null
    }
  }
}

// Error handling middleware
export function createErrorHandler() {
  return (error: unknown, request: NextRequest): NextResponse => {
    // Log error for monitoring
    console.error('API Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: getClientIP(request)
    })
    
    if (error instanceof APIError) {
      const response = NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          timestamp: new Date().toISOString()
        },
        { status: error.status }
      )
      
      if (error.retryAfter) {
        response.headers.set('Retry-After', error.retryAfter.toString())
      }
      
      return response
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: {
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Middleware composer
export function composeMiddleware(
  ...middlewares: Array<(request: NextRequest) => Promise<NextResponse | null>>
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    for (const middleware of middlewares) {
      const result = await middleware(request)
      if (result) return result
    }
    return null
  }
}

// Enhanced API handler wrapper
export function createAPIHandler<T extends z.ZodTypeAny>(
  config: {
    schema?: T
    rateLimitTier?: keyof typeof rateLimitTiers
    requireAuth?: boolean
    validateSource?: 'body' | 'query' | 'params'
  },
  handler: (
    data: T extends z.ZodTypeAny ? z.infer<T> : any,
    request: NextRequest,
    context?: any
  ) => Promise<unknown>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const errorHandler = createErrorHandler()
    
    try {
      // Apply middleware in order
      const middlewares = []
      
      // Security middleware
      middlewares.push(createSecurityMiddleware())
      
      // Rate limiting
      if (config.rateLimitTier) {
        middlewares.push(createRateLimitMiddleware(rateLimitTiers[config.rateLimitTier]))
      }
      
      // Authentication
      if (config.requireAuth) {
        middlewares.push(createAuthMiddleware(true))
      }
      
      // Run middleware
      const composedMiddleware = composeMiddleware(...middlewares)
      const middlewareResult = await composedMiddleware(request)
      if (middlewareResult) return middlewareResult
      
      // Validate request
      let validatedData: any = {}
      if (config.schema) {
        const validationMiddleware = createValidationMiddleware(config.schema, config.validateSource)
        const validationResult = await validationMiddleware(request)
        
        if (validationResult instanceof NextResponse) {
          return validationResult
        }
        
        validatedData = validationResult.data
      }
      
      // Execute handler
      const result = await handler(validatedData, request, context)
      
      return NextResponse.json(
        {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    } catch (error) {
      return errorHandler(error, request)
    }
  }
}

// Utility functions
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

async function validateAuthToken(token: string): Promise<boolean> {
  // Implement JWT validation with Firebase Auth or your auth system
  try {
    // This would use Firebase Admin SDK or your auth service
    return true // Placeholder
  } catch {
    return false
  }
}

async function validateSessionCookie(sessionCookie: string): Promise<boolean> {
  // Implement session validation
  try {
    // This would validate against your session store
    return true // Placeholder
  } catch {
    return false
  }
}

// Export error classes and utilities
export {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError
}