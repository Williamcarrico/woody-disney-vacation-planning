/**
 * Validated Firestore Service
 * 
 * This module provides a type-safe wrapper around Firestore operations
 * with runtime validation using Zod schemas.
 */

import { z, ZodError, ZodSchema } from 'zod'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
    serverTimestamp,
    writeBatch,
    onSnapshot,
    Unsubscribe,
    QueryConstraint,
    WhereFilterOp,
    OrderByDirection,
    setDoc,
    Timestamp,
} from 'firebase/firestore'
import { firestore } from './firebase.config'
import * as schemas from '@/lib/schemas/firebase-validation'

// Error class for validation failures
export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly errors: ZodError['errors'],
        public readonly collection?: string,
        public readonly documentId?: string
    ) {
        super(message)
        this.name = 'ValidationError'
    }
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const validatedCache = new Map<string, { data: unknown; timestamp: number; schema: string }>()

// Validation logging
const ENABLE_VALIDATION_LOGGING = process.env.NODE_ENV === 'development'

function logValidation(
    operation: string,
    collection: string,
    success: boolean,
    details?: unknown
) {
    if (ENABLE_VALIDATION_LOGGING) {
        console.log(`[VALIDATION] ${operation} - ${collection}`, {
            success,
            timestamp: new Date().toISOString(),
            ...(details && { details })
        })
    }
}

// Generic query options interface
export interface QueryOptions {
    limit?: number
    orderBy?: { field: string; direction: OrderByDirection }[]
    where?: { field: string; operator: WhereFilterOp; value: unknown }[]
    startAfter?: QueryDocumentSnapshot<DocumentData>
}

// Pagination interface
export interface PaginationResult<T> {
    data: T[]
    hasNextPage: boolean
    lastDoc?: QueryDocumentSnapshot<DocumentData>
    totalCount?: number
}

// Cache utilities with validation tracking
function getCacheKey(collection: string, id?: string, options?: QueryOptions): string {
    return `${collection}:${id || 'all'}:${JSON.stringify(options || {})}`
}

function getFromValidatedCache<T>(key: string, schemaName: string): T | null {
    const cached = validatedCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.schema === schemaName) {
        logValidation('CACHE_HIT', key, true, { schemaName })
        return cached.data as T
    }
    validatedCache.delete(key)
    return null
}

function setValidatedCache<T>(key: string, data: T, schemaName: string): void {
    validatedCache.set(key, { data, timestamp: Date.now(), schema: schemaName })
}

function clearValidatedCacheByPattern(pattern: string): void {
    for (const key of validatedCache.keys()) {
        if (key.includes(pattern)) {
            validatedCache.delete(key)
        }
    }
}

/**
 * Validates data against a Zod schema with detailed error reporting
 */
function validateData<T>(
    data: unknown,
    schema: ZodSchema<T>,
    context: { collection: string; operation: string; documentId?: string }
): T {
    try {
        const validated = schema.parse(data)
        logValidation(context.operation, context.collection, true, {
            documentId: context.documentId
        })
        return validated
    } catch (error) {
        if (error instanceof ZodError) {
            logValidation(context.operation, context.collection, false, {
                documentId: context.documentId,
                errors: error.errors
            })
            throw new ValidationError(
                `Validation failed for ${context.operation} in ${context.collection}`,
                error.errors,
                context.collection,
                context.documentId
            )
        }
        throw error
    }
}

/**
 * Safe parse with fallback for partial data
 */
function safeParseWithFallback<T>(
    data: unknown,
    schema: ZodSchema<T>,
    fallbackData?: Partial<T>
): { success: true; data: T } | { success: false; error: ZodError; partial?: Partial<T> } {
    const result = schema.safeParse(data)
    if (!result.success && fallbackData) {
        // Try to merge with fallback data
        const mergedResult = schema.safeParse({ ...fallbackData, ...data })
        if (mergedResult.success) {
            return mergedResult
        }
        return { success: false, error: result.error, partial: fallbackData }
    }
    return result
}

/**
 * Generic validated CRUD operations
 */
export class ValidatedFirestoreService {
    /**
     * Get a single document by ID with validation
     */
    static async getDocument<T>(
        collectionName: string,
        id: string,
        schema: ZodSchema<T>,
        options: { useCache?: boolean; allowPartial?: boolean } = {}
    ): Promise<T | null> {
        const { useCache = true, allowPartial = false } = options
        const cacheKey = getCacheKey(collectionName, id)
        const schemaName = schema._def.typeName || 'unknown'

        if (useCache) {
            const cached = getFromValidatedCache<T>(cacheKey, schemaName)
            if (cached) return cached
        }

        try {
            const docRef = doc(firestore, collectionName, id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const rawData = { id: docSnap.id, ...docSnap.data() }
                
                if (allowPartial) {
                    const result = safeParseWithFallback(rawData, schema)
                    if (result.success) {
                        if (useCache) setValidatedCache(cacheKey, result.data, schemaName)
                        return result.data
                    } else {
                        console.warn(`Partial validation failed for ${collectionName}/${id}`, result.error)
                        return null
                    }
                }

                const validatedData = validateData(rawData, schema, {
                    collection: collectionName,
                    operation: 'GET',
                    documentId: id
                })

                if (useCache) setValidatedCache(cacheKey, validatedData, schemaName)
                return validatedData
            }

            return null
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error
            }
            console.error(`Error getting document ${id} from ${collectionName}:`, error)
            throw new Error(`Failed to get ${collectionName} document`)
        }
    }

    /**
     * Get multiple documents with query options and validation
     */
    static async getDocuments<T>(
        collectionName: string,
        schema: ZodSchema<T>,
        options: QueryOptions & { useCache?: boolean; allowPartial?: boolean } = {}
    ): Promise<PaginationResult<T>> {
        const { useCache = true, allowPartial = false, ...queryOptions } = options
        const cacheKey = getCacheKey(collectionName, undefined, queryOptions)
        const schemaName = schema._def.typeName || 'unknown'

        if (useCache) {
            const cached = getFromValidatedCache<PaginationResult<T>>(cacheKey, schemaName)
            if (cached) return cached
        }

        try {
            const collectionRef = collection(firestore, collectionName)
            const constraints: QueryConstraint[] = []

            // Add where clauses
            if (queryOptions.where) {
                queryOptions.where.forEach(({ field, operator, value }) => {
                    constraints.push(where(field, operator, value))
                })
            }

            // Add order by clauses
            if (queryOptions.orderBy) {
                queryOptions.orderBy.forEach(({ field, direction }) => {
                    constraints.push(orderBy(field, direction))
                })
            }

            // Add pagination
            if (queryOptions.startAfter) {
                constraints.push(startAfter(queryOptions.startAfter))
            }

            if (queryOptions.limit) {
                constraints.push(limit(queryOptions.limit))
            }

            const q = query(collectionRef, ...constraints)
            const querySnapshot = await getDocs(q)

            const validatedData: T[] = []
            const validationErrors: Array<{ id: string; errors: ZodError['errors'] }> = []

            for (const docSnap of querySnapshot.docs) {
                const rawData = { id: docSnap.id, ...docSnap.data() }
                
                if (allowPartial) {
                    const result = safeParseWithFallback(rawData, schema)
                    if (result.success) {
                        validatedData.push(result.data)
                    } else {
                        validationErrors.push({ id: docSnap.id, errors: result.error.errors })
                    }
                } else {
                    try {
                        const validated = validateData(rawData, schema, {
                            collection: collectionName,
                            operation: 'GET_MULTIPLE',
                            documentId: docSnap.id
                        })
                        validatedData.push(validated)
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            validationErrors.push({ id: docSnap.id, errors: error.errors })
                        } else {
                            throw error
                        }
                    }
                }
            }

            if (validationErrors.length > 0 && !allowPartial) {
                console.error(`Validation errors in ${collectionName}:`, validationErrors)
                throw new ValidationError(
                    `Multiple validation errors in ${collectionName}`,
                    validationErrors.flatMap(e => e.errors),
                    collectionName
                )
            }

            const result: PaginationResult<T> = {
                data: validatedData,
                hasNextPage: querySnapshot.docs.length === (queryOptions.limit || 0),
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
            }

            if (useCache) setValidatedCache(cacheKey, result, schemaName)
            return result
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error
            }
            console.error(`Error getting documents from ${collectionName}:`, error)
            throw new Error(`Failed to get ${collectionName} documents`)
        }
    }

    /**
     * Create a new document with validation
     */
    static async createDocument<T>(
        collectionName: string,
        data: unknown,
        inputSchema: ZodSchema<T>,
        options: { returnDocument?: boolean } = {}
    ): Promise<string | T> {
        const { returnDocument = false } = options

        try {
            // Validate input data
            const validatedInput = validateData(data, inputSchema, {
                collection: collectionName,
                operation: 'CREATE_INPUT'
            })

            const collectionRef = collection(firestore, collectionName)
            const docData = {
                ...validatedInput,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            const docRef = await addDoc(collectionRef, docData)

            // Clear cache for this collection
            clearValidatedCacheByPattern(collectionName)
            logValidation('CREATE_SUCCESS', collectionName, true, { id: docRef.id })

            if (returnDocument) {
                // Fetch and validate the created document
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const createdData = { id: docSnap.id, ...docSnap.data() }
                    return createdData as T
                }
            }

            return docRef.id
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error
            }
            console.error(`Error creating document in ${collectionName}:`, error)
            throw new Error(`Failed to create ${collectionName} document`)
        }
    }

    /**
     * Update an existing document with validation
     */
    static async updateDocument<T>(
        collectionName: string,
        id: string,
        data: unknown,
        updateSchema: ZodSchema<Partial<T>>,
        options: { merge?: boolean } = {}
    ): Promise<void> {
        const { merge = true } = options

        try {
            // Validate update data
            const validatedUpdate = validateData(data, updateSchema, {
                collection: collectionName,
                operation: 'UPDATE_INPUT',
                documentId: id
            })

            const docRef = doc(firestore, collectionName, id)
            const updateData = {
                ...validatedUpdate,
                updatedAt: serverTimestamp()
            }

            if (merge) {
                await updateDoc(docRef, updateData)
            } else {
                await setDoc(docRef, updateData)
            }

            // Clear cache for this collection and document
            clearValidatedCacheByPattern(collectionName)
            logValidation('UPDATE_SUCCESS', collectionName, true, { id })
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error
            }
            console.error(`Error updating document ${id} in ${collectionName}:`, error)
            throw new Error(`Failed to update ${collectionName} document`)
        }
    }

    /**
     * Delete a document
     */
    static async deleteDocument(collectionName: string, id: string): Promise<void> {
        try {
            const docRef = doc(firestore, collectionName, id)
            await deleteDoc(docRef)

            // Clear cache for this collection
            clearValidatedCacheByPattern(collectionName)
            logValidation('DELETE_SUCCESS', collectionName, true, { id })
        } catch (error) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, error)
            throw new Error(`Failed to delete ${collectionName} document`)
        }
    }

    /**
     * Batch operations with validation
     */
    static async batchWrite(operations: Array<{
        type: 'create' | 'update' | 'delete'
        collection: string
        id?: string
        data?: unknown
        schema?: ZodSchema<any>
    }>): Promise<void> {
        try {
            const batch = writeBatch(firestore)
            const validationResults: Array<{ 
                collection: string; 
                operation: string; 
                success: boolean; 
                errors?: ZodError['errors'] 
            }> = []

            for (const op of operations) {
                if (op.type === 'create' && op.data && op.schema) {
                    try {
                        const validated = validateData(op.data, op.schema, {
                            collection: op.collection,
                            operation: 'BATCH_CREATE'
                        })
                        const docRef = doc(collection(firestore, op.collection))
                        const createData = {
                            ...validated,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        }
                        batch.set(docRef, createData)
                        validationResults.push({ 
                            collection: op.collection, 
                            operation: 'create', 
                            success: true 
                        })
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            validationResults.push({ 
                                collection: op.collection, 
                                operation: 'create', 
                                success: false, 
                                errors: error.errors 
                            })
                            throw error
                        }
                        throw error
                    }
                } else if (op.type === 'update' && op.id && op.data && op.schema) {
                    try {
                        const validated = validateData(op.data, op.schema, {
                            collection: op.collection,
                            operation: 'BATCH_UPDATE',
                            documentId: op.id
                        })
                        const docRef = doc(firestore, op.collection, op.id)
                        const updateData = {
                            ...validated,
                            updatedAt: serverTimestamp()
                        }
                        batch.update(docRef, updateData)
                        validationResults.push({ 
                            collection: op.collection, 
                            operation: 'update', 
                            success: true 
                        })
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            validationResults.push({ 
                                collection: op.collection, 
                                operation: 'update', 
                                success: false, 
                                errors: error.errors 
                            })
                            throw error
                        }
                        throw error
                    }
                } else if (op.type === 'delete' && op.id) {
                    const docRef = doc(firestore, op.collection, op.id)
                    batch.delete(docRef)
                    validationResults.push({ 
                        collection: op.collection, 
                        operation: 'delete', 
                        success: true 
                    })
                }
            }

            await batch.commit()

            // Clear cache for affected collections
            const affectedCollections = [...new Set(operations.map(op => op.collection))]
            affectedCollections.forEach(collectionName => {
                clearValidatedCacheByPattern(collectionName)
            })

            logValidation('BATCH_SUCCESS', 'multiple', true, { results: validationResults })
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error
            }
            console.error('Error in batch write:', error)
            throw new Error('Failed to execute batch operations')
        }
    }

    /**
     * Real-time listener with validation
     */
    static subscribeToDocument<T>(
        collectionName: string,
        id: string,
        schema: ZodSchema<T>,
        callback: (data: T | null, error?: ValidationError) => void
    ): Unsubscribe {
        const docRef = doc(firestore, collectionName, id)

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const rawData = { id: doc.id, ...doc.data() }
                try {
                    const validatedData = validateData(rawData, schema, {
                        collection: collectionName,
                        operation: 'REALTIME_GET',
                        documentId: id
                    })
                    callback(validatedData)
                } catch (error) {
                    if (error instanceof ValidationError) {
                        callback(null, error)
                    } else {
                        console.error(`Error in realtime validation for ${collectionName}/${id}:`, error)
                        callback(null)
                    }
                }
            } else {
                callback(null)
            }
        }, (error) => {
            console.error(`Error listening to document ${id} in ${collectionName}:`, error)
            callback(null)
        })
    }

    /**
     * Real-time collection listener with validation
     */
    static subscribeToCollection<T>(
        collectionName: string,
        schema: ZodSchema<T>,
        options: QueryOptions & { 
            onValidationError?: (errors: Array<{ id: string; errors: ZodError['errors'] }>) => void 
        } = {},
        callback: (data: T[]) => void
    ): Unsubscribe {
        const { onValidationError, ...queryOptions } = options
        const collectionRef = collection(firestore, collectionName)
        const constraints: QueryConstraint[] = []

        // Add constraints based on options
        if (queryOptions.where) {
            queryOptions.where.forEach(({ field, operator, value }) => {
                constraints.push(where(field, operator, value))
            })
        }

        if (queryOptions.orderBy) {
            queryOptions.orderBy.forEach(({ field, direction }) => {
                constraints.push(orderBy(field, direction))
            })
        }

        if (queryOptions.limit) {
            constraints.push(limit(queryOptions.limit))
        }

        const q = query(collectionRef, ...constraints)

        return onSnapshot(q, (querySnapshot) => {
            const validatedData: T[] = []
            const validationErrors: Array<{ id: string; errors: ZodError['errors'] }> = []

            querySnapshot.docs.forEach(doc => {
                const rawData = { id: doc.id, ...doc.data() }
                try {
                    const validated = validateData(rawData, schema, {
                        collection: collectionName,
                        operation: 'REALTIME_COLLECTION',
                        documentId: doc.id
                    })
                    validatedData.push(validated)
                } catch (error) {
                    if (error instanceof ValidationError) {
                        validationErrors.push({ id: doc.id, errors: error.errors })
                    }
                }
            })

            if (validationErrors.length > 0 && onValidationError) {
                onValidationError(validationErrors)
            }

            callback(validatedData)
        }, (error) => {
            console.error(`Error listening to collection ${collectionName}:`, error)
            callback([])
        })
    }
}

/**
 * Pre-configured service classes for each collection
 */
export class ValidatedUserService {
    static async getUser(id: string) {
        return ValidatedFirestoreService.getDocument('users', id, schemas.userSchema)
    }

    static async createUser(data: schemas.CreateUserInput) {
        return ValidatedFirestoreService.createDocument('users', data, schemas.createUserInputSchema)
    }

    static async updateUser(id: string, data: schemas.UpdateUserInput) {
        return ValidatedFirestoreService.updateDocument('users', id, data, schemas.updateUserInputSchema)
    }

    static subscribeToUser(id: string, callback: (user: schemas.User | null, error?: ValidationError) => void) {
        return ValidatedFirestoreService.subscribeToDocument('users', id, schemas.userSchema, callback)
    }
}

export class ValidatedVacationService {
    static async getVacation(id: string) {
        return ValidatedFirestoreService.getDocument('vacations', id, schemas.vacationSchema)
    }

    static async getVacations(userId: string, options?: QueryOptions) {
        return ValidatedFirestoreService.getDocuments('vacations', schemas.vacationSchema, {
            ...options,
            where: [{ field: 'userId', operator: '==', value: userId }, ...(options?.where || [])]
        })
    }

    static async createVacation(data: schemas.CreateVacationInput) {
        return ValidatedFirestoreService.createDocument('vacations', data, schemas.createVacationInputSchema)
    }

    static async updateVacation(id: string, data: Partial<schemas.CreateVacationInput>) {
        return ValidatedFirestoreService.updateDocument('vacations', id, data, schemas.createVacationInputSchema.partial())
    }

    static subscribeToVacations(
        userId: string, 
        callback: (vacations: schemas.Vacation[]) => void,
        onValidationError?: (errors: Array<{ id: string; errors: ZodError['errors'] }>) => void
    ) {
        return ValidatedFirestoreService.subscribeToCollection(
            'vacations',
            schemas.vacationSchema,
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                onValidationError
            },
            callback
        )
    }
}

export class ValidatedResortService {
    static async getResort(id: string) {
        return ValidatedFirestoreService.getDocument('resorts', id, schemas.resortSchema)
    }

    static async getResorts(options?: QueryOptions & { category?: string[] }) {
        const queryOptions = { ...options }
        if (options?.category && options.category.length > 0) {
            queryOptions.where = [
                ...(queryOptions.where || []),
                { field: 'category', operator: 'in', value: options.category }
            ]
        }
        return ValidatedFirestoreService.getDocuments('resorts', schemas.resortSchema, queryOptions)
    }

    static async createResort(data: schemas.CreateResortInput) {
        // Generate indexes before creating
        const enrichedData = {
            ...data,
            searchTerms: generateSearchTerms(data),
            areaIndex: data.location.toLowerCase().replace(/\s+/g, '_'),
            amenityIndex: data.amenities.map(a => a.toLowerCase().replace(/\s+/g, '_')),
            priceIndex: data.rates.min,
            ratingIndex: data.reviews.avgRating
        }
        return ValidatedFirestoreService.createDocument('resorts', enrichedData, schemas.resortSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true
        }))
    }

    static async updateResort(id: string, data: Partial<schemas.CreateResortInput>) {
        return ValidatedFirestoreService.updateDocument('resorts', id, data, schemas.createResortInputSchema.partial())
    }
}

// Helper function for resort search terms
function generateSearchTerms(resort: schemas.CreateResortInput): string[] {
    const terms = new Set<string>()
    
    // Add name variations
    terms.add(resort.name.toLowerCase())
    resort.name.toLowerCase().split(' ').forEach(word => {
        if (word.length > 2) terms.add(word)
    })
    
    // Add location terms
    terms.add(resort.location.toLowerCase())
    
    // Add type and category
    terms.add(resort.type.toLowerCase())
    terms.add(resort.category.toLowerCase())
    
    // Add amenities
    resort.amenities.forEach(amenity => {
        terms.add(amenity.toLowerCase())
    })
    
    // Add theme words
    resort.theme.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3) terms.add(word)
    })
    
    return Array.from(terms)
}

// Export all validated services
export {
    ValidatedItineraryService,
    ValidatedCalendarEventService,
    ValidatedUserLocationService,
    ValidatedGeofenceService
} from './validated-services-extended' 