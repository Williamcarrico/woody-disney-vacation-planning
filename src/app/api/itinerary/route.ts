import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { firebaseDataManager } from '@/lib/firebase/firebase-data-manager'
import { z } from 'zod'

// Validation schemas
const createItinerarySchema = z.object({
  tripName: z.string().min(1, 'Trip name is required'),
  vacationId: z.string().optional(),
  parkDays: z.array(z.object({
    date: z.string(),
    parkId: z.string(),
    activities: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      type: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      location: z.string().optional(),
      description: z.string().optional(),
      waitTime: z.number().optional(),
      walkingTime: z.number().optional(),
      notes: z.string().optional()
    }))
  })).optional(),
  preferences: z.object({
    partySize: z.number().min(1).optional(),
    hasChildren: z.boolean().optional(),
    childrenAges: z.array(z.number()).optional(),
    hasStroller: z.boolean().optional(),
    mobilityConsiderations: z.boolean().optional(),
    ridePreference: z.enum(['thrill', 'family', 'all']).optional(),
    maxWaitTime: z.number().min(0).optional(),
    walkingPace: z.enum(['slow', 'moderate', 'fast']).optional(),
    useGeniePlus: z.boolean().optional(),
    useIndividualLightningLane: z.boolean().optional()
  }).optional()
})

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Firebase session
    const user = await getCurrentUser()
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const vacationId = searchParams.get('vacationId')
    const shared = searchParams.get('shared') === 'true'

    try {
      let itineraries

      if (shared) {
        // Get shared itineraries
        itineraries = await firebaseDataManager.itineraries.getSharedItineraries()
      } else if (vacationId) {
        // Get itineraries for specific vacation
        itineraries = await firebaseDataManager.itineraries.getItinerariesByVacationId(vacationId)
        
        // Verify user has access to this vacation
        const vacation = await firebaseDataManager.vacations.getVacationById(vacationId)
        if (!vacation || vacation.userId !== user.uid) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } else {
        // Get user's itineraries
        const result = await firebaseDataManager.itineraries.getItinerariesByUserId(user.uid, { limit })
        itineraries = result.itineraries
      }

      // Transform itineraries for API response
      const transformedItineraries = itineraries.map(itinerary => ({
        id: itinerary.id,
        tripName: itinerary.tripName,
        vacationId: itinerary.vacationId,
        parkDays: itinerary.parkDays,
        preferences: itinerary.preferences,
        isShared: itinerary.isShared,
        shareCode: itinerary.shareCode,
        createdAt: itinerary.createdAt.toDate().toISOString(),
        updatedAt: itinerary.updatedAt.toDate().toISOString(),
        totalActivities: firebaseDataManager.itineraries.getTotalActivities(itinerary),
        parkDaysCount: firebaseDataManager.itineraries.getParkDaysCount(itinerary)
      }))

      return NextResponse.json({
        itineraries: transformedItineraries,
        total: transformedItineraries.length
      })

    } catch (error) {
      console.error('Firebase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch itineraries' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error fetching itineraries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Firebase session
    const user = await getCurrentUser()
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    try {
      const validatedData = createItinerarySchema.parse(body)

      // Validate vacation ownership if vacationId is provided
      if (validatedData.vacationId) {
        const vacation = await firebaseDataManager.vacations.getVacationById(validatedData.vacationId)
        if (!vacation || vacation.userId !== user.uid) {
          return NextResponse.json(
            { error: 'Invalid vacation or access denied' },
            { status: 400 }
          )
        }
      }

      // Validate park days if provided
      if (validatedData.parkDays) {
        for (const parkDay of validatedData.parkDays) {
          const validation = firebaseDataManager.validateParkDay(parkDay)
          if (!validation.isValid) {
            return NextResponse.json(
              { error: validation.error },
              { status: 400 }
            )
          }
        }
      }

      // Create itinerary
      let itineraryId
      if (validatedData.parkDays || validatedData.preferences) {
        // Create with custom data
        const itineraryData = {
          userId: user.uid,
          vacationId: validatedData.vacationId,
          tripName: validatedData.tripName,
          parkDays: validatedData.parkDays || [],
          preferences: validatedData.preferences || {
            partySize: 2,
            hasChildren: false,
            childrenAges: [],
            hasStroller: false,
            mobilityConsiderations: false,
            ridePreference: 'all' as const,
            maxWaitTime: 60,
            walkingPace: 'moderate' as const,
            useGeniePlus: false,
            useIndividualLightningLane: false
          },
          isShared: false
        }
        itineraryId = await firebaseDataManager.itineraries.createItinerary(itineraryData)
      } else {
        // Create with defaults
        itineraryId = await firebaseDataManager.createItineraryWithDefaults(
          user.uid,
          validatedData.vacationId || '',
          validatedData.tripName
        )
      }

      // Get the created itinerary
      const itinerary = await firebaseDataManager.itineraries.getItineraryById(itineraryId)
      if (!itinerary) {
        throw new Error('Failed to retrieve created itinerary')
      }

      return NextResponse.json({
        id: itinerary.id,
        tripName: itinerary.tripName,
        vacationId: itinerary.vacationId,
        parkDays: itinerary.parkDays,
        preferences: itinerary.preferences,
        isShared: itinerary.isShared,
        shareCode: itinerary.shareCode,
        createdAt: itinerary.createdAt.toDate().toISOString(),
        updatedAt: itinerary.updatedAt.toDate().toISOString(),
        totalActivities: firebaseDataManager.itineraries.getTotalActivities(itinerary),
        parkDaysCount: firebaseDataManager.itineraries.getParkDaysCount(itinerary)
      }, { status: 201 })

    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }

  } catch (error) {
    console.error('Error creating itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to create itinerary' },
      { status: 500 }
    )
  }
}

export const revalidate = 300 // 5 minutes