'use client';

import { ReactNode, useState, useCallback, useMemo, useEffect, memo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

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
}

interface MapLoadingState {
    isLoading: boolean;
    isLoaded: boolean;
    error: Error | null;
    retryCount: number;
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
    } = props;

    const [loadingState, setLoadingState] = useState<MapLoadingState>({
        isLoading: true,
        isLoaded: false,
        error: null,
        retryCount: 0,
    });

    // Get API key from props or environment with validation
    const finalApiKey = useMemo(() => {
        const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!key) {
            console.error('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
        }
        return key || '';
    }, [apiKey]);

    // Validate API key format
    const isValidApiKey = useMemo(() => {
        return finalApiKey.length > 0 && finalApiKey.startsWith('AIza');
    }, [finalApiKey]);

    // Handle successful API load
    const handleLoadSuccess = useCallback(() => {
        console.log('Google Maps API loaded successfully');
        setLoadingState(prev => ({
            ...prev,
            isLoading: false,
            isLoaded: true,
            error: null,
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
                    }));
                }, retryDelay);
            }

            return {
                ...prev,
                isLoading: shouldRetry,
                isLoaded: false,
                error: shouldRetry ? null : errorObj,
                retryCount: newRetryCount,
            };
        });

        onLoadError?.(errorObj);
    }, [onLoadError, retryAttempts, retryDelay]);

    // API Provider configuration
    const apiProviderConfig = useMemo(() => ({
        apiKey: finalApiKey,
        libraries,
        region,
        language,
        onLoad: handleLoadSuccess,
        onError: handleLoadError,
        ...(process.env.NODE_ENV === 'development' && {
            version: 'beta', // Use beta version in development for latest features
        }),
    }), [finalApiKey, libraries, region, language, handleLoadSuccess, handleLoadError]);

    // Reset loading state when API key changes
    useEffect(() => {
        if (finalApiKey) {
            setLoadingState({
                isLoading: true,
                isLoaded: false,
                error: null,
                retryCount: 0,
            });
        }
    }, [finalApiKey]);

    // Early return for missing or invalid API key
    if (!finalApiKey || !isValidApiKey) {
        const errorMessage = !finalApiKey
            ? 'Google Maps API key is required'
            : 'Invalid Google Maps API key format';

        return (
            <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Google Maps Configuration Error
                    </h3>
                    <p className="text-red-600 mb-4">{errorMessage}</p>
                    <div className="text-sm text-red-500">
                        <p>Please check your environment configuration:</p>
                        <code className="bg-red-100 px-2 py-1 rounded mt-2 inline-block">
                            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
                        </code>
                    </div>
                </div>
            </div>
        );
    }

    // Render loading state
    if (loadingState.isLoading && !loadingState.isLoaded) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }

        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Google Maps...</p>
                    {loadingState.retryCount > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                            Retry attempt {loadingState.retryCount}/{retryAttempts}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Render error state with fallback
    if (loadingState.error && !loadingState.isLoaded) {
        if (fallbackComponent) {
            return <>{fallbackComponent}</>;
        }

        return (
            <div className="flex items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        Maps Temporarily Unavailable
                    </h3>
                    <p className="text-yellow-600 mb-4">
                        We&apos;re having trouble loading the map. Please try again later.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                    >
                        Reload Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 text-left">
                            <summary className="text-sm text-yellow-600 cursor-pointer">
                                Error Details (Development)
                            </summary>
                            <pre className="text-xs text-yellow-700 mt-2 bg-yellow-100 p-2 rounded overflow-auto">
                                {loadingState.error.message}
                                {loadingState.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        );
    }

    // Render the API provider with children
    return (
        <APIProvider {...apiProviderConfig}>
            {children}
        </APIProvider>
    );
}

// Memoized export for performance optimization
export const MapProvider = memo(MapProviderComponent);
export default MapProvider;