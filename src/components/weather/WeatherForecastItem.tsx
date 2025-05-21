'use client'

import React from 'react'
import { ForecastValues, TemperatureUnit } from '@/types/weather'
import { formatTemperature } from '@/lib/api/weather'
import WeatherIcon from './WeatherIcon'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

interface WeatherForecastItemProps {
    timestamp: string
    values: ForecastValues
    units: TemperatureUnit
    type: 'daily' | 'hourly'
    isSelected?: boolean
    onClick?: () => void
    className?: string
}

function WeatherForecastItem({
    timestamp,
    values,
    units,
    type,
    isSelected = false,
    onClick,
    className
}: WeatherForecastItemProps) {
    const date = parseISO(timestamp)

    // Format label based on forecast type
    const timeLabel = type === 'daily'
        ? format(date, 'EEE')  // Mon, Tue, etc.
        : format(date, 'h a')  // 1 PM, 2 PM, etc.

    // Determine which temperature to display
    const displayTemperature = type === 'daily'
        ? values.temperatureMax !== undefined
            ? formatTemperature(values.temperatureMax, units)
            : '—'
        : values.temperature !== undefined
            ? formatTemperature(values.temperature, units)
            : '—'

    // Format secondary temperature (daily low or feels like)
    const secondaryTemperature = type === 'daily'
        ? values.temperatureMin !== undefined
            ? formatTemperature(values.temperatureMin, units)
            : '—'
        : values.temperatureApparent !== undefined
            ? `Feels: ${formatTemperature(values.temperatureApparent, units)}`
            : undefined

    // Format precipitation probability if available
    const precipProb = values.precipitationProbability !== undefined
        ? `${Math.round(values.precipitationProbability)}%`
        : undefined

    return (
        <div
            className={cn(
                'p-3 rounded-lg transition-all cursor-pointer',
                isSelected
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50 border border-transparent',
                className
            )}
            onClick={onClick}
        >
            <div className="flex flex-col items-center space-y-2">
                <div className="text-sm font-medium">{timeLabel}</div>

                <WeatherIcon
                    weatherCode={values.weatherCode || 1000}
                    size={type === 'daily' ? 'md' : 'sm'}
                    animate={isSelected}
                />

                <div className="text-base font-semibold">{displayTemperature}</div>

                {secondaryTemperature && (
                    <div className="text-xs text-muted-foreground">{secondaryTemperature}</div>
                )}

                {precipProb && (
                    <div className="flex items-center text-xs text-blue-500">
                        <span className="material-icons-outlined text-xs mr-1">water_drop</span>
                        {precipProb}
                    </div>
                )}
            </div>
        </div>
    )
}

export default WeatherForecastItem