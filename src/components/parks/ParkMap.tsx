import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPark } from '@/lib/api/themeParks';
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
import { AlertCircle, Compass, Maximize, Minimize, MapPin, Map as MapIcon, ArrowUp } from "lucide-react";
import { cn } from '@/lib/utils';
import styles from './ParkMap.module.css';

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
}

// Mock coordinates for testing (in a real app, these would come from the API)
const mockAreaCoordinates: Record<string, AreaData> = {
    'fantasyland': {
        coordinates: { latitude: 28.420, longitude: -81.581 },
        radius: 150,
        color: 'rgba(147, 51, 234, 0.2)' // Purple
    },
    'tomorrowland': {
        coordinates: { latitude: 28.419, longitude: -81.579 },
        radius: 120,
        color: 'rgba(6, 182, 212, 0.2)' // Cyan
    },
    'frontierland': {
        coordinates: { latitude: 28.418, longitude: -81.583 },
        radius: 130,
        color: 'rgba(180, 83, 9, 0.2)' // Amber
    },
    'adventureland': {
        coordinates: { latitude: 28.419, longitude: -81.584 },
        radius: 100,
        color: 'rgba(5, 150, 105, 0.2)' // Emerald
    },
    'liberty_square': {
        coordinates: { latitude: 28.419, longitude: -81.582 },
        radius: 80,
        color: 'rgba(185, 28, 28, 0.2)' // Red
    },
    'main_street': {
        coordinates: { latitude: 28.417, longitude: -81.582 },
        radius: 90,
        color: 'rgba(30, 64, 175, 0.2)' // Blue
    }
};

// Helper functions
const findAreaForAttraction = (attraction: Attraction): string => {
    if (attraction.tags) {
        const areaTags = attraction.tags.filter(tag =>
            Object.keys(mockAreaCoordinates).includes(tag)
        );

        if (areaTags.length > 0) {
            return areaTags[0];
        }
    }

    // Try to determine from name
    const name = attraction.name.toLowerCase();
    if (name.includes('fantasy')) return 'fantasyland';
    if (name.includes('tomorrow')) return 'tomorrowland';
    if (name.includes('frontier')) return 'frontierland';
    if (name.includes('adventure')) return 'adventureland';
    if (name.includes('liberty')) return 'liberty_square';
    if (name.includes('main street')) return 'main_street';

    return 'main_street'; // Default
};

const generateRandomOffset = (): number => (Math.random() - 0.5) * 0.002; // ~100-200 meters

// Assign mock coordinates to attractions if needed
const assignMockCoordinates = (attractions: Attraction[]): Attraction[] => {
    return attractions.map(attraction => {
        if (attraction.location) return attraction;

        // Find area for the attraction
        const area = findAreaForAttraction(attraction);

        // Get base coordinates for the area
        const baseCoordinates = mockAreaCoordinates[area].coordinates;

        return {
            ...attraction,
            location: {
                latitude: baseCoordinates.latitude + generateRandomOffset(),
                longitude: baseCoordinates.longitude + generateRandomOffset(),
            }
        };
    });
};

// Determine wait time color based on time
const getWaitTimeColor = (waitTime: number | null, status: AttractionStatus): string => {
    if (status !== 'OPERATING') {
        if (status === 'DOWN') return '#f59e0b'; // Amber
        return '#6b7280'; // Gray for CLOSED or REFURBISHMENT
    }

    if (waitTime === null) return '#059669'; // Green

    if (waitTime <= 10) return '#059669'; // Green
    if (waitTime <= 30) return '#2563eb'; // Blue
    if (waitTime <= 60) return '#d97706'; // Amber
    return '#dc2626'; // Red
};

// Filter attractions based on criteria
const filterAttractions = (
    attractions: Attraction[],
    filter: FilterMode,
    mapView: MapViewMode,
    waitTimeData?: Record<string, AttractionWaitTimeData>,
    maxWaitTime = 240
) => {
    if (!attractions) return [];

    return attractions.filter(attraction => {
        // Apply attraction type filter
        if (filter === 'rides' && attraction.attractionType !== 'RIDE') return false;
        if (filter === 'shows' && attraction.attractionType !== 'SHOW') return false;
        if (filter === 'dining') return false; // Don't show attractions when dining filter is selected

        // Apply wait time filter
        if (mapView === 'waitTimes' && waitTimeData) {
            const standbyWait = waitTimeData[attraction.id]?.waitTime?.standby;
            if (standbyWait != null && standbyWait > maxWaitTime) {
                return false;
            }
        }

        return true;
    });
};

// Components
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

const ParkAreas = ({ zoom }: { zoom: number }) => (
    <>
        {Object.entries(mockAreaCoordinates).map(([area, data]) => {
            // Apply CSS variables for this specific area
            document.documentElement.style.setProperty('--area-bg-color', data.color);
            document.documentElement.style.setProperty('--area-size', `${data.radius * 2 * (zoom / 16)}px`);
            document.documentElement.style.setProperty('--area-left', `${(data.coordinates.longitude + 81.582) * 100000}px`);
            document.documentElement.style.setProperty('--area-top', `${(28.42 - data.coordinates.latitude) * 100000}px`);

            return (
                <div key={area} className={styles.parkArea}>
                    <div className={styles.parkAreaLabel}>
                        {area.replace('_', ' ')}
                    </div>
                </div>
            );
        })}
    </>
);

const PathsBetweenAreas = () => (
    <div className="absolute inset-0">
        <svg width="100%" height="100%" className="absolute">
            {Object.entries(mockAreaCoordinates).map(([area1, data1], i) =>
                Object.entries(mockAreaCoordinates).slice(i + 1).map(([area2, data2]) => (
                    <line
                        key={`${area1}-${area2}`}
                        x1={`${(data1.coordinates.longitude + 81.582) * 100000}`}
                        y1={`${(28.42 - data1.coordinates.latitude) * 100000}`}
                        x2={`${(data2.coordinates.longitude + 81.582) * 100000}`}
                        y2={`${(28.42 - data2.coordinates.latitude) * 100000}`}
                        stroke="#d1d5db"
                        strokeWidth="4"
                        strokeDasharray="5,5"
                        strokeLinecap="round"
                    />
                ))
            )}
        </svg>
    </div>
);

const WaitTimeBadge = ({ waitTime, size }: { waitTime: number; size: number }) => {
    // Apply CSS variable for this wait time badge
    document.documentElement.style.setProperty('--marker-wait-time-font-size', `${size * 0.375}px`);

    return (
        <span className={styles.waitTimeLabel}>
            {waitTime}
        </span>
    );
};

const AttractionLabel = ({
    name,
    size,
    isSelected
}: {
    name: string;
    size: number;
    isSelected: boolean;
}) => {
    // Apply CSS variables for this label
    document.documentElement.style.setProperty('--attraction-label-font-size', `${size * 0.625}px`);
    document.documentElement.style.setProperty('--attraction-label-bottom', `${size + 4}px`);
    document.documentElement.style.setProperty('--attraction-label-left', '50%');

    return (
        <div className={cn(
            styles.attractionLabel,
            isSelected && styles.selectedLabel
        )}>
            {name}
        </div>
    );
};

const AttractionMarker = ({
    attraction,
    mapView,
    zoom,
    isSelected,
    waitTimeData,
    onSelect
}: {
    attraction: Attraction;
    mapView: MapViewMode;
    zoom: number;
    isSelected: boolean;
    waitTimeData?: Record<string, AttractionWaitTimeData>;
    onSelect: () => void;
}) => {
    if (!attraction.location) return null;

    // Determine pin size based on attraction type
    const size = attraction.attractionType === 'RIDE' ?
        24 * (zoom / 16) :
        18 * (zoom / 16);

    // Determine pin color based on wait time or status
    let color = '#6b7280'; // Default gray
    let waitTime: number | null = null;
    let status: AttractionStatus = 'CLOSED';

    const attractionWaitTimeData = waitTimeData?.[attraction.id];

    if (attractionWaitTimeData) {
        status = attractionWaitTimeData.status;
        if (status === 'OPERATING') {
            waitTime = attractionWaitTimeData.waitTime?.standby ?? null;
        }
        color = getWaitTimeColor(waitTime, status);
    }

    // Apply CSS variables for this marker
    document.documentElement.style.setProperty('--marker-left', `${(attraction.location.longitude + 81.582) * 100000}px`);
    document.documentElement.style.setProperty('--marker-top', `${(28.42 - attraction.location.latitude) * 100000}px`);
    document.documentElement.style.setProperty('--marker-bg-color', color);
    document.documentElement.style.setProperty('--marker-size', `${size}px`);

    return (
        <button
            key={attraction.id}
            type="button"
            tabIndex={0}
            aria-label={`Select attraction ${attraction.name}`}
            className={styles.markerButton}
            onClick={onSelect}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative">
                            <div className={styles.markerPin}>
                                {mapView === 'waitTimes' && waitTime !== null ? (
                                    <WaitTimeBadge waitTime={waitTime} size={size} />
                                ) : (
                                    <MapPin size={size * 0.5} />
                                )}
                            </div>
                            <AttractionLabel
                                name={attraction.name}
                                size={size}
                                isSelected={isSelected}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="space-y-1">
                            <p className="font-semibold">{attraction.name}</p>
                            {waitTime !== null && status === 'OPERATING' && (
                                <p>Wait Time: {waitTime} minutes</p>
                            )}
                            {status !== 'OPERATING' && (
                                <p>{status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}</p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </button>
    );
};

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

const UserLocation = () => (
    <div className={styles.userLocation}>
        <div className="relative">
            <div className={styles.userLocationDot}></div>
            <div className={styles.userLocationPing}></div>
        </div>
    </div>
);

const NorthIndicator = () => (
    <div className={styles.northIndicator}>
        <ArrowUp className={styles.northIcon} />
    </div>
);

const LoadingIndicator = () => (
    <div className={styles.loadingOverlay}>
        <div className="text-center">
            <div className={styles.loadingSpinner}></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading map data...</p>
        </div>
    </div>
);

const ComingSoonMessage = () => (
    <div className={styles.comingSoonOverlay}>
        <div className={styles.comingSoonMessage}>
            <AlertCircle className="h-6 w-6 mx-auto text-amber-500 mb-2" />
            <h3 className="text-sm font-semibold">Interactive Map Coming Soon</h3>
            <p className="text-xs text-muted-foreground mt-1">
                This is a placeholder. The final implementation will use a real interactive map with accurate geolocation.
            </p>
        </div>
    </div>
);

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
                        <div className="flex items-center">
                            <Badge variant="outline">
                                {selectedWaitTimeData.status}
                            </Badge>

                            {selectedWaitTimeData.waitTime?.standby != null && (
                                <Badge className="ml-2" variant="secondary">
                                    Wait: {selectedWaitTimeData.waitTime.standby} minutes
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Map component that uses mapbox-gl or a similar library in a real-world app
// This is a simplified mock version for demonstration
export default function ParkMap({
    parkId,
    attractions,
    waitTimeData,
    onSelectAttraction,
    height = '600px'
}: ParkMapProps) {
    const [mapView, setMapView] = useState<MapViewMode>('standard');
    const [zoom, setZoom] = useState(16);
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
    const [filter, setFilter] = useState<FilterMode>('all');
    const [maxWaitTime, setMaxWaitTime] = useState(240);

    // Fetch detailed park information
    const { data: parkDetails, isLoading: isLoadingPark } = useQuery({
        queryKey: ['parkDetails', parkId],
        queryFn: () => getPark(parkId),
    });

    // Process attractions with coordinates
    const attractionsWithCoordinates = useMemo(() => {
        if (!attractions) return [];
        return assignMockCoordinates(attractions);
    }, [attractions]);

    // Filter attractions based on criteria
    const filteredAttractions = useMemo(() =>
        filterAttractions(
            attractionsWithCoordinates,
            filter,
            mapView,
            waitTimeData,
            maxWaitTime
        ),
        [attractionsWithCoordinates, filter, waitTimeData, mapView, maxWaitTime]);

    // Set CSS variable for map height
    document.documentElement.style.setProperty('--map-height', height);

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
                                            aria-label="Zoom In"
                                            className="p-2 rounded-full hover:bg-secondary"
                                            onClick={() => setZoom(Math.min(zoom + 1, 18))}
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
                                            onClick={() => setZoom(Math.max(zoom - 1, 14))}
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
                                            onClick={() => {
                                                // Reset view in a real map implementation
                                            }}
                                        >
                                            <Compass className="h-4 w-4" />
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

                    {/* Placeholder Map - in a real application, this would use mapbox-gl or similar */}
                    <div className={styles.mapContainer}>
                        {/* Mock Map Background */}
                        <div className={styles.mapBackground}>
                            {/* Draw park areas */}
                            <ParkAreas zoom={zoom} />

                            {/* Draw "paths" between areas */}
                            <PathsBetweenAreas />

                            {/* Render Attractions */}
                            {filteredAttractions.map((attraction) => (
                                <AttractionMarker
                                    key={attraction.id}
                                    attraction={attraction}
                                    mapView={mapView}
                                    zoom={zoom}
                                    isSelected={selectedAttraction?.id === attraction.id}
                                    waitTimeData={waitTimeData}
                                    onSelect={() => {
                                        setSelectedAttraction(attraction);
                                        onSelectAttraction?.(attraction);
                                    }}
                                />
                            ))}

                            {/* Legend */}
                            <WaitTimeLegend />

                            {/* User Location (placeholder) */}
                            <UserLocation />

                            {/* North indicator */}
                            <NorthIndicator />
                        </div>

                        {/* Loading state */}
                        {isLoadingPark && <LoadingIndicator />}

                        {/* "Coming Soon" message for full implementation */}
                        <ComingSoonMessage />
                    </div>
                </CardContent>
            </Card>

            {/* Selected Attraction Info (would render at the bottom or in a modal) */}
            {selectedAttraction && (
                <SelectedAttractionInfo
                    attraction={selectedAttraction}
                    waitTimeData={waitTimeData}
                />
            )}
        </div>
    );
}