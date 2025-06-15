import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    Timestamp
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase/firebase.config';

/**
 * Advanced Wait Time Analytics Engine
 *
 * This service provides sophisticated analytics capabilities including:
 * - Machine learning-based wait time predictions
 * - Crowd level analysis and forecasting
 * - Optimal visit time recommendations
 * - Historical trend analysis
 * - Real-time anomaly detection
 */

// Types for analytics
interface WaitTimePrediction {
    attractionId: string;
    attractionName: string;
    parkId: string;
    currentWaitTime: number;
    predictedWaitTimes: {
        time: string; // ISO timestamp
        waitTime: number;
        confidence: number;
    }[];
    optimalVisitTime: {
        time: string;
        expectedWaitTime: number;
        crowdLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
    };
    factors: {
        historicalTrend: number;
        weatherImpact: number;
        specialEvents: number;
        dayOfWeek: number;
        timeOfDay: number;
    };
}

interface CrowdAnalysis {
    parkId: string;
    timestamp: string;
    overallCrowdLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
    crowdScore: number; // 0-100
    peakTimes: {
        start: string;
        end: string;
        intensity: number;
    }[];
    quietTimes: {
        start: string;
        end: string;
        expectedCrowdLevel: 'LOW' | 'MODERATE';
    }[];
    recommendations: {
        bestTimeToVisit: string;
        attractionsToAvoid: string[];
        attractionsToTarget: string[];
        estimatedWalkingTime: number; // minutes between attractions
    };
}

interface HistoricalTrend {
    attractionId: string;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    data: {
        label: string; // hour, day name, week number, month name
        averageWaitTime: number;
        minWaitTime: number;
        maxWaitTime: number;
        dataPoints: number;
    }[];
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    seasonality: {
        pattern: 'SEASONAL' | 'WEEKLY' | 'DAILY' | 'NONE';
        strength: number; // 0-1
    };
}

interface AnomalyDetection {
    attractionId: string;
    timestamp: string;
    currentWaitTime: number;
    expectedWaitTime: number;
    anomalyScore: number; // 0-1, higher = more anomalous
    type: 'SPIKE' | 'DROP' | 'UNUSUAL_PATTERN';
    possibleCauses: string[];
    confidence: number;
}

interface OptimizationRecommendation {
    userId?: string;
    parkId: string;
    visitDate: string;
    preferences: {
        maxWaitTime: number;
        preferredAttractions: string[];
        avoidCrowds: boolean;
        hasLightningLane: boolean;
    };
    recommendations: {
        itinerary: {
            time: string;
            attractionId: string;
            attractionName: string;
            expectedWaitTime: number;
            walkingTime: number;
            priority: number;
        }[];
        alternativeOptions: {
            attractionId: string;
            reason: string;
            suggestedTime: string;
        }[];
        crowdAvoidanceStrategy: string;
        estimatedTotalWaitTime: number;
        estimatedAttractionsCompleted: number;
    };
}

// Firebase collection names
const COLLECTIONS = {
    WAIT_TIMES: 'waitTimes',
    HISTORICAL_WAIT_TIMES: 'historicalWaitTimes',
    ATTRACTIONS: 'attractions',
    PARKS: 'parks',
    WEATHER_DATA: 'weatherData',
    SPECIAL_EVENTS: 'specialEvents'
} as const;

// Machine Learning Models (simplified implementations)
class WaitTimePredictionModel {
    // Exponential smoothing for time series prediction
    private exponentialSmoothing(data: number[], alpha = 0.3): number[] {
        if (data.length === 0) return [];

        const smoothed = [data[0]];
        for (let i = 1; i < data.length; i++) {
            smoothed[i] = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
        }
        return smoothed;
    }

    // Linear regression for trend analysis
    private linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
        const n = x.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R-squared
        const yMean = sumY / n;
        const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - (slope * x[i] + intercept), 2), 0);
        const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
        const r2 = 1 - (ssRes / ssTot);

        return { slope, intercept, r2 };
    }

    // Seasonal decomposition
    private detectSeasonality(data: number[], period: number): { seasonal: number[]; trend: number[]; residual: number[] } {
        const seasonal: number[] = [];
        const trend: number[] = [];
        const residual: number[] = [];

        // Simple moving average for trend
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - Math.floor(period / 2));
            const end = Math.min(data.length, i + Math.floor(period / 2) + 1);
            const window = data.slice(start, end);
            trend[i] = window.reduce((sum, val) => sum + val, 0) / window.length;
        }

        // Calculate seasonal component
        const seasonalPattern: number[] = new Array(period).fill(0);
        const seasonalCounts: number[] = new Array(period).fill(0);

        for (let i = 0; i < data.length; i++) {
            const seasonIndex = i % period;
            seasonalPattern[seasonIndex] += data[i] - trend[i];
            seasonalCounts[seasonIndex]++;
        }

        for (let i = 0; i < period; i++) {
            if (seasonalCounts[i] > 0) {
                seasonalPattern[i] /= seasonalCounts[i];
            }
        }

        // Apply seasonal pattern and calculate residual
        for (let i = 0; i < data.length; i++) {
            seasonal[i] = seasonalPattern[i % period];
            residual[i] = data[i] - trend[i] - seasonal[i];
        }

        return { seasonal, trend, residual };
    }

    async predictWaitTimes(attractionId: string, hoursAhead = 24): Promise<WaitTimePrediction | null> {
        try {
            // Fetch historical data
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const historicalQuery = query(
                collection(firestore, COLLECTIONS.HISTORICAL_WAIT_TIMES),
                where('attractionId', '==', attractionId),
                where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
                orderBy('timestamp', 'asc')
            );
            const historicalSnapshot = await getDocs(historicalQuery);
            const historicalData = historicalSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (!historicalData || historicalData.length < 10) {
                return null; // Need sufficient data for prediction
            }

            // Get attraction info
            const attractionDoc = await getDoc(doc(firestore, COLLECTIONS.ATTRACTIONS, attractionId));
            if (!attractionDoc.exists()) return null;
            const attractionInfo = attractionDoc.data();

            // Prepare data for analysis
            const waitTimes = historicalData.map(d => d.waitMinutes);
            const timestamps = historicalData.map(d => new Date(d.timestamp).getTime());

            // Apply exponential smoothing
            const smoothedData = this.exponentialSmoothing(waitTimes);

            // Detect patterns
            const hourlyPattern = this.detectSeasonality(waitTimes, 24);

            // Calculate trend
            const timeIndices = timestamps.map((_, i) => i);
            const trendAnalysis = this.linearRegression(timeIndices, smoothedData);

            // Generate predictions
            const predictions: WaitTimePrediction['predictedWaitTimes'] = [];
            const currentTime = new Date();

            for (let h = 1; h <= hoursAhead; h++) {
                const futureTime = new Date(currentTime.getTime() + h * 60 * 60 * 1000);
                const futureHour = futureTime.getHours();
                const futureDayOfWeek = futureTime.getDay();

                // Base prediction from trend
                let prediction = trendAnalysis.intercept + trendAnalysis.slope * (historicalData.length + h);

                // Apply hourly seasonality
                const hourlyIndex = futureHour;
                if (hourlyPattern.seasonal[hourlyIndex]) {
                    prediction += hourlyPattern.seasonal[hourlyIndex];
                }

                // Apply day-of-week effects
                const weekdayMultiplier = this.getWeekdayMultiplier(futureDayOfWeek);
                prediction *= weekdayMultiplier;

                // Apply external factors
                const weatherFactor = await this.getWeatherFactor(attractionInfo.parkId, futureTime);
                const eventFactor = await this.getEventFactor(attractionInfo.parkId, futureTime);

                prediction *= (1 + weatherFactor + eventFactor);

                // Ensure reasonable bounds
                prediction = Math.max(0, Math.min(300, Math.round(prediction)));

                // Calculate confidence based on data quality and prediction horizon
                const confidence = Math.max(0.1, Math.min(0.95,
                    trendAnalysis.r2 * (1 - h / hoursAhead) * (historicalData.length / 100)
                ));

                predictions.push({
                    time: futureTime.toISOString(),
                    waitTime: prediction,
                    confidence
                });
            }

            // Find optimal visit time
            const optimalTime = predictions.reduce((best, current) =>
                current.waitTime < best.waitTime ? current : best
            );

            // Calculate factor contributions
            const factors = {
                historicalTrend: Math.abs(trendAnalysis.slope) * 10,
                weatherImpact: await this.getWeatherFactor(attractionInfo.parkId, currentTime) * 100,
                specialEvents: await this.getEventFactor(attractionInfo.parkId, currentTime) * 100,
                dayOfWeek: this.getWeekdayMultiplier(currentTime.getDay()) * 100 - 100,
                timeOfDay: this.getTimeOfDayFactor(currentTime.getHours()) * 100
            };

            return {
                attractionId,
                attractionName: attractionInfo.name,
                parkId: attractionInfo.parkId,
                currentWaitTime: waitTimes[waitTimes.length - 1] || 0,
                predictedWaitTimes: predictions,
                optimalVisitTime: {
                    time: optimalTime.time,
                    expectedWaitTime: optimalTime.waitTime,
                    crowdLevel: this.waitTimeToCrowdLevel(optimalTime.waitTime)
                },
                factors
            };

        } catch (error) {
            console.error('Error predicting wait times:', error);
            return null;
        }
    }

    private getWeekdayMultiplier(dayOfWeek: number): number {
        // 0 = Sunday, 6 = Saturday
        const multipliers = [1.3, 0.8, 0.8, 0.8, 0.9, 1.2, 1.4]; // Weekend higher
        return multipliers[dayOfWeek] || 1.0;
    }

    private getTimeOfDayFactor(hour: number): number {
        // Peak times: 10-12, 14-16, 19-21
        if ((hour >= 10 && hour <= 12) || (hour >= 14 && hour <= 16) || (hour >= 19 && hour <= 21)) {
            return 1.3;
        } else if (hour >= 8 && hour <= 9) {
            return 0.7; // Early morning
        } else if (hour >= 22 || hour <= 7) {
            return 0.5; // Very early/late
        }
        return 1.0;
    }

    private async getWeatherFactor(parkId: string, time: Date): Promise<number> {
        // Simplified weather impact - in reality, would call weather API
        const hour = time.getHours();
        const isAfternoon = hour >= 12 && hour <= 16;
        const randomFactor = Math.random();

        // Florida afternoon thunderstorms
        if (isAfternoon && randomFactor > 0.7) {
            return -0.3; // Reduces crowds
        }
        return 0;
    }

    private async getEventFactor(parkId: string, time: Date): Promise<number> {
        // Check for special events - simplified implementation
        const dayOfWeek = time.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = this.isHoliday(time);

        if (isHoliday) return 0.5; // 50% increase
        if (isWeekend) return 0.2; // 20% increase
        return 0;
    }

    private isHoliday(date: Date): boolean {
        // Simplified holiday detection
        const month = date.getMonth();
        const day = date.getDate();

        // Major holidays that affect Disney crowds
        const holidays = [
            { month: 0, day: 1 },   // New Year's Day
            { month: 6, day: 4 },   // July 4th
            { month: 11, day: 25 }, // Christmas
            { month: 11, day: 31 }  // New Year's Eve
        ];

        return holidays.some(h => h.month === month && h.day === day);
    }

    private waitTimeToCrowdLevel(waitTime: number): 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' {
        if (waitTime <= 20) return 'LOW';
        if (waitTime <= 40) return 'MODERATE';
        if (waitTime <= 70) return 'HIGH';
        return 'VERY_HIGH';
    }
}

// Crowd Analysis Engine
class CrowdAnalysisEngine {
    async analyzeParkCrowds(parkId: string): Promise<CrowdAnalysis> {
        try {
            // Get current wait times for all attractions in the park
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const currentWaitTimesQuery = query(
                collection(firestore, COLLECTIONS.WAIT_TIMES),
                where('parkId', '==', parkId),
                where('timestamp', '>=', Timestamp.fromDate(oneHourAgo))
            );
            const currentWaitTimesSnapshot = await getDocs(currentWaitTimesQuery);
            const currentWaitTimes = currentWaitTimesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (!currentWaitTimes || currentWaitTimes.length === 0) {
                throw new Error('Unable to fetch current wait times');
            }

            // Calculate overall crowd metrics
            const waitTimes = currentWaitTimes.map(wt => wt.waitMinutes).filter(wt => wt > 0);
            const averageWaitTime = waitTimes.length > 0
                ? waitTimes.reduce((sum, wt) => sum + wt, 0) / waitTimes.length
                : 0;

            const maxWaitTime = Math.max(...waitTimes, 0);
            const crowdScore = Math.min(100, (averageWaitTime * 0.6 + maxWaitTime * 0.4) * 1.5);

            const overallCrowdLevel = this.crowdScoreToCrowdLevel(crowdScore);

            // Analyze historical patterns for peak/quiet times
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const historicalQuery = query(
                collection(firestore, COLLECTIONS.HISTORICAL_WAIT_TIMES),
                where('parkId', '==', parkId),
                where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo)),
                orderBy('timestamp', 'asc')
            );
            const historicalSnapshot = await getDocs(historicalQuery);
            const historicalData = historicalSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const { peakTimes, quietTimes } = this.identifyPeakQuietTimes(historicalData || []);

            // Generate recommendations
            const recommendations = await this.generateCrowdRecommendations(
                parkId,
                currentWaitTimes,
                overallCrowdLevel
            );

            return {
                parkId,
                timestamp: new Date().toISOString(),
                overallCrowdLevel,
                crowdScore,
                peakTimes,
                quietTimes,
                recommendations
            };

        } catch (error) {
            console.error('Error analyzing park crowds:', error);
            throw error;
        }
    }

    private crowdScoreToCrowdLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' {
        if (score <= 25) return 'LOW';
        if (score <= 50) return 'MODERATE';
        if (score <= 75) return 'HIGH';
        return 'VERY_HIGH';
    }

    private identifyPeakQuietTimes(historicalData: { timestamp: string; waitMinutes: number }[]): {
        peakTimes: CrowdAnalysis['peakTimes'];
        quietTimes: CrowdAnalysis['quietTimes'];
    } {
        // Group data by hour of day
        const hourlyData: Record<number, number[]> = {};

        historicalData.forEach(record => {
            const hour = new Date(record.timestamp).getHours();
            if (!hourlyData[hour]) hourlyData[hour] = [];
            hourlyData[hour].push(record.waitMinutes);
        });

        // Calculate average wait time for each hour
        const hourlyAverages: { hour: number; avgWaitTime: number }[] = [];
        Object.entries(hourlyData).forEach(([hour, waitTimes]) => {
            const avg = waitTimes.reduce((sum, wt) => sum + wt, 0) / waitTimes.length;
            hourlyAverages.push({ hour: parseInt(hour), avgWaitTime: avg });
        });

        hourlyAverages.sort((a, b) => a.hour - b.hour);

        // Identify peaks (above average + 1 std dev)
        const overallAvg = hourlyAverages.reduce((sum, h) => sum + h.avgWaitTime, 0) / hourlyAverages.length;
        const stdDev = Math.sqrt(
            hourlyAverages.reduce((sum, h) => sum + Math.pow(h.avgWaitTime - overallAvg, 2), 0) / hourlyAverages.length
        );

        const peakThreshold = overallAvg + stdDev;
        const quietThreshold = overallAvg - stdDev * 0.5;

        const peakTimes: CrowdAnalysis['peakTimes'] = [];
        const quietTimes: CrowdAnalysis['quietTimes'] = [];

        let currentPeak: { start: number; end: number; intensity: number } | null = null;
        let currentQuiet: { start: number; end: number } | null = null;

        hourlyAverages.forEach(({ hour, avgWaitTime }) => {
            if (avgWaitTime >= peakThreshold) {
                if (!currentPeak) {
                    currentPeak = { start: hour, end: hour, intensity: avgWaitTime };
                } else {
                    currentPeak.end = hour;
                    currentPeak.intensity = Math.max(currentPeak.intensity, avgWaitTime);
                }
                if (currentQuiet) {
                    quietTimes.push({
                        start: `${currentQuiet.start.toString().padStart(2, '0')}:00`,
                        end: `${currentQuiet.end.toString().padStart(2, '0')}:59`,
                        expectedCrowdLevel: 'LOW'
                    });
                    currentQuiet = null;
                }
            } else if (avgWaitTime <= quietThreshold) {
                if (!currentQuiet) {
                    currentQuiet = { start: hour, end: hour };
                } else {
                    currentQuiet.end = hour;
                }
                if (currentPeak) {
                    peakTimes.push({
                        start: `${currentPeak.start.toString().padStart(2, '0')}:00`,
                        end: `${currentPeak.end.toString().padStart(2, '0')}:59`,
                        intensity: currentPeak.intensity
                    });
                    currentPeak = null;
                }
            } else {
                // Normal time - close any open periods
                if (currentPeak) {
                    peakTimes.push({
                        start: `${currentPeak.start.toString().padStart(2, '0')}:00`,
                        end: `${currentPeak.end.toString().padStart(2, '0')}:59`,
                        intensity: currentPeak.intensity
                    });
                    currentPeak = null;
                }
                if (currentQuiet) {
                    quietTimes.push({
                        start: `${currentQuiet.start.toString().padStart(2, '0')}:00`,
                        end: `${currentQuiet.end.toString().padStart(2, '0')}:59`,
                        expectedCrowdLevel: 'LOW'
                    });
                    currentQuiet = null;
                }
            }
        });

        return { peakTimes, quietTimes };
    }

    private async generateCrowdRecommendations(
        parkId: string,
        currentWaitTimes: { attractionId: string; waitMinutes: number; timestamp: string }[],
        crowdLevel: string
    ): Promise<CrowdAnalysis['recommendations']> {
        // Sort attractions by wait time
        const sortedAttractions = [...currentWaitTimes].sort((a, b) => a.waitMinutes - b.waitMinutes);

        const attractionsToTarget = sortedAttractions
            .filter(a => a.waitMinutes <= 30)
            .slice(0, 5)
            .map(a => a.attractionId);

        const attractionsToAvoid = sortedAttractions
            .filter(a => a.waitMinutes > 60)
            .slice(-3)
            .map(a => a.attractionId);

        // Determine best time to visit based on crowd level
        let bestTimeToVisit = '09:00';
        if (crowdLevel === 'HIGH' || crowdLevel === 'VERY_HIGH') {
            bestTimeToVisit = '08:00'; // Earlier is better
        }

        return {
            bestTimeToVisit,
            attractionsToAvoid,
            attractionsToTarget,
            estimatedWalkingTime: this.calculateWalkingTime(crowdLevel)
        };
    }

    private calculateWalkingTime(crowdLevel: string): number {
        const baseTimes = {
            'LOW': 5,
            'MODERATE': 7,
            'HIGH': 10,
            'VERY_HIGH': 15
        };
        const validCrowdLevel = crowdLevel as keyof typeof baseTimes;
        return baseTimes[validCrowdLevel] ?? 7;
    }
}

// Anomaly Detection Engine
class AnomalyDetectionEngine {
    async detectAnomalies(attractionId: string): Promise<AnomalyDetection[]> {
        try {
            // Get recent wait time data
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentDataQuery = query(
                collection(firestore, COLLECTIONS.WAIT_TIMES),
                where('attractionId', '==', attractionId),
                where('timestamp', '>=', Timestamp.fromDate(oneDayAgo)),
                orderBy('timestamp', 'asc')
            );
            const recentDataSnapshot = await getDocs(recentDataQuery);
            const recentData = recentDataSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (!recentData || recentData.length < 10) {
                return [];
            }

            // Get historical baseline
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const historicalDataQuery = query(
                collection(firestore, COLLECTIONS.HISTORICAL_WAIT_TIMES),
                where('attractionId', '==', attractionId),
                where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
                orderBy('timestamp', 'asc')
            );
            const historicalDataSnapshot = await getDocs(historicalDataQuery);
            const historicalData = historicalDataSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (!historicalData || historicalData.length < 50) {
                return [];
            }

            const anomalies: AnomalyDetection[] = [];

            // Calculate statistical baseline
            const historicalWaitTimes = historicalData.map(d => d.waitMinutes);
            const mean = historicalWaitTimes.reduce((sum, wt) => sum + wt, 0) / historicalWaitTimes.length;
            const stdDev = Math.sqrt(
                historicalWaitTimes.reduce((sum, wt) => sum + Math.pow(wt - mean, 2), 0) / historicalWaitTimes.length
            );

            // Detect anomalies in recent data
            recentData.forEach((dataPoint) => {
                const waitTime = dataPoint.waitMinutes;
                const zScore = Math.abs((waitTime - mean) / stdDev);

                if (zScore > 2.5) { // More than 2.5 standard deviations
                    const anomalyScore = Math.min(1, zScore / 4); // Normalize to 0-1

                    let type: AnomalyDetection['type'] = 'UNUSUAL_PATTERN';
                    if (waitTime > mean + 2 * stdDev) {
                        type = 'SPIKE';
                    } else if (waitTime < mean - 2 * stdDev) {
                        type = 'DROP';
                    }

                    const possibleCauses = this.identifyPossibleCauses(type, waitTime, dataPoint.timestamp);

                    anomalies.push({
                        attractionId,
                        timestamp: dataPoint.timestamp,
                        currentWaitTime: waitTime,
                        expectedWaitTime: Math.round(mean),
                        anomalyScore,
                        type,
                        possibleCauses,
                        confidence: Math.min(0.95, anomalyScore * 0.8 + 0.2)
                    });
                }
            });

            return anomalies;

        } catch (error) {
            console.error('Error detecting anomalies:', error);
            return [];
        }
    }

    private identifyPossibleCauses(type: AnomalyDetection['type'], waitTime: number, timestamp: string): string[] {
        const causes: string[] = [];
        const hour = new Date(timestamp).getHours();
        const dayOfWeek = new Date(timestamp).getDay();

        if (type === 'SPIKE') {
            causes.push('Unexpected high demand');
            if (hour >= 10 && hour <= 14) {
                causes.push('Peak visiting hours');
            }
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                causes.push('Weekend crowds');
            }
            if (waitTime > 120) {
                causes.push('Possible technical issues or reduced capacity');
            }
        } else if (type === 'DROP') {
            causes.push('Lower than expected demand');
            if (hour < 9 || hour > 20) {
                causes.push('Off-peak hours');
            }
            causes.push('Possible weather impact');
            if (waitTime === 0) {
                causes.push('Attraction temporarily closed');
            }
        }

        return causes;
    }
}

// Main Analytics Service
export class WaitTimeAnalyticsService {
    private predictionModel = new WaitTimePredictionModel();
    private crowdAnalysis = new CrowdAnalysisEngine();
    private anomalyDetection = new AnomalyDetectionEngine();

    async getPredictions(attractionId: string, hoursAhead = 24): Promise<WaitTimePrediction | null> {
        return await this.predictionModel.predictWaitTimes(attractionId, hoursAhead);
    }

    async analyzeCrowds(parkId: string): Promise<CrowdAnalysis> {
        return await this.crowdAnalysis.analyzeParkCrowds(parkId);
    }

    async detectAnomalies(attractionId: string): Promise<AnomalyDetection[]> {
        return await this.anomalyDetection.detectAnomalies(attractionId);
    }

    async generateHistoricalTrends(attractionId: string, period: HistoricalTrend['period'] = 'daily'): Promise<HistoricalTrend | null> {
        try {
            const daysBack = period === 'hourly' ? 7 : period === 'daily' ? 30 : period === 'weekly' ? 90 : 365;

            const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
            const historicalDataQuery = query(
                collection(firestore, COLLECTIONS.HISTORICAL_WAIT_TIMES),
                where('attractionId', '==', attractionId),
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                orderBy('timestamp', 'asc')
            );
            const historicalDataSnapshot = await getDocs(historicalDataQuery);
            const historicalData = historicalDataSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (!historicalData || historicalData.length < 10) {
                return null;
            }

            // Group data by period
            const groupedData: Record<string, number[]> = {};

            historicalData.forEach(record => {
                const date = new Date(record.timestamp);
                let key: string;

                switch (period) {
                    case 'hourly':
                        key = date.getHours().toString();
                        break;
                    case 'daily':
                        key = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                        break;
                    case 'weekly':
                        const weekNumber = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
                        key = `Week ${weekNumber}`;
                        break;
                    case 'monthly':
                        key = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
                        break;
                    default:
                        key = date.toDateString();
                }

                if (!groupedData[key]) groupedData[key] = [];
                groupedData[key].push(record.waitMinutes);
            });

            // Calculate statistics for each group
            const data = Object.entries(groupedData).map(([label, waitTimes]) => ({
                label,
                averageWaitTime: Math.round(waitTimes.reduce((sum, wt) => sum + wt, 0) / waitTimes.length),
                minWaitTime: Math.min(...waitTimes),
                maxWaitTime: Math.max(...waitTimes),
                dataPoints: waitTimes.length
            }));

            // Determine trend
            const averages = data.map(d => d.averageWaitTime);
            const firstHalf = averages.slice(0, Math.floor(averages.length / 2));
            const secondHalf = averages.slice(Math.floor(averages.length / 2));

            const firstAvg = firstHalf.reduce((sum, avg) => sum + avg, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, avg) => sum + avg, 0) / secondHalf.length;

            let trend: HistoricalTrend['trend'] = 'STABLE';
            const changePercent = Math.abs((secondAvg - firstAvg) / firstAvg);

            if (changePercent > 0.1) {
                trend = secondAvg > firstAvg ? 'INCREASING' : 'DECREASING';
            }

            // Detect seasonality
            const variance = averages.reduce((sum, avg) => {
                const overallAvg = averages.reduce((s, a) => s + a, 0) / averages.length;
                return sum + Math.pow(avg - overallAvg, 2);
            }, 0) / averages.length;

            const seasonalityStrength = Math.min(1, variance / 100);

            return {
                attractionId,
                period,
                data,
                trend,
                seasonality: {
                    pattern: seasonalityStrength > 0.3 ? 'SEASONAL' : 'NONE',
                    strength: seasonalityStrength
                }
            };

        } catch (error) {
            console.error('Error generating historical trends:', error);
            return null;
        }
    }

    async generateOptimizationRecommendations(
        parkId: string,
        visitDate: string,
        preferences: OptimizationRecommendation['preferences']
    ): Promise<OptimizationRecommendation> {
        try {
            // Get all attractions in the park
            const attractionsQuery = query(
                collection(firestore, COLLECTIONS.ATTRACTIONS),
                where('parkId', '==', parkId)
            );
            const attractionsSnapshot = await getDocs(attractionsQuery);

            if (attractionsSnapshot.empty) {
                throw new Error('No attractions found for park');
            }

            const attractions = attractionsSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            }));

            // Get predictions for all attractions
            const attractionPredictions = await Promise.all(
                attractions.map(async (attraction) => {
                    const prediction = await this.getPredictions(attraction.id, 12); // 12 hours ahead
                    return { attraction, prediction };
                })
            );

            // Filter based on preferences
            const viableAttractions = attractionPredictions
                .filter(({ prediction }) => prediction !== null)
                .filter(({ prediction }) => {
                    if (!prediction) return false;
                    const minWaitTime = Math.min(...prediction.predictedWaitTimes.map(p => p.waitTime));
                    return minWaitTime <= preferences.maxWaitTime;
                });

            // Create optimized itinerary
            const itinerary: OptimizationRecommendation['recommendations']['itinerary'] = [];
            const visitDateTime = new Date(visitDate);
            let currentTime = new Date(visitDateTime.setHours(9, 0, 0, 0)); // Start at 9 AM

            // Sort by optimal visit time and preference
            const sortedAttractions = viableAttractions
                .map(({ attraction, prediction }) => {
                    if (!prediction) {
                        throw new Error(`No prediction available for attraction ${attraction.id}`);
                    }
                    return {
                        attraction,
                        prediction,
                        priority: preferences.preferredAttractions.includes(attraction.id) ? 10 : 5
                    };
                })
                .sort((a, b) => {
                    // Prioritize preferred attractions and lower wait times
                    const aPriority = a.priority + (100 - a.prediction.optimalVisitTime.expectedWaitTime);
                    const bPriority = b.priority + (100 - b.prediction.optimalVisitTime.expectedWaitTime);
                    return bPriority - aPriority;
                });

            let totalWaitTime = 0;
            let attractionsCompleted = 0;

            for (const { attraction, prediction, priority } of sortedAttractions) {
                if (currentTime.getHours() >= 22) break; // Park closes

                const optimalTime = new Date(prediction.optimalVisitTime.time);
                const visitTime = optimalTime > currentTime ? optimalTime : currentTime;

                // Find the predicted wait time for this visit time
                const closestPrediction = prediction.predictedWaitTimes.reduce((closest, current) => {
                    const currentDiff = Math.abs(new Date(current.time).getTime() - visitTime.getTime());
                    const closestDiff = Math.abs(new Date(closest.time).getTime() - visitTime.getTime());
                    return currentDiff < closestDiff ? current : closest;
                });

                const expectedWaitTime = closestPrediction.waitTime;
                const walkingTime = 5; // Simplified walking time

                itinerary.push({
                    time: visitTime.toISOString(),
                    attractionId: attraction.id,
                    attractionName: attraction.name,
                    expectedWaitTime,
                    walkingTime,
                    priority
                });

                totalWaitTime += expectedWaitTime;
                attractionsCompleted++;

                // Update current time (wait time + attraction duration + walking)
                currentTime = new Date(visitTime.getTime() + (expectedWaitTime + 15 + walkingTime) * 60 * 1000);
            }

            // Generate alternative options
            const alternativeOptions = attractionPredictions
                .filter(({ attraction }) => !itinerary.some(item => item.attractionId === attraction.id))
                .slice(0, 3)
                .map(({ attraction, prediction }) => ({
                    attractionId: attraction.id,
                    reason: prediction ? 'Consider if wait times improve' : 'Insufficient data for prediction',
                    suggestedTime: prediction?.optimalVisitTime.time || ''
                }));

            return {
                parkId,
                visitDate,
                preferences,
                recommendations: {
                    itinerary,
                    alternativeOptions,
                    crowdAvoidanceStrategy: preferences.avoidCrowds
                        ? 'Visit during early morning hours and avoid peak times (11 AM - 3 PM)'
                        : 'Standard touring plan with moderate crowd tolerance',
                    estimatedTotalWaitTime: totalWaitTime,
                    estimatedAttractionsCompleted: attractionsCompleted
                }
            };

        } catch (error) {
            console.error('Error generating optimization recommendations:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const waitTimeAnalyticsService = new WaitTimeAnalyticsService();

// Utility functions
export async function getPredictionsForAttraction(attractionId: string, hoursAhead = 24) {
    return await waitTimeAnalyticsService.getPredictions(attractionId, hoursAhead);
}

export async function analyzeParkCrowds(parkId: string) {
    return await waitTimeAnalyticsService.analyzeCrowds(parkId);
}

export async function detectWaitTimeAnomalies(attractionId: string) {
    return await waitTimeAnalyticsService.detectAnomalies(attractionId);
}

export async function getHistoricalTrends(attractionId: string, period: HistoricalTrend['period'] = 'daily') {
    return await waitTimeAnalyticsService.generateHistoricalTrends(attractionId, period);
}

export async function getOptimizedItinerary(
    parkId: string,
    visitDate: string,
    preferences: OptimizationRecommendation['preferences']
) {
    return await waitTimeAnalyticsService.generateOptimizationRecommendations(parkId, visitDate, preferences);
}