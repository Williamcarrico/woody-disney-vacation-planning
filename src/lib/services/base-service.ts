/**
 * Base service class providing common patterns for data access
 * Implements repository pattern with caching, validation, and error handling
 */

import { z, ZodSchema } from 'zod'

export interface CacheConfig {
  ttl: number // Time to live in seconds
  keyPrefix: string
  enabled: boolean
}

export interface ServiceConfig<T> {
  name: string
  cache?: CacheConfig
  validation?: {
    create?: ZodSchema<T>
    update?: ZodSchema<Partial<T>>
    query?: ZodSchema
  }
}

export interface QueryOptions {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export abstract class BaseService<T extends { id: string }> {
  protected config: ServiceConfig<T>
  private cache = new Map<string, { data: any; expires: number }>()

  constructor(config: ServiceConfig<T>) {
    this.config = config
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract fetchAll(options?: QueryOptions): Promise<T[]>
  protected abstract fetchById(id: string): Promise<T | null>
  protected abstract createEntity(data: Omit<T, 'id'>): Promise<T>
  protected abstract updateEntity(id: string, data: Partial<T>): Promise<T>
  protected abstract deleteEntity(id: string): Promise<boolean>

  // Public interface methods with caching and validation
  async getAll(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    const cacheKey = this.getCacheKey('all', options)
    
    // Check cache first
    if (this.config.cache?.enabled) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    try {
      const data = await this.fetchAll(options)
      const result = this.paginateResults(data, options)
      
      // Cache the result
      if (this.config.cache?.enabled) {
        this.setCache(cacheKey, result)
      }

      return result
    } catch (error) {
      console.error(`${this.config.name} service error in getAll:`, error)
      throw new ServiceError(`Failed to fetch ${this.config.name.toLowerCase()} items`, 'FETCH_ERROR', error)
    }
  }

  async getById(id: string): Promise<T | null> {
    if (!id) {
      throw new ServiceError('ID is required', 'INVALID_INPUT')
    }

    const cacheKey = this.getCacheKey('item', { id })
    
    // Check cache first
    if (this.config.cache?.enabled) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    try {
      const data = await this.fetchById(id)
      
      // Cache the result
      if (this.config.cache?.enabled && data) {
        this.setCache(cacheKey, data)
      }

      return data
    } catch (error) {
      console.error(`${this.config.name} service error in getById:`, error)
      throw new ServiceError(`Failed to fetch ${this.config.name.toLowerCase()} with ID ${id}`, 'FETCH_ERROR', error)
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    // Validate input if schema provided
    if (this.config.validation?.create) {
      try {
        this.config.validation.create.parse(data)
      } catch (error) {
        throw new ServiceError('Validation failed', 'VALIDATION_ERROR', error)
      }
    }

    try {
      const result = await this.createEntity(data)
      
      // Invalidate relevant caches
      if (this.config.cache?.enabled) {
        this.invalidateCache('all')
      }

      return result
    } catch (error) {
      console.error(`${this.config.name} service error in create:`, error)
      throw new ServiceError(`Failed to create ${this.config.name.toLowerCase()}`, 'CREATE_ERROR', error)
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    if (!id) {
      throw new ServiceError('ID is required', 'INVALID_INPUT')
    }

    // Validate input if schema provided
    if (this.config.validation?.update) {
      try {
        this.config.validation.update.parse(data)
      } catch (error) {
        throw new ServiceError('Validation failed', 'VALIDATION_ERROR', error)
      }
    }

    try {
      const result = await this.updateEntity(id, data)
      
      // Invalidate relevant caches
      if (this.config.cache?.enabled) {
        this.invalidateCache('all')
        this.invalidateCache('item', { id })
      }

      return result
    } catch (error) {
      console.error(`${this.config.name} service error in update:`, error)
      throw new ServiceError(`Failed to update ${this.config.name.toLowerCase()} with ID ${id}`, 'UPDATE_ERROR', error)
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!id) {
      throw new ServiceError('ID is required', 'INVALID_INPUT')
    }

    try {
      const result = await this.deleteEntity(id)
      
      // Invalidate relevant caches
      if (this.config.cache?.enabled) {
        this.invalidateCache('all')
        this.invalidateCache('item', { id })
      }

      return result
    } catch (error) {
      console.error(`${this.config.name} service error in delete:`, error)
      throw new ServiceError(`Failed to delete ${this.config.name.toLowerCase()} with ID ${id}`, 'DELETE_ERROR', error)
    }
  }

  // Utility methods for filtering and searching
  protected filterData(data: T[], filters: Record<string, any>): T[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true
        
        const itemValue = this.getNestedValue(item, key)
        
        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }
        
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase())
        }
        
        return itemValue === value
      })
    })
  }

  protected sortData(data: T[], sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc'): T[] {
    if (!sortBy) return data

    return [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy)
      const bValue = this.getNestedValue(b, sortBy)
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  protected paginateResults(data: T[], options: QueryOptions): PaginatedResult<T> {
    const { limit = 20, offset = 0 } = options
    const total = data.length
    const page = Math.floor(offset / limit) + 1
    const pageSize = limit
    
    const paginatedData = data.slice(offset, offset + limit)
    
    return {
      data: paginatedData,
      pagination: {
        total,
        page,
        pageSize,
        hasNext: offset + limit < total,
        hasPrev: offset > 0
      }
    }
  }

  // Cache management
  private getCacheKey(type: string, params: any = {}): string {
    const prefix = this.config.cache?.keyPrefix || this.config.name
    const key = `${prefix}:${type}:${JSON.stringify(params)}`
    return key
  }

  private getFromCache<U>(key: string): U | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private setCache(key: string, data: any): void {
    if (!this.config.cache?.enabled) return
    
    const expires = Date.now() + (this.config.cache.ttl * 1000)
    this.cache.set(key, { data, expires })
  }

  private invalidateCache(type: string, params: any = {}): void {
    const pattern = this.getCacheKey(type, params)
    
    // For now, clear all cache entries that start with the pattern
    // In production, you might want a more sophisticated cache invalidation strategy
    for (const key of this.cache.keys()) {
      if (key.includes(pattern.split(':').slice(0, 2).join(':'))) {
        this.cache.delete(key)
      }
    }
  }

  // Utility for accessing nested object properties
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((value, key) => value?.[key], obj)
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Custom error class for service errors
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

// Default cache configurations
export const CacheConfigs = {
  short: { ttl: 300, keyPrefix: '', enabled: true }, // 5 minutes
  medium: { ttl: 1800, keyPrefix: '', enabled: true }, // 30 minutes
  long: { ttl: 3600, keyPrefix: '', enabled: true }, // 1 hour
  none: { ttl: 0, keyPrefix: '', enabled: false }
} as const