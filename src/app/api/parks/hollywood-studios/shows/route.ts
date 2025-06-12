import { NextRequest, NextResponse } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';

const HOLLYWOOD_STUDIOS_ID = '288747d1-8b4f-4a64-867e-ea7c9b27bad8';

// Show information with details
const HOLLYWOOD_STUDIOS_SHOWS = [
    {
        id: 'fantasmic',
        name: 'Fantasmic!',
        type: 'Nighttime Spectacular',
        area: 'Sunset Boulevard',
        icon: '🎆',
        duration: '25 minutes',
        description: 'Mickey Mouse dreams come to life in this nighttime extravaganza of water, music, fire, and light.',
        venue: 'Hollywood Hills Amphitheater',
        capacity: 6900,
        typical_showtimes: ['8:30 PM', '10:00 PM'],
        seasonality: {
            peak: ['8:30 PM', '10:00 PM'],
            regular: ['9:00 PM'],
            offpeak: ['8:30 PM']
        },
        highlights: [
            'Projection mapping on water screens',
            'Live performers and characters',
            'Fireworks and pyrotechnics',
            'Classic Disney music'
        ],
        tips: [
            'Arrive 30-45 minutes early for good seats',
            'Center sections fill up first',
            'Fantasmic Dining Package guarantees reserved seating',
            'Can get wet in first few rows'
        ],
        accessibility: ['Wheelchair accessible', 'Assistive listening available'],
        age_recommendation: 'All ages, but can be scary for young children'
    },
    {
        id: 'indiana-jones',
        name: 'Indiana Jones Epic Stunt Spectacular',
        type: 'Stunt Show',
        area: 'Echo Lake',
        icon: '🎬',
        duration: '30 minutes',
        description: 'Watch professional stunt performers recreate scenes from Raiders of the Lost Ark.',
        venue: 'Indiana Jones Theater',
        capacity: 2000,
        typical_showtimes: ['11:30 AM', '1:30 PM', '3:30 PM', '5:00 PM'],
        highlights: [
            'Live stunts and explosions',
            'Audience participation opportunities',
            'Behind-the-scenes movie magic',
            'Recreation of famous movie scenes'
        ],
        tips: [
            'Arrive 20-30 minutes early',
            'Sit in the casting sections for participation chance',
            'Covered outdoor theater - can be hot',
            'Shows may be cancelled in bad weather'
        ],
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        age_recommendation: 'Great for ages 6+'
    },
    {
        id: 'beauty-beast',
        name: 'Beauty and the Beast - Live on Stage',
        type: 'Broadway-style Musical',
        area: 'Sunset Boulevard',
        icon: '🌹',
        duration: '25 minutes',
        description: 'A Broadway-caliber condensed version of the beloved animated film.',
        venue: 'Theater of the Stars',
        capacity: 1500,
        typical_showtimes: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '4:00 PM', '5:30 PM'],
        highlights: [
            'Professional singers and dancers',
            'Elaborate costumes',
            'Classic songs from the movie',
            'Broadway-quality production'
        ],
        tips: [
            'Covered outdoor theater',
            'Center seats have best views',
            'Popular with all ages',
            'Great for afternoon break'
        ],
        accessibility: ['Wheelchair accessible', 'Sign language performances available'],
        age_recommendation: 'All ages'
    },
    {
        id: 'frozen-singalong',
        name: 'For the First Time in Forever: A Frozen Sing-Along Celebration',
        type: 'Interactive Musical Show',
        area: 'Echo Lake',
        icon: '❄️',
        duration: '30 minutes',
        description: 'Join Anna, Elsa, and the royal historians of Arendelle for a comedic retelling of Frozen.',
        venue: 'Hyperion Theater',
        capacity: 1000,
        typical_showtimes: ['10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:30 PM'],
        highlights: [
            'Audience sing-along',
            'Live appearances by Anna and Elsa',
            'Comedy from royal historians',
            'Air-conditioned theater'
        ],
        tips: [
            'Great way to cool off',
            'Very popular with families',
            'Arrives 15-20 minutes early',
            'FastPass+ available'
        ],
        accessibility: ['Wheelchair accessible', 'Assistive listening available'],
        age_recommendation: 'Perfect for young children'
    },
    {
        id: 'disney-junior',
        name: 'Disney Junior Play & Dance!',
        type: 'Interactive Character Show',
        area: 'Animation Courtyard',
        icon: '🎈',
        duration: '24 minutes',
        description: 'Dance and play along with favorite Disney Junior characters.',
        venue: 'Disney Junior Theater',
        capacity: 600,
        typical_showtimes: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        highlights: [
            'Interactive dancing and games',
            'Popular Disney Junior characters',
            'Perfect for toddlers',
            'Air-conditioned venue'
        ],
        tips: [
            'Seating on floor for little ones',
            'Adults can sit on benches in back',
            'Great morning activity',
            'No height requirements'
        ],
        accessibility: ['Wheelchair accessible', 'Sensory-friendly'],
        age_recommendation: 'Ages 2-6'
    },
    {
        id: 'muppet-vision',
        name: 'Muppet*Vision 3D',
        type: '3D Film Experience',
        area: 'Grand Avenue',
        icon: '🐸',
        duration: '17 minutes',
        description: 'Join Kermit and the gang for a hilarious 3D film experience with in-theater effects.',
        venue: 'Muppet*Vision 3D Theater',
        capacity: 584,
        typical_showtimes: 'Continuous throughout the day',
        highlights: [
            '3D effects and in-theater surprises',
            'Classic Muppet humor',
            'Air-conditioned theater',
            'Pre-show entertainment'
        ],
        tips: [
            'Usually short wait times',
            'Great for all ages',
            'Remove 3D glasses for some effects',
            'Classic attraction worth experiencing'
        ],
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        age_recommendation: 'All ages'
    },
    {
        id: 'voyage-mermaid',
        name: 'Voyage of the Little Mermaid',
        type: 'Live Musical Show',
        area: 'Animation Courtyard',
        icon: '🧜‍♀️',
        duration: '17 minutes',
        description: 'Journey under the sea with Ariel in this condensed retelling using puppets, live actors, and effects.',
        venue: 'Animation Courtyard Theater',
        capacity: 600,
        typical_showtimes: ['10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
        highlights: [
            'Puppetry and live performers',
            'Classic songs from the film',
            'Special effects including bubbles',
            'Air-conditioned theater'
        ],
        tips: [
            'Popular with young children',
            'Can get wet from bubble effects',
            'FastPass+ available',
            'Great afternoon break'
        ],
        accessibility: ['Wheelchair accessible', 'Assistive listening available'],
        age_recommendation: 'All ages, especially ages 3-10'
    },
    {
        id: 'jedi-training',
        name: 'Jedi Training: Trials of the Temple',
        type: 'Interactive Experience',
        area: 'Echo Lake',
        icon: '⚔️',
        duration: '20 minutes',
        description: 'Young Padawans train in the ways of the Force and face villains from the Dark Side.',
        venue: 'Jedi Training Stage',
        capacity: '15-20 children per show',
        typical_showtimes: 'Multiple times throughout the day',
        registration: 'Sign up required at park opening',
        highlights: [
            'Children get to use lightsabers',
            'Face off against Darth Vader or Kylo Ren',
            'Jedi robe provided',
            'PhotoPass included'
        ],
        tips: [
            'Sign up at Indiana Jones Adventure Outpost at park opening',
            'Ages 4-12 only',
            'Fills up quickly on busy days',
            'Parents can watch from viewing area'
        ],
        accessibility: ['Must be able to follow verbal instructions'],
        age_recommendation: 'Ages 4-12 only'
    }
];

/**
 * GET /api/parks/hollywood-studios/shows
 *
 * Get detailed information about Hollywood Studios shows and performances
 *
 * Query parameters:
 * - id: Get specific show by ID
 * - type: Filter by show type
 * - area: Filter by park area
 * - includeLive: Include current showtimes from live data
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showId = searchParams.get('id');
        const showType = searchParams.get('type');
        const area = searchParams.get('area');
        const includeLive = searchParams.get('includeLive') === 'true';

        // Get specific show
        if (showId) {
            const show = HOLLYWOOD_STUDIOS_SHOWS.find(s => s.id === showId);

            if (!show) {
                return NextResponse.json(
                    { error: 'Show not found' },
                    { status: 404 }
                );
            }

            // Enhance with live data if requested
            if (includeLive) {
                const liveData = await themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID);
                const liveShow = liveData.liveData.find(item =>
                    item.name.toLowerCase().includes(show.name.toLowerCase())
                );

                return NextResponse.json({
                    ...show,
                    live: {
                        status: liveShow?.status || 'UNKNOWN',
                        showtimes: liveShow?.showtimes || [],
                        nextShow: liveShow?.showtimes?.[0] || null
                    }
                });
            }

            return NextResponse.json(show);
        }

        // Filter shows
        let filteredShows = [...HOLLYWOOD_STUDIOS_SHOWS];

        if (showType) {
            filteredShows = filteredShows.filter(show =>
                show.type.toLowerCase().includes(showType.toLowerCase())
            );
        }

        if (area) {
            filteredShows = filteredShows.filter(show =>
                show.area.toLowerCase().includes(area.toLowerCase())
            );
        }

        // Enhance with live data if requested
        if (includeLive) {
            const liveData = await themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID);

            filteredShows = filteredShows.map(show => {
                const liveShow = liveData.liveData.find(item =>
                    item.name.toLowerCase().includes(show.name.toLowerCase())
                );

                return {
                    ...show,
                    live: {
                        status: liveShow?.status || 'UNKNOWN',
                        showtimes: liveShow?.showtimes || [],
                        nextShow: liveShow?.showtimes?.[0] || null
                    }
                };
            });
        }

        // Get current schedule info
        const now = new Date();
        const recommendations = getShowRecommendations(now);

        return NextResponse.json({
            shows: filteredShows,
            totalShows: filteredShows.length,
            showTypes: getUniqueShowTypes(),
            areas: getUniqueAreas(),
            recommendations,
            tips: getGeneralShowTips(),
            lastUpdate: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching Hollywood Studios shows:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch show data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper functions
function getUniqueShowTypes(): string[] {
    return [...new Set(HOLLYWOOD_STUDIOS_SHOWS.map(show => show.type))];
}

function getUniqueAreas(): string[] {
    return [...new Set(HOLLYWOOD_STUDIOS_SHOWS.map(show => show.area))];
}

function getShowRecommendations(date: Date): any {
    const hour = date.getHours();
    const recommendations = {
        current: [],
        upcoming: [],
        mustSee: ['Fantasmic!', 'Indiana Jones Epic Stunt Spectacular', 'Beauty and the Beast - Live on Stage']
    };

    // Morning recommendations (9 AM - 12 PM)
    if (hour >= 9 && hour < 12) {
        recommendations.current = ['Disney Junior Play & Dance!', 'Frozen Sing-Along'];
        recommendations.upcoming = ['Indiana Jones Epic Stunt Spectacular', 'Beauty and the Beast'];
    }
    // Afternoon recommendations (12 PM - 5 PM)
    else if (hour >= 12 && hour < 17) {
        recommendations.current = ['Indiana Jones Epic Stunt Spectacular', 'Muppet*Vision 3D'];
        recommendations.upcoming = ['Beauty and the Beast', 'Voyage of the Little Mermaid'];
    }
    // Evening recommendations (5 PM - close)
    else {
        recommendations.current = ['Beauty and the Beast', 'Fantasmic! (check times)'];
        recommendations.upcoming = ['Fantasmic!'];
    }

    return recommendations;
}

function getGeneralShowTips(): string[] {
    return [
        'Most shows run rain or shine, but outdoor shows may be cancelled in severe weather',
        'Fantasmic! is the must-see nighttime spectacular - arrive early',
        'Many shows offer FastPass+ to guarantee seating',
        'Indoor shows provide great air-conditioning breaks',
        'Check My Disney Experience app for real-time show schedules',
        'Jedi Training requires morning sign-up for children',
        'Show schedules vary by season - check times upon arrival'
    ];
}