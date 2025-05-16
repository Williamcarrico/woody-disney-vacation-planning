import { NextRequest, NextResponse } from 'next/server';
import { LocationData } from '@/components/maps/interactive-map';

/**
 * API endpoint to get Disney World locations data
 * This could be extended to fetch from a database or external API in production
 */
export async function GET(request: NextRequest) {
    // Sample data for Disney World attractions
    const disneyLocations: LocationData[] = [
        {
            id: 'wdw-main',
            name: 'Walt Disney World Resort',
            description: 'Main entrance and central hub',
            lat: 28.3852,
            lng: -81.5639,
            type: 'main',
            imageUrl: '/images/locations/disney-world.jpg'
        },
        {
            id: 'magic-kingdom',
            name: 'Magic Kingdom',
            description: 'Where dreams come true',
            lat: 28.4177,
            lng: -81.5812,
            type: 'attraction',
            imageUrl: '/images/locations/magic-kingdom.jpg'
        },
        {
            id: 'epcot',
            name: 'EPCOT',
            description: 'Experimental Prototype Community of Tomorrow',
            lat: 28.3747,
            lng: -81.5494,
            type: 'attraction',
            imageUrl: '/images/locations/epcot.jpg'
        },
        {
            id: 'hollywood-studios',
            name: 'Disney\'s Hollywood Studios',
            description: 'Movie magic comes to life',
            lat: 28.3559,
            lng: -81.5597,
            type: 'attraction',
            imageUrl: '/images/locations/hollywood-studios.jpg'
        },
        {
            id: 'animal-kingdom',
            name: 'Disney\'s Animal Kingdom',
            description: 'Adventure and wildlife await',
            lat: 28.3536,
            lng: -81.5904,
            type: 'attraction',
            imageUrl: '/images/locations/animal-kingdom.jpg'
        },
        {
            id: 'disney-springs',
            name: 'Disney Springs',
            description: 'Dining, shopping, and entertainment district',
            lat: 28.3702,
            lng: -81.5462,
            type: 'entertainment',
            imageUrl: '/images/locations/disney-springs.jpg'
        },
        {
            id: 'blizzard-beach',
            name: 'Disney\'s Blizzard Beach',
            description: 'Water park themed as a melting ski resort',
            lat: 28.3546,
            lng: -81.5759,
            type: 'water-park',
            imageUrl: '/images/locations/blizzard-beach.jpg'
        },
        {
            id: 'typhoon-lagoon',
            name: 'Disney\'s Typhoon Lagoon',
            description: 'Water park themed around a tropical paradise',
            lat: 28.3655,
            lng: -81.5358,
            type: 'water-park',
            imageUrl: '/images/locations/typhoon-lagoon.jpg'
        }
    ];

    // Filter locations based on query parameters
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    let filteredLocations = disneyLocations;

    if (type) {
        filteredLocations = disneyLocations.filter(location =>
            location.type === type
        );
    }

    // Simulate a real API with delayed response
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(filteredLocations);
}

/**
 * API endpoint to search for locations by name or description
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json(
                { error: "Search query is required" },
                { status: 400 }
            );
        }

        // Sample data - in production, this would query a database
        const disneyLocations: LocationData[] = [
            {
                id: 'wdw-main',
                name: 'Walt Disney World Resort',
                description: 'Main entrance and central hub',
                lat: 28.3852,
                lng: -81.5639,
                type: 'main',
                imageUrl: '/images/locations/disney-world.jpg'
            },
            {
                id: 'magic-kingdom',
                name: 'Magic Kingdom',
                description: 'Where dreams come true',
                lat: 28.4177,
                lng: -81.5812,
                type: 'attraction',
                imageUrl: '/images/locations/magic-kingdom.jpg'
            },
            // Add more locations as needed
        ];

        // Perform search
        const searchQuery = query.toLowerCase();
        const results = disneyLocations.filter(location =>
            location.name.toLowerCase().includes(searchQuery) ||
            location.description?.toLowerCase().includes(searchQuery)
        );

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error processing map search request:", error);
        return NextResponse.json(
            { error: "Failed to process search request" },
            { status: 500 }
        );
    }
}