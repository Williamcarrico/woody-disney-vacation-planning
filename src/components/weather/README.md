# Weather Forecast Components

A comprehensive set of weather components that integrate with Tomorrow.io API to display current weather conditions and forecasts for Disney vacation planning.

## Main Component

### WeatherForecastWidget

The main component that combines all sub-components to create a full-featured weather widget.

```tsx
import { WeatherForecastWidget } from '@/components/weather'

export default function MyPage() {
  return (
    <div className="max-w-lg mx-auto">
      <WeatherForecastWidget
        location="Orlando"
        units="imperial"
        daysToShow={5}
      />
    </div>
  )
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `location` | `string \| WeatherLocation` | `'Orlando'` | Location to fetch weather for (city name, coordinates, zip code) |
| `units` | `'metric' \| 'imperial'` | `'metric'` | Units system to use for displaying temperature and other measurements |
| `showForecast` | `boolean` | `true` | Whether to show forecast section or only current weather |
| `daysToShow` | `number` | `5` | Number of days to show in the forecast (max 5) |
| `className` | `string` | - | CSS class to apply to the widget container |
| `onLocationChange` | `(location: WeatherLocation) => void` | - | Callback when user changes location |

## Sub-components

The package also exports individual components that can be used independently:

### WeatherIcon

Displays a weather icon based on the weather code.

```tsx
import { WeatherIcon } from '@/components/weather'

<WeatherIcon weatherCode={1000} size="lg" animate={true} />
```

### CurrentWeather

Displays current weather conditions for a location.

```tsx
import { CurrentWeather } from '@/components/weather'

<CurrentWeather
  location="Orlando"
  values={weatherValues}
  units="imperial"
/>
```

### WeatherForecastItem

Displays a single forecast item (hourly or daily).

```tsx
import { WeatherForecastItem } from '@/components/weather'

<WeatherForecastItem
  timestamp="2024-05-20T12:00:00Z"
  values={forecastValues}
  units="imperial"
  type="daily"
  isSelected={false}
  onClick={() => handleSelection(item)}
/>
```

### LocationSearch

Provides a search interface for changing the weather location.

```tsx
import { LocationSearch } from '@/components/weather'

<LocationSearch
  defaultLocation="Orlando"
  onLocationSelect={(location) => setLocation(location)}
/>
```

## API & Types

The components use the Tomorrow.io API for weather data. The main types are exported from `@/types/weather`:

```typescript
// Common types
export type TemperatureUnit = 'metric' | 'imperial'

export interface WeatherLocation {
  lat: number
  lon: number
  name?: string
}

// Component props
export interface WeatherForecastWidgetProps {
  location?: string | WeatherLocation
  units?: TemperatureUnit
  showForecast?: boolean
  daysToShow?: number
  className?: string
  onLocationChange?: (location: WeatherLocation) => void
}
```

## Tomorrow.io API

The widget uses Tomorrow.io API with the following endpoints:

1. Realtime Weather: `https://api.tomorrow.io/v4/weather/realtime`
2. Weather Forecast: `https://api.tomorrow.io/v4/weather/forecast`

The API functions are available in `@/lib/api/weather.ts`.