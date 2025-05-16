import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Clock, Filter, Map as MapIcon, RefreshCw } from "lucide-react";
import { getWaltDisneyWorldParks, getParkAttractions } from '@/lib/api/themeParks';
import { Attraction, AttractionType, AttractionStatus } from '@/types/api';
import { useWaitTimes } from '@/hooks/useWaitTimes';
import AttractionCard from './AttractionCard';
import ParkMap from './ParkMap';

// Define a local type that matches ParkMap's AttractionWaitTimeData
interface ParkMapAttractionWaitTimeData {
    readonly status: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';
    readonly waitTime?: {
        readonly standby: number;
    };
}

interface ParkExplorerProps {
    readonly initialParkId?: string;
    readonly showFilters?: boolean;
    readonly onSelectAttraction?: (attraction: Attraction) => void;
    readonly onAddToItinerary?: (attraction: Attraction) => void;
}

export default function ParkExplorer({
    initialParkId,
    showFilters = true,
    onSelectAttraction,
    onAddToItinerary,
}: ParkExplorerProps) {
    // State for selected park, view mode, and filters
    const [selectedParkId, setSelectedParkId] = useState<string>(initialParkId || '');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<AttractionType | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<AttractionStatus | 'ALL'>('ALL');
    const [maxWaitTime, setMaxWaitTime] = useState<number>(240); // in minutes
    const [showClosedAttractions, setShowClosedAttractions] = useState(true);
    const [sortBy, setSortBy] = useState<'name' | 'waitTime' | 'popular'>('waitTime');

    // Fetch list of Walt Disney World parks
    const {
        data: parks,
        isLoading: isLoadingParks,
        error: parksError
    } = useQuery({
        queryKey: ['wdwParks'],
        queryFn: getWaltDisneyWorldParks,
    });

    // Set default park if not yet selected and parks are loaded
    useMemo(() => {
        if (!selectedParkId && parks && parks.length > 0) {
            setSelectedParkId(parks[0].id);
        }
    }, [parks, selectedParkId]);

    // Fetch attractions for selected park
    const {
        data: attractions,
        isLoading: isLoadingAttractions,
        error: attractionsError
    } = useQuery({
        queryKey: ['parkAttractions', selectedParkId],
        queryFn: () => getParkAttractions(selectedParkId),
        enabled: !!selectedParkId,
    });

    // Fetch and manage wait times
    const {
        liveWaitTimes,
        isLoading: isLoadingWaitTimes,
        refreshData: refreshWaitTimes,
        sortedAttractions,
        lastUpdated
    } = useWaitTimes({
        parkId: selectedParkId,
        refreshInterval: 300000, // 5 minutes
        autoRefresh: true,
        includeHistorical: true,
    });

    // Apply filters and search to attractions
    const filteredAttractions = useMemo(() => {
        if (!attractions) return [];

        return attractions.filter(attraction => {
            // Apply search filter
            if (searchQuery && !attraction.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Apply type filter
            if (typeFilter !== 'ALL' && attraction.attractionType !== typeFilter) {
                return false;
            }

            // Apply status filter
            if (statusFilter !== 'ALL') {
                const status = liveWaitTimes?.attractions[attraction.id]?.status;
                if (status && status !== statusFilter) {
                    return false;
                }
            }

            // Apply closed filter
            if (!showClosedAttractions) {
                const status = liveWaitTimes?.attractions[attraction.id]?.status;
                if (status === 'CLOSED' || status === 'REFURBISHMENT') {
                    return false;
                }
            }

            // Apply wait time filter
            const waitTime = liveWaitTimes?.attractions[attraction.id]?.waitTime?.standby;
            if (waitTime !== undefined && waitTime > maxWaitTime && waitTime !== -1) {
                return false;
            }

            return true;
        });
    }, [attractions, liveWaitTimes, searchQuery, typeFilter, statusFilter, showClosedAttractions, maxWaitTime]);

    // Sort attractions based on selected sort option
    const sortedFilteredAttractions = useMemo(() => {
        if (!filteredAttractions) return [];

        return [...filteredAttractions].sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'waitTime') {
                const aWaitTime = liveWaitTimes?.attractions[a.id]?.waitTime?.standby || 0;
                const bWaitTime = liveWaitTimes?.attractions[b.id]?.waitTime?.standby || 0;
                return bWaitTime - aWaitTime; // Sort by wait time (high to low)
            } else if (sortBy === 'popular') {
                // Sort by popularity (using priority or other heuristic)
                const aPopularity = a.priority || 0;
                const bPopularity = b.priority || 0;
                return bPopularity - aPopularity;
            }
            return 0;
        });
    }, [filteredAttractions, liveWaitTimes, sortBy]);

    // Loading and error states
    const isLoading = isLoadingParks || isLoadingAttractions || isLoadingWaitTimes;
    const hasError = parksError || attractionsError;

    // Calculate statistics
    const stats = useMemo(() => {
        if (!liveWaitTimes || !attractions) return null;

        const operatingCount = Object.values(liveWaitTimes.attractions).filter(
            a => a.status === 'OPERATING'
        ).length;

        const averageWaitTime = sortedAttractions.operating.length > 0
            ? Math.round(sortedAttractions.operating.reduce((sum, a) => sum + a.waitTime, 0) / sortedAttractions.operating.length)
            : 0;

        const maxCurrentWaitTime = sortedAttractions.operating.length > 0
            ? Math.max(...sortedAttractions.operating.map(a => a.waitTime))
            : 0;

        return {
            operatingCount,
            closedCount: sortedAttractions.closed.length,
            downCount: sortedAttractions.down.length,
            averageWaitTime,
            maxWaitTime: maxCurrentWaitTime,
        };
    }, [liveWaitTimes, attractions, sortedAttractions]);

    return (
        <div className="space-y-4">
            {/* Park Selector */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="w-full sm:w-auto">
                    <Select
                        value={selectedParkId}
                        onValueChange={(value) => setSelectedParkId(value)}
                        disabled={isLoadingParks}
                    >
                        <SelectTrigger className="w-full sm:w-[300px]">
                            <SelectValue placeholder="Select a park" />
                        </SelectTrigger>
                        <SelectContent>
                            {parks?.map((park) => (
                                <SelectItem key={park.id} value={park.id}>
                                    {park.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-sm text-muted-foreground">
                        {lastUpdated && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshWaitTimes()}
                        disabled={isLoading}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    >
                        {viewMode === 'list' ? (
                            <>
                                <MapIcon className="h-4 w-4 mr-2" />
                                Map View
                            </>
                        ) : (
                            <>
                                <Filter className="h-4 w-4 mr-2" />
                                List View
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Status Summary */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">Operating</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3 px-4">
                            <div className="text-2xl font-bold">{stats.operatingCount}</div>
                            <p className="text-xs text-muted-foreground">attractions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">Average Wait</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3 px-4">
                            <div className="text-2xl font-bold">{stats.averageWaitTime} min</div>
                            <p className="text-xs text-muted-foreground">across all rides</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">Longest Wait</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3 px-4">
                            <div className="text-2xl font-bold">{stats.maxWaitTime} min</div>
                            <p className="text-xs text-muted-foreground">current maximum</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">Unavailable</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3 px-4">
                            <div className="text-2xl font-bold">{stats.closedCount + stats.downCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.downCount} down, {stats.closedCount} closed
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            {showFilters && viewMode === 'list' && (
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-lg flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters & Sorting
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    placeholder="Search attractions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Attraction Type</Label>
                                <Select value={typeFilter} onValueChange={(value: AttractionType | 'ALL') => setTypeFilter(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Types</SelectItem>
                                        <SelectItem value="RIDE">Rides</SelectItem>
                                        <SelectItem value="SHOW">Shows</SelectItem>
                                        <SelectItem value="MEET_AND_GREET">Character Meets</SelectItem>
                                        <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sort By</Label>
                                <Select value={sortBy} onValueChange={(value: 'name' | 'waitTime' | 'popular') => setSortBy(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="waitTime">Wait Time</SelectItem>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="popular">Popularity</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4">
                                <Label>Maximum Wait Time: {maxWaitTime} minutes</Label>
                                <Slider
                                    value={[maxWaitTime]}
                                    min={0}
                                    max={240}
                                    step={5}
                                    onValueChange={(value) => setMaxWaitTime(value[0])}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={statusFilter} onValueChange={(value: AttractionStatus | 'ALL') => setStatusFilter(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Statuses</SelectItem>
                                        <SelectItem value="OPERATING">Operating</SelectItem>
                                        <SelectItem value="DOWN">Temporarily Down</SelectItem>
                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                        <SelectItem value="REFURBISHMENT">Refurbishment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Switch
                                    id="showClosed"
                                    checked={showClosedAttractions}
                                    onCheckedChange={setShowClosedAttractions}
                                />
                                <Label htmlFor="showClosed">Show Closed Attractions</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading and Error States */}
            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading park data...</p>
                    </div>
                </div>
            )}

            {hasError && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center text-destructive">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Error Loading Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>There was an error loading the park data. Please try again.</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => refreshWaitTimes()}
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Attractions Display */}
            {!isLoading && !hasError && (
                <>
                    {viewMode === 'list' ? (
                        // List View
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedFilteredAttractions.length > 0 ? (
                                sortedFilteredAttractions.map((attraction) => (
                                    <AttractionCard
                                        key={attraction.id}
                                        attraction={attraction}
                                        waitTimeData={liveWaitTimes?.attractions[attraction.id]}
                                        onSelect={() => onSelectAttraction?.(attraction)}
                                        onAddToItinerary={() => onAddToItinerary?.(attraction)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center">
                                    <p className="text-muted-foreground">No attractions match your filters. Try adjusting your criteria.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Map View
                        <ParkMap
                            parkId={selectedParkId}
                            attractions={attractions || []}
                            waitTimeData={liveWaitTimes?.attractions as Record<string, ParkMapAttractionWaitTimeData>}
                            onSelectAttraction={onSelectAttraction}
                        />
                    )}
                </>
            )}
        </div>
    );
}