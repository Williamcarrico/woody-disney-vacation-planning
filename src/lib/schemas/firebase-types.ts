import { Timestamp } from 'firebase/firestore';

/**
 * Type helpers for Firebase Firestore operations
 */

// Date types that can be converted to Firebase Timestamp
export type DateLike = Date | Timestamp | string | number;

// Safe timestamp conversion function
export function safeTimestampToFirebase(date: DateLike): Timestamp {
  if (date instanceof Timestamp) {
    return date;
  }
  
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }
  
  if (typeof date === 'number') {
    return Timestamp.fromMillis(date);
  }
  
  throw new Error(`Invalid date type: ${typeof date}`);
}

// Firebase Vacation data interface with proper typing
export interface VacationData {
  name: string;
  description?: string;
  startDate: DateLike;
  endDate: DateLike;
  parks?: string[];
  resorts?: string[];
  partySize?: number;
  budget?: number;
  preferences?: {
    attractions?: string[];
    dining?: string[];
    accommodation?: string;
    transportation?: string;
  };
  isPublic?: boolean;
  shareCode?: string;
  tags?: string[];
}

// Properly typed vacation update interface
export interface VacationUpdateData extends Partial<VacationData> {
  updatedAt?: Timestamp;
}

// Firestore document data with proper timestamp typing
export interface FirestoreVacationData {
  id: string;
  name: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  parks?: string[];
  resorts?: string[];
  partySize?: number;
  budget?: number;
  preferences?: {
    attractions?: string[];
    dining?: string[];
    accommodation?: string;
    transportation?: string;
  };
  isPublic?: boolean;
  shareCode?: string;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Type guard to check if value is a valid date
export function isValidDate(date: unknown): date is DateLike {
  if (date instanceof Date || date instanceof Timestamp) {
    return true;
  }
  
  if (typeof date === 'string' || typeof date === 'number') {
    const testDate = new Date(date);
    return !isNaN(testDate.getTime());
  }
  
  return false;
}

// Helper to convert Firestore data to application format
export function firestoreToVacationData(doc: any): FirestoreVacationData {
  const data = doc.data();
  
  if (!data) {
    throw new Error('Document has no data');
  }
  
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description,
    startDate: data.startDate instanceof Timestamp ? data.startDate : Timestamp.fromDate(new Date(data.startDate)),
    endDate: data.endDate instanceof Timestamp ? data.endDate : Timestamp.fromDate(new Date(data.endDate)),
    parks: data.parks || [],
    resorts: data.resorts || [],
    partySize: data.partySize,
    budget: data.budget,
    preferences: data.preferences,
    isPublic: data.isPublic || false,
    shareCode: data.shareCode,
    tags: data.tags || [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
    createdBy: data.createdBy || '',
  };
}