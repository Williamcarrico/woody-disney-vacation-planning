/**
 * Firebase User Service
 *
 * Handles all user-related operations in Firestore
 * Replaces PostgreSQL user operations
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
  type Unsubscribe
} from 'firebase/firestore'
import { firestore as database } from './firebase.config'
import { COLLECTIONS, type FirebaseUser, timestampToFirebase } from './collections'

export class UserService {
  private static instance: UserService

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  /**
   * Create a new user document
   */
  async createUser(userData: Omit<FirebaseUser, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const userRef = doc(database, COLLECTIONS.USERS, userData.id)
      const now = Timestamp.now()

      const userDoc: FirebaseUser = {
        ...userData,
        createdAt: now,
        updatedAt: now
      }

      await setDoc(userRef, userDoc)
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<FirebaseUser | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        return userSnap.data() as FirebaseUser
      }
      return null
    } catch (error) {
      console.error('Error getting user:', error)
      throw new Error('Failed to get user')
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, where('email', '==', email), limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as FirebaseUser
      }
      return null
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw new Error('Failed to get user by email')
    }
  }

  /**
   * Update user data
   */
  async updateUser(userId: string, updates: Partial<Omit<FirebaseUser, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      }

      await updateDoc(userRef, updateData)
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<FirebaseUser['preferences']>
  ): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)

      // Get current user data to merge preferences
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        throw new Error('User not found')
      }

      const currentUser = userSnap.data() as FirebaseUser
      const updatedPreferences = {
        ...currentUser.preferences,
        ...preferences
      }

      await updateDoc(userRef, {
        preferences: updatedPreferences,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw new Error('Failed to update user preferences')
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating last login:', error)
      throw new Error('Failed to update last login')
    }
  }

  /**
   * Delete user (soft delete by updating role)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        role: 'deleted',
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }

  /**
   * Hard delete user (completely remove document)
   */
  async hardDeleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await deleteDoc(userRef)
    } catch (error) {
      console.error('Error hard deleting user:', error)
      throw new Error('Failed to hard delete user')
    }
  }

  /**
   * Get all users (admin function)
   */
  async getAllUsers(): Promise<FirebaseUser[]> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => doc.data() as FirebaseUser)
    } catch (error) {
      console.error('Error getting all users:', error)
      throw new Error('Failed to get all users')
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<FirebaseUser[]> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, where('role', '==', role), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => doc.data() as FirebaseUser)
    } catch (error) {
      console.error('Error getting users by role:', error)
      throw new Error('Failed to get users by role')
    }
  }

  /**
   * Search users by display name
   */
  async searchUsersByName(searchTerm: string): Promise<FirebaseUser[]> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      // Note: Firestore doesn't support case-insensitive search or LIKE queries
      // This is a basic implementation that would need to be enhanced with a search service
      const q = query(usersRef, orderBy('displayName'))
      const querySnapshot = await getDocs(q)

      const users = querySnapshot.docs.map(doc => doc.data() as FirebaseUser)

      // Client-side filtering (not ideal for large datasets)
      return users.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching users:', error)
      throw new Error('Failed to search users')
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalVacations: number
    totalItineraries: number
    accountAge: number
  }> {
    try {
      // Get user document first
      const user = await this.getUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Count vacations
      const vacationsRef = collection(db, COLLECTIONS.VACATIONS)
      const vacationsQuery = query(vacationsRef, where('userId', '==', userId))
      const vacationsSnapshot = await getDocs(vacationsQuery)

      // Count itineraries
      const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES)
      const itinerariesQuery = query(itinerariesRef, where('userId', '==', userId))
      const itinerariesSnapshot = await getDocs(itinerariesQuery)

      // Calculate account age in days
      const accountAge = Math.floor(
        (Date.now() - user.createdAt.toMillis()) / (1000 * 60 * 60 * 24)
      )

      return {
        totalVacations: vacationsSnapshot.size,
        totalItineraries: itinerariesSnapshot.size,
        accountAge
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw new Error('Failed to get user stats')
    }
  }

  /**
   * Listen to user changes in real-time
   */
  listenToUser(userId: string, callback: (user: FirebaseUser | null) => void): Unsubscribe {
    const userRef = doc(db, COLLECTIONS.USERS, userId)

    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as FirebaseUser)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Error listening to user changes:', error)
      callback(null)
    })
  }

  /**
   * Batch create multiple users
   */
  async batchCreateUsers(users: Array<Omit<FirebaseUser, 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const batch = writeBatch(db)
      const now = Timestamp.now()

      users.forEach(userData => {
        const userRef = doc(db, COLLECTIONS.USERS, userData.id)
        const userDoc: FirebaseUser = {
          ...userData,
          createdAt: now,
          updatedAt: now
        }
        batch.set(userRef, userDoc)
      })

      await batch.commit()
    } catch (error) {
      console.error('Error batch creating users:', error)
      throw new Error('Failed to batch create users')
    }
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userSnap = await getDoc(userRef)
      return userSnap.exists()
    } catch (error) {
      console.error('Error checking if user exists:', error)
      return false
    }
  }

  /**
   * Verify email status update
   */
  async updateEmailVerificationStatus(userId: string, isVerified: boolean): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        isEmailVerified: isVerified,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating email verification status:', error)
      throw new Error('Failed to update email verification status')
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance()

// Export types for convenience
export type { FirebaseUser }