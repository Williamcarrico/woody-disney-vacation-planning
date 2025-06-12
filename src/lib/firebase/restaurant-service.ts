/**
 * Firebase Restaurant Service
 *
 * Handles all restaurant-related operations in Firestore
 * Provides CRUD operations, real-time updates, and advanced filtering
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    writeBatch,
    onSnapshot,
    Timestamp,
    type QueryConstraint,
    type DocumentSnapshot,
    type Unsubscribe,
    enableNetwork,
    disableNetwork
} from 'firebase/firestore'
import { firestore as database } from './firebase.config'
import {
    DisneyRestaurant,
    DiningFilters,
    DisneyLocation,
    CuisineType,
    ServiceType,
    PriceRange,
    ReservationDifficulty
} from '@/types/dining'

export class RestaurantService {
    private static instance: RestaurantService
    private readonly collectionName = 'restaurants'
    private cache = new Map<string, DisneyRestaurant>()
    private cacheExpiry = new Map<string, number>()
    private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    public static getInstance(): RestaurantService {
        if (!RestaurantService.instance) {
            RestaurantService.instance = new RestaurantService()
        }
        return RestaurantService.instance
    }

    private getCollection() {
        return collection(database, this.collectionName)
    }

    private getDocument(id: string) {
        return doc(database, this.collectionName, id)
    }

    private isValidCacheEntry(id: string): boolean {
        const expiry = this.cacheExpiry.get(id)
        return expiry ? Date.now() < expiry : false
    }

    private setCacheEntry(id: string, restaurant: DisneyRestaurant): void {
        this.cache.set(id, restaurant)
        this.cacheExpiry.set(id, Date.now() + this.CACHE_DURATION)
    }

    private firestoreToRestaurant(doc: DocumentSnapshot): DisneyRestaurant | null {
        if (!doc.exists()) return null

        const data = doc.data()
        return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamps to ISO strings
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as DisneyRestaurant
    }

    private restaurantToFirestore(restaurant: DisneyRestaurant) {
        const { id, createdAt, updatedAt, ...data } = restaurant
        return {
            ...data,
            createdAt: typeof createdAt === 'string' ? Timestamp.fromDate(new Date(createdAt)) : createdAt,
            updatedAt: Timestamp.fromDate(new Date())
        }
    }

    /**
     * Get a single restaurant by ID
     */
    async getRestaurant(id: string): Promise<DisneyRestaurant | null> {
        try {
            // Check cache first
            if (this.isValidCacheEntry(id)) {
                return this.cache.get(id)!
            }

            const docRef = this.getDocument(id)
            const docSnap = await getDoc(docRef)
            const restaurant = this.firestoreToRestaurant(docSnap)

            if (restaurant) {
                this.setCacheEntry(id, restaurant)
            }

            return restaurant
        } catch (error) {
            console.error('Error getting restaurant:', error)
            throw new Error(`Failed to get restaurant ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Get all restaurants with optional filtering and pagination
     */
    async getRestaurants(
        filters?: DiningFilters,
        limitCount?: number,
        lastDoc?: DocumentSnapshot
    ): Promise<{ restaurants: DisneyRestaurant[]; lastDoc?: DocumentSnapshot }> {
        try {
            const constraints: QueryConstraint[] = []

            // Apply filters
            if (filters) {
                if (filters.parkIds?.length) {
                    constraints.push(where('location.parkId', 'in', filters.parkIds))
                }
                if (filters.serviceTypes?.length) {
                    constraints.push(where('serviceType', 'in', filters.serviceTypes))
                }
                if (filters.priceRanges?.length) {
                    constraints.push(where('priceRange', 'in', filters.priceRanges))
                }
                if (filters.hasCharacterDining) {
                    constraints.push(where('characterDining.hasCharacterDining', '==', true))
                }
                if (filters.acceptsDiningPlan) {
                    constraints.push(where('diningPlanInfo.acceptsDiningPlan', '==', true))
                }
                if (filters.acceptsReservations) {
                    constraints.push(where('reservationInfo.acceptsReservations', '==', true))
                }
                if (filters.rating) {
                    constraints.push(where('averageRating', '>=', filters.rating))
                }
            }

            // Default ordering
            constraints.push(orderBy('averageRating', 'desc'))

            // Pagination
            if (limitCount) {
                constraints.push(limit(limitCount))
            }
            if (lastDoc) {
                constraints.push(startAfter(lastDoc))
            }

            const q = query(this.getCollection(), ...constraints)
            const querySnapshot = await getDocs(q)

            const restaurants: DisneyRestaurant[] = []
            let newLastDoc: DocumentSnapshot | undefined

            querySnapshot.forEach((doc) => {
                const restaurant = this.firestoreToRestaurant(doc)
                if (restaurant) {
                    restaurants.push(restaurant)
                    this.setCacheEntry(restaurant.id, restaurant)
                    newLastDoc = doc
                }
            })

            // Apply client-side filters that can't be done in Firestore
            let filteredRestaurants = restaurants
            if (filters) {
                filteredRestaurants = this.applyClientSideFilters(restaurants, filters)
            }

            return { restaurants: filteredRestaurants, lastDoc: newLastDoc }
        } catch (error) {
            console.error('Error getting restaurants:', error)
            throw new Error(`Failed to get restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Apply filters that can't be done efficiently in Firestore
     */
    private applyClientSideFilters(restaurants: DisneyRestaurant[], filters: DiningFilters): DisneyRestaurant[] {
        return restaurants.filter(restaurant => {
            // Search query filter
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase()
                const searchableFields = [
                    restaurant.name.toLowerCase(),
                    restaurant.description.toLowerCase(),
                    restaurant.shortDescription?.toLowerCase() || '',
                    ...restaurant.cuisineTypes.map(c => c.toLowerCase()),
                    ...restaurant.tags.map(t => t.toLowerCase()),
                    ...restaurant.searchKeywords.map(k => k.toLowerCase()),
                    restaurant.location.areaName.toLowerCase()
                ]
                if (!searchableFields.some(field => field.includes(query))) {
                    return false
                }
            }

            // Cuisine types filter
            if (filters.cuisineTypes?.length) {
                if (!restaurant.cuisineTypes.some(cuisine => filters.cuisineTypes?.includes(cuisine))) {
                    return false
                }
            }

            // Special features filter
            if (filters.specialFeatures?.length) {
                if (!restaurant.specialFeatures.some(feature => filters.specialFeatures?.includes(feature))) {
                    return false
                }
            }

            // Open now filter (simplified - would need real-time checking)
            if (filters.openNow) {
                const now = new Date()
                const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
                const hours = restaurant.operatingHours[dayName]
                if (!hours || hours === "Closed" || hours.toLowerCase() === "closed") {
                    return false
                }
            }

            return true
        })
    }

    /**
     * Create or update a restaurant
     */
    async saveRestaurant(restaurant: DisneyRestaurant): Promise<void> {
        try {
            const docRef = this.getDocument(restaurant.id)
            const firestoreData = this.restaurantToFirestore(restaurant)

            await setDoc(docRef, firestoreData, { merge: true })

            // Update cache
            this.setCacheEntry(restaurant.id, restaurant)
        } catch (error) {
            console.error('Error saving restaurant:', error)
            throw new Error(`Failed to save restaurant: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Update restaurant fields
     */
    async updateRestaurant(id: string, updates: Partial<DisneyRestaurant>): Promise<void> {
        try {
            const docRef = this.getDocument(id)
            const updateData = {
                ...updates,
                updatedAt: Timestamp.fromDate(new Date())
            }

            await updateDoc(docRef, updateData)

            // Update cache if entry exists
            if (this.cache.has(id)) {
                const cached = this.cache.get(id)!
                this.setCacheEntry(id, { ...cached, ...updates })
            }
        } catch (error) {
            console.error('Error updating restaurant:', error)
            throw new Error(`Failed to update restaurant: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Delete a restaurant
     */
    async deleteRestaurant(id: string): Promise<void> {
        try {
            const docRef = this.getDocument(id)
            await deleteDoc(docRef)

            // Remove from cache
            this.cache.delete(id)
            this.cacheExpiry.delete(id)
        } catch (error) {
            console.error('Error deleting restaurant:', error)
            throw new Error(`Failed to delete restaurant: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Batch save multiple restaurants
     */
    async batchSaveRestaurants(restaurants: DisneyRestaurant[]): Promise<void> {
        try {
            const batch = writeBatch(database)

            restaurants.forEach(restaurant => {
                const docRef = this.getDocument(restaurant.id)
                const firestoreData = this.restaurantToFirestore(restaurant)
                batch.set(docRef, firestoreData, { merge: true })
            })

            await batch.commit()

            // Update cache
            restaurants.forEach(restaurant => {
                this.setCacheEntry(restaurant.id, restaurant)
            })
        } catch (error) {
            console.error('Error batch saving restaurants:', error)
            throw new Error(`Failed to batch save restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Get restaurants by location
     */
    async getRestaurantsByLocation(location: DisneyLocation): Promise<DisneyRestaurant[]> {
        const filters: DiningFilters = { parkIds: [location] }
        const result = await this.getRestaurants(filters)
        return result.restaurants
    }

    /**
     * Get character dining restaurants
     */
    async getCharacterDiningRestaurants(): Promise<DisneyRestaurant[]> {
        const filters: DiningFilters = { hasCharacterDining: true }
        const result = await this.getRestaurants(filters)
        return result.restaurants
    }

    /**
     * Get signature dining restaurants
     */
    async getSignatureDiningRestaurants(): Promise<DisneyRestaurant[]> {
        const filters: DiningFilters = { serviceTypes: [ServiceType.SIGNATURE_DINING, ServiceType.FINE_DINING] }
        const result = await this.getRestaurants(filters)
        return result.restaurants
    }

    /**
     * Get popular restaurants
     */
    async getPopularRestaurants(): Promise<DisneyRestaurant[]> {
        try {
            const q = query(
                this.getCollection(),
                where('isPopular', '==', true),
                orderBy('averageRating', 'desc'),
                limit(20)
            )

            const querySnapshot = await getDocs(q)
            const restaurants: DisneyRestaurant[] = []

            querySnapshot.forEach((doc) => {
                const restaurant = this.firestoreToRestaurant(doc)
                if (restaurant) {
                    restaurants.push(restaurant)
                    this.setCacheEntry(restaurant.id, restaurant)
                }
            })

            return restaurants
        } catch (error) {
            console.error('Error getting popular restaurants:', error)
            throw new Error(`Failed to get popular restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Search restaurants by query
     */
    async searchRestaurants(searchQuery: string, limitCount: number = 20): Promise<DisneyRestaurant[]> {
        const filters: DiningFilters = { searchQuery }
        const result = await this.getRestaurants(filters, limitCount)
        return result.restaurants
    }

    /**
     * Subscribe to real-time restaurant updates
     */
    subscribeToRestaurant(id: string, callback: (restaurant: DisneyRestaurant | null) => void): Unsubscribe {
        const docRef = this.getDocument(id)

        return onSnapshot(docRef, (doc) => {
            const restaurant = this.firestoreToRestaurant(doc)
            if (restaurant) {
                this.setCacheEntry(restaurant.id, restaurant)
            }
            callback(restaurant)
        }, (error) => {
            console.error('Error in restaurant subscription:', error)
            callback(null)
        })
    }

    /**
     * Subscribe to real-time restaurants list updates
     */
    subscribeToRestaurants(
        filters?: DiningFilters,
        callback: (restaurants: DisneyRestaurant[]) => void,
        limitCount?: number
    ): Unsubscribe {
        const constraints: QueryConstraint[] = []

        // Apply basic filters
        if (filters?.parkIds?.length) {
            constraints.push(where('location.parkId', 'in', filters.parkIds))
        }
        if (filters?.hasCharacterDining) {
            constraints.push(where('characterDining.hasCharacterDining', '==', true))
        }

        constraints.push(orderBy('averageRating', 'desc'))

        if (limitCount) {
            constraints.push(limit(limitCount))
        }

        const q = query(this.getCollection(), ...constraints)

        return onSnapshot(q, (querySnapshot) => {
            const restaurants: DisneyRestaurant[] = []

            querySnapshot.forEach((doc) => {
                const restaurant = this.firestoreToRestaurant(doc)
                if (restaurant) {
                    restaurants.push(restaurant)
                    this.setCacheEntry(restaurant.id, restaurant)
                }
            })

            // Apply client-side filters
            const filteredRestaurants = filters ? this.applyClientSideFilters(restaurants, filters) : restaurants
            callback(filteredRestaurants)
        }, (error) => {
            console.error('Error in restaurants subscription:', error)
            callback([])
        })
    }

    /**
     * Get restaurant statistics
     */
    async getRestaurantStats(): Promise<{
        total: number
        byLocation: Record<string, number>
        byServiceType: Record<string, number>
        byPriceRange: Record<string, number>
        characterDining: number
        signatureDining: number
        averageRating: number
    }> {
        try {
            const { restaurants } = await this.getRestaurants()

            const stats = {
                total: restaurants.length,
                byLocation: {} as Record<string, number>,
                byServiceType: {} as Record<string, number>,
                byPriceRange: {} as Record<string, number>,
                characterDining: 0,
                signatureDining: 0,
                averageRating: 0
            }

            let totalRating = 0
            let ratedCount = 0

            restaurants.forEach(restaurant => {
                // By location
                const location = restaurant.location.parkId || 'other'
                stats.byLocation[location] = (stats.byLocation[location] || 0) + 1

                // By service type
                stats.byServiceType[restaurant.serviceType] = (stats.byServiceType[restaurant.serviceType] || 0) + 1

                // By price range
                stats.byPriceRange[restaurant.priceRange] = (stats.byPriceRange[restaurant.priceRange] || 0) + 1

                // Character dining
                if (restaurant.characterDining?.hasCharacterDining) {
                    stats.characterDining++
                }

                // Signature dining
                if (restaurant.serviceType === ServiceType.SIGNATURE_DINING || restaurant.diningPlanInfo.isSignatureDining) {
                    stats.signatureDining++
                }

                // Average rating
                if (restaurant.averageRating) {
                    totalRating += restaurant.averageRating
                    ratedCount++
                }
            })

            stats.averageRating = ratedCount > 0 ? totalRating / ratedCount : 0

            return stats
        } catch (error) {
            console.error('Error getting restaurant stats:', error)
            throw new Error(`Failed to get restaurant stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear()
        this.cacheExpiry.clear()
    }

    /**
     * Enable/disable offline mode
     */
    async setOfflineMode(enabled: boolean): Promise<void> {
        try {
            if (enabled) {
                await disableNetwork(database)
            } else {
                await enableNetwork(database)
            }
        } catch (error) {
            console.error('Error setting offline mode:', error)
        }
    }
}

// Create singleton instance
export const restaurantService = RestaurantService.getInstance()