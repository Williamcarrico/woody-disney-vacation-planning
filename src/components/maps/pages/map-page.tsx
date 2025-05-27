'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InteractiveMap, LocationData, GroupMember, GeofenceData } from '../interactive-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MapPin, Search, Compass, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface MapPageProps {
    readonly className?: string;
    readonly initialLocation?: { readonly lat: number; readonly lng: number };
    readonly locations?: ReadonlyArray<{
        readonly position: { readonly lat: number; readonly lng: number };
        readonly title: string;
        readonly description?: string;
    }>;
    readonly showSearch?: boolean;
    readonly groupMembers?: readonly GroupMember[];
    readonly geofences?: readonly GeofenceData[];
    readonly onLocationUpdate?: (location: { lat: number; lng: number }) => void;
    readonly onGeofenceEntry?: (geofence: GeofenceData) => void;
    readonly onGeofenceExit?: (geofence: GeofenceData) => void;
    readonly onSeparationAlert?: (memberId: string, distance: number) => void;
    readonly maxGroupSeparationDistance?: number;
    readonly showWaitTimes?: boolean;
}

/**
 * A standalone full-page map component with search, location tracking, and other features
 */
export default function MapPage({
    className,
    initialLocation,
    locations = [],
    showSearch = true,
    groupMembers = [],
    geofences = [],
    onLocationUpdate,
    onGeofenceEntry,
    onGeofenceExit,
    onSeparationAlert,
    maxGroupSeparationDistance = 200,
    showWaitTimes = false
}: MapPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showControls, setShowControls] = useState(true);
    const [mapLocations, setMapLocations] = useState<LocationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [zoom, setZoom] = useState(14);
    const mapRef = useRef<HTMLDivElement>(null);

    // Use a hardcoded default Map ID if none is provided in environment variables
    // This ensures Advanced Markers will work properly
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '8f077a07a8eb2b6d';

    // Fetch map locations from the API
    useEffect(() => {
        if (locations.length > 0) {
            // Convert passed locations to the required format
            const formattedLocations = locations.map((loc, index) => ({
                id: `loc-${index}`,
                name: loc.title,
                description: loc.description,
                lat: loc.position.lat,
                lng: loc.position.lng,
                type: 'location'
            }));

            setMapLocations(formattedLocations);
            setIsLoading(false);
            return;
        }

        async function fetchLocations() {
            try {
                const response = await fetch('/api/maps');
                if (!response.ok) {
                    throw new Error('Failed to fetch locations');
                }
                const data = await response.json();
                setMapLocations(data);
            } catch (error) {
                console.error('Error fetching map data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLocations();
    }, [locations]);

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // The actual search is handled by the InteractiveMap component
    };

    // Toggle map controls visibility
    const toggleControls = () => {
        setShowControls(prev => !prev);
    };

    // Zoom control handlers
    const zoomIn = () => {
        setZoom(prev => Math.min(prev + 1, 20));
    };

    const zoomOut = () => {
        setZoom(prev => Math.max(prev - 1, 1));
    };

    return (
        <div className={cn("h-full w-full flex flex-col relative", className)}>
            {/* Header with search */}
            <div className="bg-card/80 backdrop-blur-sm border-b p-3 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Disney World Explorer</h2>
                </div>

                <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search locations..."
                            className="pl-9 pr-4 py-2 h-10 bg-background/60"
                        />
                    </div>
                </form>

                <Button variant="ghost" size="icon" onClick={toggleControls}>
                    <Compass className="h-5 w-5" />
                </Button>
            </div>

            {/* Main map area */}
            <div ref={mapRef} className="flex-1 relative">
                <InteractiveMap
                    initialCenter={initialLocation || { lat: 28.3852, lng: -81.5639 }} // Disney World as default
                    initialZoom={zoom}
                    height="100%"
                    width="100%"
                    showSearch={showSearch}
                    markers={mapLocations}
                    showUserLocation={true}
                    mapId={mapId}
                    groupMembers={groupMembers}
                    geofences={geofences}
                    onLocationUpdate={onLocationUpdate}
                    onGeofenceEnter={onGeofenceEntry}
                    onGeofenceExit={onGeofenceExit}
                    onGroupMemberDistanceAlert={onSeparationAlert}
                    maxGroupSeparationDistance={maxGroupSeparationDistance}
                    showWaitTimes={showWaitTimes}
                />

                {/* Floating controls */}
                <AnimatedControls show={showControls}>
                    <div className="absolute right-4 top-4 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border p-2 flex flex-col gap-2">
                        <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom In">
                            <ZoomIn className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom Out">
                            <ZoomOut className="h-5 w-5" />
                        </Button>
                        <div className="h-px bg-border my-1" />
                        <Button variant="ghost" size="icon" title="Layer Control">
                            <Layers className="h-5 w-5" />
                        </Button>
                    </div>
                </AnimatedControls>
            </div>

            {/* Footer with info */}
            <div className="bg-card/80 backdrop-blur-sm border-t p-2 text-xs text-center text-muted-foreground z-10">
                Map data ©2025 Disney • Explore the magic of Disney World and plan your journey
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                    <p className="text-lg font-medium">Loading map data...</p>
                </div>
            )}
        </div>
    );
}

// Helper component for animated controls
function AnimatedControls({
    children,
    show
}: {
    readonly children: React.ReactNode;
    readonly show: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{
                opacity: show ? 1 : 0,
                x: show ? 0 : 20,
                pointerEvents: show ? "auto" : "none"
            }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
}