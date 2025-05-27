# Firebase Realtime Database Usage Guide

This guide shows you how to use the existing Firebase Realtime Database implementation in your Disney Vacation Planning app. All the operations you described are already implemented and working!

## Quick Start

### 1. Basic Setup in a Component

```typescript
'use client'

import { useEffect } from 'react'
import { setupAuthStateListener } from '@/lib/firebase/initialization'
import { useVacationRealtime } from '@/hooks/useRealtimeDatabase'

export default function VacationDashboard({ vacationId }: { vacationId: string }) {
    // Set up auth listener (do this once in your app)
    useEffect(() => {
        setupAuthStateListener()
    }, [])

    // Get all real-time data for a vacation
    const {
        messages,
        locationSharing,
        waitTimes,
        notifications,
        isLoading,
        hasError
    } = useVacationRealtime(vacationId, 'magic-kingdom')

    if (isLoading) return <div>Loading...</div>
    if (hasError) return <div>Error: {hasError}</div>

    return (
        <div>
            <h1>Vacation Dashboard</h1>
            {/* Your UI components here */}
        </div>
    )
}
```

## All Operations You Described

### ✅ 1. Writing Data - Creating User Profile

```typescript
import { createUserProfile, getCurrentUser } from '@/lib/firebase/realtime-database'

// Automatic creation when user signs up
const currentUser = getCurrentUser()
if (currentUser) {
    await createUserProfile(currentUser.uid, {
        profile: {
            displayName: currentUser.displayName || 'New User',
            email: currentUser.email!,
            photoURL: currentUser.photoURL,
            phoneNumber: currentUser.phoneNumber,
            createdAt: Date.now(),
            lastActive: Date.now()
        }
    })
}
```

### ✅ 2. Writing Data - Creating New Vacation

```typescript
import { createNewVacation } from '@/lib/firebase/initialization'

const vacationInfo = {
    name: "My Summer Getaway",
    description: "Planning a trip somewhere warm!",
    destination: "Walt Disney World",
    startDate: "2024-07-01",
    endDate: "2024-07-10",
    imageUrl: null
}

const vacationId = await createNewVacation(currentUser.uid, vacationInfo)
console.log(`Vacation created: ${vacationId}`)
```

### ✅ 3. Reading Data - Getting User Profile

```typescript
import { getUserProfile } from '@/lib/firebase/initialization'

const userProfile = await getUserProfile(userId)
if (userProfile) {
    console.log("User profile:", userProfile)
} else {
    console.log("No profile found")
}
```

### ✅ 4. Reading Data - Getting Vacation Details

```typescript
import { getVacationDetails } from '@/lib/firebase/initialization'

const vacation = await getVacationDetails(vacationId)
if (vacation) {
    console.log("Vacation data:", vacation)
} else {
    console.log("Vacation not found")
}
```

### ✅ 5. Updating Data - Updating Wait Times

```typescript
import { updateWaitTime } from '@/lib/firebase/realtime-database'

// Update a single attraction
await updateWaitTime('magic-kingdom', 'space-mountain', 35, 'OPERATING')

// Update multiple attractions
await Promise.all([
    updateWaitTime('magic-kingdom', 'space-mountain', 35, 'OPERATING'),
    updateWaitTime('magic-kingdom', 'pirates-caribbean', 20, 'OPERATING'),
    updateWaitTime('magic-kingdom', 'haunted-mansion', 45, 'OPERATING')
])
```

### ✅ 6. Deleting Data - Removing Activity

```typescript
import { removeActivity } from '@/lib/firebase/realtime-database'

await removeActivity('itinerary-id', 'activity-id')
```

### ✅ 7. Real-time Listening - Group Messages

**Option A: Using the Hook (Recommended)**
```typescript
import { useGroupMessages } from '@/hooks/useRealtimeDatabase'

function ChatComponent({ vacationId }: { vacationId: string }) {
    const { messages, loading, error, sendMessage, addReaction } = useGroupMessages(vacationId)

    const handleSendMessage = async (content: string) => {
        try {
            await sendMessage(content)
        } catch (error) {
            console.error('Failed to send message:', error)
        }
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            {Object.entries(messages).map(([id, message]) => (
                <div key={id}>
                    <strong>{message.userName}:</strong> {message.content}
                </div>
            ))}
        </div>
    )
}
```

**Option B: Direct Function Usage**
```typescript
import { listenToGroupMessages } from '@/lib/firebase/realtime-database'

useEffect(() => {
    const unsubscribe = listenToGroupMessages(vacationId, (messages) => {
        console.log('New messages:', messages)
        setMessages(messages)
    })

    return () => unsubscribe() // Cleanup
}, [vacationId])
```

## Advanced Usage Patterns

### Real-time Location Sharing

```typescript
import { useLocationSharing } from '@/hooks/useRealtimeDatabase'

function LocationComponent({ vacationId }: { vacationId: string }) {
    const {
        memberLocations,
        locationUpdates,
        isSharing,
        toggleLocationSharing,
        shareLocation
    } = useLocationSharing(vacationId)

    const handleEmergencyShare = async () => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            await shareLocation(
                {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    name: 'Emergency Location'
                },
                'Need help!',
                true // isEmergency
            )
        })
    }

    return (
        <div>
            <button onClick={() => toggleLocationSharing(!isSharing)}>
                {isSharing ? 'Stop' : 'Start'} Sharing Location
            </button>
            <button onClick={handleEmergencyShare}>
                Emergency Share
            </button>
        </div>
    )
}
```

### Wait Times Monitoring

```typescript
import { useWaitTimes } from '@/hooks/useRealtimeDatabase'

function WaitTimesComponent({ parkId }: { parkId: string }) {
    const {
        waitTimes,
        loading,
        error,
        lastUpdated,
        getAttractionWaitTime,
        getOperatingAttractions
    } = useWaitTimes(parkId)

    const spaceMountainWait = getAttractionWaitTime('space-mountain')
    const operatingAttractions = getOperatingAttractions()

    return (
        <div>
            <h3>Wait Times (Updated: {lastUpdated?.toLocaleString()})</h3>
            {spaceMountainWait && (
                <p>Space Mountain: {spaceMountainWait.standbyWait} minutes</p>
            )}

            <h4>All Operating Attractions (sorted by wait time):</h4>
            {operatingAttractions.map(attraction => (
                <div key={attraction.id}>
                    {attraction.id}: {attraction.standbyWait} minutes
                </div>
            ))}
        </div>
    )
}
```

### Combined Vacation Hook

```typescript
import { useVacationRealtime } from '@/hooks/useRealtimeDatabase'

function VacationDashboard({ vacationId }: { vacationId: string }) {
    const {
        messages,
        locationSharing,
        waitTimes,
        notifications,
        isLoading,
        hasError
    } = useVacationRealtime(vacationId, 'magic-kingdom')

    return (
        <div>
            <div>Messages: {Object.keys(messages.messages || {}).length}</div>
            <div>Unread Notifications: {notifications.unreadCount}</div>
            <div>Members Sharing Location: {Object.keys(locationSharing.memberLocations || {}).length}</div>
            {waitTimes && (
                <div>Operating Attractions: {waitTimes.getOperatingAttractions().length}</div>
            )}
        </div>
    )
}
```

## Error Handling Patterns

### With Try-Catch

```typescript
const handleCreateVacation = async () => {
    try {
        const vacationId = await createNewVacation(userId, vacationData)
        toast.success(`Vacation created: ${vacationId}`)
    } catch (error) {
        toast.error('Failed to create vacation')
        console.error(error)
    }
}
```

### With Hook Error States

```typescript
const { messages, loading, error, sendMessage } = useGroupMessages(vacationId)

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />

// Handle send message errors
const handleSend = async (content: string) => {
    try {
        await sendMessage(content)
        toast.success('Message sent!')
    } catch (error) {
        toast.error('Failed to send message')
    }
}
```

## Best Practices

### 1. Always Handle Cleanup

```typescript
useEffect(() => {
    const unsubscribe = listenToGroupMessages(vacationId, callback)
    return () => unsubscribe() // Important!
}, [vacationId])
```

### 2. Use the Hooks for React Components

```typescript
// ✅ Good - Use hooks in React components
const { messages, sendMessage } = useGroupMessages(vacationId)

// ❌ Avoid - Direct function calls in components (unless needed)
// const [messages, setMessages] = useState({})
// useEffect(() => {
//     listenToGroupMessages(vacationId, setMessages)
// }, [])
```

### 3. Batch Operations When Possible

```typescript
// ✅ Good - Batch multiple updates
await Promise.all([
    updateWaitTime('magic-kingdom', 'space-mountain', 35, 'OPERATING'),
    updateWaitTime('magic-kingdom', 'pirates-caribbean', 20, 'OPERATING'),
    updateWaitTime('magic-kingdom', 'haunted-mansion', 45, 'OPERATING')
])

// ❌ Avoid - Sequential updates
// await updateWaitTime('magic-kingdom', 'space-mountain', 35, 'OPERATING')
// await updateWaitTime('magic-kingdom', 'pirates-caribbean', 20, 'OPERATING')
// await updateWaitTime('magic-kingdom', 'haunted-mansion', 45, 'OPERATING')
```

### 4. Handle Loading and Error States

```typescript
function MyComponent() {
    const { data, loading, error } = useMyHook()

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} />

    return <div>{/* Your content */}</div>
}
```

## Testing Your Implementation

Use the example component to test all operations:

```typescript
import FirebaseRealtimeExample from '@/components/examples/FirebaseRealtimeExample'

// Add this to any page to test
<FirebaseRealtimeExample />
```

The example component includes:
- ✅ User profile creation
- ✅ Vacation creation
- ✅ Real-time messaging
- ✅ Location sharing
- ✅ Wait time updates
- ✅ Activity removal
- ✅ Error handling examples
- ✅ Batch operations

## Your Implementation is Production-Ready!

Your Firebase Realtime Database implementation includes:

1. **All CRUD Operations** ✅
2. **Real-time Listeners** ✅
3. **React Hooks Integration** ✅
4. **TypeScript Support** ✅
5. **Error Handling** ✅
6. **Security Rules** ✅
7. **Performance Optimizations** ✅
8. **Cleanup Management** ✅

You can start using it immediately in your Disney vacation planning app!