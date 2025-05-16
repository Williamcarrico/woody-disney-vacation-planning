export interface Resort {
    id: string;
    name: string;
    category: ResortCategory;
    description: string;
    longDescription: string;
    amenities: Amenity[];
    roomTypes: RoomType[];
    location: Location;
    dining: DiningOption[];
    recreation: RecreationOption[];
    transportation: Transportation[];
    themingDetails: string;
    openingDate: string;
    lastRefurbished?: string;
    imageUrls: {
        main: string;
        gallery: string[];
        rooms: Record<string, string[]>;
        dining: Record<string, string[]>;
        amenities: Record<string, string[]>;
    };
    pricing: {
        valueRange: PriceRange;
        moderateRange: PriceRange;
        deluxeRange: PriceRange;
    };
    address: string;
    phoneNumber: string;
    nearbyAttractions: string[];
    featuredExperiences: string[];
    specialConsiderations?: string[];
}

export enum ResortCategory {
    Value = "Value",
    ValuePlus = "Value Plus",
    Moderate = "Moderate",
    Deluxe = "Deluxe",
    DeluxeVilla = "Deluxe Villa",
    Campground = "Campground"
}

export interface Amenity {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AmenityCategory;
}

export enum AmenityCategory {
    Pool = "Pool",
    Fitness = "Fitness",
    Business = "Business",
    Convenience = "Convenience",
    Recreation = "Recreation",
    Service = "Service",
    Dining = "Dining"
}

export interface RoomType {
    id: string;
    name: string;
    description: string;
    maxOccupancy: number;
    bedConfiguration: string;
    squareFeet: number;
    views: string[];
    priceRange: PriceRange;
    amenities: string[];
}

export interface PriceRange {
    low: number;
    high: number;
}

export interface Location {
    latitude: number;
    longitude: number;
    area: ResortArea;
    distanceToParks: Record<string, number>; // In miles or minutes
}

export enum ResortArea {
    MagicKingdom = "Magic Kingdom",
    Epcot = "Epcot",
    HollywoodStudios = "Hollywood Studios",
    AnimalKingdom = "Animal Kingdom",
    DisneyStrings = "Disney Springs",
    BoardWalk = "BoardWalk",
    Other = "Other"
}

export interface DiningOption {
    id: string;
    name: string;
    description: string;
    category: DiningCategory;
    cuisine: string[];
    priceRange: 1 | 2 | 3 | 4; // $ to $$$$
    requiresReservation: boolean;
    hours: string;
    diningPlans: string[];
}

export enum DiningCategory {
    TableService = "Table Service",
    QuickService = "Quick Service",
    SnackShop = "Snack Shop",
    Lounge = "Lounge",
    CharacterDining = "Character Dining",
    Signature = "Signature Dining"
}

export interface RecreationOption {
    id: string;
    name: string;
    description: string;
    category: RecreationCategory;
    hours: string;
    additionalFee: boolean;
    reservationRequired: boolean;
}

export enum RecreationCategory {
    Pool = "Pool",
    Spa = "Spa",
    FitnessCenter = "Fitness Center",
    Outdoor = "Outdoor",
    Water = "Water",
    Entertainment = "Entertainment"
}

export interface Transportation {
    type: TransportationType;
    destinationsServed: string[];
    frequency: string;
    hours: string;
}

export enum TransportationType {
    Bus = "Bus",
    Monorail = "Monorail",
    Boat = "Boat",
    Skyliner = "Skyliner",
    Walking = "Walking"
}