export interface Location {
    latitude: number;
    longitude: number;
    areaName: string;
    parkId?: string;
    resortId?: string;
    landName?: string;
}

export interface OperatingHours {
    [key: string]: string; // day of week to hours string
}

export interface MenuHighlight {
    name: string;
    description: string;
    price?: number;
    imageUrl?: string;
    category?: string;
    isSignature?: boolean;
    diningPlanCredits?: number;
}

export interface DietaryInfo {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
    halal: boolean;
    kosher: boolean;
    keto: boolean;
    paleo: boolean;
}

// New pricing structure for different meal periods
export interface MealPricing {
    adult: number;
    child: number;
}

export interface PricingInfo {
    breakfast?: MealPricing;
    lunch?: MealPricing;
    dinner?: MealPricing;
    entrees?: string; // for price ranges like "28-68"
}

// Enhanced reservation difficulty enum
export enum ReservationDifficulty {
    EASY = "easy",
    MODERATE = "moderate",
    DIFFICULT = "difficult",
    VERY_DIFFICULT = "very_difficult",
    EXTREMELY_DIFFICULT = "extremely_difficult"
}

export interface DisneyRestaurant {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;

    // Location Information
    location: Location;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };

    // Basic Information
    cuisineTypes: CuisineType[];
    serviceType: ServiceType;
    priceRange: PriceRange;
    diningExperience: DiningExperience;

    // Meal Information
    mealPeriods: MealPeriod[];
    pricing?: PricingInfo;

    // Operating Information
    operatingHours: OperatingHours;
    phoneNumber?: string;
    reservationInfo: ReservationInfo;

    // Disney-Specific Features
    diningPlanInfo: DiningPlanInfo;
    characterDining?: CharacterDiningInfo;
    specialFeatures: SpecialFeature[];

    // Mobile & Digital Features
    mobileOrdering: boolean;
    timeLimit?: string; // For locations like Oga's Cantina

    // Content
    menu?: MenuHighlight[];
    menuHighlights?: string[];
    imageUrl?: string;
    thumbnailUrl?: string;
    galleryImages?: string[];

    // Operational Notes
    challenges?: string[];
    dietaryAccommodations: string[];

    // Metadata
    tags: string[];
    popularItems?: string[];
    chefSpecialities?: string[];
    ambiance: string[];
    accessibility: AccessibilityFeature[];

    // Ratings & Reviews
    averageRating?: number;
    reviewCount?: number;
    disneyRating?: number; // Official Disney quality rating

    // Business Logic
    isPopular: boolean;
    isNew?: boolean;
    isSeasonal?: boolean;
    requiresID?: boolean;
    minimumAge?: number;

    // SEO & Search
    searchKeywords: string[];
    alternateNames?: string[];

    createdAt: string;
    updatedAt: string;
}

// New meal periods enum
export enum MealPeriod {
    BREAKFAST = "breakfast",
    LUNCH = "lunch",
    DINNER = "dinner",
    SNACK = "snack",
    BEVERAGES = "beverages"
}

export enum CuisineType {
    AMERICAN = "American",
    ITALIAN = "Italian",
    MEXICAN = "Mexican",
    ASIAN = "Asian",
    CHINESE = "Chinese",
    JAPANESE = "Japanese",
    THAI = "Thai",
    INDIAN = "Indian",
    SEAFOOD = "Seafood",
    STEAKHOUSE = "Steakhouse",
    FRENCH = "French",
    FRENCH_INSPIRED = "French-inspired",
    MEDITERRANEAN = "Mediterranean",
    MIDDLE_EASTERN = "Middle Eastern",
    AFRICAN = "African",
    AFRICAN_INSPIRED = "African-inspired",
    LATIN_AMERICAN = "Latin American",
    CARIBBEAN = "Caribbean",
    SOUTHERN = "Southern",
    SOUTHERN_COMFORT = "Southern Comfort Food",
    PIZZA = "Pizza",
    NEAPOLITAN_PIZZA = "Neapolitan Pizza",
    BAKERY = "Bakery",
    DESSERTS = "Desserts",
    ICE_CREAM = "Ice Cream",
    FROZEN_TREATS = "Frozen Treats",
    COFFEE = "Coffee",
    BAR = "Bar",
    BUFFET = "Buffet",
    AMERICAN_BUFFET = "American Buffet",
    VEGETARIAN = "Vegetarian",
    VEGAN = "Vegan",
    HEALTHY = "Healthy",
    HEALTHY_OPTIONS = "Healthy Options",
    COMFORT_FOOD = "Comfort Food",
    AMERICAN_COMFORT_FOOD = "American Comfort Food",
    INTERNATIONAL = "International",
    INTERNATIONAL_INSPIRED = "International-inspired",
    FUSION = "Fusion",
    MODERN_AMERICAN = "Modern American",
    AMERICAN_FINE_DINING = "American Fine Dining",
    CALIFORNIA_CUISINE = "California Cuisine",
    NORWEGIAN_INSPIRED = "Norwegian-inspired",
    CANADIAN_STEAKHOUSE = "Canadian Steakhouse",
    PAN_ASIAN = "Pan-Asian",
    MODERN_BBQ = "Modern BBQ",
    GOURMET_BURGERS = "Gourmet Burgers",
    UPSCALE_SEAFOOD = "Upscale Seafood",
    STAR_WARS_THEMED = "Star Wars Themed Beverages",
    GALACTIC_FARE = "Star Wars Themed Galactic Fare",
    POLYNESIAN = "Polynesian",
    SPANISH = "Spanish",
    BARBECUE = "Barbecue",
    BEVERAGES_LIGHT_SNACKS = "Beverages and Light Snacks"
}

export enum ServiceType {
    QUICK_SERVICE = "Quick Service",
    TABLE_SERVICE = "Table Service",
    SIGNATURE_DINING = "Signature Dining",
    FINE_DINING = "Fine Dining",
    LOUNGE = "Lounge",
    LOUNGE_BAR = "Lounge/Bar",
    BAR = "Bar",
    CAFE = "Cafe",
    KIOSK = "Kiosk",
    FOOD_TRUCK = "Food Truck",
    SNACK_CART = "Snack Cart"
}

export enum DiningExperience {
    CASUAL = "Casual",
    FAMILY = "Family",
    ROMANTIC = "Romantic",
    FINE_DINING = "Fine Dining",
    CHARACTER = "Character",
    THEMED = "Themed",
    ENTERTAINMENT = "Entertainment",
    OUTDOOR = "Outdoor",
    WATERFRONT = "Waterfront",
    ROOFTOP = "Rooftop",
    SPORTS_BAR = "Sports Bar",
    QUICK_BITE = "Quick Bite",
    GRAB_AND_GO = "Grab and Go"
}

export enum PriceRange {
    BUDGET = "$",      // Under $15 per person
    MODERATE = "$$",   // $15-35 per person
    EXPENSIVE = "$$$", // $36-60 per person
    LUXURY = "$$$$"    // Over $60 per person
}

export interface ReservationInfo {
    acceptsReservations: boolean;
    requiresReservations: boolean;
    advanceReservationDays: number; // How many days in advance you can book
    reservationDifficulty: ReservationDifficulty;
    reservationUrl?: string;
    walkUpsAccepted: boolean;
    reservationTips?: string[];
    peakTimes?: string[];
    bestTimesToVisit?: string[];
}

export interface DiningPlanInfo {
    acceptsDiningPlan: boolean;
    participating: boolean;
    creditsRequired: number;
    isSignatureDining: boolean;
    tableServiceCredits?: number;
    quickServiceCredits?: number;
    snackCredits?: number;
    eligiblePlans: DiningPlan[];
    notes?: string;
}

export enum DiningPlan {
    QUICK_SERVICE = "Disney Quick-Service Dining Plan",
    DINING_PLAN = "Disney Dining Plan",
    DELUXE_DINING = "Disney Deluxe Dining Plan",
    PLUS_DINING = "Disney Dining Plan Plus"
}

export interface CharacterDiningInfo {
    hasCharacterDining: boolean;
    characters?: string[];
    characterMeals?: string[]; // breakfast, lunch, dinner
    characterExperience?: string;
    rotationInfo?: string;
    photoPackageIncluded?: boolean;
}

export enum SpecialFeature {
    MOBILE_ORDERING = "Mobile Ordering",
    CURBSIDE_PICKUP = "Curbside Pickup",
    DELIVERY = "Delivery",
    OUTDOOR_SEATING = "Outdoor Seating",
    PRIVATE_DINING = "Private Dining",
    CHEF_TABLE = "Chef's Table",
    WINE_BAR = "Wine Bar",
    FULL_BAR = "Full Bar",
    CRAFT_COCKTAILS = "Craft Cocktails",
    LIVE_ENTERTAINMENT = "Live Entertainment",
    FIREWORKS_VIEW = "Fireworks View",
    WATER_VIEW = "Water View",
    PARK_VIEW = "Park View",
    ROOFTOP_DINING = "Rooftop Dining",
    THEMED_DINING = "Themed Dining",
    INTERACTIVE_EXPERIENCE = "Interactive Experience",
    COOKING_CLASS = "Cooking Class",
    WINE_TASTING = "Wine Tasting",
    HAPPY_HOUR = "Happy Hour",
    LATE_NIGHT_DINING = "Late Night Dining",
    BREAKFAST_ALL_DAY = "Breakfast All Day",
    ALLERGY_FRIENDLY = "Allergy Friendly",
    KIDS_MENU = "Kids Menu",
    HEALTHY_OPTIONS = "Healthy Options",
    SPECIALTY_DIETARY = "Specialty Dietary",
    SEASONAL_MENU = "Seasonal Menu",
    FARM_TO_TABLE = "Farm to Table",
    SUSTAINABLE = "Sustainable",
    LOCAL_INGREDIENTS = "Local Ingredients",
    WATERFRONT = "Waterfront",
    AMPHICAR_TOURS = "Amphicar Tours",
    BOAT_COLLECTION = "Boat Collection Display",
    EXHIBITION_KITCHEN = "Exhibition Kitchen",
    MULTIPLE_LEVELS = "Multiple Dining Levels",
    BOURBON_BAR = "Bourbon Bar",
    CRAFT_BEER = "Craft Beer Selection",
    GOURMET_OPTIONS = "Gourmet Options",
    ARTISANAL_SHAKES = "Artisanal Gelato Shakes"
}

export enum AccessibilityFeature {
    WHEELCHAIR_ACCESSIBLE = "Wheelchair Accessible",
    ASSISTED_LISTENING = "Assisted Listening",
    BRAILLE_MENUS = "Braille Menus",
    LARGE_PRINT_MENUS = "Large Print Menus",
    SIGN_LANGUAGE = "Sign Language Interpretation",
    DIETARY_ACCOMMODATIONS = "Dietary Accommodations",
    SERVICE_ANIMAL_FRIENDLY = "Service Animal Friendly",
    ACCESSIBLE_PARKING = "Accessible Parking",
    ACCESSIBLE_RESTROOMS = "Accessible Restrooms",
    KIDS_MENU = "Kids Menu"
}

export interface DiningFilters {
    parkIds?: string[];
    resortIds?: string[];
    cuisineTypes?: CuisineType[];
    serviceTypes?: ServiceType[];
    diningExperiences?: DiningExperience[];
    priceRanges?: PriceRange[];
    specialFeatures?: SpecialFeature[];
    acceptsDiningPlan?: boolean;
    hasCharacterDining?: boolean;
    acceptsReservations?: boolean;
    openNow?: boolean;
    rating?: number;
    dietary?: DietaryInfo;
    searchQuery?: string;
}

export interface DiningSuggestion {
    restaurant: DisneyRestaurant;
    matchScore: number;
    matchReasons: string[];
    alternativeOptions?: DisneyRestaurant[];
    bestTimeToVisit?: string;
    reservationTips?: string[];
}

// Location-specific types
export enum DisneyLocation {
    MAGIC_KINGDOM = "magic_kingdom",
    EPCOT = "epcot",
    HOLLYWOOD_STUDIOS = "hollywood_studios",
    ANIMAL_KINGDOM = "animal_kingdom",
    DISNEY_SPRINGS = "disney_springs",
    BOARDWALK = "boardwalk",
    GRAND_FLORIDIAN = "grand-floridian",
    POLYNESIAN = "polynesian",
    CONTEMPORARY = "contemporary",
    WILDERNESS_LODGE = "wilderness-lodge",
    YACHT_CLUB = "yacht-club",
    BEACH_CLUB = "beach-club",
    SWAN_DOLPHIN = "swan-dolphin",
    CARIBBEAN_BEACH = "caribbean-beach",
    RIVIERA = "riviera",
    SARATOGA_SPRINGS = "saratoga-springs",
    OLD_KEY_WEST = "old-key-west",
    PORT_ORLEANS = "port-orleans",
    CORONADO_SPRINGS = "coronado-springs",
    ANIMAL_KINGDOM_LODGE = "animal-kingdom-lodge",
    ALL_STAR = "all-star",
    POP_CENTURY = "pop-century",
    ART_OF_ANIMATION = "art-of-animation",
    ESPN_WIDE_WORLD = "espn-wide-world"
}

export interface LocationInfo {
    id: DisneyLocation;
    name: string;
    type: "park" | "resort" | "entertainment-district" | "other";
    restaurantCount: number;
    popularCuisines: CuisineType[];
    priceRangeDistribution: Record<PriceRange, number>;
}

// Database metadata interface
export interface DisneyDiningDatabase {
    metadata: {
        total_locations: number;
        last_updated: string;
        data_sources: string[];
        note: string;
    };
    locations: Record<string, LocationData>;
    dining_plan_info: DiningPlanConfiguration;
    reservation_info: ReservationConfiguration;
    special_categories: SpecialCategoriesInfo;
    operational_notes: OperationalNotesInfo;
}

export interface LocationData {
    name: string;
    total_restaurants: number;
    areas?: string[];
    restaurants: DisneyRestaurant[];
}

export interface DiningPlanConfiguration {
    quick_service: {
        credits_required: number;
        participating_locations: string;
    };
    table_service: {
        standard: {
            credits_required: number;
            participating_locations: string;
        };
        signature: {
            credits_required: number;
            participating_locations: string;
        };
    };
    snack_credits: {
        credits_required: number;
        participating_locations: string;
    };
}

export interface ReservationConfiguration {
    advance_booking_window: {
        general_public: string;
        disney_resort_guests: string;
    };
    difficulty_levels: Record<string, string>;
}

export interface SpecialCategoriesInfo {
    character_dining: {
        total_locations: number;
        advance_reservations_essential: boolean;
        popular_locations: string[];
    };
    signature_dining: {
        total_locations: number;
        dining_plan_credits: number;
        dress_code: string;
        premium_experiences: string[];
    };
    quick_service: {
        total_locations: number;
        mobile_ordering: string;
        peak_times: string;
    };
}

export interface OperationalNotesInfo {
    hours: string;
    menus: string;
    availability: string;
    reservations: string;
    dietary_accommodations: string;
}