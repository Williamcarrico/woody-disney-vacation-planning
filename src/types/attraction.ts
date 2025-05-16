export interface Attraction {
    id: string;
    name: string;
    park: Park;
    description: string;
    shortDescription?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    location?: string;
    attractionType: AttractionType[];
    rideCategory?: RideCategory[];
    heightRequirement?: HeightRequirement;
    accessibilityInfo: AccessibilityInfo;
    tags: string[];
    waitTime?: number;
    duration?: number;
    isFastPassAvailable?: boolean;
    isSingleRider?: boolean;
    schedule?: Schedule;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

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
    Exhibit = "Exhibit"
}

export enum RideCategory {
    Thrill = "Thrill Rides",
    Family = "Family",
    Kids = "Kids",
    Water = "Water Rides",
    Slow = "Slow Rides",
    Dark = "Dark",
    Small = "Small Drops",
    Big = "Big Drops",
    Spinning = "Spinning",
    Indoor = "Indoor",
    Outdoor = "Outdoor",
    Scary = "Scary",
    Loud = "Loud",
    Wet = "Wet"
}

export interface HeightRequirement {
    min?: number;
    max?: number;
    unit: "in" | "cm";
    adultRequired?: boolean;
    minHeight?: string; // Human-readable (e.g., "48 inches")
}

export interface Schedule {
    openingTime: string;
    closingTime: string;
    specialHours?: {
        date: string;
        openingTime: string;
        closingTime: string;
    }[];
    performanceTimes?: string[];
}

export interface AccessibilityInfo {
    wheelchairAccessible: WheelchairAccessibility;
    serviceAnimalsAllowed: boolean;
    hasAssistiveListening: boolean;
    hasClosedCaptioning: boolean;
    hasAudioDescription: boolean;
    hasReflectiveCaption: boolean;
    mustTransfer: TransferType;
    requiresCompanion?: boolean;
    otherAccessibilityFeatures?: string[];
    ageRestriction?: string;
}

export enum WheelchairAccessibility {
    Full = "May Remain in Wheelchair/ECV",
    TransferRequired = "Must Transfer to Wheelchair",
    MustTransfer = "Must Transfer from Wheelchair/ECV",
    StandardWheelchairOnly = "Standard Wheelchair Only",
    NotAccessible = "Not Accessible"
}

export enum TransferType {
    None = "None",
    Standard = "Standard",
    EasyTransfer = "Easy Transfer",
    MustBeAmbulatory = "Must Be Ambulatory"
}

export interface AttractionStatus {
    isOperating: boolean;
    isDowntime: boolean;
    isRefurbishment: boolean;
    expectedReopenDate?: string;
    statusMessage?: string;
}