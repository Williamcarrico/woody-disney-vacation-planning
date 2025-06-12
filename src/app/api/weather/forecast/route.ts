import { NextRequest, NextResponse } from 'next/server';
import { generateCacheKey, CACHE_CONFIG } from '@/lib/api/weather-cache';

const API_KEY = process.env.TOMORROW_IO_API_KEY || 'BUg7tFzAmctASd4DLGxkwDTSmuwWGHNS';
const BASE_URL = 'https://api.tomorrow.io/v4/weather';

// Enhanced cache for forecast data
interface ForecastCacheEntry {
    data: any;
    timestamp: number;
    expiresAt: number;
    location: string;
    units: string;
}

const forecastCache = new Map<string, ForecastCacheEntry>();
const CACHE_DURATION = CACHE_CONFIG.FORECAST_CACHE_DURATION * 1000; // Convert to milliseconds

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const location = searchParams.get('location');
        const units = searchParams.get('units') || 'metric';

        if (!location) {
            return NextResponse.json(
                { error: 'Location parameter is required' },
                { status: 400 }
            );
        }

        const cacheKey = generateCacheKey.forecast(location, units);

        // Clean up expired cache entries
        cleanupExpiredForecastCache();

        // Check cache first
        const cachedEntry = forecastCache.get(cacheKey);
        if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
            return NextResponse.json(cachedEntry.data, {
                headers: {
                    'Cache-Control': `public, max-age=${Math.floor((cachedEntry.expiresAt - Date.now()) / 1000)}`,
                    'X-Cache': 'HIT',
                    'X-Cache-Timestamp': new Date(cachedEntry.timestamp).toISOString()
                }
            });
        }

        // Check if API key is available
        if (!API_KEY || API_KEY === 'your-api-key-here') {
            console.warn('Tomorrow.io API key not configured, returning mock forecast data');
            const mockData = {
                timelines: {
                    daily: Array.from({ length: 7 }, (_, i) => ({
                        time: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        values: {
                            temperatureMax: 75 + Math.random() * 10,
                            temperatureMin: 65 + Math.random() * 5,
                            weatherCode: 1000,
                            precipitationProbability: Math.random() * 30,
                            humidity: 60 + Math.random() * 20,
                            windSpeed: 5 + Math.random() * 10,
                            uvIndex: 6 + Math.random() * 3
                        }
                    })),
                    hourly: Array.from({ length: 24 }, (_, i) => ({
                        time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
                        values: {
                            temperature: 70 + Math.random() * 10,
                            weatherCode: 1000,
                            precipitationProbability: Math.random() * 20,
                            humidity: 60 + Math.random() * 20,
                            windSpeed: 5 + Math.random() * 10
                        }
                    }))
                },
                location: {
                    lat: 28.3772,
                    lon: -81.5707,
                    name: location
                }
            };

            // Cache mock data
            const now = Date.now();
            forecastCache.set(cacheKey, {
                data: mockData,
                timestamp: now,
                expiresAt: now + CACHE_DURATION,
                location,
                units
            });

            return NextResponse.json(mockData, {
                headers: {
                    'Cache-Control': `public, max-age=${CACHE_CONFIG.FORECAST_CACHE_DURATION}`,
                    'X-Cache': 'MISS',
                    'X-Data-Source': 'MOCK'
                }
            });
        }

        const url = new URL(`${BASE_URL}/forecast`);
        url.searchParams.append('location', location);
        url.searchParams.append('units', units);
        url.searchParams.append('apikey', API_KEY);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Tomorrow.io API error:', response.status, errorText);

            // Return mock forecast data on API failure
            const fallbackData = {
                timelines: {
                    daily: Array.from({ length: 7 }, (_, i) => ({
                        time: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        values: {
                            temperatureMax: 75 + Math.random() * 10,
                            temperatureMin: 65 + Math.random() * 5,
                            weatherCode: 1000,
                            precipitationProbability: Math.random() * 30,
                            humidity: 60 + Math.random() * 20,
                            windSpeed: 5 + Math.random() * 10,
                            uvIndex: 6 + Math.random() * 3
                        }
                    })),
                    hourly: Array.from({ length: 24 }, (_, i) => ({
                        time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
                        values: {
                            temperature: 70 + Math.random() * 10,
                            weatherCode: 1000,
                            precipitationProbability: Math.random() * 20,
                            humidity: 60 + Math.random() * 20,
                            windSpeed: 5 + Math.random() * 10
                        }
                    }))
                },
                location: {
                    lat: 28.3772,
                    lon: -81.5707,
                    name: location
                }
            };

            return NextResponse.json(fallbackData, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'X-Cache': 'MISS',
                    'X-Data-Source': 'FALLBACK'
                }
            });
        }

        const data = await response.json();

        // Add location name if not provided by API
        if (!data.location?.name && typeof location === 'string') {
            data.location = {
                ...data.location,
                name: location
            };
        }

        // Cache the successful response
        const now = Date.now();
        forecastCache.set(cacheKey, {
            data,
            timestamp: now,
            expiresAt: now + CACHE_DURATION,
            location,
            units
        });

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': `public, max-age=${CACHE_CONFIG.FORECAST_CACHE_DURATION}`,
                'X-Cache': 'MISS',
                'X-Data-Source': 'TOMORROW_IO'
            }
        });
    } catch (error) {
        console.error('Error in weather forecast route:', error);

        // Return mock forecast data on any error
        const location = request.nextUrl.searchParams.get('location') || 'Orlando, FL';
        const errorFallbackData = {
            timelines: {
                daily: Array.from({ length: 7 }, (_, i) => ({
                    time: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    values: {
                        temperatureMax: 75 + Math.random() * 10,
                        temperatureMin: 65 + Math.random() * 5,
                        weatherCode: 1000,
                        precipitationProbability: Math.random() * 30,
                        humidity: 60 + Math.random() * 20,
                        windSpeed: 5 + Math.random() * 10,
                        uvIndex: 6 + Math.random() * 3
                    }
                })),
                hourly: Array.from({ length: 24 }, (_, i) => ({
                    time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
                    values: {
                        temperature: 70 + Math.random() * 10,
                        weatherCode: 1000,
                        precipitationProbability: Math.random() * 20,
                        humidity: 60 + Math.random() * 20,
                        windSpeed: 5 + Math.random() * 10
                    }
                }))
            },
            location: {
                lat: 28.3772,
                lon: -81.5707,
                name: location
            }
        };

        return NextResponse.json(errorFallbackData, {
            headers: {
                'Cache-Control': 'no-cache',
                'X-Cache': 'MISS',
                'X-Data-Source': 'ERROR_FALLBACK'
            }
        });
    }
}

/**
 * Clean up expired forecast cache entries to prevent memory leaks
 */
function cleanupExpiredForecastCache(): void {
    const now = Date.now();
    for (const [key, entry] of forecastCache.entries()) {
        if (now >= entry.expiresAt) {
            forecastCache.delete(key);
        }
    }
}