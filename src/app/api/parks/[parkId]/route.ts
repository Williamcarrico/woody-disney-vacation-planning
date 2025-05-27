import { NextRequest, NextResponse } from 'next/server';
import { cache } from 'react';

const BASE_URL = 'https://api.themeparks.wiki/v1';

// Mapping from internal park slugs to ThemeParks.wiki UUIDs
const PARK_ID_MAPPINGS: Record<string, string> = {
    'magic-kingdom': '75ea578a-adc8-4116-a54d-dccb60765ef9',
    'epcot': '47f90d2c-e191-4239-a466-5892ef59a88b',
    'hollywood-studios': '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
    'animal-kingdom': '1c84a229-8862-4648-9c71-378ddd2c7693',
    'typhoon-lagoon': 'b070cbc5-feaa-4b87-a8c1-f94cca037a18',
    'blizzard-beach': '8fe7ba5c-1a8e-4e6e-9d9e-8c8f8b8c8b8c'
};

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
        parkId: string;
    }>;
}

// GET handler for /api/parks/[parkId]
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { parkId } = await params;
        const searchParams = request.nextUrl.searchParams;
        const entity = searchParams.get('entity');

        // Map internal park ID to ThemeParks.wiki UUID
        const themeParksId = PARK_ID_MAPPINGS[parkId];
        if (!themeParksId) {
            return NextResponse.json(
                {
                    error: 'Park not found',
                    availableParks: Object.keys(PARK_ID_MAPPINGS),
                    requestedPark: parkId
                },
                { status: 404 }
            );
        }

        // Determine what data to fetch based on the 'entity' parameter
        if (entity === 'attractions') {
            const data = await cachedFetch(`${BASE_URL}/entity/${themeParksId}/children`);
            // Return just the children array which contains the attractions
            return NextResponse.json(data.children || []);
        } else if (entity === 'live') {
            const data = await cachedFetch(`${BASE_URL}/entity/${themeParksId}/live`);
            // Return the liveData array which contains the attraction wait times
            return NextResponse.json(data.liveData || []);
        } else if (entity === 'schedule') {
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');

            let url = `${BASE_URL}/entity/${themeParksId}/schedule`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const data = await cachedFetch(url);
            return NextResponse.json(data);
        } else if (entity === 'showtimes') {
            const date = searchParams.get('date');

            let url = `${BASE_URL}/entity/${themeParksId}/showtimes`;
            if (date) {
                url += `?date=${date}`;
            }

            const data = await cachedFetch(url);
            return NextResponse.json(data);
        } else {
            // Default: return park details
            const data = await cachedFetch(`${BASE_URL}/entity/${themeParksId}`);
            return NextResponse.json(data);
        }
    } catch (error) {
        const { parkId } = await params;
        console.error(`Error fetching data for park ${parkId}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch park data' },
            { status: 500 }
        );
    }
}