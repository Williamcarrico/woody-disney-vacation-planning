'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getPark } from '@/lib/api/themeParks-compat';
import type { Attraction, Coordinates } from '@/types/api';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AlertCircle, Maximize, Minimize, Map as MapIcon, ArrowUp, Locate, RotateCcw } from "lucide-react";
import { cn } from '@/lib/utils';
import styles from './ParkMap.module.css';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Type definitions
type MapViewMode = 'standard' | 'waitTimes' | 'heatmap';
type FilterMode = 'all' | 'rides' | 'shows' | 'dining';
type AttractionStatus = 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';

interface AttractionWaitTimeData {
    readonly status: AttractionStatus;
    readonly waitTime?: {
        readonly standby: number;
    };
}

interface ParkMapProps {
    readonly parkId: string;
    readonly attractions: Attraction[];
    readonly waitTimeData?: Record<string, AttractionWaitTimeData>;
    readonly onSelectAttraction?: (attraction: Attraction) => void;
    readonly height?: string;
}

interface AreaData {
    coordinates: Coordinates;
    radius: number;
    color: string;
    fillColor: string;
    name: string;
}

interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

// Disney World Magic Kingdom coordinates (approximate center)
const DEFAULT_CENTER: [number, number] = [28.4177, -81.5812];

// Park area definitions with proper coordinates
const PARK_AREAS: Record<string, AreaData> = {
    'fantasyland': {
        coordinates: { latitude: 28.4203, longitude: -81.5796 },
        radius: 200,
        color: '#8B5CF6',
        fillColor: 'rgba(139, 92, 246, 0.2)',
        name: 'Fantasyland'
    },
    'tomorrowland': {
        coordinates: { latitude: 28.4186, longitude: -81.5778 },
        radius: 180,
        color: '#06B6D4',
        fillColor: 'rgba(6, 182, 212, 0.2)',
        name: 'Tomorrowland'
    },
    'frontierland': {
        coordinates: { latitude: 28.4198, longitude: -81.5845 },
        radius: 190,
        color: '#D97706',
        fillColor: 'rgba(217, 119, 6, 0.2)',
        name: 'Frontierland'
    },
    'adventureland': {
        coordinates: { latitude: 28.4178, longitude: -81.5838 },
        radius: 150,
        color: '#059669',
        fillColor: 'rgba(5, 150, 105, 0.2)',
        name: 'Adventureland'
    },
    'liberty_square': {
        coordinates: { latitude: 28.4189, longitude: -81.5825 },
        radius: 120,
        color: '#DC2626',
        fillColor: 'rgba(220, 38, 38, 0.2)',
        name: 'Liberty Square'
    },
    'main_street': {
        coordinates: { latitude: 28.4158, longitude: -81.5811 },
        radius: 140,
        color: '#1E40AF',
        fillColor: 'rgba(30, 64, 175, 0.2)',
        name: 'Main Street U.S.A.'
    }
};

// Custom marker icons
const createMarkerIcon = (
    color: string,
    size: number = 30,
    waitTime?: number,
    status?: AttractionStatus
): L.DivIcon => {
    const iconSize = Math.max(20, Math.min(40, size));
    const fontSize = Math.max(10, iconSize * 0.4);

    let iconHtml = '';

    if (waitTime !== undefined && status === 'OPERATING') {
        iconHtml = `
            <div class="${styles.markerIcon}" style="--icon-size: ${iconSize}px; --icon-color: ${color}; --icon-font-size: ${fontSize}px;">
                ${waitTime}
            </div>
        `;
    } else {
        const statusIcon = status === 'DOWN' ? '⚠️' : status === 'CLOSED' ? '🚫' : '📍';
        const statusFontSize = Math.max(8, iconSize * 0.35);
        iconHtml = `
            <div class="${styles.markerIcon}" style="--icon-size: ${iconSize}px; --icon-color: ${color}; --icon-font-size: ${statusFontSize}px;">
                ${statusIcon}
            </div>
        `;
    }

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
        popupAnchor: [0, -iconSize / 2]
    });
};

// User location icon
const createUserLocationIcon = (): L.DivIcon => {
    return L.divIcon({
        html: `<div class="${styles.userLocationIcon}"></div>`,
        className: 'user-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

// Helper functions
const findAreaForAttraction = (attraction: Attraction): string => {
    if (attraction.tags) {
        const areaTags = attraction.tags.filter(tag =>
            Object.keys(PARK_AREAS).includes(tag)
        );
        if (areaTags.length > 0) {
            return areaTags[0];
        }
    }

    const name = attraction.name.toLowerCase();
    if (name.includes('fantasy')) return 'fantasyland';
    if (name.includes('tomorrow')) return 'tomorrowland';
    if (name.includes('frontier')) return 'frontierland';
    if (name.includes('adventure')) return 'adventureland';
    if (name.includes('liberty')) return 'liberty_square';
    if (name.includes('main street')) return 'main_street';

    return 'main_street';
};

const generateCoordinatesInArea = (areaKey: string): Coordinates => {
    const area = PARK_AREAS[areaKey];
    const offsetLat = (Math.random() - 0.5) * 0.003;
    const offsetLng = (Math.random() - 0.5) * 0.003;

    return {
        latitude: area.coordinates.latitude + offsetLat,
        longitude: area.coordinates.longitude + offsetLng
    };
};

const assignMockCoordinates = (attractions: Attraction[]): Attraction[] => {
    return attractions.map(attraction => {
        if (attraction.location) return attraction;

        const area = findAreaForAttraction(attraction);
        const location = generateCoordinatesInArea(area);

        return {
            ...attraction,
            location
        };
    });
};

const getWaitTimeColor = (waitTime: number | null, status: AttractionStatus): string => {
    if (status !== 'OPERATING') {
        if (status === 'DOWN') return '#F59E0B';
        return '#6B7280';
    }

    if (waitTime === null) return '#059669';
    if (waitTime <= 10) return '#059669';
    if (waitTime <= 30) return '#2563EB';
    if (waitTime <= 60) return '#D97706';
    return '#DC2626';
};

const filterAttractions = (
    attractions: Attraction[],
    filter: FilterMode,
    mapView: MapViewMode,
    waitTimeData?: Record<string, AttractionWaitTimeData>,
    maxWaitTime = 240
) => {
    if (!attractions) return [];

    return attractions.filter(attraction => {
        if (filter === 'rides' && attraction.attractionType !== 'RIDE') return false;
        if (filter === 'shows' && attraction.attractionType !== 'SHOW') return false;
        if (filter === 'dining') return false;

        if (mapView === 'waitTimes' && waitTimeData) {
            const standbyWait = waitTimeData[attraction.id]?.waitTime?.standby;
            if (standbyWait != null && standbyWait > maxWaitTime) {
                return false;
            }
        }

        return true;
    });
};

// Map event handlers
const MapEventHandler = ({
    onLocationFound,
    onLocationError
}: {
    onLocationFound: (location: UserLocation) => void;
    onLocationError: (error: string) => void;
}) => {
    useMapEvents({
        locationfound: (e) => {
            onLocationFound({
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
                accuracy: e.accuracy
            });
        },
        locationerror: (e) => {
            onLocationError(e.message);
        }
    });
    return null;
};

// Map controls component
const MapControls = ({
    mapView,
    setMapView,
    filter,
    setFilter,
    maxWaitTime,
    setMaxWaitTime
}: {
    mapView: MapViewMode;
    setMapView: (mode: MapViewMode) => void;
    filter: FilterMode;
    setFilter: (mode: FilterMode) => void;
    maxWaitTime: number;
    setMaxWaitTime: (time: number) => void;
}) => (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/3">
            <Tabs
                value={mapView}
                onValueChange={(value) => setMapView(value as MapViewMode)}
            >
                <TabsList className="w-full">
                    <TabsTrigger value="standard" className="flex-1">Standard</TabsTrigger>
                    <TabsTrigger value="waitTimes" className="flex-1">Wait Times</TabsTrigger>
                    <TabsTrigger value="heatmap" className="flex-1">Heat Map</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <div className="w-full md:w-1/3">
            <Select
                value={filter}
                onValueChange={(value) => setFilter(value as FilterMode)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Attractions</SelectItem>
                    <SelectItem value="rides">Rides Only</SelectItem>
                    <SelectItem value="shows">Shows Only</SelectItem>
                    <SelectItem value="dining">Dining Only</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {mapView === 'waitTimes' && (
            <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                    <Label htmlFor="wait-filter">Max Wait: {maxWaitTime} min</Label>
                </div>
                <Slider
                    id="wait-filter"
                    min={0}
                    max={240}
                    step={5}
                    value={[maxWaitTime]}
                    onValueChange={(value) => setMaxWaitTime(value[0])}
                />
            </div>
        )}
    </div>
);

// Park areas overlay component
const ParkAreasOverlay = ({ showAreas }: { showAreas: boolean }) => {
    if (!showAreas) return null;

    return (
        <>
            {Object.entries(PARK_AREAS).map(([areaKey, area]) => (
                <Circle
                    key={areaKey}
                    center={[area.coordinates.latitude, area.coordinates.longitude]}
                    radius={area.radius}
                    color={area.color}
                    fillColor={area.fillColor}
                    fillOpacity={0.3}
                    weight={2}
                >
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-semibold">{area.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Theme park area
                            </p>
                        </div>
                    </Popup>
                </Circle>
            ))}
        </>
    );
};

// Wait time legend component
const WaitTimeLegend = () => (
    <div className={styles.mapLegend}>
        <div className="font-semibold mb-1">Wait Times</div>
        <div className={styles.legendItem}>
            <div className={cn(styles.legendColorDot, styles.greenDot)}></div>
            <span>0-10 min</span>
        </div>
        <div className={styles.legendItem}>
            <div className={cn(styles.legendColorDot, styles.blueDot)}></div>
            <span>11-30 min</span>
        </div>
        <div className={styles.legendItem}>
            <div className={cn(styles.legendColorDot, styles.amberDot)}></div>
            <span>31-60 min</span>
        </div>
        <div className={styles.legendItem}>
            <div className={cn(styles.legendColorDot, styles.redDot)}></div>
            <span>60+ min</span>
        </div>
        <div className={styles.legendItem}>
            <div className={cn(styles.legendColorDot, styles.grayDot)}></div>
            <span>Closed</span>
        </div>
    </div>
);

// User location marker component
const UserLocationMarker = ({ location }: { location: UserLocation }) => (
    <Marker
        position={[location.latitude, location.longitude]}
        icon={createUserLocationIcon()}
    >
        <Popup>
            <div className="text-center">
                <h3 className="font-semibold">Your Location</h3>
                {location.accuracy && (
                    <p className="text-sm text-muted-foreground">
                        Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                )}
            </div>
        </Popup>
    </Marker>
);

// Selected attraction info component
const SelectedAttractionInfo = ({
    attraction,
    waitTimeData
}: {
    attraction: Attraction;
    waitTimeData?: Record<string, AttractionWaitTimeData>;
}) => {
    const selectedWaitTimeData = waitTimeData?.[attraction.id];

    return (
        <Card>
            <CardHeader className="py-3 px-4">
                <CardTitle className="text-lg">{attraction.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                    {attraction.description || "No description available."}
                </p>

                {selectedWaitTimeData && (
                    <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-1">Current Status</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">
                                {selectedWaitTimeData.status}
                            </Badge>

                            {selectedWaitTimeData.waitTime?.standby != null && (
                                <Badge variant="secondary">
                                    Wait: {selectedWaitTimeData.waitTime.standby} minutes
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {attraction.tags && (
                    <div className="mt-3">
                        <h4 className="text-sm font-semibold mb-1">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                            {attraction.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Main map component
export default function ParkMap({
    parkId,
    attractions,
    waitTimeData,
    onSelectAttraction,
    height = '600px'
}: ParkMapProps) {
    const [mapView, setMapView] = useState<MapViewMode>('standard');
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
    const [filter, setFilter] = useState<FilterMode>('all');
    const [maxWaitTime, setMaxWaitTime] = useState(240);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [mapRef, setMapRef] = useState<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Set dynamic height via CSS custom property
    useEffect(() => {
        if (mapContainerRef.current) {
            mapContainerRef.current.style.setProperty('--map-height', height);
        }
    }, [height]);

    // Fetch park details
    const { data: parkDetails } = useQuery({
        queryKey: ['parkDetails', parkId],
        queryFn: () => getPark(parkId),
    });

    // Process attractions with coordinates
    const attractionsWithCoordinates = useMemo(() => {
        if (!attractions) return [];
        return assignMockCoordinates(attractions);
    }, [attractions]);

    // Filter attractions
    const filteredAttractions = useMemo(() =>
        filterAttractions(
            attractionsWithCoordinates,
            filter,
            mapView,
            waitTimeData,
            maxWaitTime
        ),
        [attractionsWithCoordinates, filter, waitTimeData, mapView, maxWaitTime]
    );

    // Geolocation functions
    const requestUserLocation = useCallback(() => {
        if (mapRef) {
            mapRef.locate({ setView: false, maxZoom: 16 });
        }
    }, [mapRef]);

    const resetMapView = useCallback(() => {
        if (mapRef) {
            mapRef.setView(DEFAULT_CENTER, 16);
        }
    }, [mapRef]);

    const zoomIn = useCallback(() => {
        if (mapRef) {
            mapRef.zoomIn();
        }
    }, [mapRef]);

    const zoomOut = useCallback(() => {
        if (mapRef) {
            mapRef.zoomOut();
        }
    }, [mapRef]);

    // Handle location found
    const handleLocationFound = useCallback((location: UserLocation) => {
        setUserLocation(location);
        setLocationError(null);
    }, []);

    // Handle location error
    const handleLocationError = useCallback((error: string) => {
        setLocationError(error);
        setUserLocation(null);
    }, []);

    // Generate heat map data for wait times
    const generateHeatMapData = useMemo(() => {
        if (mapView !== 'heatmap' || !waitTimeData) return [];

        return filteredAttractions
            .filter(attraction => {
                const data = waitTimeData[attraction.id];
                return data?.waitTime?.standby && data.status === 'OPERATING';
            })
            .map(attraction => {
                const waitTime = waitTimeData[attraction.id]?.waitTime?.standby || 0;
                const intensity = Math.min(waitTime / 60, 1); // Normalize to 0-1

                return {
                    location: attraction.location!,
                    intensity,
                    waitTime
                };
            });
    }, [filteredAttractions, waitTimeData, mapView]);

    // Effect to clean up location error after time
    useEffect(() => {
        if (locationError) {
            const timer = setTimeout(() => {
                setLocationError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [locationError]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="py-3 px-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center">
                            <MapIcon className="h-5 w-5 mr-2" />
                            {parkDetails?.name || 'Park Map'}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            aria-label="Find My Location"
                                            className="p-2 rounded-full hover:bg-secondary"
                                            onClick={requestUserLocation}
                                        >
                                            <Locate className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Find My Location</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            aria-label="Zoom In"
                                            className="p-2 rounded-full hover:bg-secondary"
                                            onClick={zoomIn}
                                        >
                                            <Maximize className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Zoom In</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            aria-label="Zoom Out"
                                            className="p-2 rounded-full hover:bg-secondary"
                                            onClick={zoomOut}
                                        >
                                            <Minimize className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Zoom Out</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            aria-label="Reset View"
                                            className="p-2 rounded-full hover:bg-secondary"
                                            onClick={resetMapView}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reset View</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <MapControls
                        mapView={mapView}
                        setMapView={setMapView}
                        filter={filter}
                        setFilter={setFilter}
                        maxWaitTime={maxWaitTime}
                        setMaxWaitTime={setMaxWaitTime}
                    />

                    {/* Location error message */}
                    {locationError && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
                                <div className="text-sm text-amber-700">
                                    Unable to get your location: {locationError}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive Leaflet Map */}
                    <div
                        ref={mapContainerRef}
                        className={styles.mapContainer}
                    >
                        <MapContainer
                            center={DEFAULT_CENTER}
                            zoom={16}
                            className={styles.leafletMapContainer}
                            ref={setMapRef}
                        >
                            {/* Map event handler */}
                            <MapEventHandler
                                onLocationFound={handleLocationFound}
                                onLocationError={handleLocationError}
                            />

                            {/* Tile layer */}
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Park areas overlay */}
                            <ParkAreasOverlay showAreas={mapView === 'standard' || mapView === 'heatmap'} />

                            {/* Attraction markers */}
                            {filteredAttractions.map((attraction) => {
                                if (!attraction.location) return null;

                                const attractionWaitTimeData = waitTimeData?.[attraction.id];
                                const waitTime = attractionWaitTimeData?.waitTime?.standby;
                                const status = attractionWaitTimeData?.status || 'CLOSED';
                                const color = getWaitTimeColor(waitTime || null, status);

                                return (
                                    <Marker
                                        key={attraction.id}
                                        position={[attraction.location.latitude, attraction.location.longitude]}
                                        icon={createMarkerIcon(
                                            color,
                                            attraction.attractionType === 'RIDE' ? 32 : 24,
                                            mapView === 'waitTimes' ? waitTime : undefined,
                                            status
                                        )}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedAttraction(attraction);
                                                onSelectAttraction?.(attraction);
                                            }
                                        }}
                                    >
                                        <Popup>
                                            <div className="min-w-[200px]">
                                                <h3 className="font-semibold text-base mb-2">
                                                    {attraction.name}
                                                </h3>

                                                {attraction.description && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {attraction.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {attraction.attractionType}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {status}
                                                    </Badge>
                                                </div>

                                                {waitTime !== undefined && status === 'OPERATING' && (
                                                    <div className="text-sm">
                                                        <strong>Wait Time:</strong> {waitTime} minutes
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* User location marker */}
                            {userLocation && (
                                <UserLocationMarker location={userLocation} />
                            )}

                            {/* Heat map visualization for wait times */}
                            {mapView === 'heatmap' && generateHeatMapData.map((point, index) => (
                                <Circle
                                    key={`heatmap-${index}`}
                                    center={[point.location.latitude, point.location.longitude]}
                                    radius={50 + (point.intensity * 100)}
                                    fillColor={point.waitTime <= 30 ? '#22C55E' : point.waitTime <= 60 ? '#F59E0B' : '#EF4444'}
                                    fillOpacity={0.4 + (point.intensity * 0.4)}
                                    color="transparent"
                                />
                            ))}
                        </MapContainer>

                        {/* Wait time legend overlay */}
                        {mapView === 'waitTimes' && <WaitTimeLegend />}

                        {/* North indicator */}
                        <div className={styles.northIndicator}>
                            <ArrowUp className={styles.northIcon} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected attraction info */}
            {selectedAttraction && (
                <SelectedAttractionInfo
                    attraction={selectedAttraction}
                    waitTimeData={waitTimeData}
                />
            )}
        </div>
    );
}