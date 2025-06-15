import { NextRequest, NextResponse } from 'next/server'
import { parksService } from '@/lib/firebase/parks-service'
import type { DiningFilters, ParkId } from '@/types/parks.model'

/**
 * GET /api/dining
 * Search dining options across all Disney parks with filtering
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Extract filter parameters
        const parkIdParam = searchParams.get('parkId');
        const typeParam = searchParams.get('type');
        const mealPeriodParam = searchParams.get('mealPeriod');
        
        const filters: any = {};
        
        if (parkIdParam) filters.parkId = parkIdParam as ParkId;
        if (searchParams.get('landId')) filters.landId = searchParams.get('landId');
        if (typeParam) filters.type = typeParam as 'tableService' | 'quickService' | 'snacks';
        if (searchParams.get('cuisine')) filters.cuisine = searchParams.get('cuisine');
        if (searchParams.get('priceRange')) filters.priceRange = searchParams.get('priceRange');
        if (searchParams.get('characterDining') === 'true') filters.characterDining = true;
        if (searchParams.get('mobileOrder') === 'true') filters.mobileOrder = true;
        if (mealPeriodParam) filters.mealPeriod = mealPeriodParam as 'breakfast' | 'lunch' | 'dinner' | 'brunch' | 'allday';

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