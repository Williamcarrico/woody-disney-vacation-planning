import { useMemo } from 'react';

/**
 * Interface for a single wait time data point
 */
export interface WaitTimeDataPoint {
    timestamp: string | number | Date;
    waitTime: number | null;
}

/**
 * Interface for historical wait time data
 */
export interface HistoricalData {
    waitTimes?: WaitTimeDataPoint[];
}

/**
 * Prediction strategy interface for pluggable algorithms
 */
export interface PredictionStrategy {
    name: string;
    predict: (data: WaitTimeDataPoint[], targetTime: Date, currentWaitTime?: number) => number | null;
}

/**
 * Simple Moving Average (SMA) smoothing
 */
function simpleMovingAverage(data: number[], window: number): number[] {
    const smoothed: number[] = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - Math.floor(window / 2));
        const end = Math.min(data.length, i + Math.floor(window / 2) + 1);
        const subset = data.slice(start, end);
        const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
        smoothed.push(avg);
    }
    return smoothed;
}

/**
 * LOWESS (Locally Weighted Scatterplot Smoothing) implementation
 */
function lowessSmooth(data: number[], bandwidth = 0.3): number[] {
    const n = data.length;
    const smoothed: number[] = [];
    const windowSize = Math.max(3, Math.floor(n * bandwidth));
    
    for (let i = 0; i < n; i++) {
        const distances: Array<{ index: number; distance: number; value: number }> = [];
        
        // Calculate distances to all points
        for (let j = 0; j < n; j++) {
            distances.push({
                index: j,
                distance: Math.abs(i - j),
                value: data[j]
            });
        }
        
        // Sort by distance and take nearest neighbors
        distances.sort((a, b) => a.distance - b.distance);
        const neighbors = distances.slice(0, windowSize);
        
        // Apply tricubic weight function
        const maxDist = neighbors[neighbors.length - 1].distance;
        let weightedSum = 0;
        let weightSum = 0;
        
        for (const neighbor of neighbors) {
            const u = neighbor.distance / maxDist;
            const weight = Math.pow(1 - Math.pow(u, 3), 3); // Tricubic kernel
            weightedSum += weight * neighbor.value;
            weightSum += weight;
        }
        
        smoothed.push(weightSum > 0 ? weightedSum / weightSum : data[i]);
    }
    
    return smoothed;
}

/**
 * Holt-Winters exponential smoothing with seasonality
 */
function holtWinters(
    data: number[],
    alpha = 0.3,  // Level smoothing
    beta = 0.1,   // Trend smoothing
    gamma = 0.3,  // Seasonal smoothing
    seasonLength = 7  // Weekly seasonality
): number[] {
    if (data.length < seasonLength * 2) {
        return simpleMovingAverage(data, 3); // Fallback for insufficient data
    }
    
    const smoothed: number[] = [];
    
    // Initialize
    let level = data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
    let trend = (data.slice(seasonLength, seasonLength * 2).reduce((a, b) => a + b, 0) / seasonLength - level) / seasonLength;
    const seasonal: number[] = [];
    
    // Initialize seasonal components
    for (let i = 0; i < seasonLength; i++) {
        seasonal[i] = data[i] / level;
    }
    
    // Apply Holt-Winters
    for (let i = 0; i < data.length; i++) {
        const seasonIndex = i % seasonLength;
        const prevLevel = level;
        
        if (i >= seasonLength) {
            level = alpha * (data[i] / seasonal[seasonIndex]) + (1 - alpha) * (level + trend);
            trend = beta * (level - prevLevel) + (1 - beta) * trend;
            seasonal[seasonIndex] = gamma * (data[i] / level) + (1 - gamma) * seasonal[seasonIndex];
        }
        
        smoothed.push(level * seasonal[seasonIndex]);
    }
    
    return smoothed;
}

/**
 * Prediction strategies
 */
const predictionStrategies: Record<string, PredictionStrategy> = {
    naive: {
        name: 'Naive Average',
        predict: (data: WaitTimeDataPoint[], targetTime: Date, currentWaitTime?: number) => {
            const targetDay = targetTime.getDay();
            const targetHour = targetTime.getHours();
            
            const relevantData = data.filter(wt => {
                if (wt.waitTime === null) return false;
                const date = new Date(wt.timestamp);
                return date.getDay() === targetDay && date.getHours() === targetHour;
            });
            
            if (relevantData.length === 0) return null;
            
            const sum = relevantData.reduce((acc, curr) => acc + (curr.waitTime || 0), 0);
            let prediction = Math.round(sum / relevantData.length);
            
            if (currentWaitTime !== undefined) {
                prediction = Math.round(0.7 * currentWaitTime + 0.3 * prediction);
            }
            
            return prediction;
        }
    },
    
    lowess: {
        name: 'LOWESS Smoothing',
        predict: (data: WaitTimeDataPoint[], targetTime: Date, currentWaitTime?: number) => {
            // Sort data by timestamp
            const sortedData = [...data]
                .filter(d => d.waitTime !== null)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            if (sortedData.length < 10) {
                return predictionStrategies.naive.predict(data, targetTime, currentWaitTime);
            }
            
            // Group by hour of day across all days
            const hourlyData: Record<number, number[]> = {};
            sortedData.forEach(d => {
                const hour = new Date(d.timestamp).getHours();
                if (!hourlyData[hour]) hourlyData[hour] = [];
                hourlyData[hour].push(d.waitTime as number);
            });
            
            const targetHour = targetTime.getHours();
            const hourData = hourlyData[targetHour];
            
            if (!hourData || hourData.length < 3) {
                return predictionStrategies.naive.predict(data, targetTime, currentWaitTime);
            }
            
            // Apply LOWESS smoothing
            const smoothed = lowessSmooth(hourData);
            const prediction = smoothed[smoothed.length - 1];
            
            if (currentWaitTime !== undefined) {
                return Math.round(0.6 * currentWaitTime + 0.4 * prediction);
            }
            
            return Math.round(prediction);
        }
    },
    
    holtWinters: {
        name: 'Holt-Winters',
        predict: (data: WaitTimeDataPoint[], targetTime: Date, currentWaitTime?: number) => {
            // Create hourly time series
            const sortedData = [...data]
                .filter(d => d.waitTime !== null)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            if (sortedData.length < 48) { // Need at least 2 days of data
                return predictionStrategies.lowess.predict(data, targetTime, currentWaitTime);
            }
            
            // Create hourly averages
            const hourlyAverages: number[] = [];
            const hourMap = new Map<string, number[]>();
            
            sortedData.forEach(d => {
                const date = new Date(d.timestamp);
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
                if (!hourMap.has(key)) hourMap.set(key, []);
                hourMap.get(key)!.push(d.waitTime as number);
            });
            
            // Convert to ordered array
            const sortedKeys = Array.from(hourMap.keys()).sort();
            sortedKeys.forEach(key => {
                const values = hourMap.get(key)!;
                hourlyAverages.push(values.reduce((a, b) => a + b, 0) / values.length);
            });
            
            // Apply Holt-Winters
            const smoothed = holtWinters(hourlyAverages, 0.3, 0.1, 0.3, 24); // Daily seasonality
            
            // Extract prediction for target hour
            const targetHour = targetTime.getHours();
            const lastDayStart = Math.floor(smoothed.length / 24) * 24;
            const prediction = smoothed[lastDayStart + targetHour] || smoothed[smoothed.length - 1];
            
            if (currentWaitTime !== undefined) {
                return Math.round(0.5 * currentWaitTime + 0.5 * prediction);
            }
            
            return Math.round(prediction);
        }
    }
};

/**
 * Custom hook for predicting wait times based on historical data
 *
 * Provides methods for:
 * - Predicting wait time at a specific future time using various strategies
 * - Finding optimal time to visit an attraction
 * - Finding when wait time will drop below a threshold
 */
export function useWaitTimePredictor(strategy: keyof typeof predictionStrategies = 'holtWinters') {
    const predictor = useMemo(() => ({
        // Get available strategies
        getStrategies: () => Object.keys(predictionStrategies),
        
        // Get current strategy name
        getCurrentStrategy: () => predictionStrategies[strategy].name,
        
        // Predict wait time based on historical data
        predict: (historicalData: HistoricalData, time: Date, currentWaitTime?: number): number | null => {
            if (!historicalData?.waitTimes?.length) return null;
            
            const selectedStrategy = predictionStrategies[strategy] || predictionStrategies.naive;
            return selectedStrategy.predict(historicalData.waitTimes, time, currentWaitTime);
        },

        // Find optimal visit time within a range
        findOptimalTime: (
            attractionId: string,
            historicalData: HistoricalData,
            startTime: Date,
            endTime: Date
        ): Date | null => {
            if (!historicalData?.waitTimes?.length) return null;

            // Create an array of hourly time slots between start and end
            const timeSlots: Date[] = [];
            const currentSlot = new Date(startTime);

            while (currentSlot <= endTime) {
                timeSlots.push(new Date(currentSlot));
                currentSlot.setHours(currentSlot.getHours() + 1);
            }

            // Predict wait times for each time slot
            const predictions = timeSlots.map(slot => ({
                time: slot,
                waitTime: predictor.predict(historicalData, slot) || Number.MAX_SAFE_INTEGER,
            }));

            // Find time slot with minimum wait time
            const optimalSlot = predictions.reduce((min, current) => {
                return current.waitTime < min.waitTime ? current : min;
            }, predictions[0]);

            return optimalSlot.waitTime === Number.MAX_SAFE_INTEGER ? null : optimalSlot.time;
        },

        // Find when wait time will drop below a threshold
        findTimeForThreshold: (
            attractionId: string,
            historicalData: HistoricalData,
            threshold: number,
            currentWaitTime: number
        ): Date | null => {
            if (!historicalData?.waitTimes?.length) return null;

            // Start checking from the current hour
            const currentHour = new Date();
            currentHour.setMinutes(0, 0, 0);

            // Check each hour for the next 12 hours
            for (let i = 1; i <= 12; i++) {
                const checkTime = new Date(currentHour);
                checkTime.setHours(checkTime.getHours() + i);

                const predictedWaitTime = predictor.predict(historicalData, checkTime, currentWaitTime);

                if (predictedWaitTime !== null && predictedWaitTime <= threshold) {
                    return checkTime;
                }
            }

            return null; // Couldn't find a time below threshold in the next 12 hours
        }
    }), [strategy]);

    return predictor;
}