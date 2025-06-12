import { NextResponse } from "next/server";
import {
    getPredictionsForAttraction,
    analyzeParkCrowds,
    detectWaitTimeAnomalies,
    getHistoricalTrends,
    getOptimizedItinerary
} from "@/lib/services/wait-time-analytics";
import {
    triggerDataCollection,
    getDataQualityMetrics,
    getScrapingSessionStatus
} from "@/lib/services/wait-time-scraper";

/**
 * Advanced Wait Time Analytics API
 *
 * This endpoint provides comprehensive analytics capabilities including:
 * - Predictive modeling for wait times
 * - Crowd analysis and forecasting
 * - Historical trend analysis
 * - Anomaly detection
 * - Optimization recommendations
 * - Data quality monitoring
 */

// Type definitions for better type safety
interface OptimizeItineraryRequest {
    parkId: string;
    visitDate: string;
    preferences: {
        maxWaitTime: number;
        preferredAttractions: string[];
        avoidCrowds: boolean;
        hasLightningLane: boolean;
        [key: string]: unknown;
    };
}

interface ParkInsightsRequest {
    parkId: string;
    includeAnomalies?: boolean;
    includeTrends?: boolean;
}

interface Anomaly {
    id: string;
    attractionId: string;
    timestamp: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
}

interface TrendSummary {
    period: string;
    averageWaitTime: number;
    peakHours: string[];
    recommendations: string[];
}

// GET /api/analytics/wait-times
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const attractionId = url.searchParams.get('attractionId');
        const parkId = url.searchParams.get('parkId');

        switch (action) {
            case 'predictions':
                return await handlePredictions(attractionId, url.searchParams);

            case 'crowd-analysis':
                return await handleCrowdAnalysis(parkId);

            case 'anomalies':
                return await handleAnomalies(attractionId);

            case 'trends':
                return await handleTrends(attractionId, url.searchParams);

            case 'data-quality':
                return await handleDataQuality();

            case 'scraping-status':
                return await handleScrapingStatus(url.searchParams.get('sessionId'));

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Supported actions: predictions, crowd-analysis, anomalies, trends, data-quality, scraping-status' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error in analytics API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/analytics/wait-times
export async function POST(request: Request) {
    try {
        const body = await request.json() as { action: string; [key: string]: unknown };
        const { action } = body;

        switch (action) {
            case 'optimize-itinerary':
                return await handleOptimizeItinerary(body);

            case 'trigger-scraping':
                return await handleTriggerScraping();

            case 'bulk-predictions':
                return await handleBulkPredictions(body);

            case 'park-insights':
                return await handleParkInsights(body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Supported actions: optimize-itinerary, trigger-scraping, bulk-predictions, park-insights' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error in analytics API POST:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Handler functions for different analytics operations

async function handlePredictions(attractionId: string | null, searchParams: URLSearchParams) {
    if (!attractionId) {
        return NextResponse.json(
            { error: 'attractionId is required for predictions' },
            { status: 400 }
        );
    }

    const hoursAhead = parseInt(searchParams.get('hoursAhead') || '24');
    const includeFactors = searchParams.get('includeFactors') === 'true';

    try {
        const predictions = await getPredictionsForAttraction(attractionId, hoursAhead);

        if (!predictions) {
            return NextResponse.json(
                { error: 'Insufficient data for predictions' },
                { status: 404 }
            );
        }

        // Optionally filter out factor details for lighter response
        if (!includeFactors && 'factors' in predictions) {
            const { factors, ...predictionsWithoutFactors } = predictions;
            return NextResponse.json({
                success: true,
                data: predictionsWithoutFactors,
                metadata: {
                    hoursAhead,
                    generatedAt: new Date().toISOString(),
                    dataPoints: predictions.predictedWaitTimes.length
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: predictions,
            metadata: {
                hoursAhead,
                generatedAt: new Date().toISOString(),
                dataPoints: predictions.predictedWaitTimes.length
            }
        });

    } catch (error) {
        console.error('Error generating predictions:', error);
        return NextResponse.json(
            { error: 'Failed to generate predictions' },
            { status: 500 }
        );
    }
}

async function handleCrowdAnalysis(parkId: string | null) {
    if (!parkId) {
        return NextResponse.json(
            { error: 'parkId is required for crowd analysis' },
            { status: 400 }
        );
    }

    try {
        const analysis = await analyzeParkCrowds(parkId);

        return NextResponse.json({
            success: true,
            data: analysis,
            metadata: {
                generatedAt: new Date().toISOString(),
                parkId
            }
        });

    } catch (error) {
        console.error('Error analyzing crowds:', error);
        return NextResponse.json(
            { error: 'Failed to analyze park crowds' },
            { status: 500 }
        );
    }
}

async function handleAnomalies(attractionId: string | null) {
    if (!attractionId) {
        return NextResponse.json(
            { error: 'attractionId is required for anomaly detection' },
            { status: 400 }
        );
    }

    try {
        const anomalies = await detectWaitTimeAnomalies(attractionId);

        return NextResponse.json({
            success: true,
            data: anomalies,
            metadata: {
                attractionId,
                anomaliesDetected: anomalies.length,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error detecting anomalies:', error);
        return NextResponse.json(
            { error: 'Failed to detect anomalies' },
            { status: 500 }
        );
    }
}

async function handleTrends(attractionId: string | null, searchParams: URLSearchParams) {
    if (!attractionId) {
        return NextResponse.json(
            { error: 'attractionId is required for trend analysis' },
            { status: 400 }
        );
    }

    const periodParam = searchParams.get('period') || 'daily';
    const validPeriods = ['hourly', 'daily', 'weekly', 'monthly'] as const;

    if (!validPeriods.includes(periodParam as typeof validPeriods[number])) {
        return NextResponse.json(
            { error: 'Invalid period. Must be one of: hourly, daily, weekly, monthly' },
            { status: 400 }
        );
    }

    const period = periodParam as typeof validPeriods[number];

    try {
        const trends = await getHistoricalTrends(attractionId, period);

        if (!trends) {
            return NextResponse.json(
                { error: 'Insufficient historical data for trend analysis' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: trends,
            metadata: {
                attractionId,
                period,
                dataPoints: trends.data.length,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error generating trends:', error);
        return NextResponse.json(
            { error: 'Failed to generate trend analysis' },
            { status: 500 }
        );
    }
}

async function handleDataQuality() {
    try {
        const qualityMetrics = await getDataQualityMetrics();

        return NextResponse.json({
            success: true,
            data: qualityMetrics,
            metadata: {
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting data quality metrics:', error);
        return NextResponse.json(
            { error: 'Failed to get data quality metrics' },
            { status: 500 }
        );
    }
}

async function handleScrapingStatus(sessionId: string | null) {
    if (!sessionId) {
        return NextResponse.json(
            { error: 'sessionId is required for scraping status' },
            { status: 400 }
        );
    }

    try {
        const status = getScrapingSessionStatus(sessionId);

        if (!status) {
            return NextResponse.json(
                { error: 'Scraping session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: status,
            metadata: {
                sessionId,
                queriedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting scraping status:', error);
        return NextResponse.json(
            { error: 'Failed to get scraping status' },
            { status: 500 }
        );
    }
}

async function handleOptimizeItinerary(body: OptimizeItineraryRequest) {
    const { parkId, visitDate, preferences } = body;

    if (!parkId || !visitDate || !preferences) {
        return NextResponse.json(
            { error: 'parkId, visitDate, and preferences are required' },
            { status: 400 }
        );
    }

    // Validate preferences structure
    if (!preferences.maxWaitTime || !Array.isArray(preferences.preferredAttractions)) {
        return NextResponse.json(
            { error: 'Invalid preferences structure' },
            { status: 400 }
        );
    }

    // Provide defaults for optional boolean fields
    const normalizedPreferences = {
        ...preferences,
        avoidCrowds: preferences.avoidCrowds ?? false,
        hasLightningLane: preferences.hasLightningLane ?? false
    };

    try {
        const recommendations = await getOptimizedItinerary(parkId, visitDate, normalizedPreferences);

        return NextResponse.json({
            success: true,
            data: recommendations,
            metadata: {
                parkId,
                visitDate,
                generatedAt: new Date().toISOString(),
                attractionsInItinerary: recommendations.recommendations.itinerary.length
            }
        });

    } catch (error) {
        console.error('Error optimizing itinerary:', error);
        return NextResponse.json(
            { error: 'Failed to optimize itinerary' },
            { status: 500 }
        );
    }
}

async function handleTriggerScraping() {
    try {
        const sessionId = await triggerDataCollection();

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                status: 'STARTED',
                message: 'Data collection session started successfully'
            },
            metadata: {
                startedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error triggering scraping:', error);
        return NextResponse.json(
            { error: 'Failed to start data collection' },
            { status: 500 }
        );
    }
}

async function handleBulkPredictions(body: { attractionIds: string[]; hoursAhead?: number; includeFactors?: boolean }) {
    const { attractionIds, hoursAhead = 24, includeFactors = false } = body;

    if (!Array.isArray(attractionIds) || attractionIds.length === 0) {
        return NextResponse.json(
            { error: 'attractionIds array is required' },
            { status: 400 }
        );
    }

    if (attractionIds.length > 50) {
        return NextResponse.json(
            { error: 'Maximum 50 attractions allowed per request' },
            { status: 400 }
        );
    }

    try {
        const predictions = await Promise.allSettled(
            attractionIds.map(async (attractionId: string) => {
                const prediction = await getPredictionsForAttraction(attractionId, hoursAhead);

                if (!includeFactors && prediction && 'factors' in prediction) {
                    const { factors, ...predictionWithoutFactors } = prediction;
                    return {
                        attractionId,
                        prediction: predictionWithoutFactors,
                        success: true
                    };
                }

                return {
                    attractionId,
                    prediction,
                    success: prediction !== null
                };
            })
        );

        const results = predictions.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    attractionId: attractionIds[index],
                    prediction: null,
                    success: false,
                    error: (result.reason as Error)?.message || 'Unknown error'
                };
            }
        });

        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            success: true,
            data: results,
            metadata: {
                totalRequested: attractionIds.length,
                successfulPredictions: successCount,
                failedPredictions: attractionIds.length - successCount,
                hoursAhead,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error generating bulk predictions:', error);
        return NextResponse.json(
            { error: 'Failed to generate bulk predictions' },
            { status: 500 }
        );
    }
}

async function handleParkInsights(body: ParkInsightsRequest) {
    const { parkId, includeAnomalies = true, includeTrends = true } = body;

    if (!parkId) {
        return NextResponse.json(
            { error: 'parkId is required' },
            { status: 400 }
        );
    }

    try {
        // Get crowd analysis
        const crowdAnalysis = await analyzeParkCrowds(parkId);

        // Get data quality metrics
        const dataQuality = await getDataQualityMetrics();

        // Optionally get anomalies for all attractions in the park
        let anomalies: Anomaly[] = [];
        if (includeAnomalies) {
            // This would require getting all attraction IDs for the park first
            // For now, we'll return an empty array
            anomalies = [];
        }

        // Optionally get trends summary
        let trendsummary: TrendSummary | null = null;
        if (includeTrends) {
            // This would aggregate trends across all attractions
            // For now, we'll return null
            trendsummary = null;
        }

        const insights = {
            parkId,
            crowdAnalysis,
            dataQuality,
            anomalies,
            trendSummary: trendsummary,
            recommendations: {
                bestVisitStrategy: crowdAnalysis.overallCrowdLevel === 'HIGH' || crowdAnalysis.overallCrowdLevel === 'VERY_HIGH'
                    ? 'Consider visiting during early morning hours or late evening'
                    : 'Standard touring plan should work well',
                dataReliability: dataQuality.averageConfidence > 0.8 ? 'HIGH' : dataQuality.averageConfidence > 0.6 ? 'MODERATE' : 'LOW',
                nextDataUpdate: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
            }
        };

        return NextResponse.json({
            success: true,
            data: insights,
            metadata: {
                parkId,
                generatedAt: new Date().toISOString(),
                includeAnomalies,
                includeTrends
            }
        });

    } catch (error) {
        console.error('Error generating park insights:', error);
        return NextResponse.json(
            { error: 'Failed to generate park insights' },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function HEAD() {
    return new Response(null, {
        status: 200,
        headers: {
            'X-Service': 'wait-time-analytics',
            'X-Version': '1.0.0',
            'X-Status': 'healthy'
        }
    });
}