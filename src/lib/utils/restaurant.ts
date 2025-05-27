import { DisneyRestaurant, PriceRange, ServiceType, CuisineType, DiningFilters } from "@/types/dining"

// User location interface for distance calculations
interface UserLocation {
    latitude: number
    longitude: number
    accuracy?: number
    timestamp?: number
}

// Distance calculation cache to improve performance
const distanceCache = new Map<string, number>()

// Default fallback locations (Disney World center coordinates)
const FALLBACK_LOCATIONS = {
    MAGIC_KINGDOM: { latitude: 28.4177, longitude: -81.5812 },
    EPCOT: { latitude: 28.3747, longitude: -81.5494 },
    HOLLYWOOD_STUDIOS: { latitude: 28.3575, longitude: -81.5582 },
    ANIMAL_KINGDOM: { latitude: 28.3553, longitude: -81.5901 },
    DISNEY_SPRINGS: { latitude: 28.3687, longitude: -81.5158 },
    DISNEY_WORLD_CENTER: { latitude: 28.3852, longitude: -81.5639 }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180
    const φ2 = (point2.latitude * Math.PI) / 180
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

/**
 * Get cached distance or calculate and cache it
 */
function getCachedDistance(
    userLocation: { latitude: number; longitude: number },
    restaurantLocation: { latitude: number; longitude: number },
    restaurantId: string
): number {
    const cacheKey = `${userLocation.latitude},${userLocation.longitude}-${restaurantId}`

    if (distanceCache.has(cacheKey)) {
        return distanceCache.get(cacheKey)!
    }

    const distance = calculateDistance(userLocation, restaurantLocation)
    distanceCache.set(cacheKey, distance)

    // Clean cache if it gets too large (keep last 1000 entries)
    if (distanceCache.size > 1000) {
        const entries = Array.from(distanceCache.entries())
        distanceCache.clear()
        entries.slice(-500).forEach(([key, value]) => {
            distanceCache.set(key, value)
        })
    }

    return distance
}

/**
 * Get user's current location with fallbacks
 */
async function getUserLocation(): Promise<UserLocation | null> {
    try {
        // Try to get from browser geolocation API
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: position.timestamp
                        })
                    },
                    () => {
                        // Fallback to stored location or Disney World center
                        resolve(getStoredOrFallbackLocation())
                    },
                    {
                        timeout: 5000,
                        maximumAge: 300000, // 5 minutes
                        enableHighAccuracy: false
                    }
                )
            })
        }

        // Server-side or no geolocation support
        return getStoredOrFallbackLocation()
    } catch (error) {
        console.warn('Error getting user location:', error)
        return getStoredOrFallbackLocation()
    }
}

/**
 * Get stored location from localStorage or use fallback
 */
function getStoredOrFallbackLocation(): UserLocation | null {
    try {
        if (typeof window !== 'undefined') {
            // Try to get from localStorage
            const stored = localStorage.getItem('userLocation')
            if (stored) {
                const parsed = JSON.parse(stored) as UserLocation
                // Check if location is not too old (24 hours)
                if (!parsed.timestamp || Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    return parsed
                }
            }

            // Try to get last known park location
            const lastPark = localStorage.getItem('lastVisitedPark')
            if (lastPark && lastPark in FALLBACK_LOCATIONS) {
                return FALLBACK_LOCATIONS[lastPark as keyof typeof FALLBACK_LOCATIONS]
            }
        }

        // Ultimate fallback to Disney World center
        return FALLBACK_LOCATIONS.DISNEY_WORLD_CENTER
    } catch (error) {
        console.warn('Error getting stored location:', error)
        return FALLBACK_LOCATIONS.DISNEY_WORLD_CENTER
    }
}

/**
 * Determine the most appropriate fallback location based on restaurant locations
 */
function getSmartFallbackLocation(restaurants: DisneyRestaurant[]): UserLocation {
    if (restaurants.length === 0) {
        return FALLBACK_LOCATIONS.DISNEY_WORLD_CENTER
    }

    // Group restaurants by park and find the most common park
    const parkCounts = new Map<string, number>()
    restaurants.forEach(restaurant => {
        const parkId = restaurant.location.parkId
        if (parkId) {
            parkCounts.set(parkId, (parkCounts.get(parkId) || 0) + 1)
        }
    })

    // Find the park with the most restaurants
    let mostCommonPark = ''
    let maxCount = 0
    parkCounts.forEach((count, parkId) => {
        if (count > maxCount) {
            maxCount = count
            mostCommonPark = parkId
        }
    })

    // Map park IDs to fallback locations
    const parkLocationMap: Record<string, keyof typeof FALLBACK_LOCATIONS> = {
        'magic-kingdom': 'MAGIC_KINGDOM',
        'epcot': 'EPCOT',
        'hollywood-studios': 'HOLLYWOOD_STUDIOS',
        'animal-kingdom': 'ANIMAL_KINGDOM',
        'disney-springs': 'DISNEY_SPRINGS'
    }

    const fallbackKey = parkLocationMap[mostCommonPark]
    return fallbackKey ? FALLBACK_LOCATIONS[fallbackKey] : FALLBACK_LOCATIONS.DISNEY_WORLD_CENTER
}

/**
 * Sort restaurants by distance from user location (synchronous version)
 */
function sortRestaurantsByDistance(restaurants: DisneyRestaurant[]): DisneyRestaurant[] {
    try {
        // Get user location synchronously (from cache/localStorage)
        let userLocation = getStoredOrFallbackLocation()

        // If no user location available, use smart fallback based on restaurant locations
        if (!userLocation) {
            userLocation = getSmartFallbackLocation(restaurants)
        }

        // Calculate distances and sort
        const restaurantsWithDistance = restaurants.map(restaurant => ({
            restaurant,
            distance: getCachedDistance(
                userLocation!,
                {
                    latitude: restaurant.location.latitude,
                    longitude: restaurant.location.longitude
                },
                restaurant.id
            )
        }))

        // Sort by distance (closest first)
        restaurantsWithDistance.sort((a, b) => a.distance - b.distance)

        return restaurantsWithDistance.map(item => item.restaurant)
    } catch (error) {
        console.warn('Error sorting restaurants by distance:', error)
        // Return original array if sorting fails
        return restaurants
    }
}

/**
 * Asynchronously update user location and trigger re-sort if needed
 * This can be called separately to update location in the background
 */
export async function updateUserLocationAsync(): Promise<UserLocation | null> {
    try {
        const location = await getUserLocation()
        if (location && typeof window !== 'undefined') {
            // Store the location for future synchronous access
            localStorage.setItem('userLocation', JSON.stringify({
                ...location,
                timestamp: Date.now()
            }))
        }
        return location
    } catch (error) {
        console.warn('Error updating user location:', error)
        return null
    }
}

/**
 * Get distance to a specific restaurant from user's current location
 * Returns distance in meters, or null if location unavailable
 */
export function getDistanceToRestaurant(restaurant: DisneyRestaurant): number | null {
    try {
        const userLocation = getStoredOrFallbackLocation()
        if (!userLocation) return null

        return getCachedDistance(
            userLocation,
            {
                latitude: restaurant.location.latitude,
                longitude: restaurant.location.longitude
            },
            restaurant.id
        )
    } catch (error) {
        console.warn('Error calculating distance to restaurant:', error)
        return null
    }
}

/**
 * Format distance for display
 */
export function formatDistance(distanceMeters: number): string {
    if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)}m`
    } else {
        return `${(distanceMeters / 1000).toFixed(1)}km`
    }
}

/**
 * Estimate walking time based on distance
 */
export function estimateWalkingTime(distanceMeters: number): number {
    // Average walking speed of 4 km/h = 67 m/min
    // Add extra time for Disney crowds and navigation
    const baseTime = distanceMeters / 67
    const crowdFactor = 1.3 // 30% extra time for crowds
    return Math.ceil(baseTime * crowdFactor)
}

/**
 * Check if restaurant is within walking distance (configurable threshold)
 */
export function isWithinWalkingDistance(
    restaurant: DisneyRestaurant,
    maxDistanceMeters: number = 1000
): boolean {
    const distance = getDistanceToRestaurant(restaurant)
    return distance !== null && distance <= maxDistanceMeters
}

/**
 * Clear the distance cache (useful for memory management)
 */
export function clearDistanceCache(): void {
    distanceCache.clear()
}

/**
 * Parse time string to minutes since midnight
 * Example: "2:30 PM" -> 870 (14 * 60 + 30)
 */
export function parseTimeToMinutes(timeStr: string): number {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (!match) return 0

    let hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3].toUpperCase()

    if (period === 'PM' && hours !== 12) {
        hours += 12
    } else if (period === 'AM' && hours === 12) {
        hours = 0
    }

    return hours * 60 + minutes
}

/**
 * Check if a restaurant is currently open
 */
export function isRestaurantOpen(restaurant: DisneyRestaurant, currentTime?: Date): boolean {
    try {
        const now = currentTime || new Date()
        const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
        const hours = restaurant.operatingHours[dayName]

        if (!hours || hours === "Closed" || hours.toLowerCase() === "closed") {
            return false
        }

        // Parse opening and closing times
        const timeRange = hours.split(' - ')
        if (timeRange.length !== 2) {
            // If we can't parse the time, assume open
            return true
        }

        const openingTime = parseTimeToMinutes(timeRange[0].trim())
        const closingTime = parseTimeToMinutes(timeRange[1].trim())
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        // Handle cases where closing time is past midnight
        if (closingTime < openingTime) {
            return currentMinutes >= openingTime || currentMinutes <= closingTime
        }

        return currentMinutes >= openingTime && currentMinutes <= closingTime
    } catch (error) {
        console.warn('Error checking restaurant hours:', error)
        return true // Default to open if we can't determine
    }
}

/**
 * Get the next opening time for a restaurant
 */
export function getNextOpeningTime(restaurant: DisneyRestaurant): string | null {
    const now = new Date()

    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now)
        checkDate.setDate(checkDate.getDate() + i)
        const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
        const hours = restaurant.operatingHours[dayName]

        if (hours && hours !== "Closed" && hours.toLowerCase() !== "closed") {
            const timeRange = hours.split(' - ')
            if (timeRange.length === 2) {
                if (i === 0) {
                    // Today - check if we're before opening time
                    const openingTime = parseTimeToMinutes(timeRange[0].trim())
                    const currentMinutes = now.getHours() * 60 + now.getMinutes()
                    if (currentMinutes < openingTime) {
                        return `Today at ${timeRange[0].trim()}`
                    }
                } else {
                    return `${dayName} at ${timeRange[0].trim()}`
                }
            }
        }
    }

    return null
}

/**
 * Filter restaurants based on criteria
 */
export function filterRestaurants(restaurants: DisneyRestaurant[], filters: DiningFilters): DisneyRestaurant[] {
    return restaurants.filter(restaurant => {
        // Search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            const searchFields = [
                restaurant.name.toLowerCase(),
                restaurant.description.toLowerCase(),
                restaurant.shortDescription?.toLowerCase() || '',
                ...restaurant.cuisineTypes.map(c => c.toLowerCase()),
                ...restaurant.tags.map(t => t.toLowerCase()),
                ...restaurant.searchKeywords.map(k => k.toLowerCase()),
                restaurant.location.areaName.toLowerCase()
            ]

            if (!searchFields.some(field => field.includes(query))) {
                return false
            }
        }

        // Location filters
        if (filters.parkIds?.length && !filters.parkIds.includes(restaurant.location.parkId || '')) {
            return false
        }

        // Cuisine filters
        if (filters.cuisineTypes?.length) {
            if (!restaurant.cuisineTypes.some(cuisine => filters.cuisineTypes?.includes(cuisine))) {
                return false
            }
        }

        // Service type filters
        if (filters.serviceTypes?.length && !filters.serviceTypes.includes(restaurant.serviceType)) {
            return false
        }

        // Dining experience filters
        if (filters.diningExperiences?.length && !filters.diningExperiences.includes(restaurant.diningExperience)) {
            return false
        }

        // Price range filters
        if (filters.priceRanges?.length && !filters.priceRanges.includes(restaurant.priceRange)) {
            return false
        }

        // Special features filters
        if (filters.specialFeatures?.length) {
            if (!restaurant.specialFeatures.some(feature => filters.specialFeatures?.includes(feature))) {
                return false
            }
        }

        // Character dining filter
        if (filters.hasCharacterDining && !restaurant.characterDining?.hasCharacterDining) {
            return false
        }

        // Dining plan filter
        if (filters.acceptsDiningPlan && !restaurant.diningPlanInfo.acceptsDiningPlan) {
            return false
        }

        // Reservations filter
        if (filters.acceptsReservations && !restaurant.reservationInfo.acceptsReservations) {
            return false
        }

        // Rating filter
        if (filters.rating && (!restaurant.averageRating || restaurant.averageRating < filters.rating)) {
            return false
        }

        // Open now filter
        if (filters.openNow && !isRestaurantOpen(restaurant)) {
            return false
        }

        return true
    })
}

/**
 * Sort restaurants by different criteria
 */
export function sortRestaurants(restaurants: DisneyRestaurant[], sortBy: string): DisneyRestaurant[] {
    const sorted = [...restaurants]

    const priceRangeOrder = {
        [PriceRange.BUDGET]: 1,
        [PriceRange.MODERATE]: 2,
        [PriceRange.EXPENSIVE]: 3,
        [PriceRange.LUXURY]: 4
    }

    switch (sortBy) {
        case "name":
            return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case "rating":
            return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        case "price-low":
            return sorted.sort((a, b) => priceRangeOrder[a.priceRange] - priceRangeOrder[b.priceRange])
        case "price-high":
            return sorted.sort((a, b) => priceRangeOrder[b.priceRange] - priceRangeOrder[a.priceRange])
        case "popular":
            return sorted.sort((a, b) => {
                if (a.isPopular && !b.isPopular) return -1
                if (!a.isPopular && b.isPopular) return 1
                return (b.averageRating || 0) - (a.averageRating || 0)
            })
        case "newest":
            return sorted.sort((a, b) => {
                if (a.isNew && !b.isNew) return -1
                if (!a.isNew && b.isNew) return 1
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            })
        case "distance":
            return sortRestaurantsByDistance(sorted)
        default:
            return sorted
    }
}

/**
 * Get restaurant availability status
 */
export function getRestaurantStatus(restaurant: DisneyRestaurant): {
    isOpen: boolean
    status: 'open' | 'closed' | 'closing-soon' | 'opening-soon'
    message: string
    nextChange?: string
} {
    const isOpen = isRestaurantOpen(restaurant)
    const now = new Date()
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
    const hours = restaurant.operatingHours[dayName]

    if (!hours || hours === "Closed" || hours.toLowerCase() === "closed") {
        const nextOpening = getNextOpeningTime(restaurant)
        return {
            isOpen: false,
            status: 'closed',
            message: 'Closed today',
            nextChange: nextOpening || undefined
        }
    }

    const timeRange = hours.split(' - ')
    if (timeRange.length !== 2) {
        return {
            isOpen: true,
            status: 'open',
            message: 'Open',
        }
    }

    const openingTime = parseTimeToMinutes(timeRange[0].trim())
    const closingTime = parseTimeToMinutes(timeRange[1].trim())
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    if (isOpen) {
        // Check if closing soon (within 30 minutes)
        const minutesToClose = closingTime - currentMinutes
        if (minutesToClose <= 30 && minutesToClose > 0) {
            return {
                isOpen: true,
                status: 'closing-soon',
                message: `Closes in ${minutesToClose} minutes`,
                nextChange: timeRange[1].trim()
            }
        }
        return {
            isOpen: true,
            status: 'open',
            message: `Open until ${timeRange[1].trim()}`,
            nextChange: timeRange[1].trim()
        }
    } else {
        // Check if opening soon (within next 60 minutes)
        const minutesToOpen = openingTime - currentMinutes
        if (minutesToOpen <= 60 && minutesToOpen > 0) {
            return {
                isOpen: false,
                status: 'opening-soon',
                message: `Opens in ${minutesToOpen} minutes`,
                nextChange: timeRange[0].trim()
            }
        }
        return {
            isOpen: false,
            status: 'closed',
            message: 'Currently closed',
            nextChange: timeRange[0].trim()
        }
    }
}

/**
 * Calculate estimated wait time based on restaurant popularity and current time
 */
export function getEstimatedWaitTime(restaurant: DisneyRestaurant): number | null {
    if (!restaurant.reservationInfo.walkUpsAccepted) {
        return null // No walk-ups accepted
    }

    const now = new Date()
    const hour = now.getHours()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6

    let baseWaitTime = 15 // Base wait time in minutes

    // Adjust for popularity
    if (restaurant.isPopular) {
        baseWaitTime += 20
    }

    // Adjust for service type
    if (restaurant.serviceType === ServiceType.QUICK_SERVICE) {
        baseWaitTime = Math.max(5, baseWaitTime - 10)
    } else if (restaurant.serviceType === ServiceType.SIGNATURE_DINING) {
        baseWaitTime += 30
    }

    // Adjust for peak hours
    if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
        baseWaitTime += 15
    }

    // Adjust for weekends
    if (isWeekend) {
        baseWaitTime += 10
    }

    // Add some randomness
    const variance = Math.random() * 10 - 5 // -5 to +5 minutes
    baseWaitTime += variance

    return Math.max(0, Math.round(baseWaitTime))
}

/**
 * Get dining recommendations based on user preferences
 */
export function getRestaurantRecommendations(
    restaurants: DisneyRestaurant[],
    preferences: {
        cuisineTypes?: CuisineType[]
        priceRange?: PriceRange[]
        hasCharacterDining?: boolean
        parkLocation?: string
        partySize?: number
        mealTime?: 'breakfast' | 'lunch' | 'dinner'
    }
): DisneyRestaurant[] {
    return restaurants
        .filter(restaurant => {
            // Filter by preferences
            if (preferences.cuisineTypes?.length) {
                if (!restaurant.cuisineTypes.some(c => preferences.cuisineTypes?.includes(c))) {
                    return false
                }
            }

            if (preferences.priceRange?.length) {
                if (!preferences.priceRange.includes(restaurant.priceRange)) {
                    return false
                }
            }

            if (preferences.hasCharacterDining && !restaurant.characterDining?.hasCharacterDining) {
                return false
            }

            if (preferences.parkLocation && restaurant.location.parkId !== preferences.parkLocation) {
                return false
            }

            return true
        })
        .sort((a, b) => {
            // Sort by relevance score
            let scoreA = 0
            let scoreB = 0

            // Higher rating = higher score
            scoreA += (a.averageRating || 0) * 10
            scoreB += (b.averageRating || 0) * 10

            // Popular restaurants get bonus points
            if (a.isPopular) scoreA += 20
            if (b.isPopular) scoreB += 20

            // New restaurants get bonus points
            if (a.isNew) scoreA += 10
            if (b.isNew) scoreB += 10

            return scoreB - scoreA
        })
        .slice(0, 10) // Return top 10 recommendations
}

/**
 * Format price range display
 */
export function formatPriceRange(priceRange: PriceRange): { symbol: string; description: string; color: string } {
    switch (priceRange) {
        case PriceRange.BUDGET:
            return {
                symbol: '$',
                description: 'Under $15 per person',
                color: 'text-green-600 dark:text-green-400'
            }
        case PriceRange.MODERATE:
            return {
                symbol: '$$',
                description: '$15-35 per person',
                color: 'text-blue-600 dark:text-blue-400'
            }
        case PriceRange.EXPENSIVE:
            return {
                symbol: '$$$',
                description: '$36-60 per person',
                color: 'text-orange-600 dark:text-orange-400'
            }
        case PriceRange.LUXURY:
            return {
                symbol: '$$$$',
                description: 'Over $60 per person',
                color: 'text-purple-600 dark:text-purple-400'
            }
        default:
            return {
                symbol: '$',
                description: 'Price varies',
                color: 'text-muted-foreground'
            }
    }
}

/**
 * Check if restaurant accepts walk-ups
 */
export function acceptsWalkUps(restaurant: DisneyRestaurant): boolean {
    return restaurant.reservationInfo.walkUpsAccepted && !restaurant.reservationInfo.requiresReservations
}

/**
 * Get reservation difficulty level
 */
export function getReservationDifficulty(restaurant: DisneyRestaurant): 'easy' | 'moderate' | 'hard' | 'extremely-hard' {
    if (!restaurant.reservationInfo.acceptsReservations) {
        return 'easy' // No reservations needed
    }

    if (restaurant.characterDining?.hasCharacterDining || restaurant.serviceType === ServiceType.SIGNATURE_DINING) {
        if (restaurant.isPopular) {
            return 'extremely-hard'
        }
        return 'hard'
    }

    if (restaurant.isPopular) {
        return 'hard'
    }

    if (restaurant.reservationInfo.requiresReservations) {
        return 'moderate'
    }

    return 'easy'
}