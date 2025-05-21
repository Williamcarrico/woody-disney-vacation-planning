import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { auth } from '@/lib/auth'

const itinerarySchema = z.object({
    vacationId: z.string(),
    tripName: z.string(),
    parkDays: z.array(
        z.object({
            date: z.string(),
            parkId: z.string(),
            activities: z.array(
                z.object({
                    id: z.string().optional(),
                    name: z.string(),
                    type: z.string(),
                    startTime: z.string(),
                    endTime: z.string(),
                    location: z.string().optional(),
                    description: z.string().optional(),
                    waitTime: z.number().optional(),
                    walkingTime: z.number().optional(),
                    notes: z.string().optional(),
                })
            ),
        })
    ),
    preferences: z.object({
        partySize: z.number().min(1),
        hasChildren: z.boolean(),
        childrenAges: z.array(z.number()).optional(),
        hasStroller: z.boolean().optional(),
        mobilityConsiderations: z.boolean().optional(),
        ridePreference: z.enum(['thrill', 'family', 'all']).optional(),
        maxWaitTime: z.number().optional(),
        walkingPace: z.enum(['slow', 'moderate', 'fast']).optional(),
        useGeniePlus: z.boolean().optional(),
        useIndividualLightningLane: z.boolean().optional(),
    }).optional(),
})

// Define query type to fix TypeScript error
type ItineraryQuery = {
    userId: string;
    vacationId?: string;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Get optional vacationId from query params
        const url = new URL(request.url)
        const vacationId = url.searchParams.get('vacationId')

        let query: ItineraryQuery = { userId }
        if (vacationId) {
            query = { ...query, vacationId }
        }

        // Fetch itineraries for the user from database
        const itineraries = await db.query.itineraries.findMany({
            where: query,
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ itineraries })
    } catch (error) {
        console.error('Failed to get itineraries:', error)
        return NextResponse.json({ error: 'Failed to get itineraries' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id
        const data = await request.json()

        // Validate the request body
        const validatedData = itinerarySchema.parse(data)

        // Save the itinerary to the database
        const newItinerary = await db.insert.itineraries.values({
            userId,
            vacationId: validatedData.vacationId,
            tripName: validatedData.tripName,
            parkDays: validatedData.parkDays,
            preferences: validatedData.preferences || {},
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning()

        return NextResponse.json({
            message: 'Itinerary created successfully',
            itinerary: newItinerary[0]
        })
    } catch (error) {
        console.error('Failed to create itinerary:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.format() }, { status: 400 })
        }

        return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 })
    }
}