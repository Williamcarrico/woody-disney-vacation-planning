# Troubleshooting Guide

This guide helps resolve common issues with the Disney Vacation Planning app.

## Network Errors

### Weather API Errors
**Error:** `WeatherAPIError: Network error occurred`

**Causes:**
- Missing or invalid Tomorrow.io API key
- Network connectivity issues
- API rate limiting

**Solutions:**
1. **Check API Key**: Ensure `TOMORROW_IO_API_KEY` is set in `.env.local`
2. **Fallback Mode**: The app now automatically uses mock weather data when the API fails
3. **Get New API Key**: Visit [tomorrow.io](https://tomorrow.io) to get a free API key

### Location Update Errors
**Error:** `Error updating location: {}` or `Failed to update location: {}`

**Causes:**
- Database connection issues
- Missing PostgreSQL database
- Network connectivity problems

**Solutions:**
1. **Database Optional**: The app now works without a database connection
2. **Install PostgreSQL** (optional):
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql

   # Create database
   createdb disney_vacation
   ```
3. **Update Environment**: Set `DATABASE_URL` in `.env.local`

### Geofencing Errors
**Error:** `Failed to load geofences` or `GeofencingService.loadGeofences error`

**Causes:**
- Database connection issues
- Missing geofences API endpoint
- Network connectivity problems

**Solutions:**
1. **Automatic Fallback**: The app now continues without geofencing when the API fails
2. **No User Impact**: Core app functionality remains available
3. **Database Optional**: Geofencing works in memory-only mode when database is unavailable

## Environment Setup

### Missing .env.local File
Run the setup script to create the environment file:
```bash
node scripts/setup-env.js
```

### Required Environment Variables
```bash
# Minimal setup (app works without these)
DATABASE_URL="postgres://postgres:postgres@localhost:5432/disney_vacation"
TOMORROW_IO_API_KEY="your-api-key-here"

# Optional for enhanced features
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-key"
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-key"
```

## Common Issues

### 1. Hydration Mismatch Errors
**Fixed**: Time-related hydration mismatches have been resolved with client-side checks.

### 2. Database Connection Failures
**Status**: App now runs in fallback mode without database
- Location updates are simulated
- Core features remain functional
- No user-facing errors

### 3. Weather Data Not Loading
**Status**: App now provides mock weather data when API fails
- Realistic weather information for Orlando area
- No loading errors or blank screens
- Seamless user experience

### 4. Geofencing Not Working
**Status**: App now handles geofencing failures gracefully
- Continues without geofencing when database unavailable
- No error messages or app crashes
- Core location and mapping features still work

### 5. Map Features Not Working
**Cause**: Missing Google Maps API key
**Solution**:
- Basic maps work without API key
- Enhanced features require `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Get key from [Google Cloud Console](https://console.cloud.google.com)

## Development Mode

### Running the App
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Checking Logs
Monitor the console for helpful messages:
- ✅ Success messages for working features
- ⚠️ Warning messages for fallback modes
- ❌ Error messages for issues requiring attention

## Production Deployment

### Required for Production
1. **Valid API Keys**: Get production keys for all services
2. **Database**: Set up PostgreSQL or compatible database
3. **Environment Variables**: Configure all required variables
4. **Error Monitoring**: Set up logging and monitoring

### Optional Services
- Firebase (for advanced features)
- Google Maps (for enhanced mapping)
- Analytics services

## Getting Help

### Check Console Logs
The app provides detailed logging:
```javascript
// Look for these messages in browser console
"✅ Database connection initialized successfully"
"⚠️ Database connection failed, running in fallback mode"
"Tomorrow.io API key not configured, returning mock data"
"Database not available, returning empty geofences array"
"Error loading geofences, continuing without geofencing"
```

### Common Solutions
1. **Restart Development Server**: `npm run dev`
2. **Clear Browser Cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. **Check Network**: Ensure internet connectivity
4. **Update Dependencies**: `npm install`

### Still Having Issues?
1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Node.js version is compatible (v18+ recommended)
4. Try running in incognito/private browsing mode

## Feature Status

| Feature | Status | Fallback |
|---------|--------|----------|
| Weather Data | ✅ Working | Mock data |
| Location Updates | ✅ Working | Simulated |
| Maps | ✅ Working | Basic maps |
| Database | ⚠️ Optional | In-memory |
| Authentication | ✅ Working | Mock user |
| Geofencing | ✅ Working | Memory-only |

The app is designed to be resilient and provide a great user experience even when some services are unavailable.