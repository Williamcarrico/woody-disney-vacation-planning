import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { firestore } from '@/lib/firebase/firebase.config'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore'

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') // attractions, dining, social, exploration, special
        const completed = searchParams.get('completed') === 'true'

        try {
            // Build query constraints
            const queryConstraints = [where('userId', '==', userId)]

        if (category) {
                queryConstraints.push(where('category', '==', category))
        }

        if (completed !== null) {
                if (completed) {
                    queryConstraints.push(where('unlockedAt', '!=', null))
                } else {
                    queryConstraints.push(where('unlockedAt', '==', null))
                }
        }

            // Add ordering
            queryConstraints.push(orderBy('category'))

            // Fetch user achievements from Firestore
            const userAchievementsQuery = query(
                collection(firestore, 'userAchievements'),
                ...queryConstraints
            )

            const userAchievementsSnapshot = await getDocs(userAchievementsQuery)

        // Transform to the expected format
            const achievements = userAchievementsSnapshot.docs.map(achievementDoc => {
                const data = achievementDoc.data()

            // Map database rarity to frontend rarity
            const rarityMap: Record<string, 'common' | 'rare' | 'epic' | 'legendary'> = {
                    'common': 'common',
                    'uncommon': 'rare',
                    'rare': 'rare',
                    'epic': 'epic',
                    'legendary': 'legendary'
            }

            // Map category to icon (these will be rendered as React components on the frontend)
            const iconMap: Record<string, string> = {
                'attractions': 'Star',
                'dining': 'Utensils',
                'social': 'Users',
                'exploration': 'Map',
                'special': 'Crown'
            }

            return {
                    id: achievementDoc.id,
                    title: data.name || data.title,
                    description: data.description,
                    category: data.category?.toLowerCase() || 'special',
                    progress: data.progress || 0,
                    maxProgress: data.maxProgress || 1,
                    isCompleted: data.unlockedAt !== null && data.unlockedAt !== undefined,
                    rarity: rarityMap[data.rarity?.toLowerCase()] || 'common',
                    unlockedAt: data.unlockedAt,
                    points: data.points || 10,
                    icon: iconMap[data.category?.toLowerCase()] || 'Star',
                    requirements: data.requirements || []
            }
        })

        return NextResponse.json(achievements)

        } catch (firestoreError) {
            console.error('Firestore error:', firestoreError)

            // Return mock achievements data if Firestore is unavailable
            const mockAchievements = [
                {
                    id: 'first-visit',
                    title: 'First Visit',
                    description: 'Welcome to the magic! You\'ve completed your first Disney park visit.',
                    category: 'exploration',
                    progress: 1,
                    maxProgress: 1,
                    isCompleted: true,
                    rarity: 'common' as const,
                    unlockedAt: new Date().toISOString(),
                    points: 10,
                    icon: 'Map',
                    requirements: ['Complete first park visit']
                },
                {
                    id: 'attraction-enthusiast',
                    title: 'Attraction Enthusiast',
                    description: 'Experience 10 different attractions across all parks.',
                    category: 'attractions',
                    progress: 6,
                    maxProgress: 10,
                    isCompleted: false,
                    rarity: 'rare' as const,
                    unlockedAt: null,
                    points: 25,
                    icon: 'Star',
                    requirements: ['Visit 10 different attractions']
                },
                {
                    id: 'foodie-explorer',
                    title: 'Foodie Explorer',
                    description: 'Try signature dishes from 5 different restaurants.',
                    category: 'dining',
                    progress: 3,
                    maxProgress: 5,
                    isCompleted: false,
                    rarity: 'epic' as const,
                    unlockedAt: null,
                    points: 50,
                    icon: 'Utensils',
                    requirements: ['Dine at 5 different restaurants']
                }
            ]

            console.log('Returning mock achievements due to Firestore unavailability')
            return NextResponse.json(mockAchievements)
        }

    } catch (error) {
        console.error('Error fetching user achievements:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user achievements' },
            { status: 500 }
        )
    }
}

// POST method to update achievement progress
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid
        const { achievementId, progress } = await request.json()

        if (!achievementId || typeof progress !== 'number') {
            return NextResponse.json(
                { error: 'Achievement ID and progress are required' },
                { status: 400 }
            )
        }

        try {
            // Get or create the user achievement document
            const achievementRef = doc(firestore, 'userAchievements', `${userId}_${achievementId}`)
            const achievementDoc = await getDoc(achievementRef)

            let currentData = achievementDoc.exists() ? achievementDoc.data() : null
            let maxProgress = currentData?.maxProgress || 1

            // Determine if this progress update should unlock the achievement
            const shouldUnlock = progress >= maxProgress && (!currentData?.unlockedAt)

            const updatedData = {
                userId,
                achievementId,
                progress: Math.max(progress, currentData?.progress || 0),
                maxProgress,
                unlockedAt: shouldUnlock ? serverTimestamp() : (currentData?.unlockedAt || null),
                updatedAt: serverTimestamp(),
                // Add default achievement data if not present
                name: currentData?.name || 'Achievement',
                description: currentData?.description || 'Complete this challenge',
                category: currentData?.category || 'special',
                rarity: currentData?.rarity || 'common',
                points: currentData?.points || 10,
                requirements: currentData?.requirements || []
            }

            await setDoc(achievementRef, updatedData, { merge: true })

            return NextResponse.json({
                success: true,
                achievement: updatedData,
                unlocked: shouldUnlock
            })

        } catch (firestoreError) {
            console.error('Firestore error during achievement update:', firestoreError)
            return NextResponse.json(
                { error: 'Failed to update achievement due to database error' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error updating user achievement:', error)
        return NextResponse.json(
            { error: 'Failed to update achievement' },
            { status: 500 }
        )
    }
}

export const revalidate = 600 // 10 minutes