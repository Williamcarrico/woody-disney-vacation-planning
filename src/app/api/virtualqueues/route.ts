import { NextRequest, NextResponse } from 'next/server';
import { cache } from 'react';

const BASE_URL = 'https://api.themeparks.wiki/v1';

// Cache the fetch function
const cachedFetch = cache(async (url: string) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute (more frequent updates for virtual queues)
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
});

// GET handler for /api/virtualqueues
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const resort = searchParams.get('resort') || 'waltdisneyworldresort';

        const data = await cachedFetch(`${BASE_URL}/destination/${resort}/virtualqueues`);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching virtual queue data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch virtual queue data' },
            { status: 500 }
        );
    }
}