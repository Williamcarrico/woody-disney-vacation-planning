import Redis from 'ioredis'
import { CacheService } from './cache-service'

interface RedisCacheConfig {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
  defaultTTL?: number
  maxRetries?: number
  retryDelayOnFailover?: number
  enableReadyCheck?: boolean
  lazyConnect?: boolean
  cluster?: string[]
  enableCircuitBreaker?: boolean
  circuitBreakerThreshold?: number
  circuitBreakerTimeout?: number
}

interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  averageLatency: number
  circuitBreakerState: 'closed' | 'open' | 'half-open'
  connectionState: 'connected' | 'disconnected' | 'connecting'
}

interface CircuitBreakerState {
  failureCount: number
  lastFailureTime: number
  state: 'closed' | 'open' | 'half-open'
  threshold: number
  timeout: number
}

export class RedisCacheService extends CacheService {
  private redis: Redis | null = null
  private isConnected = false
  private config: RedisCacheConfig
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    averageLatency: 0,
    circuitBreakerState: 'closed',
    connectionState: 'disconnected'
  }
  private latencyTracker: number[] = []
  private circuitBreaker: CircuitBreakerState

  constructor(config: RedisCacheConfig = {}) {
    super({
      defaultTTL: config.defaultTTL || 300,
      keyPrefix: config.keyPrefix || 'disney_api',
      maxMemorySize: 0, // Unlimited for Redis
      compression: true
    })

    this.config = {
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: config.password || process.env.REDIS_PASSWORD,
      db: config.db || parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: config.keyPrefix || 'disney:',
      defaultTTL: config.defaultTTL || 300,
      maxRetries: config.maxRetries || 3,
      retryDelayOnFailover: config.retryDelayOnFailover || 100,
      enableReadyCheck: config.enableReadyCheck ?? true,
      lazyConnect: config.lazyConnect ?? true,
      cluster: config.cluster,
      enableCircuitBreaker: config.enableCircuitBreaker ?? true,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout || 60000
    }

    // Initialize circuit breaker
    this.circuitBreaker = {
      failureCount: 0,
      lastFailureTime: 0,
      state: 'closed',
      threshold: this.config.circuitBreakerThreshold!,
      timeout: this.config.circuitBreakerTimeout!
    }

    this.initializeRedis()
  }

  private async initializeRedis(): Promise<void> {
    this.metrics.connectionState = 'connecting'
    
    try {
      if (this.config.cluster && this.config.cluster.length > 0) {
        // Redis Cluster configuration
        this.redis = new Redis.Cluster(
          this.config.cluster.map(endpoint => {
            const [host, port] = endpoint.split(':')
            return { host, port: parseInt(port) }
          }),
          {
            redisOptions: {
              password: this.config.password,
              keyPrefix: this.config.keyPrefix,
              maxRetriesPerRequest: this.config.maxRetries,
              retryDelayOnFailover: this.config.retryDelayOnFailover,
              enableReadyCheck: this.config.enableReadyCheck,
              lazyConnect: this.config.lazyConnect
            }
          }
        )
      } else {
        // Single Redis instance
        this.redis = new Redis({
          host: this.config.host,
          port: this.config.port,
          password: this.config.password,
          db: this.config.db,
          keyPrefix: this.config.keyPrefix,
          maxRetriesPerRequest: this.config.maxRetries,
          retryDelayOnFailover: this.config.retryDelayOnFailover,
          enableReadyCheck: this.config.enableReadyCheck,
          lazyConnect: this.config.lazyConnect,
          keepAlive: 30000,
          connectTimeout: 10000,
          commandTimeout: 5000
        })
      }

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully')
        this.isConnected = true
        this.metrics.connectionState = 'connected'
        this.resetCircuitBreaker()
      })

      this.redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error)
        this.handleConnectionError(error)
      })

      this.redis.on('ready', () => {
        console.log('🚀 Redis ready for operations')
        this.isConnected = true
        this.metrics.connectionState = 'connected'
        this.resetCircuitBreaker()
      })

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...')
        this.isConnected = false
        this.metrics.connectionState = 'connecting'
      })

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed')
        this.isConnected = false
        this.metrics.connectionState = 'disconnected'
      })

    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      this.handleConnectionError(error)
    }
  }

  private handleConnectionError(error: any): void {
    this.metrics.errors++
    this.isConnected = false
    this.metrics.connectionState = 'disconnected'
    
    if (this.config.enableCircuitBreaker) {
      this.updateCircuitBreaker(false)
    }
  }

  private updateCircuitBreaker(success: boolean): void {
    const now = Date.now()
    
    if (success) {
      if (this.circuitBreaker.state === 'half-open') {
        this.resetCircuitBreaker()
      }
    } else {
      this.circuitBreaker.failureCount++
      this.circuitBreaker.lastFailureTime = now
      
      if (this.circuitBreaker.failureCount >= this.circuitBreaker.threshold) {
        this.circuitBreaker.state = 'open'
        this.metrics.circuitBreakerState = 'open'
        console.warn(`🚨 Redis circuit breaker opened after ${this.circuitBreaker.failureCount} failures`)
      }
    }
  }

  private resetCircuitBreaker(): void {
    this.circuitBreaker.failureCount = 0
    this.circuitBreaker.state = 'closed'
    this.metrics.circuitBreakerState = 'closed'
  }

  private canExecuteRedisOperation(): boolean {
    if (!this.config.enableCircuitBreaker) return true
    
    const now = Date.now()
    
    switch (this.circuitBreaker.state) {
      case 'closed':
        return true
      case 'open':
        if (now - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeout) {
          this.circuitBreaker.state = 'half-open'
          this.metrics.circuitBreakerState = 'half-open'
          return true
        }
        return false
      case 'half-open':
        return true
      default:
        return false
    }
  }

  private trackLatency(startTime: number): void {
    const latency = Date.now() - startTime
    this.latencyTracker.push(latency)
    
    // Keep only last 100 measurements for rolling average
    if (this.latencyTracker.length > 100) {
      this.latencyTracker.shift()
    }
    
    this.metrics.averageLatency = this.latencyTracker.reduce((a, b) => a + b, 0) / this.latencyTracker.length
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now()
    
    try {
      // Check circuit breaker before Redis operation
      if (this.redis && this.isConnected && this.canExecuteRedisOperation()) {
        const cached = await this.redis.get(key)
        this.trackLatency(startTime)
        this.updateCircuitBreaker(true)
        
        if (cached) {
          this.metrics.hits++
          const parsed = JSON.parse(cached)
          
          // Check if expired
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            await this.delete(key)
            this.metrics.misses++
            return null
          }
          
          return parsed.data as T
        }
      }
      
      // Fallback to memory cache
      const memoryResult = await super.get<T>(key)
      if (memoryResult) {
        this.metrics.hits++
      } else {
        this.metrics.misses++
      }
      
      return memoryResult
    } catch (error) {
      console.error('Redis get error:', error)
      this.metrics.errors++
      this.updateCircuitBreaker(false)
      
      // Fallback to memory cache
      return await super.get<T>(key)
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now()
    const effectiveTTL = ttl || this.config.defaultTTL || 300
    
    try {
      const data = {
        data: value,
        createdAt: Date.now(),
        expiresAt: Date.now() + (effectiveTTL * 1000)
      }
      
      // Set in Redis if connected and circuit breaker allows
      if (this.redis && this.isConnected && this.canExecuteRedisOperation()) {
        await this.redis.setex(key, effectiveTTL, JSON.stringify(data))
        this.trackLatency(startTime)
        this.updateCircuitBreaker(true)
        this.metrics.sets++
      }
      
      // Also set in memory cache as backup
      await super.set(key, value, ttl)
      
    } catch (error) {
      console.error('Redis set error:', error)
      this.metrics.errors++
      this.updateCircuitBreaker(false)
      
      // Fallback to memory cache only
      await super.set(key, value, ttl)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Delete from Redis if connected
      if (this.redis && this.isConnected) {
        await this.redis.del(key)
      }
      
      // Also delete from memory cache
      await super.delete(key)
      this.metrics.deletes++
      
    } catch (error) {
      console.error('Redis delete error:', error)
      this.metrics.errors++
      
      // Fallback to memory cache deletion
      await super.delete(key)
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear Redis keys with our prefix
      if (this.redis && this.isConnected) {
        const keys = await this.redis.keys(`${this.config.keyPrefix}*`)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
      
      // Also clear memory cache
      await super.clear()
      
    } catch (error) {
      console.error('Redis clear error:', error)
      this.metrics.errors++
      
      // Fallback to memory cache clear
      await super.clear()
    }
  }

  // Advanced Redis-specific methods

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.redis && this.isConnected) {
        const values = await this.redis.mget(...keys)
        return values.map(value => {
          if (!value) return null
          
          try {
            const parsed = JSON.parse(value)
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
              return null
            }
            return parsed.data as T
          } catch {
            return null
          }
        })
      }
      
      // Fallback to individual gets
      return Promise.all(keys.map(key => this.get<T>(key)))
    } catch (error) {
      console.error('Redis mget error:', error)
      this.metrics.errors++
      return keys.map(() => null)
    }
  }

  async mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        const pipeline = this.redis.pipeline()
        
        entries.forEach(({ key, value, ttl }) => {
          const effectiveTTL = ttl || this.config.defaultTTL || 300
          const data = {
            data: value,
            createdAt: Date.now(),
            expiresAt: Date.now() + (effectiveTTL * 1000)
          }
          pipeline.setex(key, effectiveTTL, JSON.stringify(data))
        })
        
        await pipeline.exec()
        this.metrics.sets += entries.length
      } else {
        // Fallback to individual sets
        await Promise.all(entries.map(({ key, value, ttl }) => this.set(key, value, ttl)))
      }
    } catch (error) {
      console.error('Redis mset error:', error)
      this.metrics.errors++
      
      // Fallback to individual sets
      await Promise.all(entries.map(({ key, value, ttl }) => this.set(key, value, ttl)))
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.expire(key, ttl)
      }
    } catch (error) {
      console.error('Redis expire error:', error)
      this.metrics.errors++
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.redis && this.isConnected) {
        const result = await this.redis.exists(key)
        return result === 1
      }
      
      // Fallback to checking memory cache
      const value = await this.get(key)
      return value !== null
    } catch (error) {
      console.error('Redis exists error:', error)
      this.metrics.errors++
      return false
    }
  }

  // Cache warming methods
  async warmCache(warmingData: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    console.log(`🔥 Warming cache with ${warmingData.length} entries...`)
    
    try {
      // Use batch operations for efficiency
      await this.mset(warmingData)
      console.log('✅ Cache warming completed successfully')
    } catch (error) {
      console.error('❌ Cache warming failed:', error)
      this.metrics.errors++
    }
  }

  // Cache analytics and monitoring
  getMetrics(): CacheMetrics & { hitRate: number; isConnected: boolean } {
    const total = this.metrics.hits + this.metrics.misses
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0
    
    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      isConnected: this.isConnected
    }
  }

  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      averageLatency: 0,
      circuitBreakerState: 'closed',
      connectionState: 'disconnected'
    }
    this.latencyTracker = []
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      if (!this.redis || !this.isConnected) {
        return {
          status: 'unhealthy',
          details: { error: 'Redis not connected' }
        }
      }
      
      const startTime = Date.now()
      await this.redis.ping()
      const latency = Date.now() - startTime
      
      return {
        status: 'healthy',
        details: {
          latency: `${latency}ms`,
          metrics: this.getMetrics(),
          config: {
            host: this.config.host,
            port: this.config.port,
            db: this.config.db,
            keyPrefix: this.config.keyPrefix
          }
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message }
      }
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit()
        this.isConnected = false
        console.log('✅ Redis connection closed gracefully')
      }
    } catch (error) {
      console.error('Error during Redis disconnect:', error)
    }
  }
}

// Singleton instance for the application
let redisCacheInstance: RedisCacheService | null = null

export function createRedisCacheService(config?: RedisCacheConfig): RedisCacheService {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCacheService(config)
  }
  return redisCacheInstance
}

export function getRedisCacheService(): RedisCacheService | null {
  return redisCacheInstance
}

// Cache warming utilities for Disney app
export async function warmDisneyCache(cache: RedisCacheService): Promise<void> {
  const warmingData = [
    // Popular attractions that rarely change
    { key: 'attractions:popular', value: [], ttl: 3600 }, // 1 hour
    { key: 'parks:all', value: [], ttl: 1800 }, // 30 minutes
    { key: 'restaurants:featured', value: [], ttl: 3600 }, // 1 hour
    { key: 'events:upcoming', value: [], ttl: 900 }, // 15 minutes
    
    // Wait time baselines
    { key: 'wait-times:baseline', value: {}, ttl: 600 }, // 10 minutes
    
    // Resort information (changes infrequently)
    { key: 'resorts:all', value: [], ttl: 7200 }, // 2 hours
    
    // Park hours (changes daily)
    { key: 'park-hours:today', value: {}, ttl: 3600 }, // 1 hour
    { key: 'park-hours:tomorrow', value: {}, ttl: 7200 }, // 2 hours
  ]
  
  await cache.warmCache(warmingData)
}

export default RedisCacheService