'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { fetchRealtimeWeather, fetchWeatherForecast } from '@/lib/api/weather'
import {
    ForecastResponse,
    RealtimeWeatherResponse,
    TemperatureUnit,
    TimelineData,
    WeatherForecastWidgetProps,
    WeatherLocation
} from '@/types/weather'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CurrentWeather from './CurrentWeather'
import WeatherForecastItem from './WeatherForecastItem'
import LocationSearch from './LocationSearch'

/**
 * A comprehensive weather forecast widget that displays current weather conditions
 * and forecasts using the Tomorrow.io API.
 */
function WeatherForecastWidget({
    location: initialLocation = 'Orlando',
    units = 'metric',
    showForecast = true,
    daysToShow = 5,
    className,
    onLocationChange
}: WeatherForecastWidgetProps) {
    // State for holding API data
    const [currentWeather, setCurrentWeather] = useState<RealtimeWeatherResponse | null>(null)
    const [forecast, setForecast] = useState<ForecastResponse | null>(null)
    const [location, setLocation] = useState<string | WeatherLocation>(initialLocation)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedForecastTab, setSelectedForecastTab] = useState<'hourly' | 'daily'>('daily')
    const [selectedForecastItem, setSelectedForecastItem] = useState<string | null>(null)

    // Fetch weather data
    useEffect(() => {
        async function fetchWeatherData() {
            setIsLoading(true)
            setError(null)

            try {
                // Fetch current weather and forecast in parallel
                const [currentRes, forecastRes] = await Promise.all([
                    fetchRealtimeWeather(location, units),
                    fetchWeatherForecast(location, units)
                ])

                setCurrentWeather(currentRes)
                setForecast(forecastRes)

                // Select first item in daily forecast by default
                if (forecastRes?.timelines?.daily && forecastRes.timelines.daily.length > 0) {
                    setSelectedForecastItem(forecastRes.timelines.daily[0].time)
                }

                // Notify parent component of location change if provided
                if (onLocationChange && currentRes.location) {
                    onLocationChange({
                        lat: currentRes.location.lat,
                        lon: currentRes.location.lon,
                        name: currentRes.location.name
                    })
                }
            } catch (err) {
                console.error('Error fetching weather data:', err)
                setError('Unable to fetch weather data. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchWeatherData()
    }, [location, units, onLocationChange])

    // Handle location change
    const handleLocationChange = (newLocation: string | WeatherLocation) => {
        setLocation(newLocation)
    }

    // Functions to limit and extract forecast data
    const getDailyForecast = () => {
        if (!forecast?.timelines?.daily) return []
        return forecast.timelines.daily.slice(0, daysToShow)
    }

    const getHourlyForecast = () => {
        if (!forecast?.timelines?.hourly) return []

        // Get the next 24 hours
        return forecast.timelines.hourly.slice(0, 24)
    }

    // Handle forecast item selection
    const handleForecastItemClick = (item: TimelineData) => {
        setSelectedForecastItem(item.time)
    }

    // Render loading state
    if (isLoading) {
        return (
            <Card className={cn('overflow-hidden', className)}>
                <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        <Skeleton className="h-32 w-full" />
                        {showForecast && <Skeleton className="h-24 w-full" />}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Render error state
    if (error || !currentWeather) {
        return (
            <Card className={cn('overflow-hidden', className)}>
                <CardContent className="py-6">
                    <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="material-icons-outlined text-4xl text-destructive mb-2">
                            error_outline
                        </span>
                        <h3 className="text-lg font-semibold">Weather Unavailable</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {error || 'Unable to load weather data'}
                        </p>
                        {location && (
                            <button
                                onClick={() => setLocation(initialLocation)}
                                className="mt-4 text-sm text-primary hover:underline"
                            >
                                Reset location
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Format location display name
    const locationDisplayName = typeof currentWeather.location.name === 'string'
        ? currentWeather.location.name
        : typeof location === 'string'
            ? location
            : `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Weather</h3>
                    <LocationSearch
                        defaultLocation={locationDisplayName}
                        onLocationSelect={handleLocationChange}
                    />
                </div>
            </CardHeader>

            <CardContent className="pb-4">
                {/* Current weather section */}
                <CurrentWeather
                    location={locationDisplayName}
                    values={currentWeather.data.values}
                    units={units}
                />

                {/* Forecast section */}
                {showForecast && forecast && (
                    <div className="mt-6">
                        <Tabs value={selectedForecastTab} onValueChange={(v) => setSelectedForecastTab(v as 'hourly' | 'daily')}>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-md font-semibold">Forecast</h4>
                                <TabsList className="h-8">
                                    <TabsTrigger value="daily" className="text-xs px-2 py-1">Daily</TabsTrigger>
                                    <TabsTrigger value="hourly" className="text-xs px-2 py-1">Hourly</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="daily" className="m-0">
                                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
                                    {getDailyForecast().map((item) => (
                                        <WeatherForecastItem
                                            key={item.time}
                                            timestamp={item.time}
                                            values={item.values}
                                            units={units}
                                            type="daily"
                                            isSelected={item.time === selectedForecastItem}
                                            onClick={() => handleForecastItemClick(item)}
                                            className="min-w-[80px] flex-shrink-0"
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="hourly" className="m-0">
                                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
                                    {getHourlyForecast().map((item) => (
                                        <WeatherForecastItem
                                            key={item.time}
                                            timestamp={item.time}
                                            values={item.values}
                                            units={units}
                                            type="hourly"
                                            isSelected={item.time === selectedForecastItem}
                                            onClick={() => handleForecastItemClick(item)}
                                            className="min-w-[70px] flex-shrink-0"
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Weather details section for selected forecast item */}
                        {selectedForecastItem && (
                            <div className="mt-4 pt-4 border-t">
                                <WeatherDetails
                                    item={
                                        (selectedForecastTab === 'daily'
                                            ? getDailyForecast().find(item => item.time === selectedForecastItem)
                                            : getHourlyForecast().find(item => item.time === selectedForecastItem)) || null
                                    }
                                    units={units}
                                    type={selectedForecastTab}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Attribution */}
                <div className="text-xs text-muted-foreground mt-4 text-center">
                    Powered by <a
                        href="https://www.tomorrow.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary transition-colors"
                    >
                        Tomorrow.io
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}

interface WeatherDetailsProps {
    item: TimelineData | null
    units: TemperatureUnit
    type: 'daily' | 'hourly'
}

function WeatherDetails({ item, units, type }: WeatherDetailsProps) {
    if (!item) return null

    const values = item.values
    const precipitation = values.precipitationProbability !== undefined
        ? `${Math.round(values.precipitationProbability)}%`
        : '0%'

    const windSpeed = values.windSpeed !== undefined
        ? `${Math.round(values.windSpeed)} ${units === 'metric' ? 'km/h' : 'mph'}`
        : 'N/A'

    const humidity = values.humidity !== undefined
        ? `${Math.round(values.humidity)}%`
        : 'N/A'

    const uvIndex = values.uvIndex !== undefined
        ? values.uvIndex.toString()
        : 'N/A'

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
                <div className="text-muted-foreground text-xs">Precipitation</div>
                <div className="font-medium">{precipitation}</div>
            </div>

            <div>
                <div className="text-muted-foreground text-xs">Wind</div>
                <div className="font-medium">{windSpeed}</div>
            </div>

            <div>
                <div className="text-muted-foreground text-xs">Humidity</div>
                <div className="font-medium">{humidity}</div>
            </div>

            <div>
                <div className="text-muted-foreground text-xs">UV Index</div>
                <div className="font-medium">{uvIndex}</div>
            </div>

            {type === 'daily' && values.sunriseTime && values.sunsetTime && (
                <>
                    <div>
                        <div className="text-muted-foreground text-xs">Sunrise</div>
                        <div className="font-medium">
                            {new Date(values.sunriseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    <div>
                        <div className="text-muted-foreground text-xs">Sunset</div>
                        <div className="font-medium">
                            {new Date(values.sunsetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default WeatherForecastWidget