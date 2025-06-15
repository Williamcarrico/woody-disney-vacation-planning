import { DisneyPark } from '@/types/parks.model'
import { Timestamp } from 'firebase/firestore'

export const animalKingdomData: DisneyPark = {
    id: "ak",
    name: "Disney's Animal Kingdom",
    abbreviation: "DAK",
    description: "A zoological theme park celebrating the natural world with thrilling adventures, exotic animals, and immersive lands including Pandora - The World of Avatar",
    opened: "1998-04-22",
    theme: "Nature, Conservation, and Adventure",
    size: {
        acres: 580,
        hectares: 235
    },
    location: {
        latitude: 28.3580,
        longitude: -81.5900,
        address: "2901 Osceola Parkway, Lake Buena Vista, FL 32830"
    },
    operatingHours: {
        typical: {
            monday: { open: "08:00", close: "20:00" },
            tuesday: { open: "08:00", close: "20:00" },
            wednesday: { open: "08:00", close: "20:00" },
            thursday: { open: "08:00", close: "20:00" },
            friday: { open: "08:00", close: "21:00" },
            saturday: { open: "08:00", close: "21:00" },
            sunday: { open: "08:00", close: "20:00" }
        },
        extendedEvening: true,
        earlyEntry: true,
        specialEvents: ["Disney After Hours", "Earth Day Celebrations"]
    },
    lands: [
        {
            id: "oasis",
            name: "The Oasis",
            description: "Lush garden pathways featuring exotic plants and animals leading to Discovery Island",
            theme: "Tropical Gardens",
            attractions: ["oasis-exhibits"],
            dining: ["rainforest-cafe"],
            shops: ["garden-gate-gifts"]
        },
        {
            id: "discovery-island",
            name: "Discovery Island",
            description: "The park's hub centered around the iconic Tree of Life",
            theme: "Nature's Wonders",
            attractions: ["tree-life-theater", "discovery-island-trails"],
            dining: ["flame-tree-bbq", "pizzafari", "tiffins", "nomad-lounge", "isle-java"],
            shops: ["island-mercantile", "discovery-trading-company"]
        },
        {
            id: "pandora",
            name: "Pandora - The World of Avatar",
            description: "Journey to the alien moon from James Cameron's Avatar with floating mountains and bioluminescent forests",
            theme: "Alien World of Pandora",
            attractions: ["flight-passage", "navi-river"],
            dining: ["satuli-canteen", "pongu-pongu"],
            shops: ["windtraders", "colors-of-moara"]
        },
        {
            id: "africa",
            name: "Africa",
            description: "Authentic recreation of an East African village with live animals and cultural experiences",
            theme: "African Village and Savanna",
            attractions: ["kilimanjaro-safari", "gorilla-falls", "wildlife-express", "animation-experience"],
            dining: ["tusker-house", "harambe-market", "dawa-bar", "tamu-tamu"],
            shops: ["mombasa-marketplace", "zuri-sweets"]
        },
        {
            id: "asia",
            name: "Asia",
            description: "Journey through the villages and jungles of Asia with thrilling attractions",
            theme: "Asian Villages and Mythology",
            attractions: ["expedition-everest", "kali-river", "maharajah-jungle", "feathered-friends"],
            dining: ["yak-yeti", "yak-yeti-qs", "mr-kamal", "drinkwallah"],
            shops: ["bhaktapur-market", "mandala-gifts"]
        },
        {
            id: "dinoland-usa",
            name: "DinoLand U.S.A.",
            description: "Travel back to the age of dinosaurs (closing 2025 for Tropical Americas retheme)",
            theme: "Dinosaurs and Paleontology",
            attractions: ["dinosaur", "triceratop-spin", "boneyard", "fossil-fun"],
            dining: ["restaurantosaurus", "dino-diner"],
            shops: ["chester-hesters", "dino-treasures"]
        }
    ],
    attractions: [
        {
            id: "flight-passage",
            name: "Avatar Flight of Passage",
            landId: "pandora",
            type: "ride",
            description: "Soar on a Banshee over Pandora in this breathtaking 3D flying simulator",
            heightRequirement: {
                inches: 44,
                centimeters: 112
            },
            duration: {
                minutes: 6,
                variableLength: false
            },
            capacity: {
                hourly: 1600,
                vehicleCapacity: 48
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: true,
                audioDescription: false,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "SinglePass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 3,
            indoor: true,
            mustDo: true,
            tips: [
                "Most popular attraction - arrive before park opens",
                "Incredible queue with floating Avatar and lab",
                "Unique motorcycle-style seating",
                "3D glasses required - keep them clean"
            ],
            bestTimes: ["Rope drop", "Last hour of operation"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "kilimanjaro-safari",
            name: "Kilimanjaro Safaris",
            landId: "africa",
            type: "ride",
            description: "Open-air safari through African savanna with live animals roaming freely",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 22,
                variableLength: true
            },
            capacity: {
                hourly: 3000,
                vehicleCapacity: 36
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: true,
                audioDescription: true,
                handheldCaptioning: false,
                signLanguage: false,
                serviceAnimalsAllowed: true
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            thrillLevel: 1,
            indoor: false,
            mustDo: true,
            tips: [
                "Animals most active in morning and late afternoon",
                "Every ride is different based on animal behavior",
                "110-acre savanna with African wildlife",
                "Bumpy ride - hold cameras securely"
            ],
            bestTimes: ["First hour after opening", "Last 90 minutes before closing"],
            photoPass: false,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "expedition-everest",
            name: "Expedition Everest - Legend of the Forbidden Mountain",
            landId: "asia",
            type: "ride",
            description: "High-speed train adventure through the Himalayas encountering the Yeti",
            heightRequirement: {
                inches: 44,
                centimeters: 112
            },
            duration: {
                minutes: 3,
                variableLength: false
            },
            capacity: {
                hourly: 2000,
                vehicleCapacity: 34
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
            thrillLevel: 4,
            indoor: false,
            mustDo: true,
            tips: [
                "Goes backwards in the dark",
                "Single rider line saves significant time",
                "Incredible theming in queue and mountain",
                "Yeti animatronic currently in 'B-mode'"
            ],
            bestTimes: ["Single rider anytime", "Rope drop", "Last hour"],
            photoPass: true,
            rider: {
                swap: true,
                single: true
            },
            virtualQueue: false
        },
        {
            id: "dinosaur",
            name: "DINOSAUR",
            landId: "dinoland-usa",
            type: "ride",
            description: "Time travel adventure to save an Iguanodon before asteroid impact",
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
                vehicleCapacity: 12
            },
            accessibility: {
                wheelchairAccessible: false,
                transferRequired: true,
                assistiveListening: true,
                audioDescription: false,
                handheldCaptioning: true,
                signLanguage: false,
                serviceAnimalsAllowed: false
            },
            lightningLane: {
                available: true,
                tier: "MultiPass"
            },
            ageAppeal: ["kids", "tweens", "teens", "adults"],
            thrillLevel: 3,
            indoor: true,
            mustDo: false,
            tips: [
                "Very dark and loud - may frighten young children",
                "Jerky motion simulator movements",
                "Closing date TBD for Tropical Americas",
                "Same ride system as Indiana Jones at Disneyland"
            ],
            bestTimes: ["Anytime - rarely long waits"],
            photoPass: true,
            rider: {
                swap: true,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "navi-river",
            name: "Na'vi River Journey",
            landId: "pandora",
            type: "ride",
            description: "Gentle boat ride through bioluminescent rainforest of Pandora",
            heightRequirement: {
                inches: null,
                centimeters: null
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1200,
                vehicleCapacity: 8
            },
            accessibility: {
                wheelchairAccessible: true,
                transferRequired: false,
                assistiveListening: false,
                audioDescription: true,
                handheldCaptioning: false,
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
            mustDo: true,
            tips: [
                "Beautiful bioluminescent effects",
                "Shaman of Songs animatronic is incredible",
                "No height requirement - good for all ages",
                "Short ride but immersive experience"
            ],
            bestTimes: ["Last hour of operation", "During parades"],
            photoPass: false,
            rider: {
                swap: false,
                single: false
            },
            virtualQueue: false
        },
        {
            id: "kali-river",
            name: "Kali River Rapids",
            landId: "asia",
            type: "ride",
            description: "White-water rafting adventure through Asian rainforest",
            heightRequirement: {
                inches: 38,
                centimeters: 97
            },
            duration: {
                minutes: 5,
                variableLength: false
            },
            capacity: {
                hourly: 1800,
                vehicleCapacity: 12
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
            mustDo: false,
            tips: [
                "You WILL get wet - possibly soaked",
                "Poncho recommended but won't keep you dry",
                "Shortest Disney rapids ride",
                "Store belongings in center console"
            ],
            bestTimes: ["Hot afternoons", "Skip on cool days"],
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
                id: "tiffins",
                name: "Tiffins Restaurant",
                landId: "discovery-island",
                cuisine: ["International", "Signature"],
                description: "Signature dining celebrating travel and adventure with art from Imagineers",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$$$$",
                reservations: {
                    required: true,
                    recommended: true,
                    acceptsWalkUps: true
                },
                diningPlan: {
                    accepted: true,
                    credits: 2
                },
                menu: {
                    signature: ["Whole Fried Sustainable Fish", "Wagyu Strip Loin", "Pomegranate-Lacquered Chicken"],
                    categories: [
                        {
                            name: "Small Plates",
                            items: [
                                {
                                    name: "Charred Octopus",
                                    description: "Black-eyed pea fritters and heirloom tomatoes",
                                    price: "$22",
                                    dietary: ["gluten-free"]
                                },
                                {
                                    name: "Mushroom Soup",
                                    description: "Wild mushrooms with truffle oil and parmesan",
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
                    capacity: 252
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: true,
                    allergyFriendly: true
                },
                tips: [
                    "Most upscale restaurant in Animal Kingdom",
                    "Nomad Lounge attached for drinks and small plates",
                    "Art galleries showcase park design",
                    "Rivers of Light dining package available"
                ]
            },
            {
                id: "tusker-house",
                name: "Tusker House Restaurant",
                landId: "africa",
                cuisine: ["African", "American"],
                description: "Character buffet featuring Donald Duck and friends on safari",
                mealPeriods: ["breakfast", "lunch", "dinner"],
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
                    signature: ["Spit-Roasted Chicken", "Curry", "Bobotie", "Jungle Juice"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 340
                },
                characterDining: true,
                characters: ["Donald Duck", "Daisy Duck", "Mickey Mouse", "Goofy"],
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Characters in safari outfits",
                    "All-you-care-to-enjoy buffet",
                    "Often has same-day availability",
                    "Good variety for picky eaters"
                ]
            },
            {
                id: "yak-yeti",
                name: "Yak & Yeti Restaurant",
                landId: "asia",
                cuisine: ["Asian", "Pan-Asian"],
                description: "Pan-Asian cuisine in richly themed restaurant with artifacts",
                mealPeriods: ["lunch", "dinner"],
                priceRange: "$$",
                reservations: {
                    required: true,
                    recommended: true,
                    acceptsWalkUps: true
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["Ahi Tuna Nachos", "Kobe Beef Burger", "Lo Mein", "Fried Wontons"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 250
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Owned by Landry's - not Disney operated",
                    "Extensive menu with variety of Asian cuisines",
                    "Fried wontons dessert is guest favorite",
                    "Quick service window has different menu"
                ]
            },
            {
                id: "rainforest-cafe",
                name: "Rainforest Cafe",
                landId: "oasis",
                cuisine: ["American", "Seafood"],
                description: "Immersive rainforest environment with animatronic animals",
                mealPeriods: ["breakfast", "lunch", "dinner"],
                priceRange: "$$",
                reservations: {
                    required: false,
                    recommended: true,
                    acceptsWalkUps: true
                },
                diningPlan: {
                    accepted: true,
                    credits: 1
                },
                menu: {
                    signature: ["Volcano Dessert", "Awesome Appetizer", "Pastalaya"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 600
                },
                characterDining: false,
                mobileOrder: false,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Entrance outside park - no ticket needed",
                    "Can eat here without park admission",
                    "Thunderstorms every 20 minutes",
                    "Chain restaurant with standard menu"
                ]
            }
        ],
        quickService: [
            {
                id: "satuli-canteen",
                name: "Satu'li Canteen",
                landId: "pandora",
                cuisine: ["Healthy", "Bowl-Based"],
                description: "Customizable bowls with healthy ingredients inspired by Pandora",
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
                    signature: ["Bowl Combinations", "Cheeseburger Pods", "Blueberry Cheesecake"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: true,
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
                    "Best quick service in Animal Kingdom",
                    "Build your own bowl concept",
                    "Large portions good for sharing",
                    "Mobile order essential during busy times"
                ]
            },
            {
                id: "flame-tree-bbq",
                name: "Flame Tree Barbecue",
                landId: "discovery-island",
                cuisine: ["BBQ", "American"],
                description: "Smoked meats and classic BBQ sides with waterfront seating",
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
                    signature: ["Ribs & Chicken Combo", "Pulled Pork", "Baked Beans"],
                    categories: []
                },
                seating: {
                    indoor: false,
                    outdoor: true,
                    capacity: 400
                },
                characterDining: false,
                mobileOrder: true,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Beautiful outdoor seating areas by water",
                    "Can see Expedition Everest from some tables",
                    "Popular lunch spot - mobile order recommended",
                    "Limited covered seating"
                ]
            },
            {
                id: "harambe-market",
                name: "Harambe Market",
                landId: "africa",
                cuisine: ["African", "Mediterranean"],
                description: "Street market with African-inspired dishes from four walk-up windows",
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
                    signature: ["Grilled Chicken Skewers", "Beef Brochette", "Vegetable Samosas"],
                    categories: []
                },
                seating: {
                    indoor: false,
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
                    "Four different windows with unique menus",
                    "Authentic African flavors",
                    "Covered outdoor seating available",
                    "Try the sausage and corn dog"
                ]
            },
            {
                id: "yak-yeti-local",
                name: "Yak & Yeti Local Food Cafes",
                landId: "asia",
                cuisine: ["Asian", "American"],
                description: "Quick-service window adjacent to Yak & Yeti Restaurant",
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
                    signature: ["Korean BBQ Hot Dog", "Teriyaki Beef Bowl", "Egg Rolls"],
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
                    "Different menu from table service restaurant",
                    "Korean BBQ hot dog is popular",
                    "Limited seating available",
                    "Asian-fusion cuisine"
                ]
            },
            {
                id: "pizzafari",
                name: "Pizzafari",
                landId: "discovery-island",
                cuisine: ["Italian", "Pizza"],
                description: "Family-friendly restaurant serving pizza, salads, and Italian dishes",
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
                    signature: ["Flatbread Pizza", "Caesar Salad", "Meatball Sub"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 350
                },
                characterDining: false,
                mobileOrder: true,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Good option for families with kids",
                    "Air-conditioned indoor dining",
                    "Animal-themed dining rooms",
                    "Standard pizza fare"
                ]
            },
            {
                id: "restaurantosaurus",
                name: "Restaurantosaurus",
                landId: "dinoland-usa",
                cuisine: ["American", "Burgers"],
                description: "Dinosaur-themed restaurant with burgers, chicken, and kids' favorites",
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
                    signature: ["Angus Bacon Cheeseburger", "Crispy Chicken Sandwich", "Kids' Mac & Cheese"],
                    categories: []
                },
                seating: {
                    indoor: true,
                    outdoor: false,
                    capacity: 400
                },
                characterDining: false,
                mobileOrder: true,
                accessibility: {
                    wheelchairAccessible: true,
                    brailleMenu: false,
                    allergyFriendly: true
                },
                tips: [
                    "Classic American fare",
                    "Good for families with young kids",
                    "Dinosaur theming throughout",
                    "Will close when DinoLand is rethemed"
                ]
            }
        ],
        snacks: [
            {
                id: "pongu-pongu",
                name: "Pongu Pongu",
                landId: "pandora",
                type: "stand",
                items: ["Night Blossom", "Lumpia", "Dolewhip with Rum"],
                specialties: ["Night Blossom Drink", "Pineapple Lumpia"],
                seasonal: false,
                mobileOrder: true,
                location: "Pandora marketplace"
            },
            {
                id: "tamu-tamu",
                name: "Tamu Tamu Refreshments",
                landId: "africa",
                type: "stand",
                items: ["Dole Whip", "Dole Whip Floats", "Hot Dogs"],
                specialties: ["Dole Whip with Rum", "Simba Sunset"],
                seasonal: false,
                mobileOrder: false,
                location: "Near Festival of the Lion King"
            },
            {
                id: "mr-kamal",
                name: "Mr. Kamal's",
                landId: "asia",
                type: "cart",
                items: ["Seasoned Fries", "Hummus", "Frozen Beverages"],
                specialties: ["Seasoned Fries with Tzatziki"],
                seasonal: false,
                mobileOrder: false,
                location: "Near Kali River Rapids"
            },
            {
                id: "smiling-crocodile",
                name: "The Smiling Crocodile",
                landId: "discovery-island",
                type: "kiosk",
                items: ["Hot Dogs", "Loaded Mac & Cheese", "Beer"],
                specialties: ["Mac & Cheese with Pulled Pork"],
                seasonal: false,
                mobileOrder: false,
                location: "Near Tree of Life"
            }
        ]
    },
    entertainment: [
        {
            id: "festival-lion-king",
            name: "Festival of the Lion King",
            type: "show",
            description: "Broadway-caliber celebration of The Lion King with acrobats and puppetry",
            duration: { minutes: 30 },
            showtimes: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"],
            location: "Harambe Theater",
            capacity: 1500,
            lightningLane: true,
            seasonal: false,
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            tips: [
                "One of Disney's best live shows",
                "Covered outdoor theater",
                "Audience participation segments",
                "Arrive 20-30 minutes early for best seats"
            ]
        },
        {
            id: "finding-nemo-musical",
            name: "Finding Nemo - The Musical",
            type: "show",
            description: "Broadway-style musical adaptation of Finding Nemo with puppets",
            duration: { minutes: 40 },
            showtimes: ["10:30", "12:00", "13:30", "15:00", "16:30"],
            location: "Theater in the Wild",
            capacity: 1500,
            lightningLane: true,
            seasonal: false,
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults"],
            tips: [
                "Original songs not in the movie",
                "Innovative puppetry techniques",
                "Covered outdoor theater",
                "Longest show in Animal Kingdom"
            ]
        },
        {
            id: "feathered-friends",
            name: "Feathered Friends in Flight!",
            type: "show",
            description: "Free-flight bird show featuring exotic species from around the world",
            duration: { minutes: 25 },
            showtimes: ["09:30", "10:30", "11:30", "13:30", "14:30", "15:30"],
            location: "Asia - Caravan Stage",
            capacity: 1000,
            lightningLane: false,
            seasonal: false,
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            tips: [
                "Birds fly directly over audience",
                "Educational and entertaining",
                "Great photo opportunities",
                "Limited shade - bring sunscreen"
            ]
        },
        {
            id: "tree-awakens",
            name: "Tree of Life Awakenings",
            type: "show",
            description: "Projection show bringing Tree of Life to life with animal spirits",
            duration: { minutes: 10 },
            showtimes: "Every 10-15 minutes after dark",
            location: "Tree of Life",
            lightningLane: false,
            seasonal: false,
            ageAppeal: ["toddler", "preschool", "kids", "tweens", "teens", "adults", "seniors"],
            tips: [
                "Multiple viewing areas around tree",
                "Different shows rotate throughout night",
                "Best viewed from Discovery Island paths",
                "Begins approximately 15 minutes after sunset"
            ]
        }
    ],
    facilities: [
        {
            id: "baby-care-center",
            name: "Baby Care Center",
            type: "baby-care",
            locations: ["Discovery Island near First Aid"],
            features: ["Nursing rooms", "Changing tables", "Kitchen facilities", "Family restroom", "Quiet area"]
        },
        {
            id: "first-aid",
            name: "First Aid",
            type: "first-aid",
            locations: ["Discovery Island near Pizzafari"],
            features: ["Registered nurses", "Basic medical supplies", "Refrigeration for medications", "Quiet recovery area"]
        },
        {
            id: "guest-relations",
            name: "Guest Relations",
            type: "guest-relations",
            locations: ["Main entrance", "Discovery Island"],
            features: ["Disability Access Service", "Lost and Found", "Guest assistance", "Park maps"]
        }
    ],
    services: [
        {
            id: "wilderness-explorers",
            name: "Wilderness Explorers",
            type: "activity",
            description: "Interactive scavenger hunt earning badges throughout the park",
            locations: ["Throughout park - start at bridge to Africa"],
            cost: "Free",
            reservation: false
        },
        {
            id: "animation-experience",
            name: "The Animation Experience at Conservation Station",
            type: "activity",
            description: "Learn to draw Disney animal characters with animator",
            locations: ["Rafiki's Planet Watch"],
            cost: "Free",
            reservation: false
        },
        {
            id: "conservation-station",
            name: "Conservation Station",
            type: "experience",
            description: "Behind-scenes look at animal care and conservation efforts",
            locations: ["Rafiki's Planet Watch"],
            cost: "Free",
            reservation: false
        }
    ],
    accessibility: {
        overview: "Animal Kingdom provides accessibility while maintaining natural theming with some uneven terrain",
        services: {
            das: {
                available: true,
                description: "Available at Guest Relations locations"
            },
            wheelchairRental: {
                available: true,
                locations: ["Garden Gate Gifts near entrance"],
                cost: "$12 manual, $50 ECV per day plus $20 deposit"
            },
            interpreterServices: true,
            brailleGuidebooks: true,
            audioDescription: true
        },
        companionRestrooms: [
            "First Aid Station",
            "Baby Care Center",
            "Near Expedition Everest",
            "Pandora marketplace"
        ],
        quietAreas: [
            "Discovery Island trails",
            "Gorilla Falls Exploration Trail",
            "Behind Flame Tree Barbecue",
            "Conservation Station"
        ]
    },
    tips: [
        {
            category: "Planning",
            tips: [
                {
                    title: "Earliest Opening Time",
                    description: "Often opens at 8 AM - arrive 30 minutes early for Flight of Passage",
                    priority: "high"
                },
                {
                    title: "Shortest Park Hours",
                    description: "Usually closes earlier than other parks - plan accordingly",
                    priority: "high"
                },
                {
                    title: "Best for Morning Touring",
                    description: "Animals most active in morning, afternoon can be very hot",
                    priority: "medium"
                }
            ]
        },
        {
            category: "Touring",
            tips: [
                {
                    title: "Rope Drop Strategy",
                    description: "Choose between Flight of Passage or Safari first - can't do both efficiently",
                    priority: "high"
                },
                {
                    title: "Take Time to Explore",
                    description: "Walking trails have amazing animal exhibits often missed by rushing guests",
                    priority: "medium"
                },
                {
                    title: "Pandora at Night",
                    description: "Return after dark to see bioluminescent effects throughout land",
                    priority: "high"
                }
            ]
        },
        {
            category: "Comfort",
            tips: [
                {
                    title: "Most Walking of Any Park",
                    description: "Largest park with significant distances - comfortable shoes essential",
                    priority: "high"
                },
                {
                    title: "Limited Indoor Attractions",
                    description: "Fewer air-conditioned attractions than other parks",
                    priority: "medium"
                },
                {
                    title: "Bring Rain Gear",
                    description: "Many outdoor attractions and sudden storms common",
                    priority: "medium"
                }
            ]
        }
    ],
    transportation: {
        parkingLot: true,
        monorail: false,
        boat: false,
        bus: true,
        skyliner: false,
        walkable: false,
        resortAccess: {
            bus: ["All Disney resorts"]
        }
    },
    parkingInfo: {
        available: true,
        standard: {
            cost: "$30 per day",
            location: "Large parking lot with named sections"
        },
        preferred: {
            cost: "$50-55 per day",
            location: "Closer to entrance - worth it due to lot size"
        },
        trams: true,
        tips: [
            "Very large parking lot - remember your section",
            "Trams essential due to distance",
            "Arrive early for closer parking",
            "Consider preferred parking to save walking"
        ]
    }
}

// Additional Animal Kingdom specific data for enhanced features
export const animalKingdomEnhancedData = {
    conservation: {
        programs: [
            {
                id: "disney-conservation-fund",
                name: "Disney Conservation Fund",
                description: "Supporting wildlife conservation around the world",
                focus: ["Wildlife Protection", "Habitat Conservation", "Community Conservation"]
            },
            {
                id: "endangered-species",
                name: "Species Survival Plan",
                description: "Breeding programs for endangered species",
                species: ["Okapi", "Western Lowland Gorilla", "Bongo", "Addra Gazelle"]
            }
        ]
    },
    animalExperiences: {
        exhibits: [
            {
                id: "gorilla-falls",
                name: "Gorilla Falls Exploration Trail",
                location: "Africa",
                animals: ["Western Lowland Gorillas", "Hippos", "Naked Mole Rats", "Okapi"],
                duration: "30-45 minutes",
                tips: ["Best viewing early morning", "Follow the research station storyline"]
            },
            {
                id: "maharajah-jungle",
                name: "Maharajah Jungle Trek",
                location: "Asia",
                animals: ["Malayan Tapir", "Komodo Dragons", "Bats", "Asian Tigers"],
                duration: "20-30 minutes",
                tips: ["Tigers most active in morning", "Look for animal care presentations"]
            },
            {
                id: "discovery-trails",
                name: "Discovery Island Trails",
                location: "Discovery Island",
                animals: ["Kangaroos", "Otters", "Galapagos Tortoises"],
                duration: "15-20 minutes",
                tips: ["Often overlooked by guests", "Great for photos"]
            }
        ]
    },
    seasonalEvents: [
        {
            id: "earth-day",
            name: "Earth Day Celebration",
            dates: "April",
            description: "Special conservation presentations and activities",
            activities: ["Animal encounters", "Conservation education", "Special merchandise"]
        },
        {
            id: "after-hours",
            name: "Disney After Hours - Animal Kingdom",
            dates: "Select nights",
            description: "Extended park hours with limited attendance",
            benefits: ["Lower crowds", "Included snacks", "Character meet and greets"]
        }
    ]
}