/**
 * Firebase Data Manager
 * 
 * Central hub for all Firebase data operations
 * Provides unified interface for user, vacation, and itinerary services
 */

import { userService, type FirebaseUser } from './user-service'
import { vacationService, type FirebaseVacation, type VacationFilters } from './vacation-service'
import { itineraryService, type FirebaseItinerary, type ItineraryFilters } from './itinerary-service'
import { Timestamp } from 'firebase/firestore'

export class FirebaseDataManager {
  private static instance: FirebaseDataManager

  public static getInstance(): FirebaseDataManager {
    if (!FirebaseDataManager.instance) {
      FirebaseDataManager.instance = new FirebaseDataManager()
    }
    return FirebaseDataManager.instance
  }

  // ====== USER OPERATIONS ======

  get users() {
    return userService
  }

  /**
   * Create complete user profile
   */
  async createUserProfile(authUser: {
    uid: string
    email: string
    displayName?: string
    photoURL?: string
    emailVerified: boolean
  }): Promise<void> {
    const userData: Omit<FirebaseUser, 'createdAt' | 'updatedAt'> = {
      id: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName || '',
      photoURL: authUser.photoURL || '',
      isEmailVerified: authUser.emailVerified,
      lastLoginAt: Timestamp.now(),
      preferences: {
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true,
        language: 'en'
      },
      role: 'user'
    }

    await userService.createUser(userData)
  }

  // ====== VACATION OPERATIONS ======

  get vacations() {
    return vacationService
  }

  /**
   * Create vacation with default settings
   */
  async createVacationWithDefaults(
    userId: string,
    basicInfo: {
      name: string
      startDate: Date
      endDate: Date
      destination?: string
      travelers: { adults: number; children: number; childrenAges?: number[] }
    }
  ): Promise<string> {
    const vacationData: Omit<FirebaseVacation, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      name: basicInfo.name,
      startDate: Timestamp.fromDate(basicInfo.startDate),
      endDate: Timestamp.fromDate(basicInfo.endDate),
      destination: basicInfo.destination || 'Walt Disney World',
      travelers: basicInfo.travelers,
      budget: {
        total: 0,
        spent: 0,
        categories: {}
      },
      accommodations: {},
      notes: '',
      isArchived: false
    }

    return await vacationService.createVacation(vacationData)
  }

  // ====== ITINERARY OPERATIONS ======

  get itineraries() {
    return itineraryService
  }

  /**
   * Create itinerary with default preferences
   */
  async createItineraryWithDefaults(
    userId: string,
    vacationId: string,
    tripName: string
  ): Promise<string> {
    const itineraryData: Omit<FirebaseItinerary, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      vacationId,
      tripName,
      parkDays: [],
      preferences: {
        partySize: 2,
        hasChildren: false,
        childrenAges: [],
        hasStroller: false,
        mobilityConsiderations: false,
        ridePreference: 'all',
        maxWaitTime: 60,
        walkingPace: 'moderate',
        useGeniePlus: false,
        useIndividualLightningLane: false
      },
      isShared: false
    }

    return await itineraryService.createItinerary(itineraryData)
  }

  // ====== COMBINED OPERATIONS ======

  /**
   * Get user dashboard data
   */
  async getUserDashboardData(userId: string): Promise<{
    user: FirebaseUser | null
    currentVacation: FirebaseVacation | null
    upcomingVacations: FirebaseVacation[]
    recentItineraries: FirebaseItinerary[]
    stats: {
      totalVacations: number
      totalItineraries: number
      accountAge: number
    }
  }> {
    try {
      const [user, currentVacation, upcomingVacations, recentItinerariesResult, stats] = await Promise.all([
        userService.getUserById(userId),
        vacationService.getCurrentVacation(userId),
        vacationService.getUpcomingVacations(userId),
        itineraryService.getItinerariesByUserId(userId, { limit: 5 }),
        userService.getUserStats(userId)
      ])

      return {
        user,
        currentVacation,
        upcomingVacations,
        recentItineraries: recentItinerariesResult.itineraries,
        stats
      }
    } catch (error) {
      console.error('Error getting user dashboard data:', error)
      throw new Error('Failed to get user dashboard data')
    }
  }

  /**
   * Get vacation with itineraries
   */
  async getVacationWithItineraries(vacationId: string): Promise<{
    vacation: FirebaseVacation | null
    itineraries: FirebaseItinerary[]
  }> {
    try {
      const [vacation, itineraries] = await Promise.all([
        vacationService.getVacationById(vacationId),
        itineraryService.getItinerariesByVacationId(vacationId)
      ])

      return { vacation, itineraries }
    } catch (error) {
      console.error('Error getting vacation with itineraries:', error)
      throw new Error('Failed to get vacation with itineraries')
    }
  }

  /**
   * Delete vacation and all related itineraries
   */
  async deleteVacationWithItineraries(vacationId: string): Promise<void> {
    try {
      // Get all itineraries for this vacation
      const itineraries = await itineraryService.getItinerariesByVacationId(vacationId)

      // Delete all itineraries first
      await Promise.all(
        itineraries.map(itinerary => itineraryService.deleteItinerary(itinerary.id))
      )

      // Then delete the vacation
      await vacationService.deleteVacation(vacationId)
    } catch (error) {
      console.error('Error deleting vacation with itineraries:', error)
      throw new Error('Failed to delete vacation with itineraries')
    }
  }

  /**
   * Archive vacation and all related itineraries
   */
  async archiveVacationWithItineraries(vacationId: string): Promise<void> {
    try {
      // Archive the vacation
      await vacationService.archiveVacation(vacationId)

      // Note: Itineraries don't have an archived field in the current schema
      // If needed, you could add this field or handle archiving differently
    } catch (error) {
      console.error('Error archiving vacation with itineraries:', error)
      throw new Error('Failed to archive vacation with itineraries')
    }
  }

  /**
   * Search user's content
   */
  async searchUserContent(
    userId: string,
    searchTerm: string
  ): Promise<{
    vacations: FirebaseVacation[]
    itineraries: FirebaseItinerary[]
  }> {
    try {
      // Get all user's vacations and itineraries
      const [vacationsResult, itinerariesResult] = await Promise.all([
        vacationService.getVacationsByUserId(userId),
        itineraryService.getItinerariesByUserId(userId)
      ])

      const lowercaseSearch = searchTerm.toLowerCase()

      // Filter vacations by name, destination, or notes
      const filteredVacations = vacationsResult.vacations.filter(vacation =>
        vacation.name.toLowerCase().includes(lowercaseSearch) ||
        vacation.destination.toLowerCase().includes(lowercaseSearch) ||
        (vacation.notes && vacation.notes.toLowerCase().includes(lowercaseSearch))
      )

      // Filter itineraries by trip name or activity names
      const filteredItineraries = itinerariesResult.itineraries.filter(itinerary =>
        itinerary.tripName.toLowerCase().includes(lowercaseSearch) ||
        itinerary.parkDays.some(day =>
          day.activities.some(activity =>
            activity.name.toLowerCase().includes(lowercaseSearch) ||
            (activity.description && activity.description.toLowerCase().includes(lowercaseSearch))
          )
        )
      )

      return {
        vacations: filteredVacations,
        itineraries: filteredItineraries
      }
    } catch (error) {
      console.error('Error searching user content:', error)
      throw new Error('Failed to search user content')
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string): Promise<{
    totalSpent: number
    favoriteDestination: string
    totalParkDays: number
    totalActivities: number
    averageVacationLength: number
    mostRecentActivity: Date | null
  }> {
    try {
      const [vacationsResult, itinerariesResult] = await Promise.all([
        vacationService.getVacationsByUserId(userId),
        itineraryService.getItinerariesByUserId(userId)
      ])

      const vacations = vacationsResult.vacations
      const itineraries = itinerariesResult.itineraries

      // Calculate total spent
      const totalSpent = vacations.reduce((sum, vacation) => 
        sum + (vacation.budget?.spent || 0), 0
      )

      // Find favorite destination
      const destinationCounts: Record<string, number> = {}
      vacations.forEach(vacation => {
        destinationCounts[vacation.destination] = (destinationCounts[vacation.destination] || 0) + 1
      })
      const favoriteDestination = Object.entries(destinationCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

      // Calculate park days and activities
      const totalParkDays = itineraries.reduce((sum, itinerary) => 
        sum + itinerary.parkDays.length, 0
      )
      const totalActivities = itineraries.reduce((sum, itinerary) => 
        sum + itinerary.parkDays.reduce((daySum, day) => daySum + day.activities.length, 0), 0
      )

      // Calculate average vacation length
      const totalDays = vacations.reduce((sum, vacation) => {
        const start = vacation.startDate.toDate()
        const end = vacation.endDate.toDate()
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      }, 0)
      const averageVacationLength = vacations.length > 0 ? Math.round(totalDays / vacations.length) : 0

      // Find most recent activity
      const allDates = [
        ...vacations.map(v => v.updatedAt.toDate()),
        ...itineraries.map(i => i.updatedAt.toDate())
      ]
      const mostRecentActivity = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null

      return {
        totalSpent,
        favoriteDestination,
        totalParkDays,
        totalActivities,
        averageVacationLength,
        mostRecentActivity
      }
    } catch (error) {
      console.error('Error getting user activity summary:', error)
      throw new Error('Failed to get user activity summary')
    }
  }

  /**
   * Bulk export user data (for GDPR compliance)
   */
  async exportUserData(userId: string): Promise<{
    user: FirebaseUser | null
    vacations: FirebaseVacation[]
    itineraries: FirebaseItinerary[]
    exportDate: Date
  }> {
    try {
      const [user, vacationsResult, itinerariesResult] = await Promise.all([
        userService.getUserById(userId),
        vacationService.getVacationsByUserId(userId),
        itineraryService.getItinerariesByUserId(userId)
      ])

      return {
        user,
        vacations: vacationsResult.vacations,
        itineraries: itinerariesResult.itineraries,
        exportDate: new Date()
      }
    } catch (error) {
      console.error('Error exporting user data:', error)
      throw new Error('Failed to export user data')
    }
  }

  /**
   * Clean up user data (soft delete)
   */
  async cleanupUserData(userId: string): Promise<void> {
    try {
      // Archive all vacations
      const vacationsResult = await vacationService.getVacationsByUserId(userId)
      await Promise.all(
        vacationsResult.vacations.map(vacation => 
          vacationService.archiveVacation(vacation.id)
        )
      )

      // Update user to deleted status
      await userService.deleteUser(userId)
    } catch (error) {
      console.error('Error cleaning up user data:', error)
      throw new Error('Failed to cleanup user data')
    }
  }

  // ====== REAL-TIME LISTENERS ======

  /**
   * Listen to all user data changes
   */
  listenToUserData(
    userId: string,
    callbacks: {
      onUserChange?: (user: FirebaseUser | null) => void
      onVacationsChange?: (vacations: FirebaseVacation[]) => void
      onItinerariesChange?: (itineraries: FirebaseItinerary[]) => void
    }
  ): () => void {
    const unsubscribers: Array<() => void> = []

    if (callbacks.onUserChange) {
      unsubscribers.push(
        userService.listenToUser(userId, callbacks.onUserChange)
      )
    }

    if (callbacks.onVacationsChange) {
      unsubscribers.push(
        vacationService.listenToUserVacations(userId, callbacks.onVacationsChange)
      )
    }

    if (callbacks.onItinerariesChange) {
      unsubscribers.push(
        itineraryService.listenToUserItineraries(userId, callbacks.onItinerariesChange)
      )
    }

    // Return function to unsubscribe from all listeners
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }

  // ====== VALIDATION HELPERS ======

  /**
   * Validate vacation dates
   */
  validateVacationDates(startDate: Date, endDate: Date): { isValid: boolean; error?: string } {
    if (startDate >= endDate) {
      return { isValid: false, error: 'End date must be after start date' }
    }

    const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDifference > 365) {
      return { isValid: false, error: 'Vacation cannot be longer than 365 days' }
    }

    return { isValid: true }
  }

  /**
   * Validate itinerary park day
   */
  validateParkDay(parkDay: FirebaseItinerary['parkDays'][0]): { isValid: boolean; error?: string } {
    if (!parkDay.date || !parkDay.parkId) {
      return { isValid: false, error: 'Park day must have date and park ID' }
    }

    // Validate activity times
    for (const activity of parkDay.activities) {
      if (activity.startTime && activity.endTime) {
        const start = new Date(`1970-01-01T${activity.startTime}`)
        const end = new Date(`1970-01-01T${activity.endTime}`)
        if (start >= end) {
          return { isValid: false, error: `Activity "${activity.name}" has invalid time range` }
        }
      }
    }

    return { isValid: true }
  }
}

// Export singleton instance
export const firebaseDataManager = FirebaseDataManager.getInstance()

// Export all types for convenience
export type {
  FirebaseUser,
  FirebaseVacation,
  FirebaseItinerary,
  VacationFilters,
  ItineraryFilters
}