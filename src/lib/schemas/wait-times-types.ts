import { Timestamp } from 'firebase/firestore';

/**
 * Type definitions for wait times system
 */

// Raw Firestore wait time record
export interface FirestoreWaitTimeRecord {
  timestamp: Timestamp;
  waitMinutes: number;
  attractionId: string;
  parkId?: string;
  dateString?: string;
  hourOfDay?: number;
  dayOfWeek?: number;
  isHoliday?: boolean;
  weatherCondition?: string;
  temperature?: number;
  crowdLevel?: number;
}

// Parsed wait time record for application use
export interface WaitTimeRecord {
  timestamp: Date;
  waitMinutes: number;
  attractionId?: string;
  parkId?: string;
  dateString?: string;
  hourOfDay?: number;
  dayOfWeek?: number;
  isHoliday?: boolean;
  weatherCondition?: string;
  temperature?: number;
  crowdLevel?: number;
}

// Historical wait time data structure
export interface HistoricalWaitTimeData {
  attractionId: string;
  dates: Array<{
    date: string;
    hourlyData: Array<{
      hour: number;
      averageWait: number;
      minWait: number;
      maxWait: number;
      sampleCount: number;
    }>;
  }>;
}

// Wait time prediction parameters
export interface WaitTimePredictionParams {
  attractionId: string;
  targetDate: Date;
  hourOfDay?: number;
  weatherCondition?: string;
  temperature?: number;
  crowdLevel?: number;
  isHoliday?: boolean;
}

// Wait time prediction result
export interface WaitTimePrediction {
  attractionId: string;
  predictedWait: number;
  confidence: number;
  factors: {
    historical: number;
    weather: number;
    crowdLevel: number;
    seasonality: number;
    dayOfWeek: number;
  };
  createdAt: Date;
}

// Live wait time data from external APIs
export interface LiveWaitTimeData {
  id: string;
  name: string;
  waitTime: number | null;
  status: 'Operating' | 'Down' | 'Closed' | 'Refurbishment';
  lastUpdated: Date;
  fastPass?: {
    available: boolean;
    returnTime?: string;
  };
}

// Analytics data for wait times
export interface WaitTimeAnalytics {
  attractionId: string;
  parkId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    averageWait: number;
    minWait: number;
    maxWait: number;
    totalDataPoints: number;
    peakHours: Array<{
      hour: number;
      averageWait: number;
    }>;
    busyDays: Array<{
      dayOfWeek: number;
      averageWait: number;
    }>;
  };
}

// Type guard functions
export function isValidWaitTimeRecord(record: unknown): record is FirestoreWaitTimeRecord {
  if (!record || typeof record !== 'object') return false;
  
  const r = record as Record<string, unknown>;
  return (
    r.timestamp instanceof Timestamp &&
    typeof r.waitMinutes === 'number' &&
    typeof r.attractionId === 'string' &&
    r.waitMinutes >= 0 &&
    r.waitMinutes <= 600 // reasonable max wait time
  );
}

// Conversion helpers
export function firestoreToWaitTimeRecord(record: FirestoreWaitTimeRecord): WaitTimeRecord {
  return {
    timestamp: record.timestamp.toDate(),
    waitMinutes: record.waitMinutes,
    attractionId: record.attractionId,
    parkId: record.parkId,
    dateString: record.dateString,
    hourOfDay: record.hourOfDay,
    dayOfWeek: record.dayOfWeek,
    isHoliday: record.isHoliday,
    weatherCondition: record.weatherCondition,
    temperature: record.temperature,
    crowdLevel: record.crowdLevel,
  };
}

export function waitTimeRecordToFirestore(record: WaitTimeRecord): Omit<FirestoreWaitTimeRecord, 'timestamp'> & { timestamp: Timestamp } {
  return {
    timestamp: Timestamp.fromDate(record.timestamp),
    waitMinutes: record.waitMinutes,
    attractionId: record.attractionId || '',
    parkId: record.parkId,
    dateString: record.dateString,
    hourOfDay: record.hourOfDay,
    dayOfWeek: record.dayOfWeek,
    isHoliday: record.isHoliday,
    weatherCondition: record.weatherCondition,
    temperature: record.temperature,
    crowdLevel: record.crowdLevel,
  };
}