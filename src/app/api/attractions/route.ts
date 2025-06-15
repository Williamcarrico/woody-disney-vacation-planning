import { NextRequest } from 'next/server'
import { z } from 'zod'
import { parksService } from '@/lib/firebase/parks-service'
import { successResponse } from '@/lib/api/response'
import { withErrorHandler } from '@/lib/api/error-handler'
import { validateQueryParams, CommonSchemas } from '@/lib/api/validation'
import { RateLimiters } from '@/lib/api/distributed-rate-limiter'
import type { AttractionFilters } from '@/types/parks.model'

// Validation schema for query parameters
const AttractionsQuerySchema = z.object({
    parkId: z.string().optional(),
    landId: z.string().optional(),
    type: z.enum(['ride', 'show', 'character-meet', 'dining', 'shopping']).optional(),
    thrillLevel: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(5)).optional(),
    heightRequirement: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    lightningLane: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    mustDo: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    ageGroup: z.enum(['all-ages', 'kids', 'teens', 'adults']).optional(),
    search: z.string().max(100).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
})

/**
 * GET /api/attractions
 * Search attractions across all Disney parks with filtering
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    // Apply rate limiting
    const rateLimitResponse = await RateLimiters.api.check(request)
    if (rateLimitResponse) {
        return rateLimitResponse
    }

    // Parse URL and query parameters
    const { searchParams } = new URL(request.url)
    const queryData = {
        parkId: searchParams.get('parkId') || undefined,
        landId: searchParams.get('landId') || undefined,
        type: searchParams.get('type') || undefined,
        thrillLevel: searchParams.get('thrillLevel') || undefined,
        heightRequirement: searchParams.get('heightRequirement') || undefined,
        lightningLane: searchParams.get('lightningLane') || undefined,
        mustDo: searchParams.get('mustDo') || undefined,
        ageGroup: searchParams.get('ageGroup') || undefined,
        search: searchParams.get('search') || undefined,
        page: parseInt(searchParams.get('page') || '1', 10),
        limit: parseInt(searchParams.get('limit') || '20', 10),
        sortBy: searchParams.get('sortBy') || undefined,
        sortOrder: searchParams.get('sortOrder') || 'asc'
    }

    // Validate query parameters
    const query = AttractionsQuerySchema.parse(queryData)

    // Extract filter parameters (remove pagination/sorting for service call)
    const { page, limit, sortBy, sortOrder, ...filterParams } = query
    
    // Build filters object, ensuring parkId is of the correct type
    const filters: AttractionFilters = Object.fromEntries(
        Object.entries(filterParams).filter(([_, value]) => value !== undefined)
    ) as AttractionFilters

    const attractions = await parksService.searchAttractions(filters)

    // Apply sorting if specified
    if (sortBy) {
        attractions.sort((a, b) => {
            const aValue = a[sortBy as keyof typeof a]
            const bValue = b[sortBy as keyof typeof b]
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue)
                return sortOrder === 'desc' ? -comparison : comparison
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
            }
            
            return 0
        })
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAttractions = attractions.slice(startIndex, endIndex)

    return successResponse({
        attractions: paginatedAttractions,
        pagination: {
            page,
            limit,
            total: attractions.length,
            totalPages: Math.ceil(attractions.length / limit),
            hasMore: endIndex < attractions.length
        },
        filters: filters
    })
})