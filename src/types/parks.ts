import { Timestamp } from 'firebase/firestore'

// Core park information interfaces
export interface DisneyPark {
    id: string
    name: string
    abbreviation: string
    description: string
    opened: string // ISO date string
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
    operatingHours: OperatingHours
    lands: ParkLand[]
    attractions: Attraction[]
    dining: DiningOptions
    entertainment: Entertainment[]
    facilities: Facility[]
    services: Service[]
    accessibility: AccessibilityInfo
    tips: TipCategory[]
    transportation: TransportationInfo
    parkingInfo: ParkingInfo
    createdAt?: Timestamp
    updatedAt?: Timestamp
}

export interface OperatingHours {
    typical: {
        monday: { open: string; close: string }
        tuesday: { open: string; close: string }
        wednesday: { open: string; close: string }
        thursday: { open: string; close: string }
        friday: { open: string; close: string }
        saturday: { open: string; close: string }
        sunday: { open: string; close: string }
    }
    extendedEvening: boolean
    earlyEntry: boolean
    specialEvents: string[]
}

export interface ParkLand {
    id: string
    name: string
    description: string
    theme: string
    attractions: string[] // attraction IDs
    dining: string[] // dining location IDs
    shops: string[] // shop IDs
}

export interface Attraction {
    id: string
    name: string
    landId: string
    type: 'ride' | 'show' | 'experience' | 'character-meet' | 'walkthrough'
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
    accessibility: AttractionAccessibility
    lightningLane: {
        available: boolean
        tier?: 'SinglePass' | 'MultiPass'
    }
    ageAppeal: AgeGroup[]
    thrillLevel: number // 1-5 scale
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

export interface AttractionAccessibility {
    wheelchairAccessible: boolean
    transferRequired: boolean
    assistiveListening: boolean
    audioDescription: boolean
    handheldCaptioning: boolean
    signLanguage: boolean
    serviceAnimalsAllowed: boolean
}

export type AgeGroup = 'toddler' | 'preschool' | 'kids' | 'tweens' | 'teens' | 'adults' | 'seniors'

export interface DiningOptions {
    tableService: TableServiceRestaurant[]
    quickService: QuickServiceRestaurant[]
    snacks: SnackLocation[]
}

export interface TableServiceRestaurant {
    id: string
    name: string
    landId: string
    cuisine: string[]
    description: string
    mealPeriods: MealPeriod[]
    priceRange: '$' | '$$' | '$$$' | '$$$$'
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
    accessibility: DiningAccessibility
    tips: string[]
}

export interface QuickServiceRestaurant {
    id: string
    name: string
    landId: string
    cuisine: string[]
    description: string
    mealPeriods: MealPeriod[]
    priceRange: '$' | '$$' | '$$$'
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
    mobileOrder: boolean
    accessibility: DiningAccessibility
    tips: string[]
}

export interface SnackLocation {
    id: string
    name: string
    landId: string
    type: 'stand' | 'kiosk' | 'cart'
    items: string[]
    specialties: string[]
    seasonal: boolean
    mobileOrder: boolean
    location: string
}

export type MealPeriod = 'breakfast' | 'lunch' | 'dinner' | 'allday'

export interface MenuCategory {
    name: string
    items: MenuItem[]
}

export interface MenuItem {
    name: string
    description: string
    price: string
    dietary: string[]
}

export interface DiningAccessibility {
    wheelchairAccessible: boolean
    brailleMenu: boolean
    allergyFriendly: boolean
}

export interface Entertainment {
    id: string
    name: string
    landId?: string
    type: 'fireworks' | 'parade' | 'show' | 'streetmosphere' | 'character-meet'
    description: string
    duration: { minutes: number }
    showtimes: string[] | string
    location: string
    capacity?: number
    lightningLane: boolean
    seasonal: boolean
    ageAppeal: AgeGroup[]
    tips: string[]
}

export interface Facility {
    id: string
    name: string
    type: 'baby-care' | 'first-aid' | 'guest-relations' | 'locker' | 'restroom'
    locations: string[]
    features: string[]
}

export interface Service {
    id: string
    name: string
    type: 'accessibility' | 'convenience' | 'photography' | 'rental' | 'experience' | 'activity'
    description: string
    locations: string[]
    cost: string
    reservation: boolean
}

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

export interface TipCategory {
    category: string
    tips: Tip[]
}

export interface Tip {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
}

export interface TransportationInfo {
    parkingLot: boolean
    monorail: boolean
    boat: boolean
    bus: boolean
    skyliner: boolean
    walkable: boolean
    resortAccess: {
        monorail?: string[]
        boat?: string[]
        walking?: string[]
        skyliner?: string[]
    }
}

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

// Firebase document interfaces
export interface FirebasePark extends Omit<DisneyPark, 'createdAt' | 'updatedAt'> {
    createdAt: Timestamp
    updatedAt: Timestamp
}

export type CreateParkInput = Omit<DisneyPark, 'createdAt' | 'updatedAt'>

// Query and filter interfaces
export interface ParkFilters {
    searchTerm?: string
    hasAttraction?: string
    hasLand?: string
    operatingStatus?: 'open' | 'closed' | 'seasonal'
}

export interface AttractionFilters {
    parkId?: string
    landId?: string
    type?: Attraction['type']
    thrillLevel?: number
    heightRequirement?: boolean
    lightningLane?: boolean
    mustDo?: boolean
    ageGroup?: AgeGroup
}

export interface DiningFilters {
    parkId?: string
    landId?: string
    type?: 'tableService' | 'quickService' | 'snacks'
    cuisine?: string
    priceRange?: string
    characterDining?: boolean
    mobileOrder?: boolean
    mealPeriod?: MealPeriod
}

// Wait times and live data interfaces
export interface AttractionWaitTime {
    attractionId: string
    parkId: string
    waitTime: number // minutes, -1 for closed/not available
    status: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT'
    lightningLane?: {
        available: boolean
        nextReturnTime?: string
        price?: number
    }
    lastUpdated: Timestamp
}

export interface ParkHours {
    parkId: string
    date: string // YYYY-MM-DD format
    openingTime: string // HH:MM format
    closingTime: string // HH:MM format
    extraMagicHours?: {
        type: 'early' | 'evening'
        startTime?: string
        endTime?: string
        eligibility: string[]
    }
    specialEvents?: {
        name: string
        startTime: string
        endTime: string
        ticketRequired: boolean
    }[]
    lastUpdated: Timestamp
}

// Utility types
export type ParkId = 'mk' | 'epcot' | 'hs' | 'ak'
export type ParkName = 'Magic Kingdom' | 'EPCOT' | 'Hollywood Studios' | 'Animal Kingdom'