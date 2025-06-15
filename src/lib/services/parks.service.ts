/**
 * Parks service implementation
 * Provides concrete implementations for park-related operations
 */

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    limit as firestoreLimit,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type {
    DisneyPark,
    ParkId,
    ParkHours,
    AttractionWaitTime,
    ParkAttraction,
    Restaurant,
    AttractionFilters,
    DiningFilters
} from '@/types/parks.model';
import {
    fromFirebasePark,
    fromFirebaseParks,
    fromFirebaseParkHours,
    fromFirebaseWaitTimes,
    type FirebasePark,
    type FirebaseParkHours,
    type FirebaseAttractionWaitTime
} from '@/lib/adapters/firebase-parks.adapter';

// =============================================================================
// COLLECTION REFERENCES
// =============================================================================

const PARKS_COLLECTION = 'parks';
const PARK_HOURS_COLLECTION = 'parkHours';
const WAIT_TIMES_COLLECTION = 'waitTimes';
const ATTRACTIONS_COLLECTION = 'attractions';
const RESTAURANTS_COLLECTION = 'restaurants';

// =============================================================================
// PARK OPERATIONS
// =============================================================================

/**
 * Get operating hours for a specific park and date
 * @param parkId - The park identifier
 * @param date - The date to get hours for (optional, defaults to today)
 * @returns Promise resolving to park hours information
 */
export async function getOperatingHours(
    parkId: ParkId, 
    date?: string
): Promise<ParkHours | null> {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const hoursQuery = query(
            collection(db, PARK_HOURS_COLLECTION),
            where('parkId', '==', parkId),
            where('date', '==', targetDate),
            firestoreLimit(1)
        );
        
        const snapshot = await getDocs(hoursQuery);
        
        if (snapshot.empty) {
            return null;
        }
        
        const hoursDoc = snapshot.docs[0];
        const firebaseHours = hoursDoc.data() as FirebaseParkHours;
        
        return fromFirebaseParkHours(firebaseHours);
    } catch (error) {
        console.error('Error fetching operating hours:', error);
        throw new Error(`Failed to fetch operating hours for park ${parkId}`);
    }
}

/**
 * Get current wait times for all attractions in a park
 * @param parkId - The park identifier
 * @returns Promise resolving to array of wait time information
 */
export async function getWaitTimes(parkId: ParkId): Promise<AttractionWaitTime[]> {
    try {
        const waitTimesQuery = query(
            collection(db, WAIT_TIMES_COLLECTION),
            where('parkId', '==', parkId),
            orderBy('lastUpdated', 'desc')
        );
        
        const snapshot = await getDocs(waitTimesQuery);
        
        if (snapshot.empty) {
            return [];
        }
        
        const firebaseWaitTimes = snapshot.docs.map(doc => doc.data() as FirebaseAttractionWaitTime);
        
        return fromFirebaseWaitTimes(firebaseWaitTimes);
    } catch (error) {
        console.error('Error fetching wait times:', error);
        throw new Error(`Failed to fetch wait times for park ${parkId}`);
    }
}

/**
 * Get park information by ID
 * @param parkId - The park identifier
 * @returns Promise resolving to park information
 */
export async function getParkById(parkId: ParkId): Promise<DisneyPark | null> {
    try {
        const parkDoc = await getDoc(doc(db, PARKS_COLLECTION, parkId));
        
        if (!parkDoc.exists()) {
            return null;
        }
        
        const firebasePark = parkDoc.data() as FirebasePark;
        
        return fromFirebasePark(firebasePark);
    } catch (error) {
        console.error('Error fetching park:', error);
        throw new Error(`Failed to fetch park ${parkId}`);
    }
}

/**
 * Get all parks
 * @returns Promise resolving to array of all parks
 */
export async function getAllParks(): Promise<DisneyPark[]> {
    try {
        const parksQuery = query(
            collection(db, PARKS_COLLECTION),
            orderBy('name')
        );
        
        const snapshot = await getDocs(parksQuery);
        
        if (snapshot.empty) {
            return [];
        }
        
        const firebaseParks = snapshot.docs.map(doc => doc.data() as FirebasePark);
        
        return fromFirebaseParks(firebaseParks);
    } catch (error) {
        console.error('Error fetching all parks:', error);
        throw new Error('Failed to fetch parks');
    }
}

// =============================================================================
// ATTRACTION OPERATIONS
// =============================================================================

/**
 * Search attractions across all parks or within a specific park
 * @param filters - Filters to apply to the search
 * @returns Promise resolving to array of matching attractions
 */
export async function searchAttractions(filters: AttractionFilters): Promise<ParkAttraction[]> {
    try {
        let attractionsQuery = collection(db, ATTRACTIONS_COLLECTION);
        
        const constraints: any[] = [];
        
        if (filters.parkId) {
            constraints.push(where('parkId', '==', filters.parkId));
        }
        
        if (filters.landId) {
            constraints.push(where('landId', '==', filters.landId));
        }
        
        if (filters.type) {
            constraints.push(where('type', '==', filters.type));
        }
        
        if (filters.thrillLevel) {
            constraints.push(where('thrillLevel', '==', filters.thrillLevel));
        }
        
        if (filters.heightRequirement !== undefined) {
            if (filters.heightRequirement) {
                constraints.push(where('heightRequirement.inches', '>', 0));
            } else {
                constraints.push(where('heightRequirement.inches', '==', null));
            }
        }
        
        if (filters.lightningLane !== undefined) {
            constraints.push(where('lightningLane.available', '==', filters.lightningLane));
        }
        
        if (filters.mustDo !== undefined) {
            constraints.push(where('mustDo', '==', filters.mustDo));
        }
        
        if (filters.ageGroup) {
            constraints.push(where('ageAppeal', 'array-contains', filters.ageGroup));
        }
        
        // Add ordering
        constraints.push(orderBy('name'));
        
        const finalQuery = query(attractionsQuery, ...constraints);
        const snapshot = await getDocs(finalQuery);
        
        if (snapshot.empty) {
            return [];
        }
        
        return snapshot.docs.map(doc => doc.data() as ParkAttraction);
    } catch (error) {
        console.error('Error searching attractions:', error);
        throw new Error('Failed to search attractions');
    }
}

/**
 * Get attraction by ID
 * @param attractionId - The attraction identifier
 * @returns Promise resolving to attraction information
 */
export async function getAttractionById(attractionId: string): Promise<ParkAttraction | null> {
    try {
        const attractionDoc = await getDoc(doc(db, ATTRACTIONS_COLLECTION, attractionId));
        
        if (!attractionDoc.exists()) {
            return null;
        }
        
        return attractionDoc.data() as ParkAttraction;
    } catch (error) {
        console.error('Error fetching attraction:', error);
        throw new Error(`Failed to fetch attraction ${attractionId}`);
    }
}

/**
 * Get attractions by park ID
 * @param parkId - The park identifier
 * @returns Promise resolving to array of attractions in the park
 */
export async function getAttractionsByPark(parkId: ParkId): Promise<ParkAttraction[]> {
    return searchAttractions({ parkId });
}

/**
 * Get must-do attractions for a park
 * @param parkId - The park identifier
 * @returns Promise resolving to array of must-do attractions
 */
export async function getMustDoAttractions(parkId: ParkId): Promise<ParkAttraction[]> {
    return searchAttractions({ parkId, mustDo: true });
}

// =============================================================================
// DINING OPERATIONS
// =============================================================================

/**
 * Search dining locations across all parks or within a specific park
 * @param filters - Filters to apply to the search
 * @returns Promise resolving to array of matching dining locations
 */
export async function searchDining(filters: DiningFilters): Promise<Restaurant[]> {
    try {
        let diningQuery = collection(db, RESTAURANTS_COLLECTION);
        
        const constraints: any[] = [];
        
        if (filters.parkId) {
            constraints.push(where('parkId', '==', filters.parkId));
        }
        
        if (filters.landId) {
            constraints.push(where('landId', '==', filters.landId));
        }
        
        if (filters.type) {
            constraints.push(where('type', '==', filters.type));
        }
        
        if (filters.cuisine) {
            constraints.push(where('cuisine', 'array-contains', filters.cuisine));
        }
        
        if (filters.priceRange) {
            constraints.push(where('priceRange', '==', filters.priceRange));
        }
        
        if (filters.characterDining !== undefined) {
            constraints.push(where('characterDining', '==', filters.characterDining));
        }
        
        if (filters.mobileOrder !== undefined) {
            constraints.push(where('mobileOrder', '==', filters.mobileOrder));
        }
        
        if (filters.mealPeriod) {
            constraints.push(where('mealPeriods', 'array-contains', filters.mealPeriod));
        }
        
        // Add ordering
        constraints.push(orderBy('name'));
        
        const finalQuery = query(diningQuery, ...constraints);
        const snapshot = await getDocs(finalQuery);
        
        if (snapshot.empty) {
            return [];
        }
        
        return snapshot.docs.map(doc => doc.data() as Restaurant);
    } catch (error) {
        console.error('Error searching dining:', error);
        throw new Error('Failed to search dining locations');
    }
}

/**
 * Get restaurant by ID
 * @param restaurantId - The restaurant identifier
 * @returns Promise resolving to restaurant information
 */
export async function getRestaurantById(restaurantId: string): Promise<Restaurant | null> {
    try {
        const restaurantDoc = await getDoc(doc(db, RESTAURANTS_COLLECTION, restaurantId));
        
        if (!restaurantDoc.exists()) {
            return null;
        }
        
        return restaurantDoc.data() as Restaurant;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        throw new Error(`Failed to fetch restaurant ${restaurantId}`);
    }
}

/**
 * Get dining locations by park ID
 * @param parkId - The park identifier
 * @returns Promise resolving to array of dining locations in the park
 */
export async function getDiningByPark(parkId: ParkId): Promise<Restaurant[]> {
    return searchDining({ parkId });
}

/**
 * Get character dining locations
 * @param parkId - Optional park identifier to filter by
 * @returns Promise resolving to array of character dining locations
 */
export async function getCharacterDining(parkId?: ParkId): Promise<Restaurant[]> {
    const filters: DiningFilters = { characterDining: true };
    if (parkId) {
        filters.parkId = parkId;
    }
    return searchDining(filters);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get park hours for the next 7 days
 * @param parkId - The park identifier
 * @returns Promise resolving to array of park hours for the next week
 */
export async function getWeeklyHours(parkId: ParkId): Promise<ParkHours[]> {
    try {
        const today = new Date();
        const weekAhead = new Date(today);
        weekAhead.setDate(today.getDate() + 7);
        
        const hoursQuery = query(
            collection(db, PARK_HOURS_COLLECTION),
            where('parkId', '==', parkId),
            where('date', '>=', today.toISOString().split('T')[0]),
            where('date', '<=', weekAhead.toISOString().split('T')[0]),
            orderBy('date')
        );
        
        const snapshot = await getDocs(hoursQuery);
        
        if (snapshot.empty) {
            return [];
        }
        
        const firebaseHours = snapshot.docs.map(doc => doc.data() as FirebaseParkHours);
        
        return firebaseHours.map(fromFirebaseParkHours);
    } catch (error) {
        console.error('Error fetching weekly hours:', error);
        throw new Error(`Failed to fetch weekly hours for park ${parkId}`);
    }
}

/**
 * Check if a park is currently open
 * @param parkId - The park identifier
 * @returns Promise resolving to boolean indicating if park is open
 */
export async function isParkOpen(parkId: ParkId): Promise<boolean> {
    try {
        const hours = await getOperatingHours(parkId);
        
        if (!hours) {
            return false;
        }
        
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        return currentTime >= hours.openingTime && currentTime <= hours.closingTime;
    } catch (error) {
        console.error('Error checking if park is open:', error);
        return false;
    }
} 