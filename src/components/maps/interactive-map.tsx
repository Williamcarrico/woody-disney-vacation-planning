'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Map,
    AdvancedMarker,
    useMap,
    useAdvancedMarkerRef,
    InfoWindow,
    Pin
} from '@vis.gl/react-google-maps';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { MapSkeleton } from './MapLoadingStates';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from '../ui/use-toast';
import styles from './interactive-map.module.css';
import { mapsProxy } from '@/lib/services/google-maps-proxy';
import { useGeofencingWithLocation } from '@/hooks/useGeofencing';
import { DistanceCalculator } from '@/lib/services/consolidated-geofencing';

// Default Disney World coordinates (Magic Kingdom)
const DEFAULT_CENTER = { lat: 28.4177, lng: -81.5812 };
const DEFAULT_ZOOM = 14;

export interface LocationData {
    id: string;
    name: string;
    description?: string;
    lat: number;
    lng: number;
    type?: string;
    imageUrl?: string;
    waitTime?: number;
    status?: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';
}

export interface GroupMember {
    id: string;
    name: string;
    avatar?: string;
    lat: number;
    lng: number;
    lastUpdated: Date;
}

export interface GeofenceData {
    id: string;
    lat: number;
    lng: number;
    radius: number;
    name: string;
    type: 'attraction' | 'meeting' | 'custom';
}

export interface InteractiveMapProps {
    className?: string;
    markers?: readonly LocationData[];
    height?: string | number;
    width?: string | number;
    showSearch?: boolean;
    showUserLocation?: boolean;
    initialCenter?: { lat: number; lng: number };
    initialZoom?: number;
    mapId?: string;
    userId?: string;
    groupMembers?: readonly GroupMember[];
    geofences?: readonly GeofenceData[];
    onLocationUpdate?: (location: { lat: number; lng: number }) => void;
    onGeofenceEnter?: (geofence: GeofenceData) => void;
    onGeofenceExit?: (geofence: GeofenceData) => void;
    onGroupMemberDistanceAlert?: (memberId: string, distance: number) => void;
    maxGroupSeparationDistance?: number;
    showWaitTimes?: boolean;
}

/**
 * SearchBox component for the InteractiveMap
 */
function SearchBox() {
    const map = useMap();
    const [query, setQuery] = useState('');

    const handleSearch = async () => {
        if (!map || !query) return;

        try {
            const response = await mapsProxy.geocode(query);
            if (response.status === 'OK' && response.results.length > 0) {
                const location = response.results[0].geometry.location;
                map.panTo({ lat: location.lat, lng: location.lng });
                map.setZoom(15);
            }
        } catch (error) {
            console.error('Error during search:', error);
            toast({
                title: 'Search failed',
                description: 'Unable to find location. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="absolute top-2 left-2 right-2 flex gap-2 max-w-96 z-10">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search location..."
                className="bg-white/90"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="icon" variant="default" onClick={handleSearch}>
                <Search className="h-4 w-4" />
            </Button>
        </div>
    );
}

/**
 * UserLocationControl component for the InteractiveMap
 */
function UserLocationControl() {
    const map = useMap();
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        // Only set mapReady to true if map is available and fully initialized
        if (map?.getDiv && typeof map.getDiv === 'function') {
            setMapReady(true);
        }
    }, [map]);

    const handleClick = () => {
        if (!map || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.panTo(userLocation);
                map.setZoom(15);
            },
            (error) => {
                console.error('Error getting user location:', error);
            }
        );
    };

    // Don't render anything until map is ready
    if (!mapReady) return null;

    return (
        <div className="absolute right-2 bottom-2 z-10">
            <Button
                variant="secondary"
                size="icon"
                className="bg-white hover:bg-gray-100"
                onClick={handleClick}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="1" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                    <line x1="12" y1="20" x2="12" y2="22" />
                    <line x1="4" y1="12" x2="2" y2="12" />
                    <line x1="22" y1="12" x2="20" y2="12" />
                </svg>
            </Button>
        </div>
    );
}

/**
 * Helper functions for badge styling and text
 */
const getBadgeVariant = (location: LocationData) => {
    if (location.status !== 'OPERATING') return 'outline';
    if (location.waitTime === undefined) return 'outline';
    if (location.waitTime <= 10) return 'secondary';
    if (location.waitTime <= 30) return 'secondary';
    if (location.waitTime <= 60) return 'default';
    return 'destructive';
};

const getBadgeText = (location: LocationData) => {
    if (location.status !== 'OPERATING') {
        return location.status === 'DOWN' ? 'Down' : 'Closed';
    }

    return location.waitTime === 0 ? 'Now' : `${location.waitTime}m`;
};

/**
 * MarkerWithInfoWindow component for the InteractiveMap
 */
function MarkerWithInfoWindow({ location, showWaitTimes }: { readonly location: LocationData; readonly showWaitTimes?: boolean }) {
    const [infoWindowOpen, setInfoWindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const map = useMap();
    const [mapReady, setMapReady] = useState(false);

    // Check if map is ready before attempting to render marker
    useEffect(() => {
        if (map?.getDiv && typeof map.getDiv === 'function') {
            setMapReady(true);
        }
    }, [map]);

    const getMarkerContent = () => {
        if (location.type === 'attraction') {
            return (
                <div className="relative">
                    <Image
                        src="/images/attraction-marker.svg"
                        alt={location.name}
                        width={32}
                        height={32}
                        className="cursor-pointer hover:scale-110 transition-transform"
                    />
                    {showWaitTimes && location.waitTime !== undefined && (
                        <Badge
                            variant={getBadgeVariant(location)}
                            className="absolute -top-2 -right-2 text-xs px-1"
                        >
                            {getBadgeText(location)}
                        </Badge>
                    )}
                </div>
            );
        } else if (location.type === 'dining') {
            return (
                <Pin
                    background={'#F97316'}
                    glyphColor={'#FFFFFF'}
                    borderColor={'#C2410C'}
                    scale={1.2}
                />
            );
        } else if (location.type === 'service') {
            return (
                <Pin
                    background={'#10B981'}
                    glyphColor={'#FFFFFF'}
                    borderColor={'#047857'}
                    scale={1.2}
                />
            );
        } else {
            return (
                <Pin
                    background={'#5387DA'}
                    glyphColor={'#FFFFFF'}
                    borderColor={'#3E67A6'}
                    scale={1.2}
                />
            );
        }
    };

    // Don't render anything until map is ready
    if (!mapReady) return null;

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => setInfoWindowOpen(true)}
                title={location.name}
            >
                {getMarkerContent()}
            </AdvancedMarker>
            {infoWindowOpen && marker && (
                <InfoWindow
                    anchor={marker}
                    onCloseClick={() => setInfoWindowOpen(false)}
                    className="max-w-xs"
                >
                    <div>
                        <h3 className="font-bold text-lg">{location.name}</h3>
                        {location.description && (
                            <p className="mt-1 text-sm">{location.description}</p>
                        )}
                        {location.waitTime !== undefined && location.status === 'OPERATING' && (
                            <div className="mt-2 flex items-center gap-1 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Current wait: <strong>{location.waitTime} mins</strong></span>
                            </div>
                        )}
                        {location.status && location.status !== 'OPERATING' && (
                            <div className="mt-2">
                                <Badge variant={location.status === 'DOWN' ? 'default' : 'outline'}>
                                    {location.status === 'DOWN' ? 'Temporarily Down' : 'Closed'}
                                </Badge>
                            </div>
                        )}
                        {location.imageUrl && (
                            <div className="mt-2">
                                <Image
                                    src={location.imageUrl}
                                    alt={location.name}
                                    width={200}
                                    height={120}
                                    className="rounded-md object-cover"
                                />
                            </div>
                        )}
                    </div>
                </InfoWindow>
            )}
        </>
    );
}

/**
 * GroupMemberMarker component for showing real-time group member locations
 */
function GroupMemberMarker({ member }: { readonly member: GroupMember }) {
    const [infoWindowOpen, setInfoWindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const map = useMap();
    const [mapReady, setMapReady] = useState(false);

    // Check if map is ready before attempting to render marker
    useEffect(() => {
        if (map?.getDiv && typeof map.getDiv === 'function') {
            setMapReady(true);
        }
    }, [map]);

    // Format last updated time
    const getLastUpdatedText = () => {
        const minutesAgo = Math.round((new Date().getTime() - member.lastUpdated.getTime()) / 60000);
        if (minutesAgo < 1) return 'Just now';
        if (minutesAgo === 1) return '1 minute ago';
        return `${minutesAgo} minutes ago`;
    };

    // Don't render anything until map is ready
    if (!mapReady) return null;

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                position={{ lat: member.lat, lng: member.lng }}
                onClick={() => setInfoWindowOpen(true)}
                title={member.name}
            >
                <div className="relative cursor-pointer hover:scale-110 transition-transform">
                    <Avatar className="h-10 w-10 shadow-md" style={{ boxShadow: '0 0 0 2px white' }}>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                </div>
            </AdvancedMarker>
            {infoWindowOpen && marker && (
                <InfoWindow
                    anchor={marker}
                    onCloseClick={() => setInfoWindowOpen(false)}
                >
                    <div className="p-1">
                        <h3 className="font-bold">{member.name}</h3>
                        <p className="text-xs text-muted-foreground">Last updated: {getLastUpdatedText()}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full text-xs"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `https://maps.google.com/?q=${member.lat},${member.lng}`
                                );
                                toast({
                                    title: "Location copied",
                                    description: "Link to map location copied to clipboard",
                                });
                            }}
                        >
                            Share Location
                        </Button>
                    </div>
                </InfoWindow>
            )}
        </>
    );
}

/**
 * CustomCircle component for rendering Google Maps circles
 */
function CustomCircle({
    center,
    radius,
    options
}: {
    readonly center: google.maps.LatLngLiteral;
    readonly radius: number;
    readonly options: google.maps.CircleOptions;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Check if Google Maps is loaded before using it
        if (typeof google === 'undefined' || !google.maps?.Circle) {
            console.warn('Google Maps API not loaded, circle rendering unavailable');
            return;
        }

        try {
            const circle = new google.maps.Circle({
                map,
                center,
                radius,
                ...options
            });

            return () => {
                circle.setMap(null);
            };
        } catch (error) {
            console.error('Error creating circle:', error);
        }
    }, [map, center, radius, options]);

    return null;
}

/**
 * GeofenceCircle component for visualizing geofences
 */
function GeofenceCircle({ geofence }: { readonly geofence: GeofenceData }) {
    const map = useMap();
    const [mapReady, setMapReady] = useState(false);

    // Check if map is ready
    useEffect(() => {
        if (map?.getDiv && typeof map.getDiv === 'function') {
            setMapReady(true);
        }
    }, [map]);

    const getCircleOptions = () => {
        // Different styles for different geofence types
        switch (geofence.type) {
            case 'attraction':
                return {
                    strokeColor: '#5387DA',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#5387DA',
                    fillOpacity: 0.1
                };
            case 'meeting':
                return {
                    strokeColor: '#10B981',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#10B981',
                    fillOpacity: 0.1
                };
            case 'custom':
                return {
                    strokeColor: '#EF4444',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#EF4444',
                    fillOpacity: 0.1
                };
            default:
                return {
                    strokeColor: '#6B7280',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#6B7280',
                    fillOpacity: 0.1
                };
        }
    };

    // Don't render anything until map is ready
    if (!mapReady) return null;

    return (
        <CustomCircle
            center={{ lat: geofence.lat, lng: geofence.lng }}
            radius={geofence.radius}
            options={getCircleOptions()}
        />
    );
}

/**
 * GroupStatusButton component for the InteractiveMap
 */
function GroupStatusButton({ groupMembers }: { readonly groupMembers?: readonly GroupMember[] }) {
    const map = useMap();

    if (!groupMembers || groupMembers.length === 0) return null;

    const handleClick = () => {
        if (!map) return;

        // Calculate bounds that include all group members
        const bounds = new google.maps.LatLngBounds();
        groupMembers.forEach(member => {
            bounds.extend({ lat: member.lat, lng: member.lng });
        });

        // Fit map to these bounds
        map.fitBounds(bounds, 50); // 50px padding
    };

    return (
        <div className="absolute left-2 bottom-2 z-10">
            <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1"
                onClick={handleClick}
            >
                <Users className="h-4 w-4" />
                <span>Group ({groupMembers.length})</span>
            </Button>
        </div>
    );
}

/**
 * InteractiveMap component
 * A reusable Google Maps component with markers, search, and user location features
 */
export function InteractiveMap({
    className,
    markers = [],
    height = 500,
    width = '100%',
    showSearch = true,
    showUserLocation = true,
    initialCenter = DEFAULT_CENTER,
    initialZoom = DEFAULT_ZOOM,
    mapId,
    userId,
    groupMembers = [],
    geofences = [],
    onLocationUpdate,
    onGeofenceEnter,
    onGeofenceExit,
    onGroupMemberDistanceAlert,
    maxGroupSeparationDistance = 200, // meters
    showWaitTimes = false
}: Readonly<InteractiveMapProps>) {
    const [isLoaded, setIsLoaded] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);
    const watchIdRef = useRef<number | null>(null);

    // Using a fallback mapId or providing a console warning if none is available
    const effectiveMapId = mapId || process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // Set CSS variables for height and width
    useEffect(() => {
        document.documentElement.style.setProperty('--map-height', typeof height === 'number' ? `${height}px` : height);
        document.documentElement.style.setProperty('--map-width', typeof width === 'number' ? `${width}px` : width);
    }, [height, width]);

    // Initialize geofencing
    const geofencing = useGeofencingWithLocation({
        userId: userId || 'default-user',
        onEnter: useCallback((event) => {
            const geofence = {
                id: event.geofence.id,
                lat: event.geofence.lat,
                lng: event.geofence.lng,
                radius: event.geofence.radius,
                name: event.geofence.name,
            };
            onGeofenceEnter?.(geofence);
        }, [onGeofenceEnter]),
        onExit: useCallback((event) => {
            const geofence = {
                id: event.geofence.id,
                lat: event.geofence.lat,
                lng: event.geofence.lng,
                radius: event.geofence.radius,
                name: event.geofence.name,
            };
            onGeofenceExit?.(geofence);
        }, [onGeofenceExit]),
        enableToasts: true,
    });

    // Sync geofences with the service
    useEffect(() => {
        // Remove all existing geofences
        geofencing.activeGeofences.forEach(gf => {
            geofencing.removeGeofence(gf.id);
        });

        // Add new geofences
        geofences.forEach(gf => {
            geofencing.addGeofence({
                ...gf,
                type: 'custom',
                priority: 'medium',
                alerts: {
                    onEnter: true,
                    onExit: true,
                    onDwell: false,
                    cooldown: 300,
                    sound: false,
                    vibrate: true,
                },
            });
        });
    }, [geofences, geofencing]);

    // Check if user is too far from any group members
    const checkGroupSeparation = useCallback((location: { lat: number; lng: number }) => {
        if (!onGroupMemberDistanceAlert || !location) return;

        groupMembers.forEach(member => {
            try {
                // Calculate distance using consolidated service
                const distance = DistanceCalculator.haversine(location, member);

                // Check if distance exceeds max separation and alert hasn't been sent recently
                const recentAlertKey = `distance-alert-${member.id}`;
                const lastAlertTime = sessionStorage.getItem(recentAlertKey);
                const currentTime = Date.now();

                // Only alert if it's been more than 5 minutes since the last alert
                if (distance > maxGroupSeparationDistance &&
                    (!lastAlertTime || (currentTime - parseInt(lastAlertTime)) > 5 * 60 * 1000)) {
                    onGroupMemberDistanceAlert(member.id, distance);
                    sessionStorage.setItem(recentAlertKey, currentTime.toString());
                }
            } catch (error) {
                console.error('Error checking group separation:', error);
            }
        });
    }, [groupMembers, maxGroupSeparationDistance, onGroupMemberDistanceAlert]);

    // Start tracking user location if showUserLocation is true
    useEffect(() => {
        if (!showUserLocation) return;

        // Start watching location with geofencing
        geofencing.startWatching();

        // Clean up on unmount
        return () => {
            geofencing.stopWatching();
        };
    }, [showUserLocation, geofencing]);

    // Update location callback when location changes
    useEffect(() => {
        if (geofencing.lastLocation && onLocationUpdate) {
            const { lat, lng } = geofencing.lastLocation;
            onLocationUpdate({ lat, lng });
            
            // Check distance to other group members
            checkGroupSeparation({ lat, lng });
        }
    }, [geofencing.lastLocation, onLocationUpdate, checkGroupSeparation]);

    // Show warning if no mapId is provided
    useEffect(() => {
        if (!effectiveMapId) {
            console.warn('No Map ID provided to InteractiveMap. Advanced Markers may not work correctly. Please set NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID in your environment variables.');
        }
    }, [effectiveMapId]);

    if (!isLoaded) {
        return <MapSkeleton height={height} width={width} />;
    }

    // Check if Google Maps is available before rendering the map
    if (typeof google === 'undefined' || !google.maps) {
        return (
            <div className={cn(
                styles.mapContainer,
                className
            )} style={{ height: typeof height === 'number' ? `${height}px` : height, width: typeof width === 'number' ? `${width}px` : width }}>
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <div className="text-center p-4">
                        <div className="text-gray-500 mb-2">Map Loading...</div>
                        <div className="text-sm text-gray-400">
                            Please make sure this component is wrapped in a GoogleMapsProvider
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Determine height class based on the height prop
    const getHeightClass = () => {
        if (typeof height === 'number') {
            // Check if we have a predefined class for this height
            if (height === 300) return styles['h-300'];
            if (height === 400) return styles['h-400'];
            if (height === 500) return styles['h-500'];
            if (height === 600) return styles['h-600'];

            // For custom heights, create a style element with a custom class
            const styleId = 'custom-map-heights';
            let styleEl = document.getElementById(styleId);

            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }

            const className = `map-h-${height}`;
            if (styleEl instanceof HTMLStyleElement && !styleEl.innerHTML.includes(className)) {
                styleEl.innerHTML += `.${className} { height: ${height}px !important; }`;
            }

            return className;
        }

        if (height === '100%') return styles['h-full'];
        return '';
    };

    // Determine width class based on the width prop
    const getWidthClass = () => {
        if (width === '100%') return styles['w-full'];
        if (width === '50%') return styles['w-half'];
        if (width === 'auto') return styles['w-auto'];

        // For custom widths, create a style element with a custom class
        if (typeof width === 'string' || typeof width === 'number') {
            const styleId = 'custom-map-widths';
            let styleEl = document.getElementById(styleId);

            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }

            const widthValue = typeof width === 'number' ? `${width}px` : width;
            const className = `map-w-${widthValue.replace(/[^a-z0-9]/gi, '-')}`;

            if (styleEl instanceof HTMLStyleElement && !styleEl.innerHTML.includes(className)) {
                styleEl.innerHTML += `.${className} { width: ${widthValue} !important; }`;
            }

            return className;
        }

        return '';
    };

    const heightClass = getHeightClass();
    const widthClass = getWidthClass();

    return (
        <div className={cn(
            styles.mapContainer,
            heightClass,
            widthClass,
            className
        )}>
            <Map
                mapId={effectiveMapId || ''}
                defaultCenter={initialCenter}
                defaultZoom={initialZoom}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
                mapTypeId={google.maps?.MapTypeId?.ROADMAP || 'roadmap'}
                mapTypeControl={true}
                zoomControl={true}
                streetViewControl={true}
                fullscreenControl={true}
                className="h-full w-full"
            >
                {showSearch && <SearchBox />}
                {showUserLocation && <UserLocationControl />}
                {groupMembers.length > 0 && <GroupStatusButton groupMembers={groupMembers} />}

                {/* Get map instance via the children components */}
                <MapEventHandlers onMapLoad={(map) => { mapRef.current = map; }} />

                {/* Render markers */}
                {markers.map((location) => (
                    <MarkerWithInfoWindow
                        key={location.id}
                        location={location}
                        showWaitTimes={showWaitTimes}
                    />
                ))}

                {/* Render group member markers */}
                {groupMembers.map((member) => (
                    <GroupMemberMarker key={member.id} member={member} />
                ))}

                {/* Render geofences */}
                {geofences.map((geofence) => (
                    <GeofenceCircle key={geofence.id} geofence={geofence} />
                ))}
            </Map>
        </div>
    );
}

// Add a new component to handle map events
function MapEventHandlers({ onMapLoad }: { readonly onMapLoad: (map: google.maps.Map) => void }) {
    const map = useMap();

    useEffect(() => {
        if (map) {
            onMapLoad(map);
        }
    }, [map, onMapLoad]);

    return null;
}