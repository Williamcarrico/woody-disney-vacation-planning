/**
 * Typhoon Lagoon API Integration
 * Connects to the theme parks API for real-time data
 */

const TYPHOON_LAGOON_API_BASE = 'https://api.themeparks.wiki/v1/entity';
const TYPHOON_LAGOON_PARK_ID = 'b070cbc5-feaa-4b87-a8c1-f94cca037a18';
const WDW_DESTINATION_ID = 'e957da41-3552-4cf6-b636-5babc5cbc4e5';

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface TyphoonLagoonParkInfo {
    id: string;
    name: string;
    slug: string;
    location: {
        latitude: number;
        longitude: number;
        pointsOfInterest: unknown[];
    };
    parentId: string;
    timezone: string;
    entityType: string;
    destinationId: string;
    externalId: string;
}

export interface TyphoonLagoonAttraction {
    id: string;
    name: string;
    entityType: string;
    parkId: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    status?: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';
    waitTime?: number;
    lastUpdated?: string;
}

export interface TyphoonLagoonSchedule {
    date: string;
    openingTime: string;
    closingTime: string;
    type: string;
    description?: string;
}

export interface TyphoonLagoonLiveData {
    id: string;
    name: string;
    status: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';
    lastUpdated: string;
    waitTime?: {
        standby: number;
        fastPass?: number;
        singleRider?: number;
    };
    schedule?: {
        openingTime: string;
        closingTime: string;
    };
}

/**
 * Generic fetch function with caching and error handling
 */
async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Disney-Vacation-Planning-App/1.0',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache the response
        cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);

        // Return cached data if available, even if expired
        const cached = cache.get(cacheKey);
        if (cached) {
            console.warn(`Using expired cache for ${cacheKey}`);
            return cached.data as T;
        }

        throw error;
    }
}

/**
 * Get basic park information for Typhoon Lagoon
 */
export async function getTyphoonLagoonParkInfo(): Promise<TyphoonLagoonParkInfo> {
    return fetchWithCache<TyphoonLagoonParkInfo>(
        `${TYPHOON_LAGOON_API_BASE}/${TYPHOON_LAGOON_PARK_ID}`,
        `park-info-${TYPHOON_LAGOON_PARK_ID}`
    );
}

/**
 * Get all attractions/children entities for Typhoon Lagoon
 */
export async function getTyphoonLagoonAttractions(): Promise<TyphoonLagoonAttraction[]> {
    const data = await fetchWithCache<{ children: TyphoonLagoonAttraction[] }>(
        `${TYPHOON_LAGOON_API_BASE}/${WDW_DESTINATION_ID}/children`,
        `attractions-${WDW_DESTINATION_ID}`
    );

    // Filter for Typhoon Lagoon attractions
    return data.children?.filter((attraction: TyphoonLagoonAttraction) =>
        attraction.parkId === TYPHOON_LAGOON_PARK_ID ||
        (attraction as unknown as { parentId: string }).parentId === TYPHOON_LAGOON_PARK_ID
    ) || [];
}

/**
 * Get real-time live data for Typhoon Lagoon (wait times, status, etc.)
 */
export async function getTyphoonLagoonLiveData(): Promise<TyphoonLagoonLiveData[]> {
    const data = await fetchWithCache<{ liveData: TyphoonLagoonLiveData[] }>(
        `${TYPHOON_LAGOON_API_BASE}/${TYPHOON_LAGOON_PARK_ID}/live`,
        `live-data-${TYPHOON_LAGOON_PARK_ID}`
    );

    return data.liveData || [];
}

/**
 * Get interactive park map data
 */
export async function getTyphoonLagoonMapData(): Promise<unknown[]> {
    const data = await fetchWithCache<{ liveData: unknown[] }>(
        `${TYPHOON_LAGOON_API_BASE}/${WDW_DESTINATION_ID}/live`,
        `map-data-${WDW_DESTINATION_ID}`
    );

    // Filter for Typhoon Lagoon specific data
    return data.liveData?.filter((item: unknown) =>
        (item as { parkId: string }).parkId === TYPHOON_LAGOON_PARK_ID
    ) || [];
}

/**
 * Get schedule data for Typhoon Lagoon
 */
export async function getTyphoonLagoonSchedule(): Promise<TyphoonLagoonSchedule[]> {
    const data = await fetchWithCache<{ schedule: TyphoonLagoonSchedule[] }>(
        `${TYPHOON_LAGOON_API_BASE}/${TYPHOON_LAGOON_PARK_ID}/schedule`,
        `schedule-${TYPHOON_LAGOON_PARK_ID}`
    );

    return data.schedule || [];
}

/**
 * Get schedule data for a specific month
 */
export async function getTyphoonLagoonMonthlySchedule(year: number, month: number): Promise<TyphoonLagoonSchedule[]> {
    const monthStr = month.toString().padStart(2, '0');
    const data = await fetchWithCache<{ schedule: TyphoonLagoonSchedule[] }>(
        `${TYPHOON_LAGOON_API_BASE}/${TYPHOON_LAGOON_PARK_ID}/schedule/${year}/${monthStr}`,
        `schedule-${TYPHOON_LAGOON_PARK_ID}-${year}-${monthStr}`
    );

    return data.schedule || [];
}

/**
 * Get current month schedule (convenience function)
 */
export async function getTyphoonLagoonCurrentMonthSchedule(): Promise<TyphoonLagoonSchedule[]> {
    const now = new Date();
    return getTyphoonLagoonMonthlySchedule(now.getFullYear(), now.getMonth() + 1);
}

/**
 * Check if Typhoon Lagoon is currently open
 */
export async function isTyphoonLagoonOpen(): Promise<boolean> {
    try {
        const liveData = await getTyphoonLagoonLiveData();
        const parkData = liveData.find(item => item.id === TYPHOON_LAGOON_PARK_ID);

        return parkData?.status === 'OPERATING';
    } catch (error) {
        console.error('Error checking Typhoon Lagoon status:', error);
        return false;
    }
}

/**
 * Get wait times for all attractions
 */
export async function getTyphoonLagoonWaitTimes(): Promise<Record<string, number>> {
    try {
        const liveData = await getTyphoonLagoonLiveData();
        const waitTimes: Record<string, number> = {};

        liveData.forEach(attraction => {
            if (attraction.waitTime?.standby !== undefined) {
                waitTimes[attraction.id] = attraction.waitTime.standby;
            }
        });

        return waitTimes;
    } catch (error) {
        console.error('Error fetching Typhoon Lagoon wait times:', error);
        return {};
    }
}

/**
 * Get today's operating hours
 */
export async function getTyphoonLagoonTodayHours(): Promise<{ openingTime: string; closingTime: string } | null> {
    try {
        const schedule = await getTyphoonLagoonSchedule();
        const today = new Date().toISOString().split('T')[0];

        const todaySchedule = schedule.find(day => day.date === today);

        if (todaySchedule) {
            return {
                openingTime: todaySchedule.openingTime,
                closingTime: todaySchedule.closingTime
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching today\'s hours:', error);
        return null;
    }
}

/**
 * Get park status with detailed information
 */
export async function getTyphoonLagoonStatus(): Promise<{
    isOpen: boolean;
    status: string;
    hours?: { openingTime: string; closingTime: string };
    lastUpdated: string;
}> {
    try {
        const [isOpen, hours] = await Promise.all([
            isTyphoonLagoonOpen(),
            getTyphoonLagoonTodayHours()
        ]);

        return {
            isOpen,
            status: isOpen ? 'OPERATING' : 'CLOSED',
            hours: hours || undefined,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting park status:', error);
        return {
            isOpen: false,
            status: 'UNKNOWN',
            lastUpdated: new Date().toISOString()
        };
    }
}

/**
 * Clear the API cache (useful for testing or forced refresh)
 */
export function clearTyphoonLagoonCache(): void {
    cache.clear();
}

/**
 * Get cache statistics
 */
export function getTyphoonLagoonCacheStats(): {
    size: number;
    keys: string[];
    oldestEntry?: { key: string; age: number };
} {
    const keys = Array.from(cache.keys());
    let oldestEntry: { key: string; age: number } | undefined;

    if (keys.length > 0) {
        const oldestKey = keys.reduce((oldest, key) => {
            const entry = cache.get(key);
            const oldestEntry = cache.get(oldest);
            return (entry && oldestEntry && entry.timestamp < oldestEntry.timestamp) ? key : oldest;
        });

        const entry = cache.get(oldestKey);
        if (entry) {
            oldestEntry = {
                key: oldestKey,
                age: Date.now() - entry.timestamp
            };
        }
    }

    return {
        size: cache.size,
        keys,
        oldestEntry
    };
}

// Export constants for use in other files
export const TYPHOON_LAGOON_CONSTANTS = {
    PARK_ID: TYPHOON_LAGOON_PARK_ID,
    DESTINATION_ID: WDW_DESTINATION_ID,
    API_BASE: TYPHOON_LAGOON_API_BASE,
    COORDINATES: {
        latitude: 28.3650541008,
        longitude: -81.5278921081
    },
    CACHE_DURATION,
    // Park facts from research
    FACTS: {
        openingDate: 'June 1, 1989',
        theme: 'Storm-ravaged tropical paradise',
        size: '61 acres',
        wavePoolSize: '2.75 acres',
        maxWaveHeight: '6 feet',
        lazyRiverLength: '2,100 feet',
        mountMaydayHeight: '95 feet',
        missTillyStory: 'Shrimp boat caught in the great storm and lodged atop Mount Mayday',
        timezone: 'America/New_York'
    }
};