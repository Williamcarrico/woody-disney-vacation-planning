/**
 * Advanced Caching Service
 *
 * Provides a comprehensive caching layer with Redis support and in-memory fallback.
 * Includes cache invalidation, TTL management, and performance monitoring.
 */

import * as IORedis from 'ioredis'

// Cache configuration
interface CacheConfig {
    defaultTTL: number // seconds
    maxMemoryItems: number
    enableRedis: boolean
    redisUrl?: string
    keyPrefix: string
    /** Enable cache compression */
    compression?: boolean
    /** JSON serialization options */
    jsonOptions?: {
        replacer?: (key: string, value: any) => any
        reviver?: (key: string, value: any) => any
    }
}

const DEFAULT_CONFIG: CacheConfig = {
    defaultTTL: 300, // 5 minutes
    maxMemoryItems: 1000,
    enableRedis: process.env.NODE_ENV === 'production',
    redisUrl: process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING,
    keyPrefix: 'disney-vacation:',
    compression: false,
    jsonOptions: {}
}

// Cache statistics
interface CacheStats {
    hits: number
    misses: number
    sets: number
    deletes: number
    errors: number
    lastReset: Date
}

// Cache entry interface
interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
    tags?: string[]
}

// Resort data types
interface ResortData {
    id: string
    name: string
    category: string
    [key: string]: unknown
}

interface ResortListData {
    resorts: ResortData[]
    total: number
    page?: number
    limit?: number
}

interface ResortStatsData {
    totalResorts: number
    categories: Record<string, number>
    lastUpdated: string
}

// Generic cache data type
type CacheableData = ResortData | ResortListData | ResortStatsData | Record<string, unknown>

class CacheServiceImpl {
    private static instance: CacheServiceImpl
    private redis: IORedis.Redis | null = null
    private memoryCache = new Map<string, CacheEntry<CacheableData>>()
    private config: CacheConfig
    private stats: CacheStats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        lastReset: new Date()
    }
    private cleanupInterval: NodeJS.Timeout | null = null

    private constructor(config: Partial<CacheConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config }
        this.initializeRedis()
        this.startCleanupInterval()
    }

    public static getInstance(config?: Partial<CacheConfig>): CacheServiceImpl {
        if (!CacheServiceImpl.instance) {
            CacheServiceImpl.instance = new CacheServiceImpl(config)
        }
        return CacheServiceImpl.instance
    }

    private async initializeRedis(): Promise<void> {
        if (!this.config.enableRedis || !this.config.redisUrl) {
            console.log('Redis disabled or URL not provided, using in-memory cache only')
            return
        }

        try {
            this.redis = new IORedis.Redis(this.config.redisUrl, {
                maxRetriesPerRequest: 3,
                lazyConnect: true
            })

            this.redis.on('connect', () => {
                console.log('Redis connected successfully')
            })

            this.redis.on('error', (error: Error) => {
                console.error('Redis connection error:', error)
                this.stats.errors++
                // Fall back to memory cache on Redis errors
                this.redis = null
            })

            this.redis.on('close', () => {
                console.log('Redis connection closed')
            })

            // Test connection
            await this.redis.ping()
        } catch (error) {
            console.error('Failed to initialize Redis:', error)
            this.redis = null
            this.stats.errors++
        }
    }

    private startCleanupInterval(): void {
        // Clean up expired memory cache entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupMemoryCache()
        }, 5 * 60 * 1000)
    }

    private cleanupMemoryCache(): void {
        const now = Date.now()
        let cleaned = 0

        for (const [key, entry] of this.memoryCache.entries()) {
            if (now - entry.timestamp > entry.ttl * 1000) {
                this.memoryCache.delete(key)
                cleaned++
            }
        }

        // Also enforce max items limit
        if (this.memoryCache.size > this.config.maxMemoryItems) {
            const entries = Array.from(this.memoryCache.entries())
            entries.sort(([, a], [, b]) => a.timestamp - b.timestamp)

            const toRemove = this.memoryCache.size - this.config.maxMemoryItems
            for (let i = 0; i < toRemove; i++) {
                this.memoryCache.delete(entries[i][0])
                cleaned++
            }
        }

        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} expired cache entries`)
        }
    }

    private getKey(key: string): string {
        return `${this.config.keyPrefix}${key}`
    }

    /**
     * Get a value from cache
     */
    async get<T extends CacheableData>(key: string): Promise<T | null> {
        const fullKey = this.getKey(key)

        try {
            // Try Redis first
            if (this.redis) {
                const redisValue = await this.redis.get(fullKey)
                if (redisValue) {
                    this.stats.hits++
                    return JSON.parse(redisValue) as T
                }
            }

            // Fall back to memory cache
            const memoryEntry = this.memoryCache.get(fullKey)
            if (memoryEntry) {
                const now = Date.now()
                if (now - memoryEntry.timestamp < memoryEntry.ttl * 1000) {
                    this.stats.hits++
                    return memoryEntry.data as T
                } else {
                    // Expired
                    this.memoryCache.delete(fullKey)
                }
            }

            this.stats.misses++
            return null
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error)
            this.stats.errors++
            return null
        }
    }

    /**
     * Set a value in cache
     */
    async set<T extends CacheableData>(
        key: string,
        value: T,
        ttl: number = this.config.defaultTTL,
        tags?: string[]
    ): Promise<void> {
        const fullKey = this.getKey(key)
        const serializedValue = JSON.stringify(value)

        try {
            // Set in Redis
            if (this.redis) {
                await this.redis.setex(fullKey, ttl, serializedValue)

                // Store tags for invalidation if provided
                if (tags && tags.length > 0) {
                    const tagKey = `${this.config.keyPrefix}tags:${fullKey}`
                    await this.redis.setex(tagKey, ttl, JSON.stringify(tags))
                }
            }

            // Set in memory cache
            this.memoryCache.set(fullKey, {
                data: value,
                timestamp: Date.now(),
                ttl,
                tags
            })

            this.stats.sets++
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error)
            this.stats.errors++
        }
    }

    /**
     * Delete a specific key
     */
    async delete(key: string): Promise<void> {
        const fullKey = this.getKey(key)

        try {
            // Delete from Redis
            if (this.redis) {
                await this.redis.del(fullKey)
                await this.redis.del(`${this.config.keyPrefix}tags:${fullKey}`)
            }

            // Delete from memory cache
            this.memoryCache.delete(fullKey)

            this.stats.deletes++
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error)
            this.stats.errors++
        }
    }

    /**
     * Delete multiple keys by pattern
     */
    async deletePattern(pattern: string): Promise<number> {
        const fullPattern = this.getKey(pattern)
        let deletedCount = 0

        try {
            // Delete from Redis using pattern
            if (this.redis) {
                const keys = await this.redis.keys(fullPattern)
                if (keys.length > 0) {
                    await this.redis.del(...keys)
                    deletedCount += keys.length
                }
            }

            // Delete from memory cache
            for (const key of this.memoryCache.keys()) {
                if (this.matchesPattern(key, fullPattern)) {
                    this.memoryCache.delete(key)
                    deletedCount++
                }
            }

            this.stats.deletes += deletedCount
            return deletedCount
        } catch (error) {
            console.error(`Cache delete pattern error for pattern ${pattern}:`, error)
            this.stats.errors++
            return 0
        }
    }

    /**
     * Delete keys by tags
     */
    async deleteByTags(tags: string[]): Promise<number> {
        let deletedCount = 0

        try {
            // For Redis, we need to scan through tag keys
            if (this.redis) {
                const tagPattern = `${this.config.keyPrefix}tags:*`
                const tagKeys = await this.redis.keys(tagPattern)

                for (const tagKey of tagKeys) {
                    const keyTags = await this.redis.get(tagKey)
                    if (keyTags) {
                        const parsedTags = JSON.parse(keyTags) as string[]
                        if (tags.some(tag => parsedTags.includes(tag))) {
                            const originalKey = tagKey.replace(`${this.config.keyPrefix}tags:`, '')
                            await this.redis.del(originalKey, tagKey)
                            deletedCount++
                        }
                    }
                }
            }

            // For memory cache
            for (const [key, entry] of this.memoryCache.entries()) {
                if (entry.tags && tags.some(tag => entry.tags?.includes(tag))) {
                    this.memoryCache.delete(key)
                    deletedCount++
                }
            }

            this.stats.deletes += deletedCount
            return deletedCount
        } catch (error) {
            console.error(`Cache delete by tags error:`, error)
            this.stats.errors++
            return 0
        }
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        try {
            // Clear Redis
            if (this.redis) {
                const keys = await this.redis.keys(`${this.config.keyPrefix}*`)
                if (keys.length > 0) {
                    await this.redis.del(...keys)
                }
            }

            // Clear memory cache
            this.memoryCache.clear()

            console.log('Cache cleared successfully')
        } catch (error) {
            console.error('Cache clear error:', error)
            this.stats.errors++
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats & { hitRate: number; memorySize: number } {
        const total = this.stats.hits + this.stats.misses
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            memorySize: this.memoryCache.size
        }
    }

    /**
     * Reset statistics
     */
    resetStats(): void {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0,
            lastReset: new Date()
        }
    }

    /**
     * Check if Redis is available
     */
    isRedisAvailable(): boolean {
        return this.redis !== null && this.redis.status === 'ready'
    }

    /**
     * Get cache health status
     */
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy'
        redis: boolean
        memory: boolean
        stats: ReturnType<CacheServiceImpl['getStats']>
    } {
        const stats = this.getStats()
        const redisHealthy = this.isRedisAvailable()
        const memoryHealthy = this.memoryCache.size < this.config.maxMemoryItems

        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

        if (!redisHealthy && !memoryHealthy) {
            status = 'unhealthy'
        } else if (!redisHealthy || !memoryHealthy || stats.errors > 10) {
            status = 'degraded'
        }

        return {
            status,
            redis: redisHealthy,
            memory: memoryHealthy,
            stats
        }
    }

    /**
     * Utility method to check if a key matches a pattern
     */
    private matchesPattern(key: string, pattern: string): boolean {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(key)
    }

    /**
     * Cleanup resources
     */
    async destroy(): Promise<void> {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
        }

        if (this.redis) {
            await this.redis.quit()
        }

        this.memoryCache.clear()
    }
}

// Export the class with a different name to avoid conflicts
export { CacheServiceImpl as CacheService }

// ============================================================================
// SPECIALIZED CACHE SERVICES
// ============================================================================

/**
 * Resort-specific cache service with predefined keys and TTLs
 */
export class ResortCacheService {
    private cache: CacheServiceImpl

    constructor() {
        this.cache = CacheServiceImpl.getInstance({
            keyPrefix: 'disney-vacation:resorts:',
            defaultTTL: 600 // 10 minutes for resort data
        })
    }

    // Resort list cache
    async getResortList(queryHash: string): Promise<ResortListData | null> {
        return this.cache.get<ResortListData>(`list:${queryHash}`)
    }

    async setResortList(queryHash: string, data: ResortListData, ttl = 600): Promise<void> {
        return this.cache.set(`list:${queryHash}`, data, ttl, ['resorts', 'list'])
    }

    // Individual resort cache
    async getResort(id: string): Promise<ResortData | null> {
        return this.cache.get<ResortData>(`resort:${id}`)
    }

    async setResort(id: string, data: ResortData, ttl = 1800): Promise<void> { // 30 minutes for individual resorts
        return this.cache.set(`resort:${id}`, data, ttl, ['resorts', 'individual', id])
    }

    // Resort statistics cache
    async getResortStats(): Promise<ResortStatsData | null> {
        return this.cache.get<ResortStatsData>('stats:global')
    }

    async setResortStats(data: ResortStatsData, ttl = 3600): Promise<void> { // 1 hour for stats
        return this.cache.set('stats:global', data, ttl, ['resorts', 'stats'])
    }

    // Invalidation methods
    async invalidateResort(id: string): Promise<void> {
        await this.cache.deleteByTags([id])
        await this.cache.deletePattern('list:*') // Invalidate all list caches
    }

    async invalidateAllResorts(): Promise<void> {
        await this.cache.deleteByTags(['resorts'])
    }

    async invalidateResortLists(): Promise<void> {
        await this.cache.deleteByTags(['list'])
    }
}

// ============================================================================
// CACHE MIDDLEWARE AND UTILITIES
// ============================================================================

/**
 * Cache key generator utility
 */
export class CacheKeyGenerator {
    static resortList(params: Record<string, string | number | boolean>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key]
                return result
            }, {} as Record<string, string | number | boolean>)

        return `list:${Buffer.from(JSON.stringify(sortedParams)).toString('base64')}`
    }

    static resort(id: string): string {
        return `resort:${id}`
    }

    static resortStats(): string {
        return 'stats:global'
    }

    static userSpecific(userId: string, key: string): string {
        return `user:${userId}:${key}`
    }
}

/**
 * Cache decorator for functions
 */
export function cached(
    keyGenerator: (...args: unknown[]) => string,
    ttl: number = 300,
    tags?: string[]
) {
    return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value
        const cache = CacheServiceImpl.getInstance()

        descriptor.value = async function (...args: unknown[]) {
            const key = keyGenerator(...args)

            // Try to get from cache
            const cached = await cache.get(key)
            if (cached !== null) {
                return cached
            }

            // Execute original method
            const result = await method.apply(this, args)

            // Cache the result
            await cache.set(key, result, ttl, tags)

            return result
        }

        return descriptor
    }
}

// Export singleton instance
export const cacheService = CacheServiceImpl.getInstance()
export const resortCache = new ResortCacheService()