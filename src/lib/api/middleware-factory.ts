import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'
import { RateLimiters } from '@/lib/api/distributed-rate-limiter'
import { withErrorHandler } from '@/lib/api/error-handler'
import { validateQueryParams } from '@/lib/api/validation'
import { errorResponse } from '@/lib/api/response'

export interface MiddlewareConfig {
  rateLimiting?: {
    type: keyof typeof RateLimiters
    skipForPaths?: string[]
  }
  validation?: {
    query?: ZodSchema
    body?: ZodSchema
    params?: ZodSchema
  }
  caching?: {
    ttl: number
    edgeCaching: boolean
    varyBy?: string[]
  }
  authentication?: boolean
  cors?: {
    origins?: string[]
    methods?: string[]
    headers?: string[]
  }
}

export function createMiddlewareChain(config: MiddlewareConfig) {
  return function <THandler extends (request: NextRequest, context?: any) => Promise<Response>>(
    handler: THandler
  ) {
    return withErrorHandler(async (request: NextRequest, context?: any) => {
      let validatedContext = context || {}

      // CORS handling
      if (config.cors) {
        const corsResponse = handleCORS(request, config.cors)
        if (corsResponse) return corsResponse
      }

      // Rate limiting
      if (config.rateLimiting) {
        const { type, skipForPaths = [] } = config.rateLimiting
        const shouldSkip = skipForPaths.some(path => request.url.includes(path))
        
        if (!shouldSkip) {
          try {
            const rateLimitResponse = await RateLimiters[type].check(request)
            if (rateLimitResponse) return rateLimitResponse
          } catch (error) {
            console.error('Rate limiting error:', error)
            // Continue without rate limiting if service is down
          }
        }
      }

      // Authentication
      if (config.authentication) {
        const authResult = await checkAuthentication(request)
        if (!authResult.success) {
          return authResult.error
        }
        validatedContext.user = authResult.user
      }

      // Validation
      if (config.validation) {
        try {
          if (config.validation.query) {
            const query = validateQueryParams(request, config.validation.query)
            validatedContext.query = query
          }
          
          if (config.validation.body && request.method !== 'GET') {
            try {
              const body = await request.json()
              const validatedBody = config.validation.body.parse(body)
              validatedContext.body = validatedBody
            } catch (error) {
              return errorResponse('Invalid request body', 'VALIDATION_ERROR', 400)
            }
          }

          if (config.validation.params && context?.params) {
            const validatedParams = config.validation.params.parse(context.params)
            validatedContext.params = validatedParams
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            return errorResponse(
              'Validation failed', 
              'VALIDATION_ERROR', 
              400, 
              { errors: error.errors }
            )
          }
          throw error
        }
      }

      // Execute handler
      const response = await handler(request, validatedContext)

      // Apply caching headers
      if (config.caching) {
        const { ttl, edgeCaching, varyBy = [] } = config.caching
        
        if (edgeCaching) {
          response.headers.set(
            'Cache-Control', 
            `public, s-maxage=${ttl}, stale-while-revalidate=86400`
          )
          response.headers.set('CDN-Cache-Control', `s-maxage=${ttl}`)
        } else {
          response.headers.set(
            'Cache-Control', 
            'private, no-cache, no-store, must-revalidate'
          )
        }

        if (varyBy.length > 0) {
          response.headers.set('Vary', varyBy.join(', '))
        }
      }

      // Apply CORS headers to response
      if (config.cors) {
        applyCORSHeaders(response, config.cors)
      }

      return response
    })
  }
}

function handleCORS(request: NextRequest, corsConfig: NonNullable<MiddlewareConfig['cors']>): Response | null {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    applyCORSHeaders(response, corsConfig)
    return response
  }

  // Validate origin for actual requests
  const origin = request.headers.get('Origin')
  if (origin && corsConfig.origins && !corsConfig.origins.includes(origin) && !corsConfig.origins.includes('*')) {
    return errorResponse('CORS policy violation', 'CORS_ERROR', 403)
  }

  return null
}

function applyCORSHeaders(response: Response, corsConfig: NonNullable<MiddlewareConfig['cors']>) {
  const { origins = ['*'], methods = ['GET', 'POST', 'PUT', 'DELETE'], headers = ['Content-Type', 'Authorization'] } = corsConfig
  
  response.headers.set('Access-Control-Allow-Origin', origins.includes('*') ? '*' : origins[0])
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', headers.join(', '))
  response.headers.set('Access-Control-Max-Age', '86400')
}

async function checkAuthentication(request: NextRequest): Promise<{ success: boolean; user?: any; error?: Response }> {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return {
        success: false,
        error: errorResponse('Authorization header required', 'AUTH_REQUIRED', 401)
      }
    }

    const token = authHeader.replace('Bearer ', '')
    
    // TODO: Implement actual token validation
    // For now, just validate that token exists
    if (!token) {
      return {
        success: false,
        error: errorResponse('Invalid token', 'INVALID_TOKEN', 401)
      }
    }

    // Mock user validation - replace with actual implementation
    const user = { id: 'user-id', email: 'user@example.com' }
    
    return { success: true, user }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: errorResponse('Authentication failed', 'AUTH_ERROR', 401)
    }
  }
}

// Predefined middleware configurations
export const CommonMiddlewareConfigs = {
  publicAPI: {
    rateLimiting: { type: 'api' as const },
    caching: { ttl: 300, edgeCaching: true },
    cors: { origins: ['*'] }
  },
  
  authenticatedAPI: {
    rateLimiting: { type: 'api' as const },
    authentication: true,
    caching: { ttl: 60, edgeCaching: false },
    cors: { origins: ['*'] }
  },
  
  strictAPI: {
    rateLimiting: { type: 'strict' as const },
    authentication: true,
    caching: { ttl: 0, edgeCaching: false },
    cors: { 
      origins: ['https://yourdomain.com'], 
      methods: ['GET', 'POST'],
      headers: ['Content-Type', 'Authorization']
    }
  }
} as const

export type CommonMiddlewareConfig = keyof typeof CommonMiddlewareConfigs