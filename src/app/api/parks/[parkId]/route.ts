import { NextRequest } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';
import { parksService } from '@/lib/firebase/parks-service';
import { createValidationMiddleware, CommonSchemas } from '@/lib/api/validation';
import { createNotFoundError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{
        parkId: string;
    }>;
}

// Validation schemas
const ParksQuerySchema = z.object({
    entity: z.enum(['details', 'attractions', 'live', 'schedule', 'showtimes']).optional().default('details'),
    year: CommonSchemas.dateTime.year,
    month: CommonSchemas.dateTime.month
});

const ParkIdSchema = z.object({
    parkId: CommonSchemas.disney.parkId
});

// Create validation middleware
const validateParkRequest = createValidationMiddleware({
    pathParams: ParkIdSchema,
    queryParams: ParksQuerySchema
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
export const GET = validateParkRequest(async (request: NextRequest, { params, query }) => {
    // Handle different entity types
    switch (query!.entity) {
        case 'live':
            const liveData = await themeParksAPI.getParkLiveDataBySlug(params!.parkId);
            return successResponse(liveData);

        case 'attractions':
            const attractions = await themeParksAPI.getParkAttractionsBySlug(params!.parkId);
            return successResponse(attractions);

        case 'schedule':
            const schedule = await themeParksAPI.getParkScheduleBySlug(params!.parkId, query!.year, query!.month);
            return successResponse(schedule);

        case 'details':
        default:
            const park = await parksService.getParkById(params!.parkId);
            if (!park) {
                throw createNotFoundError('Park');
            }
            return successResponse(park);
    }
})