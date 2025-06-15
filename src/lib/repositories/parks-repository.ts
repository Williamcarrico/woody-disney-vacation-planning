/**
 * Advanced Parks Repository
 * Domain-specific repository with sophisticated Disney park data management
 */

import { z } from 'zod'
import { 
  AdvancedFirestoreRepository, 
  QueryOptions, 
  WhereFilter,
  PaginatedResult
} from '@/lib/database/advanced-repository-system'

// Comprehensive Park schema
const ParkSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
    zipCode: z.string(),
    timezone: z.string()
  }),
  operatingHours: z.object({
    regular: z.object({
      open: z.string(),
      close: z.string()
    }),
    extraMagicHours: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
    }).optional(),
    seasonal: z.array(z.object({
      startDate: z.string(),
      endDate: z.string(),
      open: z.string(),
      close: z.string(),
      description: z.string().optional()
    })).optional()
  }),
  capacity: z.object({
    max: z.number(),
    comfortable: z.number(),
    current: z.number().optional()
  }),
  areas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    imageUrl: z.string().optional(),
    attractions: z.array(z.string()), // Attraction IDs
    restaurants: z.array(z.string()), // Restaurant IDs
    shops: z.array(z.string()).optional()
  })),
  amenities: z.array(z.string()),
  accessibility: z.array(z.string()),
  pricing: z.object({
    adult: z.number(),
    child: z.number(),
    senior: z.number().optional(),
    parkHopper: z.number().optional()
  }),
  crowdCalendar: z.array(z.object({
    date: z.string(),
    expectedCrowdLevel: z.enum(['low', 'medium', 'high']),
    events: z.array(z.string()).optional()
  })).optional(),
  transportation: z.array(z.object({
    type: z.enum(['monorail', 'boat', 'bus', 'skyliner', 'walking']),
    destination: z.string(),
    duration: z.number(), // minutes
    schedule: z.object({
      frequency: z.number(), // minutes between departures
      firstDeparture: z.string(),
      lastDeparture: z.string()
    }).optional()
  })),
  metadata: z.object({
    imageUrl: z.string().optional(),
    heroImageUrl: z.string().optional(),
    iconUrl: z.string().optional(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    newFeatures: z.array(z.string()).optional()
  }),
  statistics: z.object({
    totalAttractions: z.number(),
    totalRestaurants: z.number(),
    avgWaitTime: z.number().optional(),
    visitorRating: z.number().optional(),
    popularityScore: z.number().optional()
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Park = z.infer<typeof ParkSchema>

// Park-specific query interfaces
export interface ParkQueryOptions extends QueryOptions<Park> {
  includeCrowdLevel?: boolean
  includeRealTimeData?: boolean
  includeWeather?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface ParkSearchOptions {
  query?: string
  amenities?: string[]
  accessibility?: string[]
  crowdLevel?: 'low' | 'medium' | 'high'
  priceRange?: {
    min: number
    max: number
  }
  includeCapacityInfo?: boolean
}

export interface ParkRealtimeData {
  parkId: string
  currentCapacity: number
  waitTimesLastUpdated: string
  weatherConditions: {
    temperature: number
    condition: string
    precipitation: number
    windSpeed: number
  }
  operationalStatus: 'open' | 'closed' | 'delayed' | 'partial'
  alerts: Array<{
    id: string
    type: 'weather' | 'attraction' | 'capacity' | 'general'
    message: string
    severity: 'low' | 'medium' | 'high'
    startTime: string
    endTime?: string
  }>
  crowdLevel: 'low' | 'medium' | 'high'
  parkingAvailability: {
    main: number // percentage
    preferred: number
    handicap: number
  }
}

export class ParksRepository extends AdvancedFirestoreRepository<Park> {
  constructor() {
    super('parks', ParkSchema)
  }

  /**
   * Find parks with enhanced search capabilities
   */
  async searchParks(options: ParkSearchOptions): Promise<Park[]> {
    const filters: WhereFilter<Park>[] = []

    // Add amenity filters
    if (options.amenities?.length) {
      filters.push({
        field: 'amenities',
        operator: 'array-contains-any',
        value: options.amenities
      })
    }

    // Add accessibility filters
    if (options.accessibility?.length) {
      filters.push({
        field: 'accessibility',
        operator: 'array-contains-any',
        value: options.accessibility
      })
    }

    // Add price range filter
    if (options.priceRange) {
      filters.push({
        field: 'pricing.adult',
        operator: '>=',
        value: options.priceRange.min
      })
      filters.push({
        field: 'pricing.adult',
        operator: '<=',
        value: options.priceRange.max
      })
    }

    let results = await this.findWhere(filters)

    // Apply text search if query provided
    if (options.query) {
      const searchTerms = options.query.toLowerCase().split(' ')
      results = results.filter(park => {
        const searchableText = `${park.name} ${park.description} ${park.areas.map(a => a.name).join(' ')}`.toLowerCase()
        return searchTerms.some(term => searchableText.includes(term))
      })
    }

    return results
  }

  /**
   * Get parks with real-time data integration
   */
  async getParksWithRealtimeData(
    options: ParkQueryOptions = {}
  ): Promise<PaginatedResult<Park & { realtimeData?: ParkRealtimeData }>> {
    const baseResult = await this.findAll(options)

    if (!options.includeRealTimeData) {
      return baseResult
    }

    // Enhance with real-time data
    const enhancedData = await Promise.all(
      baseResult.data.map(async (park) => {
        const realtimeData = await this.getRealtimeData(park.id)
        return {
          ...park,
          realtimeData
        }
      })
    )

    return {
      ...baseResult,
      data: enhancedData
    }
  }

  /**
   * Get park recommendations based on preferences
   */
  async getRecommendedParks(
    preferences: {
      groupSize: number
      ages: number[]
      interests: string[]
      mobility?: string[]
      budget: 'low' | 'medium' | 'high'
      visitDate: string
      duration: number // days
    }
  ): Promise<Array<Park & { recommendationScore: number; reasons: string[] }>> {
    const allParks = await this.findAll({ limit: 100 })
    
    const scoredParks = allParks.data.map(park => {
      const score = this.calculateRecommendationScore(park, preferences)
      const reasons = this.generateRecommendationReasons(park, preferences, score)
      
      return {
        ...park,
        recommendationScore: score,
        reasons
      }
    })

    return scoredParks
      .filter(park => park.recommendationScore > 0.3)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10)
  }

  /**
   * Get park capacity and crowd predictions
   */
  async getParkCapacityForecast(
    parkId: string,
    dateRange: { start: string; end: string }
  ): Promise<Array<{
    date: string
    expectedCrowdLevel: 'low' | 'medium' | 'high'
    capacityUtilization: number
    bestVisitTimes: Array<{
      time: string
      crowdLevel: 'low' | 'medium' | 'high'
      waitTimeMultiplier: number
    }>
    events: string[]
  }>> {
    const park = await this.findById(parkId)
    if (!park) throw new Error(`Park ${parkId} not found`)

    // This would integrate with crowd prediction service
    // For now, returning mock data structure
    const forecast = []
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)

    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      
      const crowdData = park.crowdCalendar?.find(c => c.date === dateStr)
      
      forecast.push({
        date: dateStr,
        expectedCrowdLevel: crowdData?.expectedCrowdLevel || 'medium',
        capacityUtilization: this.estimateCapacityUtilization(park, dateStr),
        bestVisitTimes: this.generateBestVisitTimes(park, dateStr),
        events: crowdData?.events || []
      })
    }

    return forecast
  }

  /**
   * Get park operating hours with seasonal adjustments
   */
  async getParkOperatingHours(
    parkId: string,
    date: string
  ): Promise<{
    regular: { open: string; close: string }
    extraMagicHours?: { open: string; close: string }
    specialEvents?: Array<{
      name: string
      startTime: string
      endTime: string
      requiresTicket: boolean
    }>
    isOperational: boolean
    alerts: string[]
  }> {
    const park = await this.findById(parkId)
    if (!park) throw new Error(`Park ${parkId} not found`)

    const targetDate = new Date(date)
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' }) as any

    // Check for seasonal hours
    const seasonalHours = park.operatingHours.seasonal?.find(season => {
      const start = new Date(season.startDate)
      const end = new Date(season.endDate)
      return targetDate >= start && targetDate <= end
    })

    const hours = seasonalHours || park.operatingHours.regular

    // Check for Extra Magic Hours
    const extraMagicHours = park.operatingHours.extraMagicHours?.days.includes(dayOfWeek)
      ? park.operatingHours.extraMagicHours
      : undefined

    return {
      regular: hours,
      extraMagicHours,
      specialEvents: [], // Would be populated from events service
      isOperational: true, // Would check real-time operational status
      alerts: []
    }
  }

  /**
   * Get transportation options between parks
   */
  async getTransportationOptions(
    fromParkId: string,
    toParkId: string,
    options: {
      departure?: string // time
      includeWalking?: boolean
      accessibility?: string[]
    } = {}
  ): Promise<Array<{
    type: string
    duration: number
    schedule?: {
      frequency: number
      nextDeparture: string
      lastDeparture: string
    }
    accessibility: string[]
    cost?: number
    steps: Array<{
      instruction: string
      duration: number
      type: string
    }>
  }>> {
    const [fromPark, toPark] = await Promise.all([
      this.findById(fromParkId),
      this.findById(toParkId)
    ])

    if (!fromPark || !toPark) {
      throw new Error('One or both parks not found')
    }

    // Find transportation connections
    const transportationOptions = []

    // Direct transportation
    const directTransport = fromPark.transportation.find(t => 
      t.destination === toParkId || t.destination === toPark.name
    )

    if (directTransport) {
      transportationOptions.push({
        type: directTransport.type,
        duration: directTransport.duration,
        schedule: directTransport.schedule,
        accessibility: this.getTransportationAccessibility(directTransport.type),
        steps: [{
          instruction: `Take ${directTransport.type} to ${toPark.name}`,
          duration: directTransport.duration,
          type: directTransport.type
        }]
      })
    }

    // Multi-modal transportation (e.g., monorail + walking)
    // This would implement pathfinding algorithm
    const multiModalOptions = await this.findMultiModalRoutes(fromPark, toPark, options)
    transportationOptions.push(...multiModalOptions)

    return transportationOptions.sort((a, b) => a.duration - b.duration)
  }

  /**
   * Batch update park statistics
   */
  async updateParkStatistics(updates: Array<{
    parkId: string
    statistics: Partial<Park['statistics']>
  }>): Promise<void> {
    const batch = this.db.batch()

    for (const update of updates) {
      const docRef = this.collection.doc(update.parkId)
      batch.update(docRef, {
        'statistics': update.statistics,
        'updatedAt': new Date().toISOString()
      })
    }

    await batch.commit()

    // Invalidate caches
    for (const update of updates) {
      await this.invalidateCache(update.parkId)
    }
  }

  /**
   * Get park analytics data
   */
  async getParkAnalytics(
    parkId: string,
    timeframe: 'day' | 'week' | 'month' | 'year'
  ): Promise<{
    visitorCount: Array<{ date: string; count: number }>
    avgWaitTimes: Array<{ date: string; avgWait: number }>
    popularAttractions: Array<{ attractionId: string; visits: number }>
    revenueData: Array<{ date: string; revenue: number }>
    crowdPatterns: Array<{ hour: number; avgCrowdLevel: number }>
  }> {
    // This would integrate with analytics service
    // Implementation would depend on your analytics backend
    
    return {
      visitorCount: [],
      avgWaitTimes: [],
      popularAttractions: [],
      revenueData: [],
      crowdPatterns: []
    }
  }

  // Private helper methods
  private async getRealtimeData(parkId: string): Promise<ParkRealtimeData | undefined> {
    try {
      // This would connect to real-time data service
      // For now, returning mock structure
      return {
        parkId,
        currentCapacity: 75,
        waitTimesLastUpdated: new Date().toISOString(),
        weatherConditions: {
          temperature: 75,
          condition: 'partly-cloudy',
          precipitation: 0.1,
          windSpeed: 5
        },
        operationalStatus: 'open',
        alerts: [],
        crowdLevel: 'medium',
        parkingAvailability: {
          main: 60,
          preferred: 30,
          handicap: 90
        }
      }
    } catch (error) {
      console.error(`Error fetching real-time data for park ${parkId}:`, error)
      return undefined
    }
  }

  private calculateRecommendationScore(
    park: Park,
    preferences: any
  ): number {
    let score = 0.5 // Base score

    // Age-based scoring
    const avgAge = preferences.ages.reduce((sum: number, age: number) => sum + age, 0) / preferences.ages.length
    
    if (avgAge < 10 && park.amenities.includes('family-friendly')) {
      score += 0.3
    }
    if (avgAge > 65 && park.accessibility.includes('senior-friendly')) {
      score += 0.2
    }

    // Interest matching
    const interestMatch = preferences.interests.filter((interest: string) => 
      park.metadata.tags.includes(interest)
    ).length / preferences.interests.length
    score += interestMatch * 0.4

    // Budget considerations
    const priceScore = this.calculatePriceScore(park.pricing.adult, preferences.budget)
    score += priceScore * 0.2

    // Group size considerations
    if (preferences.groupSize > 6 && park.amenities.includes('large-groups')) {
      score += 0.1
    }

    return Math.min(score, 1)
  }

  private generateRecommendationReasons(
    park: Park,
    preferences: any,
    score: number
  ): string[] {
    const reasons = []

    if (score > 0.8) {
      reasons.push('Highly recommended based on your preferences')
    }

    if (park.amenities.includes('family-friendly') && preferences.ages.some((age: number) => age < 12)) {
      reasons.push('Great for families with children')
    }

    if (preferences.interests.some((interest: string) => park.metadata.tags.includes(interest))) {
      reasons.push('Matches your interests')
    }

    return reasons
  }

  private calculatePriceScore(price: number, budget: string): number {
    const budgetRanges = {
      low: { min: 0, max: 150 },
      medium: { min: 100, max: 250 },
      high: { min: 200, max: 500 }
    }

    const range = budgetRanges[budget as keyof typeof budgetRanges]
    if (price >= range.min && price <= range.max) {
      return 1
    }
    
    if (price < range.min) {
      return 0.8 // Under budget is good
    }
    
    return Math.max(0, 1 - ((price - range.max) / range.max))
  }

  private estimateCapacityUtilization(park: Park, date: string): number {
    // This would use ML models to predict capacity
    // For now, returning mock calculation
    const dayOfWeek = new Date(date).getDay()
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0
    
    return Math.min(0.8 * weekendMultiplier, 1.0)
  }

  private generateBestVisitTimes(park: Park, date: string): Array<{
    time: string
    crowdLevel: 'low' | 'medium' | 'high'
    waitTimeMultiplier: number
  }> {
    // Generate hourly recommendations
    const times = []
    const baseHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    
    for (const time of baseHours) {
      const hour = parseInt(time.split(':')[0])
      let crowdLevel: 'low' | 'medium' | 'high' = 'medium'
      let waitTimeMultiplier = 1.0

      if (hour < 10 || hour > 18) {
        crowdLevel = 'low'
        waitTimeMultiplier = 0.7
      } else if (hour >= 12 && hour <= 15) {
        crowdLevel = 'high'
        waitTimeMultiplier = 1.5
      }

      times.push({
        time,
        crowdLevel,
        waitTimeMultiplier
      })
    }

    return times
  }

  private getTransportationAccessibility(type: string): string[] {
    const accessibilityMap: Record<string, string[]> = {
      'monorail': ['wheelchair-accessible', 'stroller-friendly'],
      'boat': ['wheelchair-accessible'],
      'bus': ['wheelchair-accessible', 'stroller-friendly'],
      'skyliner': ['wheelchair-accessible'],
      'walking': ['stroller-friendly']
    }

    return accessibilityMap[type] || []
  }

  private async findMultiModalRoutes(
    fromPark: Park,
    toPark: Park,
    options: any
  ): Promise<any[]> {
    // This would implement a sophisticated pathfinding algorithm
    // For now, returning empty array
    return []
  }
}

export const parksRepository = new ParksRepository()