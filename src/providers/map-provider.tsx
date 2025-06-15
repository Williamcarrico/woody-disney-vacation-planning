'use client';

import { ReactNode, useState, useCallback, useMemo, useEffect, memo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MapErrorBoundary } from '@/components/maps/MapErrorBoundary';
import { MapLoading, MapErrorState } from '@/components/maps/MapLoadingStates';

interface MapProviderProps {
    readonly children: ReactNode;
    readonly apiKey?: string;
    readonly libraries?: ('places' | 'geometry' | 'drawing' | 'visualization' | 'localContext')[];
    readonly region?: string;
    readonly language?: string;
    readonly onLoadSuccess?: () => void;
    readonly onLoadError?: (error: Error) => void;
    readonly fallbackComponent?: ReactNode;
    readonly loadingComponent?: ReactNode;
    readonly retryAttempts?: number;
    readonly retryDelay?: number;
    readonly timeout?: number;
    readonly showUserNotification?: boolean;
    readonly notificationDuration?: number;
}

interface MapLoadingState {
    isLoading: boolean;
    isLoaded: boolean;
    error: Error | null;
    retryCount: number;
    timedOut: boolean;
    showNotification: boolean;
}

// User notification component for when maps are unavailable
function MapUnavailableNotification({
    onDismiss,
    message = "Maps temporarily unavailable"
}: {
    onDismiss: () => void;
    message?: string;
}) {
    return (
        <div className="fixed top-4 right-4 z-50 bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-lg max-w-sm">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-800">{message}</p>
                    <p className="mt-1 text-xs text-amber-700">The app will continue to work without map features.</p>
                </div>
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 ml-1 -mr-1 text-amber-500 hover:text-amber-700"
                    aria-label="Dismiss notification"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/**
 * Enhanced MapProvider component that initializes the Google Maps API
 * Provides comprehensive error handling, loading states, and retry logic
 * Optimized for performance and user experience
 */
function MapProviderComponent(props: Readonly<MapProviderProps>) {
    const {
        children,
        apiKey,
        libraries = ['places', 'geometry', 'drawing'],
        region,
        language,
        onLoadSuccess,
        onLoadError,
        fallbackComponent,
        loadingComponent,
        retryAttempts = 3,
        retryDelay = 2000,
        timeout = 10000,
        showUserNotification = false,
        notificationDuration = 5000,
    } = props;

    const [loadingState, setLoadingState] = useState<MapLoadingState>({
        isLoading: true,
        isLoaded: false,
        error: null,
        retryCount: 0,
        timedOut: false,
        showNotification: false,
    });

    // Get API key from props or environment with validation
    const finalApiKey = useMemo(() => {
        const key = apiKey || process.env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'];
        if (!key) {
            console.warn('Google Maps API key is missing. Falling back to no-maps mode.');
        }
        return key || '';
    }, [apiKey]);

    // Validate API key format
    const isValidApiKey = useMemo(() => {
        return finalApiKey.length > 0 && finalApiKey.startsWith('AIza');
    }, [finalApiKey]);

    // Handle notification dismissal
    const handleNotificationDismiss = useCallback(() => {
        setLoadingState(prev => ({ ...prev, showNotification: false }));
    }, []);

    // Auto-dismiss notification after duration
    useEffect(() => {
        if (loadingState.showNotification && notificationDuration > 0) {
            const timer = setTimeout(() => {
                setLoadingState(prev => ({ ...prev, showNotification: false }));
            }, notificationDuration);
            return () => clearTimeout(timer);
        }
    }, [loadingState.showNotification, notificationDuration]);

    // Add timeout mechanism
    useEffect(() => {
        if (!loadingState.isLoading) return;

        const timeoutId = setTimeout(() => {
            setLoadingState(prev => ({
                ...prev,
                isLoading: false,
                timedOut: true,
                error: new Error('Google Maps API load timeout'),
                showNotification: showUserNotification,
            }));
        }, timeout);

        return () => clearTimeout(timeoutId);
    }, [loadingState.isLoading, timeout, showUserNotification]);

    // Handle successful API load
    const handleLoadSuccess = useCallback(() => {
        console.log('Google Maps API loaded successfully');
        setLoadingState(prev => ({
            ...prev,
            isLoading: false,
            isLoaded: true,
            error: null,
            timedOut: false,
            showNotification: false,
        }));
        onLoadSuccess?.();
    }, [onLoadSuccess]);

    // Handle API load error with retry logic
    const handleLoadError = useCallback((error: unknown) => {
        // Convert unknown error to Error object for consistent handling
        const errorObj = error instanceof Error ? error : new Error(String(error));
        console.error('Google Maps API error:', errorObj);

        setLoadingState(prev => {
            const newRetryCount = prev.retryCount + 1;
            const shouldRetry = newRetryCount < retryAttempts;

            if (shouldRetry) {
                console.log(`Retrying Google Maps API load (attempt ${newRetryCount + 1}/${retryAttempts})`);

                // Retry after delay
                setTimeout(() => {
                    setLoadingState(current => ({
                        ...current,
                        isLoading: true,
                        error: null,
                        timedOut: false,
                        showNotification: false,
                    }));
                }, retryDelay);
            }

            return {
                ...prev,
                isLoading: shouldRetry,
                isLoaded: false,
                error: shouldRetry ? null : errorObj,
                retryCount: newRetryCount,
                timedOut: false,
                showNotification: !shouldRetry && showUserNotification,
            };
        });

        onLoadError?.(errorObj);
    }, [onLoadError, retryAttempts, retryDelay, showUserNotification]);

    // API Provider configuration
    const apiProviderConfig = useMemo(() => {
        const config: any = {
            apiKey: finalApiKey,
            libraries,
            onLoad: handleLoadSuccess,
            onError: handleLoadError,
        };
        
        if (region) config.region = region;
        if (language) config.language = language;
        
        if (process.env['NODE_ENV'] === 'development') {
            config.version = 'beta'; // Use beta version in development for latest features
        }
        
        return config;
    }, [finalApiKey, libraries, region, language, handleLoadSuccess, handleLoadError]);

    // Reset loading state when API key changes
    useEffect(() => {
        if (finalApiKey) {
            setLoadingState({
                isLoading: true,
                isLoaded: false,
                error: null,
                retryCount: 0,
                timedOut: false,
                showNotification: false,
            });
        }
    }, [finalApiKey]);

    // Early return for missing or invalid API key - render children without maps
    if (!finalApiKey || !isValidApiKey) {
        console.warn('Google Maps API key missing or invalid. Rendering app without maps functionality.');
        return (
            <>
                {showUserNotification && (
                    <MapUnavailableNotification
                        onDismiss={handleNotificationDismiss}
                        message="Maps configuration incomplete"
                    />
                )}
                {children}
            </>
        );
    }

    // Render loading state with timeout fallback
    if (loadingState.isLoading && !loadingState.isLoaded && !loadingState.timedOut) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }

        return (
            <MapLoading 
                message="Loading Google Maps..."
                showProgress={loadingState.retryCount > 0}
                progress={(loadingState.retryCount / retryAttempts) * 100}
            />
        );
    }

    // Render error state with fallback - but still render children
    if ((loadingState.error || loadingState.timedOut) && !loadingState.isLoaded) {
        console.warn('Google Maps failed to load, continuing without maps:', loadingState.error);

        // Return children without MapProvider wrapper for graceful degradation
        return (
            <>
                {loadingState.showNotification && (
                    <MapUnavailableNotification
                        onDismiss={handleNotificationDismiss}
                        message={loadingState.timedOut ? "Maps load timeout" : "Maps connection failed"}
                    />
                )}
                {fallbackComponent}
                {children}
            </>
        );
    }

    // Render the API provider with children
    return (
        <APIProvider {...apiProviderConfig}>
            {children}
        </APIProvider>
    );
}

// Wrapped component with error boundary
function MapProviderWithErrorBoundary(props: Readonly<MapProviderProps>) {
    return (
        <MapErrorBoundary
            onError={(error) => {
                console.error('Map provider error:', error);
                props.onLoadError?.(error);
            }}
            fallback={
                <MapErrorState
                    error="Failed to initialize map provider"
                    onRetry={() => window.location.reload()}
                />
            }
        >
            <MapProviderComponent {...props} />
        </MapErrorBoundary>
    );
}

// Memoized export for performance optimization
export const MapProvider = memo(MapProviderWithErrorBoundary);
export default MapProvider;