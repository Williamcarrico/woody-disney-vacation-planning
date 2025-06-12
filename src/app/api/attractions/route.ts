import { NextRequest, NextResponse } from 'next/server'
import { parksService } from '@/lib/firebase/parks-service'
import type { AttractionFilters } from '@/types/parks'

/**
 * GET /api/attractions
 * Search attractions across all Disney parks with filtering
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Extract filter parameters
        const filters: AttractionFilters = {
            parkId: searchParams.get('parkId') || undefined,
            landId: searchParams.get('landId') || undefined,
            type: searchParams.get('type') as any || undefined,
            thrillLevel: searchParams.get('thrillLevel') ? parseInt(searchParams.get('thrillLevel')!) : undefined,
            heightRequirement: searchParams.get('heightRequirement') === 'true' || undefined,
            lightningLane: searchParams.get('lightningLane') === 'true' || undefined,
            mustDo: searchParams.get('mustDo') === 'true' || undefined,
            ageGroup: searchParams.get('ageGroup') as any || undefined
        }

        // Remove undefined filters
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        ) as AttractionFilters

        const attractions = await parksService.searchAttractions(cleanFilters)

        return NextResponse.json({
            success: true,
            data: attractions,
            total: attractions.length
        })
    } catch (error) {
        console.error('Error searching attractions:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search attractions'
            },
            { status: 500 }
        )
    }
}