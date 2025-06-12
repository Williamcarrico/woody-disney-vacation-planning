import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, itineraries } from '@/db'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

const itineraryUpdateSchema = z.object({
    tripName: z.string().optional(),
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
    ).optional(),
    preferences: z.object({
        partySize: z.number().min(1).optional(),
        hasChildren: z.boolean().optional(),
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ itineraryId: string }> }
) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id
        const { itineraryId } = await params

        // Fetch itinerary from database
        const itinerary = await db.query.itineraries.findFirst({
            where: and(
                eq(itineraries.id, itineraryId),
                eq(itineraries.userId, userId)
            )
        })

        if (!itinerary) {
            return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
        }

        return NextResponse.json({ itinerary })
    } catch (error) {
        console.error('Failed to get itinerary:', error)
        return NextResponse.json({ error: 'Failed to get itinerary' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ itineraryId: string }> }
) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id
        const { itineraryId } = await params
        const data = await request.json()

        // Validate the request body
        const validatedData = itineraryUpdateSchema.parse(data)

        // Check if itinerary exists and belongs to user
        const existingItinerary = await db.query.itineraries.findFirst({
            where: and(
                eq(itineraries.id, itineraryId),
                eq(itineraries.userId, userId)
            )
        })

        if (!existingItinerary) {
            return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
        }

        // Update the itinerary
        const updatedItinerary = await db.update(itineraries)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(and(
                eq(itineraries.id, itineraryId),
                eq(itineraries.userId, userId)
            ))
            .returning()

        return NextResponse.json({
            message: 'Itinerary updated successfully',
            itinerary: updatedItinerary[0]
        })
    } catch (error) {
        console.error('Failed to update itinerary:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.format() }, { status: 400 })
        }

        return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ itineraryId: string }> }
) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id
        const { itineraryId } = await params

        // Check if itinerary exists and belongs to user
        const existingItinerary = await db.query.itineraries.findFirst({
            where: and(
                eq(itineraries.id, itineraryId),
                eq(itineraries.userId, userId)
            )
        })

        if (!existingItinerary) {
            return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
        }

        // Delete the itinerary
        await db.delete(itineraries)
            .where(and(
                eq(itineraries.id, itineraryId),
                eq(itineraries.userId, userId)
            ))

        return NextResponse.json({
            message: 'Itinerary deleted successfully'
        })
    } catch (error) {
        console.error('Failed to delete itinerary:', error)
        return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 })
    }
}