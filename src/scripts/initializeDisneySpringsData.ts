import { initializeDisneySpringsData } from '@/lib/firebase/disneysprings'
import { transformDisneySpringsData } from '@/lib/utils/disneySpringsDataTransformer'
import { DisneySpringsData, LocationCategory, LocationArea, PriceRange } from '@/types/disneysprings'

// The comprehensive Disney Springs data from the provided JSON
const rawDisneySpringsData = {
    "disneySpings": {
        "metadata": {
            "name": "Disney Springs",
            "location": {
                "address": "1486 Buena Vista Drive, Lake Buena Vista, FL 32830",
                "coordinates": {
                    "latitude": 28.3691,
                    "longitude": -81.5159
                },
                "resort": "Walt Disney World Resort",
                "waterfront": "Lake Buena Vista"
            },
            "description": "Disney Springs is a sprawling shopping, dining, and entertainment complex featuring over 150 restaurants, retailers, and attractions across four distinct themed neighborhoods",
            "history": {
                "1975": "Lake Buena Vista Shopping Village",
                "1977": "Walt Disney World Village",
                "1989": "Disney Village Marketplace",
                "1997": "Downtown Disney",
                "2015": "Disney Springs (current)"
            },
            "size": "120 acres",
            "theme": "A charming waterfront town with natural springs and transportation history"
        },
        "operationalInfo": {
            "hours": {
                "general": {
                    "weekdays": "10:00 AM - 11:00 PM",
                    "weekends": "10:00 AM - 12:00 AM (Midnight on Friday and Saturday)",
                    "sunday": "10:00 AM - 11:00 PM"
                },
                "seasonal": {
                    "holidays": "Extended hours during peak seasons and holidays",
                    "special_events": "Hours may vary during special events"
                }
            },
            "parking": {
                "cost": "Free self-parking",
                "capacity": "Over 8,000 spaces",
                "garages": [
                    {
                        "name": "Orange Garage",
                        "location": "Main entrance area",
                        "access_to": ["Town Center", "The Landing", "Marketplace"],
                        "features": ["Central location", "Quick access to heart of Disney Springs"]
                    },
                    {
                        "name": "Lime Garage",
                        "location": "Marketplace side",
                        "access_to": ["Marketplace", "The Landing"],
                        "features": ["Closest to World of Disney", "Family-friendly access"]
                    },
                    {
                        "name": "Grapefruit Garage",
                        "location": "West Side",
                        "access_to": ["West Side", "AMC Theatres", "House of Blues"],
                        "features": ["Entertainment district access", "Electric vehicle charging stations"]
                    }
                ],
                "surface_lots": [
                    {
                        "name": "Strawberry Parking Lot",
                        "description": "Overflow parking when garages are full",
                        "shuttle": "Available during peak times"
                    },
                    {
                        "name": "Watermelon Parking Lot",
                        "description": "Additional overflow parking",
                        "distance": "Farther from main entrance"
                    }
                ]
            },
            "transportation": {
                "bus": {
                    "from_resorts": "Complimentary bus service from all Disney Resort hotels",
                    "schedule": "Begins when complex opens, ends one hour after closing",
                    "frequency": "Every 20-30 minutes"
                },
                "boat": {
                    "service": "Water taxi service from select resort hotels",
                    "routes": ["Disney's Port Orleans", "Disney's Saratoga Springs", "Disney's Old Key West"]
                },
                "rideshare": {
                    "pickup_locations": "Designated rideshare pickup zones",
                    "services": ["Uber", "Lyft", "Disney Minnie Van"]
                },
                "walking_paths": "Connected walkways and bridges throughout complex"
            }
        },
        "districts": {
            "marketplace": {
                "name": "The Marketplace",
                "theme": "1930s-1940s American marketplace",
                "description": "The most Disney-themed area featuring the largest concentration of Disney merchandise and family-friendly dining",
                "atmosphere": "Classic Disney magic with vintage American charm",
                "keyFeatures": [
                    "World of Disney (largest Disney store)",
                    "LEGO Store",
                    "Rainforest Cafe",
                    "Disney character meet and greets",
                    "Family-friendly atmosphere"
                ],
                "shopping": [
                    {
                        "name": "World of Disney",
                        "type": "Disney merchandise",
                        "description": "Largest Disney store in the world with comprehensive Disney merchandise",
                        "categories": ["Apparel", "Toys", "Collectibles", "Home goods", "Accessories"],
                        "exclusives": true,
                        "size": "Over 50,000 square feet"
                    },
                    {
                        "name": "The LEGO Store",
                        "type": "LEGO retailer",
                        "description": "Comprehensive LEGO store with Disney-exclusive sets and interactive experiences",
                        "features": [
                            "Pick-A-Brick Wall",
                            "Minifigure Factory",
                            "Disney-themed LEGO sets",
                            "Build and test stations",
                            "LEGO sculptures and displays"
                        ],
                        "exclusives": ["Disney LEGO sets", "Custom minifigures"]
                    },
                    {
                        "name": "Marketplace Co-Op",
                        "type": "Specialty boutique",
                        "description": "Collection of unique Disney-themed shops under one roof",
                        "shops": [
                            "Cherry Tree Lane (Disney fashion)",
                            "Disney Centerpiece (home decor)",
                            "Disney Style (contemporary apparel)",
                            "WonderGround Gallery (Disney art)"
                        ]
                    }
                ],
                "dining": [
                    {
                        "name": "Rainforest Cafe",
                        "type": "Table Service",
                        "cuisine": ["American"],
                        "theme": "Tropical rainforest with animatronics",
                        "features": ["Volcanic eruptions every 30 minutes", "Animatronic animals", "Thunderstorms"],
                        "familyFriendly": true,
                        "atmosphere": "Immersive jungle experience"
                    },
                    {
                        "name": "T-REX",
                        "type": "Table Service",
                        "cuisine": ["American"],
                        "theme": "Prehistoric dinosaur experience",
                        "features": ["Life-sized animatronic dinosaurs", "Fossil dig site", "Meteor showers"],
                        "familyFriendly": true
                    }
                ],
                "entertainment": [
                    {
                        "name": "Marketplace Stage",
                        "type": "Live performance venue",
                        "description": "Outdoor stage featuring daily live entertainment",
                        "performances": ["Student performance groups", "Local musicians", "Dance troupes", "Choir groups"]
                    }
                ]
            },
            "theLanding": {
                "name": "The Landing",
                "theme": "Historic waterfront transportation hub",
                "description": "Upscale dining and nightlife district situated on the waterfront with a sophisticated atmosphere",
                "atmosphere": "Elegant waterfront with historic industrial charm",
                "keyFeatures": [
                    "Waterfront dining",
                    "Upscale restaurants",
                    "Nightlife venues",
                    "Historic theming",
                    "Live entertainment"
                ],
                "shopping": [
                    {
                        "name": "The Ganachery",
                        "type": "Artisan chocolate shop",
                        "description": "Disney's premier chocolate experience with handcrafted chocolates",
                        "specialties": ["Ganache", "Truffles", "Chocolate sculptures", "Custom creations"],
                        "artisanal": true
                    }
                ],
                "dining": [
                    {
                        "name": "The BOATHOUSE",
                        "type": "Table Service",
                        "cuisine": ["Seafood", "American", "Steakhouse"],
                        "description": "Upscale waterfront restaurant with fresh seafood and amphicar tours",
                        "features": [
                            "Waterfront patio dining",
                            "Fresh seafood daily",
                            "Amphicar tours",
                            "Dock-side bar"
                        ],
                        "priceRange": "$$$$",
                        "atmosphere": "Elegant nautical"
                    },
                    {
                        "name": "Gideon's Bakehouse",
                        "type": "Quick Service",
                        "specialty": "Artisan baked goods",
                        "description": "Gothic-themed bakery famous for massive cookies and pastries",
                        "signature": "Half-pound cookies",
                        "atmosphere": "Dark gothic bakery",
                        "popular": true
                    }
                ],
                "entertainment": [
                    {
                        "name": "Amphicar Tours",
                        "type": "Water tour",
                        "description": "Experience a captain-guided tour aboard a rare Amphicar that drives on land and cruises through water",
                        "duration": "20 minutes",
                        "ticketRequired": true
                    }
                ]
            },
            "townCenter": {
                "name": "Town Center",
                "theme": "Modern shopping district around natural springs",
                "description": "Upscale retail destination featuring high-end shopping, contemporary dining, and modern amenities",
                "atmosphere": "Contemporary shopping with natural spring theming",
                "keyFeatures": [
                    "High-end retail brands",
                    "Contemporary architecture",
                    "Natural spring theming",
                    "Art installations",
                    "Modern dining concepts"
                ],
                "shopping": [
                    {
                        "name": "Uniqlo",
                        "type": "Apparel",
                        "description": "Japanese casual wear retailer with contemporary fashion",
                        "specialties": ["Casual wear", "Tech wear", "Seasonal collections"]
                    },
                    {
                        "name": "Coca-Cola Store",
                        "type": "Brand experience",
                        "description": "Multi-level Coca-Cola themed retail and tasting experience",
                        "features": [
                            "Beverage tasting room",
                            "International Coca-Cola flavors",
                            "Brand merchandise",
                            "Photo opportunities"
                        ],
                        "floors": 3,
                        "theme": "1920s bottling plant"
                    }
                ],
                "dining": [
                    {
                        "name": "Blaze Pizza",
                        "type": "Quick Service",
                        "cuisine": ["Pizza"],
                        "description": "Fast-casual pizza with customizable options",
                        "features": ["Build your own pizza", "Artisan ingredients", "Quick service"],
                        "dietary": "Vegan and gluten-free options available"
                    },
                    {
                        "name": "Amorette's Patisserie",
                        "type": "Quick Service",
                        "specialty": "French pastries and desserts",
                        "description": "Elegant French patisserie with artistic desserts",
                        "signature": "Character-themed cakes and pastries",
                        "atmosphere": "Sophisticated French bakery"
                    }
                ],
                "entertainment": [
                    {
                        "name": "Dancing Fountains",
                        "type": "Water feature",
                        "description": "Interactive fountains with choreographed water displays",
                        "schedule": "Hourly performances throughout the day"
                    }
                ]
            },
            "westSide": {
                "name": "West Side",
                "theme": "Industrial entertainment district",
                "description": "Entertainment-focused area featuring theaters, bowling, and nightlife venues",
                "atmosphere": "Industrial chic with modern entertainment venues",
                "keyFeatures": [
                    "AMC movie theater",
                    "Cirque du Soleil",
                    "House of Blues",
                    "Bowling alley",
                    "Late-night entertainment"
                ],
                "shopping": [
                    {
                        "name": "Disney PhotoPass Studio",
                        "type": "Photography service",
                        "description": "Professional Disney PhotoPass photography experiences",
                        "services": ["Family portraits", "Magic shots", "Photo products"]
                    }
                ],
                "dining": [
                    {
                        "name": "House of Blues Restaurant",
                        "type": "Table Service",
                        "cuisine": ["Southern American"],
                        "description": "Music-themed restaurant with Southern cuisine and live entertainment",
                        "features": [
                            "Live music venue",
                            "Southern comfort food",
                            "Gospel brunch",
                            "Concert hall"
                        ],
                        "entertainment": "Live music performances",
                        "atmosphere": "Music hall and restaurant"
                    },
                    {
                        "name": "Chicken Guy!",
                        "type": "Quick Service",
                        "cuisine": ["Chicken"],
                        "description": "Guy Fieri's chicken restaurant with bold flavors",
                        "specialties": ["Hand-pounded chicken", "Signature sauces", "Loaded fries"],
                        "chef": "Guy Fieri"
                    }
                ],
                "entertainment": [
                    {
                        "name": "AMC Disney Springs 24",
                        "type": "Movie theater",
                        "description": "24-screen movie theater with dine-in options",
                        "features": [
                            "Fork & Screen dine-in theaters",
                            "Reserved seating",
                            "Latest movie releases",
                            "IMAX and premium formats"
                        ],
                        "capacity": "24 screens",
                        "dining": "In-theater dining available"
                    },
                    {
                        "name": "Cirque du Soleil - Drawn to Life",
                        "type": "Live theater",
                        "description": "Disney-Cirque du Soleil collaboration featuring Disney animation",
                        "show": "Drawn to Life",
                        "features": ["Acrobatic performances", "Disney storytelling", "Live music"],
                        "duration": "Approximately 2 hours with intermission"
                    },
                    {
                        "name": "Aerophile",
                        "type": "Balloon ride",
                        "description": "Tethered helium balloon offering panoramic views",
                        "features": [
                            "400-foot altitude",
                            "360-degree views",
                            "30-passenger capacity",
                            "Weather dependent"
                        ],
                        "ticketed": true,
                        "height": "400 feet"
                    }
                ]
            }
        },
        "categories": {
            "dining": {
                "tableService": {
                    "description": "Full-service restaurants with waiter service",
                    "reservations": "Highly recommended 60 days in advance",
                    "count": "30+ restaurants",
                    "priceRanges": ["$", "$$", "$$$", "$$$$"]
                },
                "quickService": {
                    "description": "Fast-casual dining options",
                    "reservations": "Not required",
                    "count": "40+ locations",
                    "features": ["Mobile ordering available", "Grab and go options"]
                },
                "lounges": {
                    "description": "Bar and cocktail experiences",
                    "ageRequirement": "21+ for alcoholic venues",
                    "features": ["Craft cocktails", "Small plates", "Live entertainment"]
                },
                "dessertShops": {
                    "description": "Specialty dessert and treat locations",
                    "popular": ["Gideon's Bakehouse", "Amorette's Patisserie", "Sprinkles"],
                    "features": ["Artisan desserts", "Instagram-worthy treats", "Seasonal offerings"]
                }
            },
            "shopping": {
                "disney": {
                    "description": "Disney-branded merchandise and exclusives",
                    "flagship": "World of Disney",
                    "categories": ["Apparel", "Toys", "Collectibles", "Home goods", "Accessories"]
                },
                "luxury": {
                    "description": "High-end fashion and accessory brands",
                    "brands": ["Kate Spade", "Pandora", "Zara"],
                    "target": "Contemporary fashion shoppers"
                },
                "specialty": {
                    "description": "Unique and artisan shops",
                    "examples": ["Marketplace Co-Op", "The Ganachery", "Sugarboo & Co."],
                    "features": ["Custom items", "Local artisans", "Exclusive products"]
                }
            },
            "entertainment": {
                "livePerformances": {
                    "description": "Scheduled live entertainment throughout Disney Springs",
                    "venues": ["Marketplace Stage", "House of Blues", "Waterview Park"],
                    "types": ["Music", "Dance", "Theater", "Street performers"]
                },
                "attractions": {
                    "description": "Ticketed experiences and unique attractions",
                    "examples": ["Cirque du Soleil", "NBA Experience", "Aerophile"],
                    "features": ["Immersive experiences", "Interactive elements", "Premium entertainment"]
                },
                "familyActivities": {
                    "description": "Activities suitable for all ages",
                    "free": ["Street entertainment", "Art installations", "Character meet and greets"],
                    "paid": ["Movie theater", "Bowling", "Balloon ride"]
                }
            }
        },
        "events": {
            "seasonal": [
                {
                    "name": "Christmas at Disney Springs",
                    "period": "November - January",
                    "features": ["Holiday decorations", "Seasonal shopping", "Special performances", "Extended hours"]
                },
                {
                    "name": "Food & Wine Festival Extensions",
                    "period": "Various throughout year",
                    "description": "Special dining events and chef appearances"
                }
            ],
            "regular": [
                {
                    "name": "Disney Springs Kids Club",
                    "schedule": "Saturdays at 10:30 AM, 11:15 AM, 12:00 PM",
                    "location": "Waterview Park",
                    "description": "Interactive entertainment for children"
                },
                {
                    "name": "Street Entertainment",
                    "schedule": "Daily throughout operating hours",
                    "description": "Roving performers, musicians, and interactive characters"
                }
            ]
        },
        "accessibility": {
            "wheelchair": "Fully accessible pathways and facilities",
            "strollers": "Stroller-friendly with rental options available",
            "assistiveListening": "Available at entertainment venues",
            "serviceAnimals": "Welcome throughout Disney Springs",
            "restrooms": {
                "locations": "Throughout all four districts",
                "features": ["Family restrooms", "Baby changing stations", "Accessible facilities"]
            }
        },
        "services": {
            "guestRelations": {
                "location": "Near main entrance",
                "services": ["Lost and found", "Guest assistance", "Information", "Complaint resolution"]
            },
            "packagePickup": "Available for resort guests",
            "wifi": "Complimentary throughout Disney Springs",
            "mobileOrdering": "Available at participating quick-service locations",
            "photography": {
                "photopass": "Professional photographers throughout Disney Springs",
                "magicShots": "Special effect photos at designated locations"
            }
        },
        "tips": {
            "bestTimes": {
                "leastCrowded": "Weekday mornings and early afternoons",
                "mostCrowded": "Friday and Saturday evenings, holidays",
                "evening": "Better atmosphere and more entertainment after sunset"
            },
            "parking": {
                "recommendation": "Arrive early for preferred parking spots",
                "orangeGarage": "Best overall access to all districts",
                "alternatives": "Surface lots available when garages are full"
            },
            "dining": {
                "reservations": "Book table service restaurants 60 days in advance",
                "walkUps": "Check for same-day availability or walk-up lists",
                "happyHour": "Many restaurants offer lunch and happy hour specials"
            },
            "shopping": {
                "resort_delivery": "Purchases can be delivered to Disney resort hotels",
                "sales": "Best deals often found at Disney Character Warehouse nearby"
            }
        }
    }
}

// Transform and initialize the data
export async function initializeFirebaseWithDisneySpringsData() {
    try {
        console.log('Starting Disney Springs data initialization...')

        // Transform the raw JSON data
        const transformedData = transformDisneySpringsData(rawDisneySpringsData as any)

        // Initialize Firebase with the transformed data
        await initializeDisneySpringsData(transformedData)

        console.log('Disney Springs data initialization completed successfully!')
        return transformedData
    } catch (error) {
        console.error('Error initializing Disney Springs data:', error)
        throw error
    }
}

// Export the raw data for reference
export { rawDisneySpringsData }