import { toast } from 'sonner'
import { Geofence, NewGeofenceAlert } from '@/db/schema/locations'

// Enhanced geofence data with advanced features
export interface EnhancedGeofence extends Geofence {
    isDirectional?: boolean
    isAltitudeBased?: boolean
    isTimeBased?: boolean
}

export interface LocationUpdate {
    userId: string
    latitude: number
    longitude: number
    accuracy?: number
    altitude?: number
    heading?: number
    speed?: number
    timestamp?: Date
    metadata?: {
        deviceInfo?: string
        networkType?: string
        batteryLevel?: number
        isBackground?: boolean
        parkArea?: string
        attraction?: string
        activity?: string
    }
}

export interface GeofenceEvent {
    geofence: EnhancedGeofence
    user: {
        id: string
        name: string
        location: LocationUpdate
    }
    type: 'entry' | 'exit' | 'proximity'
    distance: number
    timestamp: Date
}

export interface DirectionalGeofenceOptions {
    direction: number // 0-360 degrees
    directionRange: number // Range in degrees (e.g., 45 for ±22.5 degrees)
    requiresMovement?: boolean
}

export interface AltitudeGeofenceOptions {
    minAltitude?: number
    maxAltitude?: number
    altitudeTolerance?: number // meters
}

/**
 * Advanced Geofencing Service
 * Handles GPS, directional, and altitude-based geofencing with enhanced alerts
 */
export class GeofencingService {
    private static instance: GeofencingService
    private activeGeofences: Map<string, EnhancedGeofence> = new Map()
    private userStates: Map<string, Map<string, boolean>> = new Map() // userId -> geofenceId -> inside
    private lastLocations: Map<string, LocationUpdate> = new Map() // userId -> last location
    private alertCooldowns: Map<string, number> = new Map() // geofenceId-userId -> timestamp
    private eventListeners: Map<string, ((event: GeofenceEvent) => void)[]> = new Map()

    private constructor() { }

    public static getInstance(): GeofencingService {
        if (!GeofencingService.instance) {
            GeofencingService.instance = new GeofencingService()
        }
        return GeofencingService.instance
    }

    /**
     * Load geofences for a vacation
     */
    public async loadGeofences(vacationId: string): Promise<void> {
        try {
            const response = await fetch(`/api/geofences?vacationId=${vacationId}`)

            if (!response.ok) {
                console.warn(`Failed to load geofences for vacation ${vacationId}: ${response.status}`)
                // Clear active geofences but don't throw error
                this.activeGeofences.clear()
                return
            }

            const geofences: EnhancedGeofence[] = await response.json()

            this.activeGeofences.clear()

            // Handle case where API returns empty array (database not available)
            if (!Array.isArray(geofences)) {
                console.warn('Invalid geofences response format, clearing active geofences')
                return
            }

            geofences.forEach(geofence => {
                if (geofence.isActive) {
                    this.activeGeofences.set(geofence.id, geofence)
                }
            })

            console.log(`Loaded ${this.activeGeofences.size} active geofences for vacation ${vacationId}`)
        } catch (error) {
            console.warn('Error loading geofences, continuing without geofencing:', error)
            // Clear active geofences but don't throw error to prevent app crashes
            this.activeGeofences.clear()
        }
    }

    /**
     * Add event listener for geofence events
     */
    public addEventListener(event: string, callback: (event: GeofenceEvent) => void): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, [])
        }
        this.eventListeners.get(event)!.push(callback)
    }

    /**
     * Remove event listener
     */
    public removeEventListener(event: string, callback: (event: GeofenceEvent) => void): void {
        const listeners = this.eventListeners.get(event)
        if (listeners) {
            const index = listeners.indexOf(callback)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }

    /**
     * Process location update and check all geofences
     */
    public async processLocationUpdate(
        location: LocationUpdate,
        userName: string
    ): Promise<GeofenceEvent[]> {
        const events: GeofenceEvent[] = []
        const userId = location.userId

        // Store the last location
        this.lastLocations.set(userId, location)

        // Initialize user state if not exists
        if (!this.userStates.has(userId)) {
            this.userStates.set(userId, new Map())
        }
        const userState = this.userStates.get(userId)!

        // Check each active geofence
        for (const [geofenceId, geofence] of this.activeGeofences) {
            try {
                const wasInside = userState.get(geofenceId) || false
                const result = await this.checkGeofence(geofence, location)
                const isInside = result.isInside
                const distance = result.distance

                if (isInside !== wasInside) {
                    // State changed - trigger event
                    const eventType = isInside ? 'entry' : 'exit'

                    // Check cooldown
                    const cooldownKey = `${geofenceId}-${userId}`
                    const lastAlert = this.alertCooldowns.get(cooldownKey) || 0
                    const cooldownMinutes = geofence.settings?.cooldownMinutes || 5
                    const cooldownMs = cooldownMinutes * 60 * 1000

                    if (Date.now() - lastAlert > cooldownMs) {
                        const event: GeofenceEvent = {
                            geofence,
                            user: {
                                id: userId,
                                name: userName,
                                location
                            },
                            type: eventType,
                            distance,
                            timestamp: new Date()
                        }

                        events.push(event)

                        // Update cooldown
                        this.alertCooldowns.set(cooldownKey, Date.now())

                        // Store alert in database
                        await this.storeGeofenceAlert(event)

                        // Trigger event listeners
                        this.triggerEvent(eventType, event)

                        // Show notification
                        this.showNotification(event)
                    }
                }

                // Update user state
                userState.set(geofenceId, isInside)

            } catch (error) {
                console.error(`Error checking geofence ${geofenceId}:`, error)
            }
        }

        return events
    }

    /**
     * Check if location is inside a geofence
     */
    private async checkGeofence(
        geofence: EnhancedGeofence,
        location: LocationUpdate
    ): Promise<{ isInside: boolean; distance: number }> {
        // Calculate basic distance
        const distance = this.calculateDistance(
            location.latitude,
            location.longitude,
            geofence.latitude,
            geofence.longitude
        )

        let isInside = distance <= geofence.radius

        // Check time-based activation
        if (geofence.activeStartTime && geofence.activeEndTime) {
            const now = new Date()
            const startTime = new Date(geofence.activeStartTime)
            const endTime = new Date(geofence.activeEndTime)

            if (now < startTime || now > endTime) {
                return { isInside: false, distance }
            }
        }

        // Check directional geofencing
        if (isInside && geofence.direction !== null && geofence.directionRange !== null && location.heading !== undefined) {
            const isInDirection = this.checkDirectionalGeofence(
                location.heading,
                geofence.direction,
                geofence.directionRange
            )

            if (!isInDirection) {
                isInside = false
            }
        }

        // Check altitude geofencing
        if (isInside && (geofence.minAltitude !== null || geofence.maxAltitude !== null) && location.altitude !== undefined) {
            const isInAltitudeRange = this.checkAltitudeGeofence(
                location.altitude,
                geofence.minAltitude,
                geofence.maxAltitude
            )

            if (!isInAltitudeRange) {
                isInside = false
            }
        }

        return { isInside, distance }
    }

    /**
     * Check directional geofencing based on movement direction
     */
    private checkDirectionalGeofence(
        userHeading: number,
        geofenceDirection: number,
        directionRange: number
    ): boolean {
        const halfRange = directionRange / 2
        let minDirection = geofenceDirection - halfRange
        let maxDirection = geofenceDirection + halfRange

        // Handle wrapping around 360 degrees
        if (minDirection < 0) {
            minDirection += 360
            return userHeading >= minDirection || userHeading <= maxDirection
        } else if (maxDirection > 360) {
            maxDirection -= 360
            return userHeading >= minDirection || userHeading <= maxDirection
        } else {
            return userHeading >= minDirection && userHeading <= maxDirection
        }
    }

    /**
     * Check altitude-based geofencing
     */
    private checkAltitudeGeofence(
        userAltitude: number,
        minAltitude?: number | null,
        maxAltitude?: number | null
    ): boolean {
        if (minAltitude !== null && minAltitude !== undefined && userAltitude < minAltitude) {
            return false
        }
        if (maxAltitude !== null && maxAltitude !== undefined && userAltitude > maxAltitude) {
            return false
        }
        return true
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371e3 // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lng2 - lng1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }

    /**
     * Store geofence alert in database
     */
    private async storeGeofenceAlert(event: GeofenceEvent): Promise<void> {
        try {
            const alertData: Partial<NewGeofenceAlert> = {
                geofenceId: event.geofence.id,
                userId: event.user.id,
                vacationId: event.geofence.vacationId || undefined,
                alertType: event.type,
                latitude: event.user.location.latitude,
                longitude: event.user.location.longitude,
                distance: event.distance,
                message: this.generateAlertMessage(event),
                metadata: {
                    accuracy: event.user.location.accuracy,
                    speed: event.user.location.speed,
                    heading: event.user.location.heading,
                    triggeredAt: event.timestamp.toISOString(),
                    deviceInfo: event.user.location.metadata?.deviceInfo,
                    userAgent: navigator.userAgent
                }
            }

            await fetch('/api/geofences/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(alertData)
            })
        } catch (error) {
            console.error('Error storing geofence alert:', error)
        }
    }

    /**
     * Generate alert message based on geofence type and event
     */
    private generateAlertMessage(event: GeofenceEvent): string {
        const { geofence, type } = event
        const action = type === 'entry' ? 'entered' : 'left'

        if (geofence.settings?.customMessage) {
            return geofence.settings.customMessage
        }

        switch (geofence.type) {
            case 'attraction':
                return `${event.user.name} has ${action} ${geofence.name}`
            case 'meeting':
                return `${event.user.name} has ${action} the meeting point: ${geofence.name}`
            case 'safety':
                return `🚨 Safety Alert: ${event.user.name} has ${action} ${geofence.name}`
            case 'directional':
                return `📍 ${event.user.name} ${action} ${geofence.name} from the ${this.getDirectionName(event.geofence.direction || 0)} direction`
            case 'altitude':
                return `⛰️ ${event.user.name} ${action} ${geofence.name} at altitude zone`
            default:
                return `${event.user.name} has ${action} ${geofence.name}`
        }
    }

    /**
     * Get direction name from degrees
     */
    private getDirectionName(degrees: number): string {
        const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest']
        const index = Math.round(degrees / 45) % 8
        return directions[index]
    }

    /**
     * Trigger event listeners
     */
    private triggerEvent(eventType: string, event: GeofenceEvent): void {
        const eventTypeListeners = this.eventListeners.get(eventType) || []
        const globalListeners = this.eventListeners.get('*') || []

        // Combine listeners and execute them
        const allEventListeners = [...eventTypeListeners, ...globalListeners]
        allEventListeners.forEach((callback: (event: GeofenceEvent) => void) => {
            try {
                callback(event)
            } catch (error) {
                console.error('Error in geofence event listener:', error)
            }
        })
    }

    /**
     * Show notification for geofence event
     */
    private showNotification(event: GeofenceEvent): void {
        const { geofence, type } = event
        const message = this.generateAlertMessage(event)

        // Determine notification style based on geofence type and priority
        const priority = geofence.settings?.priority || 'medium'
        let variant: 'default' | 'destructive' | 'success' = 'default'
        let icon = '📍'

        switch (geofence.type) {
            case 'safety':
                variant = 'destructive'
                icon = '🚨'
                break
            case 'meeting':
                variant = 'success'
                icon = '👥'
                break
            case 'attraction':
                icon = '🎢'
                break
            case 'directional':
                icon = '🧭'
                break
            case 'altitude':
                icon = '⛰️'
                break
        }

        // Show toast notification
        const description = type === 'entry' ? 'Entered geofence area' : 'Left geofence area'

        if (priority === 'urgent') {
            toast.error(`${icon} ${message}`, {
                description,
                duration: 10000, // 10 seconds for urgent
            })
        } else if (variant === 'destructive') {
            toast.error(`${icon} ${message}`, {
                description,
                duration: 8000,
            })
        } else if (variant === 'success') {
            toast.success(`${icon} ${message}`, {
                description,
                duration: 5000,
            })
        } else {
            toast(`${icon} ${message}`, {
                description,
                duration: 4000,
            })
        }

        // Play sound if enabled
        if (geofence.settings?.soundAlert) {
            this.playAlertSound(geofence.type, priority)
        }

        // Vibrate if supported and enabled
        if (geofence.settings?.vibrationAlert && 'vibrate' in navigator) {
            const pattern = priority === 'urgent' ? [200, 100, 200, 100, 200] : [200, 100, 200]
            navigator.vibrate(pattern)
        }
    }

    /**
     * Play alert sound based on geofence type
     */
    private playAlertSound(type: string, priority: string): void {
        try {
            let soundFile = '/sounds/geofence-default.mp3'

            switch (type) {
                case 'safety':
                    soundFile = '/sounds/geofence-safety.mp3'
                    break
                case 'meeting':
                    soundFile = '/sounds/geofence-meeting.mp3'
                    break
                case 'attraction':
                    soundFile = '/sounds/geofence-attraction.mp3'
                    break
            }

            const audio = new Audio(soundFile)
            audio.volume = priority === 'urgent' ? 0.8 : 0.5
            audio.play().catch(error => {
                console.warn('Could not play alert sound:', error)
            })
        } catch (error) {
            console.warn('Alert sound not available:', error)
        }
    }

    /**
     * Create a new geofence
     */
    public async createGeofence(
        geofenceData: Partial<EnhancedGeofence>,
        vacationId: string,
        userId: string
    ): Promise<EnhancedGeofence> {
        const response = await fetch('/api/geofences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...geofenceData,
                vacationId,
                createdBy: userId
            })
        })

        if (!response.ok) {
            throw new Error('Failed to create geofence')
        }

        const geofence: EnhancedGeofence = await response.json()

        // Add to active geofences if active
        if (geofence.isActive) {
            this.activeGeofences.set(geofence.id, geofence)
        }

        return geofence
    }

    /**
     * Update a geofence
     */
    public async updateGeofence(geofenceId: string, updates: Partial<EnhancedGeofence>): Promise<EnhancedGeofence> {
        const response = await fetch(`/api/geofences/${geofenceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        })

        if (!response.ok) {
            throw new Error('Failed to update geofence')
        }

        const geofence: EnhancedGeofence = await response.json()

        // Update in active geofences
        if (geofence.isActive) {
            this.activeGeofences.set(geofence.id, geofence)
        } else {
            this.activeGeofences.delete(geofence.id)
        }

        return geofence
    }

    /**
     * Delete a geofence
     */
    public async deleteGeofence(geofenceId: string): Promise<void> {
        const response = await fetch(`/api/geofences/${geofenceId}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error('Failed to delete geofence')
        }

        // Remove from active geofences
        this.activeGeofences.delete(geofenceId)
    }

    /**
     * Get analytics for location tracking
     */
    public async getLocationAnalytics(
        vacationId: string,
        userId?: string,
        dateRange?: { start: Date; end: Date }
    ): Promise<{
        totalVisits: number
        averageDistance: number
        mostVisitedAreas: Array<{ name: string; visits: number }>
        timeSpentByArea: Array<{ name: string; minutes: number }>
        userTrackingData: Array<{ userId: string; locations: LocationUpdate[] }>
    }> {
        const params = new URLSearchParams({
            vacationId,
            ...(userId && { userId }),
            ...(dateRange && {
                startDate: dateRange.start.toISOString(),
                endDate: dateRange.end.toISOString()
            })
        })

        const response = await fetch(`/api/location/analytics?${params}`)
        if (!response.ok) {
            throw new Error('Failed to get location analytics')
        }

        return await response.json()
    }
}

// Export singleton instance
export const geofencingService = GeofencingService.getInstance()