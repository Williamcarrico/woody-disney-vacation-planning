/**
 * Comprehensive type definitions for the ThemeParks.wiki API responses
 * These types ensure type safety when working with park data throughout the application
 */

// Base Entity interface that all entities inherit from
export interface Entity {
    id: string;
    name: string;
    entityType: string;
    slug: string;
}

// Geo-coordinates interface
export interface Coordinates {
    latitude: number;
    longitude: number;
}

// Destination (Resort) entity
export interface Destination extends Entity {
    entityType: 'DESTINATION';
    parks: Park[];
    location?: Coordinates;
    timezone: string;
    description?: string;
    images?: Image[];
}

// Park entity
export interface Park extends Entity {
    entityType: 'PARK';
    destination: string; // Parent destination ID
    location: Coordinates;
    timezone: string;
    description?: string;
    address?: Address;
    images?: Image[];
    attractionGroups?: AttractionGroup[];
    fastPass?: boolean;
    langOptions?: string[];
    operating?: OperatingHours;
}

// Attraction entity
export interface Attraction extends Entity {
    entityType: 'ATTRACTION';
    parkId: string; // Parent park ID
    attractionType: AttractionType;
    location?: Coordinates;
    description?: string;
    images?: Image[];
    status?: AttractionStatus;
    tags?: string[];
    fastPass?: boolean;
    heightRequirement?: HeightRequirement;
    waitTime?: WaitTime;
    operatingHours?: OperatingHours;
    lastUpdate?: string; // ISO date string
    priority?: number; // For planning prioritization
    duration?: number; // Typical experience duration in minutes
}

// Attraction types
export enum AttractionType {
    RIDE = 'RIDE',
    SHOW = 'SHOW',
    MEET_AND_GREET = 'MEET_AND_GREET',
    ENTERTAINMENT = 'ENTERTAINMENT',
    EXHIBIT = 'EXHIBIT',
    PARADE = 'PARADE',
    OTHER = 'OTHER'
}

// Attraction status
export enum AttractionStatus {
    OPERATING = 'OPERATING',
    DOWN = 'DOWN',
    CLOSED = 'CLOSED',
    REFURBISHMENT = 'REFURBISHMENT',
    SEASONAL_CLOSURE = 'SEASONAL_CLOSURE'
}

// Attraction group (land or themed area)
export interface AttractionGroup {
    id: string;
    name: string;
    attractions: string[]; // Array of attraction IDs
}

// Height requirement
export interface HeightRequirement {
    min?: number; // Minimum height in cm
    max?: number; // Maximum height in cm (rare)
    unit: 'cm' | 'in';
    description?: string; // Text description
}

// Wait time data
export interface WaitTime {
    standby: number; // In minutes, -1 if unavailable
    singleRider?: number; // In minutes, -1 if unavailable
    posted: number; // Posted wait time
    actual?: number; // Actual wait time if available
    lastUpdate: string; // ISO date string
    historical?: WaitTimeHistorical;
}

// Historical wait time data
export interface WaitTimeHistorical {
    averageByHour: Record<string, number>; // Average by hour of day
    averageByDay: Record<string, number>; // Average by day of week
    averageByMonth: Record<string, number>; // Average by month
    averageBySeasonality: Record<string, number>; // Average by season/crowd level
    trends: WaitTimeTrend[]; // Trend analysis
}

// Wait time trend
export interface WaitTimeTrend {
    startTime: string; // ISO date string
    endTime: string; // ISO date string
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    value: number; // Rate of change
}

// Operating hours
export interface OperatingHours {
    openingTime: string; // ISO date string
    closingTime: string; // ISO date string
    type: 'REGULAR' | 'EXTRA_HOURS' | 'SPECIAL_EVENT';
    specialHoursDescription?: string;
}

// Address
export interface Address {
    line1?: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

// Image
export interface Image {
    url: string;
    alt?: string;
    type: 'ICON' | 'BANNER' | 'BACKGROUND' | 'DETAIL';
    width?: number;
    height?: number;
}

// Live data response
export interface LiveData {
    attractions: {
        [id: string]: {
            name: string;
            status: AttractionStatus;
            waitTime?: WaitTime;
            lastUpdate: string; // ISO date string
        }
    };
    lastUpdate: string; // ISO date string
}

// Schedule data response
export interface ScheduleData {
    schedule: {
        date: string; // YYYY-MM-DD
        openingTime: string; // ISO date string
        closingTime: string; // ISO date string
        type: 'REGULAR' | 'EXTRA_HOURS' | 'SPECIAL_EVENT';
        description?: string;
    }[];
}

// Showtime data
export interface ShowtimeData {
    shows: {
        [id: string]: {
            name: string;
            times: string[]; // Array of ISO date strings
            duration?: number; // In minutes
            description?: string;
        }
    };
    date: string; // YYYY-MM-DD
}

// Virtual Queue data
export interface VirtualQueueData {
    virtualQueues: VirtualQueue[];
    lastUpdate: string; // ISO date string
}

// Virtual Queue
export interface VirtualQueue {
    id: string;
    name: string;
    parkId: string;
    status: 'AVAILABLE' | 'PAUSED' | 'FULL' | 'CLOSED';
    nextDropTime?: string; // ISO date string
    returnTimeStart?: string; // ISO date string
    returnTimeEnd?: string; // ISO date string
    lastUpdate: string; // ISO date string
}

// Lightning Lane / Genie+ data
export interface LightningLaneData {
    attractions: {
        [id: string]: {
            name: string;
            parkId: string;
            type: 'INDIVIDUAL' | 'GENIE_PLUS';
            status: 'AVAILABLE' | 'FULL' | 'CLOSED';
            returnTimeStart?: string; // ISO date string
            returnTimeEnd?: string; // ISO date string
            price?: number; // Price in USD for Individual Lightning Lane
            lastUpdate: string; // ISO date string
        }
    };
    lastUpdate: string; // ISO date string
}

// Dining venue
export interface DiningVenue extends Entity {
    entityType: 'DINING';
    parkId: string;
    location?: Coordinates;
    description?: string;
    cuisineType?: string[];
    diningType: 'TABLE_SERVICE' | 'QUICK_SERVICE' | 'SNACK' | 'LOUNGE';
    priceRange?: 1 | 2 | 3 | 4; // $ to $$$$
    reservations?: boolean;
    mobileOrder?: boolean;
    images?: Image[];
    operatingHours?: OperatingHours;
    popularity?: number; // 1-10 scale
}

// Dining availability data
export interface DiningAvailabilityData {
    venues: {
        [id: string]: {
            name: string;
            available: boolean;
            nextAvailableTime?: string; // ISO date string
            availableTimeSlots?: string[]; // Array of ISO date strings
        }
    };
    date: string; // YYYY-MM-DD
    partySize: number;
    lastUpdate: string; // ISO date string
}

// Event data
export interface EventData {
    events: Event[];
    lastUpdate: string; // ISO date string
}

// Event
export interface Event extends Entity {
    entityType: 'EVENT';
    parkId: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    description?: string;
    location?: Coordinates | string;
    type: 'SEASONAL' | 'SPECIAL' | 'AFTER_HOURS' | 'FESTIVAL';
    ticketRequired?: boolean;
    price?: number; // In USD
    images?: Image[];
}

// Weather data
export interface WeatherData {
    current: {
        temperature: number;
        condition: string;
        humidity: number;
        precipitation: number;
        windSpeed: number;
        icon: string;
    };
    forecast: {
        date: string; // YYYY-MM-DD
        highTemperature: number;
        lowTemperature: number;
        condition: string;
        precipitationChance: number;
        icon: string;
    }[];
    units: 'IMPERIAL' | 'METRIC';
    lastUpdate: string; // ISO date string
}

// Crowd level data
export interface CrowdLevelData {
    historical: {
        date: string; // YYYY-MM-DD
        level: number; // 1-10 scale
    }[];
    forecast: {
        date: string; // YYYY-MM-DD
        level: number; // 1-10 scale
        confidence: number; // 0-1 scale
    }[];
    lastUpdate: string; // ISO date string
}

// Resort
export interface Resort extends Entity {
    entityType: 'RESORT';
    destinationId: string;
    location: Coordinates;
    description?: string;
    category: 'VALUE' | 'MODERATE' | 'DELUXE' | 'VILLA' | 'CAMPGROUND';
    amenities: string[];
    roomTypes: {
        name: string;
        maxOccupancy: number;
        description?: string;
    }[];
    images?: Image[];
    transportationOptions?: string[];
}