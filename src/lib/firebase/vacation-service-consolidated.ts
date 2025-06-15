/**
 * Consolidated Firebase Vacation Service
 * 
 * Combines the best features of both vacation-service.ts and vacation-service-enhanced.ts:
 * - All CRUD operations from the base service
 * - Enhanced error handling and response metadata
 * - Data transformation utilities
 * - Real-time listeners
 * - Batch operations
 * - Performance monitoring
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  onSnapshot,
  type Unsubscribe,
  startAfter,
  type DocumentSnapshot
} from 'firebase/firestore'
import { firestore as database } from './firebase.config'
import { COLLECTIONS, type FirebaseVacation, timestampToFirebase } from './collections'
import {
  type VacationData,
  type VacationUpdateData,
  type FirestoreVacationData,
  safeTimestampToFirebase,
  firestoreToVacationData,
  isValidDate
} from '@/lib/schemas/firebase-types'
import { z } from 'zod'

// =============================================================================
// TYPE DEFINITIONS & SCHEMAS
// =============================================================================

// Enhanced vacation data schema
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

// Filter and pagination types
export interface VacationFilters {
  userId?: string
  destination?: string
  isArchived?: boolean
  startDateAfter?: Date
  startDateBefore?: Date
  endDateAfter?: Date
  endDateBefore?: Date
}

export interface PaginationOptions {
  limit?: number
  lastDoc?: DocumentSnapshot
}

export interface VacationStats {
  total: number
  active: number
  archived: number
  upcoming: number
  current: number
  past: number
  totalSpent: number
  averageDuration: number
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
// CONSOLIDATED VACATION SERVICE CLASS
// =============================================================================

export class VacationService {
  private static instance: VacationService
  private requestIdCounter = 0

  public static getInstance(): VacationService {
    if (!VacationService.instance) {
      VacationService.instance = new VacationService()
    }
    return VacationService.instance
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestIdCounter}`
  }

  private createMetadata(startTime: number, requestId: string, cached: boolean = false, retryCount: number = 0) {
    return {
      fetchedAt: new Date().toISOString(),
      cached,
      requestId,
      performance: {
        duration: Date.now() - startTime,
        retryCount
      }
    }
  }

  private handleError(error: unknown, defaultMessage: string, startTime: number, requestId: string): VacationServiceResponse {
    if (error instanceof VacationServiceError) {
      return {
        success: false,
        error,
        metadata: this.createMetadata(startTime, requestId)
      }
    }

    return {
      success: false,
      error: new VacationServiceError(
        error instanceof Error ? error.message : defaultMessage,
        VacationErrorCodes.SERVER_ERROR,
        500,
        { originalError: error }
      ),
      metadata: this.createMetadata(startTime, requestId)
    }
  }

  /**
   * Create a new vacation
   */
  async createVacation(
    vacationData: Omit<FirebaseVacation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<VacationServiceResponse<Vacation>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationRef = doc(collection(database, COLLECTIONS.VACATIONS))
      const now = Timestamp.now()

      const vacation: FirebaseVacation = {
        ...vacationData,
        id: vacationRef.id,
        createdAt: now,
        updatedAt: now,
        startDate: safeTimestampToFirebase(vacationData.startDate),
        endDate: safeTimestampToFirebase(vacationData.endDate)
      }

      await setDoc(vacationRef, vacation)
      const enhancedVacation = convertFirebaseToVacation(vacation)

      return {
        success: true,
        data: enhancedVacation,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to create vacation', startTime, requestId)
    }
  }

  /**
   * Get vacation by ID (with both Firebase and enhanced formats)
   */
  async getVacationById(
    vacationId: string,
    options?: { format?: 'firebase' | 'enhanced' }
  ): Promise<VacationServiceResponse<FirebaseVacation | Vacation>> {
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

      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      const vacationSnap = await getDoc(vacationRef)

      if (!vacationSnap.exists()) {
        throw new VacationServiceError(
          'Vacation not found',
          VacationErrorCodes.NOT_FOUND,
          404
        )
      }

      const firebaseVacation = vacationSnap.data() as FirebaseVacation
      const data = options?.format === 'firebase' 
        ? firebaseVacation 
        : convertFirebaseToVacation(firebaseVacation)

      return {
        success: true,
        data,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get vacation', startTime, requestId)
    }
  }

  /**
   * Get vacations by user ID
   */
  async getVacationsByUserId(
    userId: string,
    options: PaginationOptions & { format?: 'firebase' | 'enhanced' } = {}
  ): Promise<VacationServiceResponse<{
    vacations: (FirebaseVacation | Vacation)[]
    lastDoc?: DocumentSnapshot
    hasMore: boolean
  }>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
      let q = query(
        vacationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      if (options.limit) {
        q = query(q, limit(options.limit))
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc))
      }

      const querySnapshot = await getDocs(q)
      const firebaseVacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
      const vacations = options.format === 'firebase'
        ? firebaseVacations
        : firebaseVacations.map(convertFirebaseToVacation)

      return {
        success: true,
        data: {
          vacations,
          lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
          hasMore: querySnapshot.docs.length === (options.limit || 0)
        },
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get vacations by user', startTime, requestId)
    }
  }

  /**
   * Get active (non-archived) vacations for a user
   */
  async getActiveVacations(
    userId: string,
    options?: { format?: 'firebase' | 'enhanced' }
  ): Promise<VacationServiceResponse<(FirebaseVacation | Vacation)[]>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
      const q = query(
        vacationsRef,
        where('userId', '==', userId),
        where('isArchived', '==', false),
        orderBy('startDate', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const firebaseVacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
      const vacations = options?.format === 'firebase'
        ? firebaseVacations
        : firebaseVacations.map(convertFirebaseToVacation)

      return {
        success: true,
        data: vacations,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get active vacations', startTime, requestId)
    }
  }

  /**
   * Get current vacation (ongoing)
   */
  async getCurrentVacation(
    userId: string,
    options?: { format?: 'firebase' | 'enhanced' }
  ): Promise<VacationServiceResponse<FirebaseVacation | Vacation | null>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const now = Timestamp.now()
      const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
      const q = query(
        vacationsRef,
        where('userId', '==', userId),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        where('isArchived', '==', false),
        limit(1)
      )

      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        return {
          success: true,
          data: null,
          metadata: this.createMetadata(startTime, requestId)
        }
      }

      const firebaseVacation = querySnapshot.docs[0].data() as FirebaseVacation
      const data = options?.format === 'firebase'
        ? firebaseVacation
        : convertFirebaseToVacation(firebaseVacation)

      return {
        success: true,
        data,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get current vacation', startTime, requestId)
    }
  }

  /**
   * Get upcoming vacations
   */
  async getUpcomingVacations(
    userId: string,
    options?: { format?: 'firebase' | 'enhanced' }
  ): Promise<VacationServiceResponse<(FirebaseVacation | Vacation)[]>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const now = Timestamp.now()
      const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
      const q = query(
        vacationsRef,
        where('userId', '==', userId),
        where('startDate', '>', now),
        where('isArchived', '==', false),
        orderBy('startDate', 'asc')
      )

      const querySnapshot = await getDocs(q)
      const firebaseVacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
      const vacations = options?.format === 'firebase'
        ? firebaseVacations
        : firebaseVacations.map(convertFirebaseToVacation)

      return {
        success: true,
        data: vacations,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get upcoming vacations', startTime, requestId)
    }
  }

  /**
   * Update vacation
   */
  async updateVacation(
    vacationId: string,
    updates: Partial<Omit<FirebaseVacation, 'id' | 'createdAt' | 'updatedAt'>> | VacationUpdate
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

      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      }

      // Convert date fields to Timestamps if they exist
      if (updates.startDate) {
        updateData.startDate = safeTimestampToFirebase(updates.startDate)
      }
      if (updates.endDate) {
        updateData.endDate = safeTimestampToFirebase(updates.endDate)
      }

      await updateDoc(vacationRef, updateData)

      // Get updated vacation
      const updatedSnap = await getDoc(vacationRef)
      if (!updatedSnap.exists()) {
        throw new VacationServiceError(
          'Failed to retrieve updated vacation',
          VacationErrorCodes.SERVER_ERROR,
          500
        )
      }

      const updatedVacation = convertFirebaseToVacation(updatedSnap.data() as FirebaseVacation)

      return {
        success: true,
        data: updatedVacation,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to update vacation', startTime, requestId)
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

      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        isArchived: true,
        updatedAt: Timestamp.now()
      })

      return {
        success: true,
        data: { vacationId },
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to archive vacation', startTime, requestId)
    }
  }

  /**
   * Unarchive vacation
   */
  async unarchiveVacation(vacationId: string): Promise<VacationServiceResponse<{ vacationId: string }>> {
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

      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        isArchived: false,
        updatedAt: Timestamp.now()
      })

      return {
        success: true,
        data: { vacationId },
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to unarchive vacation', startTime, requestId)
    }
  }

  /**
   * Delete vacation
   */
  async deleteVacation(vacationId: string): Promise<VacationServiceResponse<{ vacationId: string }>> {
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

      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await deleteDoc(vacationRef)

      return {
        success: true,
        data: { vacationId },
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to delete vacation', startTime, requestId)
    }
  }

  /**
   * Update vacation budget
   */
  async updateVacationBudget(
    vacationId: string,
    budget: FirebaseVacation['budget']
  ): Promise<VacationServiceResponse<Vacation>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        budget,
        updatedAt: Timestamp.now()
      })

      // Get updated vacation
      const updatedSnap = await getDoc(vacationRef)
      if (!updatedSnap.exists()) {
        throw new VacationServiceError(
          'Failed to retrieve updated vacation',
          VacationErrorCodes.SERVER_ERROR,
          500
        )
      }

      const updatedVacation = convertFirebaseToVacation(updatedSnap.data() as FirebaseVacation)

      return {
        success: true,
        data: updatedVacation,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to update vacation budget', startTime, requestId)
    }
  }

  /**
   * Update vacation accommodations
   */
  async updateVacationAccommodations(
    vacationId: string,
    accommodations: FirebaseVacation['accommodations']
  ): Promise<VacationServiceResponse<Vacation>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        accommodations,
        updatedAt: Timestamp.now()
      })

      // Get updated vacation
      const updatedSnap = await getDoc(vacationRef)
      if (!updatedSnap.exists()) {
        throw new VacationServiceError(
          'Failed to retrieve updated vacation',
          VacationErrorCodes.SERVER_ERROR,
          500
        )
      }

      const updatedVacation = convertFirebaseToVacation(updatedSnap.data() as FirebaseVacation)

      return {
        success: true,
        data: updatedVacation,
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to update vacation accommodations', startTime, requestId)
    }
  }

  /**
   * Get vacation statistics for a user
   */
  async getVacationStats(userId: string): Promise<VacationServiceResponse<VacationStats>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
      const q = query(vacationsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      const vacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
      const now = new Date()

      let totalSpent = 0
      let totalDuration = 0

      const stats = vacations.reduce((acc, vacation) => {
        const startDate = vacation.startDate.toDate()
        const endDate = vacation.endDate.toDate()
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        totalDuration += duration
        if (vacation.budget?.spent) {
          totalSpent += vacation.budget.spent
        }

        if (vacation.isArchived) acc.archived++
        else acc.active++

        if (startDate > now) acc.upcoming++
        else if (endDate < now) acc.past++
        else acc.current++

        return acc
      }, {
        total: vacations.length,
        active: 0,
        archived: 0,
        upcoming: 0,
        current: 0,
        past: 0
      })

      return {
        success: true,
        data: {
          ...stats,
          totalSpent,
          averageDuration: vacations.length > 0 ? Math.round(totalDuration / vacations.length) : 0
        },
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to get vacation stats', startTime, requestId)
    }
  }

  /**
   * Search vacations by filters
   */
  async searchVacations(
    filters: VacationFilters,
    options: PaginationOptions & { format?: 'firebase' | 'enhanced' } = {}
  ): Promise<VacationServiceResponse<{
    vacations: (FirebaseVacation | Vacation)[]
    lastDoc?: DocumentSnapshot
    hasMore: boolean
  }>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
      let q = query(vacationsRef, orderBy('createdAt', 'desc'))

      // Apply filters
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId))
      }
      if (filters.destination) {
        q = query(q, where('destination', '==', filters.destination))
      }
      if (filters.isArchived !== undefined) {
        q = query(q, where('isArchived', '==', filters.isArchived))
      }
      if (filters.startDateAfter) {
        q = query(q, where('startDate', '>=', timestampToFirebase(filters.startDateAfter)))
      }
      if (filters.startDateBefore) {
        q = query(q, where('startDate', '<=', timestampToFirebase(filters.startDateBefore)))
      }

      if (options.limit) {
        q = query(q, limit(options.limit))
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc))
      }

      const querySnapshot = await getDocs(q)
      const firebaseVacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
      const vacations = options.format === 'firebase'
        ? firebaseVacations
        : firebaseVacations.map(convertFirebaseToVacation)

      return {
        success: true,
        data: {
          vacations,
          lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
          hasMore: querySnapshot.docs.length === (options.limit || 0)
        },
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to search vacations', startTime, requestId)
    }
  }

  /**
   * Listen to vacation changes in real-time
   */
  listenToVacation(
    vacationId: string, 
    callback: (vacation: Vacation | null) => void,
    options?: { format?: 'firebase' | 'enhanced' }
  ): Unsubscribe {
    const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)

    return onSnapshot(vacationRef, (doc) => {
      if (doc.exists()) {
        const firebaseVacation = doc.data() as FirebaseVacation
        const data = options?.format === 'firebase'
          ? firebaseVacation
          : convertFirebaseToVacation(firebaseVacation)
        callback(data as Vacation)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Error listening to vacation changes:', error)
      callback(null)
    })
  }

  /**
   * Listen to user's vacations in real-time
   */
  listenToUserVacations(
    userId: string, 
    callback: (vacations: Vacation[]) => void,
    options?: { format?: 'firebase' | 'enhanced' }
  ): Unsubscribe {
    const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
    const q = query(
      vacationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const firebaseVacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
      const vacations = options?.format === 'firebase'
        ? firebaseVacations
        : firebaseVacations.map(convertFirebaseToVacation)
      callback(vacations as Vacation[])
    }, (error) => {
      console.error('Error listening to user vacations:', error)
      callback([])
    })
  }

  /**
   * Batch update multiple vacations
   */
  async batchUpdateVacations(updates: Array<{
    vacationId: string
    data: Partial<Omit<FirebaseVacation, 'id' | 'createdAt' | 'updatedAt'>>
  }>): Promise<VacationServiceResponse<{ updated: number }>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const batch = writeBatch(database)
      const now = Timestamp.now()

      updates.forEach(({ vacationId, data }) => {
        const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
        const updateData: any = {
          ...data,
          updatedAt: now
        }

        // Convert date fields to Timestamps if they exist
        if (data.startDate) {
          updateData.startDate = safeTimestampToFirebase(data.startDate)
        }
        if (data.endDate) {
          updateData.endDate = safeTimestampToFirebase(data.endDate)
        }

        batch.update(vacationRef, updateData)
      })

      await batch.commit()

      return {
        success: true,
        data: { updated: updates.length },
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to batch update vacations', startTime, requestId)
    }
  }

  /**
   * Check if vacation exists
   */
  async vacationExists(vacationId: string): Promise<VacationServiceResponse<boolean>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      const vacationSnap = await getDoc(vacationRef)
      
      return {
        success: true,
        data: vacationSnap.exists(),
        metadata: this.createMetadata(startTime, requestId)
      }
    } catch (error) {
      return this.handleError(error, 'Failed to check if vacation exists', startTime, requestId)
    }
  }

  /**
   * Get vacation duration in days
   */
  getVacationDuration(vacation: FirebaseVacation | Vacation): number {
    if ('durationDays' in vacation) {
      return vacation.durationDays
    }
    
    const start = vacation.startDate instanceof Timestamp 
      ? vacation.startDate.toDate() 
      : new Date(vacation.startDate)
    const end = vacation.endDate instanceof Timestamp
      ? vacation.endDate.toDate()
      : new Date(vacation.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Check if vacation is current (ongoing)
   */
  isVacationCurrent(vacation: FirebaseVacation | Vacation): boolean {
    if ('status' in vacation) {
      return vacation.status === 'active'
    }

    const now = new Date()
    const start = vacation.startDate instanceof Timestamp
      ? vacation.startDate.toDate()
      : new Date(vacation.startDate)
    const end = vacation.endDate instanceof Timestamp
      ? vacation.endDate.toDate()
      : new Date(vacation.endDate)
    return start <= now && end >= now && !vacation.isArchived
  }

  /**
   * Check if vacation is upcoming
   */
  isVacationUpcoming(vacation: FirebaseVacation | Vacation): boolean {
    if ('status' in vacation) {
      return vacation.status === 'upcoming'
    }

    const now = new Date()
    const start = vacation.startDate instanceof Timestamp
      ? vacation.startDate.toDate()
      : new Date(vacation.startDate)
    return start > now && !vacation.isArchived
  }

  // =============================================================================
  // BACKWARD COMPATIBILITY METHODS (return Firebase types directly)
  // =============================================================================

  /**
   * Legacy method: Get vacation by ID (returns Firebase type)
   * @deprecated Use getVacationById with format option instead
   */
  async getVacation(vacationId: string): Promise<FirebaseVacation | null> {
    try {
      const response = await this.getVacationById(vacationId, { format: 'firebase' })
      return response.success ? response.data as FirebaseVacation : null
    } catch (error) {
      console.error('Error getting vacation:', error)
      throw new Error('Failed to get vacation')
    }
  }
}

// Export singleton instance
export const vacationService = VacationService.getInstance()

// Export types for convenience
export type { 
  FirebaseVacation, 
  VacationFilters, 
  PaginationOptions,
  VacationStats,
  Vacation,
  VacationUpdate,
  VacationServiceResponse
}