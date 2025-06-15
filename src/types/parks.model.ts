/**
 * Unified Disney Parks type definitions
 * Pure domain models without infrastructure dependencies
 */

// =============================================================================
// CORE ENUMS AND CONSTANTS
// =============================================================================

/** Disney World park identifiers */
export const PARK_IDS = {
    MAGIC_KINGDOM: 'mk',
    EPCOT: 'epcot', 
    HOLLYWOOD_STUDIOS: 'hs',
    ANIMAL_KINGDOM: 'ak',
    TYPHOON_LAGOON: 'tl',
    BLIZZARD_BEACH: 'bb',
    DISNEY_SPRINGS: 'ds'
} as const;

export type ParkId = typeof PARK_IDS[keyof typeof PARK_IDS];

/** Human-readable park names */
export type ParkName = 
    | 'Magic Kingdom'
    | 'EPCOT' 
    | 'Hollywood Studios'
    | 'Animal Kingdom'
    | 'Typhoon Lagoon'
    | 'Blizzard Beach'
    | 'Disney Springs';

/** Age group classifications for attractions and experiences */
export type AgeGroup = 
    | 'toddler' 
    | 'preschool' 
    | 'kids' 
    | 'tweens' 
    | 'teens' 
    | 'adults' 
    | 'seniors';

/** Types of attractions available in parks */
export type AttractionType = 
    | 'ride'
    | 'show' 
    | 'experience'
    | 'character-meet'
    | 'walkthrough'
    | 'playground'
    | 'exhibit';

/** Meal periods for dining locations */
export type MealPeriod = 
    | 'breakfast'
    | 'lunch' 
    | 'dinner'
    | 'brunch'
    | 'allday';

/** Entertainment types */
export type EntertainmentType =
    | 'fireworks'
    | 'parade'
    | 'show'
    | 'streetmosphere'
    | 'character-meet';

/** Lightning Lane tiers */
export type LightningLaneTier = 'SinglePass' | 'MultiPass';

/** Price range indicators */
export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

// =============================================================================
// CORE INTERFACES
// =============================================================================

/** Main Disney park interface with comprehensive information */
export interface DisneyPark {
    /** Unique park identifier */
    id: ParkId;
    /** Full display name of the park */
    name: ParkName;
    /** Short abbreviation for the park */
    abbreviation: string;
    /** Detailed description of the park */
    description: string;
    /** Opening date in ISO format */
    opened: string;
    /** Main theme of the park */
    theme: string;
    /** Physical size information */
    size: {
        /** Size in acres */
        acres: number;
        /** Size in hectares */
        hectares: number;
    };
    /** Geographic location details */
    location: {
        /** Latitude coordinate with high precision */
        latitude: number;
        /** Longitude coordinate with high precision */
        longitude: number;
        /** Full street address */
        address: string;
    };
    /** Standard operating hours and schedule information */
    operatingHours: OperatingHours;
    /** Themed areas within the park */
    lands: ParkLand[];
    /** All attractions in the park */
    attractions: ParkAttraction[];
    /** Dining options categorized by type */
    dining: DiningOptions;
    /** Entertainment offerings */
    entertainment: Entertainment[];
    /** Guest facilities and services */
    facilities: Facility[];
    /** Additional services available */
    services: Service[];
    /** Accessibility information for the park */
    accessibility: AccessibilityInfo;
    /** Helpful tips organized by category */
    tips: TipCategory[];
    /** Transportation options to and from the park */
    transportation: TransportationInfo;
    /** Parking information and costs */
    parkingInfo: ParkingInfo;
    /** Timestamp information (managed by adapter layer) */
    timestamps?: {
        /** When the record was created */
        createdAt: string;
        /** When the record was last updated */
        updatedAt: string;
    };
}

/** Operating hours and schedule information */
export interface OperatingHours {
    /** Standard weekly schedule */
    typical: {
        monday: DailyHours;
        tuesday: DailyHours;
        wednesday: DailyHours;
        thursday: DailyHours;
        friday: DailyHours;
        saturday: DailyHours;
        sunday: DailyHours;
    };
    /** Whether the park has extended evening hours */
    extendedEvening: boolean;
    /** Whether early entry is available */
    earlyEntry: boolean;
    /** Special events that affect hours */
    specialEvents: string[];
}

/** Daily operating hours */
export interface DailyHours {
    /** Opening time in HH:MM format */
    open: string;
    /** Closing time in HH:MM format */
    close: string;
}

/** Themed land within a park */
export interface ParkLand {
    /** Unique identifier for the land */
    id: string;
    /** Display name of the land */
    name: string;
    /** Description of the land's theme and atmosphere */
    description: string;
    /** Main theme of the land */
    theme: string;
    /** Array of attraction IDs in this land */
    attractions: string[];
    /** Array of dining location IDs in this land */
    dining: string[];
    /** Array of shop IDs in this land */
    shops: string[];
}

/** Attraction within a park */
export interface ParkAttraction {
    /** Unique identifier for the attraction */
    id: string;
    /** Display name of the attraction */
    name: string;
    /** ID of the land where this attraction is located */
    landId: string;
    /** Type classification of the attraction */
    type: AttractionType;
    /** Detailed description of the attraction */
    description: string;
    /** Height requirements for the attraction */
    heightRequirement: {
        /** Minimum height in inches (null if no requirement) */
        inches: number | null;
        /** Minimum height in centimeters (null if no requirement) */
        centimeters: number | null;
    };
    /** Duration information */
    duration: {
        /** Typical duration in minutes */
        minutes: number;
        /** Whether duration varies significantly */
        variableLength: boolean;
    };
    /** Capacity information for wait time calculations */
    capacity: {
        /** Estimated hourly capacity */
        hourly: number;
        /** Capacity per vehicle/show */
        vehicleCapacity: number;
    };
    /** Accessibility features */
    accessibility: AttractionAccessibility;
    /** Lightning Lane availability and tier */
    lightningLane: {
        /** Whether Lightning Lane is available */
        available: boolean;
        /** Lightning Lane tier if available */
        tier?: LightningLaneTier;
    };
    /** Age groups that typically enjoy this attraction */
    ageAppeal: AgeGroup[];
    /** Thrill level on a scale of 1-5 */
    thrillLevel: 1 | 2 | 3 | 4 | 5;
    /** Whether the attraction is primarily indoors */
    indoor: boolean;
    /** Whether this is considered a must-do attraction */
    mustDo: boolean;
    /** Helpful tips for enjoying the attraction */
    tips: string[];
    /** Best times to visit for shorter waits */
    bestTimes: string[];
    /** Whether PhotoPass is available */
    photoPass: boolean;
    /** Rider swap and single rider information */
    rider: {
        /** Whether rider swap is available */
        swap: boolean;
        /** Whether single rider line is available */
        single: boolean;
    };
    /** Whether virtual queue system is used */
    virtualQueue: boolean;
    /** Closure information if applicable */
    closureInfo?: {
        /** Closure start date in ISO format */
        startDate: string;
        /** Expected reopening date in ISO format */
        endDate: string;
        /** Reason for closure */
        reason: string;
    };
}

/** Accessibility features for an attraction */
export interface AttractionAccessibility {
    /** Whether wheelchairs can access the attraction */
    wheelchairAccessible: boolean;
    /** Whether transfer from wheelchair is required */
    transferRequired: boolean;
    /** Whether assistive listening devices are available */
    assistiveListening: boolean;
    /** Whether audio description is available */
    audioDescription: boolean;
    /** Whether handheld captioning is available */
    handheldCaptioning: boolean;
    /** Whether sign language interpretation is available */
    signLanguage: boolean;
    /** Whether service animals are allowed */
    serviceAnimalsAllowed: boolean;
}

/** Dining options within a park */
export interface DiningOptions {
    /** Table service restaurants */
    tableService: Restaurant[];
    /** Quick service restaurants */
    quickService: Restaurant[];
    /** Snack locations */
    snacks: SnackLocation[];
}

/** Restaurant information */
export interface Restaurant {
    /** Unique identifier for the restaurant */
    id: string;
    /** Display name of the restaurant */
    name: string;
    /** ID of the land where the restaurant is located */
    landId: string;
    /** Types of cuisine served */
    cuisine: string[];
    /** Description of the restaurant and atmosphere */
    description: string;
    /** Meal periods when the restaurant is open */
    mealPeriods: MealPeriod[];
    /** Price range indicator */
    priceRange: PriceRange;
    /** Reservation information */
    reservations: {
        /** Whether reservations are required */
        required: boolean;
        /** Whether reservations are recommended */
        recommended: boolean;
        /** Whether walk-ups are accepted */
        acceptsWalkUps: boolean;
    };
    /** Disney Dining Plan information */
    diningPlan: {
        /** Whether dining plan is accepted */
        accepted: boolean;
        /** Number of dining plan credits required */
        credits: number;
    };
    /** Menu information */
    menu: {
        /** Signature dishes */
        signature: string[];
        /** Menu categories */
        categories: MenuCategory[];
    };
    /** Seating information */
    seating: {
        /** Whether indoor seating is available */
        indoor: boolean;
        /** Whether outdoor seating is available */
        outdoor: boolean;
        /** Approximate seating capacity */
        capacity: number;
    };
    /** Whether this is character dining */
    characterDining: boolean;
    /** Characters that appear (if character dining) */
    characters?: string[];
    /** Whether Mobile Order is available */
    mobileOrder: boolean;
    /** Accessibility features */
    accessibility: DiningAccessibility;
    /** Helpful tips for the restaurant */
    tips: string[];
}

/** Menu category with items */
export interface MenuCategory {
    /** Name of the menu category */
    name: string;
    /** Items in this category */
    items: MenuItem[];
}

/** Individual menu item */
export interface MenuItem {
    /** Name of the menu item */
    name: string;
    /** Description of the item */
    description: string;
    /** Price of the item */
    price?: string;
    /** Dietary information and allergens */
    dietary?: string[];
}

/** Dining accessibility features */
export interface DiningAccessibility {
    /** Whether the location is wheelchair accessible */
    wheelchairAccessible: boolean;
    /** Whether braille menus are available */
    brailleMenu: boolean;
    /** Whether allergy-friendly options are available */
    allergyFriendly: boolean;
}

/** Snack location information */
export interface SnackLocation {
    /** Unique identifier for the snack location */
    id: string;
    /** Display name of the location */
    name: string;
    /** ID of the land where the location is situated */
    landId: string;
    /** Type of snack location */
    type: 'stand' | 'kiosk' | 'cart';
    /** Items available at this location */
    items: string[];
    /** Specialty items unique to this location */
    specialties: string[];
    /** Whether the location is seasonal */
    seasonal: boolean;
    /** Whether Mobile Order is available */
    mobileOrder: boolean;
    /** Specific location description within the land */
    location: string;
}

/** Entertainment offering */
export interface Entertainment {
    /** Unique identifier for the entertainment */
    id: string;
    /** Display name of the entertainment */
    name: string;
    /** ID of the land where it takes place (if applicable) */
    landId?: string;
    /** Type of entertainment */
    type: EntertainmentType;
    /** Description of the entertainment experience */
    description: string;
    /** Duration information */
    duration: {
        /** Duration in minutes */
        minutes: number;
    };
    /** Show times or schedule information */
    showtimes: string[] | string;
    /** Location where the entertainment takes place */
    location: string;
    /** Capacity if applicable */
    capacity?: number;
    /** Whether Lightning Lane is available */
    lightningLane: boolean;
    /** Whether the entertainment is seasonal */
    seasonal: boolean;
    /** Age groups that typically enjoy this entertainment */
    ageAppeal: AgeGroup[];
    /** Helpful tips for enjoying the entertainment */
    tips: string[];
}

/** Guest facility */
export interface Facility {
    /** Unique identifier for the facility */
    id: string;
    /** Display name of the facility */
    name: string;
    /** Type of facility */
    type: 'baby-care' | 'first-aid' | 'guest-relations' | 'locker' | 'restroom';
    /** Locations where this facility can be found */
    locations: string[];
    /** Special features of this facility */
    features: string[];
}

/** Guest service */
export interface Service {
    /** Unique identifier for the service */
    id: string;
    /** Display name of the service */
    name: string;
    /** Type of service */
    type: 'accessibility' | 'convenience' | 'photography' | 'rental' | 'experience' | 'activity';
    /** Description of the service */
    description: string;
    /** Locations where the service is available */
    locations: string[];
    /** Cost information */
    cost: string;
    /** Whether reservation is required */
    reservation: boolean;
}

/** Park accessibility information */
export interface AccessibilityInfo {
    /** General accessibility overview */
    overview: string;
    /** Accessibility services available */
    services: {
        /** Disability Access Service information */
        das: {
            /** Whether DAS is available */
            available: boolean;
            /** Description of DAS at this park */
            description: string;
        };
        /** Wheelchair rental information */
        wheelchairRental: {
            /** Whether wheelchair rental is available */
            available: boolean;
            /** Rental locations */
            locations: string[];
            /** Rental cost */
            cost: string;
        };
        /** Whether interpreter services are available */
        interpreterServices: boolean;
        /** Whether braille guidebooks are available */
        brailleGuidebooks: boolean;
        /** Whether audio description is available */
        audioDescription: boolean;
    };
    /** Locations of companion restrooms */
    companionRestrooms: string[];
    /** Quiet areas for sensory breaks */
    quietAreas: string[];
}

/** Category of tips */
export interface TipCategory {
    /** Name of the tip category */
    category: string;
    /** Tips in this category */
    tips: Tip[];
}

/** Individual tip */
export interface Tip {
    /** Title of the tip */
    title: string;
    /** Detailed description of the tip */
    description: string;
    /** Priority level of the tip */
    priority: 'low' | 'medium' | 'high';
}

/** Transportation information for the park */
export interface TransportationInfo {
    /** Whether parking lot is available */
    parkingLot: boolean;
    /** Whether monorail service is available */
    monorail: boolean;
    /** Whether boat service is available */
    boat: boolean;
    /** Whether bus service is available */
    bus: boolean;
    /** Whether Disney Skyliner is available */
    skyliner: boolean;
    /** Whether the park is walkable from other locations */
    walkable: boolean;
    /** Resort access information */
    resortAccess: {
        /** Resorts accessible by monorail */
        monorail?: string[];
        /** Resorts accessible by boat */
        boat?: string[];
        /** Resorts accessible by walking */
        walking?: string[];
        /** Resorts accessible by Skyliner */
        skyliner?: string[];
    };
}

/** Parking information and costs */
export interface ParkingInfo {
    /** Whether parking is available */
    available: boolean;
    /** Standard parking information */
    standard: {
        /** Cost of standard parking */
        cost: string;
        /** Location of standard parking */
        location: string;
    };
    /** Preferred parking information */
    preferred: {
        /** Cost of preferred parking */
        cost: string;
        /** Location of preferred parking */
        location: string;
    };
    /** Whether trams are available */
    trams: boolean;
    /** Parking tips */
    tips: string[];
}

// =============================================================================
// OPERATIONAL DATA INTERFACES
// =============================================================================

/** Current wait time information for an attraction */
export interface AttractionWaitTime {
    /** ID of the attraction */
    attractionId: string;
    /** ID of the park */
    parkId: ParkId;
    /** Current wait time in minutes (-1 for closed/not available) */
    waitTime: number;
    /** Current operational status */
    status: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';
    /** Lightning Lane information if available */
    lightningLane?: {
        /** Whether Lightning Lane is currently available */
        available: boolean;
        /** Next available return time */
        nextReturnTime?: string;
        /** Current price for Individual Lightning Lane */
        price?: number;
    };
    /** When this information was last updated */
    lastUpdated: string;
}

/** Park operating hours for a specific date */
export interface ParkHours {
    /** ID of the park */
    parkId: ParkId;
    /** Date in YYYY-MM-DD format */
    date: string;
    /** Opening time in HH:MM format */
    openingTime: string;
    /** Closing time in HH:MM format */
    closingTime: string;
    /** Extra Magic Hours information */
    extraMagicHours?: {
        /** Type of extra hours */
        type: 'early' | 'evening';
        /** Start time of extra hours */
        startTime?: string;
        /** End time of extra hours */
        endTime?: string;
        /** Who is eligible for extra hours */
        eligibility: string[];
    };
    /** Special events during the day */
    specialEvents?: {
        /** Name of the event */
        name: string;
        /** Event start time */
        startTime: string;
        /** Event end time */
        endTime: string;
        /** Whether separate ticket is required */
        ticketRequired: boolean;
    }[];
    /** When this information was last updated */
    lastUpdated: string;
}

// =============================================================================
// FILTER INTERFACES
// =============================================================================

/** Filters for park searches */
export interface ParkFilters {
    /** Search term for park name or description */
    searchTerm?: string;
    /** Filter by parks that have a specific attraction */
    hasAttraction?: string;
    /** Filter by parks that have a specific land */
    hasLand?: string;
    /** Filter by operating status */
    operatingStatus?: 'open' | 'closed' | 'seasonal';
}

/** Filters for attraction searches */
export interface AttractionFilters {
    /** Filter by park ID */
    parkId?: ParkId;
    /** Filter by land ID */
    landId?: string;
    /** Filter by attraction type */
    type?: AttractionType;
    /** Filter by thrill level */
    thrillLevel?: number;
    /** Filter by height requirement presence */
    heightRequirement?: boolean;
    /** Filter by Lightning Lane availability */
    lightningLane?: boolean;
    /** Filter by must-do status */
    mustDo?: boolean;
    /** Filter by age group appeal */
    ageGroup?: AgeGroup;
}

/** Filters for dining searches */
export interface DiningFilters {
    /** Filter by park ID */
    parkId?: ParkId;
    /** Filter by land ID */
    landId?: string;
    /** Filter by dining type */
    type?: 'tableService' | 'quickService' | 'snacks';
    /** Filter by cuisine type */
    cuisine?: string;
    /** Filter by price range */
    priceRange?: string;
    /** Filter by character dining */
    characterDining?: boolean;
    /** Filter by Mobile Order availability */
    mobileOrder?: boolean;
    /** Filter by meal period */
    mealPeriod?: MealPeriod;
}

// =============================================================================
// INPUT TYPES FOR CREATION
// =============================================================================

/** Input type for creating a new park (excludes generated fields) */
export type CreateParkInput = Omit<DisneyPark, 'timestamps'>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get operating hours for a specific park and date
 * @param parkId - The park identifier
 * @param date - The date to get hours for (optional, defaults to today)
 * @returns Promise resolving to park hours information
 */
export declare function getOperatingHours(
    parkId: ParkId, 
    date?: string
): Promise<ParkHours | null>;

/**
 * Get current wait times for all attractions in a park
 * @param parkId - The park identifier
 * @returns Promise resolving to array of wait time information
 */
export declare function getWaitTimes(parkId: ParkId): Promise<AttractionWaitTime[]>;

/**
 * Get park information by ID
 * @param parkId - The park identifier
 * @returns Promise resolving to park information
 */
export declare function getParkById(parkId: ParkId): Promise<DisneyPark | null>;

/**
 * Search attractions across all parks or within a specific park
 * @param filters - Filters to apply to the search
 * @returns Promise resolving to array of matching attractions
 */
export declare function searchAttractions(filters: AttractionFilters): Promise<ParkAttraction[]>;

/**
 * Search dining locations across all parks or within a specific park
 * @param filters - Filters to apply to the search
 * @returns Promise resolving to array of matching dining locations
 */
export declare function searchDining(filters: DiningFilters): Promise<Restaurant[]>;

// =============================================================================
// BACKWARD COMPATIBILITY ALIASES
// =============================================================================

/** Backward compatibility alias for existing code */
export type Attraction = ParkAttraction;

/** Backward compatibility alias for table service restaurants */
export type TableServiceRestaurant = Restaurant;

/** Backward compatibility alias for quick service restaurants */  
export type QuickServiceRestaurant = Restaurant;

/** Firebase-compatible park interface with Timestamp objects */
export interface FirebasePark extends Omit<DisneyPark, 'timestamps'> {
    /** Firebase Timestamp objects for compatibility */
    createdAt?: any; // Firebase Timestamp
    updatedAt?: any; // Firebase Timestamp
} 