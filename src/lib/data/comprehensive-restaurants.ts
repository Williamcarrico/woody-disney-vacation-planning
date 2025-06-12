import {
    DisneyRestaurant,
    CuisineType,
    ServiceType,
    DiningExperience,
    PriceRange,
    SpecialFeature,
    AccessibilityFeature,
    DiningPlan,
    DisneyLocation,
    ReservationDifficulty,
    MealPeriod
} from "@/types/dining"

// Magic Kingdom Restaurants
export const magicKingdomRestaurants: DisneyRestaurant[] = [
    {
        id: "mk_001",
        name: "Be Our Guest Restaurant",
        description: "Dining inside Beast's Castle with French-inspired cuisine in three beautifully themed rooms including the Ballroom, Rose Gallery, and West Wing.",
        shortDescription: "French-inspired fine dining in Beast's Castle with themed dining rooms",
        location: {
            latitude: 28.4211,
            longitude: -81.5812,
            areaName: "Fantasyland - Beast's Castle",
            parkId: DisneyLocation.MAGIC_KINGDOM,
            landName: "Fantasyland"
        },
        cuisineTypes: [CuisineType.FRENCH_INSPIRED],
        serviceType: ServiceType.TABLE_SERVICE,
        priceRange: PriceRange.EXPENSIVE,
        diningExperience: DiningExperience.THEMED,
        mealPeriods: [MealPeriod.LUNCH, MealPeriod.DINNER],
        operatingHours: {
            "Monday": "11:30 AM - 9:00 PM",
            "Tuesday": "11:30 AM - 9:00 PM",
            "Wednesday": "11:30 AM - 9:00 PM",
            "Thursday": "11:30 AM - 9:00 PM",
            "Friday": "11:30 AM - 9:00 PM",
            "Saturday": "11:30 AM - 9:00 PM",
            "Sunday": "11:30 AM - 9:00 PM"
        },
        phoneNumber: "(407) 939-3463",
        reservationInfo: {
            acceptsReservations: true,
            requiresReservations: true,
            advanceReservationDays: 60,
            reservationDifficulty: ReservationDifficulty.EXTREMELY_DIFFICULT,
            reservationUrl: "https://disneyworld.disney.go.com/dining/magic-kingdom/be-our-guest-restaurant/",
            walkUpsAccepted: false,
            reservationTips: [
                "Reservations open 60 days in advance",
                "Very popular - book as early as possible",
                "Breakfast and lunch are quick-service style",
                "Dinner is table service with different menu"
            ],
            peakTimes: ["6:00 PM - 8:00 PM"],
            bestTimesToVisit: ["5:00 PM", "8:30 PM"]
        },
        diningPlanInfo: {
            acceptsDiningPlan: true,
            participating: true,
            creditsRequired: 2,
            isSignatureDining: true,
            tableServiceCredits: 1,
            eligiblePlans: [DiningPlan.DINING_PLAN, DiningPlan.DELUXE_DINING],
            notes: "Breakfast and lunch require 1 quick service credit; dinner requires 1 table service credit"
        },
        specialFeatures: [SpecialFeature.THEMED_DINING, SpecialFeature.ALLERGY_FRIENDLY, SpecialFeature.KIDS_MENU],
        mobileOrdering: false,
        dietaryAccommodations: ["vegetarian", "vegan", "gluten-free", "allergies"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        tags: ["Beauty and the Beast", "Themed", "French cuisine", "Castle dining", "Award-winning"],
        popularItems: ["The Grey Stuff", "Filet of Beef", "Master's Cupcake"],
        ambiance: ["Elegant", "Romantic", "Magical", "Intimate"],
        averageRating: 4.3,
        reviewCount: 2847,
        disneyRating: 4.5,
        isPopular: true,
        searchKeywords: ["Beauty and the Beast", "Beast's Castle", "French dining", "themed restaurant", "grey stuff"],
        alternateNames: ["Beast's Castle", "BOG"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        imageUrl: "/images/restaurants/be-our-guest.jpg"
    },
    {
        id: "mk_002",
        name: "Cinderella's Royal Table",
        description: "The ultimate Disney dining experience inside Cinderella Castle with Disney Princess character interactions and fine American cuisine.",
        shortDescription: "Royal dining with Disney Princesses inside Cinderella Castle",
        location: {
            latitude: 28.4204,
            longitude: -81.5816,
            areaName: "Fantasyland - Inside Cinderella Castle",
            parkId: DisneyLocation.MAGIC_KINGDOM,
            landName: "Fantasyland"
        },
        cuisineTypes: [CuisineType.AMERICAN_FINE_DINING],
        serviceType: ServiceType.SIGNATURE_DINING,
        priceRange: PriceRange.EXPENSIVE,
        diningExperience: DiningExperience.CHARACTER,
        mealPeriods: [MealPeriod.BREAKFAST, MealPeriod.LUNCH, MealPeriod.DINNER],
        pricing: {
            breakfast: { adult: 74, child: 45 },
            lunch: { adult: 88, child: 52 },
            dinner: { adult: 88, child: 52 }
        },
        operatingHours: {
            "Monday": "8:00 AM - 8:30 PM",
            "Tuesday": "8:00 AM - 8:30 PM",
            "Wednesday": "8:00 AM - 8:30 PM",
            "Thursday": "8:00 AM - 8:30 PM",
            "Friday": "8:00 AM - 8:30 PM",
            "Saturday": "8:00 AM - 8:30 PM",
            "Sunday": "8:00 AM - 8:30 PM"
        },
        phoneNumber: "(407) 939-3463",
        reservationInfo: {
            acceptsReservations: true,
            requiresReservations: true,
            advanceReservationDays: 60,
            reservationDifficulty: ReservationDifficulty.EXTREMELY_DIFFICULT,
            reservationUrl: "https://disneyworld.disney.go.com/dining/magic-kingdom/cinderella-royal-table/",
            walkUpsAccepted: false,
            reservationTips: [
                "Extremely popular - book exactly 60 days in advance at 6 AM EST",
                "Credit card required to hold reservation",
                "Full payment required 24 hours in advance",
                "Includes photo package with Disney Princesses"
            ],
            peakTimes: ["All day - consistently booked"],
            bestTimesToVisit: ["First seating at 8:00 AM", "Last seating at 9:30 PM"]
        },
        diningPlanInfo: {
            acceptsDiningPlan: true,
            participating: true,
            creditsRequired: 2,
            isSignatureDining: true,
            tableServiceCredits: 2,
            eligiblePlans: [DiningPlan.DINING_PLAN, DiningPlan.DELUXE_DINING],
            notes: "Requires 2 table service credits. Gratuity included."
        },
        characterDining: {
            hasCharacterDining: true,
            characters: ["Cinderella", "Ariel", "Aurora", "Snow White", "Jasmine"],
            characterMeals: ["breakfast", "lunch", "dinner"],
            characterExperience: "Meet Disney Princesses throughout your meal with individual photo opportunities",
            rotationInfo: "Princesses rotate between tables throughout the meal",
            photoPackageIncluded: true
        },
        specialFeatures: [SpecialFeature.THEMED_DINING, SpecialFeature.PARK_VIEW, SpecialFeature.ALLERGY_FRIENDLY, SpecialFeature.KIDS_MENU],
        mobileOrdering: false,
        dietaryAccommodations: ["vegetarian", "vegan", "gluten-free", "allergies"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        tags: ["Cinderella Castle", "Disney Princesses", "Signature dining", "Character dining", "Royal experience"],
        popularItems: ["Beef Tenderloin", "Wishes Dessert", "Princess Package"],
        ambiance: ["Royal", "Elegant", "Magical", "Sophisticated"],
        averageRating: 4.1,
        reviewCount: 3294,
        disneyRating: 4.4,
        isPopular: true,
        searchKeywords: ["Cinderella Castle", "Disney Princesses", "character dining", "signature dining", "royal table"],
        alternateNames: ["CRT", "Royal Table"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        imageUrl: "/images/restaurants/cinderellas-royal-table.jpg"
    },
    {
        id: "mk_003",
        name: "Crystal Palace",
        description: "Victorian greenhouse setting featuring Winnie the Pooh character dining with an extensive American buffet.",
        shortDescription: "Character buffet with Winnie the Pooh and friends in Victorian setting",
        location: {
            latitude: 28.4185,
            longitude: -81.5835,
            areaName: "Main Street, U.S.A.",
            parkId: DisneyLocation.MAGIC_KINGDOM,
            landName: "Main Street U.S.A."
        },
        cuisineTypes: [CuisineType.AMERICAN_BUFFET],
        serviceType: ServiceType.TABLE_SERVICE,
        priceRange: PriceRange.MODERATE,
        diningExperience: DiningExperience.CHARACTER,
        mealPeriods: [MealPeriod.BREAKFAST, MealPeriod.LUNCH, MealPeriod.DINNER],
        pricing: {
            breakfast: { adult: 48, child: 30 },
            lunch: { adult: 59, child: 38 },
            dinner: { adult: 59, child: 38 }
        },
        operatingHours: {
            "Monday": "8:00 AM - 9:00 PM",
            "Tuesday": "8:00 AM - 9:00 PM",
            "Wednesday": "8:00 AM - 9:00 PM",
            "Thursday": "8:00 AM - 9:00 PM",
            "Friday": "8:00 AM - 9:00 PM",
            "Saturday": "8:00 AM - 9:00 PM",
            "Sunday": "8:00 AM - 9:00 PM"
        },
        phoneNumber: "(407) 939-3463",
        reservationInfo: {
            acceptsReservations: true,
            requiresReservations: true,
            advanceReservationDays: 60,
            reservationDifficulty: ReservationDifficulty.MODERATE,
            reservationUrl: "https://disneyworld.disney.go.com/dining/magic-kingdom/crystal-palace/",
            walkUpsAccepted: false,
            reservationTips: [
                "Great option for families with children",
                "Characters visit every table",
                "Buffet format allows for variety and dietary needs",
                "Less expensive than other character dining options"
            ],
            peakTimes: ["12:00 PM - 2:00 PM", "6:00 PM - 8:00 PM"],
            bestTimesToVisit: ["8:00 AM breakfast", "Late lunch at 3:00 PM"]
        },
        diningPlanInfo: {
            acceptsDiningPlan: true,
            participating: true,
            creditsRequired: 1,
            isSignatureDining: false,
            tableServiceCredits: 1,
            eligiblePlans: [DiningPlan.DINING_PLAN, DiningPlan.DELUXE_DINING],
            notes: "Buffet style dining with characters"
        },
        characterDining: {
            hasCharacterDining: true,
            characters: ["Winnie the Pooh", "Piglet", "Eeyore", "Tigger"],
            characterMeals: ["breakfast", "lunch", "dinner"],
            characterExperience: "Characters visit every table for photos and autographs",
            rotationInfo: "All characters typically visit during your meal",
            photoPackageIncluded: false
        },
        specialFeatures: [SpecialFeature.THEMED_DINING, SpecialFeature.KIDS_MENU, SpecialFeature.ALLERGY_FRIENDLY, SpecialFeature.HEALTHY_OPTIONS],
        mobileOrdering: false,
        dietaryAccommodations: ["vegetarian", "vegan", "gluten-free", "allergies"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY,
            AccessibilityFeature.KIDS_MENU
        ],
        tags: ["Winnie the Pooh", "Character dining", "Buffet", "Family-friendly", "Victorian"],
        popularItems: ["Character Buffet", "Dessert Selection", "Kids' Favorites"],
        ambiance: ["Family-friendly", "Bright", "Cheerful", "Victorian"],
        averageRating: 4.0,
        reviewCount: 1876,
        disneyRating: 4.2,
        isPopular: true,
        searchKeywords: ["Winnie the Pooh", "character dining", "buffet", "family dining", "Hundred Acre Wood"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        imageUrl: "/images/restaurants/crystal-palace.jpg"
    },
    {
        id: "mk_004",
        name: "Cosmic Ray's Starlight Cafe",
        description: "The largest quick service restaurant in Magic Kingdom featuring burgers, chicken, and salads with entertaining Sonny Eclipse animatronic shows.",
        shortDescription: "Largest quick service in Magic Kingdom with Sonny Eclipse entertainment",
        location: {
            latitude: 28.4195,
            longitude: -81.5820,
            areaName: "Tomorrowland",
            parkId: DisneyLocation.MAGIC_KINGDOM,
            landName: "Tomorrowland"
        },
        cuisineTypes: [CuisineType.AMERICAN],
        serviceType: ServiceType.QUICK_SERVICE,
        priceRange: PriceRange.BUDGET,
        diningExperience: DiningExperience.CASUAL,
        mealPeriods: [MealPeriod.LUNCH, MealPeriod.DINNER],
        operatingHours: {
            "Monday": "10:30 AM - park close",
            "Tuesday": "10:30 AM - park close",
            "Wednesday": "10:30 AM - park close",
            "Thursday": "10:30 AM - park close",
            "Friday": "10:30 AM - park close",
            "Saturday": "10:30 AM - park close",
            "Sunday": "10:30 AM - park close"
        },
        reservationInfo: {
            acceptsReservations: false,
            requiresReservations: false,
            advanceReservationDays: 0,
            reservationDifficulty: ReservationDifficulty.EASY,
            walkUpsAccepted: true
        },
        diningPlanInfo: {
            acceptsDiningPlan: true,
            participating: true,
            creditsRequired: 1,
            isSignatureDining: false,
            quickServiceCredits: 1,
            eligiblePlans: [DiningPlan.QUICK_SERVICE, DiningPlan.DINING_PLAN, DiningPlan.DELUXE_DINING]
        },
        specialFeatures: [SpecialFeature.LIVE_ENTERTAINMENT, SpecialFeature.MOBILE_ORDERING],
        mobileOrdering: true,
        dietaryAccommodations: ["vegetarian", "impossible burger", "allergies"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        tags: ["Quick service", "Entertainment", "Sonny Eclipse", "Family-friendly", "Tomorrowland"],
        popularItems: ["Burgers", "Chicken", "Salads"],
        ambiance: ["Casual", "Entertainment", "Family-friendly"],
        averageRating: 3.8,
        reviewCount: 1245,
        isPopular: true,
        searchKeywords: ["quick service", "burgers", "Sonny Eclipse", "Tomorrowland", "entertainment"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        imageUrl: "/images/restaurants/cosmic-rays.jpg"
    },
    {
        id: "mk_005",
        name: "Aloha Isle",
        description: "The home of the famous Dole Whip and other tropical frozen treats in Adventureland.",
        shortDescription: "Home of the famous Dole Whip in Adventureland",
        location: {
            latitude: 28.4188,
            longitude: -81.5845,
            areaName: "Adventureland",
            parkId: DisneyLocation.MAGIC_KINGDOM,
            landName: "Adventureland"
        },
        cuisineTypes: [CuisineType.FROZEN_TREATS],
        serviceType: ServiceType.QUICK_SERVICE,
        priceRange: PriceRange.BUDGET,
        diningExperience: DiningExperience.QUICK_BITE,
        mealPeriods: [MealPeriod.SNACK],
        operatingHours: {
            "Monday": "park opening to close",
            "Tuesday": "park opening to close",
            "Wednesday": "park opening to close",
            "Thursday": "park opening to close",
            "Friday": "park opening to close",
            "Saturday": "park opening to close",
            "Sunday": "park opening to close"
        },
        reservationInfo: {
            acceptsReservations: false,
            requiresReservations: false,
            advanceReservationDays: 0,
            reservationDifficulty: ReservationDifficulty.EASY,
            walkUpsAccepted: true
        },
        diningPlanInfo: {
            acceptsDiningPlan: true,
            participating: true,
            creditsRequired: 1,
            isSignatureDining: false,
            snackCredits: 1,
            eligiblePlans: [DiningPlan.QUICK_SERVICE, DiningPlan.DINING_PLAN, DiningPlan.DELUXE_DINING]
        },
        specialFeatures: [SpecialFeature.THEMED_DINING],
        mobileOrdering: false,
        menuHighlights: ["Classic Pineapple Dole Whip", "Tropical Serenade"],
        dietaryAccommodations: ["vegan", "dairy-free"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        tags: ["Dole Whip", "Tropical", "Frozen treats", "Adventureland", "Famous"],
        popularItems: ["Dole Whip", "Tropical Serenade"],
        ambiance: ["Tropical", "Casual", "Quick"],
        averageRating: 4.5,
        reviewCount: 2156,
        isPopular: true,
        searchKeywords: ["Dole Whip", "tropical", "frozen", "Adventureland", "pineapple"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        imageUrl: "/images/restaurants/aloha-isle.jpg"
    }
]

// Export comprehensive restaurant data
export const comprehensiveRestaurants: DisneyRestaurant[] = [
    ...magicKingdomRestaurants
    // Additional restaurants from other parks will be added in separate arrays
]

// Get all restaurants
export const getAllComprehensiveRestaurants = (): DisneyRestaurant[] => {
    return comprehensiveRestaurants
}

// Get restaurants by location
export const getRestaurantsByLocation = (location: DisneyLocation): DisneyRestaurant[] => {
    return comprehensiveRestaurants.filter(restaurant => restaurant.location.parkId === location)
}

// Get character dining restaurants
export const getCharacterDiningRestaurants = (): DisneyRestaurant[] => {
    return comprehensiveRestaurants.filter(restaurant => restaurant.characterDining?.hasCharacterDining)
}

// Get signature dining restaurants
export const getSignatureDiningRestaurants = (): DisneyRestaurant[] => {
    return comprehensiveRestaurants.filter(restaurant =>
        restaurant.serviceType === ServiceType.SIGNATURE_DINING ||
        restaurant.serviceType === ServiceType.FINE_DINING ||
        restaurant.diningPlanInfo.isSignatureDining
    )
}

// Get popular restaurants
export const getPopularRestaurants = (): DisneyRestaurant[] => {
    return comprehensiveRestaurants.filter(restaurant => restaurant.isPopular)
}

// Get restaurants by price range
export const getRestaurantsByPriceRange = (priceRange: PriceRange): DisneyRestaurant[] => {
    return comprehensiveRestaurants.filter(restaurant => restaurant.priceRange === priceRange)
}

// Get restaurants with mobile ordering
export const getMobileOrderingRestaurants = (): DisneyRestaurant[] => {
    return comprehensiveRestaurants.filter(restaurant => restaurant.mobileOrdering)
}