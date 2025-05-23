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

    // Operating Information
    operatingHours: OperatingHours;
    phoneNumber?: string;
    reservationInfo: ReservationInfo;

    // Disney-Specific Features
    diningPlanInfo: DiningPlanInfo;
    characterDining?: CharacterDiningInfo;
    specialFeatures: SpecialFeature[];

    // Content
    menu?: MenuHighlight[];
    imageUrl?: string;
    thumbnailUrl?: string;
    galleryImages?: string[];

    // Metadata
    tags: string[];
    popularItems?: string[];
    chefSpecialties?: string[];
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
    MEDITERRANEAN = "Mediterranean",
    MIDDLE_EASTERN = "Middle Eastern",
    AFRICAN = "African",
    LATIN_AMERICAN = "Latin American",
    CARIBBEAN = "Caribbean",
    SOUTHERN = "Southern",
    PIZZA = "Pizza",
    BAKERY = "Bakery",
    DESSERTS = "Desserts",
    ICE_CREAM = "Ice Cream",
    COFFEE = "Coffee",
    BAR = "Bar",
    BUFFET = "Buffet",
    VEGETARIAN = "Vegetarian",
    VEGAN = "Vegan",
    HEALTHY = "Healthy",
    COMFORT_FOOD = "Comfort Food",
    INTERNATIONAL = "International",
    FUSION = "Fusion"
}

export enum ServiceType {
    QUICK_SERVICE = "Quick Service",
    TABLE_SERVICE = "Table Service",
    SIGNATURE_DINING = "Signature Dining",
    FINE_DINING = "Fine Dining",
    LOUNGE = "Lounge",
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
    reservationUrl?: string;
    walkUpsAccepted: boolean;
    reservationTips?: string[];
    peakTimes?: string[];
    bestTimesToVisit?: string[];
}

export interface DiningPlanInfo {
    acceptsDiningPlan: boolean;
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
    LOCAL_INGREDIENTS = "Local Ingredients"
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
    ACCESSIBLE_RESTROOMS = "Accessible Restrooms"
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
    MAGIC_KINGDOM = "magic-kingdom",
    EPCOT = "epcot",
    HOLLYWOOD_STUDIOS = "hollywood-studios",
    ANIMAL_KINGDOM = "animal-kingdom",
    DISNEY_SPRINGS = "disney-springs",
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