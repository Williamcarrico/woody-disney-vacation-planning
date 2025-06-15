/**
 * Enhanced AI Recommendations API Route
 * Utilizing Edge Runtime, Streaming, and Advanced Caching
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createEdgeHandler, EdgeCache, cacheConfigs } from '@/lib/api/edge-runtime'
import { 
  createRecommendationEngine, 
  UserPreferences, 
  RecommendationContext,
  type AttractionData,
  type RestaurantData
} from '@/lib/ai/recommendation-engine'

// Set edge runtime
export const runtime = 'edge'

// Validation schemas
const RecommendationRequestSchema = z.object({
  preferences: z.object({
    age: z.number().min(1).max(120),
    groupSize: z.number().min(1).max(20),
    groupType: z.enum(['family', 'couple', 'friends', 'solo']),
    interests: z.array(z.string()),
    accessibility: z.array(z.string()).default([]),
    budgetLevel: z.enum(['low', 'medium', 'high']),
    visitDuration: z.number().min(1).max(14),
    previousVisits: z.number().min(0).default(0),
    thrillLevel: z.enum(['low', 'medium', 'high']),
    diningPreferences: z.array(z.string()).default([]),
    timePreferences: z.object({
      morningPerson: z.boolean().default(true),
      eveningPerson: z.boolean().default(true),
      preferWeekdays: z.boolean().default(false)
    }).default({})
  }),
  context: z.object({
    currentLocation: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    currentTime: z.string().datetime().optional(),
    weather: z.object({
      temperature: z.number(),
      condition: z.string(),
      precipitation: z.number().min(0).max(1)
    }).optional(),
    crowdLevel: z.enum(['low', 'medium', 'high']).default('medium'),
    currentPark: z.string().optional(),
    remainingTime: z.number().min(0).default(480), // 8 hours default
    energyLevel: z.enum(['low', 'medium', 'high']).default('medium'),
    groupMood: z.enum(['excited', 'tired', 'hungry', 'exploring']).optional()
  }).default({}),
  limit: z.number().min(1).max(50).default(10),
  type: z.enum(['attractions', 'restaurants', 'mixed', 'itinerary']).default('mixed')
})

// Mock data loader (in production, this would come from your database)
async function loadAttractionData(): Promise<AttractionData[]> {
  // Check cache first
  const cached = await EdgeCache.get<AttractionData[]>('attractions-data')
  if (cached) return cached

  // In production, load from database
  const attractions: AttractionData[] = [
    {
      id: 'space-mountain',
      name: 'Space Mountain',
      park: 'magic-kingdom',
      type: 'thrill-ride',
      thrillLevel: 'high',
      accessibility: ['wheelchair-accessible', 'assistive-listening'],
      averageWaitTime: 45,
      popularity: 0.9,
      tags: ['dark-ride', 'space', 'indoor', 'fast'],
      duration: 3,
      heightRequirement: 44,
      fastPassAvailable: true,
      location: { lat: 28.4208, lng: -81.5781 },
      operatingHours: { open: '09:00', close: '22:00' },
      seasonality: { peak: true, moderate: true, low: true }
    },
    {
      id: 'its-a-small-world',
      name: "It's a Small World",
      park: 'magic-kingdom',
      type: 'family-ride',
      thrillLevel: 'low',
      accessibility: ['wheelchair-accessible', 'assistive-listening', 'audio-description'],
      averageWaitTime: 20,
      popularity: 0.7,
      tags: ['family-friendly', 'indoor', 'music', 'slow'],
      duration: 11,
      fastPassAvailable: false,
      location: { lat: 28.4202, lng: -81.5812 },
      operatingHours: { open: '09:00', close: '22:00' },
      seasonality: { peak: true, moderate: true, low: true }
    },
    {
      id: 'expedition-everest',
      name: 'Expedition Everest',
      park: 'animal-kingdom',
      type: 'thrill-ride',
      thrillLevel: 'high',
      accessibility: ['wheelchair-transfer'],
      averageWaitTime: 60,
      popularity: 0.85,
      tags: ['coaster', 'mountain', 'outdoor', 'adventure'],
      duration: 4,
      heightRequirement: 44,
      fastPassAvailable: true,
      location: { lat: 28.3590, lng: -81.5901 },
      operatingHours: { open: '08:00', close: '20:00' },
      seasonality: { peak: true, moderate: true, low: false }
    }
  ]

  // Cache for 5 minutes
  await EdgeCache.set('attractions-data', attractions, cacheConfigs.attractions)
  return attractions
}

async function loadRestaurantData(): Promise<RestaurantData[]> {
  // Check cache first
  const cached = await EdgeCache.get<RestaurantData[]>('restaurants-data')
  if (cached) return cached

  // In production, load from database
  const restaurants: RestaurantData[] = [
    {
      id: 'be-our-guest',
      name: 'Be Our Guest Restaurant',
      park: 'magic-kingdom',
      cuisineType: ['french', 'american'],
      priceLevel: 'high',
      accessibility: ['wheelchair-accessible', 'assistive-listening'],
      tags: ['fine-dining', 'character-dining', 'reservations-required'],
      reservationRequired: true,
      location: { lat: 28.4201, lng: -81.5830 },
      averageWaitTime: 0, // Reservations only
      popularity: 0.95,
      kidsFriendly: true,
      allergenFriendly: ['gluten-free', 'dairy-free', 'nut-free']
    },
    {
      id: 'dole-whip',
      name: 'Dole Whip Stand',
      park: 'magic-kingdom',
      cuisineType: ['dessert', 'tropical'],
      priceLevel: 'low',
      accessibility: ['wheelchair-accessible'],
      tags: ['quick-service', 'outdoor', 'refreshing'],
      reservationRequired: false,
      location: { lat: 28.4195, lng: -81.5815 },
      averageWaitTime: 15,
      popularity: 0.8,
      kidsFriendly: true,
      allergenFriendly: ['dairy-free', 'vegan']
    }
  ]

  // Cache for 30 minutes
  await EdgeCache.set('restaurants-data', restaurants, cacheConfigs.restaurants)
  return restaurants
}

// Enhanced recommendation handler
async function handleRecommendations(
  input: z.infer<typeof RecommendationRequestSchema>,
  request: NextRequest
): Promise<unknown> {
  const { preferences, context: inputContext, limit, type } = input

  // Process context with defaults
  const context: RecommendationContext = {
    currentTime: inputContext.currentTime ? new Date(inputContext.currentTime) : new Date(),
    ...inputContext
  }

  // Load data
  const [attractions, restaurants] = await Promise.all([
    loadAttractionData(),
    loadRestaurantData()
  ])

  // Create recommendation engine
  const engine = createRecommendationEngine(attractions, restaurants)

  // Generate recommendations based on type
  switch (type) {
    case 'attractions': {
      const attractionRecs = await engine.generateRecommendations(preferences, context, limit)
      return {
        recommendations: attractionRecs.filter(r => r.type === 'attraction'),
        type: 'attractions',
        generatedAt: new Date().toISOString(),
        context: {
          crowdLevel: context.crowdLevel,
          currentTime: context.currentTime.toISOString(),
          preferences: {
            thrillLevel: preferences.thrillLevel,
            interests: preferences.interests,
            groupType: preferences.groupType
          }
        }
      }
    }

    case 'restaurants': {
      const restaurantRecs = await engine.generateRecommendations(preferences, context, limit)
      return {
        recommendations: restaurantRecs.filter(r => r.type === 'restaurant'),
        type: 'restaurants',
        generatedAt: new Date().toISOString(),
        context: {
          crowdLevel: context.crowdLevel,
          currentTime: context.currentTime.toISOString(),
          preferences: {
            budgetLevel: preferences.budgetLevel,
            diningPreferences: preferences.diningPreferences,
            groupType: preferences.groupType
          }
        }
      }
    }

    case 'itinerary': {
      const itinerary = await engine.generateItinerary(preferences, context, 8) // 8 hour day
      return {
        recommendations: itinerary,
        type: 'itinerary',
        duration: '8 hours',
        estimatedTime: itinerary.reduce((total, rec) => {
          if (rec.type === 'attraction') {
            const attraction = rec.item as AttractionData
            return total + attraction.duration + attraction.averageWaitTime
          }
          return total + 60 // 1 hour for restaurants
        }, 0),
        generatedAt: new Date().toISOString(),
        context: {
          crowdLevel: context.crowdLevel,
          currentTime: context.currentTime.toISOString(),
          remainingTime: context.remainingTime
        }
      }
    }

    case 'mixed':
    default: {
      const recommendations = await engine.generateRecommendations(preferences, context, limit)
      return {
        recommendations,
        type: 'mixed',
        breakdown: {
          attractions: recommendations.filter(r => r.type === 'attraction').length,
          restaurants: recommendations.filter(r => r.type === 'restaurant').length
        },
        generatedAt: new Date().toISOString(),
        context: {
          crowdLevel: context.crowdLevel,
          currentTime: context.currentTime.toISOString(),
          preferences: {
            thrillLevel: preferences.thrillLevel,
            budgetLevel: preferences.budgetLevel,
            interests: preferences.interests,
            groupType: preferences.groupType
          }
        }
      }
    }
  }
}

// Rate limiting configuration for recommendations
const rateLimitConfig = {
  limit: 30, // 30 requests per minute
  windowMs: 60 * 1000,
  keyGenerator: (req: NextRequest) => {
    // Use IP + user agent for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    return `recommendations:${ip}:${userAgent.slice(0, 50)}`
  }
}

// Cache configuration for recommendations
const cacheConfig = {
  ttl: 300, // 5 minutes
  staleWhileRevalidate: 600, // 10 minutes
  tags: ['recommendations', 'ai']
}

// Create the edge handler
export const POST = createEdgeHandler(
  RecommendationRequestSchema,
  handleRecommendations,
  {
    rateLimit: rateLimitConfig,
    cache: cacheConfig,
    name: 'ai-recommendations'
  }
)

// Health check endpoint
export const GET = createEdgeHandler(
  z.object({}),
  async () => ({
    status: 'healthy',
    service: 'ai-recommendations',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    capabilities: ['attractions', 'restaurants', 'itinerary', 'mixed'],
    edgeRuntime: true
  }),
  {
    cache: { ttl: 60, tags: ['health'] },
    name: 'recommendations-health'
  }
)