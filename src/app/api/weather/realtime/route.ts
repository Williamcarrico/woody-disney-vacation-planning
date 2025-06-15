import { NextRequest, NextResponse } from 'next/server';
import { generateCacheKey, CACHE_CONFIG } from '@/lib/api/weather-cache';
import { ResponsePatterns } from '@/lib/api/response-standardizer';
import { withErrorHandler } from '@/lib/api/unified-error-handler';
import { ErrorCodes } from '@/lib/api/response';

// Tomorrow.io API configuration
const TOMORROW_API_KEY = process.env.TOMORROW_IO_API_KEY;
const TOMORROW_API_BASE = 'https://api.tomorrow.io/v4';

// Default to Orlando, FL (Walt Disney World) coordinates
const DEFAULT_COORDINATES = {
    lat: 28.3772,
    lon: -81.5707,
    name: 'Orlando, FL'
};

interface TomorrowIORealtimeResponse {
    data: {
        time: string;
        values: {
            cloudBase: number;
            cloudCeiling: number;
            cloudCover: number;
            dewPoint: number;
            freezingRainIntensity: number;
            humidity: number;
            precipitationProbability: number;
            pressureSurfaceLevel: number;
            rainIntensity: number;
            sleetIntensity: number;
            snowIntensity: number;
            temperature: number;
            temperatureApparent: number;
            uvHealthConcern: number;
            uvIndex: number;
            visibility: number;
            weatherCode: number;
            windDirection: number;
            windGust: number;
            windSpeed: number;
        };
    };
    location: {
        lat: number;
        lon: number;
        name?: string;
    };
}

// Enhanced cache for weather data with better structure
interface WeatherCacheEntry {
    data: TomorrowIORealtimeResponse;
    timestamp: number;
    expiresAt: number;
    location: string;
    units: string;
}

// In-memory cache map for better organization
const weatherCache = new Map<string, WeatherCacheEntry>();
const CACHE_DURATION = CACHE_CONFIG.REALTIME_CACHE_DURATION * 1000; // Convert to milliseconds

/**
 * Convert temperature between units
 */
function convertTemperature(temp: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return temp;

    if (fromUnit === 'metric' && toUnit === 'imperial') {
        return (temp * 9 / 5) + 32;
    } else if (fromUnit === 'imperial' && toUnit === 'metric') {
        return (temp - 32) * 5 / 9;
    }

    return temp;
}

/**
 * Convert wind speed between units
 */
function convertWindSpeed(speed: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return speed;

    if (fromUnit === 'metric' && toUnit === 'imperial') {
        return speed * 0.621371; // km/h to mph
    } else if (fromUnit === 'imperial' && toUnit === 'metric') {
        return speed * 1.60934; // mph to km/h
    }

    return speed;
}

/**
 * Parse location parameter from different formats
 */
function parseLocation(locationParam: string): { lat: number; lon: number; name?: string } {
    // Try to parse as coordinates (lat,lon)
    const coordMatch = locationParam.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
        return {
            lat: parseFloat(coordMatch[1]),
            lon: parseFloat(coordMatch[2])
        };
    }

    // If it's a string location name, use default coordinates for Orlando
    // In a real app, you'd use a geocoding service here
    return {
        ...DEFAULT_COORDINATES,
        name: locationParam
    };
}

export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const locationParam = searchParams.get('location') || 'Orlando, FL';
    const units = searchParams.get('units') || 'imperial';

    const location = parseLocation(locationParam);
    const cacheKey = generateCacheKey.realtime(locationParam, units);

    // Clean up expired cache entries
    cleanupExpiredCache();

    // Check cache first
    const cachedEntry = weatherCache.get(cacheKey);
    if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
        return ResponsePatterns.realTimeData(
            cachedEntry.data,
            new Date(cachedEntry.timestamp)
        );
    }

        if (!TOMORROW_API_KEY) {
            // Return mock data in Tomorrow.io format if no API key is configured
            const mockWeatherData: TomorrowIORealtimeResponse = {
                data: {
                    time: new Date().toISOString(),
                    values: {
                        cloudBase: 1000,
                        cloudCeiling: 2000,
                        cloudCover: 25,
                        dewPoint: units === 'metric' ? 18 : 65,
                        freezingRainIntensity: 0,
                        humidity: 65,
                        precipitationProbability: 20,
                        pressureSurfaceLevel: 1013.25,
                        rainIntensity: 0,
                        sleetIntensity: 0,
                        snowIntensity: 0,
                        temperature: units === 'metric' ? 26 : 78,
                        temperatureApparent: units === 'metric' ? 28 : 82,
                        uvHealthConcern: 3,
                        uvIndex: 6,
                        visibility: 16,
                        weatherCode: 1101, // Partly cloudy
                        windDirection: 180,
                        windGust: units === 'metric' ? 15 : 9,
                        windSpeed: units === 'metric' ? 13 : 8
                    }
                },
                location: {
                    lat: location.lat,
                    lon: location.lon,
                    name: location.name || 'Orlando, FL'
                }
            };

            // Cache mock data
            const now = Date.now();
            weatherCache.set(cacheKey, {
                data: mockWeatherData,
                timestamp: now,
                expiresAt: now + CACHE_DURATION,
                location: locationParam,
                units
            });

            return ResponsePatterns.realTimeData(mockWeatherData, new Date());
        }

        // Fetch real weather data from Tomorrow.io
        const apiUrl = new URL(`${TOMORROW_API_BASE}/weather/realtime`);
        apiUrl.searchParams.append('location', `${location.lat},${location.lon}`);
        apiUrl.searchParams.append('units', units === 'imperial' ? 'imperial' : 'metric');
        apiUrl.searchParams.append('apikey', TOMORROW_API_KEY);

        const response = await fetch(apiUrl.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Disney-Vacation-Planner/1.0'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Tomorrow.io API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const weatherData = await response.json();

        // Ensure the response has the expected structure
        const transformedData: TomorrowIORealtimeResponse = {
            data: weatherData.data,
            location: {
                lat: location.lat,
                lon: location.lon,
                name: location.name || `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`
            }
        };

        // Cache the data
        const now = Date.now();
        weatherCache.set(cacheKey, {
            data: transformedData,
            timestamp: now,
            expiresAt: now + CACHE_DURATION,
            location: locationParam,
            units
        });

        return ResponsePatterns.realTimeData(transformedData, new Date());
})

/**
 * Clean up expired cache entries to prevent memory leaks
 */
function cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of weatherCache.entries()) {
        if (now >= entry.expiresAt) {
            weatherCache.delete(key);
        }
    }
}

export const POST = withErrorHandler(async (request: NextRequest) => {
    // Handle POST requests if needed (for example, location updates)
    throw new Error('POST method not implemented for weather endpoint')
})

export const revalidate = 300; // 5 minutes