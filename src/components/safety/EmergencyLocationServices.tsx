'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
    AlertTriangle,
    Shield,
    Phone,
    MapPin,
    Users,
    Clock,
    Heart,
    CheckCircle,
    Siren,
    UserCheck,
    UserX,
    Timer,
    WifiOff,
    Battery
} from "lucide-react"
import { formatDistanceToNow, differenceInMinutes } from 'date-fns'
import { cn } from '@/lib/utils'
import { geofencingService } from '@/lib/services/geofencing'

// Import Magic UI components
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { BlurFade } from '@/components/magicui/blur-fade'

interface EmergencyLocationServicesProps {
    vacationId: string
    className?: string
}

interface PartyMember {
    id: string
    name: string
    age?: number
    relationship: string
    phoneNumber?: string
    emergencyContact?: string
    lastKnownLocation?: {
        latitude: number
        longitude: number
        timestamp: Date
        accuracy?: number
        parkArea?: string
    }
    isOnline: boolean
    batteryLevel?: number
    lastSeen: Date
}

interface EmergencyAlert {
    id: string
    type: 'separation' | 'lost-child' | 'medical' | 'security' | 'weather' | 'park-closure'
    memberId?: string
    memberName?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    location?: {
        latitude: number
        longitude: number
        parkArea?: string
        nearbyLandmarks?: string[]
    }
    timestamp: Date
    isResolved: boolean
    actions: string[]
    estimatedResponse?: number // minutes
}

interface SafetyGeofence {
    id: string
    name: string
    type: 'safe-zone' | 'danger-zone' | 'meeting-point' | 'child-area'
    coordinates: { lat: number; lng: number }
    radius: number
    isActive: boolean
    alertOnExit?: boolean
    alertOnEntry?: boolean
    allowedMembers?: string[]
    timeRestrictions?: {
        startTime: string
        endTime: string
    }
}

export default function EmergencyLocationServices({
    vacationId,
    className
}: EmergencyLocationServicesProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // State management
    const [isEmergencyMode, setIsEmergencyMode] = useState(false)
    const [separationAlertDistance, setSeparationAlertDistance] = useState(200) // meters
    const [childSafetyMode, setChildSafetyMode] = useState(false)
    const [soundAlerts, setSoundAlerts] = useState(true)
    const [vibrationAlerts, setVibrationAlerts] = useState(true)
    const [emergencyContactNumber, setEmergencyContactNumber] = useState('911')

    const alertSoundRef = useRef<HTMLAudioElement | null>(null)

    // Mock party member data (in real app, fetch from vacation API)
    const [partyMembers] = useState<PartyMember[]>([
        {
            id: user?.uid || 'user1',
            name: user?.displayName || 'You',
            age: 30,
            relationship: 'self',
            phoneNumber: '+1234567890',
            isOnline: true,
            batteryLevel: 85,
            lastSeen: new Date()
        },
        {
            id: 'child1',
            name: 'Emma',
            age: 8,
            relationship: 'daughter',
            isOnline: true,
            batteryLevel: 65,
            lastSeen: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
    ])

    // Fetch active emergency alerts
    const { data: emergencyAlerts } = useQuery({
        queryKey: ['emergency-alerts', vacationId],
        queryFn: async () => {
            // Mock emergency alerts (in real app, fetch from API)
            const alerts: EmergencyAlert[] = []

            // Check for separation alerts
            partyMembers.forEach(member => {
                if (member.id !== user?.uid && member.lastKnownLocation) {
                    const timeSinceLastSeen = differenceInMinutes(new Date(), member.lastSeen)

                    if (timeSinceLastSeen > 30) { // 30 minutes without contact
                        alerts.push({
                            id: `separation-${member.id}`,
                            type: 'separation',
                            memberId: member.id,
                            memberName: member.name,
                            severity: timeSinceLastSeen > 60 ? 'high' : 'medium',
                            message: `${member.name} hasn't been seen for ${timeSinceLastSeen} minutes`,
                            location: member.lastKnownLocation ? {
                                latitude: member.lastKnownLocation.latitude,
                                longitude: member.lastKnownLocation.longitude,
                                parkArea: member.lastKnownLocation.parkArea
                            } : undefined,
                            timestamp: member.lastSeen,
                            isResolved: false,
                            actions: [
                                'Send location ping',
                                'Call member',
                                'Contact Disney security',
                                'Set meeting point'
                            ],
                            estimatedResponse: 5
                        })
                    }
                }
            })

            return alerts
        },
        enabled: !!vacationId,
        refetchInterval: 30000 // Check every 30 seconds
    })

    // Emergency alert mutation
    const triggerEmergencyMutation = useMutation({
        mutationFn: async (alertData: {
            type: string
            severity: string
            message: string
            location?: {
                latitude: number
                longitude: number
                parkArea?: string
            }
        }) => {
            // In real app, this would contact Disney security, emergency services, etc.
            const response = await fetch(`/api/vacations/${vacationId}/emergency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...alertData,
                    userId: user?.uid,
                    timestamp: new Date().toISOString()
                })
            })

            if (!response.ok) throw new Error('Failed to trigger emergency alert')
            return response.json()
        },
        onSuccess: () => {
            toast.success("Emergency alert sent!")
            queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] })
        },
        onError: () => {
            toast.error("Failed to send emergency alert")
        }
    })

    // Location ping mutation
    const sendLocationPingMutation = useMutation({
        mutationFn: async (memberId: string) => {
            // Send high-priority location request to specific party member
            const response = await fetch(`/api/user/${memberId}/location-ping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requesterId: user?.uid,
                    priority: 'urgent',
                    message: 'Please share your current location immediately'
                })
            })

            if (!response.ok) throw new Error('Failed to send location ping')
            return response.json()
        },
        onSuccess: (data, memberId) => {
            const member = partyMembers.find(m => m.id === memberId)
            toast.success(`Location ping sent to ${member?.name}`)
        }
    })

    // Set up emergency geofences
    useEffect(() => {
        if (!vacationId) return

        const setupEmergencyGeofences = async () => {
            // Create safe zones around major landmarks
            const safeZones: SafetyGeofence[] = [
                {
                    id: 'castle-safe-zone',
                    name: 'Castle Emergency Meeting Point',
                    type: 'meeting-point',
                    coordinates: { lat: 28.4177, lng: -81.5812 },
                    radius: 100,
                    isActive: true,
                    alertOnEntry: false,
                    alertOnExit: false
                },
                {
                    id: 'main-street-safe-zone',
                    name: 'Main Street Guest Relations',
                    type: 'safe-zone',
                    coordinates: { lat: 28.4171, lng: -81.5810 },
                    radius: 50,
                    isActive: true,
                    alertOnEntry: true,
                    alertOnExit: false
                }
            ]

            // Set up child-specific safety zones if children in party
            const hasChildren = partyMembers.some(member => member.age && member.age < 13)
            if (hasChildren && childSafetyMode) {
                safeZones.push({
                    id: 'fantasyland-child-zone',
                    name: 'Fantasyland Child Safe Area',
                    type: 'child-area',
                    coordinates: { lat: 28.4198, lng: -81.5789 },
                    radius: 150,
                    isActive: true,
                    alertOnExit: true,
                    allowedMembers: partyMembers.filter(m => m.age && m.age < 13).map(m => m.id)
                })
            }

            // Create geofences via the geofencing service
            for (const zone of safeZones) {
                try {
                    await geofencingService.createGeofence({
                        name: zone.name,
                        latitude: zone.coordinates.lat,
                        longitude: zone.coordinates.lng,
                        radius: zone.radius,
                        type: 'safety',
                        settings: {
                            notifyOnEntry: zone.alertOnEntry,
                            notifyOnExit: zone.alertOnExit,
                            priority: 'urgent',
                            customMessage: `Safety zone: ${zone.name}`,
                            soundAlert: soundAlerts,
                            vibrationAlert: vibrationAlerts
                        }
                    }, vacationId, user?.uid || '')
                } catch (error) {
                    console.error('Failed to create safety geofence:', error)
                }
            }
        }

        setupEmergencyGeofences()
    }, [vacationId, childSafetyMode, soundAlerts, vibrationAlerts, user?.uid, partyMembers])

    // Emergency sound alert
    useEffect(() => {
        if (alertSoundRef.current) {
            alertSoundRef.current.src = '/sounds/emergency-alert.mp3'
        }
    }, [])

    // Monitor for critical alerts
    useEffect(() => {
        if (!emergencyAlerts) return

        const criticalAlerts = emergencyAlerts.filter(alert =>
            alert.severity === 'critical' && !alert.isResolved
        )

        if (criticalAlerts.length > 0) {
            // Play emergency sound
            if (soundAlerts && alertSoundRef.current) {
                alertSoundRef.current.play().catch(console.error)
            }

            // Vibration pattern for emergency
            if (vibrationAlerts && 'vibrate' in navigator) {
                navigator.vibrate([500, 200, 500, 200, 500])
            }

            // Show persistent notification
            criticalAlerts.forEach(alert => {
                toast.error(`🚨 EMERGENCY: ${alert.message}`, {
                    duration: Infinity,
                    action: {
                        label: 'View Details',
                        onClick: () => console.log('Show emergency details')
                    }
                })
            })
        }
    }, [emergencyAlerts, soundAlerts, vibrationAlerts])

    // Get member status indicator
    const getMemberStatusIndicator = (member: PartyMember) => {
        const timeSinceLastSeen = differenceInMinutes(new Date(), member.lastSeen)

        if (!member.isOnline) {
            return { color: 'bg-red-500', status: 'Offline', icon: <WifiOff className="h-3 w-3" /> }
        }

        if (timeSinceLastSeen > 30) {
            return { color: 'bg-orange-500', status: 'Separated', icon: <AlertTriangle className="h-3 w-3" /> }
        }

        if (timeSinceLastSeen > 10) {
            return { color: 'bg-yellow-500', status: 'Away', icon: <Clock className="h-3 w-3" /> }
        }

        return { color: 'bg-green-500', status: 'Nearby', icon: <CheckCircle className="h-3 w-3" /> }
    }

    // Get alert severity color
    const getAlertSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'border-red-500 bg-red-50'
            case 'high': return 'border-orange-500 bg-orange-50'
            case 'medium': return 'border-yellow-500 bg-yellow-50'
            default: return 'border-blue-500 bg-blue-50'
        }
    }

    // Emergency actions
    const handleEmergencyCall = () => {
        if ('navigator' in window && 'mediaDevices' in navigator) {
            // In a real app, this would initiate emergency call
            window.open(`tel:${emergencyContactNumber}`)
        }
    }

    const handleSecurityAlert = () => {
        triggerEmergencyMutation.mutate({
            type: 'security',
            severity: 'high',
            message: 'Security assistance requested',
            location: {
                // Get current location
                latitude: 28.4177,
                longitude: -81.5812,
                parkArea: 'Magic Kingdom'
            }
        })
    }

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Hidden audio element for emergency alerts */}
            <audio ref={alertSoundRef} preload="auto" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <SparklesText className="text-2xl font-bold tracking-tight">
                        Safety & Emergency Services
                    </SparklesText>
                    <p className="text-muted-foreground">
                        Advanced safety features for your Disney vacation
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isEmergencyMode ? "destructive" : "outline"}
                        onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                        className={cn(
                            isEmergencyMode && "animate-pulse"
                        )}
                    >
                        <Siren className="h-4 w-4 mr-2" />
                        {isEmergencyMode ? 'Emergency Active' : 'Emergency Mode'}
                    </Button>
                </div>
            </div>

            {/* Emergency Quick Actions */}
            {isEmergencyMode && (
                <BlurFade delay={0.1}>
                    <MagicCard className="p-6 border-red-500 bg-red-50">
                        <BorderBeam />
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-500 text-white rounded-full">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-800">Emergency Mode Active</h3>
                                <p className="text-red-600">Quick access to emergency services and alerts</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button
                                variant="destructive"
                                onClick={handleEmergencyCall}
                                className="h-16 flex-col"
                            >
                                <Phone className="h-5 w-5 mb-1" />
                                <span className="text-xs">Call 911</span>
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleSecurityAlert}
                                className="h-16 flex-col"
                            >
                                <Shield className="h-5 w-5 mb-1" />
                                <span className="text-xs">Disney Security</span>
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => {
                                    // Broadcast emergency location to all party members
                                    partyMembers.forEach(member => {
                                        if (member.id !== user?.uid) {
                                            sendLocationPingMutation.mutate(member.id)
                                        }
                                    })
                                }}
                                className="h-16 flex-col"
                            >
                                <Users className="h-5 w-5 mb-1" />
                                <span className="text-xs">Alert Party</span>
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => {
                                    // Navigate to nearest Disney first aid
                                    const firstAidLocation = { lat: 28.4175, lng: -81.5815 }
                                    const url = `https://maps.google.com/?q=${firstAidLocation.lat},${firstAidLocation.lng}`
                                    window.open(url, '_blank')
                                }}
                                className="h-16 flex-col"
                            >
                                <Heart className="h-5 w-5 mb-1" />
                                <span className="text-xs">First Aid</span>
                            </Button>
                        </div>
                    </MagicCard>
                </BlurFade>
            )}

            {/* Active Emergency Alerts */}
            {emergencyAlerts && emergencyAlerts.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Active Alerts ({emergencyAlerts.length})
                    </h3>

                    {emergencyAlerts.map((alert, index) => (
                        <BlurFade key={alert.id} delay={index * 0.1}>
                            <Alert className={cn("relative", getAlertSeverityColor(alert.severity))}>
                                {alert.severity === 'critical' && <BorderBeam />}

                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            alert.severity === 'critical' && "bg-red-500 text-white",
                                            alert.severity === 'high' && "bg-orange-500 text-white",
                                            alert.severity === 'medium' && "bg-yellow-500 text-white",
                                            alert.severity === 'low' && "bg-blue-500 text-white"
                                        )}>
                                            {alert.type === 'separation' && <Users className="h-4 w-4" />}
                                            {alert.type === 'medical' && <Heart className="h-4 w-4" />}
                                            {alert.type === 'security' && <Shield className="h-4 w-4" />}
                                            {alert.type === 'lost-child' && <UserX className="h-4 w-4" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{alert.memberName || 'System Alert'}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {alert.type.replace('-', ' ')}
                                                </Badge>
                                                <Badge
                                                    variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {alert.severity.toUpperCase()}
                                                </Badge>
                                            </div>

                                            <AlertDescription className="mb-3">
                                                {alert.message}
                                            </AlertDescription>

                                            {alert.location && (
                                                <div className="text-sm text-muted-foreground mb-3">
                                                    <MapPin className="h-3 w-3 inline mr-1" />
                                                    Last seen: {alert.location.parkArea || 'Unknown area'}
                                                    <span className="ml-2">
                                                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                {alert.actions.map((action, i) => (
                                                    <Button
                                                        key={i}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (action === 'Send location ping' && alert.memberId) {
                                                                sendLocationPingMutation.mutate(alert.memberId)
                                                            }
                                                            // Handle other actions...
                                                        }}
                                                    >
                                                        {action}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {alert.estimatedResponse && (
                                            <div className="text-sm">
                                                <Timer className="h-3 w-3 inline mr-1" />
                                                {alert.estimatedResponse}m response
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Alert>
                        </BlurFade>
                    ))}
                </div>
            )}

            {/* Party Member Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Party Member Status
                    </CardTitle>
                    <CardDescription>
                        Real-time location and safety status of your party
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {partyMembers.map((member, index) => {
                            const statusInfo = getMemberStatusIndicator(member)
                            const timeSinceLastSeen = differenceInMinutes(new Date(), member.lastSeen)

                            return (
                                <BlurFade key={member.id} delay={index * 0.1}>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <UserCheck className="h-5 w-5" />
                                                </div>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center",
                                                    statusInfo.color
                                                )}>
                                                    {statusInfo.icon}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{member.name}</span>
                                                    {member.age && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Age {member.age}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {member.relationship} • {statusInfo.status}
                                                    {timeSinceLastSeen > 0 && (
                                                        <span> • Last seen {timeSinceLastSeen}m ago</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {member.batteryLevel && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Battery className={cn(
                                                        "h-4 w-4",
                                                        member.batteryLevel < 20 ? "text-red-500" :
                                                            member.batteryLevel < 50 ? "text-yellow-500" : "text-green-500"
                                                    )} />
                                                    <span>{member.batteryLevel}%</span>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => sendLocationPingMutation.mutate(member.id)}
                                                    disabled={member.id === user?.uid}
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                </Button>

                                                {member.phoneNumber && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`tel:${member.phoneNumber}`)}
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </BlurFade>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Safety Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Safety Settings
                    </CardTitle>
                    <CardDescription>
                        Configure safety alerts and emergency preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="child-safety">Child Safety Mode</Label>
                                <Switch
                                    id="child-safety"
                                    checked={childSafetyMode}
                                    onCheckedChange={setChildSafetyMode}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="sound-alerts">Sound Alerts</Label>
                                <Switch
                                    id="sound-alerts"
                                    checked={soundAlerts}
                                    onCheckedChange={setSoundAlerts}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="vibration-alerts">Vibration Alerts</Label>
                                <Switch
                                    id="vibration-alerts"
                                    checked={vibrationAlerts}
                                    onCheckedChange={setVibrationAlerts}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="separation-distance">Separation Alert Distance (meters)</Label>
                                <Input
                                    id="separation-distance"
                                    type="number"
                                    value={separationAlertDistance}
                                    onChange={(e) => setSeparationAlertDistance(parseInt(e.target.value))}
                                    min="50"
                                    max="1000"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="emergency-contact">Emergency Contact Number</Label>
                                <Input
                                    id="emergency-contact"
                                    value={emergencyContactNumber}
                                    onChange={(e) => setEmergencyContactNumber(e.target.value)}
                                    placeholder="911"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}