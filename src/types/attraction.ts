/**
 * Core attraction type definitions with comprehensive JSDoc for better IntelliSense
 */

/** Main attraction interface containing all essential attraction information */
export interface Attraction {
    /** Unique identifier for the attraction */
    id: string;
    /** Display name of the attraction */
    name: string;
    /** The Disney park where this attraction is located */
    park: Park;
    /** Full description of the attraction experience */
    description: string;
    /** Brief summary description for cards and lists */
    shortDescription?: string;
    /** Primary image URL for the attraction */
    imageUrl: string;
    /** Smaller thumbnail image URL for list views */
    thumbnailUrl?: string;
    /** Specific location within the park (e.g., "Fantasyland", "Main Street") */
    location?: string;
    /** Array of attraction types that apply to this attraction */
    attractionType: AttractionType[];
    /** Additional ride-specific categories for detailed filtering */
    rideCategory?: RideCategory[];
    /** Height and age restrictions for the attraction */
    heightRequirement?: HeightRequirement;
    /** Comprehensive accessibility information */
    accessibilityInfo: AccessibilityInfo;
    /** Searchable tags for filtering and discovery */
    tags: string[];
    /** Current wait time in minutes (if available) */
    waitTime?: number;
    /** Typical duration of the attraction experience in minutes */
    duration?: number;
    /** Whether Lightning Lane (formerly FastPass) is available */
    isFastPassAvailable?: boolean;
    /** Whether single rider line is available for shorter waits */
    isSingleRider?: boolean;
    /** Operating schedule and show times */
    schedule?: Schedule;
    /** GPS coordinates for mapping functionality */
    coordinates?: {
        /** Latitude coordinate */
        latitude: number;
        /** Longitude coordinate */
        longitude: number;
    };
    /** ISO timestamp when the attraction record was created */
    createdAt?: string;
    /** ISO timestamp when the attraction record was last updated */
    updatedAt?: string;
}

/** Disney World park locations */
export enum Park {
    MagicKingdom = "Magic Kingdom Park",
    Epcot = "EPCOT",
    HollywoodStudios = "Disney's Hollywood Studios",
    AnimalKingdom = "Disney's Animal Kingdom Theme Park",
    DisneySpringsMall = "Disney Springs",
    BoardWalk = "Disney's BoardWalk",
    TyphoonLagoon = "Disney's Typhoon Lagoon Water Park",
    BlizzardBeach = "Disney's Blizzard Beach Water Park"
}

/** Primary classification of attraction types */
export enum AttractionType {
    Ride = "Ride",
    Show = "Show",
    Entertainment = "Entertainment",
    Character = "Character",
    Dining = "Dining",
    Shopping = "Shopping",
    Tour = "Tour",
    AnimalExperience = "Animal Experience",
    Recreation = "Recreation",
    Event = "Event",
    PhotoOpportunity = "Photo Opportunity",
    Interactive = "Interactive",
    Transport = "Transport",
    Exhibit = "Exhibit",
    WaterAttraction = "Water Attraction",
    KidsArea = "Kids Area"
}

/** Detailed ride-specific categories for granular filtering */
export enum RideCategory {
    Family = "Family",
    Kids = "Kids", 
    Water = "Water Rides",
    Slow = "Slow Rides",
    Dark = "Dark",
    SmallDrops = "Small Drops",
    BigDrops = "Big Drops",
    Spinning = "Spinning",
    Indoor = "Indoor",
    Outdoor = "Outdoor",
    Scary = "Scary",
    Loud = "Loud",
    Wet = "Wet",
    HighThrill = "High Thrill",
    ModerateThrill = "Moderate Thrill"
}

/** Unified height and age requirement information */
export interface HeightRequirement {
    /** Minimum height requirement in specified units */
    min?: number;
    /** Maximum height requirement in specified units (rare but exists for some rides) */
    max?: number;
    /** Unit of measurement for height requirements */
    unit: "in" | "cm";
    /** Whether an adult must accompany children who meet height requirements */
    adultRequired?: boolean;
    /** Human-readable height requirement (e.g., "48 inches or taller") */
    displayText?: string;
    /** Minimum age recommendation */
    minAge?: number;
    /** Maximum age recommendation */
    maxAge?: number;
    /** Additional age-related notes (e.g., "Not recommended for pregnant guests") */
    ageNotes?: string;
}

/** Base schedule interface providing flexibility for different schedule types */
export interface BaseSchedule {
    /** Special operating hours for holidays or events */
    specialHours?: {
        /** Date in YYYY-MM-DD format */
        date: string;
        /** Opening time in HH:MM format */
        openingTime: string;
        /** Closing time in HH:MM format */
        closingTime: string;
    }[];
}

/** Schedule for attractions with standard operating hours */
export interface OperatingSchedule extends BaseSchedule {
    /** Daily opening time in HH:MM format */
    openingTime: string;
    /** Daily closing time in HH:MM format */
    closingTime: string;
    /** Specific show times for attractions with multiple performances */
    performanceTimes?: string[];
}

/** Schedule for shows with specific performance times only */
export interface ShowSchedule extends BaseSchedule {
    /** Array of show times in HH:MM format */
    performanceTimes: string[];
    /** Optional opening time for the venue */
    openingTime?: string;
    /** Optional closing time for the venue */
    closingTime?: string;
}

/** Union type accommodating all schedule variations */
export type Schedule = OperatingSchedule | ShowSchedule;

/** Comprehensive accessibility information for guests with disabilities */
export interface AccessibilityInfo {
    /** Wheelchair and mobility device access level */
    wheelchairAccessible: WheelchairAccessibility;
    /** Whether service animals are permitted */
    serviceAnimalsAllowed: boolean;
    /** Availability of assistive listening devices */
    hasAssistiveListening: boolean;
    /** Availability of closed captioning for shows */
    hasClosedCaptioning: boolean;
    /** Availability of audio description services */
    hasAudioDescription: boolean;
    /** Availability of reflective captioning displays */
    hasReflectiveCaption: boolean;
    /** Transfer requirements from mobility devices */
    mustTransfer: TransferType;
    /** Whether a companion is required for safety */
    requiresCompanion?: boolean;
    /** Additional accessibility features not covered by standard options */
    otherAccessibilityFeatures?: string[];
    /** Age restrictions or recommendations */
    ageRestriction?: string;
}

/** Levels of wheelchair and mobility device accessibility */
export enum WheelchairAccessibility {
    Full = "May Remain in Wheelchair/ECV",
    TransferRequired = "Must Transfer to Wheelchair", 
    MustTransfer = "Must Transfer from Wheelchair/ECV",
    StandardWheelchairOnly = "Standard Wheelchair Only",
    NotAccessible = "Not Accessible"
}

/** Types of transfer requirements for attractions */
export enum TransferType {
    None = "None",
    Standard = "Standard",
    EasyTransfer = "Easy Transfer", 
    MustBeAmbulatory = "Must Be Ambulatory",
    Water = "Water Transfer Required"
}

/** Current operational status of an attraction */
export interface AttractionStatus {
    /** Whether the attraction is currently operating */
    isOperating: boolean;
    /** Whether the attraction is temporarily down */
    isDowntime: boolean;
    /** Whether the attraction is closed for refurbishment */
    isRefurbishment: boolean;
    /** Expected reopening date in ISO format (if closed) */
    expectedReopenDate?: string;
    /** Current status message for guests */
    statusMessage?: string;
}