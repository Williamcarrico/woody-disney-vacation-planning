import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Users, Thermometer, Droplets } from 'lucide-react';

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

interface ParkConditionsCardProps {
    readonly showWeather: boolean;
    readonly showCrowdLevels: boolean;
    readonly weatherData: WeatherData;
    readonly crowdLevelData: CrowdLevelData;
    readonly isLoadingWeather: boolean;
    readonly isLoadingCrowd: boolean;
}

export function ParkConditionsCard({
    showWeather,
    showCrowdLevels,
    weatherData,
    crowdLevelData,
    isLoadingWeather,
    isLoadingCrowd
}: ParkConditionsCardProps) {
    const getCrowdLevelColor = (level: number) => {
        if (level <= 3) return 'bg-green-500 text-white';
        if (level <= 6) return 'bg-amber-500 text-white';
        return 'bg-red-500 text-white';
    };

    const getCrowdLevelText = (level: number) => {
        if (level <= 3) return 'Low';
        if (level <= 6) return 'Moderate';
        return 'High';
    };

    const getWeatherIcon = (condition: string) => {
        if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle')) {
            return <Droplets className="h-4 w-4" />;
        }
        return <Cloud className="h-4 w-4" />;
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-sky-500" />
                    Park Conditions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Weather Section */}
                {showWeather && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">Weather</h4>
                        {isLoadingWeather ? (
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ) : weatherData?.current ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm">Temperature</span>
                                    </div>
                                    <span className="font-medium">{weatherData.current.temperature}°F</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getWeatherIcon(weatherData.current.condition)}
                                        <span className="text-sm">Condition</span>
                                    </div>
                                    <span className="font-medium">{weatherData.current.condition}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">Precipitation</span>
                                    </div>
                                    <span className="font-medium">{weatherData.current.precipitation}%</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Weather data unavailable</p>
                        )}
                    </div>
                )}

                {/* Crowd Levels Section */}
                {showCrowdLevels && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">Crowd Levels</h4>
                        {isLoadingCrowd ? (
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ) : crowdLevelData ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm">Today</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{crowdLevelData.today}/10</span>
                                        <Badge className={`text-xs ${getCrowdLevelColor(crowdLevelData.today)}`}>
                                            {getCrowdLevelText(crowdLevelData.today)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Trend */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Trend</span>
                                    <span className="text-sm font-medium capitalize">{crowdLevelData.trend}</span>
                                </div>

                                {/* Next few days forecast */}
                                {crowdLevelData.forecast && crowdLevelData.forecast.length > 0 && (
                                    <div className="space-y-2">
                                        <h5 className="text-xs font-medium text-muted-foreground">Upcoming Days</h5>
                                        <div className="space-y-1">
                                            {crowdLevelData.forecast.slice(0, 3).map((forecast, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {new Date(forecast.date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{forecast.level}/10</span>
                                                        <div className={`w-2 h-2 rounded-full ${getCrowdLevelColor(forecast.level).replace('text-white', '')}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Crowd data unavailable</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}