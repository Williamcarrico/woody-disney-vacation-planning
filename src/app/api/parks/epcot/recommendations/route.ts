import { NextRequest, NextResponse } from 'next/server';
import * as epcotService from '@/lib/services/epcot-service';
import * as themeParksAPI from '@/lib/services/themeparks-api';

/**
 * GET /api/parks/epcot/recommendations
 *
 * Get personalized EPCOT recommendations
 *
 * Query parameters:
 * - interests: Comma-separated list (thrills,food,family,education,culture,nature)
 * - time: morning | afternoon | evening | all
 * - duration: half-day | full-day | multi-day
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const interestsParam = searchParams.get('interests') || 'all';
        const time = searchParams.get('time') || 'all';
        const duration = searchParams.get('duration') || 'full-day';

        // Parse interests
        const interests = interestsParam === 'all'
            ? ['thrills', 'food', 'family', 'education', 'culture', 'nature']
            : interestsParam.split(',').map(i => i.trim());

        // Get base recommendations
        const recommendations = await epcotService.getEpcotRecommendations(interests);

        // Get current park data for enhanced recommendations
        const [liveData, scheduleData, festivals] = await Promise.all([
            themeParksAPI.getEpcotLive(),
            themeParksAPI.getEpcotSchedule(),
            Promise.resolve(epcotService.getActiveFestivals())
        ]);

        // Build comprehensive recommendations
        const enhancedRecommendations = {
            interests,
            timeOfDay: time,
            duration,
            recommendations: recommendations.map(rec => ({
                ...rec,
                suggestedOrder: getSuggestedOrder(rec.attractions, time),
                estimatedTime: calculateEstimatedTime(rec.attractions)
            })),
            itinerary: buildItinerary(recommendations, duration, time),
            currentConditions: {
                parkHours: getCurrentParkHours(scheduleData),
                crowdLevel: estimateCrowdLevel(liveData),
                averageWaitTime: calculateParkAverageWaitTime(liveData),
                weatherConsiderations: getWeatherConsiderations(time)
            },
            activeFestivals: festivals.map(f => ({
                name: f.name,
                features: f.features,
                recommendation: getFestivalRecommendation(f, interests)
            })),
            tips: getPersonalizedTips(interests, time, duration),
            mustDo: getMustDoExperiences(interests),
            diningRecommendations: await getDiningRecommendations(interests, time)
        };

        return NextResponse.json(enhancedRecommendations);

    } catch (error) {
        console.error('Error generating EPCOT recommendations:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate recommendations',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper functions
function getSuggestedOrder(attractions: any[], time: string): string[] {
    const order = attractions.map(a => a.name);

    // Optimize based on time of day
    if (time === 'morning') {
        // Prioritize popular attractions early
        return order.sort((a, b) => {
            const popularAttraction = ['Guardians', 'Test Track', 'Frozen'];
            const aPopular = popularAttraction.some(p => a.includes(p));
            const bPopular = popularAttraction.some(p => b.includes(p));
            return bPopular ? 1 : aPopular ? -1 : 0;
        });
    } else if (time === 'evening') {
        // Save indoor attractions for evening
        return order.sort((a, b) => {
            const indoorAttractions = ['Spaceship Earth', 'Living with the Land', 'American Adventure'];
            const aIndoor = indoorAttractions.some(i => a.includes(i));
            const bIndoor = indoorAttractions.some(i => b.includes(i));
            return aIndoor ? 1 : bIndoor ? -1 : 0;
        });
    }

    return order;
}

function calculateEstimatedTime(attractions: any[]): number {
    // Estimate 30-45 minutes per attraction including wait time
    return attractions.length * 37.5;
}

function buildItinerary(recommendations: any[], duration: string, time: string): any {
    const itinerary: any = {
        morning: [],
        afternoon: [],
        evening: []
    };

    if (duration === 'half-day') {
        // Focus on must-do attractions
        const topAttractions = recommendations
            .flatMap(r => r.attractions)
            .slice(0, 4);

        if (time === 'morning' || time === 'all') {
            itinerary.morning = topAttractions.slice(0, 2);
            itinerary.afternoon = topAttractions.slice(2, 4);
        } else {
            itinerary.afternoon = topAttractions.slice(0, 2);
            itinerary.evening = topAttractions.slice(2, 4);
        }
    } else if (duration === 'full-day') {
        // Balance across all time periods
        const allAttractions = recommendations.flatMap(r => r.attractions);
        const chunkSize = Math.ceil(allAttractions.length / 3);

        itinerary.morning = allAttractions.slice(0, chunkSize);
        itinerary.afternoon = allAttractions.slice(chunkSize, chunkSize * 2);
        itinerary.evening = allAttractions.slice(chunkSize * 2);

        // Add dining recommendations
        itinerary.lunch = { time: '12:00 PM', suggestion: 'World Showcase dining' };
        itinerary.dinner = { time: '6:00 PM', suggestion: 'Table service restaurant' };
    } else {
        // Multi-day - spread across days
        itinerary.day1 = {
            focus: 'Future World (World Celebration, Discovery, Nature)',
            morning: recommendations.filter(r => r.category !== 'World Showcase').flatMap(r => r.attractions.slice(0, 2)),
            afternoon: recommendations.filter(r => r.category !== 'World Showcase').flatMap(r => r.attractions.slice(2, 4))
        };
        itinerary.day2 = {
            focus: 'World Showcase',
            morning: 'Start with popular World Showcase attractions',
            afternoon: 'Country pavilion exploration and dining'
        };
    }

    // Add fireworks viewing
    if (time === 'evening' || time === 'all') {
        itinerary.fireworks = {
            show: 'EPCOT Forever / Harmonious',
            time: '9:00 PM',
            viewingSpots: ['World Showcase Lagoon', 'Japan Pavilion', 'UK Pavilion']
        };
    }

    return itinerary;
}

function getCurrentParkHours(scheduleData: any): any {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = scheduleData.schedule.find((s: any) =>
        s.date.startsWith(today)
    );

    return todaySchedule || {
        openingTime: '9:00 AM',
        closingTime: '9:00 PM',
        note: 'Check official schedule for current hours'
    };
}

function estimateCrowdLevel(liveData: any): string {
    const averageWait = calculateParkAverageWaitTime(liveData);

    if (averageWait < 30) return 'Low';
    if (averageWait < 45) return 'Moderate';
    if (averageWait < 60) return 'High';
    return 'Very High';
}

function calculateParkAverageWaitTime(liveData: any): number {
    const waitTimes = liveData.liveData
        .filter((item: any) => item.queue?.STANDBY?.waitTime)
        .map((item: any) => item.queue.STANDBY.waitTime);

    if (waitTimes.length === 0) return 0;

    return Math.round(waitTimes.reduce((a: number, b: number) => a + b, 0) / waitTimes.length);
}

function getWeatherConsiderations(time: string): string[] {
    const considerations = [];

    if (time === 'morning') {
        considerations.push('Cooler temperatures, ideal for outdoor attractions');
    } else if (time === 'afternoon') {
        considerations.push('Peak heat - consider indoor attractions and shade');
        considerations.push('Stay hydrated and take breaks');
    } else if (time === 'evening') {
        considerations.push('Cooler temperatures return');
        considerations.push('Great for World Showcase dining');
    }

    considerations.push('Check weather forecast for rain');

    return considerations;
}

function getFestivalRecommendation(festival: epcotService.EpcotFestival, interests: string[]): string {
    if (interests.includes('food') && festival.name.includes('Food & Wine')) {
        return 'Perfect match! Don\'t miss the global marketplaces';
    }
    if (interests.includes('culture') && festival.name.includes('Arts')) {
        return 'Explore art galleries and live performances';
    }
    if (interests.includes('nature') && festival.name.includes('Flower')) {
        return 'Enjoy the stunning topiaries and gardens';
    }
    return 'Check out festival-exclusive offerings';
}

function getPersonalizedTips(interests: string[], time: string, duration: string): string[] {
    const tips = [];

    // Interest-based tips
    if (interests.includes('thrills')) {
        tips.push('Rope drop Guardians of the Galaxy or use Lightning Lane');
        tips.push('Single rider line available at Test Track');
    }

    if (interests.includes('food')) {
        tips.push('Make dining reservations 60 days in advance');
        tips.push('Try snacks from different countries in World Showcase');
    }

    if (interests.includes('family')) {
        tips.push('Rider switch available for height-restricted attractions');
        tips.push('Character meet and greets throughout the day');
    }

    // Time-based tips
    if (time === 'morning') {
        tips.push('Arrive 30 minutes before park opening');
    } else if (time === 'evening') {
        tips.push('Stay for the nighttime spectacular');
    }

    // Duration-based tips
    if (duration === 'half-day') {
        tips.push('Focus on one area of the park');
        tips.push('Consider park hopper for more flexibility');
    } else if (duration === 'multi-day') {
        tips.push('Take your time exploring each pavilion');
        tips.push('Try different restaurants each day');
    }

    return tips;
}

function getMustDoExperiences(interests: string[]): string[] {
    const mustDo = ['Spaceship Earth - EPCOT icon'];

    if (interests.includes('thrills')) {
        mustDo.push('Guardians of the Galaxy: Cosmic Rewind');
    }

    if (interests.includes('family')) {
        mustDo.push('Frozen Ever After');
        mustDo.push('Remy\'s Ratatouille Adventure');
    }

    if (interests.includes('education')) {
        mustDo.push('Living with the Land');
        mustDo.push('The American Adventure');
    }

    if (interests.includes('culture')) {
        mustDo.push('World Showcase cultural performances');
    }

    return mustDo;
}

async function getDiningRecommendations(interests: string[], time: string): Promise<any> {
    const diningData = await epcotService.getEpcotDining();
    const recommendations: any = {
        quickService: [],
        tableService: [],
        snacks: []
    };

    if (interests.includes('food')) {
        // Food enthusiasts get more options
        recommendations.quickService = ['Les Halles Boulangerie', 'Sunshine Seasons'];
        recommendations.tableService = ['Le Cellier', 'Teppan Edo', 'Space 220'];
        recommendations.snacks = ['School Bread (Norway)', 'Croissant Donut (EPCOT Experience)'];
    } else {
        // Basic recommendations
        recommendations.quickService = ['Sunshine Seasons', 'Connections Eatery'];
        recommendations.tableService = ['Garden Grill', 'Coral Reef'];
    }

    // Time-specific recommendations
    if (time === 'morning') {
        recommendations.breakfast = ['Connections Café (Starbucks)', 'Les Halles'];
    } else if (time === 'evening') {
        recommendations.dinner = 'Make reservations for World Showcase restaurants';
    }

    return recommendations;
}