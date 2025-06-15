import { NextRequest } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';
import { parksService } from '@/lib/firebase/parks-service';
import { createValidationMiddleware, CommonSchemas } from '@/lib/api/validation';
import { createNotFoundError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { z } from 'zod';

interface RouteContext {
    params: Promise<{
        parkId: string;
    }>;
}

// Validation schemas
const ParksQuerySchema = z.object({
    entity: z.enum(['details', 'attractions', 'live', 'schedule', 'showtimes']).optional().default('details'),
    year: CommonSchemas.dateTime.year.optional(),
    month: CommonSchemas.dateTime.month.optional()
});

const ParkIdSchema = z.object({
    parkId: z.string().min(1)
});

/**
 * GET /api/parks/[parkId]
 *
 * Comprehensive park data endpoint supporting multiple data types
 *
 * Query parameters:
 * - entity: 'details' | 'attractions' | 'live' | 'schedule' | 'showtimes'
 * - year: YYYY (for schedule)
 * - month: MM (for schedule)
 */
export async function GET(
    request: NextRequest,
    context: RouteContext
): Promise<Response> {
    try {
        // Await params to fix Next.js 15 compatibility
        const { parkId } = await context.params;
        
        // Validate park ID
        const parkValidation = ParkIdSchema.safeParse({ parkId });
        if (!parkValidation.success) {
            throw createNotFoundError('Invalid park ID');
        }

        // Validate query parameters
        const url = new URL(request.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());
        const queryValidation = ParksQuerySchema.safeParse(queryParams);
        
        if (!queryValidation.success) {
            throw new Error('Invalid query parameters');
        }

        const { entity, year, month } = queryValidation.data;

        // Handle different entity types
        switch (entity) {
            case 'live':
                const liveData = await themeParksAPI.getParkLiveDataBySlug(parkId);
                return successResponse(liveData);

            case 'attractions':
                const attractions = await themeParksAPI.getParkAttractionsBySlug(parkId);
                return successResponse(attractions);

            case 'schedule':
                if (!year || !month) {
                    throw new Error('Year and month are required for schedule data');
                }
                const schedule = await themeParksAPI.getParkScheduleBySlug(parkId, year, month);
                return successResponse(schedule);

            case 'details':
            default:
                const park = await parksService.getParkById(parkId);
                if (!park) {
                    throw createNotFoundError('Park not found');
                }
                return successResponse(park);
        }
    } catch (error) {
        console.error('Error in parks API:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}