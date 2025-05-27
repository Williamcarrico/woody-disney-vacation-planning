import { NextRequest, NextFetchEvent } from 'next/server';
import { z } from 'zod';
import { cache } from 'react';
import { withEdge } from '../config';
import { validateQuery } from '@/lib/api/validation';
import { errorResponse, successResponse } from '@/lib/api/response';
import { Destination } from '@/types/api';

// Define schema for query validation
const ParksQuerySchema = z.object({
    destination: z.string().optional()
});

export const runtime = 'edge';

const BASE_URL = 'https://api.themeparks.wiki/v1';

// Cache the fetch function to reduce redundant API calls
const cachedFetch = cache(async (url: string) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
});

// GET handler for /api/parks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleGet(request: NextRequest, _event: NextFetchEvent) {
    try {
        // Validate query parameters
        const validation = await validateQuery(request, ParksQuerySchema);
        if (!validation.success) {
            return validation.error!;
        }

        const { destination } = validation.data;

        // If a specific destination is requested, return only that destination's parks
        if (destination) {
            const data = await cachedFetch(`${BASE_URL}/destination/${destination}/parks`);
            return successResponse(data);
        }

        // Otherwise, return all Disney parks
        const allDestinations = await cachedFetch(`${BASE_URL}/destinations`);
        const disneyDestinations = (allDestinations as Destination[]).filter(
            (dest: Destination) => dest.slug.includes('disney')
        );

        return successResponse(disneyDestinations);
    } catch (error) {
        console.error('Error fetching parks data:', error);
        return errorResponse(
            'Failed to fetch parks data',
            'API_ERROR',
            500
        );
    }
}

// Use the edge function wrapper with caching enabled
export const GET = withEdge(handleGet, {
    cacheTtl: 300, // 5 minutes
    edgeCaching: true
});