import { useState, useEffect } from 'react'
import {
    getAllDisneySpringsLocations,
    getLocationsByCategory,
    getLocationsByArea,
    getDisneySpringsLocationById,
    searchDisneySpringsLocations,
    getDisneySpringsMetadata,
    getOperationalInfo,
    getDisneySpringsEvents,
    getDisneySpringsServices,
    getDisneySpringsTips
} from '@/lib/firebase/disneysprings'
import {
    DisneySpringLocation,
    DisneySpringsData,
    LocationCategory,
    LocationArea,
    LocationFilters,
    LocationSearchResult,
    ShoppingLocation,
    DiningLocation,
    EntertainmentLocation,
    PriceRange
} from "@/types/disneysprings"

// React hooks for data fetching
export function useDisneySpringsLocations() {
    const [locations, setLocations] = useState<DisneySpringLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchLocations() {
            try {
                setLoading(true)
                const data = await getAllDisneySpringsLocations()
                setLocations(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch locations')
            } finally {
                setLoading(false)
            }
        }

        fetchLocations()
    }, [])

    return { locations, loading, error }
}

export function useDisneySpringsLocationsByCategory(category: LocationCategory) {
    const [locations, setLocations] = useState<DisneySpringLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchLocations() {
            try {
                setLoading(true)
                const data = await getLocationsByCategory(category)
                setLocations(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch locations')
            } finally {
                setLoading(false)
            }
        }

        fetchLocations()
    }, [category])

    return { locations, loading, error }
}

export function useDisneySpringsLocationsByArea(area: LocationArea) {
    const [locations, setLocations] = useState<DisneySpringLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchLocations() {
            try {
                setLoading(true)
                const data = await getLocationsByArea(area)
                setLocations(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch locations')
            } finally {
                setLoading(false)
            }
        }

        fetchLocations()
    }, [area])

    return { locations, loading, error }
}

export function useDisneySpringsLocation(id: string) {
    const [location, setLocation] = useState<DisneySpringLocation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchLocation() {
            try {
                setLoading(true)
                const data = await getDisneySpringsLocationById(id)
                setLocation(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch location')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchLocation()
        }
    }, [id])

    return { location, loading, error }
}

export function useDisneySpringsSearch(filters: LocationFilters) {
    const [results, setResults] = useState<LocationSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function performSearch() {
            try {
                setLoading(true)
                const data = await searchDisneySpringsLocations(filters)
                setResults(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to perform search')
            } finally {
                setLoading(false)
            }
        }

        performSearch()
    }, [filters])

    return { results, loading, error }
}

export function useDisneySpringsMetadata() {
    const [metadata, setMetadata] = useState<DisneySpringsData['metadata'] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchMetadata() {
            try {
                setLoading(true)
                const data = await getDisneySpringsMetadata()
                setMetadata(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch metadata')
            } finally {
                setLoading(false)
            }
        }

        fetchMetadata()
    }, [])

    return { metadata, loading, error }
}

export function useOperationalInfo() {
    const [operationalInfo, setOperationalInfo] = useState<DisneySpringsData['operationalInfo'] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchOperationalInfo() {
            try {
                setLoading(true)
                const data = await getOperationalInfo()
                setOperationalInfo(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch operational info')
            } finally {
                setLoading(false)
            }
        }

        fetchOperationalInfo()
    }, [])

    return { operationalInfo, loading, error }
}

export function useDisneySpringsEvents() {
    const [events, setEvents] = useState<DisneySpringsData['events'] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchEvents() {
            try {
                setLoading(true)
                const data = await getDisneySpringsEvents()
                setEvents(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch events')
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])

    return { events, loading, error }
}

// Legacy compatibility - these are the original static exports
// They now fetch from Firebase but maintain the same interface
let cachedLocations: DisneySpringLocation[] = []

export async function getDisneySpringsLocations(): Promise<DisneySpringLocation[]> {
    if (cachedLocations.length === 0) {
        cachedLocations = await getAllDisneySpringsLocations()
    }
    return cachedLocations
}

export const shoppingLocations: ShoppingLocation[] = []
export const diningLocations: DiningLocation[] = []
export const entertainmentLocations: EntertainmentLocation[] = []
export const disneySpringsLocations: DisneySpringLocation[] = []

// Initialize the legacy arrays from Firebase data
async function initializeLegacyArrays() {
    try {
        const allLocations = await getAllDisneySpringsLocations()

        // Clear and populate the legacy arrays
        shoppingLocations.length = 0
        diningLocations.length = 0
        entertainmentLocations.length = 0
        disneySpringsLocations.length = 0

        allLocations.forEach(location => {
            disneySpringsLocations.push(location)

            if (location.category === LocationCategory.Shopping) {
                shoppingLocations.push(location as ShoppingLocation)
            } else if (location.category === LocationCategory.Dining) {
                diningLocations.push(location as DiningLocation)
            } else if (location.category === LocationCategory.Entertainment) {
                entertainmentLocations.push(location as EntertainmentLocation)
            }
        })
    } catch (error) {
        console.error('Failed to initialize legacy arrays:', error)
    }
}

// Initialize legacy arrays when the module is loaded
initializeLegacyArrays()

// Helper functions for filtering and searching
export function filterLocationsByCategory(
    locations: DisneySpringLocation[],
    category: LocationCategory | "all"
): DisneySpringLocation[] {
    if (category === "all") return locations
    return locations.filter(location => location.category === category)
}

export function filterLocationsByArea(
    locations: DisneySpringLocation[],
    area: LocationArea | "all"
): DisneySpringLocation[] {
    if (area === "all") return locations
    return locations.filter(location => location.area === area)
}

export function filterLocationsByPriceRange(
    locations: DisneySpringLocation[],
    priceRanges: PriceRange[]
): DisneySpringLocation[] {
    if (priceRanges.length === 0) return locations
    return locations.filter(location =>
        location.priceRange && priceRanges.includes(location.priceRange)
    )
}

export function searchLocations(
    locations: DisneySpringLocation[],
    searchTerm: string
): DisneySpringLocation[] {
    if (!searchTerm.trim()) return locations

    const term = searchTerm.toLowerCase()
    return locations.filter(location => {
        const searchableText = [
            location.name,
            location.description,
            ...(location.tags || []),
            ...(location.specialties || []),
            ...(location.features || [])
        ].join(' ').toLowerCase()

        return searchableText.includes(term)
    })
}

export function getLocationsByTags(
    locations: DisneySpringLocation[],
    tags: string[]
): DisneySpringLocation[] {
    if (tags.length === 0) return locations

    return locations.filter(location =>
        tags.some(tag =>
            location.tags?.some(locationTag =>
                locationTag.toLowerCase().includes(tag.toLowerCase())
            )
        )
    )
}

export function getPopularLocations(locations: DisneySpringLocation[]): DisneySpringLocation[] {
    return locations.filter(location => location.popular)
}

export function getNewLocations(locations: DisneySpringLocation[]): DisneySpringLocation[] {
    return locations.filter(location => location.isNew)
}

export function getLocationsByFeatures(
    locations: DisneySpringLocation[],
    features: string[]
): DisneySpringLocation[] {
    if (features.length === 0) return locations

    return locations.filter(location =>
        features.some(feature =>
            location.features?.some(locationFeature =>
                locationFeature.toLowerCase().includes(feature.toLowerCase())
            )
        )
    )
}

// Utility function to get recommended locations based on user preferences
export function getRecommendedLocations(
    locations: DisneySpringLocation[],
    preferences: {
        categories?: LocationCategory[]
        areas?: LocationArea[]
        priceRanges?: PriceRange[]
        interests?: string[]
    }
): DisneySpringLocation[] {
    let recommended = [...locations]

    // Filter by categories
    if (preferences.categories && preferences.categories.length > 0) {
        recommended = recommended.filter(location =>
            preferences.categories!.includes(location.category)
        )
    }

    // Filter by areas
    if (preferences.areas && preferences.areas.length > 0) {
        recommended = recommended.filter(location =>
            preferences.areas!.includes(location.area)
        )
    }

    // Filter by price ranges
    if (preferences.priceRanges && preferences.priceRanges.length > 0) {
        recommended = filterLocationsByPriceRange(recommended, preferences.priceRanges)
    }

    // Filter by interests (tags, features, specialties)
    if (preferences.interests && preferences.interests.length > 0) {
        recommended = recommended.filter(location => {
            const locationKeywords = [
                ...(location.tags || []),
                ...(location.features || []),
                ...(location.specialties || [])
            ].map(keyword => keyword.toLowerCase())

            return preferences.interests!.some(interest =>
                locationKeywords.some(keyword =>
                    keyword.includes(interest.toLowerCase())
                )
            )
        })
    }

    // Prioritize popular locations
    recommended.sort((a, b) => {
        if (a.popular && !b.popular) return -1
        if (!a.popular && b.popular) return 1
        return 0
    })

    return recommended
}