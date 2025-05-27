'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    MapPin,
    Plus,
    Bell,
    Navigation,
    Mountain,
    Clock,
    Users,
    Activity,
    CheckCircle,
    XCircle,
    Edit,
    Trash,
    Shield,
    Target,
    Compass,
    BarChart3,
    Filter
} from "lucide-react"
import { motion, AnimatePresence } from 'motion/react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { geofencingService, EnhancedGeofence, GeofenceEvent } from '@/lib/services/geofencing'

// Import Magic UI components
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { BlurFade } from '@/components/magicui/blur-fade'

interface EnhancedGeofencingProps {
    vacationId: string
    onGeofenceSelect?: (geofence: EnhancedGeofence | null) => void
    onGeofenceUpdate?: (geofence: EnhancedGeofence) => void
    className?: string
}

export default function EnhancedGeofencing({
    vacationId,
    onGeofenceSelect,
    onGeofenceUpdate,
    className
}: EnhancedGeofencingProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // State management
    const [selectedGeofence, setSelectedGeofence] = useState<EnhancedGeofence | null>(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [filterType, setFilterType] = useState<string>('all')
    const [showActiveOnly, setShowActiveOnly] = useState(true)

    // Form state for creating/editing geofences
    const [geofenceForm, setGeofenceForm] = useState<{
        name: string
        description: string
        latitude: number
        longitude: number
        radius: number
        type: 'custom' | 'attraction' | 'meeting' | 'safety' | 'directional' | 'altitude'
        isActive: boolean
        isDirectional: boolean
        direction: number
        directionRange: number
        isAltitudeBased: boolean
        minAltitude: number
        maxAltitude: number
        isTimeBased: boolean
        activeStartTime: string
        activeEndTime: string
        settings: {
            notifyOnEntry: boolean
            notifyOnExit: boolean
            cooldownMinutes: number
            maxAlerts: number
            triggerDistance: number
            requiresMovement: boolean
            parkArea: string
            attraction: string
            customMessage: string
            soundAlert: boolean
            vibrationAlert: boolean
            priority: 'low' | 'medium' | 'high' | 'urgent'
        }
    }>({
        name: '',
        description: '',
        latitude: 0,
        longitude: 0,
        radius: 100,
        type: 'custom',
        isActive: true,

        // Directional geofencing
        isDirectional: false,
        direction: 0,
        directionRange: 45,

        // Altitude geofencing
        isAltitudeBased: false,
        minAltitude: 0,
        maxAltitude: 1000,

        // Time-based activation
        isTimeBased: false,
        activeStartTime: '',
        activeEndTime: '',

        // Settings
        settings: {
            notifyOnEntry: true,
            notifyOnExit: true,
            cooldownMinutes: 5,
            maxAlerts: 10,
            triggerDistance: 0,
            requiresMovement: false,
            parkArea: '',
            attraction: '',
            customMessage: '',
            soundAlert: true,
            vibrationAlert: true,
            priority: 'medium'
        }
    })

    // Fetch geofences
    const { data: geofences, isLoading } = useQuery({
        queryKey: ['geofences', vacationId],
        queryFn: async (): Promise<EnhancedGeofence[]> => {
            const response = await fetch(`/api/geofences?vacationId=${vacationId}`)
            if (!response.ok) throw new Error('Failed to fetch geofences')
            return response.json()
        },
        enabled: !!vacationId
    })

    // Fetch recent geofence alerts
    const { data: alerts } = useQuery({
        queryKey: ['geofence-alerts', vacationId],
        queryFn: async () => {
            const response = await fetch(`/api/geofences/alerts?vacationId=${vacationId}&limit=20`)
            if (!response.ok) throw new Error('Failed to fetch alerts')
            return response.json()
        },
        enabled: !!vacationId,
        refetchInterval: 30000 // Refresh every 30 seconds
    })

    // Fetch analytics data
    const { data: analytics } = useQuery({
        queryKey: ['geofence-analytics', vacationId],
        queryFn: async () => {
            const response = await fetch(`/api/geofences/analytics?vacationId=${vacationId}`)
            if (!response.ok) throw new Error('Failed to fetch analytics')
            return response.json()
        },
        enabled: !!vacationId,
        refetchInterval: 60000 // Refresh every minute
    })

    // Create geofence mutation
    const createGeofenceMutation = useMutation({
        mutationFn: async (geofenceData: Partial<EnhancedGeofence>) => {
            if (!user) throw new Error('User not authenticated')

            const response = await fetch('/api/geofences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...geofenceData,
                    vacationId,
                    createdBy: user.uid
                })
            })

            if (!response.ok) throw new Error('Failed to create geofence')
            return response.json()
        },
        onSuccess: (newGeofence) => {
            toast.success("Geofence created successfully")
            queryClient.invalidateQueries({ queryKey: ['geofences'] })
            onGeofenceUpdate?.(newGeofence)
            resetForm()
        },
        onError: (error) => {
            toast.error("Failed to create geofence", {
                description: error instanceof Error ? error.message : "Unknown error occurred"
            })
        }
    })

    // Update geofence mutation
    const updateGeofenceMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<EnhancedGeofence> }) => {
            const response = await fetch(`/api/geofences/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })

            if (!response.ok) throw new Error('Failed to update geofence')
            return response.json()
        },
        onSuccess: (updatedGeofence) => {
            toast.success("Geofence updated successfully")
            queryClient.invalidateQueries({ queryKey: ['geofences'] })
            onGeofenceUpdate?.(updatedGeofence)
        },
        onError: (error) => {
            toast.error("Failed to update geofence", {
                description: error instanceof Error ? error.message : "Unknown error occurred"
            })
        }
    })

    // Delete geofence mutation
    const deleteGeofenceMutation = useMutation({
        mutationFn: async (geofenceId: string) => {
            const response = await fetch(`/api/geofences/${geofenceId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete geofence')
            return response.json()
        },
        onSuccess: () => {
            toast.success("Geofence deleted successfully")
            queryClient.invalidateQueries({ queryKey: ['geofences'] })
            setSelectedGeofence(null)
            onGeofenceSelect?.(null)
        },
        onError: (error) => {
            toast.error("Failed to delete geofence", {
                description: error instanceof Error ? error.message : "Unknown error occurred"
            })
        }
    })

    // Set up geofence event listening
    useEffect(() => {
        const handleGeofenceEvent = (event: GeofenceEvent) => {
            // Handle geofence events (could trigger notifications, etc.)
            console.log('Geofence event:', event)
        }

        geofencingService.addEventListener('entry', handleGeofenceEvent)
        geofencingService.addEventListener('exit', handleGeofenceEvent)

        return () => {
            geofencingService.removeEventListener('entry', handleGeofenceEvent)
            geofencingService.removeEventListener('exit', handleGeofenceEvent)
        }
    }, [])

    // Filter geofences based on current filters
    const filteredGeofences = useMemo(() => {
        if (!geofences) return []

        return geofences.filter(geofence => {
            if (showActiveOnly && !geofence.isActive) return false
            if (filterType !== 'all' && geofence.type !== filterType) return false
            return true
        })
    }, [geofences, filterType, showActiveOnly])

    // Reset form
    const resetForm = useCallback(() => {
        setGeofenceForm({
            name: '',
            description: '',
            latitude: 0,
            longitude: 0,
            radius: 100,
            type: 'custom',
            isActive: true,
            isDirectional: false,
            direction: 0,
            directionRange: 45,
            isAltitudeBased: false,
            minAltitude: 0,
            maxAltitude: 1000,
            isTimeBased: false,
            activeStartTime: '',
            activeEndTime: '',
            settings: {
                notifyOnEntry: true,
                notifyOnExit: true,
                cooldownMinutes: 5,
                maxAlerts: 10,
                triggerDistance: 0,
                requiresMovement: false,
                parkArea: '',
                attraction: '',
                customMessage: '',
                soundAlert: true,
                vibrationAlert: true,
                priority: 'medium'
            }
        })
    }, [])

    // Handle geofence selection
    const handleGeofenceSelect = useCallback((geofence: EnhancedGeofence | null) => {
        setSelectedGeofence(geofence)
        onGeofenceSelect?.(geofence)

        if (geofence) {
            setGeofenceForm({
                name: geofence.name,
                description: geofence.description || '',
                latitude: geofence.latitude,
                longitude: geofence.longitude,
                radius: geofence.radius,
                type: geofence.type,
                isActive: geofence.isActive ?? true,
                isDirectional: !!geofence.direction,
                direction: geofence.direction || 0,
                directionRange: geofence.directionRange || 45,
                isAltitudeBased: !!(geofence.minAltitude || geofence.maxAltitude),
                minAltitude: geofence.minAltitude || 0,
                maxAltitude: geofence.maxAltitude || 1000,
                isTimeBased: !!(geofence.activeStartTime || geofence.activeEndTime),
                activeStartTime: geofence.activeStartTime ? format(new Date(geofence.activeStartTime), "yyyy-MM-dd'T'HH:mm") : '',
                activeEndTime: geofence.activeEndTime ? format(new Date(geofence.activeEndTime), "yyyy-MM-dd'T'HH:mm") : '',
                settings: {
                    notifyOnEntry: geofence.settings?.notifyOnEntry ?? true,
                    notifyOnExit: geofence.settings?.notifyOnExit ?? true,
                    cooldownMinutes: geofence.settings?.cooldownMinutes ?? 5,
                    maxAlerts: geofence.settings?.maxAlerts ?? 10,
                    triggerDistance: geofence.settings?.triggerDistance ?? 0,
                    requiresMovement: geofence.settings?.requiresMovement ?? false,
                    parkArea: geofence.settings?.parkArea ?? '',
                    attraction: geofence.settings?.attraction ?? '',
                    customMessage: geofence.settings?.customMessage ?? '',
                    soundAlert: geofence.settings?.soundAlert ?? true,
                    vibrationAlert: geofence.settings?.vibrationAlert ?? true,
                    priority: geofence.settings?.priority ?? 'medium'
                }
            })
        }
    }, [onGeofenceSelect])

    // Handle form submission
    const handleSubmit = useCallback(() => {
        if (!geofenceForm.name || !geofenceForm.latitude || !geofenceForm.longitude) {
            toast.error("Please fill in all required fields")
            return
        }

        const geofenceData = {
            name: geofenceForm.name,
            description: geofenceForm.description,
            latitude: geofenceForm.latitude,
            longitude: geofenceForm.longitude,
            radius: geofenceForm.radius,
            type: geofenceForm.type,
            isActive: geofenceForm.isActive,

            // Directional geofencing
            direction: geofenceForm.isDirectional ? geofenceForm.direction : null,
            directionRange: geofenceForm.isDirectional ? geofenceForm.directionRange : null,

            // Altitude geofencing
            minAltitude: geofenceForm.isAltitudeBased ? geofenceForm.minAltitude : null,
            maxAltitude: geofenceForm.isAltitudeBased ? geofenceForm.maxAltitude : null,

            // Time-based activation
            activeStartTime: geofenceForm.isTimeBased && geofenceForm.activeStartTime ? new Date(geofenceForm.activeStartTime) : null,
            activeEndTime: geofenceForm.isTimeBased && geofenceForm.activeEndTime ? new Date(geofenceForm.activeEndTime) : null,

            settings: geofenceForm.settings
        }

        if (selectedGeofence) {
            updateGeofenceMutation.mutate({
                id: selectedGeofence.id,
                updates: geofenceData
            })
        } else {
            createGeofenceMutation.mutate(geofenceData)
        }
    }, [geofenceForm, selectedGeofence, createGeofenceMutation, updateGeofenceMutation])

    // Get geofence type icon
    const getGeofenceTypeIcon = (type: string) => {
        switch (type) {
            case 'attraction': return <Target className="h-4 w-4" />
            case 'meeting': return <Users className="h-4 w-4" />
            case 'safety': return <Shield className="h-4 w-4" />
            case 'directional': return <Compass className="h-4 w-4" />
            case 'altitude': return <Mountain className="h-4 w-4" />
            default: return <MapPin className="h-4 w-4" />
        }
    }

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500'
            case 'high': return 'bg-orange-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Enhanced Geofencing</h2>
                    <p className="text-muted-foreground">
                        Manage smart location alerts with advanced features
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ShimmerButton
                        onClick={() => {
                            setSelectedGeofence(null)
                            resetForm()
                            setActiveTab('create')
                        }}
                        className="h-9"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Geofence
                    </ShimmerButton>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="create">
                        {selectedGeofence ? 'Edit' : 'Create'}
                    </TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <Label>Filters:</Label>
                        </div>

                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="attraction">Attractions</SelectItem>
                                <SelectItem value="meeting">Meeting Points</SelectItem>
                                <SelectItem value="safety">Safety Zones</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                                <SelectItem value="directional">Directional</SelectItem>
                                <SelectItem value="altitude">Altitude-based</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={showActiveOnly}
                                onCheckedChange={setShowActiveOnly}
                            />
                            <Label>Active only</Label>
                        </div>

                        <div className="ml-auto text-sm text-muted-foreground">
                            {filteredGeofences?.length || 0} geofences
                        </div>
                    </div>

                    {/* Geofences List */}
                    <ScrollArea className="h-[600px]">
                        <div className="grid gap-4">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                                ))
                            ) : filteredGeofences?.length > 0 ? (
                                filteredGeofences.map((geofence, index) => (
                                    <BlurFade key={geofence.id} delay={index * 0.1}>
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => handleGeofenceSelect(geofence)}
                                        >
                                            <MagicCard
                                                className={cn(
                                                    "p-4 transition-all duration-300",
                                                    selectedGeofence?.id === geofence.id && "ring ring-primary"
                                                )}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            geofence.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                                                        )}>
                                                            {getGeofenceTypeIcon(geofence.type)}
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold">{geofence.name}</h3>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {geofence.type}
                                                                </Badge>
                                                                {!geofence.isActive && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {geofence.description && (
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    {geofence.description}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {geofence.radius}m radius
                                                                </div>

                                                                {geofence.direction && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Compass className="h-3 w-3" />
                                                                        Directional
                                                                    </div>
                                                                )}

                                                                {(geofence.minAltitude || geofence.maxAltitude) && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Mountain className="h-3 w-3" />
                                                                        Altitude
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-1">
                                                                    <div className={cn(
                                                                        "w-2 h-2 rounded-full",
                                                                        getPriorityColor(geofence.settings?.priority || 'medium')
                                                                    )} />
                                                                    {geofence.settings?.priority || 'medium'} priority
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleGeofenceSelect(geofence)
                                                                setActiveTab('create')
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                deleteGeofenceMutation.mutate(geofence.id)
                                                            }}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {geofence.settings?.priority === 'urgent' && <BorderBeam />}
                                            </MagicCard>
                                        </div>
                                    </BlurFade>
                                ))
                            ) : (
                                <Card className="p-8 text-center">
                                    <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-semibold mb-2">No geofences found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create your first geofence to get started with location-based alerts.
                                    </p>
                                    <Button onClick={() => setActiveTab('create')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Geofence
                                    </Button>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* Create/Edit Tab */}
                <TabsContent value="create" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {selectedGeofence ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                {selectedGeofence ? 'Edit Geofence' : 'Create New Geofence'}
                            </CardTitle>
                            <CardDescription>
                                Configure advanced location-based alerts and notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={geofenceForm.name}
                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter geofence name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={geofenceForm.type}
                                        onValueChange={(value: 'custom' | 'attraction' | 'meeting' | 'safety' | 'directional' | 'altitude') => setGeofenceForm(prev => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Custom</SelectItem>
                                            <SelectItem value="attraction">Attraction</SelectItem>
                                            <SelectItem value="meeting">Meeting Point</SelectItem>
                                            <SelectItem value="safety">Safety Zone</SelectItem>
                                            <SelectItem value="directional">Directional</SelectItem>
                                            <SelectItem value="altitude">Altitude-based</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={geofenceForm.description}
                                    onChange={(e) => setGeofenceForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Optional description"
                                    rows={2}
                                />
                            </div>

                            {/* Location & Radius */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude *</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={geofenceForm.latitude}
                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude *</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={geofenceForm.longitude}
                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="radius">Radius (meters)</Label>
                                    <Input
                                        id="radius"
                                        type="number"
                                        value={geofenceForm.radius}
                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            {/* Advanced Features */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Advanced Features</h3>

                                {/* Directional Geofencing */}
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Navigation className="h-4 w-4" />
                                            <Label htmlFor="directional">Directional Geofencing</Label>
                                        </div>
                                        <Switch
                                            id="directional"
                                            checked={geofenceForm.isDirectional}
                                            onCheckedChange={(checked) => setGeofenceForm(prev => ({ ...prev, isDirectional: checked }))}
                                        />
                                    </div>

                                    {geofenceForm.isDirectional && (
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="grid grid-cols-2 gap-4"
                                            >
                                                <div className="space-y-2">
                                                    <Label>Direction (degrees)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="360"
                                                        value={geofenceForm.direction}
                                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, direction: parseInt(e.target.value) }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Direction Range (degrees)</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="180"
                                                        value={geofenceForm.directionRange}
                                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, directionRange: parseInt(e.target.value) }))}
                                                    />
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>

                                {/* Altitude Geofencing */}
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Mountain className="h-4 w-4" />
                                            <Label htmlFor="altitude">Altitude-based Geofencing</Label>
                                        </div>
                                        <Switch
                                            id="altitude"
                                            checked={geofenceForm.isAltitudeBased}
                                            onCheckedChange={(checked) => setGeofenceForm(prev => ({ ...prev, isAltitudeBased: checked }))}
                                        />
                                    </div>

                                    {geofenceForm.isAltitudeBased && (
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="grid grid-cols-2 gap-4"
                                            >
                                                <div className="space-y-2">
                                                    <Label>Min Altitude (meters)</Label>
                                                    <Input
                                                        type="number"
                                                        value={geofenceForm.minAltitude}
                                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, minAltitude: parseInt(e.target.value) }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Max Altitude (meters)</Label>
                                                    <Input
                                                        type="number"
                                                        value={geofenceForm.maxAltitude}
                                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, maxAltitude: parseInt(e.target.value) }))}
                                                    />
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>

                                {/* Time-based Activation */}
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <Label htmlFor="timeBased">Time-based Activation</Label>
                                        </div>
                                        <Switch
                                            id="timeBased"
                                            checked={geofenceForm.isTimeBased}
                                            onCheckedChange={(checked) => setGeofenceForm(prev => ({ ...prev, isTimeBased: checked }))}
                                        />
                                    </div>

                                    {geofenceForm.isTimeBased && (
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="grid grid-cols-2 gap-4"
                                            >
                                                <div className="space-y-2">
                                                    <Label>Start Time</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={geofenceForm.activeStartTime}
                                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, activeStartTime: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>End Time</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={geofenceForm.activeEndTime}
                                                        onChange={(e) => setGeofenceForm(prev => ({ ...prev, activeEndTime: e.target.value }))}
                                                    />
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>

                            {/* Notification Settings */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Notification Settings</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Notify on Entry</Label>
                                        <Switch
                                            checked={geofenceForm.settings.notifyOnEntry}
                                            onCheckedChange={(checked) => setGeofenceForm(prev => ({
                                                ...prev,
                                                settings: { ...prev.settings, notifyOnEntry: checked }
                                            }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Notify on Exit</Label>
                                        <Switch
                                            checked={geofenceForm.settings.notifyOnExit}
                                            onCheckedChange={(checked) => setGeofenceForm(prev => ({
                                                ...prev,
                                                settings: { ...prev.settings, notifyOnExit: checked }
                                            }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Sound Alert</Label>
                                        <Switch
                                            checked={geofenceForm.settings.soundAlert}
                                            onCheckedChange={(checked) => setGeofenceForm(prev => ({
                                                ...prev,
                                                settings: { ...prev.settings, soundAlert: checked }
                                            }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Vibration Alert</Label>
                                        <Switch
                                            checked={geofenceForm.settings.vibrationAlert}
                                            onCheckedChange={(checked) => setGeofenceForm(prev => ({
                                                ...prev,
                                                settings: { ...prev.settings, vibrationAlert: checked }
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Select
                                            value={geofenceForm.settings.priority}
                                            onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setGeofenceForm(prev => ({
                                                ...prev,
                                                settings: { ...prev.settings, priority: value }
                                            }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cooldown (minutes)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={geofenceForm.settings.cooldownMinutes}
                                            onChange={(e) => setGeofenceForm(prev => ({
                                                ...prev,
                                                settings: { ...prev.settings, cooldownMinutes: parseInt(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Custom Message</Label>
                                    <Textarea
                                        value={geofenceForm.settings.customMessage}
                                        onChange={(e) => setGeofenceForm(prev => ({
                                            ...prev,
                                            settings: { ...prev.settings, customMessage: e.target.value }
                                        }))}
                                        placeholder="Custom alert message (optional)"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedGeofence(null)
                                        resetForm()
                                        setActiveTab('overview')
                                    }}
                                >
                                    Cancel
                                </Button>

                                <ShimmerButton
                                    onClick={handleSubmit}
                                    disabled={createGeofenceMutation.isPending || updateGeofenceMutation.isPending}
                                >
                                    {createGeofenceMutation.isPending || updateGeofenceMutation.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Saving...
                                        </>
                                    ) : selectedGeofence ? (
                                        'Update Geofence'
                                    ) : (
                                        'Create Geofence'
                                    )}
                                </ShimmerButton>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Recent Geofence Alerts
                            </CardTitle>
                            <CardDescription>
                                View and manage recent geofence triggers and notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px]">
                                {alerts?.alerts?.length > 0 ? (
                                    <div className="space-y-4">
                                        {alerts.alerts.map((alert: {
                                            id: string
                                            message: string
                                            alertType: 'entry' | 'exit' | 'proximity'
                                            triggeredAt: string
                                            distance?: number
                                            isRead: boolean
                                        }, index: number) => (
                                            <BlurFade key={alert.id} delay={index * 0.05}>
                                                <div className="flex items-start gap-3 p-4 border rounded-lg">
                                                    <div className={cn(
                                                        "p-2 rounded-full",
                                                        alert.alertType === 'entry' ? "bg-green-100 text-green-600" :
                                                            alert.alertType === 'exit' ? "bg-orange-100 text-orange-600" :
                                                                "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {alert.alertType === 'entry' ? <CheckCircle className="h-4 w-4" /> :
                                                            alert.alertType === 'exit' ? <XCircle className="h-4 w-4" /> :
                                                                <Activity className="h-4 w-4" />}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{alert.message}</span>
                                                            {!alert.isRead && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    New
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                                                            {alert.distance && (
                                                                <span className="ml-2">
                                                                    • {Math.round(alert.distance)}m from center
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Badge variant="outline" className="text-xs">
                                                        {alert.alertType}
                                                    </Badge>
                                                </div>
                                            </BlurFade>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                        <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
                                        <p className="text-muted-foreground">
                                            Geofence alerts will appear here when triggered.
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <BlurFade delay={0.1}>
                            <MagicCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Geofences</p>
                                        <p className="text-2xl font-bold">
                                            {analytics?.totalGeofences || geofences?.length || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <MapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {analytics?.activeGeofences || filteredGeofences?.length || 0} active
                                </div>
                            </MagicCard>
                        </BlurFade>

                        <BlurFade delay={0.2}>
                            <MagicCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Triggers</p>
                                        <p className="text-2xl font-bold">
                                            {analytics?.totalTriggers || alerts?.totalCount || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Activity className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {analytics?.triggersToday || 0} today
                                </div>
                            </MagicCard>
                        </BlurFade>

                        <BlurFade delay={0.3}>
                            <MagicCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Most Active</p>
                                        <p className="text-lg font-bold truncate">
                                            {analytics?.mostActiveGeofence?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <Target className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {analytics?.mostActiveGeofence?.triggerCount || 0} triggers
                                </div>
                            </MagicCard>
                        </BlurFade>

                        <BlurFade delay={0.4}>
                            <MagicCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                                        <p className="text-2xl font-bold">
                                            {analytics?.avgResponseTime ? `${analytics.avgResponseTime}ms` : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <Clock className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    System performance
                                </div>
                            </MagicCard>
                        </BlurFade>
                    </div>

                    {/* Charts and Detailed Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Activity Timeline */}
                        <BlurFade delay={0.5}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Activity Timeline
                                    </CardTitle>
                                    <CardDescription>
                                        Geofence triggers over the last 7 days
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {analytics?.dailyActivity?.length > 0 ? (
                                        <div className="space-y-4">
                                            {analytics.dailyActivity.map((day: {
                                                date: string
                                                triggers: number
                                                entries: number
                                                exits: number
                                            }) => (
                                                <div key={day.date} className="flex items-center justify-between">
                                                    <div className="text-sm font-medium">
                                                        {format(new Date(day.date), 'MMM dd')}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {day.entries} entries
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {day.exits} exits
                                                            </span>
                                                        </div>
                                                        <div className="text-sm font-bold">
                                                            {day.triggers}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                                            <p className="text-sm text-muted-foreground">No activity data available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </BlurFade>

                        {/* Geofence Performance */}
                        <BlurFade delay={0.6}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Geofence Performance
                                    </CardTitle>
                                    <CardDescription>
                                        Top performing geofences by trigger count
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px]">
                                        {analytics?.geofencePerformance?.length > 0 ? (
                                            <div className="space-y-4">
                                                {analytics.geofencePerformance.map((geofence: {
                                                    id: string
                                                    name: string
                                                    type: string
                                                    triggerCount: number
                                                    lastTriggered: string
                                                    avgAccuracy: number
                                                }) => (
                                                    <div key={geofence.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-muted rounded-lg">
                                                                {getGeofenceTypeIcon(geofence.type)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{geofence.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {geofence.type} • {geofence.avgAccuracy}% accuracy
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">{geofence.triggerCount}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {geofence.lastTriggered ?
                                                                    formatDistanceToNow(new Date(geofence.lastTriggered), { addSuffix: true }) :
                                                                    'Never'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Target className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                                                <p className="text-sm text-muted-foreground">No performance data available</p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </BlurFade>
                    </div>

                    {/* Additional Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Alert Distribution */}
                        <BlurFade delay={0.7}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Alert Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {analytics?.alertDistribution ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">Entries</span>
                                                </div>
                                                <span className="font-bold">{analytics.alertDistribution.entries || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-orange-600" />
                                                    <span className="text-sm">Exits</span>
                                                </div>
                                                <span className="font-bold">{analytics.alertDistribution.exits || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm">Proximity</span>
                                                </div>
                                                <span className="font-bold">{analytics.alertDistribution.proximity || 0}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                            <p className="text-xs text-muted-foreground">No alert data</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </BlurFade>

                        {/* System Health */}
                        <BlurFade delay={0.8}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        System Health
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">GPS Accuracy</span>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    (analytics?.systemHealth?.gpsAccuracy || 0) > 80 ? "bg-green-500" :
                                                        (analytics?.systemHealth?.gpsAccuracy || 0) > 60 ? "bg-yellow-500" : "bg-red-500"
                                                )} />
                                                <span className="font-bold">{analytics?.systemHealth?.gpsAccuracy || 0}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Battery Impact</span>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    (analytics?.systemHealth?.batteryImpact || 0) < 20 ? "bg-green-500" :
                                                        (analytics?.systemHealth?.batteryImpact || 0) < 40 ? "bg-yellow-500" : "bg-red-500"
                                                )} />
                                                <span className="font-bold">{analytics?.systemHealth?.batteryImpact || 0}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Network Status</span>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    analytics?.systemHealth?.networkStatus === 'good' ? "bg-green-500" :
                                                        analytics?.systemHealth?.networkStatus === 'fair' ? "bg-yellow-500" : "bg-red-500"
                                                )} />
                                                <span className="font-bold capitalize">
                                                    {analytics?.systemHealth?.networkStatus || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </BlurFade>

                        {/* Quick Actions */}
                        <BlurFade delay={0.9}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Compass className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            // Export analytics data
                                            const dataStr = JSON.stringify(analytics, null, 2)
                                            const dataBlob = new Blob([dataStr], { type: 'application/json' })
                                            const url = URL.createObjectURL(dataBlob)
                                            const link = document.createElement('a')
                                            link.href = url
                                            link.download = `geofence-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`
                                            link.click()
                                            URL.revokeObjectURL(url)
                                            toast.success("Analytics data exported")
                                        }}
                                    >
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Export Data
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            queryClient.invalidateQueries({ queryKey: ['geofence-analytics'] })
                                            toast.success("Analytics refreshed")
                                        }}
                                    >
                                        <Activity className="h-4 w-4 mr-2" />
                                        Refresh Data
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        View Geofences
                                    </Button>
                                </CardContent>
                            </Card>
                        </BlurFade>
                    </div>

                    {/* Insights and Recommendations */}
                    {analytics?.insights?.length > 0 && (
                        <BlurFade delay={1.0}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Insights & Recommendations
                                    </CardTitle>
                                    <CardDescription>
                                        AI-powered suggestions to optimize your geofencing setup
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.insights.map((insight: {
                                            id: string
                                            type: 'optimization' | 'warning' | 'info'
                                            title: string
                                            description: string
                                            action?: string
                                        }) => (
                                            <div key={insight.id} className="flex items-start gap-3 p-4 border rounded-lg">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    insight.type === 'optimization' ? "bg-blue-100 text-blue-600" :
                                                        insight.type === 'warning' ? "bg-yellow-100 text-yellow-600" :
                                                            "bg-green-100 text-green-600"
                                                )}>
                                                    {insight.type === 'optimization' ? <Target className="h-4 w-4" /> :
                                                        insight.type === 'warning' ? <Shield className="h-4 w-4" /> :
                                                            <CheckCircle className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium mb-1">{insight.title}</h4>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {insight.description}
                                                    </p>
                                                    {insight.action && (
                                                        <Button variant="outline" size="sm">
                                                            {insight.action}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </BlurFade>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}