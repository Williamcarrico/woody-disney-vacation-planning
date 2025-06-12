import { NextRequest, NextResponse } from 'next/server';
import * as themeParksAPI from '@/lib/services/themeparks-api';

const HOLLYWOOD_STUDIOS_ID = '288747d1-8b4f-4a64-867e-ea7c9b27bad8';

// Comprehensive Galaxy's Edge information
const GALAXYS_EDGE_INFO = {
    overview: {
        name: 'Star Wars: Galaxy\'s Edge',
        planet: 'Batuu',
        location: 'Black Spire Outpost',
        opened: 'August 29, 2019',
        size: '14 acres',
        theme: 'Living Star Wars adventure on the edge of the galaxy',
        era: 'Set during the current trilogy era between Episodes VIII and IX',
        icon: '🚀',
        coordinates: { lat: 28.3553, lng: -81.5608 }
    },
    lore: {
        description: 'Black Spire Outpost on the planet Batuu was once a vibrant trading port, but has become a haven for smugglers, rogues, and those seeking to avoid the First Order.',
        factions: [
            {
                name: 'First Order',
                description: 'The authoritarian military junta seeking control',
                location: 'First Order Cargo area',
                characters: ['Kylo Ren', 'Stormtroopers', 'First Order Officers']
            },
            {
                name: 'Resistance',
                description: 'Fighting for freedom across the galaxy',
                location: 'Resistance forest base',
                characters: ['Rey', 'Chewbacca', 'Resistance fighters']
            },
            {
                name: 'Smugglers & Locals',
                description: 'Inhabitants trying to make their way',
                location: 'Throughout the outpost',
                characters: ['Hondo Ohnaka', 'Local merchants', 'Gatherers']
            }
        ],
        timeline: 'The village has existed for centuries as a trading post, now caught between the First Order and Resistance conflict'
    },
    attractions: [
        {
            id: 'rise-of-resistance',
            name: 'Star Wars: Rise of the Resistance',
            type: 'Multi-system dark ride',
            description: 'Join the Resistance in an epic battle against the First Order in the most ambitious Disney attraction ever created.',
            duration: '18 minutes total experience',
            height: '40" (102cm)',
            highlights: [
                'Multiple ride systems (trackless, motion simulator, drop)',
                'Full-size AT-AT walkers',
                'Encounters with Kylo Ren',
                'Holographic Rey appearance',
                'Massive Star Destroyer hangar'
            ],
            tips: [
                'Most popular attraction at Walt Disney World',
                'Arrive before park opening or purchase Individual Lightning Lane',
                'Experience includes multiple pre-shows',
                'Can break down frequently - have backup plans'
            ],
            capacity: 'Approximately 1,700 guests per hour',
            technology: 'Trackless vehicles, motion base, elevator drop, projection mapping'
        },
        {
            id: 'millennium-falcon',
            name: 'Millennium Falcon: Smugglers Run',
            type: 'Interactive motion simulator',
            description: 'Take control of the fastest ship in the galaxy on a smuggling mission for Hondo Ohnaka.',
            duration: '4.5 minutes',
            height: '38" (97cm)',
            highlights: [
                'Pilot the actual Millennium Falcon',
                'Six different positions affect the mission',
                'Multiple mission profiles',
                'Walk through the famous corridors',
                'Sit in the iconic cockpit'
            ],
            positions: [
                { role: 'Pilot', count: 2, description: 'Control the ship\'s movement' },
                { role: 'Gunner', count: 2, description: 'Fire the ship\'s weapons' },
                { role: 'Engineer', count: 2, description: 'Keep the ship running' }
            ],
            tips: [
                'Request pilot position for best experience',
                'Single Rider line available',
                'Performance affects your credits earned',
                'Morning or late evening for shorter waits'
            ],
            technology: 'Motion simulator with interactive controls'
        }
    ],
    experiences: [
        {
            id: 'savis-workshop',
            name: 'Savi\'s Workshop - Handbuilt Lightsabers',
            type: 'Interactive retail experience',
            duration: '20 minutes',
            price: '$249.99 plus tax',
            description: 'Build your own custom lightsaber in a secret workshop.',
            process: [
                'Choose your kyber crystal',
                'Select from four hilt themes',
                'Assemble with the Gatherers\' guidance',
                'Participate in lighting ceremony'
            ],
            themes: [
                'Peace and Justice (Jedi-inspired)',
                'Power and Control (Dark side)',
                'Elemental Nature (Natural materials)',
                'Protection and Defense (Ancient designs)'
            ],
            included: 'Custom hilt, kyber crystal, blade, carrying case',
            tips: [
                'Reservations essential - book 60 days out',
                'Highly emotional experience for fans',
                'Additional kyber crystals available for purchase',
                'Lightsaber is TSA approved in carry-on'
            ]
        },
        {
            id: 'droid-depot',
            name: 'Droid Depot',
            type: 'Interactive retail experience',
            duration: '20 minutes',
            price: 'R-Series: $119.99, BB-Series: $119.99',
            description: 'Build and customize your own astromech droid companion.',
            process: [
                'Choose R-series or BB-series',
                'Select parts from conveyor',
                'Assemble your droid',
                'Activate and test',
                'Customize with accessories'
            ],
            features: [
                'Interactive with land elements',
                'Remote control via included controller',
                'Personality chip accessories available',
                'Reacts to land atmosphere'
            ],
            tips: [
                'No reservation required but can be busy',
                'Droids interact throughout the land',
                'Additional accessories and parts available',
                'Carrying backpack available for purchase'
            ]
        },
        {
            id: 'ogas-cantina',
            name: 'Oga\'s Cantina',
            type: 'Themed lounge',
            capacity: 'Limited',
            description: 'The notorious watering hole where pilots, bounty hunters, and aliens gather.',
            highlights: [
                'DJ R-3X (Rex from Star Tours) provides music',
                'Unique alcoholic and non-alcoholic beverages',
                'Distinctive atmosphere with bubbling tanks',
                'Standing room primarily'
            ],
            signature_drinks: [
                'Fuzzy Tauntaun - Peach vodka with "tingling" foam',
                'Jedi Mind Trick - Cocktail that changes color',
                'Blue Bantha - Blue milk-inspired cocktail',
                'Carbon Freeze - Themed mocktail with dry ice'
            ],
            tips: [
                'Reservations absolutely essential',
                'Book exactly 60 days in advance',
                '45-minute time limit per party',
                'Limited seating - mostly standing'
            ]
        }
    ],
    dining: [
        {
            id: 'docking-bay-7',
            name: 'Docking Bay 7 Food and Cargo',
            type: 'Quick Service',
            description: 'Chef Strono "Cookie" Tuggs serves exotic galactic cuisine.',
            signature_items: [
                'Smoked Kaadu Ribs - Sticky pork ribs',
                'Fried Endorian Tip-Yip - Fried chicken with roasted vegetables',
                'Felucian Garden Spread - Plant-based kefta with hummus',
                'Batuu-bon - Chocolate and white chocolate mousse dessert'
            ],
            tips: [
                'Mobile order recommended',
                'Unique presentation and flavors',
                'Outdoor covered seating',
                'Try the blue or green milk'
            ]
        },
        {
            id: 'ronto-roasters',
            name: 'Ronto Roasters',
            type: 'Quick Service Stand',
            description: 'Grilled meats roasted on a recycled podracing engine.',
            signature_items: [
                'Ronto Wrap - Grilled sausage and pork in pita',
                'Turkey Jerky - Seasoned dried turkey'
            ],
            atmosphere: 'Watch the pitmaster droid turn meat over the engine'
        },
        {
            id: 'milk-stand',
            name: 'Milk Stand',
            type: 'Beverage Stand',
            description: 'Sample the famous blue and green milk from the films.',
            items: [
                'Blue Milk - Frozen plant-based blend with tropical characteristics',
                'Green Milk - Frozen plant-based blend with citrus characteristics'
            ],
            note: 'Both are dairy-free frozen beverages'
        }
    ],
    shopping: [
        {
            id: 'dok-ondars',
            name: 'Dok-Ondar\'s Den of Antiquities',
            type: 'Retail',
            description: 'Rare artifacts and treasures from across the galaxy.',
            items: [
                'Legacy lightsabers (character replicas)',
                'Holocrons and kyber crystals',
                'Artwork and sculptures',
                'Rare collectibles'
            ],
            highlight: 'Dok-Ondar animatronic figure oversees the shop'
        },
        {
            id: 'creature-stall',
            name: 'Creature Stall',
            type: 'Retail',
            description: 'Adopt creatures from across the galaxy.',
            items: [
                'Porgs, Loth-cats, and more',
                'Interactive creatures',
                'Plush companions'
            ]
        },
        {
            id: 'resistance-supply',
            name: 'Resistance Supply',
            type: 'Retail',
            description: 'Gear up with Resistance equipment and supplies.',
            items: ['Resistance apparel', 'Accessories', 'Pins and patches']
        },
        {
            id: 'first-order-cargo',
            name: 'First Order Cargo',
            type: 'Retail',
            description: 'First Order equipment and propaganda.',
            items: ['First Order uniforms', 'Dark side accessories', 'Model ships']
        }
    ],
    interactive_elements: [
        {
            name: 'Play Disney Parks App',
            description: 'Transform your phone into a Star Wars datapad.',
            features: [
                'Hack door panels and droids',
                'Translate Aurebesh signs',
                'Scan cargo crates',
                'Complete jobs for credits',
                'Choose faction allegiance',
                'Tune into outpost communications'
            ]
        },
        {
            name: 'Datapad Games',
            description: 'Complete missions throughout the land.',
            activities: [
                'Outpost Control - Hack panels for your faction',
                'Crate Scanning - Discover cargo contents',
                'Radio Tuning - Intercept transmissions',
                'Flight Crew recruitment'
            ]
        },
        {
            name: 'Character Encounters',
            description: 'Meet heroes and villains throughout the land.',
            characters: [
                'Rey - Often found near Resistance area',
                'Kylo Ren - Patrols with Stormtroopers',
                'Chewbacca - Near the Millennium Falcon',
                'Vi Moradi - Resistance spy',
                'Stormtroopers - Patrol and interrogate guests'
            ]
        }
    ],
    tips: {
        general: [
            'Download Play Disney Parks app before visiting',
            'Immerse yourself - cast members stay in character',
            'Use galactic credits at Oga\'s Cantina',
            'Look for hidden details and Easter eggs',
            'Visit at night for stunning lighting'
        ],
        planning: [
            'Book Oga\'s Cantina 60 days in advance',
            'Savi\'s Workshop books quickly - reserve early',
            'Budget extra for experiences and souvenirs',
            'Allow 4-5 hours to fully experience the land',
            'Ride Rise of the Resistance first or last'
        ],
        photo_spots: [
            'Millennium Falcon from multiple angles',
            'X-wing fighter in Resistance area',
            'TIE Echelon near First Order area',
            'Droid tracks throughout the outpost',
            'Ronto Roasters with turning engine'
        ]
    }
};

/**
 * GET /api/parks/hollywood-studios/star-wars
 *
 * Get comprehensive information about Star Wars: Galaxy's Edge
 *
 * Query parameters:
 * - type: 'overview' | 'attractions' | 'experiences' | 'dining' | 'shopping' | 'interactive' | 'complete'
 * - includeLive: Include current wait times and status
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const infoType = searchParams.get('type') || 'overview';
        const includeLive = searchParams.get('includeLive') === 'true';

        // Get live data if requested
        let liveData = null;
        if (includeLive) {
            liveData = await themeParksAPI.getLiveData(HOLLYWOOD_STUDIOS_ID);
        }

        switch (infoType) {
            case 'overview': {
                const response = {
                    ...GALAXYS_EDGE_INFO.overview,
                    lore: GALAXYS_EDGE_INFO.lore
                };

                if (includeLive) {
                    response.currentStatus = getGalaxysEdgeStatus(liveData);
                }

                return NextResponse.json(response);
            }

            case 'attractions': {
                let attractions = GALAXYS_EDGE_INFO.attractions;

                if (includeLive) {
                    attractions = attractions.map(attraction => {
                        const live = findLiveData(liveData, attraction.name);
                        return {
                            ...attraction,
                            current: {
                                status: live?.status || 'UNKNOWN',
                                waitTime: live?.queue?.STANDBY?.waitTime || null,
                                lightningLane: live?.queue?.PAID_RETURN_TIME || null
                            }
                        };
                    });
                }

                return NextResponse.json({
                    attractions,
                    total: attractions.length,
                    tips: [
                        'Rise of the Resistance is the most popular - plan accordingly',
                        'Single Rider available for Millennium Falcon',
                        'Both attractions have height requirements'
                    ]
                });
            }

            case 'experiences': {
                const response = {
                    experiences: GALAXYS_EDGE_INFO.experiences,
                    total: GALAXYS_EDGE_INFO.experiences.length,
                    bookingTips: [
                        'Savi\'s Workshop books 60 days in advance at 6 AM ET',
                        'Oga\'s Cantina reservations are essential',
                        'Droid Depot doesn\'t require reservations but has limited capacity'
                    ]
                };

                if (includeLive) {
                    response.availability = checkExperienceAvailability(liveData);
                }

                return NextResponse.json(response);
            }

            case 'dining': {
                const allDining = [
                    ...GALAXYS_EDGE_INFO.dining,
                    GALAXYS_EDGE_INFO.experiences.find(e => e.id === 'ogas-cantina')
                ];

                return NextResponse.json({
                    dining: allDining,
                    total: allDining.length,
                    tips: [
                        'Mobile order at Docking Bay 7 to save time',
                        'Try the Ronto Wrap - fan favorite',
                        'Blue and Green milk are must-try beverages'
                    ]
                });
            }

            case 'shopping': {
                return NextResponse.json({
                    shops: GALAXYS_EDGE_INFO.shopping,
                    buildExperiences: [
                        {
                            name: 'Savi\'s Workshop',
                            builds: 'Custom lightsabers',
                            price: '$249.99'
                        },
                        {
                            name: 'Droid Depot',
                            builds: 'Interactive droids',
                            price: '$119.99'
                        }
                    ],
                    tips: [
                        'Legacy lightsabers at Dok-Ondar\'s range from $159-$199',
                        'Droid accessories enhance interactivity',
                        'Many items are exclusive to Galaxy\'s Edge'
                    ]
                });
            }

            case 'interactive': {
                return NextResponse.json({
                    elements: GALAXYS_EDGE_INFO.interactive_elements,
                    appFeatures: {
                        name: 'Play Disney Parks',
                        required: true,
                        features: GALAXYS_EDGE_INFO.interactive_elements[0].features
                    },
                    tips: [
                        'Choose your faction to affect your experience',
                        'Complete jobs to earn galactic credits',
                        'Interactions change based on your reputation'
                    ]
                });
            }

            case 'complete': {
                const completeData = {
                    ...GALAXYS_EDGE_INFO,
                    lastUpdate: new Date().toISOString()
                };

                if (includeLive) {
                    completeData.live = {
                        attractions: getGalaxysEdgeAttractionStatus(liveData),
                        crowdLevel: estimateAreaCrowdLevel(liveData),
                        recommendations: getCurrentRecommendations(liveData)
                    };
                }

                return NextResponse.json(completeData);
            }

            default: {
                return NextResponse.json(
                    {
                        error: 'Invalid type parameter',
                        validTypes: ['overview', 'attractions', 'experiences', 'dining', 'shopping', 'interactive', 'complete']
                    },
                    { status: 400 }
                );
            }
        }

    } catch (error) {
        console.error('Error fetching Galaxy\'s Edge data:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch Galaxy\'s Edge data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper functions
function getGalaxysEdgeStatus(liveData: any): any {
    const geAttractions = liveData.liveData.filter((item: any) =>
        item.name.includes('Rise of the Resistance') ||
        item.name.includes('Millennium Falcon')
    );

    const avgWait = geAttractions
        .filter((a: any) => a.queue?.STANDBY?.waitTime)
        .reduce((sum: number, a: any) => sum + a.queue.STANDBY.waitTime, 0) / geAttractions.length || 0;

    return {
        crowdLevel: avgWait < 45 ? 'Low' : avgWait < 75 ? 'Moderate' : 'High',
        attractionsOperating: geAttractions.filter((a: any) => a.status === 'OPERATING').length,
        averageWait: Math.round(avgWait),
        recommendation: avgWait < 45 ? 'Great time to visit' : 'Consider Lightning Lane for attractions'
    };
}

function findLiveData(liveData: any, attractionName: string): any {
    return liveData?.liveData.find((item: any) =>
        item.name.toLowerCase().includes(attractionName.toLowerCase())
    );
}

function checkExperienceAvailability(liveData: any): any {
    // This would need real availability data
    return {
        savisWorkshop: 'Check for same-day availability',
        ogasCantina: 'Reservations recommended',
        droidDepot: 'Walk-ins usually available'
    };
}

function getGalaxysEdgeAttractionStatus(liveData: any): any[] {
    return GALAXYS_EDGE_INFO.attractions.map(attraction => {
        const live = findLiveData(liveData, attraction.name);
        return {
            name: attraction.name,
            status: live?.status || 'UNKNOWN',
            waitTime: live?.queue?.STANDBY?.waitTime || null,
            lightningLane: {
                available: live?.queue?.PAID_RETURN_TIME?.state === 'AVAILABLE',
                price: live?.queue?.PAID_RETURN_TIME?.price || null
            }
        };
    });
}

function estimateAreaCrowdLevel(liveData: any): string {
    const geAttractions = liveData.liveData.filter((item: any) =>
        item.name.includes('Rise of the Resistance') ||
        item.name.includes('Millennium Falcon')
    );

    const avgWait = geAttractions
        .filter((a: any) => a.queue?.STANDBY?.waitTime)
        .reduce((sum: number, a: any) => sum + a.queue.STANDBY.waitTime, 0) / geAttractions.length || 0;

    if (avgWait < 45) return 'Low - Excellent touring conditions';
    if (avgWait < 75) return 'Moderate - Typical wait times';
    if (avgWait < 100) return 'High - Consider Lightning Lane';
    return 'Very High - Focus on experiences over attractions';
}

function getCurrentRecommendations(liveData: any): string[] {
    const recommendations = [];
    const hour = new Date().getHours();

    // Find Rise of the Resistance status
    const rise = liveData.liveData.find((item: any) =>
        item.name.includes('Rise of the Resistance')
    );

    if (rise?.status === 'OPERATING' && rise.queue?.STANDBY?.waitTime < 60) {
        recommendations.push('Rise of the Resistance has manageable wait - ride now!');
    }

    if (hour < 11) {
        recommendations.push('Morning is ideal for experiencing attractions');
        recommendations.push('Book Oga\'s Cantina for afternoon break');
    } else if (hour > 18) {
        recommendations.push('Evening lighting enhances the atmosphere');
        recommendations.push('Great time for photos with fewer crowds');
    }

    recommendations.push('Use Play Disney Parks app for interactive experiences');

    return recommendations;
}