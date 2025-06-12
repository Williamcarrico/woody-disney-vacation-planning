import { DisneyPark } from '@/types/parks'
import { animalKingdomData } from '@/lib/firebase/data/animal-kingdom-data'

export const magicKingdom: DisneyPark = {
    id: "mk",
    name: "Magic Kingdom",
    abbreviation: "MK",
    description: "The most magical place on Earth, Magic Kingdom captures the enchantment of fairy tales with exciting entertainment, classic attractions, backstage tours and beloved Disney characters.",
    opened: "1971-10-01",
    theme: "Classic Disney Magic and Fairy Tales",
    size: {
        acres: 107,
        hectares: 43
    },
    location: {
        latitude: 28.4177,
        longitude: -81.5812,
        address: "1180 Seven Seas Drive, Lake Buena Vista, FL 32830"
    },
    operatingHours: {
        typical: {
            monday: { open: "09:00", close: "22:00" },
            tuesday: { open: "09:00", close: "22:00" },
            wednesday: { open: "09:00", close: "22:00" },
            thursday: { open: "09:00", close: "22:00" },
            friday: { open: "09:00", close: "23:00" },
            saturday: { open: "08:00", close: "23:00" },
            sunday: { open: "08:00", close: "22:00" }
        },
        extendedEvening: true,
        earlyEntry: true,
        specialEvents: ["Mickey's Not-So-Scary Halloween Party", "Mickey's Very Merry Christmas Party", "Disney After Hours"]
    },
    lands: [
        {
            id: "main-street-usa",
            name: "Main Street, U.S.A.",
            description: "Step into turn-of-the-century America with vintage shops, dining, and the iconic view of Cinderella Castle",
            theme: "Early 20th Century Small-Town America",
            attractions: ["walt-disney-world-railroad-main", "main-street-vehicles"],
            dining: ["caseys-corner", "crystal-palace", "plaza-restaurant", "tonys-town-square"],
            shops: ["emporium", "main-street-confectionery"]
        },
        {
            id: "adventureland",
            name: "Adventureland",
            description: "Explore exotic jungles, tropical rivers, and swashbuckling adventures",
            theme: "Adventure and Exploration",
            attractions: ["pirates-caribbean", "jungle-cruise", "magic-carpets-aladdin", "swiss-family-treehouse", "tiki-room"],
            dining: ["skippers-canteen", "aloha-isle", "sunshine-tree-terrace"],
            shops: ["pirates-bazaar", "island-supply"]
        },
        {
            id: "frontierland",
            name: "Frontierland",
            description: "Journey to the American frontier with thrilling adventures and Old West charm",
            theme: "American Old West",
            attractions: ["big-thunder-mountain", "tianas-bayou-adventure", "tom-sawyer-island", "country-bear-jamboree"],
            dining: ["pecos-bill", "golden-oak-outpost", "westward-ho"],
            shops: ["frontier-trading-post", "briar-patch"]
        },
        {
            id: "liberty-square",
            name: "Liberty Square",
            description: "Celebrate colonial America with historical theming and classic attractions",
            theme: "Colonial America",
            attractions: ["haunted-mansion", "liberty-belle-riverboat", "hall-of-presidents"],
            dining: ["liberty-tree-tavern", "columbia-harbour-house", "liberty-square-market"],
            shops: ["ye-olde-christmas-shoppe", "liberty-square-portrait"]
        },
        {
            id: "fantasyland",
            name: "Fantasyland",
            description: "Enter a storybook world of princesses, fairy tales, and classic Disney magic",
            theme: "Disney Fairy Tales and Stories",
            attractions: ["seven-dwarfs-mine-train", "peter-pans-flight", "its-a-small-world", "haunted-mansion",
                "under-the-sea", "barnstormer", "dumbo", "mad-tea-party", "carousel", "winnie-the-pooh"],
            dining: ["be-our-guest", "gastons-tavern", "pinocchio-village-haus", "friar-nook"],
            shops: ["bibbidi-bobbidi-boutique", "castle-couture"]
        },
        {
            id: "tomorrowland",
            name: "Tomorrowland",
            description: "Blast off to the future with space adventures and sci-fi thrills",
            theme: "Retro-Futuristic Space Port",
            attractions: ["tron-lightcycle", "space-mountain", "buzz-lightyear", "astro-orbiter",
                "peoplemover", "carousel-of-progress", "monsters-inc", "tomorrowland-speedway"],
            dining: ["cosmic-rays", "lunching-pad", "auntie-gravitys"],
            shops: ["merchant-of-venus", "tomorrowland-launch-depot"]
        }
    ],
    attractions: [
        {
            id: "seven-dwarfs-mine-train",
            name: "Seven Dwarfs Mine Train",
            landId: "fantasyland",
            type: "ride",
            description: "Race through the diamond mine from Snow White aboard a swaying family coaster",
            heightRequirement: {
                inches: 38,
                centimeters: 97
            },
            duration: {
                minutes: 3,
                variableLength: false
            },
            capacity: {
                hourly: 1500,
                vehicleCapacity: 20
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 3,
            indoor: false,
            mustDo: true,
            tips: [
                "Book Lightning Lane early as this is one of the most popular attractions",
                "Ride at night for beautiful views of Fantasyland",
                "The mine scene with animatronic dwarfs is the highlight"
            ],
            bestTimes: ["First thing at rope drop", "During parades", "Last hour of operation"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "pirates-caribbean",
            name: "Pirates of the Caribbean",
            landId: "adventureland",
            type: "ride",
            description: "Sail with pirates on a swashbuckling voyage through the Golden Age of Piracy",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 15,
                variableLength: false
            },
            capacity: {
                hourly: 2800,
                vehicleCapacity: 20
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: true
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            thrillLevel: 2,
            indoor: true,
            mustDo: true,
            tips: [
                "Look for Captain Jack Sparrow appearances throughout",
                "Small drop at beginning may startle young children",
                "Often has shorter waits during parades"
            ],
            bestTimes: ["Late evening", "During Happily Ever After fireworks", "Early morning"],
            photoPass: true,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "tron-lightcycle",
            name: "TRON Lightcycle / Run",
            landId: "tomorrowland",
            type: "ride",
            description: "Speed across a world of light on a motorcycle-style coaster through TRON's digital frontier",
            heightRequirement: {
                inches: 48,
                centimeters: 122
            },
            duration: {
                minutes: 2,
                variableLength: false
            },
            capacity: {
                hourly: 1400,
                vehicleCapacity: 14
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "SinglePass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 4,
            indoor: false,
            mustDo: true,
            tips: [
                "Virtual Queue required - join at 7 AM or 1 PM",
                "Individual Lightning Lane also available",
                "Store belongings in free lockers before riding"
            ],
            bestTimes: ["Virtual Queue only"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: true
        },
        {
            id: "space-mountain",
            name: "Space Mountain",
            landId: "tomorrowland",
            type: "ride",
            description: "Blast through space on a thrilling indoor roller coaster in complete darkness",
            heightRequirement: {
                inches: 44,
                centimeters: 112
            },
            duration: {
                minutes: 3,
                variableLength: false
            },
            capacity: {
                hourly: 2200,
                vehicleCapacity: 6
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 4,
            indoor: true,
            mustDo: true,
            tips: [
                "Completely dark indoor coaster",
                "Smooth ride with sudden turns and drops",
                "Best ridden with Lightning Lane during busy times"
            ],
            bestTimes: ["First thing at rope drop", "During fireworks", "Last hour"],
            photoPass: true,
            rider: {
                swap: true,
                single: true
            },
            virtualQueue: false
        },
        {
            id: "big-thunder-mountain",
            name: "Big Thunder Mountain Railroad",
            landId: "frontierland",
            type: "ride",
            description: "Race through a haunted mining cavern aboard a runaway mine train",
            heightRequirement: {
                inches: 40,
                centimeters: 102
            },
            duration: {
                minutes: 4,
                variableLength: false
            },
            capacity: {
                hourly: 2400,
                vehicleCapacity: 30
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["preschool", "kids", "tweens", "teens", "adults"],
            thrillLevel: 3,
            indoor: false,
            mustDo: true,
            tips: [
                "Great family coaster with moderate thrills",
                "Beautiful scenery and audio-animatronics",
                "Often has shorter waits during dinner time"
            ],
            bestTimes: ["Early morning", "During parades", "Late evening"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: false,
            closureInfo: {
                startDate: "2025-01-07",
                endDate: "2025-04-03",
                reason: "Scheduled refurbishment"
            }
        },
        {
            id: "haunted-mansion",
            name: "Haunted Mansion",
            landId: "liberty-square",
            type: "ride",
            description: "Take a ghostly tour through a mansion inhabited by 999 happy haunts",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 9,
                variableLength: false
            },
            capacity: {
                hourly: 2600,
                vehicleCapacity: 3
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: true
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["preschool", "kids", "tweens", "teens", "adults", "seniors"],
            thrillLevel: 2,
            indoor: true,
            mustDo: true,
            tips: [
                "Classic Disney dark ride with spooky but not scary effects",
                "No height requirement - great for all ages",
                "Watch for hidden Mickeys throughout the ride"
            ],
            bestTimes: ["Early morning", "During dinner", "Late evening"],
            photoPass: true,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "its-a-small-world",
            name: "it's a small world",
            landId: "fantasyland",
            type: "ride",
            description: "Sail around the world on a musical boat ride celebrating global harmony",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 11,
                variableLength: false
            },
            capacity: {
                hourly: 3000,
                vehicleCapacity: 20
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: true
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            thrillLevel: 1,
            indoor: true,
            mustDo: false,
            tips: [
                "Classic Disney boat ride - perfect for young children",
                "Air conditioned - great during hot weather",
                "Song will be stuck in your head all day!"
            ],
            bestTimes: ["Anytime", "Hot weather refuge", "When you need a break"],
            photoPass: false,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        }
    ],
    dining: {
        tableService: [
            {
                id: "be-our-guest",
                name: "Be Our Guest Restaurant",
                landId: "fantasyland",
                cuisine: ["French", "American"],
                description: "Dine in Beast's enchanted castle with French-inspired cuisine in lavish ballrooms",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$$$",
                reservations: {
                    required: true,
                    recommended: true,
                    acceptsWalkUps: false
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["French Onion Soup", "Filet Mignon", "Grey Stuff Dessert"],
                    categories: [
                        {
                            name: "Appetizers",
                            items: [
                                {
                                    name: "French Onion Soup",
                                    description: "Traditional French onion soup topped with crouton and melted Gruyere",
                                    price: "$15",
                                    dietary: ["vegetarian"]
                                }
                            ]
                        }
                    ]
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 550
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: true,
                    allergyFriendly: true
                },
                tips: [
                    "Book 60 days in advance - extremely popular",
                    "Three themed dining rooms: Ballroom, West Wing, and Rose Gallery",
                    "Prix fixe menu for lunch and dinner",
                    "Try to get the Grey Stuff - it's delicious!"
                ]
            }
        ],
        quickService: [
            {
                id: "cosmic-rays",
                name: "Cosmic Ray's Starlight Café",
                landId: "tomorrowland",
                cuisine: ["American", "Burgers", "Chicken"],
                description: "Largest quick-service location in Magic Kingdom with multiple bays and live entertainment",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$",
                reservations: {
                    required: false,
                    recommended: false,
                    acceptsWalkUps: true
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["1/3 lb Angus Bacon Cheeseburger", "Greek Salad with Chicken", "Chicken Strips"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 600
                },
                characterDining: false,
                mobileOrder: true,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Three bays with different menu options",
                    "Sonny Eclipse performs throughout the day",
                    "Best seating upstairs with castle views",
                    "Gets very crowded at peak meal times"
                ]
            }
        ],
        snacks: [
            {
                id: "aloha-isle",
                name: "Aloha Isle",
                landId: "adventureland",
                type: "stand",
                items: ["Dole Whip", "Dole Whip Float", "Fresh Pineapple Spears"],
                specialties: ["Dole Whip", "Pineapple Upside Down Cake Dole Whip"],
                seasonal: false,
                mobileOrder: true,
                location: "Near Swiss Family Treehouse"
            }
        ]
    },
    entertainment: [
        {
            id: "happily-ever-after",
            name: "Happily Ever After",
            type: "fireworks",
            description: "Spectacular nighttime fireworks show with projections on Cinderella Castle",
            duration: { minutes: 18 },
            showtimes: ["21:00", "22:00"],
            location: "Cinderella Castle",
            capacity: 50000,
            lightningLane: false,
            seasonal: false,
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            tips: [
                "Main Street and Hub offer best views",
                "Book dessert party for guaranteed viewing spot",
                "Arrive 30-45 minutes early for good spot",
                "Can see from multiple locations throughout park"
            ]
        }
    ],
    facilities: [
        {
            id: "baby-care-center",
            name: "Baby Care Center",
            type: "baby-care",
            locations: ["Near Crystal Palace on Main Street U.S.A."],
            features: ["Nursing rooms", "Changing tables", "Kitchen facilities", "Family restroom", "Quiet feeding area"]
        }
    ],
    services: [
        {
            id: "das",
            name: "Disability Access Service",
            type: "accessibility",
            description: "Service for guests who have difficulty waiting in conventional lines",
            locations: ["Guest Relations"],
            cost: "Free",
            reservation: false
        }
    ],
    accessibility: {
        overview: "Magic Kingdom is committed to providing a magical experience for all guests, including those with disabilities",
        services: {
            das: {
                available: true,
                description: "Disability Access Service helps guests who have difficulty tolerating extended waits in conventional queue"
            },
            wheelchairRental: {
                available: true,
                locations: ["Main entrance rental shop"],
                cost: "$12 manual, $50 ECV per day plus $20 deposit"
            },
            interpreterServices: true,
            brailleGuidebooks: true,
            audioDescription: true
        },
        companionRestrooms: [
            "First Aid Station",
            "Baby Care Center",
            "Near Jungle Cruise",
            "Near Space Mountain"
        ],
        quietAreas: [
            "Tom Sawyer Island",
            "Behind Ye Olde Christmas Shoppe",
            "Tangled themed area restrooms"
        ]
    },
    tips: [
        {
            category: "Planning",
            tips: [
                {
                    title: "Arrive Early for Rope Drop",
                    description: "Arrive 30-45 minutes before official opening to maximize ride time with lower crowds",
                    priority: "high"
                },
                {
                    title: "Book Lightning Lanes at 7 AM",
                    description: "Reserve your first Lightning Lane selections right at 7 AM for best availability",
                    priority: "high"
                }
            ]
        }
    ],
    transportation: {
        parkingLot: true,
        monorail: true,
        boat: true,
        bus: true,
        skyliner: false,
        walkable: false,
        resortAccess: {
            monorail: ["Contemporary Resort", "Grand Floridian Resort", "Polynesian Village Resort"],
            boat: ["Grand Floridian Resort", "Polynesian Village Resort", "Wilderness Lodge", "Fort Wilderness"],
            walking: ["Contemporary Resort"]
        }
    },
    parkingInfo: {
        available: true,
        standard: {
            cost: "$30 per day",
            location: "Transportation and Ticket Center - requires monorail or ferry to reach park"
        },
        preferred: {
            cost: "$50-55 per day",
            location: "Closer to Transportation and Ticket Center entrance"
        },
        trams: true,
        tips: [
            "Take photo of parking lot section to remember location",
            "Arrive early for closer parking spots",
            "Consider resort hopping to avoid parking fees",
            "Parking receipt valid at all parks same day"
        ]
    }
}

export const epcot: DisneyPark = {
    id: "epcot",
    name: "EPCOT",
    abbreviation: "EP",
    description: "A celebration of human achievement and international culture, featuring technological innovation and world cultures",
    opened: "1982-10-01",
    theme: "Future World and International Culture",
    size: {
        acres: 300,
        hectares: 121
    },
    location: {
        latitude: 28.3747,
        longitude: -81.5494,
        address: "200 Epcot Center Dr, Bay Lake, FL 32821"
    },
    operatingHours: {
        typical: {
            monday: { open: "09:00", close: "21:00" },
            tuesday: { open: "09:00", close: "21:00" },
            wednesday: { open: "09:00", close: "21:00" },
            thursday: { open: "09:00", close: "21:00" },
            friday: { open: "09:00", close: "22:00" },
            saturday: { open: "08:30", close: "22:00" },
            sunday: { open: "08:30", close: "21:00" }
        },
        extendedEvening: true,
        earlyEntry: true,
        specialEvents: ["EPCOT International Festival of the Arts", "EPCOT Flower & Garden Festival", "EPCOT Food & Wine Festival", "EPCOT Festival of the Holidays"]
    },
    lands: [
        {
            id: "world-celebration",
            name: "World Celebration",
            description: "The heart of EPCOT featuring Spaceship Earth and celebration of human achievement",
            theme: "Innovation and Celebration",
            attractions: ["spaceship-earth", "awesome-planet"],
            dining: ["connections-eatery", "starbucks-traveler"],
            shops: ["creations-shop", "pin-central"]
        },
        {
            id: "world-nature",
            name: "World Nature",
            description: "Explore the wonders of the natural world through immersive experiences",
            theme: "Natural World and Conservation",
            attractions: ["soarin", "living-with-land", "the-seas-with-nemo"],
            dining: ["sunshine-seasons", "coral-reef-restaurant"],
            shops: ["the-seas-gift-shop"]
        },
        {
            id: "world-discovery",
            name: "World Discovery",
            description: "Discover new frontiers in science, technology, and space exploration",
            theme: "Science and Discovery",
            attractions: ["guardians-of-galaxy", "test-track", "mission-space"],
            dining: ["space-220", "electric-umbrella"],
            shops: ["test-track-gift-shop"]
        },
        {
            id: "world-showcase",
            name: "World Showcase",
            description: "Journey around the world through 11 country pavilions showcasing culture, cuisine, and entertainment",
            theme: "International Culture",
            attractions: ["frozen-ever-after", "remy-ratatouille", "gran-fiesta-tour", "american-adventure"],
            dining: ["le-cellier", "monsieur-paul", "akershus", "biergarten"],
            shops: ["world-traveler"]
        }
    ],
    attractions: [
        {
            id: "guardians-of-galaxy",
            name: "Guardians of the Galaxy: Cosmic Rewind",
            landId: "world-discovery",
            type: "ride",
            description: "Join the Guardians on an intergalactic chase through time and space on a reverse-launch coaster",
            heightRequirement: {
                inches: 42,
                centimeters: 107
            },
            duration: {
                minutes: 3,
                variableLength: false
            },
            capacity: {
                hourly: 1800,
                vehicleCapacity: 20
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "SinglePass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 4,
            indoor: true,
            mustDo: true,
            tips: [
                "Virtual Queue required - join at 7 AM or 1 PM",
                "Individual Lightning Lane also available",
                "One of few reverse-launch coasters at Disney"
            ],
            bestTimes: ["Virtual Queue only"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: true
        },
        {
            id: "frozen-ever-after",
            name: "Frozen Ever After",
            landId: "world-showcase",
            type: "ride",
            description: "Journey to Arendelle and experience the world of Frozen with Anna, Elsa, and Olaf",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1000,
                vehicleCapacity: 12
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: true
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults"],
            thrillLevel: 2,
            indoor: true,
            mustDo: true,
            tips: [
                "Very popular with families - book Lightning Lane early",
                "Located in Norway pavilion",
                "Small backwards drop during the ride"
            ],
            bestTimes: ["Early morning", "During fireworks", "Last hour"],
            photoPass: true,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "test-track",
            name: "Test Track Presented by Chevrolet",
            landId: "world-discovery",
            type: "ride",
            description: "Design your own virtual vehicle and test it on a high-speed track",
            heightRequirement: {
                inches: 40,
                centimeters: 102
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1500,
                vehicleCapacity: 6
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 3,
            indoor: false,
            mustDo: true,
            tips: [
                "Design your vehicle before getting in line",
                "Reaches speeds up to 65 mph",
                "Post-show area has interactive experiences"
            ],
            bestTimes: ["Early morning", "During dinner", "Late evening"],
            photoPass: true,
            rider: {
                swap: true,
                single: true
            },
            virtualQueue: false,
            closureInfo: {
                startDate: "2025-02-17",
                endDate: "2025-04-04",
                reason: "Scheduled refurbishment"
            }
        },
        {
            id: "soarin",
            name: "Soarin' Around the World",
            landId: "world-nature",
            type: "ride",
            description: "Hang glide over famous landmarks and natural wonders from around the world",
            heightRequirement: {
                inches: 40,
                centimeters: 102
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1800,
                vehicleCapacity: 87
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults", "seniors"],
            thrillLevel: 2,
            indoor: true,
            mustDo: true,
            tips: [
                "Request center seats for best experience",
                "No loops or sharp turns - gentle flight simulation",
                "Beautiful scents and wind effects enhance the experience"
            ],
            bestTimes: ["Early morning", "During World Showcase hours"],
            photoPass: false,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "remy-ratatouille",
            name: "Remy's Ratatouille Adventure",
            landId: "world-showcase",
            type: "ride",
            description: "Shrink to the size of a rat and scurry through Gusteau's restaurant",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1500,
                vehicleCapacity: 6
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: true
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults"],
            thrillLevel: 2,
            indoor: true,
            mustDo: true,
            tips: [
                "Trackless dark ride - no height requirement",
                "Located in France pavilion",
                "Family-friendly with mild motion and effects"
            ],
            bestTimes: ["Early morning", "During dinner", "Late evening"],
            photoPass: true,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        }
    ],
    dining: {
        tableService: [
            {
                id: "space-220",
                name: "Space 220 Restaurant",
                landId: "world-discovery",
                cuisine: ["American", "Contemporary"],
                description: "Dine 220 miles above Earth with stunning views of space and our planet",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$$$$",
                reservations: {
                    required: true,
                    recommended: true,
                    acceptsWalkUps: false
                },
                diningPlan: {
                    accepted: false,
                    credits: 0
                },
                menu: {
                    signature: ["Blue Moon Cauliflower", "Slow-Rotation Short Rib", "Chocolate Earth"],
                    categories: [
                        {
                            name: "Appetizers",
                            items: [
                                {
                                    name: "Blue Moon Cauliflower",
                                    description: "Roasted cauliflower with blue cheese mousse and crispy pancetta",
                                    price: "$18",
                                    dietary: ["vegetarian"]
                                }
                            ]
                        }
                    ]
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 220
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: true,
                    allergyFriendly: true
                },
                tips: [
                    "Most expensive Disney restaurant - budget accordingly",
                    "Incredible theming with simulated space views",
                    "Book 60 days in advance - extremely popular",
                    "Prix fixe menu only"
                ]
            },
            {
                id: "le-cellier",
                name: "Le Cellier Steakhouse",
                landId: "world-showcase",
                cuisine: ["Canadian", "Steakhouse"],
                description: "Upscale steakhouse in Canada pavilion featuring Canadian-inspired cuisine",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$$$",
                reservations: {
                    required: true,
                    recommended: true,
                    acceptsWalkUps: false
                },
                diningPlan: {
                    accepted: true,
                    credits: 2
                },
                menu: {
                    signature: ["Canadian Cheddar Cheese Soup", "Filet Mignon", "Maple Crème Brûlée"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 180
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: true,
                    allergyFriendly: true
                },
                tips: [
                    "Famous for Canadian Cheddar Cheese Soup",
                    "Book 60 days in advance",
                    "Signature dining experience",
                    "Great wine selection"
                ]
            }
        ],
        quickService: [
            {
                id: "sunshine-seasons",
                name: "Sunshine Seasons",
                landId: "world-nature",
                cuisine: ["American", "Asian", "Grill"],
                description: "Large food court with multiple stations offering diverse cuisine options",
                mealPeriods: ["breakfast", "lunch", "dinner"],
                priceRange: "$$",
                reservations: {
                    required: false,
                    recommended: false,
                    acceptsWalkUps: true
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["Grilled Salmon", "Mongolian Beef", "Loaded Baked Potato Soup"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 500
                },
                characterDining: false,
                mobileOrder: true,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Multiple food stations with different options",
                    "Healthy options available",
                    "Can get crowded during peak meal times",
                    "Located near popular attractions"
                ]
            }
        ],
        snacks: [
            {
                id: "les-halles-boulangerie",
                name: "Les Halles Boulangerie-Patisserie",
                landId: "world-showcase",
                type: "stand",
                items: ["French Pastries", "Croissants", "Quiche", "French Bread"],
                specialties: ["Napoleon", "Éclair", "French Onion Soup"],
                seasonal: false,
                mobileOrder: true,
                location: "France Pavilion"
            }
        ]
    },
    entertainment: [
        {
            id: "luminous",
            name: "Luminous: The Symphony of Us",
            type: "fireworks",
            description: "Spectacular nighttime show celebrating the connections that unite us all",
            duration: { minutes: 17 },
            showtimes: ["21:00"],
            location: "World Showcase Lagoon",
            capacity: 30000,
            lightningLane: false,
            seasonal: false,
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            tips: [
                "Best viewing around World Showcase Promenade",
                "Japan and Italy pavilions offer excellent views",
                "Arrive 30-45 minutes early for good spots",
                "Consider dining packages for guaranteed seating"
            ]
        }
    ],
    facilities: [
        {
            id: "baby-care-center-epcot",
            name: "Baby Care Center",
            type: "baby-care",
            locations: ["Odyssey Center near Test Track"],
            features: ["Nursing rooms", "Changing tables", "Kitchen facilities", "Family restroom"]
        }
    ],
    services: [
        {
            id: "das-epcot",
            name: "Disability Access Service",
            type: "accessibility",
            description: "Service for guests who have difficulty waiting in conventional lines",
            locations: ["Guest Relations"],
            cost: "Free",
            reservation: false
        }
    ],
    accessibility: {
        overview: "EPCOT provides accessibility services and accommodations for guests with disabilities",
        services: {
            das: {
                available: true,
                description: "Disability Access Service helps guests who have difficulty tolerating extended waits"
            },
            wheelchairRental: {
                available: true,
                locations: ["Main entrance"],
                cost: "$12 manual, $50 ECV per day plus $20 deposit"
            },
            interpreterServices: true,
            brailleGuidebooks: true,
            audioDescription: true
        },
        companionRestrooms: [
            "First Aid Station",
            "Baby Care Center"
        ],
        quietAreas: [
            "Innoventions Plaza",
            "World Showcase gardens"
        ]
    },
    tips: [
        {
            category: "Planning",
            tips: [
                {
                    title: "Start with Future World, End with World Showcase",
                    description: "Future World attractions are busiest early, while World Showcase opens at 11 AM",
                    priority: "high"
                },
                {
                    title: "Eat Around the World",
                    description: "World Showcase offers some of the best dining at Walt Disney World",
                    priority: "medium"
                }
            ]
        }
    ],
    transportation: {
        parkingLot: true,
        monorail: true,
        boat: true,
        bus: true,
        skyliner: true,
        walkable: false,
        resortAccess: {
            monorail: ["Grand Floridian Resort", "Polynesian Village Resort", "Contemporary Resort"],
            boat: ["BoardWalk Inn", "Beach Club Resort", "Yacht Club Resort", "Swan", "Dolphin"],
            skyliner: ["Caribbean Beach Resort", "Art of Animation Resort", "Pop Century Resort", "Riviera Resort"]
        }
    },
    parkingInfo: {
        available: true,
        standard: {
            cost: "$30 per day",
            location: "Main parking lot with tram service to entrance"
        },
        preferred: {
            cost: "$50-55 per day",
            location: "Closer to park entrance"
        },
        trams: true,
        tips: [
            "Take photo of parking section",
            "Consider using Disney transportation from resorts",
            "Skyliner access available from select resorts"
        ]
    }
}

export const hollywoodStudios: DisneyPark = {
    id: "hs",
    name: "Hollywood Studios",
    abbreviation: "HS",
    description: "Immerse yourself in the magic of movies, television, music and theater",
    opened: "1989-05-01",
    theme: "Movie Magic and Entertainment",
    size: {
        acres: 135,
        hectares: 55
    },
    location: {
        latitude: 28.3598,
        longitude: -81.5593,
        address: "351 S Studio Dr, Bay Lake, FL 32830"
    },
    operatingHours: {
        typical: {
            monday: { open: "08:30", close: "21:00" },
            tuesday: { open: "08:30", close: "21:00" },
            wednesday: { open: "08:30", close: "21:00" },
            thursday: { open: "08:30", close: "21:00" },
            friday: { open: "08:30", close: "22:00" },
            saturday: { open: "08:00", close: "22:00" },
            sunday: { open: "08:00", close: "21:00" }
        },
        extendedEvening: true,
        earlyEntry: true,
        specialEvents: ["Disney After Hours", "Villains After Hours", "Star Wars Nite"]
    },
    lands: [
        {
            id: "hollywood-boulevard",
            name: "Hollywood Boulevard",
            description: "The glamorous entrance of the park showcasing the golden age of Hollywood",
            theme: "1930s Hollywood",
            attractions: ["mickey-minnie-runaway-railway"],
            dining: ["hollywood-brown-derby", "hollywood-vine"],
            shops: ["mickey-shorts-theater", "keystone-clothiers"]
        },
        {
            id: "sunset-boulevard",
            name: "Sunset Boulevard",
            description: "Experience thrilling attractions in this recreation of 1940s Hollywood",
            theme: "1940s Hollywood Sunset Strip",
            attractions: ["tower-of-terror", "rock-n-roller-coaster"],
            dining: ["catalina-eddies", "rosies-all-american-cafe"],
            shops: ["tower-hotel-gifts", "rock-around-shop"]
        },
        {
            id: "galaxys-edge",
            name: "Star Wars: Galaxy's Edge",
            description: "Step into the Star Wars universe on the planet Batuu",
            theme: "Star Wars - Planet Batuu",
            attractions: ["rise-of-resistance", "smugglers-run"],
            dining: ["ogas-cantina", "docking-bay-7"],
            shops: ["savis-workshop", "dok-ondars"]
        },
        {
            id: "toy-story-land",
            name: "Toy Story Land",
            description: "Shrink down to toy size in Andy's backyard",
            theme: "Toy Story - Andy's Backyard",
            attractions: ["slinky-dog-dash", "toy-story-mania", "alien-swirling-saucers"],
            dining: ["woodys-lunch-box"],
            shops: ["als-toy-barn"]
        },
        {
            id: "grand-avenue",
            name: "Grand Avenue",
            description: "Explore this recreation of downtown Los Angeles",
            theme: "Downtown Los Angeles",
            attractions: ["muppet-vision-3d"],
            dining: ["mama-melroses", "pizzerizzo"],
            shops: ["stage-1-company-store"]
        },
        {
            id: "animation-courtyard",
            name: "Animation Courtyard",
            description: "Discover the magic behind Disney animation",
            theme: "Disney Animation Studio",
            attractions: ["disney-junior-dance-party", "voyage-little-mermaid"],
            dining: [],
            shops: ["in-character"]
        },
        {
            id: "echo-lake",
            name: "Echo Lake",
            description: "Classic attractions and shows around a peaceful lake",
            theme: "1950s Echo Lake",
            attractions: ["indiana-jones-stunt-spectacular", "star-tours"],
            dining: ["50s-prime-time-cafe", "dockside-diner"],
            shops: ["tatooine-traders"]
        }
    ],
    attractions: [
        {
            id: "rise-of-resistance",
            name: "Star Wars: Rise of the Resistance",
            landId: "galaxys-edge",
            type: "ride",
            description: "Join the Resistance in an epic battle against the First Order",
            heightRequirement: {
                inches: 40,
                centimeters: 102
            },
            duration: {
                minutes: 18,
                variableLength: false
            },
            capacity: {
                hourly: 1200,
                vehicleCapacity: 8
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "SinglePass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 4,
            indoor: true,
            mustDo: true,
            tips: [
                "Virtual Queue required - join at 7 AM or 1 PM",
                "Individual Lightning Lane also available",
                "Most immersive Star Wars experience at Disney"
            ],
            bestTimes: ["Virtual Queue only"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: true
        },
        {
            id: "tower-of-terror",
            name: "The Twilight Zone Tower of Terror",
            landId: "sunset-boulevard",
            type: "ride",
            description: "Enter the Twilight Zone and experience a terrifying drop in a haunted hotel",
            heightRequirement: {
                inches: 40,
                centimeters: 102
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1800,
                vehicleCapacity: 21
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["tweens", "teens", "adults"],
            thrillLevel: 4,
            indoor: true,
            mustDo: true,
            tips: [
                "Multiple drop sequences - not just one drop",
                "Incredible theming and pre-show",
                "Best views of park from the top"
            ],
            bestTimes: ["Early morning", "During Fantasmic", "Late evening"],
            photoPass: true,
            rider: {
                swap: true,
                single: true
            },
            virtualQueue: false
        },
        {
            id: "rock-n-roller-coaster",
            name: "Rock 'n' Roller Coaster Starring Aerosmith",
            landId: "sunset-boulevard",
            type: "ride",
            description: "Launch from 0 to 57 mph in 2.8 seconds on this indoor rock and roll coaster",
            heightRequirement: {
                inches: 48,
                centimeters: 122
            },
            duration: {
                minutes: 2,
                variableLength: false
            },
            capacity: {
                hourly: 1800,
                vehicleCapacity: 24
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["tweens", "teens", "adults"],
            thrillLevel: 5,
            indoor: true,
            mustDo: true,
            tips: [
                "Fastest ride at Walt Disney World",
                "Aerosmith soundtrack during the ride",
                "Multiple inversions - very intense"
            ],
            bestTimes: ["First thing at rope drop", "During shows", "Last hour"],
            photoPass: true,
            rider: {
                swap: true,
                single: true
            },
            virtualQueue: false,
            closureInfo: {
                startDate: "2025-02-24",
                endDate: "2025-07-02",
                reason: "Scheduled refurbishment and re-theming"
            }
        },
        {
            id: "mickey-minnie-runaway-railway",
            name: "Mickey & Minnie's Runaway Railway",
            landId: "hollywood-boulevard",
            type: "ride",
            description: "Step into a Mickey Mouse cartoon for a zany adventure with Mickey and Minnie",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1800,
                vehicleCapacity: 8
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: true
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults"],
            thrillLevel: 2,
            indoor: true,
            mustDo: true,
            tips: [
                "First Mickey Mouse ride at Disney World",
                "Trackless technology with no height requirement",
                "Great for all ages - mild thrills"
            ],
            bestTimes: ["Early morning", "During dinner", "Late evening"],
            photoPass: true,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "slinky-dog-dash",
            name: "Slinky Dog Dash",
            landId: "toy-story-land",
            type: "ride",
            description: "Ride aboard Slinky Dog on a family-friendly coaster through Andy's backyard",
            heightRequirement: {
                inches: 38,
                centimeters: 97
            },
            duration: {
                minutes: 2,
                variableLength: false
            },
            capacity: {
                hourly: 1400,
                vehicleCapacity: 20
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: false,
                audioDescription: false,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["preschool", "kids", "tweens", "teens", "adults"],
            thrillLevel: 3,
            indoor: false,
            mustDo: true,
            tips: [
                "Great family coaster with smooth ride",
                "Amazing theming in Toy Story Land",
                "Gets very hot during summer - ride early"
            ],
            bestTimes: ["First thing at rope drop", "During indoor attractions"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: false
        }
    ],
    dining: {
        tableService: [
            {
                id: "ogas-cantina",
                name: "Oga's Cantina",
                landId: "galaxys-edge",
                cuisine: ["Star Wars Themed", "Small Plates"],
                description: "Unique cantina experience serving exotic beverages and small bites",
                mealPeriods: ["allday"],
                priceRange: "$$$",
                reservations: {
                    required: true,
                    recommended: true,
                    acceptsWalkUps: false
                },
                diningPlan: {
                    accepted: false,
                    credits: 0
                },
                menu: {
                    signature: ["Blue Bantha", "Fuzzy Tauntaun", "Ronto Wrap"],
                    categories: [
                        {
                            name: "Beverages",
                            items: [
                                {
                                    name: "Blue Bantha",
                                    description: "Non-alcoholic blue milk with tropical flavors",
                                    price: "$8",
                                    dietary: ["dairy-free"]
                                }
                            ]
                        }
                    ]
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 100
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: true,
                    allergyFriendly: true
                },
                tips: [
                    "90-minute time limit",
                    "Incredibly immersive Star Wars experience",
                    "Book 60 days in advance",
                    "DJ R-3X provides entertainment"
                ]
            },
            {
                id: "50s-prime-time-cafe",
                name: "50's Prime Time Café",
                landId: "echo-lake",
                cuisine: ["American", "Comfort Food"],
                description: "Nostalgic dining experience with 1950s TV shows and comfort food",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$$",
                reservations: {
                    required: true,
                    recommended: true,
                    acceptsWalkUps: false
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["Fried Chicken", "Pot Roast", "Peanut Butter & Jelly Shake"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 200
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: true,
                    allergyFriendly: true
                },
                tips: [
                    "Servers play the role of 1950s family members",
                    "Finish your vegetables or no dessert!",
                    "Fun interactive dining experience",
                    "Great comfort food portions"
                ]
            }
        ],
        quickService: [
            {
                id: "docking-bay-7",
                name: "Docking Bay 7 Food and Cargo",
                landId: "galaxys-edge",
                cuisine: ["Star Wars Themed", "International"],
                description: "Quick-service restaurant featuring galactic cuisine from across the galaxy",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$$",
                reservations: {
                    required: false,
                    recommended: false,
                    acceptsWalkUps: true
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["Fried Endorian Tip-Yip", "Ronto Wrap", "Blue Bantha"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: true,
                    capacity: 300
                },
                characterDining: false,
                mobileOrder: true,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Themed Star Wars food and drinks",
                    "Outdoor seating with Galaxy's Edge views",
                    "Try the Blue or Green Milk",
                    "Mobile order recommended during busy times"
                ]
            },
            {
                id: "woodys-lunch-box",
                name: "Woody's Lunch Box",
                landId: "toy-story-land",
                cuisine: ["American", "Breakfast"],
                description: "Quick bites served from Andy's lunch box in Toy Story Land",
                mealPeriods: ["breakfast", "lunch", "dinner"],
                priceRange: "$",
                reservations: {
                    required: false,
                    recommended: false,
                    acceptsWalkUps: true
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["Totchos", "Grilled Cheese Sandwich", "Lunch Box Tart"],
                    categories: []
                },
                seating: {
                    indoor: false,
                    outdoor: true,
                    capacity: 150
                },
                characterDining: false,
                mobileOrder: true,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Famous for Totchos (tater tot nachos)",
                    "Great breakfast options",
                    "Limited seating - consider mobile order",
                    "Gets very hot during summer"
                ]
            }
        ],
        snacks: [
            {
                id: "milk-stand",
                name: "Milk Stand",
                landId: "galaxys-edge",
                type: "stand",
                items: ["Blue Milk", "Green Milk"],
                specialties: ["Blue Milk", "Green Milk"],
                seasonal: false,
                mobileOrder: true,
                location: "Galaxy's Edge near Millennium Falcon"
            }
        ]
    },
    entertainment: [
        {
            id: "fantasmic",
            name: "Fantasmic!",
            type: "show",
            description: "Spectacular nighttime show featuring Mickey Mouse's dreams and Disney villains",
            duration: { minutes: 26 },
            showtimes: ["21:00", "22:30"],
            location: "Hollywood Hills Amphitheater",
            capacity: 6900,
            lightningLane: false,
            seasonal: false,
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            tips: [
                "Arrive 45-60 minutes early for good seats",
                "Dining packages available for guaranteed seating",
                "Very popular - can have long lines",
                "Spectacular water effects and projections"
            ]
        },
        {
            id: "indiana-jones-stunt-spectacular",
            name: "Indiana Jones Epic Stunt Spectacular!",
            landId: "echo-lake",
            type: "show",
            description: "Live stunt show featuring recreated scenes from Raiders of the Lost Ark",
            duration: { minutes: 30 },
            showtimes: ["Multiple times daily"],
            location: "Echo Lake Theater",
            capacity: 2000,
            lightningLane: false,
            seasonal: false,
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            tips: [
                "Arrive 15-20 minutes early",
                "Volunteers from audience participate",
                "Air-conditioned theater",
                "Amazing practical effects and stunts"
            ]
        }
    ],
    facilities: [
        {
            id: "baby-care-center-hs",
            name: "Baby Care Center",
            type: "baby-care",
            locations: ["Near Guest Relations at entrance"],
            features: ["Nursing rooms", "Changing tables", "Kitchen facilities", "Family restroom"]
        }
    ],
    services: [
        {
            id: "das-hs",
            name: "Disability Access Service",
            type: "accessibility",
            description: "Service for guests who have difficulty waiting in conventional lines",
            locations: ["Guest Relations"],
            cost: "Free",
            reservation: false
        }
    ],
    accessibility: {
        overview: "Hollywood Studios provides accessibility services and accommodations for guests with disabilities",
        services: {
            das: {
                available: true,
                description: "Disability Access Service helps guests who have difficulty tolerating extended waits"
            },
            wheelchairRental: {
                available: true,
                locations: ["Main entrance"],
                cost: "$12 manual, $50 ECV per day plus $20 deposit"
            },
            interpreterServices: true,
            brailleGuidebooks: true,
            audioDescription: true
        },
        companionRestrooms: [
            "First Aid Station",
            "Baby Care Center"
        ],
        quietAreas: [
            "Grand Avenue gardens",
            "Echo Lake sitting areas"
        ]
    },
    tips: [
        {
            category: "Planning",
            tips: [
                {
                    title: "Start with Virtual Queue Attractions",
                    description: "Join Virtual Queues for Rise of the Resistance at 7 AM for best chance",
                    priority: "high"
                },
                {
                    title: "Plan Around Show Times",
                    description: "Check show schedules and plan attractions around Fantasmic and other shows",
                    priority: "medium"
                }
            ]
        }
    ],
    transportation: {
        parkingLot: true,
        monorail: false,
        boat: true,
        bus: true,
        skyliner: true,
        walkable: false,
        resortAccess: {
            boat: ["BoardWalk Inn", "Beach Club Resort", "Yacht Club Resort", "Swan", "Dolphin"],
            skyliner: ["Caribbean Beach Resort", "Art of Animation Resort", "Pop Century Resort", "Riviera Resort"]
        }
    },
    parkingInfo: {
        available: true,
        standard: {
            cost: "$30 per day",
            location: "Main parking lot with tram service to entrance"
        },
        preferred: {
            cost: "$50-55 per day",
            location: "Closer to park entrance"
        },
        trams: true,
        tips: [
            "Take photo of parking section",
            "Consider using Disney transportation from resorts",
            "Skyliner access available from select resorts"
        ]
    }
}

// Export individual park data and a combined array
export const animalKingdom = animalKingdomData
export const disneyParks = [magicKingdom, epcot, hollywoodStudios, animalKingdom]