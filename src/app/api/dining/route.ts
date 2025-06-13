import { NextRequest, NextResponse } from 'next/server'
import { parksService } from '@/lib/firebase/parks-service'
import type { DiningFilters } from '@/types/parks'

/**
 * GET /api/dining
 * Search dining options across all Disney parks with filtering
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Extract filter parameters
        const filters: DiningFilters = {
            parkId: searchParams.get('parkId') || undefined,
            landId: searchParams.get('landId') || undefined,
            type: searchParams.get('type') as 'tableService' | 'quickService' | 'snacks' || undefined,
            cuisine: searchParams.get('cuisine') || undefined,
            priceRange: searchParams.get('priceRange') || undefined,
            characterDining: searchParams.get('characterDining') === 'true' || undefined,
            mobileOrder: searchParams.get('mobileOrder') === 'true' || undefined,
            mealPeriod: searchParams.get('mealPeriod') as 'breakfast' | 'lunch' | 'dinner' | 'snacks' || undefined
        }

        // Remove undefined filters
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        ) as DiningFilters

        const dining = await parksService.searchDining(cleanFilters)

        return NextResponse.json({
            success: true,
            data: dining,
            total: dining.length
        })
    } catch (error) {
        console.error('Error searching dining:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search dining'
            },
            { status: 500 }
        )
    }
}