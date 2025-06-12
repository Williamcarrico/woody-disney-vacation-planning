import { NextRequest, NextResponse } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';

const HOLLYWOOD_STUDIOS_ID = '288747d1-8b4f-4a64-867e-ea7c9b27bad8';

// Area definitions with detailed information
const HOLLYWOOD_STUDIOS_AREAS = [
    {
        id: 'hollywood-boulevard',
        name: 'Hollywood Boulevard',
        icon: '🎭',
        color: '#FFD700',
        description: 'Step back in time to the golden age of Hollywood, with Art Deco architecture and classic movie glamour.',
        coordinates: { lat: 28.3584, lng: -81.5587 },
        highlights: [
            'Mickey & Minnie\'s Runaway Railway',
            'The Chinese Theatre',
            'Hollywood & Vine Restaurant'
        ],
        shops: [
            'Mickey\'s of Hollywood',
            'Keystone Clothiers',
            'Celebrity 5 & 10'
        ],
        dining: [
            'Hollywood & Vine',
            'The Hollywood Brown Derby Lounge',
            'The Trolley Car Café'
        ],
        history: 'The park\'s main entrance area, designed to recreate 1930s Hollywood with authentic architectural details.',
        tips: [
            'Great for photos with the Chinese Theatre in the background',
            'Mickey & Minnie\'s Runaway Railway is best experienced early or late',
            'Check out the Citizens of Hollywood street performers'
        ]
    },
    {
        id: 'echo-lake',
        name: 'Echo Lake',
        icon: '🎪',
        color: '#4682B4',
        description: 'A lakeside setting combining classic Hollywood with modern adventure attractions.',
        coordinates: { lat: 28.3588, lng: -81.5594 },
        highlights: [
            'Star Tours – The Adventures Continue',
            'Indiana Jones Epic Stunt Spectacular',
            'Frozen Sing-Along Celebration'
        ],
        shops: [
            'Indiana Jones Adventure Outpost',
            'Tatooine Traders'
        ],
        dining: [
            'Hollywood & Vine',
            'Backlot Express',
            'Oasis Canteen'
        ],
        history: 'Named after the real Echo Lake in Los Angeles, this area blends different eras of entertainment.',
        tips: [
            'Indiana Jones show fills up quickly - arrive 20 minutes early',
            'Star Tours has multiple storylines - ride multiple times',
            'Frozen Sing-Along is great for cooling off'
        ]
    },
    {
        id: 'grand-avenue',
        name: 'Grand Avenue',
        icon: '🏛️',
        color: '#8B4513',
        description: 'Experience the urban vibe of downtown Los Angeles with street art and live entertainment.',
        coordinates: { lat: 28.3577, lng: -81.5591 },
        highlights: [
            'Muppet*Vision 3D',
            'BaseLine Tap House',
            'Street atmosphere'
        ],
        shops: [
            'Stage 1 Company Store'
        ],
        dining: [
            'BaseLine Tap House',
            'PizzeRizzo',
            'Mama Melrose\'s Ristorante Italiano'
        ],
        history: 'Opened in 2017, Grand Avenue represents modern downtown Los Angeles.',
        tips: [
            'BaseLine Tap House has great craft beer selection',
            'Muppet*Vision 3D is a classic - don\'t miss it',
            'Check out the street murals for photo ops'
        ]
    },
    {
        id: 'galaxys-edge',
        name: 'Star Wars: Galaxy\'s Edge',
        icon: '🚀',
        color: '#2E4A62',
        description: 'Transport yourself to the planet Batuu in the most immersive land ever created.',
        coordinates: { lat: 28.3553, lng: -81.5608 },
        highlights: [
            'Star Wars: Rise of the Resistance',
            'Millennium Falcon: Smugglers Run',
            'Oga\'s Cantina'
        ],
        shops: [
            'Savi\'s Workshop - Handbuilt Lightsabers',
            'Droid Depot',
            'Dok-Ondar\'s Den of Antiquities',
            'First Order Cargo',
            'Resistance Supply'
        ],
        dining: [
            'Oga\'s Cantina',
            'Docking Bay 7 Food and Cargo',
            'Ronto Roasters',
            'Kat Saka\'s Kettle',
            'Milk Stand'
        ],
        history: 'Opened in 2019, this 14-acre land is the largest single-themed land expansion in Disney Parks history.',
        tips: [
            'Rise of the Resistance breaks down frequently - have a backup plan',
            'Oga\'s Cantina requires reservations made 60 days in advance',
            'Building a lightsaber at Savi\'s is $250 but an unforgettable experience',
            'Use Play Disney Parks app for interactive experiences'
        ]
    },
    {
        id: 'toy-story-land',
        name: 'Toy Story Land',
        icon: '🧸',
        color: '#32CD32',
        description: 'Shrink down to the size of a toy in Andy\'s backyard with family-friendly attractions.',
        coordinates: { lat: 28.3566, lng: -81.5605 },
        highlights: [
            'Slinky Dog Dash',
            'Toy Story Mania!',
            'Alien Swirling Saucers'
        ],
        shops: [
            'Toy Story Land Merchandise Cart'
        ],
        dining: [
            'Woody\'s Lunch Box'
        ],
        history: 'Opened in 2018, this whimsical land makes guests feel like they\'ve been shrunk to toy size.',
        tips: [
            'Slinky Dog Dash has the longest waits - ride at rope drop or closing',
            'Mobile order at Woody\'s Lunch Box to save time',
            'Great for families with young children',
            'Limited shade - bring sunscreen'
        ]
    },
    {
        id: 'animation-courtyard',
        name: 'Animation Courtyard',
        icon: '🎨',
        color: '#FF69B4',
        description: 'Celebrate the art of Disney animation with shows and character experiences.',
        coordinates: { lat: 28.3577, lng: -81.5598 },
        highlights: [
            'Disney Junior Play & Dance',
            'Voyage of the Little Mermaid',
            'Star Wars Launch Bay'
        ],
        shops: [
            'Launch Bay Cargo',
            'Disney Junior Store'
        ],
        dining: [
            'Animation Courtyard Kiosk'
        ],
        history: 'Originally home to the animation tour, this area now focuses on character meet and greets.',
        tips: [
            'Great area for young children',
            'Star Wars Launch Bay has character meet and greets',
            'Air-conditioned shows provide a break from the heat'
        ]
    },
    {
        id: 'sunset-boulevard',
        name: 'Sunset Boulevard',
        icon: '🌅',
        color: '#FF6347',
        description: 'Home to the park\'s biggest thrills and the spectacular Fantasmic! nighttime show.',
        coordinates: { lat: 28.3594, lng: -81.5602 },
        highlights: [
            'The Twilight Zone Tower of Terror',
            'Rock \'n\' Roller Coaster Starring Aerosmith',
            'Beauty and the Beast - Live on Stage',
            'Fantasmic!'
        ],
        shops: [
            'Tower Hotel Gifts',
            'Rock Around the Shop',
            'Sunset Ranch Pins and Souvenirs'
        ],
        dining: [
            'Sunset Ranch Market',
            'The Hollywood Brown Derby'
        ],
        history: 'Opened in 1994, Sunset Boulevard expanded the park with major thrill attractions.',
        tips: [
            'Tower of Terror has Single Rider line on busy days',
            'Arrive 30-45 minutes early for good Fantasmic! seats',
            'Rock \'n\' Roller Coaster will be rethemed to Muppets',
            'Great atmosphere at sunset'
        ]
    }
];

/**
 * GET /api/parks/hollywood-studios/areas
 *
 * Get detailed information about Hollywood Studios themed areas
 *
 * Query parameters:
 * - id: Get specific area by ID
 * - includeAttractions: Include attraction details for each area
 * - includeDining: Include dining details for each area
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const areaId = searchParams.get('id');
        const includeAttractions = searchParams.get('includeAttractions') === 'true';
        const includeDining = searchParams.get('includeDining') === 'true';

        // If specific area requested
        if (areaId) {
            const area = HOLLYWOOD_STUDIOS_AREAS.find(a => a.id === areaId);

            if (!area) {
                return NextResponse.json(
                    { error: 'Area not found' },
                    { status: 404 }
                );
            }

            // Enhance with live data if requested
            if (includeAttractions || includeDining) {
                const [childrenData, liveData] = await Promise.all([
                    themeParksAPI.getChildren(HOLLYWOOD_STUDIOS_ID),
                    themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID)
                ]);

                const enhancedArea = {
                    ...area,
                    attractions: includeAttractions ?
                        getAreaAttractions(area.name, childrenData, liveData) : undefined,
                    diningDetails: includeDining ?
                        getAreaDining(area.name, childrenData) : undefined
                };

                return NextResponse.json(enhancedArea);
            }

            return NextResponse.json(area);
        }

        // Return all areas with optional enhancements
        if (includeAttractions || includeDining) {
            const [childrenData, liveData] = await Promise.all([
                themeParksAPI.getChildren(HOLLYWOOD_STUDIOS_ID),
                themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID)
            ]);

            const enhancedAreas = HOLLYWOOD_STUDIOS_AREAS.map(area => ({
                ...area,
                attractions: includeAttractions ?
                    getAreaAttractions(area.name, childrenData, liveData) : undefined,
                diningDetails: includeDining ?
                    getAreaDining(area.name, childrenData) : undefined,
                currentWaitTimes: includeAttractions ?
                    getAreaWaitTimes(area.name, liveData) : undefined
            }));

            return NextResponse.json({
                areas: enhancedAreas,
                totalAreas: HOLLYWOOD_STUDIOS_AREAS.length,
                lastUpdate: new Date().toISOString()
            });
        }

        return NextResponse.json({
            areas: HOLLYWOOD_STUDIOS_AREAS,
            totalAreas: HOLLYWOOD_STUDIOS_AREAS.length
        });

    } catch (error) {
        console.error('Error fetching Hollywood Studios areas:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch area data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper functions
function getAreaAttractions(areaName: string, childrenData: any, liveData: any) {
    const attractions = childrenData.children.filter((child: any) => {
        if (child.entityType !== 'ATTRACTION' && child.entityType !== 'SHOW') return false;
        return isInArea(child.name, areaName);
    });

    return attractions.map((attraction: any) => {
        const live = liveData.liveData.find((l: any) => l.id === attraction.id);
        return {
            id: attraction.id,
            name: attraction.name,
            entityType: attraction.entityType,
            status: live?.status || 'UNKNOWN',
            waitTime: live?.queue?.STANDBY?.waitTime || null,
            nextShowtime: live?.showtimes?.[0] || null
        };
    });
}

function getAreaDining(areaName: string, childrenData: any) {
    return childrenData.children.filter((child: any) => {
        if (child.entityType !== 'RESTAURANT') return false;
        return isInArea(child.name, areaName);
    }).map((restaurant: any) => ({
        id: restaurant.id,
        name: restaurant.name,
        entityType: restaurant.entityType
    }));
}

function getAreaWaitTimes(areaName: string, liveData: any) {
    const areaAttractions = liveData.liveData.filter((item: any) =>
        isInArea(item.name, areaName) && item.queue?.STANDBY?.waitTime !== null
    );

    if (areaAttractions.length === 0) {
        return { average: 0, peak: 0, count: 0 };
    }

    const waitTimes = areaAttractions.map((a: any) => a.queue.STANDBY.waitTime);
    const average = Math.round(waitTimes.reduce((a: number, b: number) => a + b, 0) / waitTimes.length);
    const peak = Math.max(...waitTimes);

    return { average, peak, count: waitTimes.length };
}

function isInArea(attractionName: string, areaName: string): boolean {
    const lowerName = attractionName.toLowerCase();
    const lowerArea = areaName.toLowerCase();

    // Map area names to attraction patterns
    const patterns: Record<string, string[]> = {
        'hollywood boulevard': ['mickey & minnie', 'runaway railway', 'chinese theatre'],
        'echo lake': ['star tours', 'indiana jones', 'frozen sing', 'jedi training'],
        'grand avenue': ['muppet', 'baseline'],
        'galaxy\'s edge': ['rise of', 'millennium falcon', 'oga', 'docking bay', 'savi', 'droid'],
        'toy story land': ['slinky', 'toy story mania', 'alien swirling', 'woody\'s lunch'],
        'animation courtyard': ['disney junior', 'little mermaid', 'launch bay', 'animation'],
        'sunset boulevard': ['tower of terror', 'rock \'n\' roller', 'beauty and the beast', 'fantasmic']
    };

    const areaPatterns = patterns[lowerArea] || [];
    return areaPatterns.some(pattern => lowerName.includes(pattern));
}