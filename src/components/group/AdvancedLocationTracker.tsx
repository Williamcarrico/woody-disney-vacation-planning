'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    MapPin,
    Users,
    Navigation,
    AlertTriangle,
    WifiOff,
    Battery,
    Target,
    Share2,
    Activity,
    Locate,
    MessageCircle,
    X,
    Circle,
    Maximize2,
    Minimize2
} from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore'
import { firestore as db } from '@/lib/firebase/firebase.config'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Import Magic UI components for futuristic effects
import { Particles } from '@/components/magicui/particles'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card'
import { BlurFade } from '@/components/magicui/blur-fade'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { Meteors } from '@/components/magicui/meteors'

// Enhanced Types
interface PartyMember {
    id: string
    userId: string
    name: string
    photoURL?: string
    isOnline: boolean
    lastSeen: Date
    role: 'leader' | 'coordinator' | 'member'
    preferences: LocationPreferences
    deviceInfo: DeviceInfo
}

interface LocationPreferences {
    sharingEnabled: boolean
    precision: 'exact' | 'approximate' | 'area'
    notifications: boolean
    emergencyOnly: boolean
    quietHours: {
        enabled: boolean
        start: string
        end: string
    }
}

interface DeviceInfo {
    type: 'mobile' | 'tablet' | 'desktop'
    battery?: number
    networkStatus: 'online' | 'offline' | 'poor'
    lastHeartbeat: Date
}

interface LocationUpdate {
    id: string
    userId: string
    userName: string
    userPhotoURL?: string
    coordinates: {
        latitude: number
        longitude: number
        accuracy: number
        altitude?: number
        heading?: number
        speed?: number
    }
    timestamp: Date
    parkArea?: string
    attraction?: string
    landmark?: string
    isManual: boolean
    confidence: number
    metadata: {
        device: string
        battery?: number
        networkQuality: 'excellent' | 'good' | 'fair' | 'poor'
    }
}

interface MeetupRequest {
    id: string
    requesterId: string
    requesterName: string
    targetUsers: string[]
    location: {
        name: string
        coordinates: {
            latitude: number
            longitude: number
        }
        parkArea?: string
    }
    message: string
    estimatedTime: number
    status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
    timestamp: Date
    responses: {
        [userId: string]: {
            status: 'pending' | 'accepted' | 'declined'
            eta?: number
            message?: string
            timestamp: Date
        }
    }
}

interface AdvancedLocationTrackerProps {
    readonly vacationId: string
    readonly onSendMessage?: (message: string) => void
    readonly isFullscreen?: boolean
    readonly onToggleFullscreen?: () => void
}

// Battery API type definition
interface BatteryManager extends EventTarget {
    charging: boolean
    chargingTime: number
    dischargingTime: number
    level: number
    addEventListener(type: 'chargingchange' | 'chargingtimechange' | 'dischargingtimechange' | 'levelchange', listener: (this: this, ev: Event) => void, useCapture?: boolean): void
}

interface NavigatorWithBattery extends Navigator {
    getBattery(): Promise<BatteryManager>
}

// Connection and Location Hooks
function useLocationTracking() {
    const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null)
    const [isTracking, setIsTracking] = useState(false)
    const [accuracy, setAccuracy] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)
    const watchIdRef = useRef<number | null>(null)

    const startTracking = useCallback(async (highAccuracy = true) => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported')
            return
        }

        setIsTracking(true)
        setError(null)

        const options: PositionOptions = {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: 30000
        }

        const handleSuccess = (position: GeolocationPosition) => {
            const locationUpdate: LocationUpdate = {
                id: Date.now().toString(),
                userId: 'current-user',
                userName: 'You',
                coordinates: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude || undefined,
                    heading: position.coords.heading || undefined,
                    speed: position.coords.speed || undefined
                },
                timestamp: new Date(),
                isManual: false,
                confidence: Math.min(1, 100 / position.coords.accuracy),
                metadata: {
                    device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
                    networkQuality: navigator.onLine ? 'good' : 'poor'
                }
            }

            setCurrentLocation(locationUpdate)
            setAccuracy(position.coords.accuracy)
        }

        const handleError = (error: GeolocationPositionError) => {
            let errorMessage = 'Location error'
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location permission denied'
                    break
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location unavailable'
                    break
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out'
                    break
            }
            setError(errorMessage)
            setIsTracking(false)
        }

        // Get initial position
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            options
        )
    }, [])

    const stopTracking = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setIsTracking(false)
    }, [])

    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    return {
        currentLocation,
        isTracking,
        accuracy,
        error,
        startTracking,
        stopTracking
    }
}

function useBatteryStatus() {
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
    const [isCharging, setIsCharging] = useState<boolean>(false)

    useEffect(() => {
        // Check for battery API with proper typing
        const checkBatteryAPI = async () => {
            if ('getBattery' in navigator) {
                try {
                    const nav = navigator as NavigatorWithBattery
                    const battery = await nav.getBattery()
                    setBatteryLevel(battery.level * 100)
                    setIsCharging(battery.charging)

                    battery.addEventListener('levelchange', () => {
                        setBatteryLevel(battery.level * 100)
                    })

                    battery.addEventListener('chargingchange', () => {
                        setIsCharging(battery.charging)
                    })
                } catch (error) {
                    console.warn('Battery API not available:', error)
                }
            }
        }

        checkBatteryAPI()
    }, [])

    return { batteryLevel, isCharging }
}

export default function AdvancedLocationTracker({
    vacationId,
    onSendMessage,
    isFullscreen = false,
    onToggleFullscreen
}: AdvancedLocationTrackerProps) {
    const { user } = useAuth()
    const locationTracking = useLocationTracking()
    const { batteryLevel } = useBatteryStatus()

    // Enhanced state management
    const [sharingEnabled, setSharingEnabled] = useState(true)
    const [precision, setPrecision] = useState<'exact' | 'approximate' | 'area'>('exact')
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [emergencyMode] = useState(false)

    // Real-time data subscriptions
    const { data: partyMembers, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['partyMembers', vacationId],
        queryFn: async () => {
            const membersRef = collection(db, 'vacations', vacationId, 'members')
            const snapshot = await getDocs(membersRef)
            return snapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    id: doc.id,
                    userId: data.userId || '',
                    name: data.name || '',
                    photoURL: data.photoURL,
                    isOnline: data.isOnline || false,
                    lastSeen: data.lastSeen?.toDate() || new Date(),
                    role: data.role || 'member',
                    preferences: data.preferences || {
                        sharingEnabled: true,
                        precision: 'exact',
                        notifications: true,
                        emergencyOnly: false,
                        quietHours: { enabled: false, start: '22:00', end: '08:00' }
                    },
                    deviceInfo: data.deviceInfo || {
                        type: 'mobile',
                        networkStatus: 'online',
                        lastHeartbeat: new Date()
                    }
                } satisfies PartyMember
            })
        },
        enabled: !!vacationId
    })

    const { data: locationUpdates } = useQuery({
        queryKey: ['locationUpdates', vacationId],
        queryFn: () => {
            return new Promise<LocationUpdate[]>((resolve) => {
                const updatesRef = collection(db, 'vacations', vacationId, 'locationUpdates')
                const q = query(updatesRef, orderBy('timestamp', 'desc'), limit(100))

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const updates = snapshot.docs.map(doc => {
                        const data = doc.data()
                        return {
                            id: doc.id,
                            userId: data.userId || '',
                            userName: data.userName || '',
                            userPhotoURL: data.userPhotoURL,
                            coordinates: data.coordinates || { latitude: 0, longitude: 0, accuracy: 0 },
                            timestamp: data.timestamp?.toDate() || new Date(),
                            parkArea: data.parkArea,
                            attraction: data.attraction,
                            landmark: data.landmark,
                            isManual: data.isManual || false,
                            confidence: data.confidence || 0,
                            metadata: data.metadata || { device: 'unknown', networkQuality: 'poor' }
                        } satisfies LocationUpdate
                    })
                    resolve(updates)
                })

                return () => unsubscribe()
            })
        },
        enabled: !!vacationId,
        staleTime: Infinity
    })

    const { data: meetupRequests } = useQuery({
        queryKey: ['meetupRequests', vacationId],
        queryFn: () => {
            return new Promise<MeetupRequest[]>((resolve) => {
                const requestsRef = collection(db, 'vacations', vacationId, 'meetupRequests')
                const q = query(requestsRef, orderBy('timestamp', 'desc'), limit(20))

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const requests = snapshot.docs.map(doc => {
                        const data = doc.data()
                        return {
                            id: doc.id,
                            requesterId: data.requesterId || '',
                            requesterName: data.requesterName || '',
                            targetUsers: data.targetUsers || [],
                            location: data.location || { name: '', coordinates: { latitude: 0, longitude: 0 } },
                            message: data.message || '',
                            estimatedTime: data.estimatedTime || 0,
                            status: data.status || 'pending',
                            timestamp: data.timestamp?.toDate() || new Date(),
                            responses: data.responses || {}
                        } satisfies MeetupRequest
                    })
                    resolve(requests)
                })

                return () => unsubscribe()
            })
        },
        enabled: !!vacationId,
        staleTime: Infinity
    })

    // Share location mutation
    const shareLocationMutation = useMutation({
        mutationFn: async (locationData: Partial<LocationUpdate>) => {
            if (!user || !locationTracking.currentLocation) {
                throw new Error('No location available')
            }

            const updatesRef = collection(db, 'vacations', vacationId, 'locationUpdates')

            const updateData = {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userPhotoURL: user.photoURL,
                coordinates: locationTracking.currentLocation.coordinates,
                timestamp: serverTimestamp(),
                isManual: locationData.isManual || false,
                confidence: locationTracking.currentLocation.confidence,
                metadata: {
                    ...locationTracking.currentLocation.metadata,
                    battery: batteryLevel,
                    networkQuality: navigator.onLine ? 'good' : 'poor'
                },
                ...locationData
            }

            const docRef = await addDoc(updatesRef, updateData)
            return { id: docRef.id, ...updateData }
        },
        onSuccess: () => {
            toast.success('Location shared successfully')
        },
        onError: (error) => {
            toast.error('Failed to share location', {
                description: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    })

    // Auto-share location when tracking starts
    useEffect(() => {
        if (locationTracking.isTracking && locationTracking.currentLocation && sharingEnabled) {
            const interval = setInterval(() => {
                shareLocationMutation.mutate({
                    isManual: false
                })
            }, 30000) // Share every 30 seconds

            return () => clearInterval(interval)
        }
    }, [locationTracking.isTracking, locationTracking.currentLocation, sharingEnabled, shareLocationMutation])

    // Get latest location for each member
    const memberLocations = useMemo(() => {
        if (!locationUpdates) return new Map()

        const locationMap = new Map<string, LocationUpdate>()

        locationUpdates.forEach(update => {
            const existing = locationMap.get(update.userId)
            if (!existing || update.timestamp > existing.timestamp) {
                locationMap.set(update.userId, update)
            }
        })

        return locationMap
    }, [locationUpdates])

    // Calculate distances and ETAs
    const calculateDistance = useCallback((
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371 // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }, [])

    // Handle emergency location broadcast
    const handleEmergencyBroadcast = useCallback(() => {
        if (!locationTracking.currentLocation) {
            toast.error('Location not available')
            return
        }

        shareLocationMutation.mutate({
            isManual: true,
            parkArea: 'EMERGENCY',
            attraction: 'Emergency Location Broadcast'
        })

        // Send emergency message if callback provided
        if (onSendMessage) {
            onSendMessage(`🚨 EMERGENCY: I need help at my current location! ${locationTracking.currentLocation.coordinates.latitude}, ${locationTracking.currentLocation.coordinates.longitude}`)
        }

        toast.success('Emergency location broadcast sent')
    }, [locationTracking.currentLocation, onSendMessage, shareLocationMutation])

    // Render member status card
    const renderMemberCard = useCallback((member: PartyMember, location?: LocationUpdate) => {
        const distance = location && locationTracking.currentLocation
            ? calculateDistance(
                locationTracking.currentLocation.coordinates.latitude,
                locationTracking.currentLocation.coordinates.longitude,
                location.coordinates.latitude,
                location.coordinates.longitude
            )
            : null

        return (
            <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
            >
                <NeonGradientCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={member.photoURL} />
                                <AvatarFallback>
                                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Status indicator */}
                            <div
                                className={cn(
                                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full status-border",
                                    member.isOnline ? "bg-green-500" : "bg-gray-400"
                                )}
                            >
                                {member.deviceInfo.networkStatus === 'poor' && (
                                    <WifiOff className="w-2 h-2 text-white absolute top-0.5 left-0.5" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium truncate">{member.name}</h3>
                                <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                                    {member.role}
                                </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {location ? (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        <span>
                                            {distance !== null && (
                                                <span className="font-medium">
                                                    {distance < 0.1 ? 'Very close' : `${distance.toFixed(1)}km away`}
                                                </span>
                                            )}
                                            {location.parkArea && ` • ${location.parkArea}`}
                                        </span>
                                    </div>
                                ) : (
                                    <span>Location unknown</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            {location && (
                                <div className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(location.timestamp, { addSuffix: true })}
                                </div>
                            )}

                            {member.deviceInfo.battery && (
                                <div className="flex items-center gap-1 text-xs">
                                    <Battery className={cn(
                                        "w-3 h-3",
                                        member.deviceInfo.battery > 20 ? "text-green-500" : "text-red-500"
                                    )} />
                                    <span>{Math.round(member.deviceInfo.battery)}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {location && (
                        <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Circle className={cn(
                                        "w-2 h-2",
                                        location.confidence > 0.8 ? "text-green-500" :
                                            location.confidence > 0.5 ? "text-yellow-500" : "text-red-500"
                                    )} />
                                    <span>
                                        Accuracy: {location.coordinates.accuracy.toFixed(0)}m
                                    </span>
                                </div>

                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            // Navigate to member location
                                            const url = `https://maps.google.com/?q=${location.coordinates.latitude},${location.coordinates.longitude}`
                                            window.open(url, '_blank')
                                        }}
                                    >
                                        <Navigation className="w-3 h-3" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (onSendMessage) {
                                                onSendMessage(`Hey ${member.name}, what's your status?`)
                                            }
                                        }}
                                    >
                                        <MessageCircle className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </NeonGradientCard>
            </motion.div>
        )
    }, [locationTracking.currentLocation, calculateDistance, onSendMessage])

    // Loading state
    if (isLoadingMembers) {
        return (
            <div className="relative flex items-center justify-center h-64">
                <Particles className="absolute inset-0" quantity={30} />
                <div className="relative z-10 text-center">
                    <motion.div
                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <TypingAnimation text="Loading party locations..." className="text-sm text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full">
            <Particles className="absolute inset-0 pointer-events-none" quantity={20} />

            <MagicCard className="w-full overflow-hidden">
                {/* Header */}
                <CardHeader className="relative border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                    <Meteors number={3} />

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <MapPin className="h-6 w-6" />
                                <motion.div
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>

                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span>Location Tracker</span>
                                    {emergencyMode && (
                                        <Badge variant="destructive" className="animate-pulse">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Emergency
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Real-time party member tracking and coordination
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Emergency button */}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleEmergencyBroadcast}
                                className="animate-pulse"
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Emergency
                            </Button>

                            {/* Fullscreen toggle */}
                            {onToggleFullscreen && (
                                <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Location sharing controls */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Location Sharing</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Share your location with party members
                                    </p>
                                </div>
                                <Switch
                                    checked={sharingEnabled}
                                    onCheckedChange={setSharingEnabled}
                                />
                            </div>

                            {sharingEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Precision</label>
                                        <select
                                            value={precision}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (value === 'exact' || value === 'approximate' || value === 'area') {
                                                    setPrecision(value)
                                                }
                                            }}
                                            className="w-full p-2 border rounded-md"
                                            aria-label="Location sharing precision"
                                        >
                                            <option value="exact">Exact Location</option>
                                            <option value="approximate">Approximate</option>
                                            <option value="area">General Area</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Notifications</span>
                                        <Switch
                                            checked={notificationsEnabled}
                                            onCheckedChange={setNotificationsEnabled}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <ShimmerButton
                                            onClick={() => locationTracking.startTracking()}
                                            disabled={locationTracking.isTracking}
                                            className="flex-1"
                                        >
                                            {locationTracking.isTracking ? (
                                                <>
                                                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                                                    Tracking
                                                </>
                                            ) : (
                                                <>
                                                    <Locate className="w-4 h-4 mr-2" />
                                                    Start
                                                </>
                                            )}
                                        </ShimmerButton>

                                        {locationTracking.isTracking && (
                                            <Button
                                                variant="outline"
                                                onClick={locationTracking.stopTracking}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Current location status */}
                        {locationTracking.currentLocation && (
                            <BlurFade inView>
                                <NeonGradientCard className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4 text-primary" />
                                                Your Location
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Accuracy: {locationTracking.accuracy.toFixed(0)}m
                                                {batteryLevel && ` • Battery: ${Math.round(batteryLevel)}%`}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => shareLocationMutation.mutate({ isManual: true })}
                                            >
                                                <Share2 className="w-4 h-4 mr-2" />
                                                Share Now
                                            </Button>
                                        </div>
                                    </div>
                                    <BorderBeam />
                                </NeonGradientCard>
                            </BlurFade>
                        )}

                        {/* Party members */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Party Members ({partyMembers?.length || 0})
                                </h3>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        toast.info('Meetup request feature coming soon!')
                                    }}
                                >
                                    <Target className="w-4 h-4 mr-2" />
                                    Request Meetup
                                </Button>
                            </div>

                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {partyMembers?.map(member =>
                                            renderMemberCard(member, memberLocations.get(member.userId))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Recent meetup requests */}
                        {meetupRequests && meetupRequests.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Navigation className="w-4 h-4" />
                                    Recent Meetup Requests
                                </h3>

                                <div className="space-y-2">
                                    {meetupRequests.slice(0, 3).map(request => (
                                        <div key={request.id} className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{request.requesterName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {request.location.name}
                                                    </p>
                                                </div>
                                                <Badge variant={
                                                    request.status === 'pending' ? 'default' :
                                                        request.status === 'accepted' ? 'secondary' :
                                                            'outline'
                                                }>
                                                    {request.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </MagicCard>
        </div>
    )
}