import { useLiveWaitTimes } from './useLiveWaitTimes';
import { useHistoricalWaitTimes } from './useHistoricalWaitTimes';
import { useWaitTimePredictor } from './useWaitTimePredictor';
import { useMemo } from 'react';

// Interfaces for hook parameters and returns
interface UseWaitTimesParams {
    parkId: string;
    refreshInterval?: number; // in milliseconds
    includeHistorical?: boolean;
    startDate?: string;
    endDate?: string;
    autoRefresh?: boolean;
    predictionStrategy?: 'naive' | 'lowess' | 'holtWinters';
}

interface UseWaitTimesReturn {
    // Live data
    liveWaitTimes: ReturnType<typeof useLiveWaitTimes>['liveWaitTimes'];
    isLoadingLive: boolean;
    isErrorLive: boolean;
    errorLive: Error | null;
    refetchLive: () => Promise<any>;
    lastUpdated: Date | null;
    operatingAttractions: ReturnType<typeof useLiveWaitTimes>['operatingAttractions'];
    getAttractionWaitTime: ReturnType<typeof useLiveWaitTimes>['getAttractionWaitTime'];
    
    // Historical data
    historicalData: ReturnType<typeof useHistoricalWaitTimes>['historicalData'];
    isLoadingHistorical: boolean;
    isErrorHistorical: boolean;
    errorHistorical: Error | null;
    refetchHistorical: () => Promise<any>;
    getAttractionHistory: ReturnType<typeof useHistoricalWaitTimes>['getAttractionHistory'];
    getAverageWaitTimeByHour: ReturnType<typeof useHistoricalWaitTimes>['getAverageWaitTimeByHour'];
    getPeakHours: ReturnType<typeof useHistoricalWaitTimes>['getPeakHours'];
    getQuietHours: ReturnType<typeof useHistoricalWaitTimes>['getQuietHours'];
    
    // Predictions
    predictWaitTime: (attractionId: string, time: Date) => number | null;
    findOptimalVisitTime: (attractionId: string, startTime: Date, endTime: Date) => Date | null;
    findTimeForThreshold: (attractionId: string, threshold: number) => Date | null;
    
    // Combined states
    isLoading: boolean;
    isError: boolean;
}

/**
 * Composite hook that combines live and historical wait time data
 * 
 * This hook composes:
 * - useLiveWaitTimes for real-time data
 * - useHistoricalWaitTimes for historical analysis
 * - useWaitTimePredictor for predictions
 */
export function useWaitTimes({
    parkId,
    refreshInterval = 300000, // 5 minutes default
    includeHistorical = false,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate = new Date().toISOString().split('T')[0], // today
    autoRefresh = true,
    predictionStrategy = 'holtWinters',
}: UseWaitTimesParams): UseWaitTimesReturn {
    // Fetch live wait times
    const {
        liveWaitTimes,
        isLoading: isLoadingLive,
        isError: isErrorLive,
        error: errorLive,
        refetch: refetchLive,
        lastUpdated,
        operatingAttractions,
        getAttractionWaitTime,
    } = useLiveWaitTimes({
        parkId,
        refreshInterval,
        autoRefresh,
    });

    // Get attraction IDs for historical data
    const attractionIds = useMemo(() => {
        if (!liveWaitTimes?.attractions) return [];
        return Object.keys(liveWaitTimes.attractions).filter(
            id => liveWaitTimes.attractions[id].status === 'OPERATING'
        );
    }, [liveWaitTimes]);

    // Fetch historical wait times if requested
    const {
        historicalData,
        isLoading: isLoadingHistorical,
        isError: isErrorHistorical,
        error: errorHistorical,
        refetch: refetchHistorical,
        getAttractionHistory,
        getAverageWaitTimeByHour,
        getPeakHours,
        getQuietHours,
    } = useHistoricalWaitTimes({
        attractionIds,
        startDate,
        endDate,
        enabled: includeHistorical && attractionIds.length > 0,
    });

    // Initialize predictor
    const predictor = useWaitTimePredictor(predictionStrategy);

    // Prediction functions
    const predictWaitTime = useMemo(() => (attractionId: string, time: Date): number | null => {
        const history = getAttractionHistory(attractionId);
        if (!history) return null;
        
        const currentWaitTime = getAttractionWaitTime(attractionId)?.standbyWait;
        return predictor.predict(history, time, currentWaitTime);
    }, [predictor, getAttractionHistory, getAttractionWaitTime]);

    const findOptimalVisitTime = useMemo(() => (
        attractionId: string,
        startTime: Date,
        endTime: Date
    ): Date | null => {
        const history = getAttractionHistory(attractionId);
        if (!history) return null;
        
        return predictor.findOptimalTime(attractionId, history, startTime, endTime);
    }, [predictor, getAttractionHistory]);

    const findTimeForThreshold = useMemo(() => (
        attractionId: string,
        threshold: number
    ): Date | null => {
        const history = getAttractionHistory(attractionId);
        if (!history) return null;
        
        const currentWaitTime = getAttractionWaitTime(attractionId)?.standbyWait || 0;
        return predictor.findTimeForThreshold(attractionId, history, threshold, currentWaitTime);
    }, [predictor, getAttractionHistory, getAttractionWaitTime]);

    // Combined loading/error states
    const isLoading = isLoadingLive || (includeHistorical && isLoadingHistorical);
    const isError = isErrorLive || isErrorHistorical;

    return {
        // Live data
        liveWaitTimes,
        isLoadingLive,
        isErrorLive,
        errorLive,
        refetchLive,
        lastUpdated,
        operatingAttractions,
        getAttractionWaitTime,
        
        // Historical data
        historicalData,
        isLoadingHistorical,
        isErrorHistorical,
        errorHistorical,
        refetchHistorical,
        getAttractionHistory,
        getAverageWaitTimeByHour,
        getPeakHours,
        getQuietHours,
        
        // Predictions
        predictWaitTime,
        findOptimalVisitTime,
        findTimeForThreshold,
        
        // Combined states
        isLoading,
        isError,
    };
}