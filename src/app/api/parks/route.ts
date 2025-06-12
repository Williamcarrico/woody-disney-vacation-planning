import { NextRequest, NextResponse } from 'next/server';
import { parksService } from '@/lib/firebase/parks-service';
import type { ParkFilters } from '@/types/parks';

/**
 * GET /api/parks
 * Returns all Disney parks with optional filtering
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract filter parameters
        const filters: ParkFilters = {
            searchTerm: searchParams.get('searchTerm') || undefined,
            hasAttraction: searchParams.get('hasAttraction') || undefined,
            hasLand: searchParams.get('hasLand') || undefined,
            operatingStatus: searchParams.get('operatingStatus') as 'open' | 'closed' | 'seasonal' || undefined
        };

        // Remove undefined filters
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        ) as ParkFilters;

        let parks;
        if (Object.keys(cleanFilters).length > 0) {
            parks = await parksService.searchParks(cleanFilters);
        } else {
            parks = await parksService.getAllParks();
        }

        return NextResponse.json({
            success: true,
            data: parks,
            total: parks.length
        });
    } catch (error) {
        console.error('Error fetching parks:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch parks'
            },
            { status: 500 }
        );
    }
}