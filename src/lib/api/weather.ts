/**
 * Sophisticated Weather API service for Tomorrow.io
 * Features: Caching, retry logic, error handling, location validation, data normalization
 */

import { ForecastResponse, RealtimeWeatherResponse, TemperatureUnit, WeatherLocation, WeatherCode } from '@/types/weather';

// Configuration constants
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Cache interface for weather data
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    location: string;
    units: TemperatureUnit;
}

// In-memory cache for weather data
const weatherCache = new Map<string, CacheEntry<RealtimeWeatherResponse | ForecastResponse>>();

// Rate limiting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestQueue = new Map<string, Promise<any>>();

/**
 * Enhanced error class for weather API errors
 */
export class WeatherAPIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public retryable: boolean = false,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'WeatherAPIError';
    }
}

/**
 * Validate and normalize location input
 */
function validateLocation(location: string | WeatherLocation): { isValid: boolean; normalized: string; error?: string } {
    if (typeof location === 'string') {
        const trimmed = location.trim();
        if (!trimmed) {
            return { isValid: false, normalized: '', error: 'Location cannot be empty' };
        }

        // Check if it's coordinates (lat,lon format)
        const coordMatch = trimmed.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lon = parseFloat(coordMatch[2]);

            if (lat < -90 || lat > 90) {
                return { isValid: false, normalized: '', error: 'Latitude must be between -90 and 90' };
            }
            if (lon < -180 || lon > 180) {
                return { isValid: false, normalized: '', error: 'Longitude must be between -180 and 180' };
            }
        }

        return { isValid: true, normalized: trimmed };
    }

    // Validate WeatherLocation object
    if (!location || typeof location !== 'object') {
        return { isValid: false, normalized: '', error: 'Invalid location object' };
    }

    const { lat, lon } = location;

    if (typeof lat !== 'number' || typeof lon !== 'number') {
        return { isValid: false, normalized: '', error: 'Latitude and longitude must be numbers' };
    }

    if (lat < -90 || lat > 90) {
        return { isValid: false, normalized: '', error: 'Latitude must be between -90 and 90' };
    }

    if (lon < -180 || lon > 180) {
        return { isValid: false, normalized: '', error: 'Longitude must be between -180 and 180' };
    }

    return { isValid: true, normalized: `${lat},${lon}` };
}

/**
 * Generate cache key for weather data
 */
function generateCacheKey(location: string, units: TemperatureUnit, type: 'realtime' | 'forecast'): string {
    return `${type}:${location}:${units}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < CACHE_DURATION;
}

/**
 * Get data from cache if valid
 */
function getFromCache<T>(cacheKey: string): T | null {
    const entry = weatherCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (entry && isCacheValid(entry)) {
        return entry.data;
    }

    // Clean up expired cache entry
    if (entry) {
        weatherCache.delete(cacheKey);
    }

    return null;
}

/**
 * Store data in cache
 */
function setCache<T>(cacheKey: string, data: T, location: string, units: TemperatureUnit): void {
    const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        location,
        units
    };

    weatherCache.set(cacheKey, entry as CacheEntry<RealtimeWeatherResponse | ForecastResponse>);

    // Clean up old cache entries (keep only last 50 entries)
    if (weatherCache.size > 50) {
        const oldestKey = weatherCache.keys().next().value;
        if (oldestKey) {
            weatherCache.delete(oldestKey);
        }
    }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enhanced fetch with timeout and retry logic
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    attempt: number = 1
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Disney-Vacation-Planning-App/1.0',
                ...options.headers,
            },
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY_BASE * Math.pow(2, attempt - 1);

            if (attempt < MAX_RETRY_ATTEMPTS) {
                await sleep(delay);
                return fetchWithRetry(url, options, attempt + 1);
            }

            throw new WeatherAPIError(
                'Rate limit exceeded. Please try again later.',
                429,
                true
            );
        }

        // Handle server errors with retry
        if (response.status >= 500 && attempt < MAX_RETRY_ATTEMPTS) {
            const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
            await sleep(delay);
            return fetchWithRetry(url, options, attempt + 1);
        }

        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle network errors with retry
        if (attempt < MAX_RETRY_ATTEMPTS && (
            error instanceof TypeError || // Network error
            (error as Error).name === 'AbortError' // Timeout
        )) {
            const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
            await sleep(delay);
            return fetchWithRetry(url, options, attempt + 1);
        }

        if ((error as Error).name === 'AbortError') {
            throw new WeatherAPIError('Request timeout', 408, true, error as Error);
        }

        throw new WeatherAPIError(
            'Network error occurred',
            0,
            true,
            error as Error
        );
    }
}

/**
 * Deduplicate concurrent requests for the same data
 */
async function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (requestQueue.has(key)) {
        return requestQueue.get(key)!;
    }

    const promise = requestFn().finally(() => {
        requestQueue.delete(key);
    });

    requestQueue.set(key, promise);
    return promise;
}

/**
 * Normalize weather data and add computed fields
 */
function normalizeRealtimeWeather(data: RealtimeWeatherResponse): RealtimeWeatherResponse {
    const normalized = { ...data };

    // Add computed fields
    if (normalized.data?.values) {
        const values = normalized.data.values;

        // Calculate heat index if temperature and humidity are available
        if (values.temperature && values.humidity) {
            normalized.data.values = {
                ...values,
                // Add any computed weather metrics here
            };
        }
    }

    return normalized;
}

/**
 * Fetch current weather data with enhanced error handling and caching
 */
export async function fetchRealtimeWeather(
    location: string | WeatherLocation,
    units: TemperatureUnit = 'metric'
): Promise<RealtimeWeatherResponse> {
    // Validate location
    const validation = validateLocation(location);
    if (!validation.isValid) {
        throw new WeatherAPIError(validation.error || 'Invalid location', 400);
    }

    const locationParam = validation.normalized;
    const cacheKey = generateCacheKey(locationParam, units, 'realtime');

    // Check cache first
    const cachedData = getFromCache<RealtimeWeatherResponse>(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // Deduplicate concurrent requests
    return deduplicateRequest(cacheKey, async () => {
        const url = new URL('/api/weather/realtime', window.location.origin);
        url.searchParams.append('location', locationParam);
        url.searchParams.append('units', units);

        try {
            const response = await fetchWithRetry(url.toString());

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new WeatherAPIError(
                    errorData.error || `Weather API error: ${response.status} ${response.statusText}`,
                    response.status,
                    response.status >= 500 || response.status === 429
                );
            }

            const data = await response.json();
            const normalizedData = normalizeRealtimeWeather(data);

            // Cache the successful response
            setCache(cacheKey, normalizedData, locationParam, units);

            return normalizedData;
        } catch (error) {
            if (error instanceof WeatherAPIError) {
                throw error;
            }

            console.error('Error fetching realtime weather:', error);
            throw new WeatherAPIError(
                'Failed to fetch weather data',
                500,
                true,
                error as Error
            );
        }
    });
}

/**
 * Fetch weather forecast data with enhanced error handling and caching
 */
export async function fetchWeatherForecast(
    location: string | WeatherLocation,
    units: TemperatureUnit = 'metric'
): Promise<ForecastResponse> {
    // Validate location
    const validation = validateLocation(location);
    if (!validation.isValid) {
        throw new WeatherAPIError(validation.error || 'Invalid location', 400);
    }

    const locationParam = validation.normalized;
    const cacheKey = generateCacheKey(locationParam, units, 'forecast');

    // Check cache first
    const cachedData = getFromCache<ForecastResponse>(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // Deduplicate concurrent requests
    return deduplicateRequest(cacheKey, async () => {
        const url = new URL('/api/weather/forecast', window.location.origin);
        url.searchParams.append('location', locationParam);
        url.searchParams.append('units', units);

        try {
            const response = await fetchWithRetry(url.toString());

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new WeatherAPIError(
                    errorData.error || `Weather API error: ${response.status} ${response.statusText}`,
                    response.status,
                    response.status >= 500 || response.status === 429
                );
            }

            const data = await response.json();

            // Cache the successful response
            setCache(cacheKey, data, locationParam, units);

            return data;
        } catch (error) {
            if (error instanceof WeatherAPIError) {
                throw error;
            }

            console.error('Error fetching weather forecast:', error);
            throw new WeatherAPIError(
                'Failed to fetch weather forecast',
                500,
                true,
                error as Error
            );
        }
    });
}

/**
 * Enhanced weather icon mapping with fallbacks
 */
export function getWeatherIcon(weatherCode: number): string {
    const iconMap: Record<number, string> = {
        [WeatherCode.CLEAR]: 'weather-sunny',
        [WeatherCode.MOSTLY_CLEAR]: 'weather-partly-cloudy',
        [WeatherCode.PARTLY_CLOUDY]: 'weather-partly-cloudy',
        [WeatherCode.MOSTLY_CLOUDY]: 'weather-cloudy',
        [WeatherCode.CLOUDY]: 'weather-cloudy',
        [WeatherCode.FOG]: 'weather-fog',
        [WeatherCode.LIGHT_FOG]: 'weather-fog',
        [WeatherCode.LIGHT_WIND]: 'weather-windy',
        [WeatherCode.WIND]: 'weather-windy',
        [WeatherCode.STRONG_WIND]: 'weather-windy',
        [WeatherCode.DRIZZLE]: 'weather-pouring',
        [WeatherCode.RAIN]: 'weather-pouring',
        [WeatherCode.LIGHT_RAIN]: 'weather-rainy',
        [WeatherCode.HEAVY_RAIN]: 'weather-pouring',
        [WeatherCode.SNOW]: 'weather-snowy',
        [WeatherCode.FLURRIES]: 'weather-snowy',
        [WeatherCode.LIGHT_SNOW]: 'weather-snowy',
        [WeatherCode.HEAVY_SNOW]: 'weather-snowy-heavy',
        [WeatherCode.FREEZING_DRIZZLE]: 'weather-snowy-rainy',
        [WeatherCode.FREEZING_RAIN]: 'weather-snowy-rainy',
        [WeatherCode.LIGHT_FREEZING_RAIN]: 'weather-snowy-rainy',
        [WeatherCode.HEAVY_FREEZING_RAIN]: 'weather-snowy-rainy',
        [WeatherCode.ICE_PELLETS]: 'weather-hail',
        [WeatherCode.HEAVY_ICE_PELLETS]: 'weather-hail',
        [WeatherCode.LIGHT_ICE_PELLETS]: 'weather-hail',
        [WeatherCode.THUNDERSTORM]: 'weather-lightning-rainy',
    };

    return iconMap[weatherCode] || 'weather-partly-cloudy';
}

/**
 * Enhanced weather description with detailed conditions
 */
export function getWeatherDescription(weatherCode: number): string {
    const descriptionMap: Record<number, string> = {
        [WeatherCode.CLEAR]: 'Clear Sky',
        [WeatherCode.MOSTLY_CLEAR]: 'Mostly Clear',
        [WeatherCode.PARTLY_CLOUDY]: 'Partly Cloudy',
        [WeatherCode.MOSTLY_CLOUDY]: 'Mostly Cloudy',
        [WeatherCode.CLOUDY]: 'Cloudy',
        [WeatherCode.FOG]: 'Fog',
        [WeatherCode.LIGHT_FOG]: 'Light Fog',
        [WeatherCode.LIGHT_WIND]: 'Light Wind',
        [WeatherCode.WIND]: 'Windy',
        [WeatherCode.STRONG_WIND]: 'Strong Wind',
        [WeatherCode.DRIZZLE]: 'Drizzle',
        [WeatherCode.RAIN]: 'Rain',
        [WeatherCode.LIGHT_RAIN]: 'Light Rain',
        [WeatherCode.HEAVY_RAIN]: 'Heavy Rain',
        [WeatherCode.SNOW]: 'Snow',
        [WeatherCode.FLURRIES]: 'Snow Flurries',
        [WeatherCode.LIGHT_SNOW]: 'Light Snow',
        [WeatherCode.HEAVY_SNOW]: 'Heavy Snow',
        [WeatherCode.FREEZING_DRIZZLE]: 'Freezing Drizzle',
        [WeatherCode.FREEZING_RAIN]: 'Freezing Rain',
        [WeatherCode.LIGHT_FREEZING_RAIN]: 'Light Freezing Rain',
        [WeatherCode.HEAVY_FREEZING_RAIN]: 'Heavy Freezing Rain',
        [WeatherCode.ICE_PELLETS]: 'Ice Pellets',
        [WeatherCode.HEAVY_ICE_PELLETS]: 'Heavy Ice Pellets',
        [WeatherCode.LIGHT_ICE_PELLETS]: 'Light Ice Pellets',
        [WeatherCode.THUNDERSTORM]: 'Thunderstorm',
    };

    return descriptionMap[weatherCode] || 'Unknown Weather';
}

/**
 * Enhanced temperature formatting with precision control
 */
export function formatTemperature(temp: number, unit: TemperatureUnit, precision: number = 0): string {
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    return `${temp.toFixed(precision)}${unitSymbol}`;
}

/**
 * Get weather severity level for alerts and warnings
 */
export function getWeatherSeverity(weatherCode: number): 'low' | 'moderate' | 'high' | 'severe' {
    const severeWeather = [
        WeatherCode.HEAVY_RAIN,
        WeatherCode.HEAVY_SNOW,
        WeatherCode.HEAVY_FREEZING_RAIN,
        WeatherCode.HEAVY_ICE_PELLETS,
        WeatherCode.THUNDERSTORM,
        WeatherCode.STRONG_WIND
    ];

    const moderateWeather = [
        WeatherCode.RAIN,
        WeatherCode.SNOW,
        WeatherCode.FREEZING_RAIN,
        WeatherCode.ICE_PELLETS,
        WeatherCode.WIND,
        WeatherCode.FOG
    ];

    const lightWeather = [
        WeatherCode.LIGHT_RAIN,
        WeatherCode.LIGHT_SNOW,
        WeatherCode.LIGHT_FREEZING_RAIN,
        WeatherCode.LIGHT_ICE_PELLETS,
        WeatherCode.DRIZZLE,
        WeatherCode.FLURRIES,
        WeatherCode.LIGHT_FOG,
        WeatherCode.LIGHT_WIND
    ];

    if (severeWeather.includes(weatherCode)) return 'severe';
    if (moderateWeather.includes(weatherCode)) return 'high';
    if (lightWeather.includes(weatherCode)) return 'moderate';
    return 'low';
}

/**
 * Clear weather cache (useful for testing or manual refresh)
 */
export function clearWeatherCache(): void {
    weatherCache.clear();
    requestQueue.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { size: number; entries: string[] } {
    return {
        size: weatherCache.size,
        entries: Array.from(weatherCache.keys())
    };
}