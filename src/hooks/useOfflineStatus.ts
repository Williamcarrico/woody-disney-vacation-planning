import { useState, useEffect, useCallback } from 'react'
import { offlineStorage } from '@/lib/utils/offline-storage'

interface OfflineStatusOptions {
    onOffline?: () => void
    onOnline?: () => void
    syncOnReconnect?: boolean
}

export interface OfflineStatusResult {
    isOnline: boolean
    isOfflineMode: boolean
    hasPendingChanges: boolean
    hasInitialized: boolean
    pendingChangeCount: number
    lastUpdated: Date | null
    toggleOfflineMode: () => void
    syncChanges: () => Promise<void>
}

/**
 * Hook to manage offline status and synchronization
 *
 * This hook provides:
 * 1. Current online/offline status
 * 2. Manual offline mode toggling
 * 3. Pending change status
 * 4. Sync functionality
 */
export function useOfflineStatus(options: OfflineStatusOptions = {}): OfflineStatusResult {
    const {
        onOffline,
        onOnline,
        syncOnReconnect = true
    } = options

    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
    const [isOfflineMode, setIsOfflineMode] = useState(false)
    const [hasPendingChanges, setHasPendingChanges] = useState(false)
    const [pendingChangeCount, setPendingChangeCount] = useState(0)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [hasInitialized, setHasInitialized] = useState(false)

    // Check for pending changes
    const checkPendingChanges = useCallback(async () => {
        try {
            // These would be actual functions in the offlineStorage utility
            const pending = await offlineStorage.hasPendingChanges()
            setHasPendingChanges(pending)
            setPendingChangeCount(pending ? 1 : 0) // In a real implementation, we would get the actual count
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Error checking pending changes:', error)
        }
    }, [])

    // Initialize the offline storage
    useEffect(() => {
        const initOfflineStorage = async () => {
            try {
                await offlineStorage.initialize()
                await checkPendingChanges()
                setHasInitialized(true)
            } catch (error) {
                console.error('Failed to initialize offline storage:', error)
            }
        }

        initOfflineStorage()
    }, [checkPendingChanges])

    // Toggle offline mode manually
    const toggleOfflineMode = useCallback(() => {
        setIsOfflineMode(prev => !prev)
    }, [])

    // Sync changes with the server
    const syncChanges = useCallback(async () => {
        if (!isOnline) {
            console.warn('Cannot sync changes while offline')
            return
        }

        try {
            await offlineStorage.syncPendingChanges()
            await checkPendingChanges()
        } catch (error) {
            console.error('Error syncing changes:', error)
        }
    }, [isOnline, checkPendingChanges])

    // Network status change handler
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            if (onOnline) onOnline()

            // Sync changes if enabled
            if (syncOnReconnect) {
                syncChanges()
            }
        }

        const handleOffline = () => {
            setIsOnline(false)
            if (onOffline) onOffline()
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [onOnline, onOffline, syncOnReconnect, syncChanges])

    // Periodically check for pending changes (every 30 seconds)
    useEffect(() => {
        const intervalId = setInterval(checkPendingChanges, 30000)
        return () => clearInterval(intervalId)
    }, [checkPendingChanges])

    return {
        isOnline,
        isOfflineMode,
        hasPendingChanges,
        hasInitialized,
        pendingChangeCount,
        lastUpdated,
        toggleOfflineMode,
        syncChanges
    }
}