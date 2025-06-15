import { useQuery } from '@tanstack/react-query';
import { getAttractionHistoricalData } from '@/lib/api/themeParks-compat';
import type { HistoricalData, WaitTimeDataPoint } from './useWaitTimePredictor';

interface UseHistoricalWaitTimesParams {
    attractionIds: string[];
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}

interface UseHistoricalWaitTimesReturn {
    historicalData: Record<string, HistoricalData>;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<any>;
    getAttractionHistory: (attractionId: string) => HistoricalData | null;
    getAverageWaitTimeByHour: (attractionId: string, hour: number) => number | null;
    getPeakHours: (attractionId: string) => number[];
    getQuietHours: (attractionId: string) => number[];
}

/**
 * Custom hook for fetching and managing historical wait time data
 *
 * Features:
 * - Batch fetching of historical data for multiple attractions
 * - Statistical analysis helpers
 * - Peak and quiet hour identification
 */
export function useHistoricalWaitTimes({
    attractionIds,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate = new Date().toISOString().split('T')[0], // today
    enabled = true,
}: UseHistoricalWaitTimesParams): UseHistoricalWaitTimesReturn {
    // Fetch historical data for all attractions
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['historicalWaitTimes', attractionIds, startDate, endDate],
        queryFn: async () => {
            const historicalDataMap: Record<string, HistoricalData> = {};
            
            // Batch fetch with rate limiting
            const batchSize = 5;
            for (let i = 0; i < attractionIds.length; i += batchSize) {
                const batch = attractionIds.slice(i, i + batchSize);
                const batchPromises = batch.map(async (id) => {
                    try {
                        const waitTimesData = await getAttractionHistoricalData(id, startDate, endDate);
                        return { id, data: { waitTimes: waitTimesData } };
                    } catch (error) {
                        console.error(`Error fetching historical data for attraction ${id}:`, error);
                        return { id, data: { waitTimes: [] } };
                    }
                });
                
                const batchResults = await Promise.all(batchPromises);
                batchResults.forEach(result => {
                    historicalDataMap[result.id] = result.data;
                });
                
                // Add delay between batches to avoid rate limiting
                if (i + batchSize < attractionIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            return historicalDataMap;
        },
        enabled: enabled && attractionIds.length > 0,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (historical data doesn't change frequently)
        gcTime: 48 * 60 * 60 * 1000, // Keep in cache for 48 hours
    });

    const historicalData = data || {};

    // Helper function to get historical data for specific attraction
    const getAttractionHistory = (attractionId: string): HistoricalData | null => {
        return historicalData[attractionId] || null;
    };

    // Calculate average wait time for a specific hour across all days
    const getAverageWaitTimeByHour = (attractionId: string, hour: number): number | null => {
        const history = getAttractionHistory(attractionId);
        if (!history?.waitTimes?.length) return null;

        const hourData = history.waitTimes.filter(wt => {
            if (wt.waitTime === null) return false;
            const date = new Date(wt.timestamp);
            return date.getHours() === hour;
        });

        if (hourData.length === 0) return null;

        const sum = hourData.reduce((acc, curr) => acc + (curr.waitTime || 0), 0);
        return Math.round(sum / hourData.length);
    };

    // Identify peak hours (top 25% busiest hours)
    const getPeakHours = (attractionId: string): number[] => {
        const hourlyAverages: Array<{ hour: number; avg: number }> = [];
        
        for (let hour = 0; hour < 24; hour++) {
            const avg = getAverageWaitTimeByHour(attractionId, hour);
            if (avg !== null) {
                hourlyAverages.push({ hour, avg });
            }
        }

        if (hourlyAverages.length === 0) return [];

        // Sort by average wait time descending
        hourlyAverages.sort((a, b) => b.avg - a.avg);
        
        // Take top 25%
        const peakCount = Math.ceil(hourlyAverages.length * 0.25);
        return hourlyAverages.slice(0, peakCount).map(h => h.hour).sort((a, b) => a - b);
    };

    // Identify quiet hours (bottom 25% least busy hours)
    const getQuietHours = (attractionId: string): number[] => {
        const hourlyAverages: Array<{ hour: number; avg: number }> = [];
        
        for (let hour = 0; hour < 24; hour++) {
            const avg = getAverageWaitTimeByHour(attractionId, hour);
            if (avg !== null) {
                hourlyAverages.push({ hour, avg });
            }
        }

        if (hourlyAverages.length === 0) return [];

        // Sort by average wait time ascending
        hourlyAverages.sort((a, b) => a.avg - b.avg);
        
        // Take bottom 25%
        const quietCount = Math.ceil(hourlyAverages.length * 0.25);
        return hourlyAverages.slice(0, quietCount).map(h => h.hour).sort((a, b) => a - b);
    };

    return {
        historicalData,
        isLoading,
        isError,
        error,
        refetch,
        getAttractionHistory,
        getAverageWaitTimeByHour,
        getPeakHours,
        getQuietHours,
    };
} 