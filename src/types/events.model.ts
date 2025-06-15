/**
 * Unified Events Model for Disney World
 * Merges calendar events and annual events with proper temporal handling
 */

import { Entity, Image } from './api';

// =============================================================================
// CORE ENUMS AND TYPES
// =============================================================================

/** Category classification for all events */
export type EventCategory =
    // Annual/Recurring Events
    | 'SEASONAL'    // General seasonal events
    | 'HOLIDAY'     // Holiday events (Christmas, Halloween)
    | 'FESTIVAL'    // EPCOT festivals
    | 'CONCERT'     // Concert series
    | 'AFTER_HOURS' // Special after-hours events
    | 'MARATHON'    // runDisney events
    | 'SPECIAL'     // Other special events
    
    // Personal Calendar Events
    | 'PARK'        // Park visits
    | 'DINING'      // Dining reservations
    | 'RESORT'      // Resort activities
    | 'TRAVEL'      // Transportation/travel
    | 'REST'        // Rest/break periods
    | 'NOTE'        // Personal notes
    | 'FASTPASS'    // Lightning Lane/FastPass
    | 'PHOTO'       // Photo opportunities
    | 'SHOPPING'    // Shopping activities
    | 'ENTERTAINMENT'; // Entertainment events

/** Disney World locations where events can occur */
export type EventLocation =
    | 'MAGIC_KINGDOM'
    | 'EPCOT'
    | 'HOLLYWOOD_STUDIOS'
    | 'ANIMAL_KINGDOM'
    | 'TYPHOON_LAGOON'
    | 'BLIZZARD_BEACH'
    | 'DISNEY_SPRINGS'
    | 'BOARDWALK'
    | 'RESORT'
    | 'MULTIPLE'
    | 'OTHER';

/** Event priority levels */
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

/** Event status for calendar items */
export type EventStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified';

/** Recurrence patterns for events */
export type RecurrencePattern = 
    | 'none'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'custom';

/** Weather conditions */
export type WeatherCondition = 
    | 'sunny' 
    | 'cloudy' 
    | 'rainy' 
    | 'stormy' 
    | 'snowy' 
    | 'foggy' 
    | 'partly-cloudy' 
    | 'windy';

/** Moon phases */
export type MoonPhase = 
    | 'new' 
    | 'waxing-crescent' 
    | 'first-quarter' 
    | 'waxing-gibbous' 
    | 'full' 
    | 'waning-gibbous' 
    | 'last-quarter' 
    | 'waning-crescent';

/** Transportation types */
export type TransportationType = 
    | 'bus' 
    | 'monorail' 
    | 'boat' 
    | 'skyliner' 
    | 'car' 
    | 'uber' 
    | 'walk';

/** Reminder types */
export type ReminderType = 'notification' | 'email' | 'sms';

/** Attachment types */
export type AttachmentType = 'image' | 'document' | 'link';

/** Event action types for history */
export type EventAction = 'created' | 'updated' | 'deleted' | 'shared' | 'status_changed';

// =============================================================================
// DATE AND TIME HANDLING
// =============================================================================

/** Comprehensive date/time information with timezone support */
export interface EventDateTime {
    /** ISO 8601 date string (YYYY-MM-DD) */
    date: string;
    /** Start time in HH:MM format (24-hour) */
    startTime?: string;
    /** End time in HH:MM format (24-hour) */
    endTime?: string;
    /** Timezone (defaults to America/New_York for Disney World) */
    timezone: string;
    /** Whether this is an all-day event */
    allDay: boolean;
    /** Duration in minutes (calculated or explicit) */
    durationMinutes?: number;
}

/** Recurrence rule using RFC 5545 RRULE format */
export interface RecurrenceRule {
    /** Recurrence pattern */
    pattern: RecurrencePattern;
    /** Frequency (for custom patterns) */
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    /** Interval between occurrences */
    interval?: number;
    /** Days of the week (1=Monday, 7=Sunday) */
    byWeekDay?: number[];
    /** Days of the month (1-31) */
    byMonthDay?: number[];
    /** Months of the year (1-12) */
    byMonth?: number[];
    /** End date for recurrence */
    until?: string;
    /** Number of occurrences */
    count?: number;
    /** RFC 5545 RRULE string for complex patterns */
    rrule?: string;
}

/** Date range for events or filters */
export interface DateRange {
    /** Start date in ISO format */
    startDate: string;
    /** End date in ISO format */
    endDate: string;
    /** Optional timezone */
    timezone?: string;
}

// =============================================================================
// NESTED EVENT INTERFACES
// =============================================================================

/** Reminder configuration */
export interface EventReminder {
    /** Whether reminders are enabled */
    enabled: boolean;
    /** Time before event (in minutes) */
    minutesBefore: number;
    /** Type of reminder */
    type: ReminderType;
    /** Custom message */
    message?: string;
}

/** Reservation details for dining/experiences */
export interface EventReservation {
    /** Reservation ID */
    id: string;
    /** Location/restaurant name */
    name: string;
    /** Reservation time */
    time: string;
    /** Party size */
    partySize: number;
    /** Whether confirmed */
    confirmed: boolean;
    /** Confirmation number */
    confirmationNumber?: string;
    /** Special requests */
    specialRequests?: string;
    /** Cost information */
    cost?: number;
    /** Whether prepaid */
    prepaid?: boolean;
    /** Cancellation policy */
    cancellationPolicy?: string;
}

/** Weather information */
export interface EventWeather {
    /** Weather condition */
    condition: WeatherCondition;
    /** High temperature (Fahrenheit) */
    highTemp: number;
    /** Low temperature (Fahrenheit) */
    lowTemp: number;
    /** Precipitation chance (0-100) */
    precipitation: number;
    /** Humidity percentage */
    humidity: number;
    /** Wind speed (mph) */
    windSpeed: number;
    /** UV index */
    uvIndex: number;
    /** Visibility (miles) */
    visibility: number;
    /** Sunrise time */
    sunrise: string;
    /** Sunset time */
    sunset: string;
    /** Moon phase */
    moonPhase: MoonPhase;
}

/** Budget tracking */
export interface EventBudget {
    /** Estimated cost */
    estimated: number;
    /** Actual cost */
    actual?: number;
    /** Currency code */
    currency: string;
    /** Budget category */
    category: string;
    /** Notes about expenses */
    notes?: string;
}

/** Transportation details */
export interface EventTransportation {
    /** Transportation type */
    type: TransportationType;
    /** Pickup location */
    pickupLocation?: string;
    /** Pickup time */
    pickupTime?: string;
    /** Estimated duration (minutes) */
    duration?: number;
    /** Cost */
    cost?: number;
    /** Confirmation details */
    confirmation?: string;
}

/** Checklist item */
export interface EventChecklistItem {
    /** Unique item ID */
    id: string;
    /** Task description */
    task: string;
    /** Whether completed */
    completed: boolean;
    /** Due time within the event */
    dueTime?: string;
    /** Priority level */
    priority?: 'low' | 'medium' | 'high';
}

/** File or link attachment */
export interface EventAttachment {
    /** Attachment type */
    type: AttachmentType;
    /** URL or file path */
    url: string;
    /** Display title */
    title: string;
    /** Thumbnail image */
    thumbnail?: string;
    /** File size (bytes) */
    size?: number;
    /** MIME type */
    mimeType?: string;
}

/** User information */
export interface EventUser {
    /** User ID */
    id: string;
    /** Email address */
    email: string;
    /** Display name */
    displayName: string;
    /** Profile photo URL */
    photoURL?: string;
}

/** Event history entry */
export interface EventHistoryEntry {
    /** History entry ID */
    id: string;
    /** Associated event ID */
    eventId: string;
    /** User who made the change */
    userId: string;
    /** Action performed */
    action: EventAction;
    /** Changed fields */
    changes: Record<string, unknown>;
    /** When the change occurred */
    timestamp: string;
    /** User details */
    user?: EventUser;
}

// =============================================================================
// BASE EVENT INTERFACES
// =============================================================================

/** Base event interface with common fields */
export interface BaseEvent {
    /** Unique event identifier */
    id: string;
    /** Event title/name */
    title: string;
    /** Event description */
    description: string;
    /** Event category */
    category: EventCategory;
    /** Primary location */
    location: EventLocation;
    /** Date and time information */
    dateTime: EventDateTime;
    /** Event images */
    images: Image[];
    /** Tags for organization */
    tags?: string[];
    /** Custom metadata */
    metadata?: Record<string, unknown>;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

// =============================================================================
// ANNUAL/RECURRING EVENTS
// =============================================================================

/** Annual Disney World events (festivals, holidays, etc.) */
export interface AnnualEvent extends BaseEvent, Entity {
    entityType: 'EVENT';
    /** Short name for UI display */
    shortName?: string;
    /** Year when event first started */
    yearStart: number;
    /** Whether the event is still active */
    isActive: boolean;
    /** Current year's date range */
    currentYearDates?: DateRange;
    /** Whether tickets are required */
    ticketRequired: boolean;
    /** Ticket price (USD) */
    price?: number;
    /** Official website URL */
    url?: string;
    /** Recurrence information */
    recurrence?: RecurrenceRule;
}

/** EPCOT Festival specific interface */
export interface EpcotFestival extends AnnualEvent {
    category: 'FESTIVAL';
    location: 'EPCOT';
    /** Concert series name */
    concertSeries?: string;
    /** Number of food marketplaces */
    marketplaces?: number;
    /** Special features */
    features?: string[];
    /** Food and wine offerings */
    culinaryOfferings?: string[];
}

/** Holiday event interface */
export interface HolidayEvent extends AnnualEvent {
    category: 'HOLIDAY';
    /** Holiday type */
    holidayType: 'HALLOWEEN' | 'CHRISTMAS' | 'OTHER';
    /** Special entertainment offerings */
    specialEntertainment?: string[];
    /** Decorations and theming */
    decorations?: string[];
}

/** runDisney event interface */
export interface RunDisneyEvent extends AnnualEvent {
    category: 'MARATHON';
    /** Race types offered */
    raceTypes: string[];
    /** Course path through parks */
    coursePath?: string[];
    /** Registration opening date */
    registrationDate?: string;
    /** Distance options */
    distances?: string[];
}

// =============================================================================
// CALENDAR EVENTS
// =============================================================================

/** Personal calendar event for vacation planning */
export interface CalendarEvent extends BaseEvent {
    /** Associated vacation ID */
    vacationId: string;
    /** User who created the event */
    userId: string;
    /** Event priority */
    priority: EventPriority;
    /** Current status */
    status: EventStatus;
    /** Specific park (if applicable) */
    parkId?: string;
    /** Specific attraction (if applicable) */
    attractionId?: string;
    /** Specific location name */
    locationName?: string;
    /** Visual highlighting */
    isHighlighted: boolean;
    /** Additional notes */
    notes?: string;
    /** Color for calendar display */
    color?: string;
    /** Icon for calendar display */
    icon?: string;
    /** Event participants */
    participants?: string[];
    /** Reminder settings */
    reminder?: EventReminder;
    /** Reservation details */
    reservation?: EventReservation;
    /** Weather information */
    weather?: EventWeather;
    /** Budget tracking */
    budget?: EventBudget;
    /** Transportation details */
    transportation?: EventTransportation;
    /** Task checklist */
    checklist?: EventChecklistItem[];
    /** File attachments */
    attachments?: EventAttachment[];
    /** Recurrence rule */
    recurrence?: RecurrenceRule;
    /** Related user information */
    user?: EventUser;
    /** Change history */
    history?: EventHistoryEntry[];
}

// =============================================================================
// FILTER AND SEARCH INTERFACES
// =============================================================================

/** Comprehensive event filters */
export interface EventFilter {
    /** Filter by status */
    status?: EventStatus[];
    /** Filter by category */
    category?: EventCategory[];
    /** Filter by priority */
    priority?: EventPriority[];
    /** Filter by user */
    userId?: string;
    /** Date range filter */
    dateRange?: DateRange;
    /** Filter by location */
    location?: EventLocation[];
    /** Filter by park */
    parkId?: string[];
    /** Filter highlighted events */
    isHighlighted?: boolean;
    /** Filter by tags */
    tags?: string[];
    /** Text search */
    searchQuery?: string;
    /** Filter by ticket requirement */
    ticketRequired?: boolean;
    /** Filter by price range */
    priceRange?: {
        min?: number;
        max?: number;
    };
}

/** Event conflict detection */
export interface EventConflict {
    /** Conflicting event ID */
    eventId: string;
    /** Event title */
    title: string;
    /** Start time */
    startTime: string;
    /** End time */
    endTime: string;
    /** Type of conflict */
    conflictType: 'time_overlap' | 'location_conflict' | 'resource_conflict';
    /** Severity level */
    severity: 'warning' | 'error';
}

/** Event analytics and insights */
export interface EventAnalytics {
    /** Total number of events */
    totalEvents: number;
    /** Events by category */
    eventsByCategory: Record<string, number>;
    /** Events by status */
    eventsByStatus: Record<string, number>;
    /** Events by priority */
    eventsByPriority: Record<string, number>;
    /** Budget analytics */
    budgetAnalytics: {
        totalEstimated: number;
        totalActual: number;
        variance: number;
    };
    /** Events by date */
    eventsByDate: Record<string, CalendarEvent[]>;
    /** Average events per day */
    averageEventsPerDay: number;
    /** Completion rate */
    completionRate: number;
    /** Most popular locations */
    popularLocations: Record<string, number>;
}

// =============================================================================
// UTILITY INTERFACES
// =============================================================================

/** Event search result */
export interface EventSearchResult {
    /** The event */
    event: CalendarEvent | AnnualEvent;
    /** Relevance score */
    relevanceScore: number;
    /** Matched fields */
    matchedFields: string[];
}

/** Event suggestion */
export interface EventSuggestion {
    /** Suggested event */
    event: AnnualEvent;
    /** Suggestion score */
    score: number;
    /** Reason for suggestion */
    reasons: string[];
    /** Suggested date/time */
    suggestedDateTime?: EventDateTime;
}

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/** Check if event is an EPCOT festival */
export function isEpcotFestival(event: AnnualEvent): event is EpcotFestival {
    return event.category === 'FESTIVAL' && event.location === 'EPCOT';
}

/** Check if event is a holiday event */
export function isHolidayEvent(event: AnnualEvent): event is HolidayEvent {
    return event.category === 'HOLIDAY';
}

/** Check if event is a runDisney event */
export function isRunDisneyEvent(event: AnnualEvent): event is RunDisneyEvent {
    return event.category === 'MARATHON';
}

/** Check if event is a calendar event */
export function isCalendarEvent(event: BaseEvent): event is CalendarEvent {
    return 'vacationId' in event && 'userId' in event;
}

/** Check if event is an annual event */
export function isAnnualEvent(event: BaseEvent): event is AnnualEvent {
    return 'yearStart' in event && 'isActive' in event;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/** Input for creating a new calendar event */
export type CreateCalendarEventInput = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'history'>;

/** Input for updating a calendar event */
export type UpdateCalendarEventInput = Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>;

/** Input for creating a new annual event */
export type CreateAnnualEventInput = Omit<AnnualEvent, 'id' | 'createdAt' | 'updatedAt'>;

// =============================================================================
// TEMPORAL UTILITIES
// =============================================================================

/** Utility functions for date/time handling */
export interface TemporalUtils {
    /** Parse date string to Date object with timezone */
    parseDate(dateString: string, timezone?: string): Date;
    
    /** Format date for display */
    formatDate(date: Date, format: string, timezone?: string): string;
    
    /** Calculate duration between two times */
    calculateDuration(startTime: string, endTime: string): number;
    
    /** Check if dates overlap */
    datesOverlap(range1: DateRange, range2: DateRange): boolean;
    
    /** Generate recurring dates from rule */
    generateRecurringDates(baseDate: string, rule: RecurrenceRule, limit?: number): string[];
    
    /** Get Disney World timezone */
    getDisneyWorldTimezone(): string;
} 