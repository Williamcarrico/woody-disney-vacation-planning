/**
 * Advanced caching service with Redis support and fallback strategies
 * 
 * @module api/cache-service
 * @category API Utilities
 */

import Redis from 'ioredis'

/**
 * Cache configuration options
 */
export interface CacheConfig {
    /** Default TTL in seconds */
    defaultTTL?: number
    /** Key prefix for namespacing */
    keyPrefix?: string
    /** Maximum memory size for in-memory fallback (in MB) */
    maxMemorySize?: number
    /** Enable cache compression */
    compression?: boolean
    /** JSON serialization options */
    jsonOptions?: {
        replacer?: (key: string, value: any) => any
        reviver?: (key: string, value: any) => any
    }
}

/**
 * Cache entry metadata
 */
interface CacheEntry<T = any> {
    data: T
    timestamp: number
    ttl: number
    compressed?: boolean
    size?: number
}

/**
 * Cache statistics
 */
export interface CacheStats {
    hits: number
    misses: number
    hitRate: number
    totalKeys: number
    memoryUsage: number
    redisConnected: boolean
}

/**
 * Advanced caching service with Redis backend and in-memory fallback
 */
export class CacheService {
    private redis: Redis | null = null
    private inMemoryCache = new Map<string, CacheEntry>()
    private stats = { hits: 0, misses: 0 }
    private config: Required<CacheConfig>
    private currentMemorySize = 0

    constructor(config: CacheConfig = {}) {
        this.config = {
            defaultTTL: 300, // 5 minutes
            keyPrefix: 'cache',
            maxMemorySize: 100, // 100MB
            compression: false,
            jsonOptions: {},
            ...config
        }

        this.initializeRedis()
        this.startCleanupTimer()
    }

    /**
     * Initialize Redis connection
     */
    private initializeRedis(): void {
        try {
            const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING
            
            if (redisUrl) {
                this.redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    retryDelayOnFailover: 100,
                    lazyConnect: true,
                    // Connection pool settings
                    family: 4,
                    keepAlive: true,
                    connectTimeout: 10000,
                    commandTimeout: 5000
                })

                this.redis.on('error', (error) => {
                    console.error('[CacheService] Redis connection error:', error)
                    // Don't set redis to null here, let it retry
                })

                this.redis.on('connect', () => {
                    console.log('[CacheService] Redis connected successfully')
                })

                this.redis.on('reconnecting', () => {
                    console.log('[CacheService] Redis reconnecting...')
                })
            } else {
                console.log('[CacheService] No Redis URL provided, using in-memory cache only')
            }
        } catch (error) {
            console.warn('[CacheService] Failed to initialize Redis:', error)
            this.redis = null
        }
    }

    /**
     * Generate cache key with prefix
     */
    private generateKey(key: string): string {
        return `${this.config.keyPrefix}:${key}`
    }

    /**
     * Serialize data for storage
     */
    private serialize(data: any): string {
        return JSON.stringify(data, this.config.jsonOptions.replacer)
    }

    /**
     * Deserialize data from storage
     */
    private deserialize<T>(data: string): T {
        return JSON.parse(data, this.config.jsonOptions.reviver)
    }

    /**
     * Compress data if compression is enabled
     */
    private async compress(data: string): Promise<string> {
        if (!this.config.compression) return data
        
        // Simple compression placeholder - in production, use zlib or similar
        return data
    }

    /**
     * Decompress data if it was compressed
     */
    private async decompress(data: string): Promise<string> {
        if (!this.config.compression) return data
        
        // Simple decompression placeholder
        return data
    }

    /**
     * Get data from Redis cache
     */
    private async getFromRedis<T>(key: string): Promise<T | null> {
        if (!this.redis) return null

        try {
            const data = await this.redis.get(this.generateKey(key))
            if (!data) return null

            const decompressed = await this.decompress(data)
            return this.deserialize<T>(decompressed)
        } catch (error) {
            console.error('[CacheService] Redis get error:', error)
            return null
        }
    }

    /**
     * Set data in Redis cache
     */
    private async setInRedis<T>(key: string, data: T, ttl: number): Promise<boolean> {
        if (!this.redis) return false

        try {
            const serialized = this.serialize(data)
            const compressed = await this.compress(serialized)
            
            const result = await this.redis.setex(this.generateKey(key), ttl, compressed)
            return result === 'OK'
        } catch (error) {
            console.error('[CacheService] Redis set error:', error)
            return false
        }
    }

    /**
     * Delete data from Redis cache
     */
    private async deleteFromRedis(key: string): Promise<boolean> {
        if (!this.redis) return false

        try {
            const result = await this.redis.del(this.generateKey(key))
            return result > 0
        } catch (error) {
            console.error('[CacheService] Redis delete error:', error)
            return false
        }
    }

    /**
     * Get data from in-memory cache
     */
    private getFromMemory<T>(key: string): T | null {
        const entry = this.inMemoryCache.get(key)
        if (!entry) return null

        // Check if expired
        if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
            this.inMemoryCache.delete(key)
            this.currentMemorySize -= entry.size || 0
            return null
        }

        return entry.data
    }

    /**
     * Set data in in-memory cache
     */
    private setInMemory<T>(key: string, data: T, ttl: number): boolean {
        try {
            const serializedSize = JSON.stringify(data).length
            
            // Check memory limit
            const maxSizeBytes = this.config.maxMemorySize * 1024 * 1024
            if (this.currentMemorySize + serializedSize > maxSizeBytes) {
                this.evictLRU()
            }

            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                ttl,
                size: serializedSize
            }

            this.inMemoryCache.set(key, entry)
            this.currentMemorySize += serializedSize
            return true
        } catch (error) {
            console.error('[CacheService] Memory set error:', error)
            return false
        }
    }

    /**
     * Delete data from in-memory cache
     */
    private deleteFromMemory(key: string): boolean {
        const entry = this.inMemoryCache.get(key)
        if (entry) {
            this.currentMemorySize -= entry.size || 0
            return this.inMemoryCache.delete(key)
        }
        return false
    }

    /**
     * Evict least recently used entries from memory cache
     */
    private evictLRU(): void {
        const entries = Array.from(this.inMemoryCache.entries())
        entries.sort(([, a], [, b]) => a.timestamp - b.timestamp)
        
        // Remove oldest 25% of entries
        const toRemove = Math.ceil(entries.length * 0.25)
        for (let i = 0; i < toRemove; i++) {
            const [key, entry] = entries[i]
            this.inMemoryCache.delete(key)
            this.currentMemorySize -= entry.size || 0
        }
    }

    /**
     * Get data from cache (tries Redis first, then in-memory)
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            // Try Redis first
            let data = await this.getFromRedis<T>(key)
            
            if (data !== null) {
                this.stats.hits++
                // Also cache in memory for faster subsequent access
                this.setInMemory(key, data, this.config.defaultTTL)
                return data
            }

            // Try in-memory cache
            data = this.getFromMemory<T>(key)
            
            if (data !== null) {
                this.stats.hits++
                return data
            }

            this.stats.misses++
            return null
        } catch (error) {
            console.error('[CacheService] Get error:', error)
            this.stats.misses++
            return null
        }
    }

    /**
     * Set data in cache (stores in both Redis and in-memory)
     */
    async set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): Promise<boolean> {
        try {
            const redisSuccess = await this.setInRedis(key, data, ttl)
            const memorySuccess = this.setInMemory(key, data, ttl)
            
            return redisSuccess || memorySuccess
        } catch (error) {
            console.error('[CacheService] Set error:', error)
            return false
        }
    }

    /**
     * Delete data from cache (removes from both Redis and in-memory)
     */
    async delete(key: string): Promise<boolean> {
        try {
            const redisSuccess = await this.deleteFromRedis(key)
            const memorySuccess = this.deleteFromMemory(key)
            
            return redisSuccess || memorySuccess
        } catch (error) {
            console.error('[CacheService] Delete error:', error)
            return false
        }
    }

    /**
     * Get multiple keys from cache
     */
    async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
        const results = new Map<string, T | null>()
        
        // Use pipeline for Redis efficiency
        if (this.redis && keys.length > 0) {
            try {
                const pipeline = this.redis.pipeline()
                keys.forEach(key => pipeline.get(this.generateKey(key)))
                
                const redisResults = await pipeline.exec()
                
                if (redisResults) {
                    for (let i = 0; i < keys.length; i++) {
                        const [error, result] = redisResults[i]
                        if (!error && result) {
                            try {
                                const decompressed = await this.decompress(result as string)
                                const data = this.deserialize<T>(decompressed)
                                results.set(keys[i], data)
                                this.stats.hits++
                            } catch (e) {
                                results.set(keys[i], null)
                                this.stats.misses++
                            }
                        } else {
                            // Try in-memory for this key
                            const memoryData = this.getFromMemory<T>(keys[i])
                            results.set(keys[i], memoryData)
                            if (memoryData) {
                                this.stats.hits++
                            } else {
                                this.stats.misses++
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('[CacheService] GetMany error:', error)
                // Fallback to individual gets
                for (const key of keys) {
                    results.set(key, await this.get<T>(key))
                }
            }
        } else {
            // No Redis, use in-memory only
            for (const key of keys) {
                const data = this.getFromMemory<T>(key)
                results.set(key, data)
                if (data) {
                    this.stats.hits++
                } else {
                    this.stats.misses++
                }
            }
        }
        
        return results
    }

    /**
     * Clear all cache data
     */
    async clear(): Promise<boolean> {
        try {
            let redisSuccess = true
            if (this.redis) {
                const keys = await this.redis.keys(`${this.config.keyPrefix}:*`)
                if (keys.length > 0) {
                    redisSuccess = await this.redis.del(...keys) > 0
                }
            }

            this.inMemoryCache.clear()
            this.currentMemorySize = 0
            
            return redisSuccess
        } catch (error) {
            console.error('[CacheService] Clear error:', error)
            return false
        }
    }

    /**
     * Check if key exists in cache
     */
    async exists(key: string): Promise<boolean> {
        try {
            if (this.redis) {
                const exists = await this.redis.exists(this.generateKey(key))
                if (exists) return true
            }

            return this.inMemoryCache.has(key)
        } catch (error) {
            console.error('[CacheService] Exists error:', error)
            return false
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<CacheStats> {
        const total = this.stats.hits + this.stats.misses
        const hitRate = total > 0 ? this.stats.hits / total : 0

        let totalKeys = this.inMemoryCache.size
        let redisConnected = false

        if (this.redis) {
            try {
                await this.redis.ping()
                redisConnected = true
                const redisKeys = await this.redis.keys(`${this.config.keyPrefix}:*`)
                totalKeys += redisKeys.length
            } catch (error) {
                // Redis not available
            }
        }

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate,
            totalKeys,
            memoryUsage: this.currentMemorySize,
            redisConnected
        }
    }

    /**
     * Start periodic cleanup of expired in-memory entries
     */
    private startCleanupTimer(): void {
        setInterval(() => {
            const now = Date.now()
            for (const [key, entry] of this.inMemoryCache.entries()) {
                if (now > entry.timestamp + (entry.ttl * 1000)) {
                    this.inMemoryCache.delete(key)
                    this.currentMemorySize -= entry.size || 0
                }
            }
        }, 60000) // Clean up every minute
    }

    /**
     * Get or set pattern (cache-aside)
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl: number = this.config.defaultTTL
    ): Promise<T> {
        const cached = await this.get<T>(key)
        if (cached !== null) {
            return cached
        }

        const data = await factory()
        await this.set(key, data, ttl)
        return data
    }

    /**
     * Disconnect from Redis (for cleanup)
     */
    async disconnect(): Promise<void> {
        if (this.redis) {
            await this.redis.disconnect()
        }
    }
}

/**
 * Global cache service instance
 */
export const cacheService = new CacheService({
    defaultTTL: 300, // 5 minutes
    keyPrefix: 'disney_api',
    maxMemorySize: 50, // 50MB
    compression: false
})

/**
 * Cache configuration for different data types
 */
export const CacheConfigs = {
    /** Short-lived cache for API responses */
    api: {
        ttl: 300, // 5 minutes
        prefix: 'api'
    },
    /** Medium-lived cache for park data */
    parks: {
        ttl: 1800, // 30 minutes
        prefix: 'parks'
    },
    /** Long-lived cache for static data */
    static: {
        ttl: 3600, // 1 hour
        prefix: 'static'
    },
    /** Very short cache for real-time data */
    realtime: {
        ttl: 60, // 1 minute
        prefix: 'realtime'
    },
    /** Long-term cache for user preferences */
    user: {
        ttl: 7200, // 2 hours
        prefix: 'user'
    }
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
    attractions: (filters: string) => `attractions:${filters}`,
    restaurants: (filters: string) => `restaurants:${filters}`,
    waitTimes: (parkId: string) => `wait_times:${parkId}`,
    weather: (location: string) => `weather:${location}`,
    user: (userId: string) => `user:${userId}`,
    park: (parkId: string) => `park:${parkId}`,
    resort: (resortId: string) => `resort:${resortId}`
}