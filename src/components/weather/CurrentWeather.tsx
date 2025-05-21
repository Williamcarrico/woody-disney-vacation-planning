'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { formatTemperature, getWeatherDescription } from '@/lib/api/weather'
import { RealtimeWeatherValues, TemperatureUnit } from '@/types/weather'
import WeatherIcon from './WeatherIcon'

interface CurrentWeatherProps {
    location: string
    values: RealtimeWeatherValues
    units: TemperatureUnit
    className?: string
}

function CurrentWeather({
    location,
    values,
    units,
    className
}: CurrentWeatherProps) {
    const weatherDescription = getWeatherDescription(values.weatherCode)

    return (
        <div className={cn('flex flex-col p-5 rounded-xl bg-card shadow-sm', className)}>
            <div className="text-lg font-semibold mb-2">{location}</div>

            <div className="flex items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-1">
                        <div className="text-4xl font-bold">{formatTemperature(values.temperature, units)}</div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Feels like {formatTemperature(values.temperatureApparent, units)}
                    </div>

                    <div className="text-base font-medium mt-1">{weatherDescription}</div>
                </div>

                <div className="flex-shrink-0">
                    <WeatherIcon
                        weatherCode={values.weatherCode}
                        size="lg"
                        animate={true}
                        className="mr-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <WeatherDetail
                    icon="water_drop"
                    label="Humidity"
                    value={`${Math.round(values.humidity)}%`}
                />

                <WeatherDetail
                    icon="air"
                    label="Wind"
                    value={`${Math.round(values.windSpeed)} ${units === 'metric' ? 'km/h' : 'mph'}`}
                />

                <WeatherDetail
                    icon="visibility"
                    label="Visibility"
                    value={`${Math.round(values.visibility)} ${units === 'metric' ? 'km' : 'mi'}`}
                />

                <WeatherDetail
                    icon="wb_sunny"
                    label="UV Index"
                    value={getUVIndexDescription(values.uvIndex)}
                />
            </div>
        </div>
    )
}

interface WeatherDetailProps {
    icon: string
    label: string
    value: string
}

function WeatherDetail({ icon, label, value }: WeatherDetailProps) {
    return (
        <div className="flex flex-col items-start">
            <div className="flex items-center">
                <span className="material-icons-outlined text-lg mr-1">{icon}</span>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
            <div className="font-medium text-sm ml-5 mt-1">{value}</div>
        </div>
    )
}

function getUVIndexDescription(uvIndex: number): string {
    if (uvIndex <= 2) return 'Low'
    if (uvIndex <= 5) return 'Moderate'
    if (uvIndex <= 7) return 'High'
    if (uvIndex <= 10) return 'Very High'
    return 'Extreme'
}

export default CurrentWeather