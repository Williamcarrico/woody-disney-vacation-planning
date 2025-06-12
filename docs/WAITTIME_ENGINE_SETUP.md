# Wait Times Engine - Setup & Troubleshooting Guide

## 🔧 Root Cause Analysis & Fixes Implemented

### Issues Identified:

1. **Environment Variables Missing** - The engine required API keys that weren't configured
2. **API Structure Mismatch** - Engine was designed for a different API structure than themeparks.wiki
3. **Server-Only Import Issue** - Engine had server-only directive but was used in client components
4. **Inconsistent Integration** - Engine bypassed the existing themeparks.wiki compatibility layer
5. **Missing Type Definitions** - Several TypeScript errors from unsafe API operations

### Solutions Implemented:

✅ **Refactored WaitTimes Engine** (`src/engines/waitTimes/index.ts`)
- Removed `"server-only"` directive for client compatibility
- Updated to use internal API routes instead of direct external API calls
- Fixed TypeScript errors with proper type guards and interfaces
- Added graceful error handling and fallback mechanisms

✅ **Created New Client Hook** (`src/hooks/useWaitTimesEngine.ts`)
- Client-safe hook that integrates with the refactored engine
- Supports predictions, real-time updates, and trend analysis
- Proper error handling and loading states
- Caching with TanStack Query for optimal performance

✅ **Updated Park API Routes** (`src/app/api/parks/[parkId]/route.ts`)
- Added support for `entity=live` query parameter
- Proper integration with themeparks.wiki API
- Handles attractions, schedule, and live data requests

✅ **Updated Dashboard Integration** (`src/components/dashboard/ParkDashboard.tsx`)
- Switched to use the new `useWaitTimesEngine` hook
- Enhanced prediction capabilities
- Better error handling and loading states

## 🌍 Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF123

# Firebase Admin (Server-side only - Required for server functions)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Weather API (Required for weather features)
TOMORROW_IO_API_KEY=your_tomorrow_io_api_key_here

# Next.js Configuration (Required for authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Development
NODE_ENV=development
```

### ThemeParks.wiki API Configuration

**Good News!** The themeparks.wiki API doesn't require an API key. The engine now properly integrates with their free API through the existing compatibility layer.

The old environment variables `WAIT_TIME_API_BASE` and `WAIT_TIME_API_KEY` are no longer needed.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy the environment variables above into `.env.local`
   - Replace placeholder values with your actual credentials

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Wait Times Engine**
   - Navigate to the dashboard at `http://localhost:3000/dashboard`
   - Select a park from the dropdown
   - Verify that wait times load and display correctly

## 🧪 Testing the Implementation

### 1. Dashboard Integration Test
```typescript
// The dashboard should now properly display:
// - Live wait times for attractions
// - Trend indicators (increasing/decreasing/stable)
// - Real-time updates every 5 minutes
// - Prediction data when available
```

### 2. API Endpoint Tests

**Test Live Data Endpoint:**
```bash
curl "http://localhost:3000/api/parks/magic-kingdom?entity=live"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "75ea578a-adc8-4116-a54d-dccb60765ef9",
    "liveData": [
      {
        "id": "attraction-id",
        "name": "Attraction Name",
        "entityType": "ATTRACTION",
        "status": "OPERATING",
        "queue": {
          "STANDBY": {
            "waitTime": 45
          }
        }
      }
    ]
  }
}
```

### 3. Hook Integration Test
```typescript
// In any React component:
import { useWaitTimesEngine } from '@/hooks/useWaitTimesEngine';

function TestComponent() {
  const { waitTimes, isLoading, error } = useWaitTimesEngine({
    parkId: 'magic-kingdom',
    enablePredictions: true
  });

  if (isLoading) return <div>Loading wait times...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {waitTimes.map(wt => (
        <div key={wt.attractionId}>
          {wt.name}: {wt.waitMinutes} minutes
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. "No wait times loading"
**Cause:** API endpoint not responding or park ID invalid
**Solution:**
- Check network tab for failed API calls
- Verify park ID is one of: `magic-kingdom`, `epcot`, `hollywood-studios`, `animal-kingdom`
- Check console for error messages

#### 2. "Firebase errors"
**Cause:** Missing or incorrect Firebase configuration
**Solution:**
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set correctly
- Check Firebase project is active and has proper permissions
- Verify Firestore rules allow read access

#### 3. "TypeScript errors"
**Cause:** Missing type definitions or incorrect imports
**Solution:**
- Run `npm run type-check` to identify issues
- Ensure all imports use the new engine types
- Check that `AttractionWaitTime` and `PredictedWaitTime` types are properly exported

#### 4. "Predictions not working"
**Cause:** Historical data missing or prediction endpoint failing
**Solution:**
- Predictions require time to build historical data
- Check that Firebase historical collections have data
- Enable predictions explicitly: `enablePredictions: true`

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This will show detailed console logs for:
- API requests and responses
- Cache hits/misses
- Error details
- Performance metrics

## 📊 Architecture Overview

```
Dashboard Component
    ↓
useWaitTimesEngine Hook
    ↓
fetchCurrentWaitTimes()
    ↓
/api/parks/[parkId]?entity=live
    ↓
themeparks-api.getParkLiveDataBySlug()
    ↓
ThemeParks.wiki API (https://api.themeparks.wiki/v1)
```

## 🔄 Data Flow

1. **Client Request:** Dashboard component mounts and calls `useWaitTimesEngine`
2. **Hook Processing:** Hook makes API call to internal route
3. **API Route:** `/api/parks/[parkId]` processes request and calls themeparks.wiki
4. **Data Transformation:** Raw API data transformed to standardized format
5. **Client Update:** Hook receives data and updates component state
6. **Real-time Updates:** Hook automatically refetches every 5 minutes

## 🔮 Prediction Engine

The prediction system works by:
1. **Historical Analysis:** Analyzing past wait time patterns
2. **Live Data Integration:** Incorporating current wait times
3. **Time-based Factors:** Considering time of day, day of week
4. **Anomaly Detection:** Identifying unusual patterns
5. **Confidence Scoring:** Providing accuracy estimates

## 📈 Performance Optimizations

- **Client-side Caching:** 30-second stale time, 5-minute garbage collection
- **Server-side Caching:** API responses cached for appropriate durations
- **Request Limiting:** Maximum 10 prediction requests per refresh
- **Error Recovery:** Graceful fallbacks for API failures
- **Optimistic Updates:** UI remains responsive during data fetching

## 🛡️ Security Considerations

- All Firebase rules require authentication (as per memory)
- API keys properly scoped (client vs server-side)
- Rate limiting implemented to prevent abuse
- Error messages sanitized to prevent information leakage

## 📞 Support

If you continue experiencing issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Test individual API endpoints using the curl commands above
4. Check Firebase project status and permissions
5. Review the troubleshooting section above

The implementation now provides a robust, type-safe, and performant wait times system that properly integrates with the existing themeparks.wiki infrastructure while maintaining compatibility with client-side React components.