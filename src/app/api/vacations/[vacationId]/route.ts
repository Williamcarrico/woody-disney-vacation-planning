import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { vacations } from '@/db/schema/vacations'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'

// Validation schema for vacation ID parameter
const vacationParamsSchema = z.object({
    vacationId: z.string().uuid('Invalid vacation ID format')
})

// Enhanced vacation response schema with computed fields
const vacationResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    destination: z.string(),
    budget: z.object({
        total: z.number(),
        spent: z.number(),
        categories: z.record(z.object({
            planned: z.number(),
            actual: z.number()
        }))
    }).nullable(),
    travelers: z.object({
        adults: z.number(),
        children: z.number(),
        childrenAges: z.array(z.number()).optional()
    }),
    accommodations: z.object({
        resortId: z.string().optional(),
        resortName: z.string().optional(),
        roomType: z.string().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        confirmationNumber: z.string().optional()
    }).nullable(),
    notes: z.string().nullable(),
    isArchived: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    // Computed fields
    durationDays: z.number(),
    partySize: z.number(),
    budgetPerPerson: z.number().nullable(),
    budgetPerDay: z.number().nullable(),
    status: z.enum(['upcoming', 'active', 'completed', 'archived']),
    daysUntilTrip: z.number().nullable(),
    formattedDateRange: z.string()
})

/**
 * GET /api/vacations/[vacationId]
 * Retrieves detailed vacation information by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vacationId: string }> }
) {
    try {
        // Authenticate user
        const session = await auth()
        if (!session?.user) {
            return errorResponse(
                'Authentication required',
                ErrorCodes.AUTHENTICATION,
                401
            )
        }

        // Validate vacation ID parameter
        const resolvedParams = await params
        const paramValidation = vacationParamsSchema.safeParse(resolvedParams)
        if (!paramValidation.success) {
            return errorResponse(
                'Invalid vacation ID format',
                ErrorCodes.VALIDATION,
                400
            )
        }

        const { vacationId } = paramValidation.data

        // Fetch vacation from database with user authorization
        const vacation = await db.query.vacations.findFirst({
            where: and(
                eq(vacations.id, vacationId),
                eq(vacations.userId, session.user.id)
            )
        })

        if (!vacation) {
            return errorResponse(
                'Vacation not found or access denied',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Calculate computed fields
        const startDate = new Date(vacation.startDate)
        const endDate = new Date(vacation.endDate)
        const today = new Date()

        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const partySize = vacation.travelers.adults + vacation.travelers.children
        const budgetPerPerson = vacation.budget?.total ? vacation.budget.total / partySize : null
        const budgetPerDay = vacation.budget?.total ? vacation.budget.total / durationDays : null

        // Determine vacation status
        let status: 'upcoming' | 'active' | 'completed' | 'archived'
        if (vacation.isArchived) {
            status = 'archived'
        } else if (today < startDate) {
            status = 'upcoming'
        } else if (today >= startDate && today <= endDate) {
            status = 'active'
        } else {
            status = 'completed'
        }

        const daysUntilTrip = status === 'upcoming'
            ? Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : null

        // Format date range for display
        const formatOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
        }

        const formattedStartDate = startDate.toLocaleDateString('en-US', formatOptions)
        const formattedEndDate = endDate.toLocaleDateString('en-US', formatOptions)
        const formattedDateRange = startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() === endDate.getMonth()
            ? `${formattedStartDate.replace(/,.*/, '')}-${formattedEndDate}`
            : `${formattedStartDate} - ${formattedEndDate}`

        // Construct enhanced response
        const enhancedVacation = {
            ...vacation,
            startDate: vacation.startDate,
            endDate: vacation.endDate,
            createdAt: vacation.createdAt.toISOString(),
            updatedAt: vacation.updatedAt.toISOString(),
            durationDays,
            partySize,
            budgetPerPerson,
            budgetPerDay,
            status,
            daysUntilTrip,
            formattedDateRange
        }

        // Validate response structure
        const validatedResponse = vacationResponseSchema.parse(enhancedVacation)

        return successResponse({
            vacation: validatedResponse,
            metadata: {
                fetchedAt: new Date().toISOString(),
                computedFields: {
                    durationDays,
                    partySize,
                    budgetPerPerson,
                    budgetPerDay,
                    status,
                    daysUntilTrip,
                    formattedDateRange
                }
            }
        })

    } catch (error) {
        console.error('Error fetching vacation:', error)

        if (error instanceof z.ZodError) {
            return errorResponse(
                'Data validation failed',
                ErrorCodes.VALIDATION,
                400
            )
        }

        return errorResponse(
            'Failed to retrieve vacation data',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

/**
 * PATCH /api/vacations/[vacationId]
 * Updates vacation information
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ vacationId: string }> }
) {
    try {
        // Authenticate user
        const session = await auth()
        if (!session?.user) {
            return errorResponse(
                'Authentication required',
                ErrorCodes.AUTHENTICATION,
                401
            )
        }

        // Validate vacation ID parameter
        const resolvedParams = await params
        const paramValidation = vacationParamsSchema.safeParse(resolvedParams)
        if (!paramValidation.success) {
            return errorResponse(
                'Invalid vacation ID format',
                ErrorCodes.VALIDATION,
                400
            )
        }

        const { vacationId } = paramValidation.data

        // Parse and validate request body
        const body = await request.json()

        // Define update schema (partial vacation data)
        const updateSchema = z.object({
            name: z.string().min(1).max(100).optional(),
            startDate: z.string().date().optional(),
            endDate: z.string().date().optional(),
            destination: z.string().min(1).max(100).optional(),
            budget: z.object({
                total: z.number().min(0),
                spent: z.number().min(0),
                categories: z.record(z.object({
                    planned: z.number().min(0),
                    actual: z.number().min(0)
                }))
            }).optional(),
            travelers: z.object({
                adults: z.number().min(1).max(20),
                children: z.number().min(0).max(20),
                childrenAges: z.array(z.number().min(0).max(17)).optional()
            }).optional(),
            accommodations: z.object({
                resortId: z.string().optional(),
                resortName: z.string().optional(),
                roomType: z.string().optional(),
                checkInDate: z.string().date().optional(),
                checkOutDate: z.string().date().optional(),
                confirmationNumber: z.string().optional()
            }).optional(),
            notes: z.string().max(1000).optional(),
            isArchived: z.boolean().optional()
        })

        const validatedUpdates = updateSchema.parse(body)

        // Verify vacation exists and user has access
        const existingVacation = await db.query.vacations.findFirst({
            where: and(
                eq(vacations.id, vacationId),
                eq(vacations.userId, session.user.id)
            )
        })

        if (!existingVacation) {
            return errorResponse(
                'Vacation not found or access denied',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Validate date logic if dates are being updated
        if (validatedUpdates.startDate || validatedUpdates.endDate) {
            const startDate = new Date(validatedUpdates.startDate || existingVacation.startDate)
            const endDate = new Date(validatedUpdates.endDate || existingVacation.endDate)

            if (startDate >= endDate) {
                return errorResponse(
                    'End date must be after start date',
                    ErrorCodes.VALIDATION,
                    400
                )
            }
        }

        // Update vacation in database
        const updatedVacation = await db.update(vacations)
            .set({
                ...validatedUpdates,
                updatedAt: new Date()
            })
            .where(and(
                eq(vacations.id, vacationId),
                eq(vacations.userId, session.user.id)
            ))
            .returning()

        if (updatedVacation.length === 0) {
            return errorResponse(
                'Failed to update vacation',
                ErrorCodes.SERVER_ERROR,
                500
            )
        }

        return successResponse({
            message: 'Vacation updated successfully',
            vacation: {
                ...updatedVacation[0],
                createdAt: updatedVacation[0].createdAt.toISOString(),
                updatedAt: updatedVacation[0].updatedAt.toISOString()
            }
        })

    } catch (error) {
        console.error('Error updating vacation:', error)

        if (error instanceof z.ZodError) {
            return errorResponse(
                'Invalid update data',
                ErrorCodes.VALIDATION,
                400
            )
        }

        return errorResponse(
            'Failed to update vacation',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}

/**
 * DELETE /api/vacations/[vacationId]
 * Soft deletes a vacation (archives it)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ vacationId: string }> }
) {
    try {
        // Authenticate user
        const session = await auth()
        if (!session?.user) {
            return errorResponse(
                'Authentication required',
                ErrorCodes.AUTHENTICATION,
                401
            )
        }

        // Validate vacation ID parameter
        const resolvedParams = await params
        const paramValidation = vacationParamsSchema.safeParse(resolvedParams)
        if (!paramValidation.success) {
            return errorResponse(
                'Invalid vacation ID format',
                ErrorCodes.VALIDATION,
                400
            )
        }

        const { vacationId } = paramValidation.data

        // Verify vacation exists and user has access
        const existingVacation = await db.query.vacations.findFirst({
            where: and(
                eq(vacations.id, vacationId),
                eq(vacations.userId, session.user.id)
            )
        })

        if (!existingVacation) {
            return errorResponse(
                'Vacation not found or access denied',
                ErrorCodes.NOT_FOUND,
                404
            )
        }

        // Soft delete by archiving
        const archivedVacation = await db.update(vacations)
            .set({
                isArchived: true,
                updatedAt: new Date()
            })
            .where(and(
                eq(vacations.id, vacationId),
                eq(vacations.userId, session.user.id)
            ))
            .returning()

        if (archivedVacation.length === 0) {
            return errorResponse(
                'Failed to archive vacation',
                ErrorCodes.SERVER_ERROR,
                500
            )
        }

        return successResponse({
            message: 'Vacation archived successfully',
            vacationId
        })

    } catch (error) {
        console.error('Error archiving vacation:', error)
        return errorResponse(
            'Failed to archive vacation',
            ErrorCodes.SERVER_ERROR,
            500
        )
    }
}