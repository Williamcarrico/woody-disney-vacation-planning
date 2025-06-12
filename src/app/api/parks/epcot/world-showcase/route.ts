import { NextRequest, NextResponse } from 'next/server';
import * as epcotService from '@/lib/services/epcot-service';
import * as themeParksAPI from '@/lib/services/themeparks-api';

/**
 * GET /api/parks/epcot/world-showcase
 *
 * World Showcase specific endpoint
 *
 * Query parameters:
 * - type: 'countries' | 'dining' | 'attractions' | 'cultural' | 'live'
 * - country: Specific country name (optional)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'countries';
        const country = searchParams.get('country');

        switch (type) {
            case 'countries': {
                // Get all World Showcase countries with basic info
                const countries = Object.values(epcotService.WorldShowcaseCountry);
                const countryData = countries.map(countryName => ({
                    name: countryName,
                    pavilion: `${countryName} Pavilion`,
                    location: 'World Showcase',
                    highlights: getCountryHighlights(countryName)
                }));

                return NextResponse.json({
                    totalCountries: countries.length,
                    countries: countryData,
                    walkingOrder: getWorldShowcaseWalkingOrder()
                });
            }

            case 'dining': {
                // Get World Showcase dining options
                const diningData = await epcotService.getEpcotDining();

                if (country) {
                    // Filter by specific country
                    const countryDining = diningData.worldShowcaseByCountry[country] || [];
                    return NextResponse.json({
                        country,
                        restaurants: countryDining,
                        count: countryDining.length
                    });
                }

                // All World Showcase dining
                return NextResponse.json({
                    byCountry: diningData.worldShowcaseByCountry,
                    totalRestaurants: Object.values(diningData.worldShowcaseByCountry)
                        .reduce((sum, restaurants) => sum + restaurants.length, 0),
                    countries: Object.keys(diningData.worldShowcaseByCountry)
                });
            }

            case 'attractions': {
                // Get World Showcase attractions
                const attractionsData = await epcotService.getEpcotAttractionsByArea();
                const worldShowcaseAttractions = attractionsData[epcotService.EpcotArea.WORLD_SHOWCASE];

                if (country) {
                    // Filter by specific country
                    const countryAttractions = worldShowcaseAttractions.filter(
                        attraction => attraction.name.toLowerCase().includes(country.toLowerCase())
                    );
                    return NextResponse.json({
                        country,
                        attractions: countryAttractions,
                        count: countryAttractions.length
                    });
                }

                // Group attractions by country
                const attractionsByCountry: Record<string, any[]> = {};
                worldShowcaseAttractions.forEach(attraction => {
                    const attractionCountry = epcotService.getWorldShowcaseCountry(attraction.name);
                    if (attractionCountry) {
                        if (!attractionsByCountry[attractionCountry]) {
                            attractionsByCountry[attractionCountry] = [];
                        }
                        attractionsByCountry[attractionCountry].push(attraction);
                    }
                });

                return NextResponse.json({
                    totalAttractions: worldShowcaseAttractions.length,
                    byCountry: attractionsByCountry,
                    allAttractions: worldShowcaseAttractions
                });
            }

            case 'cultural': {
                // Get cultural experiences and entertainment
                const childrenData = await themeParksAPI.getEpcotAttractions();
                const liveData = await themeParksAPI.getEpcotLive();

                // Filter for shows and cultural experiences
                const culturalExperiences = childrenData.children.filter(entity =>
                    (entity.entityType === 'SHOW' || entity.name.includes('Cultural')) &&
                    entity.name.toLowerCase().includes('showcase')
                );

                // Get showtimes for cultural performances
                const performancesWithShowtimes = liveData.liveData
                    .filter(item =>
                        item.showtimes &&
                        item.showtimes.length > 0 &&
                        culturalExperiences.some(exp => exp.id === item.id)
                    )
                    .map(item => ({
                        id: item.id,
                        name: item.name,
                        country: epcotService.getWorldShowcaseCountry(item.name),
                        showtimes: item.showtimes,
                        status: item.status
                    }));

                return NextResponse.json({
                    culturalExperiences,
                    performances: performancesWithShowtimes,
                    totalExperiences: culturalExperiences.length
                });
            }

            case 'live': {
                // Get live World Showcase data
                const liveData = await themeParksAPI.getEpcotLive();

                // Filter for World Showcase entities
                const worldShowcaseLive = liveData.liveData.filter(item =>
                    epcotService.getAttractionArea(item.name) === epcotService.EpcotArea.WORLD_SHOWCASE
                );

                // Group by country
                const liveByCountry: Record<string, any[]> = {};
                worldShowcaseLive.forEach(item => {
                    const itemCountry = epcotService.getWorldShowcaseCountry(item.name) || 'Other';
                    if (!liveByCountry[itemCountry]) {
                        liveByCountry[itemCountry] = [];
                    }
                    liveByCountry[itemCountry].push(item);
                });

                return NextResponse.json({
                    lastUpdate: liveData.lastUpdate,
                    totalEntities: worldShowcaseLive.length,
                    byCountry: liveByCountry,
                    operatingCount: worldShowcaseLive.filter(item => item.status === 'OPERATING').length
                });
            }

            default: {
                return NextResponse.json(
                    {
                        error: 'Invalid type parameter',
                        validTypes: ['countries', 'dining', 'attractions', 'cultural', 'live'],
                        description: {
                            countries: 'Get all World Showcase countries and pavilions',
                            dining: 'Get World Showcase dining options by country',
                            attractions: 'Get World Showcase attractions by country',
                            cultural: 'Get cultural experiences and performances',
                            live: 'Get live data for World Showcase entities'
                        }
                    },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        console.error('Error fetching World Showcase data:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch World Showcase data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper function to get country highlights
function getCountryHighlights(country: string): string[] {
    const highlights: Record<string, string[]> = {
        'Mexico': ['Gran Fiesta Tour', 'La Cava del Tequila', 'San Angel Inn'],
        'Norway': ['Frozen Ever After', 'Stave Church', 'Kringla Bakeri'],
        'China': ['Reflections of China', 'House of Good Fortune', 'Nine Dragons'],
        'Germany': ['Biergarten Restaurant', 'Karamell-Küche', 'Model Train'],
        'Italy': ['Via Napoli', 'Tutto Italia', 'Venetian Masks'],
        'The American Adventure': ['The American Adventure Show', 'Block & Hans', 'Voices of Liberty'],
        'Japan': ['Mitsukoshi Store', 'Teppan Edo', 'Taiko Drummers'],
        'Morocco': ['Spice Road Table', 'Moroccan Pavilion', 'Restaurant Marrakesh'],
        'France': ['Remy\'s Ratatouille Adventure', 'Les Halles', 'Impressions de France'],
        'United Kingdom': ['Rose & Crown', 'Yorkshire County Fish Shop', 'British Revolution'],
        'Canada': ['O Canada!', 'Le Cellier', 'Northwest Mercantile']
    };

    return highlights[country] || [];
}

// Helper function to get walking order around World Showcase
function getWorldShowcaseWalkingOrder() {
    return {
        clockwise: [
            'Mexico', 'Norway', 'China', 'Germany', 'Italy',
            'The American Adventure', 'Japan', 'Morocco',
            'France', 'United Kingdom', 'Canada'
        ],
        counterClockwise: [
            'Canada', 'United Kingdom', 'France', 'Morocco',
            'Japan', 'The American Adventure', 'Italy',
            'Germany', 'China', 'Norway', 'Mexico'
        ],
        distance: '1.2 miles around the lagoon'
    };
}