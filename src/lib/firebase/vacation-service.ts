/**
 * Firebase Vacation Service
 *
 * Handles all vacation-related operations in Firestore
 * Replaces PostgreSQL vacation operations
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

export class VacationService {
  private static instance: VacationService

  public static getInstance(): VacationService {
    if (!VacationService.instance) {
      VacationService.instance = new VacationService()
    }
    return VacationService.instance
  }

  /**
   * Create a new vacation
   */
  async createVacation(vacationData: Omit<FirebaseVacation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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
      return vacationRef.id
    } catch (error) {
      console.error('Error creating vacation:', error)
      throw new Error('Failed to create vacation')
    }
  }

  /**
   * Get vacation by ID
   */
  async getVacationById(vacationId: string): Promise<FirebaseVacation | null> {
    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      const vacationSnap = await getDoc(vacationRef)

      if (vacationSnap.exists()) {
        return vacationSnap.data() as FirebaseVacation
      }
      return null
    } catch (error) {
      console.error('Error getting vacation:', error)
      throw new Error('Failed to get vacation')
    }
  }

  /**
   * Get vacations by user ID
   */
  async getVacationsByUserId(
    userId: string,
    options: PaginationOptions = {}
  ): Promise<{
    vacations: FirebaseVacation[]
    lastDoc?: DocumentSnapshot
    hasMore: boolean
  }> {
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
      const vacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)

      return {
        vacations,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === (options.limit || 0)
      }
    } catch (error) {
      console.error('Error getting vacations by user:', error)
      throw new Error('Failed to get vacations by user')
    }
  }

  /**
   * Get active (non-archived) vacations for a user
   */
  async getActiveVacations(userId: string): Promise<FirebaseVacation[]> {
    try {
      const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
      const q = query(
        vacationsRef,
        where('userId', '==', userId),
        where('isArchived', '==', false),
        orderBy('startDate', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
    } catch (error) {
      console.error('Error getting active vacations:', error)
      throw new Error('Failed to get active vacations')
    }
  }

  /**
   * Get current vacation (ongoing)
   */
  async getCurrentVacation(userId: string): Promise<FirebaseVacation | null> {
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
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as FirebaseVacation
      }
      return null
    } catch (error) {
      console.error('Error getting current vacation:', error)
      throw new Error('Failed to get current vacation')
    }
  }

  /**
   * Get upcoming vacations
   */
  async getUpcomingVacations(userId: string): Promise<FirebaseVacation[]> {
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
      return querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
    } catch (error) {
      console.error('Error getting upcoming vacations:', error)
      throw new Error('Failed to get upcoming vacations')
    }
  }

  /**
   * Update vacation
   */
  async updateVacation(
    vacationId: string,
    updates: Partial<Omit<FirebaseVacation, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error updating vacation:', error)
      throw new Error('Failed to update vacation')
    }
  }

  /**
   * Archive vacation
   */
  async archiveVacation(vacationId: string): Promise<void> {
    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        isArchived: true,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error archiving vacation:', error)
      throw new Error('Failed to archive vacation')
    }
  }

  /**
   * Unarchive vacation
   */
  async unarchiveVacation(vacationId: string): Promise<void> {
    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        isArchived: false,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error unarchiving vacation:', error)
      throw new Error('Failed to unarchive vacation')
    }
  }

  /**
   * Delete vacation
   */
  async deleteVacation(vacationId: string): Promise<void> {
    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await deleteDoc(vacationRef)
    } catch (error) {
      console.error('Error deleting vacation:', error)
      throw new Error('Failed to delete vacation')
    }
  }

  /**
   * Update vacation budget
   */
  async updateVacationBudget(
    vacationId: string,
    budget: FirebaseVacation['budget']
  ): Promise<void> {
    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        budget,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating vacation budget:', error)
      throw new Error('Failed to update vacation budget')
    }
  }

  /**
   * Update vacation accommodations
   */
  async updateVacationAccommodations(
    vacationId: string,
    accommodations: FirebaseVacation['accommodations']
  ): Promise<void> {
    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      await updateDoc(vacationRef, {
        accommodations,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating vacation accommodations:', error)
      throw new Error('Failed to update vacation accommodations')
    }
  }

  /**
   * Get vacation statistics for a user
   */
  async getVacationStats(userId: string): Promise<{
    total: number
    active: number
    archived: number
    upcoming: number
    current: number
    past: number
    totalSpent: number
    averageDuration: number
  }> {
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
        ...stats,
        totalSpent,
        averageDuration: vacations.length > 0 ? Math.round(totalDuration / vacations.length) : 0
      }
    } catch (error) {
      console.error('Error getting vacation stats:', error)
      throw new Error('Failed to get vacation stats')
    }
  }

  /**
   * Search vacations by filters
   */
  async searchVacations(
    filters: VacationFilters,
    options: PaginationOptions = {}
  ): Promise<{
    vacations: FirebaseVacation[]
    lastDoc?: DocumentSnapshot
    hasMore: boolean
  }> {
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
      const vacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)

      return {
        vacations,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === (options.limit || 0)
      }
    } catch (error) {
      console.error('Error searching vacations:', error)
      throw new Error('Failed to search vacations')
    }
  }

  /**
   * Listen to vacation changes in real-time
   */
  listenToVacation(vacationId: string, callback: (vacation: FirebaseVacation | null) => void): Unsubscribe {
    const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)

    return onSnapshot(vacationRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as FirebaseVacation)
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
  listenToUserVacations(userId: string, callback: (vacations: FirebaseVacation[]) => void): Unsubscribe {
    const vacationsRef = collection(database, COLLECTIONS.VACATIONS)
    const q = query(
      vacationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const vacations = querySnapshot.docs.map(doc => doc.data() as FirebaseVacation)
      callback(vacations)
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
  }>): Promise<void> {
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
    } catch (error) {
      console.error('Error batch updating vacations:', error)
      throw new Error('Failed to batch update vacations')
    }
  }

  /**
   * Check if vacation exists
   */
  async vacationExists(vacationId: string): Promise<boolean> {
    try {
      const vacationRef = doc(database, COLLECTIONS.VACATIONS, vacationId)
      const vacationSnap = await getDoc(vacationRef)
      return vacationSnap.exists()
    } catch (error) {
      console.error('Error checking if vacation exists:', error)
      return false
    }
  }

  /**
   * Get vacation duration in days
   */
  getVacationDuration(vacation: FirebaseVacation): number {
    const start = vacation.startDate.toDate()
    const end = vacation.endDate.toDate()
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Check if vacation is current (ongoing)
   */
  isVacationCurrent(vacation: FirebaseVacation): boolean {
    const now = new Date()
    const start = vacation.startDate.toDate()
    const end = vacation.endDate.toDate()
    return start <= now && end >= now
  }

  /**
   * Check if vacation is upcoming
   */
  isVacationUpcoming(vacation: FirebaseVacation): boolean {
    const now = new Date()
    const start = vacation.startDate.toDate()
    return start > now
  }
}

// Export singleton instance
export const vacationService = VacationService.getInstance()

// Export types for convenience
export type { FirebaseVacation, VacationFilters, PaginationOptions }