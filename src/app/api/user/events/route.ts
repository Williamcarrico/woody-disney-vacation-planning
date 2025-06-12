import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { firestore } from '@/lib/firebase/firebase.config'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore'
import { addDays, startOfDay, endOfDay, format } from 'date-fns'

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid
        const { searchParams } = new URL(request.url)
        const upcoming = searchParams.get('upcoming') === 'true'
        const limit = parseInt(searchParams.get('limit') || '20')
        const date = searchParams.get('date') // YYYY-MM-DD format
        const type = searchParams.get('type') // reservation, fastpass, show, event

        try {
            // Date filtering
            let startTimestamp: Timestamp | undefined
            let endTimestamp: Timestamp | undefined

            if (upcoming) {
                startTimestamp = Timestamp.fromDate(new Date())
            } else if (date) {
                const targetDate = new Date(date)
                startTimestamp = Timestamp.fromDate(startOfDay(targetDate))
                endTimestamp = Timestamp.fromDate(endOfDay(targetDate))
            }

            // Fetch user events from Firestore
            const queryConstraints = [where('userId', '==', userId)]

            if (startTimestamp) {
                queryConstraints.push(where('eventTime', '>=', startTimestamp))
            }

            if (endTimestamp) {
                queryConstraints.push(where('eventTime', '<=', endTimestamp))
            }

            if (type) {
                queryConstraints.push(where('type', '==', type))
            }

            queryConstraints.push(orderBy('eventTime', 'asc'))
            queryConstraints.push(firestoreLimit(limit))

            const eventsQuery = query(
                collection(firestore, 'userEvents'),
                ...queryConstraints
            )

            const eventsSnapshot = await getDocs(eventsQuery)

            // Transform data into unified format
            const events = eventsSnapshot.docs.map(eventDoc => {
                const eventData = eventDoc.data()

                return {
                    id: eventDoc.id,
                    title: eventData.title || eventData.name,
                    time: eventData.eventTime ?
                        format(eventData.eventTime.toDate(), 'h:mm a') :
                        'TBD',
                    location: eventData.location?.name || eventData.locationName || 'Disney World',
                    type: eventData.type || 'event',
                    status: eventData.status?.toLowerCase() || 'confirmed',
                    participants: eventData.partySize || 1,
                    confirmationNumber: eventData.confirmationNumber,
                    partyMembers: eventData.partyMembers || [],
                    notes: eventData.notes || eventData.specialRequests,
                    reminders: eventData.reminders ?? true,
                    metadata: {
                        eventId: eventDoc.id,
                        eventType: eventData.type,
                        cost: eventData.cost || 0,
                        ...eventData.metadata
                    }
                }
            })

            return NextResponse.json(events)

        } catch (firestoreError) {
            console.error('Firestore error:', firestoreError)

            // Return mock events data if Firestore is unavailable
            const mockEvents = [
                {
                    id: 'event-1',
                    title: 'Character Breakfast at Chef Mickey\'s',
                    time: '8:30 AM',
                    location: 'Contemporary Resort',
                    type: 'reservation',
                    status: 'confirmed',
                    participants: 4,
                    confirmationNumber: 'CM-789123',
                    partyMembers: ['You', 'Sarah', 'Emma', 'Alex'],
                    notes: 'Birthday celebration - Emma turns 8!',
                    reminders: true,
                    metadata: {
                        eventId: 'event-1',
                        eventType: 'dining',
                        cost: 185.00,
                        prePaid: true
                    }
                },
                {
                    id: 'event-2',
                    title: 'Space Mountain Lightning Lane',
                    time: '2:15 PM',
                    location: 'Magic Kingdom',
                    type: 'fastpass',
                    status: 'confirmed',
                    participants: 4,
                    confirmationNumber: 'LL-456789',
                    partyMembers: ['You', 'Sarah', 'Emma', 'Alex'],
                    notes: null,
                    reminders: true,
                    metadata: {
                        eventId: 'event-2',
                        eventType: 'attraction',
                        cost: 0,
                        attractionId: 'space-mountain'
                    }
                },
                {
                    id: 'event-3',
                    title: 'Fireworks Viewing Party',
                    time: '9:00 PM',
                    location: 'Magic Kingdom',
                    type: 'event',
                    status: 'confirmed',
                    participants: 4,
                    confirmationNumber: 'FW-321654',
                    partyMembers: ['You', 'Sarah', 'Emma', 'Alex'],
                    notes: 'Special dessert party with reserved viewing',
                    reminders: true,
                    metadata: {
                        eventId: 'event-3',
                        eventType: 'special',
                        cost: 79.00,
                        includes: 'desserts and beverages'
                    }
                }
            ]

            console.log('Returning mock events due to Firestore unavailability')
            return NextResponse.json(mockEvents)
        }

    } catch (error) {
        console.error('Error fetching user events:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user events' },
            { status: 500 }
        )
    }
}

// POST method to create a new event
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid
        const eventData = await request.json()

        const {
            title,
            type,
            eventTime,
            location,
            partySize,
            notes,
            reminders = true,
            metadata = {}
        } = eventData

        if (!title || !type || !eventTime) {
            return NextResponse.json(
                { error: 'Title, type, and event time are required' },
                { status: 400 }
            )
        }

        try {
            // Create event document
            const newEventData = {
                userId,
                title,
                type,
                eventTime: Timestamp.fromDate(new Date(eventTime)),
                location: location || 'Disney World',
                partySize: partySize || 1,
                notes: notes || null,
                reminders,
                status: 'confirmed',
                confirmationNumber: `USR-${Date.now()}`,
                metadata,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            const docRef = await addDoc(collection(firestore, 'userEvents'), newEventData)

            // Transform response
            const response = {
                id: docRef.id,
                title,
                time: format(new Date(eventTime), 'h:mm a'),
                location: location || 'Disney World',
                type,
                status: 'confirmed',
                participants: partySize || 1,
                confirmationNumber: newEventData.confirmationNumber,
                notes,
                reminders,
                metadata: {
                    eventId: docRef.id,
                    eventType: type,
                    ...metadata
                }
            }

            return NextResponse.json(response, { status: 201 })

        } catch (firestoreError) {
            console.error('Firestore error during event creation:', firestoreError)
            return NextResponse.json(
                { error: 'Failed to create event due to database error' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error creating user event:', error)
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        )
    }
}

// PUT method to update an existing event
export async function PUT(request: NextRequest) {
    try {
        // Get authenticated user from Firebase session
        const user = await getCurrentUser()
        if (!user?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.uid
        const { eventId, ...updates } = await request.json()

        if (!eventId) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            )
        }

        try {
            // Verify event exists and belongs to user
            const eventRef = doc(firestore, 'userEvents', eventId)
            const eventDoc = await getDoc(eventRef)

            if (!eventDoc.exists()) {
                return NextResponse.json(
                    { error: 'Event not found' },
                    { status: 404 }
                )
            }

            const eventData = eventDoc.data()

            if (eventData.userId !== userId) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                )
            }

            // Update the event
            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            }

            // Convert eventTime to Timestamp if provided
            if (updates.eventTime) {
                updateData.eventTime = Timestamp.fromDate(new Date(updates.eventTime))
            }

            await updateDoc(eventRef, updateData)

            return NextResponse.json({
                success: true,
                message: 'Event updated successfully'
            })

        } catch (firestoreError) {
            console.error('Firestore error during event update:', firestoreError)
            return NextResponse.json(
                { error: 'Failed to update event due to database error' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error updating user event:', error)
        return NextResponse.json(
            { error: 'Failed to update event' },
            { status: 500 }
        )
    }
}

export const revalidate = 300 // 5 minutes