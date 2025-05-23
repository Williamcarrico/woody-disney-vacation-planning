"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Zap,
    Filter,
    X,
    MapPin,
    AlertCircle,
    Info,
    BarChart3,
    Users,
    Maximize2,
    ExternalLink,
    Sun,
    Search,
    ListFilter,
    SlidersHorizontal
} from "lucide-react"
import { Attraction, ParkId, AttractionStatus, ThrillCategory, parksData } from "./types" // Assuming types.ts is in the same directory

// Mock Data - Replace with actual API call
const mockAttractions: Attraction[] = [
    {
        id: "attr1",
        name: "Space Mountain",
        parkId: "MK",
        parkName: "Magic Kingdom",
        land: "Tomorrowland",
        imageUrl: "/images/attractions/space-mountain.jpg",
        thumbnailUrl: "/images/attractions/space-mountain-thumb.jpg",
        description: "Blast off on a thrilling rocket ride into the darkest reaches of outer space.",
        waitTime: 45,
        status: "Operating",
        geniePlus: { available: true, nextAvailableTime: "10:30 AM", isLightningLane: false },
        riderSwitchAvailable: true,
        heightRequirement: "44in (112cm)",
        thrillLevels: ["Coaster", "Dark Ride"],
        tags: ["Indoor", "Fast"],
        duration: "3 minutes",
        userRating: 4.7,
        tips: ["Best to ride at night for shorter waits.", "Hold on to your hats!"],
        historicalWaitTimes: [{ date: "2023-10-26", averageWait: 50 }, { date: "2023-10-25", averageWait: 60 }]
    },
    {
        id: "attr2",
        name: "Haunted Mansion",
        parkId: "MK",
        parkName: "Magic Kingdom",
        land: "Liberty Square",
        imageUrl: "/images/attractions/haunted-mansion.jpg",
        thumbnailUrl: "/images/attractions/haunted-mansion-thumb.jpg",
        description: "Climb aboard a Doom Buggy for a spooky tour through a house full of happy haunts.",
        waitTime: 30,
        status: "Operating",
        geniePlus: { available: true, nextAvailableTime: "11:00 AM", isLightningLane: false },
        riderSwitchAvailable: true,
        heightRequirement: null,
        thrillLevels: ["Dark Ride", "Gentle"],
        tags: ["Classic", "Indoor"],
        duration: "9 minutes",
        userRating: 4.8,
    },
    {
        id: "attr3",
        name: "Guardians of the Galaxy: Cosmic Rewind",
        parkId: "EP",
        parkName: "Epcot",
        land: "World Discovery",
        imageUrl: "/images/attractions/cosmic-rewind.jpg",
        thumbnailUrl: "/images/attractions/cosmic-rewind-thumb.jpg",
        description: "Join the Guardians on an intergalactic chase through space and time.",
        waitTime: 75, // Virtual Queue / Individual Lightning Lane
        status: "Operating",
        geniePlus: { available: false, isLightningLane: true }, // Typically ILL
        riderSwitchAvailable: true,
        heightRequirement: "42in (107cm)",
        thrillLevels: ["Coaster", "Dark Ride"],
        tags: ["Indoor", "New", "Popular"],
        duration: "4 minutes",
        userRating: 4.9,
    },
    {
        id: "attr4",
        name: "Slinky Dog Dash",
        parkId: "HS",
        parkName: "Hollywood Studios",
        land: "Toy Story Land",
        imageUrl: "/images/attractions/slinky-dog.jpg",
        thumbnailUrl: "/images/attractions/slinky-dog-thumb.jpg",
        description: "Take a wild ride on Slinky Dog as he stretches throughout Toy Story Land.",
        waitTime: 90,
        status: "Operating",
        geniePlus: { available: true, nextAvailableTime: "09:45 AM", isLightningLane: false },
        riderSwitchAvailable: true,
        heightRequirement: "38in (97cm)",
        thrillLevels: ["Coaster", "Gentle"],
        tags: ["Outdoor", "Popular"],
        duration: "2 minutes",
        userRating: 4.6,
    },
    {
        id: "attr5",
        name: " Kilimanjaro Safaris",
        parkId: "AK",
        parkName: "Animal Kingdom",
        land: "Africa",
        imageUrl: "/images/attractions/kilimanjaro-safaris.jpg",
        thumbnailUrl: "/images/attractions/kilimanjaro-safaris-thumb.jpg",
        description: "Explore the African savanna on an open-air vehicle, spotting real wild animals.",
        waitTime: 20,
        status: "Operating",
        geniePlus: { available: true, nextAvailableTime: "10:00 AM", isLightningLane: false },
        riderSwitchAvailable: false,
        heightRequirement: null,
        thrillLevels: ["Gentle", "Show"],
        tags: ["Outdoor", "Educational"],
        duration: "20 minutes",
        userRating: 4.5,
    },
    {
        id: "attr6",
        name: "The Twilight Zone Tower of Terror™",
        parkId: "HS",
        parkName: "Hollywood Studios",
        land: "Sunset Boulevard",
        imageUrl: "/images/attractions/tower-of-terror.jpg",
        thumbnailUrl: "/images/attractions/tower-of-terror-thumb.jpg",
        description: "Brave a haunted elevator ride that drops you unexpectedly into the Twilight Zone.",
        waitTime: 60,
        status: "Operating",
        geniePlus: { available: true, nextAvailableTime: "11:30 AM", isLightningLane: false },
        riderSwitchAvailable: true,
        heightRequirement: "40in (102cm)",
        thrillLevels: ["Dark Ride", "Spinner"],
        tags: ["Indoor", "Scary"],
        duration: "5 minutes",
        userRating: 4.8,
    },
    {
        id: "attr7",
        name: "It\'s a Small World",
        parkId: "MK",
        parkName: "Magic Kingdom",
        land: "Fantasyland",
        description: "Embark on a whimsical boat ride and sing along to the classic anthem of world peace.",
        waitTime: 15,
        status: "Operating",
        geniePlus: { available: true, nextAvailableTime: "09:00 AM", isLightningLane: false },
        riderSwitchAvailable: false,
        heightRequirement: null,
        thrillLevels: ["Gentle", "Show"],
        tags: ["Indoor", "Classic"],
        duration: "10 minutes",
        userRating: 4.2,
        imageUrl: "/images/attractions/small-world.jpg",
        thumbnailUrl: "/images/attractions/small-world-thumb.jpg"
    },
    {
        id: "attr8",
        name: "Test Track",
        parkId: "EP",
        parkName: "Epcot",
        land: "World Discovery",
        description: "Design a virtual concept car and then take it for a thrilling test drive.",
        waitTime: 65,
        status: "Operating",
        geniePlus: { available: true, nextAvailableTime: "10:15 AM", isLightningLane: false },
        riderSwitchAvailable: true,
        heightRequirement: "40in (102cm)",
        thrillLevels: ["Dark Ride", "Show"],
        tags: ["Indoor", "Fast"],
        duration: "5 minutes",
        userRating: 4.5,
        imageUrl: "/images/attractions/test-track.jpg",
        thumbnailUrl: "/images/attractions/test-track-thumb.jpg"
    },
    {
        id: "attr9",
        name: "Star Wars: Rise of the Resistance",
        parkId: "HS",
        parkName: "Hollywood Studios",
        land: "Star Wars: Galaxy\'s Edge",
        description: "Join the Resistance in an epic battle against the First Order—an immersive Star Wars adventure.",
        waitTime: 120, // Often uses Virtual Queue or Individual Lightning Lane
        status: "Operating",
        geniePlus: { available: false, isLightningLane: true }, // Typically ILL
        riderSwitchAvailable: true,
        heightRequirement: "40in (102cm)",
        thrillLevels: ["Dark Ride", "Show"],
        tags: ["Indoor", "Popular", "Star Wars"],
        duration: "18 minutes (approx.)",
        userRating: 4.9,
        imageUrl: "/images/attractions/rise-of-resistance.jpg",
        thumbnailUrl: "/images/attractions/rise-of-resistance-thumb.jpg"
    },
    {
        id: "attr10",
        name: "Avatar Flight of Passage",
        parkId: "AK",
        parkName: "Animal Kingdom",
        land: "Pandora – The World of Avatar",
        description: "Soar on the back of a banshee on a breathtaking 3D ride over Pandora.",
        waitTime: 110,
        status: "Operating",
        geniePlus: { available: false, isLightningLane: true }, // Typically ILL
        riderSwitchAvailable: true,
        heightRequirement: "44in (112cm)",
        thrillLevels: ["Dark Ride", "Show"],
        tags: ["Indoor", "Popular", "3D"],
        duration: "5 minutes",
        userRating: 4.9,
        imageUrl: "/images/attractions/flight-of-passage.jpg",
        thumbnailUrl: "/images/attractions/flight-of-passage-thumb.jpg"
    }
];

const ALL_PARKS_ID = "ALL";

interface WaitTimesDashboardProps {
    vacationId?: string; // Example prop, adapt as needed
    compact?: boolean;
    initialParkId?: ParkId | typeof ALL_PARKS_ID;
}

export default function WaitTimesDashboard({
    vacationId,
    compact = false,
    initialParkId = ALL_PARKS_ID
}: WaitTimesDashboardProps): React.ReactElement {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPark, setSelectedPark] = useState<ParkId | typeof ALL_PARKS_ID>(initialParkId);
    const [showGeniePlusOnly, setShowGeniePlusOnly] = useState(false);
    const [showOperatingOnly, setShowOperatingOnly] = useState(true);
    const [maxWaitTime, setMaxWaitTime] = useState<number | null>(null);
    const [selectedThrillLevels, setSelectedThrillLevels] = useState<ThrillCategory[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [sortBy, setSortBy] = useState<"waitTime" | "name">("waitTime");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchAttractions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                // In a real app, filter by vacationId or other params if needed
                setAttractions(mockAttractions);
            } catch (e) {
                setError("Failed to fetch attraction wait times. Please try again.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttractions();
    }, [vacationId]);

    const thrillCategories = useMemo(() => {
        const allThrillLevels = new Set<ThrillCategory>();
        mockAttractions.forEach(att => att.thrillLevels.forEach(level => allThrillLevels.add(level)));
        return Array.from(allThrillLevels).sort();
    }, []);

    const handleThrillLevelChange = (thrillLevel: ThrillCategory) => {
        setSelectedThrillLevels(prev =>
            prev.includes(thrillLevel)
                ? prev.filter(level => level !== thrillLevel)
                : [...prev, thrillLevel]
        );
    };

    const filteredAndSortedAttractions = useMemo(() => {
        return attractions
            .filter(att => {
                const parkMatch = selectedPark === ALL_PARKS_ID || att.parkId === selectedPark;
                const searchMatch = searchTerm === "" || att.name.toLowerCase().includes(searchTerm.toLowerCase()) || (att.land && att.land.toLowerCase().includes(searchTerm.toLowerCase()));
                const geniePlusMatch = !showGeniePlusOnly || att.geniePlus.available;
                const operatingMatch = !showOperatingOnly || att.status === "Operating";
                const waitTimeMatch = maxWaitTime === null || (att.waitTime !== null && att.waitTime <= maxWaitTime);
                const thrillLevelMatch = selectedThrillLevels.length === 0 || selectedThrillLevels.some(level => att.thrillLevels.includes(level));
                return parkMatch && searchMatch && geniePlusMatch && operatingMatch && waitTimeMatch && thrillLevelMatch;
            })
            .sort((a, b) => {
                if (sortBy === "name") {
                    return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }
                // Handle null wait times for sorting
                const waitA = a.waitTime === null ? (sortOrder === 'asc' ? Infinity : -Infinity) : a.waitTime;
                const waitB = b.waitTime === null ? (sortOrder === 'asc' ? Infinity : -Infinity) : b.waitTime;
                return sortOrder === "asc" ? waitA - waitB : waitB - waitA;
            });
    }, [attractions, selectedPark, searchTerm, showGeniePlusOnly, showOperatingOnly, maxWaitTime, selectedThrillLevels, sortBy, sortOrder]);

    const getStatusColor = (status: AttractionStatus): string => {
        switch (status) {
            case "Operating": return "bg-green-500";
            case "Closed": return "bg-red-500";
            case "Down": return "bg-yellow-500";
            case "Refurbishment": return "bg-blue-500";
            default: return "bg-gray-500";
        }
    };

    const getWaitTimeDisplay = (waitTime: number | null, status: AttractionStatus) => {
        if (status !== "Operating" || waitTime === null) return status;
        if (waitTime <= 5) return "Walk-on";
        return `${waitTime} min`;
    };

    const toggleSortOrder = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc");

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedPark(initialParkId);
        setShowGeniePlusOnly(false);
        setShowOperatingOnly(true);
        setMaxWaitTime(null);
        setSelectedThrillLevels([]);
        setSortBy("waitTime");
        setSortOrder("asc");
    };

    if (isLoading && attractions.length === 0) { // Show full page skeleton only on initial load
        return <WaitTimesDashboardSkeleton compact={compact} />;
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center"><AlertCircle className="mr-2 h-6 w-6 text-red-500" />Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Failed to Load Data</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const renderAttractionCard = (att: Attraction) => (
        <Card
            key={att.id}
            className={`w-full overflow-hidden transition-all hover:shadow-lg ${compact ? 'flex' : ''}`}
            onClick={() => setSelectedAttraction(att)}
        >
            {!compact && att.thumbnailUrl && (
                <div className="relative w-full h-40">
                    <Image
                        src={att.thumbnailUrl}
                        alt={att.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={attractions.slice(0, 5).map(a => a.id).includes(att.id)} // Prioritize loading for first few visible images
                    />
                    <Badge className="absolute top-2 right-2" variant={att.status === "Operating" ? "default" : "destructive"}>{att.status}</Badge>
                </div>
            )}
            {compact && att.thumbnailUrl && (
                <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                        src={att.thumbnailUrl}
                        alt={att.name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            )}
            <div className="flex flex-col flex-grow">
                <CardHeader className={`pb-2 ${compact ? 'p-3' : ''}`}>
                    <CardTitle className={`text - lg font - semibold ${compact ? 'text-base leading-tight' : ''}`}>{att.name}</CardTitle>
                    {!compact && <CardDescription className="text-xs text-muted-foreground">{att.parkName} - {att.land}</CardDescription>}
                </CardHeader >
                <CardContent className={`flex-grow ${compact ? 'p-3 pt-0 text-xs' : ''}`}>
                    {
                        compact ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-primary" />
                                    <span className="font-medium">{getWaitTimeDisplay(att.waitTime, att.status)}</span>
                                </div>
                                {att.geniePlus.available && <Zap className="h-3 w-3 text-yellow-500" />}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center mb-2">
                                    <Clock className="h-5 w-5 mr-2 text-primary" />
                                    <span className="text-xl font-bold">{getWaitTimeDisplay(att.waitTime, att.status)}</span>
                                    {att.waitTime !== null && att.waitTime > 60 && <Badge variant="secondary" className="ml-2">High Wait</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{att.description}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    {att.geniePlus.available && (
                                        <div className="flex items-center mr-3">
                                            <Zap className="h-4 w-4 mr-1 text-yellow-500" /> Genie+
                                            {att.geniePlus.nextAvailableTime && ` (${att.geniePlus.nextAvailableTime})`}
                                        </div>
                                    )}
                                    {att.geniePlus.isLightningLane && (
                                        <div className="flex items-center text-purple-500">
                                            <Zap className="h-4 w-4 mr-1" /> Ind. Lightning Lane
                                        </div>
                                    )}
                                </div>
                            </>
                        )
                    }
                </CardContent >
                {!compact && (
                    <CardFooter className="flex justify-end p-3">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAttraction(att); }}>
                            View Details <Maximize2 className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                )
                }
            </div >
        </Card >
    );

    return (
        <div className={`space-y-6 ${compact ? "p-0" : "p-4"}`}>
            {!compact && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center">
                        <ListFilter className="h-6 w-6 mr-2 text-primary" />
                        <h2 className="text-2xl font-bold tracking-tight">Live Wait Times</h2>
                    </div>
                    <Button variant="outline" onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="md:hidden">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        {isFiltersOpen ? "Hide" : "Show"} Filters
                    </Button>
                </div>
            )}

            {/* Filter and Sort Controls */}
            <div className={`filter-controls-area ${compact ? 'mb-2' : 'grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg bg-card'} ${isFiltersOpen || !compact ? 'block' : 'hidden'}`}>
                {/* Search */}
                <div className="md:col-span-12 lg:col-span-3">
                    {!compact && <Label htmlFor="search-attraction" className="text-sm font-medium">Search</Label>}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search-attraction"
                            type="text"
                            placeholder={compact ? "Search..." : "Search attractions or lands..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full"
                        />
                        {searchTerm && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm("")}><X className="h-4 w-4" /></Button>}
                    </div>
                </div>

                {/* Park Selector */}
                <div className="md:col-span-6 lg:col-span-2">
                    {!compact && <Label htmlFor="park-select" className="text-sm font-medium">Park</Label>}
                    <Select value={selectedPark} onValueChange={(value) => {
                        const typedValue = value as ParkId | typeof ALL_PARKS_ID;
                        // Verify the value matches expected type
                        typedValue satisfies ParkId | typeof ALL_PARKS_ID;
                        setSelectedPark(typedValue);
                    }}>
                        <SelectTrigger id="park-select">
                            <SelectValue placeholder="Select Park" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_PARKS_ID}>All Parks</SelectItem>
                            {Object.values(parksData).map(park => (
                                <SelectItem key={park.id} value={park.id}>{park.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort Controls */}
                <div className="md:col-span-6 lg:col-span-3 flex items-end gap-2">
                    <div className="flex-grow">
                        {!compact && <Label htmlFor="sort-by" className="text-sm font-medium">Sort By</Label>}
                        <Select value={sortBy} onValueChange={(value) => {
                            const typedValue = value as "waitTime" | "name";
                            // Verify the value matches expected type
                            typedValue satisfies "waitTime" | "name";
                            setSortBy(typedValue);
                        }}>
                            <SelectTrigger id="sort-by">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="waitTime">Wait Time</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" size="icon" onClick={toggleSortOrder} aria-label="Toggle sort order">
                        {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {!compact && (
                    <>
                        {/* Advanced Filters Trigger */}
                        <div className="md:col-span-12 lg:col-span-2 flex items-end">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <Filter className="mr-2 h-4 w-4" /> Advanced Filters
                                        {(showGeniePlusOnly || maxWaitTime !== null || selectedThrillLevels.length > 0 || !showOperatingOnly) && <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4 space-y-4" align="end">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Advanced Filters</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Refine your attraction search.
                                        </p>
                                    </div>
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between space-x-2">
                                            <Label htmlFor="genie-plus-only" className="flex flex-col space-y-1">
                                                <span>Genie+ Only</span>
                                                <span className="font-normal leading-snug text-muted-foreground text-xs">Show only attractions offering Genie+.</span>
                                            </Label>
                                            <Switch
                                                id="genie-plus-only"
                                                checked={showGeniePlusOnly}
                                                onCheckedChange={setShowGeniePlusOnly}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                            <Label htmlFor="operating-only" className="flex flex-col space-y-1">
                                                <span>Operating Only</span>
                                                <span className="font-normal leading-snug text-muted-foreground text-xs">Hide closed or down attractions.</span>
                                            </Label>
                                            <Switch
                                                id="operating-only"
                                                checked={showOperatingOnly}
                                                onCheckedChange={setShowOperatingOnly}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="max-wait-time">Max Wait Time (minutes)</Label>
                                            <Input
                                                id="max-wait-time"
                                                type="number"
                                                min="0"
                                                step="5"
                                                placeholder="Any"
                                                value={maxWaitTime === null ? "" : String(maxWaitTime)}
                                                onChange={(e) => setMaxWaitTime(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Thrill Levels</Label>
                                            <ScrollArea className="h-32 mt-1 border rounded-md p-2">
                                                <div className="space-y-2">
                                                    {thrillCategories.map(level => (
                                                        <div key={level} className="flex items-center space-x-2">
                                                            <Switch
                                                                id={`thrill-${level}`}
                                                                checked={selectedThrillLevels.includes(level)}
                                                                onCheckedChange={() => handleThrillLevelChange(level)}
                                                            />
                                                            <Label htmlFor={`thrill-${level}`} className="text-sm font-normal">{level}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {/* Clear Filters Button */}
                        <div className="md:col-span-12 lg:col-span-2 flex items-end">
                            <Button variant="ghost" onClick={handleClearFilters} className="w-full text-muted-foreground hover:text-primary">
                                <X className="mr-2 h-4 w-4" /> Clear All Filters
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Loading indicator for filtering/sorting */}
            {
                isLoading && attractions.length > 0 && (
                    <div className="flex justify-center items-center py-8">
                        <Skeleton className="h-8 w-8 rounded-full animate-spin" />
                        <p className="ml-2 text-muted-foreground">Updating attractions...</p>
                    </div>
                )
            }

            {/* Attractions Grid / List */}
            {
                !isLoading && filteredAndSortedAttractions.length === 0 && (
                    <Card className="w-full text-center">
                        <CardHeader>
                            <CardTitle>No Attractions Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                            <RabbitIcon className="mx-auto mt-4 h-16 w-16 text-muted-foreground/50" />
                        </CardContent>
                    </Card>
                )
            }

            {
                !isLoading && filteredAndSortedAttractions.length > 0 && (
                    compact ? (
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex space-x-4 pb-4">
                                {filteredAndSortedAttractions.map(renderAttractionCard)}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredAndSortedAttractions.map(renderAttractionCard)}
                        </div>
                    )
                )
            }

            {/* Attraction Detail Modal */}
            <AttractionDetailModal
                attraction={selectedAttraction}
                isOpen={!!selectedAttraction}
                onClose={() => setSelectedAttraction(null)}
                getStatusColor={getStatusColor}
                getWaitTimeDisplay={getWaitTimeDisplay}
            />
        </div >
    );
}

interface AttractionDetailModalProps {
    attraction: Attraction | null;
    isOpen: boolean;
    onClose: () => void;
    getStatusColor: (status: AttractionStatus) => string;
    getWaitTimeDisplay: (waitTime: number | null, status: AttractionStatus) => string;
}

function AttractionDetailModal({ attraction, isOpen, onClose, getStatusColor, getWaitTimeDisplay }: AttractionDetailModalProps) {
    if (!attraction) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0">
                <ScrollArea className="max-h-[90vh]">
                    <div className="relative h-64 md:h-80 w-full">
                        {attraction.imageUrl ? (
                            <Image
                                src={attraction.imageUrl}
                                alt={attraction.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-t-lg"
                                sizes="100vw"
                            />
                        ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center rounded-t-lg">
                                <MapPin className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                        <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                        <Badge className={`absolute bottom-3 left-3 text-sm px-3 py-1.5 ${getStatusColor(attraction.status)}`}>
                            {attraction.status}
                        </Badge>
                    </div>

                    <div className="p-6 space-y-6">
                        <DialogHeader className="border-b pb-4">
                            <DialogTitle className="text-3xl font-bold tracking-tight">{attraction.name}</DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground">
                                {attraction.parkName} - {attraction.land}
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview"><Info className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                                <TabsTrigger value="waits"><Clock className="mr-2 h-4 w-4" />Wait Times</TabsTrigger>
                                <TabsTrigger value="details"><Users className="mr-2 h-4 w-4" />Logistics</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="mt-6 space-y-4">
                                <Card>
                                    <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                                    <CardContent><p className="text-muted-foreground leading-relaxed">{attraction.description}</p></CardContent>
                                </Card>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Current Wait</CardTitle>
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{getWaitTimeDisplay(attraction.waitTime, attraction.status)}</div>
                                            {attraction.waitTime !== null && attraction.waitTime > 0 && <p className="text-xs text-muted-foreground">Last updated: just now</p>}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Genie+ / LL</CardTitle>
                                            <Zap className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            {attraction.geniePlus.available && (
                                                <div className="text-green-600 font-semibold">
                                                    Available
                                                    {attraction.geniePlus.nextAvailableTime && ` (Next: ${attraction.geniePlus.nextAvailableTime})`}
                                                </div>
                                            )}
                                            {attraction.geniePlus.isLightningLane && <div className="text-purple-600 font-semibold">Individual Lightning Lane</div>}
                                            {!attraction.geniePlus.available && !attraction.geniePlus.isLightningLane && <div className="text-muted-foreground">Not Available</div>}
                                        </CardContent>
                                    </Card>
                                </div>
                                {attraction.tips && attraction.tips.length > 0 && (
                                    <Card>
                                        <CardHeader><CardTitle>Pro Tips</CardTitle></CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                {attraction.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                            <TabsContent value="waits" className="mt-6 space-y-4">
                                <Card>
                                    <CardHeader><CardTitle>Historical Wait Times</CardTitle></CardHeader>
                                    <CardContent>
                                        {attraction.historicalWaitTimes && attraction.historicalWaitTimes.length > 0 ? (
                                            // Placeholder for a chart component
                                            <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                                                <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
                                                <p className="ml-2 text-muted-foreground">Historical data chart coming soon!</p>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No historical wait time data available.</p>
                                        )}
                                    </CardContent>
                                </Card>
                                <Alert>
                                    <Sun className="h-4 w-4" /> {/* Or Moon, CloudDrizzle, etc. based on time/weather */}
                                    <AlertTitle>Wait Time Forecast</AlertTitle>
                                    <AlertDescription>
                                        Wait times are typically lowest in the morning and during evening parades/fireworks.
                                        Check back for more specific forecasts!
                                    </AlertDescription>
                                </Alert>
                            </TabsContent>
                            <TabsContent value="details" className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoCard title="Duration" value={attraction.duration || "Varies"} />
                                    <InfoCard title="Height Requirement" value={attraction.heightRequirement || "Any height"} />
                                    <InfoCard title="Rider Switch" value={attraction.riderSwitchAvailable ? "Available" : "Not Available"} />
                                    <InfoCard title="User Rating" value={attraction.userRating ? `${attraction.userRating} / 5` : "Not Rated"} />
                                </div>
                                <Card>
                                    <CardHeader><CardTitle>Thrill Levels & Tags</CardTitle></CardHeader>
                                    <CardContent className="flex flex-wrap gap-2">
                                        {attraction.thrillLevels.map(level => <Badge key={level} variant="secondary">{level}</Badge>)}
                                        {attraction.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="pt-4 border-t">
                            <Button variant="outline" onClick={() => alert("Add to My Itinerary (Not Implemented)")}>
                                Add to Itinerary
                            </Button>
                            <Button onClick={() => window.open(`https://disneyworld.disney.go.com/attractions/${attraction.parkId.toLowerCase()}/${attraction.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '')}/`, '_blank')}>
                                Official Page <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </div>
                </ScrollArea>
            </DialogContent >
        </Dialog >
    );
}

function InfoCard({ title, value }: { title: string, value: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg font-semibold text-muted-foreground">{value}</p>
            </CardContent>
        </Card>
    )
}

function RabbitIcon(props: React.SVGProps<SVGSVGElement>) { // Placeholder icon
    return (
        <svg
            {...props}
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
            <path d="M15.5 13.5c0-2.5-1.1-4.8-2.5-4.8S10.5 11 10.5 13.5" />
            <path d="M10.5 18.5c0 2.5-1.12 4.91-2.5 4.91s-2.5-2.41-2.5-4.91" />
            <path d="M18.5 10.5c2.5 0 4.91 1.12 4.91 2.5s-2.41 2.5-4.91 2.5" />
            <path d="M13.5 10.5c0-2.5 1.12-4.91 2.5-4.91S18.5 8 18.5 10.5" />
            <path d="M5.5 18.5c-2.5 0-4.91-1.12-4.91-2.5s2.41-2.5 4.91-2.5" />
            <path d="M12 12c0-2.43.74-4.75 1.5-6.5C14.26 3.75 15.74 3 18 3s2.91.62 4.5 2.11" />
            <path d="M6 3C4.26 3 2.74 3.75 1.5 5.5.74 7.25 0 9.57 0 12c0 3.13 1.11 5.91 2.51 7.5S6.87 21 10 21s5.09-1.11 7.5-2.5S20 15.13 20 12c0-2.43-.74-4.75-1.5-6.5C17.74 3.75 16.26 3 14 3s-2.91.62-4.5 2.11" />
            <path d="M14 18.5c-1.17-1.17-2.5-2-2.5-2s-1.33.83-2.5 2c-1.17 1.17-2 2.5-2 2.5s.83 1.33 2 2.5c1.17 1.17 2.5 2 2.5 2s1.33-.83 2.5-2c1.17-1.17 2-2.5 2-2.5s-.83-1.33-2-2.5Z" />
        </svg>
    )
}


function WaitTimesDashboardSkeleton({ compact = false }: { compact?: boolean }) {
    const cardCount = compact ? 4 : 8;
    const CardSkeleton = () => (
        <Card className={`w-full overflow-hidden ${compact ? 'flex h-24' : 'h-80'}`}>
            {compact ? (
                <Skeleton className="h-full w-24 flex-shrink-0" />
            ) : (
                <Skeleton className="h-40 w-full" />
            )}
            <div className="flex flex-col flex-grow p-4 space-y-2">
                <Skeleton className={`h-6 w-3/4 ${compact ? 'h-4' : ''}`} />
                {!compact && <Skeleton className="h-4 w-1/2" />}
                <Skeleton className={`h-4 w-full ${compact ? 'h-3' : ''}`} />
                {!compact && <Skeleton className="h-4 w-2/3" />}
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className={`h-8 w-1/3 ${compact ? 'h-6 w-1/2' : ''}`} />
                    {!compact && <Skeleton className="h-8 w-1/4" />}
                </div>
            </div>
        </Card>
    );

    return (
        <div className={`space-y-6 ${compact ? "p-0" : "p-4"}`}>
            {!compact && (
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-24 md:hidden" />
                </div>
            )}
            <div className={`filter-controls-area ${compact ? 'mb-2' : 'grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg'}`}>
                <div className="md:col-span-12 lg:col-span-3"><Skeleton className="h-10 w-full" /></div>
                <div className="md:col-span-6 lg:col-span-2"><Skeleton className="h-10 w-full" /></div>
                <div className="md:col-span-6 lg:col-span-3 flex gap-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-10" /></div>
                {!compact && <>
                    <div className="md:col-span-6 lg:col-span-2"><Skeleton className="h-10 w-full" /></div>
                    <div className="md:col-span-6 lg:col-span-2"><Skeleton className="h-10 w-full" /></div>
                </>}
            </div>

            {
                compact ? (
                    <div className="flex space-x-4 pb-4">
                        {[...Array(cardCount)].map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(cardCount)].map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                )
            }
        </div >
    );
}

