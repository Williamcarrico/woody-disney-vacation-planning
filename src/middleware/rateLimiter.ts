import { NextRequest, NextResponse } from 'next/server'

interface RateLimitData {
    count: number
    lastReset: number
}

// In-memory map to store request counts per IP
const rateLimitMap = new Map<string, RateLimitData>()

export interface RateLimiterOptions {
    limit?: number
    windowMs?: number
    message?: string
}

/**
 * Rate limiting middleware that limits requests based on IP address
 */
export function rateLimiter(options: RateLimiterOptions = {}) {
    const {
        limit = 60, // Default 60 requests per minute
        windowMs = 60 * 1000, // Default 1 minute
        message = 'Too many requests, please try again later.'
    } = options

    return function (req: NextRequest) {
        // Get IP address from request headers or connection
        const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown'

        // Initialize rate limit data for this IP if it doesn't exist
        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, {
                count: 0,
                lastReset: Date.now()
            })
        }

        const ipData = rateLimitMap.get(ip)!

        // Reset the counter if the time window has passed
        if (Date.now() - ipData.lastReset > windowMs) {
            ipData.count = 0
            ipData.lastReset = Date.now()
        }

        // Check if the request limit has been exceeded
        if (ipData.count >= limit) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message,
                        code: 'RATE_LIMIT_EXCEEDED'
                    }
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': `${Math.ceil((ipData.lastReset + windowMs - Date.now()) / 1000)}`
                    }
                }
            )
        }

        // Increment the counter
        ipData.count += 1

        // Allow the request to proceed
        return NextResponse.next()
    }
}