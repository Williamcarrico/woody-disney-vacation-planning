'use client'

import { useEffect, useState, useCallback } from 'react'
import { realtimeDB } from '@/lib/firebase/realtime-database'
import { useAuth } from '@/lib/firebase/auth-client-safe'

export interface RealtimeData {
    waitTimes: Record<string, {
        attractionId: string
        currentWait: number
        status: 'operating' | 'down' | 'closed'
        lastUpdated: string
    }>
    crowdLevels: Record<string, {
        parkId: string
        level: number
        capacity: number
        lastUpdated: string
    }>
    notifications: Array<{
        id: string
        type: 'reminder' | 'alert' | 'update'
        title: string
        message: string
        timestamp: string
        read: boolean
    }>
    partyLocation: Record<string, {
        memberId: string
        latitude: number
        longitude: number
        lastSeen: string
        park?: string
        area?: string
    }>
    liveEvents: Array<{
        id: string
        type: 'show' | 'parade' | 'character_meet' | 'special'
        name: string
        location: string
        startTime: string
        endTime: string
        status: 'upcoming' | 'active' | 'ended'
    }>
}

export function useRealtimeDashboard() {
    const { user } = useAuth()
    const [data, setData] = useState<RealtimeData>({
        waitTimes: {},
        crowdLevels: {},
        notifications: [],
        partyLocation: {},
        liveEvents: []
    })
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Subscribe to wait times for parks the user is interested in
    const subscribeToWaitTimes = useCallback(async (parkIds: string[]) => {
        if (!parkIds.length) return

        try {
            return await realtimeDB.subscribeToWaitTimes(parkIds, (waitTimes) => {
                setData(prev => ({
                    ...prev,
                    waitTimes: { ...prev.waitTimes, ...waitTimes }
                }))
            })
        } catch (err) {
            console.error('Error subscribing to wait times:', err)
            setError('Failed to connect to wait times')
        }
    }, [])

    // Subscribe to crowd levels
    const subscribeToCrowdLevels = useCallback(async (parkIds: string[]) => {
        if (!parkIds.length) return

        try {
            return await realtimeDB.subscribeToCrowdLevels(parkIds, (crowdLevels) => {
                setData(prev => ({
                    ...prev,
                    crowdLevels: { ...prev.crowdLevels, ...crowdLevels }
                }))
            })
        } catch (err) {
            console.error('Error subscribing to crowd levels:', err)
            setError('Failed to connect to crowd levels')
        }
    }, [])

    // Subscribe to user notifications
    const subscribeToNotifications = useCallback(async (userId: string) => {
        try {
            return await realtimeDB.subscribeToUserNotifications(userId, (notifications) => {
                setData(prev => ({
                    ...prev,
                    notifications: notifications.sort((a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )
                }))
            })
        } catch (err) {
            console.error('Error subscribing to notifications:', err)
            setError('Failed to connect to notifications')
        }
    }, [])

    // Subscribe to party member locations
    const subscribeToPartyLocations = useCallback(async (vacationId: string) => {
        try {
            return await realtimeDB.subscribeToPartyLocations(vacationId, (locations) => {
                setData(prev => ({
                    ...prev,
                    partyLocation: { ...prev.partyLocation, ...locations }
                }))
            })
        } catch (err) {
            console.error('Error subscribing to party locations:', err)
            setError('Failed to connect to party locations')
        }
    }, [])

    // Subscribe to live events
    const subscribeToLiveEvents = useCallback(async (parkIds: string[]) => {
        if (!parkIds.length) return

        try {
            return await realtimeDB.subscribeToLiveEvents(parkIds, (events) => {
                const now = new Date()
                const activeEvents = events.filter(event => {
                    const endTime = new Date(event.endTime)
                    return endTime > now
                })

                setData(prev => ({
                    ...prev,
                    liveEvents: activeEvents.sort((a, b) =>
                        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                    )
                }))
            })
        } catch (err) {
            console.error('Error subscribing to live events:', err)
            setError('Failed to connect to live events')
        }
    }, [])

    // Mark notification as read
    const markNotificationAsRead = useCallback(async (notificationId: string) => {
        if (!user) return

        try {
            await realtimeDB.markNotificationAsRead(user.uid, notificationId)

            setData(prev => ({
                ...prev,
                notifications: prev.notifications.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            }))
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }, [user])

    // Update party member location
    const updatePartyLocation = useCallback(async (
        vacationId: string,
        memberId: string,
        location: { latitude: number; longitude: number; park?: string; area?: string }
    ) => {
        try {
            await realtimeDB.updatePartyLocation(vacationId, memberId, location)
        } catch (err) {
            console.error('Error updating party location:', err)
        }
    }, [])

    // Send notification to party
    const sendPartyNotification = useCallback(async (
        vacationId: string,
        notification: {
            type: 'reminder' | 'alert' | 'update'
            title: string
            message: string
        }
    ) => {
        try {
            await realtimeDB.sendPartyNotification(vacationId, notification)
        } catch (err) {
            console.error('Error sending party notification:', err)
        }
    }, [])

    // Initialize subscriptions when user changes
    useEffect(() => {
        if (!user) {
            setIsConnected(false)
            return
        }

        let unsubscribeFunctions: Array<() => void> = []

        const initializeSubscriptions = async () => {
            try {
                setError(null)

                // Get user's preferences and current vacation to determine what to subscribe to
                const userProfile = await fetch(`/api/user/profile`).then(r => r.json())

                if (userProfile.currentVacation) {
                    const parkIds = userProfile.favoriteParts || ['magic-kingdom', 'epcot', 'hollywood-studios', 'animal-kingdom']

                    // Subscribe to all relevant data streams
                    const unsubscribers = await Promise.all([
                        subscribeToWaitTimes(parkIds),
                        subscribeToCrowdLevels(parkIds),
                        subscribeToNotifications(user.uid),
                        subscribeToPartyLocations(userProfile.currentVacation.id),
                        subscribeToLiveEvents(parkIds)
                    ])

                    unsubscribeFunctions = unsubscribers.filter(Boolean) as Array<() => void>
                    setIsConnected(true)
                }
            } catch (err) {
                console.error('Error initializing realtime subscriptions:', err)
                setError('Failed to initialize real-time data')
                setIsConnected(false)
            }
        }

        initializeSubscriptions()

        // Cleanup function
        return () => {
            unsubscribeFunctions.forEach(unsubscribe => {
                try {
                    unsubscribe()
                } catch (err) {
                    console.error('Error unsubscribing:', err)
                }
            })
            setIsConnected(false)
        }
    }, [user, subscribeToWaitTimes, subscribeToCrowdLevels, subscribeToNotifications, subscribeToPartyLocations, subscribeToLiveEvents])

    // Connection health check
    useEffect(() => {
        const healthCheck = setInterval(() => {
            if (user && !isConnected) {
                setError('Connection lost - attempting to reconnect...')
            }
        }, 30000) // Check every 30 seconds

        return () => clearInterval(healthCheck)
    }, [user, isConnected])

    return {
        data,
        isConnected,
        error,
        markNotificationAsRead,
        updatePartyLocation,
        sendPartyNotification,
        // Computed values for easy access
        unreadNotifications: data.notifications.filter(n => !n.read).length,
        activeEvents: data.liveEvents.filter(e => e.status === 'active').length,
        partyMembersOnline: Object.keys(data.partyLocation).length
    }
}

