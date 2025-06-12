import { NextRequest, NextResponse } from 'next/server';
import * as epcotService from '@/lib/services/epcot-service';
import { getEpcotAttractions, getEpcotLive } from '@/lib/services/themeparks-api';

/**
 * GET /api/parks/epcot/stats
 *
 * Get comprehensive EPCOT statistics and analytics
 *
 * Query parameters:
 * - type: 'current' | 'historical' | 'areas' | 'attractions' | 'complete'
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'current';

        switch (type) {
            case 'current': {
                // Get current park statistics
                const stats = await epcotService.getEpcotStats();

                return NextResponse.json({
                    ...stats,
                    summary: {
                        status: getParkStatus(stats),
                        recommendation: getParkRecommendation(stats.current.averageWaitTime),
                        bestTimeToVisit: getBestTimeToVisit(stats.current.averageWaitTime)
                    }
                });
            }

            case 'areas': {
                // Get detailed area statistics
                const [attractionsByArea, waitTimesByArea, diningByArea] = await Promise.all([
                    epcotService.getEpcotAttractionsByArea(),
                    epcotService.getEpcotWaitTimesByArea(),
                    epcotService.getEpcotDining()
                ]);

                const areaStats = Object.values(epcotService.EpcotArea).map(area => {
                    const attractions = attractionsByArea[area] || [];
                    const waitData = waitTimesByArea.areaStats.find(stat => stat.area === area);
                    const dining = area === epcotService.EpcotArea.WORLD_SHOWCASE
                        ? Object.values(diningByArea.worldShowcaseByCountry).flat()
                        : diningByArea.byArea[area] || [];

                    return {
                        area,
                        statistics: {
                            totalAttractions: attractions.length,
                            totalDining: dining.length,
                            currentWaitTime: waitData?.stats || { average: 0, max: 0, min: 0 },
                            operatingAttractions: waitData?.attractions.length || 0
                        },
                        highlights: epcotService.AREA_ATTRACTIONS[area] || []
                    };
                });

                return NextResponse.json({
                    areas: areaStats,
                    totals: {
                        attractions: areaStats.reduce((sum, area) => sum + area.statistics.totalAttractions, 0),
                        dining: areaStats.reduce((sum, area) => sum + area.statistics.totalDining, 0),
                        operating: areaStats.reduce((sum, area) => sum + area.statistics.operatingAttractions, 0)
                    },
                    lastUpdate: waitTimesByArea.lastUpdate
                });
            }

            case 'attractions': {
                // Get attraction-specific statistics
                const [childrenData, liveData] = await Promise.all([
                    getEpcotAttractions(),
                    getEpcotLive()
                ]);

                const attractions = childrenData.children
                    .filter(child => child.entityType === 'ATTRACTION')
                    .map(attraction => {
                        const liveInfo = liveData.liveData.find(live => live.id === attraction.id);
                        return {
                            ...attraction,
                            area: epcotService.getAttractionArea(attraction.name),
                            status: liveInfo?.status || 'UNKNOWN',
                            waitTime: liveInfo?.queue?.STANDBY?.waitTime || null,
                            lightningLane: liveInfo?.queue?.PAID_RETURN_TIME ? true : false,
                            popularity: getAttractionPopularity(liveInfo?.queue?.STANDBY?.waitTime)
                        };
                    });

                // Group by various criteria
                const byStatus = groupBy(attractions, 'status');
                const byArea = groupBy(attractions, 'area');
                const byPopularity = groupBy(attractions, 'popularity');

                return NextResponse.json({
                    totalAttractions: attractions.length,
                    byStatus,
                    byArea,
                    byPopularity,
                    topWaitTimes: attractions
                        .filter(a => a.waitTime !== null)
                        .sort((a, b) => (b.waitTime || 0) - (a.waitTime || 0))
                        .slice(0, 10),
                    lightningLaneAttractions: attractions.filter(a => a.lightningLane),
                    lastUpdate: liveData.lastUpdate
                });
            }

            case 'historical': {
                // Simulated historical data (in real implementation, would fetch from database)
                const historicalData = generateHistoricalData();

                return NextResponse.json({
                    message: 'Historical data based on typical patterns',
                    data: historicalData,
                    insights: getHistoricalInsights(historicalData)
                });
            }

            case 'complete': {
                // Get all statistics combined
                const [currentStats, areaWaitTimes, attractions, dining] = await Promise.all([
                    epcotService.getEpcotStats(),
                    epcotService.getEpcotWaitTimesByArea(),
                    epcotService.getEpcotAttractionsByArea(),
                    epcotService.getEpcotDining()
                ]);

                return NextResponse.json({
                    current: currentStats,
                    areas: areaWaitTimes.areaStats,
                    festivals: currentStats.current.activeFestivals,
                    worldShowcase: {
                        countries: Object.values(epcotService.WorldShowcaseCountry).length,
                        dining: Object.keys(dining.worldShowcaseByCountry).length,
                        attractions: attractions[epcotService.EpcotArea.WORLD_SHOWCASE]?.length || 0
                    },
                    recommendations: {
                        currentConditions: getParkRecommendation(currentStats.current.averageWaitTime),
                        bestAreas: getBestAreas(areaWaitTimes.areaStats),
                        festivalImpact: getFestivalImpact(currentStats.current.activeFestivals)
                    },
                    lastUpdate: new Date().toISOString()
                });
            }

            default: {
                return NextResponse.json(
                    {
                        error: 'Invalid type parameter',
                        validTypes: ['current', 'areas', 'attractions', 'historical', 'complete']
                    },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        console.error('Error fetching EPCOT statistics:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper functions
function getParkStatus(stats: any): string {
    const operatingPercentage = (stats.current.operatingAttractions / stats.totals.attractions) * 100;

    if (operatingPercentage > 90) return 'Fully Operational';
    if (operatingPercentage > 80) return 'Normal Operations';
    if (operatingPercentage > 70) return 'Limited Refurbishments';
    return 'Multiple Closures';
}

function getParkRecommendation(averageWaitTime: number): string {
    if (averageWaitTime < 30) return 'Excellent time to visit - low crowds';
    if (averageWaitTime < 45) return 'Good time to visit - moderate crowds';
    if (averageWaitTime < 60) return 'Busy but manageable - plan accordingly';
    return 'Very busy - consider Lightning Lane or visit another day';
}

function getBestTimeToVisit(currentAverage: number): string {
    if (currentAverage > 60) {
        return 'Visit during early morning or late evening for shorter waits';
    } else if (currentAverage > 45) {
        return 'Now is a decent time, but earlier would be better';
    }
    return 'Now is a great time to visit!';
}

function getAttractionPopularity(waitTime: number | null): string {
    if (waitTime === null) return 'Closed';
    if (waitTime === 0) return 'Walk-on';
    if (waitTime <= 15) return 'Low';
    if (waitTime <= 30) return 'Moderate';
    if (waitTime <= 60) return 'High';
    return 'Very High';
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const group = String(item[key]);
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

function generateHistoricalData() {
    // Simulated data - in production, this would come from a database
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return {
        byDayOfWeek: days.map(day => ({
            day,
            averageWaitTime: Math.random() * 30 + 25,
            peakTime: '2:00 PM',
            recommendation: day === 'Tuesday' || day === 'Wednesday' ? 'Best days to visit' : 'Average'
        })),
        byMonth: months.map(month => ({
            month,
            averageWaitTime: getMonthlyAverage(month),
            festivals: getMonthlyFestivals(month),
            crowdLevel: getMonthCrowdLevel(month)
        })),
        popularAttractions: [
            { name: 'Guardians of the Galaxy', averageWait: 75, peakWait: 120 },
            { name: 'Test Track', averageWait: 60, peakWait: 90 },
            { name: 'Frozen Ever After', averageWait: 65, peakWait: 100 },
            { name: 'Remy\'s Ratatouille Adventure', averageWait: 55, peakWait: 85 }
        ]
    };
}

function getMonthlyAverage(month: string): number {
    const busyMonths = ['March', 'July', 'December'];
    const slowMonths = ['January', 'February', 'September'];

    if (busyMonths.includes(month)) return Math.random() * 20 + 50;
    if (slowMonths.includes(month)) return Math.random() * 15 + 20;
    return Math.random() * 20 + 30;
}

function getMonthlyFestivals(month: string): string[] {
    const monthNum = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
        .indexOf(month) + 1;

    return epcotService.EPCOT_FESTIVALS
        .filter(festival => {
            if (festival.startMonth <= festival.endMonth) {
                return monthNum >= festival.startMonth && monthNum <= festival.endMonth;
            } else {
                return monthNum >= festival.startMonth || monthNum <= festival.endMonth;
            }
        })
        .map(f => f.name);
}

function getMonthCrowdLevel(month: string): string {
    const monthlyAverage = getMonthlyAverage(month);
    if (monthlyAverage < 30) return 'Low';
    if (monthlyAverage < 45) return 'Moderate';
    return 'High';
}

function getHistoricalInsights(data: any): string[] {
    const insights = [];

    // Find best days
    const bestDays = data.byDayOfWeek
        .filter((d: any) => d.averageWaitTime < 35)
        .map((d: any) => d.day);

    if (bestDays.length > 0) {
        insights.push(`Best days to visit: ${bestDays.join(', ')}`);
    }

    // Find best months
    const bestMonths = data.byMonth
        .filter((m: any) => m.crowdLevel === 'Low')
        .map((m: any) => m.month);

    if (bestMonths.length > 0) {
        insights.push(`Least crowded months: ${bestMonths.join(', ')}`);
    }

    // Festival insights
    insights.push('Festival seasons typically see 20-30% higher crowds');
    insights.push('Weekdays are generally 40% less crowded than weekends');

    return insights;
}

function getBestAreas(areaStats: any[]): string[] {
    const sortedAreas = [...areaStats]
        .filter(area => area.stats.totalAttractions > 0)
        .sort((a, b) => a.stats.average - b.stats.average);

    if (sortedAreas.length === 0) return ['No wait time data available'];

    return sortedAreas.slice(0, 2).map(area =>
        `${area.area} (${area.stats.average} min average)`
    );
}

function getFestivalImpact(festivals: any[]): string {
    if (festivals.length === 0) {
        return 'No active festivals - typically means lower food booth crowds';
    } else if (festivals.length === 1) {
        return `${festivals[0].name} is active - expect higher crowds at festival booths`;
    } else {
        return 'Multiple festivals active - park will be busier than usual';
    }
}