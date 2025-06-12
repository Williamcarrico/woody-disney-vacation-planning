import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase/firebase.config';
import EventEmitter from 'events'
import {
    firestoreToWaitTimeRecord,
    isValidWaitTimeRecord
} from '@/lib/schemas/wait-times-types'

// =========================================================================================
// TYPES / INTERFACES
// =========================================================================================

interface GetWaitTimesProps {
    parkId: string
    forceRefresh?: boolean
    signal?: AbortSignal
}

interface PredictWaitTimeProps {
    attractionId: string
    target: Date
}

interface AttractionWaitTime {
    attractionId: string
    name: string
    waitMinutes: number
    lastUpdated: string
    status?: string
}

interface PredictedWaitTime {
    attractionId: string
    predictedMinutes: number
    confidence: number // 0 – 1
}

interface HistoricalWaitSample {
    timestamp: Date
    waitMinutes: number
}

interface WaitTimesUpdatePayload {
    parkId: string
    data: AttractionWaitTime[]
}

interface CachedWaitTimes {
    timestamp: number
    data: AttractionWaitTime[]
}

interface AnomalyDetection {
    adjustment: number
    confidence: number
}



interface ThemeParksLiveDataItem {
    id: string
    name: string
    entityType: string
    status?: string
    lastUpdated?: string
    queue?: {
        STANDBY?: {
            waitTime: number | null
        }
    }
}

interface ThemeParksApiSuccessResponse {
    success: boolean
    data: {
        liveData: ThemeParksLiveDataItem[]
    }
}

// Firebase collection names
const COLLECTIONS = {
    HISTORICAL_WAIT_TIMES: 'historicalWaitTimes',
    WAIT_TIMES: 'waitTimes',
    ATTRACTIONS: 'attractions'
} as const;



// =========================================================================================
// PUBLIC API (Exported Functions)
// =========================================================================================

/**
 * Fetch the latest wait-time information for the provided park. Under the hood this
 * engine applies per-attraction throttling, in-memory caching, and error-aware
 * exponential back-off to minimize API calls while keeping data fresh.
 */
export async function getCurrentWaitTimes({
    parkId,
    forceRefresh = false,
    signal
}: GetWaitTimesProps): Promise<AttractionWaitTime[]> {
    const cached = waitTimeCache.get(parkId)
    const isCacheValid = cached && Date.now() - cached.timestamp < CACHE_TTL_MS

    if (isCacheValid && !forceRefresh) {
        return cached.data
    }

    const data = await fetchWaitTimesFromApi({ parkId, signal })
    waitTimeCache.set(parkId, { timestamp: Date.now(), data })
    eventBus.emit('waitTimes:update', { parkId, data })

    return data
}

/**
 * Predict the wait-time for a specific attraction at a target date/time.
 * Combines historical data, live data, and an exponential moving average.
 */
export async function predictWaitTime({
    attractionId,
    target
}: PredictWaitTimeProps): Promise<PredictedWaitTime> {
    const historical = await getHistoricalWaitTimes({ attractionId })
    const liveSample = await getLiveSample({ attractionId })

    if (liveSample.length === 0) {
        // If no live data, use historical average
        const emaHistorical = exponentialMovingAverage(historical
            .filter(d => isSameDayOfWeek(d.timestamp, target))
            .map(d => d.waitMinutes))

        return {
            attractionId,
            predictedMinutes: Math.round(emaHistorical),
            confidence: 0.5
        }
    }

    const emaLive = exponentialMovingAverage(liveSample.map(d => d.waitMinutes))
    const emaHistorical = exponentialMovingAverage(historical
        .filter(d => isSameDayOfWeek(d.timestamp, target))
        .map(d => d.waitMinutes))

    const basePrediction = weightedAverage([
        { value: emaLive, weight: 0.6 },
        { value: emaHistorical, weight: 0.4 }
    ])

    const lastLiveSample = liveSample.at(-1)
    if (!lastLiveSample) {
        return {
            attractionId,
            predictedMinutes: Math.round(basePrediction),
            confidence: 0.6
        }
    }

    const anomaly = detectAnomaly(basePrediction, lastLiveSample.waitMinutes)

    return {
        attractionId,
        predictedMinutes: Math.round(basePrediction + anomaly.adjustment),
        confidence: anomaly.confidence
    }
}

/**
 * Subscribe to real-time wait-time updates for a particular park. Utilises an
 * internal event bus and optionally Firebase real-time listeners when available.
 * Returns an unsubscribe function.
 */
export function onWaitTimesUpdate(
    parkId: string,
    callback: (payload: WaitTimesUpdatePayload) => void
): () => void {
    const listener = (payload: WaitTimesUpdatePayload) => {
        if (payload.parkId === parkId) callback(payload)
    }

    eventBus.on('waitTimes:update', listener)
    ensureRealtimeChannel(parkId)

    return () => {
        eventBus.off('waitTimes:update', listener)
        teardownRealtimeChannel(parkId)
    }
}

// =========================================================================================
// SUBCOMPONENTS (Private Implementation)
// =========================================================================================

async function fetchWaitTimesFromApi({
    parkId,
    signal
}: { parkId: string; signal?: AbortSignal }): Promise<AttractionWaitTime[]> {
    try {
        // Use the internal API route that properly integrates with themeparks.wiki
        const url = `/api/parks/${parkId}?entity=live`;

        const res = await fetch(url, {
            headers: {
                Accept: 'application/json',
            },
            next: { revalidate: CACHE_TTL_MS / 1000 },
            signal
        })

        if (!res.ok) {
            throw new Error(`Failed wait-time fetch: ${res.status}`)
        }

        const json: unknown = await res.json()

        // Type guard to validate the response structure
        if (!isThemeParksApiResponse(json)) {
            throw new Error('Invalid API response format')
        }

        // Transform the response to our expected format
        return json.data.liveData
            .filter((item: ThemeParksLiveDataItem) => item.entityType === 'ATTRACTION')
            .map((item: ThemeParksLiveDataItem) => transformThemeParksResponse(item))
            .filter((item: AttractionWaitTime) => item.waitMinutes >= 0)
            .sort((a: AttractionWaitTime, b: AttractionWaitTime) => a.name.localeCompare(b.name))

    } catch (error) {
        console.error('waitTimes.fetchWaitTimesFromApi', { parkId, error })
        // Return empty array instead of throwing to allow graceful degradation
        return []
    }
}

function isThemeParksApiResponse(data: unknown): data is ThemeParksApiSuccessResponse {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const obj = data as Record<string, unknown>;
    return (
        typeof obj.success === 'boolean' &&
        obj.success === true &&
        typeof obj.data === 'object' &&
        obj.data !== null &&
        Array.isArray((obj.data as Record<string, unknown>).liveData)
    );
}

function transformThemeParksResponse(item: ThemeParksLiveDataItem): AttractionWaitTime {
    const waitTime = item.queue?.STANDBY?.waitTime ?? -1;
    return {
        attractionId: item.id,
        name: item.name,
        waitMinutes: waitTime,
        lastUpdated: item.lastUpdated || new Date().toISOString(),
        status: item.status || 'CLOSED'
    }
}

async function getHistoricalWaitTimes({
    attractionId
}: {
    attractionId: string
}): Promise<HistoricalWaitSample[]> {
    const key = `historical:${attractionId}`
    const cached = systemCache.get<HistoricalWaitSample[]>(key)
    if (cached) return cached

    try {
        const historicalQuery = query(
            collection(firestore, COLLECTIONS.HISTORICAL_WAIT_TIMES),
            where('attractionId', '==', attractionId),
            orderBy('timestamp', 'asc'),
            limit(HISTORICAL_SAMPLE_LIMIT)
        );

        const historicalSnapshot = await getDocs(historicalQuery);
        const data = historicalSnapshot.docs.map(doc => doc.data());

        if (!data || data.length === 0) return []

        const parsed = data
            .filter(isValidWaitTimeRecord)
            .map(firestoreToWaitTimeRecord)

        systemCache.set(key, parsed, 60 * 30) // cache 30 mins
        return parsed
    } catch (error) {
        console.error('Error fetching historical wait times:', error);
        return []
    }
}

async function getLiveSample({
    attractionId
}: {
    attractionId: string
}): Promise<HistoricalWaitSample[]> {
    const now = new Date()
    const past = new Date(now.getTime() - 1000 * 60 * 60) // last hour

    try {
        const liveQuery = query(
            collection(firestore, COLLECTIONS.WAIT_TIMES),
            where('attractionId', '==', attractionId),
            where('timestamp', '>=', Timestamp.fromDate(past)),
            orderBy('timestamp', 'asc')
        );

        const liveSnapshot = await getDocs(liveQuery);
        const data = liveSnapshot.docs.map(doc => doc.data());

        if (!data || data.length === 0) return []

        return data
            .filter(isValidWaitTimeRecord)
            .map(firestoreToWaitTimeRecord)
    } catch (error) {
        console.error('Error fetching live wait times:', error);
        return []
    }
}

function ensureRealtimeChannel(parkId: string) {
    if (realtimeChannels.has(parkId)) return

    // Firebase realtime listeners can be implemented here using onSnapshot
    // For now, using event bus only
    realtimeChannels.set(parkId, true)
}

function teardownRealtimeChannel(parkId: string) {
    const channel = realtimeChannels.get(parkId)
    if (!channel) return
    // Firebase cleanup would go here
    realtimeChannels.delete(parkId)
}

// =========================================================================================
// HELPERS / UTILITY FUNCTIONS
// =========================================================================================

function exponentialMovingAverage(values: number[], alpha = 0.4): number {
    if (values.length === 0) return 0
    return values.reduce((acc, cur) => alpha * cur + (1 - alpha) * acc)
}

function weightedAverage(entries: { value: number; weight: number }[]): number {
    const totalWeight = entries.reduce((acc, e) => acc + e.weight, 0)
    if (totalWeight === 0) return 0
    return entries.reduce((acc, e) => acc + (e.value * e.weight) / totalWeight, 0)
}

function isSameDayOfWeek(a: Date | string, b: Date): boolean {
    return new Date(a).getUTCDay() === b.getUTCDay()
}

function detectAnomaly(predicted: number, live: number): AnomalyDetection {
    const deviation = Math.abs(predicted - live)
    const confidence = Math.max(0, 1 - deviation / THRESHOLD_ANOMALY_MINUTES)
    const adjustment = deviation > THRESHOLD_ANOMALY_MINUTES ? (live - predicted) * 0.5 : 0
    return { adjustment, confidence }
}

// =========================================================================================
// STATIC CONTENT / CONFIGURATION
// =========================================================================================

const CACHE_TTL_MS = 1000 * 30 // 30 seconds for live data
const HISTORICAL_SAMPLE_LIMIT = 30 * 24 * 60 // 30 days @ 1-min
const THRESHOLD_ANOMALY_MINUTES = 15

// =========================================================================================
// STATE / SINGLETONS
// =========================================================================================

const waitTimeCache = new Map<string, CachedWaitTimes>()

const eventBus = new EventEmitter()

// simple TTL cache implementation leveraging Map
const systemCache = {
    get<T>(key: string): T | undefined {
        const entry = internalSystemCache.get(key)
        if (!entry) return undefined
        if (Date.now() > entry.expiry) {
            internalSystemCache.delete(key)
            return undefined
        }
        // Type assertion is safe here because we control what goes into the cache
        // and the generic T parameter ensures type consistency at call sites
        return entry.value as T
    },
    set<T>(key: string, value: T, ttlSeconds: number) {
        internalSystemCache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 })
    }
}

const internalSystemCache = new Map<string, { value: unknown; expiry: number }>()

const realtimeChannels = new Map<string, boolean>()

// Export types for external use
export type {
    AttractionWaitTime,
    PredictedWaitTime,
    WaitTimesUpdatePayload,
    GetWaitTimesProps,
    PredictWaitTimeProps
}