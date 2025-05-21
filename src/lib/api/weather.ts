/**
 * Weather API service for Tomorrow.io
 */

import { ForecastResponse, RealtimeWeatherResponse, TemperatureUnit, WeatherLocation } from '@/types/weather';

// Environment variable would be preferred, but using the provided API key per instructions
const API_KEY = 'BUg7tFzAmctASd4DLGxkwDTSmuwWGHNS';
const BASE_URL = 'https://api.tomorrow.io/v4/weather';

/**
 * Convert location to query parameter string for API calls
 */
function formatLocationParam(location: string | WeatherLocation): string {
    if (typeof location === 'string') {
        return location;
    }

    return `${location.lat},${location.lon}`;
}

/**
 * Fetch current weather data from Tomorrow.io API
 */
export async function fetchRealtimeWeather(
    location: string | WeatherLocation,
    units: TemperatureUnit = 'metric'
): Promise<RealtimeWeatherResponse> {
    const locationParam = formatLocationParam(location);

    const url = new URL(`${BASE_URL}/realtime`);
    url.searchParams.append('location', locationParam);
    url.searchParams.append('units', units);
    url.searchParams.append('apikey', API_KEY);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Cache for a short time (5 minutes)
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching realtime weather:', error);
        throw error;
    }
}

/**
 * Fetch weather forecast data from Tomorrow.io API
 */
export async function fetchWeatherForecast(
    location: string | WeatherLocation,
    units: TemperatureUnit = 'metric'
): Promise<ForecastResponse> {
    const locationParam = formatLocationParam(location);

    const url = new URL(`${BASE_URL}/forecast`);
    url.searchParams.append('location', locationParam);
    url.searchParams.append('units', units);
    url.searchParams.append('apikey', API_KEY);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Cache for 1 hour since forecast doesn't change as frequently
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        throw error;
    }
}

/**
 * Get weather icon based on weather code
 * Returns appropriate Material Design Icons name
 */
export function getWeatherIcon(weatherCode: number): string {
    // Map Tomorrow.io weather codes to Material Design Icons
    // https://docs.tomorrow.io/reference/data-layers-weather-codes
    switch (weatherCode) {
        case 1000: // Clear, Sunny
            return 'weather-sunny';
        case 1100: // Mostly Clear
            return 'weather-partly-cloudy';
        case 1101: // Partly Cloudy
            return 'weather-partly-cloudy';
        case 1102: // Mostly Cloudy
            return 'weather-cloudy';
        case 1001: // Cloudy
            return 'weather-cloudy';
        case 2000: // Fog
        case 2100: // Light Fog
            return 'weather-fog';
        case 3000: // Light Wind
        case 3001: // Wind
        case 3002: // Strong Wind
            return 'weather-windy';
        case 4000: // Drizzle
            return 'weather-pouring';
        case 4001: // Rain
            return 'weather-pouring';
        case 4200: // Light Rain
            return 'weather-rainy';
        case 4201: // Heavy Rain
            return 'weather-pouring';
        case 5000: // Snow
        case 5001: // Flurries
            return 'weather-snowy';
        case 5100: // Light Snow
            return 'weather-snowy';
        case 5101: // Heavy Snow
            return 'weather-snowy-heavy';
        case 6000: // Freezing Drizzle
        case 6001: // Freezing Rain
        case 6200: // Light Freezing Rain
        case 6201: // Heavy Freezing Rain
            return 'weather-snowy-rainy';
        case 7000: // Ice Pellets
        case 7101: // Heavy Ice Pellets
        case 7102: // Light Ice Pellets
            return 'weather-hail';
        case 8000: // Thunderstorm
            return 'weather-lightning-rainy';
        default:
            return 'weather-partly-cloudy';
    }
}

/**
 * Get textual description of weather code
 */
export function getWeatherDescription(weatherCode: number): string {
    switch (weatherCode) {
        case 1000: return 'Clear';
        case 1100: return 'Mostly Clear';
        case 1101: return 'Partly Cloudy';
        case 1102: return 'Mostly Cloudy';
        case 1001: return 'Cloudy';
        case 2000: return 'Fog';
        case 2100: return 'Light Fog';
        case 3000: return 'Light Wind';
        case 3001: return 'Wind';
        case 3002: return 'Strong Wind';
        case 4000: return 'Drizzle';
        case 4001: return 'Rain';
        case 4200: return 'Light Rain';
        case 4201: return 'Heavy Rain';
        case 5000: return 'Snow';
        case 5001: return 'Flurries';
        case 5100: return 'Light Snow';
        case 5101: return 'Heavy Snow';
        case 6000: return 'Freezing Drizzle';
        case 6001: return 'Freezing Rain';
        case 6200: return 'Light Freezing Rain';
        case 6201: return 'Heavy Freezing Rain';
        case 7000: return 'Ice Pellets';
        case 7101: return 'Heavy Ice Pellets';
        case 7102: return 'Light Ice Pellets';
        case 8000: return 'Thunderstorm';
        default: return 'Unknown';
    }
}

/**
 * Format temperature with unit
 */
export function formatTemperature(temp: number, unit: TemperatureUnit): string {
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    return `${Math.round(temp)}${unitSymbol}`;
}