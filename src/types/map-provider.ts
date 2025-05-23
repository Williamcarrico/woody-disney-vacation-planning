/**
 * Type definitions for Google Maps API integration
 * Provides comprehensive typing for map provider components
 */

export type GoogleMapsLibrary =
    | 'places'        // Places API (autocomplete, place details)
    | 'geometry'      // Geometry utilities (distance, area calculations)
    | 'drawing'       // Drawing tools (polygons, circles, etc.)
    | 'visualization' // Data visualization (heatmaps)
    | 'localContext'; // Local context features

export interface MapLoadingState {
    isLoading: boolean;
    isLoaded: boolean;
    error: Error | null;
    retryCount: number;
}

export interface MapProviderConfig {
    apiKey: string;
    libraries?: GoogleMapsLibrary[];
    region?: string;
    language?: string;
    retryAttempts?: number;
    retryDelay?: number;
}

export interface MapErrorInfo {
    code: 'MISSING_API_KEY' | 'INVALID_API_KEY' | 'LOAD_ERROR' | 'NETWORK_ERROR';
    message: string;
    retryable: boolean;
}

export interface MapProviderCallbacks {
    onLoadSuccess?: () => void;
    onLoadError?: (error: Error) => void;
    onRetry?: (attempt: number, maxAttempts: number) => void;
}

export interface MapProviderCustomization {
    loadingComponent?: React.ReactNode;
    fallbackComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
}

/**
 * Complete props interface for MapProvider component
 */
export interface MapProviderProps extends
    MapProviderConfig,
    MapProviderCallbacks,
    MapProviderCustomization {
    readonly children: React.ReactNode;
}

/**
 * Google Maps API key validation result
 */
export interface ApiKeyValidation {
    isValid: boolean;
    format: 'valid' | 'missing' | 'invalid_format' | 'invalid_prefix';
    message?: string;
}

/**
 * Map provider context value
 */
export interface MapProviderContextValue {
    isLoading: boolean;
    isLoaded: boolean;
    error: Error | null;
    retryCount: number;
    apiKey: string;
    config: MapProviderConfig;
}

/**
 * Error boundary props for map components
 */
export interface MapErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Performance monitoring data
 */
export interface MapPerformanceMetrics {
    loadTime: number;
    retryCount: number;
    errorCount: number;
    lastLoadTimestamp: number;
}

/**
 * Development debugging information
 */
export interface MapDebugInfo {
    apiKey: string;
    libraries: GoogleMapsLibrary[];
    region?: string;
    language?: string;
    environment: 'development' | 'production';
    version: string;
}

/**
 * Map provider status for monitoring
 */
export type MapProviderStatus =
    | 'initializing'
    | 'loading'
    | 'loaded'
    | 'error'
    | 'retrying';

export default MapProviderProps;