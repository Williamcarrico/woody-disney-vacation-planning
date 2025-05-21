'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getAttractionWaitTimes } from '@/lib/services/map-service';
import { LocationData } from '@/components/maps/interactive-map';
import { Clock, Map, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttractionMapOverlayProps {
    parkId: string;
    attractions: LocationData[];
    onFilteredAttractionsChange: (attractions: LocationData[]) => void;
}

type FilterMode = 'all' | 'short' | 'medium' | 'long';
type SortMode = 'default' | 'waitTime' | 'name';

/**
 * AttractionMapOverlay component
 * Provides wait time information and filtering for attractions on the map
 */
export default function AttractionMapOverlay({
    parkId,
    attractions,
    onFilteredAttractionsChange
}: AttractionMapOverlayProps) {
    const [waitTimeData, setWaitTimeData] = useState<Record<string, { waitTime: number; status: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [maxWaitTime, setMaxWaitTime] = useState(240);
    const [filterMode, setFilterMode] = useState<FilterMode>('all');
    const [sortMode, setSortMode] = useState<SortMode>('default');
    const [showOnlyOperating, setShowOnlyOperating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch wait time data
    const fetchWaitTimes = async () => {
        setIsLoading(true);
        try {
            const data = await getAttractionWaitTimes(parkId);
            setWaitTimeData(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching wait times:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load wait times initially and set up refresh interval
    useEffect(() => {
        fetchWaitTimes();

        // Refresh wait times every 3 minutes
        const interval = setInterval(() => {
            fetchWaitTimes();
        }, 3 * 60 * 1000);

        return () => clearInterval(interval);
    }, [parkId]);

    // Merge attraction data with wait times
    const attractionsWithWaitTimes = useMemo(() => {
        return attractions.map(attraction => {
            const waitTimeInfo = waitTimeData[attraction.id];
            return {
                ...attraction,
                waitTime: waitTimeInfo?.waitTime ?? 0,
                status: waitTimeInfo?.status ?? 'OPERATING'
            };
        });
    }, [attractions, waitTimeData]);

    // Apply filtering and sorting
    const filteredAttractions = useMemo(() => {
        let filtered = [...attractionsWithWaitTimes];

        // Filter by operating status
        if (showOnlyOperating) {
            filtered = filtered.filter(attr => attr.status === 'OPERATING');
        }

        // Filter by wait time category
        if (filterMode !== 'all') {
            filtered = filtered.filter(attr => {
                if (attr.status !== 'OPERATING') return false;

                switch (filterMode) {
                    case 'short':
                        return attr.waitTime <= 15;
                    case 'medium':
                        return attr.waitTime > 15 && attr.waitTime <= 45;
                    case 'long':
                        return attr.waitTime > 45;
                    default:
                        return true;
                }
            });
        }

        // Filter by max wait time
        filtered = filtered.filter(attr => {
            if (attr.status !== 'OPERATING') return true; // Keep non-operating attractions
            return attr.waitTime <= maxWaitTime;
        });

        // Sort attractions
        switch (sortMode) {
            case 'waitTime':
                filtered.sort((a, b) => {
                    // Put non-operating at the end
                    if (a.status !== 'OPERATING' && b.status === 'OPERATING') return 1;
                    if (a.status === 'OPERATING' && b.status !== 'OPERATING') return -1;
                    return a.waitTime - b.waitTime;
                });
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Default ordering (by id or original order)
                break;
        }

        return filtered;
    }, [attractionsWithWaitTimes, filterMode, sortMode, maxWaitTime, showOnlyOperating]);

    // Update parent component when filtered attractions change
    useEffect(() => {
        onFilteredAttractionsChange(filteredAttractions);
    }, [filteredAttractions, onFilteredAttractionsChange]);

    // Determine status badge color
    const getStatusColor = (status: string, waitTime: number) => {
        if (status !== 'OPERATING') {
            return status === 'DOWN' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800';
        }

        if (waitTime <= 15) return 'bg-green-100 text-green-800';
        if (waitTime <= 45) return 'bg-blue-100 text-blue-800';
        return 'bg-red-100 text-red-800';
    };

    // Format relative time (e.g., "3 minutes ago")
    const getRelativeTimeString = () => {
        if (!lastUpdated) return 'Never';

        const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 120) return '1 minute ago';

        const minutes = Math.floor(seconds / 60);
        return `${minutes} minutes ago`;
    };

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Attraction Wait Times
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchWaitTimes}
                        disabled={isLoading}
                        className="h-8"
                    >
                        <RefreshCw className={cn(
                            "h-4 w-4 mr-1",
                            isLoading && "animate-spin"
                        )} />
                        Refresh
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                    Updated: {getRelativeTimeString()}
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Tabs value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
                        <TabsList className="h-8">
                            <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                            <TabsTrigger value="short" className="text-xs px-2">Short (<15m)</TabsTrigger>
                            <TabsTrigger value="medium" className="text-xs px-2">Medium (15-45m)</TabsTrigger>
                            <TabsTrigger value="long" className="text-xs px-2">Long (>45m)</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2 ml-auto">
                        <Label htmlFor="operating-only" className="text-xs">
                            Operating Only
                        </Label>
                        <Switch
                            id="operating-only"
                            checked={showOnlyOperating}
                            onCheckedChange={setShowOnlyOperating}
                            size="sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <Label htmlFor="sort-select" className="text-xs whitespace-nowrap">
                        Sort by:
                    </Label>
                    <select
                        id="sort-select"
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as SortMode)}
                        className="text-xs p-1 border rounded flex-grow"
                    >
                        <option value="default">Default</option>
                        <option value="waitTime">Wait Time</option>
                        <option value="name">Name</option>
                    </select>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                        <Label htmlFor="wait-filter" className="text-xs">Max Wait: {maxWaitTime} min</Label>
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

                <div className="mt-4 space-y-1 max-h-[200px] overflow-y-auto pr-2">
                    {filteredAttractions.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            No attractions match your current filters
                        </div>
                    ) : (
                        filteredAttractions.map(attraction => (
                            <div
                                key={attraction.id}
                                className="flex justify-between items-center py-1 px-2 rounded hover:bg-secondary/40"
                            >
                                <span className="text-sm font-medium">{attraction.name}</span>
                                <Badge className={cn(
                                    "ml-auto",
                                    getStatusColor(attraction.status as string, attraction.waitTime as number)
                                )}>
                                    {attraction.status === 'OPERATING'
                                        ? `${attraction.waitTime} min`
                                        : (attraction.status === 'DOWN' ? 'Down' : 'Closed')}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Map className="h-3 w-3" />
                        <span>Filtered attractions are highlighted on the map</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}