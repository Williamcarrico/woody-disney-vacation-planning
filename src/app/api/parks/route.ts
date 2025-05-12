import { NextRequest, NextResponse } from 'next/server';
import { cache } from 'react';

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
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const destination = searchParams.get('destination');

        // If a specific destination is requested, return only that destination's parks
        if (destination) {
            const data = await cachedFetch(`${BASE_URL}/destination/${destination}/parks`);
            return NextResponse.json(data);
        }

        // Otherwise, return all Disney parks
        const allDestinations = await cachedFetch(`${BASE_URL}/destinations`);
        const disneyDestinations = allDestinations.filter(
            (dest: any) => dest.slug.includes('disney')
        );

        return NextResponse.json(disneyDestinations);
    } catch (error) {
        console.error('Error fetching parks data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch parks data' },
            { status: 500 }
        );
    }
}