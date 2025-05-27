# Firebase Authentication Setup

This document provides instructions for setting up Firebase Authentication in the Disney Vacation Planning app.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Basic knowledge of Firebase Authentication

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Client-side variables (used in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Server-side variables (used only on the server)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

## Firebase Console Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project
2. Navigate to Authentication > Sign-in methods
3. Enable the following authentication methods:
   - Email/Password
   - Google (configure OAuth consent screen if needed)
   - Any other providers you want to use

## Firebase Admin SDK Setup

For server-side authentication validation:

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract `client_email` and `private_key` values for the environment variables

## Authentication Flow

The app implements a dual authentication system:

1. **Client-side authentication** using Firebase SDK
   - Handles login/signup UI and initial authentication
   - Uses `onAuthStateChanged` to track authentication state

2. **Server-side authentication** using Firebase Admin SDK
   - Creates and validates secure HTTP-only cookies for session management
   - Protects API routes and server components
   - Ensures security for server-side operations

## Protected Routes

Routes under the `/dashboard` and other authenticated sections are protected in two ways:

1. **Server-side middleware** checks session cookies and redirects unauthenticated users
2. **Client-side components** provide an additional layer of protection for navigation

## Useful Commands

```bash
# Install Firebase dependencies
npm install firebase firebase-admin
```

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Next.js Authentication Documentation](https://nextjs.org/docs/authentication)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)