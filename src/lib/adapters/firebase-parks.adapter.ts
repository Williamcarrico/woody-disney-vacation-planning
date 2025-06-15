/**
 * Firebase adapter layer for parks
 * Converts between clean domain models and Firebase-specific types
 */

import { Timestamp } from 'firebase/firestore';
import type { 
    DisneyPark, 
    ParkHours, 
    AttractionWaitTime,
    CreateParkInput,
    ParkId
} from '../types/parks.model';

// =============================================================================
// FIREBASE-SPECIFIC TYPES
// =============================================================================

/** Firebase version of DisneyPark with Timestamp objects */
export interface FirebasePark extends Omit<DisneyPark, 'timestamps'> {
    /** Firebase Timestamp for creation */
    createdAt: Timestamp;
    /** Firebase Timestamp for last update */
    updatedAt: Timestamp;
}

/** Firebase version of ParkHours with Timestamp objects */
export interface FirebaseParkHours extends Omit<ParkHours, 'lastUpdated'> {
    /** Firebase Timestamp for last update */
    lastUpdated: Timestamp;
}

/** Firebase version of AttractionWaitTime with Timestamp objects */
export interface FirebaseAttractionWaitTime extends Omit<AttractionWaitTime, 'lastUpdated'> {
    /** Firebase Timestamp for last update */
    lastUpdated: Timestamp;
}

// =============================================================================
// ADAPTER FUNCTIONS
// =============================================================================

/**
 * Convert Firebase park document to domain model
 * @param firebasePark - Park document from Firebase
 * @returns Clean domain model park
 */
export function fromFirebasePark(firebasePark: FirebasePark): DisneyPark {
    const { createdAt, updatedAt, ...parkData } = firebasePark;
    
    return {
        ...parkData,
        timestamps: {
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString()
        }
    };
}

/**
 * Convert domain model park to Firebase document
 * @param park - Clean domain model park
 * @returns Firebase document ready for storage
 */
export function toFirebasePark(park: DisneyPark): FirebasePark {
    const { timestamps, ...parkData } = park;
    
    const now = Timestamp.now();
    
    return {
        ...parkData,
        createdAt: timestamps?.createdAt ? Timestamp.fromDate(new Date(timestamps.createdAt)) : now,
        updatedAt: now
    };
}

/**
 * Convert create input to Firebase document
 * @param input - Park creation input
 * @returns Firebase document ready for storage
 */
export function createInputToFirebase(input: CreateParkInput): FirebasePark {
    const now = Timestamp.now();
    
    return {
        ...input,
        createdAt: now,
        updatedAt: now
    };
}

/**
 * Convert Firebase park hours to domain model
 * @param firebaseHours - Park hours document from Firebase
 * @returns Clean domain model park hours
 */
export function fromFirebaseParkHours(firebaseHours: FirebaseParkHours): ParkHours {
    const { lastUpdated, ...hoursData } = firebaseHours;
    
    return {
        ...hoursData,
        lastUpdated: lastUpdated.toISOString()
    };
}

/**
 * Convert domain model park hours to Firebase document
 * @param hours - Clean domain model park hours
 * @returns Firebase document ready for storage
 */
export function toFirebaseParkHours(hours: ParkHours): FirebaseParkHours {
    const { lastUpdated, ...hoursData } = hours;
    
    return {
        ...hoursData,
        lastUpdated: lastUpdated ? Timestamp.fromDate(new Date(lastUpdated)) : Timestamp.now()
    };
}

/**
 * Convert Firebase wait time to domain model
 * @param firebaseWaitTime - Wait time document from Firebase
 * @returns Clean domain model wait time
 */
export function fromFirebaseWaitTime(firebaseWaitTime: FirebaseAttractionWaitTime): AttractionWaitTime {
    const { lastUpdated, ...waitTimeData } = firebaseWaitTime;
    
    return {
        ...waitTimeData,
        lastUpdated: lastUpdated.toISOString()
    };
}

/**
 * Convert domain model wait time to Firebase document
 * @param waitTime - Clean domain model wait time
 * @returns Firebase document ready for storage
 */
export function toFirebaseWaitTime(waitTime: AttractionWaitTime): FirebaseAttractionWaitTime {
    const { lastUpdated, ...waitTimeData } = waitTime;
    
    return {
        ...waitTimeData,
        lastUpdated: lastUpdated ? Timestamp.fromDate(new Date(lastUpdated)) : Timestamp.now()
    };
}

/**
 * Convert array of Firebase parks to domain models
 * @param firebaseParks - Array of Firebase park documents
 * @returns Array of clean domain model parks
 */
export function fromFirebaseParks(firebaseParks: FirebasePark[]): DisneyPark[] {
    return firebaseParks.map(fromFirebasePark);
}

/**
 * Convert array of Firebase park hours to domain models
 * @param firebaseHours - Array of Firebase park hours documents
 * @returns Array of clean domain model park hours
 */
export function fromFirebaseParkHoursArray(firebaseHours: FirebaseParkHours[]): ParkHours[] {
    return firebaseHours.map(fromFirebaseParkHours);
}

/**
 * Convert array of Firebase wait times to domain models
 * @param firebaseWaitTimes - Array of Firebase wait time documents
 * @returns Array of clean domain model wait times
 */
export function fromFirebaseWaitTimes(firebaseWaitTimes: FirebaseAttractionWaitTime[]): AttractionWaitTime[] {
    return firebaseWaitTimes.map(fromFirebaseWaitTime);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a new Firebase timestamp
 * @returns New Firebase Timestamp
 */
export function createFirebaseTimestamp(): Timestamp {
    return Timestamp.now();
}

/**
 * Convert ISO string to Firebase Timestamp
 * @param isoString - ISO date string
 * @returns Firebase Timestamp
 */
export function isoToFirebaseTimestamp(isoString: string): Timestamp {
    return Timestamp.fromDate(new Date(isoString));
}

/**
 * Convert Firebase Timestamp to ISO string
 * @param timestamp - Firebase Timestamp
 * @returns ISO date string
 */
export function firebaseTimestampToIso(timestamp: Timestamp): string {
    return timestamp.toDate().toISOString();
}

/**
 * Get today's date as a Firebase Timestamp
 * @returns Firebase Timestamp for start of today
 */
export function getTodayTimestamp(): Timestamp {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(today);
}

/**
 * Get Firebase Timestamp for a specific date
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Firebase Timestamp for the date
 */
export function dateStringToTimestamp(dateString: string): Timestamp {
    const date = new Date(dateString);
    return Timestamp.fromDate(date);
} 