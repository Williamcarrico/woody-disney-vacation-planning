import { NextRequest, NextResponse } from 'next/server';
import { parksService } from '@/lib/firebase/parks-service';
import { enhancedSuccessResponse, enhancedErrorResponse } from '@/lib/api/response-standardizer';
import { withErrorHandler } from '@/lib/api/unified-error-handler';
import { ErrorCodes } from '@/lib/api/response';
import type { ParkFilters } from '@/types/parks.model';

/**
 * GET /api/parks
 * Returns all Disney parks with optional filtering
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
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

    return enhancedSuccessResponse(parks, {
        meta: {
            dataSource: 'firestore',
            cached: false
        },
        filters: cleanFilters
    });
})