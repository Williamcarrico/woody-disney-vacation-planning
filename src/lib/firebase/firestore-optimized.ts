import {
  Firestore,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot,
  WriteBatch,
  Transaction,
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
  startAfter,
  startAt,
  endAt,
  endBefore,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  deleteField,
  QueryConstraint,
  WhereFilterOp,
  OrderByDirection,
  FieldValue,
  DocumentData,
  WithFieldValue,
  UpdateData,
  SetOptions
} from 'firebase/firestore'
import { getClientFirestore } from './client-optimized'
import { connectionManager } from './connection-manager'
import { performanceMonitor, SmartCache, BatchOperationManager } from './firebase-performance'
import { firebaseErrorHandler, withFirebaseErrorHandling } from './firebase-error-handler'

// Enhanced query options
export interface FirestoreQueryOptions {
  where?: Array<{
    field: string
    operator: WhereFilterOp
    value: any
  }>
  orderBy?: Array<{
    field: string
    direction?: OrderByDirection
  }>
  limit?: number
  limitToLast?: number
  startAfter?: DocumentSnapshot | any[]
  startAt?: DocumentSnapshot | any[]
  endAt?: DocumentSnapshot | any[]
  endBefore?: DocumentSnapshot | any[]
}

export interface PaginationOptions extends FirestoreQueryOptions {
  pageSize: number
  cursor?: DocumentSnapshot
}

export interface BatchOptions {
  batchSize?: number
  onProgress?: (processed: number, total: number) => void
}

// Optimized Firestore Service
export class FirestoreService {
  private static instance: FirestoreService | null = null
  private firestore: Firestore
  private cache: SmartCache
  private batchManager: BatchOperationManager
  private subscriptions = new Map<string, Unsubscribe>()

  private constructor() {
    this.firestore = getClientFirestore()
    this.cache = new SmartCache('firestore', {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000
    })
    this.batchManager = new BatchOperationManager()
  }

  static getInstance(): FirestoreService {
    if (!this.instance) {
      this.instance = new FirestoreService()
    }
    return this.instance
  }

  // Build query with constraints
  private buildQuery(
    collectionRef: CollectionReference,
    options: FirestoreQueryOptions
  ): any {
    const constraints: QueryConstraint[] = []

    // Where clauses
    if (options.where) {
      options.where.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator, value))
      })
    }

    // Order by clauses
    if (options.orderBy) {
      options.orderBy.forEach(({ field, direction = 'asc' }) => {
        constraints.push(orderBy(field, direction))
      })
    }

    // Pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter))
    } else if (options.startAt) {
      constraints.push(startAt(options.startAt))
    }

    if (options.endBefore) {
      constraints.push(endBefore(options.endBefore))
    } else if (options.endAt) {
      constraints.push(endAt(options.endAt))
    }

    // Limit
    if (options.limit) {
      constraints.push(limit(options.limit))
    } else if (options.limitToLast) {
      constraints.push(limitToLast(options.limitToLast))
    }

    return constraints.length > 0 
      ? query(collectionRef, ...constraints)
      : collectionRef
  }

  // Get single document with caching
  async getDocument<T extends DocumentData>(
    collectionName: string,
    documentId: string,
    options?: { useCache?: boolean; source?: 'default' | 'cache' | 'server' }
  ): Promise<T | null> {
    const { useCache = true, source = 'default' } = options || {}
    const cacheKey = `doc:${collectionName}:${documentId}`
    const trace = performanceMonitor.startTrace('firestore_get_doc', { 
      collection: collectionName,
      documentId 
    })

    try {
      if (useCache && source !== 'server') {
        const cached = await this.cache.get(
          cacheKey,
          async () => {
            const docRef = doc(this.firestore, collectionName, documentId)
            const snapshot = await getDoc(docRef)
            return snapshot.exists() 
              ? { id: snapshot.id, ...snapshot.data() } as T
              : null
          },
          { ttl: source === 'cache' ? 24 * 60 * 60 * 1000 : undefined } // 24h for cache-only
        )
        trace?.stop()
        return cached
      }

      // Direct fetch
      const docRef = doc(this.firestore, collectionName, documentId)
      const snapshot = await withFirebaseErrorHandling(
        () => getDoc(docRef),
        'firestore_get_doc',
        { metadata: { collectionName, documentId } }
      )

      trace?.stop()
      return snapshot.exists() 
        ? { id: snapshot.id, ...snapshot.data() } as T
        : null

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Get multiple documents with query
  async getDocuments<T extends DocumentData>(
    collectionName: string,
    options?: FirestoreQueryOptions & { useCache?: boolean }
  ): Promise<T[]> {
    const { useCache = true, ...queryOptions } = options || {}
    const cacheKey = `query:${collectionName}:${JSON.stringify(queryOptions)}`
    const trace = performanceMonitor.startTrace('firestore_get_docs', { 
      collection: collectionName 
    })

    try {
      if (useCache) {
        const cached = await this.cache.get(
          cacheKey,
          async () => {
            const collectionRef = collection(this.firestore, collectionName)
            const q = this.buildQuery(collectionRef, queryOptions)
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as T[]
          }
        )
        trace?.stop()
        return cached
      }

      // Direct query
      const collectionRef = collection(this.firestore, collectionName)
      const q = this.buildQuery(collectionRef, queryOptions)
      const snapshot = await withFirebaseErrorHandling(
        () => getDocs(q),
        'firestore_get_docs',
        { metadata: { collectionName, queryOptions } }
      )

      trace?.stop()
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Paginated query
  async getPaginated<T extends DocumentData>(
    collectionName: string,
    options: PaginationOptions
  ): Promise<{
    data: T[]
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextCursor?: DocumentSnapshot
    previousCursor?: DocumentSnapshot
    totalCount?: number
  }> {
    const trace = performanceMonitor.startTrace('firestore_paginated_query', {
      collection: collectionName,
      pageSize: options.pageSize
    })

    try {
      const { pageSize, cursor, ...queryOptions } = options
      
      // Build query with pagination
      if (cursor) {
        queryOptions.startAfter = cursor
      }
      queryOptions.limit = pageSize + 1 // Fetch one extra to check hasNextPage

      const docs = await this.getDocuments<T>(collectionName, {
        ...queryOptions,
        useCache: false // Don't cache paginated results
      })

      const hasNextPage = docs.length > pageSize
      const data = hasNextPage ? docs.slice(0, pageSize) : docs
      
      const result = {
        data,
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor: hasNextPage ? docs[pageSize - 1] as any : undefined,
        previousCursor: data.length > 0 ? data[0] as any : undefined
      }

      trace?.stop()
      return result

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Create document
  async createDocument<T extends DocumentData>(
    collectionName: string,
    data: WithFieldValue<T>,
    documentId?: string
  ): Promise<string> {
    const trace = performanceMonitor.startTrace('firestore_create_doc', {
      collection: collectionName,
      hasCustomId: !!documentId
    })

    try {
      const timestamp = serverTimestamp()
      const enhancedData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      }

      let docId: string

      if (documentId) {
        const docRef = doc(this.firestore, collectionName, documentId)
        await withFirebaseErrorHandling(
          () => setDoc(docRef, enhancedData),
          'firestore_create_doc',
          { metadata: { collectionName, documentId } }
        )
        docId = documentId
      } else {
        const collectionRef = collection(this.firestore, collectionName)
        const docRef = await withFirebaseErrorHandling(
          () => addDoc(collectionRef, enhancedData),
          'firestore_create_doc',
          { metadata: { collectionName } }
        )
        docId = docRef.id
      }

      // Invalidate collection cache
      this.cache.invalidatePattern(new RegExp(`^query:${collectionName}:`))
      
      trace?.stop()
      return docId

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Update document
  async updateDocument<T extends DocumentData>(
    collectionName: string,
    documentId: string,
    data: UpdateData<T>,
    options?: { merge?: boolean }
  ): Promise<void> {
    const trace = performanceMonitor.startTrace('firestore_update_doc', {
      collection: collectionName,
      documentId
    })

    try {
      const docRef = doc(this.firestore, collectionName, documentId)
      const enhancedData = {
        ...data,
        updatedAt: serverTimestamp()
      }

      if (options?.merge) {
        await withFirebaseErrorHandling(
          () => setDoc(docRef, enhancedData, { merge: true }),
          'firestore_update_doc',
          { metadata: { collectionName, documentId, merge: true } }
        )
      } else {
        await withFirebaseErrorHandling(
          () => updateDoc(docRef, enhancedData),
          'firestore_update_doc',
          { metadata: { collectionName, documentId } }
        )
      }

      // Invalidate caches
      this.cache.invalidate(`doc:${collectionName}:${documentId}`)
      this.cache.invalidatePattern(new RegExp(`^query:${collectionName}:`))
      
      trace?.stop()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Delete document
  async deleteDocument(
    collectionName: string,
    documentId: string
  ): Promise<void> {
    const trace = performanceMonitor.startTrace('firestore_delete_doc', {
      collection: collectionName,
      documentId
    })

    try {
      const docRef = doc(this.firestore, collectionName, documentId)
      
      await withFirebaseErrorHandling(
        () => deleteDoc(docRef),
        'firestore_delete_doc',
        { metadata: { collectionName, documentId } }
      )

      // Invalidate caches
      this.cache.invalidate(`doc:${collectionName}:${documentId}`)
      this.cache.invalidatePattern(new RegExp(`^query:${collectionName}:`))
      
      trace?.stop()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Batch write operations
  async batchWrite(
    operations: Array<{
      type: 'create' | 'update' | 'delete'
      collection: string
      documentId?: string
      data?: any
    }>,
    options?: BatchOptions
  ): Promise<void> {
    const { batchSize = 500, onProgress } = options || {}
    const trace = performanceMonitor.startTrace('firestore_batch_write', {
      operationCount: operations.length
    })

    try {
      // Process in chunks
      for (let i = 0; i < operations.length; i += batchSize) {
        const chunk = operations.slice(i, i + batchSize)
        const batch = writeBatch(this.firestore)

        for (const op of chunk) {
          const docRef = op.documentId
            ? doc(this.firestore, op.collection, op.documentId)
            : doc(collection(this.firestore, op.collection))

          switch (op.type) {
            case 'create':
              batch.set(docRef, {
                ...op.data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              })
              break
            case 'update':
              batch.update(docRef, {
                ...op.data,
                updatedAt: serverTimestamp()
              })
              break
            case 'delete':
              batch.delete(docRef)
              break
          }
        }

        await withFirebaseErrorHandling(
          () => batch.commit(),
          'firestore_batch_commit',
          { metadata: { chunkSize: chunk.length } }
        )

        if (onProgress) {
          onProgress(Math.min(i + batchSize, operations.length), operations.length)
        }
      }

      // Invalidate all affected collection caches
      const affectedCollections = new Set(operations.map(op => op.collection))
      affectedCollections.forEach(col => {
        this.cache.invalidatePattern(new RegExp(`^query:${col}:`))
      })

      trace?.stop()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Transaction
  async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const trace = performanceMonitor.startTrace('firestore_transaction')

    try {
      const result = await withFirebaseErrorHandling(
        () => runTransaction(this.firestore, updateFunction),
        'firestore_transaction'
      )

      trace?.stop()
      return result

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Real-time subscription
  subscribe<T extends DocumentData>(
    collectionName: string,
    documentIdOrOptions?: string | (FirestoreQueryOptions & {
      onNext: (data: T | T[]) => void
      onError?: (error: Error) => void
    }),
    callbacks?: {
      onNext: (data: T) => void
      onError?: (error: Error) => void
    }
  ): () => void {
    let unsubscribe: Unsubscribe

    if (typeof documentIdOrOptions === 'string') {
      // Subscribe to single document
      const documentId = documentIdOrOptions
      const subscriptionKey = `doc:${collectionName}:${documentId}`
      
      connectionManager.subscribe(subscriptionKey, () => {
        const docRef = doc(this.firestore, collectionName, documentId)
        return onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists() && callbacks) {
              callbacks.onNext({ id: snapshot.id, ...snapshot.data() } as T)
            }
          },
          (error) => {
            console.error(`Subscription error for ${collectionName}/${documentId}:`, error)
            callbacks?.onError?.(error)
          }
        )
      })

      unsubscribe = () => connectionManager.unsubscribe(subscriptionKey)
      
    } else if (documentIdOrOptions) {
      // Subscribe to collection query
      const { onNext, onError, ...queryOptions } = documentIdOrOptions
      const subscriptionKey = `query:${collectionName}:${JSON.stringify(queryOptions)}`
      
      connectionManager.subscribe(subscriptionKey, () => {
        const collectionRef = collection(this.firestore, collectionName)
        const q = this.buildQuery(collectionRef, queryOptions)
        
        return onSnapshot(
          q,
          (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as T[]
            onNext(docs)
          },
          (error) => {
            console.error(`Subscription error for ${collectionName} query:`, error)
            onError?.(error)
          }
        )
      })

      unsubscribe = () => connectionManager.unsubscribe(subscriptionKey)
    } else {
      throw new Error('Invalid subscription parameters')
    }

    return unsubscribe
  }

  // Field value helpers
  fieldValues = {
    serverTimestamp: () => serverTimestamp(),
    arrayUnion: (...elements: any[]) => arrayUnion(...elements),
    arrayRemove: (...elements: any[]) => arrayRemove(...elements),
    increment: (n: number) => increment(n),
    deleteField: () => deleteField()
  }

  // Cache management
  getCacheStats() {
    return this.cache.getStats()
  }

  clearCache() {
    this.cache.clear()
  }

  // Connection management
  getActiveSubscriptions() {
    return connectionManager.getStats()
  }
}

// Export singleton instance
export const firestoreService = FirestoreService.getInstance()

// Export convenience functions
export const fsGetDoc = <T extends DocumentData>(
  collection: string,
  documentId: string,
  options?: { useCache?: boolean }
) => firestoreService.getDocument<T>(collection, documentId, options)

export const fsGetDocs = <T extends DocumentData>(
  collection: string,
  options?: FirestoreQueryOptions & { useCache?: boolean }
) => firestoreService.getDocuments<T>(collection, options)

export const fsCreateDoc = <T extends DocumentData>(
  collection: string,
  data: WithFieldValue<T>,
  documentId?: string
) => firestoreService.createDocument(collection, data, documentId)

export const fsUpdateDoc = <T extends DocumentData>(
  collection: string,
  documentId: string,
  data: UpdateData<T>,
  options?: { merge?: boolean }
) => firestoreService.updateDocument(collection, documentId, data, options)

export const fsDeleteDoc = (collection: string, documentId: string) =>
  firestoreService.deleteDocument(collection, documentId)

export const fsSubscribe = <T extends DocumentData>(
  collection: string,
  documentIdOrOptions: any,
  callbacks?: any
) => firestoreService.subscribe<T>(collection, documentIdOrOptions, callbacks)

export const fsBatchWrite = (operations: any[], options?: BatchOptions) =>
  firestoreService.batchWrite(operations, options)

export const fsTransaction = <T>(updateFunction: (transaction: Transaction) => Promise<T>) =>
  firestoreService.runTransaction(updateFunction)