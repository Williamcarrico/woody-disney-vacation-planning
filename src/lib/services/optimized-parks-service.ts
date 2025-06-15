/**
 * Optimized Parks Service using unified patterns
 * Consolidates parks-service.ts and firebase/parks-service.ts functionality
 */

import { BaseService, ServiceConfig, QueryOptions, CacheConfigs } from './base-service'
import { DisneyPark, ParkFilters, AttractionFilters, DiningFilters } from '@/types/parks.model'
import * as themeParksAPI from '@/lib/services/themeparks-api'
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit as fbLimit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { z } from 'zod'

// Validation schemas
const ParkQuerySchema = z.object({
  type: z.enum(['basic', 'detailed', 'live']).default('basic'),
  includeAttractions: z.boolean().default(true),
  includeDining: z.boolean().default(true),
  includeSchedule: z.boolean().default(false)
})

const ParkFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  hasAttraction: z.string().optional(),
  hasLand: z.string().optional(),
  operatingStatus: z.enum(['open', 'closed', 'seasonal']).optional()
})

interface EnhancedPark extends DisneyPark {
  liveData?: {
    waitTimes?: any[]
    schedule?: any
    crowdLevel?: number
  }
}

class OptimizedParksService extends BaseService<EnhancedPark> {
  constructor() {
    const config: ServiceConfig<EnhancedPark> = {
      name: 'Parks',
      cache: { ...CacheConfigs.medium, keyPrefix: 'parks' },
      validation: {
        query: ParkQuerySchema
      }
    }
    super(config)
  }

  // Implement abstract methods
  protected async fetchAll(options?: QueryOptions): Promise<EnhancedPark[]> {
    try {
      // Try Firebase first, fallback to ThemeParks API
      const parks = await this.fetchFromFirebase(options)
      
      if (parks.length === 0) {
        console.log('No parks found in Firebase, using fallback data')
        return this.getFallbackParks()
      }

      return parks
    } catch (error) {
      console.error('Error fetching parks from Firebase:', error)
      return this.getFallbackParks()
    }
  }

  protected async fetchById(id: string): Promise<EnhancedPark | null> {
    try {
      // Try Firebase first
      const park = await this.fetchParkFromFirebase(id)
      if (park) return park

      // Fallback to ThemeParks API
      return this.fetchParkFromAPI(id)
    } catch (error) {
      console.error(`Error fetching park ${id}:`, error)
      return null
    }
  }

  protected async createEntity(data: Omit<EnhancedPark, 'id'>): Promise<EnhancedPark> {
    // Implementation for creating parks (admin functionality)
    throw new Error('Creating parks not implemented')
  }

  protected async updateEntity(id: string, data: Partial<EnhancedPark>): Promise<EnhancedPark> {
    // Implementation for updating parks (admin functionality)
    throw new Error('Updating parks not implemented')
  }

  protected async deleteEntity(id: string): Promise<boolean> {
    // Implementation for deleting parks (admin functionality)
    throw new Error('Deleting parks not implemented')
  }

  // Enhanced public methods
  async getParksWithLiveData(filters?: ParkFilters): Promise<EnhancedPark[]> {
    const cacheKey = `live:${JSON.stringify(filters)}`
    
    if (this.config.cache?.enabled) {
      const cached = this.getCacheStats()
      // Check if we have cached data (simplified check)
    }

    try {
      const parks = await this.fetchAll()
      let filteredParks = parks

      // Apply filters
      if (filters) {
        filteredParks = this.applyParkFilters(parks, filters)
      }

      // Enrich with live data
      const enrichedParks = await Promise.all(
        filteredParks.map(async (park) => {
          try {
            const liveData = await this.fetchLiveDataForPark(park.id)
            return { ...park, liveData }
          } catch (error) {
            console.error(`Error fetching live data for park ${park.id}:`, error)
            return park
          }
        })
      )

      return enrichedParks
    } catch (error) {
      console.error('Error in getParksWithLiveData:', error)
      throw error
    }
  }

  async getAttractions(filters: AttractionFilters, options?: QueryOptions): Promise<any[]> {
    try {
      const parkId = filters.parkId
      if (!parkId) {
        throw new Error('Park ID is required for attraction filtering')
      }

      const liveData = await themeParksAPI.getLiveData(parkId)
      let attractions = liveData.liveData?.filter((item: any) => 
        item.entityType === 'ATTRACTION'
      ) || []

      // Apply filters
      if (filters.type) {
        attractions = attractions.filter((attr: any) => 
          attr.type?.toLowerCase() === filters.type?.toLowerCase()
        )
      }

      if (filters.thrillLevel) {
        attractions = attractions.filter((attr: any) => 
          attr.thrillLevel === filters.thrillLevel
        )
      }

      if (filters.heightRequirement !== undefined) {
        attractions = attractions.filter((attr: any) => 
          filters.heightRequirement ? 
            attr.heightRequirement && attr.heightRequirement.inches > 0 :
            !attr.heightRequirement || attr.heightRequirement.inches === 0
        )
      }

      if (filters.lightningLane !== undefined) {
        attractions = attractions.filter((attr: any) => 
          Boolean(attr.lightningLane?.available) === filters.lightningLane
        )
      }

      // Apply sorting and pagination
      if (options?.sortBy) {
        attractions = this.sortData(attractions, options.sortBy, options.sortOrder)
      }

      return this.paginateResults(attractions, options || {}).data
    } catch (error) {
      console.error('Error in getAttractions:', error)
      throw error
    }
  }

  async getDining(filters: DiningFilters, options?: QueryOptions): Promise<any[]> {
    try {
      const parkId = filters.parkId
      if (!parkId) {
        throw new Error('Park ID is required for dining filtering')
      }

      const liveData = await themeParksAPI.getLiveData(parkId)
      let dining = liveData.liveData?.filter((item: any) => 
        item.entityType === 'RESTAURANT' || item.entityType === 'DINING'
      ) || []

      // Apply filters
      if (filters.type) {
        dining = dining.filter((restaurant: any) => {
          const serviceType = this.inferServiceType(restaurant)
          return serviceType === filters.type
        })
      }

      if (filters.characterDining !== undefined) {
        dining = dining.filter((restaurant: any) => 
          Boolean(restaurant.characterDining) === filters.characterDining
        )
      }

      // Apply sorting and pagination
      if (options?.sortBy) {
        dining = this.sortData(dining, options.sortBy, options.sortOrder)
      }

      return this.paginateResults(dining, options || {}).data
    } catch (error) {
      console.error('Error in getDining:', error)
      throw error
    }
  }

  // Private helper methods
  private async fetchFromFirebase(options?: QueryOptions): Promise<EnhancedPark[]> {
    try {
      const parksRef = collection(db, 'parks')
      let q = query(parksRef, orderBy('name'))

      if (options?.limit) {
        q = query(q, fbLimit(options.limit))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnhancedPark))
    } catch (error) {
      console.error('Firebase fetch error:', error)
      return []
    }
  }

  private async fetchParkFromFirebase(id: string): Promise<EnhancedPark | null> {
    try {
      const docRef = doc(db, 'parks', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EnhancedPark
      }
      
      return null
    } catch (error) {
      console.error(`Firebase fetch error for park ${id}:`, error)
      return null
    }
  }

  private async fetchParkFromAPI(id: string): Promise<EnhancedPark | null> {
    try {
      const parkData = await themeParksAPI.getEntity(id)
      if (!parkData) return null

      // Transform API data to our park format
      return {
        id: parkData.id,
        name: parkData.name,
        description: parkData.description || '',
        // Map other fields as needed
        lands: [],
        attractions: [],
        dining: { tableService: [], quickService: [], snacks: [] },
        entertainment: [],
        facilities: [],
        services: [],
        accessibility: {
          overview: '',
          services: {
            das: { available: false, description: '' },
            wheelchairRental: { available: false, locations: [], cost: '' },
            interpreterServices: false,
            brailleGuidebooks: false,
            audioDescription: false
          },
          companionRestrooms: [],
          quietAreas: []
        },
        tips: [],
        transportation: {
          parkingLot: false,
          monorail: false,
          boat: false,
          bus: false,
          skyliner: false,
          walkable: false,
          resortAccess: {}
        },
        parkingInfo: {
          available: false,
          standard: { cost: '', location: '' },
          preferred: { cost: '', location: '' },
          trams: false,
          tips: []
        }
      } as EnhancedPark
    } catch (error) {
      console.error(`API fetch error for park ${id}:`, error)
      return null
    }
  }

  private async fetchLiveDataForPark(parkId: string): Promise<any> {
    try {
      const liveData = await themeParksAPI.getLiveData(parkId)
      return {
        waitTimes: liveData.liveData?.map((item: any) => ({
          id: item.id,
          name: item.name,
          waitTime: item.queue?.STANDBY?.waitTime || 0,
          status: item.status
        })) || [],
        crowdLevel: this.calculateCrowdLevel(liveData.liveData || []),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error fetching live data for park ${parkId}:`, error)
      return null
    }
  }

  private applyParkFilters(parks: EnhancedPark[], filters: ParkFilters): EnhancedPark[] {
    return parks.filter(park => {
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase()
        if (!park.name.toLowerCase().includes(searchTerm) && 
            !park.description.toLowerCase().includes(searchTerm)) {
          return false
        }
      }

      if (filters.hasAttraction) {
        const hasAttraction = park.attractions.some(attraction => 
          attraction.name.toLowerCase().includes(filters.hasAttraction!.toLowerCase())
        )
        if (!hasAttraction) return false
      }

      if (filters.hasLand) {
        const hasLand = park.lands.some(land => 
          land.name.toLowerCase().includes(filters.hasLand!.toLowerCase())
        )
        if (!hasLand) return false
      }

      return true
    })
  }

  private calculateCrowdLevel(liveData: any[]): number {
    if (!liveData || liveData.length === 0) return 1

    const waitTimes = liveData
      .filter(item => item.queue?.STANDBY?.waitTime > 0)
      .map(item => item.queue.STANDBY.waitTime)

    if (waitTimes.length === 0) return 1

    const avgWaitTime = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length
    
    // Convert average wait time to crowd level (1-10)
    if (avgWaitTime < 15) return 1
    if (avgWaitTime < 30) return 3
    if (avgWaitTime < 45) return 5
    if (avgWaitTime < 60) return 7
    if (avgWaitTime < 90) return 8
    return 10
  }

  private inferServiceType(restaurant: any): string {
    // Simple heuristic to determine service type
    const name = restaurant.name?.toLowerCase() || ''
    
    if (name.includes('quick') || name.includes('stand') || name.includes('kiosk')) {
      return 'quickService'
    }
    
    if (name.includes('snack') || name.includes('cart') || name.includes('vendor')) {
      return 'snacks'
    }
    
    return 'tableService'
  }

  private getFallbackParks(): EnhancedPark[] {
    // Return minimal fallback data
    return [
      {
        id: 'magic-kingdom',
        name: 'Magic Kingdom',
        description: 'The Most Magical Place on Earth',
        lands: [],
        attractions: [],
        dining: { tableService: [], quickService: [], snacks: [] },
        entertainment: [],
        facilities: [],
        services: [],
        accessibility: {
          overview: '',
          services: {
            das: { available: false, description: '' },
            wheelchairRental: { available: false, locations: [], cost: '' },
            interpreterServices: false,
            brailleGuidebooks: false,
            audioDescription: false
          },
          companionRestrooms: [],
          quietAreas: []
        },
        tips: [],
        transportation: {
          parkingLot: false,
          monorail: false,
          boat: false,
          bus: false,
          skyliner: false,
          walkable: false,
          resortAccess: {}
        },
        parkingInfo: {
          available: false,
          standard: { cost: '', location: '' },
          preferred: { cost: '', location: '' },
          trams: false,
          tips: []
        }
      }
    ]
  }
}

// Export singleton instance
export const optimizedParksService = new OptimizedParksService()
export default optimizedParksService