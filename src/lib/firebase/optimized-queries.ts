/**
 * Optimized Firebase queries with cursor-based pagination and caching
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    DocumentSnapshot,
    QueryDocumentSnapshot,
    QueryConstraint,
    FirestoreError
} from 'firebase/firestore'
import { db } from './config'
import { cacheService } from '@/lib/cache/cache-service'

export interface PaginationOptions {
    limit: number
    cursor?: DocumentSnapshot
    cacheKey?: string
    cacheTTL?: number
}

export interface QueryResult<T> {
    data: T[]
    hasMore: boolean
    nextCursor?: DocumentSnapshot
    fromCache: boolean
}

export interface QueryFilters {
    [key: string]: any
}

/**
 * Enhanced query builder with automatic optimization
 */
export class OptimizedQueryBuilder<T> {
    private collectionName: string
    private constraints: QueryConstraint[] = []
    private cacheKey?: string
    private cacheTTL: number = 300 // 5 minutes default

    constructor(collectionName: string) {
        this.collectionName = collectionName
    }

    /**
     * Add where constraint
     */
    where(field: string, operator: any, value: any): this {
        this.constraints.push(where(field, operator, value))
        return this
    }

    /**
     * Add order by constraint
     */
    orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
        this.constraints.push(orderBy(field, direction))
        return this
    }

    /**
     * Set cache configuration
     */
    cache(key: string, ttl: number = 300): this {
        this.cacheKey = key
        this.cacheTTL = ttl
        return this
    }

    /**
     * Execute paginated query with cursor-based pagination
     */
    async paginate(options: PaginationOptions): Promise<QueryResult<T>> {
        try {
            // Generate cache key if not provided
            const finalCacheKey = options.cacheKey || this.cacheKey || 
                `query:${this.collectionName}:${JSON.stringify(this.constraints)}:${options.cursor?.id || 'start'}:${options.limit}`

            // Check cache first
            const cached = await cacheService.get<QueryResult<T>>(finalCacheKey)
            if (cached) {
                return { ...cached, fromCache: true }
            }

            // Build query
            const queryConstraints = [...this.constraints]
            
            // Add pagination constraints
            if (options.cursor) {
                queryConstraints.push(startAfter(options.cursor))
            }
            queryConstraints.push(limit(options.limit + 1)) // +1 to check if there are more

            const q = query(collection(db, this.collectionName), ...queryConstraints)
            const snapshot = await getDocs(q)

            // Process results
            const docs = snapshot.docs
            const hasMore = docs.length > options.limit
            const data = docs.slice(0, options.limit).map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[]

            const result: QueryResult<T> = {
                data,
                hasMore,
                nextCursor: hasMore ? docs[options.limit - 1] : undefined,
                fromCache: false
            }

            // Cache the result
            const cacheOptions = options.cacheTTL || this.cacheTTL
            await cacheService.set(finalCacheKey, result, cacheOptions)

            return result

        } catch (error) {
            console.error('[OptimizedQueryBuilder] Query failed:', error)
            throw new QueryError('Failed to execute query', error as FirestoreError)
        }
    }

    /**
     * Execute simple query with caching
     */
    async execute(): Promise<T[]> {
        try {
            const cacheKey = this.cacheKey || `query:${this.collectionName}:${JSON.stringify(this.constraints)}`
            
            // Check cache first
            const cached = await cacheService.get<T[]>(cacheKey)
            if (cached) {
                return cached
            }

            const q = query(collection(db, this.collectionName), ...this.constraints)
            const snapshot = await getDocs(q)
            
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[]

            // Cache the result
            await cacheService.set(cacheKey, data, this.cacheTTL)

            return data

        } catch (error) {
            console.error('[OptimizedQueryBuilder] Query failed:', error)
            throw new QueryError('Failed to execute query', error as FirestoreError)
        }
    }
}

/**
 * Custom error class for query errors
 */
export class QueryError extends Error {
    public readonly code: string
    public readonly originalError: FirestoreError

    constructor(message: string, originalError: FirestoreError) {
        super(message)
        this.name = 'QueryError'
        this.code = originalError.code
        this.originalError = originalError
    }
}

/**
 * Optimized vacation queries
 */
export class VacationQueries {
    /**
     * Get user vacations with optimized pagination
     */
    static async getUserVacations(
        userId: string, 
        options: PaginationOptions & { includeArchived?: boolean } = { limit: 20 }
    ): Promise<QueryResult<any>> {
        const builder = new OptimizedQueryBuilder('vacations')
            .where('userId', '==', userId)
            .cache(`user_vacations:${userId}:${options.includeArchived}`, 600) // 10 minutes

        if (!options.includeArchived) {
            builder.where('isArchived', '==', false)
        }

        builder.orderBy('startDate', 'desc')

        return builder.paginate(options)
    }

    /**
     * Get active vacations for a user
     */
    static async getActiveVacations(userId: string): Promise<any[]> {
        return new OptimizedQueryBuilder('vacations')
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .orderBy('startDate', 'asc')
            .cache(`active_vacations:${userId}`, 300)
            .execute()
    }
}

/**
 * Optimized attraction queries
 */
export class AttractionQueries {
    /**
     * Get attractions by park with filtering
     */
    static async getAttractionsByPark(
        parkId: string,
        filters: QueryFilters = {},
        options: PaginationOptions = { limit: 50 }
    ): Promise<QueryResult<any>> {
        const builder = new OptimizedQueryBuilder('attractions')
            .where('parkId', '==', parkId)
            .cache(`attractions:${parkId}:${JSON.stringify(filters)}`, 1800) // 30 minutes

        // Apply filters
        if (filters.type) {
            builder.where('type', '==', filters.type)
        }
        if (filters.thrillLevel) {
            builder.where('thrillLevel', '<=', filters.thrillLevel)
        }
        if (filters.lightningLane !== undefined) {
            builder.where('lightningLane', '==', filters.lightningLane)
        }

        // Default ordering
        builder.orderBy('mustDo', 'desc').orderBy('name', 'asc')

        return builder.paginate(options)
    }

    /**
     * Get must-do attractions for quick access
     */
    static async getMustDoAttractions(parkId?: string): Promise<any[]> {
        const builder = new OptimizedQueryBuilder('attractions')
            .where('mustDo', '==', true)
            .cache(`must_do_attractions:${parkId || 'all'}`, 3600) // 1 hour

        if (parkId) {
            builder.where('parkId', '==', parkId)
        }

        builder.orderBy('thrillLevel', 'desc')

        return builder.execute()
    }
}

/**
 * Optimized restaurant queries
 */
export class RestaurantQueries {
    /**
     * Get restaurants with advanced filtering
     */
    static async getRestaurants(
        filters: QueryFilters = {},
        options: PaginationOptions = { limit: 30 }
    ): Promise<QueryResult<any>> {
        const builder = new OptimizedQueryBuilder('restaurants')
            .cache(`restaurants:${JSON.stringify(filters)}`, 1800) // 30 minutes

        // Apply filters
        if (filters.parkId) {
            builder.where('parkId', '==', filters.parkId)
        }
        if (filters.location) {
            builder.where('location', '==', filters.location)
        }
        if (filters.diningPlan) {
            builder.where('diningPlan', '==', filters.diningPlan)
        }
        if (filters.priceRange) {
            builder.where('priceRange', '==', filters.priceRange)
        }

        // Default ordering by rating
        builder.orderBy('rating', 'desc').orderBy('name', 'asc')

        return builder.paginate(options)
    }

    /**
     * Get character dining restaurants
     */
    static async getCharacterDining(): Promise<any[]> {
        return new OptimizedQueryBuilder('restaurants')
            .where('characterDining', '==', true)
            .orderBy('rating', 'desc')
            .cache('character_dining_restaurants', 3600) // 1 hour
            .execute()
    }
}

/**
 * Batch query optimizer for multiple related queries
 */
export class BatchQueryOptimizer {
    private queries: Array<() => Promise<any>> = []
    private results: any[] = []

    /**
     * Add query to batch
     */
    addQuery<T>(queryFunction: () => Promise<T>): this {
        this.queries.push(queryFunction)
        return this
    }

    /**
     * Execute all queries in parallel with error isolation
     */
    async execute(): Promise<(any | Error)[]> {
        const promises = this.queries.map(async (queryFn, index) => {
            try {
                return await queryFn()
            } catch (error) {
                console.error(`[BatchQueryOptimizer] Query ${index} failed:`, error)
                return error
            }
        })

        this.results = await Promise.all(promises)
        return this.results
    }

    /**
     * Get successful results only
     */
    getSuccessfulResults(): any[] {
        return this.results.filter(result => !(result instanceof Error))
    }

    /**
     * Get failed queries
     */
    getFailedResults(): Error[] {
        return this.results.filter(result => result instanceof Error) as Error[]
    }
}

// Export convenience functions
export const createQuery = <T>(collectionName: string) => new OptimizedQueryBuilder<T>(collectionName)
export const createBatch = () => new BatchQueryOptimizer()