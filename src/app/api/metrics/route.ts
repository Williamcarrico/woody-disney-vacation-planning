/**
 * API Metrics Endpoint
 * Provides real-time metrics and performance data for monitoring dashboards
 */

import { NextRequest } from 'next/server'
import { MetricsAPI } from '@/lib/api/monitoring'
import { enhancedSuccessResponse } from '@/lib/api/response-standardizer'
import { withErrorHandler, createAuthorizationError } from '@/lib/api/unified-error-handler'
import { z } from 'zod'

// Query parameters schema
const MetricsQuerySchema = z.object({
    endpoint: z.string().optional(),
    timeRange: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).optional(),
    aggregated: z.enum(['true', 'false']).transform(val => val === 'true').default('false')
})

/**
 * GET /api/metrics
 * Returns API performance metrics and statistics
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    // Simple auth check - in production, use proper authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createAuthorizationError('Metrics access requires authentication')
    }
    
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const query = MetricsQuerySchema.parse({
        endpoint: searchParams.get('endpoint'),
        timeRange: searchParams.get('timeRange'),
        aggregated: searchParams.get('aggregated')
    })
    
    if (query.aggregated) {
        // Return aggregated metrics for dashboard
        const aggregatedMetrics = MetricsAPI.getAggregatedMetrics(query.endpoint)
        
        return enhancedSuccessResponse(aggregatedMetrics, {
            meta: {
                dataSource: 'metrics-store',
                cached: false,
                type: 'aggregated'
            }
        })
    } else {
        // Return raw metrics data
        const rawMetrics = MetricsAPI.getMetrics(query.endpoint, query.timeRange)
        
        return enhancedSuccessResponse(rawMetrics, {
            meta: {
                dataSource: 'metrics-store',
                cached: false,
                type: 'raw',
                count: rawMetrics.length
            }
        })
    }
})

/**
 * POST /api/metrics/cleanup
 * Manually trigger metrics cleanup
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    // Simple auth check - in production, use proper authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createAuthorizationError('Metrics management requires authentication')
    }
    
    MetricsAPI.cleanup()
    
    return enhancedSuccessResponse(
        { message: 'Metrics cleanup completed' },
        { meta: { action: 'cleanup', timestamp: new Date().toISOString() } }
    )
})