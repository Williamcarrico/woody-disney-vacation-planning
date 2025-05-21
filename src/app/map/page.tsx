'use client';

import { useEffect, useState } from 'react';
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
    Clock,
    PlusCircle,
    Bell,
    UserCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
};

export default function MapPageWrapper() {
    const { toast } = useToast();
    const [initialCenter, setInitialCenter] = useState(PARK_LOCATIONS.magicKingdom);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
    const [geofences, setGeofences] = useState<GeofenceData[]>([]);
    const [attractions, setAttractions] = useState<LocationData[]>([]);
    const [newGeofence, setNewGeofence] = useState({
        name: '',
        radius: 100,
        type: 'attraction' as const,
        lat: 0,
        lng: 0
    });
    const [showGeofenceDialog, setShowGeofenceDialog] = useState(false);
    const [mapTab, setMapTab] = useState('view');
    const [selectedPark, setSelectedPark] = useState('magicKingdom');

    // Fetch attractions data
    const { data: attractionsData, isLoading } = useQuery({
        queryKey: ['attractions', selectedPark],
        queryFn: async () => {
            const response = await fetch('/api/maps');
            if (!response.ok) throw new Error('Failed to fetch attractions');
            return response.json();
        }
    });

    // Initialize data from local storage on component mount
    useEffect(() => {
        // Load saved geofences
        const savedGeofences = getGeofences();
        if (savedGeofences && savedGeofences.length > 0) {
            setGeofences(savedGeofences);
        }

        // Load group members
        const savedMembers = getGroupMembers();
        if (savedMembers && savedMembers.length > 0) {
            setGroupMembers(savedMembers);
        }

        // Request notification permissions
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }, []);

    // Update attractions when data is loaded
    useEffect(() => {
        if (attractionsData) {
            // Add wait time data to attractions
            const enhancedAttractions = attractionsData.map((attraction: LocationData) => ({
                ...attraction,
                // Add some random wait times for demonstration
                waitTime: Math.floor(Math.random() * 120),
                status: Math.random() > 0.1 ? 'OPERATING' :
                    (Math.random() > 0.5 ? 'DOWN' : 'CLOSED'),
            }));

            setAttractions(enhancedAttractions);
        }
    }, [attractionsData]);

    // Handle user location updates
    const handleLocationUpdate = async (location: { lat: number; lng: number }) => {
        try {
            // Update user location in the group
            await updateUserLocation(location.lat, location.lng, {
                userId: MOCK_USER.id,
                userName: MOCK_USER.name,
                avatarUrl: MOCK_USER.avatar
            });

            // For demo purposes, we'll add the current user to the group members
            const currentUser: GroupMember = {
                id: MOCK_USER.id,
                name: MOCK_USER.name,
                avatar: MOCK_USER.avatar,
                lat: location.lat,
                lng: location.lng,
                lastUpdated: new Date()
            };

            // Update state (filtering out the current user if they're already there)
            setGroupMembers(prev => {
                const filteredMembers = prev.filter(m => m.id !== MOCK_USER.id);
                return [...filteredMembers, currentUser];
            });
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    };

    // Handle when user enters a geofence
    const handleGeofenceEntryEvent = (geofence: GeofenceData) => {
        handleGeofenceEntry(geofence);
        toast({
            title: `Entered: ${geofence.name}`,
            description: `You have entered the ${geofence.name} area.`,
            duration: 5000,
        });
    };

    // Handle when user exits a geofence
    const handleGeofenceExitEvent = (geofence: GeofenceData) => {
        handleGeofenceExit(geofence);
        toast({
            title: `Left: ${geofence.name}`,
            description: `You have left the ${geofence.name} area.`,
            duration: 5000,
        });
    };

    // Handle group separation alerts
    const handleSeparationAlert = (memberId: string, distance: number) => {
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
    };

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
        setSelectedPark(parkId);
        setInitialCenter(PARK_LOCATIONS[parkId as keyof typeof PARK_LOCATIONS]);
    };

    // For demo purposes - create mock group members
    const addMockGroupMember = () => {
        // Create a mock member with position slightly offset from Magic Kingdom
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
                                            onValueChange={(value) => setNewGeofence({
                                                ...newGeofence,
                                                type: value as 'attraction' | 'meeting' | 'custom'
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
                                        View and manage group members' locations
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
                                                                    <img
                                                                        src={member.avatar}
                                                                        alt={member.name}
                                                                        className="h-full w-full rounded-full"
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