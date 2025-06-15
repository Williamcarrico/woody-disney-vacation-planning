/**
 * Shared type definitions for Disney vacation planning app
 * This file consolidates common types to eliminate duplications across the codebase
 */

// =============================================================================
// SHARED ENUMS
// =============================================================================

/**
 * Unified price range enum for all dining and shopping locations
 */
export enum PriceRange {
  LOW = "$",
  MODERATE = "$$", 
  HIGH = "$$$",
  LUXURY = "$$$$"
}

/**
 * Unified meal periods for dining locations
 */
export enum MealPeriod {
  BREAKFAST = "breakfast",
  LUNCH = "lunch", 
  DINNER = "dinner",
  BRUNCH = "brunch",
  ALLDAY = "allday",
  SNACK = "snack",
  BEVERAGES = "beverages"
}

/**
 * Age groups for attractions and experiences
 */
export enum AgeGroup {
  TODDLER = "toddler",
  PRESCHOOL = "preschool", 
  KIDS = "kids",
  TWEENS = "tweens",
  TEENS = "teens",
  ADULTS = "adults",
  SENIORS = "seniors"
}

/**
 * Attraction types
 */
export enum AttractionType {
  RIDE = "ride",
  SHOW = "show", 
  WALKTHROUGH = "walkthrough",
  PLAYGROUND = "playground",
  EXHIBIT = "exhibit",
  MEET_GREET = "meet-greet",
  EXPERIENCE = "experience",
  ENTERTAINMENT = "entertainment",
  CHARACTER = "character",
  DINING = "dining",
  SHOPPING = "shopping",
  TOUR = "tour",
  ANIMAL_EXPERIENCE = "animal-experience",
  RECREATION = "recreation",
  EVENT = "event",
  PHOTO_OPPORTUNITY = "photo-opportunity",
  INTERACTIVE = "interactive",
  TRANSPORT = "transport",
  WATER_ATTRACTION = "water-attraction",
  THRILL = "thrill",
  KIDS_AREA = "kids-area"
}

// =============================================================================
// SHARED INTERFACES
// =============================================================================

/**
 * Unified operating hours interface
 */
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
  extendedEvening?: boolean
  earlyEntry?: boolean
  specialEvents?: string[]
  // Legacy format support for backward compatibility
  [key: string]: any
}

/**
 * Unified menu item interface
 */
export interface MenuItem {
  name: string
  description: string
  price?: string | number
  dietary?: string[]
  category?: string
  isSignature?: boolean
  diningPlanCredits?: number
  allergens?: string[]
}

/**
 * Unified menu category interface
 */
export interface MenuCategory {
  name: string
  items: MenuItem[]
  description?: string
}

/**
 * Unified menu highlight interface
 */
export interface MenuHighlight {
  name: string
  description: string
  price?: number
  imageUrl?: string
  category?: string
  isSignature?: boolean
  diningPlanCredits?: number
  allergens?: string[]
}

/**
 * Unified accessibility information interface
 */
export interface AccessibilityInfo {
  wheelchairAccessible: boolean
  transferRequired?: boolean
  serviceAnimalsAllowed: boolean
  assistiveListening?: boolean
  audioDescription?: boolean
  handheldCaptioning?: boolean
  closedCaptioning?: boolean
  reflectiveCaption?: boolean
  signLanguage?: boolean
  brailleMenu?: boolean
  mustTransfer?: TransferType
  requiresCompanion?: boolean
  otherAccessibilityFeatures?: string[]
  ageRestriction?: string
  allergyFriendly?: boolean
  // Service-specific accessibility info
  services?: {
    das?: {
      available: boolean
      description: string
    }
    wheelchairRental?: {
      available: boolean
      locations: string[]
      cost: string
    }
    interpreterServices?: boolean
    brailleGuidebooks?: boolean
  }
  companionRestrooms?: string[]
  quietAreas?: string[]
  overview?: string
}

/**
 * Transfer types for accessibility
 */
export enum TransferType {
  NONE = "none",
  STANDARD = "standard", 
  EASY_TRANSFER = "easy-transfer",
  MUST_BE_AMBULATORY = "must-be-ambulatory",
  WATER = "water-transfer-required"
}

/**
 * Wheelchair accessibility levels
 */
export enum WheelchairAccessibility {
  FULL = "may-remain-in-wheelchair-ecv",
  TRANSFER_REQUIRED = "must-transfer-to-wheelchair",
  MUST_TRANSFER = "must-transfer-from-wheelchair-ecv", 
  STANDARD_WHEELCHAIR_ONLY = "standard-wheelchair-only",
  NOT_ACCESSIBLE = "not-accessible"
}

/**
 * Unified parking information interface
 */
export interface ParkingInfo {
  available: boolean
  standard: {
    cost: string
    location: string
  }
  preferred?: {
    cost: string
    location: string
  }
  trams?: boolean
  tips?: string[]
  garages?: ParkingGarage[]
  surfaceLots?: ParkingLot[]
  capacity?: string
}

export interface ParkingGarage {
  name: string
  location: string
  accessTo: string[]
  features: string[]
}

export interface ParkingLot {
  name: string
  description: string
  shuttle?: string
  distance?: string
}

/**
 * Unified snack location interface
 */
export interface SnackLocation {
  id: string
  name: string
  landId?: string
  area?: string
  type: "cart" | "stand" | "kiosk"
  items: string[]
  specialties: string[]
  seasonal: boolean
  mobileOrder: boolean
  location: string
}

/**
 * Unified attraction interface
 */
export interface Attraction {
  id: string
  name: string
  park?: string
  parkId?: string
  landId?: string
  area?: string
  landName?: string
  description: string
  shortDescription?: string
  imageUrl?: string
  thumbnailUrl?: string
  location?: string
  type: AttractionType | AttractionType[]
  attractionType?: AttractionType[]
  rideCategory?: string[]
  heightRequirement?: HeightRequirement
  duration?: {
    minutes: number
    variableLength?: boolean
  }
  capacity?: {
    hourly: number
    vehicleCapacity: number
  }
  accessibility: AccessibilityInfo
  lightningLane?: {
    available: boolean
    tier?: "SinglePass" | "MultiPass" | null
  }
  ageAppeal?: AgeGroup[]
  thrillLevel?: number
  indoor?: boolean
  mustDo?: boolean
  tags?: string[]
  waitTime?: number | null
  isFastPassAvailable?: boolean
  isSingleRider?: boolean
  photoPass?: boolean
  rider?: {
    swap: boolean
    single: boolean
  }
  virtualQueue?: boolean
  schedule?: Schedule
  coordinates?: {
    latitude: number
    longitude: number
  }
  tips?: string[]
  bestTimes?: string[]
  closureInfo?: {
    startDate: string
    endDate: string
    reason: string
  }
  createdAt?: string
  updatedAt?: string
}

/**
 * Height requirement interface
 */
export interface HeightRequirement {
  min?: number
  max?: number
  inches?: number | null
  centimeters?: number | null
  unit?: "in" | "cm"
  adultRequired?: boolean
  minHeight?: string
}

/**
 * Schedule interfaces
 */
export interface BaseSchedule {
  specialHours?: {
    date: string
    openingTime: string
    closingTime: string
  }[]
}

export interface OperatingSchedule extends BaseSchedule {
  openingTime: string
  closingTime: string
  performanceTimes?: string[]
}

export interface ShowSchedule extends BaseSchedule {
  performanceTimes: string[]
  openingTime?: string
  closingTime?: string
}

export type Schedule = OperatingSchedule | ShowSchedule

/**
 * Unified Disney park interface
 */
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
  createdAt?: any
  updatedAt?: any
}

/**
 * Park land interface
 */
export interface ParkLand {
  id: string
  name: string
  description: string
  theme: string
  attractions: string[]
  dining: string[]
  shops: string[]
}

/**
 * Dining options interface
 */
export interface DiningOptions {
  tableService: TableServiceRestaurant[]
  quickService: QuickServiceRestaurant[]
  snacks: SnackLocation[]
}

/**
 * Base restaurant interface
 */
export interface BaseRestaurant {
  id: string
  name: string
  landId?: string
  area?: string
  landName?: string
  cuisine: string[]
  description: string
  mealPeriods: MealPeriod[]
  priceRange: PriceRange
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
  accessibility: AccessibilityInfo
  tips: string[]
}

/**
 * Table service restaurant interface
 */
export interface TableServiceRestaurant extends BaseRestaurant {
  // Additional table service specific properties can be added here
}

/**
 * Quick service restaurant interface  
 */
export interface QuickServiceRestaurant extends BaseRestaurant {
  // Additional quick service specific properties can be added here
}

/**
 * Entertainment interface
 */
export interface Entertainment {
  id: string
  name: string
  landId?: string
  area?: string
  landName?: string
  type: "fireworks" | "parade" | "show" | "streetmosphere" | "character-meet" | "character"
  description: string
  duration: { minutes: number }
  showtimes: string[] | string
  location: string
  capacity?: number
  lightningLane?: boolean
  seasonal: boolean
  ageAppeal: AgeGroup[]
  tips: string[]
}

/**
 * Facility interface
 */
export interface Facility {
  id: string
  name: string
  type: "baby-care" | "first-aid" | "guest-relations" | "locker" | "restroom" | "charging"
  locations: string[]
  features: string[]
}

/**
 * Service interface
 */
export interface Service {
  id: string
  name: string
  type: "accessibility" | "convenience" | "photography" | "rental" | "experience" | "activity"
  description: string
  locations: string[]
  cost?: string
  reservation?: boolean
}

/**
 * Tip category interface
 */
export interface TipCategory {
  category: string
  tips: Tip[]
}

/**
 * Tip interface
 */
export interface Tip {
  title: string
  description: string
  priority: "low" | "medium" | "high"
}

/**
 * Transportation info interface
 */
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

// =============================================================================
// LOCATION INTERFACES
// =============================================================================

/**
 * Generic location interface
 */
export interface Location {
  latitude: number
  longitude: number
  areaName?: string
  area?: string
  landName?: string
  parkId?: string
  resortId?: string
  address?: string
}

/**
 * Coordinates interface
 */
export interface Coordinates {
  latitude: number
  longitude: number
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Status types for attractions and facilities
 */
export enum OperatingStatus {
  OPERATING = "operating",
  CLOSED = "closed",
  DOWN = "down", 
  REFURBISHMENT = "refurbishment",
  SEASONAL = "seasonal"
}

/**
 * Common filter interface
 */
export interface BaseFilters {
  searchTerm?: string
  parkId?: string
  landId?: string
  area?: string
  priceRange?: PriceRange[]
  operatingStatus?: OperatingStatus
}

/**
 * Shared notification interface
 */
export interface Notification {
  id: string
  title: string
  message: string
  category?: string
  read: boolean
  createdAt: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
  type: 'wait_time' | 'dining' | 'weather' | 'system' | 'achievement' | string
  timestamp?: number
  data?: Record<string, unknown>
  vacationId?: string
  userId?: string
}

/**
 * Shared query options for React Query hooks
 */
export interface SharedQueryOptions {
  enabled?: boolean
  refetchInterval?: number
  refetchOnWindowFocus?: boolean
  staleTime?: number
  cacheTime?: number
  retry?: boolean | number
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
} 