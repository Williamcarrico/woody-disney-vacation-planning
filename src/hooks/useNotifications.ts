import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Notification } from '@/types/shared'

// Define and export the hook's return type
export interface UseNotificationsReturn {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
    hasMore: boolean
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    loadMore: () => void
}

const NOTIFICATIONS_PER_PAGE = 20
const MAX_CACHED_NOTIFICATIONS = 100

export function useNotifications(): UseNotificationsReturn {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
    
    // Use a Map for O(1) lookups and LRU cache implementation
    const notificationsCache = useRef(new Map<string, Notification>())
    const unsubscribeRef = useRef<(() => void) | null>(null)

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length

    // LRU cache management
    const addToCache = useCallback((notification: Notification) => {
        const cache = notificationsCache.current
        
        // If already exists, delete it first (to update position)
        if (cache.has(notification.id)) {
            cache.delete(notification.id)
        }
        
        // Add to end (most recent)
        cache.set(notification.id, notification)
        
        // Maintain max size
        if (cache.size > MAX_CACHED_NOTIFICATIONS) {
            const firstKey = cache.keys().next().value
            if (firstKey) cache.delete(firstKey)
        }
    }, [])

    const loadNotifications = useCallback((isLoadMore = false) => {
        if (!user?.uid) {
            setIsLoading(false)
            return
        }

        // Clean up previous subscription
        if (unsubscribeRef.current && !isLoadMore) {
            unsubscribeRef.current()
        }

        const notificationsRef = collection(db, 'notifications')
        let q = query(
            notificationsRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(NOTIFICATIONS_PER_PAGE)
        )

        if (isLoadMore && lastDoc) {
            q = query(q, startAfter(lastDoc))
        }

        unsubscribeRef.current = onSnapshot(
            q,
            (snapshot) => {
                const newNotifications: Notification[] = []
                let lastDocSnapshot: QueryDocumentSnapshot<DocumentData> | null = null

                snapshot.docs.forEach((doc) => {
                    const notification = {
                        id: doc.id,
                        ...doc.data()
                    } as Notification
                    
                    newNotifications.push(notification)
                    addToCache(notification)
                    lastDocSnapshot = doc
                })

                if (isLoadMore) {
                    // Append to existing notifications
                    setNotifications(prev => {
                        const existingIds = new Set(prev.map(n => n.id))
                        const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id))
                        return [...prev, ...uniqueNew]
                    })
                } else {
                    // Replace notifications (initial load or refresh)
                    setNotifications(newNotifications)
                }

                setLastDoc(lastDocSnapshot)
                setHasMore(newNotifications.length === NOTIFICATIONS_PER_PAGE)
                setIsLoading(false)
                setError(null)
            },
            (err) => {
                console.error('Error fetching notifications:', err)
                setError('Failed to load notifications')
                setIsLoading(false)
            }
        )
    }, [user?.uid, lastDoc, addToCache])

    useEffect(() => {
        loadNotifications(false)

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
            }
        }
    }, [user?.uid]) // Only depend on user ID, not loadNotifications

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            loadNotifications(true)
        }
    }, [isLoading, hasMore, loadNotifications])

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!user?.uid) return

        try {
            const notificationRef = doc(db, 'notifications', notificationId)
            await updateDoc(notificationRef, {
                read: true
            })

            // Update cache
            const cached = notificationsCache.current.get(notificationId)
            if (cached) {
                cached.read = true
                addToCache(cached)
            }

            // Update local state
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            )
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }, [user?.uid, addToCache])

    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return

        try {
            const unreadNotifications = notifications.filter(n => !n.read)
            const updatePromises = unreadNotifications.map(notification => {
                const notificationRef = doc(db, 'notifications', notification.id)
                
                // Update cache
                const cached = notificationsCache.current.get(notification.id)
                if (cached) {
                    cached.read = true
                    addToCache(cached)
                }
                
                return updateDoc(notificationRef, { read: true })
            })

            await Promise.all(updatePromises)

            // Update local state
            setNotifications(prev => 
                prev.map(n => ({ ...n, read: true }))
            )
        } catch (err) {
            console.error('Error marking all notifications as read:', err)
        }
    }, [notifications, user?.uid, addToCache])

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        hasMore,
        markAsRead,
        markAllAsRead,
        loadMore
    }
}