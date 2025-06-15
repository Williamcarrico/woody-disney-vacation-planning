/**
 * Type definitions for Google Maps API integration
 * Provides comprehensive typing for map provider components with robust error handling
 */

// =============================================================================
// CORE ENUMS AND TYPES
// =============================================================================

export type GoogleMapsLibrary =
    | 'places'        // Places API (autocomplete, place details)
    | 'geometry'      // Geometry utilities (distance, area calculations)  
    | 'drawing'       // Drawing tools (polygons, circles, etc.)
    | 'visualization' // Data visualization (heatmaps)
    | 'localContext'; // Local context features

/** Map provider status for monitoring */
export type MapProviderStatus =
    | 'initializing'
    | 'loading'
    | 'loaded'
    | 'error'
    | 'retrying';

/** Explicit forecast types instead of unknown */
export type WeatherForecast = {
    /** Temperature in Fahrenheit */
    temperature: number;
    /** Weather condition */
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
    /** Humidity percentage */
    humidity: number;
    /** Wind speed in mph */
    windSpeed: number;
    /** Precipitation chance (0-100) */
    precipitationChance: number;
    /** UV index */
    uvIndex: number;
    /** Visibility in miles */
    visibility: number;
    /** Timestamp for forecast */
    timestamp: string;
};

export type CrowdForecast = {
    /** Crowd level (1-10) */
    level: number;
    /** Descriptive crowd level */
    description: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extremely High';
    /** Peak hours */
    peakHours: string[];
    /** Recommended visit times */
    recommendedTimes: string[];
    /** Timestamp for forecast */
    timestamp: string;
};

export type AttendanceForecast = {
    /** Estimated park attendance */
    estimatedAttendance: number;
    /** Capacity percentage */
    capacityPercentage: number;
    /** Wait time predictions */
    waitTimePredictions: Record<string, number>;
    /** Timestamp for forecast */
    timestamp: string;
};

/** Union type for all forecast types */
export type ForecastData = WeatherForecast | CrowdForecast | AttendanceForecast;

// =============================================================================
// RETRY POLICY INTERFACES
// =============================================================================

/** Retry strategy types */
export type RetryStrategy = 'linear' | 'exponential' | 'fixed';

/** Comprehensive retry policy configuration */
export interface RetryPolicy {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Retry strategy */
    strategy: RetryStrategy;
    /** Initial delay in milliseconds */
    initialDelay: number;
    /** Maximum delay in milliseconds */
    maxDelay: number;
    /** Multiplier for exponential backoff */
    backoffMultiplier: number;
    /** Jitter factor to add randomness (0-1) */
    jitterFactor: number;
    /** Conditions that should trigger a retry */
    retryableErrors: string[];
    /** Callback for retry attempts */
    onRetryAttempt?: (attempt: number, error: Error, nextDelay: number) => void;
}

/** Default retry policies for different scenarios */
export const DEFAULT_RETRY_POLICIES: Record<string, RetryPolicy> = {
    NETWORK_ERROR: {
        maxAttempts: 3,
        strategy: 'exponential',
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0.1,
        retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE']
    },
    API_KEY_ERROR: {
        maxAttempts: 1,
        strategy: 'fixed',
        initialDelay: 0,
        maxDelay: 0,
        backoffMultiplier: 1,
        jitterFactor: 0,
        retryableErrors: []
    },
    RATE_LIMIT: {
        maxAttempts: 5,
        strategy: 'exponential',
        initialDelay: 2000,
        maxDelay: 30000,
        backoffMultiplier: 2.5,
        jitterFactor: 0.2,
        retryableErrors: ['RATE_LIMIT_EXCEEDED', 'QUOTA_EXCEEDED']
    }
} as const;

// =============================================================================
// LOADING AND ERROR INTERFACES
// =============================================================================

/** Enhanced loading state with retry information */
export interface MapLoadingState {
    /** Whether currently loading */
    isLoading: boolean;
    /** Whether successfully loaded */
    isLoaded: boolean;
    /** Current error if any */
    error: Error | null;
    /** Current retry count */
    retryCount: number;
    /** Current retry policy being used */
    retryPolicy?: RetryPolicy;
    /** Time of last retry attempt */
    lastRetryAt?: number;
    /** Next retry scheduled time */
    nextRetryAt?: number;
    /** Provider status */
    status: MapProviderStatus;
}

/** Detailed error information with recovery suggestions */
export interface MapErrorInfo {
    /** Error code */
    code: 'MISSING_API_KEY' | 'INVALID_API_KEY' | 'LOAD_ERROR' | 'NETWORK_ERROR' | 'RATE_LIMIT' | 'QUOTA_EXCEEDED' | 'SERVICE_UNAVAILABLE';
    /** Human-readable error message */
    message: string;
    /** Whether this error is retryable */
    retryable: boolean;
    /** Suggested recovery actions */
    recoveryActions: string[];
    /** Timestamp when error occurred */
    timestamp: number;
    /** Original error object */
    originalError?: Error;
}

// =============================================================================
// CONFIGURATION INTERFACES
// =============================================================================

/** Enhanced map provider configuration */
export interface MapProviderConfig {
    /** Google Maps API key */
    apiKey: string;
    /** Libraries to load */
    libraries?: GoogleMapsLibrary[];
    /** Region code for localization */
    region?: string;
    /** Language code for localization */
    language?: string;
    /** Custom retry policy */
    retryPolicy?: Partial<RetryPolicy>;
    /** Timeout for loading (milliseconds) */
    loadTimeout?: number;
    /** Whether to enable debug logging */
    debug?: boolean;
    /** Custom map options */
    mapOptions?: {
        /** Default center coordinates */
        center?: {
            lat: number;
            lng: number;
        };
        /** Default zoom level */
        zoom?: number;
        /** Map type */
        mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
        /** Map styling */
        styles?: unknown[]; // Google Maps styling array
    };
}

/** Callback functions for map provider events */
export interface MapProviderCallbacks {
    /** Called when map loads successfully */
    onLoadSuccess?: () => void;
    /** Called when map loading fails */
    onLoadError?: (error: MapErrorInfo) => void;
    /** Called before each retry attempt */
    onRetry?: (attempt: number, maxAttempts: number, nextDelay: number) => void;
    /** Called when all retries are exhausted */
    onRetryExhausted?: (finalError: MapErrorInfo) => void;
    /** Called on status changes */
    onStatusChange?: (status: MapProviderStatus) => void;
}

/** UI customization options */
export interface MapProviderCustomization {
    /** Loading component */
    loadingComponent?: React.ReactNode;
    /** Fallback component when maps fail to load */
    fallbackComponent?: React.ReactNode;
    /** Error component */
    errorComponent?: React.ReactNode;
    /** Retry button component */
    retryComponent?: React.ReactNode;
}

// =============================================================================
// MAIN PROVIDER INTERFACES  
// =============================================================================

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
 * Enhanced map provider context value
 */
export interface MapProviderContextValue {
    /** Current loading state */
    isLoading: boolean;
    /** Whether maps are loaded */
    isLoaded: boolean;
    /** Current error */
    error: MapErrorInfo | null;
    /** Current retry count */
    retryCount: number;
    /** Google Maps API key */
    apiKey: string;
    /** Provider configuration */
    config: MapProviderConfig;
    /** Current status */
    status: MapProviderStatus;
    /** Manual retry function */
    retry: () => void;
    /** Cancel pending retry */
    cancelRetry: () => void;
    /** Get retry policy for error type */
    getRetryPolicy: (errorType: string) => RetryPolicy;
    /** Force reload maps */
    forceReload: () => void;
    /** Forecast data (typed explicitly) */
    forecastData?: ForecastData[];
}

// =============================================================================
// UTILITY INTERFACES
// =============================================================================

/**
 * Google Maps API key validation result
 */
export interface ApiKeyValidation {
    /** Whether API key is valid */
    isValid: boolean;
    /** Validation result format */
    format: 'valid' | 'missing' | 'invalid_format' | 'invalid_prefix' | 'restricted' | 'quota_exceeded';
    /** Validation message */
    message?: string;
    /** Suggested actions */
    suggestions?: string[];
}

/**
 * Error boundary props for map components
 */
export interface MapErrorBoundaryProps {
    children: React.ReactNode;
    /** Fallback component with error and retry function */
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    /** Error callback */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    /** Whether to automatically retry on error */
    autoRetry?: boolean;
    /** Custom retry policy for error boundary */
    retryPolicy?: Partial<RetryPolicy>;
}

/**
 * Enhanced performance monitoring data
 */
export interface MapPerformanceMetrics {
    /** Time to load maps (milliseconds) */
    loadTime: number;
    /** Number of retries attempted */
    retryCount: number;
    /** Number of errors encountered */
    errorCount: number;
    /** Last load timestamp */
    lastLoadTimestamp: number;
    /** Time to first interaction */
    timeToInteraction?: number;
    /** Memory usage (bytes) */
    memoryUsage?: number;
    /** Network timing information */
    networkTiming?: {
        dns: number;
        tcp: number;
        request: number;
        response: number;
    };
}

/**
 * Development debugging information
 */
export interface MapDebugInfo {
    /** Masked API key (for security) */
    apiKey: string;
    /** Loaded libraries */
    libraries: GoogleMapsLibrary[];
    /** Region setting */
    region?: string;
    /** Language setting */
    language?: string;
    /** Environment */
    environment: 'development' | 'production';
    /** SDK version */
    version: string;
    /** Browser information */
    browser: {
        userAgent: string;
        platform: string;
        language: string;
    };
    /** Performance metrics */
    performance: MapPerformanceMetrics;
    /** Active retry policies */
    retryPolicies: Record<string, RetryPolicy>;
}

// =============================================================================
// RETRY UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate next retry delay based on strategy
 */
export interface RetryCalculation {
    /** Delay in milliseconds */
    delay: number;
    /** Whether should retry */
    shouldRetry: boolean;
    /** Reason for retry decision */
    reason: string;
}

/**
 * Retry utility functions
 */
export interface RetryUtils {
    /** Calculate next retry delay */
    calculateDelay(attempt: number, policy: RetryPolicy): RetryCalculation;
    
    /** Check if error is retryable */
    isRetryableError(error: Error, policy: RetryPolicy): boolean;
    
    /** Execute function with retry policy */
    executeWithRetry<T>(
        fn: () => Promise<T>,
        policy: RetryPolicy
    ): Promise<T>;
    
    /** Create exponential backoff delay */
    exponentialBackoff(
        attempt: number,
        initialDelay: number,
        multiplier: number,
        maxDelay: number,
        jitter: number
    ): number;
    
    /** Add jitter to delay */
    addJitter(delay: number, jitterFactor: number): number;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default MapProviderProps;