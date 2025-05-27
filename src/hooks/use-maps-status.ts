'use client';

import { useContext, createContext, useEffect, useState } from 'react';

interface MapsStatusContextType {
    isAvailable: boolean;
    isLoading: boolean;
    error: string | null;
}

export const MapsStatusContext = createContext<MapsStatusContextType>({
    isAvailable: false,
    isLoading: true,
    error: null,
});

/**
 * Hook to check if Google Maps is available in the current context
 * Useful for conditionally rendering map-dependent features
 */
export function useMapsStatus(): MapsStatusContextType {
    const context = useContext(MapsStatusContext);
    const [status, setStatus] = useState<MapsStatusContextType>(context);

    useEffect(() => {
        let isStillLoading = true;

        // Check if Google Maps API is available
        const checkMapsAvailability = () => {
            try {
                // Check if google maps is loaded
                if (typeof window !== 'undefined' && window.google?.maps) {
                    setStatus({
                        isAvailable: true,
                        isLoading: false,
                        error: null,
                    });
                    isStillLoading = false;
                    return;
                }

                // Check if APIProvider exists (from @vis.gl/react-google-maps)
                const apiProviderExists = document.querySelector('[data-google-maps-api]');
                if (apiProviderExists) {
                    setStatus({
                        isAvailable: true,
                        isLoading: false,
                        error: null,
                    });
                    isStillLoading = false;
                    return;
                }

                // If we reach here, maps are likely not available
                setStatus({
                    isAvailable: false,
                    isLoading: false,
                    error: 'Google Maps API not available',
                });
                isStillLoading = false;
            } catch (error) {
                setStatus({
                    isAvailable: false,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                isStillLoading = false;
            }
        };

        // Initial check
        checkMapsAvailability();

        // Set up a timer to check periodically (useful for async loading)
        const intervalId = setInterval(checkMapsAvailability, 1000);

        // Stop checking after 10 seconds
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            if (isStillLoading) {
                setStatus(prev => ({
                    ...prev,
                    isLoading: false,
                    isAvailable: false,
                    error: 'Maps loading timeout',
                }));
            }
        }, 10000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, []);

    return status;
}

/**
 * Simple hook that returns just the availability status
 * Useful when you only need to know if maps are available
 */
export function useIsMapsAvailable(): boolean {
    const { isAvailable } = useMapsStatus();
    return isAvailable;
}