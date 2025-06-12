// Core Disney Springs metadata and operational types
export interface DisneyspringsMetadata {
    name: string;
    location: {
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        resort: string;
        waterfront: string;
    };
    description: string;
    history: Record<string, string>;
    size: string;
    theme: string;
}

export interface OperationalInfo {
    hours: {
        general: {
            weekdays: string;
            weekends: string;
            sunday: string;
        };
        seasonal: {
            holidays: string;
            special_events: string;
        };
    };
    parking: {
        cost: string;
        capacity: string;
        garages: ParkingGarage[];
        surface_lots: ParkingLot[];
    };
    transportation: {
        bus: {
            from_resorts: string;
            schedule: string;
            frequency: string;
        };
        boat: {
            service: string;
            routes: string[];
        };
        rideshare: {
            pickup_locations: string;
            services: string[];
        };
        walking_paths: string;
    };
}

export interface ParkingGarage {
    name: string;
    location: string;
    access_to: string[];
    features: string[];
}

export interface ParkingLot {
    name: string;
    description: string;
    shuttle?: string;
    distance?: string;
}

// Location types
export interface DisneySpringLocation {
    id: string;
    name: string;
    description: string;
    category: LocationCategory;
    area: LocationArea;
    tags: string[];
    imageUrl: string;
    websiteUrl?: string;
    priceRange?: PriceRange;
    hours?: string;
    phoneNumber?: string;
    featuredItems?: string[];
    isNew?: boolean;
    isComingSoon?: boolean;
    // Enhanced fields from new JSON structure
    type?: string;
    features?: string[];
    specialties?: string[];
    exclusives?: boolean | string[];
    size?: string;
    floors?: number;
    theme?: string;
    atmosphere?: string;
    popular?: boolean;
    artisanal?: boolean;
    target?: string;
    chef?: string;
    signature?: string;
    dietary?: string;
    services?: string[];
    ticketed?: boolean;
    capacity?: string;
    height?: string;
}

export enum LocationCategory {
    Shopping = "Shopping",
    Dining = "Dining",
    Entertainment = "Entertainment",
    Experience = "Experience"
}

export enum LocationArea {
    Marketplace = "Marketplace",
    TheLanding = "The Landing",
    TownCenter = "Town Center",
    WestSide = "West Side"
}

export enum ShoppingSubcategory {
    ApparelAndAccessories = "Apparel & Accessories",
    ToysAndPlush = "Toys & Plush",
    ArtAndCollectibles = "Art & Collectibles",
    HealthAndBeauty = "Health & Beauty",
    GiftsAndHousewares = "Gifts & Housewares",
    CartsAndKiosks = "Carts & Kiosks",
    Shoes = "Shoes",
    Food = "Food",
    LuxuryAccessories = "Luxury Accessories",
    Fashion = "Fashion",
    Jewelry = "Jewelry",
    BrandExperience = "Brand Experience",
    HomeDecor = "Home Decor",
    ArtisanChocolate = "Artisan Chocolate",
    ThemedBar = "Themed Bar/Retail",
    PhotographyService = "Photography Service",
    ArtGallery = "Art Gallery"
}

export enum DiningSubcategory {
    TableService = "Table Service",
    QuickService = "Quick Service",
    SpecialtyFoodAndBeverage = "Specialty Food & Beverage",
    BarsAndLounges = "Bars & Lounges",
    Dinner = "Dinner",
    LateNightDining = "Late-Night Dining",
    CartsAndKiosks = "Carts & Kiosks",
    DiningEvents = "Dining Events",
    Lounge = "Lounge",
    EntertainmentVenue = "Entertainment Venue"
}

export enum EntertainmentSubcategory {
    LiveTheater = "Live Theater",
    MovieTheater = "Movie Theater",
    BowlingAndDining = "Bowling and Dining",
    InteractiveAttraction = "Interactive Attraction",
    BalloonRide = "Balloon Ride",
    LivePerformanceVenue = "Live Performance Venue",
    StreetEntertainment = "Street Entertainment",
    OutdoorVenue = "Outdoor Venue",
    WaterFeature = "Water Feature",
    PublicArtInstallation = "Public Art Installation"
}

export enum PriceRange {
    Low = "$",
    Medium = "$$",
    High = "$$$",
    VeryHigh = "$$$$"
}

// Enhanced location interfaces
export interface ShoppingLocation extends DisneySpringLocation {
    category: LocationCategory.Shopping;
    subcategory: ShoppingSubcategory;
    categories?: string[];
    shops?: ShopWithinShop[];
    offerings?: string[];
}

export interface ShopWithinShop {
    name: string;
    description: string;
}

export interface DiningLocation extends DisneySpringLocation {
    category: LocationCategory.Dining;
    subcategory: DiningSubcategory;
    cuisine?: string[];
    requiresReservation?: boolean;
    diningPlans?: string[];
    menu?: MenuHighlight[];
    familyFriendly?: boolean;
    entertainment?: string;
}

export interface EntertainmentLocation extends DisneySpringLocation {
    category: LocationCategory.Entertainment;
    subcategory?: EntertainmentSubcategory;
    ageRecommendation?: string;
    duration?: string;
    ticketRequired?: boolean;
    ageRequirement?: string;
    show?: string;
    schedule?: string;
    performances?: string[];
    location?: string;
}

export interface MenuHighlight {
    name: string;
    description: string;
    price?: number;
    imageUrl?: string;
}

// District interfaces
export interface District {
    name: string;
    theme: string;
    description: string;
    atmosphere: string;
    keyFeatures: string[];
    shopping: DisneySpringLocation[];
    dining: DisneySpringLocation[];
    entertainment: DisneySpringLocation[];
}

// Category information interfaces
export interface DiningCategories {
    tableService: CategoryInfo;
    quickService: CategoryInfo;
    lounges: CategoryInfo;
    dessertShops: CategoryInfo;
}

export interface ShoppingCategories {
    disney: CategoryInfo;
    luxury: CategoryInfo;
    specialty: CategoryInfo;
}

export interface EntertainmentCategories {
    livePerformances: CategoryInfo;
    attractions: CategoryInfo;
    familyActivities: CategoryInfo;
}

export interface CategoryInfo {
    description: string;
    [key: string]: any; // Allow for flexible category-specific properties
}

// Event interfaces
export interface SeasonalEvent {
    name: string;
    period: string;
    features?: string[];
    description?: string;
}

export interface RegularEvent {
    name: string;
    schedule: string;
    location?: string;
    description: string;
}

export interface Events {
    seasonal: SeasonalEvent[];
    regular: RegularEvent[];
}

// Services and accessibility interfaces
export interface Accessibility {
    wheelchair: string;
    strollers: string;
    assistiveListening: string;
    serviceAnimals: string;
    restrooms: {
        locations: string;
        features: string[];
    };
}

export interface Services {
    guestRelations: {
        location: string;
        services: string[];
    };
    packagePickup: string;
    wifi: string;
    mobileOrdering: string;
    photography: {
        photopass: string;
        magicShots: string;
    };
}

export interface Tips {
    bestTimes: {
        leastCrowded: string;
        mostCrowded: string;
        evening: string;
    };
    parking: {
        recommendation: string;
        orangeGarage: string;
        alternatives: string;
    };
    dining: {
        reservations: string;
        walkUps: string;
        happyHour: string;
    };
    shopping: {
        resort_delivery: string;
        sales: string;
    };
}

// Main Disney Springs interface
export interface DisneySpringsData {
    metadata: DisneyspringsMetadata;
    operationalInfo: OperationalInfo;
    districts: {
        marketplace: District;
        theLanding: District;
        townCenter: District;
        westSide: District;
    };
    categories: {
        dining: DiningCategories;
        shopping: ShoppingCategories;
        entertainment: EntertainmentCategories;
    };
    events: Events;
    accessibility: Accessibility;
    services: Services;
    tips: Tips;
}

// Filter and search interfaces
export interface LocationFilters {
    category?: LocationCategory | "all";
    area?: LocationArea | "all";
    priceRange?: PriceRange[];
    features?: string[];
    searchTerm?: string;
}

export interface LocationSearchResult extends DisneySpringLocation {
    relevanceScore?: number;
    matchedFields?: string[];
}