/**
 * Complete type definitions for themeparks.wiki API
 * Based on the Magic Kingdom Park API references
 */

// Entity types enum
export enum EntityType {
    DESTINATION = 'DESTINATION',
    PARK = 'PARK',
    ATTRACTION = 'ATTRACTION',
    RESTAURANT = 'RESTAURANT',
    SHOW = 'SHOW',
    HOTEL = 'HOTEL'
}

// Base entity interface
export interface ThemeParksEntity {
    id: string
    name: string
    slug: string | null
    entityType: EntityType
    parentId?: string
    externalId?: string
    location?: {
        latitude: number
        longitude: number
    }
}

// Park-specific entity
export interface ThemeParksPark extends ThemeParksEntity {
    entityType: EntityType.PARK
    timezone: string
    destinationId: string
    location: {
        latitude: number
        longitude: number
        pointsOfInterest: unknown[]
    }
}

// Destination entity
export interface ThemeParksDestination extends ThemeParksEntity {
    entityType: EntityType.DESTINATION
    timezone: string
    children?: ThemeParksEntity[]
}

// Live data types
export interface LiveDataItem {
    id: string
    name: string
    entityType: EntityType
    status: 'OPERATING' | 'CLOSED' | 'REFURBISHMENT' | 'DOWN'
    queue?: {
        STANDBY?: {
            waitTime: number | null
        }
        RETURN_TIME?: {
            state: 'AVAILABLE' | 'FINISHED'
            returnStart?: string
            returnEnd?: string
        }
        PAID_RETURN_TIME?: {
            state: 'AVAILABLE' | 'FINISHED'
            price?: {
                amount: number
                currency: string
            }
            returnStart?: string
            returnEnd?: string
        }
    }
    showtimes?: ShowTime[]
    operatingHours?: OperatingHour[]
    forecast?: unknown
}

export interface ShowTime {
    startTime: string
    endTime?: string
    type: 'PERFORMANCE' | 'PARADE' | 'FIREWORKS'
}

export interface OperatingHour {
    openingTime: string
    closingTime: string
    type?: 'OPERATING' | 'EXTRA_MAGIC' | 'SPECIAL_EVENT'
}

// Schedule types
export interface ScheduleEntry {
    date: string
    type: 'OPERATING' | 'EXTRA_MAGIC' | 'SPECIAL_EVENT' | 'TICKETED_EVENT'
    openingTime: string
    closingTime: string
    specialHours?: {
        type: string
        openingTime: string
        closingTime: string
    }[]
}

// Full live data response
export interface LiveDataResponse {
    id: string
    name: string
    entityType: EntityType
    liveData: LiveDataItem[]
    lastUpdate: string
}

// Schedule response
export interface ScheduleResponse {
    id: string
    name: string
    entityType: EntityType
    schedule: ScheduleEntry[]
}

// Children response (for attractions, restaurants, etc.)
export interface ChildrenResponse {
    id: string
    name: string
    entityType: EntityType
    timezone: string
    children: ThemeParksEntity[]
}

// Park IDs mapping
export const PARK_IDS = {
    MAGIC_KINGDOM: '75ea578a-adc8-4116-a54d-dccb60765ef9',
    EPCOT: '47f90d2c-e191-4239-a466-5892ef59a88b',
    HOLLYWOOD_STUDIOS: '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
    ANIMAL_KINGDOM: '1c84a229-8862-4648-9c71-378ddd2c7693',
    WALT_DISNEY_WORLD_RESORT: 'e957da41-3552-4cf6-b636-5babc5cbc4e5'
} as const

export type ParkId = typeof PARK_IDS[keyof typeof PARK_IDS]

// =============================================================================
// DISNEY PARK COMPREHENSIVE TYPE DEFINITIONS
// =============================================================================

// Enums and type definitions
export type AttractionType = "ride" | "show" | "walkthrough" | "playground" | "exhibit" | "meet-greet"
export type AgeGroup = "toddler" | "preschool" | "kids" | "tweens" | "teens" | "adults" | "seniors"
export type MealPeriod = "breakfast" | "lunch" | "dinner" | "brunch" | "allday"

// Menu item interfaces
export interface MenuItem {
    name: string
    description: string
    price?: string
    dietary?: string[]
}

export interface MenuCategory {
    name: string
    items: MenuItem[]
}

// Main Disney Park interface
export interface DisneyPark {
    id: string
    name: string
    abbreviation: string
    description: string
    opened: string
    theme: string
    size: {
        acres: number
        hectares: number
    }
    location: {
        latitude: number
        longitude: number
        address: string
    }
    operatingHours: {
        typical: {
            [key: string]: {
                open: string
                close: string
            }
        }
        extendedEvening: boolean
        earlyEntry: boolean
        specialEvents: string[]
    }
    lands: Land[]
    attractions: Attraction[]
    dining: {
        tableService: Restaurant[]
        quickService: Restaurant[]
        snacks: SnackLocation[]
    }
    entertainment: Entertainment[]
    facilities: Facility[]
    services: Service[]
    accessibility: AccessibilityInfo
    tips: TipCategory[]
    transportation: Transportation
    parkingInfo: ParkingInfo
}

// Land interface
export interface Land {
    id: string
    name: string
    description: string
    theme: string
    attractions: string[] // Array of attraction IDs
    dining: string[] // Array of restaurant IDs
    shops: string[] // Array of shop IDs
}

// Attraction interface
export interface Attraction {
    id: string
    name: string
    landId: string
    type: AttractionType
    description: string
    heightRequirement: {
        inches: number | null
        centimeters: number | null
    }
    duration: {
        minutes: number
        variableLength: boolean
    }
    capacity: {
        hourly: number
        vehicleCapacity: number
    }
    accessibility: {
        wheelchairAccessible: boolean
        transferRequired: boolean
        assistiveListening: boolean
        audioDescription: boolean
        handheldCaptioning: boolean
        signLanguage: boolean
        serviceAnimalsAllowed: boolean
    }
    lightningLane: {
        available: boolean
        tier: "SinglePass" | "MultiPass" | null
    }
    ageAppeal: AgeGroup[]
    thrillLevel: 1 | 2 | 3 | 4 | 5
    indoor: boolean
    mustDo: boolean
    tips: string[]
    bestTimes: string[]
    photoPass: boolean
    rider: {
        swap: boolean
        single: boolean
    }
    virtualQueue: boolean
    closureInfo?: {
        startDate: string
        endDate: string
        reason: string
    }
}

// Restaurant interface
export interface Restaurant {
    id: string
    name: string
    landId: string
    cuisine: string[]
    description: string
    mealPeriods: MealPeriod[]
    priceRange: "$" | "$$" | "$$$" | "$$$$"
    reservations: {
        required: boolean
        recommended: boolean
        acceptsWalkUps: boolean
    }
    diningPlan: {
        accepted: boolean
        credits: number
    }
    menu: {
        signature: string[]
        categories: MenuCategory[]
    }
    seating: {
        indoor: boolean
        outdoor: boolean
        capacity: number
    }
    characterDining: boolean
    characters?: string[]
    mobileOrder: boolean
    accessibility: {
        wheelchairAccessible: boolean
        brailleMenu: boolean
        allergyFriendly: boolean
    }
    tips: string[]
}

// Snack location interface
export interface SnackLocation {
    id: string
    name: string
    landId: string
    type: "cart" | "stand" | "kiosk"
    items: string[]
    specialties: string[]
    seasonal: boolean
    mobileOrder: boolean
    location: string
}

// Entertainment interface
export interface Entertainment {
    id: string
    name: string
    type: "parade" | "fireworks" | "show" | "streetmosphere" | "character"
    description: string
    duration: {
        minutes: number
    }
    showtimes: string[] | "continuous" | "seasonal"
    location: string
    capacity?: number
    lightningLane: boolean
    seasonal: boolean
    ageAppeal: AgeGroup[]
    tips: string[]
}

// Facility interface
export interface Facility {
    id: string
    name: string
    type: "restroom" | "first-aid" | "baby-care" | "guest-relations" | "locker" | "charging"
    locations: string[]
    features?: string[]
}

// Service interface
export interface Service {
    id: string
    name: string
    type: string
    description: string
    locations: string[]
    cost?: string
    reservation?: boolean
}

// Accessibility info interface
export interface AccessibilityInfo {
    overview: string
    services: {
        das: {
            available: boolean
            description: string
        }
        wheelchairRental: {
            available: boolean
            locations: string[]
            cost: string
        }
        interpreterServices: boolean
        brailleGuidebooks: boolean
        audioDescription: boolean
    }
    companionRestrooms: string[]
    quietAreas: string[]
}

// Tip category interface
export interface TipCategory {
    category: string
    tips: {
        title: string
        description: string
        priority: "high" | "medium" | "low"
    }[]
}

// Transportation interface
export interface Transportation {
    parkingLot: boolean
    monorail: boolean
    boat: boolean
    bus: boolean
    skyliner: boolean
    walkable: boolean
    resortAccess: {
        monorail?: string[]
        boat?: string[]
        skyliner?: string[]
        walking?: string[]
    }
}

// Parking info interface
export interface ParkingInfo {
    available: boolean
    standard: {
        cost: string
        location: string
    }
    preferred: {
        cost: string
        location: string
    }
    trams: boolean
    tips: string[]
}