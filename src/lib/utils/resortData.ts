import {
    Resort, ResortCategory, ResortArea, AmenityCategory,
    DiningCategory, RecreationCategory, TransportationType
} from "@/types/resort";

export const resorts: Resort[] = [
    {
        id: "grand-floridian",
        name: "Disney's Grand Floridian Resort & Spa",
        category: ResortCategory.Deluxe,
        description: "Victorian elegance meets modern sophistication at Disney's Grand Floridian Resort & Spa, Walt Disney World's crown jewel.",
        longDescription: "Experience the Victorian splendor and elegance of Disney's Grand Floridian Resort & Spa, Walt Disney World Resort's crown jewel. Nestled on the shores of the Seven Seas Lagoon, this magnificent red-gabled resort combines timeless charm with the utmost in Disney luxury. Immerse yourself in the opulence of the grand lobby, where live orchestra music fills the air, setting the tone for a truly refined experience. The resort's attention to detail extends from the meticulously manicured gardens to the sumptuous guest rooms and world-class dining options. As a flagship Disney resort, the Grand Floridian offers unparalleled service, amenities, and proximity to Magic Kingdom Park, connected by both monorail and water launch service. Every aspect of your stay is designed to evoke the golden age of leisure, creating memories that are both magical and distinguished.",
        amenities: [
            {
                id: "grand-pool",
                name: "Beach Pool",
                description: "Zero-entry pool with an Alice in Wonderland theme and 181-foot waterslide",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "courtyard-pool",
                name: "Courtyard Pool",
                description: "Quiet pool experience for a more relaxed swimming environment",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "senses-spa",
                name: "Senses Spa",
                description: "Full-service spa offering massages, facials, and body treatments",
                icon: "spa",
                category: AmenityCategory.Fitness
            },
            {
                id: "health-club",
                name: "Health Club",
                description: "24-hour fitness center with state-of-the-art equipment",
                icon: "fitness",
                category: AmenityCategory.Fitness
            },
            {
                id: "boat-rentals",
                name: "Boat Rentals",
                description: "Motorized boat rentals available at the marina",
                icon: "boat",
                category: AmenityCategory.Recreation
            },
            {
                id: "arcadia-games",
                name: "Arcadia Games",
                description: "Arcade featuring classic and modern video games",
                icon: "games",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room",
                name: "Standard Room",
                description: "Elegant accommodations with Victorian-inspired décor and modern amenities",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 440,
                views: ["Garden View", "Lagoon View", "Theme Park View"],
                priceRange: { low: 629, high: 859 },
                amenities: ["Balcony", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "club-level",
                name: "Club Level Room",
                description: "Enhanced accommodations with access to the exclusive Royal Palm Club concierge lounge",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 440,
                views: ["Garden View", "Lagoon View", "Theme Park View"],
                priceRange: { low: 899, high: 1299 },
                amenities: ["Balcony", "Mini Refrigerator", "Coffee Maker", "Turndown Service", "Concierge Services", "Access to Club Lounge with Food & Beverages"]
            },
            {
                id: "one-bedroom-suite",
                name: "One-Bedroom Suite",
                description: "Spacious suite with separate living area and bedroom for added comfort and luxury",
                maxOccupancy: 5,
                bedConfiguration: "1 King Bed and 1 Queen-Size Sleeper Sofa and 1 Day Bed",
                squareFeet: 1,
                views: ["Garden View", "Lagoon View", "Theme Park View"],
                priceRange: { low: 1299, high: 2199 },
                amenities: ["Separate Living Room", "Wet Bar", "Multiple Balconies", "Concierge Services", "Luxury Bath Amenities", "Walk-in Closet"]
            }
        ],
        location: {
            latitude: 28.4111,
            longitude: -81.5866,
            area: ResortArea.MagicKingdom,
            distanceToParks: {
                "Magic Kingdom": 0.5,
                "Epcot": 3.2,
                "Hollywood Studios": 4.5,
                "Animal Kingdom": 6.1,
                "Disney Springs": 4.2
            }
        },
        dining: [
            {
                id: "victoria-alberts",
                name: "Victoria & Albert's",
                description: "The crown jewel of Walt Disney World dining, offering a prix fixe menu in an elegant setting",
                category: DiningCategory.Signature,
                cuisine: ["American", "Contemporary"],
                priceRange: 4,
                requiresReservation: true,
                hours: "5:00 PM - 9:30 PM",
                diningPlans: []
            },
            {
                id: "narcoossees",
                name: "Narcoossee's",
                description: "Waterfront dining featuring coastal cuisine and Magic Kingdom fireworks views",
                category: DiningCategory.Signature,
                cuisine: ["Seafood", "Steakhouse"],
                priceRange: 3,
                requiresReservation: true,
                hours: "5:00 PM - 9:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "grand-floridian-cafe",
                name: "Grand Floridian Café",
                description: "Casual elegance serving American favorites for breakfast, lunch, and dinner",
                category: DiningCategory.TableService,
                cuisine: ["American"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:00 AM - 9:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "gasparilla-island",
                name: "Gasparilla Island Grill",
                description: "Quick-service dining available 24 hours a day",
                category: DiningCategory.QuickService,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "Open 24 hours",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "beach-pool-rec",
                name: "Beach Pool with Waterslide",
                description: "Zero-entry pool featuring a 181-foot-long waterslide and a poolside bar",
                category: RecreationCategory.Pool,
                hours: "7:00 AM - 11:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "fishing",
                name: "Guided Fishing Excursions",
                description: "Guided catch-and-release fishing excursions on Seven Seas Lagoon and Bay Lake",
                category: RecreationCategory.Water,
                hours: "7:00 AM - 1:30 PM",
                additionalFee: true,
                reservationRequired: true
            },
            {
                id: "campfire",
                name: "Electrical Water Pageant",
                description: "View this floating nighttime spectacle from the resort's marina or beach",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Monorail,
                destinationsServed: ["Magic Kingdom", "Transportation and Ticket Center", "Disney's Contemporary Resort", "Disney's Polynesian Village Resort"],
                frequency: "Every 4-7 minutes",
                hours: "6:30 AM - 12:00 AM"
            },
            {
                type: TransportationType.Boat,
                destinationsServed: ["Magic Kingdom", "Disney's Polynesian Village Resort", "Disney's Wilderness Lodge", "Disney's Fort Wilderness Resort & Campground"],
                frequency: "Every 15-20 minutes",
                hours: "8:30 AM - 11:00 PM"
            },
            {
                type: TransportationType.Bus,
                destinationsServed: ["Disney's Animal Kingdom", "Disney's Hollywood Studios", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "The Grand Floridian Resort & Spa draws inspiration from the Victorian era, specifically the golden age of Palm Beach resorts from Florida's early tourism history. The architecture features white clapboard facades, red-shingled roofs, and detailed gingerbread trim work. The resort's interiors showcase Italian marble floors, stained glass domes, and ornate chandeliers, creating an atmosphere of timeless sophistication.",
        openingDate: "June 28, 1988",
        lastRefurbished: "2022",
        imageUrls: {
            main: "/images/resorts/grand-floridian-main.jpg",
            gallery: [
                "/images/resorts/grand-floridian-lobby.jpg",
                "/images/resorts/grand-floridian-exterior.jpg",
                "/images/resorts/grand-floridian-pool.jpg",
                "/images/resorts/grand-floridian-grounds.jpg",
                "/images/resorts/grand-floridian-monorail.jpg"
            ],
            rooms: {
                "standard-room": [
                    "/images/resorts/grand-floridian-standard-1.jpg",
                    "/images/resorts/grand-floridian-standard-2.jpg"
                ],
                "club-level": [
                    "/images/resorts/grand-floridian-club-1.jpg",
                    "/images/resorts/grand-floridian-club-2.jpg"
                ],
                "one-bedroom-suite": [
                    "/images/resorts/grand-floridian-suite-1.jpg",
                    "/images/resorts/grand-floridian-suite-2.jpg"
                ]
            },
            dining: {
                "victoria-alberts": [
                    "/images/resorts/grand-floridian-victoria-1.jpg",
                    "/images/resorts/grand-floridian-victoria-2.jpg"
                ],
                "narcoossees": [
                    "/images/resorts/grand-floridian-narcoossees-1.jpg",
                    "/images/resorts/grand-floridian-narcoossees-2.jpg"
                ]
            },
            amenities: {
                "grand-pool": [
                    "/images/resorts/grand-floridian-beach-pool-1.jpg",
                    "/images/resorts/grand-floridian-beach-pool-2.jpg"
                ],
                "senses-spa": [
                    "/images/resorts/grand-floridian-spa-1.jpg",
                    "/images/resorts/grand-floridian-spa-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 629, high: 2199 }
        },
        address: "4401 Floridian Way, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 824-3000",
        nearbyAttractions: [
            "Magic Kingdom Park",
            "Seven Seas Lagoon",
            "Disney's Polynesian Village Resort",
            "Disney's Contemporary Resort",
            "Disney's Wedding Pavilion"
        ],
        featuredExperiences: [
            "Afternoon Tea at Garden View Tea Room",
            "Cinderella's Happily Ever After Dinner at 1900 Park Fare",
            "Piano player in the main lobby",
            "Grand Floridian Orchestra performances",
            "Speciality Cruises from the Marina"
        ],
        specialConsiderations: [
            "One of the most expensive resorts at Walt Disney World",
            "Direct monorail access to Magic Kingdom makes it convenient for families with young children",
            "Victoria & Albert's requires formal attire and has a minimum age requirement of 10 years"
        ]
    },
    {
        id: "animal-kingdom-lodge",
        name: "Disney's Animal Kingdom Lodge",
        category: ResortCategory.Deluxe,
        description: "An African savanna comes to life at this spectacular resort where you can observe exotic animals from your room or public viewing areas.",
        longDescription: "Inspired by the traditional African kraal, Disney's Animal Kingdom Lodge is a wildlife reserve where over 200 hoofed animals and birds live. Featuring authentic African-inspired architecture, this resort offers an unforgettable experience combining the majesty of wildlife with the rich culture of Africa. The horseshoe-curved design provides spectacular views of four lush savannas where over 30 species of African wildlife roam freely. Inside, the resort celebrates African culture with one of the largest collections of African art in the United States, along with the warmth of traditional African hospitality. Each day brings new opportunities for cultural immersion through storytelling, culinary adventures, and educational activities that highlight the diversity and richness of African traditions.",
        amenities: [
            {
                id: "uzima-pool",
                name: "Uzima Pool",
                description: "11,000-square-foot tropical oasis with a 67-foot-long slide and zero-depth entry point",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "samawati-pool",
                name: "Samawati Springs Pool",
                description: "Secondary pool with a waterslide located at Kidani Village",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "zahanati-fitness",
                name: "Zahanati Fitness Center",
                description: "State-of-the-art fitness center with cardio equipment and free weights",
                icon: "fitness",
                category: AmenityCategory.Fitness
            },
            {
                id: "wanyama-safari",
                name: "Wanyama Safari",
                description: "Exclusive sunset safari followed by a multi-course dinner",
                icon: "safari",
                category: AmenityCategory.Recreation
            },
            {
                id: "simba-clubhouse",
                name: "Simba's Clubhouse",
                description: "Supervised children's activity center",
                icon: "kids",
                category: AmenityCategory.Service
            },
            {
                id: "survival-outpost",
                name: "Survival of the Fittest Fitness Trail",
                description: "Jogging trail around the resort property",
                icon: "trail",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-view",
                name: "Standard Room",
                description: "Comfortable accommodations with African-inspired décor",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 344,
                views: ["Standard View", "Pool View", "Savanna View"],
                priceRange: { low: 459, high: 659 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "savanna-view",
                name: "Savanna View Room",
                description: "Room with private balcony overlooking the wildlife savanna",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 344,
                views: ["Savanna View"],
                priceRange: { low: 559, high: 759 },
                amenities: ["Balcony", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "club-level-savanna",
                name: "Club Level Savanna View",
                description: "Savanna view room with access to the exclusive Kilimanjaro Club concierge lounge",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 344,
                views: ["Savanna View"],
                priceRange: { low: 799, high: 999 },
                amenities: ["Balcony", "Mini Refrigerator", "Coffee Maker", "Turndown Service", "Concierge Services", "Access to Club Lounge with Food & Beverages"]
            }
        ],
        location: {
            latitude: 28.3539,
            longitude: -81.6021,
            area: ResortArea.AnimalKingdom,
            distanceToParks: {
                "Magic Kingdom": 7.2,
                "Epcot": 5.8,
                "Hollywood Studios": 6.1,
                "Animal Kingdom": 1.8,
                "Disney Springs": 5.4
            }
        },
        dining: [
            {
                id: "jiko",
                name: "Jiko - The Cooking Place",
                description: "Signature dining experience featuring African, Indian, and Mediterranean cuisine",
                category: DiningCategory.Signature,
                cuisine: ["African", "Indian", "Mediterranean"],
                priceRange: 3,
                requiresReservation: true,
                hours: "5:00 PM - 10:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "boma",
                name: "Boma - Flavors of Africa",
                description: "Buffet restaurant featuring African cuisine and American favorites",
                category: DiningCategory.TableService,
                cuisine: ["African", "American"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:30 AM - 11:00 AM, 5:00 PM - 9:30 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "sanaa",
                name: "Sanaa",
                description: "Casual dining with savanna views and African cuisine with Indian flavors",
                category: DiningCategory.TableService,
                cuisine: ["African", "Indian"],
                priceRange: 2,
                requiresReservation: true,
                hours: "11:30 AM - 9:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "mara",
                name: "The Mara",
                description: "Quick-service restaurant offering African-inspired dishes and American favorites",
                category: DiningCategory.QuickService,
                cuisine: ["African", "American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "7:00 AM - 11:30 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "safari",
                name: "Wildlife Viewing",
                description: "Observe exotic animals from viewing areas throughout the resort",
                category: RecreationCategory.Outdoor,
                hours: "Dawn to Dusk",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "cultural-activities",
                name: "Cultural Immersion Activities",
                description: "African-inspired crafts, music, and cultural experiences led by Cast Members from African countries",
                category: RecreationCategory.Entertainment,
                hours: "Various times throughout the day",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "night-safari",
                name: "Night Safari",
                description: "Evening wildlife viewing using night vision equipment",
                category: RecreationCategory.Outdoor,
                hours: "Check daily schedule",
                additionalFee: false,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Bus,
                destinationsServed: ["Magic Kingdom", "Epcot", "Hollywood Studios", "Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "Disney's Animal Kingdom Lodge showcases the architectural styles found in the traditional kraal (village compound) design of African wildlife reserves. The distinctive horseshoe-curved design provides views of the four savannas where animals roam. The resort features authentic African artwork, hand-carved wooden furniture, and traditional mud fireplace designs. Flame tree and Acacia tree motifs are found throughout the resort, and the impressive lobby features a thatched roof design, mud fireplaces, and a vast collection of African art and artifacts.",
        openingDate: "April 16, 2001",
        lastRefurbished: "2019",
        imageUrls: {
            main: "/images/resorts/animal-kingdom-lodge-main.jpg",
            gallery: [
                "/images/resorts/animal-kingdom-lodge-lobby.jpg",
                "/images/resorts/animal-kingdom-lodge-exterior.jpg",
                "/images/resorts/animal-kingdom-lodge-savanna.jpg",
                "/images/resorts/animal-kingdom-lodge-pool.jpg",
                "/images/resorts/animal-kingdom-lodge-giraffes.jpg"
            ],
            rooms: {
                "standard-view": [
                    "/images/resorts/animal-kingdom-lodge-standard-1.jpg",
                    "/images/resorts/animal-kingdom-lodge-standard-2.jpg"
                ],
                "savanna-view": [
                    "/images/resorts/animal-kingdom-lodge-savanna-view-1.jpg",
                    "/images/resorts/animal-kingdom-lodge-savanna-view-2.jpg"
                ],
                "club-level-savanna": [
                    "/images/resorts/animal-kingdom-lodge-club-1.jpg",
                    "/images/resorts/animal-kingdom-lodge-club-2.jpg"
                ]
            },
            dining: {
                "jiko": [
                    "/images/resorts/animal-kingdom-lodge-jiko-1.jpg",
                    "/images/resorts/animal-kingdom-lodge-jiko-2.jpg"
                ],
                "boma": [
                    "/images/resorts/animal-kingdom-lodge-boma-1.jpg",
                    "/images/resorts/animal-kingdom-lodge-boma-2.jpg"
                ]
            },
            amenities: {
                "uzima-pool": [
                    "/images/resorts/animal-kingdom-lodge-pool-1.jpg",
                    "/images/resorts/animal-kingdom-lodge-pool-2.jpg"
                ],
                "safari": [
                    "/images/resorts/animal-kingdom-lodge-safari-1.jpg",
                    "/images/resorts/animal-kingdom-lodge-safari-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 459, high: 999 }
        },
        address: "2901 Osceola Parkway, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 938-3000",
        nearbyAttractions: [
            "Disney's Animal Kingdom Theme Park",
            "Blizzard Beach Water Park",
            "Winter Summerland Miniature Golf"
        ],
        featuredExperiences: [
            "Cultural Representatives sharing knowledge and stories",
            "Culinary Tours of Jiko and Boma",
            "Dine with an Animal Specialist experience",
            "Wanyama Safari and Dinner (additional fee)",
            "Starlight Safari (night vision safari)"
        ],
        specialConsiderations: [
            "Savanna view rooms offer the best opportunity to view animals from your room",
            "The resort is located furthest from Magic Kingdom and Epcot, so consider transportation times",
            "Animal viewing is best in early morning and late afternoon"
        ]
    },
    {
        id: "polynesian-village",
        name: "Disney's Polynesian Village Resort",
        category: ResortCategory.Deluxe,
        description: "A South Pacific paradise featuring lush vegetation, tropical beaches, and an exotic atmosphere that transports guests to the islands of Polynesia.",
        longDescription: "Experience the spirit of aloha at Disney's Polynesian Village Resort, a tropical oasis that brings the exotic allure of the South Pacific to Walt Disney World Resort. This iconic retreat opened with Magic Kingdom Park in 1971 and has remained one of Disney's most beloved resorts. The island ambiance embraces you from the moment you step into the Great Ceremonial House, with its soaring thatched roof and cascading waterfall garden. Swaying palm trees, white sand beaches, and torch-lit walkways create a serene island escape where time seems to slow down. Featuring architecture inspired by the Pacific Islands, the resort offers breathtaking views across the Seven Seas Lagoon, immersive cultural activities, authentic island cuisine, and a spirit of relaxation that captures the essence of island life. As one of the original Walt Disney World resorts, the Polynesian combines nostalgic Disney charm with modern luxuries, creating an unforgettable tropical retreat for guests of all ages.",
        amenities: [
            {
                id: "lava-pool",
                name: "Lava Pool",
                description: "Zero-entry volcano-themed feature pool with a 142-foot waterslide and interactive play area",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "oasis-pool",
                name: "Oasis Pool",
                description: "Quiet pool offering a more relaxed swimming environment",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "lilo-arcade",
                name: "Lilo's Playhouse",
                description: "Supervised children's activity center with games and activities",
                icon: "kids",
                category: AmenityCategory.Recreation
            },
            {
                id: "moorea-fitness",
                name: "Moorea Health & Fitness Center",
                description: "24-hour fitness center with cardiovascular equipment and free weights",
                icon: "fitness",
                category: AmenityCategory.Fitness
            },
            {
                id: "beach-hammocks",
                name: "Beach & Hammocks",
                description: "White-sand beach with hammocks along the shore of Seven Seas Lagoon",
                icon: "beach",
                category: AmenityCategory.Recreation
            },
            {
                id: "marina-rentals",
                name: "Marina Boat Rentals",
                description: "Watercraft rentals including motorized boats and specialty cruises",
                icon: "boat",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room",
                name: "Standard Room",
                description: "Comfortable accommodations with Polynesian-inspired décor",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 415,
                views: ["Standard View", "Pool View", "Garden View", "Lagoon View", "Theme Park View"],
                priceRange: { low: 599, high: 799 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "club-level",
                name: "Club Level Room",
                description: "Enhanced accommodations with access to the exclusive King Kamehameha Club concierge lounge",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 415,
                views: ["Theme Park View", "Lagoon View"],
                priceRange: { low: 799, high: 1099 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Turndown Service", "Concierge Services", "Access to Club Lounge with Food & Beverages"]
            },
            {
                id: "bungalow",
                name: "Bora Bora Bungalow",
                description: "Overwater bungalow with private deck, plunge pool, and stunning views of Magic Kingdom and Seven Seas Lagoon",
                maxOccupancy: 8,
                bedConfiguration: "1 King Bed, 1 Queen Bed, 1 Queen-Size Sleeper Sofa, and 2 Single Pull-Down Beds",
                squareFeet: 1650,
                views: ["Lagoon View", "Theme Park View"],
                priceRange: { low: 2599, high: 3599 },
                amenities: ["Full Kitchen", "Washer & Dryer", "Private Deck", "Plunge Pool", "Two Bathrooms", "Dining Area", "Living Room"]
            }
        ],
        location: {
            latitude: 28.4095,
            longitude: -81.5839,
            area: ResortArea.MagicKingdom,
            distanceToParks: {
                "Magic Kingdom": 0.7,
                "Epcot": 2.5,
                "Hollywood Studios": 4.2,
                "Animal Kingdom": 5.9,
                "Disney Springs": 3.9
            }
        },
        dining: [
            {
                id: "ohana",
                name: "'Ohana",
                description: "All-you-care-to-enjoy family-style dining featuring Polynesian-inspired cuisine",
                category: DiningCategory.TableService,
                cuisine: ["Polynesian", "American"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:30 AM - 12:00 PM, 5:00 PM - 10:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "kona-cafe",
                name: "Kona Cafe",
                description: "Casual table-service restaurant serving American cuisine with an Asian flair",
                category: DiningCategory.TableService,
                cuisine: ["American", "Asian", "Polynesian"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:30 AM - 11:00 AM, 5:00 PM - 10:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "trader-sams",
                name: "Trader Sam's Grog Grotto",
                description: "Enchanted tiki bar serving exotic drinks and light appetizers with interactive elements",
                category: DiningCategory.Lounge,
                cuisine: ["Polynesian", "American"],
                priceRange: 2,
                requiresReservation: false,
                hours: "4:00 PM - 12:00 AM",
                diningPlans: []
            },
            {
                id: "capt-cooks",
                name: "Capt. Cook's",
                description: "Quick-service restaurant offering a variety of meals and snacks",
                category: DiningCategory.QuickService,
                cuisine: ["American", "Polynesian"],
                priceRange: 1,
                requiresReservation: false,
                hours: "6:30 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "volcano-pool",
                name: "Lava Pool",
                description: "Volcano-themed feature pool with a 142-foot waterslide and interactive play area",
                category: RecreationCategory.Pool,
                hours: "9:00 AM - 9:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "movie-nights",
                name: "Movies Under the Stars",
                description: "Outdoor Disney movies shown on the beach",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "torches",
                name: "Torch Lighting Ceremony",
                description: "Traditional torch lighting ceremony with storytelling and music",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "motorized-rentals",
                name: "Motorized Boat Rentals",
                description: "Rent motorized boats to explore Seven Seas Lagoon",
                category: RecreationCategory.Water,
                hours: "10:00 AM - 5:00 PM",
                additionalFee: true,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Monorail,
                destinationsServed: ["Magic Kingdom", "Transportation and Ticket Center", "Disney's Grand Floridian Resort & Spa", "Disney's Contemporary Resort"],
                frequency: "Every 4-7 minutes",
                hours: "6:30 AM - 12:00 AM"
            },
            {
                type: TransportationType.Boat,
                destinationsServed: ["Magic Kingdom", "Disney's Grand Floridian Resort & Spa", "Disney's Wilderness Lodge", "Disney's Fort Wilderness Resort & Campground"],
                frequency: "Every 15-20 minutes",
                hours: "8:30 AM - 11:00 PM"
            },
            {
                type: TransportationType.Walking,
                destinationsServed: ["Transportation and Ticket Center"],
                frequency: "Anytime",
                hours: "24 hours"
            },
            {
                type: TransportationType.Bus,
                destinationsServed: ["Disney's Hollywood Studios", "Disney's Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "Disney's Polynesian Village Resort captures the essence of the South Pacific islands through its architecture, landscaping, and cultural touches. The Great Ceremonial House serves as the resort's central hub, designed after a royal Tahitian assembly lodge with a soaring thatched roof. Throughout the resort, you'll find authentic details like tiki statues, bamboo accents, and lush tropical vegetation including banana trees, palms, and hibiscus. The longhouses (guest buildings) are named after Polynesian islands such as Hawaii, Samoa, and Fiji, each with distinctive cultural elements from those regions. The resort's color palette features warm earth tones, rich woods, and vibrant tropical colors that evoke the spirit of island life.",
        openingDate: "October 1, 1971",
        lastRefurbished: "2021",
        imageUrls: {
            main: "/images/resorts/polynesian-main.jpg",
            gallery: [
                "/images/resorts/polynesian-lobby.jpg",
                "/images/resorts/polynesian-exterior.jpg",
                "/images/resorts/polynesian-beach.jpg",
                "/images/resorts/polynesian-pool.jpg",
                "/images/resorts/polynesian-bungalows.jpg"
            ],
            rooms: {
                "standard-room": [
                    "/images/resorts/polynesian-standard-1.jpg",
                    "/images/resorts/polynesian-standard-2.jpg"
                ],
                "club-level": [
                    "/images/resorts/polynesian-club-1.jpg",
                    "/images/resorts/polynesian-club-2.jpg"
                ],
                "bungalow": [
                    "/images/resorts/polynesian-bungalow-1.jpg",
                    "/images/resorts/polynesian-bungalow-2.jpg"
                ]
            },
            dining: {
                "ohana": [
                    "/images/resorts/polynesian-ohana-1.jpg",
                    "/images/resorts/polynesian-ohana-2.jpg"
                ],
                "trader-sams": [
                    "/images/resorts/polynesian-trader-sams-1.jpg",
                    "/images/resorts/polynesian-trader-sams-2.jpg"
                ]
            },
            amenities: {
                "lava-pool": [
                    "/images/resorts/polynesian-lava-pool-1.jpg",
                    "/images/resorts/polynesian-lava-pool-2.jpg"
                ],
                "beach-hammocks": [
                    "/images/resorts/polynesian-beach-1.jpg",
                    "/images/resorts/polynesian-beach-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 599, high: 3599 }
        },
        address: "1600 Seven Seas Drive, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 824-2000",
        nearbyAttractions: [
            "Magic Kingdom Park",
            "Seven Seas Lagoon",
            "Transportation and Ticket Center",
            "Disney's Grand Floridian Resort & Spa",
            "Disney's Contemporary Resort"
        ],
        featuredExperiences: [
            "Spirit of Aloha Dinner Show",
            "Electrical Water Pageant viewing",
            "Magic Kingdom fireworks viewing from the beach",
            "Trader Sam's Grog Grotto interactive tiki bar",
            "Torch lighting ceremony"
        ],
        specialConsiderations: [
            "One of the original Walt Disney World resorts with a strong fan following",
            "Direct monorail access to Magic Kingdom makes it convenient for families",
            "The beach area provides excellent views of Magic Kingdom fireworks"
        ]
    },
    {
        id: "contemporary-resort",
        name: "Disney's Contemporary Resort",
        category: ResortCategory.Deluxe,
        description: "An iconic modern marvel featuring the monorail running through its A-frame tower, offering spectacular views of Magic Kingdom and Bay Lake.",
        longDescription: "Step into the future at Disney's Contemporary Resort, an architectural marvel that has become an iconic symbol of Walt Disney World since its opening in 1971. This landmark resort features the distinctive A-frame Grand Canyon Concourse where the monorail glides directly through the heart of the building—a visionary design that continues to inspire awe. The resort combines sleek, modern aesthetics with bold artistic elements, including the massive 90-foot-tall mural by Disney Legend Mary Blair that celebrates the Grand Canyon and the American Southwest. Floor-to-ceiling windows throughout the resort offer breathtaking panoramic views of Magic Kingdom Park, Seven Seas Lagoon, and Bay Lake. The Contemporary's convenient location makes it possible to walk to Magic Kingdom Park, while its ultra-modern amenities and dining options provide sophisticated comfort. As one of Walt Disney World's original resorts, the Contemporary delivers a perfect blend of nostalgic Disney heritage and contemporary luxury.",
        amenities: [
            {
                id: "feature-pool",
                name: "Feature Pool",
                description: "Zero-entry pool with a 17-foot waterslide surrounded by palm trees and sandy beach area",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "bay-lake-pool",
                name: "Bay Lake Pool",
                description: "Quiet pool offering a more relaxed swimming environment with views of Bay Lake",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "contemporary-fitness",
                name: "Contemporary Fitness Center",
                description: "24-hour fitness center with state-of-the-art equipment and floor-to-ceiling windows",
                icon: "fitness",
                category: AmenityCategory.Fitness
            },
            {
                id: "pixar-play-zone",
                name: "Pixar Play Zone",
                description: "Supervised children's activity center with Pixar-themed games and activities",
                icon: "kids",
                category: AmenityCategory.Service
            },
            {
                id: "marina-rentals-contemporary",
                name: "Contemporary Marina",
                description: "Watercraft rentals and specialty cruises on Bay Lake",
                icon: "boat",
                category: AmenityCategory.Recreation
            },
            {
                id: "tennis-basketball",
                name: "Tennis & Basketball Courts",
                description: "Lighted courts for sports activities",
                icon: "sports",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-tower",
                name: "Tower Room",
                description: "Modern accommodations in the iconic A-frame tower with contemporary furnishings",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 437,
                views: ["Garden View", "Bay Lake View", "Theme Park View"],
                priceRange: { low: 639, high: 849 },
                amenities: ["Balcony", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "garden-wing",
                name: "Garden Wing Room",
                description: "Comfortable accommodations in the resort's garden wing with modern décor",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 394,
                views: ["Garden View", "Parking Area View"],
                priceRange: { low: 549, high: 729 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "club-level-tower",
                name: "Club Level Tower Room",
                description: "Tower room with access to the exclusive Atrium Club concierge lounge",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 437,
                views: ["Theme Park View", "Bay Lake View"],
                priceRange: { low: 939, high: 1239 },
                amenities: ["Balcony", "Mini Refrigerator", "Coffee Maker", "Turndown Service", "Concierge Services", "Access to Club Lounge with Food & Beverages"]
            }
        ],
        location: {
            latitude: 28.4156,
            longitude: -81.5812,
            area: ResortArea.MagicKingdom,
            distanceToParks: {
                "Magic Kingdom": 0.6,
                "Epcot": 3.0,
                "Hollywood Studios": 4.7,
                "Animal Kingdom": 6.3,
                "Disney Springs": 4.5
            }
        },
        dining: [
            {
                id: "california-grill",
                name: "California Grill",
                description: "Signature dining experience offering California-inspired cuisine with panoramic views from the 15th floor",
                category: DiningCategory.Signature,
                cuisine: ["American", "California", "Sushi"],
                priceRange: 3,
                requiresReservation: true,
                hours: "5:00 PM - 10:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "chef-mickeys",
                name: "Chef Mickey's",
                description: "Character dining experience featuring the Fab Five in a lively, contemporary setting",
                category: DiningCategory.CharacterDining,
                cuisine: ["American", "Buffet"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:00 AM - 12:00 PM, 5:00 PM - 9:30 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "steakhouse-71",
                name: "Steakhouse 71",
                description: "Modern steakhouse inspired by the resort's opening year, serving breakfast, lunch, and dinner",
                category: DiningCategory.TableService,
                cuisine: ["American", "Steakhouse"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:30 AM - 11:00 AM, 11:30 AM - 2:00 PM, 5:00 PM - 10:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "contempo-cafe",
                name: "Contempo Cafe",
                description: "Quick-service restaurant in the Grand Canyon Concourse",
                category: DiningCategory.QuickService,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "6:00 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "contemporary-pools",
                name: "Feature Pool and Water Play Area",
                description: "Main pool complex with a 17-foot waterslide and interactive water play area",
                category: RecreationCategory.Pool,
                hours: "7:00 AM - 11:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "contemporary-fireworks",
                name: "Fireworks Viewing",
                description: "Premium viewing of Magic Kingdom fireworks from the observation deck",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "pirate-adventure",
                name: "Pirates and Pals Fireworks Voyage",
                description: "Character-filled cruise with snacks and premium fireworks viewing",
                category: RecreationCategory.Water,
                hours: "Check for cruise times",
                additionalFee: true,
                reservationRequired: true
            },
            {
                id: "motorized-rentals-contemporary",
                name: "Motorized Boat Rentals",
                description: "Rent motorized boats to explore Bay Lake",
                category: RecreationCategory.Water,
                hours: "10:00 AM - 5:00 PM",
                additionalFee: true,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Monorail,
                destinationsServed: ["Magic Kingdom", "Transportation and Ticket Center", "Disney's Grand Floridian Resort & Spa", "Disney's Polynesian Village Resort"],
                frequency: "Every 4-7 minutes",
                hours: "6:30 AM - 12:00 AM"
            },
            {
                type: TransportationType.Boat,
                destinationsServed: ["Magic Kingdom", "Disney's Wilderness Lodge", "Disney's Fort Wilderness Resort & Campground"],
                frequency: "Every 15-20 minutes",
                hours: "8:30 AM - 11:00 PM"
            },
            {
                type: TransportationType.Walking,
                destinationsServed: ["Magic Kingdom"],
                frequency: "Anytime",
                hours: "24 hours"
            },
            {
                type: TransportationType.Bus,
                destinationsServed: ["Disney's Hollywood Studios", "Disney's Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "Disney's Contemporary Resort is a modernist masterpiece that has become an iconic symbol of Walt Disney World. The striking A-frame tower design, with the monorail running through it, was revolutionary when the resort opened in 1971. The architectural style embraces mid-century modern aesthetics with clean lines, open spaces, and floor-to-ceiling windows that maximize natural light and views. The Grand Canyon Concourse is dominated by the 90-foot-tall ceramic mural created by Disney Legend Mary Blair, featuring stylized imagery of the Grand Canyon and the Southwest in her distinctive artistic style. The resort's interior design has been updated over the years while maintaining its futuristic spirit, with a color palette of whites, blues, and warm neutrals complemented by pops of vibrant color in the artwork and furnishings.",
        openingDate: "October 1, 1971",
        lastRefurbished: "2021",
        imageUrls: {
            main: "/images/resorts/contemporary-main.jpg",
            gallery: [
                "/images/resorts/contemporary-lobby.jpg",
                "/images/resorts/contemporary-exterior.jpg",
                "/images/resorts/contemporary-concourse.jpg",
                "/images/resorts/contemporary-pool.jpg",
                "/images/resorts/contemporary-mural.jpg"
            ],
            rooms: {
                "standard-tower": [
                    "/images/resorts/contemporary-tower-1.jpg",
                    "/images/resorts/contemporary-tower-2.jpg"
                ],
                "garden-wing": [
                    "/images/resorts/contemporary-garden-1.jpg",
                    "/images/resorts/contemporary-garden-2.jpg"
                ],
                "club-level-tower": [
                    "/images/resorts/contemporary-club-1.jpg",
                    "/images/resorts/contemporary-club-2.jpg"
                ]
            },
            dining: {
                "california-grill": [
                    "/images/resorts/contemporary-california-1.jpg",
                    "/images/resorts/contemporary-california-2.jpg"
                ],
                "chef-mickeys": [
                    "/images/resorts/contemporary-chef-1.jpg",
                    "/images/resorts/contemporary-chef-2.jpg"
                ]
            },
            amenities: {
                "feature-pool": [
                    "/images/resorts/contemporary-pool-1.jpg",
                    "/images/resorts/contemporary-pool-2.jpg"
                ],
                "marina-rentals-contemporary": [
                    "/images/resorts/contemporary-marina-1.jpg",
                    "/images/resorts/contemporary-marina-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 549, high: 1239 }
        },
        address: "4600 North World Drive, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 824-1000",
        nearbyAttractions: [
            "Magic Kingdom Park",
            "Seven Seas Lagoon",
            "Bay Lake",
            "Disney's Polynesian Village Resort",
            "Disney's Grand Floridian Resort & Spa"
        ],
        featuredExperiences: [
            "California Grill fireworks dining experience",
            "Character dining at Chef Mickey's",
            "Electrical Water Pageant viewing",
            "Specialty cruises from the marina",
            "Walking path to Magic Kingdom"
        ],
        specialConsiderations: [
            "One of the original Walt Disney World resorts with direct monorail access to Magic Kingdom",
            "The only resort with a walking path to Magic Kingdom Park",
            "California Grill offers one of the best views of Magic Kingdom fireworks"
        ]
    },
    {
        id: "wilderness-lodge",
        name: "Disney's Wilderness Lodge",
        category: ResortCategory.Deluxe,
        description: "A majestic mountain lodge inspired by America's Great Northwest national park lodges, featuring towering pines, bubbling springs, and rustic elegance.",
        longDescription: "Escape to the rustic majesty of America's Great Northwest at Disney's Wilderness Lodge. This magnificent resort hotel celebrates the grandeur of the great outdoors through its breathtaking architecture, meticulously crafted details, and immersive wilderness theming. Inspired by historic National Park lodges from the early 20th century, the resort features an 82-foot-tall stone fireplace in its awe-inspiring lobby, verdant pine forests, and a dramatic waterfall that flows into a bubbling hot spring before cascading into the resort's feature pool. Authentic Native American artifacts and art, intricately carved totem poles, and carefully chosen music create an atmosphere of serene wilderness beauty. Despite its secluded ambiance, the resort offers convenient boat transportation to Magic Kingdom Park and modern amenities that ensure a comfortable stay. Disney's Wilderness Lodge masterfully balances the romance of a distant mountain retreat with the enchantment of the Disney experience.",
        amenities: [
            {
                id: "copper-creek-springs-pool",
                name: "Copper Creek Springs Pool",
                description: "Feature pool with a 67-foot waterslide, hot and cold whirlpool spas, and a children's play area",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "boulder-ridge-cove-pool",
                name: "Boulder Ridge Cove Pool",
                description: "Zero-depth entry pool with a whirlpool spa and shaded seating areas",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "sturdy-branches-health-club",
                name: "Sturdy Branches Health Club",
                description: "Fully equipped fitness center with cardio equipment and free weights",
                icon: "fitness",
                category: AmenityCategory.Fitness
            },
            {
                id: "wilderness-arcade",
                name: "Wilderness Arcade",
                description: "Video and redemption games for guests of all ages",
                icon: "games",
                category: AmenityCategory.Recreation
            },
            {
                id: "bike-rentals",
                name: "Bike Rentals",
                description: "Bicycles available for exploring the resort and surrounding areas",
                icon: "bike",
                category: AmenityCategory.Recreation
            },
            {
                id: "wilderness-marina",
                name: "Wilderness Marina",
                description: "Boat rentals for exploring Bay Lake",
                icon: "boat",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room",
                name: "Standard Room",
                description: "Comfortable accommodations with rustic, wilderness-inspired décor",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 340,
                views: ["Standard View", "Courtyard View", "Nature View", "Pool View"],
                priceRange: { low: 399, high: 699 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "courtyard-view",
                name: "Courtyard View Room",
                description: "Room with views of the resort's picturesque courtyard areas",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 340,
                views: ["Courtyard View"],
                priceRange: { low: 429, high: 729 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "club-level",
                name: "Club Level Room",
                description: "Enhanced accommodations with access to the exclusive Old Faithful Club concierge lounge",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 340,
                views: ["Standard View", "Courtyard View", "Nature View"],
                priceRange: { low: 599, high: 899 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Turndown Service", "Concierge Services", "Access to Club Lounge with Food & Beverages"]
            }
        ],
        location: {
            latitude: 28.4109,
            longitude: -81.5723,
            area: ResortArea.MagicKingdom,
            distanceToParks: {
                "Magic Kingdom": 1.2,
                "Epcot": 4.0,
                "Hollywood Studios": 5.5,
                "Animal Kingdom": 7.1,
                "Disney Springs": 5.0
            }
        },
        dining: [
            {
                id: "artist-point",
                name: "Story Book Dining at Artist Point",
                description: "Character dining experience featuring Snow White and the Seven Dwarfs in an enchanted forest setting",
                category: DiningCategory.CharacterDining,
                cuisine: ["American", "Pacific Northwest"],
                priceRange: 3,
                requiresReservation: true,
                hours: "4:00 PM - 9:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "whispering-canyon-cafe",
                name: "Whispering Canyon Cafe",
                description: "Family-friendly dining with western flair and playful antics by the serving staff",
                category: DiningCategory.TableService,
                cuisine: ["American", "Barbecue"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:30 AM - 10:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "geyser-point",
                name: "Geyser Point Bar & Grill",
                description: "Outdoor lounge and quick-service restaurant with views of Bay Lake",
                category: DiningCategory.TableService,
                cuisine: ["American", "Pacific Northwest"],
                priceRange: 2,
                requiresReservation: false,
                hours: "7:00 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "roaring-fork",
                name: "Roaring Fork",
                description: "Quick-service restaurant offering American favorites for breakfast, lunch, and dinner",
                category: DiningCategory.QuickService,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "6:00 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "pools-wilderness",
                name: "Pools and Hot Tubs",
                description: "Two themed pools with hot tubs and a children's water play area",
                category: RecreationCategory.Pool,
                hours: "7:00 AM - 11:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "fire-rock-geyser",
                name: "Fire Rock Geyser",
                description: "Spectacular 120-foot geyser that erupts hourly",
                category: RecreationCategory.Entertainment,
                hours: "7:00 AM - 10:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "campfire-wilderness",
                name: "Wilderness Campfire",
                description: "Evening campfire with marshmallow roasting and storytelling",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "wilderness-rentals",
                name: "Boat Rentals",
                description: "Rent various watercraft to explore Bay Lake",
                category: RecreationCategory.Water,
                hours: "10:00 AM - 5:00 PM",
                additionalFee: true,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Boat,
                destinationsServed: ["Magic Kingdom", "Disney's Fort Wilderness Resort & Campground", "Disney's Contemporary Resort"],
                frequency: "Every 15-20 minutes",
                hours: "8:30 AM - 11:00 PM"
            },
            {
                type: TransportationType.Bus,
                destinationsServed: ["Epcot", "Disney's Hollywood Studios", "Disney's Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "Disney's Wilderness Lodge is inspired by the grand lodges of America's National Parks, particularly the Old Faithful Inn at Yellowstone National Park. The resort showcases rustic architecture with massive timber columns, dormer windows, and a multi-story lobby featuring an 82-foot-tall stone fireplace. The natural color palette includes rich browns, forest greens, and rustic reds, complemented by Native American-inspired patterns in the textiles and artwork. Throughout the resort, there are authentic artifacts and art pieces from various Indigenous cultures of the Pacific Northwest. The outdoor areas feature lush pine forests, bubbling springs, and a dramatic waterfall that begins in the lobby and flows outside to the feature pool, creating a seamless connection between indoor and outdoor spaces.",
        openingDate: "May 28, 1994",
        lastRefurbished: "2021",
        imageUrls: {
            main: "/images/resorts/wilderness-lodge-main.jpg",
            gallery: [
                "/images/resorts/wilderness-lodge-lobby.jpg",
                "/images/resorts/wilderness-lodge-exterior.jpg",
                "/images/resorts/wilderness-lodge-waterfall.jpg",
                "/images/resorts/wilderness-lodge-pool.jpg",
                "/images/resorts/wilderness-lodge-fireplace.jpg"
            ],
            rooms: {
                "standard-room": [
                    "/images/resorts/wilderness-lodge-standard-1.jpg",
                    "/images/resorts/wilderness-lodge-standard-2.jpg"
                ],
                "courtyard-view": [
                    "/images/resorts/wilderness-lodge-courtyard-1.jpg",
                    "/images/resorts/wilderness-lodge-courtyard-2.jpg"
                ],
                "club-level": [
                    "/images/resorts/wilderness-lodge-club-1.jpg",
                    "/images/resorts/wilderness-lodge-club-2.jpg"
                ]
            },
            dining: {
                "artist-point": [
                    "/images/resorts/wilderness-lodge-artist-point-1.jpg",
                    "/images/resorts/wilderness-lodge-artist-point-2.jpg"
                ],
                "whispering-canyon-cafe": [
                    "/images/resorts/wilderness-lodge-whispering-canyon-1.jpg",
                    "/images/resorts/wilderness-lodge-whispering-canyon-2.jpg"
                ]
            },
            amenities: {
                "copper-creek-springs-pool": [
                    "/images/resorts/wilderness-lodge-copper-creek-pool-1.jpg",
                    "/images/resorts/wilderness-lodge-copper-creek-pool-2.jpg"
                ],
                "fire-rock-geyser": [
                    "/images/resorts/wilderness-lodge-geyser-1.jpg",
                    "/images/resorts/wilderness-lodge-geyser-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 399, high: 899 }
        },
        address: "901 Timberline Drive, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 824-3200",
        nearbyAttractions: [
            "Magic Kingdom Park",
            "Bay Lake",
            "Disney's Fort Wilderness Resort & Campground",
            "Disney's Contemporary Resort",
            "The Wilderness Back Trail Adventure"
        ],
        featuredExperiences: [
            "Story Book Dining at Artist Point with Snow White",
            "Fire Rock Geyser eruptions",
            "Electrical Water Pageant viewing",
            "Whispering Canyon Cafe's lively dining atmosphere",
            "Wilderness Lodge Mercantile shop"
        ],
        specialConsiderations: [
            "One of the more secluded Deluxe resorts, offering a peaceful atmosphere",
            "Boat transportation to Magic Kingdom provides a scenic and relaxing journey",
            "The resort can be extensive to navigate, so request a room location based on your preferences"
        ]
    },
    {
        id: "yacht-club",
        name: "Disney's Yacht Club Resort",
        category: ResortCategory.Deluxe,
        description: "A luxurious New England-style yacht club from the late 1800s featuring nautical details, marina views, and exceptional dining options.",
        longDescription: "Disney's Yacht Club Resort invites you to experience the refined elegance of a New England-style yacht club from the late 1800s. This deluxe resort embraces a nautical theme with its slate-blue roofs, white wooden trim, and marina setting along the shores of Crescent Lake. The stately lobby features rich dark wood, brass accents, and maritime details that evoke the ambiance of a prestigious harbor club. Beyond its sophisticated theming, the resort offers exceptional amenities, including access to Stormalong Bay—a 3-acre water wonderland featuring a life-sized shipwreck, one of the highest hotel waterslides at Walt Disney World, and the only sand-bottom pool on property. With its convenient location within walking distance of Epcot and a short boat ride to Disney's Hollywood Studios, the Yacht Club provides the perfect blend of luxury, recreation, and accessibility for an unforgettable Disney vacation.",
        amenities: [
            {
                id: "stormalong-bay",
                name: "Stormalong Bay",
                description: "3-acre water wonderland featuring a sand-bottom pool, 230-foot waterslide, and lazy river",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "admiral-pool",
                name: "Admiral Pool",
                description: "Quiet pool offering a more relaxed swimming environment",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "ship-shape-health-club",
                name: "Ship Shape Health Club",
                description: "24-hour fitness center with cardiovascular equipment and free weights",
                icon: "fitness",
                category: AmenityCategory.Fitness
            },
            {
                id: "lafferty-place-arcade",
                name: "Lafferty Place Arcade",
                description: "Game room featuring classic and modern video games",
                icon: "games",
                category: AmenityCategory.Recreation
            },
            {
                id: "fantasia-gardens",
                name: "Fantasia Gardens Miniature Golf",
                description: "Themed miniature golf course located near the resort",
                icon: "golf",
                category: AmenityCategory.Recreation
            },
            {
                id: "yacht-club-marina",
                name: "Yacht Club Marina",
                description: "Watercraft rentals and fishing excursions",
                icon: "boat",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room",
                name: "Standard Room",
                description: "Elegant accommodations with nautical-inspired décor",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 381,
                views: ["Garden View", "Lagoon View", "Water View"],
                priceRange: { low: 489, high: 689 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "water-view",
                name: "Water View Room",
                description: "Room with views of Crescent Lake or Stormalong Bay",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 381,
                views: ["Water View"],
                priceRange: { low: 539, high: 739 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "club-level",
                name: "Club Level Room",
                description: "Premium accommodations with access to the exclusive Regatta Club concierge lounge",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 381,
                views: ["Garden View", "Lagoon View", "Water View"],
                priceRange: { low: 689, high: 889 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Turndown Service", "Concierge Services", "Access to Club Lounge with Food & Beverages"]
            }
        ],
        location: {
            latitude: 28.3722,
            longitude: -81.5582,
            area: ResortArea.Epcot,
            distanceToParks: {
                "Magic Kingdom": 3.5,
                "Epcot": 0.2,
                "Hollywood Studios": 1.2,
                "Animal Kingdom": 4.8,
                "Disney Springs": 2.9
            }
        },
        dining: [
            {
                id: "yachtsman-steakhouse",
                name: "Yachtsman Steakhouse",
                description: "Signature dining experience featuring premium steaks and fresh seafood",
                category: DiningCategory.Signature,
                cuisine: ["Steakhouse", "American"],
                priceRange: 3,
                requiresReservation: true,
                hours: "5:00 PM - 9:30 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "ale-and-compass",
                name: "Ale & Compass Restaurant",
                description: "Casual table-service restaurant serving New England-inspired comfort food",
                category: DiningCategory.TableService,
                cuisine: ["American", "New England"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:30 AM - 11:00 AM, 5:00 PM - 9:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "crew-cup-lounge",
                name: "Crew's Cup Lounge",
                description: "Nautical-themed lounge serving drinks and light fare",
                category: DiningCategory.Lounge,
                cuisine: ["American"],
                priceRange: 2,
                requiresReservation: false,
                hours: "4:00 PM - 11:00 PM",
                diningPlans: []
            },
            {
                id: "ale-and-compass-lounge",
                name: "Ale & Compass Lounge",
                description: "Cozy lounge serving drinks and light bites",
                category: DiningCategory.Lounge,
                cuisine: ["American"],
                priceRange: 2,
                requiresReservation: false,
                hours: "7:00 AM - 11:00 PM",
                diningPlans: []
            },
            {
                id: "market-at-ale-and-compass",
                name: "The Market at Ale & Compass",
                description: "Quick-service market offering grab-and-go items and beverages",
                category: DiningCategory.QuickService,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "6:30 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "yacht-stormalong-bay",
                name: "Stormalong Bay",
                description: "3-acre water complex with a sand-bottom pool, lazy river, and 230-foot waterslide",
                category: RecreationCategory.Pool,
                hours: "9:00 AM - 9:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "yacht-volleyball",
                name: "Volleyball Court",
                description: "White sand volleyball court on Crescent Beach",
                category: RecreationCategory.Outdoor,
                hours: "8:00 AM - Dusk",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "yacht-movies",
                name: "Movies Under the Stars",
                description: "Outdoor film screenings on the beach",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "yacht-boat-rentals",
                name: "Watercraft Rentals",
                description: "Rent various boats to explore Crescent Lake",
                category: RecreationCategory.Water,
                hours: "10:00 AM - 5:00 PM",
                additionalFee: true,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Walking,
                destinationsServed: ["Epcot", "Disney's BoardWalk", "Disney's Beach Club Resort"],
                frequency: "Anytime",
                hours: "24 hours"
            },
            {
                type: TransportationType.Boat,
                destinationsServed: ["Epcot", "Disney's Hollywood Studios", "Disney's BoardWalk", "Disney's Beach Club Resort"],
                frequency: "Every 15-20 minutes",
                hours: "10:30 AM - 11:00 PM"
            },
            {
                type: TransportationType.Skyliner,
                destinationsServed: ["Epcot", "Disney's Hollywood Studios", "Disney's Caribbean Beach Resort", "Disney's Riviera Resort", "Disney's Pop Century Resort", "Disney's Art of Animation Resort"],
                frequency: "Continuous",
                hours: "7:30 AM - 10:30 PM"
            },
            {
                type: TransportationType.Bus,
                destinationsServed: ["Magic Kingdom", "Disney's Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "Disney's Yacht Club Resort captures the essence of a luxurious New England yacht club from the late 1800s. The resort features a stately gray and white exterior with nautical blue accents, dormers, and cupolas. Inside, the lobby showcases rich dark woods, brass fixtures, leather furniture, and maritime artifacts including ship models, nautical instruments, and maps. The color palette consists of navy blues, crisp whites, warm woods, and subtle gold accents throughout. Guest rooms continue the sophisticated nautical theme with tailored furnishings, maritime artwork, and elegant fixtures. The attention to detail extends to the perfectly manicured gardens and the lighthouse that stands as a beacon on Crescent Lake, completing the upscale harbor setting.",
        openingDate: "November 5, 1990",
        lastRefurbished: "2017",
        imageUrls: {
            main: "/images/resorts/yacht-club-main.jpg",
            gallery: [
                "/images/resorts/yacht-club-lobby.jpg",
                "/images/resorts/yacht-club-exterior.jpg",
                "/images/resorts/yacht-club-stormalong-bay.jpg",
                "/images/resorts/yacht-club-lighthouse.jpg",
                "/images/resorts/yacht-club-boardwalk.jpg"
            ],
            rooms: {
                "standard-room": [
                    "/images/resorts/yacht-club-standard-1.jpg",
                    "/images/resorts/yacht-club-standard-2.jpg"
                ],
                "water-view": [
                    "/images/resorts/yacht-club-water-view-1.jpg",
                    "/images/resorts/yacht-club-water-view-2.jpg"
                ],
                "club-level": [
                    "/images/resorts/yacht-club-club-1.jpg",
                    "/images/resorts/yacht-club-club-2.jpg"
                ]
            },
            dining: {
                "yachtsman-steakhouse": [
                    "/images/resorts/yacht-club-yachtsman-1.jpg",
                    "/images/resorts/yacht-club-yachtsman-2.jpg"
                ],
                "ale-and-compass": [
                    "/images/resorts/yacht-club-ale-compass-1.jpg",
                    "/images/resorts/yacht-club-ale-compass-2.jpg"
                ]
            },
            amenities: {
                "stormalong-bay": [
                    "/images/resorts/yacht-club-stormalong-1.jpg",
                    "/images/resorts/yacht-club-stormalong-2.jpg"
                ],
                "yacht-club-marina": [
                    "/images/resorts/yacht-club-marina-1.jpg",
                    "/images/resorts/yacht-club-marina-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 489, high: 889 }
        },
        address: "1700 Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 934-7000",
        nearbyAttractions: [
            "Epcot",
            "Disney's Hollywood Studios",
            "Disney's BoardWalk",
            "Fantasia Gardens Miniature Golf",
            "Crescent Lake"
        ],
        featuredExperiences: [
            "Stormalong Bay water complex",
            "Signature dining at Yachtsman Steakhouse",
            "Walking path to Epcot's International Gateway entrance",
            "Friendship boat service to Epcot and Disney's Hollywood Studios",
            "Access to the vibrant BoardWalk entertainment district"
        ],
        specialConsiderations: [
            "Shares amenities with the adjacent Beach Club Resort, including Stormalong Bay",
            "One of the closest resorts to Epcot, making it ideal for guests planning to spend time at the World Showcase",
            "More formal and adult-oriented atmosphere compared to other Disney resorts"
        ]
    },
    {
        id: "beach-club",
        name: "Disney's Beach Club Resort",
        category: ResortCategory.Deluxe,
        description: "A casual, beach-themed resort inspired by the mid-Atlantic seashore of the early 20th century, featuring the exceptional Stormalong Bay pool complex.",
        longDescription: "Disney's Beach Club Resort captures the laid-back charm of a New England seaside retreat from the early 1900s. This deluxe resort welcomes guests with its distinctive pale blue and white clapboard exterior, complete with porches and balconies perfect for enjoying the coastal atmosphere. The airy, sand-colored lobby features wicker furniture, seaside accents, and maritime details that evoke the feeling of a grand beach cottage. The resort's crowning jewel is Stormalong Bay, a 3-acre water paradise shared with the adjacent Yacht Club Resort, featuring a sand-bottom pool, a 230-foot waterslide built into a life-sized shipwreck, and a lazy river. With its prime location along Crescent Lake, the Beach Club offers walking access to Epcot's International Gateway entrance and convenient boat transportation to Disney's Hollywood Studios. Combining relaxed beachside ambiance with sophisticated amenities and exceptional dining options, the Beach Club creates a refreshing retreat within the magic of Walt Disney World.",
        amenities: [
            {
                id: "beach-stormalong-bay",
                name: "Stormalong Bay",
                description: "3-acre water wonderland featuring a sand-bottom pool, 230-foot waterslide, and lazy river",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "tidal-pool",
                name: "Tidal Pool",
                description: "Quiet pool offering a more relaxed swimming environment",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "ship-shape-health-club-beach",
                name: "Ship Shape Health Club",
                description: "24-hour fitness center with cardiovascular equipment and free weights",
                icon: "fitness",
                category: AmenityCategory.Fitness
            },
            {
                id: "beach-club-arcade",
                name: "Beaches & Cream Soda Shop Arcade",
                description: "Game room featuring classic and modern video games",
                icon: "games",
                category: AmenityCategory.Recreation
            },
            {
                id: "beach-club-campfire",
                name: "Campfire Activities",
                description: "Evening campfire with marshmallow roasting and storytelling",
                icon: "campfire",
                category: AmenityCategory.Recreation
            },
            {
                id: "beach-club-marina",
                name: "Beach Club Marina",
                description: "Watercraft rentals and fishing excursions",
                icon: "boat",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room-beach",
                name: "Standard Room",
                description: "Comfortable accommodations with beach-inspired décor",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 381,
                views: ["Garden View", "Pool View", "Lagoon View"],
                priceRange: { low: 479, high: 679 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "water-view-beach",
                name: "Water View Room",
                description: "Room with views of Crescent Lake or Stormalong Bay",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 381,
                views: ["Water View"],
                priceRange: { low: 529, high: 729 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "club-level-beach",
                name: "Club Level Room",
                description: "Premium accommodations with access to the exclusive Stone Harbor Club concierge lounge",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Day Bed or 1 King Bed and 1 Day Bed",
                squareFeet: 381,
                views: ["Garden View", "Lagoon View", "Water View"],
                priceRange: { low: 679, high: 879 },
                amenities: ["Balcony or Patio", "Mini Refrigerator", "Coffee Maker", "Turndown Service", "Concierge Services", "Access to Club Lounge with Food & Beverages"]
            }
        ],
        location: {
            latitude: 28.3729,
            longitude: -81.5584,
            area: ResortArea.Epcot,
            distanceToParks: {
                "Magic Kingdom": 3.5,
                "Epcot": 0.1,
                "Hollywood Studios": 1.2,
                "Animal Kingdom": 4.8,
                "Disney Springs": 2.9
            }
        },
        dining: [
            {
                id: "beaches-and-cream",
                name: "Beaches & Cream Soda Shop",
                description: "Retro soda shop serving burgers, sandwiches, and elaborate ice cream desserts",
                category: DiningCategory.TableService,
                cuisine: ["American", "Ice Cream"],
                priceRange: 2,
                requiresReservation: true,
                hours: "11:00 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "cape-may-cafe",
                name: "Cape May Cafe",
                description: "New England-style seafood buffet and character breakfast",
                category: DiningCategory.TableService,
                cuisine: ["American", "Seafood"],
                priceRange: 2,
                requiresReservation: true,
                hours: "7:30 AM - 11:00 AM, 5:00 PM - 9:00 PM",
                diningPlans: ["Disney Dining Plan"]
            },
            {
                id: "beach-club-marketplace",
                name: "Beach Club Marketplace",
                description: "Quick-service restaurant and market offering grab-and-go items and made-to-order meals",
                category: DiningCategory.QuickService,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "7:00 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "hurricane-hannas",
                name: "Hurricane Hanna's Waterside Bar & Grill",
                description: "Poolside bar and grill serving sandwiches, salads, and tropical drinks",
                category: DiningCategory.QuickService,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "11:00 AM - 9:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "martha-vineyard-lounge",
                name: "Martha's Vineyard Lounge",
                description: "Casual lounge serving specialty cocktails and light bites",
                category: DiningCategory.Lounge,
                cuisine: ["American"],
                priceRange: 2,
                requiresReservation: false,
                hours: "4:00 PM - 12:00 AM",
                diningPlans: []
            }
        ],
        recreation: [
            {
                id: "beach-stormalong-recreation",
                name: "Stormalong Bay",
                description: "3-acre water complex with a sand-bottom pool, lazy river, and 230-foot waterslide",
                category: RecreationCategory.Pool,
                hours: "9:00 AM - 9:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "beach-volleyball",
                name: "Volleyball Court",
                description: "White sand volleyball court on Crescent Beach",
                category: RecreationCategory.Outdoor,
                hours: "8:00 AM - Dusk",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "beach-movies",
                name: "Movies Under the Stars",
                description: "Outdoor film screenings on the beach",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "beach-boat-rentals",
                name: "Watercraft Rentals",
                description: "Rent various boats to explore Crescent Lake",
                category: RecreationCategory.Water,
                hours: "10:00 AM - 5:00 PM",
                additionalFee: true,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Walking,
                destinationsServed: ["Epcot", "Disney's BoardWalk", "Disney's Yacht Club Resort"],
                frequency: "Anytime",
                hours: "24 hours"
            },
            {
                type: TransportationType.Boat,
                destinationsServed: ["Epcot", "Disney's Hollywood Studios", "Disney's BoardWalk", "Disney's Yacht Club Resort"],
                frequency: "Every 15-20 minutes",
                hours: "10:30 AM - 11:00 PM"
            },
            {
                type: TransportationType.Skyliner,
                destinationsServed: ["Epcot", "Disney's Hollywood Studios", "Disney's Caribbean Beach Resort", "Disney's Riviera Resort", "Disney's Pop Century Resort", "Disney's Art of Animation Resort"],
                frequency: "Continuous",
                hours: "7:30 AM - 10:30 PM"
            },
            {
                type: TransportationType.Bus,
                destinationsServed: ["Magic Kingdom", "Disney's Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "Disney's Beach Club Resort embodies the casual elegance of a New England beach resort from the early 1900s. The exterior features a light blue clapboard facade with white trim and sandy-colored accents. The lobby showcases a bright, airy design with white wicker furniture, pastel colors, and seaside decorations, including miniature carousels, shells, and nautical elements. Guest rooms continue the beach theme with light blue walls, white furniture, and coastal artwork. Throughout the resort, the color palette consists of soft blues, sandy beiges, and crisp whites, evoking the feeling of a day at the shore. The attention to detail extends to the sandy beach area along Crescent Lake and the lighthouse feature that marks the gateway between the Beach Club and its sister resort, the Yacht Club.",
        openingDate: "November 19, 1990",
        lastRefurbished: "2016",
        imageUrls: {
            main: "/images/resorts/beach-club-main.jpg",
            gallery: [
                "/images/resorts/beach-club-lobby.jpg",
                "/images/resorts/beach-club-exterior.jpg",
                "/images/resorts/beach-club-stormalong-bay.jpg",
                "/images/resorts/beach-club-beach.jpg",
                "/images/resorts/beach-club-boardwalk.jpg"
            ],
            rooms: {
                "standard-room-beach": [
                    "/images/resorts/beach-club-standard-1.jpg",
                    "/images/resorts/beach-club-standard-2.jpg"
                ],
                "water-view-beach": [
                    "/images/resorts/beach-club-water-view-1.jpg",
                    "/images/resorts/beach-club-water-view-2.jpg"
                ],
                "club-level-beach": [
                    "/images/resorts/beach-club-club-1.jpg",
                    "/images/resorts/beach-club-club-2.jpg"
                ]
            },
            dining: {
                "beaches-and-cream": [
                    "/images/resorts/beach-club-beaches-cream-1.jpg",
                    "/images/resorts/beach-club-beaches-cream-2.jpg"
                ],
                "cape-may-cafe": [
                    "/images/resorts/beach-club-cape-may-1.jpg",
                    "/images/resorts/beach-club-cape-may-2.jpg"
                ]
            },
            amenities: {
                "beach-stormalong-bay": [
                    "/images/resorts/beach-club-stormalong-1.jpg",
                    "/images/resorts/beach-club-stormalong-2.jpg"
                ],
                "beach-club-marina": [
                    "/images/resorts/beach-club-marina-1.jpg",
                    "/images/resorts/beach-club-marina-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 479, high: 879 }
        },
        address: "1800 Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 934-8000",
        nearbyAttractions: [
            "Epcot",
            "Disney's Hollywood Studios",
            "Disney's BoardWalk",
            "Fantasia Gardens Miniature Golf",
            "Crescent Lake"
        ],
        featuredExperiences: [
            "Stormalong Bay water complex",
            "Character dining at Cape May Cafe",
            "Walking path to Epcot's International Gateway entrance",
            "Friendship boat service to Epcot and Disney's Hollywood Studios",
            "Access to the vibrant BoardWalk entertainment district"
        ],
        specialConsiderations: [
            "Shares amenities with the adjacent Yacht Club Resort, including Stormalong Bay",
            "One of the closest resorts to Epcot, making it ideal for guests planning to spend time at the World Showcase",
            "More relaxed, family-friendly atmosphere compared to the Yacht Club"
        ]
    },
    {
        id: "all-star-movies",
        name: "Disney's All-Star Movies Resort",
        category: ResortCategory.Value,
        description: "A value resort celebrating classic Disney films with larger-than-life icons and family-friendly amenities.",
        longDescription: "Step into the magic of the movies at Disney's All-Star Movies Resort, where beloved Disney films come to life through giant icons and playful theming. Each area of this value resort pays tribute to Disney classics like Toy Story, 101 Dalmatians, Fantasia, The Love Bug, and The Mighty Ducks. The Fantasia-themed pool features a larger-than-life Sorcerer Mickey spouting water, while the Duck Pond Pool offers a quieter swimming experience. With quick-service dining, arcade gaming, and a movie-under-the-stars experience, this resort provides fun and affordable accommodations for families and film enthusiasts. Recently refurbished rooms feature clean, modern designs with clever storage solutions and the Disney touches guests love, all within easy reach of the parks via complimentary bus transportation.",
        amenities: [
            {
                id: "fantasia-pool",
                name: "Fantasia Pool",
                description: "Feature pool with Sorcerer Mickey spouting water and a kiddie pool area",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "duck-pond-pool",
                name: "Duck Pond Pool",
                description: "Quiet pool located in the Mighty Ducks section",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "world-premiere-arcade",
                name: "World Premiere Food Court",
                description: "Quick-service dining with multiple stations serving breakfast, lunch, and dinner",
                icon: "food",
                category: AmenityCategory.Dining
            },
            {
                id: "reel-fun-arcade",
                name: "Reel Fun Arcade",
                description: "Video arcade featuring classic and modern games",
                icon: "games",
                category: AmenityCategory.Recreation
            },
            {
                id: "movies-playground",
                name: "Fantasia Playground",
                description: "Children's playground area",
                icon: "kids",
                category: AmenityCategory.Recreation
            },
            {
                id: "movies-under-stars",
                name: "Movies Under the Stars",
                description: "Outdoor movie screenings featuring Disney films",
                icon: "movie",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room",
                name: "Standard Room",
                description: "Recently refurbished rooms with modern design and efficient use of space",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 260,
                views: ["Standard View", "Preferred View"],
                priceRange: { low: 120, high: 280 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "preferred-room",
                name: "Preferred Room",
                description: "Same amenities as Standard Rooms but located closer to the main building, dining, and transportation",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 260,
                views: ["Preferred View"],
                priceRange: { low: 150, high: 310 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            }
        ],
        location: {
            latitude: 28.3400,
            longitude: -81.5744,
            area: ResortArea.AnimalKingdom,
            distanceToParks: {
                "Magic Kingdom": 6.0,
                "Epcot": 4.2,
                "Hollywood Studios": 3.8,
                "Animal Kingdom": 2.5,
                "Disney Springs": 3.1
            }
        },
        dining: [
            {
                id: "world-premiere",
                name: "World Premiere Food Court",
                description: "Food court with multiple stations serving American favorites for breakfast, lunch, and dinner",
                category: DiningCategory.QuickService,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "6:30 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "silver-screen-spirits",
                name: "Silver Screen Spirits Pool Bar",
                description: "Pool bar serving alcoholic beverages, soft drinks, and light snacks",
                category: DiningCategory.SnackShop,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "12:00 PM - 10:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "fantasia-pool-rec",
                name: "Fantasia Pool",
                description: "Sorcerer Mickey-themed main pool with slide and kiddie pool",
                category: RecreationCategory.Pool,
                hours: "9:00 AM - 10:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "movies-jogging",
                name: "Jogging Trail",
                description: "1-mile jogging path around the resort",
                category: RecreationCategory.Outdoor,
                hours: "Dawn to Dusk",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "movies-arcade",
                name: "Reel Fun Arcade",
                description: "Video arcade featuring classic and modern games",
                category: RecreationCategory.Entertainment,
                hours: "8:00 AM - 11:00 PM",
                additionalFee: true,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Bus,
                destinationsServed: ["Magic Kingdom", "Epcot", "Hollywood Studios", "Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            }
        ],
        themingDetails: "Disney's All-Star Movies Resort celebrates classic Disney films through colorful, larger-than-life icons and immersive theming. The resort is divided into five themed areas: Fantasia, Toy Story, 101 Dalmatians, The Love Bug, and The Mighty Ducks. Each section features enormous statues and set pieces that bring these films to life, such as a 35-foot-tall Buzz Lightyear, giant dalmatian puppies, and massive hockey helmets. The Cinema Hall main building continues the movie theme with film reels, clapboards, and silver screen motifs. The recently refurbished rooms feature a clean, modern design with subtle nods to Mickey Mouse in the artwork and furniture.",
        openingDate: "January 15, 1999",
        lastRefurbished: "2021",
        imageUrls: {
            main: "/images/resorts/all-star-movies-main.jpg",
            gallery: [
                "/images/resorts/all-star-movies-lobby.jpg",
                "/images/resorts/all-star-movies-exterior.jpg",
                "/images/resorts/all-star-movies-pool.jpg",
                "/images/resorts/all-star-movies-toy-story.jpg",
                "/images/resorts/all-star-movies-dalmatians.jpg"
            ],
            rooms: {
                "standard-room": [
                    "/images/resorts/all-star-movies-standard-1.jpg",
                    "/images/resorts/all-star-movies-standard-2.jpg"
                ],
                "preferred-room": [
                    "/images/resorts/all-star-movies-preferred-1.jpg",
                    "/images/resorts/all-star-movies-preferred-2.jpg"
                ]
            },
            dining: {
                "world-premiere": [
                    "/images/resorts/all-star-movies-food-court-1.jpg",
                    "/images/resorts/all-star-movies-food-court-2.jpg"
                ],
                "silver-screen-spirits": [
                    "/images/resorts/all-star-movies-pool-bar-1.jpg",
                    "/images/resorts/all-star-movies-pool-bar-2.jpg"
                ]
            },
            amenities: {
                "fantasia-pool": [
                    "/images/resorts/all-star-movies-fantasia-pool-1.jpg",
                    "/images/resorts/all-star-movies-fantasia-pool-2.jpg"
                ],
                "reel-fun-arcade": [
                    "/images/resorts/all-star-movies-arcade-1.jpg",
                    "/images/resorts/all-star-movies-arcade-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 120, high: 310 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 0, high: 0 }
        },
        address: "1991 Buena Vista Drive, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 939-7000",
        nearbyAttractions: [
            "Disney's Blizzard Beach Water Park",
            "Disney's Winter Summerland Miniature Golf",
            "ESPN Wide World of Sports Complex",
            "Disney's Animal Kingdom Theme Park"
        ],
        featuredExperiences: [
            "Movie-themed photo opportunities with giant film icons",
            "Movies Under the Stars",
            "Recently refurbished modern rooms",
            "Quick access to Blizzard Beach"
        ],
        specialConsiderations: [
            "Most affordable Disney resort option",
            "Can be crowded during peak seasons with large groups",
            "No table service dining options at the resort",
            "Transportation is bus-only, which may mean longer travel times to some parks"
        ]
    },
    {
        id: "port-orleans-riverside",
        name: "Disney's Port Orleans Resort - Riverside",
        category: ResortCategory.Moderate,
        description: "A picturesque resort that captures the charm of the rural Louisiana bayou with stately mansions and rustic lodges along the Sassagoula River.",
        longDescription: "Disney's Port Orleans Resort - Riverside invites you to experience the rustic beauty and genteel elegance of the American South in the 1800s. This sprawling, tranquil retreat is divided into two distinct areas: Magnolia Bend, with its grand, white-columned mansions reminiscent of antebellum plantations; and Alligator Bayou, featuring rustic, backwoods-inspired lodges nestled amid swaying pine trees and lush vegetation. The resort's focal point is the scenic Sassagoula River, which winds through the property, offering peaceful boat transportation to Disney Springs. The grounds feature cobblestone streets, quaint bridges, and the working cotton press-themed main building with a grist mill waterwheel. Every detail, from the romantic pathways ideal for evening strolls to the Southern-inspired cuisine at Boatwright's Dining Hall, captures the essence of Southern hospitality and the charm of rural Louisiana ports that once thrived along the Mississippi.",
        amenities: [
            {
                id: "ol-man-island",
                name: "Ol' Man Island Pool",
                description: "Main pool with a 95-foot water slide, hot tub, and a themed sawmill",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "quiet-pools",
                name: "Quiet Pools",
                description: "Five leisure pools located throughout the resort's grounds",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "medicine-show-arcade",
                name: "Medicine Show Arcade",
                description: "Game room featuring classic and modern video games",
                icon: "games",
                category: AmenityCategory.Recreation
            },
            {
                id: "bike-rentals-riverside",
                name: "Bike Rentals",
                description: "Bicycles available for exploring the resort and surrounding areas",
                icon: "bike",
                category: AmenityCategory.Recreation
            },
            {
                id: "fishing-riverside",
                name: "Fishin' Hole",
                description: "Catch-and-release fishing experience",
                icon: "fishing",
                category: AmenityCategory.Recreation
            },
            {
                id: "carriage-rides",
                name: "Horse-Drawn Carriage Rides",
                description: "Romantic carriage rides along the Sassagoula River",
                icon: "carriage",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room-riverside",
                name: "Standard Room",
                description: "Comfortable accommodations with Southern-inspired décor",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds or 1 King Bed",
                squareFeet: 314,
                views: ["Garden View", "Standard View", "Pool View", "River View"],
                priceRange: { low: 230, high: 390 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "alligator-bayou-room",
                name: "Alligator Bayou Room",
                description: "Rustic, backwoods-themed rooms with a pull-down murphy bed for a fifth guest",
                maxOccupancy: 5,
                bedConfiguration: "2 Queen Beds and 1 Child-Size Pull Down Bed",
                squareFeet: 314,
                views: ["Garden View", "Standard View", "Pool View"],
                priceRange: { low: 240, high: 400 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe", "Pull-Down Bed"]
            },
            {
                id: "royal-guest-room",
                name: "Royal Guest Room",
                description: "Elegantly-themed rooms featuring special touches inspired by Disney princesses",
                maxOccupancy: 4,
                bedConfiguration: "2 Queen Beds",
                squareFeet: 314,
                views: ["Garden View", "Standard View", "Pool View", "River View"],
                priceRange: { low: 290, high: 450 },
                amenities: ["Fiber-Optic Headboard", "Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            }
        ],
        location: {
            latitude: 28.4169,
            longitude: -81.5434,
            area: ResortArea.DisneyStrings,
            distanceToParks: {
                "Magic Kingdom": 4.3,
                "Epcot": 3.2,
                "Hollywood Studios": 3.8,
                "Animal Kingdom": 5.4,
                "Disney Springs": 1.7
            }
        },
        dining: [
            {
                id: "boatwrights",
                name: "Boatwright's Dining Hall",
                description: "Southern-inspired cuisine in a shipyard warehouse setting",
                category: DiningCategory.TableService,
                cuisine: ["American", "Southern", "Cajun/Creole"],
                priceRange: 2,
                requiresReservation: true,
                hours: "5:00 PM - 10:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Deluxe Dining Plan"]
            },
            {
                id: "riverside-mill",
                name: "Riverside Mill Food Court",
                description: "Quick-service dining in a themed riverside mill with multiple food stations",
                category: DiningCategory.QuickService,
                cuisine: ["American", "Italian", "Pizza", "Salads"],
                priceRange: 1,
                requiresReservation: false,
                hours: "6:30 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "river-roost",
                name: "River Roost Lounge",
                description: "Casual lounge featuring entertainment and a full bar",
                category: DiningCategory.Lounge,
                cuisine: ["American"],
                priceRange: 2,
                requiresReservation: false,
                hours: "4:00 PM - 12:00 AM",
                diningPlans: []
            },
            {
                id: "muddy-rivers",
                name: "Muddy Rivers Pool Bar",
                description: "Pool bar serving refreshing beverages and light snacks",
                category: DiningCategory.SnackShop,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "11:00 AM - 7:00 PM (seasonal)",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "ol-man-island-rec",
                name: "Ol' Man Island Pool",
                description: "Feature pool with a 95-foot waterslide and themed sawmill play area",
                category: RecreationCategory.Pool,
                hours: "9:00 AM - 9:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "campfire-riverside",
                name: "Campfire on de Bayou",
                description: "Evening campfire with marshmallow roasting and storytelling",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "movies-riverside",
                name: "Movies Under the Stars",
                description: "Outdoor film screenings near Ol' Man Island",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "fishing-riverside-rec",
                name: "Fishin' Hole",
                description: "Cane pole fishing at the Ol' Man Island fishing hole",
                category: RecreationCategory.Outdoor,
                hours: "7:00 AM - 1:30 PM",
                additionalFee: true,
                reservationRequired: false
            },
            {
                id: "carriage-rides-rec",
                name: "Horse-Drawn Carriage Rides",
                description: "25-minute scenic carriage rides along the Sassagoula River",
                category: RecreationCategory.Outdoor,
                hours: "6:00 PM - 9:30 PM",
                additionalFee: true,
                reservationRequired: true
            }
        ],
        transportation: [
            {
                type: TransportationType.Bus,
                destinationsServed: ["Magic Kingdom", "Epcot", "Hollywood Studios", "Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            },
            {
                type: TransportationType.Boat,
                destinationsServed: ["Disney Springs", "Disney's Port Orleans Resort - French Quarter"],
                frequency: "Every 20 minutes",
                hours: "10:00 AM - 11:00 PM"
            },
            {
                type: TransportationType.Walking,
                destinationsServed: ["Disney's Port Orleans Resort - French Quarter"],
                frequency: "Anytime",
                hours: "24 hours"
            }
        ],
        themingDetails: "Disney's Port Orleans Resort - Riverside captures the essence of the rural Louisiana bayou and the stately grandeur of Southern plantations. The resort is divided into two distinct areas: Magnolia Bend, with its white-columned mansions, formal gardens, and regal fountains; and Alligator Bayou, featuring rustic lodges built from cypress and pine with a more rural, swampy atmosphere. Throughout the resort, lantern-lit pathways wind alongside the scenic Sassagoula River, while the main building features a working cotton press and grist mill waterwheel. The theming extends to the detailed room décor, where Magnolia Bend rooms feature elegant furnishings with floral patterns, while Alligator Bayou rooms showcase rustic wooden furniture made to look hand-hewn with carved animal details.",
        openingDate: "February 2, 1992",
        lastRefurbished: "2022",
        imageUrls: {
            main: "/images/resorts/riverside-main.jpg",
            gallery: [
                "/images/resorts/riverside-lobby.jpg",
                "/images/resorts/riverside-exterior.jpg",
                "/images/resorts/riverside-river.jpg",
                "/images/resorts/riverside-mansion.jpg",
                "/images/resorts/riverside-bayou.jpg"
            ],
            rooms: {
                "standard-room-riverside": [
                    "/images/resorts/riverside-standard-1.jpg",
                    "/images/resorts/riverside-standard-2.jpg"
                ],
                "alligator-bayou-room": [
                    "/images/resorts/riverside-bayou-1.jpg",
                    "/images/resorts/riverside-bayou-2.jpg"
                ],
                "royal-guest-room": [
                    "/images/resorts/riverside-royal-1.jpg",
                    "/images/resorts/riverside-royal-2.jpg"
                ]
            },
            dining: {
                "boatwrights": [
                    "/images/resorts/riverside-boatwrights-1.jpg",
                    "/images/resorts/riverside-boatwrights-2.jpg"
                ],
                "riverside-mill": [
                    "/images/resorts/riverside-mill-1.jpg",
                    "/images/resorts/riverside-mill-2.jpg"
                ]
            },
            amenities: {
                "ol-man-island": [
                    "/images/resorts/riverside-pool-1.jpg",
                    "/images/resorts/riverside-pool-2.jpg"
                ],
                "carriage-rides": [
                    "/images/resorts/riverside-carriage-1.jpg",
                    "/images/resorts/riverside-carriage-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 0, high: 0 },
            moderateRange: { low: 230, high: 450 },
            deluxeRange: { low: 0, high: 0 }
        },
        address: "1251 Riverside Drive, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 934-6000",
        nearbyAttractions: [
            "Disney Springs",
            "Disney's Port Orleans Resort - French Quarter",
            "Disney's Typhoon Lagoon Water Park",
            "Disney's Old Key West Resort",
            "Disney's Saratoga Springs Resort & Spa"
        ],
        featuredExperiences: [
            "Yeehaa Bob Jackson's entertainment at River Roost Lounge",
            "Royal Guest Rooms with magical touches",
            "Scenic boat rides to Disney Springs",
            "Romantic horse-drawn carriage rides",
            "Southern-inspired dining at Boatwright's Dining Hall"
        ],
        specialConsiderations: [
            "Sprawling resort with potentially long walks to main building and transportation",
            "Request Alligator Bayou rooms if traveling with 5 guests",
            "Royal Guest Rooms are located in Oak Manor and Parterre Place buildings",
            "Visit the sister resort, Port Orleans French Quarter, for unique dining options like beignets"
        ]
    },
    {
        id: "pop-century",
        name: "Disney's Pop Century Resort",
        category: ResortCategory.Value,
        description: "A playful value resort celebrating popular culture from the 1950s through the 1990s with giant icons and retro theming.",
        longDescription: "Disney's Pop Century Resort takes guests on a nostalgic journey through the decades with its celebration of fads, catchphrases, toys, and gadgets that defined American pop culture from the 1950s through the 1990s. This value resort features giant, larger-than-life icons throughout its grounds, from a massive Play-Doh container and enormous Rubik's Cube to towering bowling pins and oversized yo-yos. Each section of the resort represents a different decade, with exterior décor and vibrant color schemes that instantly transport guests back in time. The resort's recently renovated rooms offer modern amenities with fun Disney touches, while the resort's central hub, Classic Hall, houses the Everything POP Shopping & Dining complex, where guests can enjoy diverse dining options and purchase decade-themed souvenirs. As one of Disney's most affordable on-property options, Pop Century provides the perfect blend of Disney magic, playful theming, and value for families and pop culture enthusiasts alike.",
        amenities: [
            {
                id: "hippy-dippy-pool",
                name: "Hippy Dippy Pool",
                description: "Flower-shaped main pool located in the 1960s section",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "bowling-pool",
                name: "Bowling Pool",
                description: "Bowling pin-shaped pool in the 1950s section",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "computer-pool",
                name: "Computer Pool",
                description: "Computer-shaped pool in the 1990s section",
                icon: "pool",
                category: AmenityCategory.Pool
            },
            {
                id: "fast-forward-arcade",
                name: "Fast Forward Arcade",
                description: "Arcade featuring classic and modern video games",
                icon: "games",
                category: AmenityCategory.Recreation
            },
            {
                id: "everything-pop",
                name: "Everything POP Shopping & Dining",
                description: "Combined quick-service food court and gift shop",
                icon: "food",
                category: AmenityCategory.Dining
            },
            {
                id: "jogging-trail",
                name: "Jogging Trail",
                description: "1-mile jogging path around Hourglass Lake",
                icon: "trail",
                category: AmenityCategory.Recreation
            }
        ],
        roomTypes: [
            {
                id: "standard-room-pop",
                name: "Standard Room",
                description: "Modern rooms with one queen bed and one queen-size table bed",
                maxOccupancy: 4,
                bedConfiguration: "1 Queen Bed and 1 Queen-Size Table Bed",
                squareFeet: 260,
                views: ["Standard View", "Pool View", "Parking Area View"],
                priceRange: { low: 120, high: 260 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "preferred-room-pop",
                name: "Preferred Room",
                description: "Same amenities as Standard Rooms but located closer to Classic Hall, transportation, and dining",
                maxOccupancy: 4,
                bedConfiguration: "1 Queen Bed and 1 Queen-Size Table Bed",
                squareFeet: 260,
                views: ["Standard View", "Pool View"],
                priceRange: { low: 150, high: 290 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            },
            {
                id: "king-room-pop",
                name: "King Room",
                description: "Room with one king bed instead of the standard configuration",
                maxOccupancy: 2,
                bedConfiguration: "1 King Bed",
                squareFeet: 260,
                views: ["Standard View", "Pool View"],
                priceRange: { low: 120, high: 290 },
                amenities: ["Mini Refrigerator", "Coffee Maker", "Iron & Ironing Board", "Hair Dryer", "In-Room Safe"]
            }
        ],
        location: {
            latitude: 28.3538,
            longitude: -81.5457,
            area: ResortArea.Other,
            distanceToParks: {
                "Magic Kingdom": 5.9,
                "Epcot": 3.2,
                "Hollywood Studios": 2.1,
                "Animal Kingdom": 4.5,
                "Disney Springs": 3.7
            }
        },
        dining: [
            {
                id: "everything-pop-dining",
                name: "Everything POP Shopping & Dining",
                description: "Quick-service food court featuring multiple stations with diverse menu options",
                category: DiningCategory.QuickService,
                cuisine: ["American", "Italian", "Asian", "Salads", "Desserts"],
                priceRange: 1,
                requiresReservation: false,
                hours: "6:30 AM - 11:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            },
            {
                id: "petals-pool-bar",
                name: "Petals Pool Bar",
                description: "Pool bar serving alcoholic beverages, soft drinks, and light snacks",
                category: DiningCategory.SnackShop,
                cuisine: ["American"],
                priceRange: 1,
                requiresReservation: false,
                hours: "12:00 PM - 9:00 PM",
                diningPlans: ["Disney Dining Plan", "Disney Quick-Service Dining Plan"]
            }
        ],
        recreation: [
            {
                id: "hippy-dippy-pool-rec",
                name: "Hippy Dippy Pool",
                description: "Flower-shaped main pool with poolside activities and games",
                category: RecreationCategory.Pool,
                hours: "9:00 AM - 10:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "kiddie-pool",
                name: "Kiddie Pool & Play Area",
                description: "Interactive splash area for young children",
                category: RecreationCategory.Pool,
                hours: "9:00 AM - 10:00 PM",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "movies-pop",
                name: "Movies Under the Stars",
                description: "Outdoor film screenings near the Hippy Dippy Pool",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            },
            {
                id: "campfire-pop",
                name: "Campfire Activities",
                description: "Evening campfire with marshmallow roasting",
                category: RecreationCategory.Entertainment,
                hours: "Check daily times",
                additionalFee: false,
                reservationRequired: false
            }
        ],
        transportation: [
            {
                type: TransportationType.Bus,
                destinationsServed: ["Magic Kingdom", "Animal Kingdom", "Disney Springs", "Water Parks"],
                frequency: "Every 20 minutes",
                hours: "6:30 AM - 2:00 AM"
            },
            {
                type: TransportationType.Skyliner,
                destinationsServed: ["Epcot", "Hollywood Studios", "Disney's Caribbean Beach Resort", "Disney's Riviera Resort", "Disney's Art of Animation Resort"],
                frequency: "Continuous",
                hours: "7:30 AM - 10:30 PM"
            },
            {
                type: TransportationType.Walking,
                destinationsServed: ["Disney's Art of Animation Resort"],
                frequency: "Anytime",
                hours: "24 hours"
            }
        ],
        themingDetails: "Disney's Pop Century Resort is a celebration of American pop culture, featuring iconic fads and trends from the 1950s through the 1990s. Each section of the resort is themed to a specific decade: the 1950s features enormous bowling pins, jukeboxes, and Lady and the Tramp figures; the 1960s showcases tie-dye colors, flower power, and Play-Doh; the 1970s includes eight-track tapes, Mickey Mouse telephones, and a giant Big Wheel; the 1980s displays Rubik's Cubes, Pac-Man, and Sony Walkmans; and the 1990s features cell phones, laptop computers, and Rollerblades. The resort's recently renovated rooms complement the exterior theming with clean, modern designs and subtle Disney touches. Classic Hall, the resort's main building, continues the decades theme with memorabilia displays and retro design elements that evoke nostalgia for guests of all ages.",
        openingDate: "December 14, 2003",
        lastRefurbished: "2018",
        imageUrls: {
            main: "/images/resorts/pop-century-main.jpg",
            gallery: [
                "/images/resorts/pop-century-lobby.jpg",
                "/images/resorts/pop-century-exterior.jpg",
                "/images/resorts/pop-century-pool.jpg",
                "/images/resorts/pop-century-icons.jpg",
                "/images/resorts/pop-century-lake.jpg"
            ],
            rooms: {
                "standard-room-pop": [
                    "/images/resorts/pop-century-standard-1.jpg",
                    "/images/resorts/pop-century-standard-2.jpg"
                ],
                "preferred-room-pop": [
                    "/images/resorts/pop-century-preferred-1.jpg",
                    "/images/resorts/pop-century-preferred-2.jpg"
                ],
                "king-room-pop": [
                    "/images/resorts/pop-century-king-1.jpg",
                    "/images/resorts/pop-century-king-2.jpg"
                ]
            },
            dining: {
                "everything-pop-dining": [
                    "/images/resorts/pop-century-food-court-1.jpg",
                    "/images/resorts/pop-century-food-court-2.jpg"
                ],
                "petals-pool-bar": [
                    "/images/resorts/pop-century-pool-bar-1.jpg",
                    "/images/resorts/pop-century-pool-bar-2.jpg"
                ]
            },
            amenities: {
                "hippy-dippy-pool": [
                    "/images/resorts/pop-century-hippy-pool-1.jpg",
                    "/images/resorts/pop-century-hippy-pool-2.jpg"
                ],
                "fast-forward-arcade": [
                    "/images/resorts/pop-century-arcade-1.jpg",
                    "/images/resorts/pop-century-arcade-2.jpg"
                ]
            }
        },
        pricing: {
            valueRange: { low: 120, high: 290 },
            moderateRange: { low: 0, high: 0 },
            deluxeRange: { low: 0, high: 0 }
        },
        address: "1050 Century Drive, Lake Buena Vista, FL 32830",
        phoneNumber: "(407) 938-4000",
        nearbyAttractions: [
            "Disney's Art of Animation Resort",
            "Disney's Hollywood Studios via Skyliner",
            "Epcot via Skyliner",
            "Disney's Caribbean Beach Resort via Skyliner",
            "Disney's Riviera Resort via Skyliner"
        ],
        featuredExperiences: [
            "Disney Skyliner transportation to Epcot and Hollywood Studios",
            "Iconic decade-themed photo opportunities throughout the resort",
            "Pop Century and Skyliner scavenger hunts",
            "Specialty desserts like Tie-dye Cheesecake at Everything POP",
            "Evening Movies Under the Stars"
        ],
        specialConsiderations: [
            "One of the most affordable Disney resorts with access to Skyliner transportation",
            "Preferred rooms offer closer proximity to transportation, dining, and the main pool",
            "Room layout features a queen-size table bed rather than two permanent beds",
            "The resort can be busy and noisy during peak seasons",
            "Consider Buildings 1-3 (70s section) for proximity to both the main building and Skyliner station"
        ]
    }
]