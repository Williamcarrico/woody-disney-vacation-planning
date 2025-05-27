# Firebase Realtime Database Setup Guide

This guide shows you how to properly implement and use Firebase Realtime Database in your Disney Vacation Planning app with all the operations you specified.

## Prerequisites

1. Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Firebase Realtime Database enabled in your project
3. Authentication set up (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

## Environment Configuration

Add the following environment variable to your `.env.local` file:

```env
# Firebase Realtime Database URL - REQUIRED for Realtime Database
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Other Firebase config (already required for Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Security Rules Setup

Deploy the security rules to Firebase:

```bash
# Deploy security rules
firebase deploy --only database
```

The security rules are defined in `database.rules.json` and ensure:
- Users can only access their own data
- Vacation members can only access shared vacation data
- Proper validation of message and location data

## Data Structure Implementation

Your Firebase Realtime Database follows this structure:

```
/
├── users/
│   └── {userId}/
│       ├── profile/
│       ├── preferences/
│       └── vacationIds/
├── vacations/
│   └── {vacationId}/
│       ├── basic/
│       ├── members/
│       └── travelers/
├── groupMessages/
│   └── {vacationId}/
│       └── {messageId}/
├── groupLocations/
│   └── {vacationId}/
│       ├── members/
│       └── updates/
├── liveWaitTimes/
│   └── {parkId}/
│       └── attractions/
└── notifications/
    └── {userId}/
        └── {notificationId}/
```

## Core Operations

### 1. Creating a User Profile

```typescript
import { createUserProfile, getCurrentUser } from '@/lib/firebase/realtime-database'

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

### 2. Creating a New Vacation

```typescript
import { createVacation } from '@/lib/firebase/realtime-database'

const vacationData = {
    name: "My Summer Getaway",
    description: "Planning a trip somewhere warm!",
    destination: "Walt Disney World",
    startDate: "2024-07-01",
    endDate: "2024-07-10",
    status: 'planning' as const,
    travelers: { adults: 2, children: 0 }
}

const vacationId = await createVacation(vacationData, currentUser.uid)
```

### 3. Reading User Profile

```typescript
import { getUserData } from '@/lib/firebase/realtime-database'

const userProfile = await getUserData(userId)
if (userProfile) {
    console.log("User profile data:", userProfile)
} else {
    console.log("No data available for user profile")
}
```

### 4. Reading Vacation Details

```typescript
import { getVacation } from '@/lib/firebase/realtime-database'

const vacation = await getVacation(vacationId)
if (vacation) {
    console.log("Vacation data:", vacation)
} else {
    console.log(`No data available for vacation ${vacationId}`)
}
```

### 5. Updating Wait Times

```typescript
import { updateWaitTime } from '@/lib/firebase/realtime-database'

await updateWaitTime('magic-kingdom', 'space-mountain', 35, 'OPERATING')
```

### 6. Removing Activities

```typescript
import { removeActivity } from '@/lib/firebase/realtime-database'

await removeActivity('itinerary-id', 'activity-id')
```

### 7. Real-time Message Listening

```typescript
import { listenToGroupMessages } from '@/lib/firebase/realtime-database'

const unsubscribe = listenToGroupMessages(vacationId, (messages) => {
    console.log('New messages:', messages)
    // Update your component state
    setMessages(messages)
})

// Don't forget to unsubscribe when component unmounts
useEffect(() => {
    return () => unsubscribe()
}, [])
```

### 8. Sending Messages

```typescript
import { sendGroupMessage } from '@/lib/firebase/realtime-database'

await sendGroupMessage(
    vacationId,
    currentUser.uid,
    currentUser.displayName || 'Anonymous',
    'Hello everyone!',
    'text',
    currentUser.photoURL
)
```

### 9. Sharing Location

```typescript
import { shareLocationUpdate } from '@/lib/firebase/realtime-database'

navigator.geolocation.getCurrentPosition(async (position) => {
    await shareLocationUpdate(
        vacationId,
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            name: 'Current Location'
        },
        'Sharing my location!',
        false // isEmergency
    )
})
```

## React Hooks Usage

Use the provided React hooks for easy integration:

### Group Messages Hook

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

### Location Sharing Hook

```typescript
import { useLocationSharing } from '@/hooks/useRealtimeDatabase'

function LocationComponent({ vacationId }: { vacationId: string }) {
    const {
        memberLocations,
        locationUpdates,
        loading,
        error,
        isSharing,
        toggleLocationSharing,
        shareLocation
    } = useLocationSharing(vacationId)

    return (
        <div>
            <button onClick={() => toggleLocationSharing(!isSharing)}>
                {isSharing ? 'Stop' : 'Start'} Sharing Location
            </button>
            {/* Display member locations */}
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

    if (isLoading) return <div>Loading...</div>
    if (hasError) return <div>Error loading data</div>

    return (
        <div>
            {/* Use all the real-time data */}
        </div>
    )
}
```

## UI Components

Use the provided UI components:

### Group Chat

```typescript
import GroupChat from '@/components/group/GroupChat'

<GroupChat vacationId={vacationId} className="h-96" />
```

### Location Sharing

```typescript
import LocationSharing from '@/components/group/LocationSharing'

<LocationSharing vacationId={vacationId} className="w-full" />
```

## Initialization and Authentication

Set up automatic user profile creation:

```typescript
// In your main App component or layout
import { setupAuthStateListener } from '@/lib/firebase/initialization'

useEffect(() => {
    setupAuthStateListener()
}, [])
```

## Example Component

See the complete example in `src/components/examples/FirebaseRealtimeExample.tsx` for a comprehensive implementation that demonstrates all operations.

## Best Practices

### 1. Always Handle Cleanup

```typescript
useEffect(() => {
    const unsubscribe = listenToGroupMessages(vacationId, callback)
    return () => unsubscribe() // Cleanup on unmount
}, [vacationId])
```

### 2. Error Handling

```typescript
try {
    await sendGroupMessage(/* params */)
    toast.success('Message sent!')
} catch (error) {
    toast.error('Failed to send message')
    console.error(error)
}
```

### 3. Loading States

```typescript
const { messages, loading, error } = useGroupMessages(vacationId)

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
```

### 4. TypeScript Integration

All functions and hooks are fully typed. Use the provided interfaces:

```typescript
import type { User, Vacation, GroupMessage, LocationUpdate } from '@/lib/firebase/realtime-database'
```

## Deployment Commands

```bash
# Deploy Firebase configuration
firebase deploy --only database,hosting

# Deploy security rules only
firebase deploy --only database

# Test with Firebase emulators
firebase emulators:start
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check security rules and user authentication
2. **Database URL Missing**: Ensure `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is set
3. **Real-time Updates Not Working**: Verify listeners are properly set up and cleaned up

### Debug Mode

Enable Firebase debug logging:

```typescript
import { enableLogging } from 'firebase/database'

if (process.env.NODE_ENV === 'development') {
    enableLogging(true)
}
```

## Conclusion

Your Firebase Realtime Database implementation now includes:

✅ **All CRUD Operations**: Create, Read, Update, Delete
✅ **Real-time Messaging**: Group chat with reactions
✅ **Location Sharing**: Real-time location updates
✅ **Wait Times**: Live park data management
✅ **Security Rules**: Comprehensive access control
✅ **React Hooks**: Easy-to-use React integration
✅ **UI Components**: Ready-to-use components
✅ **TypeScript Support**: Full type safety
✅ **Error Handling**: Robust error management
✅ **Best Practices**: Following Firebase recommendations

The implementation follows Firebase's best practices for data structure, security, and performance, as outlined in the [Firebase documentation](https://firebase.google.com/docs/database/web/structure-data).