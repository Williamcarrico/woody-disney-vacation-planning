import { Entity, Image } from './api';

export type EventCategory =
    | 'SEASONAL'    // General seasonal events
    | 'HOLIDAY'     // Holiday events (Christmas, Halloween)
    | 'FESTIVAL'    // EPCOT festivals
    | 'CONCERT'     // Concert series
    | 'AFTER_HOURS' // Special after-hours events
    | 'MARATHON'    // runDisney events
    | 'SPECIAL';    // Other special events

export type EventLocation =
    | 'MAGIC_KINGDOM'
    | 'EPCOT'
    | 'HOLLYWOOD_STUDIOS'
    | 'ANIMAL_KINGDOM'
    | 'TYPHOON_LAGOON'
    | 'BLIZZARD_BEACH'
    | 'DISNEY_SPRINGS'
    | 'MULTIPLE';

// Base Annual Event interface
export interface AnnualEvent extends Entity {
    entityType: 'EVENT';
    name: string;
    shortName?: string; // Optional shorter name for UI display
    description: string;
    category: EventCategory;
    location: EventLocation;
    yearStart: number; // Year when event first started (e.g., 1995)
    isActive: boolean; // Whether the event is still active

    // Current year info
    currentYearStartDate?: string; // ISO date string
    currentYearEndDate?: string; // ISO date string
    ticketRequired: boolean;
    price?: number; // In USD
    url?: string; // Link to official website
    images: Image[];
}

// Special interface for EPCOT festivals
export interface EpcotFestival extends AnnualEvent {
    category: 'FESTIVAL';
    location: 'EPCOT';
    concertSeries?: string; // Name of the concert series (Garden Rocks, Eat To The Beat, etc.)
    marketplaces?: number; // Number of food marketplaces
    features?: string[]; // Special features of the festival
}

// Holiday event interface
export interface HolidayEvent extends AnnualEvent {
    category: 'HOLIDAY';
    holidayType: 'HALLOWEEN' | 'CHRISTMAS' | 'OTHER';
    specialEntertainment?: string[];
}

// runDisney event interface
export interface RunDisneyEvent extends AnnualEvent {
    category: 'MARATHON';
    raceTypes: string[]; // e.g., ["5K", "10K", "Half Marathon", "Marathon"]
    coursePath?: string[]; // Parks and areas the race runs through
    registrationDate?: string; // When registration opens
}

// Type guard functions
export function isEpcotFestival(event: AnnualEvent): event is EpcotFestival {
    return event.category === 'FESTIVAL' && event.location === 'EPCOT';
}

export function isHolidayEvent(event: AnnualEvent): event is HolidayEvent {
    return event.category === 'HOLIDAY';
}

export function isRunDisneyEvent(event: AnnualEvent): event is RunDisneyEvent {
    return event.category === 'MARATHON';
}