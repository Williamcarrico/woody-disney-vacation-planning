'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Unsubscribe } from 'firebase/database'
import {
    listenToGroupMessages,
    listenToLocationUpdates,
    listenToGroupMemberLocations,
    listenToParkWaitTimes,
    listenToNotifications,
    sendGroupMessage,
    shareLocationUpdate,
    updateLocationSharingStatus,
    addMessageReaction,
    markNotificationAsRead,
    getCurrentUser,
    type GroupMessage,
    type LocationUpdate,
    type WaitTimeData
} from '@/lib/firebase/realtime-database'
import type { Notification } from '@/types/shared'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface MemberLocation {
    userId: string
    userName: string
    userPhotoURL?: string
    isSharing: boolean
    lastUpdated: number
    location?: {
        latitude: number
        longitude: number
        accuracy?: number
        parkId?: string
        areaId?: string
        attractionId?: string
        name: string
    }
}

// =============================================================================
// GROUP MESSAGING HOOK
// =============================================================================

export function useGroupMessages(vacationId: string, limit: number = 50) {
    const [messages, setMessages] = useState<Record<string, GroupMessage>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const unsubscribeRef = useRef<Unsubscribe | null>(null)

    useEffect(() => {
        if (!vacationId) return

        setLoading(true)
        setError(null)

        try {
            unsubscribeRef.current = listenToGroupMessages(
                vacationId,
                (newMessages) => {
                    setMessages(newMessages)
                    setLoading(false)
                },
                limit
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to listen to messages')
            setLoading(false)
        }

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
                unsubscribeRef.current = null
            }
        }
    }, [vacationId, limit])

    const sendMessage = useCallback(async (content: string, type: GroupMessage['type'] = 'text') => {
        const user = getCurrentUser()
        if (!user || !vacationId) {
            throw new Error('User not authenticated or vacation ID missing')
        }

        try {
            await sendGroupMessage(
                vacationId,
                user.uid,
                user.displayName || 'Anonymous User',
                content,
                type,
                user.photoURL || undefined
            )
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to send message')
        }
    }, [vacationId])

    const addReaction = useCallback(async (messageId: string, reaction: string) => {
        const user = getCurrentUser()
        if (!user || !vacationId) {
            throw new Error('User not authenticated or vacation ID missing')
        }

        try {
            await addMessageReaction(vacationId, messageId, user.uid, reaction)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to add reaction')
        }
    }, [vacationId])

    return {
        messages,
        loading,
        error,
        sendMessage,
        addReaction
    }
}

// =============================================================================
// LOCATION SHARING HOOK
// =============================================================================

export function useLocationSharing(vacationId: string) {
    const [memberLocations, setMemberLocations] = useState<Record<string, MemberLocation>>({})
    const [locationUpdates, setLocationUpdates] = useState<Record<string, LocationUpdate>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSharing, setIsSharing] = useState(false)

    const membersUnsubscribeRef = useRef<Unsubscribe | null>(null)
    const updatesUnsubscribeRef = useRef<Unsubscribe | null>(null)

    useEffect(() => {
        if (!vacationId) return

        setLoading(true)
        setError(null)

        try {
            // Listen to member locations
            membersUnsubscribeRef.current = listenToGroupMemberLocations(
                vacationId,
                (members) => {
                    setMemberLocations(members)
                    setLoading(false)
                }
            )

            // Listen to location updates
            updatesUnsubscribeRef.current = listenToLocationUpdates(
                vacationId,
                (updates) => {
                    setLocationUpdates(updates)
                }
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to listen to location updates')
            setLoading(false)
        }

        return () => {
            if (membersUnsubscribeRef.current) {
                membersUnsubscribeRef.current()
                membersUnsubscribeRef.current = null
            }
            if (updatesUnsubscribeRef.current) {
                updatesUnsubscribeRef.current()
                updatesUnsubscribeRef.current = null
            }
        }
    }, [vacationId])

    const toggleLocationSharing = useCallback(async (enable: boolean) => {
        const user = getCurrentUser()
        if (!user || !vacationId) {
            throw new Error('User not authenticated or vacation ID missing')
        }

        try {
            await updateLocationSharingStatus(
                vacationId,
                user.uid,
                user.displayName || 'Anonymous User',
                enable,
                user.photoURL || undefined
            )
            setIsSharing(enable)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to update location sharing')
        }
    }, [vacationId])

    const shareLocation = useCallback(async (
        location: LocationUpdate['location'],
        message?: string,
        isEmergency: boolean = false
    ) => {
        const user = getCurrentUser()
        if (!user || !vacationId) {
            throw new Error('User not authenticated or vacation ID missing')
        }

        try {
            await shareLocationUpdate(
                vacationId,
                user.uid,
                user.displayName || 'Anonymous User',
                location,
                message,
                isEmergency,
                user.photoURL || undefined
            )
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to share location')
        }
    }, [vacationId])

    return {
        memberLocations,
        locationUpdates,
        loading,
        error,
        isSharing,
        toggleLocationSharing,
        shareLocation
    }
}

// =============================================================================
// WAIT TIMES HOOK
// =============================================================================

export function useWaitTimes(parkId: string) {
    const [waitTimes, setWaitTimes] = useState<WaitTimeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const unsubscribeRef = useRef<Unsubscribe | null>(null)

    useEffect(() => {
        if (!parkId) return

        setLoading(true)
        setError(null)

        try {
            unsubscribeRef.current = listenToParkWaitTimes(
                parkId,
                (newWaitTimes) => {
                    setWaitTimes(newWaitTimes)
                    setLastUpdated(new Date(newWaitTimes.lastUpdated))
                    setLoading(false)
                }
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to listen to wait times')
            setLoading(false)
        }

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
                unsubscribeRef.current = null
            }
        }
    }, [parkId])

    // Helper function to get wait time for specific attraction
    const getAttractionWaitTime = useCallback((attractionId: string) => {
        return waitTimes?.attractions[attractionId] || null
    }, [waitTimes])

    // Helper function to get operating attractions
    const getOperatingAttractions = useCallback(() => {
        if (!waitTimes) return []

        return Object.entries(waitTimes.attractions)
            .filter(([, attraction]) => attraction.status === 'OPERATING')
            .map(([id, attraction]) => ({ id, ...attraction }))
            .sort((a, b) => a.standbyWait - b.standbyWait)
    }, [waitTimes])

    return {
        waitTimes,
        loading,
        error,
        lastUpdated,
        getAttractionWaitTime,
        getOperatingAttractions
    }
}

// =============================================================================
// NOTIFICATIONS HOOK
// =============================================================================

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<Record<string, Notification>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [unreadCount, setUnreadCount] = useState(0)

    const unsubscribeRef = useRef<Unsubscribe | null>(null)

    useEffect(() => {
        const user = getCurrentUser()
        const targetUserId = userId || user?.uid

        if (!targetUserId) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            unsubscribeRef.current = listenToNotifications(
                targetUserId,
                (newNotifications) => {
                    setNotifications(newNotifications)

                    // Count unread notifications
                    const unread = Object.values(newNotifications).filter(
                        (notification: Notification) => !notification.read
                    ).length
                    setUnreadCount(unread)

                    setLoading(false)
                }
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to listen to notifications')
            setLoading(false)
        }

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
                unsubscribeRef.current = null
            }
        }
    }, [userId])

    const markAsRead = useCallback(async (notificationId: string) => {
        const user = getCurrentUser()
        const targetUserId = userId || user?.uid

        if (!targetUserId) {
            throw new Error('User not authenticated')
        }

        try {
            await markNotificationAsRead(targetUserId, notificationId)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to mark notification as read')
        }
    }, [userId])

    return {
        notifications,
        loading,
        error,
        unreadCount,
        markAsRead
    }
}

// =============================================================================
// COMBINED VACATION HOOK
// =============================================================================

export function useVacationRealtime(vacationId: string, parkId?: string) {
    const messages = useGroupMessages(vacationId)
    const locationSharing = useLocationSharing(vacationId)
    const user = getCurrentUser()
    const notifications = useNotifications(user?.uid)

    // Always call useWaitTimes, but pass empty string when parkId is not provided
    const waitTimes = useWaitTimes(parkId || '')

    const isLoading = messages.loading || locationSharing.loading || waitTimes.loading || notifications.loading
    const hasError = messages.error || locationSharing.error || waitTimes.error || notifications.error

    return {
        messages,
        locationSharing,
        waitTimes: parkId ? waitTimes : null,
        notifications,
        isLoading,
        hasError,
        user
    }
}

export default useVacationRealtime