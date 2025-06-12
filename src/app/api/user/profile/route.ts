import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { firebaseDataManager } from '@/lib/firebase/firebase-data-manager'

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid

        try {
            // Get user profile using the new Firebase service
            const firebaseUser = await firebaseDataManager.users.getUserById(userId)
            
            if (!firebaseUser) {
                // Create user profile if it doesn't exist
                await firebaseDataManager.createUserProfile({
                    uid: userId,
                    email: user.email || '',
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    emailVerified: user.emailVerified || false
                })
                
                // Fetch the newly created profile
                const newUser = await firebaseDataManager.users.getUserById(userId)
                if (!newUser) {
                    throw new Error('Failed to create user profile')
                }
                
                return NextResponse.json(transformUserProfile(newUser))
            }

            return NextResponse.json(transformUserProfile(firebaseUser))

        } catch (error) {
            console.error('Firebase error:', error)

            // Return basic profile from Firebase Auth if Firestore is unavailable
            const basicProfile = {
                id: userId,
                name: user.displayName || 'Disney Explorer',
                email: user.email || '',
                avatar: user.photoURL || undefined,
                preferences: {
                    favoriteParks: [],
                    dietaryRestrictions: [],
                    accessibilityNeeds: [],
                    notificationSettings: {
                        waitTimes: true,
                        reservations: true,
                        weather: true,
                        social: true
                    }
                },
                currentVacation: undefined
            }

            console.log('Returning basic profile due to Firebase unavailability')
            return NextResponse.json(basicProfile)
        }

    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid
        const updates = await request.json()

        try {
            // Update basic user info if provided
            const userUpdates: any = {}
            if (updates.name) userUpdates.displayName = updates.name
            if (updates.email) userUpdates.email = updates.email
            if (updates.avatar) userUpdates.photoURL = updates.avatar

            if (Object.keys(userUpdates).length > 0) {
                await firebaseDataManager.users.updateUser(userId, userUpdates)
            }

            // Update preferences if provided
            if (updates.preferences) {
                const prefs = updates.preferences
                const preferencesUpdate = {
                    theme: prefs.theme,
                    emailNotifications: prefs.notificationSettings?.reservations,
                    pushNotifications: prefs.notificationSettings?.waitTimes,
                    language: prefs.language
                }

                await firebaseDataManager.users.updateUserPreferences(userId, preferencesUpdate)
            }

            return NextResponse.json({
                success: true,
                message: 'Profile updated successfully'
            })

        } catch (error) {
            console.error('Firebase error during update:', error)
            return NextResponse.json(
                { error: 'Failed to save profile changes' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error updating user profile:', error)
        return NextResponse.json(
            { error: 'Failed to update user profile' },
            { status: 500 }
        )
    }
}

// Helper function to transform Firebase user to API format
function transformUserProfile(firebaseUser: any) {
    return {
        id: firebaseUser.id,
        name: firebaseUser.displayName || 'Disney Explorer',
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || undefined,
        preferences: {
            favoriteParks: [],
            dietaryRestrictions: [],
            accessibilityNeeds: [],
            notificationSettings: {
                waitTimes: firebaseUser.preferences?.pushNotifications ?? true,
                reservations: firebaseUser.preferences?.emailNotifications ?? true,
                weather: true,
                social: true
            }
        },
        currentVacation: undefined // Will be populated from vacation service if needed
    }
}

export const revalidate = 900 // 15 minutes