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
    FieldValue,
    Timestamp
} from 'firebase/firestore'
import { firestore } from './firebase.config'
import {
    FirebaseResort,
    CreateFirebaseResortInput,
    ResortCategory,
    ResortStats,
    Vacation,
    CreateVacationInput,
    Itinerary,
    CreateItineraryInput,
    CalendarEvent,
    CreateCalendarEventInput,
    EventHistory,
    CreateEventHistoryInput,
    UserLocation,
    CreateUserLocationInput,
    Geofence,
    CreateGeofenceInput,
    GeofenceAlert,
    CreateGeofenceAlertInput,
    UserProfile,
    CreateUserProfileInput,
    PartyMember,
    CreatePartyMemberInput,
    UserPreferences,
    CreateUserPreferencesInput
} from './types'

// Update Resort Input type for partial updates
export type UpdateFirebaseResortInput = Partial<Omit<FirebaseResort, 'id' | 'createdAt' | 'updatedAt'>>

// Base Firestore service class with common operations
export class FirestoreService {
    static async exists(collectionName: string, id: string): Promise<boolean> {
        const db = getFirestore()
        const docRef = doc(db, collectionName, id)
        const docSnap = await getDoc(docRef)
        return docSnap.exists()
    }
}

/**
 * Resort-specific Firestore operations
 */
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
    } = {}): Promise<{
        data: FirebaseResort[]
        totalCount?: number
        hasMore: boolean
    }> {
        const db = getFirestore()
        const resortsRef = collection(db, this.COLLECTION_NAME)

        // Build query constraints
        const constraints: QueryConstraint[] = []

        // Add filters
        if (options.category && options.category.length > 0) {
            constraints.push(where('category', 'in', options.category))
        }

        if (options.area && options.area.length > 0) {
            constraints.push(where('areaIndex', 'in', options.area.map(a => a.toLowerCase().replace(/\s+/g, '_'))))
        }

        if (options.minPrice !== undefined) {
            constraints.push(where('priceIndex', '>=', options.minPrice))
        }

        if (options.maxPrice !== undefined) {
            constraints.push(where('priceIndex', '<=', options.maxPrice))
        }

        if (options.amenities && options.amenities.length > 0) {
            // For array-contains queries, we can only filter by one amenity at a time
            const amenityIndex = options.amenities[0].toLowerCase().replace(/\s+/g, '_')
            constraints.push(where('amenityIndex', 'array-contains', amenityIndex))
        }

        if (options.isDVC !== undefined) {
            constraints.push(where('isDVC', '==', options.isDVC))
        }

        if (options.status) {
            constraints.push(where('status', '==', options.status))
        }

        if (options.search) {
            // For simple search, we'll use array-contains on search terms
            const searchTerm = options.search.toLowerCase()
            constraints.push(where('searchTerms', 'array-contains', searchTerm))
        }

        // Add sorting
        const sortBy = options.sortBy || 'name'
        const sortOrder = options.sortOrder || 'asc'

        if (sortBy === 'price') {
            constraints.push(orderBy('priceIndex', sortOrder))
        } else if (sortBy === 'rating') {
            constraints.push(orderBy('ratingIndex', sortOrder))
        } else if (sortBy === 'roomCount') {
            constraints.push(orderBy('roomCount', sortOrder))
        } else {
            constraints.push(orderBy('name', sortOrder))
        }

        // Add pagination
        const pageLimit = options.limit || 10
        constraints.push(limit(pageLimit + 1)) // Get one extra to check if there are more

        // Execute query
        const q = query(resortsRef, ...constraints)
        const querySnapshot = await getDocs(q)

        const resorts: FirebaseResort[] = []

        querySnapshot.docs.slice(0, pageLimit).forEach(docSnapshot => {
            resorts.push({
                id: docSnapshot.id,
                ...docSnapshot.data()
            } as FirebaseResort)
        })

        return {
            data: resorts,
            hasMore: querySnapshot.docs.length > pageLimit
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

        const docSnapshot = querySnapshot.docs[0]
        return {
            id: docSnapshot.id,
            ...docSnapshot.data()
        } as FirebaseResort
    }

    /**
     * Create a new resort
     */
    static async createResort(input: CreateFirebaseResortInput): Promise<string> {
        const db = getFirestore()
        const resortsRef = collection(db, this.COLLECTION_NAME)

        const now = serverTimestamp()
        const resortData: Omit<FirebaseResort, 'id'> & {
            createdAt: FieldValue
            updatedAt: FieldValue
        } = {
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

        const docRef = await addDoc(resortsRef, resortData)
        return docRef.id
    }

    /**
     * Update an existing resort
     */
    static async updateResort(id: string, input: UpdateFirebaseResortInput): Promise<void> {
        const db = getFirestore()
        const resortRef = doc(db, this.COLLECTION_NAME, id)

        const updateData: Partial<FirebaseResort> & { updatedAt: FieldValue } = {
            ...input,
            updatedAt: serverTimestamp()
        }

        // Regenerate indexes if relevant fields changed
        if (input.amenities) {
            updateData.amenityIndex = input.amenities.map(a => a.toLowerCase().replace(/\s+/g, '_'))
        }

        if (input.location) {
            updateData.areaIndex = input.location.toLowerCase().replace(/\s+/g, '_')
        }

        if (input.rates) {
            updateData.priceIndex = input.rates.min
        }

        if (input.reviews) {
            updateData.ratingIndex = input.reviews.avgRating
        }

        // Regenerate search terms if any searchable fields changed
        if (input.name || input.theme || input.location || input.amenities || input.promotionalTags) {
            const currentResort = await this.getResort(id)
            if (currentResort) {
                const updatedResort = { ...currentResort, ...input }
                updateData.searchTerms = this.generateSearchTerms(updatedResort)
            }
        }

        await updateDoc(resortRef, updateData)
    }

    /**
     * Delete a resort
     */
    static async deleteResort(id: string): Promise<void> {
        const db = getFirestore()
        const resortRef = doc(db, this.COLLECTION_NAME, id)
        await deleteDoc(resortRef)
    }

    /**
     * Batch import resorts
     */
    static async batchImportResorts(resorts: CreateFirebaseResortInput[]): Promise<string[]> {
        const db = getFirestore()
        const batch = writeBatch(db)
        const resortsRef = collection(db, this.COLLECTION_NAME)
        const resortIds: string[] = []

        for (const resortInput of resorts) {
            const resortDoc = doc(resortsRef)
            const now = serverTimestamp()

            const resortData: Omit<FirebaseResort, 'id'> & {
                createdAt: FieldValue
                updatedAt: FieldValue
            } = {
                ...resortInput,
                searchTerms: this.generateSearchTerms(resortInput),
                areaIndex: resortInput.location.toLowerCase().replace(/\s+/g, '_'),
                amenityIndex: resortInput.amenities.map(a => a.toLowerCase().replace(/\s+/g, '_')),
                priceIndex: resortInput.rates.min,
                ratingIndex: resortInput.reviews.avgRating,
                createdAt: now,
                updatedAt: now
            }

            batch.set(resortDoc, resortData)
            resortIds.push(resortDoc.id)
        }

        await batch.commit()
        return resortIds
    }

    /**
     * Get resort categories
     */
    static async getResortCategories(): Promise<ResortCategory[]> {
        const db = getFirestore()
        const categoriesRef = collection(db, this.CATEGORIES_COLLECTION)
        const querySnapshot = await getDocs(categoriesRef)

        return querySnapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...docSnapshot.data()
        } as ResortCategory))
    }

    /**
     * Get resort statistics
     */
    static async getResortStats(): Promise<ResortStats | null> {
        const db = getFirestore()
        const statsRef = collection(db, this.STATS_COLLECTION)
        const querySnapshot = await getDocs(statsRef)

        if (querySnapshot.empty) {
            return null
        }

        const docSnapshot = querySnapshot.docs[0]
        return {
            id: docSnapshot.id,
            ...docSnapshot.data()
        } as ResortStats
    }

    /**
     * Private helper to generate search terms
     */
    private static generateSearchTerms(resort: CreateFirebaseResortInput | FirebaseResort): string[] {
        const terms = new Set<string>()

        // Add name variations
        const nameWords = resort.name.toLowerCase().split(' ')
        nameWords.forEach(word => {
            if (word.length > 2) terms.add(word)
        })

        // Add theme terms
        if (resort.theme) {
            const themeWords = resort.theme.toLowerCase().split(' ')
            themeWords.forEach(word => {
                if (word.length > 2) terms.add(word)
            })
        }

        // Add location terms
        const locationWords = resort.location.toLowerCase().split(' ')
        locationWords.forEach(word => {
            if (word.length > 2) terms.add(word)
        })

        // Add amenities
        resort.amenities.forEach(amenity => {
            const amenityWords = amenity.toLowerCase().split(' ')
            amenityWords.forEach(word => {
                if (word.length > 2) terms.add(word)
            })
        })

        // Add promotional tags
        if (resort.promotionalTags) {
            resort.promotionalTags.forEach(tag => {
                const tagWords = tag.toLowerCase().split(' ')
                tagWords.forEach(word => {
                    if (word.length > 2) terms.add(word)
                })
            })
        }

        return Array.from(terms)
    }

    /**
     * Subscribe to resort changes
     */
    static subscribeToResorts(
        callback: (resorts: FirebaseResort[]) => void,
        options: {
            category?: string
            status?: string
            limit?: number
        } = {}
    ): Unsubscribe {
        const db = getFirestore()
        const resortsRef = collection(db, this.COLLECTION_NAME)

        const constraints: QueryConstraint[] = []

        if (options.category) {
            constraints.push(where('category', '==', options.category))
        }

        if (options.status) {
            constraints.push(where('status', '==', options.status))
        }

        constraints.push(orderBy('name'))

        if (options.limit) {
            constraints.push(limit(options.limit))
        }

        const q = query(resortsRef, ...constraints)

        return onSnapshot(q, (querySnapshot) => {
            const resorts: FirebaseResort[] = querySnapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            } as FirebaseResort))

            callback(resorts)
        })
    }
}

// Export the existing services that were already working
export {
    // ... other existing service exports
}