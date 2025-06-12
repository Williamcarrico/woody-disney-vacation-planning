/**
 * Compatibility layer for migrating from old themeParks.ts to new themeparks-api.ts
 * This provides the same interface as the old module but uses the new API service
 */

import * as themeParksAPI from '@/lib/services/themeparks-api'
import type {
    Destination,
    Park,
    Attraction,
    LiveData,
    ScheduleData
} from '@/types/api'
import type {
    LiveDataResponse,
    ScheduleResponse,
    ThemeParksEntity,
    ThemeParksPark,
    ChildrenResponse
} from '@/types/themeparks'

/**
 * Convert new LiveDataResponse to old LiveData format
 */
function convertLiveData(response: LiveDataResponse): LiveData {
    const attractions: LiveData['attractions'] = {}

    response.liveData.forEach(item => {
        if (item.entityType === 'ATTRACTION') {
            attractions[item.id] = {
                id: item.id,
                name: item.name,
                status: item.status || 'CLOSED',
                waitTime: {
                    standby: item.queue?.STANDBY?.waitTime ?? null,
                    returnTime: item.queue?.RETURN_TIME ? {
                        state: item.queue.RETURN_TIME.state,
                        returnStart: item.queue.RETURN_TIME.returnStart,
                        returnEnd: item.queue.RETURN_TIME.returnEnd
                    } : undefined,
                    paidReturnTime: item.queue?.PAID_RETURN_TIME ? {
                        state: item.queue.PAID_RETURN_TIME.state,
                        price: item.queue.PAID_RETURN_TIME.price,
                        returnStart: item.queue.PAID_RETURN_TIME.returnStart,
                        returnEnd: item.queue.PAID_RETURN_TIME.returnEnd
                    } : undefined
                },
                lastUpdate: response.lastUpdate
            }
        }
    })

    return {
        attractions,
        lastUpdate: response.lastUpdate,
        parkId: response.id
    }
}

/**
 * Convert new ScheduleResponse to old ScheduleData format
 */
function convertScheduleData(response: ScheduleResponse): ScheduleData {
    return {
        parkId: response.id,
        schedule: response.schedule.map(entry => ({
            date: entry.date,
            openingTime: entry.openingTime,
            closingTime: entry.closingTime,
            type: entry.type,
            specialHours: entry.specialHours
        }))
    }
}

/**
 * Convert ThemeParksEntity to Attraction
 */
function convertToAttraction(entity: ThemeParksEntity): Attraction {
    return {
        id: entity.id,
        name: entity.name,
        slug: entity.slug || '',
        entityType: 'ATTRACTION',
        parkId: entity.parentId || '',
        attractionType: 'RIDE', // Default, as the new API doesn't provide this
        location: entity.location,
        status: 'OPERATING' // Default status
    }
}

/**
 * Get Disney destinations (compatibility function)
 */
export const getDisneyDestinations = async (): Promise<Destination[]> => {
    const destinations = await themeParksAPI.getDisneyDestinations()
    return destinations.map(dest => ({
        ...dest,
        parks: [] // Parks would need to be fetched separately
    })) as unknown as Destination[]
}

/**
 * Get Walt Disney World parks (compatibility function)
 */
export const getWaltDisneyWorldParks = async (): Promise<Park[]> => {
    const children = await themeParksAPI.getWaltDisneyWorldChildren()
    return children.children
        .filter(child => child.entityType === 'PARK')
        .map(park => ({
            ...park,
            destination: park.parentId || '',
            timezone: 'America/New_York'
        })) as unknown as Park[]
}

/**
 * Get park attractions (compatibility function)
 */
export const getParkAttractions = async (parkId: string): Promise<Attraction[]> => {
    const children = await themeParksAPI.getParkAttractionsBySlug(parkId)
    return children.children
        .filter(child => child.entityType === 'ATTRACTION')
        .map(convertToAttraction)
}

/**
 * Get park live data (compatibility function)
 */
export const getParkLiveData = async (parkId: string): Promise<LiveData> => {
    const liveData = await themeParksAPI.getParkLiveDataBySlug(parkId)
    return convertLiveData(liveData)
}

/**
 * Get park schedule (compatibility function)
 */
export const getParkSchedule = async (
    parkId: string,
    startDate?: string,
    endDate?: string
): Promise<ScheduleData> => {
    // Parse dates if provided
    let year: number | undefined
    let month: number | undefined

    if (startDate) {
        const date = new Date(startDate)
        year = date.getFullYear()
        month = date.getMonth() + 1
    }

    const schedule = await themeParksAPI.getParkScheduleBySlug(parkId, year, month)
    return convertScheduleData(schedule)
}

/**
 * Get park details (compatibility function)
 */
export const getPark = async (parkId: string): Promise<Park> => {
    const park = await themeParksAPI.getParkBySlug(parkId) as ThemeParksPark
    return {
        ...park,
        destination: park.destinationId
    } as unknown as Park
}

/**
 * Get attraction historical data (stub - not available in new API)
 */
export const getAttractionHistoricalData = async (
    attractionId: string,
    startDate: string,
    endDate: string
): Promise<any[]> => {
    console.warn('Historical data not available in new API')
    return []
}

// Default export for compatibility
export default {
    getDisneyDestinations,
    getWaltDisneyWorldParks,
    getPark,
    getParkAttractions,
    getParkLiveData,
    getParkSchedule,
    getAttractionHistoricalData
}