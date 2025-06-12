import { NextRequest } from 'next/server'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'
import { updateResortSchema } from '@/lib/schemas/resort.schema'
import { ResortService } from '@/lib/firebase/firestore-service'
import { z } from 'zod'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// GET /api/resorts/[id] - Get a specific resort by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        if (!id) {
            return errorResponse(
                'Resort ID is required',
                ErrorCodes.VALIDATION,
                400
            )
        }

        // Get query parameters for additional options
        const { searchParams } = new URL(request.url)
        const includeAmenities = searchParams.get('includeAmenities') !== 'false'
        const includeDining = searchParams.get('includeDining') !== 'false'
        const includeRecreation = searchParams.get('includeRecreation') !== 'false'
        const includeTransportation = searchParams.get('includeTransportation') !== 'false'
        const useCache = searchParams.get('useCache') !== 'false'

        const resort = await ResortService.getResort(id, useCache)

        if (!resort) {
            return errorResponse(
                `Resort with ID '${id}' not found`,
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Create a processed resort object that handles both data structures
        const processedResort = { ...resort } as Record<string, unknown>

        // Check if resort has static data structure properties and filter accordingly
        const hasStaticStructure = 'dining' in resort && 'recreation' in resort && 'transportation' in resort

        if (hasStaticStructure) {
            // Static resort structure - filter optional data
            if (!includeAmenities && 'amenities' in processedResort) {
                processedResort.amenities = []
            }
            if (!includeDining && 'dining' in processedResort) {
                processedResort.dining = []
            }
            if (!includeRecreation && 'recreation' in processedResort) {
                processedResort.recreation = []
            }
            if (!includeTransportation && 'transportation' in processedResort) {
                processedResort.transportation = []
            }
        } else {
            // Firestore resort structure - only filter amenities if present
            if (!includeAmenities && 'amenities' in processedResort) {
                processedResort.amenities = []
            }
        }

        // Calculate additional metadata based on available data
        const metadata: Record<string, unknown> = {}

        if (hasStaticStructure) {
            // Static resort structure
            const staticResort = resort as Record<string, unknown>

            metadata.totalAmenities = Array.isArray(staticResort.amenities) ? staticResort.amenities.length : 0
            metadata.totalDining = Array.isArray(staticResort.dining) ? staticResort.dining.length : 0
            metadata.totalRecreation = Array.isArray(staticResort.recreation) ? staticResort.recreation.length : 0
            metadata.totalTransportation = Array.isArray(staticResort.transportation) ? staticResort.transportation.length : 0

            // Handle pricing if available
            if (staticResort.pricing && typeof staticResort.pricing === 'object') {
                const pricing = staticResort.pricing as Record<string, Record<string, number>>
                const prices: number[] = []
                const maxPrices: number[] = []

                // Extract price ranges
                for (const range of ['valueRange', 'moderateRange', 'deluxeRange']) {
                    if (pricing[range]) {
                        if (typeof pricing[range].low === 'number' && pricing[range].low > 0) {
                            prices.push(pricing[range].low)
                        }
                        if (typeof pricing[range].high === 'number' && pricing[range].high > 0) {
                            maxPrices.push(pricing[range].high)
                        }
                    }
                }

                metadata.priceRange = {
                    min: prices.length > 0 ? Math.min(...prices) : 0,
                    max: maxPrices.length > 0 ? Math.max(...maxPrices) : 0
                }
            }

            // Handle location and distance to parks
            if (staticResort.location && typeof staticResort.location === 'object') {
                const location = staticResort.location as Record<string, unknown>
                if (location.distanceToParks && typeof location.distanceToParks === 'object') {
                    const distanceToParks = location.distanceToParks as Record<string, number>
                    metadata.nearestParks = Object.entries(distanceToParks)
                        .sort(([, a], [, b]) => a - b)
                        .slice(0, 3)
                        .map(([park, distance]) => ({ park, distance }))
                }
            }

            metadata.lastUpdated = staticResort.lastRefurbished || staticResort.openingDate
        } else {
            // Firestore resort structure
            metadata.totalAmenities = Array.isArray(resort.amenities) ? resort.amenities.length : 0
            metadata.totalDining = 0 // Not available in Firestore schema
            metadata.totalRecreation = 0 // Not available in Firestore schema
            metadata.totalTransportation = 0 // Not available in Firestore schema

            // Basic price range from room types if available
            if (Array.isArray(resort.roomTypes) && resort.roomTypes.length > 0) {
                const roomPrices = resort.roomTypes
                    .map(room => room.price)
                    .filter((price): price is NonNullable<typeof price> => price != null)

                if (roomPrices.length > 0) {
                    const minPrices = roomPrices.map(p => p.min).filter((p): p is number => typeof p === 'number')
                    const maxPrices = roomPrices.map(p => p.max).filter((p): p is number => typeof p === 'number')

                    metadata.priceRange = {
                        min: minPrices.length > 0 ? Math.min(...minPrices) : 0,
                        max: maxPrices.length > 0 ? Math.max(...maxPrices) : 0
                    }
                }
            }

            metadata.nearestParks = []
            metadata.lastUpdated = resort.updatedAt || resort.createdAt
        }

        return successResponse({
            resort: processedResort,
            metadata,
            meta: {
                timestamp: new Date().toISOString(),
                cached: useCache,
                dataSource: hasStaticStructure ? 'static' : 'firestore'
            }
        })

    } catch (error) {
        console.error(`Error fetching resort ${(await params).id}:`, error)
        return errorResponse(
            'Failed to fetch resort',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// PUT /api/resorts/[id] - Update a specific resort
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        if (!id) {
            return errorResponse(
                'Resort ID is required',
                ErrorCodes.VALIDATION,
                400
            )
        }

        const body = await request.json()
        const validatedData = updateResortSchema.parse(body)

        // Check if resort exists
        const existingResort = await ResortService.getResort(id, false)
        if (!existingResort) {
            return errorResponse(
                `Resort with ID '${id}' not found`,
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Update the resort
        await ResortService.updateResort(id, validatedData)

        // Get the updated resort
        const updatedResort = await ResortService.getResort(id, false)

        return successResponse({
            resort: updatedResort,
            message: 'Resort updated successfully',
            meta: {
                timestamp: new Date().toISOString(),
                operation: 'update',
                updatedFields: Object.keys(validatedData)
            }
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(
                `Invalid resort data: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
                ErrorCodes.VALIDATION,
                400
            )
        }

        console.error(`Error updating resort ${(await params).id}:`, error)
        return errorResponse(
            'Failed to update resort',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// DELETE /api/resorts/[id] - Delete a specific resort
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        if (!id) {
            return errorResponse(
                'Resort ID is required',
                ErrorCodes.VALIDATION,
                400
            )
        }

        // Check if resort exists
        const existingResort = await ResortService.getResort(id, false)
        if (!existingResort) {
            return errorResponse(
                `Resort with ID '${id}' not found`,
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Get query parameter for soft delete
        const { searchParams } = new URL(request.url)
        const softDelete = searchParams.get('soft') === 'true'

        if (softDelete) {
            // Soft delete - just mark as inactive
            await ResortService.updateResort(id, { isActive: false })
        } else {
            // Hard delete - remove from database
            await ResortService.deleteResort(id)
        }

        return successResponse({
            message: `Resort ${softDelete ? 'deactivated' : 'deleted'} successfully`,
            resort: {
                id,
                name: existingResort.name
            },
            meta: {
                timestamp: new Date().toISOString(),
                operation: softDelete ? 'soft_delete' : 'hard_delete'
            }
        })

    } catch (error) {
        console.error(`Error deleting resort ${(await params).id}:`, error)
        return errorResponse(
            'Failed to delete resort',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// PATCH /api/resorts/[id] - Partial update of a resort
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        if (!id) {
            return errorResponse(
                'Resort ID is required',
                ErrorCodes.VALIDATION,
                400
            )
        }

        const body = await request.json()

        // For PATCH, we allow partial updates without full validation
        const allowedFields = [
            'name', 'description', 'shortDescription', 'category', 'address',
            'location', 'phoneNumber', 'amenities', 'roomTypes', 'imageUrl',
            'galleryImages', 'logoUrl', 'websiteUrl', 'isActive', 'nearbyParks',
            'transportationOptions', 'checkInTime', 'checkOutTime', 'starRating', 'tags'
        ]

        const updateData: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key)) {
                updateData[key] = value
            }
        }

        if (Object.keys(updateData).length === 0) {
            return errorResponse(
                'No valid fields provided for update',
                ErrorCodes.VALIDATION,
                400
            )
        }

        // Check if resort exists
        const existingResort = await ResortService.getResort(id, false)
        if (!existingResort) {
            return errorResponse(
                `Resort with ID '${id}' not found`,
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Update the resort
        await ResortService.updateResort(id, updateData)

        // Get the updated resort
        const updatedResort = await ResortService.getResort(id, false)

        return successResponse({
            resort: updatedResort,
            message: 'Resort updated successfully',
            meta: {
                timestamp: new Date().toISOString(),
                operation: 'partial_update',
                updatedFields: Object.keys(updateData)
            }
        })

    } catch (error) {
        console.error(`Error patching resort ${(await params).id}:`, error)
        return errorResponse(
            'Failed to update resort',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}