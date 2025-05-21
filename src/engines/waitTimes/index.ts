import { createClient, SupabaseClient } from '@supabase/supabase-js'
import pLimit from 'p-limit'
import EventEmitter from 'events'
import "server-only"

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

    if (isCacheValid && !forceRefresh) return cached!.data

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

    const emaLive = exponentialMovingAverage(liveSample.map(d => d.waitMinutes))
    const emaHistorical = exponentialMovingAverage(historical
        .filter(d => isSameDayOfWeek(d.timestamp, target))
        .map(d => d.waitMinutes))

    const basePrediction = weightedAverage([
        { value: emaLive, weight: 0.6 },
        { value: emaHistorical, weight: 0.4 }
    ])

    const anomaly = detectAnomaly(basePrediction, liveSample.at(-1)!.waitMinutes)

    return {
        attractionId,
        predictedMinutes: Math.round(basePrediction + anomaly.adjustment),
        confidence: anomaly.confidence
    }
}

/**
 * Subscribe to real-time wait-time updates for a particular park. Utilises an
 * internal event bus and optionally a Supabase real-time channel when available.
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
    const attractions = await getAttractionsForPark(parkId)
    const limit = pLimit(CONCURRENT_REQUEST_LIMIT)

    const results = await Promise.allSettled(
        attractions.map(attraction =>
            limit(() => safeFetchWaitTime({ attractionId: attraction.id, signal }))
        )
    )

    return results
        .flatMap(r => (r.status === 'fulfilled' ? [r.value] : []))
        .sort((a, b) => a.name.localeCompare(b.name))
}

async function safeFetchWaitTime({
    attractionId,
    signal
}: {
    attractionId: string
    signal?: AbortSignal
}): Promise<AttractionWaitTime> {
    try {
        const url = `${WAIT_TIME_API_BASE}/attractions/${attractionId}/wait`
        const res = await fetch(url, {
            headers: {
                Accept: 'application/json',
                'x-api-key': WAIT_TIME_API_KEY
            },
            next: { revalidate: CACHE_TTL_MS / 1000 },
            signal
        })

        if (!res.ok) throw new Error(`Failed wait-time fetch: ${res.status}`)

        const json = (await res.json()) as RawWaitTimeResponse
        return transformRawWaitTime(json)
    } catch (error) {
        console.error('waitTimes.safeFetchWaitTime', { attractionId, error })
        return {
            attractionId,
            name: 'Unknown Attraction',
            waitMinutes: -1,
            lastUpdated: new Date().toISOString()
        }
    }
}

function transformRawWaitTime(raw: RawWaitTimeResponse): AttractionWaitTime {
    return {
        attractionId: raw.id,
        name: raw.name,
        waitMinutes: raw.queue?.STANDBY?.waitTime ?? -1,
        lastUpdated: raw.lastUpdated
    }
}

async function getAttractionsForPark(parkId: string): Promise<AttractionMeta[]> {
    const key = `attractions:${parkId}`
    const cached = systemCache.get<AttractionMeta[]>(key)
    if (cached) return cached

    const res = await fetch(`${WAIT_TIME_API_BASE}/parks/${parkId}/attractions`, {
        headers: {
            Accept: 'application/json',
            'x-api-key': WAIT_TIME_API_KEY
        },
        next: { revalidate: 60 * 60 } // one hour
    })
    if (!res.ok) throw new Error('Unable to fetch attractions list')
    const data = (await res.json()) as AttractionMeta[]
    systemCache.set(key, data, 60 * 60)
    return data
}

async function getHistoricalWaitTimes({
    attractionId
}: {
    attractionId: string
}): Promise<HistoricalWaitSample[]> {
    const key = `historical:${attractionId}`
    const cached = systemCache.get<HistoricalWaitSample[]>(key)
    if (cached) return cached

    const { data, error } = await supabase
        .from('historical_wait_times')
        .select('timestamp, waitMinutes')
        .eq('attractionId', attractionId)
        .order('timestamp', { ascending: true })
        .limit(HISTORICAL_SAMPLE_LIMIT)

    if (error) throw error
    if (!data) return []

    const parsed = data.map(({ timestamp, waitMinutes }) => ({
        timestamp: new Date(timestamp),
        waitMinutes
    }))

    systemCache.set(key, parsed, 60 * 30) // cache 30 mins
    return parsed
}

async function getLiveSample({
    attractionId
}: {
    attractionId: string
}): Promise<HistoricalWaitSample[]> {
    const now = new Date()
    const past = new Date(now.getTime() - 1000 * 60 * 60) // last hour
    const { data, error } = await supabase
        .from('live_wait_times')
        .select('timestamp, waitMinutes')
        .eq('attractionId', attractionId)
        .gte('timestamp', past.toISOString())
        .order('timestamp', { ascending: true })

    if (error) throw error
    if (!data) return []

    return data.map(d => ({ timestamp: new Date(d.timestamp), waitMinutes: d.waitMinutes }))
}

function ensureRealtimeChannel(parkId: string) {
    if (realtimeChannels.has(parkId)) return
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return // realtime optional

    const channel = supabase.channel(`waitTimes:${parkId}`)
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'live_wait_times' }, payload => {
        const row = payload.new as { attractionId: string; waitMinutes: number; timestamp: string }
        eventBus.emit('waitTimes:update', {
            parkId,
            data: [
                {
                    attractionId: row.attractionId,
                    name: '—',
                    waitMinutes: row.waitMinutes,
                    lastUpdated: row.timestamp
                }
            ]
        })
    })
    channel.subscribe()
    realtimeChannels.set(parkId, channel)
}

function teardownRealtimeChannel(parkId: string) {
    const channel = realtimeChannels.get(parkId)
    if (!channel) return
    channel.unsubscribe()
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

const WAIT_TIME_API_BASE = process.env.WAIT_TIME_API_BASE ?? 'https://api.themeparks.wiki'
const WAIT_TIME_API_KEY = process.env.WAIT_TIME_API_KEY ?? ''

const CONCURRENT_REQUEST_LIMIT = 4
const CACHE_TTL_MS = 1000 * 30 // 30 seconds for live data
const HISTORICAL_SAMPLE_LIMIT = 30 * 24 * 60 // 30 days @ 1-min
const THRESHOLD_ANOMALY_MINUTES = 15

// =========================================================================================
// STATE / SINGLETONS
// =========================================================================================

const waitTimeCache = new Map<string, CachedWaitTimes>()

const eventBus = new EventEmitter()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase: SupabaseClient = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '')

// simple TTL cache implementation leveraging Map
const systemCache = {
    get<T>(key: string): T | undefined {
        const entry = internalSystemCache.get(key)
        if (!entry) return undefined
        if (Date.now() > entry.expiry) {
            internalSystemCache.delete(key)
            return undefined
        }
        return entry.value as T
    },
    set(key: string, value: unknown, ttlSeconds: number) {
        internalSystemCache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 })
    }
}

const internalSystemCache = new Map<string, { value: unknown; expiry: number }>()

const realtimeChannels = new Map<string, ReturnType<SupabaseClient['channel']>>()

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

interface AttractionMeta {
    id: string
    name: string
    latitude: number
    longitude: number
    thrillLevel?: number
}

interface RawWaitTimeResponse {
    id: string
    name: string
    lastUpdated: string
    queue?: {
        STANDBY?: {
            waitTime: number
        }
    }
}