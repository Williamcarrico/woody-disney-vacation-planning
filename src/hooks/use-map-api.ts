'use client';

import { useState, useCallback, useEffect } from 'react';
import { GeofenceData, GroupMember } from '@/components/maps/interactive-map';
import {
    createGeofence,
    getGeofences,
    getGeofencesSync,
    removeGeofence,
    updateUserLocation,
    getGroupMembers,
    getGroupMembersSync,
    getAttractionWaitTimes,
    handleGeofenceEntry,
    handleGeofenceExit,
    handleGroupSeparationAlert,
    calculateDistance
} from '@/lib/services/map-service';

interface UseMapApiOptions {
    vacationId?: string;
    userId?: string;
    userName?: string;
    avatarUrl?: string;
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface MapApiState {
    geofences: GeofenceData[];
    groupMembers: GroupMember[];
    waitTimes: Record<string, { waitTime: number; status: string }>;
    isLoading: boolean;
    error: string | null;
}

interface CreateGeofenceOptions {
    description?: string;
    settings?: {
        notifyOnEntry?: boolean;
        notifyOnExit?: boolean;
        cooldownMinutes?: number;
        maxAlerts?: number;
        triggerDistance?: number;
        requiresMovement?: boolean;
        parkArea?: string;
        attraction?: string;
        customMessage?: string;
        soundAlert?: boolean;
        vibrationAlert?: boolean;
        priority?: 'low' | 'medium' | 'high' | 'urgent';
    };
    direction?: number;
    directionRange?: number;
    minAltitude?: number;
    maxAltitude?: number;
    activeStartTime?: string;
    activeEndTime?: string;
}

/**
 * Comprehensive hook for map-related API operations
 * Provides a clean interface for geofencing, location sharing, and wait times
 */
export function useMapApi(options: UseMapApiOptions = {}) {
    const {
        vacationId,
        userId,
        userName,
        avatarUrl,
        autoRefresh = false,
        refreshInterval = 30000 // 30 seconds default
    } = options;

    const [state, setState] = useState<MapApiState>({
        geofences: [],
        groupMembers: [],
        waitTimes: {},
        isLoading: false,
        error: null
    });

    const [refreshTimers, setRefreshTimers] = useState<{
        geofences?: NodeJS.Timeout;
        groupMembers?: NodeJS.Timeout;
        waitTimes?: NodeJS.Timeout;
    }>({});

    // Error handling utility
    const handleError = useCallback((error: unknown, operation: string) => {
        const errorMessage = error instanceof Error ? error.message : `Unknown error in ${operation}`;
        console.error(`Map API Error (${operation}):`, error);
        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        return errorMessage;
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // Create geofence
    const createGeofenceAction = useCallback(async (
        name: string,
        lat: number,
        lng: number,
        radius: number,
        type: 'attraction' | 'meeting' | 'custom',
        createOptions?: CreateGeofenceOptions
    ): Promise<GeofenceData | null> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const geofence = await createGeofence(
                name,
                lat,
                lng,
                radius,
                type,
                vacationId,
                createOptions
            );

            // Update local state
            setState(prev => ({
                ...prev,
                geofences: [...prev.geofences, geofence],
                isLoading: false
            }));

            return geofence;
        } catch (error) {
            handleError(error, 'createGeofence');
            return null;
        }
    }, [vacationId, handleError]);

    // Remove geofence
    const removeGeofenceAction = useCallback(async (geofenceId: string): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const success = removeGeofence(geofenceId, vacationId);

            if (success) {
                setState(prev => ({
                    ...prev,
                    geofences: prev.geofences.filter(g => g.id !== geofenceId),
                    isLoading: false
                }));
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }

            return success;
        } catch (error) {
            handleError(error, 'removeGeofence');
            return false;
        }
    }, [vacationId, handleError]);

    // Update user location
    const updateLocationAction = useCallback(async (
        lat: number,
        lng: number
    ): Promise<boolean> => {
        if (!userId || !userName) {
            handleError(new Error('User ID and name are required for location updates'), 'updateLocation');
            return false;
        }

        try {
            const success = await updateUserLocation(lat, lng, {
                vacationId,
                userId,
                userName,
                avatarUrl
            });

            if (success) {
                // Update local group members state
                const updatedMember: GroupMember = {
                    id: userId,
                    name: userName,
                    avatar: avatarUrl,
                    lat,
                    lng,
                    lastUpdated: new Date()
                };

                setState(prev => ({
                    ...prev,
                    groupMembers: [
                        ...prev.groupMembers.filter(m => m.id !== userId),
                        updatedMember
                    ]
                }));
            }

            return success;
        } catch (error) {
            handleError(error, 'updateLocation');
            return false;
        }
    }, [userId, userName, avatarUrl, vacationId, handleError]);

    // Refresh geofences
    const refreshGeofences = useCallback(async (): Promise<void> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const geofences = await getGeofences(vacationId);

            setState(prev => ({
                ...prev,
                geofences,
                isLoading: false
            }));
        } catch (error) {
            handleError(error, 'refreshGeofences');
        }
    }, [vacationId, handleError]);

    // Refresh group members
    const refreshGroupMembers = useCallback(async (): Promise<void> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const groupMembers = await getGroupMembers(vacationId);

            setState(prev => ({
                ...prev,
                groupMembers,
                isLoading: false
            }));
        } catch (error) {
            handleError(error, 'refreshGroupMembers');
        }
    }, [vacationId, handleError]);

    // Refresh wait times
    const refreshWaitTimes = useCallback(async (parkId: string): Promise<void> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const waitTimes = await getAttractionWaitTimes(parkId);

            setState(prev => ({
                ...prev,
                waitTimes,
                isLoading: false
            }));
        } catch (error) {
            handleError(error, 'refreshWaitTimes');
        }
    }, [handleError]);

    // Get current user location
    const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(new Error(`Geolocation error: ${error.message}`));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000 // 1 minute
                }
            );
        });
    }, []);

    // Check geofence proximity
    const checkGeofenceProximity = useCallback((
        userLat: number,
        userLng: number,
        geofence: GeofenceData
    ): { isInside: boolean; distance: number } => {
        const distance = calculateDistance(userLat, userLng, geofence.lat, geofence.lng);
        const isInside = distance <= geofence.radius;

        return { isInside, distance };
    }, []);

    // Handle geofence events
    const handleGeofenceEvents = useCallback((
        userLat: number,
        userLng: number,
        previousGeofenceStates: Record<string, boolean> = {}
    ): void => {
        state.geofences.forEach(geofence => {
            const { isInside } = checkGeofenceProximity(userLat, userLng, geofence);
            const wasInside = previousGeofenceStates[geofence.id] || false;

            if (isInside && !wasInside) {
                handleGeofenceEntry(geofence);
            } else if (!isInside && wasInside) {
                handleGeofenceExit(geofence);
            }
        });
    }, [state.geofences, checkGeofenceProximity]);

    // Check group separation
    const checkGroupSeparation = useCallback((
        userLat: number,
        userLng: number,
        maxDistance: number = 200
    ): void => {
        state.groupMembers.forEach(member => {
            if (member.id !== userId) {
                const distance = calculateDistance(userLat, userLng, member.lat, member.lng);
                if (distance > maxDistance) {
                    handleGroupSeparationAlert(member.id, distance);
                }
            }
        });
    }, [state.groupMembers, userId]);

    // Initialize data on mount
    useEffect(() => {
        const initializeData = async () => {
            try {
                setState(prev => ({ ...prev, isLoading: true }));

                // Load initial data from localStorage for immediate display
                const initialGeofences = getGeofencesSync(vacationId);
                const initialGroupMembers = getGroupMembersSync(vacationId);

                setState(prev => ({
                    ...prev,
                    geofences: initialGeofences,
                    groupMembers: initialGroupMembers,
                    isLoading: false
                }));

                // Then refresh from API
                if (vacationId) {
                    await Promise.all([
                        refreshGeofences(),
                        refreshGroupMembers()
                    ]);
                }
            } catch (error) {
                handleError(error, 'initialization');
            }
        };

        initializeData();
    }, [vacationId, refreshGeofences, refreshGroupMembers, handleError]);

    // Setup auto-refresh timers
    useEffect(() => {
        if (!autoRefresh) return;

        const timers: typeof refreshTimers = {};

        if (vacationId) {
            timers.geofences = setInterval(refreshGeofences, refreshInterval);
            timers.groupMembers = setInterval(refreshGroupMembers, refreshInterval);
        }

        setRefreshTimers(timers);

        return () => {
            Object.values(timers).forEach(timer => {
                if (timer) clearInterval(timer);
            });
        };
    }, [autoRefresh, refreshInterval, vacationId, refreshGeofences, refreshGroupMembers]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(refreshTimers).forEach(timer => {
                if (timer) clearInterval(timer);
            });
        };
    }, [refreshTimers]);

    return {
        // State
        ...state,

        // Actions
        createGeofence: createGeofenceAction,
        removeGeofence: removeGeofenceAction,
        updateLocation: updateLocationAction,
        refreshGeofences,
        refreshGroupMembers,
        refreshWaitTimes,
        getCurrentLocation,
        clearError,

        // Utilities
        checkGeofenceProximity,
        handleGeofenceEvents,
        checkGroupSeparation,
        calculateDistance,

        // Configuration
        isAutoRefreshEnabled: autoRefresh,
        refreshInterval
    };
}