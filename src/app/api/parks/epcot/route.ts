import { NextRequest, NextResponse } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';

// EPCOT-specific constants
const EPCOT_ID = '47f90d2c-e191-4239-a466-5892ef59a88b';
const EPCOT_PARENT_ID = 'e957da41-3552-4cf6-b636-5babc5cbc4e5'; // Walt Disney World Resort

/**
 * GET /api/parks/epcot
 *
 * Comprehensive EPCOT data endpoint supporting multiple data types
 *
 * Query parameters:
 * - type: 'info' | 'live' | 'attractions' | 'schedule' | 'map' | 'children' | 'complete'
 * - year: YYYY (for schedule)
 * - month: MM (for schedule)
 * - includeShowtimes: boolean (for live data)
 * - includeWaitTimes: boolean (for live data)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const dataType = searchParams.get('type') || 'info';

        switch (dataType) {
            case 'info': {
                // Basic park information
                const parkData = await themeParksAPI.getEntity(EPCOT_ID);
                return NextResponse.json({
                    ...parkData,
                    // Enhanced EPCOT-specific information
                    parkInfo: {
                        fullName: 'Experimental Prototype Community of Tomorrow',
                        opened: 'October 1, 1982',
                        size: '305 acres',
                        icon: '🌍',
                        theme: 'Technology, Innovation, and World Culture',
                        areas: [
                            'World Celebration',
                            'World Discovery',
                            'World Nature',
                            'World Showcase'
                        ],
                        highlights: [
                            'Spaceship Earth',
                            'Guardians of the Galaxy: Cosmic Rewind',
                            'Test Track',
                            'Frozen Ever After',
                            'Remy\'s Ratatouille Adventure',
                            'Soarin\' Around the World'
                        ]
                    }
                });
            }

            case 'live': {
                // Live data with enhanced filtering
                const liveData = await themeParksAPI.getLiveData(EPCOT_ID);
                const includeShowtimes = searchParams.get('includeShowtimes') === 'true';
                const includeWaitTimes = searchParams.get('includeWaitTimes') === 'true';

                let filteredData = liveData.liveData;

                // Filter based on query parameters
                if (!includeShowtimes && !includeWaitTimes) {
                    // Return all data if no specific filters
                    filteredData = liveData.liveData;
                } else {
                    filteredData = liveData.liveData.filter(item => {
                        if (includeShowtimes && item.showtimes?.length > 0) return true;
                        if (includeWaitTimes && item.queue?.STANDBY?.waitTime !== null) return true;
                        return false;
                    });
                }

                // Categorize live data
                const categorizedData = {
                    ...liveData,
                    liveData: filteredData,
                    summary: {
                        totalAttractions: filteredData.length,
                        operating: filteredData.filter(item => item.status === 'OPERATING').length,
                        closed: filteredData.filter(item => item.status === 'CLOSED').length,
                        refurbishment: filteredData.filter(item => item.status === 'REFURBISHMENT').length,
                        averageWaitTime: calculateAverageWaitTime(filteredData),
                        attractions: {
                            worldCelebration: filteredData.filter(item => isInWorldCelebration(item.name)),
                            worldDiscovery: filteredData.filter(item => isInWorldDiscovery(item.name)),
                            worldNature: filteredData.filter(item => isInWorldNature(item.name)),
                            worldShowcase: filteredData.filter(item => isInWorldShowcase(item.name))
                        }
                    }
                };

                return NextResponse.json(categorizedData);
            }

            case 'attractions':
            case 'children': {
                // All child entities (attractions, restaurants, shops, shows)
                const childrenData = await themeParksAPI.getChildren(EPCOT_ID);

                // Categorize by entity type and EPCOT area
                const categorized = {
                    ...childrenData,
                    categorized: {
                        attractions: childrenData.children.filter(child => child.entityType === 'ATTRACTION'),
                        restaurants: childrenData.children.filter(child => child.entityType === 'RESTAURANT'),
                        shows: childrenData.children.filter(child => child.entityType === 'SHOW'),
                        shops: childrenData.children.filter(child => child.entityType === 'MERCHANDISE'),
                        byArea: {
                            worldCelebration: childrenData.children.filter(child => isInWorldCelebration(child.name)),
                            worldDiscovery: childrenData.children.filter(child => isInWorldDiscovery(child.name)),
                            worldNature: childrenData.children.filter(child => isInWorldNature(child.name)),
                            worldShowcase: childrenData.children.filter(child => isInWorldShowcase(child.name))
                        }
                    }
                };

                return NextResponse.json(categorized);
            }

            case 'schedule': {
                // Park operating schedule
                const year = searchParams.get('year');
                const month = searchParams.get('month');

                const scheduleData = await themeParksAPI.getSchedule(
                    EPCOT_ID,
                    year ? parseInt(year) : undefined,
                    month ? parseInt(month) : undefined
                );

                // Enhance with EPCOT-specific event information
                const enhancedSchedule = {
                    ...scheduleData,
                    schedule: scheduleData.schedule.map(day => ({
                        ...day,
                        festivals: getActiveFestivals(day.date),
                        specialEvents: getSpecialEvents(day.date)
                    }))
                };

                return NextResponse.json(enhancedSchedule);
            }

            case 'map': {
                // Interactive map data
                const [parkData, childrenData, liveData] = await Promise.all([
                    themeParksAPI.getEntity(EPCOT_ID),
                    themeParksAPI.getChildren(EPCOT_ID),
                    themeParksAPI.getLiveData(EPCOT_ID)
                ]);

                // Create map-friendly data structure
                const mapData = {
                    park: parkData,
                    areas: [
                        {
                            id: 'world-celebration',
                            name: 'World Celebration',
                            color: '#4A90E2',
                            coordinates: { lat: 28.3747, lng: -81.5494 },
                            description: 'The heart of EPCOT featuring Spaceship Earth'
                        },
                        {
                            id: 'world-discovery',
                            name: 'World Discovery',
                            color: '#7B68EE',
                            coordinates: { lat: 28.3739, lng: -81.5482 },
                            description: 'Science and technology attractions'
                        },
                        {
                            id: 'world-nature',
                            name: 'World Nature',
                            color: '#2ECC71',
                            coordinates: { lat: 28.3739, lng: -81.5506 },
                            description: 'Nature and environmental experiences'
                        },
                        {
                            id: 'world-showcase',
                            name: 'World Showcase',
                            color: '#E74C3C',
                            coordinates: { lat: 28.3698, lng: -81.5494 },
                            description: '11 country pavilions around World Showcase Lagoon'
                        }
                    ],
                    points: childrenData.children.map(child => {
                        const liveInfo = liveData.liveData.find(live => live.id === child.id);
                        return {
                            ...child,
                            area: getAreaForAttraction(child.name),
                            status: liveInfo?.status || 'UNKNOWN',
                            waitTime: liveInfo?.queue?.STANDBY?.waitTime || null,
                            coordinates: child.location || estimateCoordinates(child.name)
                        };
                    })
                };

                return NextResponse.json(mapData);
            }

            case 'complete': {
                // All data combined
                const [parkData, childrenData, liveData, scheduleData] = await Promise.all([
                    themeParksAPI.getEntity(EPCOT_ID),
                    themeParksAPI.getChildren(EPCOT_ID),
                    themeParksAPI.getLiveData(EPCOT_ID),
                    themeParksAPI.getSchedule(EPCOT_ID)
                ]);

                return NextResponse.json({
                    park: {
                        ...parkData,
                        parkInfo: {
                            fullName: 'Experimental Prototype Community of Tomorrow',
                            opened: 'October 1, 1982',
                            size: '305 acres',
                            icon: '🌍',
                            theme: 'Technology, Innovation, and World Culture'
                        }
                    },
                    children: childrenData,
                    live: liveData,
                    schedule: scheduleData,
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
        console.error('Error fetching EPCOT data:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch EPCOT data',
                message: error instanceof Error ? error.message : 'Unknown error',
                parkId: EPCOT_ID
            },
            { status: 500 }
        );
    }
}

// Helper functions for EPCOT area categorization
function isInWorldCelebration(name: string): boolean {
    const worldCelebrationAttractions = [
        'Spaceship Earth',
        'Journey Into Imagination',
        'The Seas with Nemo & Friends',
        'Awesome Planet',
        'Club Cool'
    ];
    return worldCelebrationAttractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInWorldDiscovery(name: string): boolean {
    const worldDiscoveryAttractions = [
        'Guardians of the Galaxy',
        'Mission: SPACE',
        'Test Track',
        'Play!'
    ];
    return worldDiscoveryAttractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInWorldNature(name: string): boolean {
    const worldNatureAttractions = [
        'Soarin',
        'Living with the Land',
        'The Land',
        'Awesome Planet'
    ];
    return worldNatureAttractions.some(attraction =>
        name.toLowerCase().includes(attraction.toLowerCase())
    );
}

function isInWorldShowcase(name: string): boolean {
    const countries = [
        'Mexico', 'Norway', 'China', 'Germany', 'Italy',
        'America', 'Japan', 'Morocco', 'France', 'United Kingdom', 'Canada'
    ];
    return countries.some(country =>
        name.toLowerCase().includes(country.toLowerCase())
    );
}

function calculateAverageWaitTime(liveData: any[]): number {
    const waitTimes = liveData
        .filter(item => item.queue?.STANDBY?.waitTime !== null)
        .map(item => item.queue.STANDBY.waitTime);

    if (waitTimes.length === 0) return 0;

    const sum = waitTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / waitTimes.length);
}

function getAreaForAttraction(name: string): string {
    if (isInWorldCelebration(name)) return 'world-celebration';
    if (isInWorldDiscovery(name)) return 'world-discovery';
    if (isInWorldNature(name)) return 'world-nature';
    if (isInWorldShowcase(name)) return 'world-showcase';
    return 'unknown';
}

function estimateCoordinates(name: string): { latitude: number; longitude: number } {
    // Estimate coordinates based on area
    const area = getAreaForAttraction(name);
    const baseCoords = {
        'world-celebration': { latitude: 28.3747, longitude: -81.5494 },
        'world-discovery': { latitude: 28.3739, longitude: -81.5482 },
        'world-nature': { latitude: 28.3739, longitude: -81.5506 },
        'world-showcase': { latitude: 28.3698, longitude: -81.5494 },
        'unknown': { latitude: 28.3747, longitude: -81.5494 }
    };

    // Add small random offset to prevent overlapping
    const offset = () => (Math.random() - 0.5) * 0.001;
    const coords = baseCoords[area] || baseCoords.unknown;

    return {
        latitude: coords.latitude + offset(),
        longitude: coords.longitude + offset()
    };
}

function getActiveFestivals(date: string): string[] {
    const festivals = [];
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;

    // EPCOT Festival Calendar (approximate)
    if (month >= 1 && month <= 2) festivals.push('Festival of the Arts');
    if (month >= 3 && month <= 5) festivals.push('Flower & Garden Festival');
    if (month >= 8 && month <= 11) festivals.push('Food & Wine Festival');
    if (month === 11 || month === 12) festivals.push('Festival of the Holidays');

    return festivals;
}

function getSpecialEvents(date: string): string[] {
    const events = [];
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Example special events
    if (dayOfWeek === 5 || dayOfWeek === 6) {
        events.push('Extended Evening Hours');
    }

    return events;
}