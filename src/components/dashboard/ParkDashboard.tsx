// src/components/dashboard/ParkDashboard.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isSameDay } from 'date-fns';
import { getWaltDisneyWorldParks, getParkSchedule } from '@/lib/api/themeParks';
import { useWaitTimes } from '@/hooks/useWaitTimes';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ThermometerSun,
    Droplets,
    Users,
    Clock,
    Calendar,
    Info,
    ArrowDown,
    ArrowUp,
    Minus,
    RefreshCw,
    AlertCircle,
    Clock4,
    Zap
} from "lucide-react";
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Attraction {
    id: string;
    name: string;
    waitTime?: number;
    status?: string;
    trend?: string;
}

interface SortedAttractions {
    operating: Attraction[];
    down: Attraction[];
    closed?: Attraction[];
}

interface WaitTimeStats {
    average: number;
    longest: number;
    longestName: string;
    belowThirty: number;
    belowThirtyPercent: number;
}

interface OperatingHours {
    date: string;
    openingTime: string;
    closingTime: string;
}

interface Park {
    id: string;
    name: string;
}

interface WeatherForecast {
    time: string;
    temperature: number;
    condition: string;
    precipitation: number;
}

interface WeatherData {
    current: {
        temperature: number;
        condition: string;
        precipitation: number;
        humidity: number;
    };
    forecast: WeatherForecast[];
}

interface CrowdForecast {
    date: string;
    level: number;
    notes: string;
}

interface CrowdLevelData {
    today: number;
    forecast: CrowdForecast[];
    trend: string; // Changed from union type to string
}

interface ParkStatusCardProps {
    readonly currentPark?: Park;
    readonly operatingHours?: OperatingHours;
    readonly lastUpdated?: Date | null;
    readonly sortedAttractions?: SortedAttractions;
    readonly waitTimeStats?: WaitTimeStats | null;
    readonly waitTimeTrend?: string | null;
}

interface WaitTimesCardProps {
    readonly sortedAttractions?: SortedAttractions;
}

interface ParkConditionsCardProps {
    readonly showWeather: boolean;
    readonly showCrowdLevels: boolean;
    readonly weatherData: WeatherData;
    readonly crowdLevelData: CrowdLevelData;
}

interface ParkDashboardProps {
    readonly showWeather?: boolean;
    readonly showCrowdLevels?: boolean;
    readonly compactView?: boolean;
}

// Helper functions extracted outside the component
const getTrendIndicator = (waitTimeTrend: string | null | undefined) => {
    if (!waitTimeTrend) return <Minus className="h-4 w-4" />;

    switch (waitTimeTrend) {
        case 'increasing':
            return <ArrowUp className="h-4 w-4 text-red-500" />;
        case 'decreasing':
            return <ArrowDown className="h-4 w-4 text-green-500" />;
        default:
            return <Minus className="h-4 w-4 text-amber-500" />;
    }
};

const getCrowdLevelColor = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-amber-500';
    return 'bg-red-500';
};

const getWaitTimeColorClass = (waitTime: number) => {
    if (waitTime <= 10) return 'bg-green-500';
    if (waitTime <= 30) return 'bg-blue-500';
    if (waitTime <= 60) return 'bg-amber-500';
    return 'bg-red-500';
};

const calculateWaitTimeStats = (sortedAttractions?: SortedAttractions): WaitTimeStats | null => {
    if (!sortedAttractions) return null;

    return {
        average: sortedAttractions.operating.length > 0
            ? Math.round(sortedAttractions.operating.reduce((sum: number, a: Attraction) => sum + a.waitTime!, 0) / sortedAttractions.operating.length)
            : 0,
        longest: sortedAttractions.operating.length > 0
            ? Math.max(...sortedAttractions.operating.map((a: Attraction) => a.waitTime!))
            : 0,
        longestName: sortedAttractions.operating.length > 0
            ? sortedAttractions.operating[0].name
            : '',
        belowThirty: sortedAttractions.operating.filter((a: Attraction) => a.waitTime! <= 30).length,
        belowThirtyPercent: sortedAttractions.operating.length > 0
            ? Math.round((sortedAttractions.operating.filter((a: Attraction) => a.waitTime! <= 30).length / sortedAttractions.operating.length) * 100)
            : 0,
    };
};

// Replace the nested ternary with a function
const getDateLabel = (index: number, date: Date): string => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
};

// Sub-components
function ParkStatusCard({ currentPark, operatingHours, lastUpdated, sortedAttractions, waitTimeStats, waitTimeTrend }: ParkStatusCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                    {currentPark?.name || 'Park Status'}
                </CardTitle>
                {operatingHours && (
                    <CardDescription>
                        {format(parseISO(operatingHours.openingTime), 'h:mm a')} - {format(parseISO(operatingHours.closingTime), 'h:mm a')}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Badge
                                className={cn(
                                    "rounded-full h-3 w-3 mr-2",
                                    operatingHours ? "bg-green-500" : "bg-gray-400"
                                )}
                            />
                            <span className="text-sm font-medium">
                                {operatingHours ? 'Open Today' : 'Schedule Unavailable'}
                            </span>
                        </div>
                        {lastUpdated && (
                            <div className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Updated: {format(lastUpdated, 'h:mm a')}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/20 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground">Operating Attractions</div>
                            <div className="text-2xl font-bold">
                                {sortedAttractions?.operating.length || 0}
                            </div>
                        </div>
                        <div className="bg-secondary/20 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground">Temporarily Down</div>
                            <div className="text-2xl font-bold">
                                {sortedAttractions?.down.length || 0}
                            </div>
                        </div>
                    </div>

                    {waitTimeStats && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="text-sm">Average Wait Time</div>
                                <div className="font-bold flex items-center">
                                    {waitTimeStats.average} min
                                    {getTrendIndicator(waitTimeTrend)}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm">Longest Wait</div>
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <div className="font-bold flex items-center cursor-help">
                                            {waitTimeStats.longest} min
                                            <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                                        </div>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                        <div className="font-medium">{waitTimeStats.longestName}</div>
                                        <p className="text-sm text-muted-foreground">
                                            Currently has the longest wait time in the park at {waitTimeStats.longest} minutes.
                                        </p>
                                    </HoverCardContent>
                                </HoverCard>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Rides with ≤ 30 min wait</span>
                                    <span>{waitTimeStats.belowThirtyPercent}%</span>
                                </div>
                                <Progress value={waitTimeStats.belowThirtyPercent} />
                                <div className="text-xs text-muted-foreground">
                                    {waitTimeStats.belowThirty} out of {sortedAttractions?.operating?.length || 0} attractions
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function WaitTimesCard({ sortedAttractions }: WaitTimesCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Wait Times</CardTitle>
                <CardDescription>
                    Top attractions by wait time
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
                <ScrollArea className="h-[260px]">
                    <div className="px-4">
                        {sortedAttractions?.operating?.slice(0, 10).map((attraction: Attraction, index: number) => {
                            const isLastItem = index === (sortedAttractions?.operating?.slice(0, 10).length || 0) - 1;
                            return (
                                <div
                                    key={attraction.id}
                                    className={cn(
                                        "py-2 flex items-center justify-between",
                                        !isLastItem && "border-b"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-medium text-sm",
                                                getWaitTimeColorClass(attraction.waitTime!)
                                            )}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="text-sm font-medium truncate max-w-[150px]">
                                            {attraction.name}
                                        </div>
                                    </div>
                                    <div className="font-bold">
                                        {attraction.waitTime!} min
                                    </div>
                                </div>
                            );
                        })}

                        {(!sortedAttractions?.operating || sortedAttractions?.operating.length === 0) && (
                            <div className="py-8 text-center text-muted-foreground">
                                No wait time data available
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function ParkConditionsCard({ showWeather, showCrowdLevels, weatherData, crowdLevelData }: ParkConditionsCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Park Conditions</CardTitle>
                <CardDescription>
                    Weather and crowd forecasts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="weather">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="weather">
                            <ThermometerSun className="h-4 w-4 mr-2" />
                            Weather
                        </TabsTrigger>
                        <TabsTrigger value="crowds">
                            <Users className="h-4 w-4 mr-2" />
                            Crowds
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="weather" className="mt-4 space-y-4">
                        {showWeather && (
                            <>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-3xl font-bold">
                                            {weatherData.current.temperature}°F
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {weatherData.current.condition}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end">
                                            <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                                            <span>{weatherData.current.precipitation}%</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Humidity: {weatherData.current.humidity}%
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="text-sm font-medium mb-2">Today&apos;s Forecast</div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {weatherData.forecast.map((forecast: WeatherForecast) => (
                                            <div key={`forecast-${forecast.time}-${forecast.temperature}`} className="text-center">
                                                <div className="text-xs font-medium">{forecast.time}</div>
                                                <div className="text-sm font-bold my-1">{forecast.temperature}°</div>
                                                <div className="text-xs text-muted-foreground">{forecast.precipitation}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-sm text-muted-foreground mt-2">
                                    <AlertCircle className="h-3 w-3 inline mr-1" />
                                    {weatherData.forecast.some((f: WeatherForecast) => f.precipitation > 30)
                                        ? 'Rain gear recommended today'
                                        : 'Good weather conditions expected'}
                                </div>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="crowds" className="mt-4 space-y-4">
                        {showCrowdLevels && (
                            <>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm font-medium">Today&apos;s Crowd Level</div>
                                        <div className="flex items-center mt-1">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <div
                                                    key={`crowd-level-indicator-${i}`}
                                                    className={cn(
                                                        "w-5 h-5 rounded mr-1 last:mr-0",
                                                        i < crowdLevelData.today ? getCrowdLevelColor(crowdLevelData.today) : "bg-secondary"
                                                    )}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-center bg-secondary/30 rounded-lg p-2 px-3">
                                        <div className="text-3xl font-bold">{crowdLevelData.today}</div>
                                        <div className="text-xs text-muted-foreground">out of 10</div>
                                    </div>
                                </div>

                                <div className="flex items-center text-sm">
                                    <span className="mr-2">Trend:</span>
                                    {crowdLevelData.trend === 'increasing' && <ArrowUp className="h-4 w-4 text-red-500 mr-1" />}
                                    {crowdLevelData.trend === 'decreasing' && <ArrowDown className="h-4 w-4 text-green-500 mr-1" />}
                                    {crowdLevelData.trend === 'stable' && <Minus className="h-4 w-4 text-amber-500 mr-1" />}
                                    <span className="capitalize">{crowdLevelData.trend}</span>
                                </div>

                                <Separator />

                                <div>
                                    <div className="text-sm font-medium mb-2">Upcoming Forecast</div>
                                    <div className="space-y-2">
                                        {crowdLevelData.forecast.map((day: CrowdForecast) => (
                                            <div key={`crowd-${day.date}`} className="flex justify-between items-center">
                                                <div className="text-sm">
                                                    {format(parseISO(day.date), 'EEE, MMM d')}
                                                </div>
                                                <div className="flex items-center">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2",
                                                        getCrowdLevelColor(day.level)
                                                    )}>
                                                        {day.level}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground max-w-[130px] text-right">
                                                        {day.notes}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function LightningLaneCard() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Lightning Lane Availability</CardTitle>
                <CardDescription>
                    Skip the regular lines with Genie+
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-purple-700">Genie+ Availability</div>
                            <div className="text-2xl font-bold text-purple-700">Good</div>
                            <div className="text-xs text-purple-500 mt-1">12 attractions available</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-purple-700">Next Available Time</div>
                            <div className="text-2xl font-bold text-purple-700">11:30 AM</div>
                            <div className="text-xs text-purple-500 mt-1">Space Mountain</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Individual Lightning Lane</div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">Seven Dwarfs Mine Train</div>
                                    <div className="text-xs text-muted-foreground">Return: 2:15 PM - 3:15 PM</div>
                                </div>
                                <Badge className="bg-purple-600">$12</Badge>
                            </div>
                            <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">Guardians of the Galaxy</div>
                                    <div className="text-xs text-muted-foreground">Return: 1:30 PM - 2:30 PM</div>
                                </div>
                                <Badge className="bg-purple-600">$15</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Genie+ Status</div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Available
                            </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Purchase for $25 per person to access Lightning Lane
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    View All Lightning Lane Options
                </Button>
            </CardFooter>
        </Card>
    );
}

function VirtualQueueCard() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Virtual Queues</CardTitle>
                <CardDescription>
                    Join virtual queues for popular attractions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="font-medium">Guardians of the Galaxy</div>
                            <Badge variant="destructive">Filled</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Next boarding group distribution at 1:00 PM
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="font-medium">TRON Lightcycle / Run</div>
                            <Badge variant="destructive">Filled</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Next boarding group distribution at 1:00 PM
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Currently Boarding</div>
                        <Table>
                            <TableBody className="text-sm">
                                <TableRow>
                                    <TableCell className="py-2">Guardians of the Galaxy</TableCell>
                                    <TableCell className="text-right py-2">Groups 96-112</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="py-2">TRON Lightcycle / Run</TableCell>
                                    <TableCell className="text-right py-2">Groups 84-97</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <div className="text-xs text-muted-foreground">
                    <Clock4 className="h-3 w-3 inline mr-1" />
                    Virtual queue status updated 5 minutes ago
                </div>
            </CardFooter>
        </Card>
    );
}

function SpecialEventsCard() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Today&apos;s Special Events</CardTitle>
                <CardDescription>
                    Shows, parades, and special entertainment
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-sm font-medium">Disney Festival of Fantasy Parade</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            12:00 PM, 3:00 PM - Main Street, U.S.A.
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-sm font-medium">Happily Ever After</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            9:00 PM - Cinderella Castle
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-sm font-medium">Mickey&apos;s Magical Friendship Faire</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            11:00 AM, 1:00 PM, 4:00 PM - Castle Forecourt Stage
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-700 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Extended Evening Hours Tonight
                        </div>
                        <div className="text-xs text-blue-500 mt-1">
                            For Deluxe Resort guests - 9:00 PM to 11:00 PM
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Schedule
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ParkDashboard({
    showWeather = true,
    showCrowdLevels = true,
    compactView = false,
}: ParkDashboardProps) {
    const [selectedParkId, setSelectedParkId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Fetch Walt Disney World parks
    const {
        data: parks,
        isLoading: isLoadingParks
    } = useQuery({
        queryKey: ['wdwParks'],
        queryFn: getWaltDisneyWorldParks,
    });

    // Set default selected park if none is selected
    useEffect(() => {
        if (!selectedParkId && parks && parks.length > 0) {
            setSelectedParkId(parks[0].id);
        }
    }, [parks, selectedParkId]);

    // Fetch park operating hours
    const {
        data: parkSchedule,
        isLoading: isLoadingSchedule,
    } = useQuery({
        queryKey: ['parkSchedule', selectedParkId, selectedDate],
        queryFn: () => getParkSchedule(selectedParkId, selectedDate, selectedDate),
        enabled: !!selectedParkId && !!selectedDate,
    });

    // Fetch live wait time data
    const {
        sortedAttractions,
        waitTimeTrend,
        lastUpdated,
        refreshData,
        isLoading: isLoadingWaitTimes,
    } = useWaitTimes({
        parkId: selectedParkId,
        includeHistorical: true,
    });

    // Mock data for weather - in a real app, this would come from an API
    const weatherData = {
        current: {
            temperature: 82,
            condition: 'Partly Cloudy',
            precipitation: 20,
            humidity: 75,
        },
        forecast: [
            { time: '9AM', temperature: 76, condition: 'Sunny', precipitation: 0 },
            { time: '12PM', temperature: 84, condition: 'Partly Cloudy', precipitation: 10 },
            { time: '3PM', temperature: 88, condition: 'Scattered Thunderstorms', precipitation: 40 },
            { time: '6PM', temperature: 82, condition: 'Partly Cloudy', precipitation: 20 },
            { time: '9PM', temperature: 78, condition: 'Clear', precipitation: 0 },
        ],
    };

    // Mock data for crowd levels - in a real app, this would come from an API
    const crowdLevelData = {
        today: 7, // 1-10 scale
        forecast: [
            { date: '2023-05-12', level: 8, notes: 'Friday, likely busy' },
            { date: '2023-05-13', level: 9, notes: 'Weekend, very busy' },
            { date: '2023-05-14', level: 9, notes: 'Weekend, very busy' },
            { date: '2023-05-15', level: 6, notes: 'Monday, moderate crowds' },
            { date: '2023-05-16', level: 5, notes: 'Tuesday, moderate crowds' },
        ],
        trend: 'increasing', // 'increasing', 'decreasing', or 'stable'
    };

    // Get current park information
    const currentPark = parks?.find(park => park.id === selectedParkId);

    // Get operating hours for the selected date
    const operatingHours = parkSchedule?.schedule?.find(
        s => isSameDay(parseISO(s.date), parseISO(selectedDate))
    );

    // Calculate wait time statistics
    const waitTimeStats = calculateWaitTimeStats(sortedAttractions);

    // Loading state
    const isLoading = isLoadingParks || isLoadingSchedule || isLoadingWaitTimes;

    // Render park selector and date picker
    function renderHeader() {
        return (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                    <Select
                        value={selectedParkId}
                        onValueChange={setSelectedParkId}
                        disabled={isLoadingParks}
                    >
                        <SelectTrigger className="w-full sm:w-[250px]">
                            <SelectValue placeholder="Select a park" />
                        </SelectTrigger>
                        <SelectContent>
                            {parks?.map(park => (
                                <SelectItem key={park.id} value={park.id}>
                                    {park.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select
                        value={selectedDate}
                        onValueChange={setSelectedDate}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 14 }).map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() + i);
                                const dateStr = date.toISOString().split('T')[0];
                                const label = getDateLabel(i, date);

                                return (
                                    <SelectItem key={dateStr} value={dateStr}>
                                        {label}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refreshData()}
                        disabled={isLoading}
                        title="Refresh Data"
                    >
                        <RefreshCw className={cn(
                            "h-4 w-4",
                            isLoading && "animate-spin"
                        )} />
                    </Button>
                </div>
            </div>
        );
    }

    // Render loading spinner
    function renderLoading() {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading park data...</p>
                </div>
            </div>
        );
    }

    // Render dashboard content
    function renderDashboard() {
        return (
            <div className={cn(
                "grid gap-4",
                compactView
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-3"
            )}>
                <ParkStatusCard
                    currentPark={currentPark}
                    operatingHours={operatingHours}
                    lastUpdated={lastUpdated}
                    sortedAttractions={sortedAttractions}
                    waitTimeStats={waitTimeStats}
                    waitTimeTrend={waitTimeTrend}
                />

                <WaitTimesCard sortedAttractions={sortedAttractions} />

                {(showWeather || showCrowdLevels) && (
                    <ParkConditionsCard
                        showWeather={showWeather}
                        showCrowdLevels={showCrowdLevels}
                        weatherData={weatherData}
                        crowdLevelData={crowdLevelData}
                    />
                )}

                {!compactView && (
                    <>
                        <LightningLaneCard />
                        <VirtualQueueCard />
                        <SpecialEventsCard />
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {renderHeader()}
            {isLoading ? renderLoading() : renderDashboard()}
        </div>
    );
}