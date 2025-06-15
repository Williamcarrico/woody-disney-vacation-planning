'use server'

import { unstable_cache } from 'next/cache'

interface ParkData {
  id: string
  crowdLevel: number
  occupancyPercentage: number
  averageWaitTime: number
}

interface RawParkData {
  id: string
  error?: boolean
  crowdLevel?: number
  waitTimesSummary?: {
    averageWaitTime: number
    operatingAttractions: number
  }
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface WeatherData {
  temperature: number
  condition: string
  weatherCode: number
  humidity: number
  precipitationProbability: number
}

interface HeroGradientData {
  parks: ParkData[]
  weather: WeatherData
  averageCrowdLevel: number
  timestamp: string
  gradient: {
    primary: string
    secondary: string
    accent: string
  }
}

/**
 * Fetch park crowd and weather data for hero gradient
 * Cached for 5 minutes with ISR support
 */
export const getHeroGradientData = unstable_cache(
  async (): Promise<HeroGradientData> => {
    try {
      // Fetch data in parallel for better performance
      const [parksResponse, weatherResponse] = await Promise.all([
        fetch(`${process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000'}/api/unified/parks?includeWaitTimes=true&includeSchedule=false`, {
          next: { revalidate: 300 }, // 5 minutes
        }),
        fetch(`${process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000'}/api/weather/realtime?location=Orlando,FL`, {
          next: { revalidate: 300 }, // 5 minutes
        }),
      ])

      if (!parksResponse.ok || !weatherResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const parksData = await parksResponse.json() as ApiResponse<{ parks: RawParkData[] }>
      const weatherData = await weatherResponse.json() as ApiResponse<{ values: { temperature: number; weatherCode: number; humidity: number; precipitationProbability: number } }>

      // Process park data
      const parks: ParkData[] = parksData.data?.parks
        ?.filter((park: RawParkData) => !park.error && park.waitTimesSummary)
        ?.map((park: RawParkData) => ({
          id: park.id,
          crowdLevel: park.crowdLevel || calculateCrowdLevel(park.waitTimesSummary?.averageWaitTime || 0),
          occupancyPercentage: estimateOccupancy(
            park.waitTimesSummary?.averageWaitTime || 0, 
            park.waitTimesSummary?.operatingAttractions || 0
          ),
          averageWaitTime: park.waitTimesSummary?.averageWaitTime || 0,
        })) || []

      // Process weather data
      const weather: WeatherData = {
        temperature: Math.round(weatherData.data?.values?.temperature || 75),
        condition: getWeatherCondition(weatherData.data?.values?.weatherCode || 1000),
        weatherCode: weatherData.data?.values?.weatherCode || 1000,
        humidity: weatherData.data?.values?.humidity || 50,
        precipitationProbability: weatherData.data?.values?.precipitationProbability || 0,
      }

      // Calculate average crowd level across all parks
      const averageCrowdLevel = parks.length > 0
        ? Math.round(parks.reduce((sum, park) => sum + park.crowdLevel, 0) / parks.length)
        : 5

      // Generate gradient colors based on crowd and weather
      const gradient = calculateGradientColors(averageCrowdLevel, weather)

      return {
        parks,
        weather,
        averageCrowdLevel,
        timestamp: new Date().toISOString(),
        gradient,
      }
    } catch (error) {
      console.error('Error fetching hero gradient data:', error)
      
      // Return fallback data for graceful degradation
      return {
        parks: [],
        weather: {
          temperature: 75,
          condition: 'Clear',
          weatherCode: 1000,
          humidity: 50,
          precipitationProbability: 0,
        },
        averageCrowdLevel: 5,
        timestamp: new Date().toISOString(),
        gradient: {
          primary: 'rgb(59, 130, 246)', // Default blue
          secondary: 'rgb(147, 51, 234)', // Default purple
          accent: 'rgb(236, 72, 153)', // Default pink
        },
      }
    }
  },
  ['hero-gradient-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['hero-gradient'],
  }
)

/**
 * Calculate crowd level from average wait time
 */
function calculateCrowdLevel(averageWaitTime: number): number {
  if (averageWaitTime < 15) return 2
  if (averageWaitTime < 25) return 3
  if (averageWaitTime < 35) return 5
  if (averageWaitTime < 50) return 7
  if (averageWaitTime < 70) return 8
  return 10
}

/**
 * Estimate park occupancy percentage
 */
function estimateOccupancy(averageWaitTime: number, operatingAttractions: number): number {
  const baseOccupancy = Math.min(averageWaitTime * 1.2, 100)
  const attractionFactor = Math.min(operatingAttractions / 25, 1) // Normalize to expected max attractions
  return Math.round(baseOccupancy * attractionFactor)
}

/**
 * Convert weather codes to readable conditions
 */
function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    1000: 'Clear',
    1001: 'Cloudy', 
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    2000: 'Fog',
    4000: 'Drizzle',
    4001: 'Rain',
    4200: 'Light Rain',
    4201: 'Heavy Rain',
    5000: 'Snow',
    5001: 'Flurries',
    5100: 'Light Snow',
    5101: 'Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7101: 'Heavy Ice Pellets',
    7102: 'Light Ice Pellets',
    8000: 'Thunderstorm',
  }
  return conditions[code] || 'Clear'
}

/**
 * Calculate gradient colors based on crowd level and weather
 * Uses color psychology and Disney theming
 */
function calculateGradientColors(crowdLevel: number, weather: WeatherData): {
  primary: string
  secondary: string
  accent: string
} {
  // Base color palette inspired by Disney parks
  const crowdColors = {
    1: { h: 120, s: 60, l: 65 }, // Green - very low crowds
    2: { h: 150, s: 55, l: 60 }, // Teal - low crowds  
    3: { h: 180, s: 50, l: 55 }, // Light blue - light crowds
    4: { h: 210, s: 55, l: 60 }, // Blue - moderate crowds
    5: { h: 240, s: 60, l: 65 }, // Purple-blue - moderate crowds
    6: { h: 270, s: 65, l: 60 }, // Purple - busy
    7: { h: 300, s: 70, l: 55 }, // Magenta - very busy
    8: { h: 330, s: 75, l: 50 }, // Pink-red - extremely busy
    9: { h: 350, s: 80, l: 45 }, // Red - peak crowds
    10: { h: 0, s: 85, l: 40 },  // Deep red - maximum capacity
  }

  // Weather adjustments to hue and saturation
  const weatherAdjustments = {
    Clear: { h: 0, s: 5, l: 5 },
    'Mostly Clear': { h: 10, s: 3, l: 3 },
    'Partly Cloudy': { h: 0, s: 0, l: 0 },
    'Mostly Cloudy': { h: -10, s: -5, l: -3 },
    Cloudy: { h: -15, s: -10, l: -5 },
    Fog: { h: -20, s: -15, l: -10 },
    Drizzle: { h: 200, s: -5, l: -5 },
    Rain: { h: 200, s: -10, l: -10 },
    'Light Rain': { h: 190, s: -5, l: -5 },
    'Heavy Rain': { h: 210, s: -15, l: -15 },
    Snow: { h: 0, s: -30, l: 10 },
    Thunderstorm: { h: 0, s: 20, l: -20 },
  }

  // Get base color for crowd level
  const crowdLevelKey = Math.min(Math.max(crowdLevel, 1), 10) as keyof typeof crowdColors
  const baseColor = crowdColors[crowdLevelKey]
  const weatherAdj = weatherAdjustments[weather.condition as keyof typeof weatherAdjustments] || { h: 0, s: 0, l: 0 }

  // Apply weather adjustments
  const adjustedColor = {
    h: (baseColor.h + weatherAdj.h + 360) % 360,
    s: Math.max(0, Math.min(100, baseColor.s + weatherAdj.s)),
    l: Math.max(20, Math.min(80, baseColor.l + weatherAdj.l)),
  }

  // Temperature influence on warmth/coolness
  const tempInfluence = (weather.temperature - 70) * 0.5 // Neutral at 70°F
  const tempHueShift = Math.max(-30, Math.min(30, tempInfluence))

  // Generate complementary colors
  const primary = {
    h: (adjustedColor.h + tempHueShift + 360) % 360,
    s: adjustedColor.s,
    l: adjustedColor.l,
  }

  const secondary = {
    h: (primary.h + 60) % 360, // Analogous color
    s: Math.max(40, primary.s - 10),
    l: Math.max(30, primary.l - 10),
  }

  const accent = {
    h: (primary.h + 180) % 360, // Complementary color
    s: Math.min(90, primary.s + 15),
    l: Math.min(70, primary.l + 5),
  }

  // Convert HSL to RGB for CSS
  const hslToRgb = (h: number, s: number, l: number): string => {
    const hNorm = h / 360
    const sNorm = s / 100
    const lNorm = l / 100

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1))
    const m = lNorm - c / 2

    let r = 0, g = 0, b = 0

    if (0 <= hNorm && hNorm < 1/6) {
      r = c; g = x; b = 0
    } else if (1/6 <= hNorm && hNorm < 2/6) {
      r = x; g = c; b = 0
    } else if (2/6 <= hNorm && hNorm < 3/6) {
      r = 0; g = c; b = x
    } else if (3/6 <= hNorm && hNorm < 4/6) {
      r = 0; g = x; b = c
    } else if (4/6 <= hNorm && hNorm < 5/6) {
      r = x; g = 0; b = c
    } else if (5/6 <= hNorm && hNorm < 1) {
      r = c; g = 0; b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return `rgb(${r}, ${g}, ${b})`
  }

  return {
    primary: hslToRgb(primary.h, primary.s, primary.l),
    secondary: hslToRgb(secondary.h, secondary.s, secondary.l),
    accent: hslToRgb(accent.h, accent.s, accent.l),
  }
} 