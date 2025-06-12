/**
 * Firebase Itinerary Service
 *
 * Handles all itinerary-related operations in Firestore
 * Replaces PostgreSQL itinerary operations
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
  onSnapshot,
  type Unsubscribe,
  startAfter,
  type DocumentSnapshot
} from 'firebase/firestore'
import { firestore } from './firebase.config'
import { COLLECTIONS, type FirebaseItinerary } from './collections'

export interface ItineraryFilters {
  userId?: string
  vacationId?: string
  isShared?: boolean
  shareCode?: string
}

export interface ItineraryPaginationOptions {
  limit?: number
  lastDoc?: DocumentSnapshot
}

export class ItineraryService {
  private static instance: ItineraryService

  public static getInstance(): ItineraryService {
    if (!ItineraryService.instance) {
      ItineraryService.instance = new ItineraryService()
    }
    return ItineraryService.instance
  }

  /**
   * Generate a unique share code
   */
  private generateShareCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Create a new itinerary
   */
  async createItinerary(itineraryData: Omit<FirebaseItinerary, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const itineraryRef = doc(collection(firestore, COLLECTIONS.ITINERARIES))
      const now = Timestamp.now()

      const itinerary: FirebaseItinerary = {
        ...itineraryData,
        id: itineraryRef.id,
        createdAt: now,
        updatedAt: now
      }

      await setDoc(itineraryRef, itinerary)
      return itineraryRef.id
    } catch (error) {
      console.error('Error creating itinerary:', error)
      throw new Error('Failed to create itinerary')
    }
  }

  /**
   * Get itinerary by ID
   */
  async getItineraryById(itineraryId: string): Promise<FirebaseItinerary | null> {
    try {
      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)
      const itinerarySnap = await getDoc(itineraryRef)

      if (itinerarySnap.exists()) {
        return itinerarySnap.data() as FirebaseItinerary
      }
      return null
    } catch (error) {
      console.error('Error getting itinerary:', error)
      throw new Error('Failed to get itinerary')
    }
  }

  /**
   * Get itinerary by share code
   */
  async getItineraryByShareCode(shareCode: string): Promise<FirebaseItinerary | null> {
    try {
      const itinerariesRef = collection(firestore, COLLECTIONS.ITINERARIES)
      const q = query(
        itinerariesRef,
        where('shareCode', '==', shareCode),
        where('isShared', '==', true),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as FirebaseItinerary
      }
      return null
    } catch (error) {
      console.error('Error getting itinerary by share code:', error)
      throw new Error('Failed to get itinerary by share code')
    }
  }

  /**
   * Get itineraries by user ID
   */
  async getItinerariesByUserId(
    userId: string,
    options: ItineraryPaginationOptions = {}
  ): Promise<{
    itineraries: FirebaseItinerary[]
    lastDoc?: DocumentSnapshot
    hasMore: boolean
  }> {
    try {
      const itinerariesRef = collection(firestore, COLLECTIONS.ITINERARIES)
      let q = query(
        itinerariesRef,
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
      const itineraries = querySnapshot.docs.map(doc => doc.data() as FirebaseItinerary)

      return {
        itineraries,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === (options.limit || 0)
      }
    } catch (error) {
      console.error('Error getting itineraries by user:', error)
      throw new Error('Failed to get itineraries by user')
    }
  }

  /**
   * Get itineraries by vacation ID
   */
  async getItinerariesByVacationId(vacationId: string): Promise<FirebaseItinerary[]> {
    try {
      const itinerariesRef = collection(firestore, COLLECTIONS.ITINERARIES)
      const q = query(
        itinerariesRef,
        where('vacationId', '==', vacationId),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as FirebaseItinerary)
    } catch (error) {
      console.error('Error getting itineraries by vacation:', error)
      throw new Error('Failed to get itineraries by vacation')
    }
  }

  /**
   * Get shared itineraries
   */
  async getSharedItineraries(): Promise<FirebaseItinerary[]> {
    try {
      const itinerariesRef = collection(firestore, COLLECTIONS.ITINERARIES)
      const q = query(
        itinerariesRef,
        where('isShared', '==', true),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as FirebaseItinerary)
    } catch (error) {
      console.error('Error getting shared itineraries:', error)
      throw new Error('Failed to get shared itineraries')
    }
  }

  /**
   * Update itinerary
   */
  async updateItinerary(
    itineraryId: string,
    updates: Partial<Omit<FirebaseItinerary, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      }

      await updateDoc(itineraryRef, updateData)
    } catch (error) {
      console.error('Error updating itinerary:', error)
      throw new Error('Failed to update itinerary')
    }
  }

  /**
   * Update itinerary park days
   */
  async updateParkDays(
    itineraryId: string,
    parkDays: FirebaseItinerary['parkDays']
  ): Promise<void> {
    try {
      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)
      await updateDoc(itineraryRef, {
        parkDays,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating park days:', error)
      throw new Error('Failed to update park days')
    }
  }

  /**
   * Update itinerary preferences
   */
  async updatePreferences(
    itineraryId: string,
    preferences: Partial<FirebaseItinerary['preferences']>
  ): Promise<void> {
    try {
      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)

      // Get current itinerary to merge preferences
      const itinerarySnap = await getDoc(itineraryRef)
      if (!itinerarySnap.exists()) {
        throw new Error('Itinerary not found')
      }

      const currentItinerary = itinerarySnap.data() as FirebaseItinerary
      const updatedPreferences = {
        ...currentItinerary.preferences,
        ...preferences
      }

      await updateDoc(itineraryRef, {
        preferences: updatedPreferences,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating itinerary preferences:', error)
      throw new Error('Failed to update itinerary preferences')
    }
  }

  /**
   * Enable sharing for an itinerary
   */
  async enableSharing(itineraryId: string): Promise<string> {
    try {
      const shareCode = this.generateShareCode()

      // Check if share code already exists
      const existingItinerary = await this.getItineraryByShareCode(shareCode)
      if (existingItinerary) {
        // Generate new code if collision occurs
        return this.enableSharing(itineraryId)
      }

      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)
      await updateDoc(itineraryRef, {
        isShared: true,
        shareCode,
        updatedAt: Timestamp.now()
      })

      return shareCode
    } catch (error) {
      console.error('Error enabling sharing:', error)
      throw new Error('Failed to enable sharing')
    }
  }

  /**
   * Disable sharing for an itinerary
   */
  async disableSharing(itineraryId: string): Promise<void> {
    try {
      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)
      await updateDoc(itineraryRef, {
        isShared: false,
        shareCode: null,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error disabling sharing:', error)
      throw new Error('Failed to disable sharing')
    }
  }

  /**
   * Delete itinerary
   */
  async deleteItinerary(itineraryId: string): Promise<void> {
    try {
      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)
      await deleteDoc(itineraryRef)
    } catch (error) {
      console.error('Error deleting itinerary:', error)
      throw new Error('Failed to delete itinerary')
    }
  }

  /**
   * Duplicate itinerary
   */
  async duplicateItinerary(
    itineraryId: string,
    newTripName: string,
    userId: string
  ): Promise<string> {
    try {
      const originalItinerary = await this.getItineraryById(itineraryId)
      if (!originalItinerary) {
        throw new Error('Original itinerary not found')
      }

      const duplicateData: Omit<FirebaseItinerary, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        vacationId: originalItinerary.vacationId,
        tripName: newTripName,
        parkDays: originalItinerary.parkDays,
        preferences: originalItinerary.preferences,
        isShared: false,
        shareCode: undefined
      }

      return await this.createItinerary(duplicateData)
    } catch (error) {
      console.error('Error duplicating itinerary:', error)
      throw new Error('Failed to duplicate itinerary')
    }
  }

  /**
   * Add activity to park day
   */
  async addActivityToParkDay(
    itineraryId: string,
    dateString: string,
    activity: FirebaseItinerary['parkDays'][0]['activities'][0]
  ): Promise<void> {
    try {
      const itinerary = await this.getItineraryById(itineraryId)
      if (!itinerary) {
        throw new Error('Itinerary not found')
      }

      const updatedParkDays = itinerary.parkDays.map(day => {
        if (day.date === dateString) {
          return {
            ...day,
            activities: [...day.activities, { ...activity, id: `activity_${Date.now()}` }]
          }
        }
        return day
      })

      await this.updateParkDays(itineraryId, updatedParkDays)
    } catch (error) {
      console.error('Error adding activity to park day:', error)
      throw new Error('Failed to add activity to park day')
    }
  }

  /**
   * Remove activity from park day
   */
  async removeActivityFromParkDay(
    itineraryId: string,
    dateString: string,
    activityId: string
  ): Promise<void> {
    try {
      const itinerary = await this.getItineraryById(itineraryId)
      if (!itinerary) {
        throw new Error('Itinerary not found')
      }

      const updatedParkDays = itinerary.parkDays.map(day => {
        if (day.date === dateString) {
          return {
            ...day,
            activities: day.activities.filter(activity => activity.id !== activityId)
          }
        }
        return day
      })

      await this.updateParkDays(itineraryId, updatedParkDays)
    } catch (error) {
      console.error('Error removing activity from park day:', error)
      throw new Error('Failed to remove activity from park day')
    }
  }

  /**
   * Update activity in park day
   */
  async updateActivityInParkDay(
    itineraryId: string,
    dateString: string,
    activityId: string,
    updates: Partial<FirebaseItinerary['parkDays'][0]['activities'][0]>
  ): Promise<void> {
    try {
      const itinerary = await this.getItineraryById(itineraryId)
      if (!itinerary) {
        throw new Error('Itinerary not found')
      }

      const updatedParkDays = itinerary.parkDays.map(day => {
        if (day.date === dateString) {
          return {
            ...day,
            activities: day.activities.map(activity =>
              activity.id === activityId
                ? { ...activity, ...updates }
                : activity
            )
          }
        }
        return day
      })

      await this.updateParkDays(itineraryId, updatedParkDays)
    } catch (error) {
      console.error('Error updating activity in park day:', error)
      throw new Error('Failed to update activity in park day')
    }
  }

  /**
   * Search itineraries
   */
  async searchItineraries(
    filters: ItineraryFilters,
    options: ItineraryPaginationOptions = {}
  ): Promise<{
    itineraries: FirebaseItinerary[]
    lastDoc?: DocumentSnapshot
    hasMore: boolean
  }> {
    try {
      const itinerariesRef = collection(firestore, COLLECTIONS.ITINERARIES)
      let q = query(itinerariesRef, orderBy('createdAt', 'desc'))

      // Apply filters
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId))
      }
      if (filters.vacationId) {
        q = query(q, where('vacationId', '==', filters.vacationId))
      }
      if (filters.isShared !== undefined) {
        q = query(q, where('isShared', '==', filters.isShared))
      }
      if (filters.shareCode) {
        q = query(q, where('shareCode', '==', filters.shareCode))
      }

      if (options.limit) {
        q = query(q, limit(options.limit))
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc))
      }

      const querySnapshot = await getDocs(q)
      const itineraries = querySnapshot.docs.map(doc => doc.data() as FirebaseItinerary)

      return {
        itineraries,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === (options.limit || 0)
      }
    } catch (error) {
      console.error('Error searching itineraries:', error)
      throw new Error('Failed to search itineraries')
    }
  }

  /**
   * Get itinerary statistics for a user
   */
  async getItineraryStats(userId: string): Promise<{
    total: number
    shared: number
    avgActivitiesPerDay: number
    totalActivities: number
    mostUsedPark: string
  }> {
    try {
      const itinerariesRef = collection(firestore, COLLECTIONS.ITINERARIES)
      const q = query(itinerariesRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      const itineraries = querySnapshot.docs.map(doc => doc.data() as FirebaseItinerary)

      let totalActivities = 0
      let totalDays = 0
      const parkCounts: Record<string, number> = {}

      itineraries.forEach(itinerary => {
        itinerary.parkDays.forEach(day => {
          totalActivities += day.activities.length
          totalDays += 1
          parkCounts[day.parkId] = (parkCounts[day.parkId] || 0) + 1
        })
      })

      const mostUsedPark = Object.entries(parkCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'

      return {
        total: itineraries.length,
        shared: itineraries.filter(it => it.isShared).length,
        avgActivitiesPerDay: totalDays > 0 ? Math.round((totalActivities / totalDays) * 10) / 10 : 0,
        totalActivities,
        mostUsedPark
      }
    } catch (error) {
      console.error('Error getting itinerary stats:', error)
      throw new Error('Failed to get itinerary stats')
    }
  }

  /**
   * Listen to itinerary changes in real-time
   */
  listenToItinerary(itineraryId: string, callback: (itinerary: FirebaseItinerary | null) => void): Unsubscribe {
    const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)

    return onSnapshot(itineraryRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as FirebaseItinerary)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Error listening to itinerary changes:', error)
      callback(null)
    })
  }

  /**
   * Listen to user's itineraries in real-time
   */
  listenToUserItineraries(userId: string, callback: (itineraries: FirebaseItinerary[]) => void): Unsubscribe {
    const itinerariesRef = collection(firestore, COLLECTIONS.ITINERARIES)
    const q = query(
      itinerariesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const itineraries = querySnapshot.docs.map(doc => doc.data() as FirebaseItinerary)
      callback(itineraries)
    }, (error) => {
      console.error('Error listening to user itineraries:', error)
      callback([])
    })
  }

  /**
   * Check if itinerary exists
   */
  async itineraryExists(itineraryId: string): Promise<boolean> {
    try {
      const itineraryRef = doc(firestore, COLLECTIONS.ITINERARIES, itineraryId)
      const itinerarySnap = await getDoc(itineraryRef)
      return itinerarySnap.exists()
    } catch (error) {
      console.error('Error checking if itinerary exists:', error)
      return false
    }
  }

  /**
   * Get total activities count for an itinerary
   */
  getTotalActivities(itinerary: FirebaseItinerary): number {
    return itinerary.parkDays.reduce((total, day) => total + day.activities.length, 0)
  }

  /**
   * Get park days count for an itinerary
   */
  getParkDaysCount(itinerary: FirebaseItinerary): number {
    return itinerary.parkDays.length
  }

  /**
   * Get activities for a specific date
   */
  getActivitiesForDate(itinerary: FirebaseItinerary, date: string): FirebaseItinerary['parkDays'][0]['activities'] {
    const parkDay = itinerary.parkDays.find(day => day.date === date)
    return parkDay?.activities || []
  }
}

// Export singleton instance
export const itineraryService = ItineraryService.getInstance()