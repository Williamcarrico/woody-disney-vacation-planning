/**
 * @fileoverview Comprehensive type definitions for the Disney Vacation Planning API responses.
 * This module provides complete type safety when working with Disney park data, attraction information,
 * wait times, dining venues, events, weather data, and all other API responses throughout the application.
 *
 * These types ensure type safety and provide IntelliSense support for all external API integrations
 * including ThemeParks.wiki API, Disney official APIs, weather services, and internal application APIs.
 *
 * @module api-types
 * @version 2.0.0
 * @author Disney Vacation Planning Team
 * @since 2024-01-01
 *
 * @requires None - Pure TypeScript type definitions
 *
 * @example
 * // Import specific types for type safety
 * import { Park, Attraction, WaitTime } from '@/types/api';
 *
 * const park: Park = {
 *   id: 'mk',
 *   name: 'Magic Kingdom',
 *   entityType: 'PARK',
 *   // ... other required properties
 * };
 *
 * @see {@link https://api.themeparks.wiki/} - ThemeParks.wiki API Documentation
 * @see {@link https://disneyworld.disney.go.com/} - Disney World Official Site
 */

/**
 * Base entity interface that all Disney entities inherit from.
 * This provides common properties shared across all park entities including
 * destinations, parks, attractions, dining venues, and events.
 *
 * @interface Entity
 * @template T - The specific entity type (for type discrimination)
 *
 * @property {string} id - Unique identifier for the entity across the entire system.
 *   Format varies by entity type (e.g., 'mk' for Magic Kingdom, 'wdw_attr_123' for attractions)
 * @property {string} name - Human-readable display name of the entity.
 *   This is the name shown to users in the interface
 * @property {string} entityType - Discriminator property for type narrowing.
 *   Used for runtime type checking and TypeScript type guards
 * @property {string} slug - URL-friendly version of the name.
 *   Used for routing and SEO-friendly URLs
 *
 * @example
 * // Base entity usage
 * const entity: Entity = {
 *   id: 'space-mountain',
 *   name: 'Space Mountain',
 *   entityType: 'ATTRACTION',
 *   slug: 'space-mountain'
 * };
 *
 * @example
 * // Type guard usage
 * function isAttraction(entity: Entity): entity is Attraction {
 *   return entity.entityType === 'ATTRACTION';
 * }
 *
 * @since 1.0.0
 * @see {@link Park} - Park entity that extends this interface
 * @see {@link Attraction} - Attraction entity that extends this interface
 * @see {@link DiningVenue} - Dining venue entity that extends this interface
 */
export interface Entity {
    id: string;
    name: string;
    entityType: string;
    slug: string;
}

/**
 * Geographic coordinates interface for location-based data.
 * Represents a specific point on Earth using standard GPS coordinates.
 * All coordinates use the WGS84 datum (World Geodetic System 1984).
 *
 * @interface Coordinates
 *
 * @property {number} latitude - Latitude coordinate in decimal degrees.
 *   Range: -90 to +90 (negative for South, positive for North)
 *   Example: 28.3772 (Magic Kingdom latitude)
 * @property {number} longitude - Longitude coordinate in decimal degrees.
 *   Range: -180 to +180 (negative for West, positive for East)
 *   Example: -81.5707 (Magic Kingdom longitude)
 *
 * @example
 * // Magic Kingdom coordinates
 * const magicKingdomLocation: Coordinates = {
 *   latitude: 28.3772,
 *   longitude: -81.5707
 * };
 *
 * @example
 * // EPCOT coordinates
 * const epcotLocation: Coordinates = {
 *   latitude: 28.3747,
 *   longitude: -81.5494
 * };
 *
 * @since 1.0.0
 * @see {@link https://en.wikipedia.org/wiki/World_Geodetic_System} - WGS84 Reference
 */
export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Destination (Resort) entity representing a Disney resort complex.
 * A destination contains multiple parks and represents a complete Disney resort
 * such as Walt Disney World Resort or Disneyland Resort.
 *
 * @interface Destination
 * @extends {Entity}
 *
 * @property {'DESTINATION'} entityType - Type discriminator, always 'DESTINATION'
 * @property {Park[]} parks - Array of parks contained within this destination.
 *   For Walt Disney World, this includes Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom
 * @property {Coordinates} [location] - Geographic center point of the destination.
 *   Optional as some destinations may not have a single center point
 * @property {string} timezone - IANA timezone identifier for the destination.
 *   Example: 'America/New_York' for Walt Disney World
 * @property {string} [description] - Optional detailed description of the destination.
 *   Marketing copy or historical information about the resort
 * @property {Image[]} [images] - Optional array of promotional images for the destination.
 *   Includes hero images, park maps, resort photos
 *
 * @example
 * const waltDisneyWorld: Destination = {
 *   id: 'wdw',
 *   name: 'Walt Disney World Resort',
 *   entityType: 'DESTINATION',
 *   slug: 'walt-disney-world',
 *   parks: [magicKingdom, epcot, hollywoodStudios, animalKingdom],
 *   location: { latitude: 28.3852, longitude: -81.5639 },
 *   timezone: 'America/New_York',
 *   description: 'The Most Magical Place on Earth...'
 * };
 *
 * @since 1.0.0
 * @see {@link Park} - Individual parks within the destination
 * @see {@link Entity} - Base interface this extends
 */
export interface Destination extends Entity {
    entityType: 'DESTINATION';
    parks: Park[];
    location?: Coordinates;
    timezone: string;
    description?: string;
    images?: Image[];
}

/**
 * Park entity representing an individual Disney theme park.
 * Each park contains attractions, dining venues, and entertainment offerings.
 *
 * @interface Park
 * @extends {Entity}
 *
 * @property {'PARK'} entityType - Type discriminator, always 'PARK'
 * @property {string} destination - Parent destination ID that contains this park.
 *   Links the park to its resort complex
 * @property {Coordinates} location - Geographic coordinates of the park entrance.
 *   Used for mapping and navigation purposes
 * @property {string} timezone - IANA timezone identifier for park operations.
 *   Inherits from destination but can be overridden
 * @property {string} [description] - Optional detailed description of the park.
 *   Includes park history, themes, and unique features
 * @property {Address} [address] - Optional physical mailing address of the park.
 *   Used for GPS navigation and contact information
 * @property {Image[]} [images] - Optional array of park images.
 *   Includes park maps, attraction photos, themed area images
 * @property {AttractionGroup[]} [attractionGroups] - Optional themed areas within the park.
 *   Example: Tomorrowland, Fantasyland in Magic Kingdom
 * @property {boolean} [fastPass] - Optional flag indicating if park supports FastPass/Genie+ system.
 *   Determines if skip-the-line services are available
 * @property {string[]} [langOptions] - Optional array of supported languages for park content.
 *   ISO language codes (e.g., ['en', 'es', 'fr'])
 * @property {OperatingHours} [operating] - Optional current operating hours.
 *   Today's park hours if available
 *
 * @example
 * const magicKingdom: Park = {
 *   id: 'mk',
 *   name: 'Magic Kingdom Park',
 *   entityType: 'PARK',
 *   slug: 'magic-kingdom',
 *   destination: 'wdw',
 *   location: { latitude: 28.3772, longitude: -81.5707 },
 *   timezone: 'America/New_York',
 *   fastPass: true,
 *   langOptions: ['en', 'es'],
 *   attractionGroups: [
 *     { id: 'tomorrowland', name: 'Tomorrowland', attractions: ['space-mountain'] }
 *   ]
 * };
 *
 * @since 1.0.0
 * @see {@link Destination} - Parent destination containing this park
 * @see {@link AttractionGroup} - Themed areas within the park
 * @see {@link OperatingHours} - Park operating hours structure
 */
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

/**
 * Attraction entity representing rides, shows, and experiences within a park.
 * This is the core entity for all guest experiences including rides, shows,
 * character meet & greets, parades, and other entertainment offerings.
 *
 * @interface Attraction
 * @extends {Entity}
 *
 * @property {'ATTRACTION'} entityType - Type discriminator, always 'ATTRACTION'
 * @property {string} parkId - Parent park ID containing this attraction.
 *   Links attraction to its containing park
 * @property {AttractionType} attractionType - Category of attraction experience.
 *   Determines how the attraction is displayed and filtered
 * @property {Coordinates} [location] - Optional GPS coordinates within the park.
 *   Used for park maps and navigation
 * @property {string} [description] - Optional detailed description of the attraction.
 *   Includes ride story, experience details, accessibility information
 * @property {Image[]} [images] - Optional array of attraction images.
 *   Promotional photos, ride vehicles, themed environments
 * @property {AttractionStatus} [status] - Optional current operational status.
 *   Real-time status for guest planning
 * @property {string[]} [tags] - Optional searchable tags for categorization.
 *   Examples: ['thrill', 'family-friendly', 'indoor', 'water']
 * @property {boolean} [fastPass] - Optional FastPass/Genie+ availability.
 *   Indicates if skip-the-line service is offered
 * @property {HeightRequirement} [heightRequirement] - Optional height restrictions.
 *   Safety requirements for ride access
 * @property {WaitTime} [waitTime] - Optional current wait time information.
 *   Real-time and historical wait data
 * @property {OperatingHours} [operatingHours] - Optional attraction-specific hours.
 *   May differ from park hours for shows or seasonal attractions
 * @property {string} [lastUpdate] - Optional ISO timestamp of last data update.
 *   Used for cache invalidation and data freshness
 * @property {number} [priority] - Optional planning priority score (1-10).
 *   Higher numbers indicate higher guest priority
 * @property {number} [duration] - Optional experience duration in minutes.
 *   Typical time from queue entry to exit
 *
 * @example
 * const spaceMountain: Attraction = {
 *   id: 'space-mountain',
 *   name: 'Space Mountain',
 *   entityType: 'ATTRACTION',
 *   slug: 'space-mountain',
 *   parkId: 'mk',
 *   attractionType: AttractionType.RIDE,
 *   fastPass: true,
 *   heightRequirement: { min: 112, unit: 'cm' },
 *   tags: ['thrill', 'indoor', 'dark'],
 *   priority: 9,
 *   duration: 3
 * };
 *
 * @since 1.0.0
 * @see {@link AttractionType} - Enumeration of attraction categories
 * @see {@link AttractionStatus} - Operational status values
 * @see {@link WaitTime} - Wait time data structure
 * @see {@link HeightRequirement} - Height restriction interface
 */
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

/**
 * Enumeration of attraction experience types.
 * Used for categorization, filtering, and appropriate display of attractions.
 *
 * @enum {string} AttractionType
 *
 * @property {string} RIDE - Physical rides including roller coasters, dark rides, water rides.
 *   Examples: Space Mountain, Pirates of the Caribbean, Splash Mountain
 * @property {string} SHOW - Scheduled performances including stage shows, films, presentations.
 *   Examples: Frozen Ever After, Festival of the Lion King
 * @property {string} MEET_AND_GREET - Character interaction experiences.
 *   Examples: Mickey's Toontown, Princess Fairytale Hall
 * @property {string} ENTERTAINMENT - Live entertainment, parades, fireworks.
 *   Examples: Main Street Electrical Parade, Happily Ever After
 * @property {string} EXHIBIT - Educational displays, interactive experiences, museums.
 *   Examples: Walt Disney Presents, Innoventions
 * @property {string} PARADE - Moving entertainment along park pathways.
 *   Examples: Festival of Fantasy Parade, Mickey's Very Merry Christmas Parade
 * @property {string} OTHER - Miscellaneous experiences not fitting other categories.
 *   Examples: unique park features, temporary installations
 *
 * @example
 * // Type checking attraction categories
 * if (attraction.attractionType === AttractionType.RIDE) {
 *   // Handle ride-specific logic (wait times, height requirements)
 * } else if (attraction.attractionType === AttractionType.SHOW) {
 *   // Handle show-specific logic (showtimes, seating)
 * }
 *
 * @example
 * // Filtering attractions by type
 * const rides = attractions.filter(attr =>
 *   attr.attractionType === AttractionType.RIDE
 * );
 *
 * @since 1.0.0
 * @see {@link Attraction} - Attraction interface using this enum
 */
export enum AttractionType {
    RIDE = 'RIDE',
    SHOW = 'SHOW',
    MEET_AND_GREET = 'MEET_AND_GREET',
    ENTERTAINMENT = 'ENTERTAINMENT',
    EXHIBIT = 'EXHIBIT',
    PARADE = 'PARADE',
    OTHER = 'OTHER'
}

/**
 * Enumeration of attraction operational statuses.
 * Provides real-time operational information for guest planning and safety.
 *
 * @enum {string} AttractionStatus
 *
 * @property {string} OPERATING - Attraction is open and accepting guests.
 *   Normal operation with posted wait times
 * @property {string} DOWN - Attraction is temporarily closed due to technical issues.
 *   Usually brief closures for maintenance or weather
 * @property {string} CLOSED - Attraction is closed for the day or extended period.
 *   May indicate end of operating hours or scheduled closure
 * @property {string} REFURBISHMENT - Attraction is closed for planned maintenance/updates.
 *   Extended closures for major improvements or seasonal maintenance
 * @property {string} SEASONAL_CLOSURE - Attraction is closed due to seasonal operations.
 *   Weather-dependent closures or seasonal scheduling
 *
 * @example
 * // Status-based UI logic
 * const getStatusColor = (status: AttractionStatus) => {
 *   switch (status) {
 *     case AttractionStatus.OPERATING: return 'green';
 *     case AttractionStatus.DOWN: return 'yellow';
 *     case AttractionStatus.CLOSED: return 'red';
 *     case AttractionStatus.REFURBISHMENT: return 'orange';
 *     case AttractionStatus.SEASONAL_CLOSURE: return 'gray';
 *   }
 * };
 *
 * @example
 * // Filtering available attractions
 * const availableAttractions = attractions.filter(attr =>
 *   attr.status === AttractionStatus.OPERATING
 * );
 *
 * @since 1.0.0
 * @see {@link Attraction} - Attraction interface using this enum
 */
export enum AttractionStatus {
    OPERATING = 'OPERATING',
    DOWN = 'DOWN',
    CLOSED = 'CLOSED',
    REFURBISHMENT = 'REFURBISHMENT',
    SEASONAL_CLOSURE = 'SEASONAL_CLOSURE'
}

/**
 * Attraction group interface representing themed areas or lands within a park.
 * Groups related attractions by location, theme, or operational characteristics.
 *
 * @interface AttractionGroup
 *
 * @property {string} id - Unique identifier for the themed area.
 *   URL-friendly slug for the land or area
 * @property {string} name - Display name of the themed area.
 *   Example: 'Tomorrowland', 'Fantasyland', 'Star Wars: Galaxy's Edge'
 * @property {string[]} attractions - Array of attraction IDs within this area.
 *   References to attractions contained in this themed land
 *
 * @example
 * const tomorrowland: AttractionGroup = {
 *   id: 'tomorrowland',
 *   name: 'Tomorrowland',
 *   attractions: ['space-mountain', 'buzz-lightyear', 'monsters-inc-laugh-floor']
 * };
 *
 * @example
 * // Finding attractions in a specific land
 * const getAttractionsInLand = (landId: string, allAttractions: Attraction[]) => {
 *   const land = park.attractionGroups?.find(group => group.id === landId);
 *   return allAttractions.filter(attr =>
 *     land?.attractions.includes(attr.id)
 *   );
 * };
 *
 * @since 1.0.0
 * @see {@link Park} - Parks contain attraction groups
 * @see {@link Attraction} - Individual attractions within groups
 */
export interface AttractionGroup {
    id: string;
    name: string;
    attractions: string[]; // Array of attraction IDs
}

/**
 * Height requirement interface for attraction safety restrictions.
 * Defines minimum and maximum height requirements for guest safety.
 *
 * @interface HeightRequirement
 *
 * @property {number} [min] - Optional minimum height requirement.
 *   Guests must be at least this tall to ride alone
 * @property {number} [max] - Optional maximum height requirement.
 *   Rare but used for some children's attractions
 * @property {'cm' | 'in'} unit - Unit of measurement for height values.
 *   Centimeters for metric, inches for imperial
 * @property {string} [description] - Optional text description of requirements.
 *   Human-readable explanation including supervision rules
 *
 * @example
 * const spaceMountainHeight: HeightRequirement = {
 *   min: 112,
 *   unit: 'cm',
 *   description: 'Guests must be 44 inches (112 cm) or taller to ride'
 * };
 *
 * @example
 * const dumboHeight: HeightRequirement = {
 *   unit: 'cm',
 *   description: 'Children under 7 must be accompanied by an adult'
 * };
 *
 * @example
 * // Converting between units
 * const convertHeight = (req: HeightRequirement, targetUnit: 'cm' | 'in') => {
 *   if (!req.min) return req;
 *
 *   const minValue = req.unit === 'cm' && targetUnit === 'in'
 *     ? Math.round(req.min / 2.54)
 *     : req.unit === 'in' && targetUnit === 'cm'
 *     ? Math.round(req.min * 2.54)
 *     : req.min;
 *
 *   return { ...req, min: minValue, unit: targetUnit };
 * };
 *
 * @since 1.0.0
 * @see {@link Attraction} - Attractions may have height requirements
 */
export interface HeightRequirement {
    min?: number; // Minimum height in cm
    max?: number; // Maximum height in cm (rare)
    unit: 'cm' | 'in';
    description?: string; // Text description
}

/**
 * Wait time data interface for attraction queue information.
 * Provides current wait times, historical averages, and trend analysis
 * for guest planning and operational insights.
 *
 * @interface WaitTime
 *
 * @property {number} standby - Current standby wait time in minutes.
 *   -1 indicates wait time is unavailable or attraction is closed
 * @property {number} [singleRider] - Optional single rider wait time in minutes.
 *   -1 indicates single rider is unavailable or closed
 * @property {number} posted - Posted wait time displayed at attraction.
 *   Official time shown to guests at attraction entrance
 * @property {number} [actual] - Optional actual measured wait time.
 *   Real guest experience time if available from crowd-sourced data
 * @property {string} lastUpdate - ISO timestamp of last data update.
 *   Used for data freshness and cache management
 * @property {WaitTimeHistorical} [historical] - Optional historical wait time patterns.
 *   Analytics data for planning and prediction
 *
 * @example
 * const spaceMountainWait: WaitTime = {
 *   standby: 75,
 *   singleRider: 25,
 *   posted: 80,
 *   actual: 65,
 *   lastUpdate: '2024-01-15T14:30:00Z',
 *   historical: {
 *     averageByHour: { '14': 70, '15': 85 },
 *     // ... other historical data
 *   }
 * };
 *
 * @example
 * // Check if wait time data is fresh
 * const isWaitTimeFresh = (waitTime: WaitTime, maxAgeMinutes = 5) => {
 *   const lastUpdate = new Date(waitTime.lastUpdate);
 *   const now = new Date();
 *   const ageMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
 *   return ageMinutes <= maxAgeMinutes;
 * };
 *
 * @since 1.0.0
 * @see {@link WaitTimeHistorical} - Historical wait time patterns
 * @see {@link Attraction} - Attractions contain wait time data
 */
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

// Add the new interface definition
export interface HistoricalWaitTimeData {
    timestamp: string; // Or Date, depending on API response format
    waitTime: number | null; // Wait time in minutes, null if unavailable
    // Add other potential fields if known, e.g., status, condition
}