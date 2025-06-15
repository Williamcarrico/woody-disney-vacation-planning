/**
 * Enhanced Firebase Vacation Service
 * 
 * Wraps the Firebase vacation service with additional features:
 * - Service response wrappers with metadata
 * - Custom error handling
 * - Retry logic
 * - Data transformation utilities
 * - Compatibility layer for existing code
 */

import { VacationService as FirebaseVacationService } from './vacation-service'
import type { FirebaseVacation, VacationFilters } from './vacation-service'
import { Timestamp } from 'firebase/firestore'
import { z } from 'zod'

// Re-export the Firebase vacation service
export { vacationService as firebaseVacationService } from './vacation-service'

// =============================================================================
// TYPE DEFINITIONS & SCHEMAS
// =============================================================================

// Enhanced vacation data schema matching the generic service
export const VacationSchema = z.object({
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

export type Vacation = z.infer<typeof VacationSchema>

// Vacation update schema
export const VacationUpdateSchema = VacationSchema.partial().omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    durationDays: true,
    partySize: true,
    budgetPerPerson: true,
    budgetPerDay: true,
    status: true,
    daysUntilTrip: true,
    formattedDateRange: true
})

export type VacationUpdate = z.infer<typeof VacationUpdateSchema>

// Service response types
export interface VacationServiceResponse<T = unknown> {
    success: boolean
    data?: T
    error?: VacationServiceError
    metadata?: {
        fetchedAt: string
        cached: boolean
        requestId: string
        performance: {
            duration: number
            retryCount: number
        }
    }
}

// =============================================================================
// CUSTOM ERROR HANDLING
// =============================================================================

export class VacationServiceError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: unknown
    ) {
        super(message)
        this.name = 'VacationServiceError'
    }
}

export enum VacationErrorCodes {
    NETWORK_ERROR = 'NETWORK_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    CACHE_ERROR = 'CACHE_ERROR',
    PARSE_ERROR = 'PARSE_ERROR'
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert Firebase vacation to enhanced vacation format
 */
function convertFirebaseToVacation(firebaseVacation: FirebaseVacation): Vacation {
    const startDate = firebaseVacation.startDate instanceof Timestamp ? 
        firebaseVacation.startDate.toDate() : new Date(firebaseVacation.startDate)
    const endDate = firebaseVacation.endDate instanceof Timestamp ?
        firebaseVacation.endDate.toDate() : new Date(firebaseVacation.endDate)
    const createdAt = firebaseVacation.createdAt instanceof Timestamp ?
        firebaseVacation.createdAt.toDate() : new Date(firebaseVacation.createdAt)
    const updatedAt = firebaseVacation.updatedAt instanceof Timestamp ?
        firebaseVacation.updatedAt.toDate() : new Date(firebaseVacation.updatedAt)

    const now = new Date()
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const partySize = firebaseVacation.travelers.adults + firebaseVacation.travelers.children
    const budgetPerPerson = firebaseVacation.budget?.total ? 
        firebaseVacation.budget.total / partySize : null
    const budgetPerDay = firebaseVacation.budget?.total ? 
        firebaseVacation.budget.total / durationDays : null

    let status: Vacation['status'] = 'upcoming'
    let daysUntilTrip: number | null = null

    if (firebaseVacation.isArchived) {
        status = 'archived'
    } else if (startDate > now) {
        status = 'upcoming'
        daysUntilTrip = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    } else if (endDate < now) {
        status = 'completed'
    } else {
        status = 'active'
    }

    const formattedDateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`

    return {
        ...firebaseVacation,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        durationDays,
        partySize,
        budgetPerPerson,
        budgetPerDay,
        status,
        daysUntilTrip,
        formattedDateRange
    }
}

/**
 * Format vacation for display
 */
export function formatVacationForDisplay(vacation: Vacation) {
    const startDate = new Date(vacation.startDate)
    const endDate = new Date(vacation.endDate)

    return {
        ...vacation,
        formattedDates: {
            start: startDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            end: endDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            range: vacation.formattedDateRange
        },
        formattedBudget: vacation.budget ? {
            total: `$${vacation.budget.total.toLocaleString()}`,
            spent: `$${vacation.budget.spent.toLocaleString()}`,
            remaining: `$${(vacation.budget.total - vacation.budget.spent).toLocaleString()}`,
            percentSpent: Math.round((vacation.budget.spent / vacation.budget.total) * 100)
        } : null,
        statusDisplay: vacation.status.charAt(0).toUpperCase() + vacation.status.slice(1),
        travelersDisplay: `${vacation.travelers.adults} adults, ${vacation.travelers.children} children`
    }
}

/**
 * Get recommended ticket type based on vacation details
 */
export function getRecommendedTicketType(vacation: Vacation): string {
    if (vacation.durationDays >= 7) {
        return '7-Day Park Hopper Plus'
    } else if (vacation.durationDays >= 5) {
        return '5-Day Park Hopper'
    } else if (vacation.durationDays >= 3) {
        return '3-Day Base Ticket'
    } else {
        return '1-Day Magic Your Way'
    }
}

// =============================================================================
// ENHANCED VACATION SERVICE CLASS
// =============================================================================

export class VacationService {
    private firebaseService: FirebaseVacationService
    private requestIdCounter = 0

    constructor() {
        this.firebaseService = FirebaseVacationService.getInstance()
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${++this.requestIdCounter}`
    }

    /**
     * Get vacation by ID
     */
    async getVacation(vacationId: string): Promise<VacationServiceResponse<Vacation>> {
        const requestId = this.generateRequestId()
        const startTime = Date.now()

        try {
            if (!vacationId || typeof vacationId !== 'string') {
                throw new VacationServiceError(
                    'Invalid vacation ID provided',
                    VacationErrorCodes.VALIDATION_ERROR,
                    400
                )
            }

            const firebaseVacation = await this.firebaseService.getVacationById(vacationId)

            if (!firebaseVacation) {
                throw new VacationServiceError(
                    'Vacation not found',
                    VacationErrorCodes.NOT_FOUND,
                    404
                )
            }

            const vacation = convertFirebaseToVacation(firebaseVacation)

            return {
                success: true,
                data: vacation,
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        } catch (error) {
            if (error instanceof VacationServiceError) {
                return {
                    success: false,
                    error,
                    metadata: {
                        fetchedAt: new Date().toISOString(),
                        cached: false,
                        requestId,
                        performance: {
                            duration: Date.now() - startTime,
                            retryCount: 0
                        }
                    }
                }
            }

            return {
                success: false,
                error: new VacationServiceError(
                    error instanceof Error ? error.message : 'Failed to get vacation',
                    VacationErrorCodes.SERVER_ERROR,
                    500,
                    { originalError: error }
                ),
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        }
    }

    /**
     * Update vacation
     */
    async updateVacation(
        vacationId: string,
        updates: VacationUpdate
    ): Promise<VacationServiceResponse<Vacation>> {
        const requestId = this.generateRequestId()
        const startTime = Date.now()

        try {
            if (!vacationId || typeof vacationId !== 'string') {
                throw new VacationServiceError(
                    'Invalid vacation ID provided',
                    VacationErrorCodes.VALIDATION_ERROR,
                    400
                )
            }

            // Validate update data
            const validatedUpdates = VacationUpdateSchema.parse(updates)

            // Convert dates to Firebase format if present
            const firebaseUpdates: any = { ...validatedUpdates }
            if (updates.startDate) {
                firebaseUpdates.startDate = new Date(updates.startDate)
            }
            if (updates.endDate) {
                firebaseUpdates.endDate = new Date(updates.endDate)
            }

            await this.firebaseService.updateVacation(vacationId, firebaseUpdates)

            // Get updated vacation
            const updatedFirebaseVacation = await this.firebaseService.getVacationById(vacationId)
            if (!updatedFirebaseVacation) {
                throw new VacationServiceError(
                    'Failed to retrieve updated vacation',
                    VacationErrorCodes.SERVER_ERROR,
                    500
                )
            }

            const vacation = convertFirebaseToVacation(updatedFirebaseVacation)

            return {
                success: true,
                data: vacation,
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        } catch (error) {
            if (error instanceof VacationServiceError) {
                return {
                    success: false,
                    error,
                    metadata: {
                        fetchedAt: new Date().toISOString(),
                        cached: false,
                        requestId,
                        performance: {
                            duration: Date.now() - startTime,
                            retryCount: 0
                        }
                    }
                }
            }

            return {
                success: false,
                error: new VacationServiceError(
                    error instanceof Error ? error.message : 'Failed to update vacation',
                    VacationErrorCodes.SERVER_ERROR,
                    500,
                    { originalError: error }
                ),
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        }
    }

    /**
     * Archive vacation
     */
    async archiveVacation(vacationId: string): Promise<VacationServiceResponse<{ vacationId: string }>> {
        const requestId = this.generateRequestId()
        const startTime = Date.now()

        try {
            if (!vacationId || typeof vacationId !== 'string') {
                throw new VacationServiceError(
                    'Invalid vacation ID provided',
                    VacationErrorCodes.VALIDATION_ERROR,
                    400
                )
            }

            await this.firebaseService.archiveVacation(vacationId)

            return {
                success: true,
                data: { vacationId },
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        } catch (error) {
            if (error instanceof VacationServiceError) {
                return {
                    success: false,
                    error,
                    metadata: {
                        fetchedAt: new Date().toISOString(),
                        cached: false,
                        requestId,
                        performance: {
                            duration: Date.now() - startTime,
                            retryCount: 0
                        }
                    }
                }
            }

            return {
                success: false,
                error: new VacationServiceError(
                    error instanceof Error ? error.message : 'Failed to archive vacation',
                    VacationErrorCodes.SERVER_ERROR,
                    500,
                    { originalError: error }
                ),
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId,
                    performance: {
                        duration: Date.now() - startTime,
                        retryCount: 0
                    }
                }
            }
        }
    }
}

// Export singleton instance
export const vacationService = new VacationService() 