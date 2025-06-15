'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import MapPage from '@/components/maps/pages/map-page';
import {
    GeofenceData,
    GroupMember,
    LocationData
} from '@/components/maps/interactive-map';
import {
    createGeofence,
    getGeofences,
    getGroupMembers,
    handleGeofenceEntry,
    handleGeofenceExit,
    handleGroupSeparationAlert,
    updateUserLocation
} from '@/lib/services/map-service';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    MapPin,
    Users,
    PlusCircle,
    Bell,
    UserCheck,
    Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Type definitions
interface ApiResponse {
    success: boolean;
    data: LocationData[];
    error?: string;
}

interface FailedLocationUpdate {
    location: { lat: number; lng: number };
    timestamp: number;
    userId: string;
}

// Type guard for API response
function isApiResponse(data: unknown): data is ApiResponse {
    return (
        typeof data === 'object' &&
        data !== null &&
        'success' in data &&
        typeof (data as ApiResponse).success === 'boolean' &&
        'data' in data &&
        Array.isArray((data as ApiResponse).data)
    );
}

// Type guard for failed location updates
function isFailedLocationUpdateArray(data: unknown): data is FailedLocationUpdate[] {
    if (!Array.isArray(data)) return false;
    
    return data.every(item => {
        if (typeof item !== 'object' || item === null) return false;
        
        const obj = item as Record<string, unknown>;
        
        return (
            'location' in obj &&
            'timestamp' in obj &&
            'userId' in obj &&
            typeof obj.location === 'object' &&
            obj.location !== null &&
            typeof (obj.location as Record<string, unknown>).lat === 'number' &&
            typeof (obj.location as Record<string, unknown>).lng === 'number' &&
            typeof obj.timestamp === 'number' &&
            typeof obj.userId === 'string'
        );
    });
}

// Mock user data - in a real app, this would come from auth
const MOCK_USER = {
    id: 'user-123',
    name: 'Your Location',
    avatar: '/images/avatar.png'
};

// Disney World parks coordinates
const PARK_LOCATIONS = {
    magicKingdom: { lat: 28.4177, lng: -81.5812 },
    epcot: { lat: 28.3747, lng: -81.5494 },
    hollywoodStudios: { lat: 28.3587, lng: -81.5577 },
    animalKingdom: { lat: 28.3561, lng: -81.5906 },
} as const;

type ParkId = keyof typeof PARK_LOCATIONS;
type GeofenceType = 'attraction' | 'meeting' | 'custom';

export default function MapPageWrapper() {
    const { toast } = useToast();
    const [initialCenter, setInitialCenter] = useState({ lat: 28.4177, lng: -81.5812 });
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
    const [geofences, setGeofences] = useState<GeofenceData[]>([]);
    const [attractions, setAttractions] = useState<LocationData[]>([]);
    const [newGeofence, setNewGeofence] = useState<{
        name: string;
        radius: number;
        type: GeofenceType;
        lat: number;
        lng: number;
    }>({
        name: '',
        radius: 100,
        type: 'attraction',
        lat: 0,
        lng: 0
    });
    const [showGeofenceDialog, setShowGeofenceDialog] = useState(false);
    const [mapTab, setMapTab] = useState('view');
    const [selectedPark, setSelectedPark] = useState<ParkId>('magicKingdom');
    const [maxGroupSeparationDistance] = useState<number>(200);

    // Performance and battery optimization state
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [isLowPowerMode, setIsLowPowerMode] = useState(false);
    const [locationUpdateCount, setLocationUpdateCount] = useState(0);

    // Fetch attractions data
    const { data: attractionsData, isLoading, error } = useQuery<LocationData[]>({
        queryKey: ['attractions', selectedPark],
        queryFn: async (): Promise<LocationData[]> => {
            const response = await fetch('/api/maps');
            if (!response.ok) throw new Error('Failed to fetch attractions');
            
            const data: unknown = await response.json();
            
            // Handle different response formats
            if (isApiResponse(data)) {
                return data.data;
            } else if (Array.isArray(data)) {
                return data as LocationData[];
            } else {
                throw new Error('Invalid API response format');
            }
        }
    });

    // Initialize data from local storage on component mount
    useEffect(() => {
        const initializeData = async () => {
            try {
                // Load saved geofences
                const savedGeofences = await getGeofences();
                if (savedGeofences && savedGeofences.length > 0) {
                    setGeofences(savedGeofences);
                }

                // Load group members
                const savedMembers = await getGroupMembers();
                if (savedMembers && savedMembers.length > 0) {
                    setGroupMembers(savedMembers);
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load saved data. Starting with empty state.',
                    variant: 'destructive',
                });
            }
        };

        initializeData();

        // Request notification permissions
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }, [toast]);

    // Helper function to calculate distance between two points
    const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }, []);

    // Handle when user enters a geofence
    const handleGeofenceEntryEvent = useCallback((geofence: GeofenceData) => {
        handleGeofenceEntry(geofence);
        toast({
            title: `Entered: ${geofence.name}`,
            description: `You have entered the ${geofence.name} area.`,
            duration: 5000,
        });
    }, [toast]);

    // Handle when user exits a geofence
    const handleGeofenceExitEvent = useCallback((geofence: GeofenceData) => {
        handleGeofenceExit(geofence);
        toast({
            title: `Left: ${geofence.name}`,
            description: `You have left the ${geofence.name} area.`,
            duration: 5000,
        });
    }, [toast]);

    // Handle group separation alerts
    const handleSeparationAlert = useCallback((memberId: string, distance: number) => {
        handleGroupSeparationAlert(memberId, distance);
        const member = groupMembers.find(m => m.id === memberId);

        if (member) {
            const distanceText = distance < 1000
                ? `${Math.round(distance)} meters`
                : `${(distance / 1000).toFixed(1)} km`;

            toast({
                title: 'Group Separation Alert',
                description: `${member.name} is ${distanceText} away from you.`,
                duration: 10000,
            });
        }
    }, [groupMembers, toast]);

    // Update attractions when data is loaded
    useEffect(() => {
        if (attractionsData) {
            // Add wait time data to attractions
            const enhancedAttractions = attractionsData.map((attraction: LocationData) => ({
                ...attraction,
                // Add some random wait times for demonstration
                waitTime: Math.floor(Math.random() * 120),
                status: Math.random() > 0.1 ? 'OPERATING' as const :
                    (Math.random() > 0.5 ? 'DOWN' as const : 'CLOSED' as const),
            }));

            setAttractions(enhancedAttractions);
        }
    }, [attractionsData]);

    // Handle user location updates with enhanced logic and comprehensive error handling
    const handleLocationUpdate = useCallback(async (location: { lat: number; lng: number }) => {
        // Input validation with detailed error messages
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            console.error('Invalid location data provided:', location);
            toast({
                title: 'Location Error',
                description: 'Invalid location coordinates received.',
                variant: 'destructive',
            });
            return;
        }

        // Coordinate bounds validation
        if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
            console.error('Location coordinates out of bounds:', location);
            toast({
                title: 'Location Error',
                description: 'Location coordinates are outside valid range.',
                variant: 'destructive',
            });
            return;
        }

        // Adaptive rate limiting based on battery level and power mode
        const now = Date.now();
        const lastUpdateKey = 'last_location_update';
        const lastUpdate = sessionStorage.getItem(lastUpdateKey);

        // Adjust update interval based on battery level and power mode
        let minUpdateInterval = 5000; // Default 5 seconds
        if (isLowPowerMode || (batteryLevel !== null && batteryLevel < 0.3)) {
            minUpdateInterval = 15000; // 15 seconds in low power mode
        } else if (batteryLevel !== null && batteryLevel < 0.5) {
            minUpdateInterval = 10000; // 10 seconds when battery is getting low
        }

        if (lastUpdate && (now - parseInt(lastUpdate)) < minUpdateInterval) {
            console.debug('Location update rate limited', {
                minInterval: minUpdateInterval,
                batteryLevel,
                isLowPowerMode
            });
            return;
        }

        try {
            // Store update timestamp for rate limiting
            sessionStorage.setItem(lastUpdateKey, now.toString());

            // Enhanced location data with additional context
            const enhancedLocationData = {
                timestamp: new Date(),
                accuracy: undefined as number | undefined,
                altitude: undefined as number | undefined,
                heading: undefined as number | undefined,
                speed: undefined as number | undefined,
            };

            // Get additional location metadata if available
            if ('geolocation' in navigator) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 30000
                        });
                    });

                    enhancedLocationData.accuracy = position.coords.accuracy;
                    enhancedLocationData.altitude = position.coords.altitude ?? undefined;
                    enhancedLocationData.heading = position.coords.heading ?? undefined;
                    enhancedLocationData.speed = position.coords.speed ?? undefined;

                    // Update accuracy state for UI display
                    setLocationAccuracy(position.coords.accuracy);
                } catch (geoError) {
                    console.debug('Could not get enhanced location data:', geoError);
                }
            }

            // Prepare options for updateUserLocation service
            const locationUpdateOptions = {
                userId: MOCK_USER.id,
                userName: MOCK_USER.name,
                avatarUrl: MOCK_USER.avatar,
                // TODO: Add actual vacationId when available from context/auth
                // vacationId: currentVacationId
            };

            // Update user location in the service with enhanced error handling
            const updateSuccess = await updateUserLocation(location.lat, location.lng, locationUpdateOptions);

            if (!updateSuccess) {
                const failureContext = {
                    location,
                    options: locationUpdateOptions,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    online: navigator.onLine
                };

                console.error('Location update service returned false:', failureContext);
                throw new Error('Location update service failed - check authentication and permissions');
            }

            // Create optimized user object for state management
            const currentUser: GroupMember = {
                id: MOCK_USER.id,
                name: MOCK_USER.name,
                avatar: MOCK_USER.avatar,
                lat: location.lat,
                lng: location.lng,
                lastUpdated: enhancedLocationData.timestamp
            };

            // Optimized state update with functional update pattern
            setGroupMembers(prevMembers => {
                // Check if user already exists and location hasn't changed significantly
                const existingUserIndex = prevMembers.findIndex(m => m.id === MOCK_USER.id);

                if (existingUserIndex !== -1) {
                    const existingUser = prevMembers[existingUserIndex];
                    const distance = calculateDistance(
                        existingUser.lat,
                        existingUser.lng,
                        location.lat,
                        location.lng
                    );

                    // Only update if location changed significantly (>5 meters)
                    if (distance < 5) {
                        console.debug('Location change too small, skipping state update');
                        return prevMembers;
                    }

                    // Update existing user in place for better performance
                    const updatedMembers = [...prevMembers];
                    updatedMembers[existingUserIndex] = currentUser;
                    return updatedMembers;
                } else {
                    // Add new user
                    return [...prevMembers, currentUser];
                }
            });

            // Check for geofence interactions with enhanced logic
            if (geofences.length > 0) {
                const geofencePromises = geofences.map(async (geofence) => {
                    const distance = calculateDistance(
                        location.lat,
                        location.lng,
                        geofence.lat,
                        geofence.lng
                    );

                    const isInside = distance <= geofence.radius;
                    const wasInside = sessionStorage.getItem(`geofence_${geofence.id}`) === 'true';

                    if (isInside && !wasInside) {
                        sessionStorage.setItem(`geofence_${geofence.id}`, 'true');
                        handleGeofenceEntryEvent(geofence);
                    } else if (!isInside && wasInside) {
                        sessionStorage.setItem(`geofence_${geofence.id}`, 'false');
                        handleGeofenceExitEvent(geofence);
                    }
                });

                await Promise.allSettled(geofencePromises);
            }

            // Check for group separation alerts with enhanced logic
            if (groupMembers.length > 1) {
                const separationPromises = groupMembers
                    .filter(member => member.id !== MOCK_USER.id)
                    .map(async (member) => {
                        const distance = calculateDistance(
                            location.lat,
                            location.lng,
                            member.lat,
                            member.lng
                        );

                        const alertKey = `separation_alert_${member.id}`;
                        const lastAlert = sessionStorage.getItem(alertKey);
                        const alertCooldown = 300000; // 5 minutes

                        if (distance > (maxGroupSeparationDistance || 200)) {
                            if (!lastAlert || (now - parseInt(lastAlert)) > alertCooldown) {
                                sessionStorage.setItem(alertKey, now.toString());
                                handleSeparationAlert(member.id, distance);
                            }
                        } else {
                            // Clear alert when back in range
                            sessionStorage.removeItem(alertKey);
                        }
                    });

                await Promise.allSettled(separationPromises);
            }

            // Update performance counter
            setLocationUpdateCount(prev => prev + 1);

            // Analytics and logging for debugging
            console.debug('Location updated successfully:', {
                userId: MOCK_USER.id,
                location,
                accuracy: enhancedLocationData.accuracy,
                timestamp: enhancedLocationData.timestamp,
                groupMembersCount: groupMembers.length,
                geofencesCount: geofences.length,
                batteryLevel,
                isLowPowerMode,
                updateCount: locationUpdateCount + 1,
                updateSuccess: true
            });

        } catch (error) {
            // Comprehensive error handling with different error types
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorContext = {
                error: errorMessage,
                location,
                userId: MOCK_USER.id,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                online: navigator.onLine
            };

            console.error('Failed to update location:', errorContext);

            // User-friendly error notification with retry option
            toast({
                title: 'Location Update Failed',
                description: navigator.onLine
                    ? 'Unable to update your location. Please try again.'
                    : 'You appear to be offline. Location will update when connection is restored.',
                variant: 'destructive',
                action: navigator.onLine ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationUpdate(location)}
                    >
                        Retry
                    </Button>
                ) : undefined,
            });

            // Store failed update for retry when online
            if (!navigator.onLine) {
                try {
                    const stored = localStorage.getItem('failed_location_updates') || '[]';
                    const parsed: unknown = JSON.parse(stored);
                    const failedUpdates: FailedLocationUpdate[] = isFailedLocationUpdateArray(parsed) ? parsed : [];
                    
                    const newUpdate: FailedLocationUpdate = { location, timestamp: now, userId: MOCK_USER.id };
                    failedUpdates.push(newUpdate);
                    
                    localStorage.setItem('failed_location_updates', JSON.stringify(failedUpdates.slice(-10))); // Keep last 10
                } catch (storageError) {
                    console.error('Failed to store location update for retry:', storageError);
                }
            }
        }
    }, [geofences, groupMembers, maxGroupSeparationDistance, toast, batteryLevel, isLowPowerMode, locationUpdateCount, calculateDistance, handleGeofenceEntryEvent, handleGeofenceExitEvent, handleSeparationAlert]);

    // Effect to handle offline/online state and retry failed updates
    useEffect(() => {
        const handleOnline = async () => {
            try {
                const stored = localStorage.getItem('failed_location_updates') || '[]';
                const parsed: unknown = JSON.parse(stored);
                const failedUpdates: FailedLocationUpdate[] = isFailedLocationUpdateArray(parsed) ? parsed : [];

                if (failedUpdates.length > 0) {
                    console.log('Retrying failed location updates:', failedUpdates.length);

                    for (const update of failedUpdates) {
                        try {
                            await handleLocationUpdate(update.location);
                        } catch (error) {
                            console.error('Failed to retry location update:', error);
                        }
                    }

                    localStorage.removeItem('failed_location_updates');

                    toast({
                        title: 'Connection Restored',
                        description: 'Your location has been updated.',
                    });
                }
            } catch (storageError) {
                console.error('Failed to parse stored location updates:', storageError);
                localStorage.removeItem('failed_location_updates'); // Clear corrupted data
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [handleLocationUpdate, toast]);

    // Create a new geofence
    const handleCreateGeofence = async () => {
        try {
            // Create geofence using the service
            const newFence = await createGeofence(
                newGeofence.name,
                newGeofence.lat,
                newGeofence.lng,
                newGeofence.radius,
                newGeofence.type
            );

            // Update local state
            setGeofences(prev => [...prev, newFence]);

            // Reset form and close dialog
            setNewGeofence({
                name: '',
                radius: 100,
                type: 'attraction',
                lat: 0,
                lng: 0
            });
            setShowGeofenceDialog(false);

            toast({
                title: 'Geofence Created',
                description: `Successfully created geofence for ${newFence.name}`,
            });
        } catch (error) {
            console.error('Failed to create geofence:', error);
            toast({
                title: 'Error',
                description: 'Failed to create geofence. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Handle park change
    const handleParkChange = (parkId: string) => {
        // Type-safe park selection using type guard
        const isParkId = (id: string): id is ParkId => {
            return Object.prototype.hasOwnProperty.call(PARK_LOCATIONS, id);
        };

        if (isParkId(parkId)) {
            setSelectedPark(parkId);
            const newLocation = PARK_LOCATIONS[parkId];
            setInitialCenter({ lat: newLocation.lat, lng: newLocation.lng });
        }
    };

    // For demo purposes - create mock group members
    const addMockGroupMember = () => {
        // Create a mock member with position slightly offset from current center
        const mockMember: GroupMember = {
            id: `member-${Date.now()}`,
            name: `Disney Fan ${Math.floor(Math.random() * 100)}`,
            avatar: undefined,
            lat: initialCenter.lat + (Math.random() * 0.002 - 0.001),
            lng: initialCenter.lng + (Math.random() * 0.002 - 0.001),
            lastUpdated: new Date()
        };

        setGroupMembers(prev => [...prev, mockMember]);

        toast({
            title: 'Group Member Added',
            description: `${mockMember.name} has joined your group.`,
        });
    };

    // Monitor battery level for optimization
    useEffect(() => {
        const updateBatteryInfo = async () => {
            // Check if getBattery method exists on navigator
            if ('getBattery' in navigator) {
                try {
                    interface BatteryManager extends EventTarget {
                        level: number;
                        charging: boolean;
                        chargingTime: number;
                        dischargingTime: number;
                        addEventListener(type: 'levelchange', listener: () => void): void;
                        removeEventListener(type: 'levelchange', listener: () => void): void;
                    }

                    interface NavigatorWithBattery {
                        getBattery(): Promise<BatteryManager>;
                    }

                    const navigatorWithBattery = navigator as unknown as NavigatorWithBattery;
                    const battery = await navigatorWithBattery.getBattery();
                    setBatteryLevel(battery.level);
                    setIsLowPowerMode(battery.level < 0.2); // Low power mode when battery < 20%

                    const handleBatteryChange = () => {
                        setBatteryLevel(battery.level);
                        setIsLowPowerMode(battery.level < 0.2);
                    };

                    battery.addEventListener('levelchange', handleBatteryChange);
                    return () => battery.removeEventListener('levelchange', handleBatteryChange);
                } catch (error) {
                    console.debug('Battery API not available:', error);
                }
            }
        };

        updateBatteryInfo();
    }, []);

    // Performance monitoring
    useEffect(() => {
        const performanceData = {
            locationUpdates: locationUpdateCount,
            groupMembersCount: groupMembers.length,
            geofencesCount: geofences.length,
            batteryLevel,
            isLowPowerMode,
            timestamp: new Date().toISOString()
        };

        // Log performance metrics every 10 updates
        if (locationUpdateCount > 0 && locationUpdateCount % 10 === 0) {
            console.debug('Location service performance metrics:', performanceData);
        }
    }, [locationUpdateCount, groupMembers.length, geofences.length, batteryLevel, isLowPowerMode]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="container mx-auto mt-6 pb-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading map data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="container mx-auto mt-6 pb-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-4 text-destructive" />
                    <p className="text-destructive">Failed to load map data</p>
                    <p className="text-muted-foreground text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-6 pb-8 space-y-6">
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-primary" />
                        Disney World Explorer
                    </h1>

                    <div className="flex-grow md:mx-4">
                        <Select value={selectedPark} onValueChange={handleParkChange}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Select park" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="magicKingdom">Magic Kingdom</SelectItem>
                                <SelectItem value="epcot">EPCOT</SelectItem>
                                <SelectItem value="hollywoodStudios">Hollywood Studios</SelectItem>
                                <SelectItem value="animalKingdom">Animal Kingdom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Location Status Indicator */}
                        {(locationAccuracy !== null || batteryLevel !== null) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                {locationAccuracy !== null && (
                                    <span title={`Location accuracy: ${Math.round(locationAccuracy)}m`}>
                                        📍 {Math.round(locationAccuracy)}m
                                    </span>
                                )}
                                {batteryLevel !== null && (
                                    <span title={`Battery level: ${Math.round(batteryLevel * 100)}%`}>
                                        🔋 {Math.round(batteryLevel * 100)}%
                                        {isLowPowerMode && ' ⚡'}
                                    </span>
                                )}
                            </div>
                        )}

                        <Button onClick={addMockGroupMember} variant="outline" size="sm" className="h-9">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Add Group Member
                        </Button>

                        <Dialog open={showGeofenceDialog} onOpenChange={setShowGeofenceDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-9">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Geofence
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Geofence</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={newGeofence.name}
                                            onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
                                            placeholder="e.g., Meet at Cinderella Castle"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={newGeofence.type}
                                            onValueChange={(value: GeofenceType) => setNewGeofence({
                                                ...newGeofence,
                                                type: value
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="attraction">Attraction</SelectItem>
                                                <SelectItem value="meeting">Meeting Point</SelectItem>
                                                <SelectItem value="custom">Custom Area</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Radius: {newGeofence.radius}m</Label>
                                        <Slider
                                            value={[newGeofence.radius]}
                                            min={20}
                                            max={500}
                                            step={10}
                                            onValueChange={(value) => setNewGeofence({ ...newGeofence, radius: value[0] })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="lat">Latitude</Label>
                                            <Input
                                                id="lat"
                                                type="number"
                                                step="0.0001"
                                                value={newGeofence.lat || initialCenter.lat}
                                                onChange={(e) => setNewGeofence({ ...newGeofence, lat: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lng">Longitude</Label>
                                            <Input
                                                id="lng"
                                                type="number"
                                                step="0.0001"
                                                value={newGeofence.lng || initialCenter.lng}
                                                onChange={(e) => setNewGeofence({ ...newGeofence, lng: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleCreateGeofence} className="mt-2" disabled={!newGeofence.name}>
                                        Create Geofence
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs value={mapTab} onValueChange={setMapTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="view">View Map</TabsTrigger>
                        <TabsTrigger value="manage">Manage Features</TabsTrigger>
                    </TabsList>

                    <TabsContent value="view" className="mt-4">
                        <div className="h-[600px]">
                            <MapPage
                                initialLocation={initialCenter}
                                showSearch={true}
                                locations={attractions.map(attr => ({
                                    position: { lat: attr.lat, lng: attr.lng },
                                    title: attr.name,
                                    description: attr.description
                                }))}
                                groupMembers={groupMembers}
                                geofences={geofences}
                                onLocationUpdate={handleLocationUpdate}
                                onGeofenceEntry={handleGeofenceEntryEvent}
                                onGeofenceExit={handleGeofenceExitEvent}
                                onSeparationAlert={handleSeparationAlert}
                                maxGroupSeparationDistance={maxGroupSeparationDistance}
                                showWaitTimes={true}
                                className="rounded-lg border shadow-md"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="manage" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Group Members Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        Group Location Sharing
                                    </CardTitle>
                                    <CardDescription>
                                        View and manage group members&apos; locations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px] pr-4">
                                        {groupMembers.length === 0 ? (
                                            <div className="text-center p-4 text-muted-foreground">
                                                No group members yet. Add members to start tracking.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {groupMembers.map(member => (
                                                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                                                        <div className="relative">
                                                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                                {member.avatar ? (
                                                                    <Image
                                                                        src={member.avatar}
                                                                        alt={member.name}
                                                                        width={40}
                                                                        height={40}
                                                                        className="h-full w-full rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-semibold">
                                                                        {member.name.substring(0, 2).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                                                        </div>

                                                        <div className="flex-grow">
                                                            <p className="font-medium">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Last updated: {new Date(member.lastUpdated).toLocaleTimeString()}
                                                            </p>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setInitialCenter({ lat: member.lat, lng: member.lng });
                                                                setMapTab('view');
                                                            }}
                                                        >
                                                            <MapPin className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={addMockGroupMember} variant="outline" className="w-full">
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Add Demo Member
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Geofences Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-primary" />
                                        Geofencing
                                    </CardTitle>
                                    <CardDescription>
                                        Create and manage geofence alerts
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px] pr-4">
                                        {geofences.length === 0 ? (
                                            <div className="text-center p-4 text-muted-foreground">
                                                No geofences created yet. Create one to get notifications when entering or leaving areas.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {geofences.map(fence => (
                                                    <div key={fence.id} className="border rounded-md p-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold">{fence.name}</h4>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${fence.type === 'attraction' ? 'bg-blue-100 text-blue-800' :
                                                                fence.type === 'meeting' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {fence.type.charAt(0).toUpperCase() + fence.type.slice(1)}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 text-xs text-muted-foreground">
                                                            <p>Radius: {fence.radius}m</p>
                                                            <p>Location: {fence.lat.toFixed(4)}, {fence.lng.toFixed(4)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={() => setShowGeofenceDialog(true)}
                                        className="w-full"
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Create New Geofence
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}