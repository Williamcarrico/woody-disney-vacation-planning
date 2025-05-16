import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
    MapPin,
    Users,
    Share,
    Clock,
    RefreshCw,
    Eye,
    EyeOff,
    Info,
    Map as MapIcon,
    AlertCircle,
} from "lucide-react"
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { doc, collection, getDoc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, limit, addDoc, getDocs } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

// Types
interface LocationUpdate {
    id: string
    userId: string
    userName: string
    userPhotoURL?: string
    location: {
        name: string
        latitude: number
        longitude: number
        parkId?: string
        attractionId?: string
        accuracy?: number
    }
    timestamp: Date
    message?: string
}

interface UserLocationStatus {
    userId: string
    userName: string
    userPhotoURL?: string
    isSharing: boolean
    lastUpdated?: Date
    lastLocation?: {
        name: string
        latitude: number
        longitude: number
        parkId?: string
        attractionId?: string
    }
}

interface LocationSharingProps {
    readonly vacationId: string
}

export default function LocationSharing({ vacationId }: LocationSharingProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [locationName, setLocationName] = useState<string>('')
    const [isManualUpdate, setIsManualUpdate] = useState(false)
    const [isAutoUpdateActive, setIsAutoUpdateActive] = useState(false)
    const [locationUpdateInterval, setLocationUpdateInterval] = useState<NodeJS.Timeout | null>(null)

    // Query for party members' location sharing status
    const { data: locationStatuses, isLoading: isStatusesLoading } = useQuery({
        queryKey: ['locationSharingStatuses', vacationId],
        queryFn: async () => {
            const statusesRef = collection(firestore, 'vacations', vacationId, 'locationSharing')
            const q = query(statusesRef)
            const snapshot = await getDocs(q)

            return snapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    userId: doc.id,
                    userName: data.userName,
                    userPhotoURL: data.userPhotoURL,
                    isSharing: data.isSharing,
                    lastUpdated: data.lastUpdated?.toDate(),
                    lastLocation: data.lastLocation
                } as UserLocationStatus
            })
        },
        enabled: !!vacationId
    })

    // Query for real-time location updates
    const { data: locationUpdates } = useQuery({
        queryKey: ['locationUpdates', vacationId],
        queryFn: () => {
            return new Promise<LocationUpdate[]>((resolve) => {
                const updatesRef = collection(firestore, 'vacations', vacationId, 'locationUpdates')
                const q = query(updatesRef, orderBy('timestamp', 'desc'), limit(50))

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const updates = snapshot.docs.map(doc => {
                        const data = doc.data()
                        return {
                            id: doc.id,
                            userId: data.userId,
                            userName: data.userName,
                            userPhotoURL: data.userPhotoURL,
                            location: data.location,
                            timestamp: data.timestamp?.toDate() || new Date(),
                            message: data.message
                        } as LocationUpdate
                    })

                    resolve(updates)
                })

                // Cleanup function
                return () => unsubscribe()
            })
        },
        enabled: !!vacationId,
        staleTime: Infinity, // Real-time data is managed via onSnapshot
    })

    // Current user's sharing status
    const currentUserStatus = locationStatuses?.find(status => status.userId === user?.uid) || null

    // Active sharers (currently sharing their location)
    const activeSharings = locationStatuses?.filter(status => status.isSharing) || []

    // Set or update user location sharing status
    const updateSharingStatusMutation = useMutation({
        mutationFn: async (isSharing: boolean) => {
            if (!user) throw new Error('User not authenticated')

            const statusRef = doc(firestore, 'vacations', vacationId, 'locationSharing', user.uid)
            const statusDoc = await getDoc(statusRef)

            if (!statusDoc.exists()) {
                // Create new status
                await setDoc(statusRef, {
                    userName: user.displayName || 'Anonymous',
                    userPhotoURL: user.photoURL,
                    isSharing,
                    lastUpdated: serverTimestamp()
                })
            } else {
                // Update existing status
                await updateDoc(statusRef, {
                    isSharing,
                    lastUpdated: serverTimestamp()
                })
            }

            return isSharing
        },
        onSuccess: (isSharing) => {
            setIsLocationSharingEnabled(isSharing)

            // Start or stop location updates based on sharing status
            if (isSharing) {
                startLocationUpdates()
                toast("Location sharing enabled", {
                    description: "Your party members can now see your location"
                })
            } else {
                stopLocationUpdates()
                toast("Location sharing disabled", {
                    description: "Your location is no longer being shared"
                })
            }

            queryClient.invalidateQueries({ queryKey: ['locationSharingStatuses', vacationId] })
        },
        onError: (error) => {
            toast.error("Error updating sharing status", {
                description: error instanceof Error ? error.message : "Unknown error occurred"
            })
        }
    })

    // Share location update mutation
    const shareLocationMutation = useMutation({
        mutationFn: async ({
            location,
            name,
            message
        }: {
            location: GeolocationPosition,
            name?: string,
            message?: string
        }) => {
            if (!user) throw new Error('User not authenticated')

            const updatesRef = collection(firestore, 'vacations', vacationId, 'locationUpdates')

            // Create location update
            const updateData = {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userPhotoURL: user.photoURL,
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy,
                    name: name || 'Current Location'
                },
                timestamp: serverTimestamp(),
                message
            }

            const docRef = await addDoc(updatesRef, updateData)

            // Also update the user's current location in their status
            const statusRef = doc(firestore, 'vacations', vacationId, 'locationSharing', user.uid)
            await updateDoc(statusRef, {
                lastUpdated: serverTimestamp(),
                lastLocation: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    name: name || 'Current Location'
                }
            })

            return { id: docRef.id, ...updateData }
        },
        onSuccess: () => {
            if (isManualUpdate) {
                toast("Location shared", {
                    description: "Your location has been shared with your party"
                })
                setIsManualUpdate(false)
                setLocationName('')
            }

            queryClient.invalidateQueries({ queryKey: ['locationSharingStatuses', vacationId] })
        },
        onError: (error) => {
            toast.error("Error sharing location", {
                description: error instanceof Error ? error.message : "Unknown error occurred"
            })
        }
    })

    // Get current location
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser')
            return
        }

        setLocationError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation(position)
                setLocationError(null)

                // If this is an auto-update and sharing is enabled, share the location
                if (isLocationSharingEnabled && !isManualUpdate) {
                    shareLocationMutation.mutate({
                        location: position,
                        name: 'Current Location',
                    })
                }
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Location permission denied')
                        break
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Location information is unavailable')
                        break
                    case error.TIMEOUT:
                        setLocationError('Location request timed out')
                        break
                    default:
                        setLocationError('An unknown error occurred')
                        break
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }, [isLocationSharingEnabled, isManualUpdate, shareLocationMutation])

    // Initialize state based on current user's status
    useEffect(() => {
        if (currentUserStatus) {
            setIsLocationSharingEnabled(currentUserStatus.isSharing)

            // If sharing is enabled, start location updates
            if (currentUserStatus.isSharing && !isAutoUpdateActive) {
                // This avoids the dependency on startLocationUpdates
                getCurrentLocation()

                if (!isAutoUpdateActive) {
                    const interval = setInterval(() => {
                        getCurrentLocation()
                    }, 5 * 60 * 1000) // 5 minutes

                    setLocationUpdateInterval(interval)
                    setIsAutoUpdateActive(true)
                }
            }
        }
    }, [currentUserStatus, isAutoUpdateActive, getCurrentLocation])

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (locationUpdateInterval) {
                clearInterval(locationUpdateInterval)
            }
        }
    }, [locationUpdateInterval])

    // Start automatic location updates
    const startLocationUpdates = useCallback(() => {
        if (isAutoUpdateActive) return

        // Get location immediately
        getCurrentLocation()

        // Then set up interval for regular updates (every 5 minutes)
        const interval = setInterval(() => {
            getCurrentLocation()
        }, 5 * 60 * 1000) // 5 minutes

        setLocationUpdateInterval(interval)
        setIsAutoUpdateActive(true)
    }, [isAutoUpdateActive, getCurrentLocation, isLocationSharingEnabled, isManualUpdate, shareLocationMutation])

    // Stop automatic location updates
    const stopLocationUpdates = () => {
        if (locationUpdateInterval) {
            clearInterval(locationUpdateInterval)
            setLocationUpdateInterval(null)
        }

        setIsAutoUpdateActive(false)
    }

    // Toggle location sharing
    const handleToggleLocationSharing = () => {
        updateSharingStatusMutation.mutate(!isLocationSharingEnabled)
    }

    // Manually share current location
    const handleShareLocation = () => {
        if (!currentLocation) {
            getCurrentLocation()
            setIsManualUpdate(true)
            return
        }

        shareLocationMutation.mutate({
            location: currentLocation,
            name: locationName || 'Current Location',
            message: `I'm at ${locationName || 'this location'} now!`
        })
    }

    // Update location manually
    const handleUpdateLocation = () => {
        getCurrentLocation()

        toast("Location updated", {
            description: "Your location has been refreshed"
        })
    }

    // Format time ago
    const formatTimeAgo = (date: Date) => {
        return formatDistanceToNow(date, { addSuffix: true })
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (isStatusesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location Sharing
                        </CardTitle>
                        <CardDescription>
                            Share your location with your vacation party
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="location-sharing"
                                checked={isLocationSharingEnabled}
                                onCheckedChange={handleToggleLocationSharing}
                            />
                            <span className="text-sm font-medium">
                                {isLocationSharingEnabled ? 'On' : 'Off'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {locationError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{locationError}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="map">
                    <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="map">Map</TabsTrigger>
                        <TabsTrigger value="party">Party Locations</TabsTrigger>
                        <TabsTrigger value="history">Location History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="map">
                        <div className="bg-muted rounded-md overflow-hidden" style={{ height: '300px' }}>
                            {/* Placeholder for the map - in a real app, this would be a map component */}
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="text-center">
                                    <MapIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-muted-foreground">Interactive map will appear here</p>
                                    <p className="text-xs text-muted-foreground mt-1">Showing {activeSharings.length} party members</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUpdateLocation}
                                    disabled={!isLocationSharingEnabled}
                                    className="gap-1"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh Location
                                </Button>

                                <div className="flex gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="outline" className="py-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Updated {currentUserStatus?.lastUpdated
                                                        ? formatTimeAgo(currentUserStatus.lastUpdated)
                                                        : 'never'}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Last location update time</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <Badge variant={isLocationSharingEnabled ? "default" : "secondary"} className="py-1">
                                        {isLocationSharingEnabled
                                            ? <Eye className="h-3 w-3 mr-1" />
                                            : <EyeOff className="h-3 w-3 mr-1" />
                                        }
                                        {isLocationSharingEnabled ? 'Visible to party' : 'Hidden'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Share with a message</div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Where are you? (e.g., Space Mountain)"
                                            value={locationName}
                                            onChange={(e) => setLocationName(e.target.value)}
                                            disabled={!isLocationSharingEnabled}
                                        />
                                        <Button
                                            onClick={handleShareLocation}
                                            disabled={!isLocationSharingEnabled}
                                        >
                                            <Share className="h-4 w-4 mr-2" />
                                            Share
                                        </Button>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Sharing your location will notify other party members
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="party">
                        <div className="space-y-4 mb-4">
                            <div className="text-sm font-medium flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Party Members ({activeSharings.length} sharing)
                            </div>

                            {locationStatuses && locationStatuses.length > 0 ? (
                                <ScrollArea className="h-[250px]">
                                    <div className="space-y-2">
                                        {locationStatuses.map(status => (
                                            <div
                                                key={status.userId}
                                                className={cn(
                                                    "flex items-center justify-between border rounded-md p-3",
                                                    status.isSharing ? "border-primary/30 bg-primary/5" : "border-muted"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={status.userPhotoURL} />
                                                        <AvatarFallback>{getInitials(status.userName)}</AvatarFallback>
                                                    </Avatar>

                                                    <div>
                                                        <div className="font-medium">{status.userName}</div>
                                                        {status.isSharing ? (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-green-500" />
                                                                {status.lastLocation?.name || 'Unknown location'}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <EyeOff className="h-3 w-3" />
                                                                Not sharing location
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {status.isSharing && status.lastUpdated && (
                                                    <Badge variant="outline" className="h-5 text-xs">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatTimeAgo(status.lastUpdated)}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="text-center p-8 text-muted-foreground">
                                    <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p>No party members yet</p>
                                    <p className="text-sm">Invite others to see their location</p>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Location Privacy</p>
                                    <p>Your location is only shared with your vacation party members and only when you have sharing turned on. You can turn it off at any time.</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        {locationUpdates && locationUpdates.length > 0 ? (
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-4">
                                    {locationUpdates.map(update => (
                                        <motion.div
                                            key={update.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-3 border-b pb-4"
                                        >
                                            <Avatar className="mt-1">
                                                <AvatarImage src={update.userPhotoURL} />
                                                <AvatarFallback>{getInitials(update.userName)}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <div className="font-medium">{update.userName}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(update.timestamp, 'MMM d, h:mm a')}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 text-sm text-primary">
                                                    <MapPin className="h-4 w-4" />
                                                    {update.location.name}
                                                </div>

                                                {update.message && (
                                                    <div className="mt-1 text-sm">{update.message}</div>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-1 h-7 px-2 text-xs"
                                                >
                                                    View on Map
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="text-center p-8 text-muted-foreground">
                                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No location updates yet</p>
                                <p className="text-sm">Share your location to see updates here</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>

            {!isLocationSharingEnabled && (
                <CardFooter className="border-t">
                    <Button onClick={handleToggleLocationSharing} className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Enable Location Sharing
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}