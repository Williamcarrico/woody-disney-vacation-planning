import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPark } from '@/lib/api/themeParks';
import type { Park, Attraction, Coordinates } from '@/types/api';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AlertCircle, Compass, Maximize, Minimize, MapPin, Map as MapIcon, ArrowUp } from "lucide-react";
import { cn } from '@/lib/utils';

interface ParkMapProps {
    parkId: string;
    attractions: Attraction[];
    waitTimeData?: Record<string, {
        status: string;
        waitTime?: {
            standby: number;
        };
    }>;
    onSelectAttraction?: (attraction: Attraction) => void;
    height?: string;
}

// Mock coordinates for testing (in a real app, these would come from the API)
const mockAreaCoordinates: Record<string, { coordinates: Coordinates; radius: number; color: string }> = {
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

// Assign mock coordinates to attractions if needed
const assignMockCoordinates = (attractions: Attraction[]): Attraction[] => {
    return attractions.map(attraction => {
        if (attraction.location) return attraction;

        // Find area for the attraction based on tags or name
        let area = 'main_street'; // Default

        if (attraction.tags) {
            const areaTags = attraction.tags.filter(tag =>
                Object.keys(mockAreaCoordinates).includes(tag)
            );

            if (areaTags.length > 0) {
                area = areaTags[0];
            }
        } else {
            // Try to determine from name
            const name = attraction.name.toLowerCase();
            if (name.includes('fantasy')) area = 'fantasyland';
            if (name.includes('tomorrow')) area = 'tomorrowland';
            if (name.includes('frontier')) area = 'frontierland';
            if (name.includes('adventure')) area = 'adventureland';
            if (name.includes('liberty')) area = 'liberty_square';
            if (name.includes('main street')) area = 'main_street';
        }

        // Get base coordinates for the area
        const baseCoordinates = mockAreaCoordinates[area].coordinates;

        // Add small random offset within the area
        const randomOffset = () => (Math.random() - 0.5) * 0.002; // ~100-200 meters

        return {
            ...attraction,
            location: {
                latitude: baseCoordinates.latitude + randomOffset(),
                longitude: baseCoordinates.longitude + randomOffset(),
            }
        };
    });
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
    const [mapView, setMapView] = useState<'standard' | 'waitTimes' | 'heatmap'>('standard');
    const [zoom, setZoom] = useState(16);
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
    const [filter, setFilter] = useState<'all' | 'rides' | 'shows' | 'dining'>('all');
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
    const filteredAttractions = useMemo(() => {
        if (!attractionsWithCoordinates) return [];

        return attractionsWithCoordinates.filter(attraction => {
            // Apply attraction type filter
            if (filter === 'rides' && attraction.attractionType !== 'RIDE') return false;
            if (filter === 'shows' && attraction.attractionType !== 'SHOW') return false;
            if (filter === 'dining' && attraction.attractionType !== 'DINING') return false;

            // Apply wait time filter
            if (mapView === 'waitTimes' && waitTimeData) {
                const waitTimeInfo = waitTimeData[attraction.id];
                if (waitTimeInfo?.waitTime?.standby && waitTimeInfo.waitTime.standby > maxWaitTime) {
                    return false;
                }
            }

            return true;
        });
    }, [attractionsWithCoordinates, filter, waitTimeData, mapView, maxWaitTime]);

    // For a real implementation, this would use a proper map library
    // This is just a simplified mock for demonstration purposes
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
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="w-full md:w-1/3">
                            <Tabs defaultValue="standard" onValueChange={(value: any) => setMapView(value)}>
                                <TabsList className="w-full">
                                    <TabsTrigger value="standard" className="flex-1">Standard</TabsTrigger>
                                    <TabsTrigger value="waitTimes" className="flex-1">Wait Times</TabsTrigger>
                                    <TabsTrigger value="heatmap" className="flex-1">Heat Map</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="w-full md:w-1/3">
                            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
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

                    {/* Placeholder Map - in a real application, this would use mapbox-gl or similar */}
                    <div
                        className="relative bg-gray-100 rounded-lg overflow-hidden border"
                        style={{ height }}
                    >
                        {/* Mock Map Background */}
                        <div className="absolute inset-0 bg-[#e8f4f8]">
                            {/* Draw park areas */}
                            {Object.entries(mockAreaCoordinates).map(([area, data]) => (
                                <div
                                    key={area}
                                    className="absolute rounded-full border-2 border-white/50"
                                    style={{
                                        backgroundColor: data.color,
                                        width: `${data.radius * 2 * (zoom / 16)}px`,
                                        height: `${data.radius * 2 * (zoom / 16)}px`,
                                        left: `${(data.coordinates.longitude + 81.582) * 100000}px`,
                                        top: `${(28.42 - data.coordinates.latitude) * 100000}px`,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 1,
                                    }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold opacity-70">
                                        {area.replace('_', ' ')}
                                    </div>
                                </div>
                            ))}

                            {/* Draw "paths" between areas */}
                            <div className="absolute inset-0">
                                <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                                    {Object.entries(mockAreaCoordinates).map(([area1, data1], i) =>
                                        Object.entries(mockAreaCoordinates).slice(i + 1).map(([area2, data2], j) => (
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

                            {/* Render Attractions */}
                            {filteredAttractions.map((attraction) => {
                                if (!attraction.location) return null;

                                // Determine pin size based on attraction type
                                const size = attraction.attractionType === 'RIDE' ?
                                    24 * (zoom / 16) :
                                    18 * (zoom / 16);

                                // Determine pin color based on wait time or status
                                let color = '#6b7280'; // Default gray
                                let waitTime: number | null = null;
                                let status = 'unknown';

                                if (waitTimeData && waitTimeData[attraction.id]) {
                                    status = waitTimeData[attraction.id].status;

                                    if (status === 'OPERATING') {
                                        color = '#059669'; // Green

                                        if (waitTimeData[attraction.id].waitTime) {
                                            waitTime = waitTimeData[attraction.id].waitTime?.standby || null;

                                            if (waitTime !== null) {
                                                if (waitTime <= 10) color = '#059669'; // Green
                                                else if (waitTime <= 30) color = '#2563eb'; // Blue
                                                else if (waitTime <= 60) color = '#d97706'; // Amber
                                                else color = '#dc2626'; // Red
                                            }
                                        }
                                    } else if (status === 'DOWN') {
                                        color = '#f59e0b'; // Amber
                                    } else if (status === 'CLOSED' || status === 'REFURBISHMENT') {
                                        color = '#6b7280'; // Gray
                                    }
                                }

                                return (
                                    <div
                                        key={attraction.id}
                                        className="absolute cursor-pointer transition-all duration-300 hover:z-10"
                                        style={{
                                            left: `${(attraction.location.longitude + 81.582) * 100000}px`,
                                            top: `${(28.42 - attraction.location.latitude) * 100000}px`,
                                            zIndex: 2,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                        onClick={() => {
                                            setSelectedAttraction(attraction);
                                            onSelectAttraction?.(attraction);
                                        }}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative">
                                                        <div
                                                            className="rounded-full flex items-center justify-center text-white font-bold"
                                                            style={{
                                                                backgroundColor: color,
                                                                width: `${size}px`,
                                                                height: `${size}px`,
                                                                border: '2px solid white',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                                            }}
                                                        >
                                                            {mapView === 'waitTimes' && waitTime !== null ? (
                                                                <span style={{ fontSize: `${zoom / 16 * 9}px` }}>
                                                                    {waitTime}
                                                                </span>
                                                            ) : (
                                                                <MapPin size={size * 0.5} />
                                                            )}
                                                        </div>

                                                        {/* Show attraction name for selected or on hover */}
                                                        <div
                                                            className={cn(
                                                                "absolute whitespace-nowrap px-2 py-1 bg-white/90 rounded shadow-md text-center",
                                                                "opacity-0 hover:opacity-100 transition-opacity duration-200",
                                                                selectedAttraction?.id === attraction.id && "opacity-100",
                                                            )}
                                                            style={{
                                                                fontSize: `${zoom / 16 * 10}px`,
                                                                bottom: `${size + 4}px`,
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                zIndex: 3,
                                                            }}
                                                        >
                                                            {attraction.name}
                                                        </div>
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
                                    </div>
                                );
                            })}

                            {/* Legend */}
                            <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-lg shadow-md text-xs">
                                <div className="font-semibold mb-1">Wait Times</div>
                                <div className="flex items-center mt-1">
                                    <div className="w-3 h-3 rounded-full bg-green-600 mr-1"></div>
                                    <span>0-10 min</span>
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="w-3 h-3 rounded-full bg-blue-600 mr-1"></div>
                                    <span>11-30 min</span>
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="w-3 h-3 rounded-full bg-amber-600 mr-1"></div>
                                    <span>31-60 min</span>
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="w-3 h-3 rounded-full bg-red-600 mr-1"></div>
                                    <span>60+ min</span>
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
                                    <span>Closed</span>
                                </div>
                            </div>

                            {/* User Location (placeholder) */}
                            <div
                                className="absolute animate-pulse"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    zIndex: 4,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
                                    <div className="absolute w-12 h-12 rounded-full bg-blue-400/30 -left-3 -top-3 animate-ping"></div>
                                </div>
                            </div>

                            {/* North indicator */}
                            <div className="absolute top-2 right-2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                                <ArrowUp className="h-5 w-5 text-gray-700" />
                            </div>
                        </div>

                        {/* Loading state */}
                        {isLoadingPark && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-2 text-sm text-muted-foreground">Loading map data...</p>
                                </div>
                            </div>
                        )}

                        {/* "Coming Soon" message for full implementation */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg text-center max-w-md">
                                <AlertCircle className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                                <h3 className="text-sm font-semibold">Interactive Map Coming Soon</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    This is a placeholder. The final implementation will use a real interactive map with accurate geolocation.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Attraction Info (would render at the bottom or in a modal) */}
            {selectedAttraction && (
                <Card>
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-lg">{selectedAttraction.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">
                            {selectedAttraction.description || "No description available."}
                        </p>

                        {waitTimeData && waitTimeData[selectedAttraction.id] && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-1">Current Status</h4>
                                <div className="flex items-center">
                                    <Badge variant="outline">
                                        {waitTimeData[selectedAttraction.id].status}
                                    </Badge>

                                    {waitTimeData[selectedAttraction.id].waitTime && (
                                        <Badge className="ml-2" variant="secondary">
                                            Wait: {waitTimeData[selectedAttraction.id].waitTime?.standby || 0} minutes
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}