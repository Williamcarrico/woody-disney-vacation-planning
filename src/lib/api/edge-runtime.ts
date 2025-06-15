/**
 * Enhanced Edge Runtime Configuration and Utilities
 * Optimized for Next.js 15 and React 19
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Edge Runtime Configuration
export const edgeConfig = {
  runtime: 'edge' as const,
  maxDuration: 30, // 30 seconds max for edge functions
  memory: '128mb' as const,
  regions: ['iad1', 'sfo1', 'fra1'] // Deploy to multiple edge regions
}

// Enhanced caching configuration for edge
export interface EdgeCacheConfig {
  ttl: number
  staleWhileRevalidate?: number
  tags?: string[]
  revalidateOnFocus?: boolean
  bypassCache?: boolean
}

// Default cache configurations for different data types
export const cacheConfigs = {
  parks: { ttl: 300, staleWhileRevalidate: 600, tags: ['parks'] }, // 5min/10min
  attractions: { ttl: 180, staleWhileRevalidate: 300, tags: ['attractions'] }, // 3min/5min
  waitTimes: { ttl: 60, staleWhileRevalidate: 120, tags: ['wait-times'] }, // 1min/2min
  restaurants: { ttl: 1800, staleWhileRevalidate: 3600, tags: ['restaurants'] }, // 30min/1hr
  weather: { ttl: 600, staleWhileRevalidate: 900, tags: ['weather'] }, // 10min/15min
  static: { ttl: 86400, staleWhileRevalidate: 172800, tags: ['static'] } // 1day/2days
} as const

// Enhanced error types for edge runtime
export class EdgeRuntimeError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'EdgeRuntimeError'
  }
}

// Rate limiting for edge functions
export interface RateLimitConfig {
  limit: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

// In-memory rate limit store (edge-compatible)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function createEdgeRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : getClientIP(request) || 'anonymous'
    
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
    
    const entry = rateLimitStore.get(key)
    
    if (!entry || entry.resetTime < now) {
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
      return null
    }
    
    if (entry.count >= config.limit) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.limit - entry.count).toString(),
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      )
    }
    
    entry.count++
    return null
  }
}

// Enhanced request validation for edge
export function createEdgeValidator<T extends z.ZodTypeAny>(schema: T) {
  return async (request: NextRequest): Promise<z.infer<T>> => {
    try {
      let data: unknown
      
      if (request.method === 'GET') {
        const url = new URL(request.url)
        data = Object.fromEntries(url.searchParams.entries())
      } else {
        const contentType = request.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          data = await request.json()
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          data = Object.fromEntries(formData.entries())
        } else {
          throw new EdgeRuntimeError('Unsupported content type', 'INVALID_CONTENT_TYPE', 400)
        }
      }
      
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new EdgeRuntimeError(
          `Validation failed: ${error.errors.map(e => e.message).join(', ')}`,
          'VALIDATION_ERROR',
          400
        )
      }
      throw error
    }
  }
}

// Enhanced caching with edge KV store simulation
export class EdgeCache {
  private static cache = new Map<string, { data: unknown; expires: number; tags: string[] }>()
  
  static async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry || entry.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }
    return entry.data as T
  }
  
  static async set<T>(
    key: string, 
    data: T, 
    config: EdgeCacheConfig
  ): Promise<void> {
    this.cache.set(key, {
      data,
      expires: Date.now() + (config.ttl * 1000),
      tags: config.tags || []
    })
  }
  
  static async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }
  
  static async invalidateByTag(tag: string): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
      }
    }
  }
  
  static async clear(): Promise<void> {
    this.cache.clear()
  }
}

// Enhanced response builder for edge
export function createEdgeResponse<T>(
  data: T,
  options: {
    status?: number
    cache?: EdgeCacheConfig
    headers?: Record<string, string>
  } = {}
): NextResponse {
  const response = NextResponse.json(
    { success: true, data, timestamp: Date.now() },
    { status: options.status || 200 }
  )
  
  // Add caching headers
  if (options.cache) {
    response.headers.set('Cache-Control', 
      `public, max-age=${options.cache.ttl}, stale-while-revalidate=${options.cache.staleWhileRevalidate || options.cache.ttl * 2}`
    )
    
    if (options.cache.tags) {
      response.headers.set('Cache-Tags', options.cache.tags.join(','))
    }
  }
  
  // Add custom headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
  
  // Add edge-specific headers
  response.headers.set('X-Edge-Runtime', 'true')
  response.headers.set('X-Powered-By', 'Next.js Edge Runtime')
  
  return response
}

// Enhanced error response for edge
export function createEdgeErrorResponse(
  error: EdgeRuntimeError | Error,
  request?: NextRequest
): NextResponse {
  const isEdgeError = error instanceof EdgeRuntimeError
  const status = isEdgeError ? error.status : 500
  const code = isEdgeError ? error.code : 'INTERNAL_ERROR'
  
  const response = NextResponse.json(
    {
      success: false,
      error: error.message,
      code,
      timestamp: Date.now(),
      path: request?.nextUrl.pathname,
      method: request?.method
    },
    { status }
  )
  
  if (isEdgeError && error.retryAfter) {
    response.headers.set('Retry-After', error.retryAfter.toString())
  }
  
  response.headers.set('X-Edge-Runtime', 'true')
  
  return response
}

// Utility to get client IP in edge runtime
export function getClientIP(request: NextRequest): string | null {
  // Check various headers for client IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip'
  ]
  
  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // Handle comma-separated IPs (x-forwarded-for)
      return value.split(',')[0].trim()
    }
  }
  
  return null
}

// Enhanced middleware composer for edge functions
export function composeEdgeMiddleware(
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

// Edge-optimized logging
export const edgeLogger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[EDGE] ${message}`, data ? JSON.stringify(data) : '')
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[EDGE] ${message}`, data ? JSON.stringify(data) : '')
  },
  error: (message: string, error?: Error | Record<string, unknown>) => {
    console.error(`[EDGE] ${message}`, error instanceof Error ? error.stack : JSON.stringify(error))
  }
}

// Performance monitoring for edge functions
export function withEdgePerformanceMonitoring<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T,
  name: string
): T {
  return (async (...args: Parameters<T>): Promise<NextResponse> => {
    const start = Date.now()
    let response: NextResponse
    
    try {
      response = await handler(...args)
      const duration = Date.now() - start
      
      edgeLogger.info(`Edge function ${name} completed`, {
        duration,
        status: response.status,
        success: true
      })
      
      // Add performance headers
      response.headers.set('X-Edge-Duration', duration.toString())
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      
      edgeLogger.error(`Edge function ${name} failed`, {
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }) as T
}

// Enhanced edge function wrapper
export function createEdgeHandler<TInput extends z.ZodTypeAny>(
  schema: TInput,
  handler: (input: z.infer<TInput>, request: NextRequest) => Promise<unknown>,
  config: {
    rateLimit?: RateLimitConfig
    cache?: EdgeCacheConfig
    name?: string
  } = {}
) {
  const validator = createEdgeValidator(schema)
  const rateLimit = config.rateLimit ? createEdgeRateLimit(config.rateLimit) : null
  
  return withEdgePerformanceMonitoring(
    async (request: NextRequest): Promise<NextResponse> => {
      try {
        // Apply rate limiting
        if (rateLimit) {
          const rateLimitResponse = await rateLimit(request)
          if (rateLimitResponse) return rateLimitResponse
        }
        
        // Validate input
        const input = await validator(request)
        
        // Check cache if configured
        if (config.cache) {
          const cacheKey = `${request.nextUrl.pathname}:${JSON.stringify(input)}`
          const cached = await EdgeCache.get(cacheKey)
          if (cached) {
            return createEdgeResponse(cached, { cache: config.cache })
          }
        }
        
        // Execute handler
        const result = await handler(input, request)
        
        // Cache result if configured
        if (config.cache) {
          const cacheKey = `${request.nextUrl.pathname}:${JSON.stringify(input)}`
          await EdgeCache.set(cacheKey, result, config.cache)
        }
        
        return createEdgeResponse(result, { cache: config.cache })
      } catch (error) {
        return createEdgeErrorResponse(
          error instanceof Error ? error : new Error('Unknown error'),
          request
        )
      }
    },
    config.name || 'unnamed-edge-handler'
  )
}

// Export runtime configuration
export const runtime = 'edge'
export { edgeConfig as config }