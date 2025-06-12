import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Sun, Cloud, CloudRain, CloudSnow, CloudLightning,
    Wind, Droplets, Eye, Thermometer, Umbrella,
    AlertTriangle
} from "lucide-react"

// Utils
import { cn } from "@/lib/utils"

interface WeatherWidgetProps {
    weatherData?: any
}

function getWeatherIcon(weatherCode: number, size: string = "h-6 w-6") {
    if (weatherCode >= 8000) return <CloudLightning className={cn(size, "text-purple-500")} />
    if (weatherCode >= 5000) return <CloudSnow className={cn(size, "text-blue-300")} />
    if (weatherCode >= 4000) return <CloudRain className={cn(size, "text-blue-500")} />
    if (weatherCode >= 2000) return <Cloud className={cn(size, "text-gray-400")} />
    if (weatherCode >= 1100) return <Cloud className={cn(size, "text-gray-500")} />
    return <Sun className={cn(size, "text-yellow-500")} />
}

function getWeatherDescription(weatherCode: number): string {
    const descriptions: Record<number, string> = {
        1000: "Clear",
        1100: "Mostly Clear",
        1101: "Partly Cloudy",
        1102: "Mostly Cloudy",
        1001: "Cloudy",
        2000: "Fog",
        2100: "Light Fog",
        4000: "Drizzle",
        4001: "Rain",
        4200: "Light Rain",
        4201: "Heavy Rain",
        5000: "Snow",
        5001: "Flurries",
        5100: "Light Snow",
        5101: "Heavy Snow",
        6000: "Freezing Drizzle",
        6001: "Freezing Rain",
        6200: "Light Freezing Rain",
        6201: "Heavy Freezing Rain",
        7000: "Ice Pellets",
        7101: "Heavy Ice Pellets",
        7102: "Light Ice Pellets",
        8000: "Thunderstorm"
    }

    return descriptions[weatherCode] || "Unknown"
}

function getUvIndexLevel(uvIndex: number): { level: string; color: string; advice: string } {
    if (uvIndex <= 2) return { level: "Low", color: "text-green-600", advice: "No protection needed" }
    if (uvIndex <= 5) return { level: "Moderate", color: "text-yellow-600", advice: "Seek shade during midday" }
    if (uvIndex <= 7) return { level: "High", color: "text-orange-600", advice: "Wear sunscreen & hat" }
    if (uvIndex <= 10) return { level: "Very High", color: "text-red-600", advice: "Extra protection needed" }
    return { level: "Extreme", color: "text-purple-600", advice: "Avoid sun exposure" }
}

async function getWeatherForecast() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/weather/forecast?location=Orlando,FL&days=5`,
            {
                next: { revalidate: 600 } // Cache for 10 minutes
            }
        )

        if (!response.ok) return null

        return await response.json()
    } catch (error) {
        console.error("Error fetching weather forecast:", error)
        return null
    }
}

export default async function WeatherWidget({ weatherData }: WeatherWidgetProps) {
    const forecast = await getWeatherForecast()

    if (!weatherData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Weather
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Weather data unavailable
                    </p>
                </CardContent>
            </Card>
        )
    }

    const current = weatherData.data.values
    const uvInfo = getUvIndexLevel(current.uvIndex)
    const feelsLike = Math.round(current.temperatureApparent)
    const isRainy = current.weatherCode >= 4000 && current.weatherCode < 5000
    const needsUmbrella = isRainy || current.precipitationProbability > 30

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        {getWeatherIcon(current.weatherCode, "h-5 w-5")}
                        Weather
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        Live
                    </Badge>
                </div>
                <CardDescription>
                    Walt Disney World Resort
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Current Weather */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-4">
                        {getWeatherIcon(current.weatherCode, "h-12 w-12")}
                        <div className="text-left">
                            <div className="text-3xl font-bold">
                                {Math.round(current.temperature)}°F
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {getWeatherDescription(current.weatherCode)}
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        Feels like {feelsLike}°F
                    </div>

                    {needsUmbrella && (
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <Umbrella className="h-4 w-4" />
                            <span>Bring an umbrella</span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="font-medium">{Math.round(current.humidity)}%</div>
                            <div className="text-xs text-muted-foreground">Humidity</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <div>
                            <div className="font-medium">{Math.round(current.windSpeed)} mph</div>
                            <div className="text-xs text-muted-foreground">Wind</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-orange-500" />
                        <div>
                            <div className={cn("font-medium", uvInfo.color)}>
                                UV {current.uvIndex}
                            </div>
                            <div className="text-xs text-muted-foreground">{uvInfo.level}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <div>
                            <div className="font-medium">{Math.round(current.dewPoint)}°F</div>
                            <div className="text-xs text-muted-foreground">Dew Point</div>
                        </div>
                    </div>
                </div>

                {/* UV Advisory */}
                {current.uvIndex >= 6 && (
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                                    High UV Alert
                                </p>
                                <p className="text-xs text-orange-700 dark:text-orange-300">
                                    {uvInfo.advice}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5-Day Forecast */}
                {forecast && forecast.timelines?.daily && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">5-Day Forecast</h4>
                            <div className="space-y-1">
                                {forecast.timelines.daily.slice(0, 5).map((day: any, index: number) => {
                                    const date = new Date(day.time)
                                    const dayName = index === 0 ? "Today" :
                                        index === 1 ? "Tomorrow" :
                                            date.toLocaleDateString('en-US', { weekday: 'short' })

                                    return (
                                        <div key={index} className="flex items-center justify-between py-1.5 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium w-12">{dayName}</span>
                                                {getWeatherIcon(day.values.weatherCodeMax, "h-4 w-4")}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="text-muted-foreground">
                                                    {Math.round(day.values.temperatureMin)}°
                                                </span>
                                                <div className="w-12 h-1 bg-gradient-to-r from-blue-300 to-orange-300 rounded-full" />
                                                <span className="font-medium">
                                                    {Math.round(day.values.temperatureMax)}°
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}