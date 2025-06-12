'use client'

// src/components/dashboard/ParkDashboard.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isSameDay } from 'date-fns';
import { getWaltDisneyWorldParks, getParkSchedule } from '@/lib/api/themeParks-compat';
import { useWaitTimes } from '@/hooks/useWaitTimes';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    RefreshCw
} from "lucide-react";
import { cn } from '@/lib/utils';

// Import sub-components (these should be moved to separate files)
import { ParkStatusCard } from './park-dashboard/ParkStatusCard';
import { WaitTimesCard } from './park-dashboard/WaitTimesCard';
import { ParkConditionsCard } from './park-dashboard/ParkConditionsCard';
import { LightningLaneCard } from './park-dashboard/LightningLaneCard';
import { VirtualQueueCard } from './park-dashboard/VirtualQueueCard';
import { SpecialEventsCard } from './park-dashboard/SpecialEventsCard';

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
    trend: string;
}

// Weather API response types
interface WeatherApiValues {
    temperature: number;
    weatherCode: number;
    precipitationProbability?: number;
    humidity?: number;
}

interface WeatherApiData {
    data: {
        values: WeatherApiValues;
    };
}

interface ParkDashboardProps {
    readonly showWeather?: boolean;
    readonly showCrowdLevels?: boolean;
    readonly compactView?: boolean;
}

// Helper functions extracted outside the component

const calculateWaitTimeStats = (sortedAttractions?: SortedAttractions): WaitTimeStats | null => {
    if (!sortedAttractions) return null;

    const operatingWithWaitTimes = sortedAttractions.operating.filter(a => typeof a.waitTime === 'number');

    if (operatingWithWaitTimes.length === 0) {
        return {
            average: 0,
            longest: 0,
            longestName: '',
            belowThirty: 0,
            belowThirtyPercent: 0,
        };
    }

    const waitTimes = operatingWithWaitTimes.map(a => a.waitTime as number);
    const longestWaitTime = Math.max(...waitTimes);
    const longestAttraction = operatingWithWaitTimes.find(a => a.waitTime === longestWaitTime);

    return {
        average: Math.round(waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length),
        longest: longestWaitTime,
        longestName: longestAttraction?.name || '',
        belowThirty: operatingWithWaitTimes.filter(a => (a.waitTime as number) <= 30).length,
        belowThirtyPercent: Math.round((operatingWithWaitTimes.filter(a => (a.waitTime as number) <= 30).length / operatingWithWaitTimes.length) * 100),
    };
};

// Replace the nested ternary with a function
const getDateLabel = (index: number, date: Date): string => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
};

// Fetch real weather data
async function fetchWeatherData(location: string = 'Orlando,FL'): Promise<WeatherData> {
    try {
        const response = await fetch(`/api/weather/realtime?location=${encodeURIComponent(location)}`);

        if (!response.ok) {
            throw new Error('Weather API failed');
        }

        const data = await response.json() as WeatherApiData;

        // Transform API response to expected format
        return {
            current: {
                temperature: Math.round(data.data.values.temperature),
                condition: getWeatherCondition(data.data.values.weatherCode),
                precipitation: data.data.values.precipitationProbability || 0,
                humidity: data.data.values.humidity || 0,
            },
            forecast: generateHourlyForecast(data.data.values),
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Convert weather codes to readable conditions
function getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
        1000: 'Clear',
        1001: 'Partly Cloudy',
        1100: 'Mostly Clear',
        2000: 'Fog',
        4000: 'Light Rain',
        4001: 'Rain',
        4200: 'Drizzle',
        5000: 'Snow',
        8000: 'Thunderstorms',
    };
    return conditions[code] || 'Partly Cloudy';
}

// Generate hourly forecast from current data (simplified)
function generateHourlyForecast(currentValues: WeatherApiValues): WeatherForecast[] {
    const hours = ['9AM', '12PM', '3PM', '6PM', '9PM'];
    const baseTemp = currentValues.temperature;

    return hours.map((time) => ({
        time,
        temperature: Math.round(baseTemp + (Math.random() - 0.5) * 6), // ±3 degrees variation
        condition: getWeatherCondition(currentValues.weatherCode),
        precipitation: Math.max(0, (currentValues.precipitationProbability || 0) + (Math.random() - 0.5) * 20),
    }));
}

// Fetch real crowd data (you'll need to implement a crowd prediction API)
async function fetchCrowdData(): Promise<CrowdLevelData> {
    try {
        // This would call your crowd prediction service
        const response = await fetch('/api/crowds/forecast');

        if (!response.ok) {
            throw new Error('Crowd API failed');
        }

        return await response.json() as CrowdLevelData;
    } catch (error) {
        console.error('Error fetching crowd data:', error);
        // Fallback to reasonable defaults if API fails
        return {
            today: 5,
            forecast: [
                { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], level: 6, notes: 'Weekend, busy' },
                { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], level: 7, notes: 'Weekend, very busy' },
                { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], level: 4, notes: 'Monday, moderate' },
                { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], level: 3, notes: 'Tuesday, light' },
                { date: new Date(Date.now() + 432000000).toISOString().split('T')[0], level: 5, notes: 'Wednesday, moderate' },
            ],
            trend: 'stable',
        };
    }
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

    // Fetch live wait time data using the comprehensive wait times hook
    const {
        sortedAttractions,
        waitTimeTrend,
        lastUpdated,
        refreshData,
        isLoading: isLoadingWaitTimes,
    } = useWaitTimes({
        parkId: selectedParkId,
        includeHistorical: true,
        autoRefresh: true,
    });

    // Fetch real weather data
    const { data: weatherData, isLoading: isLoadingWeather } = useQuery({
        queryKey: ['weather', 'orlando'],
        queryFn: () => fetchWeatherData('Orlando,FL'),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: showWeather,
    });

    // Fetch real crowd data
    const { data: crowdLevelData, isLoading: isLoadingCrowd } = useQuery({
        queryKey: ['crowds', selectedParkId],
        queryFn: fetchCrowdData,
        staleTime: 30 * 60 * 1000, // 30 minutes
        enabled: showCrowdLevels,
    });

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
                    <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-4 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
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

                {(showWeather || showCrowdLevels) && weatherData && crowdLevelData && (
                    <ParkConditionsCard
                        showWeather={showWeather}
                        showCrowdLevels={showCrowdLevels}
                        weatherData={weatherData}
                        crowdLevelData={crowdLevelData}
                        isLoadingWeather={isLoadingWeather}
                        isLoadingCrowd={isLoadingCrowd}
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