import { Redis } from 'ioredis'
import { performanceMonitor } from '@/lib/firebase/firebase-performance'

// Cache configuration
export interface CacheConfig {
  defaultTTL?: number
  keyPrefix?: string
  enableCompression?: boolean
  enableMetrics?: boolean
}

// Serialization helpers
class CacheSerializer {
  static serialize(value: any): string {
    return JSON.stringify(value)
  }

  static deserialize<T>(value: string): T {
    try {
      return JSON.parse(value)
    } catch {
      return value as any
    }
  }
}

// Redis client wrapper with performance monitoring
export class RedisCache {
  private client: Redis | null = null
  private isConnected = false
  private connectionPromise: Promise<void> | null = null
  private readonly config: Required<CacheConfig>

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 300, // 5 minutes default
      keyPrefix: config.keyPrefix || 'disney:',
      enableCompression: config.enableCompression || false,
      enableMetrics: config.enableMetrics || true
    }
  }

  // Initialize Redis connection
  private async connect(): Promise<void> {
    if (this.isConnected && this.client) return
    if (this.connectionPromise) return this.connectionPromise

    this.connectionPromise = this.performConnect()
    await this.connectionPromise
  }

  private async performConnect(): Promise<void> {
    try {
      // Use Redis URL from environment or fallback to local
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
      
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        reconnectOnError: (err) => {
          const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT']
          return targetErrors.some(e => err.message.includes(e))
        },
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        }
      })

      // Set up event handlers
      this.client.on('connect', () => {
        console.log('✅ Redis connected')
        this.isConnected = true
      })

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err)
        this.isConnected = false
      })

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed')
        this.isConnected = false
      })

      // Wait for connection
      await this.client.ping()
      this.isConnected = true

    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      this.client = null
      this.isConnected = false
      throw error
    }
  }

  // Get cached value with monitoring
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now()
    const fullKey = this.config.keyPrefix + key

    try {
      await this.connect()
      if (!this.client) return null

      const value = await this.client.get(fullKey)
      
      if (this.config.enableMetrics) {
        performanceMonitor.recordOperation({
          operationName: 'redis_get',
          duration: Date.now() - startTime,
          success: true,
          metadata: { key: fullKey, hit: !!value }
        })
      }

      return value ? CacheSerializer.deserialize<T>(value) : null

    } catch (error) {
      if (this.config.enableMetrics) {
        performanceMonitor.recordOperation({
          operationName: 'redis_get',
          duration: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      return null
    }
  }

  // Set cached value with TTL
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const startTime = Date.now()
    const fullKey = this.config.keyPrefix + key
    const finalTTL = ttl || this.config.defaultTTL

    try {
      await this.connect()
      if (!this.client) return false

      const serialized = CacheSerializer.serialize(value)
      await this.client.setex(fullKey, finalTTL, serialized)

      if (this.config.enableMetrics) {
        performanceMonitor.recordOperation({
          operationName: 'redis_set',
          duration: Date.now() - startTime,
          success: true,
          metadata: { key: fullKey, ttl: finalTTL }
        })
      }

      return true

    } catch (error) {
      if (this.config.enableMetrics) {
        performanceMonitor.recordOperation({
          operationName: 'redis_set',
          duration: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      return false
    }
  }

  // Delete cached value
  async delete(key: string): Promise<boolean> {
    const fullKey = this.config.keyPrefix + key

    try {
      await this.connect()
      if (!this.client) return false

      const result = await this.client.del(fullKey)
      return result > 0

    } catch (error) {
      console.error('Redis delete error:', error)
      return false
    }
  }

  // Delete multiple keys by pattern
  async deletePattern(pattern: string): Promise<number> {
    try {
      await this.connect()
      if (!this.client) return 0

      const fullPattern = this.config.keyPrefix + pattern
      const keys = await this.client.keys(fullPattern)
      
      if (keys.length === 0) return 0

      const pipeline = this.client.pipeline()
      keys.forEach(key => pipeline.del(key))
      
      const results = await pipeline.exec()
      return results?.length || 0

    } catch (error) {
      console.error('Redis delete pattern error:', error)
      return 0
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const fullKey = this.config.keyPrefix + key

    try {
      await this.connect()
      if (!this.client) return false

      const exists = await this.client.exists(fullKey)
      return exists > 0

    } catch (error) {
      return false
    }
  }

  // Get remaining TTL
  async ttl(key: string): Promise<number> {
    const fullKey = this.config.keyPrefix + key

    try {
      await this.connect()
      if (!this.client) return -1

      return await this.client.ttl(fullKey)

    } catch (error) {
      return -1
    }
  }

  // Atomic increment
  async increment(key: string, amount = 1): Promise<number | null> {
    const fullKey = this.config.keyPrefix + key

    try {
      await this.connect()
      if (!this.client) return null

      return await this.client.incrby(fullKey, amount)

    } catch (error) {
      return null
    }
  }

  // Get multiple values
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return []

    try {
      await this.connect()
      if (!this.client) return keys.map(() => null)

      const fullKeys = keys.map(k => this.config.keyPrefix + k)
      const values = await this.client.mget(...fullKeys)

      return values.map(v => v ? CacheSerializer.deserialize<T>(v) : null)

    } catch (error) {
      return keys.map(() => null)
    }
  }

  // Set multiple values
  async mset(items: Record<string, any>, ttl?: number): Promise<boolean> {
    try {
      await this.connect()
      if (!this.client) return false

      const pipeline = this.client.pipeline()
      const finalTTL = ttl || this.config.defaultTTL

      Object.entries(items).forEach(([key, value]) => {
        const fullKey = this.config.keyPrefix + key
        const serialized = CacheSerializer.serialize(value)
        pipeline.setex(fullKey, finalTTL, serialized)
      })

      await pipeline.exec()
      return true

    } catch (error) {
      return false
    }
  }

  // Clear all cache
  async flush(): Promise<boolean> {
    try {
      await this.connect()
      if (!this.client) return false

      const keys = await this.client.keys(this.config.keyPrefix + '*')
      if (keys.length > 0) {
        await this.client.del(...keys)
      }

      return true

    } catch (error) {
      return false
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    connected: boolean
    keyCount: number
    memoryUsage: string
    uptime: number
  } | null> {
    try {
      await this.connect()
      if (!this.client) return null

      const info = await this.client.info('stats')
      const keyCount = await this.client.dbsize()
      const memory = await this.client.info('memory')

      // Parse info strings
      const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/)
      const memoryMatch = memory.match(/used_memory_human:([^\r\n]+)/)

      return {
        connected: this.isConnected,
        keyCount,
        memoryUsage: memoryMatch?.[1] || 'unknown',
        uptime: parseInt(uptimeMatch?.[1] || '0')
      }

    } catch (error) {
      return null
    }
  }

  // Disconnect from Redis
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = null
      this.isConnected = false
    }
  }
}

// Create singleton instance
let redisCache: RedisCache | null = null

export function getRedisCache(config?: CacheConfig): RedisCache {
  if (!redisCache) {
    redisCache = new RedisCache(config)
  }
  return redisCache
}

// Cache decorators for methods
export function Cacheable(options: {
  key: string | ((args: any[]) => string)
  ttl?: number
  condition?: (result: any) => boolean
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = getRedisCache()
      
      // Generate cache key
      const cacheKey = typeof options.key === 'function' 
        ? options.key(args)
        : options.key

      // Try to get from cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Cache if condition is met
      if (!options.condition || options.condition(result)) {
        await cache.set(cacheKey, result, options.ttl)
      }

      return result
    }

    return descriptor
  }
}

// Cache invalidation decorator
export function CacheEvict(options: {
  key?: string | ((args: any[]) => string)
  pattern?: string | ((args: any[]) => string)
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = getRedisCache()
      
      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Evict cache
      if (options.key) {
        const cacheKey = typeof options.key === 'function' 
          ? options.key(args)
          : options.key
        await cache.delete(cacheKey)
      }

      if (options.pattern) {
        const pattern = typeof options.pattern === 'function'
          ? options.pattern(args)
          : options.pattern
        await cache.deletePattern(pattern)
      }

      return result
    }

    return descriptor
  }
}