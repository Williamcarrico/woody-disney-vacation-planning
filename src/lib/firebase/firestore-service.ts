/**
 * Firestore Database Service
 *
 * Comprehensive service for managing all Firestore operations including
 * resorts, users, vacations, and other collections with caching and error handling.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
    serverTimestamp,
    writeBatch,
    onSnapshot,
    Unsubscribe,
    QueryConstraint,
    WhereFilterOp,
    OrderByDirection,
    getFirestore,
    setDoc,
    Timestamp,
    FieldValue
} from 'firebase/firestore'
import { firestore } from './firebase.config'
import {
    Resort as FirebaseResort,
    CreateResortInput,
    ResortCategory,
    ResortStats,
    Vacation, CreateVacationInput,
    Itinerary, CreateItineraryInput,
    CalendarEvent, CreateCalendarEventInput,
    EventHistory, CreateEventHistoryInput,
    UserLocation, CreateUserLocationInput,
    Geofence, CreateGeofenceInput,
    GeofenceAlert, CreateGeofenceAlertInput
} from './types'
import { resorts as staticResorts } from '@/lib/utils/resortData'
import { Resort as StaticResort } from '@/types/resort'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: unknown; timestamp: number }>()

// Collection names
export const COLLECTIONS = {
    RESORTS: 'resorts',
    USERS: 'users',
    VACATIONS: 'vacations',
    ITINERARIES: 'itineraries',
    WAIT_TIMES: 'waitTimes',
    ATTRACTIONS: 'attractions',
    PARKS: 'parks',
    CONTACTS: 'contacts',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics',
    CALENDAR_EVENTS: 'calendarEvents',
    EVENT_SHARING: 'eventSharing',
    EVENT_HISTORY: 'eventHistory',
    GEOFENCES: 'geofences',
    GEOFENCE_ALERTS: 'geofenceAlerts',
    USER_LOCATIONS: 'userLocations'
} as const

// Generic query options interface
export interface QueryOptions {
    limit?: number
    orderBy?: { field: string; direction: OrderByDirection }[]
    where?: { field: string; operator: WhereFilterOp; value: unknown }[]
    startAfter?: QueryDocumentSnapshot<DocumentData>
}

// Pagination interface
export interface PaginationResult<T> {
    data: T[]
    hasNextPage: boolean
    lastDoc?: QueryDocumentSnapshot<DocumentData>
    totalCount?: number
}

// Cache utilities
function getCacheKey(collection: string, id?: string, options?: QueryOptions): string {
    return `${collection}:${id || 'all'}:${JSON.stringify(options || {})}`
}

function getFromCache<T>(key: string): T | null {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T
    }
    cache.delete(key)
    return null
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() })
}

function clearCacheByPattern(pattern: string): void {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key)
        }
    }
}

// Generic CRUD operations
export class FirestoreService {
    /**
     * Get a single document by ID
     */
    static async getDocument<T>(
        collectionName: string,
        id: string,
        useCache = true
    ): Promise<T | null> {
        const cacheKey = getCacheKey(collectionName, id)

        if (useCache) {
            const cached = getFromCache<T>(cacheKey)
            if (cached) return cached
        }

        try {
            const docRef = doc(firestore, collectionName, id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as T
                if (useCache) setCache(cacheKey, data)
                return data
            }

            return null
        } catch (error) {
            console.error(`Error getting document ${id} from ${collectionName}:`, error)
            throw new Error(`Failed to get ${collectionName} document`)
        }
    }

    /**
     * Get multiple documents with query options
     */
    static async getDocuments<T>(
        collectionName: string,
        options: QueryOptions = {},
        useCache = true
    ): Promise<PaginationResult<T>> {
        const cacheKey = getCacheKey(collectionName, undefined, options)

        if (useCache) {
            const cached = getFromCache<PaginationResult<T>>(cacheKey)
            if (cached) return cached
        }

        try {
            const collectionRef = collection(firestore, collectionName)
            const constraints: QueryConstraint[] = []

            // Add where clauses
            if (options.where) {
                options.where.forEach(({ field, operator, value }) => {
                    constraints.push(where(field, operator, value))
                })
            }

            // Add order by clauses
            if (options.orderBy) {
                options.orderBy.forEach(({ field, direction }) => {
                    constraints.push(orderBy(field, direction))
                })
            }

            // Add pagination
            if (options.startAfter) {
                constraints.push(startAfter(options.startAfter))
            }

            if (options.limit) {
                constraints.push(limit(options.limit))
            }

            const q = query(collectionRef, ...constraints)
            const querySnapshot = await getDocs(q)

            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[]

            const result: PaginationResult<T> = {
                data,
                hasNextPage: querySnapshot.docs.length === (options.limit || 0),
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
            }

            if (useCache) setCache(cacheKey, result)
            return result
        } catch (error) {
            console.error(`Error getting documents from ${collectionName}:`, error)
            throw new Error(`Failed to get ${collectionName} documents`)
        }
    }

    /**
     * Create a new document
     */
    static async createDocument<T>(
        collectionName: string,
        data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string> {
        try {
            const collectionRef = collection(firestore, collectionName)
            const docData = {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            const docRef = await addDoc(collectionRef, docData)

            // Clear cache for this collection
            clearCacheByPattern(collectionName)

            return docRef.id
        } catch (error) {
            console.error(`Error creating document in ${collectionName}:`, error)
            throw new Error(`Failed to create ${collectionName} document`)
        }
    }

    /**
     * Update an existing document
     */
    static async updateDocument<T>(
        collectionName: string,
        id: string,
        data: Partial<Omit<T, 'id' | 'createdAt'>>
    ): Promise<void> {
        try {
            const docRef = doc(firestore, collectionName, id)
            const updateData = {
                ...data,
                updatedAt: serverTimestamp()
            }

            await updateDoc(docRef, updateData)

            // Clear cache for this collection and document
            clearCacheByPattern(collectionName)
        } catch (error) {
            console.error(`Error updating document ${id} in ${collectionName}:`, error)
            throw new Error(`Failed to update ${collectionName} document`)
        }
    }

    /**
     * Delete a document
     */
    static async deleteDocument(collectionName: string, id: string): Promise<void> {
        try {
            const docRef = doc(firestore, collectionName, id)
            await deleteDoc(docRef)

            // Clear cache for this collection
            clearCacheByPattern(collectionName)
        } catch (error) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, error)
            throw new Error(`Failed to delete ${collectionName} document`)
        }
    }

    /**
     * Batch operations
     */
    static async batchWrite(operations: Array<{
        type: 'create' | 'update' | 'delete'
        collection: string
        id?: string
        data?: unknown
    }>): Promise<void> {
        try {
            const batch = writeBatch(firestore)

            operations.forEach(({ type, collection: collectionName, id, data }) => {
                if (type === 'create') {
                    const docRef = doc(collection(firestore, collectionName))
                    const createData = {
                        ...(data as Record<string, unknown>),
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    }
                    batch.set(docRef, createData)
                } else if (type === 'update' && id) {
                    const docRef = doc(firestore, collectionName, id)
                    const updateData = {
                        ...(data as Record<string, unknown>),
                        updatedAt: serverTimestamp()
                    }
                    batch.update(docRef, updateData)
                } else if (type === 'delete' && id) {
                    const docRef = doc(firestore, collectionName, id)
                    batch.delete(docRef)
                }
            })

            await batch.commit()

            // Clear cache for affected collections
            const affectedCollections = [...new Set(operations.map(op => op.collection))]
            affectedCollections.forEach(collectionName => {
                clearCacheByPattern(collectionName)
            })
        } catch (error) {
            console.error('Error in batch write:', error)
            throw new Error('Failed to execute batch operations')
        }
    }

    /**
     * Real-time listener
     */
    static subscribeToDocument<T>(
        collectionName: string,
        id: string,
        callback: (data: T | null) => void
    ): Unsubscribe {
        const docRef = doc(firestore, collectionName, id)

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = { id: doc.id, ...doc.data() } as T
                callback(data)
            } else {
                callback(null)
            }
        }, (error) => {
            console.error(`Error listening to document ${id} in ${collectionName}:`, error)
            callback(null)
        })
    }

    /**
     * Real-time collection listener
     */
    static subscribeToCollection<T>(
        collectionName: string,
        options: QueryOptions = {},
        callback: (data: T[]) => void
    ): Unsubscribe {
        const collectionRef = collection(firestore, collectionName)
        const constraints: QueryConstraint[] = []

        // Add constraints based on options
        if (options.where) {
            options.where.forEach(({ field, operator, value }) => {
                constraints.push(where(field, operator, value))
            })
        }

        if (options.orderBy) {
            options.orderBy.forEach(({ field, direction }) => {
                constraints.push(orderBy(field, direction))
            })
        }

        if (options.limit) {
            constraints.push(limit(options.limit))
        }

        const q = query(collectionRef, ...constraints)

        return onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[]
            callback(data)
        }, (error) => {
            console.error(`Error listening to collection ${collectionName}:`, error)
            callback([])
        })
    }
}

// Resort-specific service methods
// Update Resort Input type for partial updates
export type UpdateResortInput = Partial<Omit<CreateResortInput, 'id' | 'createdAt' | 'updatedAt'>>

export class ResortService extends FirestoreService {
    private static readonly COLLECTION_NAME = 'resorts'
    private static readonly CATEGORIES_COLLECTION = 'resortCategories'
    private static readonly STATS_COLLECTION = 'resortStats'

    /**
     * Get all resorts with filtering and pagination
     */
    static async getResorts(options: {
        category?: string[]
        area?: string[]
        minPrice?: number
        maxPrice?: number
        amenities?: string[]
        isDVC?: boolean
        status?: string
        search?: string
        page?: number
        limit?: number
        sortBy?: 'name' | 'price' | 'rating' | 'roomCount'
        sortOrder?: 'asc' | 'desc'
        useCache?: boolean
    } = {}): Promise<{
        data: FirebaseResort[]
        totalCount?: number
        hasMore: boolean
    }> {
        const db = getFirestore()
        const {
            category,
            area,
            minPrice,
            maxPrice,
            amenities,
            isDVC,
            status = 'Open',
            search,
            page = 1,
            limit: pageLimit = 20,
            sortBy = 'name',
            sortOrder = 'asc'
        } = options

        let q = query(collection(db, this.COLLECTION_NAME))

        // Add filters
        if (category && category.length > 0) {
            q = query(q, where('category', 'in', category))
        }

        if (area && area.length > 0) {
            const areaIndexes = area.map(a => a.toLowerCase().replace(/\s+/g, '_'))
            q = query(q, where('areaIndex', 'in', areaIndexes))
        }

        if (minPrice !== undefined) {
            q = query(q, where('priceIndex', '>=', minPrice))
        }

        if (maxPrice !== undefined) {
            q = query(q, where('priceIndex', '<=', maxPrice))
        }

        if (isDVC !== undefined) {
            q = query(q, where('isDVC', '==', isDVC))
        }

        if (status) {
            q = query(q, where('status', '==', status))
        }

        if (amenities && amenities.length > 0) {
            // For amenity filtering, we'll need to use array-contains-any
            const amenityIndexes = amenities.map(a => a.toLowerCase().replace(/\s+/g, '_'))
            q = query(q, where('amenityIndex', 'array-contains-any', amenityIndexes))
        }

        if (search && search.trim()) {
            // For full-text search, use array-contains-any with search terms
            const searchTerms = search.toLowerCase().split(' ')
                .map(term => term.trim())
                .filter(term => term.length > 0)

            if (searchTerms.length > 0) {
                q = query(q, where('searchTerms', 'array-contains-any', searchTerms))
            }
        }

        // Add sorting
        const isAscending = sortOrder === 'asc'
        switch (sortBy) {
            case 'price':
                q = query(q, orderBy('priceIndex', isAscending ? 'asc' : 'desc'))
                break
            case 'rating':
                q = query(q, orderBy('ratingIndex', isAscending ? 'asc' : 'desc'))
                break
            case 'roomCount':
                q = query(q, orderBy('roomCount', isAscending ? 'asc' : 'desc'))
                break
            default:
                q = query(q, orderBy('name', isAscending ? 'asc' : 'desc'))
        }

        // Add pagination
        const offset = (page - 1) * pageLimit
        q = query(q, limit(pageLimit + 1)) // Get one extra to check if there are more

        if (offset > 0) {
            // For offset, we need to use startAfter with a cursor
            // This is a simplified approach - in production, you'd want to use proper cursor-based pagination
            const countQuery = query(collection(db, this.COLLECTION_NAME))
            // Apply same filters but no limit for count
            // This is inefficient for large datasets - consider using a cached count
        }

        const querySnapshot = await getDocs(q)
        const resorts: FirebaseResort[] = []

        querySnapshot.docs.slice(0, pageLimit).forEach(doc => {
            resorts.push({
                id: doc.id,
                ...doc.data()
            } as FirebaseResort)
        })

        const hasMore = querySnapshot.docs.length > pageLimit

        return {
            data: resorts,
            hasMore
        }
    }

    /**
     * Get a single resort by ID
     */
    static async getResort(id: string): Promise<FirebaseResort | null> {
        const db = getFirestore()
        const resortRef = doc(db, this.COLLECTION_NAME, id)
        const docSnap = await getDoc(resortRef)

        if (!docSnap.exists()) {
            return null
        }

        return {
            id: docSnap.id,
            ...docSnap.data()
        } as FirebaseResort
    }

    /**
     * Get resort by resortId (the unique identifier from the data)
     */
    static async getResortByResortId(resortId: string): Promise<FirebaseResort | null> {
        const db = getFirestore()
        const q = query(
            collection(db, this.COLLECTION_NAME),
            where('resortId', '==', resortId),
            limit(1)
        )

        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            return null
        }

        const doc = querySnapshot.docs[0]
        return {
            id: doc.id,
            ...doc.data()
        } as FirebaseResort
    }

    /**
     * Create a new resort
     */
    static async createResort(input: CreateResortInput): Promise<string> {
        const db = getFirestore()
        const resortRef = doc(collection(db, this.COLLECTION_NAME))

        const now = serverTimestamp()
        const resortData: Omit<FirebaseResort, 'id'> = {
            ...input,
            // Generate search and filter indexes
            searchTerms: this.generateSearchTerms(input),
            areaIndex: input.location.toLowerCase().replace(/\s+/g, '_'),
            amenityIndex: input.amenities.map(a => a.toLowerCase().replace(/\s+/g, '_')),
            priceIndex: input.rates.min,
            ratingIndex: input.reviews.avgRating,
            createdAt: now,
            updatedAt: now
        }

        await setDoc(resortRef, resortData)
        return resortRef.id
    }

    /**
     * Update an existing resort
     */
    static async updateResort(id: string, data: UpdateResortInput): Promise<void> {
        return this.updateDocument<FirebaseResort>(COLLECTIONS.RESORTS, id, data)
    }

    /**
     * Delete a resort
     */
    static async deleteResort(id: string): Promise<void> {
        return this.deleteDocument(COLLECTIONS.RESORTS, id)
    }

    /**
     * Migrate static data to Firestore
     */
    static async migrateStaticData(): Promise<void> {
        console.log('Starting migration of static resort data to Firestore...')

        const operations = staticResorts.map(resort => ({
            type: 'create' as const,
            collection: COLLECTIONS.RESORTS,
            data: {
                ...resort,
                isActive: true,
                tags: [resort.category.toLowerCase(), resort.location.area.toLowerCase()],
                starRating: this.calculateStarRating(resort)
            }
        }))

        await this.batchWrite(operations)
        console.log(`Successfully migrated ${staticResorts.length} resorts to Firestore`)
    }

    /**
     * Fallback to static data with filtering
     */
    private static getStaticResorts(options: {
        category?: string
        area?: string
        search?: string
        page?: number
        limit?: number
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
    }): PaginationResult<StaticResort> {
        let filtered = [...staticResorts]

        // Apply filters
        if (options.category) {
            filtered = filtered.filter(r => r.category.toLowerCase() === options.category!.toLowerCase())
        }

        if (options.area) {
            filtered = filtered.filter(r => r.location.area.toLowerCase() === options.area!.toLowerCase())
        }

        if (options.search) {
            const searchTerm = options.search.toLowerCase()
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchTerm) ||
                r.description.toLowerCase().includes(searchTerm) ||
                r.longDescription.toLowerCase().includes(searchTerm)
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0
            switch (options.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name)
                    break
                case 'price':
                    const priceA = Math.min(a.pricing.valueRange.low || Infinity, a.pricing.moderateRange.low || Infinity, a.pricing.deluxeRange.low || Infinity)
                    const priceB = Math.min(b.pricing.valueRange.low || Infinity, b.pricing.moderateRange.low || Infinity, b.pricing.deluxeRange.low || Infinity)
                    comparison = (priceA === Infinity ? 0 : priceA) - (priceB === Infinity ? 0 : priceB)
                    break
                default:
                    comparison = a.name.localeCompare(b.name)
            }
            return options.sortOrder === 'desc' ? -comparison : comparison
        })

        // Apply pagination
        const page = options.page || 1
        const limit = options.limit || 20
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedData = filtered.slice(startIndex, endIndex)

        // Return static resorts directly (don't convert to Firebase format for fallback)
        // The API expects the original static structure with pricing data
        return {
            data: paginatedData as any, // Type assertion needed due to different Resort types
            hasNextPage: endIndex < filtered.length,
            totalCount: filtered.length
        }
    }

    /**
     * Convert static resort data to Firebase format
     */
    private static convertStaticToFirebaseResort(staticResort: StaticResort): FirebaseResort {
        const now = Timestamp.now()

        return {
            id: staticResort.id,
            name: staticResort.name,
            description: staticResort.description,
            shortDescription: staticResort.longDescription?.substring(0, 200) || staticResort.description,
            category: this.mapResortCategory(staticResort.category),
            address: this.parseAddress(staticResort.address),
            location: {
                latitude: staticResort.location.latitude,
                longitude: staticResort.location.longitude,
            },
            phoneNumber: staticResort.phoneNumber,
            amenities: staticResort.amenities?.map(amenity => ({
                name: amenity.name,
                description: amenity.description,
                category: 'other' as const,
                isHighlighted: false,
            })) || [],
            roomTypes: staticResort.roomTypes?.map(roomType => ({
                name: roomType.name,
                description: roomType.description,
                maxOccupancy: roomType.maxOccupancy,
                bedType: ['other'] as const,
                isAccessible: false,
            })) || [],
            imageUrl: staticResort.imageUrls?.main,
            galleryImages: staticResort.imageUrls?.gallery || [],
            isActive: true,
            nearbyParks: staticResort.nearbyAttractions || [],
            checkInTime: '16:00',
            checkOutTime: '11:00',
            starRating: this.calculateStarRating(staticResort),
            tags: [staticResort.category.toLowerCase()],
            createdAt: now,
            updatedAt: now,
        }
    }

    /**
     * Map static resort categories to Firebase schema categories
     */
    private static mapResortCategory(category: string): 'value' | 'moderate' | 'deluxe' | 'villa' | 'campground' | 'partner' {
        switch (category.toLowerCase()) {
            case 'value':
            case 'value plus':
                return 'value'
            case 'moderate':
                return 'moderate'
            case 'deluxe':
            case 'deluxe villa':
                return 'deluxe'
            case 'campground':
                return 'campground'
            default:
                return 'moderate'
        }
    }

    /**
     * Parse address string into address object
     */
    private static parseAddress(addressString: string): { street: string; city: string; state: string; zipCode: string; country: string } {
        // Default address structure for Disney resorts
        return {
            street: addressString || 'Walt Disney World Resort',
            city: 'Bay Lake',
            state: 'FL',
            zipCode: '32830',
            country: 'USA',
        }
    }

    /**
     * Calculate star rating based on resort features
     */
    private static calculateStarRating(resort: StaticResort): number {
        let rating = 3 // Base rating

        // Category bonus
        switch (resort.category) {
            case 'Deluxe':
            case 'Deluxe Villa':
                rating += 1
                break
            case 'Moderate':
                rating += 0.5
                break
        }

        // Amenities bonus
        if (resort.amenities.length > 5) rating += 0.5
        if (resort.dining.length > 3) rating += 0.5

        return Math.min(5, Math.max(1, Math.round(rating * 2) / 2)) // Round to nearest 0.5
    }

    /**
     * Subscribe to resort updates
     */
    static subscribeToResorts(
        callback: (resorts: FirebaseResort[]) => void,
        options: QueryOptions = {}
    ): Unsubscribe {
        return this.subscribeToCollection<FirebaseResort>(COLLECTIONS.RESORTS, options, callback)
    }

    /**
     * Subscribe to a single resort
     */
    static subscribeToResort(id: string, callback: (resort: FirebaseResort | null) => void): Unsubscribe {
        return this.subscribeToDocument<FirebaseResort>(COLLECTIONS.RESORTS, id, callback)
    }

    /**
     * Get resort categories
     */
    static async getResortCategories(): Promise<ResortCategory[]> {
        const db = getFirestore()
        const q = query(collection(db, this.CATEGORIES_COLLECTION), orderBy('name'))
        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ResortCategory))
    }

    /**
     * Get resort statistics
     */
    static async getResortStats(): Promise<ResortStats | null> {
        const db = getFirestore()
        const q = query(collection(db, this.STATS_COLLECTION), limit(1))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            return null
        }

        const doc = querySnapshot.docs[0]
        return {
            id: doc.id,
            ...doc.data()
        } as ResortStats
    }

    /**
     * Update resort statistics
     */
    static async updateResortStats(stats: Omit<ResortStats, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
        const db = getFirestore()
        const statsRef = doc(collection(db, this.STATS_COLLECTION), 'current')

        await setDoc(statsRef, {
            ...stats,
            updatedAt: serverTimestamp()
        }, { merge: true })
    }

    /**
     * Generate search terms for full-text search
     */
    private static generateSearchTerms(input: CreateResortInput): string[] {
        const terms: Set<string> = new Set()

        // Add name terms
        input.name.toLowerCase().split(' ').forEach(term => {
            if (term.length > 1) terms.add(term)
        })

        // Add description terms (first 50 words to avoid too many terms)
        input.description.toLowerCase().split(' ').slice(0, 50).forEach(term => {
            const cleanTerm = term.replace(/[^\w]/g, '')
            if (cleanTerm.length > 2) terms.add(cleanTerm)
        })

        // Add amenity terms
        input.amenities.forEach(amenity => {
            amenity.toLowerCase().split(' ').forEach(term => {
                if (term.length > 1) terms.add(term)
            })
        })

        // Add theme terms
        input.theme.toLowerCase().split(' ').forEach(term => {
            if (term.length > 1) terms.add(term)
        })

        // Add promotional tags
        input.promotionalTags.forEach(tag => {
            tag.toLowerCase().split(' ').forEach(term => {
                if (term.length > 1) terms.add(term)
            })
        })

        // Add location terms
        input.location.toLowerCase().split(' ').forEach(term => {
            if (term.length > 1) terms.add(term)
        })

        return Array.from(terms)
    }
}

// Generic document interface
interface FirestoreDocument {
    id: string
    createdAt?: Timestamp
    updatedAt?: Timestamp
    [key: string]: unknown
}

// User profile interface
interface UserProfile extends FirestoreDocument {
    userId: string
    email: string
    displayName?: string
    photoURL?: string
}

// Visit and reservation interfaces
interface ParkVisit extends FirestoreDocument {
    userId: string
    visitDate: Timestamp
    parkId: string
    duration?: number
}

interface Reservation extends FirestoreDocument {
    userId: string
    reservationTime: Timestamp
    status: string
    type: string
}

interface AttractionVisit extends FirestoreDocument {
    userId: string
    visitDate: Timestamp
    attractionId: string
    status: string
}

interface Expense extends FirestoreDocument {
    userId: string
    date: Timestamp
    amount: number
    category: string
}

interface UserAchievement extends FirestoreDocument {
    userId: string
    achievementId: string
    unlockedAt: Timestamp
}

interface Photo extends FirestoreDocument {
    userId: string
    url: string
    description?: string
}

interface Friendship extends FirestoreDocument {
    requesterId: string
    recipientId: string
    status: string
}

interface FitnessData extends FirestoreDocument {
    userId: string
    date: Timestamp
    steps?: number
    distance?: number
}

interface FastPass extends FirestoreDocument {
    userId: string
    attractionId: string
    usedAt?: Timestamp
    status: string
}

interface ParkCapacity extends FirestoreDocument {
    date: Timestamp
    parkId: string
    capacity: number
    currentOccupancy: number
}

interface MagicMoment extends FirestoreDocument {
    userId: string
    description: string
    location?: string
}

interface DiningReservation extends FirestoreDocument {
    userId: string
    restaurantId: string
    reservationTime: Timestamp
}

interface AttractionReservation extends FirestoreDocument {
    userId: string
    attractionId: string
    reservationTime: Timestamp
}

interface ShowReservation extends FirestoreDocument {
    userId: string
    showId: string
    showTime: Timestamp
}

interface LightningLane extends FirestoreDocument {
    userId: string
    attractionId: string
    reservationTime: Timestamp
}

interface SpecialEvent extends FirestoreDocument {
    userId: string
    eventId: string
    eventTime: Timestamp
}

interface GeniePlus extends FirestoreDocument {
    userId: string
    attractionId: string
    reservationTime: Timestamp
}

// Filter interfaces for UserService methods
interface BaseFilter {
    startDate?: Timestamp | Date | string
    endDate?: Timestamp | Date | string
    date?: Timestamp | Date | string
    status?: string
    startTime?: Timestamp | Date | string
}

interface ReservationFilter extends Omit<BaseFilter, 'status'> {
    status?: string[]
}

interface AttractionFilter extends BaseFilter {
    status?: string
}

// Extended service methods for the compatibility layer
export class UserService extends FirestoreService {
    static async getUserProfile(userId: string): Promise<UserProfile | null> {
        return this.getDocument('users', userId)
    }

    static async getUsers(where?: Record<string, unknown>): Promise<UserProfile[]> {
        const options: QueryOptions = {}
        if (where) {
            options.where = Object.entries(where).map(([field, value]) => ({
                field,
                operator: '==' as WhereFilterOp,
                value
            }))
        }
        const result = await this.getDocuments<UserProfile>('users', options)
        return result.data
    }

    static async getParkVisits(userId: string, filters: BaseFilter): Promise<ParkVisit[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'visitDate', direction: 'desc' }]
        }

        if (filters.startDate && options.where) {
            options.where.push({ field: 'visitDate', operator: '>=', value: filters.startDate })
        }
        if (filters.endDate && options.where) {
            options.where.push({ field: 'visitDate', operator: '<=', value: filters.endDate })
        }

        const result = await this.getDocuments<ParkVisit>('parkVisits', options)
        return result.data
    }

    static async getReservations(userId: string, filters: ReservationFilter): Promise<Reservation[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'reservationTime', direction: 'asc' }]
        }

        if (filters.status && options.where) {
            options.where.push({ field: 'status', operator: 'in', value: filters.status })
        }
        if (filters.startTime && options.where) {
            options.where.push({ field: 'reservationTime', operator: '>=', value: filters.startTime })
        }

        const result = await this.getDocuments<Reservation>('reservations', options)
        return result.data
    }

    static async getAttractionVisits(userId: string, filters: AttractionFilter): Promise<AttractionVisit[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'visitDate', direction: 'desc' }]
        }

        if (filters.startDate) {
            options.where!.push({ field: 'visitDate', operator: '>=', value: filters.startDate })
        }
        if (filters.status) {
            options.where!.push({ field: 'status', operator: '==', value: filters.status })
        }

        const result = await this.getDocuments<AttractionVisit>('attractionVisits', options)
        return result.data
    }

    static async getExpenses(userId: string, filters: BaseFilter): Promise<Expense[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'date', direction: 'desc' }]
        }

        if (filters.startDate) {
            options.where!.push({ field: 'date', operator: '>=', value: filters.startDate })
        }

        const result = await this.getDocuments<Expense>('expenses', options)
        return result.data
    }

    static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'unlockedAt', direction: 'desc' }]
        }

        const result = await this.getDocuments<UserAchievement>('userAchievements', options)
        return result.data
    }

    static async getPhotos(userId: string, filters: BaseFilter): Promise<Photo[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'createdAt', direction: 'desc' }]
        }

        if (filters.startDate) {
            options.where!.push({ field: 'createdAt', operator: '>=', value: filters.startDate })
        }

        const result = await this.getDocuments<Photo>('photos', options)
        return result.data
    }

    static async getFriendships(userId: string): Promise<Friendship[]> {
        const options: QueryOptions = {
            where: [
                { field: 'requesterId', operator: '==', value: userId }
            ]
        }

        const result = await this.getDocuments<Friendship>('friendships', options)
        return result.data
    }

    static async getFitnessData(userId: string, filters: BaseFilter): Promise<FitnessData[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'date', direction: 'desc' }]
        }

        if (filters.startDate) {
            options.where!.push({ field: 'date', operator: '>=', value: filters.startDate })
        }

        const result = await this.getDocuments<FitnessData>('fitnessData', options)
        return result.data
    }

    static async getFastPasses(userId: string, filters: AttractionFilter): Promise<FastPass[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'usedAt', direction: 'desc' }]
        }

        if (filters.startDate) {
            options.where!.push({ field: 'usedAt', operator: '>=', value: filters.startDate })
        }
        if (filters.status) {
            options.where!.push({ field: 'status', operator: '==', value: filters.status })
        }

        const result = await this.getDocuments<FastPass>('fastPasses', options)
        return result.data
    }

    static async getParkCapacity(filters: BaseFilter): Promise<ParkCapacity | null> {
        const options: QueryOptions = {
            orderBy: [{ field: 'updatedAt', direction: 'desc' }],
            limit: 1
        }

        if (filters.date) {
            options.where = [{ field: 'date', operator: '>=', value: filters.date }]
        }

        const result = await this.getDocuments<ParkCapacity>('parkCapacity', options)
        return result.data[0] || null
    }

    static async getMagicMoments(userId: string, filters: BaseFilter): Promise<MagicMoment[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'createdAt', direction: 'desc' }]
        }

        if (filters.startDate) {
            options.where!.push({ field: 'createdAt', operator: '>=', value: filters.startDate })
        }

        const result = await this.getDocuments<MagicMoment>('magicMoments', options)
        return result.data
    }

    // Event/Reservation methods
    static async getDiningReservations(userId: string, _filters: BaseFilter): Promise<DiningReservation[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'reservationTime', direction: 'asc' }]
        }
        const result = await this.getDocuments<DiningReservation>('diningReservations', options)
        return result.data
    }

    static async getAttractionReservations(userId: string, _filters: BaseFilter): Promise<AttractionReservation[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'reservationTime', direction: 'asc' }]
        }
        const result = await this.getDocuments<AttractionReservation>('attractionReservations', options)
        return result.data
    }

    static async getShowReservations(userId: string, _filters: BaseFilter): Promise<ShowReservation[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'showTime', direction: 'asc' }]
        }
        const result = await this.getDocuments<ShowReservation>('showReservations', options)
        return result.data
    }

    static async getLightningLanes(userId: string, _filters: BaseFilter): Promise<LightningLane[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'reservationTime', direction: 'asc' }]
        }
        const result = await this.getDocuments<LightningLane>('lightningLanes', options)
        return result.data
    }

    static async getSpecialEvents(userId: string, _filters: BaseFilter): Promise<SpecialEvent[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'eventTime', direction: 'asc' }]
        }
        const result = await this.getDocuments<SpecialEvent>('specialEvents', options)
        return result.data
    }

    static async getGeniePlus(userId: string, _filters: BaseFilter): Promise<GeniePlus[]> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: [{ field: 'reservationTime', direction: 'asc' }]
        }
        const result = await this.getDocuments<GeniePlus>('geniePlus', options)
        return result.data
    }
}

// Vacation Service
export class VacationService extends FirestoreService {
    static async getVacations(userId: string, options: QueryOptions = {}): Promise<PaginationResult<Vacation>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ]
        }
        return this.getDocuments<Vacation>(COLLECTIONS.VACATIONS, finalOptions)
    }

    static async getVacation(id: string): Promise<Vacation | null> {
        return this.getDocument<Vacation>(COLLECTIONS.VACATIONS, id)
    }

    static async createVacation(data: CreateVacationInput): Promise<string> {
        const vacationData = {
            ...data,
            destination: data.destination ?? 'Walt Disney World',
            isArchived: data.isArchived ?? false
        }
        return this.createDocument<Vacation>(COLLECTIONS.VACATIONS, vacationData)
    }

    static async updateVacation(id: string, data: Partial<CreateVacationInput>): Promise<void> {
        return this.updateDocument<Vacation>(COLLECTIONS.VACATIONS, id, data)
    }

    static async deleteVacation(id: string): Promise<void> {
        return this.deleteDocument(COLLECTIONS.VACATIONS, id)
    }

    static subscribeToVacations(userId: string, callback: (vacations: Vacation[]) => void): Unsubscribe {
        return this.subscribeToCollection<Vacation>(
            COLLECTIONS.VACATIONS,
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'startDate', direction: 'desc' }]
            },
            callback
        )
    }
}

// Itinerary Service
export class ItineraryService extends FirestoreService {
    static async getItineraries(userId: string, options: QueryOptions = {}): Promise<PaginationResult<Itinerary>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ]
        }
        return this.getDocuments<Itinerary>(COLLECTIONS.ITINERARIES, finalOptions)
    }

    static async getItinerary(id: string): Promise<Itinerary | null> {
        return this.getDocument<Itinerary>(COLLECTIONS.ITINERARIES, id)
    }

    static async getItineraryByShareCode(shareCode: string): Promise<Itinerary | null> {
        const options: QueryOptions = {
            where: [{ field: 'shareCode', operator: '==', value: shareCode }],
            limit: 1
        }
        const result = await this.getDocuments<Itinerary>(COLLECTIONS.ITINERARIES, options)
        return result.data[0] || null
    }

    static async createItinerary(data: CreateItineraryInput): Promise<string> {
        const itineraryData = {
            ...data,
            isShared: data.isShared ?? false
        }
        return this.createDocument<Itinerary>(COLLECTIONS.ITINERARIES, itineraryData)
    }

    static async updateItinerary(id: string, data: Partial<CreateItineraryInput>): Promise<void> {
        return this.updateDocument<Itinerary>(COLLECTIONS.ITINERARIES, id, data)
    }

    static async deleteItinerary(id: string): Promise<void> {
        return this.deleteDocument(COLLECTIONS.ITINERARIES, id)
    }
}

// Calendar Event Service
export class CalendarEventService extends FirestoreService {
    static async getCalendarEvents(vacationId: string, options: QueryOptions = {}): Promise<PaginationResult<CalendarEvent>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'vacationId', operator: '==', value: vacationId },
                ...(options.where || [])
            ]
        }
        return this.getDocuments<CalendarEvent>(COLLECTIONS.CALENDAR_EVENTS, finalOptions)
    }

    static async getCalendarEvent(id: string): Promise<CalendarEvent | null> {
        return this.getDocument<CalendarEvent>(COLLECTIONS.CALENDAR_EVENTS, id)
    }

    static async createCalendarEvent(data: CreateCalendarEventInput): Promise<string> {
        const eventData = {
            ...data,
            priority: data.priority ?? 'medium',
            status: data.status ?? 'planned',
            isHighlighted: data.isHighlighted ?? false
        }
        return this.createDocument<CalendarEvent>(COLLECTIONS.CALENDAR_EVENTS, eventData)
    }

    static async updateCalendarEvent(id: string, data: Partial<CreateCalendarEventInput>): Promise<void> {
        return this.updateDocument<CalendarEvent>(COLLECTIONS.CALENDAR_EVENTS, id, data)
    }

    static async deleteCalendarEvent(id: string): Promise<void> {
        return this.deleteDocument(COLLECTIONS.CALENDAR_EVENTS, id)
    }

    static subscribeToCalendarEvents(vacationId: string, callback: (events: CalendarEvent[]) => void): Unsubscribe {
        return this.subscribeToCollection<CalendarEvent>(
            COLLECTIONS.CALENDAR_EVENTS,
            {
                where: [{ field: 'vacationId', operator: '==', value: vacationId }],
                orderBy: [{ field: 'date', direction: 'asc' }]
            },
            callback
        )
    }
}

// Event History Service
export class EventHistoryService extends FirestoreService {
    static async createEventHistory(data: CreateEventHistoryInput): Promise<string> {
        // EventHistory requires timestamp but CreateEventHistoryInput doesn't have it
        // We need to add it manually
        const historyData = {
            ...data,
            timestamp: Timestamp.now()
        }
        return this.createDocument<EventHistory>(COLLECTIONS.EVENT_HISTORY, historyData)
    }

    static async getEventHistory(eventId: string): Promise<PaginationResult<EventHistory>> {
        const options: QueryOptions = {
            where: [{ field: 'eventId', operator: '==', value: eventId }],
            orderBy: [{ field: 'timestamp', direction: 'desc' }]
        }
        return this.getDocuments<EventHistory>(COLLECTIONS.EVENT_HISTORY, options)
    }
}

// User Location Service
export class UserLocationService extends FirestoreService {
    static async getUserLocations(userId: string, options: QueryOptions = {}): Promise<PaginationResult<UserLocation>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ]
        }
        return this.getDocuments<UserLocation>(COLLECTIONS.USER_LOCATIONS, finalOptions)
    }

    static async createUserLocation(data: CreateUserLocationInput): Promise<string> {
        const locationData = {
            ...data,
            timestamp: data.timestamp ?? Timestamp.now(),
            type: data.type ?? 'current' as const,
            isActive: data.isActive ?? true
        }
        return this.createDocument<UserLocation>(COLLECTIONS.USER_LOCATIONS, locationData)
    }

    static async getCurrentLocation(userId: string): Promise<UserLocation | null> {
        const options: QueryOptions = {
            where: [
                { field: 'userId', operator: '==', value: userId },
                { field: 'type', operator: '==', value: 'current' },
                { field: 'isActive', operator: '==', value: true }
            ],
            orderBy: [{ field: 'timestamp', direction: 'desc' }],
            limit: 1
        }
        const result = await this.getDocuments<UserLocation>(COLLECTIONS.USER_LOCATIONS, options)
        return result.data[0] || null
    }
}

// Geofence Service
export class GeofenceService extends FirestoreService {
    static async getGeofences(vacationId?: string, options: QueryOptions = {}): Promise<PaginationResult<Geofence>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: vacationId
                ? [
                    { field: 'vacationId', operator: '==', value: vacationId },
                    ...(options.where || [])
                ]
                : (options.where || [])
        }
        return this.getDocuments<Geofence>(COLLECTIONS.GEOFENCES, finalOptions)
    }

    static async getGeofence(id: string): Promise<Geofence | null> {
        return this.getDocument<Geofence>(COLLECTIONS.GEOFENCES, id)
    }

    static async createGeofence(data: CreateGeofenceInput): Promise<string> {
        const geofenceData = {
            ...data,
            type: data.type ?? 'custom' as const,
            isActive: data.isActive ?? true,
            settings: data.settings ?? {}
        }
        return this.createDocument<Geofence>(COLLECTIONS.GEOFENCES, geofenceData)
    }

    static async updateGeofence(id: string, data: Partial<CreateGeofenceInput>): Promise<void> {
        return this.updateDocument<Geofence>(COLLECTIONS.GEOFENCES, id, data)
    }

    static async deleteGeofence(id: string): Promise<void> {
        return this.deleteDocument(COLLECTIONS.GEOFENCES, id)
    }
}

// Geofence Alert Service
export class GeofenceAlertService extends FirestoreService {
    static async getGeofenceAlerts(userId: string, options: QueryOptions = {}): Promise<PaginationResult<GeofenceAlert>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ]
        }
        return this.getDocuments<GeofenceAlert>(COLLECTIONS.GEOFENCE_ALERTS, finalOptions)
    }

    static async createGeofenceAlert(data: CreateGeofenceAlertInput): Promise<string> {
        const alertData = {
            ...data,
            triggeredAt: data.triggeredAt ?? Timestamp.now(),
            isRead: data.isRead ?? false
        }
        return this.createDocument<GeofenceAlert>(COLLECTIONS.GEOFENCE_ALERTS, alertData)
    }

    static async markAlertAsRead(id: string): Promise<void> {
        return this.updateDocument<GeofenceAlert>(COLLECTIONS.GEOFENCE_ALERTS, id, {
            isRead: true,
            readAt: Timestamp.now()
        })
    }
}

// Export the main service as default
export default FirestoreService

// Park Visit Service
export class ParkVisitService extends FirestoreService {
    static async getParkVisits(userId: string, options: QueryOptions = {}): Promise<PaginationResult<ParkVisit>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'visitDate', direction: 'desc' }]
        }
        return this.getDocuments<ParkVisit>('parkVisits', finalOptions)
    }

    static async getParkVisit(id: string): Promise<ParkVisit | null> {
        return this.getDocument<ParkVisit>('parkVisits', id)
    }

    static async createParkVisit(data: Omit<ParkVisit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<ParkVisit>('parkVisits', data)
    }

    static async updateParkVisit(id: string, data: Partial<Omit<ParkVisit, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<ParkVisit>('parkVisits', id, data)
    }

    static async deleteParkVisit(id: string): Promise<void> {
        return this.deleteDocument('parkVisits', id)
    }

    static subscribeToUserParkVisits(userId: string, callback: (visits: ParkVisit[]) => void): Unsubscribe {
        return this.subscribeToCollection<ParkVisit>(
            'parkVisits',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'visitDate', direction: 'desc' }]
            },
            callback
        )
    }
}

// Reservation Service
export class ReservationService extends FirestoreService {
    static async getReservations(userId: string, options: QueryOptions = {}): Promise<PaginationResult<Reservation>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'reservationTime', direction: 'asc' }]
        }
        return this.getDocuments<Reservation>('reservations', finalOptions)
    }

    static async getReservation(id: string): Promise<Reservation | null> {
        return this.getDocument<Reservation>('reservations', id)
    }

    static async createReservation(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<Reservation>('reservations', data)
    }

    static async updateReservation(id: string, data: Partial<Omit<Reservation, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<Reservation>('reservations', id, data)
    }

    static async deleteReservation(id: string): Promise<void> {
        return this.deleteDocument('reservations', id)
    }

    static subscribeToUserReservations(userId: string, callback: (reservations: Reservation[]) => void): Unsubscribe {
        return this.subscribeToCollection<Reservation>(
            'reservations',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'reservationTime', direction: 'asc' }]
            },
            callback
        )
    }
}

// Attraction Visit Service
export class AttractionVisitService extends FirestoreService {
    static async getAttractionVisits(userId: string, options: QueryOptions = {}): Promise<PaginationResult<AttractionVisit>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'visitDate', direction: 'desc' }]
        }
        return this.getDocuments<AttractionVisit>('attractionVisits', finalOptions)
    }

    static async getAttractionVisit(id: string): Promise<AttractionVisit | null> {
        return this.getDocument<AttractionVisit>('attractionVisits', id)
    }

    static async createAttractionVisit(data: Omit<AttractionVisit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<AttractionVisit>('attractionVisits', data)
    }

    static async updateAttractionVisit(id: string, data: Partial<Omit<AttractionVisit, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<AttractionVisit>('attractionVisits', id, data)
    }

    static async deleteAttractionVisit(id: string): Promise<void> {
        return this.deleteDocument('attractionVisits', id)
    }

    static subscribeToUserAttractionVisits(userId: string, callback: (visits: AttractionVisit[]) => void): Unsubscribe {
        return this.subscribeToCollection<AttractionVisit>(
            'attractionVisits',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'visitDate', direction: 'desc' }]
            },
            callback
        )
    }
}

// Expense Service
export class ExpenseService extends FirestoreService {
    static async getExpenses(userId: string, options: QueryOptions = {}): Promise<PaginationResult<Expense>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'date', direction: 'desc' }]
        }
        return this.getDocuments<Expense>('expenses', finalOptions)
    }

    static async getExpense(id: string): Promise<Expense | null> {
        return this.getDocument<Expense>('expenses', id)
    }

    static async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<Expense>('expenses', data)
    }

    static async updateExpense(id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<Expense>('expenses', id, data)
    }

    static async deleteExpense(id: string): Promise<void> {
        return this.deleteDocument('expenses', id)
    }

    static subscribeToUserExpenses(userId: string, callback: (expenses: Expense[]) => void): Unsubscribe {
        return this.subscribeToCollection<Expense>(
            'expenses',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'date', direction: 'desc' }]
            },
            callback
        )
    }

    static async getTotalExpensesByCategory(userId: string, startDate?: Timestamp, endDate?: Timestamp): Promise<Record<string, number>> {
        const options: QueryOptions = {
            where: [{ field: 'userId', operator: '==', value: userId }]
        }

        if (startDate) {
            options.where!.push({ field: 'date', operator: '>=', value: startDate })
        }
        if (endDate) {
            options.where!.push({ field: 'date', operator: '<=', value: endDate })
        }

        const result = await this.getDocuments<Expense>('expenses', options)

        return result.data.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount
            return acc
        }, {} as Record<string, number>)
    }
}

// User Achievement Service
export class UserAchievementService extends FirestoreService {
    static async getUserAchievements(userId: string, options: QueryOptions = {}): Promise<PaginationResult<UserAchievement>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'unlockedAt', direction: 'desc' }]
        }
        return this.getDocuments<UserAchievement>('userAchievements', finalOptions)
    }

    static async getUserAchievement(id: string): Promise<UserAchievement | null> {
        return this.getDocument<UserAchievement>('userAchievements', id)
    }

    static async createUserAchievement(data: Omit<UserAchievement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<UserAchievement>('userAchievements', data)
    }

    static async updateUserAchievement(id: string, data: Partial<Omit<UserAchievement, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<UserAchievement>('userAchievements', id, data)
    }

    static async deleteUserAchievement(id: string): Promise<void> {
        return this.deleteDocument('userAchievements', id)
    }

    static subscribeToUserAchievements(userId: string, callback: (achievements: UserAchievement[]) => void): Unsubscribe {
        return this.subscribeToCollection<UserAchievement>(
            'userAchievements',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'unlockedAt', direction: 'desc' }]
            },
            callback
        )
    }
}

// Photo Service
export class PhotoService extends FirestoreService {
    static async getPhotos(userId: string, options: QueryOptions = {}): Promise<PaginationResult<Photo>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'createdAt', direction: 'desc' }]
        }
        return this.getDocuments<Photo>('photos', finalOptions)
    }

    static async getPhoto(id: string): Promise<Photo | null> {
        return this.getDocument<Photo>('photos', id)
    }

    static async createPhoto(data: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<Photo>('photos', data)
    }

    static async updatePhoto(id: string, data: Partial<Omit<Photo, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<Photo>('photos', id, data)
    }

    static async deletePhoto(id: string): Promise<void> {
        return this.deleteDocument('photos', id)
    }

    static subscribeToUserPhotos(userId: string, callback: (photos: Photo[]) => void): Unsubscribe {
        return this.subscribeToCollection<Photo>(
            'photos',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'createdAt', direction: 'desc' }]
            },
            callback
        )
    }
}

// Friendship Service
export class FriendshipService extends FirestoreService {
    static async getFriendships(userId: string, options: QueryOptions = {}): Promise<PaginationResult<Friendship>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                ...(options.where || [])
            ]
        }

        // Add user filter for either requester or recipient
        if (!options.where?.some(w => w.field === 'requesterId' || w.field === 'recipientId')) {
            finalOptions.where = [
                { field: 'requesterId', operator: '==', value: userId }
            ]
        }

        return this.getDocuments<Friendship>('friendships', finalOptions)
    }

    static async getFriendship(id: string): Promise<Friendship | null> {
        return this.getDocument<Friendship>('friendships', id)
    }

    static async createFriendship(data: Omit<Friendship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<Friendship>('friendships', data)
    }

    static async updateFriendship(id: string, data: Partial<Omit<Friendship, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<Friendship>('friendships', id, data)
    }

    static async deleteFriendship(id: string): Promise<void> {
        return this.deleteDocument('friendships', id)
    }

    static async getFriendshipBetweenUsers(userId1: string, userId2: string): Promise<Friendship | null> {
        const options: QueryOptions = {
            where: [
                { field: 'requesterId', operator: '==', value: userId1 },
                { field: 'recipientId', operator: '==', value: userId2 }
            ],
            limit: 1
        }
        const result = await this.getDocuments<Friendship>('friendships', options)

        if (result.data.length > 0) {
            return result.data[0]
        }

        // Check reverse direction
        const reverseOptions: QueryOptions = {
            where: [
                { field: 'requesterId', operator: '==', value: userId2 },
                { field: 'recipientId', operator: '==', value: userId1 }
            ],
            limit: 1
        }
        const reverseResult = await this.getDocuments<Friendship>('friendships', reverseOptions)
        return reverseResult.data[0] || null
    }

    static subscribeToUserFriendships(userId: string, callback: (friendships: Friendship[]) => void): Unsubscribe {
        return this.subscribeToCollection<Friendship>(
            'friendships',
            {
                where: [{ field: 'requesterId', operator: '==', value: userId }]
            },
            callback
        )
    }
}

// Fitness Data Service
export class FitnessDataService extends FirestoreService {
    static async getFitnessData(userId: string, options: QueryOptions = {}): Promise<PaginationResult<FitnessData>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'date', direction: 'desc' }]
        }
        return this.getDocuments<FitnessData>('fitnessData', finalOptions)
    }

    static async getFitnessDataEntry(id: string): Promise<FitnessData | null> {
        return this.getDocument<FitnessData>('fitnessData', id)
    }

    static async createFitnessData(data: Omit<FitnessData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<FitnessData>('fitnessData', data)
    }

    static async updateFitnessData(id: string, data: Partial<Omit<FitnessData, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<FitnessData>('fitnessData', id, data)
    }

    static async deleteFitnessData(id: string): Promise<void> {
        return this.deleteDocument('fitnessData', id)
    }

    static subscribeToUserFitnessData(userId: string, callback: (data: FitnessData[]) => void): Unsubscribe {
        return this.subscribeToCollection<FitnessData>(
            'fitnessData',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'date', direction: 'desc' }]
            },
            callback
        )
    }
}

// FastPass Service
export class FastPassService extends FirestoreService {
    static async getFastPasses(userId: string, options: QueryOptions = {}): Promise<PaginationResult<FastPass>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'createdAt', direction: 'desc' }]
        }
        return this.getDocuments<FastPass>('fastPasses', finalOptions)
    }

    static async getFastPass(id: string): Promise<FastPass | null> {
        return this.getDocument<FastPass>('fastPasses', id)
    }

    static async createFastPass(data: Omit<FastPass, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<FastPass>('fastPasses', data)
    }

    static async updateFastPass(id: string, data: Partial<Omit<FastPass, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<FastPass>('fastPasses', id, data)
    }

    static async deleteFastPass(id: string): Promise<void> {
        return this.deleteDocument('fastPasses', id)
    }

    static subscribeToUserFastPasses(userId: string, callback: (fastPasses: FastPass[]) => void): Unsubscribe {
        return this.subscribeToCollection<FastPass>(
            'fastPasses',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'createdAt', direction: 'desc' }]
            },
            callback
        )
    }
}

// Park Capacity Service
export class ParkCapacityService extends FirestoreService {
    static async getParkCapacities(options: QueryOptions = {}): Promise<PaginationResult<ParkCapacity>> {
        const finalOptions: QueryOptions = {
            ...options,
            orderBy: options.orderBy || [{ field: 'date', direction: 'desc' }]
        }
        return this.getDocuments<ParkCapacity>('parkCapacity', finalOptions)
    }

    static async getParkCapacity(id: string): Promise<ParkCapacity | null> {
        return this.getDocument<ParkCapacity>('parkCapacity', id)
    }

    static async createParkCapacity(data: Omit<ParkCapacity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<ParkCapacity>('parkCapacity', data)
    }

    static async updateParkCapacity(id: string, data: Partial<Omit<ParkCapacity, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<ParkCapacity>('parkCapacity', id, data)
    }

    static async deleteParkCapacity(id: string): Promise<void> {
        return this.deleteDocument('parkCapacity', id)
    }

    static async getCurrentParkCapacity(parkId: string): Promise<ParkCapacity | null> {
        const options: QueryOptions = {
            where: [{ field: 'parkId', operator: '==', value: parkId }],
            orderBy: [{ field: 'updatedAt', direction: 'desc' }],
            limit: 1
        }
        const result = await this.getDocuments<ParkCapacity>('parkCapacity', options)
        return result.data[0] || null
    }

    static subscribeToCurrentParkCapacity(parkId: string, callback: (capacity: ParkCapacity | null) => void): Unsubscribe {
        return this.subscribeToCollection<ParkCapacity>(
            'parkCapacity',
            {
                where: [{ field: 'parkId', operator: '==', value: parkId }],
                orderBy: [{ field: 'updatedAt', direction: 'desc' }],
                limit: 1
            },
            (capacities) => callback(capacities[0] || null)
        )
    }
}

// Magic Moment Service
export class MagicMomentService extends FirestoreService {
    static async getMagicMoments(userId: string, options: QueryOptions = {}): Promise<PaginationResult<MagicMoment>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'createdAt', direction: 'desc' }]
        }
        return this.getDocuments<MagicMoment>('magicMoments', finalOptions)
    }

    static async getMagicMoment(id: string): Promise<MagicMoment | null> {
        return this.getDocument<MagicMoment>('magicMoments', id)
    }

    static async createMagicMoment(data: Omit<MagicMoment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<MagicMoment>('magicMoments', data)
    }

    static async updateMagicMoment(id: string, data: Partial<Omit<MagicMoment, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<MagicMoment>('magicMoments', id, data)
    }

    static async deleteMagicMoment(id: string): Promise<void> {
        return this.deleteDocument('magicMoments', id)
    }

    static subscribeToUserMagicMoments(userId: string, callback: (moments: MagicMoment[]) => void): Unsubscribe {
        return this.subscribeToCollection<MagicMoment>(
            'magicMoments',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'createdAt', direction: 'desc' }]
            },
            callback
        )
    }
}

// Dining Reservation Service
export class DiningReservationService extends FirestoreService {
    static async getDiningReservations(userId: string, options: QueryOptions = {}): Promise<PaginationResult<DiningReservation>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'reservationTime', direction: 'asc' }]
        }
        return this.getDocuments<DiningReservation>('diningReservations', finalOptions)
    }

    static async getDiningReservation(id: string): Promise<DiningReservation | null> {
        return this.getDocument<DiningReservation>('diningReservations', id)
    }

    static async createDiningReservation(data: Omit<DiningReservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<DiningReservation>('diningReservations', data)
    }

    static async updateDiningReservation(id: string, data: Partial<Omit<DiningReservation, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<DiningReservation>('diningReservations', id, data)
    }

    static async deleteDiningReservation(id: string): Promise<void> {
        return this.deleteDocument('diningReservations', id)
    }

    static subscribeToUserDiningReservations(userId: string, callback: (reservations: DiningReservation[]) => void): Unsubscribe {
        return this.subscribeToCollection<DiningReservation>(
            'diningReservations',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'reservationTime', direction: 'asc' }]
            },
            callback
        )
    }
}

// Attraction Reservation Service
export class AttractionReservationService extends FirestoreService {
    static async getAttractionReservations(userId: string, options: QueryOptions = {}): Promise<PaginationResult<AttractionReservation>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'reservationTime', direction: 'asc' }]
        }
        return this.getDocuments<AttractionReservation>('attractionReservations', finalOptions)
    }

    static async getAttractionReservation(id: string): Promise<AttractionReservation | null> {
        return this.getDocument<AttractionReservation>('attractionReservations', id)
    }

    static async createAttractionReservation(data: Omit<AttractionReservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<AttractionReservation>('attractionReservations', data)
    }

    static async updateAttractionReservation(id: string, data: Partial<Omit<AttractionReservation, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<AttractionReservation>('attractionReservations', id, data)
    }

    static async deleteAttractionReservation(id: string): Promise<void> {
        return this.deleteDocument('attractionReservations', id)
    }

    static subscribeToUserAttractionReservations(userId: string, callback: (reservations: AttractionReservation[]) => void): Unsubscribe {
        return this.subscribeToCollection<AttractionReservation>(
            'attractionReservations',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'reservationTime', direction: 'asc' }]
            },
            callback
        )
    }
}

// Show Reservation Service
export class ShowReservationService extends FirestoreService {
    static async getShowReservations(userId: string, options: QueryOptions = {}): Promise<PaginationResult<ShowReservation>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'showTime', direction: 'asc' }]
        }
        return this.getDocuments<ShowReservation>('showReservations', finalOptions)
    }

    static async getShowReservation(id: string): Promise<ShowReservation | null> {
        return this.getDocument<ShowReservation>('showReservations', id)
    }

    static async createShowReservation(data: Omit<ShowReservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<ShowReservation>('showReservations', data)
    }

    static async updateShowReservation(id: string, data: Partial<Omit<ShowReservation, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<ShowReservation>('showReservations', id, data)
    }

    static async deleteShowReservation(id: string): Promise<void> {
        return this.deleteDocument('showReservations', id)
    }

    static subscribeToUserShowReservations(userId: string, callback: (reservations: ShowReservation[]) => void): Unsubscribe {
        return this.subscribeToCollection<ShowReservation>(
            'showReservations',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'showTime', direction: 'asc' }]
            },
            callback
        )
    }
}

// Lightning Lane Service
export class LightningLaneService extends FirestoreService {
    static async getLightningLanes(userId: string, options: QueryOptions = {}): Promise<PaginationResult<LightningLane>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'reservationTime', direction: 'asc' }]
        }
        return this.getDocuments<LightningLane>('lightningLanes', finalOptions)
    }

    static async getLightningLane(id: string): Promise<LightningLane | null> {
        return this.getDocument<LightningLane>('lightningLanes', id)
    }

    static async createLightningLane(data: Omit<LightningLane, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<LightningLane>('lightningLanes', data)
    }

    static async updateLightningLane(id: string, data: Partial<Omit<LightningLane, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<LightningLane>('lightningLanes', id, data)
    }

    static async deleteLightningLane(id: string): Promise<void> {
        return this.deleteDocument('lightningLanes', id)
    }

    static subscribeToUserLightningLanes(userId: string, callback: (lightningLanes: LightningLane[]) => void): Unsubscribe {
        return this.subscribeToCollection<LightningLane>(
            'lightningLanes',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'reservationTime', direction: 'asc' }]
            },
            callback
        )
    }
}

// Special Event Service
export class SpecialEventService extends FirestoreService {
    static async getSpecialEvents(userId: string, options: QueryOptions = {}): Promise<PaginationResult<SpecialEvent>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'eventTime', direction: 'asc' }]
        }
        return this.getDocuments<SpecialEvent>('specialEvents', finalOptions)
    }

    static async getSpecialEvent(id: string): Promise<SpecialEvent | null> {
        return this.getDocument<SpecialEvent>('specialEvents', id)
    }

    static async createSpecialEvent(data: Omit<SpecialEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<SpecialEvent>('specialEvents', data)
    }

    static async updateSpecialEvent(id: string, data: Partial<Omit<SpecialEvent, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<SpecialEvent>('specialEvents', id, data)
    }

    static async deleteSpecialEvent(id: string): Promise<void> {
        return this.deleteDocument('specialEvents', id)
    }

    static subscribeToUserSpecialEvents(userId: string, callback: (events: SpecialEvent[]) => void): Unsubscribe {
        return this.subscribeToCollection<SpecialEvent>(
            'specialEvents',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'eventTime', direction: 'asc' }]
            },
            callback
        )
    }
}

// Genie Plus Service
export class GeniePlusService extends FirestoreService {
    static async getGeniePlus(userId: string, options: QueryOptions = {}): Promise<PaginationResult<GeniePlus>> {
        const finalOptions: QueryOptions = {
            ...options,
            where: [
                { field: 'userId', operator: '==', value: userId },
                ...(options.where || [])
            ],
            orderBy: options.orderBy || [{ field: 'reservationTime', direction: 'asc' }]
        }
        return this.getDocuments<GeniePlus>('geniePlus', finalOptions)
    }

    static async getGeniePlusEntry(id: string): Promise<GeniePlus | null> {
        return this.getDocument<GeniePlus>('geniePlus', id)
    }

    static async createGeniePlus(data: Omit<GeniePlus, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return this.createDocument<GeniePlus>('geniePlus', data)
    }

    static async updateGeniePlus(id: string, data: Partial<Omit<GeniePlus, 'id' | 'createdAt'>>): Promise<void> {
        return this.updateDocument<GeniePlus>('geniePlus', id, data)
    }

    static async deleteGeniePlus(id: string): Promise<void> {
        return this.deleteDocument('geniePlus', id)
    }

    static subscribeToUserGeniePlus(userId: string, callback: (geniePlus: GeniePlus[]) => void): Unsubscribe {
        return this.subscribeToCollection<GeniePlus>(
            'geniePlus',
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'reservationTime', direction: 'asc' }]
            },
            callback
        )
    }
}