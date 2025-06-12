/**
 * Disney Restaurant Data Importer
 *
 * Utility for importing and converting Disney restaurant data from JSON format
 * to TypeScript interfaces compatible with Firebase Firestore
 */

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
    MealPeriod,
    DisneyDiningDatabase,
    LocationData,
    DiningPlanInfo,
    ReservationInfo,
    CharacterDiningInfo,
    MealPricing,
    PricingInfo
} from "@/types/dining"

/**
 * Raw JSON structure from the provided restaurant database
 */
interface RawRestaurantData {
    id?: string
    name: string
    description?: string
    short_description?: string
    location?: {
        area?: string
        park?: string
        resort?: string
        land?: string
        coordinates?: {
            latitude?: number
            longitude?: number
        }
    }
    cuisine_types?: string[]
    service_type?: string
    price_range?: string
    dining_experience?: string
    meal_periods?: string[]
    pricing?: {
        breakfast?: { adult?: number; child?: number }
        lunch?: { adult?: number; child?: number }
        dinner?: { adult?: number; child?: number }
        entrees?: string
    }
    operating_hours?: Record<string, string>
    phone_number?: string
    reservation_info?: {
        accepts_reservations?: boolean
        requires_reservations?: boolean
        advance_days?: number
        difficulty?: string
        url?: string
        walk_ups?: boolean
        tips?: string[]
        peak_times?: string[]
        best_times?: string[]
    }
    dining_plan?: {
        accepts?: boolean
        participating?: boolean
        credits_required?: number
        signature?: boolean
        table_service_credits?: number
        quick_service_credits?: number
        snack_credits?: number
        eligible_plans?: string[]
        notes?: string
    }
    character_dining?: {
        has_characters?: boolean
        characters?: string[]
        meals?: string[]
        experience?: string
        rotation?: string
        photo_package?: boolean
    }
    special_features?: string[]
    mobile_ordering?: boolean
    time_limit?: string
    challenges?: string[]
    dietary_accommodations?: string[]
    menu_highlights?: string[]
    image_url?: string
    thumbnail_url?: string
    gallery_images?: string[]
    tags?: string[]
    popular_items?: string[]
    chef_specialties?: string[]
    ambiance?: string[]
    accessibility?: string[]
    average_rating?: number
    review_count?: number
    disney_rating?: number
    is_popular?: boolean
    is_new?: boolean
    is_seasonal?: boolean
    requires_id?: boolean
    minimum_age?: number
    search_keywords?: string[]
    alternate_names?: string[]
}

export class RestaurantImporter {
    private static instance: RestaurantImporter
    private locationMapping: Record<string, DisneyLocation> = {
        "magic_kingdom": DisneyLocation.MAGIC_KINGDOM,
        "magic-kingdom": DisneyLocation.MAGIC_KINGDOM,
        "epcot": DisneyLocation.EPCOT,
        "hollywood_studios": DisneyLocation.HOLLYWOOD_STUDIOS,
        "hollywood-studios": DisneyLocation.HOLLYWOOD_STUDIOS,
        "animal_kingdom": DisneyLocation.ANIMAL_KINGDOM,
        "animal-kingdom": DisneyLocation.ANIMAL_KINGDOM,
        "disney_springs": DisneyLocation.DISNEY_SPRINGS,
        "disney-springs": DisneyLocation.DISNEY_SPRINGS,
        "boardwalk": DisneyLocation.BOARDWALK,
        "grand-floridian": DisneyLocation.GRAND_FLORIDIAN,
        "polynesian": DisneyLocation.POLYNESIAN,
        "contemporary": DisneyLocation.CONTEMPORARY,
        "wilderness-lodge": DisneyLocation.WILDERNESS_LODGE,
        "yacht-club": DisneyLocation.YACHT_CLUB,
        "beach-club": DisneyLocation.BEACH_CLUB,
        "swan-dolphin": DisneyLocation.SWAN_DOLPHIN,
        "caribbean-beach": DisneyLocation.CARIBBEAN_BEACH,
        "riviera": DisneyLocation.RIVIERA,
        "saratoga-springs": DisneyLocation.SARATOGA_SPRINGS,
        "old-key-west": DisneyLocation.OLD_KEY_WEST,
        "port-orleans": DisneyLocation.PORT_ORLEANS,
        "coronado-springs": DisneyLocation.CORONADO_SPRINGS,
        "animal-kingdom-lodge": DisneyLocation.ANIMAL_KINGDOM_LODGE,
        "all-star": DisneyLocation.ALL_STAR,
        "pop-century": DisneyLocation.POP_CENTURY,
        "art-of-animation": DisneyLocation.ART_OF_ANIMATION,
        "espn-wide-world": DisneyLocation.ESPN_WIDE_WORLD
    }

    public static getInstance(): RestaurantImporter {
        if (!RestaurantImporter.instance) {
            RestaurantImporter.instance = new RestaurantImporter()
        }
        return RestaurantImporter.instance
    }

    /**
     * Convert raw JSON restaurant data to DisneyRestaurant interface
     */
    convertRawToRestaurant(rawData: RawRestaurantData, index?: number): DisneyRestaurant {
        const id = rawData.id || this.generateId(rawData.name, index)
        const timestamp = new Date().toISOString()

        return {
            id,
            name: rawData.name,
            description: rawData.description || `Experience ${rawData.name} at Disney World`,
            shortDescription: rawData.short_description || rawData.description?.substring(0, 100) + "...",

            location: {
                latitude: rawData.location?.coordinates?.latitude || 28.4200,
                longitude: rawData.location?.coordinates?.longitude || -81.5800,
                areaName: rawData.location?.area || rawData.location?.land || "Disney World",
                parkId: this.mapLocation(rawData.location?.park || rawData.location?.resort),
                landName: rawData.location?.land
            },

            cuisineTypes: this.mapCuisineTypes(rawData.cuisine_types || []),
            serviceType: this.mapServiceType(rawData.service_type || "Quick Service"),
            priceRange: this.mapPriceRange(rawData.price_range || "$"),
            diningExperience: this.mapDiningExperience(rawData.dining_experience || "Casual"),

            mealPeriods: this.mapMealPeriods(rawData.meal_periods || []),
            pricing: this.mapPricing(rawData.pricing),

            operatingHours: rawData.operating_hours || this.getDefaultHours(),
            phoneNumber: rawData.phone_number,

            reservationInfo: this.mapReservationInfo(rawData.reservation_info),
            diningPlanInfo: this.mapDiningPlanInfo(rawData.dining_plan),
            characterDining: this.mapCharacterDining(rawData.character_dining),

            specialFeatures: this.mapSpecialFeatures(rawData.special_features || []),
            mobileOrdering: rawData.mobile_ordering || false,
            timeLimit: rawData.time_limit,

            menuHighlights: rawData.menu_highlights,
            imageUrl: rawData.image_url,
            thumbnailUrl: rawData.thumbnail_url,
            galleryImages: rawData.gallery_images || [],

            challenges: rawData.challenges || [],
            dietaryAccommodations: rawData.dietary_accommodations || [],

            tags: rawData.tags || [rawData.name],
            popularItems: rawData.popular_items || [],
            chefSpecialities: rawData.chef_specialties || [],
            ambiance: rawData.ambiance || ["Disney Magic"],
            accessibility: this.mapAccessibility(rawData.accessibility || []),

            averageRating: rawData.average_rating,
            reviewCount: rawData.review_count,
            disneyRating: rawData.disney_rating,

            isPopular: rawData.is_popular || false,
            isNew: rawData.is_new,
            isSeasonal: rawData.is_seasonal,
            requiresID: rawData.requires_id,
            minimumAge: rawData.minimum_age,

            searchKeywords: rawData.search_keywords || [rawData.name.toLowerCase()],
            alternateNames: rawData.alternate_names,

            createdAt: timestamp,
            updatedAt: timestamp
        }
    }

    /**
     * Import restaurants from Disney dining database structure
     */
    importFromDiningDatabase(database: DisneyDiningDatabase): DisneyRestaurant[] {
        const allRestaurants: DisneyRestaurant[] = []

        Object.entries(database.locations).forEach(([locationKey, locationData]) => {
            locationData.restaurants.forEach((restaurant, index) => {
                try {
                    const convertedRestaurant = this.convertRawToRestaurant(restaurant as RawRestaurantData, index)
                    allRestaurants.push(convertedRestaurant)
                } catch (error) {
                    console.error(`Error converting restaurant ${restaurant.name}:`, error)
                }
            })
        })

        return allRestaurants
    }

    /**
     * Import restaurants from simple array format
     */
    importFromArray(restaurants: RawRestaurantData[]): DisneyRestaurant[] {
        return restaurants.map((restaurant, index) => {
            try {
                return this.convertRawToRestaurant(restaurant, index)
            } catch (error) {
                console.error(`Error converting restaurant ${restaurant.name}:`, error)
                throw error
            }
        })
    }

    private generateId(name: string, index?: number): string {
        const cleanName = name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50)

        return index !== undefined ? `${cleanName}-${index}` : cleanName
    }

    private mapLocation(location?: string): DisneyLocation {
        if (!location) return DisneyLocation.MAGIC_KINGDOM

        const normalizedLocation = location.toLowerCase().replace(/\s+/g, '-')
        return this.locationMapping[normalizedLocation] || DisneyLocation.MAGIC_KINGDOM
    }

    private mapCuisineTypes(cuisines: string[]): CuisineType[] {
        const mapping: Record<string, CuisineType> = {
            "american": CuisineType.AMERICAN,
            "italian": CuisineType.ITALIAN,
            "mexican": CuisineType.MEXICAN,
            "asian": CuisineType.ASIAN,
            "chinese": CuisineType.CHINESE,
            "japanese": CuisineType.JAPANESE,
            "thai": CuisineType.THAI,
            "indian": CuisineType.INDIAN,
            "seafood": CuisineType.SEAFOOD,
            "steakhouse": CuisineType.STEAKHOUSE,
            "french": CuisineType.FRENCH,
            "french-inspired": CuisineType.FRENCH_INSPIRED,
            "mediterranean": CuisineType.MEDITERRANEAN,
            "middle-eastern": CuisineType.MIDDLE_EASTERN,
            "african": CuisineType.AFRICAN,
            "african-inspired": CuisineType.AFRICAN_INSPIRED,
            "latin-american": CuisineType.LATIN_AMERICAN,
            "caribbean": CuisineType.CARIBBEAN,
            "southern": CuisineType.SOUTHERN,
            "pizza": CuisineType.PIZZA,
            "bakery": CuisineType.BAKERY,
            "desserts": CuisineType.DESSERTS,
            "ice-cream": CuisineType.ICE_CREAM,
            "coffee": CuisineType.COFFEE,
            "bar": CuisineType.BAR,
            "buffet": CuisineType.BUFFET,
            "vegetarian": CuisineType.VEGETARIAN,
            "healthy": CuisineType.HEALTHY,
            "comfort-food": CuisineType.COMFORT_FOOD,
            "international": CuisineType.INTERNATIONAL,
            "fusion": CuisineType.FUSION,
            "modern-american": CuisineType.MODERN_AMERICAN,
            "polynesian": CuisineType.POLYNESIAN,
            "spanish": CuisineType.SPANISH,
            "barbecue": CuisineType.BARBECUE
        }

        return cuisines.map(cuisine => {
            const normalized = cuisine.toLowerCase().replace(/\s+/g, '-')
            return mapping[normalized] || CuisineType.AMERICAN
        })
    }

    private mapServiceType(serviceType: string): ServiceType {
        const mapping: Record<string, ServiceType> = {
            "quick-service": ServiceType.QUICK_SERVICE,
            "table-service": ServiceType.TABLE_SERVICE,
            "signature-dining": ServiceType.SIGNATURE_DINING,
            "fine-dining": ServiceType.FINE_DINING,
            "lounge": ServiceType.LOUNGE,
            "bar": ServiceType.BAR,
            "cafe": ServiceType.CAFE,
            "kiosk": ServiceType.KIOSK
        }

        const normalized = serviceType.toLowerCase().replace(/\s+/g, '-')
        return mapping[normalized] || ServiceType.QUICK_SERVICE
    }

    private mapPriceRange(priceRange: string): PriceRange {
        switch (priceRange) {
            case "$": return PriceRange.BUDGET
            case "$$": return PriceRange.MODERATE
            case "$$$": return PriceRange.EXPENSIVE
            case "$$$$": return PriceRange.LUXURY
            default: return PriceRange.MODERATE
        }
    }

    private mapDiningExperience(experience: string): DiningExperience {
        const mapping: Record<string, DiningExperience> = {
            "casual": DiningExperience.CASUAL,
            "family": DiningExperience.FAMILY,
            "romantic": DiningExperience.ROMANTIC,
            "fine-dining": DiningExperience.FINE_DINING,
            "character": DiningExperience.CHARACTER,
            "themed": DiningExperience.THEMED,
            "entertainment": DiningExperience.ENTERTAINMENT,
            "outdoor": DiningExperience.OUTDOOR,
            "waterfront": DiningExperience.WATERFRONT,
            "quick-bite": DiningExperience.QUICK_BITE
        }

        const normalized = experience.toLowerCase().replace(/\s+/g, '-')
        return mapping[normalized] || DiningExperience.CASUAL
    }

    private mapMealPeriods(periods: string[]): MealPeriod[] {
        const mapping: Record<string, MealPeriod> = {
            "breakfast": MealPeriod.BREAKFAST,
            "lunch": MealPeriod.LUNCH,
            "dinner": MealPeriod.DINNER,
            "snack": MealPeriod.SNACK,
            "beverages": MealPeriod.BEVERAGES
        }

        return periods.map(period => {
            const normalized = period.toLowerCase()
            return mapping[normalized] || MealPeriod.LUNCH
        })
    }

    private mapPricing(pricing?: any): PricingInfo | undefined {
        if (!pricing) return undefined

        const result: PricingInfo = {}

        if (pricing.breakfast) {
            result.breakfast = {
                adult: pricing.breakfast.adult || 0,
                child: pricing.breakfast.child || 0
            }
        }

        if (pricing.lunch) {
            result.lunch = {
                adult: pricing.lunch.adult || 0,
                child: pricing.lunch.child || 0
            }
        }

        if (pricing.dinner) {
            result.dinner = {
                adult: pricing.dinner.adult || 0,
                child: pricing.dinner.child || 0
            }
        }

        if (pricing.entrees) {
            result.entrees = pricing.entrees
        }

        return Object.keys(result).length > 0 ? result : undefined
    }

    private mapReservationInfo(reservationInfo?: any): ReservationInfo {
        const defaultInfo: ReservationInfo = {
            acceptsReservations: false,
            requiresReservations: false,
            advanceReservationDays: 0,
            reservationDifficulty: ReservationDifficulty.EASY,
            walkUpsAccepted: true
        }

        if (!reservationInfo) return defaultInfo

        const difficultyMapping: Record<string, ReservationDifficulty> = {
            "easy": ReservationDifficulty.EASY,
            "moderate": ReservationDifficulty.MODERATE,
            "difficult": ReservationDifficulty.DIFFICULT,
            "very-difficult": ReservationDifficulty.VERY_DIFFICULT,
            "extremely-difficult": ReservationDifficulty.EXTREMELY_DIFFICULT
        }

        return {
            acceptsReservations: reservationInfo.accepts_reservations || false,
            requiresReservations: reservationInfo.requires_reservations || false,
            advanceReservationDays: reservationInfo.advance_days || 0,
            reservationDifficulty: difficultyMapping[reservationInfo.difficulty] || ReservationDifficulty.EASY,
            reservationUrl: reservationInfo.url,
            walkUpsAccepted: reservationInfo.walk_ups !== false,
            reservationTips: reservationInfo.tips,
            peakTimes: reservationInfo.peak_times,
            bestTimesToVisit: reservationInfo.best_times
        }
    }

    private mapDiningPlanInfo(diningPlan?: any): DiningPlanInfo {
        const defaultInfo: DiningPlanInfo = {
            acceptsDiningPlan: false,
            participating: false,
            creditsRequired: 0,
            isSignatureDining: false,
            eligiblePlans: []
        }

        if (!diningPlan) return defaultInfo

        const planMapping: Record<string, DiningPlan> = {
            "quick-service": DiningPlan.QUICK_SERVICE,
            "dining-plan": DiningPlan.DINING_PLAN,
            "deluxe-dining": DiningPlan.DELUXE_DINING,
            "plus-dining": DiningPlan.PLUS_DINING
        }

        const eligiblePlans = (diningPlan.eligible_plans || []).map((plan: string) => {
            const normalized = plan.toLowerCase().replace(/\s+/g, '-')
            return planMapping[normalized]
        }).filter(Boolean)

        return {
            acceptsDiningPlan: diningPlan.accepts || false,
            participating: diningPlan.participating || false,
            creditsRequired: diningPlan.credits_required || 0,
            isSignatureDining: diningPlan.signature || false,
            tableServiceCredits: diningPlan.table_service_credits,
            quickServiceCredits: diningPlan.quick_service_credits,
            snackCredits: diningPlan.snack_credits,
            eligiblePlans,
            notes: diningPlan.notes
        }
    }

    private mapCharacterDining(characterDining?: any): CharacterDiningInfo | undefined {
        if (!characterDining?.has_characters) return undefined

        return {
            hasCharacterDining: true,
            characters: characterDining.characters,
            characterMeals: characterDining.meals,
            characterExperience: characterDining.experience,
            rotationInfo: characterDining.rotation,
            photoPackageIncluded: characterDining.photo_package
        }
    }

    private mapSpecialFeatures(features: string[]): SpecialFeature[] {
        const mapping: Record<string, SpecialFeature> = {
            "mobile-ordering": SpecialFeature.MOBILE_ORDERING,
            "outdoor-seating": SpecialFeature.OUTDOOR_SEATING,
            "full-bar": SpecialFeature.FULL_BAR,
            "craft-cocktails": SpecialFeature.CRAFT_COCKTAILS,
            "live-entertainment": SpecialFeature.LIVE_ENTERTAINMENT,
            "fireworks-view": SpecialFeature.FIREWORKS_VIEW,
            "water-view": SpecialFeature.WATER_VIEW,
            "park-view": SpecialFeature.PARK_VIEW,
            "themed-dining": SpecialFeature.THEMED_DINING,
            "character-dining": SpecialFeature.INTERACTIVE_EXPERIENCE,
            "allergy-friendly": SpecialFeature.ALLERGY_FRIENDLY,
            "kids-menu": SpecialFeature.KIDS_MENU,
            "healthy-options": SpecialFeature.HEALTHY_OPTIONS
        }

        return features.map(feature => {
            const normalized = feature.toLowerCase().replace(/\s+/g, '-')
            return mapping[normalized]
        }).filter(Boolean) as SpecialFeature[]
    }

    private mapAccessibility(accessibility: string[]): AccessibilityFeature[] {
        const mapping: Record<string, AccessibilityFeature> = {
            "wheelchair-accessible": AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            "assisted-listening": AccessibilityFeature.ASSISTED_LISTENING,
            "braille-menus": AccessibilityFeature.BRAILLE_MENUS,
            "large-print-menus": AccessibilityFeature.LARGE_PRINT_MENUS,
            "sign-language": AccessibilityFeature.SIGN_LANGUAGE,
            "dietary-accommodations": AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            "service-animal-friendly": AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY,
            "accessible-parking": AccessibilityFeature.ACCESSIBLE_PARKING,
            "kids-menu": AccessibilityFeature.KIDS_MENU
        }

        return accessibility.map(feature => {
            const normalized = feature.toLowerCase().replace(/\s+/g, '-')
            return mapping[normalized]
        }).filter(Boolean) as AccessibilityFeature[]
    }

    private getDefaultHours(): Record<string, string> {
        return {
            "Monday": "9:00 AM - 9:00 PM",
            "Tuesday": "9:00 AM - 9:00 PM",
            "Wednesday": "9:00 AM - 9:00 PM",
            "Thursday": "9:00 AM - 9:00 PM",
            "Friday": "9:00 AM - 9:00 PM",
            "Saturday": "9:00 AM - 9:00 PM",
            "Sunday": "9:00 AM - 9:00 PM"
        }
    }

    /**
     * Validate a converted restaurant
     */
    validateRestaurant(restaurant: DisneyRestaurant): { isValid: boolean; errors: string[] } {
        const errors: string[] = []

        if (!restaurant.id) errors.push("Missing required field: id")
        if (!restaurant.name) errors.push("Missing required field: name")
        if (!restaurant.description) errors.push("Missing required field: description")
        if (!restaurant.location?.areaName) errors.push("Missing required field: location.areaName")
        if (!restaurant.cuisineTypes?.length) errors.push("Missing required field: cuisineTypes")

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    /**
     * Get import statistics
     */
    getImportStats(restaurants: DisneyRestaurant[]): {
        total: number
        byLocation: Record<string, number>
        byServiceType: Record<string, number>
        byPriceRange: Record<string, number>
        characterDining: number
        signatureDining: number
        validationErrors: number
    } {
        const stats = {
            total: restaurants.length,
            byLocation: {} as Record<string, number>,
            byServiceType: {} as Record<string, number>,
            byPriceRange: {} as Record<string, number>,
            characterDining: 0,
            signatureDining: 0,
            validationErrors: 0
        }

        restaurants.forEach(restaurant => {
            const validation = this.validateRestaurant(restaurant)
            if (!validation.isValid) {
                stats.validationErrors++
            }

            // By location
            const location = restaurant.location.parkId || 'unknown'
            stats.byLocation[location] = (stats.byLocation[location] || 0) + 1

            // By service type
            stats.byServiceType[restaurant.serviceType] = (stats.byServiceType[restaurant.serviceType] || 0) + 1

            // By price range
            stats.byPriceRange[restaurant.priceRange] = (stats.byPriceRange[restaurant.priceRange] || 0) + 1

            // Character dining
            if (restaurant.characterDining?.hasCharacterDining) {
                stats.characterDining++
            }

            // Signature dining
            if (restaurant.serviceType === ServiceType.SIGNATURE_DINING ||
                restaurant.serviceType === ServiceType.FINE_DINING) {
                stats.signatureDining++
            }
        })

        return stats
    }
}

// Export singleton instance
export const restaurantImporter = RestaurantImporter.getInstance()