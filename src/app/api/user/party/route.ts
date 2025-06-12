import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { firestore } from '@/lib/firebase/firebase.config'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    deleteDoc,
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

        try {
        // Get the user's current vacation to find party members
            const userDoc = await getDoc(doc(firestore, 'users', userId))

            if (!userDoc.exists()) {
                return NextResponse.json([])
            }

            const userData = userDoc.data()
            const currentVacationId = userData.currentVacationId

            if (!currentVacationId) {
            // If no current vacation, return empty array
            return NextResponse.json([])
        }

            // Get party members for the current vacation
            const partyMembersQuery = query(
                collection(firestore, 'vacationPartyMembers'),
                where('vacationId', '==', currentVacationId),
                orderBy('createdAt', 'asc')
            )

            const partyMembersSnapshot = await getDocs(partyMembersQuery)

            // Transform party members to the expected format
            const partyMembers = await Promise.all(
                partyMembersSnapshot.docs.map(async (memberDoc) => {
                    const memberData = memberDoc.data()

                    // If this member is linked to a user account, get their info
                    let linkedUserData = null
                    if (memberData.linkedUserId) {
                        try {
                            const linkedUserDoc = await getDoc(doc(firestore, 'users', memberData.linkedUserId))
                            if (linkedUserDoc.exists()) {
                                linkedUserData = linkedUserDoc.data()
                            }
                        } catch (error) {
                            console.log('Could not fetch linked user data:', error)
                        }
                    }

            return {
                        id: memberDoc.id,
                        name: linkedUserData?.displayName || memberData.name || 'Guest',
                        relation: memberData.relationship || 'Guest',
                        age: memberData.age,
                        avatar: linkedUserData?.photoURL || memberData.avatar || undefined,
                preferences: {
                            favoriteCharacters: memberData.preferences?.favoriteCharacters || [],
                            ridePreferences: memberData.preferences?.ridePreferences || [],
                            dietaryRestrictions: memberData.preferences?.dietaryRestrictions || []
                }
            }
        })
            )

        return NextResponse.json(partyMembers)

        } catch (firestoreError) {
            console.error('Firestore error:', firestoreError)

            // Return mock party data if Firestore is unavailable
            const mockPartyMembers = [
                {
                    id: 'mock-1',
                    name: 'Sarah',
                    relation: 'Partner',
                    age: 28,
                    avatar: undefined,
                    preferences: {
                        favoriteCharacters: ['Mickey Mouse', 'Elsa'],
                        ridePreferences: ['family-friendly', 'mild-thrills'],
                        dietaryRestrictions: []
                    }
                },
                {
                    id: 'mock-2',
                    name: 'Emma',
                    relation: 'Child',
                    age: 8,
                    avatar: undefined,
                    preferences: {
                        favoriteCharacters: ['Princess Aurora', 'Moana'],
                        ridePreferences: ['family-friendly'],
                        dietaryRestrictions: ['vegetarian']
                    }
                }
            ]

            console.log('Returning mock party members due to Firestore unavailability')
            return NextResponse.json(mockPartyMembers)
        }

    } catch (error) {
        console.error('Error fetching party members:', error)
        return NextResponse.json(
            { error: 'Failed to fetch party members' },
            { status: 500 }
        )
    }
}

// POST method to add a party member
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid
        const { name, relationship, age, email, preferences } = await request.json()

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        try {
        // Get user's current vacation
            const userDoc = await getDoc(doc(firestore, 'users', userId))

            if (!userDoc.exists()) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                )
            }

            const userData = userDoc.data()
            const currentVacationId = userData.currentVacationId

            if (!currentVacationId) {
            return NextResponse.json(
                { error: 'No active vacation found' },
                { status: 400 }
            )
        }

        // Check if we're adding an existing user or creating a new guest
        let linkedUserId = null
        if (email) {
                // In a real implementation, you'd search for users by email
                // For now, we'll just store the email
                console.log('Email-based user lookup not yet implemented:', email)
        }

            // Create party member document
            const partyMemberData = {
                vacationId: currentVacationId,
                linkedUserId,
                name,
                relationship: relationship || 'Guest',
                age: age || null,
                email: email || null,
                preferences: {
                    favoriteCharacters: preferences?.favoriteCharacters || [],
                    ridePreferences: preferences?.ridePreferences || [],
                    dietaryRestrictions: preferences?.dietaryRestrictions || []
                },
                createdAt: serverTimestamp(),
                createdBy: userId
            }

            const docRef = await addDoc(collection(firestore, 'vacationPartyMembers'), partyMemberData)

        // Transform response
        const response = {
                id: docRef.id,
                name,
                relation: relationship || 'Guest',
                age: age || null,
                avatar: undefined,
            preferences: {
                favoriteCharacters: preferences?.favoriteCharacters || [],
                ridePreferences: preferences?.ridePreferences || [],
                dietaryRestrictions: preferences?.dietaryRestrictions || []
            }
        }

        return NextResponse.json(response, { status: 201 })

        } catch (firestoreError) {
            console.error('Firestore error during party member creation:', firestoreError)
            return NextResponse.json(
                { error: 'Failed to add party member due to database error' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error adding party member:', error)
        return NextResponse.json(
            { error: 'Failed to add party member' },
            { status: 500 }
        )
    }
}

// DELETE method to remove a party member
export async function DELETE(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const partyMemberId = searchParams.get('id')

        if (!partyMemberId) {
            return NextResponse.json(
                { error: 'Party member ID is required' },
                { status: 400 }
            )
        }

        try {
            // Verify the party member exists and belongs to the user's vacation
            const partyMemberDoc = await getDoc(doc(firestore, 'vacationPartyMembers', partyMemberId))

            if (!partyMemberDoc.exists()) {
                return NextResponse.json(
                    { error: 'Party member not found' },
                    { status: 404 }
                )
            }

            const partyMemberData = partyMemberDoc.data()

            // Get user's current vacation to verify ownership
            const userDoc = await getDoc(doc(firestore, 'users', user.uid))
            if (!userDoc.exists()) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                )
            }

            const userData = userDoc.data()
            const currentVacationId = userData.currentVacationId

            // Verify the party member belongs to the user's current vacation
            if (partyMemberData.vacationId !== currentVacationId) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                )
            }

            // Delete the party member
            await deleteDoc(doc(firestore, 'vacationPartyMembers', partyMemberId))

            return NextResponse.json({
                success: true,
                message: 'Party member removed successfully'
            })

        } catch (firestoreError) {
            console.error('Firestore error during party member deletion:', firestoreError)
            return NextResponse.json(
                { error: 'Failed to remove party member due to database error' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error removing party member:', error)
        return NextResponse.json(
            { error: 'Failed to remove party member' },
            { status: 500 }
        )
    }
}

export const revalidate = 300 // 5 minutes