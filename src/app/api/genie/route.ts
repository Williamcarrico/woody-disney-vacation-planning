import { NextRequest, NextResponse } from 'next/server';
import { cache } from 'react';

const BASE_URL = 'https://api.themeparks.wiki/v1';

// Cache the fetch function
const cachedFetch = cache(async (url: string) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute (more frequent updates for Genie+)
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
});

// GET handler for /api/genie
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const resort = searchParams.get('resort') || 'waltdisneyworldresort';

        const data = await cachedFetch(`${BASE_URL}/destination/${resort}/genie`);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching Genie data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Genie data' },
            { status: 500 }
        );
    }
}