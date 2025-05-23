# MapProvider Component

An enhanced Google Maps API provider component for React applications, built with performance, reliability, and user experience in mind.

## Features

- ✅ **Comprehensive Error Handling**: Graceful fallbacks and user-friendly error messages
- ✅ **Loading States**: Beautiful loading indicators with retry progress
- ✅ **Automatic Retry Logic**: Configurable retry attempts with exponential backoff
- ✅ **API Key Validation**: Validates API key format and provides helpful error messages
- ✅ **Performance Optimized**: Memoized components and efficient re-renders
- ✅ **TypeScript Support**: Full type safety with comprehensive interfaces
- ✅ **Development Tools**: Enhanced debugging and error details in development
- ✅ **Customizable**: Flexible configuration for different use cases
- ✅ **Internationalization**: Support for different regions and languages

## Quick Start

### Basic Usage

```tsx
import { MapProvider } from '@/providers/map-provider';

function App() {
  return (
    <MapProvider>
      <YourMapComponent />
    </MapProvider>
  );
}
```

### Advanced Configuration

```tsx
import { MapProvider } from '@/providers/map-provider';

function App() {
  return (
    <MapProvider
      apiKey="your-custom-api-key" // Optional: Override environment variable
      libraries={['places', 'geometry', 'drawing', 'visualization']}
      region="US"
      language="en"
      retryAttempts={5}
      retryDelay={3000}
      onLoadSuccess={() => console.log('Maps loaded!')}
      onLoadError={(error) => console.error('Maps failed:', error)}
      loadingComponent={<CustomLoadingSpinner />}
      fallbackComponent={<OfflineMapFallback />}
    >
      <YourMapComponent />
    </MapProvider>
  );
}
```

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_your_actual_api_key_here
```

### Google Cloud Console Setup

1. **Enable APIs**: Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Create Project**: Create a new project or select existing one
3. **Enable APIs**: Enable the following APIs:
   - Maps JavaScript API
   - Places API (if using places library)
   - Geocoding API (if needed)
   - Directions API (if needed)
4. **Create Credentials**: Create an API key
5. **Restrict Key**: Set up API restrictions for security:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Limit to the APIs you're using

### Security Best Practices

```env
# ✅ DO: Use environment variables for API keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_your_key_here

# ❌ DON'T: Hardcode API keys in source code
const apiKey = "AIzaSyC_your_key_here"; // Never do this!
```

**API Key Restrictions**:
- Set HTTP referrer restrictions in Google Cloud Console
- Limit API key to only the APIs you need
- Monitor usage in Google Cloud Console
- Rotate keys regularly

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Components to render within the map context |
| `apiKey` | `string` | `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `libraries` | `Array` | `['places', 'geometry', 'drawing']` | Google Maps libraries to load |
| `region` | `string` | `undefined` | Region code (e.g., 'US', 'GB') |
| `language` | `string` | `undefined` | Language code (e.g., 'en', 'es') |
| `onLoadSuccess` | `() => void` | `undefined` | Callback when API loads successfully |
| `onLoadError` | `(error: Error) => void` | `undefined` | Callback when API fails to load |
| `fallbackComponent` | `ReactNode` | Built-in error UI | Custom component for error states |
| `loadingComponent` | `ReactNode` | Built-in loading UI | Custom loading component |
| `retryAttempts` | `number` | `3` | Number of retry attempts on failure |
| `retryDelay` | `number` | `2000` | Delay between retries (milliseconds) |

## Available Libraries

```tsx
type GoogleMapsLibrary =
  | 'places'        // Places API (autocomplete, place details)
  | 'geometry'      // Geometry utilities (distance, area calculations)
  | 'drawing'       // Drawing tools (polygons, circles, etc.)
  | 'visualization' // Data visualization (heatmaps)
  | 'localContext'  // Local context features
```

## Error Handling

The component provides several layers of error handling:

### 1. API Key Validation
```tsx
// Missing API key
<MapProvider> // Will show configuration error

// Invalid API key format
<MapProvider apiKey="invalid-key"> // Will show format error
```

### 2. Network Errors
```tsx
// Automatic retry with progress indication
<MapProvider retryAttempts={5} retryDelay={3000}>
  {children}
</MapProvider>
```

### 3. Custom Error Handling
```tsx
<MapProvider
  onLoadError={(error) => {
    // Log to monitoring service
    console.error('Maps failed:', error);
    // Show user notification
    toast.error('Maps are temporarily unavailable');
  }}
  fallbackComponent={<CustomErrorComponent />}
>
  {children}
</MapProvider>
```

## Performance Optimization

The component includes several performance optimizations:

- **Memoization**: Uses `useMemo` and `useCallback` to prevent unnecessary re-renders
- **Lazy Loading**: API is loaded only when needed
- **Error Boundaries**: Prevents crashes from propagating up the component tree
- **Development Mode**: Uses beta API version in development for latest features

## Usage Examples

### Basic Map Component

```tsx
'use client';

import { Map } from '@vis.gl/react-google-maps';
import { MapProvider } from '@/providers/map-provider';

export function SimpleMap() {
  return (
    <MapProvider>
      <Map
        style={{ width: '100%', height: '400px' }}
        defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
        defaultZoom={10}
      />
    </MapProvider>
  );
}
```

### Map with Places Autocomplete

```tsx
'use client';

import { Map, APIProvider } from '@vis.gl/react-google-maps';
import { MapProvider } from '@/providers/map-provider';
import { PlacesAutocomplete } from '@/components/places-autocomplete';

export function MapWithPlaces() {
  return (
    <MapProvider libraries={['places', 'geometry']}>
      <div className="space-y-4">
        <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
        <Map
          style={{ width: '100%', height: '500px' }}
          defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
          defaultZoom={10}
        />
      </div>
    </MapProvider>
  );
}
```

### Internationalization

```tsx
export function InternationalMap() {
  return (
    <MapProvider
      region="JP"
      language="ja"
      libraries={['places']}
    >
      <Map
        style={{ width: '100%', height: '400px' }}
        defaultCenter={{ lat: 35.6762, lng: 139.6503 }} // Tokyo
        defaultZoom={10}
      />
    </MapProvider>
  );
}
```

### Custom Loading and Error States

```tsx
function CustomLoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <span className="ml-4 text-blue-600 font-medium">Loading Maps...</span>
    </div>
  );
}

function OfflineMapFallback() {
  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Map Unavailable</h3>
      <p className="text-gray-600">Please check your internet connection and try again.</p>
    </div>
  );
}

export function MapWithCustomStates() {
  return (
    <MapProvider
      loadingComponent={<CustomLoadingSpinner />}
      fallbackComponent={<OfflineMapFallback />}
    >
      <YourMapComponent />
    </MapProvider>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Google Maps API key is missing"**
   - Check your `.env.local` file
   - Ensure the variable name is `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Restart your development server after adding the key

2. **"Invalid Google Maps API key format"**
   - API keys should start with `AIza`
   - Check for extra spaces or characters
   - Verify the key in Google Cloud Console

3. **Maps not loading**
   - Check browser console for errors
   - Verify API key restrictions in Google Cloud Console
   - Ensure required APIs are enabled

4. **Quota exceeded errors**
   - Monitor usage in Google Cloud Console
   - Consider implementing usage limits
   - Set up billing alerts

### Development Tips

- Use the development mode for detailed error information
- Enable verbose logging in development:
  ```tsx
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('MapProvider state:', loadingState);
    }
  }, [loadingState]);
  ```
- Test error scenarios by temporarily using an invalid API key
- Monitor network requests in browser DevTools

## Migration from Basic MapProvider

If you're upgrading from a basic MapProvider:

```tsx
// Before (basic version)
<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
  {children}
</APIProvider>

// After (enhanced version)
<MapProvider>
  {children}
</MapProvider>
```

The enhanced version is fully backward compatible and provides the same functionality with additional features.

## License

This component is part of your application and follows your project's license terms.