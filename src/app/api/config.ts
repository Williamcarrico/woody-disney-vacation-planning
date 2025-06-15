/**
 * Edge function configuration for API routes
 * This file contains settings to optimize API performance with edge deployment
 */

import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

export type EdgeConfigType = {
    // The maximum age for client caching (in seconds)
    cacheTtl?: number
    // Whether to cache the API response at the edge
    edgeCaching?: boolean
    // Specify response headers for CDN and client caching
    cacheControlHeaders?: string
}

/**
 * Default edge configuration for API routes
 */
export const defaultEdgeConfig: EdgeConfigType = {
    cacheTtl: 60, // 1 minute default TTL
    edgeCaching: false, // Disabled by default
    cacheControlHeaders: 'private, no-cache, no-store, must-revalidate',
}

/**
 * Edge function wrapper for API routes
 *
 * @param handler - The API handler function
 * @param config - Edge configuration options
 */
export function withEdge(
    handler: (req: NextRequest, event: NextFetchEvent) => Promise<NextResponse> | NextResponse,
    config: EdgeConfigType = {}
) {
    // Merge with default config
    const finalConfig = {
        ...defaultEdgeConfig,
        ...config,
    }

    return async function edgeHandler(req: NextRequest, event: NextFetchEvent) {
        try {
            // Get response from handler
            const response = await handler(req, event)

            // Apply cache control headers based on configuration
            if (finalConfig.edgeCaching) {
                // Configure for CDN caching
                response.headers.set(
                    'Cache-Control',
                    `public, s-maxage=${finalConfig.cacheTtl}, stale-while-revalidate`
                )
            } else {
                // Configure for no caching
                response.headers.set('Cache-Control', finalConfig.cacheControlHeaders || defaultEdgeConfig.cacheControlHeaders!)
            }

            return response
        } catch (error) {
            console.error('API error in edge function:', error)

            // Return proper error response
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'An unexpected error occurred',
                        code: 'INTERNAL_SERVER_ERROR',
                    },
                },
                { status: 500 }
            )
        }
    }
}

/**
 * Runtime configuration for edge deployment
 */
export const runtime = 'edge'