import { NextRequest } from 'next/server'
import { z } from 'zod'
import * as themeParksAPI from '@/lib/services/themeparks-api'
import { validateQueryParams, CommonSchemas } from '@/lib/api/validation'
import { successResponse, errorResponse } from '@/lib/api/response'
import { withErrorHandler } from '@/lib/api/error-handler'

// Unified park configuration
interface ParkConfig {
  id: string
  name: string
  slug: string
  areas: Array<{
    id: string
    name: string
    keywords: string[]
    coordinates?: { lat: number; lng: number }
  }>
  specialFeatures?: Record<string, any>
  heightRequirements?: Record<string, string>
}

const PARK_CONFIGS: Record<string, ParkConfig> = {
  'magic-kingdom': {
    id: '1c84a229-8862-4648-9c71-378ddd2c7693',
    name: 'Magic Kingdom',
    slug: 'magic-kingdom',
    areas: [
      { id: 'main-street', name: 'Main Street U.S.A.', keywords: ['main street', 'main st'] },
      { id: 'adventureland', name: 'Adventureland', keywords: ['adventure', 'jungle', 'pirates'] },
      { id: 'frontierland', name: 'Frontierland', keywords: ['frontier', 'splash', 'thunder'] },
      { id: 'liberty-square', name: 'Liberty Square', keywords: ['liberty', 'haunted', 'mansion'] },
      { id: 'fantasyland', name: 'Fantasyland', keywords: ['fantasy', 'castle', 'dumbo', 'tea', 'small world'] },
      { id: 'tomorrowland', name: 'Tomorrowland', keywords: ['tomorrow', 'space', 'buzz', 'monsters'] },
    ]
  },
  'epcot': {
    id: '47f90d2c-e191-4239-a466-5892ef59a88b',
    name: 'EPCOT',
    slug: 'epcot',
    areas: [
      { id: 'world-celebration', name: 'World Celebration', keywords: ['spaceship earth', 'celebration'] },
      { id: 'world-discovery', name: 'World Discovery', keywords: ['discovery', 'guardians', 'test track'] },
      { id: 'world-nature', name: 'World Nature', keywords: ['nature', 'land', 'seas'] },
      { id: 'world-showcase', name: 'World Showcase', keywords: ['showcase', 'mexico', 'norway', 'china', 'germany', 'italy', 'american', 'japan', 'morocco', 'france', 'united kingdom', 'canada'] },
    ]
  },
  'hollywood-studios': {
    id: '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
    name: 'Hollywood Studios',
    slug: 'hollywood-studios',
    areas: [
      { id: 'hollywood-boulevard', name: 'Hollywood Boulevard', keywords: ['hollywood', 'boulevard'] },
      { id: 'sunset-boulevard', name: 'Sunset Boulevard', keywords: ['sunset', 'tower', 'terror', 'rockin'] },
      { id: 'grand-avenue', name: 'Grand Avenue', keywords: ['grand', 'muppets'] },
      { id: 'echo-lake', name: 'Echo Lake', keywords: ['echo', 'indiana', 'star tours'] },
      { id: 'toy-story-land', name: 'Toy Story Land', keywords: ['toy story', 'slinky', 'alien'] },
      { id: 'star-wars-galaxy-edge', name: "Star Wars: Galaxy's Edge", keywords: ['star wars', 'galaxys edge', 'millennium falcon', 'rise of resistance'] },
      { id: 'animation-courtyard', name: 'Animation Courtyard', keywords: ['animation', 'little mermaid', 'disney junior'] },
    ]
  },
  'animal-kingdom': {
    id: '1c84a229-8862-4648-9c71-378ddd2c7693',
    name: 'Animal Kingdom',
    slug: 'animal-kingdom',
    areas: [
      { id: 'oasis', name: 'The Oasis', keywords: ['oasis'] },
      { id: 'discovery-island', name: 'Discovery Island', keywords: ['discovery', 'tree of life'] },
      { id: 'africa', name: 'Africa', keywords: ['africa', 'kilimanjaro', 'safari', 'gorilla'] },
      { id: 'asia', name: 'Asia', keywords: ['asia', 'everest', 'rapids', 'tigers'] },
      { id: 'dinoland', name: 'DinoLand U.S.A.', keywords: ['dino', 'dinosaur', 'primeval'] },
      { id: 'pandora', name: 'Pandora - The World of Avatar', keywords: ['pandora', 'avatar', 'flight of passage', 'navi river'] },
    ]
  }
}

// Unified query schema
const UnifiedParkQuerySchema = z.object({
  type: z.enum(['info', 'live', 'attractions', 'schedule', 'map', 'complete']).default('info'),
  year: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  month: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  includeShowtimes: z.string().transform(val => val === 'true').default('false'),
  includeWaitTimes: z.string().transform(val => val === 'true').default('false'),
  area: z.string().optional(),
})

export function createUnifiedParkHandler(parkSlug: string) {
  return withErrorHandler(async (request: NextRequest) => {
    const parkConfig = PARK_CONFIGS[parkSlug]
    if (!parkConfig) {
      return errorResponse('Park not found', 'PARK_NOT_FOUND', 404)
    }

    const query = validateQueryParams(request, UnifiedParkQuerySchema)
    
    try {
      switch (query.type) {
        case 'info':
          return handleParkInfo(parkConfig, query)
        case 'live':
          return handleLiveData(parkConfig, query)
        case 'attractions':
          return handleAttractions(parkConfig, query)
        case 'schedule':
          return handleSchedule(parkConfig, query)
        case 'map':
          return handleMapData(parkConfig, query)
        case 'complete':
          return handleCompleteData(parkConfig, query)
        default:
          return errorResponse('Invalid type parameter', 'INVALID_TYPE', 400)
      }
    } catch (error) {
      console.error(`Error in unified park handler for ${parkSlug}:`, error)
      return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
    }
  })
}

// Unified helper functions
async function handleParkInfo(config: ParkConfig, query: any) {
  try {
    const parkData = await themeParksAPI.getEntity(config.id)
    
    return successResponse({
      ...parkData,
      parkInfo: {
        ...config.specialFeatures,
        areas: config.areas.map(area => ({
          id: area.id,
          name: area.name,
          coordinates: area.coordinates
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching park info:', error)
    return errorResponse('Failed to fetch park information', 'PARK_INFO_ERROR', 500)
  }
}

async function handleLiveData(config: ParkConfig, query: any) {
  try {
    const liveData = await themeParksAPI.getLiveData(config.id)
    
    // Apply unified filtering logic
    let filteredData = liveData.liveData || []
    
    if (query.includeShowtimes || query.includeWaitTimes) {
      filteredData = liveData.liveData.filter((item: any) => {
        if (query.includeShowtimes && item.showtimes?.length > 0) return true
        if (query.includeWaitTimes && item.queue?.STANDBY?.waitTime !== null) return true
        return false
      })
    }

    if (query.area) {
      filteredData = filteredData.filter((item: any) => 
        getAreaForAttraction(item.name, config.areas) === query.area
      )
    }

    // Unified categorization
    const categorizedData = {
      ...liveData,
      liveData: filteredData,
      summary: {
        totalAttractions: filteredData.length,
        operating: filteredData.filter((item: any) => item.status === 'OPERATING').length,
        closed: filteredData.filter((item: any) => item.status === 'CLOSED').length,
        averageWaitTime: calculateAverageWaitTime(filteredData),
        byArea: categorizeByArea(filteredData, config.areas)
      }
    }

    return successResponse(categorizedData)
  } catch (error) {
    console.error('Error fetching live data:', error)
    return errorResponse('Failed to fetch live data', 'LIVE_DATA_ERROR', 500)
  }
}

async function handleAttractions(config: ParkConfig, query: any) {
  try {
    const liveData = await themeParksAPI.getLiveData(config.id)
    
    const attractions = (liveData.liveData || [])
      .filter((item: any) => item.entityType === 'ATTRACTION')
      .map((attraction: any) => ({
        ...attraction,
        area: getAreaForAttraction(attraction.name, config.areas)
      }))

    return successResponse({
      attractions,
      totalCount: attractions.length,
      areas: config.areas
    })
  } catch (error) {
    console.error('Error fetching attractions:', error)
    return errorResponse('Failed to fetch attractions', 'ATTRACTIONS_ERROR', 500)
  }
}

async function handleSchedule(config: ParkConfig, query: any) {
  try {
    const scheduleData = await themeParksAPI.getSchedule(config.id, {
      year: query.year,
      month: query.month
    })

    return successResponse(scheduleData)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return errorResponse('Failed to fetch schedule', 'SCHEDULE_ERROR', 500)
  }
}

async function handleMapData(config: ParkConfig, query: any) {
  return successResponse({
    parkId: config.id,
    name: config.name,
    areas: config.areas
  })
}

async function handleCompleteData(config: ParkConfig, query: any) {
  try {
    const [parkInfo, liveData, scheduleData] = await Promise.allSettled([
      themeParksAPI.getEntity(config.id),
      themeParksAPI.getLiveData(config.id),
      themeParksAPI.getSchedule(config.id, { year: query.year, month: query.month })
    ])

    return successResponse({
      parkInfo: parkInfo.status === 'fulfilled' ? parkInfo.value : null,
      liveData: liveData.status === 'fulfilled' ? liveData.value : null,
      schedule: scheduleData.status === 'fulfilled' ? scheduleData.value : null,
      areas: config.areas
    })
  } catch (error) {
    console.error('Error fetching complete data:', error)
    return errorResponse('Failed to fetch complete data', 'COMPLETE_DATA_ERROR', 500)
  }
}

// Unified utility functions
function getAreaForAttraction(name: string, areas: ParkConfig['areas']): string {
  const nameLower = name.toLowerCase()
  const matchedArea = areas.find(area => 
    area.keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))
  )
  return matchedArea?.id || 'unknown'
}

function calculateAverageWaitTime(liveData: any[]): number {
  const waitTimes = liveData
    .filter(item => item.queue?.STANDBY?.waitTime !== null && item.queue?.STANDBY?.waitTime > 0)
    .map(item => item.queue.STANDBY.waitTime)

  if (waitTimes.length === 0) return 0
  return Math.round(waitTimes.reduce((acc: number, time: number) => acc + time, 0) / waitTimes.length)
}

function categorizeByArea(liveData: any[], areas: ParkConfig['areas']): Record<string, any[]> {
  return areas.reduce((acc, area) => {
    acc[area.id] = liveData.filter(item => 
      getAreaForAttraction(item.name, areas) === area.id
    )
    return acc
  }, {} as Record<string, any[]>)
}

export { PARK_CONFIGS }