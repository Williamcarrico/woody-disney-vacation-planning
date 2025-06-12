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
    params: Promise<{
        attractionId: string;
    }>;
}

// GET handler for /api/attractions/[attractionId]
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { attractionId } = await params;
        const searchParams = request.nextUrl.searchParams;
        const entity = searchParams.get('entity');

        if (entity === 'waittime') {
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');

            let url = `${BASE_URL}/attraction/${attractionId}/waittime`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const data = await cachedFetch(url) as unknown;
            return NextResponse.json(data);
        } else {
            // Default: return attraction details
            const data = await cachedFetch(`${BASE_URL}/attraction/${attractionId}`) as unknown;
            return NextResponse.json(data);
        }
    } catch (error) {
        const { attractionId } = await params;
        console.error(`Error fetching data for attraction ${attractionId}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch attraction data' },
            { status: 500 }
        );
    }
}