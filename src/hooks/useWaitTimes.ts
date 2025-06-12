import { useQuery } from '@tanstack/react-query';
import { getParkLiveData, getAttractionHistoricalData } from '@/lib/api/themeParks-compat';
import type { LiveData } from '@/types/api';
import { useState, useMemo, useEffect } from 'react';
import { useWaitTimePredictor, type HistoricalData, type WaitTimeDataPoint } from './useWaitTimePredictor';

// Interfaces for hook parameters and returns
interface UseWaitTimesParams {
    parkId: string;
    refreshInterval?: number; // in milliseconds
    includeHistorical?: boolean;
    startDate?: string;
    endDate?: string;
    autoRefresh?: boolean;
}

interface UseWaitTimesReturn {
    liveWaitTimes: LiveData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    refreshData: () => Promise<void>;
    sortedAttractions: {
        operating: Array<{ id: string; name: string; waitTime: number }>;
        down: Array<{ id: string; name: string }>;
        closed: Array<{ id: string; name: string }>;
    };
    predictWaitTime: (attractionId: string, time: Date) => number | null;
    getOptimalVisitTime: (attractionId: string, startTime: Date, endTime: Date) => Date | null;
    getThresholdTime: (attractionId: string, threshold: number) => Date | null;
    waitTimeAverages: Record<string, number>;
    waitTimeTrend: 'increasing' | 'decreasing' | 'stable' | null;
}

/**
 * Custom hook for fetching and managing wait time data from ThemeParks.wiki API
 *
 * Features:
 * - Real-time wait time data with configurable refresh
 * - Sorted attractions by status (operating, down, closed)
 * - Historical data analysis for trends and predictions
 * - Wait time prediction for future planning
 * - Optimal visit time calculation
 * - Threshold time calculation (when wait times drop below a threshold)
 */
export function useWaitTimes({
    parkId,
    refreshInterval = 300000, // 5 minutes default
    includeHistorical = false,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate = new Date().toISOString().split('T')[0], // today
    autoRefresh = true,
}: UseWaitTimesParams): UseWaitTimesReturn {
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const waitTimePredictor = useWaitTimePredictor();

    // Fetch live wait time data
    const {
        data: liveWaitTimes,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<LiveData, Error>({ // Explicitly type the query data and error
        queryKey: ['liveWaitTimes', parkId],
        queryFn: () => getParkLiveData(parkId),
        refetchInterval: autoRefresh ? refreshInterval : false,
        // onSuccess callback removed here
    });

    // Update lastUpdated when data changes
    useEffect(() => {
        if (liveWaitTimes) {
            setLastUpdated(new Date());
        }
    }, [liveWaitTimes]);

    // Organize attractions by status
    const sortedAttractions = useMemo(() => {
        const result = {
            operating: [] as Array<{ id: string; name: string; waitTime: number }>,
            down: [] as Array<{ id: string; name: string }>,
            closed: [] as Array<{ id: string; name: string }>,
        };

        if (liveWaitTimes?.attractions) {
            Object.entries(liveWaitTimes.attractions).forEach(([id, attraction]) => {
                if (attraction.status === 'OPERATING' && attraction.waitTime) {
                    result.operating.push({
                        id,
                        name: attraction.name,
                        waitTime: attraction.waitTime.standby,
                    });
                } else if (attraction.status === 'DOWN') {
                    result.down.push({
                        id,
                        name: attraction.name,
                    });
                } else {
                    result.closed.push({
                        id,
                        name: attraction.name,
                    });
                }
            });

            // Sort operating attractions by wait time (descending)
            result.operating.sort((a, b) => b.waitTime - a.waitTime);
        }

        return result;
    }, [liveWaitTimes]);

    // Fetch historical data if requested
    const { data: historicalData } = useQuery({
        queryKey: ['historicalWaitTimes', parkId, startDate, endDate],
        queryFn: async () => {
            // We need to fetch historical data for each attraction
            if (!liveWaitTimes?.attractions) return {};

            const historicalDataMap: Record<string, HistoricalData> = {};

            // Only fetch for operating attractions to limit API calls
            const attractionIds = Object.keys(liveWaitTimes.attractions).filter(
                id => liveWaitTimes.attractions[id].status === 'OPERATING'
            );

            // Fetch in sequence to avoid overwhelming the API
            for (const id of attractionIds) {
                try {
                    // Assume getAttractionHistoricalData returns WaitTimeDataPoint[]
                    const waitTimesData = await getAttractionHistoricalData(id, startDate, endDate);
                    // Wrap the array in the HistoricalData structure
                    historicalDataMap[id] = { waitTimes: waitTimesData };
                } catch (error) {
                    console.error(`Error fetching historical data for attraction ${id}:`, error);
                    // Optionally assign an empty structure on error
                    historicalDataMap[id] = { waitTimes: [] };
                }
            }

            return historicalDataMap;
        },
        enabled: includeHistorical && !!liveWaitTimes,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (historical data doesn't change frequently)
    });

    // Calculate wait time averages
    const waitTimeAverages = useMemo(() => {
        const averages: Record<string, number> = {};

        if (historicalData) {
            Object.entries(historicalData).forEach(([id, data]) => {
                if (data?.waitTimes?.length) {
                    // Filter out null wait times before reducing
                    const validWaitTimes = data.waitTimes.filter(wt => wt.waitTime !== null) as Array<WaitTimeDataPoint & { waitTime: number }>;
                    if (validWaitTimes.length > 0) {
                        const sum = validWaitTimes.reduce(
                            (acc: number, current: WaitTimeDataPoint & { waitTime: number }) => acc + current.waitTime,
                            0
                        );
                        averages[id] = Math.round(sum / validWaitTimes.length);
                    }
                }
            });
        }

        return averages;
    }, [historicalData]);

    // Calculate wait time trend (overall)
    const waitTimeTrend = useMemo(() => {
        if (!liveWaitTimes || !historicalData) return null;

        const operatingAttractions = Object.entries(liveWaitTimes.attractions)
            .filter(([, attr]) => attr.status === 'OPERATING'); // Changed [_ , attr] to [, attr]

        if (operatingAttractions.length === 0) return null;

        let increasingCount = 0;
        let decreasingCount = 0;

        operatingAttractions.forEach(([id, attr]) => {
            if (!attr.waitTime || !historicalData[id]?.waitTimes?.length) return;

            // Compare current wait time with average of last hour
            const currentWaitTime = attr.waitTime.standby;

            // Get recent historical data (last hour if available), filtering nulls
            const recentData = (historicalData[id].waitTimes ?? [])
                .slice(-12) // Last 12 samples (assuming 5-minute intervals)
                .map((wt: WaitTimeDataPoint) => wt.waitTime)
                .filter((time): time is number => time !== null); // Filter out null wait times

            if (recentData.length > 0) {
                const recentAverage = recentData.reduce((a: number, b: number) => a + b, 0) / recentData.length;

                if (currentWaitTime > recentAverage * 1.1) { // 10% higher than recent average
                    increasingCount++;
                } else if (currentWaitTime < recentAverage * 0.9) { // 10% lower than recent average
                    decreasingCount++;
                }
            }
        });

        if (increasingCount > decreasingCount && increasingCount > operatingAttractions.length / 3) {
            return 'increasing';
        } else if (decreasingCount > increasingCount && decreasingCount > operatingAttractions.length / 3) {
            return 'decreasing';
        } else {
            return 'stable';
        }
    }, [liveWaitTimes, historicalData]);

    // Manual refresh function
    const refreshData = async () => {
        await refetch();
    };

    // Predict wait time for a specific attraction at a future time
    const predictWaitTime = (attractionId: string, time: Date): number | null => {
        if (!historicalData?.[attractionId]) return null;

        return waitTimePredictor.predict(
            historicalData[attractionId],
            time,
            liveWaitTimes?.attractions[attractionId]?.waitTime?.standby
        );
    };

    // Calculate optimal visit time within a time range
    const getOptimalVisitTime = (attractionId: string, startTime: Date, endTime: Date): Date | null => {
        if (!historicalData?.[attractionId]) return null;

        return waitTimePredictor.findOptimalTime(
            attractionId,
            historicalData[attractionId],
            startTime,
            endTime
        );
    };

    // Calculate when wait time will drop below a threshold
    const getThresholdTime = (attractionId: string, threshold: number): Date | null => {
        if (!liveWaitTimes?.attractions[attractionId]?.waitTime) return null;

        const currentWaitTime = liveWaitTimes.attractions[attractionId].waitTime.standby;

        // If already below threshold, return current time
        if (currentWaitTime <= threshold) {
            return new Date();
        }

        // If we have historical data, use it to predict
        if (historicalData?.[attractionId]) {
            return waitTimePredictor.findTimeForThreshold(
                attractionId,
                historicalData[attractionId],
                threshold,
                liveWaitTimes.attractions[attractionId].waitTime.standby
            );
        }

        return null;
    };

    return {
        liveWaitTimes,
        isLoading,
        isError,
        error: error,
        lastUpdated,
        refreshData,
        sortedAttractions,
        predictWaitTime,
        getOptimalVisitTime,
        getThresholdTime,
        waitTimeAverages,
        waitTimeTrend,
    };
}