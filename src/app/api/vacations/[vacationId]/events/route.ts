import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'
import { db, calendarEvents, vacations, eventHistory } from '@/db'
import { eq, and, asc, ne } from 'drizzle-orm'

// Validation schema for calendar events
const calendarEventSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required").max(100),
    date: z.string().datetime(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    type: z.enum(['park', 'dining', 'resort', 'travel', 'rest', 'event', 'note', 'fastpass', 'photo', 'shopping', 'entertainment']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['planned', 'confirmed', 'completed', 'cancelled', 'modified']),
    parkId: z.string().optional(),
    attractionId: z.string().optional(),
    locationName: z.string().optional(),
    isHighlighted: z.boolean().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    participants: z.array(z.string()).optional(),
    reminder: z.object({
        enabled: z.boolean(),
        time: z.string(),
        type: z.enum(['notification', 'email', 'sms'])
    }).optional(),
    reservation: z.object({
        id: z.string(),
        name: z.string(),
        time: z.string(),
        partySize: z.number(),
        confirmed: z.boolean(),
        confirmationNumber: z.string().optional(),
        specialRequests: z.string().optional(),
        cost: z.number().optional(),
        prepaid: z.boolean().optional()
    }).optional(),
    weather: z.object({
        condition: z.enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'partly-cloudy', 'windy']),
        highTemp: z.number(),
        lowTemp: z.number(),
        precipitation: z.number(),
        humidity: z.number(),
        windSpeed: z.number(),
        uvIndex: z.number(),
        visibility: z.number(),
        sunrise: z.string(),
        sunset: z.string(),
        moonPhase: z.enum(['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'])
    }).optional(),
    budget: z.object({
        estimated: z.number(),
        actual: z.number().optional(),
        currency: z.string(),
        category: z.string()
    }).optional(),
    transportation: z.object({
        type: z.enum(['bus', 'monorail', 'boat', 'skyliner', 'car', 'uber', 'walk']),
        pickupLocation: z.string().optional(),
        pickupTime: z.string().optional(),
        duration: z.number().optional()
    }).optional(),
    checklist: z.array(z.object({
        id: z.string(),
        task: z.string(),
        completed: z.boolean(),
        dueTime: z.string().optional()
    })).optional(),
    attachments: z.array(z.object({
        type: z.enum(['image', 'document', 'link']),
        url: z.string(),
        title: z.string(),
        thumbnail: z.string().optional()
    })).optional()
})

const updateEventSchema = z.object({
    eventId: z.string(),
    updates: calendarEventSchema.partial()
})

// GET - Retrieve all events for a vacation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vacationId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return errorResponse(
                'Authentication required',
                ErrorCodes.AUTHENTICATION,
                401
            )
        }

        const { vacationId } = await params
        const url = new URL(request.url)
        const eventId = url.searchParams.get('eventId')

        // Verify vacation exists and user has access
        const vacation = await db.query.vacations.findFirst({
            where: eq(vacations.id, vacationId)
        })

        if (!vacation) {
            return errorResponse(
                'Vacation not found',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Check if user has access to this vacation (owner or member)
        // For now, we'll check if the user is the creator or if they have access
        // In a more complex system, you'd check vacation membership
        const hasAccess = vacation.userId === session.user.id

        if (!hasAccess) {
            return errorResponse(
                'Access denied to this vacation',
                ErrorCodes.AUTHORIZATION,
                403
            )
        }

        // If requesting a specific event
        if (eventId) {
            const event = await db.query.calendarEvents.findFirst({
                where: and(
                    eq(calendarEvents.id, eventId),
                    eq(calendarEvents.vacationId, vacationId)
                ),
                with: {
                    user: {
                        columns: {
                            id: true,
                            email: true,
                            displayName: true,
                            photoURL: true
                        }
                    }
                }
            })

            if (!event) {
                return errorResponse(
                    'Event not found',
                    ErrorCodes.NOT_FOUND,
                    404
                )
            }

            // Check if user has access to this specific event
            const eventAccess = event.userId === session.user.id || hasAccess

            if (!eventAccess) {
                return errorResponse(
                    'Access denied to this event',
                    ErrorCodes.AUTHORIZATION,
                    403
                )
            }

            return successResponse({
                event: {
                    ...event,
                    creator: event.user
                }
            })
        }

        // Fetch all events for the vacation with optional filtering
        const statusFilter = url.searchParams.get('status')
        const typeFilter = url.searchParams.get('type')
        const startDate = url.searchParams.get('startDate')
        const endDate = url.searchParams.get('endDate')
        const limit = parseInt(url.searchParams.get('limit') || '100')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        // Build where conditions
        const whereConditions = [eq(calendarEvents.vacationId, vacationId)]

        if (statusFilter) {
            whereConditions.push(eq(calendarEvents.status, statusFilter as 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified'))
        }

        if (typeFilter) {
            whereConditions.push(eq(calendarEvents.type, typeFilter as 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment'))
        }

        // Date range filtering would require additional logic for timestamp comparison
        // For now, we'll implement basic filtering

        const events = await db.query.calendarEvents.findMany({
            where: and(...whereConditions),
            orderBy: [asc(calendarEvents.date), asc(calendarEvents.startTime)],
            limit: Math.min(limit, 500), // Cap at 500 events
            offset,
            with: {
                user: {
                    columns: {
                        id: true,
                        email: true,
                        displayName: true,
                        photoURL: true
                    }
                }
            }
        })

        // Get total count for pagination
        const totalCount = await db.$count(calendarEvents, and(...whereConditions))

        return successResponse({
            events: events.map(event => ({
                ...event,
                creator: event.user
            })),
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + events.length < totalCount
            },
            filters: {
                status: statusFilter,
                type: typeFilter,
                startDate,
                endDate
            }
        })

    } catch (error) {
        console.error('Failed to get calendar events:', error)
        return errorResponse(
            'Failed to retrieve calendar events',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// POST - Create a new event
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ vacationId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return errorResponse(
                'Authentication required',
                ErrorCodes.AUTHENTICATION,
                401
            )
        }

        const { vacationId } = await params
        const data = await request.json()

        // Validate the request body
        const validatedData = calendarEventSchema.parse(data)

        // Verify vacation exists and user has access
        const vacation = await db.query.vacations.findFirst({
            where: eq(vacations.id, vacationId)
        })

        if (!vacation) {
            return errorResponse(
                'Vacation not found',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Check if user has access to this vacation
        const hasAccess = vacation.userId === session.user.id

        if (!hasAccess) {
            return errorResponse(
                'Access denied to this vacation',
                ErrorCodes.AUTHORIZATION,
                403
            )
        }

        // Validate date is within vacation date range
        const eventDate = new Date(validatedData.date)
        const vacationStart = new Date(vacation.startDate)
        const vacationEnd = new Date(vacation.endDate)

        if (eventDate < vacationStart || eventDate > vacationEnd) {
            return errorResponse(
                'Event date must be within vacation date range',
                ErrorCodes.VALIDATION,
                400
            )
        }

        // Check for conflicting events if this is a time-specific event
        if (validatedData.startTime && validatedData.endTime) {
            const conflictingEvents = await db.query.calendarEvents.findMany({
                where: and(
                    eq(calendarEvents.vacationId, vacationId),
                    eq(calendarEvents.userId, session.user.id),
                    eq(calendarEvents.date, eventDate),
                    eq(calendarEvents.status, 'confirmed')
                )
            })

            // Check for time overlaps
            const hasConflict = conflictingEvents.some(event => {
                if (!event.startTime || !event.endTime) return false

                const eventStart = validatedData.startTime!
                const eventEnd = validatedData.endTime!
                const existingStart = event.startTime
                const existingEnd = event.endTime

                // Check if times overlap
                return (eventStart < existingEnd && eventEnd > existingStart)
            })

            if (hasConflict) {
                return errorResponse(
                    'Event conflicts with existing confirmed event',
                    ErrorCodes.VALIDATION,
                    400
                )
            }
        }

        // Prepare event data for insertion
        const eventData = {
            vacationId,
            userId: session.user.id,
            title: validatedData.title,
            date: eventDate,
            startTime: validatedData.startTime,
            endTime: validatedData.endTime,
            type: validatedData.type,
            priority: validatedData.priority || 'medium',
            status: validatedData.status || 'planned',
            parkId: validatedData.parkId,
            attractionId: validatedData.attractionId,
            locationName: validatedData.locationName,
            isHighlighted: validatedData.isHighlighted || false,
            notes: validatedData.notes,
            tags: validatedData.tags,
            color: validatedData.color,
            icon: validatedData.icon,
            participants: validatedData.participants,
            reminder: validatedData.reminder,
            reservation: validatedData.reservation,
            weather: validatedData.weather,
            budget: validatedData.budget,
            transportation: validatedData.transportation,
            checklist: validatedData.checklist,
            attachments: validatedData.attachments
        }

        // Save to database
        const [newEvent] = await db.insert(calendarEvents).values(eventData).returning()

        // Log the creation in event history
        await db.insert(eventHistory).values({
            eventId: newEvent.id,
            userId: session.user.id,
            action: 'created',
            changes: {
                created: eventData
            }
        })

        // Fetch the complete event with user information
        const completeEvent = await db.query.calendarEvents.findFirst({
            where: eq(calendarEvents.id, newEvent.id),
            with: {
                user: {
                    columns: {
                        id: true,
                        email: true,
                        displayName: true,
                        photoURL: true
                    }
                }
            }
        })

        return successResponse({
            message: 'Event created successfully',
            event: {
                ...completeEvent,
                creator: completeEvent?.user
            }
        }, 201)

    } catch (error) {
        console.error('Failed to create calendar event:', error)

        if (error instanceof z.ZodError) {
            return errorResponse(
                'Invalid event data',
                ErrorCodes.VALIDATION,
                400
            )
        }

        return errorResponse(
            'Failed to create calendar event',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// PATCH - Update an existing event
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ vacationId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return errorResponse(
                'Authentication required',
                ErrorCodes.AUTHENTICATION,
                401
            )
        }

        const { vacationId } = await params
        const data = await request.json()

        // Validate the request body
        const { eventId, updates } = updateEventSchema.parse(data)

        // Verify vacation exists and user has access
        const vacation = await db.query.vacations.findFirst({
            where: eq(vacations.id, vacationId)
        })

        if (!vacation) {
            return errorResponse(
                'Vacation not found',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Check if user has access to this vacation
        const hasVacationAccess = vacation.userId === session.user.id

        if (!hasVacationAccess) {
            return errorResponse(
                'Access denied to this vacation',
                ErrorCodes.AUTHORIZATION,
                403
            )
        }

        // Verify event exists and user has access
        const existingEvent = await db.query.calendarEvents.findFirst({
            where: and(
                eq(calendarEvents.id, eventId),
                eq(calendarEvents.vacationId, vacationId)
            )
        })

        if (!existingEvent) {
            return errorResponse(
                'Event not found',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Check if user has access to this specific event
        const hasEventAccess = existingEvent.userId === session.user.id || hasVacationAccess

        if (!hasEventAccess) {
            return errorResponse(
                'Access denied to this event',
                ErrorCodes.AUTHORIZATION,
                403
            )
        }

        // Validate date is within vacation date range if date is being updated
        if (updates.date) {
            const eventDate = new Date(updates.date)
            const vacationStart = new Date(vacation.startDate)
            const vacationEnd = new Date(vacation.endDate)

            if (eventDate < vacationStart || eventDate > vacationEnd) {
                return errorResponse(
                    'Event date must be within vacation date range',
                    ErrorCodes.VALIDATION,
                    400
                )
            }
        }

        // Check for conflicting events if time is being updated
        if ((updates.startTime || updates.endTime) && (updates.date || existingEvent.date)) {
            const eventDate = updates.date ? new Date(updates.date) : existingEvent.date
            const startTime = updates.startTime || existingEvent.startTime
            const endTime = updates.endTime || existingEvent.endTime

            if (startTime && endTime) {
                const conflictingEvents = await db.query.calendarEvents.findMany({
                    where: and(
                        eq(calendarEvents.vacationId, vacationId),
                        eq(calendarEvents.userId, session.user.id),
                        eq(calendarEvents.date, eventDate),
                        eq(calendarEvents.status, 'confirmed'),
                        // Exclude the current event from conflict check
                        ne(calendarEvents.id, eventId)
                    )
                })

                // Check for time overlaps
                const hasConflict = conflictingEvents.some(event => {
                    if (!event.startTime || !event.endTime) return false

                    const existingStart = event.startTime
                    const existingEnd = event.endTime

                    // Check if times overlap
                    return (startTime < existingEnd && endTime > existingStart)
                })

                if (hasConflict) {
                    return errorResponse(
                        'Updated event conflicts with existing confirmed event',
                        ErrorCodes.VALIDATION,
                        400
                    )
                }
            }
        }

        // Prepare update data, filtering out undefined values
        const updateData: Partial<typeof calendarEvents.$inferInsert> = {}

        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.date !== undefined) updateData.date = new Date(updates.date)
        if (updates.startTime !== undefined) updateData.startTime = updates.startTime
        if (updates.endTime !== undefined) updateData.endTime = updates.endTime
        if (updates.type !== undefined) updateData.type = updates.type
        if (updates.priority !== undefined) updateData.priority = updates.priority
        if (updates.status !== undefined) updateData.status = updates.status
        if (updates.parkId !== undefined) updateData.parkId = updates.parkId
        if (updates.attractionId !== undefined) updateData.attractionId = updates.attractionId
        if (updates.locationName !== undefined) updateData.locationName = updates.locationName
        if (updates.isHighlighted !== undefined) updateData.isHighlighted = updates.isHighlighted
        if (updates.notes !== undefined) updateData.notes = updates.notes
        if (updates.tags !== undefined) updateData.tags = updates.tags
        if (updates.color !== undefined) updateData.color = updates.color
        if (updates.icon !== undefined) updateData.icon = updates.icon
        if (updates.participants !== undefined) updateData.participants = updates.participants
        if (updates.reminder !== undefined) updateData.reminder = updates.reminder
        if (updates.reservation !== undefined) updateData.reservation = updates.reservation
        if (updates.weather !== undefined) updateData.weather = updates.weather
        if (updates.budget !== undefined) updateData.budget = updates.budget
        if (updates.transportation !== undefined) updateData.transportation = updates.transportation
        if (updates.checklist !== undefined) updateData.checklist = updates.checklist
        if (updates.attachments !== undefined) updateData.attachments = updates.attachments

        // Always update the updatedAt timestamp
        updateData.updatedAt = new Date()

        // Update in database
        await db.update(calendarEvents)
            .set(updateData)
            .where(and(
                eq(calendarEvents.id, eventId),
                eq(calendarEvents.vacationId, vacationId)
            ))

        // Log the update in event history
        await db.insert(eventHistory).values({
            eventId: eventId,
            userId: session.user.id,
            action: 'updated',
            changes: {
                before: existingEvent,
                after: updateData,
                fieldsChanged: Object.keys(updateData).filter(key => key !== 'updatedAt')
            }
        })

        // Fetch the complete updated event with user information
        const completeEvent = await db.query.calendarEvents.findFirst({
            where: eq(calendarEvents.id, eventId),
            with: {
                user: {
                    columns: {
                        id: true,
                        email: true,
                        displayName: true,
                        photoURL: true
                    }
                }
            }
        })

        return successResponse({
            message: 'Event updated successfully',
            event: {
                ...completeEvent,
                creator: completeEvent?.user
            }
        })

    } catch (error) {
        console.error('Failed to update calendar event:', error)

        if (error instanceof z.ZodError) {
            return errorResponse(
                'Invalid update data',
                ErrorCodes.VALIDATION,
                400
            )
        }

        return errorResponse(
            'Failed to update calendar event',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

// DELETE - Remove an event
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ vacationId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return errorResponse(
                'Authentication required',
                ErrorCodes.AUTHENTICATION,
                401
            )
        }

        const { vacationId } = await params
        const url = new URL(request.url)
        const eventId = url.searchParams.get('eventId')

        if (!eventId) {
            return errorResponse(
                'Event ID is required',
                ErrorCodes.VALIDATION,
                400
            )
        }

        // Verify vacation exists and user has access
        const vacation = await db.query.vacations.findFirst({
            where: eq(vacations.id, vacationId)
        })

        if (!vacation) {
            return errorResponse(
                'Vacation not found',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Check if user has access to this vacation
        const hasVacationAccess = vacation.userId === session.user.id

        if (!hasVacationAccess) {
            return errorResponse(
                'Access denied to this vacation',
                ErrorCodes.AUTHORIZATION,
                403
            )
        }

        // Verify event exists and user has access
        const existingEvent = await db.query.calendarEvents.findFirst({
            where: and(
                eq(calendarEvents.id, eventId),
                eq(calendarEvents.vacationId, vacationId)
            )
        })

        if (!existingEvent) {
            return errorResponse(
                'Event not found',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Check if user has access to this specific event
        const hasEventAccess = existingEvent.userId === session.user.id || hasVacationAccess

        if (!hasEventAccess) {
            return errorResponse(
                'Access denied to this event',
                ErrorCodes.AUTHORIZATION,
                403
            )
        }

        // Check if event can be deleted (e.g., not if it's a confirmed reservation)
        if (existingEvent.status === 'confirmed' && existingEvent.reservation) {
            return errorResponse(
                'Cannot delete confirmed reservation. Please cancel the reservation first.',
                ErrorCodes.VALIDATION,
                400
            )
        }

        // Log the deletion in event history before deleting
        await db.insert(eventHistory).values({
            eventId: eventId,
            userId: session.user.id,
            action: 'deleted',
            changes: {
                deletedEvent: existingEvent
            }
        })

        // Delete from database
        await db.delete(calendarEvents)
            .where(and(
                eq(calendarEvents.id, eventId),
                eq(calendarEvents.vacationId, vacationId)
            ))

        return successResponse({
            message: 'Event deleted successfully',
            deletedEventId: eventId
        })

    } catch (error) {
        console.error('Failed to delete calendar event:', error)
        return errorResponse(
            'Failed to delete calendar event',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}