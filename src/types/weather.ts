/**
 * Types for Tomorrow.io Weather API
 * Based on documentation: https://docs.tomorrow.io/reference/realtime-weather and
 * https://docs.tomorrow.io/reference/weather-forecast
 */

// Common types
export type TemperatureUnit = 'metric' | 'imperial';

export interface WeatherLocation {
    lat: number;
    lon: number;
    name?: string;
}

// Realtime Weather API response types
export interface RealtimeWeatherResponse {
    data: {
        time: string;
        values: RealtimeWeatherValues;
    };
    location: {
        lat: number;
        lon: number;
        name?: string;
    };
}

export interface RealtimeWeatherValues {
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
}

// Forecast API response types
export interface ForecastResponse {
    timelines: {
        minutely?: TimelineData[];
        hourly: TimelineData[];
        daily: TimelineData[];
    };
    location: {
        lat: number;
        lon: number;
        name?: string;
    };
}

export interface TimelineData {
    time: string;
    values: ForecastValues;
}

export interface ForecastValues {
    cloudBase?: number;
    cloudCeiling?: number;
    cloudCover?: number;
    dewPoint?: number;
    evapotranspiration?: number;
    freezingRainIntensity?: number;
    humidity?: number;
    iceAccumulation?: number;
    iceAccumulationLwe?: number;
    precipitationProbability?: number;
    pressureSurfaceLevel?: number;
    rainAccumulation?: number;
    rainAccumulationLwe?: number;
    rainIntensity?: number;
    sleetAccumulation?: number;
    sleetAccumulationLwe?: number;
    sleetIntensity?: number;
    snowAccumulation?: number;
    snowAccumulationLwe?: number;
    snowIntensity?: number;
    temperature?: number;
    temperatureApparent?: number;
    temperatureMax?: number;
    temperatureMin?: number;
    uvHealthConcern?: number;
    uvIndex?: number;
    visibility?: number;
    weatherCode?: number;
    windDirection?: number;
    windGust?: number;
    windSpeed?: number;
    moonPhase?: number;
    sunriseTime?: string;
    sunsetTime?: string;
}

// Weather code mapping based on Tomorrow.io documentation
export enum WeatherCode {
    UNKNOWN = 0,
    CLEAR = 1000,
    MOSTLY_CLEAR = 1100,
    PARTLY_CLOUDY = 1101,
    MOSTLY_CLOUDY = 1102,
    CLOUDY = 1001,
    FOG = 2000,
    LIGHT_FOG = 2100,
    LIGHT_WIND = 3000,
    WIND = 3001,
    STRONG_WIND = 3002,
    DRIZZLE = 4000,
    RAIN = 4001,
    LIGHT_RAIN = 4200,
    HEAVY_RAIN = 4201,
    SNOW = 5000,
    FLURRIES = 5001,
    LIGHT_SNOW = 5100,
    HEAVY_SNOW = 5101,
    FREEZING_DRIZZLE = 6000,
    FREEZING_RAIN = 6001,
    LIGHT_FREEZING_RAIN = 6200,
    HEAVY_FREEZING_RAIN = 6201,
    ICE_PELLETS = 7000,
    HEAVY_ICE_PELLETS = 7101,
    LIGHT_ICE_PELLETS = 7102,
    THUNDERSTORM = 8000
}

// Component props
export interface WeatherForecastWidgetProps {
    location?: string | WeatherLocation;
    units?: TemperatureUnit;
    showForecast?: boolean;
    daysToShow?: number;
    className?: string;
    onLocationChange?: (location: WeatherLocation) => void;
}