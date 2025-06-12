import { NextRequest, NextResponse } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';

// Hollywood Studios specific constants
const HOLLYWOOD_STUDIOS_ID = '288747d1-8b4f-4a64-867e-ea7c9b27bad8';
const HOLLYWOOD_STUDIOS_PARENT_ID = 'e957da41-3552-4cf6-b636-5babc5cbc4e5'; // Walt Disney World Resort

/**
 * GET /api/parks/hollywood-studios
 *
 * Comprehensive Hollywood Studios data endpoint supporting multiple data types
 *
 * Query parameters:
 * - type: 'info' | 'live' | 'attractions' | 'schedule' | 'map' | 'children' | 'complete'
 * - year: YYYY (for schedule)
 * - month: MM (for schedule)
 * - includeShowtimes: boolean (for live data)
 * - includeWaitTimes: boolean (for live data)
 * - area: string (filter by specific area)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const dataType = searchParams.get('type') || 'info';

        switch (dataType) {
            case 'info': {
                // Basic park information with Hollywood Studios specific enhancements
                const parkData = await themeParksAPI.getEntity(HOLLYWOOD_STUDIOS_ID);
                return NextResponse.json({
                    ...parkData,
                    // Enhanced Hollywood Studios-specific information
                    parkInfo: {
                        fullName: 'Disney\'s Hollywood Studios',
                        previousNames: ['Disney-MGM Studios', 'Disney\'s Hollywood Studios'],
                        opened: 'May 1, 1989',
                        size: '135 acres',
                        icon: '🎬',
                        theme: 'Movies, Television, Music, and Theater',
                        areas: [
                            'Hollywood Boulevard',
                            'Echo Lake',
                            'Grand Avenue',
                            'Star Wars: Galaxy\'s Edge',
                            'Toy Story Land',
                            'Animation Courtyard',
                            'Sunset Boulevard'
                        ],
                        highlights: [
                            'Star Wars: Rise of the Resistance',
                            'Mickey & Minnie\'s Runaway Railway',
                            'The Twilight Zone Tower of Terror',
                            'Rock \'n\' Roller Coaster',
                            'Millennium Falcon: Smugglers Run',
                            'Slinky Dog Dash',
                            'Toy Story Mania!'
                        ],
                        signature: {
                            icon: 'The Hollywood Tower Hotel',
                            centerpiece: 'The Chinese Theatre',
                            musicalScore: 'Hooray for Hollywood'
                        }
                    }
                });
            }

            case 'live': {
                // Live data with enhanced filtering and categorization
                const liveData = await themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID);
                const includeShowtimes = searchParams.get('includeShowtimes') === 'true';
                const includeWaitTimes = searchParams.get('includeWaitTimes') === 'true';
                const areaFilter = searchParams.get('area');

                let filteredData = liveData.liveData;

                // Filter based on query parameters
                if (includeShowtimes || includeWaitTimes) {
                    filteredData = liveData.liveData.filter(item => {
                        if (includeShowtimes && item.showtimes?.length > 0) return true;
                        if (includeWaitTimes && item.queue?.STANDBY?.waitTime !== null) return true;
                        return false;
                    });
                }

                // Filter by area if specified
                if (areaFilter) {
                    filteredData = filteredData.filter(item =>
                        getAreaForAttraction(item.name) === areaFilter
                    );
                }

                // Categorize live data by area and type
                const categorizedData = {
                    ...liveData,
                    liveData: filteredData,
                    summary: {
                        totalAttractions: filteredData.length,
                        operating: filteredData.filter(item => item.status === 'OPERATING').length,
                        closed: filteredData.filter(item => item.status === 'CLOSED').length,
                        refurbishment: filteredData.filter(item => item.status === 'REFURBISHMENT').length,
                        down: filteredData.filter(item => item.status === 'DOWN').length,
                        averageWaitTime: calculateAverageWaitTime(filteredData),
                        peakWaitTimes: getPeakWaitTimes(filteredData),
                        areas: {
                            hollywoodBoulevard: filteredData.filter(item => isInHollywoodBoulevard(item.name)),
                            echoLake: filteredData.filter(item => isInEchoLake(item.name)),
                            grandAvenue: filteredData.filter(item => isInGrandAvenue(item.name)),
                            galaxysEdge: filteredData.filter(item => isInGalaxysEdge(item.name)),
                            toyStoryLand: filteredData.filter(item => isInToyStoryLand(item.name)),
                            animationCourtyard: filteredData.filter(item => isInAnimationCourtyard(item.name)),
                            sunsetBoulevard: filteredData.filter(item => isInSunsetBoulevard(item.name))
                        },
                        attractions: {
                            thrill: filteredData.filter(item => isThrillRide(item.name)),
                            family: filteredData.filter(item => isFamilyRide(item.name)),
                            shows: filteredData.filter(item => item.entityType === 'SHOW' || isShow(item.name)),
                            interactive: filteredData.filter(item => isInteractive(item.name))
                        }
                    }
                };

                return NextResponse.json(categorizedData);
            }

            case 'attractions':
            case 'children': {
                // All child entities with Hollywood Studios categorization
                const childrenData = await themeParksAPI.getChildren(HOLLYWOOD_STUDIOS_ID);

                // Categorize by entity type and Hollywood Studios area
                const categorized = {
                    ...childrenData,
                    categorized: {
                        attractions: childrenData.children.filter(child => child.entityType === 'ATTRACTION'),
                        restaurants: childrenData.children.filter(child => child.entityType === 'RESTAURANT'),
                        shows: childrenData.children.filter(child => child.entityType === 'SHOW'),
                        shops: childrenData.children.filter(child => child.entityType === 'MERCHANDISE'),
                        experiences: childrenData.children.filter(child =>
                            child.entityType === 'EXPERIENCE' || isExperience(child.name)
                        ),
                        byArea: {
                            hollywoodBoulevard: childrenData.children.filter(child => isInHollywoodBoulevard(child.name)),
                            echoLake: childrenData.children.filter(child => isInEchoLake(child.name)),
                            grandAvenue: childrenData.children.filter(child => isInGrandAvenue(child.name)),
                            galaxysEdge: childrenData.children.filter(child => isInGalaxysEdge(child.name)),
                            toyStoryLand: childrenData.children.filter(child => isInToyStoryLand(child.name)),
                            animationCourtyard: childrenData.children.filter(child => isInAnimationCourtyard(child.name)),
                            sunsetBoulevard: childrenData.children.filter(child => isInSunsetBoulevard(child.name))
                        },
                        byIntensity: {
                            extreme: childrenData.children.filter(child => isExtremeThrillRide(child.name)),
                            thrill: childrenData.children.filter(child => isThrillRide(child.name)),
                            moderate: childrenData.children.filter(child => isModerateRide(child.name)),
                            family: childrenData.children.filter(child => isFamilyRide(child.name))
                        }
                    }
                };

                return NextResponse.json(categorized);
            }

            case 'schedule': {
                // Park operating schedule with show schedules
                const year = searchParams.get('year');
                const month = searchParams.get('month');

                const scheduleData = await themeParksAPI.getSchedule(
                    HOLLYWOOD_STUDIOS_ID,
                    year ? parseInt(year) : undefined,
                    month ? parseInt(month) : undefined
                );

                // Enhance with Hollywood Studios-specific event information
                const enhancedSchedule = {
                    ...scheduleData,
                    schedule: scheduleData.schedule.map(day => ({
                        ...day,
                        shows: getShowSchedule(day.date),
                        specialEvents: getSpecialEvents(day.date),
                        crowdLevel: estimateCrowdLevel(day.date),
                        recommendations: getDailyRecommendations(day.date, day.type)
                    }))
                };

                return NextResponse.json(enhancedSchedule);
            }

            case 'map': {
                // Interactive map data with Hollywood Studios theming
                const [parkData, childrenData, liveData] = await Promise.all([
                    themeParksAPI.getEntity(HOLLYWOOD_STUDIOS_ID),
                    themeParksAPI.getChildren(HOLLYWOOD_STUDIOS_ID),
                    themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID)
                ]);

                // Create map-friendly data structure
                const mapData = {
                    park: parkData,
                    areas: [
                        {
                            id: 'hollywood-boulevard',
                            name: 'Hollywood Boulevard',
                            color: '#FFD700',
                            icon: '🎭',
                            coordinates: { lat: 28.3584, lng: -81.5587 },
                            description: 'Step into the golden age of Hollywood'
                        },
                        {
                            id: 'echo-lake',
                            name: 'Echo Lake',
                            color: '#4682B4',
                            icon: '🎪',
                            coordinates: { lat: 28.3588, lng: -81.5594 },
                            description: 'Classic Hollywood meets modern adventure'
                        },
                        {
                            id: 'grand-avenue',
                            name: 'Grand Avenue',
                            color: '#8B4513',
                            icon: '🏛️',
                            coordinates: { lat: 28.3577, lng: -81.5591 },
                            description: 'Historic Los Angeles street life'
                        },
                        {
                            id: 'galaxys-edge',
                            name: 'Star Wars: Galaxy\'s Edge',
                            color: '#2E4A62',
                            icon: '🚀',
                            coordinates: { lat: 28.3553, lng: -81.5608 },
                            description: 'Live your own Star Wars adventure on Batuu'
                        },
                        {
                            id: 'toy-story-land',
                            name: 'Toy Story Land',
                            color: '#32CD32',
                            icon: '🧸',
                            coordinates: { lat: 28.3566, lng: -81.5605 },
                            description: 'Shrink down to toy size in Andy\'s backyard'
                        },
                        {
                            id: 'animation-courtyard',
                            name: 'Animation Courtyard',
                            color: '#FF69B4',
                            icon: '🎨',
                            coordinates: { lat: 28.3577, lng: -81.5598 },
                            description: 'Celebrate Disney animation'
                        },
                        {
                            id: 'sunset-boulevard',
                            name: 'Sunset Boulevard',
                            color: '#FF6347',
                            icon: '🌅',
                            coordinates: { lat: 28.3594, lng: -81.5602 },
                            description: 'Thrills and chills on the boulevard'
                        }
                    ],
                    points: childrenData.children.map(child => {
                        const liveInfo = liveData.liveData.find(live => live.id === child.id);
                        return {
                            ...child,
                            area: getAreaForAttraction(child.name),
                            status: liveInfo?.status || 'UNKNOWN',
                            waitTime: liveInfo?.queue?.STANDBY?.waitTime || null,
                            nextShowtime: liveInfo?.showtimes?.[0] || null,
                            coordinates: child.location || estimateCoordinates(child.name),
                            intensity: getIntensityLevel(child.name),
                            mustDo: isMustDo(child.name)
                        };
                    })
                };

                return NextResponse.json(mapData);
            }

            case 'complete': {
                // All data combined for comprehensive overview
                const [parkData, childrenData, liveData, scheduleData] = await Promise.all([
                    themeParksAPI.getEntity(HOLLYWOOD_STUDIOS_ID),
                    themeParksAPI.getChildren(HOLLYWOOD_STUDIOS_ID),
                    themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID),
                    themeParksAPI.getSchedule(HOLLYWOOD_STUDIOS_ID)
                ]);

                return NextResponse.json({
                    park: {
                        ...parkData,
                        parkInfo: {
                            fullName: 'Disney\'s Hollywood Studios',
                            opened: 'May 1, 1989',
                            size: '135 acres',
                            icon: '🎬',
                            theme: 'Movies, Television, Music, and Theater',
                            signature: {
                                icon: 'The Hollywood Tower Hotel',
                                centerpiece: 'The Chinese Theatre'
                            }
                        }
                    },
                    children: childrenData,
                    live: liveData,
                    schedule: scheduleData,
                    recommendations: getGeneralRecommendations(),
                    tips: getParkTips(),
                    lastUpdate: new Date().toISOString()
                });
            }

            default: {
                return NextResponse.json(
                    {
                        error: 'Invalid type parameter',
                        validTypes: ['info', 'live', 'attractions', 'schedule', 'map', 'children', 'complete'],
                        description: {
                            info: 'Basic park information and metadata',
                            live: 'Current wait times, showtimes, and operational status',
                            attractions: 'All attractions, restaurants, shows, and shops',
                            schedule: 'Park operating hours and special events',
                            map: 'Interactive map data with coordinates and areas',
                            children: 'Same as attractions - all child entities',
                            complete: 'All data combined in one response'
                        }
                    },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        console.error('Error fetching Hollywood Studios data:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch Hollywood Studios data',
                message: error instanceof Error ? error.message : 'Unknown error',
                parkId: HOLLYWOOD_STUDIOS_ID
            },
            { status: 500 }
        );
    }
}

// Helper functions for Hollywood Studios area categorization
function isInHollywoodBoulevard(name: string): boolean {
    const attractions = [
        'Mickey & Minnie\'s Runaway Railway',
        'The Great Movie Ride', // Historical
        'Mickey and Minnie Starring in Red Carpet Dreams'
    ];
    return attractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInEchoLake(name: string): boolean {
    const attractions = [
        'Star Tours',
        'Indiana Jones Epic Stunt Spectacular',
        'Jedi Training',
        'Frozen Sing-Along'
    ];
    return attractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInGrandAvenue(name: string): boolean {
    const attractions = [
        'Muppet*Vision 3D',
        'BaseLine Tap House',
        'PizzeRizzo'
    ];
    return attractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInGalaxysEdge(name: string): boolean {
    const attractions = [
        'Rise of the Resistance',
        'Millennium Falcon',
        'Smuggler',
        'Oga\'s Cantina',
        'Docking Bay',
        'Savi\'s Workshop',
        'Droid Depot'
    ];
    return attractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInToyStoryLand(name: string): boolean {
    const attractions = [
        'Slinky Dog',
        'Toy Story Mania',
        'Alien Swirling Saucers',
        'Woody\'s Lunch Box'
    ];
    return attractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInAnimationCourtyard(name: string): boolean {
    const attractions = [
        'Disney Junior',
        'Voyage of the Little Mermaid',
        'Animation Academy'
    ];
    return attractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInSunsetBoulevard(name: string): boolean {
    const attractions = [
        'Tower of Terror',
        'Rock \'n\' Roller Coaster',
        'Beauty and the Beast',
        'Fantasmic'
    ];
    return attractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

// Ride intensity categorization
function isExtremeThrillRide(name: string): boolean {
    const extremeRides = ['Rock \'n\' Roller Coaster'];
    return extremeRides.some(ride => name.toLowerCase().includes(ride.toLowerCase()));
}

function isThrillRide(name: string): boolean {
    const thrillRides = [
        'Tower of Terror',
        'Rock \'n\' Roller Coaster',
        'Rise of the Resistance',
        'Millennium Falcon'
    ];
    return thrillRides.some(ride => name.toLowerCase().includes(ride.toLowerCase()));
}

function isModerateRide(name: string): boolean {
    const moderateRides = [
        'Slinky Dog Dash',
        'Star Tours'
    ];
    return moderateRides.some(ride => name.toLowerCase().includes(ride.toLowerCase()));
}

function isFamilyRide(name: string): boolean {
    const familyRides = [
        'Toy Story Mania',
        'Mickey & Minnie\'s Runaway Railway',
        'Alien Swirling Saucers'
    ];
    return familyRides.some(ride => name.toLowerCase().includes(ride.toLowerCase()));
}

function isShow(name: string): boolean {
    const shows = [
        'Indiana Jones Epic Stunt',
        'Beauty and the Beast',
        'Frozen Sing-Along',
        'Disney Junior',
        'Muppet*Vision',
        'Fantasmic'
    ];
    return shows.some(show => name.toLowerCase().includes(show.toLowerCase()));
}

function isInteractive(name: string): boolean {
    const interactive = [
        'Millennium Falcon',
        'Toy Story Mania',
        'Savi\'s Workshop',
        'Droid Depot'
    ];
    return interactive.some(exp => name.toLowerCase().includes(exp.toLowerCase()));
}

function isExperience(name: string): boolean {
    const experiences = [
        'Jedi Training',
        'Animation Academy',
        'Savi\'s Workshop',
        'Droid Depot'
    ];
    return experiences.some(exp => name.toLowerCase().includes(exp.toLowerCase()));
}

function isMustDo(name: string): boolean {
    const mustDo = [
        'Rise of the Resistance',
        'Mickey & Minnie\'s Runaway Railway',
        'Tower of Terror',
        'Rock \'n\' Roller Coaster',
        'Slinky Dog Dash',
        'Millennium Falcon'
    ];
    return mustDo.some(attraction => name.toLowerCase().includes(attraction.toLowerCase()));
}

// Utility functions
function calculateAverageWaitTime(liveData: any[]): number {
    const waitTimes = liveData
        .filter(item => item.queue?.STANDBY?.waitTime !== null)
        .map(item => item.queue.STANDBY.waitTime);

    if (waitTimes.length === 0) return 0;

    const sum = waitTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / waitTimes.length);
}

function getPeakWaitTimes(liveData: any[]): any[] {
    return liveData
        .filter(item => item.queue?.STANDBY?.waitTime !== null)
        .sort((a, b) => b.queue.STANDBY.waitTime - a.queue.STANDBY.waitTime)
        .slice(0, 5)
        .map(item => ({
            name: item.name,
            waitTime: item.queue.STANDBY.waitTime,
            area: getAreaForAttraction(item.name)
        }));
}

function getAreaForAttraction(name: string): string {
    if (isInHollywoodBoulevard(name)) return 'hollywood-boulevard';
    if (isInEchoLake(name)) return 'echo-lake';
    if (isInGrandAvenue(name)) return 'grand-avenue';
    if (isInGalaxysEdge(name)) return 'galaxys-edge';
    if (isInToyStoryLand(name)) return 'toy-story-land';
    if (isInAnimationCourtyard(name)) return 'animation-courtyard';
    if (isInSunsetBoulevard(name)) return 'sunset-boulevard';
    return 'unknown';
}

function getIntensityLevel(name: string): string {
    if (isExtremeThrillRide(name)) return 'extreme';
    if (isThrillRide(name)) return 'thrill';
    if (isModerateRide(name)) return 'moderate';
    if (isFamilyRide(name)) return 'family';
    return 'all-ages';
}

function estimateCoordinates(name: string): { latitude: number; longitude: number } {
    const area = getAreaForAttraction(name);
    const baseCoords = {
        'hollywood-boulevard': { latitude: 28.3584, longitude: -81.5587 },
        'echo-lake': { latitude: 28.3588, longitude: -81.5594 },
        'grand-avenue': { latitude: 28.3577, longitude: -81.5591 },
        'galaxys-edge': { latitude: 28.3553, longitude: -81.5608 },
        'toy-story-land': { latitude: 28.3566, longitude: -81.5605 },
        'animation-courtyard': { latitude: 28.3577, longitude: -81.5598 },
        'sunset-boulevard': { latitude: 28.3594, longitude: -81.5602 },
        'unknown': { latitude: 28.3584, longitude: -81.5587 }
    };

    // Add small random offset to prevent overlapping
    const offset = () => (Math.random() - 0.5) * 0.0005;
    const coords = baseCoords[area] || baseCoords.unknown;

    return {
        latitude: coords.latitude + offset(),
        longitude: coords.longitude + offset()
    };
}

function getShowSchedule(date: string): any[] {
    // Return typical show schedule
    return [
        { name: 'Indiana Jones Epic Stunt Spectacular', times: ['11:30 AM', '1:30 PM', '3:30 PM', '5:00 PM'] },
        { name: 'Beauty and the Beast - Live on Stage', times: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '4:00 PM'] },
        { name: 'Disney Junior Play & Dance', times: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM'] },
        { name: 'Frozen Sing-Along Celebration', times: ['10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM'] },
        { name: 'Fantasmic!', times: ['8:30 PM', '10:00 PM'] }
    ];
}

function getSpecialEvents(date: string): string[] {
    const events = [];
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const dayOfWeek = dateObj.getDay();

    // Seasonal events
    if (month === 12) events.push('Jingle Bell, Jingle BAM!');
    if (month >= 8 && month <= 10) events.push('Disney Villains After Hours');

    // Regular events
    if (dayOfWeek === 2 || dayOfWeek === 5) {
        events.push('Early Morning Magic');
    }

    return events;
}

function estimateCrowdLevel(date: string): string {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const month = dateObj.getMonth() + 1;

    // Weekends are busier
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'high';

    // Peak seasons
    if (month === 7 || month === 12) return 'very-high';
    if (month === 3 || month === 4) return 'high';

    // Off-peak
    if (month === 1 || month === 2 || month === 9) return 'low';

    return 'moderate';
}

function getDailyRecommendations(date: string, parkType: string): string[] {
    const recommendations = [];
    const crowdLevel = estimateCrowdLevel(date);

    if (crowdLevel === 'low' || crowdLevel === 'moderate') {
        recommendations.push('Great day to experience Rise of the Resistance without Individual Lightning Lane');
    }

    if (parkType === 'EXTRA_MAGIC') {
        recommendations.push('Arrive 30 minutes before Early Entry for shortest waits');
    }

    recommendations.push('Book Oga\'s Cantina reservation 60 days in advance');
    recommendations.push('Mobile order lunch at Docking Bay 7 to save time');

    return recommendations;
}

function getGeneralRecommendations(): any {
    return {
        mustDo: [
            'Star Wars: Rise of the Resistance',
            'Mickey & Minnie\'s Runaway Railway',
            'The Twilight Zone Tower of Terror'
        ],
        dining: [
            'Oga\'s Cantina - Unique Star Wars themed drinks',
            'Sci-Fi Dine-In Theater - Dine in classic cars',
            'The Hollywood Brown Derby - Signature Cobb Salad'
        ],
        tips: [
            'Arrive 30 minutes before park opening for Rise of the Resistance',
            'Book dining reservations 60 days in advance',
            'Use Mobile Order for quick service locations'
        ]
    };
}

function getParkTips(): string[] {
    return [
        'Hollywood Studios has the most popular attraction at Walt Disney World - Rise of the Resistance',
        'Early morning and late evening have the shortest wait times',
        'Single rider lines available at Millennium Falcon and Rock \'n\' Roller Coaster',
        'Fantasmic! requires arriving 30-45 minutes early for good seats',
        'Park hopping to Hollywood Studios after 2 PM often has availability'
    ];
}