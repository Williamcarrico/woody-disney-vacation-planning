'use client'

import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging'
import { app } from './firebase.config'
import { toast } from 'sonner'

export interface FCMToken {
    token: string
    timestamp: number
    userId?: string
}

export interface NotificationPayload {
    title: string
    body: string
    icon?: string
    data?: Record<string, string>
    clickAction?: string
}

class FirebaseMessagingService {
    private messaging: any = null
    private token: string | null = null
    private isSupported = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.initializeMessaging()
        }
    }

    private async initializeMessaging() {
        try {
            // Check if messaging is supported
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                this.messaging = getMessaging(app)
                this.isSupported = true

                // Register service worker
                await this.registerServiceWorker()

                // Listen for foreground messages
                this.setupForegroundMessageListener()
            }
        } catch (error) {
            console.error('Error initializing Firebase Messaging:', error)
            this.isSupported = false
        }
    }

    private async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
            console.log('Service Worker registered successfully:', registration)
            return registration
        } catch (error) {
            console.error('Service Worker registration failed:', error)
            throw error
        }
    }

    private setupForegroundMessageListener() {
        if (!this.messaging) return

        onMessage(this.messaging, (payload) => {
            console.log('Foreground message received:', payload)

            // Show notification toast in foreground
            const { notification, data } = payload

            if (notification) {
                this.showForegroundNotification({
                    title: notification.title || 'New Message',
                    body: notification.body || '',
                    icon: notification.icon,
                    data: data as Record<string, string>
                })
            }
        })
    }

    private showForegroundNotification(payload: NotificationPayload) {
        const { title, body, data } = payload

        // Customize toast based on message type
        if (data?.type === 'group_message') {
            toast.message(`💬 ${title}`, {
                description: body,
                action: {
                    label: 'View',
                    onClick: () => {
                        if (data.vacationId) {
                            window.location.href = `/dashboard/group/${data.vacationId}`
                        }
                    }
                },
                duration: 5000
            })
        } else if (data?.type === 'location_update') {
            toast.info(`📍 ${title}`, {
                description: body,
                duration: 4000
            })
        } else if (data?.type === 'geofence_alert') {
            toast.warning(`🚨 ${title}`, {
                description: body,
                duration: 6000
            })
        } else {
            toast(title, {
                description: body,
                duration: 4000
            })
        }

        // Play notification sound
        this.playNotificationSound()
    }

    private playNotificationSound() {
        try {
            const audio = new Audio('/sounds/notification.mp3')
            audio.volume = 0.3
            audio.play().catch(() => {
                // Ignore audio play errors
            })
        } catch (error) {
            // Ignore audio errors
        }
    }

    /**
     * Request notification permission and get FCM token
     */
    async requestPermissionAndGetToken(vapidKey?: string): Promise<string | null> {
        if (!this.isSupported || !this.messaging) {
            console.warn('Firebase Messaging not supported')
            return null
        }

        try {
            // Request notification permission
            const permission = await Notification.requestPermission()

            if (permission !== 'granted') {
                console.log('Notification permission denied')
                return null
            }

            // Get FCM token
            const token = await getToken(this.messaging, {
                vapidKey: vapidKey || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            })

            if (token) {
                console.log('FCM Token received:', token)
                this.token = token

                // Store token in local storage for reference
                localStorage.setItem('fcm_token', token)
                localStorage.setItem('fcm_token_timestamp', Date.now().toString())

                return token
            } else {
                console.log('No registration token available')
                return null
            }
        } catch (error) {
            console.error('Error getting FCM token:', error)
            return null
        }
    }

    /**
     * Get current FCM token
     */
    getCurrentToken(): string | null {
        return this.token || localStorage.getItem('fcm_token')
    }

    /**
     * Save FCM token to backend
     */
    async saveTokenToBackend(userId: string, token: string): Promise<boolean> {
        try {
            const response = await fetch('/api/user/fcm-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    token,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                })
            })

            return response.ok
        } catch (error) {
            console.error('Error saving FCM token to backend:', error)
            return false
        }
    }

    /**
     * Remove FCM token from backend
     */
    async removeTokenFromBackend(userId: string): Promise<boolean> {
        try {
            const token = this.getCurrentToken()
            if (!token) return true

            const response = await fetch('/api/user/fcm-token', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    token
                })
            })

            return response.ok
        } catch (error) {
            console.error('Error removing FCM token from backend:', error)
            return false
        }
    }

    /**
     * Delete FCM token (logout)
     */
    async deleteToken(): Promise<boolean> {
        if (!this.messaging || !this.token) return true

        try {
            await deleteToken(this.messaging)
            this.token = null

            // Clear from local storage
            localStorage.removeItem('fcm_token')
            localStorage.removeItem('fcm_token_timestamp')

            return true
        } catch (error) {
            console.error('Error deleting FCM token:', error)
            return false
        }
    }

    /**
     * Check if notifications are supported and enabled
     */
    isNotificationSupported(): boolean {
        return this.isSupported && 'Notification' in window
    }

    /**
     * Get notification permission status
     */
    getNotificationPermission(): NotificationPermission {
        if ('Notification' in window) {
            return Notification.permission
        }
        return 'denied'
    }

    /**
     * Send a test notification
     */
    async sendTestNotification(): Promise<void> {
        if (!this.isNotificationSupported()) {
            throw new Error('Notifications not supported')
        }

        if (Notification.permission === 'granted') {
            new Notification('Test Notification', {
                body: 'This is a test notification from Disney Vacation Planning',
                icon: '/icons/disney-badge.png',
                badge: '/icons/disney-badge.png'
            })
        }
    }
}

// Create singleton instance
export const firebaseMessaging = new FirebaseMessagingService()

// Utility functions
export const messaging = {
    /**
     * Initialize messaging for a user
     */
    async initializeForUser(userId: string, vapidKey?: string): Promise<string | null> {
        const token = await firebaseMessaging.requestPermissionAndGetToken(vapidKey)

        if (token && userId) {
            await firebaseMessaging.saveTokenToBackend(userId, token)
        }

        return token
    },

    /**
     * Cleanup messaging for user logout
     */
    async cleanup(userId: string): Promise<void> {
        await firebaseMessaging.removeTokenFromBackend(userId)
        await firebaseMessaging.deleteToken()
    },

    /**
     * Check if user can receive notifications
     */
    canReceiveNotifications(): boolean {
        return firebaseMessaging.isNotificationSupported() &&
            firebaseMessaging.getNotificationPermission() === 'granted'
    },

    /**
     * Get current token
     */
    getToken(): string | null {
        return firebaseMessaging.getCurrentToken()
    },

    /**
     * Send test notification
     */
    async testNotification(): Promise<void> {
        return firebaseMessaging.sendTestNotification()
    }
}

export default firebaseMessaging