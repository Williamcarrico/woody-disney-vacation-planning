import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface Notification {
    id: string
    title: string
    message: string
    category: string
    read: boolean
    createdAt: string
    actionUrl?: string
    priority: 'low' | 'medium' | 'high'
    type: 'wait_time' | 'dining' | 'weather' | 'system' | 'achievement'
}

// Define and export the hook's return type
export interface UseNotificationsReturn {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        if (!user?.uid) {
            setIsLoading(false)
            return
        }

        const notificationsRef = collection(db, 'notifications')
        const q = query(
            notificationsRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        )

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const notificationData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Notification[]

                setNotifications(notificationData)
                setIsLoading(false)
                setError(null)
            },
            (err) => {
                console.error('Error fetching notifications:', err)
                setError('Failed to load notifications')
                setIsLoading(false)
            }
        )

        return () => unsubscribe()
    }, [user?.uid])

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!user?.uid) return

        try {
            const notificationRef = doc(db, 'notifications', notificationId)
            await updateDoc(notificationRef, {
                read: true
            })
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }, [user?.uid])

    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return

        try {
            const unreadNotifications = notifications.filter(n => !n.read)
            const updatePromises = unreadNotifications.map(notification => {
                const notificationRef = doc(db, 'notifications', notification.id)
                return updateDoc(notificationRef, { read: true })
            })

            await Promise.all(updatePromises)
        } catch (err) {
            console.error('Error marking all notifications as read:', err)
        }
    }, [notifications, user?.uid])

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead
    }
}