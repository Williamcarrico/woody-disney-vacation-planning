import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
    QueryConstraint,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch
} from 'firebase/firestore'
import { db } from './config'
import {
    DisneySpringLocation,
    DisneySpringsData,
    LocationCategory,
    LocationArea,
    LocationFilters,
    LocationSearchResult,
    District,
    ShoppingLocation,
    DiningLocation,
    EntertainmentLocation
} from '@/types/disneysprings'

// Collection names
const COLLECTIONS = {
    METADATA: 'disney_springs_metadata',
    LOCATIONS: 'disney_springs_locations',
    DISTRICTS: 'disney_springs_districts',
    CATEGORIES: 'disney_springs_categories',
    EVENTS: 'disney_springs_events',
    OPERATIONAL_INFO: 'disney_springs_operational',
    SERVICES: 'disney_springs_services',
    TIPS: 'disney_springs_tips'
} as const

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData<T>(key: string): T | null {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T
    }
    return null
}

function setCachedData<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() })
}

// Initialize Disney Springs data in Firestore
export async function initializeDisneySpringsData(data: DisneySpringsData): Promise<void> {
    try {
        const batch = writeBatch(db)

        // Store metadata
        const metadataRef = doc(db, COLLECTIONS.METADATA, 'main')
        batch.set(metadataRef, data.metadata)

        // Store operational info
        const operationalRef = doc(db, COLLECTIONS.OPERATIONAL_INFO, 'main')
        batch.set(operationalRef, data.operationalInfo)

        // Store districts
        Object.entries(data.districts).forEach(([districtId, district]) => {
            const districtRef = doc(db, COLLECTIONS.DISTRICTS, districtId)
            batch.set(districtRef, {
                ...district,
                id: districtId,
                updatedAt: new Date()
            })
        })

        // Store categories
        const categoriesRef = doc(db, COLLECTIONS.CATEGORIES, 'main')
        batch.set(categoriesRef, data.categories)

        // Store events
        const eventsRef = doc(db, COLLECTIONS.EVENTS, 'main')
        batch.set(eventsRef, data.events)

        // Store services
        const servicesRef = doc(db, COLLECTIONS.SERVICES, 'main')
        batch.set(servicesRef, data.services)

        // Store tips
        const tipsRef = doc(db, COLLECTIONS.TIPS, 'main')
        batch.set(tipsRef, data.tips)

        await batch.commit()

        // Store all locations individually for better querying
        await storeAllLocations(data.districts)

        console.log('Disney Springs data initialized successfully in Firestore')
    } catch (error) {
        console.error('Error initializing Disney Springs data:', error)
        throw error
    }
}

// Store all locations from districts
async function storeAllLocations(districts: DisneySpringsData['districts']): Promise<void> {
    const locations: DisneySpringLocation[] = []

    Object.entries(districts).forEach(([areaKey, district]) => {
        const area = areaKey === 'theLanding' ? LocationArea.TheLanding :
            areaKey === 'townCenter' ? LocationArea.TownCenter :
                areaKey === 'westSide' ? LocationArea.WestSide :
                    LocationArea.Marketplace

        // Add shopping locations
        district.shopping.forEach(location => {
            locations.push({
                ...location,
                area,
                updatedAt: new Date(),
                createdAt: new Date()
            })
        })

        // Add dining locations
        district.dining.forEach(location => {
            locations.push({
                ...location,
                area,
                updatedAt: new Date(),
                createdAt: new Date()
            })
        })

        // Add entertainment locations
        district.entertainment.forEach(location => {
            locations.push({
                ...location,
                area,
                updatedAt: new Date(),
                createdAt: new Date()
            })
        })
    })

    // Batch write all locations
    const batch = writeBatch(db)
    locations.forEach(location => {
        const locationRef = doc(db, COLLECTIONS.LOCATIONS, location.id)
        batch.set(locationRef, location)
    })

    await batch.commit()
}

// Get all Disney Springs locations
export async function getAllDisneySpringsLocations(): Promise<DisneySpringLocation[]> {
    const cacheKey = 'all_locations'
    const cached = getCachedData<DisneySpringLocation[]>(cacheKey)
    if (cached) return cached

    try {
        const locationsRef = collection(db, COLLECTIONS.LOCATIONS)
        const q = query(locationsRef, orderBy('name'))
        const snapshot = await getDocs(q)

        const locations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DisneySpringLocation[]

        setCachedData(cacheKey, locations)
        return locations
    } catch (error) {
        console.error('Error fetching Disney Springs locations:', error)
        throw error
    }
}

// Get locations by category
export async function getLocationsByCategory(category: LocationCategory): Promise<DisneySpringLocation[]> {
    const cacheKey = `locations_category_${category}`
    const cached = getCachedData<DisneySpringLocation[]>(cacheKey)
    if (cached) return cached

    try {
        const locationsRef = collection(db, COLLECTIONS.LOCATIONS)
        const q = query(
            locationsRef,
            where('category', '==', category),
            orderBy('name')
        )
        const snapshot = await getDocs(q)

        const locations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DisneySpringLocation[]

        setCachedData(cacheKey, locations)
        return locations
    } catch (error) {
        console.error('Error fetching locations by category:', error)
        throw error
    }
}

// Get locations by area
export async function getLocationsByArea(area: LocationArea): Promise<DisneySpringLocation[]> {
    const cacheKey = `locations_area_${area}`
    const cached = getCachedData<DisneySpringLocation[]>(cacheKey)
    if (cached) return cached

    try {
        const locationsRef = collection(db, COLLECTIONS.LOCATIONS)
        const q = query(
            locationsRef,
            where('area', '==', area),
            orderBy('name')
        )
        const snapshot = await getDocs(q)

        const locations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DisneySpringLocation[]

        setCachedData(cacheKey, locations)
        return locations
    } catch (error) {
        console.error('Error fetching locations by area:', error)
        throw error
    }
}

// Get single location by ID
export async function getDisneySpringsLocationById(id: string): Promise<DisneySpringLocation | null> {
    const cacheKey = `location_${id}`
    const cached = getCachedData<DisneySpringLocation>(cacheKey)
    if (cached) return cached

    try {
        const locationRef = doc(db, COLLECTIONS.LOCATIONS, id)
        const snapshot = await getDoc(locationRef)

        if (!snapshot.exists()) {
            return null
        }

        const location = {
            id: snapshot.id,
            ...snapshot.data()
        } as DisneySpringLocation

        setCachedData(cacheKey, location)
        return location
    } catch (error) {
        console.error('Error fetching location by ID:', error)
        throw error
    }
}

// Search locations with filters
export async function searchDisneySpringsLocations(filters: LocationFilters): Promise<LocationSearchResult[]> {
    try {
        const locationsRef = collection(db, COLLECTIONS.LOCATIONS)
        const constraints: QueryConstraint[] = []

        // Add category filter
        if (filters.category && filters.category !== 'all') {
            constraints.push(where('category', '==', filters.category))
        }

        // Add area filter
        if (filters.area && filters.area !== 'all') {
            constraints.push(where('area', '==', filters.area))
        }

        // Add price range filter
        if (filters.priceRange && filters.priceRange.length > 0) {
            constraints.push(where('priceRange', 'in', filters.priceRange))
        }

        constraints.push(orderBy('name'))

        const q = query(locationsRef, ...constraints)
        const snapshot = await getDocs(q)

        let locations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as LocationSearchResult[]

        // Client-side text search and feature filtering
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase()
            locations = locations.filter(location => {
                const searchableText = [
                    location.name,
                    location.description,
                    ...(location.tags || []),
                    ...(location.specialties || []),
                    ...(location.features || [])
                ].join(' ').toLowerCase()

                return searchableText.includes(searchTerm)
            }).map(location => ({
                ...location,
                relevanceScore: calculateRelevanceScore(location, searchTerm),
                matchedFields: getMatchedFields(location, searchTerm)
            }))

            // Sort by relevance
            locations.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        }

        // Feature filtering
        if (filters.features && filters.features.length > 0) {
            locations = locations.filter(location => {
                const locationFeatures = [
                    ...(location.features || []),
                    ...(location.tags || []),
                    ...(location.specialties || [])
                ]
                return filters.features!.some(feature =>
                    locationFeatures.some(locationFeature =>
                        locationFeature.toLowerCase().includes(feature.toLowerCase())
                    )
                )
            })
        }

        return locations
    } catch (error) {
        console.error('Error searching Disney Springs locations:', error)
        throw error
    }
}

// Get Disney Springs metadata
export async function getDisneySpringsMetadata(): Promise<DisneySpringsData['metadata'] | null> {
    const cacheKey = 'metadata'
    const cached = getCachedData<DisneySpringsData['metadata']>(cacheKey)
    if (cached) return cached

    try {
        const metadataRef = doc(db, COLLECTIONS.METADATA, 'main')
        const snapshot = await getDoc(metadataRef)

        if (!snapshot.exists()) {
            return null
        }

        const metadata = snapshot.data() as DisneySpringsData['metadata']
        setCachedData(cacheKey, metadata)
        return metadata
    } catch (error) {
        console.error('Error fetching Disney Springs metadata:', error)
        throw error
    }
}

// Get operational information
export async function getOperationalInfo(): Promise<DisneySpringsData['operationalInfo'] | null> {
    const cacheKey = 'operational_info'
    const cached = getCachedData<DisneySpringsData['operationalInfo']>(cacheKey)
    if (cached) return cached

    try {
        const operationalRef = doc(db, COLLECTIONS.OPERATIONAL_INFO, 'main')
        const snapshot = await getDoc(operationalRef)

        if (!snapshot.exists()) {
            return null
        }

        const operationalInfo = snapshot.data() as DisneySpringsData['operationalInfo']
        setCachedData(cacheKey, operationalInfo)
        return operationalInfo
    } catch (error) {
        console.error('Error fetching operational info:', error)
        throw error
    }
}

// Get events
export async function getDisneySpringsEvents(): Promise<DisneySpringsData['events'] | null> {
    const cacheKey = 'events'
    const cached = getCachedData<DisneySpringsData['events']>(cacheKey)
    if (cached) return cached

    try {
        const eventsRef = doc(db, COLLECTIONS.EVENTS, 'main')
        const snapshot = await getDoc(eventsRef)

        if (!snapshot.exists()) {
            return null
        }

        const events = snapshot.data() as DisneySpringsData['events']
        setCachedData(cacheKey, events)
        return events
    } catch (error) {
        console.error('Error fetching events:', error)
        throw error
    }
}

// Get services information
export async function getDisneySpringsServices(): Promise<DisneySpringsData['services'] | null> {
    const cacheKey = 'services'
    const cached = getCachedData<DisneySpringsData['services']>(cacheKey)
    if (cached) return cached

    try {
        const servicesRef = doc(db, COLLECTIONS.SERVICES, 'main')
        const snapshot = await getDoc(servicesRef)

        if (!snapshot.exists()) {
            return null
        }

        const services = snapshot.data() as DisneySpringsData['services']
        setCachedData(cacheKey, services)
        return services
    } catch (error) {
        console.error('Error fetching services:', error)
        throw error
    }
}

// Get tips
export async function getDisneySpringsTips(): Promise<DisneySpringsData['tips'] | null> {
    const cacheKey = 'tips'
    const cached = getCachedData<DisneySpringsData['tips']>(cacheKey)
    if (cached) return cached

    try {
        const tipsRef = doc(db, COLLECTIONS.TIPS, 'main')
        const snapshot = await getDoc(tipsRef)

        if (!snapshot.exists()) {
            return null
        }

        const tips = snapshot.data() as DisneySpringsData['tips']
        setCachedData(cacheKey, tips)
        return tips
    } catch (error) {
        console.error('Error fetching tips:', error)
        throw error
    }
}

// Helper functions for search relevance
function calculateRelevanceScore(location: DisneySpringLocation, searchTerm: string): number {
    let score = 0
    const term = searchTerm.toLowerCase()

    // Name matches get highest score
    if (location.name.toLowerCase().includes(term)) {
        score += 10
    }

    // Description matches
    if (location.description.toLowerCase().includes(term)) {
        score += 5
    }

    // Tag matches
    location.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(term)) {
            score += 3
        }
    })

    // Feature matches
    location.features?.forEach(feature => {
        if (feature.toLowerCase().includes(term)) {
            score += 2
        }
    })

    // Specialty matches
    location.specialties?.forEach(specialty => {
        if (specialty.toLowerCase().includes(term)) {
            score += 2
        }
    })

    return score
}

function getMatchedFields(location: DisneySpringLocation, searchTerm: string): string[] {
    const matches: string[] = []
    const term = searchTerm.toLowerCase()

    if (location.name.toLowerCase().includes(term)) {
        matches.push('name')
    }

    if (location.description.toLowerCase().includes(term)) {
        matches.push('description')
    }

    location.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(term)) {
            matches.push('tags')
        }
    })

    location.features?.forEach(feature => {
        if (feature.toLowerCase().includes(term)) {
            matches.push('features')
        }
    })

    return [...new Set(matches)] // Remove duplicates
}

// Clear cache (useful for development or when data is updated)
export function clearDisneySpringsCache(): void {
    cache.clear()
}

// Add a new location
export async function addDisneySpringsLocation(location: Omit<DisneySpringLocation, 'id'>): Promise<string> {
    try {
        const locationsRef = collection(db, COLLECTIONS.LOCATIONS)
        const newLocation = {
            ...location,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const docRef = await addDoc(locationsRef, newLocation)
        clearDisneySpringsCache() // Clear cache after adding
        return docRef.id
    } catch (error) {
        console.error('Error adding Disney Springs location:', error)
        throw error
    }
}

// Update a location
export async function updateDisneySpringsLocation(id: string, updates: Partial<DisneySpringLocation>): Promise<void> {
    try {
        const locationRef = doc(db, COLLECTIONS.LOCATIONS, id)
        await updateDoc(locationRef, {
            ...updates,
            updatedAt: new Date()
        })

        clearDisneySpringsCache() // Clear cache after updating
    } catch (error) {
        console.error('Error updating Disney Springs location:', error)
        throw error
    }
}

// Delete a location
export async function deleteDisneySpringsLocation(id: string): Promise<void> {
    try {
        const locationRef = doc(db, COLLECTIONS.LOCATIONS, id)
        await deleteDoc(locationRef)

        clearDisneySpringsCache() // Clear cache after deleting
    } catch (error) {
        console.error('Error deleting Disney Springs location:', error)
        throw error
    }
}