import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getParkLiveData } from '@/lib/api/themeParks-compat';
import type { LiveData } from '@/types/api';
import { useState, useMemo, useEffect } from 'react';

interface UseLiveWaitTimesParams {
    parkId: string;
    refreshInterval?: number; // in milliseconds
    autoRefresh?: boolean;
}

interface UseLiveWaitTimesReturn {
    liveWaitTimes: LiveData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<any>;
    lastUpdated: Date | null;
    operatingAttractions: Array<{
        id: string;
        name: string;
        status: string;
        waitTime: number;
        standbyWait: number;
        singleRiderWait?: number;
        virtualQueueWait?: number;
        lightningLaneWait?: number;
    }>;
    getAttractionWaitTime: (attractionId: string) => {
        name: string;
        status: string;
        waitTime: number;
        standbyWait: number;
        singleRiderWait?: number;
        virtualQueueWait?: number;
        lightningLaneWait?: number;
    } | null;
}

/**
 * Custom hook for fetching and managing live wait time data from ThemeParks.wiki API
 *
 * Features:
 * - Real-time wait time data with configurable refresh
 * - Sorted attractions by status (operating, down, closed)
 * - Helper functions for accessing attraction data
 */
export function useLiveWaitTimes({
    parkId,
    refreshInterval = 300000, // 5 minutes default
    autoRefresh = true,
}: UseLiveWaitTimesParams): UseLiveWaitTimesReturn {
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch live wait time data
    const {
        data: liveWaitTimes,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<LiveData, Error>({
        queryKey: ['liveWaitTimes', parkId],
        queryFn: () => getParkLiveData(parkId),
        refetchInterval: autoRefresh ? refreshInterval : false,
        staleTime: refreshInterval / 2, // Consider data stale at half the refresh interval
        gcTime: refreshInterval * 2, // Keep in cache for double the refresh interval
    });

    // Update lastUpdated when data changes
    useEffect(() => {
        if (liveWaitTimes) {
            setLastUpdated(new Date());
        }
    }, [liveWaitTimes]);

    // Helper function to get wait time for specific attraction
    const getAttractionWaitTime = useMemo(() => (attractionId: string) => {
        if (!liveWaitTimes?.attractions?.[attractionId]) return null;
        
        const attraction = liveWaitTimes.attractions[attractionId];
        return {
            name: attraction.name,
            status: attraction.status,
            waitTime: attraction.waitTime,
            standbyWait: attraction.standbyWait,
            singleRiderWait: attraction.singleRiderWait,
            virtualQueueWait: attraction.virtualQueueWait,
            lightningLaneWait: attraction.lightningLaneWait,
        };
    }, [liveWaitTimes]);

    // Get operating attractions sorted by wait time
    const operatingAttractions = useMemo(() => {
        if (!liveWaitTimes?.attractions) return [];
        
        return Object.entries(liveWaitTimes.attractions)
            .filter(([, attraction]) => attraction.status === 'OPERATING')
            .map(([id, attraction]) => ({
                id,
                name: attraction.name,
                status: attraction.status,
                waitTime: attraction.waitTime,
                standbyWait: attraction.standbyWait,
                singleRiderWait: attraction.singleRiderWait,
                virtualQueueWait: attraction.virtualQueueWait,
                lightningLaneWait: attraction.lightningLaneWait,
            }))
            .sort((a, b) => a.standbyWait - b.standbyWait);
    }, [liveWaitTimes]);

    return {
        liveWaitTimes,
        isLoading,
        isError,
        error,
        refetch,
        lastUpdated,
        operatingAttractions,
        getAttractionWaitTime,
    };
} 