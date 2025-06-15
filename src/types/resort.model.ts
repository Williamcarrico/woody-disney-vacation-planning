/**
 * Clean Resort Model for Disney World
 * Pure types without data - consider GraphQL stitched from CMS for data
 */

// =============================================================================
// CORE ENUMS AND TYPES
// =============================================================================

/** Disney resort categories with pricing tiers */
export enum ResortCategory {
    VALUE = 'value',
    VALUE_PLUS = 'value-plus', 
    MODERATE = 'moderate',
    DELUXE = 'deluxe',
    DELUXE_VILLA = 'deluxe-villa',
    CAMPGROUND = 'campground'
}

/** Resort area locations relative to Disney World */
export enum ResortArea {
    MAGIC_KINGDOM = 'magic-kingdom',
    EPCOT = 'epcot',
    HOLLYWOOD_STUDIOS = 'hollywood-studios',
    ANIMAL_KINGDOM = 'animal-kingdom',
    DISNEY_SPRINGS = 'disney-springs',
    BOARDWALK = 'boardwalk',
    OTHER = 'other'
}

/** Types of amenities available at resorts */
export enum AmenityCategory {
    POOL = 'pool',
    FITNESS = 'fitness',
    BUSINESS = 'business',
    CONVENIENCE = 'convenience',
    RECREATION = 'recreation',
    SERVICE = 'service',
    DINING = 'dining',
    ENTERTAINMENT = 'entertainment',
    WELLNESS = 'wellness'
}

/** Dining service categories */
export enum DiningCategory {
    TABLE_SERVICE = 'table-service',
    QUICK_SERVICE = 'quick-service',
    SNACK_SHOP = 'snack-shop',
    LOUNGE = 'lounge',
    CHARACTER_DINING = 'character-dining',
    SIGNATURE = 'signature-dining',
    ROOM_SERVICE = 'room-service'
}

/** Recreation activity categories */
export enum RecreationCategory {
    POOL = 'pool',
    SPA = 'spa', 
    FITNESS_CENTER = 'fitness-center',
    OUTDOOR = 'outdoor',
    WATER = 'water',
    ENTERTAINMENT = 'entertainment',
    SPORTS = 'sports',
    KIDS = 'kids'
}

/** Transportation types available from resorts */
export enum TransportationType {
    BUS = 'bus',
    MONORAIL = 'monorail',
    BOAT = 'boat',
    SKYLINER = 'skyliner',
    WALKING = 'walking'
}

// =============================================================================
// VALUE OBJECTS AND INTERFACES
// =============================================================================

/** Price range with seasonal variations */
export interface PriceRange {
    /** Lowest price (value season) */
    low: number;
    /** Highest price (peak season) */
    high: number;
    /** Currency code */
    currency: string;
    /** Seasonal modifiers */
    seasons?: {
        value?: number;
        regular?: number;
        peak?: number;
        holiday?: number;
    };
}

/** Geographic location with detailed address */
export interface ResortLocation {
    /** High-precision latitude */
    latitude: number;
    /** High-precision longitude */
    longitude: number;
    /** Resort area classification */
    area: ResortArea;
    /** Distance to each theme park in miles */
    distanceToParks: Record<string, number>;
    /** Estimated travel times to parks */
    travelTimes?: Record<string, number>;
    /** Full address information */
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

/** Resort amenity with detailed information */
export interface Amenity {
    /** Unique amenity identifier */
    id: string;
    /** Display name */
    name: string;
    /** Detailed description */
    description: string;
    /** Icon identifier for UI */
    icon: string;
    /** Amenity category */
    category: AmenityCategory;
    /** Operating hours */
    hours?: string;
    /** Whether additional cost is required */
    additionalCost?: boolean;
    /** Cost details if applicable */
    cost?: string;
    /** Age restrictions */
    ageRestrictions?: string;
    /** Capacity limits */
    capacity?: number;
    /** Whether reservations are required */
    reservationRequired?: boolean;
    /** Location within resort */
    location?: string;
}

/** Room type with comprehensive details */
export interface RoomType {
    /** Unique room type identifier */
    id: string;
    /** Display name */
    name: string;
    /** Detailed description */
    description: string;
    /** Maximum occupancy */
    maxOccupancy: number;
    /** Bed configuration description */
    bedConfiguration: string;
    /** Floor space in square feet */
    squareFeet: number;
    /** Available view types */
    views: string[];
    /** Price range for this room type */
    priceRange: PriceRange;
    /** In-room amenities */
    amenities: string[];
    /** Room-specific features */
    features: string[];
    /** Accessibility options */
    accessibility: {
        wheelchairAccessible: boolean;
        rollInShower: boolean;
        hearingAccessible: boolean;
        visualAccessible: boolean;
    };
    /** Balcony or patio information */
    outdoor?: {
        balcony: boolean;
        patio: boolean;
        view: string;
    };
}

/** Dining location within resort */
export interface DiningOption {
    /** Unique dining location identifier */
    id: string;
    /** Display name */
    name: string;
    /** Description of cuisine and atmosphere */
    description: string;
    /** Dining category */
    category: DiningCategory;
    /** Types of cuisine served */
    cuisine: string[];
    /** Price range (1-4 dollar signs) */
    priceRange: 1 | 2 | 3 | 4;
    /** Whether reservations are required */
    requiresReservation: boolean;
    /** Operating hours */
    hours: string;
    /** Disney Dining Plans accepted */
    diningPlans: string[];
    /** Menu highlights */
    menuHighlights?: string[];
    /** Special features */
    features?: string[];
    /** Character dining information */
    characterDining?: {
        hasCharacters: boolean;
        characters?: string[];
        meals?: string[];
    };
}

/** Recreation activity or facility */
export interface RecreationOption {
    /** Unique recreation identifier */
    id: string;
    /** Display name */
    name: string;
    /** Activity description */
    description: string;
    /** Recreation category */
    category: RecreationCategory;
    /** Operating hours */
    hours: string;
    /** Whether additional fee is required */
    additionalFee: boolean;
    /** Cost if there's an additional fee */
    cost?: string;
    /** Whether reservation is required */
    reservationRequired: boolean;
    /** Age restrictions or recommendations */
    ageRequirements?: string;
    /** Equipment provided or required */
    equipment?: string[];
    /** Capacity limits */
    capacity?: number;
    /** Seasonal availability */
    seasonal?: boolean;
}

/** Transportation option from resort */
export interface Transportation {
    /** Transportation type */
    type: TransportationType;
    /** Destinations served */
    destinationsServed: string[];
    /** Service frequency */
    frequency: string;
    /** Operating hours */
    hours: string;
    /** Estimated travel time to key destinations */
    travelTimes?: Record<string, number>;
    /** Additional notes */
    notes?: string;
}

/** Media gallery organization */
export interface ResortImageGallery {
    /** Primary resort image */
    main: string;
    /** General resort gallery */
    gallery: string[];
    /** Room type images organized by room ID */
    rooms: Record<string, string[]>;
    /** Dining location images */
    dining: Record<string, string[]>;
    /** Amenity images */
    amenities: Record<string, string[]>;
    /** Recreation images */
    recreation: Record<string, string[]>;
    /** Pool and water feature images */
    pools: string[];
    /** Lobby and common area images */
    commonAreas: string[];
}

/** Resort theming and design details */
export interface ResortTheming {
    /** Primary theme description */
    theme: string;
    /** Detailed theming information */
    details: string;
    /** Design inspiration */
    inspiration?: string;
    /** Architectural style */
    architecture?: string;
    /** Color palette */
    colorPalette?: string[];
    /** Key design elements */
    designElements?: string[];
}

// =============================================================================
// MAIN RESORT INTERFACE
// =============================================================================

/** Complete Disney resort interface */
export interface DisneyResort {
    /** Unique resort identifier (slug-based) */
    id: string;
    /** Official resort name */
    name: string;
    /** Resort category/tier */
    category: ResortCategory;
    /** Brief marketing description */
    description: string;
    /** Detailed description */
    longDescription: string;
    /** Resort amenities */
    amenities: Amenity[];
    /** Available room types */
    roomTypes: RoomType[];
    /** Geographic location */
    location: ResortLocation;
    /** Dining options */
    dining: DiningOption[];
    /** Recreation activities */
    recreation: RecreationOption[];
    /** Transportation options */
    transportation: Transportation[];
    /** Theming information */
    theming: ResortTheming;
    /** Opening date */
    openingDate: string;
    /** Last major refurbishment */
    lastRefurbished?: string;
    /** Image gallery */
    images: ResortImageGallery;
    /** Pricing structure by category */
    pricing: {
        /** Value season range */
        valueRange: PriceRange;
        /** Regular season range */
        moderateRange: PriceRange;
        /** Peak season range */
        deluxeRange: PriceRange;
    };
    /** Contact information */
    contact: {
        /** Main phone number */
        phoneNumber: string;
        /** Reservations phone */
        reservationsPhone?: string;
        /** Email address */
        email?: string;
        /** Website URL */
        website?: string;
    };
    /** Nearby attractions and points of interest */
    nearbyAttractions: string[];
    /** Featured experiences unique to this resort */
    featuredExperiences: string[];
    /** Special considerations for guests */
    specialConsiderations?: string[];
    /** Accessibility information */
    accessibility: {
        /** General accessibility features */
        generalFeatures: string[];
        /** Room accessibility options */
        roomFeatures: string[];
        /** Transportation accessibility */
        transportationFeatures: string[];
        /** Dining accessibility */
        diningFeatures: string[];
    };
    /** Guest reviews and ratings */
    ratings?: {
        /** Overall rating (1-5) */
        overall?: number;
        /** Cleanliness rating */
        cleanliness?: number;
        /** Service rating */
        service?: number;
        /** Value rating */
        value?: number;
        /** Location rating */
        location?: number;
        /** Number of reviews */
        reviewCount?: number;
    };
    /** Seasonal information */
    seasonalInfo?: {
        /** Holiday decorations */
        holidayDecorations?: string[];
        /** Seasonal events */
        seasonalEvents?: string[];
        /** Pool/recreation seasonal closures */
        seasonalClosures?: string[];
    };
    /** Timestamp information */
    timestamps?: {
        /** When record was created */
        createdAt: string;
        /** When record was last updated */
        updatedAt: string;
    };
}

// =============================================================================
// FILTER AND SEARCH INTERFACES
// =============================================================================

/** Resort search and filtering options */
export interface ResortFilters {
    /** Filter by resort categories */
    categories?: ResortCategory[];
    /** Filter by resort areas */
    areas?: ResortArea[];
    /** Filter by price range */
    priceRange?: {
        min?: number;
        max?: number;
    };
    /** Filter by amenity categories */
    amenityCategories?: AmenityCategory[];
    /** Filter by specific amenities */
    amenities?: string[];
    /** Filter by transportation types */
    transportation?: TransportationType[];
    /** Filter by room features */
    roomFeatures?: string[];
    /** Filter by dining options */
    diningCategories?: DiningCategory[];
    /** Filter by recreation options */
    recreation?: RecreationCategory[];
    /** Filter by guest rating */
    minRating?: number;
    /** Filter by occupancy */
    maxOccupancy?: number;
    /** Text search */
    searchQuery?: string;
    /** Filter by accessibility features */
    accessibility?: string[];
}

/** Resort search result with relevance */
export interface ResortSearchResult {
    /** The resort */
    resort: DisneyResort;
    /** Relevance score (0-1) */
    relevanceScore: number;
    /** Matched search fields */
    matchedFields: string[];
    /** Highlighted text snippets */
    highlights?: string[];
}

/** Resort recommendation */
export interface ResortRecommendation {
    /** Recommended resort */
    resort: DisneyResort;
    /** Recommendation score */
    score: number;
    /** Reasons for recommendation */
    reasons: string[];
    /** Best room type for the guest */
    recommendedRoomType?: RoomType;
    /** Best season to visit */
    bestSeason?: string;
    /** Estimated cost for stay */
    estimatedCost?: {
        nights: number;
        roomCost: number;
        totalCost: number;
    };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Input for creating a new resort */
export type CreateResortInput = Omit<DisneyResort, 'timestamps'>;

/** Input for updating resort information */
export type UpdateResortInput = Partial<Omit<DisneyResort, 'id' | 'timestamps'>>;

/** Resort summary for list views */
export type ResortSummary = Pick<
    DisneyResort,
    'id' | 'name' | 'category' | 'description' | 'location' | 'pricing' | 'images' | 'ratings'
> & {
    /** Key highlights for quick reference */
    highlights: string[];
    /** Primary amenity categories */
    primaryAmenities: AmenityCategory[];
};

/** Comparison between resorts */
export interface ResortComparison {
    /** Resorts being compared */
    resorts: DisneyResort[];
    /** Comparison criteria */
    criteria: {
        /** Price comparison */
        pricing: {
            resort: string;
            lowPrice: number;
            highPrice: number;
        }[];
        /** Amenity comparison */
        amenities: {
            amenity: string;
            availability: Record<string, boolean>;
        }[];
        /** Transportation comparison */
        transportation: {
            destination: string;
            options: Record<string, TransportationType[]>;
        }[];
        /** Room comparison */
        rooms: {
            roomType: string;
            availability: Record<string, boolean>;
            pricing: Record<string, PriceRange>;
        }[];
    };
}

// =============================================================================
// FUTURE CMS INTEGRATION NOTES
// =============================================================================

/**
 * FUTURE ENHANCEMENT: Consider GraphQL CMS Integration
 * 
 * Instead of maintaining large data files, consider:
 * 
 * 1. **Headless CMS Integration:**
 *    - Contentful, Strapi, or Sanity for content management
 *    - Non-technical staff can update resort information
 *    - Automated content validation and workflow
 * 
 * 2. **GraphQL Schema Stitching:**
 *    - Combine Disney official APIs with custom CMS data
 *    - Real-time pricing from Disney + custom content from CMS
 *    - Cached responses for performance
 * 
 * 3. **Example GraphQL Query:**
 *    ```graphql
 *    query GetResort($id: ID!) {
 *      resort(id: $id) {
 *        ...ResortBasicInfo
 *        pricing @source(api: "disney")
 *        availability @source(api: "disney")
 *        content @source(api: "cms")
 *        images @source(api: "cms")
 *      }
 *    }
 *    ```
 * 
 * 4. **Benefits:**
 *    - Separation of official data vs. editorial content
 *    - Real-time pricing and availability
 *    - Easier content management workflow
 *    - Better performance through intelligent caching
 *    - Reduced maintenance burden on developers
 */

// =============================================================================
// EXPORT UTILITY FUNCTIONS
// =============================================================================

/** Resort utility functions interface */
export interface ResortUtils {
    /** Calculate distance between resort and destination */
    calculateDistance(resort: DisneyResort, destination: { lat: number; lng: number }): number;
    
    /** Get transportation options to specific destination */
    getTransportationOptions(resort: DisneyResort, destination: string): Transportation[];
    
    /** Find best room type based on criteria */
    findBestRoomType(resort: DisneyResort, criteria: {
        occupancy: number;
        budget?: number;
        features?: string[];
    }): RoomType | null;
    
    /** Calculate estimated cost for stay */
    calculateStayCost(resort: DisneyResort, options: {
        roomTypeId: string;
        nights: number;
        season: 'value' | 'regular' | 'peak';
    }): number;
    
    /** Get available amenities by category */
    getAmenitiesByCategory(resort: DisneyResort, category: AmenityCategory): Amenity[];
    
    /** Check if resort meets accessibility requirements */
    meetsAccessibilityRequirements(resort: DisneyResort, requirements: string[]): boolean;
} 