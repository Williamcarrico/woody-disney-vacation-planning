'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useLocationSharing } from '@/hooks/useRealtimeDatabase'
import {
    MapPin,
    Users,
    Navigation,
    AlertTriangle,
    Clock,
    Locate
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface LocationSharingProps {
    vacationId: string
    className?: string
}

export default function LocationSharing({ vacationId, className }: LocationSharingProps) {
    const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    const {
        memberLocations,
        locationUpdates,
        loading,
        isSharing,
        toggleLocationSharing,
        shareLocation
    } = useLocationSharing(vacationId)

    const shareCurrentLocation = useCallback(async (position: GeolocationPosition) => {
        try {
            await shareLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                name: 'Current Location'
            })
        } catch {
            toast.error('Failed to share location')
        }
    }, [shareLocation])

    const getCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser')
            return
        }

        setGettingLocation(true)
        setLocationError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentPosition(position)
                setGettingLocation(false)

                // Auto-share location when enabled
                if (isSharing) {
                    shareCurrentLocation(position)
                }
            },
            (error) => {
                setLocationError(getLocationErrorMessage(error))
                setGettingLocation(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000 // Cache location for 1 minute
            }
        )
    }, [isSharing, shareCurrentLocation])

    // Get current position when location sharing is enabled
    useEffect(() => {
        if (isSharing && !currentPosition) {
            getCurrentLocation()
        }
    }, [isSharing, currentPosition, getCurrentLocation])

    const getLocationErrorMessage = (error: GeolocationPositionError): string => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return 'Location access denied. Please enable location permissions.'
            case error.POSITION_UNAVAILABLE:
                return 'Location information is unavailable.'
            case error.TIMEOUT:
                return 'Location request timed out.'
            default:
                return 'An unknown error occurred while getting location.'
        }
    }



    const handleToggleSharing = async (enabled: boolean) => {
        try {
            if (enabled && !currentPosition) {
                await getCurrentLocation()
            }

            await toggleLocationSharing(enabled)

            if (enabled) {
                toast.success('Location sharing enabled')
            } else {
                toast.success('Location sharing disabled')
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to toggle location sharing')
        }
    }

    const handleShareEmergency = async () => {
        if (!currentPosition) {
            await getCurrentLocation()
            return
        }

        try {
            await shareLocation(
                {
                    latitude: currentPosition.coords.latitude,
                    longitude: currentPosition.coords.longitude,
                    accuracy: currentPosition.coords.accuracy,
                    name: 'Emergency Location'
                },
                'Emergency assistance needed!',
                true
            )
            toast.success('Emergency location shared with group')
        } catch {
            toast.error('Failed to share emergency location')
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }

    const sortedUpdates = Object.entries(locationUpdates || {})
        .sort(([, a], [, b]) => b.timestamp - a.timestamp)
        .slice(0, 5) // Show last 5 updates

    const activeSharingMembers = Object.entries(memberLocations || {})
        .filter(([, member]) => member.isSharing)

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Location Sharing
                    <Badge variant="secondary" className="ml-auto">
                        {activeSharingMembers.length} sharing
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Location sharing toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-medium">Share my location</p>
                        <p className="text-sm text-muted-foreground">
                            Let your group see your current location
                        </p>
                    </div>
                    <Switch
                        checked={isSharing}
                        onCheckedChange={handleToggleSharing}
                        disabled={gettingLocation}
                    />
                </div>

                {/* Location error */}
                {locationError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Location Error</AlertTitle>
                        <AlertDescription>{locationError}</AlertDescription>
                    </Alert>
                )}

                {/* Emergency button */}
                <div className="space-y-2">
                    <Button
                        variant="destructive"
                        onClick={handleShareEmergency}
                        disabled={gettingLocation}
                        className="w-full"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Share Emergency Location
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        This will immediately alert your group with your location
                    </p>
                </div>

                {/* Quick location button */}
                <Button
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="w-full"
                >
                    {gettingLocation ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : (
                        <Locate className="h-4 w-4 mr-2" />
                    )}
                    Get Current Location
                </Button>

                {/* Active sharing members */}
                {activeSharingMembers.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Members Sharing Location ({activeSharingMembers.length})
                        </h4>
                        <div className="space-y-2">
                            {activeSharingMembers.map(([userId, member]) => (
                                <div key={userId} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.userPhotoURL} />
                                        <AvatarFallback className="text-xs">
                                            {getInitials(member.userName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{member.userName}</p>
                                        {member.location && (
                                            <p className="text-xs text-muted-foreground">
                                                {member.location.name || 'Unknown location'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(member.lastUpdated), { addSuffix: true })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent location updates */}
                {sortedUpdates.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Recent Updates
                        </h4>
                        <div className="space-y-2">
                            {sortedUpdates.map(([updateId, update]) => (
                                <div key={updateId} className={`p-3 rounded-lg border ${update.isEmergency ? 'border-destructive bg-destructive/5' : 'border-border'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={update.userPhotoURL} />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(update.userName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{update.userName}</p>
                                                {update.isEmergency && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Emergency
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {update.location.name}
                                            </p>
                                            {update.message && (
                                                <p className="text-sm mt-1">{update.message}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No updates message */}
                {sortedUpdates.length === 0 && activeSharingMembers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No location updates yet</p>
                        <p className="text-sm">Enable location sharing to see group member locations</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}