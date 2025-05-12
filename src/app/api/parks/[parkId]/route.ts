import { NextRequest, NextResponse } from 'next/server';
import { cache } from 'react';

const BASE_URL = 'https://api.themeparks.wiki/v1';

// Cache the fetch function
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

interface RouteParams {
    params: {
        parkId: string;
    };
}

// GET handler for /api/parks/[parkId]
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { parkId } = params;
        const searchParams = request.nextUrl.searchParams;
        const entity = searchParams.get('entity');

        // Determine what data to fetch based on the 'entity' parameter
        if (entity === 'attractions') {
            const data = await cachedFetch(`${BASE_URL}/park/${parkId}/attractions`);
            return NextResponse.json(data);
        } else if (entity === 'live') {
            const data = await cachedFetch(`${BASE_URL}/park/${parkId}/live`);
            return NextResponse.json(data);
        } else if (entity === 'schedule') {
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');

            let url = `${BASE_URL}/park/${parkId}/schedule`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const data = await cachedFetch(url);
            return NextResponse.json(data);
        } else if (entity === 'showtimes') {
            const date = searchParams.get('date');

            let url = `${BASE_URL}/park/${parkId}/showtimes`;
            if (date) {
                url += `?date=${date}`;
            }

            const data = await cachedFetch(url);
            return NextResponse.json(data);
        } else {
            // Default: return park details
            const data = await cachedFetch(`${BASE_URL}/park/${parkId}`);
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error(`Error fetching data for park ${params.parkId}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch park data' },
            { status: 500 }
        );
    }
}