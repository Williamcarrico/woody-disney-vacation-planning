'use client'

import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    onValue,
    off,
    serverTimestamp,
    query,
    orderByChild,
    limitToLast,
    DatabaseReference,
    Unsubscribe
} from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { database } from './firebase.config'

// Types for the Disney vacation planning app
export interface User {
    profile: {
        displayName: string
        email: string
        photoURL?: string
        phoneNumber?: string
        createdAt: number
        lastActive: number
    }
    preferences: {
        partySize: number
        hasChildren: boolean
        childrenAges?: number[]
        mobilityConsiderations: boolean
        ridePreference: 'thrill' | 'family' | 'all'
        maxWaitTime: number
        useGeniePlus: boolean
        walkingPace: 'slow' | 'moderate' | 'fast'
        notifications: {
            waitTimes: boolean
            groupMessages: boolean
            emergencyAlerts: boolean
        }
    }
    vacationIds: Record<string, boolean>
    deviceTokens?: Record<string, {
        token: string
        platform: 'ios' | 'android' | 'web'
        lastUpdated: number
    }>
}

export interface Vacation {
    basic: {
        name: string
        description?: string
        destination: string
        startDate: string
        endDate: string
        createdBy: string
        createdAt: number
        updatedAt: number
        status: 'planning' | 'confirmed' | 'active' | 'completed'
        imageUrl?: string
        shareCode?: string
    }
    members: Record<string, {
        role: 'owner' | 'editor' | 'viewer'
        joinedAt: number
        permissions: {
            editItinerary: boolean
            manageBudget: boolean
            inviteOthers: boolean
        }
    }>
    accommodation?: {
        resortId: string
        resortName: string
        roomType: string
        checkIn: string
        checkOut: string
        confirmationNumber: string
    }
    travelers: {
        adults: number
        children: number
        childrenAges?: number[]
    }
}

export interface GroupMessage {
    userId: string
    userName: string
    userPhotoURL?: string
    content: string
    timestamp: number
    type: 'text' | 'location' | 'photo' | 'poll'
    reactions?: Record<string, string>
    replyTo?: string
    edited: boolean
    editedAt?: number
}

export interface LocationUpdate {
    userId: string
    userName: string
    userPhotoURL?: string
    location: {
        latitude: number
        longitude: number
        accuracy?: number
        parkId?: string
        areaId?: string
        attractionId?: string
        name: string
    }
    message?: string
    timestamp: number
    isEmergency: boolean
}

export interface WaitTimeData {
    lastUpdated: number
    attractions: Record<string, {
        status: 'OPERATING' | 'DOWN' | 'CLOSED'
        standbyWait: number
        lightningLane?: {
            available: boolean
            nextReturnTime?: string
            price?: number
        }
        lastUpdated: number
    }>
}

// Additional type definitions for better type safety
export interface NotificationData {
    [key: string]: string | number | boolean
}

export interface Notification {
    type: string
    title: string
    message: string
    data: NotificationData
    timestamp: number
    read: boolean
    vacationId?: string
}

export interface GroupMemberLocation {
    userName: string
    userPhotoURL?: string
    isSharing: boolean
    lastUpdated: number
    location?: LocationUpdate['location']
}

export interface DatabaseUpdate {
    [path: string]: unknown
}

export interface CreateVacationData extends Omit<Vacation['basic'], 'createdAt' | 'updatedAt' | 'createdBy'> {
    travelers?: {
        adults: number
        children: number
        childrenAges?: number[]
    }
}

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT
// =============================================================================

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
    const auth = getAuth()
    return auth.currentUser
}

/**
 * Create or update user profile in Realtime Database
 */
export async function createUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = ref(database, `users/${userId}`)
    const currentTime = Date.now()

    const defaultUserData: User = {
        profile: {
            displayName: userData.profile?.displayName || 'Anonymous User',
            email: userData.profile?.email || '',
            photoURL: userData.profile?.photoURL,
            phoneNumber: userData.profile?.phoneNumber,
            createdAt: currentTime,
            lastActive: currentTime
        },
        preferences: {
            partySize: 4,
            hasChildren: false,
            mobilityConsiderations: false,
            ridePreference: 'family',
            maxWaitTime: 60,
            useGeniePlus: true,
            walkingPace: 'moderate',
            notifications: {
                waitTimes: true,
                groupMessages: true,
                emergencyAlerts: true
            },
            ...userData.preferences
        },
        vacationIds: userData.vacationIds || {}
    }

    await set(userRef, defaultUserData)
}

/**
 * Update user's last active timestamp
 */
export async function updateUserActivity(userId: string): Promise<void> {
    const userRef = ref(database, `users/${userId}/profile/lastActive`)
    await set(userRef, Date.now())
}

/**
 * Get user data
 */
export async function getUserData(userId: string): Promise<User | null> {
    const userRef = ref(database, `users/${userId}`)
    const snapshot = await get(userRef)
    return snapshot.exists() ? snapshot.val() : null
}

// =============================================================================
// VACATION MANAGEMENT
// =============================================================================

/**
 * Create a new vacation
 */
export async function createVacation(vacationData: CreateVacationData, userId: string): Promise<string> {
    const vacationsRef = ref(database, 'vacations')
    const newVacationRef = push(vacationsRef)
    const vacationId = newVacationRef.key

    if (!vacationId) {
        throw new Error('Failed to generate vacation ID')
    }

    const currentTime = Date.now()
    const vacation: Vacation = {
        basic: {
            ...vacationData,
            createdBy: userId,
            createdAt: currentTime,
            updatedAt: currentTime
        },
        members: {
            [userId]: {
                role: 'owner',
                joinedAt: currentTime,
                permissions: {
                    editItinerary: true,
                    manageBudget: true,
                    inviteOthers: true
                }
            }
        },
        travelers: vacationData.travelers || { adults: 2, children: 0 }
    }

    await set(newVacationRef, vacation)

    // Add vacation to user's vacation list
    const userVacationRef = ref(database, `users/${userId}/vacationIds/${vacationId}`)
    await set(userVacationRef, true)

    return vacationId
}

/**
 * Get vacation data
 */
export async function getVacation(vacationId: string): Promise<Vacation | null> {
    const vacationRef = ref(database, `vacations/${vacationId}`)
    const snapshot = await get(vacationRef)
    return snapshot.exists() ? snapshot.val() : null
}

/**
 * Update vacation data
 */
export async function updateVacation(vacationId: string, updates: Partial<Vacation['basic']>): Promise<void> {
    const vacationRef = ref(database, `vacations/${vacationId}/basic`)
    await update(vacationRef, {
        ...updates,
        updatedAt: Date.now()
    })
}

/**
 * Add member to vacation
 */
export async function addVacationMember(
    vacationId: string,
    userId: string,
    role: 'editor' | 'viewer' = 'viewer'
): Promise<void> {
    const memberRef = ref(database, `vacations/${vacationId}/members/${userId}`)
    const userVacationRef = ref(database, `users/${userId}/vacationIds/${vacationId}`)

    const memberData = {
        role,
        joinedAt: Date.now(),
        permissions: {
            editItinerary: role === 'editor',
            manageBudget: false,
            inviteOthers: false
        }
    }

    await Promise.all([
        set(memberRef, memberData),
        set(userVacationRef, true)
    ])
}

// =============================================================================
// REAL-TIME MESSAGING
// =============================================================================

/**
 * Send a message to the group
 */
export async function sendGroupMessage(
    vacationId: string,
    userId: string,
    userName: string,
    content: string,
    type: GroupMessage['type'] = 'text',
    userPhotoURL?: string
): Promise<string> {
    const messagesRef = ref(database, `groupMessages/${vacationId}`)
    const messageRef = push(messagesRef)

    const message: GroupMessage = {
        userId,
        userName,
        userPhotoURL,
        content,
        timestamp: Date.now(),
        type,
        edited: false
    }

    await set(messageRef, message)

    const messageId = messageRef.key
    if (!messageId) {
        throw new Error('Failed to generate message ID')
    }

    return messageId
}

/**
 * Listen to group messages
 */
export function listenToGroupMessages(
    vacationId: string,
    callback: (messages: Record<string, GroupMessage>) => void,
    limit: number = 50
): Unsubscribe {
    const messagesRef = query(
        ref(database, `groupMessages/${vacationId}`),
        orderByChild('timestamp'),
        limitToLast(limit)
    )

    return onValue(messagesRef, (snapshot) => {
        const messages = snapshot.exists() ? snapshot.val() : {}
        callback(messages)
    })
}

/**
 * Add reaction to a message
 */
export async function addMessageReaction(
    vacationId: string,
    messageId: string,
    userId: string,
    reaction: string
): Promise<void> {
    const reactionRef = ref(database, `groupMessages/${vacationId}/${messageId}/reactions/${userId}`)
    await set(reactionRef, reaction)
}

// =============================================================================
// LOCATION SHARING
// =============================================================================

/**
 * Update user's location sharing status
 */
export async function updateLocationSharingStatus(
    vacationId: string,
    userId: string,
    userName: string,
    isSharing: boolean,
    userPhotoURL?: string
): Promise<void> {
    const statusRef = ref(database, `groupLocations/${vacationId}/members/${userId}`)

    const statusData = {
        userName,
        userPhotoURL,
        isSharing,
        lastUpdated: Date.now()
    }

    await set(statusRef, statusData)
}

/**
 * Share location update
 */
export async function shareLocationUpdate(
    vacationId: string,
    userId: string,
    userName: string,
    location: LocationUpdate['location'],
    message?: string,
    isEmergency: boolean = false,
    userPhotoURL?: string
): Promise<string> {
    const updatesRef = ref(database, `groupLocations/${vacationId}/updates`)
    const updateRef = push(updatesRef)

    const locationUpdate: LocationUpdate = {
        userId,
        userName,
        userPhotoURL,
        location,
        message,
        timestamp: Date.now(),
        isEmergency
    }

    await set(updateRef, locationUpdate)

    // Also update the member's current location
    const memberLocationRef = ref(database, `groupLocations/${vacationId}/members/${userId}/location`)
    await set(memberLocationRef, location)

    const updateId = updateRef.key
    if (!updateId) {
        throw new Error('Failed to generate location update ID')
    }

    return updateId
}

/**
 * Listen to location updates
 */
export function listenToLocationUpdates(
    vacationId: string,
    callback: (updates: Record<string, LocationUpdate>) => void,
    limit: number = 20
): Unsubscribe {
    const updatesRef = query(
        ref(database, `groupLocations/${vacationId}/updates`),
        orderByChild('timestamp'),
        limitToLast(limit)
    )

    return onValue(updatesRef, (snapshot) => {
        const updates = snapshot.exists() ? snapshot.val() : {}
        callback(updates)
    })
}

/**
 * Listen to group member locations
 */
export function listenToGroupMemberLocations(
    vacationId: string,
    callback: (members: Record<string, GroupMemberLocation>) => void
): Unsubscribe {
    const membersRef = ref(database, `groupLocations/${vacationId}/members`)

    return onValue(membersRef, (snapshot) => {
        const members = snapshot.exists() ? snapshot.val() : {}
        callback(members)
    })
}

// =============================================================================
// WAIT TIMES & PARK DATA
// =============================================================================

/**
 * Update live wait times for a park
 */
export async function updateParkWaitTimes(parkId: string, waitTimeData: WaitTimeData): Promise<void> {
    const waitTimesRef = ref(database, `liveWaitTimes/${parkId}`)
    await set(waitTimesRef, waitTimeData)
}

/**
 * Get current wait times for a park
 */
export async function getParkWaitTimes(parkId: string): Promise<WaitTimeData | null> {
    const waitTimesRef = ref(database, `liveWaitTimes/${parkId}`)
    const snapshot = await get(waitTimesRef)
    return snapshot.exists() ? snapshot.val() : null
}

/**
 * Listen to wait time updates for a park
 */
export function listenToParkWaitTimes(
    parkId: string,
    callback: (waitTimes: WaitTimeData) => void
): Unsubscribe {
    const waitTimesRef = ref(database, `liveWaitTimes/${parkId}`)

    return onValue(waitTimesRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val())
        }
    })
}

// =============================================================================
// NOTIFICATIONS & ALERTS
// =============================================================================

/**
 * Send notification to user
 */
export async function sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: NotificationData = {},
    vacationId?: string
): Promise<string> {
    const notificationsRef = ref(database, `notifications/${userId}`)
    const notificationRef = push(notificationsRef)

    const notification: Notification = {
        type,
        title,
        message,
        data,
        timestamp: Date.now(),
        read: false,
        vacationId
    }

    await set(notificationRef, notification)

    const notificationId = notificationRef.key
    if (!notificationId) {
        throw new Error('Failed to generate notification ID')
    }

    return notificationId
}

/**
 * Listen to user notifications
 */
export function listenToNotifications(
    userId: string,
    callback: (notifications: Record<string, Notification>) => void
): Unsubscribe {
    const notificationsRef = query(
        ref(database, `notifications/${userId}`),
        orderByChild('timestamp'),
        limitToLast(20)
    )

    return onValue(notificationsRef, (snapshot) => {
        const notifications = snapshot.exists() ? snapshot.val() : {}
        callback(notifications)
    })
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const notificationRef = ref(database, `notifications/${userId}/${notificationId}/read`)
    await set(notificationRef, true)
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Remove all listeners for a reference
 */
export function removeListener(dbRef: DatabaseReference): void {
    off(dbRef)
}

/**
 * Get server timestamp
 */
export function getServerTimestamp() {
    return serverTimestamp()
}

/**
 * Generate a unique push ID
 */
export function generatePushId(): string {
    const pushRef = push(ref(database, 'temp'))
    const pushId = pushRef.key

    if (!pushId) {
        throw new Error('Failed to generate push ID')
    }

    return pushId
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Update multiple paths atomically
 */
export async function updateMultiplePaths(updates: DatabaseUpdate): Promise<void> {
    const rootRef = ref(database)
    await update(rootRef, updates)
}

/**
 * Remove data at path
 */
export async function removeData(path: string): Promise<void> {
    const dataRef = ref(database, path)
    await remove(dataRef)
}

// =============================================================================
// ADDITIONAL CRUD OPERATIONS
// =============================================================================

/**
 * Update wait time for a specific attraction
 */
export async function updateWaitTime(
    parkId: string,
    attractionId: string,
    waitTime: number,
    status: 'OPERATING' | 'DOWN' | 'CLOSED'
): Promise<void> {
    const attractionWaitTimeRef = ref(database, `liveWaitTimes/${parkId}/attractions/${attractionId}`)
    const now = Date.now()

    await update(attractionWaitTimeRef, {
        status: status,
        standbyWait: waitTime,
        lastUpdated: now
    })

    // Update the park's overall lastUpdated timestamp
    await update(ref(database, `liveWaitTimes/${parkId}`), {
        lastUpdated: now
    })
}

/**
 * Remove an activity from an itinerary (if you have itineraries in RTDB)
 */
export async function removeActivity(itineraryId: string, activityId: string): Promise<void> {
    const activityRef = ref(database, `itineraries/${itineraryId}/activities/${activityId}`)
    await remove(activityRef)
}

/**
 * Listen for new messages being added (using onChildAdded)
 */
export function listenForNewMessages(
    vacationId: string,
    callback: (message: GroupMessage, messageId: string) => void
): Unsubscribe {
    const messagesRef = ref(database, `groupMessages/${vacationId}`)

    return onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
            const messages: Record<string, GroupMessage> = snapshot.val()
            // You could implement more sophisticated logic here for detecting only new messages
            Object.entries(messages).forEach(([messageId, message]) => {
                callback(message, messageId)
            })
        }
    })
}

/**
 * Remove a specific message
 */
export async function removeMessage(vacationId: string, messageId: string): Promise<void> {
    const messageRef = ref(database, `groupMessages/${vacationId}/${messageId}`)
    await remove(messageRef)
}

/**
 * Edit an existing message
 */
export async function editMessage(
    vacationId: string,
    messageId: string,
    newContent: string
): Promise<void> {
    const messageRef = ref(database, `groupMessages/${vacationId}/${messageId}`)
    await update(messageRef, {
        content: newContent,
        edited: true,
        editedAt: Date.now()
    })
}

/**
 * Get user's vacation IDs
 */
export async function getUserVacations(userId: string): Promise<string[]> {
    const userVacationsRef = ref(database, `users/${userId}/vacationIds`)
    const snapshot = await get(userVacationsRef)

    if (snapshot.exists()) {
        return Object.keys(snapshot.val())
    }
    return []
}

/**
 * Remove user from vacation
 */
export async function removeVacationMember(vacationId: string, userId: string): Promise<void> {
    const updates: DatabaseUpdate = {}
    updates[`/vacations/${vacationId}/members/${userId}`] = null
    updates[`/users/${userId}/vacationIds/${vacationId}`] = null

    await updateMultiplePaths(updates)
}

/**
 * Batch create multiple notifications
 */
export async function batchSendNotifications(
    notifications: Array<{
        userId: string
        type: string
        title: string
        message: string
        data?: NotificationData
        vacationId?: string
    }>
): Promise<void> {
    const updates: DatabaseUpdate = {}

    notifications.forEach(notification => {
        const notificationId = generatePushId()
        const notificationData: Notification = {
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data || {},
            timestamp: Date.now(),
            read: false,
            vacationId: notification.vacationId
        }
        updates[`/notifications/${notification.userId}/${notificationId}`] = notificationData
    })

    await updateMultiplePaths(updates)
}

// =============================================================================
// REALTIME DASHBOARD METHODS
// =============================================================================

/**
 * Subscribe to wait times for multiple parks
 */
export function subscribeToWaitTimes(
    parkIds: string[],
    callback: (waitTimes: Record<string, any>) => void
): () => void {
    const unsubscribers: Array<() => void> = []

    parkIds.forEach(parkId => {
        const waitTimesRef = ref(database, `liveWaitTimes/${parkId}`)
        const unsubscribe = onValue(waitTimesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val()
                const transformedData: Record<string, any> = {}

                if (data.attractions) {
                    Object.entries(data.attractions).forEach(([attractionId, attraction]: [string, any]) => {
                        transformedData[attractionId] = {
                            attractionId,
                            currentWait: attraction.standbyWait || 0,
                            status: attraction.status === 'OPERATING' ? 'operating' :
                                attraction.status === 'DOWN' ? 'down' : 'closed',
                            lastUpdated: new Date(attraction.lastUpdated).toISOString()
                        }
                    })
                }

                callback(transformedData)
            }
        })
        unsubscribers.push(unsubscribe)
    })

    return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe())
    }
}

/**
 * Subscribe to crowd levels for multiple parks
 */
export function subscribeToCrowdLevels(
    parkIds: string[],
    callback: (crowdLevels: Record<string, any>) => void
): () => void {
    const unsubscribers: Array<() => void> = []

    parkIds.forEach(parkId => {
        const crowdRef = ref(database, `crowdLevels/${parkId}`)
        const unsubscribe = onValue(crowdRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val()
                const transformedData: Record<string, any> = {}

                transformedData[parkId] = {
                    parkId,
                    level: data.level || 1,
                    capacity: data.capacity || 0,
                    lastUpdated: new Date(data.lastUpdated || Date.now()).toISOString()
                }

                callback(transformedData)
            }
        })
        unsubscribers.push(unsubscribe)
    })

    return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe())
    }
}

/**
 * Subscribe to user notifications
 */
export function subscribeToUserNotifications(
    userId: string,
    callback: (notifications: Array<any>) => void
): () => void {
    const notificationsRef = query(
        ref(database, `notifications/${userId}`),
        orderByChild('timestamp'),
        limitToLast(20)
    )

    return onValue(notificationsRef, (snapshot) => {
        const notifications: Array<any> = []

        if (snapshot.exists()) {
            const data = snapshot.val()
            Object.entries(data).forEach(([id, notification]: [string, any]) => {
                notifications.push({
                    id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    timestamp: new Date(notification.timestamp).toISOString(),
                    read: notification.read || false
                })
            })
        }

        callback(notifications)
    })
}

/**
 * Subscribe to party locations for a vacation
 */
export function subscribeToPartyLocations(
    vacationId: string,
    callback: (locations: Record<string, any>) => void
): () => void {
    const locationsRef = ref(database, `vacations/${vacationId}/groupLocation`)

    return onValue(locationsRef, (snapshot) => {
        const locations: Record<string, any> = {}

        if (snapshot.exists()) {
            const data = snapshot.val()
            Object.entries(data).forEach(([memberId, location]: [string, any]) => {
                if (location.isSharing && location.location) {
                    locations[memberId] = {
                        memberId,
                        latitude: location.location.latitude,
                        longitude: location.location.longitude,
                        lastSeen: new Date(location.lastUpdated).toISOString(),
                        park: location.location.parkId,
                        area: location.location.areaId
                    }
                }
            })
        }

        callback(locations)
    })
}

/**
 * Subscribe to live events for multiple parks
 */
export function subscribeToLiveEvents(
    parkIds: string[],
    callback: (events: Array<any>) => void
): () => void {
    const unsubscribers: Array<() => void> = []

    parkIds.forEach(parkId => {
        const eventsRef = ref(database, `liveEvents/${parkId}`)
        const unsubscribe = onValue(eventsRef, (snapshot) => {
            const events: Array<any> = []

            if (snapshot.exists()) {
                const data = snapshot.val()
                Object.entries(data).forEach(([eventId, event]: [string, any]) => {
                    const now = new Date()
                    const startTime = new Date(event.startTime)
                    const endTime = new Date(event.endTime)

                    let status = 'upcoming'
                    if (now >= startTime && now <= endTime) {
                        status = 'active'
                    } else if (now > endTime) {
                        status = 'ended'
                    }

                    events.push({
                        id: eventId,
                        type: event.type,
                        name: event.name,
                        location: event.location,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        status
                    })
                })
            }

            callback(events)
        })
        unsubscribers.push(unsubscribe)
    })

    return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe())
    }
}

/**
 * Update party member location
 */
export async function updatePartyLocation(
    vacationId: string,
    memberId: string,
    location: { latitude: number; longitude: number; park?: string; area?: string }
): Promise<void> {
    const locationRef = ref(database, `vacations/${vacationId}/groupLocation/${memberId}`)

    await update(locationRef, {
        isSharing: true,
        lastUpdated: Date.now(),
        location: {
            latitude: location.latitude,
            longitude: location.longitude,
            parkId: location.park,
            areaId: location.area,
            name: `${location.park || 'Unknown'} - ${location.area || 'Unknown Area'}`
        }
    })
}

/**
 * Send notification to party members
 */
export async function sendPartyNotification(
    vacationId: string,
    notification: {
        type: 'reminder' | 'alert' | 'update'
        title: string
        message: string
    }
): Promise<void> {
    // Get vacation members
    const vacationRef = ref(database, `vacations/${vacationId}/members`)
    const snapshot = await get(vacationRef)

    if (snapshot.exists()) {
        const members = snapshot.val()
        const notificationPromises = Object.keys(members).map(memberId =>
            sendNotification(
                memberId,
                notification.type,
                notification.title,
                notification.message,
                {},
                vacationId
            )
        )

        await Promise.all(notificationPromises)
    }
}

// Export an object with all methods for easier importing
export const realtimeDB = {
    // User management
    getCurrentUser,
    createUserProfile,
    updateUserActivity,
    getUserData,

    // Vacation management
    createVacation,
    getVacation,
    updateVacation,
    addVacationMember,
    removeVacationMember,
    getUserVacations,

    // Messaging
    sendGroupMessage,
    listenToGroupMessages,
    addMessageReaction,
    removeMessage,
    editMessage,
    listenForNewMessages,

    // Location sharing
    updateLocationSharingStatus,
    shareLocationUpdate,
    listenToLocationUpdates,
    listenToGroupMemberLocations,
    updatePartyLocation,

    // Wait times and park data
    updateParkWaitTimes,
    getParkWaitTimes,
    listenToParkWaitTimes,
    updateWaitTime,

    // Notifications
    sendNotification,
    listenToNotifications,
    markNotificationAsRead,
    batchSendNotifications,
    sendPartyNotification,

    // Realtime dashboard subscriptions
    subscribeToWaitTimes,
    subscribeToCrowdLevels,
    subscribeToUserNotifications,
    subscribeToPartyLocations,
    subscribeToLiveEvents,

    // Utility functions
    removeListener,
    getServerTimestamp,
    generatePushId,
    updateMultiplePaths,
    removeData,
    removeActivity
}

// Export the database instance for direct use if needed
export { database }