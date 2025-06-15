import { getRedisCache, RedisCache } from './redis-client'
import { SmartCache } from '@/lib/firebase/firebase-performance'

// Cache strategy interface
export interface CacheStrategy {
  get<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T>
  invalidate(key: string): Promise<void>
  invalidatePattern(pattern: string): Promise<void>
}

export interface CacheOptions {
  ttl?: number
  useRedis?: boolean
  useMemory?: boolean
  compress?: boolean
  tags?: string[]
}

// Multi-tier cache implementation
export class MultiTierCache implements CacheStrategy {
  private memoryCache: SmartCache
  private redisCache: RedisCache

  constructor(private namespace: string) {
    this.memoryCache = new SmartCache(`${namespace}_memory`, {
      ttl: 60000, // 1 minute for memory
      maxSize: 100
    })
    this.redisCache = getRedisCache({
      keyPrefix: `${namespace}:`,
      defaultTTL: 300 // 5 minutes for Redis
    })
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl, useRedis = true, useMemory = true } = options

    // Try memory cache first
    if (useMemory) {
      try {
        const memoryResult = await this.memoryCache.get(key, async () => {
          // If not in memory, try Redis
          if (useRedis) {
            const redisResult = await this.redisCache.get<T>(key)
            if (redisResult !== null) {
              return redisResult
            }
          }
          // If not in Redis either, fetch
          return null as any
        }, { ttl: ttl ? ttl * 1000 : undefined })

        if (memoryResult !== null) {
          return memoryResult
        }
      } catch (error) {
        console.warn('Memory cache error:', error)
      }
    }

    // Try Redis if not in memory
    if (useRedis) {
      try {
        const redisResult = await this.redisCache.get<T>(key)
        if (redisResult !== null) {
          // Store in memory for faster access
          if (useMemory) {
            this.memoryCache.set(key, redisResult)
          }
          return redisResult
        }
      } catch (error) {
        console.warn('Redis cache error:', error)
      }
    }

    // Fetch fresh data
    const freshData = await fetcher()

    // Store in both caches
    if (useRedis) {
      await this.redisCache.set(key, freshData, ttl)
    }
    if (useMemory) {
      this.memoryCache.set(key, freshData)
    }

    return freshData
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.invalidate(key)
    await this.redisCache.delete(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    this.memoryCache.invalidatePattern(new RegExp(pattern))
    await this.redisCache.deletePattern(pattern)
  }
}

// Specific cache strategies for different data types
export class ParkDataCache extends MultiTierCache {
  constructor() {
    super('parks')
  }

  async getParkData(parkId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`park:${parkId}`, fetcher, {
      ttl: 3600, // 1 hour
      useRedis: true,
      useMemory: true
    })
  }

  async getParkHours(parkId: string, date: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`hours:${parkId}:${date}`, fetcher, {
      ttl: 1800, // 30 minutes
      useRedis: true,
      useMemory: true
    })
  }

  async invalidatePark(parkId: string): Promise<void> {
    await this.invalidatePattern(`park:${parkId}*`)
    await this.invalidatePattern(`hours:${parkId}*`)
  }
}

export class AttractionDataCache extends MultiTierCache {
  constructor() {
    super('attractions')
  }

  async getAttraction(attractionId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`attraction:${attractionId}`, fetcher, {
      ttl: 3600, // 1 hour
      useRedis: true,
      useMemory: true
    })
  }

  async getWaitTime(attractionId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`waittime:${attractionId}`, fetcher, {
      ttl: 300, // 5 minutes
      useRedis: true,
      useMemory: true
    })
  }

  async getWaitTimeHistory(
    attractionId: string,
    date: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    return this.get(`history:${attractionId}:${date}`, fetcher, {
      ttl: 86400, // 24 hours
      useRedis: true,
      useMemory: false // Don't cache large history in memory
    })
  }

  async invalidateWaitTimes(): Promise<void> {
    await this.invalidatePattern('waittime:*')
  }
}

export class DiningDataCache extends MultiTierCache {
  constructor() {
    super('dining')
  }

  async getRestaurant(restaurantId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`restaurant:${restaurantId}`, fetcher, {
      ttl: 7200, // 2 hours
      useRedis: true,
      useMemory: true
    })
  }

  async getAvailability(
    restaurantId: string,
    date: string,
    partySize: number,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const key = `availability:${restaurantId}:${date}:${partySize}`
    return this.get(key, fetcher, {
      ttl: 600, // 10 minutes
      useRedis: true,
      useMemory: true
    })
  }

  async getMenu(restaurantId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`menu:${restaurantId}`, fetcher, {
      ttl: 86400, // 24 hours
      useRedis: true,
      useMemory: false
    })
  }
}

export class UserDataCache extends MultiTierCache {
  constructor() {
    super('users')
  }

  async getUserPreferences(userId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`preferences:${userId}`, fetcher, {
      ttl: 3600, // 1 hour
      useRedis: true,
      useMemory: true
    })
  }

  async getVacation(vacationId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`vacation:${vacationId}`, fetcher, {
      ttl: 300, // 5 minutes
      useRedis: true,
      useMemory: true
    })
  }

  async getItinerary(itineraryId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get(`itinerary:${itineraryId}`, fetcher, {
      ttl: 300, // 5 minutes
      useRedis: true,
      useMemory: true
    })
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.invalidatePattern(`preferences:${userId}`)
    await this.invalidatePattern(`vacation:*`) // Invalidate all vacations for safety
  }
}

// Session cache for auth tokens
export class SessionCache {
  private cache: RedisCache

  constructor() {
    this.cache = getRedisCache({
      keyPrefix: 'session:',
      defaultTTL: 3600 // 1 hour default
    })
  }

  async getSession(sessionId: string): Promise<any> {
    return this.cache.get(sessionId)
  }

  async setSession(sessionId: string, data: any, ttl = 3600): Promise<void> {
    await this.cache.set(sessionId, data, ttl)
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.cache.delete(sessionId)
  }

  async extendSession(sessionId: string, ttl = 3600): Promise<void> {
    const data = await this.cache.get(sessionId)
    if (data) {
      await this.cache.set(sessionId, data, ttl)
    }
  }
}

// Rate limiting cache
export class RateLimitCache {
  private cache: RedisCache

  constructor() {
    this.cache = getRedisCache({
      keyPrefix: 'ratelimit:',
      defaultTTL: 60 // 1 minute default
    })
  }

  async checkLimit(
    key: string,
    limit: number,
    windowSeconds = 60
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const count = await this.cache.increment(key) || 0
    
    if (count === 1) {
      // First request, set TTL
      await this.cache.set(key, count, windowSeconds)
    }

    const ttl = await this.cache.ttl(key)
    const resetAt = Date.now() + (ttl * 1000)

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt
    }
  }
}

// Cache manager singleton
class CacheManager {
  private static instance: CacheManager
  
  public parks: ParkDataCache
  public attractions: AttractionDataCache
  public dining: DiningDataCache
  public users: UserDataCache
  public sessions: SessionCache
  public rateLimit: RateLimitCache

  private constructor() {
    this.parks = new ParkDataCache()
    this.attractions = new AttractionDataCache()
    this.dining = new DiningDataCache()
    this.users = new UserDataCache()
    this.sessions = new SessionCache()
    this.rateLimit = new RateLimitCache()
  }

  static getInstance(): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager()
    }
    return this.instance
  }

  // Global cache operations
  async warmUp(): Promise<void> {
    console.log('🔥 Warming up caches...')
    // Implement cache warming logic here
  }

  async getStats(): Promise<any> {
    const redis = getRedisCache()
    return redis.getStats()
  }

  async flush(): Promise<void> {
    console.log('🧹 Flushing all caches...')
    const redis = getRedisCache()
    await redis.flush()
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance()

// Helper function for API routes
export async function withCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    namespace?: 'parks' | 'attractions' | 'dining' | 'users'
  } = {}
): Promise<T> {
  const { namespace = 'parks', ttl = 300 } = options
  const cache = cacheManager[namespace]
  
  return cache.get(cacheKey, fetcher, { ttl })
}