import { NextRequest, NextResponse } from 'next/server';
import * as epcotService from '@/lib/services/epcot-service';
import * as themeParksAPI from '@/lib/services/themeparks-api';

/**
 * GET /api/parks/epcot/areas
 *
 * EPCOT areas endpoint (World Celebration, World Discovery, World Nature)
 *
 * Query parameters:
 * - area: 'celebration' | 'discovery' | 'nature' | 'all'
 * - type: 'attractions' | 'dining' | 'experiences' | 'wait-times'
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const area = searchParams.get('area') || 'all';
        const type = searchParams.get('type') || 'attractions';

        // Map area parameter to EpcotArea enum
        const areaMapping: Record<string, epcotService.EpcotArea> = {
            'celebration': epcotService.EpcotArea.WORLD_CELEBRATION,
            'discovery': epcotService.EpcotArea.WORLD_DISCOVERY,
            'nature': epcotService.EpcotArea.WORLD_NATURE
        };

        switch (type) {
            case 'attractions': {
                const attractionsData = await epcotService.getEpcotAttractionsByArea();

                if (area === 'all') {
                    // Return all areas with detailed information
                    const areaDetails = Object.entries(attractionsData)
                        .filter(([areaName]) => areaName !== epcotService.EpcotArea.WORLD_SHOWCASE)
                        .map(([areaName, attractions]) => ({
                            area: areaName,
                            description: getAreaDescription(areaName as epcotService.EpcotArea),
                            theme: getAreaTheme(areaName as epcotService.EpcotArea),
                            attractions: attractions,
                            count: attractions.length,
                            highlights: getAreaHighlights(areaName as epcotService.EpcotArea)
                        }));

                    return NextResponse.json({
                        areas: areaDetails,
                        totalAreas: areaDetails.length,
                        totalAttractions: areaDetails.reduce((sum, area) => sum + area.count, 0)
                    });
                } else {
                    // Return specific area
                    const specificArea = areaMapping[area];
                    if (!specificArea) {
                        return NextResponse.json(
                            { error: 'Invalid area parameter' },
                            { status: 400 }
                        );
                    }

                    const areaAttractions = attractionsData[specificArea] || [];
                    return NextResponse.json({
                        area: specificArea,
                        description: getAreaDescription(specificArea),
                        theme: getAreaTheme(specificArea),
                        attractions: areaAttractions,
                        count: areaAttractions.length,
                        highlights: getAreaHighlights(specificArea)
                    });
                }
            }

            case 'dining': {
                const diningData = await epcotService.getEpcotDining();

                if (area === 'all') {
                    // Return dining for all non-World Showcase areas
                    const areaDining = Object.entries(diningData.byArea)
                        .filter(([areaName]) => areaName !== epcotService.EpcotArea.WORLD_SHOWCASE)
                        .map(([areaName, restaurants]) => ({
                            area: areaName,
                            restaurants: restaurants,
                            count: restaurants.length
                        }));

                    return NextResponse.json({
                        areas: areaDining,
                        totalRestaurants: areaDining.reduce((sum, area) => sum + area.count, 0)
                    });
                } else {
                    const specificArea = areaMapping[area];
                    if (!specificArea) {
                        return NextResponse.json(
                            { error: 'Invalid area parameter' },
                            { status: 400 }
                        );
                    }

                    const areaRestaurants = diningData.byArea[specificArea] || [];
                    return NextResponse.json({
                        area: specificArea,
                        restaurants: areaRestaurants,
                        count: areaRestaurants.length,
                        recommendations: getDiningRecommendations(specificArea)
                    });
                }
            }

            case 'experiences': {
                // Get unique experiences and special features by area
                const childrenData = await themeParksAPI.getEpcotAttractions();

                const experiences = childrenData.children.filter(entity =>
                    entity.entityType !== 'ATTRACTION' &&
                    entity.entityType !== 'RESTAURANT' &&
                    entity.entityType !== 'MERCHANDISE'
                );

                if (area === 'all') {
                    const experiencesByArea: Record<string, any[]> = {
                        [epcotService.EpcotArea.WORLD_CELEBRATION]: [],
                        [epcotService.EpcotArea.WORLD_DISCOVERY]: [],
                        [epcotService.EpcotArea.WORLD_NATURE]: []
                    };

                    experiences.forEach(exp => {
                        const expArea = epcotService.getAttractionArea(exp.name);
                        if (expArea && expArea !== epcotService.EpcotArea.WORLD_SHOWCASE) {
                            experiencesByArea[expArea].push(exp);
                        }
                    });

                    return NextResponse.json({
                        areas: Object.entries(experiencesByArea).map(([areaName, exps]) => ({
                            area: areaName,
                            experiences: exps,
                            count: exps.length,
                            specialFeatures: getAreaSpecialFeatures(areaName as epcotService.EpcotArea)
                        })),
                        totalExperiences: experiences.length
                    });
                } else {
                    const specificArea = areaMapping[area];
                    if (!specificArea) {
                        return NextResponse.json(
                            { error: 'Invalid area parameter' },
                            { status: 400 }
                        );
                    }

                    const areaExperiences = experiences.filter(exp =>
                        epcotService.getAttractionArea(exp.name) === specificArea
                    );

                    return NextResponse.json({
                        area: specificArea,
                        experiences: areaExperiences,
                        count: areaExperiences.length,
                        specialFeatures: getAreaSpecialFeatures(specificArea)
                    });
                }
            }

            case 'wait-times': {
                // Get current wait times by area
                const waitTimesData = await epcotService.getEpcotWaitTimesByArea();

                if (area === 'all') {
                    // Filter out World Showcase
                    const filteredStats = waitTimesData.areaStats.filter(
                        stat => stat.area !== epcotService.EpcotArea.WORLD_SHOWCASE
                    );

                    return NextResponse.json({
                        areas: filteredStats,
                        lastUpdate: waitTimesData.lastUpdate,
                        summary: {
                            leastBusy: filteredStats.reduce((min, stat) =>
                                stat.stats.average < min.stats.average ? stat : min
                            ).area,
                            mostBusy: filteredStats.reduce((max, stat) =>
                                stat.stats.average > max.stats.average ? stat : max
                            ).area
                        }
                    });
                } else {
                    const specificArea = areaMapping[area];
                    if (!specificArea) {
                        return NextResponse.json(
                            { error: 'Invalid area parameter' },
                            { status: 400 }
                        );
                    }

                    const areaData = waitTimesData.areaStats.find(
                        stat => stat.area === specificArea
                    );

                    return NextResponse.json({
                        area: specificArea,
                        data: areaData || { attractions: [], stats: {} },
                        lastUpdate: waitTimesData.lastUpdate,
                        recommendations: getWaitTimeRecommendations(areaData)
                    });
                }
            }

            default: {
                return NextResponse.json(
                    {
                        error: 'Invalid type parameter',
                        validTypes: ['attractions', 'dining', 'experiences', 'wait-times'],
                        validAreas: ['celebration', 'discovery', 'nature', 'all']
                    },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        console.error('Error fetching EPCOT area data:', error);

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
function getAreaDescription(area: epcotService.EpcotArea): string {
    const descriptions = {
        [epcotService.EpcotArea.WORLD_CELEBRATION]: 'The heart of EPCOT, home to Spaceship Earth and celebrating human connection',
        [epcotService.EpcotArea.WORLD_DISCOVERY]: 'Explore science, technology, and space through thrilling attractions',
        [epcotService.EpcotArea.WORLD_NATURE]: 'Dedicated to understanding and preserving the natural world',
        [epcotService.EpcotArea.WORLD_SHOWCASE]: 'A journey around the world through 11 country pavilions'
    };
    return descriptions[area] || '';
}

function getAreaTheme(area: epcotService.EpcotArea): string {
    const themes = {
        [epcotService.EpcotArea.WORLD_CELEBRATION]: 'Community, Connection, and Possibility',
        [epcotService.EpcotArea.WORLD_DISCOVERY]: 'Science, Technology, and Space Exploration',
        [epcotService.EpcotArea.WORLD_NATURE]: 'Nature, Conservation, and Adventure',
        [epcotService.EpcotArea.WORLD_SHOWCASE]: 'Culture, Cuisine, and International Fellowship'
    };
    return themes[area] || '';
}

function getAreaHighlights(area: epcotService.EpcotArea): string[] {
    const highlights = {
        [epcotService.EpcotArea.WORLD_CELEBRATION]: [
            'Spaceship Earth - Iconic geodesic sphere',
            'Journey Into Imagination with Figment',
            'The Seas with Nemo & Friends',
            'CommuniCore Hall and Plaza'
        ],
        [epcotService.EpcotArea.WORLD_DISCOVERY]: [
            'Guardians of the Galaxy: Cosmic Rewind',
            'Test Track - Design and test your own vehicle',
            'Mission: SPACE - Journey to Mars',
            'PLAY! - Interactive experience'
        ],
        [epcotService.EpcotArea.WORLD_NATURE]: [
            'Soarin\' Around the World',
            'Living with the Land boat ride',
            'Awesome Planet film',
            'The Land Pavilion'
        ],
        [epcotService.EpcotArea.WORLD_SHOWCASE]: []
    };
    return highlights[area] || [];
}

function getAreaSpecialFeatures(area: epcotService.EpcotArea): string[] {
    const features = {
        [epcotService.EpcotArea.WORLD_CELEBRATION]: [
            'Pin trading locations',
            'Character meet and greets',
            'Club Cool - Free Coca-Cola samples'
        ],
        [epcotService.EpcotArea.WORLD_DISCOVERY]: [
            'Advanced Training Lab at Mission: SPACE',
            'Test Track design studios',
            'Space 220 Restaurant'
        ],
        [epcotService.EpcotArea.WORLD_NATURE]: [
            'Behind the Seeds tour',
            'SeaBase aquarium',
            'Sunshine Seasons food court'
        ],
        [epcotService.EpcotArea.WORLD_SHOWCASE]: []
    };
    return features[area] || [];
}

function getDiningRecommendations(area: epcotService.EpcotArea): string[] {
    const recommendations = {
        [epcotService.EpcotArea.WORLD_CELEBRATION]: [
            'Connections Eatery - Modern food hall',
            'Connections Café - Starbucks location'
        ],
        [epcotService.EpcotArea.WORLD_DISCOVERY]: [
            'Space 220 Restaurant - Dining in space'
        ],
        [epcotService.EpcotArea.WORLD_NATURE]: [
            'Sunshine Seasons - Fresh, healthy options',
            'Garden Grill Restaurant - Character dining'
        ],
        [epcotService.EpcotArea.WORLD_SHOWCASE]: []
    };
    return recommendations[area] || [];
}

function getWaitTimeRecommendations(areaData: any): string[] {
    if (!areaData || !areaData.stats) return [];

    const recommendations = [];

    if (areaData.stats.average < 30) {
        recommendations.push('Great time to visit - low wait times');
    } else if (areaData.stats.average > 60) {
        recommendations.push('Consider using Lightning Lane for popular attractions');
        recommendations.push('Visit during parade or fireworks for shorter waits');
    }

    if (areaData.stats.max > 90) {
        recommendations.push(`${areaData.attractions.find((a: any) => a.queue?.STANDBY?.waitTime === areaData.stats.max)?.name || 'Top attraction'} has the longest wait`);
    }

    return recommendations;
}