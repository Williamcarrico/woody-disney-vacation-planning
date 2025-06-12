'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useWeatherData } from '@/hooks/useWeatherData'
import {
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
    // State for UI interactions
    const [location, setLocation] = useState<string | WeatherLocation>(initialLocation)
    const [selectedForecastTab, setSelectedForecastTab] = useState<'hourly' | 'daily'>('daily')
    const [selectedForecastItem, setSelectedForecastItem] = useState<string | null>(null)

    // Use the weather data hook with caching
    const {
        realtime: currentWeather,
        forecast,
        isLoading,
        error: hookError,
        isRefetching,
        cacheHit,
        lastUpdated,
        refetch,
        invalidateCache
    } = useWeatherData({
        location,
        units,
        enabled: true,
        refetchInterval: 600000, // 10 minutes
        staleTime: 300000, // 5 minutes
        onError: useCallback((error: Error) => {
            console.error('Weather data fetch error:', error)
        }, []),
        onSuccess: useCallback((data: { realtime: any; forecast: any }) => {
            console.log('Weather data fetched successfully', data)
        }, [])
    })

    // Convert hook error to string for UI
    const error = hookError?.message || null

    // Auto-select first forecast item when forecast data changes
    useEffect(() => {
        if (forecast?.timelines?.daily && forecast.timelines.daily.length > 0 && !selectedForecastItem) {
            setSelectedForecastItem(forecast.timelines.daily[0].time)
        }
    }, [forecast, selectedForecastItem])

    // Use a ref to store the callback to prevent infinite loops
    const onLocationChangeRef = useRef(onLocationChange)
    onLocationChangeRef.current = onLocationChange

    // Separate effect for handling location change callback to avoid infinite loops
    useEffect(() => {
        if (currentWeather?.location && onLocationChangeRef.current) {
            onLocationChangeRef.current({
                lat: currentWeather.location.lat,
                lon: currentWeather.location.lon,
                name: currentWeather.location.name || 'Unknown location'
            })
        }
    }, [currentWeather?.location])

    // Handle location change
    const handleLocationChange = (newLocation: string | WeatherLocation) => {
        setLocation(newLocation)
        setSelectedForecastItem(null) // Reset selected item when location changes
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
    if (isLoading && !currentWeather) {
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
                        {isRefetching && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Refreshing data...
                            </p>
                        )}
                        {error && (
                            <div className="mt-4 space-y-2">
                                <button
                                    onClick={() => refetch()}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={() => {
                                        invalidateCache();
                                        setLocation(initialLocation);
                                    }}
                                    className="block text-sm text-muted-foreground hover:underline"
                                >
                                    Reset location
                                </button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Format location display name
    const locationDisplayName = currentWeather?.location?.name
        ? currentWeather.location.name
        : typeof location === 'string'
            ? location
            : `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Weather</h3>
                        {/* Cache status indicator for development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${cacheHit ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <span>{cacheHit ? 'Cached' : 'Fresh'}</span>
                                {lastUpdated && (
                                    <span>• Updated {Math.floor((Date.now() - lastUpdated) / 1000)}s ago</span>
                                )}
                            </div>
                        )}
                    </div>
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
                    values={currentWeather?.data?.values || {
                        cloudBase: 0,
                        cloudCeiling: 0,
                        cloudCover: 0,
                        dewPoint: 0,
                        freezingRainIntensity: 0,
                        humidity: 0,
                        precipitationProbability: 0,
                        pressureSurfaceLevel: 0,
                        rainIntensity: 0,
                        sleetIntensity: 0,
                        snowIntensity: 0,
                        temperature: 0,
                        temperatureApparent: 0,
                        uvHealthConcern: 0,
                        uvIndex: 0,
                        visibility: 0,
                        weatherCode: 1000,
                        windDirection: 0,
                        windGust: 0,
                        windSpeed: 0
                    }}
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
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
                    Powered by Tomorrow.io
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