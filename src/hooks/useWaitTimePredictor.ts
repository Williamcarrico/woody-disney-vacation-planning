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
 * Custom hook for predicting wait times based on historical data
 *
 * Provides methods for:
 * - Predicting wait time at a specific future time
 * - Finding optimal time to visit an attraction
 * - Finding when wait time will drop below a threshold
 */
export function useWaitTimePredictor() {
    const predictor = useMemo(() => ({
        // Predict wait time based on historical data
        predict: (historicalData: HistoricalData, time: Date, currentWaitTime?: number): number | null => {
            if (!historicalData?.waitTimes?.length) return null;

            // Extract day of week and hour from the target time
            const targetDay = time.getDay();
            const targetHour = time.getHours();

            // Filter historical data for the same day of week and hour
            const relevantRawData = historicalData.waitTimes.filter((wt: WaitTimeDataPoint) => {
                const date = new Date(wt.timestamp);
                return date.getDay() === targetDay && date.getHours() === targetHour;
            });

            // Filter out null wait times
            const relevantData = relevantRawData.filter(
                (wt): wt is WaitTimeDataPoint & { waitTime: number } => wt.waitTime !== null
            );

            if (relevantData.length === 0) return null;

            // Calculate average wait time for the relevant data points
            const sum = relevantData.reduce((acc: number, curr: WaitTimeDataPoint & { waitTime: number }) => acc + curr.waitTime, 0);
            let prediction = Math.round(sum / relevantData.length);

            // Adjust prediction based on current wait time if available
            if (currentWaitTime !== undefined) {
                // Use a weighted average favoring current conditions
                prediction = Math.round(0.7 * currentWaitTime + 0.3 * prediction);
            }

            return prediction;
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
    }), []);

    return predictor;
}