'use client'

import {
    createUserProfile,
    getUserData,
    createVacation,
    getCurrentUser,
    type User,
    type Vacation
} from './realtime-database'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { getAuth } from 'firebase/auth'

/**
 * Initialize user profile when they first sign up
 */
export async function initializeUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    if (!firebaseUser) return

    // Check if user profile already exists
    const existingProfile = await getUserData(firebaseUser.uid)
    if (existingProfile) {
        console.log('User profile already exists')
        return
    }

    // Create new user profile with default values
    const newUserData: Partial<User> = {
        profile: {
            displayName: firebaseUser.displayName || 'Disney Fan',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            createdAt: Date.now(),
            lastActive: Date.now()
        },
        preferences: {
            partySize: 4,
            hasChildren: false,
            mobilityConsiderations: false,
            ridePreference: 'family',
            maxWaitTime: 60,
            useGeniePlus: true,
            walkingPace: 'moderate',
            notifications: {
                waitTimes: true,
                groupMessages: true,
                emergencyAlerts: true
            }
        },
        vacationIds: {}
    }

    await createUserProfile(firebaseUser.uid, newUserData)
    console.log(`User profile created for ${firebaseUser.uid}`)
}

/**
 * Example function to create a new vacation (as shown in the user's requirements)
 */
export async function createNewVacation(userId: string, vacationDetails: {
    name: string
    description: string
    destination: string
    startDate: string
    endDate: string
    imageUrl?: string
}): Promise<string> {
    if (!userId) {
        throw new Error('User ID is required to create vacation')
    }

    const vacationData: Omit<Vacation['basic'], 'createdAt' | 'updatedAt' | 'createdBy'> = {
        name: vacationDetails.name,
        description: vacationDetails.description,
        destination: vacationDetails.destination,
        startDate: vacationDetails.startDate,
        endDate: vacationDetails.endDate,
        status: 'planning',
        imageUrl: vacationDetails.imageUrl,
        travelers: { adults: 2, children: 0 }
    }

    const vacationId = await createVacation(vacationData, userId)
    console.log(`New vacation created with ID: ${vacationId}`)
    return vacationId
}

/**
 * Example function to get user profile (as shown in the user's requirements)
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    try {
        const userProfile = await getUserData(userId)
        if (userProfile) {
            console.log("User profile data:", userProfile)
            return userProfile
        } else {
            console.log("No data available for user profile")
            return null
        }
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return null
    }
}

/**
 * Example function to get vacation details (as shown in the user's requirements)
 */
export async function getVacationDetails(vacationId: string): Promise<Vacation | null> {
    try {
        const { getVacation } = await import('./realtime-database')
        const vacation = await getVacation(vacationId)
        if (vacation) {
            console.log("Vacation data:", vacation)
            return vacation
        } else {
            console.log(`No data available for vacation ${vacationId}`)
            return null
        }
    } catch (error) {
        console.error("Error fetching vacation details:", error)
        return null
    }
}

/**
 * Set up authentication state listener to handle user profile initialization
 */
export function setupAuthStateListener(): void {
    const auth = getAuth()

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            console.log('User signed in:', user.uid)
            await initializeUserProfile(user)
        } else {
            // User is signed out
            console.log('User signed out')
        }
    })
}

/**
 * Example of creating a vacation with the current user (as shown in requirements)
 */
export async function createVacationForCurrentUser(vacationInfo: {
    name: string
    description: string
    destination: string
    startDate: string
    endDate: string
    imageUrl?: string
}): Promise<string | null> {
    const currentUser = getCurrentUser()

    if (currentUser) {
        try {
            const vacationId = await createNewVacation(currentUser.uid, vacationInfo)
            return vacationId
        } catch (error) {
            console.error('Failed to create vacation:', error)
            return null
        }
    } else {
        console.error('No authenticated user found')
        return null
    }
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<User | null> {
    const currentUser = getCurrentUser()

    if (currentUser) {
        return getUserProfile(currentUser.uid)
    }

    return null
}