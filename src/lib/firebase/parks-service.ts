/**
 * Firebase Parks Service
 *
 * Handles all park-related operations in Firestore
 * Provides static Disney park data for API calls
 */

import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    Timestamp,
    writeBatch,
    onSnapshot,
    type Unsubscribe
} from 'firebase/firestore'
import { firestore } from './firebase.config'
import { COLLECTIONS, type FirebasePark, timestampToFirebase } from './collections'
import type { DisneyPark, ParkFilters, AttractionFilters, DiningFilters } from '@/types/parks.model'

export class ParksService {
    private static instance: ParksService

    public static getInstance(): ParksService {
        if (!ParksService.instance) {
            ParksService.instance = new ParksService()
        }
        return ParksService.instance
    }

    /**
     * Create a new park document
     */
    async createPark(parkData: Omit<DisneyPark, 'createdAt' | 'updatedAt'>): Promise<void> {
        try {
            const parkRef = doc(firestore, COLLECTIONS.PARKS, parkData.id)
            const now = Timestamp.now()

            const parkDoc: FirebasePark = {
                ...parkData,
                createdAt: now,
                updatedAt: now
            }

            await setDoc(parkRef, parkDoc)
        } catch (error) {
            console.error('Error creating park:', error)
            throw new Error('Failed to create park')
        }
    }

    /**
     * Get park by ID
     */
    async getParkById(parkId: string): Promise<DisneyPark | null> {
        try {
            const parkRef = doc(firestore, COLLECTIONS.PARKS, parkId)
            const parkSnap = await getDoc(parkRef)

            if (parkSnap.exists()) {
                const data = parkSnap.data() as FirebasePark
                return {
                    ...data,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                }
            }
            return null
        } catch (error) {
            console.error('Error getting park:', error)
            throw new Error('Failed to get park')
        }
    }

    /**
     * Get all parks
     */
    async getAllParks(): Promise<DisneyPark[]> {
        try {
            const parksRef = collection(firestore, COLLECTIONS.PARKS)
            const q = query(parksRef, orderBy('name'))
            const querySnapshot = await getDocs(q)

            return querySnapshot.docs.map(doc => {
                const data = doc.data() as FirebasePark
                return {
                    ...data,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                }
            })
        } catch (error) {
            console.error('Error getting all parks:', error)
            throw new Error('Failed to get all parks')
        }
    }

    /**
     * Update park data
     */
    async updatePark(parkId: string, updates: Partial<Omit<DisneyPark, 'id' | 'createdAt'>>): Promise<void> {
        try {
            const parkRef = doc(firestore, COLLECTIONS.PARKS, parkId)

            const updateData = {
                ...updates,
                updatedAt: Timestamp.now()
            }

            await updateDoc(parkRef, updateData)
        } catch (error) {
            console.error('Error updating park:', error)
            throw new Error('Failed to update park')
        }
    }

    /**
     * Delete park
     */
    async deletePark(parkId: string): Promise<void> {
        try {
            const parkRef = doc(firestore, COLLECTIONS.PARKS, parkId)
            await deleteDoc(parkRef)
        } catch (error) {
            console.error('Error deleting park:', error)
            throw new Error('Failed to delete park')
        }
    }

    /**
     * Search parks with filters
     */
    async searchParks(filters: ParkFilters): Promise<DisneyPark[]> {
        try {
            const parksRef = collection(firestore, COLLECTIONS.PARKS)
            let q = query(parksRef)

            // Apply basic ordering
            q = query(q, orderBy('name'))

            const querySnapshot = await getDocs(q)
            let parks = querySnapshot.docs.map(doc => {
                const data = doc.data() as FirebasePark
                return {
                    ...data,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                }
            })

            // Apply client-side filters (Firestore limitations)
            if (filters.searchTerm) {
                const searchTerm = filters.searchTerm.toLowerCase()
                parks = parks.filter(park =>
                    park.name.toLowerCase().includes(searchTerm) ||
                    park.description.toLowerCase().includes(searchTerm) ||
                    park.theme.toLowerCase().includes(searchTerm)
                )
            }

            if (filters.hasAttraction) {
                parks = parks.filter(park =>
                    park.attractions.some(attraction => attraction.id === filters.hasAttraction)
                )
            }

            if (filters.hasLand) {
                parks = parks.filter(park =>
                    park.lands.some(land => land.id === filters.hasLand)
                )
            }

            return parks
        } catch (error) {
            console.error('Error searching parks:', error)
            throw new Error('Failed to search parks')
        }
    }

    /**
     * Get attractions across all parks with filters
     */
    async searchAttractions(filters: AttractionFilters): Promise<Array<DisneyPark['attractions'][0] & { parkId: string; parkName: string }>> {
        try {
            const parks = await this.getAllParks()
            let attractions: Array<DisneyPark['attractions'][0] & { parkId: string; parkName: string }> = []

            parks.forEach(park => {
                park.attractions.forEach(attraction => {
                    attractions.push({
                        ...attraction,
                        parkId: park.id,
                        parkName: park.name
                    })
                })
            })

            // Apply filters
            if (filters.parkId) {
                attractions = attractions.filter(attraction => attraction.parkId === filters.parkId)
            }

            if (filters.landId) {
                attractions = attractions.filter(attraction => attraction.landId === filters.landId)
            }

            if (filters.type) {
                attractions = attractions.filter(attraction => attraction.type === filters.type)
            }

            if (filters.thrillLevel !== undefined) {
                attractions = attractions.filter(attraction => attraction.thrillLevel >= filters.thrillLevel!)
            }

            if (filters.heightRequirement) {
                attractions = attractions.filter(attraction =>
                    attraction.heightRequirement.inches !== null || attraction.heightRequirement.centimeters !== null
                )
            }

            if (filters.lightningLane) {
                attractions = attractions.filter(attraction => attraction.lightningLane.available)
            }

            if (filters.mustDo) {
                attractions = attractions.filter(attraction => attraction.mustDo)
            }

            if (filters.ageGroup) {
                attractions = attractions.filter(attraction =>
                    attraction.ageAppeal.includes(filters.ageGroup!)
                )
            }

            return attractions
        } catch (error) {
            console.error('Error searching attractions:', error)
            throw new Error('Failed to search attractions')
        }
    }

    /**
     * Get dining options across all parks with filters
     */
    async searchDining(filters: DiningFilters): Promise<Array<
        (DisneyPark['dining']['tableService'][0] | DisneyPark['dining']['quickService'][0] | DisneyPark['dining']['snacks'][0])
        & { parkId: string; parkName: string; type: 'tableService' | 'quickService' | 'snacks' }
    >> {
        try {
            const parks = await this.getAllParks()
            let dining: Array<any> = []

            parks.forEach(park => {
                // Table service restaurants
                park.dining.tableService.forEach(restaurant => {
                    dining.push({
                        ...restaurant,
                        parkId: park.id,
                        parkName: park.name,
                        type: 'tableService' as const
                    })
                })

                // Quick service restaurants
                park.dining.quickService.forEach(restaurant => {
                    dining.push({
                        ...restaurant,
                        parkId: park.id,
                        parkName: park.name,
                        type: 'quickService' as const
                    })
                })

                // Snack locations
                park.dining.snacks.forEach(snack => {
                    dining.push({
                        ...snack,
                        parkId: park.id,
                        parkName: park.name,
                        type: 'snacks' as const
                    })
                })
            })

            // Apply filters
            if (filters.parkId) {
                dining = dining.filter(item => item.parkId === filters.parkId)
            }

            if (filters.landId) {
                dining = dining.filter(item => item.landId === filters.landId)
            }

            if (filters.type) {
                dining = dining.filter(item => item.type === filters.type)
            }

            if (filters.cuisine) {
                dining = dining.filter(item =>
                    item.cuisine && item.cuisine.some((c: string) =>
                        c.toLowerCase().includes(filters.cuisine!.toLowerCase())
                    )
                )
            }

            if (filters.priceRange) {
                dining = dining.filter(item => item.priceRange === filters.priceRange)
            }

            if (filters.characterDining !== undefined) {
                dining = dining.filter(item => item.characterDining === filters.characterDining)
            }

            if (filters.mobileOrder !== undefined) {
                dining = dining.filter(item => item.mobileOrder === filters.mobileOrder)
            }

            if (filters.mealPeriod) {
                dining = dining.filter(item =>
                    item.mealPeriods && item.mealPeriods.includes(filters.mealPeriod!)
                )
            }

            return dining
        } catch (error) {
            console.error('Error searching dining:', error)
            throw new Error('Failed to search dining')
        }
    }

    /**
     * Get park operating hours
     */
    async getParkHours(parkId: string): Promise<DisneyPark['operatingHours'] | null> {
        try {
            const park = await this.getParkById(parkId)
            return park ? park.operatingHours : null
        } catch (error) {
            console.error('Error getting park hours:', error)
            throw new Error('Failed to get park hours')
        }
    }

    /**
     * Listen to park changes in real-time
     */
    listenToPark(parkId: string, callback: (park: DisneyPark | null) => void): Unsubscribe {
        const parkRef = doc(firestore, COLLECTIONS.PARKS, parkId)

        return onSnapshot(parkRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as FirebasePark
                callback({
                    ...data,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                })
            } else {
                callback(null)
            }
        }, (error) => {
            console.error('Error listening to park changes:', error)
            callback(null)
        })
    }

    /**
     * Listen to all parks changes in real-time
     */
    listenToAllParks(callback: (parks: DisneyPark[]) => void): Unsubscribe {
        const parksRef = collection(firestore, COLLECTIONS.PARKS)
        const q = query(parksRef, orderBy('name'))

        return onSnapshot(q, (snapshot) => {
            const parks = snapshot.docs.map(doc => {
                const data = doc.data() as FirebasePark
                return {
                    ...data,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                }
            })
            callback(parks)
        }, (error) => {
            console.error('Error listening to parks changes:', error)
            callback([])
        })
    }

    /**
     * Batch create multiple parks
     */
    async batchCreateParks(parks: Array<Omit<DisneyPark, 'createdAt' | 'updatedAt'>>): Promise<void> {
        try {
            const batch = writeBatch(firestore)
            const now = Timestamp.now()

            parks.forEach(parkData => {
                const parkRef = doc(firestore, COLLECTIONS.PARKS, parkData.id)
                const parkDoc: FirebasePark = {
                    ...parkData,
                    createdAt: now,
                    updatedAt: now
                }
                batch.set(parkRef, parkDoc)
            })

            await batch.commit()
        } catch (error) {
            console.error('Error batch creating parks:', error)
            throw new Error('Failed to batch create parks')
        }
    }

    /**
     * Check if park exists
     */
    async parkExists(parkId: string): Promise<boolean> {
        try {
            const parkRef = doc(firestore, COLLECTIONS.PARKS, parkId)
            const parkSnap = await getDoc(parkRef)
            return parkSnap.exists()
        } catch (error) {
            console.error('Error checking if park exists:', error)
            return false
        }
    }

    /**
     * Get park statistics
     */
    async getParkStats(parkId: string): Promise<{
        totalAttractions: number
        totalDining: number
        totalLands: number
        mustDoAttractions: number
        lightningLaneAttractions: number
    } | null> {
        try {
            const park = await this.getParkById(parkId)
            if (!park) return null

            const totalDining = park.dining.tableService.length +
                park.dining.quickService.length +
                park.dining.snacks.length

            const mustDoAttractions = park.attractions.filter(attraction => attraction.mustDo).length
            const lightningLaneAttractions = park.attractions.filter(attraction => attraction.lightningLane.available).length

            return {
                totalAttractions: park.attractions.length,
                totalDining,
                totalLands: park.lands.length,
                mustDoAttractions,
                lightningLaneAttractions
            }
        } catch (error) {
            console.error('Error getting park stats:', error)
            throw new Error('Failed to get park stats')
        }
    }
}

// Export singleton instance
export const parksService = ParksService.getInstance()

// Export types for convenience
export type { DisneyPark, FirebasePark, ParkFilters, AttractionFilters, DiningFilters }