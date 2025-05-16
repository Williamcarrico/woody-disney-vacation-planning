/**
 * Offline Storage Utility
 *
 * This utility provides functionality for offline data storage and synchronization
 * using IndexedDB and the Cache API. It allows the application to:
 *
 * 1. Store and retrieve user data when offline
 * 2. Synchronize changes when connectivity is restored
 * 3. Cache essential application data and assets
 * 4. Manage the local cache lifecycle
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { v4 as uuidv4 } from 'uuid'
import { getAuth } from 'firebase/auth'
import { firestore } from '@/lib/firebase/firebase.config'
import { doc, setDoc, updateDoc, deleteDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'

// Define a Record type for structured data
type DocumentData = Record<string, unknown>

// IndexedDB schema
interface OfflineDBSchema extends DBSchema {
    pendingChanges: {
        key: string
        value: {
            id: string
            operation: 'create' | 'update' | 'delete'
            collection: string
            documentId: string
            data?: DocumentData
            timestamp: number
            userId: string
            syncStatus: 'pending' | 'syncing' | 'error'
            errorMessage?: string
            retryCount: number
        }
    }
    cachedData: {
        key: string
        value: {
            id: string
            collection: string
            data: DocumentData
            timestamp: number
            expiresAt?: number
        }
    }
    userPreferences: {
        key: string
        value: {
            userId: string
            preferences: DocumentData
        }
    }
}

// Types
type OfflineDataType = 'itinerary' | 'vacation' | 'party' | 'messages' | 'locations' | 'polls'

interface SyncOptions {
    maxRetries?: number
    retryDelay?: number
    forceSync?: boolean
}

class OfflineStorageManager {
    private db: IDBPDatabase<OfflineDBSchema> | null = null
    private initialized = false
    private syncInProgress = false
    private networkStatusListenerAdded = false
    private userId: string | null = null

    // Singleton pattern
    private static instance: OfflineStorageManager

    private constructor() {
        // Initialize will be called separately
    }

    public static getInstance(): OfflineStorageManager {
        if (!OfflineStorageManager.instance) {
            OfflineStorageManager.instance = new OfflineStorageManager()
        }
        return OfflineStorageManager.instance
    }

    /**
     * Initialize the offline storage system
     */
    public async initialize(): Promise<void> {
        if (this.initialized) return

        try {
            this.db = await openDB<OfflineDBSchema>('disney-vacation-planner', 1, {
                upgrade(db) {
                    // Create stores
                    if (!db.objectStoreNames.contains('pendingChanges')) {
                        db.createObjectStore('pendingChanges', { keyPath: 'id' })
                    }

                    if (!db.objectStoreNames.contains('cachedData')) {
                        const store = db.createObjectStore('cachedData', { keyPath: 'id' })
                        // Add indices for efficient querying
                        // @ts-expect-error - Type definitions in idb library don't match actual usage
                        store.createIndex('by-collection', 'collection')
                        // @ts-expect-error - Type definitions in idb library don't match actual usage
                        store.createIndex('by-expiry', 'expiresAt')
                    }

                    if (!db.objectStoreNames.contains('userPreferences')) {
                        db.createObjectStore('userPreferences', { keyPath: 'userId' })
                    }
                }
            })

            // Setup network status listener if not already added
            if (!this.networkStatusListenerAdded) {
                window.addEventListener('online', this.handleNetworkChange.bind(this))
                window.addEventListener('offline', this.handleNetworkChange.bind(this))
                this.networkStatusListenerAdded = true
            }

            // Get current user
            const auth = getAuth()
            this.userId = auth.currentUser?.uid || null

            // Listen for auth state changes
            auth.onAuthStateChanged((user) => {
                this.userId = user?.uid || null
            })

            this.initialized = true
            console.log('Offline storage initialized')

            // Initial sync attempt if online
            if (navigator.onLine) {
                this.syncPendingChanges()
            }
        } catch (error) {
            console.error('Failed to initialize offline storage:', error)
            throw error
        }
    }

    /**
     * Save data for offline use
     * @param collection Firestore collection name
     * @param documentId Document ID
     * @param data Data to save
     * @param operation Operation type
     */
    public async saveData(
        collection: string,
        documentId: string,
        data: DocumentData,
        operation: 'create' | 'update' | 'delete' = 'update'
    ): Promise<void> {
        await this.ensureInitialized()

        if (!this.userId) {
            throw new Error('User not authenticated')
        }

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        // Save to IndexedDB for offline use
        try {
            // Store the change in pending changes
            const changeId = uuidv4()
            await this.db.add('pendingChanges', {
                id: changeId,
                operation,
                collection,
                documentId,
                data: operation !== 'delete' ? data : undefined,
                timestamp: Date.now(),
                userId: this.userId,
                syncStatus: 'pending',
                retryCount: 0
            })

            // If it's not a delete operation, also update the cache
            if (operation !== 'delete') {
                await this.updateCache(collection, documentId, data)
            } else {
                // If it's a delete, remove from cache
                await this.removeFromCache(collection, documentId)
            }

            // Try to sync immediately if online
            if (navigator.onLine) {
                this.syncPendingChanges()
            }
        } catch (error) {
            console.error('Error saving offline data:', error)
            throw error
        }
    }

    /**
     * Get data from the cache
     * @param collection Firestore collection name
     * @param documentId Document ID or query parameters
     */
    public async getData(collection: string, documentId?: string): Promise<DocumentData | DocumentData[] | null> {
        await this.ensureInitialized()

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            if (documentId) {
                // Get a specific document
                const cacheKey = `${collection}/${documentId}`
                const cachedItem = await this.db.get('cachedData', cacheKey)

                if (cachedItem) {
                    return cachedItem.data
                }

                return null
            } else {
                // Get all documents in a collection
                const tx = this.db.transaction('cachedData', 'readonly')
                // @ts-expect-error - Type definitions in idb library don't match actual usage
                const index = tx.store.index('by-collection')
                const items = await index.getAll(IDBKeyRange.only(collection))

                return items.map(item => item.data)
            }
        } catch (error) {
            console.error('Error retrieving cached data:', error)
            return null
        }
    }

    /**
     * Update the local cache with data
     * @param collection Collection name
     * @param documentId Document ID
     * @param data Data to cache
     * @param expiryTime Optional expiry time in milliseconds
     */
    public async updateCache(
        collection: string,
        documentId: string,
        data: DocumentData,
        expiryTime?: number
    ): Promise<void> {
        await this.ensureInitialized()

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            const cacheKey = `${collection}/${documentId}`
            const expiresAt = expiryTime ? Date.now() + expiryTime : undefined

            await this.db.put('cachedData', {
                id: cacheKey,
                collection,
                data,
                timestamp: Date.now(),
                expiresAt
            })
        } catch (error) {
            console.error('Error updating cache:', error)
            throw error
        }
    }

    /**
     * Remove an item from the cache
     * @param collection Collection name
     * @param documentId Document ID
     */
    private async removeFromCache(collection: string, documentId: string): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            const cacheKey = `${collection}/${documentId}`
            await this.db.delete('cachedData', cacheKey)
        } catch (error) {
            console.error('Error removing from cache:', error)
        }
    }

    /**
     * Save user preferences locally
     * @param preferences User preferences to save
     */
    public async saveUserPreferences(preferences: DocumentData): Promise<void> {
        await this.ensureInitialized()

        if (!this.userId) {
            throw new Error('User not authenticated')
        }

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            await this.db.put('userPreferences', {
                userId: this.userId,
                preferences
            })
        } catch (error) {
            console.error('Error saving user preferences:', error)
            throw error
        }
    }

    /**
     * Get user preferences
     */
    public async getUserPreferences(): Promise<DocumentData | null> {
        await this.ensureInitialized()

        if (!this.userId) {
            return null
        }

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            const preferences = await this.db.get('userPreferences', this.userId)
            return preferences?.preferences || null
        } catch (error) {
            console.error('Error getting user preferences:', error)
            return null
        }
    }

    /**
     * Synchronize pending changes with Firestore
     * @param options Sync options
     */
    public async syncPendingChanges(options: SyncOptions = {}): Promise<void> {
        const {
            maxRetries = 3,
            retryDelay = 5000,
            forceSync = false
        } = options

        await this.ensureInitialized()

        // Don't sync if offline or sync already in progress
        if ((!navigator.onLine || this.syncInProgress) && !forceSync) {
            return
        }

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            this.syncInProgress = true

            // Get all pending changes
            const tx = this.db.transaction('pendingChanges', 'readonly')
            const pendingChanges = await tx.store.getAll()

            // Sort by timestamp (oldest first)
            pendingChanges.sort((a, b) => a.timestamp - b.timestamp)

            for (const change of pendingChanges) {
                // Skip if already syncing or retry count exceeds max
                if ((change.syncStatus === 'syncing' || change.retryCount >= maxRetries) && !forceSync) {
                    continue
                }

                await this.processChange(change, retryDelay)
            }
        } finally {
            this.syncInProgress = false
        }
    }

    /**
     * Process a single pending change
     * @param change The change to process
     * @param retryDelay Delay before retrying on error
     */
    private async processChange(
        change: OfflineDBSchema['pendingChanges']['value'],
        retryDelay: number
    ): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            // Mark as syncing
            await this.db.put('pendingChanges', {
                ...change,
                syncStatus: 'syncing'
            })

            await this.performFirestoreOperation(change)

            // Remove from pending changes if successful
            await this.db.delete('pendingChanges', change.id)
        } catch (error) {
            console.error(`Error syncing change ${change.id}:`, error)

            // Update the retry count and status
            await this.db.put('pendingChanges', {
                ...change,
                syncStatus: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                retryCount: change.retryCount + 1
            })

            // Wait before continuing with next change
            await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
    }

    /**
     * Perform the actual Firestore operation
     * @param change The change to apply to Firestore
     */
    private async performFirestoreOperation(
        change: OfflineDBSchema['pendingChanges']['value']
    ): Promise<void> {
        switch (change.operation) {
            case 'create':
                await setDoc(doc(firestore, change.collection, change.documentId), {
                    ...change.data,
                    updatedAt: serverTimestamp()
                })
                break

            case 'update':
                await updateDoc(doc(firestore, change.collection, change.documentId), {
                    ...change.data,
                    updatedAt: serverTimestamp()
                })
                break

            case 'delete':
                await deleteDoc(doc(firestore, change.collection, change.documentId))
                break
        }
    }

    /**
     * Check if there are pending changes to sync
     */
    public async hasPendingChanges(): Promise<boolean> {
        await this.ensureInitialized()

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        const count = await this.db.count('pendingChanges')
        return count > 0
    }

    /**
     * Clean up expired cache entries
     */
    public async cleanupExpiredCache(): Promise<void> {
        await this.ensureInitialized()

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        const now = Date.now()

        try {
            const tx = this.db.transaction('cachedData', 'readonly')
            // @ts-expect-error - Type definitions in idb library don't match actual usage
            const index = tx.store.index('by-expiry')
            const expiredItems = await index.getAll(IDBKeyRange.upperBound(now))

            for (const item of expiredItems) {
                await this.db.delete('cachedData', item.id)
            }
        } catch (error) {
            console.error('Error cleaning up expired cache:', error)
        }
    }

    /**
     * Handle network status change
     */
    private async handleNetworkChange(event: Event): Promise<void> {
        if (event.type === 'online') {
            console.log('Network is back online, syncing pending changes...')
            await this.syncPendingChanges()
        } else {
            console.log('Network is offline, sync paused')
        }
    }

    /**
     * Ensure the manager is initialized
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize()
        }
    }

    /**
     * Get configuration for a data type
     * @param type Data type to cache
     * @param vacationId Optional vacation ID for scoped data
     */
    private getDataTypeConfig(type: OfflineDataType, vacationId?: string): { path: string, expiryTime: number } {
        switch (type) {
            case 'itinerary':
                if (!vacationId) throw new Error('Vacation ID required for itinerary')
                return {
                    path: `vacations/${vacationId}/itinerary`,
                    expiryTime: 24 * 60 * 60 * 1000 // 24 hours
                }
            case 'vacation':
                return {
                    path: 'vacations',
                    expiryTime: 7 * 24 * 60 * 60 * 1000 // 7 days
                }
            case 'party':
                if (!vacationId) throw new Error('Vacation ID required for party')
                return {
                    path: `vacations/${vacationId}/members`,
                    expiryTime: 24 * 60 * 60 * 1000 // 24 hours
                }
            case 'messages':
                if (!vacationId) throw new Error('Vacation ID required for messages')
                return {
                    path: `vacations/${vacationId}/messages`,
                    expiryTime: 6 * 60 * 60 * 1000 // 6 hours
                }
            case 'locations':
                if (!vacationId) throw new Error('Vacation ID required for locations')
                return {
                    path: `vacations/${vacationId}/locationUpdates`,
                    expiryTime: 30 * 60 * 1000 // 30 minutes
                }
            case 'polls':
                if (!vacationId) throw new Error('Vacation ID required for polls')
                return {
                    path: `vacations/${vacationId}/polls`,
                    expiryTime: 12 * 60 * 60 * 1000 // 12 hours
                }
            default:
                throw new Error(`Unsupported data type: ${type}`)
        }
    }

    /**
     * Cache specific data type for offline use
     * @param type Data type to cache
     * @param vacationId Optional vacation ID for scoped data
     * @param forceRefresh Force refresh from server
     */
    public async cacheDataForOffline(
        type: OfflineDataType,
        vacationId?: string,
        forceRefresh = false
    ): Promise<void> {
        await this.ensureInitialized()

        if (!this.userId) {
            throw new Error('User not authenticated')
        }

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            const { path, expiryTime } = this.getDataTypeConfig(type, vacationId)

            // Check if refresh needed
            if (!forceRefresh) {
                const cachedData = await this.getData(path)
                if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
                    return
                }
            }

            // Fetch and cache data
            const querySnapshot = await getDocs(collection(firestore, path))
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Cache each document
            for (const doc of docs) {
                await this.updateCache(path, doc.id, doc as DocumentData, expiryTime)
            }

            console.log(`Cached ${docs.length} ${type} documents for offline use`)
        } catch (error) {
            console.error(`Error caching ${type} for offline use:`, error)
            throw error
        }
    }

    /**
     * Clear all cached data
     */
    public async clearAllCache(): Promise<void> {
        await this.ensureInitialized()

        if (!this.db) {
            throw new Error('Database not initialized')
        }

        try {
            const tx = this.db.transaction('cachedData', 'readwrite')
            await tx.store.clear()
            await tx.done

            console.log('All cached data cleared')
        } catch (error) {
            console.error('Error clearing cached data:', error)
            throw error
        }
    }
}

// Export singleton instance
export const offlineStorage = OfflineStorageManager.getInstance()