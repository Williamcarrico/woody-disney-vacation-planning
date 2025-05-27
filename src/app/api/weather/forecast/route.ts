import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'BUg7tFzAmctASd4DLGxkwDTSmuwWGHNS';
const BASE_URL = 'https://api.tomorrow.io/v4/weather';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const location = searchParams.get('location');
        const units = searchParams.get('units') || 'metric';

        if (!location) {
            return NextResponse.json(
                { error: 'Location parameter is required' },
                { status: 400 }
            );
        }

        const url = new URL(`${BASE_URL}/forecast`);
        url.searchParams.append('location', location);
        url.searchParams.append('units', units);
        url.searchParams.append('apikey', API_KEY);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Tomorrow.io API error:', response.status, errorText);
            return NextResponse.json(
                { error: `Weather API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Add location name if not provided by API
        if (!data.location?.name && typeof location === 'string') {
            data.location = {
                ...data.location,
                name: location
            };
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in weather forecast route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch weather forecast' },
            { status: 500 }
        );
    }
}