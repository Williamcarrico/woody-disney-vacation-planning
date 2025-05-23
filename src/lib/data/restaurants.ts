import {
    DisneyRestaurant,
    CuisineType,
    ServiceType,
    DiningExperience,
    PriceRange,
    SpecialFeature,
    AccessibilityFeature,
    DiningPlan,
    DisneyLocation
} from "@/types/dining"

// Magic Kingdom Restaurants
export const magicKingdomRestaurants: DisneyRestaurant[] = [
    {
        id: "be-our-guest-restaurant",
        name: "Be Our Guest Restaurant",
        description: "Step into the enchanted world of Beauty and the Beast at this award-winning restaurant located in Beast's Castle. Experience fine dining in the opulent Ballroom, the mysterious West Wing, or the elegant Rose Gallery while enjoying French-inspired cuisine.",
        shortDescription: "French-inspired fine dining in Beast's Castle with themed dining rooms",
        location: {
            latitude: 28.4211,
            longitude: -81.5812,
            areaName: "Fantasyland",
            parkId: "magic-kingdom",
            landName: "Fantasyland"
        },
        cuisineTypes: [CuisineType.FRENCH, CuisineType.AMERICAN],
        serviceType: ServiceType.TABLE_SERVICE,
        priceRange: PriceRange.EXPENSIVE,
        diningExperience: DiningExperience.THEMED,
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
            tableServiceCredits: 1,
            eligiblePlans: [DiningPlan.DINING_PLAN, DiningPlan.DELUXE_DINING],
            notes: "Breakfast and lunch require 1 quick service credit; dinner requires 1 table service credit"
        },
        specialFeatures: [
            SpecialFeature.THEMED_DINING,
            SpecialFeature.MOBILE_ORDERING,
            SpecialFeature.ALLERGY_FRIENDLY,
            SpecialFeature.KIDS_MENU
        ],
        menu: [
            {
                name: "Pan-seared Salmon",
                description: "Pan-seared salmon with quinoa, arugula, and lemon-herb vinaigrette",
                price: 34,
                category: "entree",
                isSignature: true
            },
            {
                name: "Filet of Beef",
                description: "Grilled beef tenderloin with roasted vegetables and red wine sauce",
                price: 46,
                category: "entree",
                isSignature: true
            },
            {
                name: "The Grey Stuff",
                description: "The famous 'grey stuff' dessert - it's delicious, don't believe us? Ask the dishes!",
                price: 7,
                category: "dessert",
                isSignature: true
            }
        ],
        imageUrl: "/images/restaurants/be-our-guest.jpg",
        thumbnailUrl: "/images/restaurants/thumbnails/be-our-guest.jpg",
        galleryImages: [
            "/images/restaurants/be-our-guest/ballroom.jpg",
            "/images/restaurants/be-our-guest/west-wing.jpg",
            "/images/restaurants/be-our-guest/rose-gallery.jpg"
        ],
        tags: ["Beauty and the Beast", "Themed", "French cuisine", "Castle dining", "Award-winning"],
        popularItems: ["The Grey Stuff", "Filet of Beef", "Master's Cupcake"],
        chefSpecialties: ["French-inspired cuisine", "Seasonal menu items"],
        ambiance: ["Elegant", "Romantic", "Magical", "Intimate"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        averageRating: 4.3,
        reviewCount: 2847,
        disneyRating: 4.5,
        isPopular: true,
        searchKeywords: ["Beauty and the Beast", "Beast's Castle", "French dining", "themed restaurant", "grey stuff"],
        alternateNames: ["Beast's Castle", "BOG"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    },
    {
        id: "cinderellas-royal-table",
        name: "Cinderella's Royal Table",
        description: "Dine like royalty inside Cinderella Castle with Disney Princesses. This signature dining experience offers upscale American cuisine in an elegant medieval setting with stunning views of the Magic Kingdom.",
        shortDescription: "Royal dining with Disney Princesses inside Cinderella Castle",
        location: {
            latitude: 28.4204,
            longitude: -81.5816,
            areaName: "Fantasyland",
            parkId: "magic-kingdom",
            landName: "Fantasyland"
        },
        cuisineTypes: [CuisineType.AMERICAN],
        serviceType: ServiceType.SIGNATURE_DINING,
        priceRange: PriceRange.LUXURY,
        diningExperience: DiningExperience.CHARACTER,
        operatingHours: {
            "Monday": "8:00 AM - 9:30 PM",
            "Tuesday": "8:00 AM - 9:30 PM",
            "Wednesday": "8:00 AM - 9:30 PM",
            "Thursday": "8:00 AM - 9:30 PM",
            "Friday": "8:00 AM - 9:30 PM",
            "Saturday": "8:00 AM - 9:30 PM",
            "Sunday": "8:00 AM - 9:30 PM"
        },
        phoneNumber: "(407) 939-3463",
        reservationInfo: {
            acceptsReservations: true,
            requiresReservations: true,
            advanceReservationDays: 60,
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
        specialFeatures: [
            SpecialFeature.THEMED_DINING,
            SpecialFeature.PARK_VIEW,
            SpecialFeature.ALLERGY_FRIENDLY,
            SpecialFeature.KIDS_MENU
        ],
        menu: [
            {
                name: "Beef Tenderloin",
                description: "Grilled beef tenderloin with roasted vegetables and truffle butter",
                price: 55,
                category: "entree",
                isSignature: true,
                diningPlanCredits: 2
            },
            {
                name: "Pork Rack Chop",
                description: "Herb-crusted pork rack chop with seasonal vegetables",
                price: 48,
                category: "entree",
                isSignature: true
            },
            {
                name: "Cinderella's Dessert Wishes",
                description: "A magical dessert presentation with sparklers and wishes coming true",
                price: 12,
                category: "dessert",
                isSignature: true
            }
        ],
        imageUrl: "/images/restaurants/cinderellas-royal-table.jpg",
        thumbnailUrl: "/images/restaurants/thumbnails/cinderellas-royal-table.jpg",
        galleryImages: [
            "/images/restaurants/cinderellas-royal-table/dining-room.jpg",
            "/images/restaurants/cinderellas-royal-table/castle-view.jpg",
            "/images/restaurants/cinderellas-royal-table/princesses.jpg"
        ],
        tags: ["Cinderella Castle", "Disney Princesses", "Signature dining", "Character dining", "Royal experience"],
        popularItems: ["Beef Tenderloin", "Wishes Dessert", "Princess Package"],
        chefSpecialties: ["Upscale American cuisine", "Signature castle dishes"],
        ambiance: ["Royal", "Elegant", "Magical", "Sophisticated"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        averageRating: 4.1,
        reviewCount: 3294,
        disneyRating: 4.4,
        isPopular: true,
        searchKeywords: ["Cinderella Castle", "Disney Princesses", "character dining", "signature dining", "royal table"],
        alternateNames: ["CRT", "Royal Table"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    },
    {
        id: "crystal-palace",
        name: "The Crystal Palace",
        description: "Join Winnie the Pooh and friends for a delightful character dining buffet in this beautiful Victorian-style conservatory. Enjoy a variety of American favorites while meeting Pooh, Piglet, Eeyore, and Tigger.",
        shortDescription: "Character buffet with Winnie the Pooh and friends in Victorian setting",
        location: {
            latitude: 28.4185,
            longitude: -81.5835,
            areaName: "Main Street U.S.A.",
            parkId: "magic-kingdom",
            landName: "Main Street U.S.A."
        },
        cuisineTypes: [CuisineType.AMERICAN, CuisineType.BUFFET],
        serviceType: ServiceType.TABLE_SERVICE,
        priceRange: PriceRange.MODERATE,
        diningExperience: DiningExperience.CHARACTER,
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
        specialFeatures: [
            SpecialFeature.THEMED_DINING,
            SpecialFeature.KIDS_MENU,
            SpecialFeature.ALLERGY_FRIENDLY,
            SpecialFeature.HEALTHY_OPTIONS
        ],
        menu: [
            {
                name: "Character Buffet",
                description: "All-you-care-to-eat buffet featuring salads, entrees, sides, and desserts",
                price: 42,
                category: "buffet",
                isSignature: false
            }
        ],
        imageUrl: "/images/restaurants/crystal-palace.jpg",
        thumbnailUrl: "/images/restaurants/thumbnails/crystal-palace.jpg",
        galleryImages: [
            "/images/restaurants/crystal-palace/dining-room.jpg",
            "/images/restaurants/crystal-palace/buffet.jpg",
            "/images/restaurants/crystal-palace/pooh-characters.jpg"
        ],
        tags: ["Winnie the Pooh", "Character dining", "Buffet", "Family-friendly", "Victorian"],
        popularItems: ["Character Buffet", "Dessert Selection", "Kids' Favorites"],
        chefSpecialties: ["American comfort food", "Family-style buffet"],
        ambiance: ["Family-friendly", "Bright", "Cheerful", "Victorian"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY,
            AccessibilityFeature.KIDS_MENU
        ],
        averageRating: 4.0,
        reviewCount: 1876,
        disneyRating: 4.2,
        isPopular: true,
        searchKeywords: ["Winnie the Pooh", "character dining", "buffet", "family dining", "Hundred Acre Wood"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    }
];

// EPCOT Restaurants
export const epcotRestaurants: DisneyRestaurant[] = [
    {
        id: "space-220-restaurant",
        name: "Space 220 Restaurant",
        description: "Take a space elevator 220 miles above Earth to this immersive space-themed restaurant. Enjoy contemporary American cuisine while looking out at stunning views of Earth and space through floor-to-ceiling windows.",
        shortDescription: "Space-themed fine dining with views of Earth from 220 miles above",
        location: {
            latitude: 28.3747,
            longitude: -81.5494,
            areaName: "Future World",
            parkId: "epcot",
            landName: "World Celebration"
        },
        cuisineTypes: [CuisineType.AMERICAN, CuisineType.INTERNATIONAL],
        serviceType: ServiceType.SIGNATURE_DINING,
        priceRange: PriceRange.LUXURY,
        diningExperience: DiningExperience.THEMED,
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
            reservationUrl: "https://disneyworld.disney.go.com/dining/epcot/space-220-restaurant/",
            walkUpsAccepted: false,
            reservationTips: [
                "Extremely popular and difficult to get",
                "Book exactly 60 days in advance",
                "Experience includes space elevator simulation",
                "Also try Space 220 Lounge for walk-ups"
            ],
            peakTimes: ["All meal times are popular"],
            bestTimesToVisit: ["Early lunch", "Late dinner for sunset views"]
        },
        diningPlanInfo: {
            acceptsDiningPlan: true,
            tableServiceCredits: 2,
            eligiblePlans: [DiningPlan.DINING_PLAN, DiningPlan.DELUXE_DINING],
            notes: "Signature dining experience requiring 2 table service credits"
        },
        specialFeatures: [
            SpecialFeature.THEMED_DINING,
            SpecialFeature.INTERACTIVE_EXPERIENCE,
            SpecialFeature.CRAFT_COCKTAILS,
            SpecialFeature.ALLERGY_FRIENDLY
        ],
        menu: [
            {
                name: "Blue Moon Cauliflower",
                description: "Roasted cauliflower with blue cheese mousse and buffalo sauce",
                price: 16,
                category: "appetizer",
                isSignature: true
            },
            {
                name: "Slow-Rotation Short Rib",
                description: "Braised short rib with potato puree and seasonal vegetables",
                price: 52,
                category: "entree",
                isSignature: true
            },
            {
                name: "Chocolate Mousse Sphere",
                description: "Dark chocolate sphere filled with mousse and served with space dust",
                price: 14,
                category: "dessert",
                isSignature: true
            }
        ],
        imageUrl: "/images/restaurants/space-220.jpg",
        thumbnailUrl: "/images/restaurants/thumbnails/space-220.jpg",
        galleryImages: [
            "/images/restaurants/space-220/dining-room.jpg",
            "/images/restaurants/space-220/earth-view.jpg",
            "/images/restaurants/space-220/space-elevator.jpg"
        ],
        tags: ["Space theme", "Signature dining", "Immersive experience", "Earth views", "Future World"],
        popularItems: ["Slow-Rotation Short Rib", "Blue Moon Cauliflower", "Chocolate Mousse Sphere"],
        chefSpecialties: ["Contemporary American", "Space-inspired presentations"],
        ambiance: ["Futuristic", "Immersive", "Sophisticated", "Out-of-this-world"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        averageRating: 4.6,
        reviewCount: 1247,
        disneyRating: 4.8,
        isPopular: true,
        isNew: true,
        searchKeywords: ["space theme", "Earth views", "signature dining", "space elevator", "immersive"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    },
    {
        id: "monsieur-paul",
        name: "Monsieur Paul",
        description: "Experience the pinnacle of French fine dining at this AAA Five Diamond Award-winning restaurant. Located on the second floor of the France Pavilion, Monsieur Paul offers an intimate and sophisticated dining experience with views of World Showcase Lagoon.",
        shortDescription: "AAA Five Diamond French fine dining in EPCOT's France Pavilion",
        location: {
            latitude: 28.3692,
            longitude: -81.5439,
            areaName: "World Showcase",
            parkId: "epcot",
            landName: "France Pavilion"
        },
        cuisineTypes: [CuisineType.FRENCH],
        serviceType: ServiceType.FINE_DINING,
        priceRange: PriceRange.LUXURY,
        diningExperience: DiningExperience.FINE_DINING,
        operatingHours: {
            "Monday": "Closed",
            "Tuesday": "5:30 PM - 8:30 PM",
            "Wednesday": "5:30 PM - 8:30 PM",
            "Thursday": "5:30 PM - 8:30 PM",
            "Friday": "5:30 PM - 8:30 PM",
            "Saturday": "5:30 PM - 8:30 PM",
            "Sunday": "5:30 PM - 8:30 PM"
        },
        phoneNumber: "(407) 939-3463",
        reservationInfo: {
            acceptsReservations: true,
            requiresReservations: true,
            advanceReservationDays: 60,
            reservationUrl: "https://disneyworld.disney.go.com/dining/epcot/monsieur-paul/",
            walkUpsAccepted: false,
            reservationTips: [
                "Most expensive restaurant at Walt Disney World",
                "Dress code enforced - business casual required",
                "Prix fixe menu only",
                "Wine pairings available"
            ],
            peakTimes: ["7:00 PM - 8:00 PM"],
            bestTimesToVisit: ["5:30 PM for sunset views", "Late seating for fireworks"]
        },
        diningPlanInfo: {
            acceptsDiningPlan: false,
            eligiblePlans: [],
            notes: "Does not accept Disney Dining Plans"
        },
        specialFeatures: [
            SpecialFeature.WINE_BAR,
            SpecialFeature.FIREWORKS_VIEW,
            SpecialFeature.WATER_VIEW,
            SpecialFeature.WINE_TASTING,
            SpecialFeature.CHEF_TABLE
        ],
        menu: [
            {
                name: "Amuse-Bouche Selection",
                description: "Chef's selection of small appetizer bites",
                price: 35,
                category: "appetizer",
                isSignature: true
            },
            {
                name: "Lobster Thermidor",
                description: "Classic French lobster preparation with cognac and cream sauce",
                price: 95,
                category: "entree",
                isSignature: true
            },
            {
                name: "Soufflé au Chocolat",
                description: "Traditional French chocolate soufflé with vanilla sauce",
                price: 28,
                category: "dessert",
                isSignature: true
            }
        ],
        imageUrl: "/images/restaurants/monsieur-paul.jpg",
        thumbnailUrl: "/images/restaurants/thumbnails/monsieur-paul.jpg",
        galleryImages: [
            "/images/restaurants/monsieur-paul/dining-room.jpg",
            "/images/restaurants/monsieur-paul/lagoon-view.jpg",
            "/images/restaurants/monsieur-paul/french-cuisine.jpg"
        ],
        tags: ["French cuisine", "Fine dining", "AAA Five Diamond", "Prix fixe", "Romantic"],
        popularItems: ["Prix Fixe Menu", "Wine Pairings", "Lobster Thermidor"],
        chefSpecialties: ["Classical French techniques", "Seasonal ingredients", "Wine pairings"],
        ambiance: ["Elegant", "Romantic", "Sophisticated", "Intimate"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        averageRating: 4.7,
        reviewCount: 523,
        disneyRating: 4.9,
        isPopular: true,
        requiresID: true,
        minimumAge: 10,
        searchKeywords: ["French fine dining", "AAA Five Diamond", "prix fixe", "France Pavilion", "romantic"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    }
];

// Hollywood Studios Restaurants
export const hollywoodStudiosRestaurants: DisneyRestaurant[] = [
    {
        id: "oga-cantina",
        name: "Oga's Cantina",
        description: "Step into the notorious watering hole of Black Spire Outpost on the planet Batuu. This immersive Star Wars cantina serves exotic beverages, both alcoholic and non-alcoholic, in a lively atmosphere with live DJ R-3X.",
        shortDescription: "Immersive Star Wars cantina with exotic drinks and galactic atmosphere",
        location: {
            latitude: 28.3541,
            longitude: -81.5606,
            areaName: "Star Wars: Galaxy's Edge",
            parkId: "hollywood-studios",
            landName: "Star Wars: Galaxy's Edge"
        },
        cuisineTypes: [CuisineType.BAR],
        serviceType: ServiceType.LOUNGE,
        priceRange: PriceRange.MODERATE,
        diningExperience: DiningExperience.THEMED,
        operatingHours: {
            "Monday": "9:00 AM - 9:00 PM",
            "Tuesday": "9:00 AM - 9:00 PM",
            "Wednesday": "9:00 AM - 9:00 PM",
            "Thursday": "9:00 AM - 9:00 PM",
            "Friday": "9:00 AM - 9:00 PM",
            "Saturday": "9:00 AM - 9:00 PM",
            "Sunday": "9:00 AM - 9:00 PM"
        },
        phoneNumber: "(407) 939-3463",
        reservationInfo: {
            acceptsReservations: true,
            requiresReservations: true,
            advanceReservationDays: 60,
            reservationUrl: "https://disneyworld.disney.go.com/dining/hollywood-studios/ogas-cantina/",
            walkUpsAccepted: true,
            reservationTips: [
                "Limited seating - reservations highly recommended",
                "45-minute time limit when busy",
                "Standing room and limited bar seating",
                "Unique Star Wars themed drinks"
            ],
            peakTimes: ["2:00 PM - 6:00 PM", "8:00 PM - Close"],
            bestTimesToVisit: ["Park opening", "Late evening"]
        },
        diningPlanInfo: {
            acceptsDiningPlan: false,
            eligiblePlans: [],
            notes: "Alcoholic beverages and specialty drinks not covered by dining plans"
        },
        specialFeatures: [
            SpecialFeature.THEMED_DINING,
            SpecialFeature.CRAFT_COCKTAILS,
            SpecialFeature.LIVE_ENTERTAINMENT,
            SpecialFeature.INTERACTIVE_EXPERIENCE
        ],
        menu: [
            {
                name: "Blue Bantha",
                description: "Blue milk, plant-based, served frozen",
                price: 8,
                category: "non-alcoholic",
                isSignature: true
            },
            {
                name: "Jedi Mind Trick",
                description: "Ketel One Vodka, Bols Blue Curacao, Pomegranate Juice, Lime Juice, Sprite",
                price: 16,
                category: "alcoholic",
                isSignature: true
            },
            {
                name: "Batuu Bits",
                description: "Crispy topato and meat snack mix",
                price: 9,
                category: "snack"
            }
        ],
        imageUrl: "/images/restaurants/ogas-cantina.jpg",
        thumbnailUrl: "/images/restaurants/thumbnails/ogas-cantina.jpg",
        galleryImages: [
            "/images/restaurants/ogas-cantina/interior.jpg",
            "/images/restaurants/ogas-cantina/drinks.jpg",
            "/images/restaurants/ogas-cantina/dj-r3x.jpg"
        ],
        tags: ["Star Wars", "Cantina", "Themed drinks", "Galaxy's Edge", "Immersive"],
        popularItems: ["Blue Bantha", "Jedi Mind Trick", "Fuzzy Tauntaun"],
        chefSpecialties: ["Galactic-themed beverages", "Star Wars immersion"],
        ambiance: ["Lively", "Immersive", "Futuristic", "Authentic Star Wars"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY
        ],
        averageRating: 4.2,
        reviewCount: 2156,
        disneyRating: 4.5,
        isPopular: true,
        requiresID: true,
        minimumAge: 21,
        searchKeywords: ["Star Wars", "cantina", "Galaxy's Edge", "Batuu", "themed drinks"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    }
];

// Disney Springs Restaurants
export const disneyStringsRestaurants: DisneyRestaurant[] = [
    {
        id: "the-boathouse-disney-springs",
        name: "The BOATHOUSE",
        description: "An upscale, waterfront dining experience featuring fresh seafood, steaks, chops, and a raw bar, complemented by the world's most unique collection of floating restaurants - dream boats from the 1930s, '40s and '50s.",
        shortDescription: "Upscale waterfront dining with seafood, steaks, and vintage boat collection",
        location: {
            latitude: 28.3681,
            longitude: -81.5196,
            areaName: "The Landing",
            parkId: "disney-springs"
        },
        cuisineTypes: [CuisineType.SEAFOOD, CuisineType.STEAKHOUSE, CuisineType.AMERICAN],
        serviceType: ServiceType.TABLE_SERVICE,
        priceRange: PriceRange.EXPENSIVE,
        diningExperience: DiningExperience.WATERFRONT,
        operatingHours: {
            "Monday": "11:00 AM - 11:00 PM",
            "Tuesday": "11:00 AM - 11:00 PM",
            "Wednesday": "11:00 AM - 11:00 PM",
            "Thursday": "11:00 AM - 11:00 PM",
            "Friday": "11:00 AM - 12:00 AM",
            "Saturday": "11:00 AM - 12:00 AM",
            "Sunday": "11:00 AM - 11:00 PM"
        },
        phoneNumber: "(407) 939-2628",
        reservationInfo: {
            acceptsReservations: true,
            requiresReservations: false,
            advanceReservationDays: 60,
            reservationUrl: "https://disneyworld.disney.go.com/dining/disney-springs/the-boathouse/",
            walkUpsAccepted: true,
            reservationTips: [
                "Waterfront seating is most popular",
                "Amphicar tours available for additional fee",
                "Raw bar doesn't require reservations",
                "Valet parking available"
            ],
            peakTimes: ["7:00 PM - 9:00 PM"],
            bestTimesToVisit: ["Early dinner for sunset", "Late lunch"]
        },
        diningPlanInfo: {
            acceptsDiningPlan: false,
            eligiblePlans: [],
            notes: "Does not participate in Disney Dining Plans"
        },
        specialFeatures: [
            SpecialFeature.WATERFRONT,
            SpecialFeature.OUTDOOR_SEATING,
            SpecialFeature.LIVE_ENTERTAINMENT,
            SpecialFeature.WATER_VIEW,
            SpecialFeature.FULL_BAR,
            SpecialFeature.CRAFT_COCKTAILS
        ],
        menu: [
            {
                name: "Lobster Roll",
                description: "Maine lobster salad with herb aioli on a New England roll",
                price: 38,
                category: "entree",
                isSignature: true
            },
            {
                name: "Filet Mignon",
                description: "8oz center-cut filet with choice of two sides",
                price: 49,
                category: "entree",
                isSignature: true
            },
            {
                name: "Key West Shrimp",
                description: "Coconut tempura shrimp with mango salsa",
                price: 15,
                category: "appetizer"
            }
        ],
        imageUrl: "/images/restaurants/the-boathouse.jpg",
        thumbnailUrl: "/images/restaurants/thumbnails/the-boathouse.jpg",
        galleryImages: [
            "/images/restaurants/the-boathouse/waterfront.jpg",
            "/images/restaurants/the-boathouse/amphicars.jpg",
            "/images/restaurants/the-boathouse/raw-bar.jpg"
        ],
        tags: ["Waterfront", "Seafood", "Steaks", "Vintage boats", "Raw bar"],
        popularItems: ["Lobster Roll", "Filet Mignon", "Amphicar Tours"],
        chefSpecialties: ["Fresh seafood", "Prime steaks", "Raw bar selections"],
        ambiance: ["Upscale", "Nautical", "Romantic", "Waterfront"],
        accessibility: [
            AccessibilityFeature.WHEELCHAIR_ACCESSIBLE,
            AccessibilityFeature.DIETARY_ACCOMMODATIONS,
            AccessibilityFeature.SERVICE_ANIMAL_FRIENDLY,
            AccessibilityFeature.ACCESSIBLE_PARKING
        ],
        averageRating: 4.4,
        reviewCount: 3721,
        disneyRating: 4.6,
        isPopular: true,
        searchKeywords: ["waterfront dining", "seafood", "amphicar", "The Landing", "vintage boats"],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    }
];

// Combined restaurant data
export const allRestaurants: DisneyRestaurant[] = [
    ...magicKingdomRestaurants,
    ...epcotRestaurants,
    ...hollywoodStudiosRestaurants,
    ...disneyStringsRestaurants
];

// Restaurant data organized by location
export const restaurantsByLocation = {
    [DisneyLocation.MAGIC_KINGDOM]: magicKingdomRestaurants,
    [DisneyLocation.EPCOT]: epcotRestaurants,
    [DisneyLocation.HOLLYWOOD_STUDIOS]: hollywoodStudiosRestaurants,
    [DisneyLocation.DISNEY_SPRINGS]: disneyStringsRestaurants
};

// Quick access functions
export const getRestaurantById = (id: string): DisneyRestaurant | undefined => {
    return allRestaurants.find(restaurant => restaurant.id === id);
};

export const getRestaurantsByLocation = (locationId: DisneyLocation): DisneyRestaurant[] => {
    return restaurantsByLocation[locationId] || [];
};

export const getRestaurantsByCuisine = (cuisineType: CuisineType): DisneyRestaurant[] => {
    return allRestaurants.filter(restaurant =>
        restaurant.cuisineTypes.includes(cuisineType)
    );
};

export const getRestaurantsByServiceType = (serviceType: ServiceType): DisneyRestaurant[] => {
    return allRestaurants.filter(restaurant =>
        restaurant.serviceType === serviceType
    );
};

export const getPopularRestaurants = (): DisneyRestaurant[] => {
    return allRestaurants.filter(restaurant => restaurant.isPopular);
};

export const getCharacterDiningRestaurants = (): DisneyRestaurant[] => {
    return allRestaurants.filter(restaurant =>
        restaurant.characterDining?.hasCharacterDining
    );
};