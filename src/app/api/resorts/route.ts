import { NextRequest } from 'next/server'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'
import {
    validateResortQuery,
    validateCreateResort,
    ResortListResponse,
    DEFAULT_RESORT_QUERY
} from '@/types/unified-resort'
import { ResortService } from '@/lib/firebase/firestore-service'
import { resortCache, CacheKeyGenerator } from '@/lib/cache/cache-service'
import { webSocketService } from '@/lib/websocket/websocket-service'
import { z } from 'zod'

// GET /api/resorts - Get all resorts with filtering, pagination, and caching
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse and validate query parameters
        const queryParams = Object.fromEntries(searchParams.entries())
        const validatedQuery = validateResortQuery(queryParams)

        // Generate cache key
        const cacheKey = CacheKeyGenerator.resortList(validatedQuery)

        // Try to get from cache first
        if (validatedQuery.useCache) {
            const cachedResult = await resortCache.getResortList(cacheKey)
            if (cachedResult) {
                return successResponse(cachedResult)
            }
        }

        // Get resorts from service
        const result = await ResortService.getResorts({
            category: validatedQuery.category,
            area: validatedQuery.area,
            minPrice: validatedQuery.minPrice,
            maxPrice: validatedQuery.maxPrice,
            amenities: validatedQuery.amenities,
            search: validatedQuery.search,
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            sortBy: validatedQuery.sortBy,
            sortOrder: validatedQuery.sortOrder,
            useCache: validatedQuery.useCache
        })

        // Calculate statistics
        const statistics = {
            totalResorts: result.totalCount || result.data.length,
            byCategory: result.data.reduce((acc, resort) => {
                acc[resort.category] = (acc[resort.category] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            byArea: result.data.reduce((acc, resort) => {
                const area = resort.location.area
                acc[area] = (acc[area] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            averageRating: result.data.reduce((sum, resort) =>
                sum + (resort.starRating || 0), 0) / result.data.length || 0,
            priceRange: {
                min: Math.min(...result.data.map(r =>
                    Math.min(
                        r.pricing.valueRange?.low || Infinity,
                        r.pricing.moderateRange?.low || Infinity,
                        r.pricing.deluxeRange?.low || Infinity
                    )
                ).filter(p => p !== Infinity)),
                max: Math.max(...result.data.map(r =>
                    Math.max(
                        r.pricing.valueRange?.high || 0,
                        r.pricing.moderateRange?.high || 0,
                        r.pricing.deluxeRange?.high || 0
                    )
                ))
            }
        }

        // Calculate pagination
        const totalPages = Math.ceil((result.totalCount || result.data.length) / validatedQuery.limit)
        const pagination = {
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            total: result.totalCount || result.data.length,
            totalPages,
            hasNextPage: validatedQuery.page < totalPages,
            hasPreviousPage: validatedQuery.page > 1
        }

        // Get available filter options
        const allResorts = result.totalCount ? await ResortService.getResorts({ limit: 1000 }) : result
        const availableFilters = {
            categories: [...new Set(allResorts.data.map(r => r.category))],
            areas: [...new Set(allResorts.data.map(r => r.location.area))],
            amenities: [...new Set(allResorts.data.flatMap(r => r.amenities.map(a => a.name)))],
            priceRange: statistics.priceRange
        }

        const response: ResortListResponse = {
            resorts: result.data,
            pagination,
            filters: {
                applied: validatedQuery,
                available: availableFilters
            },
            statistics,
            meta: {
                timestamp: new Date().toISOString(),
                cached: false,
                dataSource: result.data.length > 0 ? 'hybrid' : 'static'
            }
        }

        // Cache the result
        if (validatedQuery.useCache) {
            await resortCache.setResortList(cacheKey, response, 600) // 10 minutes
        }

        return successResponse(response)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(
                `Invalid query parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
                ErrorCodes.VALIDATION,
                400
            )
        }

        console.error('Error fetching resorts:', error)
        return errorResponse(
            'Failed to fetch resorts',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// POST /api/resorts - Create a new resort
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = validateCreateResort(body)

        // Create the resort
        const resortId = await ResortService.createResort(validatedData)

        // Get the created resort
        const createdResort = await ResortService.getResort(resortId, false)

        if (!createdResort) {
            return errorResponse(
                'Failed to retrieve created resort',
                ErrorCodes.SERVER_ERROR,
                500
            )
        }

        // Invalidate cache
        await resortCache.invalidateAllResorts()

        // Broadcast update via WebSocket
        webSocketService.broadcastResortUpdate(resortId, createdResort, 'general')

        return successResponse({
            resort: createdResort,
            message: 'Resort created successfully',
            meta: {
                timestamp: new Date().toISOString(),
                operation: 'create',
                resortId
            }
        }, 201)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(
                `Invalid resort data: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
                ErrorCodes.VALIDATION,
                400
            )
        }

        console.error('Error creating resort:', error)
        return errorResponse(
            'Failed to create resort',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// PUT /api/resorts/migrate - Migrate static data to Firestore (admin only)
export async function PUT(request: NextRequest) {
    try {
        // TODO: Add admin authentication check
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        if (action === 'migrate') {
            await ResortService.migrateStaticData()

            // Clear all cache after migration
            await resortCache.invalidateAllResorts()

            return successResponse({
                message: 'Static data migrated to Firestore successfully',
                meta: {
                    timestamp: new Date().toISOString(),
                    operation: 'migrate'
                }
            })
        }

        return errorResponse(
            'Invalid action. Use ?action=migrate to migrate static data.',
            ErrorCodes.VALIDATION,
            400
        )

    } catch (error) {
        console.error('Error during migration:', error)
        return errorResponse(
            'Failed to migrate data',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// DELETE /api/resorts - Clear all resort cache (admin only)
export async function DELETE(request: NextRequest) {
    try {
        // TODO: Add admin authentication check
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        if (action === 'clear-cache') {
            await resortCache.invalidateAllResorts()

            return successResponse({
                message: 'Resort cache cleared successfully',
                meta: {
                    timestamp: new Date().toISOString(),
                    operation: 'clear_cache'
                }
            })
        }

        return errorResponse(
            'Invalid action. Use ?action=clear-cache to clear cache.',
            ErrorCodes.VALIDATION,
            400
        )

    } catch (error) {
        console.error('Error clearing cache:', error)
        return errorResponse(
            'Failed to clear cache',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}