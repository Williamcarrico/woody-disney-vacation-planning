# Firebase Realtime Database Implementation

This document provides comprehensive information about the Firebase Realtime Database implementation in the Disney Vacation Planning app, covering data structure, security, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Data Structure](#data-structure)
4. [Components & Hooks](#components--hooks)
5. [Security Rules](#security-rules)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The Firebase Realtime Database is used for real-time features in the Disney vacation planning app, including:

- **Group Messaging**: Real-time chat between vacation party members
- **Location Sharing**: Live location updates and emergency alerts
- **Wait Time Updates**: Real-time park and attraction data
- **Notifications**: Push notifications and alerts
- **Collaboration Features**: Real-time vacation planning updates

## Environment Setup

### Required Environment Variables

Add these to your `.env.local` file:

```env
# Firebase Realtime Database URL
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Other Firebase config (already required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase variables
```

### Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database**
4. Click **Create Database**
5. Choose your database location (preferably close to your users)
6. Start in **test mode** (we'll add security rules later)

## Data Structure

The database follows a flattened, denormalized structure optimized for real-time updates:

```json
{
  "users": {
    "{userId}": {
      "profile": {
        "displayName": "string",
        "email": "string",
        "photoURL": "string",
        "phoneNumber": "string",
        "createdAt": "timestamp",
        "lastActive": "timestamp"
      },
      "preferences": {
        "partySize": "number",
        "hasChildren": "boolean",
        "childrenAges": ["number"],
        "mobilityConsiderations": "boolean",
        "ridePreference": "string",
        "maxWaitTime": "number",
        "useGeniePlus": "boolean",
        "walkingPace": "string",
        "notifications": {
          "waitTimes": "boolean",
          "groupMessages": "boolean",
          "emergencyAlerts": "boolean"
        }
      },
      "vacationIds": {
        "{vacationId}": "boolean"
      },
      "deviceTokens": {
        "{tokenId}": {
          "token": "string",
          "platform": "string",
          "lastUpdated": "timestamp"
        }
      }
    }
  },

  "vacations": {
    "{vacationId}": {
      "basic": {
        "name": "string",
        "description": "string",
        "destination": "string",
        "startDate": "string",
        "endDate": "string",
        "createdBy": "userId",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "status": "string",
        "imageUrl": "string",
        "shareCode": "string"
      },
      "members": {
        "{userId}": {
          "role": "string",
          "joinedAt": "timestamp",
          "permissions": {
            "editItinerary": "boolean",
            "manageBudget": "boolean",
            "inviteOthers": "boolean"
          }
        }
      },
      "accommodation": {
        "resortId": "string",
        "resortName": "string",
        "roomType": "string",
        "checkIn": "string",
        "checkOut": "string",
        "confirmationNumber": "string"
      },
      "travelers": {
        "adults": "number",
        "children": "number",
        "childrenAges": ["number"]
      }
    }
  },

  "groupMessages": {
    "{vacationId}": {
      "{messageId}": {
        "userId": "string",
        "userName": "string",
        "userPhotoURL": "string",
        "content": "string",
        "timestamp": "timestamp",
        "type": "string",
        "reactions": {
          "{userId}": "string"
        },
        "replyTo": "string",
        "edited": "boolean",
        "editedAt": "timestamp"
      }
    }
  },

  "groupLocations": {
    "{vacationId}": {
      "members": {
        "{userId}": {
          "userName": "string",
          "userPhotoURL": "string",
          "isSharing": "boolean",
          "lastUpdated": "timestamp",
          "location": {
            "latitude": "number",
            "longitude": "number",
            "accuracy": "number",
            "parkId": "string",
            "areaId": "string",
            "attractionId": "string",
            "name": "string"
          }
        }
      },
      "updates": {
        "{updateId}": {
          "userId": "string",
          "userName": "string",
          "userPhotoURL": "string",
          "location": {
            "latitude": "number",
            "longitude": "number",
            "accuracy": "number",
            "parkId": "string",
            "areaId": "string",
            "attractionId": "string",
            "name": "string"
          },
          "message": "string",
          "timestamp": "timestamp",
          "isEmergency": "boolean"
        }
      }
    }
  },

  "liveWaitTimes": {
    "{parkId}": {
      "lastUpdated": "timestamp",
      "attractions": {
        "{attractionId}": {
          "status": "string",
          "standbyWait": "number",
          "lightningLane": {
            "available": "boolean",
            "nextReturnTime": "string",
            "price": "number"
          },
          "lastUpdated": "timestamp"
        }
      }
    }
  },

  "notifications": {
    "{userId}": {
      "{notificationId}": {
        "type": "string",
        "title": "string",
        "message": "string",
        "data": "object",
        "timestamp": "timestamp",
        "read": "boolean",
        "vacationId": "string"
      }
    }
  }
}
```

## Components & Hooks

### Core Service Module

**File**: `src/lib/firebase/realtime-database.ts`

This module provides all the necessary functions for interacting with Firebase Realtime Database:

- User management functions
- Vacation management
- Real-time messaging
- Location sharing
- Wait times management
- Notifications
- Utility functions

### React Hooks

**File**: `src/hooks/useRealtimeDatabase.ts`

Provides custom React hooks for easy integration:

- `useGroupMessages()` - Real-time group chat
- `useLocationSharing()` - Location updates and sharing
- `useWaitTimes()` - Park wait times
- `useNotifications()` - User notifications
- `useVacationRealtime()` - Combined hook for all features

### UI Components

**GroupChat Component**: `src/components/group/GroupChat.tsx`
- Real-time messaging interface
- Message reactions
- Auto-scroll functionality
- Typing indicators

**LocationSharing Component**: `src/components/group/LocationSharing.tsx`
- Location sharing toggle
- Emergency location sharing
- Group member locations
- Location history

## Security Rules

Add these security rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "vacations": {
      "$vacationId": {
        ".read": "auth != null && exists(/vacations/$vacationId/members/auth.uid)",
        ".write": "auth != null && exists(/vacations/$vacationId/members/auth.uid)"
      }
    },
    "groupMessages": {
      "$vacationId": {
        ".read": "auth != null && exists(/vacations/$vacationId/members/auth.uid)",
        "$messageId": {
          ".write": "auth != null && exists(/vacations/$vacationId/members/auth.uid)"
        }
      }
    },
    "groupLocations": {
      "$vacationId": {
        ".read": "auth != null && exists(/vacations/$vacationId/members/auth.uid)",
        "members": {
          "$userId": {
            ".write": "auth != null && auth.uid == $userId"
          }
        },
        "updates": {
          "$updateId": {
            ".write": "auth != null && exists(/vacations/$vacationId/members/auth.uid)"
          }
        }
      }
    },
    "liveWaitTimes": {
      ".read": "auth != null",
      ".write": "false"
    },
    "notifications": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null"
      }
    }
  }
}
```

## Usage Examples

### Basic Setup

```typescript
import { useVacationRealtime } from '@/hooks/useRealtimeDatabase'

function VacationDashboard({ vacationId }: { vacationId: string }) {
  const {
    messages,
    locationSharing,
    notifications,
    isLoading,
    hasError
  } = useVacationRealtime(vacationId)

  if (isLoading) return <div>Loading...</div>
  if (hasError) return <div>Error loading data</div>

  return (
    <div>
      <GroupChat vacationId={vacationId} />
      <LocationSharing vacationId={vacationId} />
    </div>
  )
}
```

### Sending Messages

```typescript
import { useGroupMessages } from '@/hooks/useRealtimeDatabase'

function ChatComponent({ vacationId }: { vacationId: string }) {
  const { messages, sendMessage, addReaction } = useGroupMessages(vacationId)

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div>
      {/* Chat UI */}
    </div>
  )
}
```

### Location Sharing

```typescript
import { useLocationSharing } from '@/hooks/useRealtimeDatabase'

function LocationComponent({ vacationId }: { vacationId: string }) {
  const {
    memberLocations,
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
      {/* Location UI */}
    </div>
  )
}
```

## Best Practices

### Data Structure
- Keep data flat to avoid deep nesting
- Denormalize data when necessary for performance
- Use push IDs for list items
- Store timestamps as numbers (Date.now())

### Performance
- Use limits on queries to avoid downloading too much data
- Implement pagination for large datasets
- Use offline persistence for better user experience
- Clean up listeners in useEffect cleanup functions

### Security
- Always validate data on both client and server
- Use Firebase Security Rules to protect data
- Don't store sensitive information in Realtime Database
- Implement rate limiting for write operations

### Error Handling
- Wrap database operations in try-catch blocks
- Provide meaningful error messages to users
- Log errors for debugging
- Implement retry logic for failed operations

### Real-time Updates
- Use listeners only when necessary
- Remove listeners to prevent memory leaks
- Handle connection state changes
- Implement optimistic updates for better UX

## Troubleshooting

### Common Issues

**1. Permission Denied Errors**
- Check Firebase Security Rules
- Ensure user is authenticated
- Verify user has access to the resource

**2. Data Not Syncing**
- Check internet connection
- Verify Firebase configuration
- Check for JavaScript errors in console

**3. Performance Issues**
- Limit query results
- Remove unused listeners
- Check for deep nesting in data structure

**4. Authentication Issues**
- Verify Firebase Auth is working
- Check user session persistence
- Ensure proper error handling

### Debugging Tips

1. **Use Firebase Console**: Monitor real-time data changes
2. **Enable Debug Logging**: Add logging to your functions
3. **Check Network Tab**: Monitor WebSocket connections
4. **Use React DevTools**: Inspect hook states and props

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs/database)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-realtime-database)

## Conclusion

This Firebase Realtime Database implementation provides a robust foundation for real-time collaboration features in the Disney vacation planning app. The flattened data structure, comprehensive security rules, and React hooks ensure good performance, security, and developer experience.

Remember to regularly review and update security rules, monitor performance metrics, and keep the Firebase SDK updated to the latest version.