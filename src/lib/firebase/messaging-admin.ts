import { getMessaging, TokenMessage } from 'firebase-admin/messaging'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
}

const messaging = getMessaging()
const db = getFirestore()

// Type definitions for Firestore documents
interface UserDocument {
    fcmToken?: string
    fcmTokenUpdated?: number
    [key: string]: unknown
}

interface VacationDocument {
    members?: Record<string, unknown>
    [key: string]: unknown
}

export interface NotificationData {
    title: string
    body: string
    icon?: string
    clickAction?: string
    data?: Record<string, string>
}

export interface GroupMessageNotification extends NotificationData {
    type: 'group_message'
    vacationId: string
    messageId: string
    senderName: string
    senderPhotoURL?: string
    content: string
}

export interface LocationUpdateNotification extends NotificationData {
    type: 'location_update'
    vacationId: string
    userId: string
    userName: string
    latitude: number
    longitude: number
}

export interface GeofenceAlertNotification extends NotificationData {
    type: 'geofence_alert'
    vacationId: string
    geofenceId: string
    geofenceName: string
    userId: string
    userName: string
    alertType: 'ENTRY' | 'EXIT'
}

export type PushNotification = GroupMessageNotification | LocationUpdateNotification | GeofenceAlertNotification

class FirebaseMessagingAdmin {
    /**
     * Send notification to a single user
     */
    async sendToUser(userId: string, notification: PushNotification): Promise<boolean> {
        try {
            // Get user's FCM token
            const userDoc = await db.collection('users').doc(userId).get()
            if (!userDoc.exists) {
                console.warn(`User ${userId} not found`)
                return false
            }

            const userData = userDoc.data() as UserDocument | undefined
            const fcmToken = userData?.fcmToken

            if (!fcmToken || typeof fcmToken !== 'string') {
                console.warn(`No valid FCM token found for user ${userId}`)
                return false
            }

            const message: TokenMessage = {
                token: fcmToken,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    imageUrl: notification.icon
                },
                data: {
                    type: notification.type,
                    ...notification.data,
                    clickAction: notification.clickAction || '/dashboard'
                },
                android: {
                    notification: {
                        icon: 'ic_notification',
                        color: '#1976d2',
                        sound: 'default',
                        channelId: 'disney_vacation_planning'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                },
                webpush: {
                    notification: {
                        icon: notification.icon || '/icons/disney-badge.png',
                        badge: '/icons/disney-badge.png',
                        requireInteraction: notification.type === 'geofence_alert',
                        actions: this.getNotificationActions(notification)
                    }
                }
            }

            const response = await messaging.send(message)
            console.log('Successfully sent message:', response)
            return true

        } catch (error) {
            console.error('Error sending notification to user:', error)

            // Handle invalid token
            if (error instanceof Error && error.message.includes('invalid-registration-token')) {
                console.warn(`Invalid FCM token for user ${userId}, removing from database`)
                await this.removeInvalidToken(userId)
            }

            return false
        }
    }

    /**
     * Send notification to multiple users
     */
    async sendToUsers(userIds: string[], notification: PushNotification): Promise<{ success: number; failure: number }> {
        let success = 0
        let failure = 0

        // Process in batches of 10 to avoid rate limits
        const batchSize = 10
        for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize)
            const results = await Promise.allSettled(
                batch.map(userId => this.sendToUser(userId, notification))
            )

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    success++
                } else {
                    failure++
                }
            })
        }

        return { success, failure }
    }

    /**
     * Send notification to vacation party members
     */
    async sendToVacationParty(vacationId: string, notification: PushNotification, excludeUserId?: string): Promise<{ success: number; failure: number }> {
        try {
            // Get vacation party members from Firestore
            const vacationDoc = await db.collection('vacations').doc(vacationId).get()
            if (!vacationDoc.exists) {
                console.warn(`Vacation ${vacationId} not found`)
                return { success: 0, failure: 0 }
            }

            const vacationData = vacationDoc.data() as VacationDocument | undefined
            const memberIds = Object.keys(vacationData?.members || {})

            // Filter out excluded user
            const targetUserIds = excludeUserId
                ? memberIds.filter(id => id !== excludeUserId)
                : memberIds

            if (targetUserIds.length === 0) {
                return { success: 0, failure: 0 }
            }

            return await this.sendToUsers(targetUserIds, notification)

        } catch (error) {
            console.error('Error sending notification to vacation party:', error)
            return { success: 0, failure: 0 }
        }
    }

    /**
     * Send group message notification
     */
    async sendGroupMessageNotification(
        vacationId: string,
        messageId: string,
        senderUserId: string,
        senderName: string,
        content: string,
        senderPhotoURL?: string
    ): Promise<{ success: number; failure: number }> {
        const notification: GroupMessageNotification = {
            type: 'group_message',
            title: `💬 ${senderName}`,
            body: content.length > 100 ? content.substring(0, 100) + '...' : content,
            icon: senderPhotoURL || '/icons/disney-badge.png',
            clickAction: `/dashboard/group/${vacationId}`,
            vacationId,
            messageId,
            senderName,
            senderPhotoURL,
            content,
            data: {
                vacationId,
                messageId,
                senderUserId,
                senderName,
                content: content.substring(0, 200) // Limit data payload
            }
        }

        return await this.sendToVacationParty(vacationId, notification, senderUserId)
    }

    /**
     * Send location update notification
     */
    async sendLocationUpdateNotification(
        vacationId: string,
        userId: string,
        userName: string,
        latitude: number,
        longitude: number
    ): Promise<{ success: number; failure: number }> {
        const notification: LocationUpdateNotification = {
            type: 'location_update',
            title: `📍 Location Update`,
            body: `${userName} shared their location`,
            icon: '/icons/disney-badge.png',
            clickAction: `/dashboard/group/${vacationId}`,
            vacationId,
            userId,
            userName,
            latitude,
            longitude,
            data: {
                vacationId,
                userId,
                userName,
                latitude: latitude.toString(),
                longitude: longitude.toString()
            }
        }

        return await this.sendToVacationParty(vacationId, notification, userId)
    }

    /**
     * Send geofence alert notification
     */
    async sendGeofenceAlertNotification(
        vacationId: string,
        geofenceId: string,
        geofenceName: string,
        userId: string,
        userName: string,
        alertType: 'ENTRY' | 'EXIT'
    ): Promise<{ success: number; failure: number }> {
        const action = alertType === 'ENTRY' ? 'entered' : 'left'

        const notification: GeofenceAlertNotification = {
            type: 'geofence_alert',
            title: `🚨 Geofence Alert`,
            body: `${userName} ${action} ${geofenceName}`,
            icon: '/icons/disney-badge.png',
            clickAction: `/dashboard/group/${vacationId}`,
            vacationId,
            geofenceId,
            geofenceName,
            userId,
            userName,
            alertType,
            data: {
                vacationId,
                geofenceId,
                geofenceName,
                userId,
                userName,
                alertType
            }
        }

        return await this.sendToVacationParty(vacationId, notification, userId)
    }

    /**
     * Get notification actions based on type
     */
    private getNotificationActions(notification: PushNotification): Array<{ action: string; title: string }> {
        switch (notification.type) {
            case 'group_message':
                return [
                    { action: 'reply', title: 'Reply' },
                    { action: 'open_chat', title: 'Open Chat' }
                ]
            case 'location_update':
                return [
                    { action: 'view_location', title: 'View Location' },
                    { action: 'share_mine', title: 'Share Mine' }
                ]
            case 'geofence_alert':
                return [
                    { action: 'view_map', title: 'View Map' },
                    { action: 'notify_group', title: 'Notify Group' }
                ]
            default:
                return [
                    { action: 'open', title: 'Open App' }
                ]
        }
    }

    /**
     * Remove invalid FCM token from database
     */
    private async removeInvalidToken(userId: string): Promise<void> {
        try {
            await db.collection('users').doc(userId).update({
                fcmToken: null,
                fcmTokenUpdated: Date.now()
            })
        } catch (error) {
            console.error('Error removing invalid token:', error)
        }
    }

    /**
     * Send test notification
     */
    async sendTestNotification(userId: string): Promise<boolean> {
        const notification: GroupMessageNotification = {
            type: 'group_message',
            title: '🎭 Test Notification',
            body: 'This is a test notification from Disney Vacation Planning!',
            icon: '/icons/disney-badge.png',
            clickAction: '/dashboard',
            vacationId: 'test',
            messageId: 'test',
            senderName: 'System',
            content: 'Test message',
            data: {
                test: 'true'
            }
        }

        return await this.sendToUser(userId, notification)
    }
}

// Create singleton instance
export const firebaseMessagingAdmin = new FirebaseMessagingAdmin()

// Export utility functions
export const messagingAdmin = {
    sendGroupMessage: firebaseMessagingAdmin.sendGroupMessageNotification.bind(firebaseMessagingAdmin),
    sendLocationUpdate: firebaseMessagingAdmin.sendLocationUpdateNotification.bind(firebaseMessagingAdmin),
    sendGeofenceAlert: firebaseMessagingAdmin.sendGeofenceAlertNotification.bind(firebaseMessagingAdmin),
    sendToUser: firebaseMessagingAdmin.sendToUser.bind(firebaseMessagingAdmin),
    sendToUsers: firebaseMessagingAdmin.sendToUsers.bind(firebaseMessagingAdmin),
    sendToParty: firebaseMessagingAdmin.sendToVacationParty.bind(firebaseMessagingAdmin),
    sendTest: firebaseMessagingAdmin.sendTestNotification.bind(firebaseMessagingAdmin)
}

export default firebaseMessagingAdmin