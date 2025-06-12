import {
    DisneySpringsData,
    DisneySpringLocation,
    LocationCategory,
    LocationArea,
    ShoppingSubcategory,
    DiningSubcategory,
    EntertainmentSubcategory,
    PriceRange,
    District
} from '@/types/disneysprings'

// Raw JSON structure as provided
interface RawDisneySpringsData {
    disneySpings: { // Note: typo in original JSON key
        metadata: any;
        operationalInfo: any;
        districts: {
            marketplace: RawDistrict;
            theLanding: RawDistrict;
            townCenter: RawDistrict;
            westSide: RawDistrict;
        };
        categories: any;
        events: any;
        accessibility: any;
        services: any;
        tips: any;
    };
}

interface RawDistrict {
    name: string;
    theme: string;
    description: string;
    atmosphere: string;
    keyFeatures: string[];
    shopping?: RawLocation[];
    dining?: RawLocation[];
    entertainment?: RawLocation[];
}

interface RawLocation {
    name: string;
    type?: string;
    description: string;
    categories?: string[];
    specialties?: string[];
    exclusives?: boolean | string[];
    size?: string;
    features?: string[];
    shops?: Array<{ name: string; description: string }>;
    offerings?: string[];
    cuisine?: string[];
    requiresReservation?: boolean;
    diningPlans?: string[];
    menu?: Array<{
        name: string;
        description: string;
        price?: number;
        imageUrl?: string;
    }>;
    familyFriendly?: boolean;
    entertainment?: string;
    priceRange?: string;
    atmosphere?: string;
    theme?: string;
    chef?: string;
    signature?: string;
    popular?: boolean;
    artisanal?: boolean;
    target?: string;
    dietary?: string;
    services?: string[];
    ticketRequired?: boolean;
    ticketed?: boolean;
    capacity?: string;
    height?: string;
    duration?: string;
    ageRecommendation?: string;
    ageRequirement?: string;
    show?: string;
    schedule?: string;
    performances?: string[];
    location?: string;
    floors?: number;
}

// Transform the raw JSON data into our structured format
export function transformDisneySpringsData(rawData: RawDisneySpringsData): DisneySpringsData {
    const data = rawData.disneySpings; // Handle the typo in the original JSON

    return {
        metadata: data.metadata,
        operationalInfo: data.operationalInfo,
        districts: {
            marketplace: transformDistrict(data.districts.marketplace, LocationArea.Marketplace),
            theLanding: transformDistrict(data.districts.theLanding, LocationArea.TheLanding),
            townCenter: transformDistrict(data.districts.townCenter, LocationArea.TownCenter),
            westSide: transformDistrict(data.districts.westSide, LocationArea.WestSide)
        },
        categories: data.categories,
        events: data.events,
        accessibility: data.accessibility,
        services: data.services,
        tips: data.tips
    };
}

function transformDistrict(rawDistrict: RawDistrict, area: LocationArea): District {
    const shopping = rawDistrict.shopping?.map(location =>
        transformLocation(location, LocationCategory.Shopping, area)
    ) || [];

    const dining = rawDistrict.dining?.map(location =>
        transformLocation(location, LocationCategory.Dining, area)
    ) || [];

    const entertainment = rawDistrict.entertainment?.map(location =>
        transformLocation(location, LocationCategory.Entertainment, area)
    ) || [];

    return {
        name: rawDistrict.name,
        theme: rawDistrict.theme,
        description: rawDistrict.description,
        atmosphere: rawDistrict.atmosphere,
        keyFeatures: rawDistrict.keyFeatures,
        shopping,
        dining,
        entertainment
    };
}

function transformLocation(
    rawLocation: RawLocation,
    category: LocationCategory,
    area: LocationArea
): DisneySpringLocation {
    // Generate ID from name
    const id = generateLocationId(rawLocation.name);

    // Generate placeholder image URL
    const imageUrl = `/images/disney-springs/${id}.jpg`;

    // Map price range
    const priceRange = mapPriceRange(rawLocation.priceRange);

    // Generate tags from various fields
    const tags = generateTags(rawLocation, category);

    // Determine subcategory
    const subcategory = determineSubcategory(rawLocation, category);

    const baseLocation: DisneySpringLocation = {
        id,
        name: rawLocation.name,
        description: rawLocation.description,
        category,
        area,
        tags,
        imageUrl,
        priceRange,
        // Enhanced fields from raw data
        type: rawLocation.type,
        features: rawLocation.features,
        specialties: rawLocation.specialties,
        exclusives: rawLocation.exclusives,
        size: rawLocation.size,
        floors: rawLocation.floors,
        theme: rawLocation.theme,
        atmosphere: rawLocation.atmosphere,
        popular: rawLocation.popular,
        artisanal: rawLocation.artisanal,
        target: rawLocation.target,
        chef: rawLocation.chef,
        signature: rawLocation.signature,
        dietary: rawLocation.dietary,
        services: rawLocation.services,
        ticketRequired: rawLocation.ticketRequired || rawLocation.ticketed,
        capacity: rawLocation.capacity,
        height: rawLocation.height
    };

    // Add category-specific fields
    if (category === LocationCategory.Dining) {
        return {
            ...baseLocation,
            cuisine: rawLocation.cuisine,
            requiresReservation: rawLocation.requiresReservation,
            diningPlans: rawLocation.diningPlans,
            menu: rawLocation.menu,
            familyFriendly: rawLocation.familyFriendly,
            entertainment: rawLocation.entertainment
        };
    }

    if (category === LocationCategory.Shopping) {
        return {
            ...baseLocation,
            categories: rawLocation.categories,
            offerings: rawLocation.offerings
        };
    }

    if (category === LocationCategory.Entertainment) {
        return {
            ...baseLocation,
            ageRecommendation: rawLocation.ageRecommendation,
            duration: rawLocation.duration,
            ageRequirement: rawLocation.ageRequirement,
            show: rawLocation.show,
            schedule: rawLocation.schedule,
            performances: rawLocation.performances,
            location: rawLocation.location
        };
    }

    return baseLocation;
}

function generateLocationId(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function mapPriceRange(priceRange?: string): PriceRange | undefined {
    if (!priceRange) return undefined;

    switch (priceRange) {
        case '$':
            return PriceRange.Low;
        case '$$':
            return PriceRange.Medium;
        case '$$$':
            return PriceRange.High;
        case '$$$$':
            return PriceRange.VeryHigh;
        default:
            return undefined;
    }
}

function generateTags(rawLocation: RawLocation, category: LocationCategory): string[] {
    const tags: string[] = [];

    // Add category-specific tags
    if (rawLocation.specialties) {
        tags.push(...rawLocation.specialties);
    }

    if (rawLocation.features) {
        tags.push(...rawLocation.features.slice(0, 3)); // Limit features as tags
    }

    if (rawLocation.cuisine) {
        tags.push(...rawLocation.cuisine);
    }

    if (rawLocation.categories) {
        tags.push(...rawLocation.categories);
    }

    // Add descriptive tags based on content
    if (rawLocation.familyFriendly) {
        tags.push('Family-friendly');
    }

    if (rawLocation.popular) {
        tags.push('Popular');
    }

    if (rawLocation.artisanal) {
        tags.push('Artisan');
    }

    if (rawLocation.chef) {
        tags.push('Celebrity chef');
    }

    if (rawLocation.entertainment) {
        tags.push('Live entertainment');
    }

    if (rawLocation.ticketRequired || rawLocation.ticketed) {
        tags.push('Ticketed');
    }

    // Remove duplicates and return
    return [...new Set(tags)].slice(0, 8); // Limit to 8 tags
}

function determineSubcategory(rawLocation: RawLocation, category: LocationCategory): string | undefined {
    if (category === LocationCategory.Shopping) {
        if (rawLocation.type?.toLowerCase().includes('apparel') || rawLocation.specialties?.some(s => s.toLowerCase().includes('apparel'))) {
            return ShoppingSubcategory.ApparelAndAccessories;
        }
        if (rawLocation.type?.toLowerCase().includes('toy') || rawLocation.name.toLowerCase().includes('lego')) {
            return ShoppingSubcategory.ToysAndPlush;
        }
        if (rawLocation.type?.toLowerCase().includes('beauty') || rawLocation.name.toLowerCase().includes('sephora')) {
            return ShoppingSubcategory.HealthAndBeauty;
        }
        if (rawLocation.type?.toLowerCase().includes('luxury') || rawLocation.name.toLowerCase().includes('kate spade')) {
            return ShoppingSubcategory.LuxuryAccessories;
        }
        if (rawLocation.type?.toLowerCase().includes('jewelry') || rawLocation.name.toLowerCase().includes('pandora')) {
            return ShoppingSubcategory.Jewelry;
        }
        if (rawLocation.type?.toLowerCase().includes('home') || rawLocation.specialties?.some(s => s.toLowerCase().includes('home'))) {
            return ShoppingSubcategory.HomeDecor;
        }
        if (rawLocation.type?.toLowerCase().includes('chocolate') || rawLocation.artisanal) {
            return ShoppingSubcategory.ArtisanChocolate;
        }
        return ShoppingSubcategory.GiftsAndHousewares;
    }

    if (category === LocationCategory.Dining) {
        if (rawLocation.type === 'Table Service') {
            return DiningSubcategory.TableService;
        }
        if (rawLocation.type === 'Quick Service') {
            return DiningSubcategory.QuickService;
        }
        if (rawLocation.type === 'Lounge' || rawLocation.name.toLowerCase().includes('bar')) {
            return DiningSubcategory.BarsAndLounges;
        }
        if (rawLocation.type?.toLowerCase().includes('specialty') || rawLocation.specialties?.length) {
            return DiningSubcategory.SpecialtyFoodAndBeverage;
        }
        return DiningSubcategory.TableService; // Default for dining
    }

    if (category === LocationCategory.Entertainment) {
        if (rawLocation.type?.toLowerCase().includes('theater') || rawLocation.show) {
            return EntertainmentSubcategory.LiveTheater;
        }
        if (rawLocation.type?.toLowerCase().includes('movie') || rawLocation.name.toLowerCase().includes('amc')) {
            return EntertainmentSubcategory.MovieTheater;
        }
        if (rawLocation.type?.toLowerCase().includes('bowling')) {
            return EntertainmentSubcategory.BowlingAndDining;
        }
        if (rawLocation.type?.toLowerCase().includes('balloon')) {
            return EntertainmentSubcategory.BalloonRide;
        }
        if (rawLocation.type?.toLowerCase().includes('interactive')) {
            return EntertainmentSubcategory.InteractiveAttraction;
        }
        if (rawLocation.type?.toLowerCase().includes('venue')) {
            return EntertainmentSubcategory.LivePerformanceVenue;
        }
        return EntertainmentSubcategory.LivePerformanceVenue; // Default for entertainment
    }

    return undefined;
}

// Get all locations from the transformed data
export function getAllLocationsFromData(data: DisneySpringsData): DisneySpringLocation[] {
    const allLocations: DisneySpringLocation[] = [];

    Object.values(data.districts).forEach(district => {
        allLocations.push(...district.shopping);
        allLocations.push(...district.dining);
        allLocations.push(...district.entertainment);
    });

    return allLocations;
}

// Sample transformation for the provided JSON
export const transformedDisneySpringsData = {
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
        // ... rest of the data structure would continue here
        // This is a sample showing the structure
    }
};