import { MultiTierCache, ParkDataCache, AttractionDataCache } from '@/lib/cache/cache-strategies'
import { getRedisCache } from '@/lib/cache/redis-client'

// Mock dependencies
jest.mock('@/lib/cache/redis-client', () => ({
  getRedisCache: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deletePattern: jest.fn(),
  })),
}))

jest.mock('@/lib/firebase/firebase-performance', () => ({
  SmartCache: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
  })),
}))

describe('MultiTierCache', () => {
  let cache: MultiTierCache
  let mockRedis: any
  let mockMemoryCache: any

  beforeEach(() => {
    jest.clearAllMocks()
    cache = new MultiTierCache('test')
    mockRedis = getRedisCache()
    mockMemoryCache = (cache as any).memoryCache
  })

  describe('get', () => {
    it('returns value from memory cache if available', async () => {
      const testData = { id: 1, name: 'Test' }
      mockMemoryCache.get.mockResolvedValue(testData)

      const result = await cache.get('key', async () => testData)

      expect(result).toEqual(testData)
      expect(mockMemoryCache.get).toHaveBeenCalledWith('key', expect.any(Function), { ttl: undefined })
      expect(mockRedis.get).not.toHaveBeenCalled()
    })

    it('returns value from Redis if not in memory', async () => {
      const testData = { id: 2, name: 'Redis Test' }
      mockMemoryCache.get.mockImplementation(async (key, fetcher) => {
        const result = await fetcher()
        return result
      })
      mockRedis.get.mockResolvedValue(testData)

      const result = await cache.get('key', async () => testData)

      expect(result).toEqual(testData)
      expect(mockRedis.get).toHaveBeenCalledWith('key')
    })

    it('fetches fresh data if not cached', async () => {
      const testData = { id: 3, name: 'Fresh Data' }
      const fetcher = jest.fn().mockResolvedValue(testData)
      
      mockMemoryCache.get.mockImplementation(async (key, fn) => {
        return null
      })
      mockRedis.get.mockResolvedValue(null)

      const result = await cache.get('key', fetcher)

      expect(result).toEqual(testData)
      expect(fetcher).toHaveBeenCalled()
      expect(mockRedis.set).toHaveBeenCalledWith('key', testData, undefined)
      expect(mockMemoryCache.set).toHaveBeenCalledWith('key', testData)
    })

    it('respects cache options', async () => {
      const testData = { id: 4, name: 'Options Test' }
      const fetcher = jest.fn().mockResolvedValue(testData)
      mockMemoryCache.get.mockResolvedValue(null)
      mockRedis.get.mockResolvedValue(null)

      await cache.get('key', fetcher, { 
        ttl: 3600, 
        useRedis: false, 
        useMemory: true 
      })

      expect(mockRedis.get).not.toHaveBeenCalled()
      expect(mockRedis.set).not.toHaveBeenCalled()
    })
  })

  describe('invalidate', () => {
    it('invalidates both memory and Redis cache', async () => {
      await cache.invalidate('test-key')

      expect(mockMemoryCache.invalidate).toHaveBeenCalledWith('test-key')
      expect(mockRedis.delete).toHaveBeenCalledWith('test-key')
    })
  })

  describe('invalidatePattern', () => {
    it('invalidates pattern in both caches', async () => {
      await cache.invalidatePattern('test-*')

      expect(mockMemoryCache.invalidatePattern).toHaveBeenCalledWith(/test-*/)
      expect(mockRedis.deletePattern).toHaveBeenCalledWith('test-*')
    })
  })
})

describe('ParkDataCache', () => {
  let cache: ParkDataCache
  let mockGet: jest.SpyInstance

  beforeEach(() => {
    cache = new ParkDataCache()
    mockGet = jest.spyOn(cache, 'get').mockImplementation(async (key, fetcher) => {
      return fetcher()
    })
  })

  it('caches park data with 1 hour TTL', async () => {
    const parkData = { id: 'mk', name: 'Magic Kingdom' }
    const fetcher = jest.fn().mockResolvedValue(parkData)

    const result = await cache.getParkData('mk', fetcher)

    expect(result).toEqual(parkData)
    expect(mockGet).toHaveBeenCalledWith('park:mk', fetcher, {
      ttl: 3600,
      useRedis: true,
      useMemory: true,
    })
  })

  it('caches park hours with 30 minute TTL', async () => {
    const hoursData = { open: '9:00', close: '22:00' }
    const fetcher = jest.fn().mockResolvedValue(hoursData)

    const result = await cache.getParkHours('mk', '2024-01-01', fetcher)

    expect(result).toEqual(hoursData)
    expect(mockGet).toHaveBeenCalledWith('hours:mk:2024-01-01', fetcher, {
      ttl: 1800,
      useRedis: true,
      useMemory: true,
    })
  })

  it('invalidates all park-related data', async () => {
    const invalidatePatternSpy = jest.spyOn(cache, 'invalidatePattern')
      .mockResolvedValue(undefined)

    await cache.invalidatePark('mk')

    expect(invalidatePatternSpy).toHaveBeenCalledWith('park:mk*')
    expect(invalidatePatternSpy).toHaveBeenCalledWith('hours:mk*')
  })
})

describe('AttractionDataCache', () => {
  let cache: AttractionDataCache
  let mockGet: jest.SpyInstance

  beforeEach(() => {
    cache = new AttractionDataCache()
    mockGet = jest.spyOn(cache, 'get').mockImplementation(async (key, fetcher) => {
      return fetcher()
    })
  })

  it('caches attraction data with 1 hour TTL', async () => {
    const attractionData = { id: 'btm', name: 'Big Thunder Mountain' }
    const fetcher = jest.fn().mockResolvedValue(attractionData)

    const result = await cache.getAttraction('btm', fetcher)

    expect(result).toEqual(attractionData)
    expect(mockGet).toHaveBeenCalledWith('attraction:btm', fetcher, {
      ttl: 3600,
      useRedis: true,
      useMemory: true,
    })
  })

  it('caches wait times with 5 minute TTL', async () => {
    const waitTimeData = { current: 45, status: 'operating' }
    const fetcher = jest.fn().mockResolvedValue(waitTimeData)

    const result = await cache.getWaitTime('btm', fetcher)

    expect(result).toEqual(waitTimeData)
    expect(mockGet).toHaveBeenCalledWith('waittime:btm', fetcher, {
      ttl: 300,
      useRedis: true,
      useMemory: true,
    })
  })

  it('caches wait time history without memory cache', async () => {
    const historyData = [{ time: '10:00', wait: 30 }, { time: '11:00', wait: 45 }]
    const fetcher = jest.fn().mockResolvedValue(historyData)

    const result = await cache.getWaitTimeHistory('btm', '2024-01-01', fetcher)

    expect(result).toEqual(historyData)
    expect(mockGet).toHaveBeenCalledWith('history:btm:2024-01-01', fetcher, {
      ttl: 86400,
      useRedis: true,
      useMemory: false, // Large data not cached in memory
    })
  })

  it('invalidates all wait time data', async () => {
    const invalidatePatternSpy = jest.spyOn(cache, 'invalidatePattern')
      .mockResolvedValue(undefined)

    await cache.invalidateWaitTimes()

    expect(invalidatePatternSpy).toHaveBeenCalledWith('waittime:*')
  })
})