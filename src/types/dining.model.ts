/**
 * Unified Dining Model for Disney World
 * Pure types without data, with value objects and domain logic
 */

// =============================================================================
// CORE ENUMS AND CONSTANTS
// =============================================================================

/** Dining location areas across Disney World */
export enum DisneyDiningArea {
    // Theme Parks
    MAGIC_KINGDOM = 'magic-kingdom',
    EPCOT = 'epcot', 
    HOLLYWOOD_STUDIOS = 'hollywood-studios',
    ANIMAL_KINGDOM = 'animal-kingdom',
    
    // Entertainment Districts
    DISNEY_SPRINGS_MARKETPLACE = 'disney-springs-marketplace',
    DISNEY_SPRINGS_LANDING = 'disney-springs-landing',
    DISNEY_SPRINGS_TOWN_CENTER = 'disney-springs-town-center',
    DISNEY_SPRINGS_WEST_SIDE = 'disney-springs-west-side',
    BOARDWALK = 'boardwalk',
    
    // Resort Areas
    GRAND_FLORIDIAN = 'grand-floridian',
    POLYNESIAN = 'polynesian',
    CONTEMPORARY = 'contemporary',
    WILDERNESS_LODGE = 'wilderness-lodge',
    YACHT_CLUB = 'yacht-club',
    BEACH_CLUB = 'beach-club',
    SWAN_DOLPHIN = 'swan-dolphin',
    CARIBBEAN_BEACH = 'caribbean-beach',
    RIVIERA = 'riviera',
    SARATOGA_SPRINGS = 'saratoga-springs',
    OLD_KEY_WEST = 'old-key-west',
    PORT_ORLEANS = 'port-orleans',
    CORONADO_SPRINGS = 'coronado-springs',
    ANIMAL_KINGDOM_LODGE = 'animal-kingdom-lodge',
    ALL_STAR = 'all-star',
    POP_CENTURY = 'pop-century',
    ART_OF_ANIMATION = 'art-of-animation'
}

/** Service types for dining locations */
export enum ServiceType {
    QUICK_SERVICE = 'quick-service',
    TABLE_SERVICE = 'table-service', 
    SIGNATURE_DINING = 'signature-dining',
    FINE_DINING = 'fine-dining',
    LOUNGE = 'lounge',
    BAR = 'bar',
    CAFE = 'cafe',
    KIOSK = 'kiosk',
    FOOD_TRUCK = 'food-truck',
    SNACK_CART = 'snack-cart'
}

/** Dining experience classifications */
export enum DiningExperience {
    CASUAL = 'casual',
    FAMILY = 'family',
    ROMANTIC = 'romantic',
    FINE_DINING = 'fine-dining',
    CHARACTER = 'character',
    THEMED = 'themed',
    ENTERTAINMENT = 'entertainment',
    OUTDOOR = 'outdoor', 
    WATERFRONT = 'waterfront',
    ROOFTOP = 'rooftop',
    SPORTS_BAR = 'sports-bar',
    QUICK_BITE = 'quick-bite',
    GRAB_AND_GO = 'grab-and-go'
}

/** Price range tiers */
export enum PriceRange {
    BUDGET = '$',      // Under $15 per person
    MODERATE = '$$',   // $15-35 per person  
    EXPENSIVE = '$$$', // $36-60 per person
    LUXURY = '$$$$'    // Over $60 per person
}

/** Meal periods */
export enum MealPeriod {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner',
    BRUNCH = 'brunch',
    SNACK = 'snack',
    BEVERAGES = 'beverages',
    ALL_DAY = 'all-day'
}

/** Disney Dining Plan types */
export enum DiningPlan {
    QUICK_SERVICE = 'quick-service-plan',
    DINING_PLAN = 'dining-plan',
    DELUXE_DINING = 'deluxe-dining-plan',
    PLUS_DINING = 'plus-dining-plan'
}

// =============================================================================
// VALUE OBJECTS
// =============================================================================

/** Reservation difficulty with business logic and crowd-level mapping */
export class ReservationDifficulty {
    private constructor(
        public readonly level: 'easy' | 'moderate' | 'difficult' | 'very-difficult' | 'extremely-difficult',
        public readonly score: number,
        public readonly description: string,
        public readonly adviceText: string
    ) {}

    /** Create ReservationDifficulty from crowd level (1-10) */
    static fromCrowdLevel(crowdLevel: number): ReservationDifficulty {
        if (crowdLevel <= 2) {
            return new ReservationDifficulty(
                'easy',
                crowdLevel,
                'Reservations generally available',
                'Book 1-7 days in advance. Walk-ups often accepted.'
            );
        }
        
        if (crowdLevel <= 4) {
            return new ReservationDifficulty(
                'moderate',
                crowdLevel,
                'Reservations recommended',
                'Book 1-2 weeks in advance. Limited walk-up availability.'
            );
        }
        
        if (crowdLevel <= 6) {
            return new ReservationDifficulty(
                'difficult',
                crowdLevel,
                'Reservations strongly recommended',
                'Book 30-45 days in advance. Very limited walk-up availability.'
            );
        }
        
        if (crowdLevel <= 8) {
            return new ReservationDifficulty(
                'very-difficult',
                crowdLevel,
                'Reservations essential',
                'Book exactly 60 days in advance at 6 AM EST. Consider dining packages.'
            );
        }
        
        return new ReservationDifficulty(
            'extremely-difficult',
            crowdLevel,
            'Extremely hard to get',
            'Book exactly 60 days in advance at 6 AM EST. Consider cancellation alerts and alternative times.'
        );
    }

    /** Create from explicit difficulty level */
    static fromLevel(level: ReservationDifficulty['level']): ReservationDifficulty {
        const levelMap = {
            'easy': 2,
            'moderate': 3,
            'difficult': 5,
            'very-difficult': 7,
            'extremely-difficult': 9
        };
        
        return ReservationDifficulty.fromCrowdLevel(levelMap[level]);
    }

    /** Check if reservations are required */
    get requiresReservation(): boolean {
        return this.score >= 4;
    }

    /** Check if this is a hard-to-get reservation */
    get isHardToGet(): boolean {
        return this.score >= 6;
    }

    /** Get booking window recommendation in days */
    get recommendedBookingDays(): number {
        if (this.score <= 2) return 7;
        if (this.score <= 4) return 14;
        if (this.score <= 6) return 45;
        return 60;
    }

    /** Check if walk-ups are likely available */
    get walkUpsLikely(): boolean {
        return this.score <= 3;
    }
}

// =============================================================================
// CORE INTERFACES
// =============================================================================

/** Geographic location information */
export interface DiningLocation {
    /** High-precision latitude */
    latitude: number;
    /** High-precision longitude */
    longitude: number;
    /** Disney area classification */
    area: DisneyDiningArea;
    /** Specific land within a park (if applicable) */
    landName?: string;
    /** Street address information */
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
}

/** Operating hours for different days */
export interface OperatingHours {
    /** Monday hours in 'HH:MM - HH:MM' format */
    monday?: string;
    /** Tuesday hours in 'HH:MM - HH:MM' format */
    tuesday?: string;
    /** Wednesday hours in 'HH:MM - HH:MM' format */
    wednesday?: string;
    /** Thursday hours in 'HH:MM - HH:MM' format */
    thursday?: string;
    /** Friday hours in 'HH:MM - HH:MM' format */
    friday?: string;
    /** Saturday hours in 'HH:MM - HH:MM' format */
    saturday?: string;
    /** Sunday hours in 'HH:MM - HH:MM' format */
    sunday?: string;
    /** Special holiday hours */
    holidays?: Record<string, string>;
}

/** Pricing information for different meal periods */
export interface MealPricing {
    /** Adult price */
    adult: number;
    /** Child price (ages 3-9) */
    child: number;
}

/** Comprehensive pricing structure */
export interface PricingInfo {
    /** Breakfast pricing */
    breakfast?: MealPricing;
    /** Lunch pricing */
    lunch?: MealPricing;
    /** Dinner pricing */
    dinner?: MealPricing;
    /** Entree price range for a la carte */
    entreeRange?: string;
    /** Average cost per person */
    averageCostPerPerson?: number;
}

/** Menu highlight or signature item */
export interface MenuHighlight {
    /** Item name */
    name: string;
    /** Item description */
    description: string;
    /** Price if fixed */
    price?: number;
    /** Item image URL */
    imageUrl?: string;
    /** Menu category */
    category?: string;
    /** Whether this is a signature dish */
    isSignature?: boolean;
    /** Disney Dining Plan credits required */
    diningPlanCredits?: number;
    /** Dietary information */
    dietary?: string[];
}

/** Dietary accommodation information */
export interface DietaryInfo {
    /** Vegetarian options available */
    vegetarian: boolean;
    /** Vegan options available */
    vegan: boolean;
    /** Gluten-free options available */
    glutenFree: boolean;
    /** Dairy-free options available */
    dairyFree: boolean;
    /** Nut-free options available */
    nutFree: boolean;
    /** Halal options available */
    halal: boolean;
    /** Kosher options available */
    kosher: boolean;
    /** Keto-friendly options available */
    keto: boolean;
    /** Paleo-friendly options available */
    paleo: boolean;
}

/** Reservation system information */
export interface ReservationInfo {
    /** Whether reservations are accepted */
    acceptsReservations: boolean;
    /** Whether reservations are required */
    requiresReservations: boolean;
    /** How many days in advance you can book */
    advanceReservationDays: number;
    /** Difficulty level with business logic */
    difficulty: ReservationDifficulty;
    /** Official reservation URL */
    reservationUrl?: string;
    /** Whether walk-ups are accepted */
    walkUpsAccepted: boolean;
    /** Tips for getting reservations */
    reservationTips?: string[];
    /** Peak times to avoid */
    peakTimes?: string[];
    /** Best times to visit for availability */
    bestTimesToVisit?: string[];
}

/** Disney Dining Plan information */
export interface DiningPlanInfo {
    /** Whether dining plan is accepted */
    acceptsDiningPlan: boolean;
    /** Whether actively participating in dining plan */
    participating: boolean;
    /** Number of credits required */
    creditsRequired: number;
    /** Whether this is signature dining (2 credits) */
    isSignatureDining: boolean;
    /** Table service credits if applicable */
    tableServiceCredits?: number;
    /** Quick service credits if applicable */
    quickServiceCredits?: number;
    /** Snack credits if applicable */
    snackCredits?: number;
    /** Which dining plans are accepted */
    eligiblePlans: DiningPlan[];
    /** Additional dining plan notes */
    notes?: string;
}

/** Character dining experience details */
export interface CharacterDiningInfo {
    /** Whether characters are present */
    hasCharacterDining: boolean;
    /** List of characters that appear */
    characters?: string[];
    /** Which meals have character experiences */
    characterMeals?: MealPeriod[];
    /** Description of character experience */
    characterExperience?: string;
    /** Information about character rotation */
    rotationInfo?: string;
    /** Whether photo package is included */
    photoPackageIncluded?: boolean;
}

/** Special features and amenities */
export interface SpecialFeatures {
    /** Mobile ordering available */
    mobileOrdering: boolean;
    /** Curbside pickup available */
    curbsidePickup: boolean;
    /** Delivery service available */
    delivery: boolean;
    /** Outdoor seating available */
    outdoorSeating: boolean;
    /** Private dining options */
    privateDining: boolean;
    /** Chef's table experience */
    chefsTable: boolean;
    /** Wine bar */
    wineBar: boolean;
    /** Full bar service */
    fullBar: boolean;
    /** Craft cocktails */
    craftCocktails: boolean;
    /** Live entertainment */
    liveEntertainment: boolean;
    /** Fireworks view */
    fireworksView: boolean;
    /** Water view */
    waterView: boolean;
    /** Park view */
    parkView: boolean;
    /** Rooftop dining */
    rooftopDining: boolean;
    /** Interactive experience */
    interactiveExperience: boolean;
    /** Cooking classes */
    cookingClass: boolean;
    /** Wine tasting */
    wineTasting: boolean;
    /** Happy hour */
    happyHour: boolean;
    /** Late night dining */
    lateNightDining: boolean;
    /** Breakfast served all day */
    breakfastAllDay: boolean;
}

/** Accessibility features */
export interface AccessibilityFeatures {
    /** Wheelchair accessible */
    wheelchairAccessible: boolean;
    /** Assisted listening devices */
    assistedListening: boolean;
    /** Braille menus available */
    brailleMenus: boolean;
    /** Large print menus available */
    largePrintMenus: boolean;
    /** Sign language interpretation */
    signLanguage: boolean;
    /** Service animals allowed */
    serviceAnimalFriendly: boolean;
    /** Accessible parking */
    accessibleParking: boolean;
    /** Accessible restrooms */
    accessibleRestrooms: boolean;
}

// =============================================================================
// MAIN RESTAURANT INTERFACE
// =============================================================================

/** Complete Disney dining location interface */
export interface DisneyRestaurant {
    /** Unique slug-based identifier */
    id: string;
    /** Display name */
    name: string;
    /** Full description */
    description: string;
    /** Brief summary for cards */
    shortDescription?: string;

    // Location Information
    /** Geographic and area information */
    location: DiningLocation;

    // Classification
    /** Types of cuisine served */
    cuisineTypes: string[];
    /** Service style */
    serviceType: ServiceType;
    /** Price tier */
    priceRange: PriceRange;
    /** Dining experience type */
    diningExperience: DiningExperience;

    // Operational Information
    /** When different meals are served */
    mealPeriods: MealPeriod[];
    /** Pricing structure */
    pricing?: PricingInfo;
    /** Operating hours */
    operatingHours: OperatingHours;
    /** Contact phone number */
    phoneNumber?: string;

    // Disney-Specific Features
    /** Reservation system details */
    reservationInfo: ReservationInfo;
    /** Disney Dining Plan information */
    diningPlanInfo: DiningPlanInfo;
    /** Character dining details */
    characterDining?: CharacterDiningInfo;
    /** Special features and amenities */
    specialFeatures: SpecialFeatures;

    // Content and Media
    /** Menu highlights and signature items */
    menuHighlights?: MenuHighlight[];
    /** Popular menu items */
    popularItems?: string[];
    /** Chef specialties */
    chefSpecialties?: string[];
    /** Primary image URL */
    imageUrl?: string;
    /** Thumbnail image URL */
    thumbnailUrl?: string;
    /** Gallery images */
    galleryImages?: string[];

    // Guest Experience
    /** Dietary accommodations */
    dietaryAccommodations: DietaryInfo;
    /** Accessibility features */
    accessibility: AccessibilityFeatures;
    /** Atmosphere and ambiance tags */
    ambiance: string[];
    /** Time limit for dining (e.g., Oga's Cantina) */
    timeLimit?: string;

    // Business Rules
    /** Whether this location is popular/in-demand */
    isPopular: boolean;
    /** Whether this is a new location */
    isNew?: boolean;
    /** Whether location is seasonal */
    isSeasonal?: boolean;
    /** Whether ID is required */
    requiresID?: boolean;
    /** Minimum age requirement */
    minimumAge?: number;

    // Ratings and Reviews
    /** Average guest rating */
    averageRating?: number;
    /** Number of reviews */
    reviewCount?: number;
    /** Official Disney quality rating */
    disneyRating?: number;

    // Metadata
    /** Search and discovery tags */
    tags: string[];
    /** Alternative names for search */
    alternateNames?: string[];
    /** SEO keywords */
    searchKeywords: string[];
    /** Operational challenges/notes */
    challenges?: string[];

    // Timestamps
    /** When record was created */
    createdAt: string;
    /** When record was last updated */
    updatedAt: string;
}

// =============================================================================
// FILTER AND SEARCH INTERFACES
// =============================================================================

/** Comprehensive filters for dining searches */
export interface DiningFilters {
    /** Filter by dining areas */
    areas?: DisneyDiningArea[];
    /** Filter by cuisine types */
    cuisineTypes?: string[];
    /** Filter by service types */
    serviceTypes?: ServiceType[];
    /** Filter by dining experiences */
    diningExperiences?: DiningExperience[];
    /** Filter by price ranges */
    priceRanges?: PriceRange[];
    /** Filter by meal periods */
    mealPeriods?: MealPeriod[];
    /** Filter by special features */
    hasFeatures?: (keyof SpecialFeatures)[];
    /** Filter by dining plan acceptance */
    acceptsDiningPlan?: boolean;
    /** Filter by character dining */
    hasCharacterDining?: boolean;
    /** Filter by reservation acceptance */
    acceptsReservations?: boolean;
    /** Filter by current operating status */
    openNow?: boolean;
    /** Minimum rating filter */
    minimumRating?: number;
    /** Dietary requirement filters */
    dietary?: Partial<DietaryInfo>;
    /** Text search query */
    searchQuery?: string;
    /** Maximum reservation difficulty */
    maxReservationDifficulty?: ReservationDifficulty['level'];
}

/** Search result with relevance scoring */
export interface DiningSearchResult {
    /** The restaurant */
    restaurant: DisneyRestaurant;
    /** Relevance score (0-1) */
    relevanceScore: number;
    /** Which fields matched the search */
    matchedFields: string[];
    /** Reasons for recommendation */
    matchReasons: string[];
}

/** Dining suggestion with business logic */
export interface DiningSuggestion {
    /** Recommended restaurant */
    restaurant: DisneyRestaurant;
    /** Match score based on preferences */
    matchScore: number;
    /** Reasons for the recommendation */
    matchReasons: string[];
    /** Alternative options to consider */
    alternativeOptions?: DisneyRestaurant[];
    /** Best time to visit for availability */
    bestTimeToVisit?: string;
    /** Tips for getting reservations */
    reservationTips?: string[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Input type for creating a new restaurant */
export type CreateRestaurantInput = Omit<DisneyRestaurant, 'createdAt' | 'updatedAt'>;

/** Input type for updating a restaurant */
export type UpdateRestaurantInput = Partial<Omit<DisneyRestaurant, 'id' | 'createdAt' | 'updatedAt'>>;

/** Restaurant summary for lists */
export type RestaurantSummary = Pick<
    DisneyRestaurant, 
    'id' | 'name' | 'shortDescription' | 'location' | 'serviceType' | 'priceRange' | 
    'cuisineTypes' | 'thumbnailUrl' | 'averageRating' | 'isPopular'
>; 