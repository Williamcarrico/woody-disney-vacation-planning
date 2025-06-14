'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { getHeroGradientData } from '@/app/actions/hero-gradient'

interface HeroGradientData {
  parks: Array<{
    id: string
    crowdLevel: number
    occupancyPercentage: number
    averageWaitTime: number
  }>
  weather: {
    temperature: number
    condition: string
    weatherCode: number
    humidity: number
    precipitationProbability: number
  }
  averageCrowdLevel: number
  timestamp: string
  gradient: {
    primary: string
    secondary: string
    accent: string
  }
}

interface LiveGradientContextType {
  gradientData: HeroGradientData | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

const LiveGradientContext = createContext<LiveGradientContextType>({
  gradientData: null,
  isLoading: true,
  error: null,
  lastUpdated: null,
})

export const useLiveGradient = () => {
  const context = useContext(LiveGradientContext)
  if (!context) {
    throw new Error('useLiveGradient must be used within a LiveGradientProvider')
  }
  return context
}

interface LiveGradientProviderProps {
  children: React.ReactNode
  initialData?: HeroGradientData
}

export function LiveGradientProvider({ children, initialData }: LiveGradientProviderProps) {
  const [gradientData, setGradientData] = useState<HeroGradientData | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(initialData ? new Date() : null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update CSS variables when gradient data changes
  useEffect(() => {
    if (gradientData?.gradient) {
      const root = document.documentElement
      
      // Set CSS custom properties for the gradient
      root.style.setProperty('--hero-gradient-primary', gradientData.gradient.primary)
      root.style.setProperty('--hero-gradient-secondary', gradientData.gradient.secondary)
      root.style.setProperty('--hero-gradient-accent', gradientData.gradient.accent)
      
      // Create color-mix variations for better blending
      root.style.setProperty(
        '--hero-gradient-primary-light',
        `color-mix(in srgb, ${gradientData.gradient.primary} 70%, white 30%)`
      )
      root.style.setProperty(
        '--hero-gradient-secondary-light', 
        `color-mix(in srgb, ${gradientData.gradient.secondary} 70%, white 30%)`
      )
      root.style.setProperty(
        '--hero-gradient-accent-light',
        `color-mix(in srgb, ${gradientData.gradient.accent} 70%, white 30%)`
      )
      
      // Create darker variants for depth
      root.style.setProperty(
        '--hero-gradient-primary-dark',
        `color-mix(in srgb, ${gradientData.gradient.primary} 80%, black 20%)`
      )
      root.style.setProperty(
        '--hero-gradient-secondary-dark',
        `color-mix(in srgb, ${gradientData.gradient.secondary} 80%, black 20%)`
      )
      root.style.setProperty(
        '--hero-gradient-accent-dark',
        `color-mix(in srgb, ${gradientData.gradient.accent} 80%, black 20%)`
      )

      // Intensity based on crowd level (0-100)
      const intensity = Math.min(100, gradientData.averageCrowdLevel * 10)
      root.style.setProperty('--hero-gradient-intensity', intensity.toString())
      
      // Weather-based opacity modifiers
      const weatherOpacity = getWeatherOpacity(gradientData.weather.condition)
      root.style.setProperty('--hero-gradient-weather-opacity', weatherOpacity.toString())
      
      // Temperature-based saturation
      const tempSaturation = getTemperatureSaturation(gradientData.weather.temperature)
      root.style.setProperty('--hero-gradient-temp-saturation', tempSaturation.toString())
    }
  }, [gradientData])

  // Fetch gradient data
  const fetchGradientData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await getHeroGradientData()
      
      setGradientData(data)
      setLastUpdated(new Date())
      
      // Log the update for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 Hero gradient updated:', {
          averageCrowdLevel: data.averageCrowdLevel,
          weather: data.weather.condition,
          temperature: data.weather.temperature,
          colors: data.gradient,
          timestamp: data.timestamp,
        })
      }
    } catch (err) {
      console.error('Error fetching gradient data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch gradient data')
    } finally {
      setIsLoading(false)
    }
  }

  // Set up polling interval
  useEffect(() => {
    // Fetch immediately if no initial data
    if (!initialData) {
      fetchGradientData()
    }

    // Set up 5-minute polling interval
    intervalRef.current = setInterval(() => {
      fetchGradientData()
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup CSS variables on unmount
  useEffect(() => {
    return () => {
      const root = document.documentElement
      const variablesToClean = [
        '--hero-gradient-primary',
        '--hero-gradient-secondary', 
        '--hero-gradient-accent',
        '--hero-gradient-primary-light',
        '--hero-gradient-secondary-light',
        '--hero-gradient-accent-light',
        '--hero-gradient-primary-dark',
        '--hero-gradient-secondary-dark',
        '--hero-gradient-accent-dark',
        '--hero-gradient-intensity',
        '--hero-gradient-weather-opacity',
        '--hero-gradient-temp-saturation',
      ]
      
      variablesToClean.forEach(variable => {
        root.style.removeProperty(variable)
      })
    }
  }, [])

  const contextValue: LiveGradientContextType = {
    gradientData,
    isLoading,
    error,
    lastUpdated,
  }

  return (
    <LiveGradientContext.Provider value={contextValue}>
      {children}
    </LiveGradientContext.Provider>
  )
}

/**
 * Get weather-based opacity modifier (0-1)
 */
function getWeatherOpacity(condition: string): number {
  const opacityMap = {
    'Clear': 1.0,
    'Mostly Clear': 0.95,
    'Partly Cloudy': 0.9,
    'Mostly Cloudy': 0.8,
    'Cloudy': 0.75,
    'Fog': 0.6,
    'Drizzle': 0.85,
    'Light Rain': 0.8,
    'Rain': 0.7,
    'Heavy Rain': 0.6,
    'Snow': 0.9,
    'Thunderstorm': 0.5,
  }
  
  return opacityMap[condition as keyof typeof opacityMap] || 0.85
}

/**
 * Get temperature-based saturation modifier (0.5-1.5)
 */
function getTemperatureSaturation(temperature: number): number {
  // Base temperature around 70°F = 1.0 saturation
  // Hot temperatures increase saturation (more vibrant)
  // Cold temperatures decrease saturation (more muted)
  
  const baseTemp = 70
  const tempDiff = temperature - baseTemp
  
  // Scale factor: ±30°F = ±0.3 saturation
  const saturationDiff = tempDiff * 0.01
  
  // Clamp between 0.5 and 1.5
  return Math.max(0.5, Math.min(1.5, 1.0 + saturationDiff))
}

/**
 * Hook for accessing gradient CSS variables in components
 */
export function useGradientStyles() {
  const { gradientData } = useLiveGradient()
  
  if (!gradientData) {
    return {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(147, 51, 234)',
      accent: 'rgb(236, 72, 153)',
    }
  }
  
  return {
    primary: 'var(--hero-gradient-primary)',
    secondary: 'var(--hero-gradient-secondary)',
    accent: 'var(--hero-gradient-accent)',
    primaryLight: 'var(--hero-gradient-primary-light)',
    secondaryLight: 'var(--hero-gradient-secondary-light)',
    accentLight: 'var(--hero-gradient-accent-light)',
    primaryDark: 'var(--hero-gradient-primary-dark)',
    secondaryDark: 'var(--hero-gradient-secondary-dark)',
    accentDark: 'var(--hero-gradient-accent-dark)',
  }
} 