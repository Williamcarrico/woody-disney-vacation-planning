/**
 * AI-Powered Recommendation Engine
 * Enhanced for Disney Vacation Planning with Edge Runtime Support
 */

import { z } from 'zod'

// Types for the recommendation system
export interface UserPreferences {
  age: number
  groupSize: number
  groupType: 'family' | 'couple' | 'friends' | 'solo'
  interests: string[]
  accessibility: string[]
  budgetLevel: 'low' | 'medium' | 'high'
  visitDuration: number // days
  previousVisits: number
  favoriteParks?: string[]
  dislikedAttractions?: string[]
  thrillLevel: 'low' | 'medium' | 'high'
  diningPreferences: string[]
  mobilityNeeds?: string[]
  timePreferences: {
    morningPerson: boolean
    eveningPerson: boolean
    preferWeekdays: boolean
  }
}

export interface AttractionData {
  id: string
  name: string
  park: string
  type: string
  thrillLevel: 'low' | 'medium' | 'high'
  accessibility: string[]
  averageWaitTime: number
  popularity: number
  tags: string[]
  duration: number
  heightRequirement?: number
  fastPassAvailable: boolean
  location: {
    lat: number
    lng: number
  }
  operatingHours: {
    open: string
    close: string
  }
  seasonality: {
    peak: boolean
    moderate: boolean
    low: boolean
  }
}

export interface RestaurantData {
  id: string
  name: string
  park?: string
  cuisineType: string[]
  priceLevel: 'low' | 'medium' | 'high'
  accessibility: string[]
  tags: string[]
  reservationRequired: boolean
  location: {
    lat: number
    lng: number
  }
  averageWaitTime: number
  popularity: number
  kidsFriendly: boolean
  allergenFriendly: string[]
}

export interface Recommendation {
  id: string
  type: 'attraction' | 'restaurant' | 'event' | 'itinerary'
  item: AttractionData | RestaurantData | any
  score: number
  reasons: string[]
  timeSlot?: string
  alternatives?: Recommendation[]
  confidence: number
  personalizedFactors: string[]
}

export interface RecommendationContext {
  currentLocation?: { lat: number; lng: number }
  currentTime: Date
  weather?: {
    temperature: number
    condition: string
    precipitation: number
  }
  crowdLevel: 'low' | 'medium' | 'high'
  currentPark?: string
  remainingTime: number // minutes
  energyLevel: 'low' | 'medium' | 'high'
  groupMood?: 'excited' | 'tired' | 'hungry' | 'exploring'
}

// Validation schemas
const UserPreferencesSchema = z.object({
  age: z.number().min(1).max(120),
  groupSize: z.number().min(1).max(20),
  groupType: z.enum(['family', 'couple', 'friends', 'solo']),
  interests: z.array(z.string()),
  accessibility: z.array(z.string()),
  budgetLevel: z.enum(['low', 'medium', 'high']),
  visitDuration: z.number().min(1).max(14),
  previousVisits: z.number().min(0),
  thrillLevel: z.enum(['low', 'medium', 'high']),
  diningPreferences: z.array(z.string()),
  timePreferences: z.object({
    morningPerson: z.boolean(),
    eveningPerson: z.boolean(),
    preferWeekdays: z.boolean()
  })
})

// AI-powered scoring algorithms
export class RecommendationEngine {
  private attractions: AttractionData[]
  private restaurants: RestaurantData[]
  private userHistory: Map<string, number[]> = new Map()
  
  constructor(attractions: AttractionData[], restaurants: RestaurantData[]) {
    this.attractions = attractions
    this.restaurants = restaurants
  }

  // Main recommendation method
  async generateRecommendations(
    preferences: UserPreferences,
    context: RecommendationContext,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      // Validate input
      UserPreferencesSchema.parse(preferences)
      
      const recommendations: Recommendation[] = []
      
      // Generate attraction recommendations
      const attractionRecs = await this.recommendAttractions(preferences, context, Math.ceil(limit * 0.6))
      recommendations.push(...attractionRecs)
      
      // Generate restaurant recommendations
      const restaurantRecs = await this.recommendRestaurants(preferences, context, Math.ceil(limit * 0.4))
      recommendations.push(...restaurantRecs)
      
      // Sort by score and apply diversity
      const sortedRecs = this.applyDiversityFilter(
        recommendations.sort((a, b) => b.score - a.score),
        preferences
      )
      
      return sortedRecs.slice(0, limit)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return this.getFallbackRecommendations(preferences, context, limit)
    }
  }

  // Attraction recommendation algorithm
  private async recommendAttractions(
    preferences: UserPreferences,
    context: RecommendationContext,
    limit: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []
    
    for (const attraction of this.attractions) {
      let score = 0
      const reasons: string[] = []
      const personalizedFactors: string[] = []
      
      // Base popularity score (20% weight)
      score += attraction.popularity * 0.2
      
      // Interest matching (25% weight)
      const interestMatch = this.calculateInterestMatch(attraction.tags, preferences.interests)
      score += interestMatch * 0.25
      if (interestMatch > 0.7) {
        reasons.push(`Matches your interest in ${preferences.interests.join(', ')}`)
        personalizedFactors.push('interest_match')
      }
      
      // Thrill level matching (20% weight)
      const thrillMatch = this.calculateThrillMatch(attraction.thrillLevel, preferences.thrillLevel)
      score += thrillMatch * 0.2
      if (thrillMatch > 0.8) {
        reasons.push(`Perfect thrill level for your preference`)
        personalizedFactors.push('thrill_match')
      }
      
      // Accessibility considerations (15% weight)
      const accessibilityScore = this.calculateAccessibilityScore(attraction, preferences)
      score += accessibilityScore * 0.15
      if (accessibilityScore > 0.9) {
        reasons.push('Excellent accessibility features')
        personalizedFactors.push('accessibility')
      }
      
      // Wait time optimization (10% weight)
      const waitTimeScore = this.calculateWaitTimeScore(attraction, context)
      score += waitTimeScore * 0.1
      if (waitTimeScore > 0.8) {
        reasons.push('Short wait time expected')
        personalizedFactors.push('low_wait')
      }
      
      // Location convenience (10% weight)
      const locationScore = this.calculateLocationScore(attraction, context)
      score += locationScore * 0.1
      if (locationScore > 0.8) {
        reasons.push('Conveniently located near you')
        personalizedFactors.push('proximity')
      }
      
      // Weather considerations
      const weatherScore = this.calculateWeatherScore(attraction, context.weather)
      score *= weatherScore
      if (weatherScore < 0.5) {
        reasons.push('Consider weather conditions')
      }
      
      // Crowd level adjustments
      score *= this.getCrowdAdjustment(context.crowdLevel)
      
      // Historical preferences
      const historyScore = this.calculateHistoryScore(attraction, preferences)
      score += historyScore * 0.1
      
      // Confidence calculation
      const confidence = this.calculateConfidence(score, reasons.length, personalizedFactors.length)
      
      if (score > 0.3) { // Minimum threshold
        recommendations.push({
          id: attraction.id,
          type: 'attraction',
          item: attraction,
          score,
          reasons,
          confidence,
          personalizedFactors,
          timeSlot: this.suggestOptimalTime(attraction, context)
        })
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  // Restaurant recommendation algorithm  
  private async recommendRestaurants(
    preferences: UserPreferences,
    context: RecommendationContext,
    limit: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []
    
    for (const restaurant of this.restaurants) {
      let score = 0
      const reasons: string[] = []
      const personalizedFactors: string[] = []
      
      // Base popularity score
      score += restaurant.popularity * 0.2
      
      // Cuisine preference matching
      const cuisineMatch = this.calculateCuisineMatch(restaurant.cuisineType, preferences.diningPreferences)
      score += cuisineMatch * 0.3
      if (cuisineMatch > 0.7) {
        reasons.push(`Matches your cuisine preferences`)
        personalizedFactors.push('cuisine_match')
      }
      
      // Budget matching
      const budgetMatch = this.calculateBudgetMatch(restaurant.priceLevel, preferences.budgetLevel)
      score += budgetMatch * 0.2
      if (budgetMatch > 0.8) {
        reasons.push('Fits your budget perfectly')
        personalizedFactors.push('budget_fit')
      }
      
      // Group size considerations
      const groupScore = this.calculateGroupScore(restaurant, preferences.groupSize, preferences.groupType)
      score += groupScore * 0.15
      
      // Accessibility
      const accessibilityScore = this.calculateAccessibilityScore(restaurant, preferences)
      score += accessibilityScore * 0.15
      
      // Time-based factors (meal time appropriateness)
      const timeScore = this.calculateMealTimeScore(restaurant, context.currentTime)
      score *= timeScore
      
      // Location convenience
      const locationScore = this.calculateLocationScore(restaurant, context)
      score += locationScore * 0.1
      
      const confidence = this.calculateConfidence(score, reasons.length, personalizedFactors.length)
      
      if (score > 0.3) {
        recommendations.push({
          id: restaurant.id,
          type: 'restaurant',
          item: restaurant,
          score,
          reasons,
          confidence,
          personalizedFactors
        })
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  // Enhanced scoring algorithms
  private calculateInterestMatch(itemTags: string[], userInterests: string[]): number {
    if (userInterests.length === 0) return 0.5
    
    const matches = itemTags.filter(tag => 
      userInterests.some(interest => 
        interest.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    )
    
    return Math.min(matches.length / userInterests.length, 1)
  }

  private calculateThrillMatch(itemThrill: string, userThrill: string): number {
    const thrillLevels = { low: 1, medium: 2, high: 3 }
    const itemLevel = thrillLevels[itemThrill as keyof typeof thrillLevels]
    const userLevel = thrillLevels[userThrill as keyof typeof thrillLevels]
    
    const difference = Math.abs(itemLevel - userLevel)
    return Math.max(0, 1 - (difference * 0.4))
  }

  private calculateAccessibilityScore(item: AttractionData | RestaurantData, preferences: UserPreferences): number {
    if (preferences.accessibility.length === 0) return 1
    
    const matches = preferences.accessibility.filter(need => 
      item.accessibility.includes(need)
    )
    
    return matches.length / preferences.accessibility.length
  }

  private calculateWaitTimeScore(attraction: AttractionData, context: RecommendationContext): number {
    const maxAcceptableWait = 60 // minutes
    const currentWait = attraction.averageWaitTime * this.getCrowdMultiplier(context.crowdLevel)
    
    if (currentWait <= 15) return 1
    if (currentWait >= maxAcceptableWait) return 0.2
    
    return 1 - ((currentWait - 15) / (maxAcceptableWait - 15)) * 0.8
  }

  private calculateLocationScore(item: AttractionData | RestaurantData, context: RecommendationContext): number {
    if (!context.currentLocation) return 0.5
    
    const distance = this.calculateDistance(
      context.currentLocation.lat,
      context.currentLocation.lng,
      item.location.lat,
      item.location.lng
    )
    
    // Score decreases with distance (max useful distance: 2km)
    return Math.max(0, 1 - (distance / 2000))
  }

  private calculateWeatherScore(attraction: AttractionData, weather?: RecommendationContext['weather']): number {
    if (!weather) return 1
    
    // Indoor attractions are less affected by weather
    const isIndoor = attraction.tags.includes('indoor')
    if (isIndoor) return 1
    
    // Outdoor attractions affected by rain and extreme temperatures
    if (weather.precipitation > 0.7) return 0.3
    if (weather.temperature < 10 || weather.temperature > 35) return 0.6
    
    return 1
  }

  private calculateHistoryScore(item: AttractionData | RestaurantData, preferences: UserPreferences): number {
    // Boost score for similar items the user has enjoyed
    // Reduce score for items they've disliked
    if (preferences.dislikedAttractions?.includes(item.id)) return -0.3
    
    // Boost based on similar items they've enjoyed (would need user history data)
    return 0
  }

  private calculateCuisineMatch(itemCuisines: string[], userPreferences: string[]): number {
    if (userPreferences.length === 0) return 0.5
    
    const matches = itemCuisines.filter(cuisine => 
      userPreferences.some(pref => 
        pref.toLowerCase().includes(cuisine.toLowerCase()) ||
        cuisine.toLowerCase().includes(pref.toLowerCase())
      )
    )
    
    return Math.min(matches.length / userPreferences.length, 1)
  }

  private calculateBudgetMatch(itemPrice: string, userBudget: string): number {
    const priceMap = { low: 1, medium: 2, high: 3 }
    const itemLevel = priceMap[itemPrice as keyof typeof priceMap]
    const userLevel = priceMap[userBudget as keyof typeof priceMap]
    
    // Perfect match gets 1, one level difference gets 0.7, two levels get 0.4
    const difference = Math.abs(itemLevel - userLevel)
    return Math.max(0.4, 1 - (difference * 0.3))
  }

  private calculateGroupScore(restaurant: RestaurantData, groupSize: number, groupType: string): number {
    let score = 1
    
    // Large groups might have difficulty at smaller venues
    if (groupSize > 6 && !restaurant.tags.includes('large-groups')) {
      score *= 0.7
    }
    
    // Family-friendly considerations
    if (groupType === 'family' && !restaurant.kidsFriendly) {
      score *= 0.6
    }
    
    return score
  }

  private calculateMealTimeScore(restaurant: RestaurantData, currentTime: Date): number {
    const hour = currentTime.getHours()
    
    // Breakfast (6-11), Lunch (11-16), Dinner (16-22)
    const isBreakfast = hour >= 6 && hour < 11
    const isLunch = hour >= 11 && hour < 16
    const isDinner = hour >= 16 && hour < 22
    
    if (restaurant.tags.includes('breakfast') && isBreakfast) return 1.2
    if (restaurant.tags.includes('lunch') && isLunch) return 1.1
    if (restaurant.tags.includes('dinner') && isDinner) return 1.1
    
    return 1
  }

  private calculateConfidence(score: number, reasonCount: number, personalizedFactorCount: number): number {
    let confidence = score
    
    // More reasons increase confidence
    confidence += (reasonCount * 0.05)
    
    // More personalized factors increase confidence
    confidence += (personalizedFactorCount * 0.1)
    
    return Math.min(confidence, 1)
  }

  // Utility methods
  private getCrowdMultiplier(crowdLevel: string): number {
    switch (crowdLevel) {
      case 'low': return 0.7
      case 'medium': return 1.0
      case 'high': return 1.5
      default: return 1.0
    }
  }

  private getCrowdAdjustment(crowdLevel: string): number {
    switch (crowdLevel) {
      case 'low': return 1.1 // Slight boost for low crowds
      case 'medium': return 1.0
      case 'high': return 0.9 // Slight penalty for high crowds
      default: return 1.0
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private suggestOptimalTime(attraction: AttractionData, context: RecommendationContext): string {
    const currentHour = context.currentTime.getHours()
    
    // Early morning for popular attractions
    if (attraction.popularity > 0.8) {
      return 'Early morning (8-10 AM) for shorter wait times'
    }
    
    // Late evening for moderate attractions
    if (attraction.popularity > 0.5) {
      return 'Evening (7-9 PM) when crowds thin out'
    }
    
    return 'Anytime - typically low wait times'
  }

  private applyDiversityFilter(recommendations: Recommendation[], preferences: UserPreferences): Recommendation[] {
    const diverse: Recommendation[] = []
    const typeCount: Record<string, number> = {}
    const parkCount: Record<string, number> = {}
    
    for (const rec of recommendations) {
      const itemType = rec.type
      const park = (rec.item as AttractionData).park || 'general'
      
      // Ensure diversity in recommendation types
      if ((typeCount[itemType] || 0) < 3) {
        // Ensure diversity in parks
        if ((parkCount[park] || 0) < 2) {
          diverse.push(rec)
          typeCount[itemType] = (typeCount[itemType] || 0) + 1
          parkCount[park] = (parkCount[park] || 0) + 1
        }
      }
    }
    
    // Fill remaining slots if we don't have enough diverse recommendations
    if (diverse.length < recommendations.length * 0.8) {
      const remaining = recommendations.filter(r => !diverse.includes(r))
      diverse.push(...remaining.slice(0, Math.floor(recommendations.length * 0.2)))
    }
    
    return diverse
  }

  private getFallbackRecommendations(
    preferences: UserPreferences,
    context: RecommendationContext,
    limit: number
  ): Recommendation[] {
    // Return most popular items as fallback
    const fallback: Recommendation[] = []
    
    const topAttractions = this.attractions
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, Math.ceil(limit * 0.7))
      .map(attraction => ({
        id: attraction.id,
        type: 'attraction' as const,
        item: attraction,
        score: attraction.popularity,
        reasons: ['Popular attraction'],
        confidence: 0.6,
        personalizedFactors: []
      }))
    
    const topRestaurants = this.restaurants
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, Math.floor(limit * 0.3))
      .map(restaurant => ({
        id: restaurant.id,
        type: 'restaurant' as const,
        item: restaurant,
        score: restaurant.popularity,
        reasons: ['Popular restaurant'],
        confidence: 0.6,
        personalizedFactors: []
      }))
    
    fallback.push(...topAttractions, ...topRestaurants)
    
    return fallback.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  // Learning methods for continuous improvement
  updateUserFeedback(userId: string, recommendationId: string, feedback: 'positive' | 'negative' | 'neutral'): void {
    const history = this.userHistory.get(userId) || []
    const score = feedback === 'positive' ? 1 : feedback === 'negative' ? -1 : 0
    history.push(score)
    this.userHistory.set(userId, history.slice(-100)) // Keep last 100 feedback items
  }

  // Generate itinerary recommendations
  async generateItinerary(
    preferences: UserPreferences,
    context: RecommendationContext,
    duration: number // hours
  ): Promise<Recommendation[]> {
    const recommendations = await this.generateRecommendations(preferences, context, 20)
    const itinerary: Recommendation[] = []
    let remainingTime = duration * 60 // convert to minutes
    
    for (const rec of recommendations) {
      if (rec.type === 'attraction') {
        const attraction = rec.item as AttractionData
        const timeNeeded = attraction.duration + attraction.averageWaitTime
        
        if (timeNeeded <= remainingTime) {
          itinerary.push(rec)
          remainingTime -= timeNeeded
        }
      } else if (rec.type === 'restaurant' && remainingTime > 60) {
        // Add meal if there's time
        itinerary.push(rec)
        remainingTime -= 60 // Assume 1 hour for meals
      }
      
      if (remainingTime <= 30) break // Stop if less than 30 minutes left
    }
    
    return itinerary
  }
}

// Export factory function for edge runtime compatibility
export function createRecommendationEngine(
  attractions: AttractionData[],
  restaurants: RestaurantData[]
): RecommendationEngine {
  return new RecommendationEngine(attractions, restaurants)
}

// Export types and utilities
export type { UserPreferences, AttractionData, RestaurantData, Recommendation, RecommendationContext }