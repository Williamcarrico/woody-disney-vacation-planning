'use client'

import { getWeatherIcon } from '@/lib/api/weather'
import { cn } from '@/lib/utils'
import React from 'react'

interface WeatherIconProps {
    weatherCode: number
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: string
    animate?: boolean
}

/**
 * Dynamic weather icon component that displays appropriate icon based on weather code
 */
function WeatherIcon({
    weatherCode,
    className,
    size = 'md',
    color,
    animate = false
}: WeatherIconProps) {
    const iconName = getWeatherIcon(weatherCode)

    // Get size class based on prop
    const sizeClass = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    }[size]

    // Dynamic import for icons based on the name
    const [Icon, setIcon] = React.useState<React.ElementType | null>(null)

    React.useEffect(() => {
        // Dynamically import the icon based on the weather code
        import('@mdi/js').then((icons) => {
            // Convert kebab case to camel case for mdi icons (e.g., weather-sunny -> mdiWeatherSunny)
            const iconKey = 'mdi' + iconName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')

            if (icons[iconKey]) {
                import('@mdi/react').then((module) => {
                    setIcon(() => module.Icon)
                })
            } else {
                console.warn(`Icon not found: ${iconKey}`)
                // Fallback to a default icon
                import('@mdi/react').then((module) => {
                    setIcon(() => module.Icon)
                })
            }
        })
    }, [iconName])

    // Animation class for certain weather types
    const getAnimationClass = () => {
        if (!animate) return ''

        if (iconName.includes('rain') || iconName.includes('snow')) {
            return 'animate-bounce-slow'
        }

        if (iconName.includes('wind')) {
            return 'animate-shake'
        }

        if (iconName === 'weather-sunny' || iconName.includes('lightning')) {
            return 'animate-pulse'
        }

        return ''
    }

    if (!Icon) {
        return (
            <div className={cn(sizeClass, 'rounded-full bg-gray-200 animate-pulse', className)} />
        )
    }

    return (
        <div className={cn('inline-flex items-center justify-center', getAnimationClass(), className)}>
            <Icon
                path={`@mdi/js/${iconName}`}
                size={size === 'sm' ? 1 : size === 'md' ? 1.5 : size === 'lg' ? 2 : 3}
                color={color || 'currentColor'}
                className={cn(sizeClass)}
            />
        </div>
    )
}

export default WeatherIcon