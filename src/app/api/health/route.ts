import { NextRequest, NextResponse } from 'next/server'
import { healthChecker, MetricsAPI } from '@/lib/api/monitoring'
import { ResponsePatterns } from '@/lib/api/response-standardizer'
import { withErrorHandler } from '@/lib/api/unified-error-handler'

// Register Firebase service health check
healthChecker.registerService('firebase', async () => {
    try {
        // Simple Firebase connection check
        const { getFirestore } = await import('@/lib/firebase/firebase-admin')
        const db = getFirestore()
        
        const startTime = Date.now()
        await db.collection('health-check').limit(1).get()
        const responseTime = Date.now() - startTime
        
        return {
            name: 'firebase',
            status: responseTime < 1000 ? 'up' : 'degraded',
            responseTime,
            lastCheck: Date.now()
        }
    } catch (error) {
        return {
            name: 'firebase',
            status: 'down',
            lastCheck: Date.now(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
    }
})

// Register external API health check
healthChecker.registerService('weather-api', async () => {
    try {
        const startTime = Date.now()
        const response = await fetch('https://api.tomorrow.io/v4/weather/realtime?location=28.3772,-81.5707&apikey=test', {
            method: 'HEAD',
            timeout: 5000
        })
        const responseTime = Date.now() - startTime
        
        return {
            name: 'weather-api',
            status: response.ok ? 'up' : 'degraded',
            responseTime,
            lastCheck: Date.now()
        }
    } catch (error) {
        return {
            name: 'weather-api',
            status: 'down',
            lastCheck: Date.now(),
            errorMessage: error instanceof Error ? error.message : 'Connection failed'
        }
    }
})

export const GET = withErrorHandler(async (request: NextRequest) => {
    const healthData = await healthChecker.getHealth()
    
    return ResponsePatterns.healthCheck(
        healthData.status,
        {
            services: healthData.services,
            system: healthData.system,
            uptime: healthData.uptime,
            metrics: {
                totalRequests: MetricsAPI.getMetrics().length,
                recentErrors: MetricsAPI.getMetrics(undefined, 60 * 60 * 1000)
                    .filter(m => m.statusCode >= 400).length
            }
        }
    )
})