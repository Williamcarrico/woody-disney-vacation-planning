# Disney Vacation Planning App - Architecture Documentation

## 🏗️ **System Architecture Overview**

This document outlines the architectural patterns and design decisions implemented in the Disney vacation planning application following the comprehensive optimization effort.

## 📚 **Core Architectural Patterns**

### 1. Repository Pattern
**Location**: `/src/lib/services/`

The Repository pattern centralizes data access logic and provides a consistent interface for data operations across the application.

#### Base Service Implementation
```typescript
// /src/lib/services/base-service.ts
export abstract class BaseService<T extends { id: string }> {
  protected config: ServiceConfig<T>
  private cache = new Map<string, { data: any; expires: number }>()

  // Abstract methods implemented by concrete services
  protected abstract fetchAll(options?: QueryOptions): Promise<T[]>
  protected abstract fetchById(id: string): Promise<T | null>
  
  // Unified caching and error handling
  async getAll(options: QueryOptions = {}): Promise<PaginatedResult<T>>
  async getById(id: string): Promise<T | null>
}
```

#### Concrete Implementation Example
```typescript
// /src/lib/services/optimized-parks-service.ts
class OptimizedParksService extends BaseService<EnhancedPark> {
  constructor() {
    super({
      name: 'Parks',
      cache: { ttl: 1800, keyPrefix: 'parks', enabled: true }
    })
  }

  // Firebase + API fallback strategy
  protected async fetchAll(): Promise<EnhancedPark[]> {
    try {
      return await this.fetchFromFirebase() || this.getFallbackParks()
    } catch (error) {
      return this.getFallbackParks()
    }
  }
}
```

**Benefits**:
- ✅ Consistent data access patterns
- ✅ Built-in caching with TTL
- ✅ Automatic error handling and fallbacks
- ✅ Easy testing with abstract interfaces

### 2. Factory Pattern
**Location**: `/src/lib/api/`

The Factory pattern creates consistent API route handlers and middleware chains.

#### Unified Route Handler Factory
```typescript
// /src/lib/api/unified-park-handler.ts
export function createUnifiedParkHandler(parkSlug: string) {
  return withErrorHandler(async (request: NextRequest) => {
    const parkConfig = PARK_CONFIGS[parkSlug]
    const query = validateQueryParams(request, UnifiedParkQuerySchema)
    
    switch (query.type) {
      case 'info': return handleParkInfo(parkConfig, query)
      case 'live': return handleLiveData(parkConfig, query)
      case 'attractions': return handleAttractions(parkConfig, query)
      // ... other handlers
    }
  })
}

// Usage in route files
export const GET = createUnifiedParkHandler('magic-kingdom')
```

#### Middleware Factory
```typescript
// /src/lib/api/middleware-factory.ts
export function createMiddlewareChain(config: MiddlewareConfig) {
  return function(handler: THandler) {
    return withErrorHandler(async (request, context) => {
      // Apply rate limiting, validation, caching, auth
      const response = await handler(request, validatedContext)
      // Apply response headers
      return response
    })
  }
}

// Predefined configurations
export const CommonMiddlewareConfigs = {
  publicAPI: {
    rateLimiting: { type: 'api' },
    caching: { ttl: 300, edgeCaching: true }
  },
  authenticatedAPI: {
    rateLimiting: { type: 'api' },
    authentication: true,
    caching: { ttl: 60, edgeCaching: false }
  }
}
```

**Benefits**:
- ✅ Eliminates duplicate route logic
- ✅ Consistent error handling across APIs
- ✅ Easy to add new endpoints
- ✅ Centralized middleware configuration

### 3. Component Composition Pattern
**Location**: `/src/components/`

Break down large components into focused, reusable sub-components with clear responsibilities.

#### Before Optimization
```typescript
// Single massive Header component (898 lines)
const Header = () => {
  // Navigation logic
  // Search functionality  
  // Theme switching
  // User authentication
  // Mobile menu handling
  // ... all mixed together
}
```

#### After Optimization
```typescript
// /src/components/shared/header/OptimizedHeader.tsx
const OptimizedHeader = memo(({ user, onLogin, onLogout }) => {
  return (
    <header>
      <Logo />
      <NavigationMenu isOpen={isMenuOpen} onClose={handleClose} />
      <SearchBar onResultSelect={handleResultSelect} />
      <ThemeToggle />
      <UserMenu user={user} onLogin={onLogin} onLogout={onLogout} />
    </header>
  )
})

// Each sub-component is focused and testable
// /src/components/shared/header/SearchBar.tsx
// /src/components/shared/header/ThemeToggle.tsx
// /src/components/shared/header/UserMenu.tsx
```

#### Unified Components
```typescript
// /src/components/shared/UnifiedAttractionCard.tsx
const UnifiedAttractionCard = memo(({
  attraction,
  liveData,
  variant = 'detailed', // 'compact' | 'detailed' | 'dashboard'
  onSelect,
  onAddToItinerary
}) => {
  // Handles all attraction card use cases
  // Replaces multiple duplicate components
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  return prevProps.attraction.id === nextProps.attraction.id
    && prevProps.liveData?.waitTime === nextProps.liveData?.waitTime
})
```

**Benefits**:
- ✅ Easier to test individual components
- ✅ Better performance with targeted re-renders
- ✅ Clearer component responsibilities
- ✅ Reusable across different contexts

### 4. Type System Architecture
**Location**: `/src/types/`

Comprehensive type system with backward compatibility and centralized exports.

#### Type Organization
```
/src/types/
├── index.ts              # Barrel exports for easy imports
├── domain/
│   ├── parks.model.ts    # Core park types (consolidated)
│   ├── dining.model.ts   # Restaurant and dining types
│   └── events.model.ts   # Event and calendar types
├── api/
│   ├── api-types.ts      # API response types
│   └── shared.ts         # Common API patterns
└── infrastructure/
    ├── resort.model.ts   # Resort-specific types
    └── unified-resort.ts # Cross-platform resort types
```

#### Backward Compatibility
```typescript
// /src/types/parks.model.ts
// New comprehensive types
export interface DisneyPark { /* enhanced definition */ }
export interface ParkAttraction { /* detailed definition */ }

// Backward compatibility aliases
export type Attraction = ParkAttraction
export type TableServiceRestaurant = Restaurant
export type QuickServiceRestaurant = Restaurant

// Firebase compatibility
export interface FirebasePark extends Omit<DisneyPark, 'timestamps'> {
  createdAt?: any // Firebase Timestamp
  updatedAt?: any // Firebase Timestamp
}
```

#### Centralized Exports
```typescript
// /src/types/index.ts
export * from './domain/parks.model'
export * from './domain/dining.model'
export * from './api/api-types'
// ... other exports

// Usage throughout app
import { DisneyPark, Attraction, DiningFilters } from '@/types'
```

**Benefits**:
- ✅ Single source of truth for types
- ✅ Backward compatibility during migration
- ✅ Easy imports with barrel exports
- ✅ Clear separation of concerns

### 5. Error Handling Architecture
**Location**: `/src/lib/api/`

Centralized error handling with consistent patterns across all layers.

#### API Level Error Handling
```typescript
// /src/lib/api/error-handler.ts
export function withErrorHandler<T>(
  handler: (request: NextRequest, context?: any) => Promise<T>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API error:', error)
      
      if (error instanceof ServiceError) {
        return errorResponse(error.message, error.code, 400)
      }
      
      return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
    }
  }
}
```

#### Service Level Error Handling
```typescript
// /src/lib/services/base-service.ts
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

// Usage in services
async getById(id: string): Promise<T | null> {
  try {
    return await this.fetchById(id)
  } catch (error) {
    throw new ServiceError(
      `Failed to fetch ${this.config.name.toLowerCase()} with ID ${id}`,
      'FETCH_ERROR',
      error
    )
  }
}
```

**Benefits**:
- ✅ Consistent error responses
- ✅ Proper error logging and tracking
- ✅ Graceful degradation
- ✅ Easy debugging with error codes

## 🎯 **Performance Optimizations**

### 1. Memoization Strategy
```typescript
// /src/lib/utils/optimized-utils.ts
const memoize = <TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  getKey?: (...args: TArgs) => string
) => {
  const cache = new Map<string, TReturn>()
  return (...args: TArgs): TReturn => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)!
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Optimized utilities
export const cn = memoize((...inputs: ClassValue[]) => twMerge(clsx(inputs)))
export const formatDate = memoize((date, options, locale) => 
  new Intl.DateTimeFormat(locale, options).format(new Date(date))
)
```

### 2. Bundle Optimization
```typescript
// /src/components/icons/index.ts
// Individual icon imports to reduce bundle size
export { ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down'
export { ChevronUp } from 'lucide-react/dist/esm/icons/chevron-up'
// Instead of: import { ChevronDown, ChevronUp } from 'lucide-react'
```

### 3. Component Performance
```typescript
// React.memo with custom comparison
const UnifiedAttractionCard = memo(
  ({ attraction, liveData, variant }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimal re-renders
    return (
      prevProps.attraction.id === nextProps.attraction.id &&
      prevProps.liveData?.waitTime === nextProps.liveData?.waitTime &&
      prevProps.variant === nextProps.variant
    )
  }
)
```

## 📝 **Usage Guidelines**

### Creating New API Routes
```typescript
// 1. Use the unified handler factory
export const GET = createUnifiedParkHandler('new-park')

// 2. Or use middleware factory for custom routes
const middleware = createMiddlewareChain({
  rateLimiting: { type: 'api' },
  validation: { query: MyQuerySchema },
  caching: { ttl: 300, edgeCaching: true }
})

export const GET = middleware(async (request, { query }) => {
  // Your route logic with validated query
  return successResponse(data)
})
```

### Creating New Services
```typescript
// 1. Extend BaseService
class MyService extends BaseService<MyEntity> {
  constructor() {
    super({
      name: 'MyService',
      cache: CacheConfigs.medium,
      validation: { create: MyCreateSchema }
    })
  }

  // 2. Implement abstract methods
  protected async fetchAll(): Promise<MyEntity[]> {
    // Your data fetching logic
  }
}

// 3. Export singleton
export const myService = new MyService()
```

### Creating New Components
```typescript
// 1. Use memo for performance
const MyComponent = memo(({ prop1, prop2 }) => {
  // 2. Use memoized utilities
  const className = cn('base-class', prop1 && 'conditional-class')
  
  // 3. Memoize expensive calculations
  const expensiveValue = useMemo(() => {
    return heavyCalculation(prop1)
  }, [prop1])

  // 4. Use callback for event handlers
  const handleClick = useCallback(() => {
    onSelect?.(prop2)
  }, [onSelect, prop2])

  return <div className={className} onClick={handleClick} />
})
```

## 🔄 **Migration Guide**

### From Old Components to New
```typescript
// Before
import AttractionCard from '@/components/attractions/AttractionCard'

// After
import UnifiedAttractionCard from '@/components/shared/UnifiedAttractionCard'

// Usage
<UnifiedAttractionCard 
  attraction={attraction}
  variant="compact" // or 'detailed', 'dashboard'
  liveData={waitTimes}
/>
```

### From Old Types to New
```typescript
// Before
import { Attraction } from '@/types/attraction'
import { DisneyPark } from '@/types/parks'

// After (with barrel exports)
import { Attraction, DisneyPark } from '@/types'
```

### From Old Services to New
```typescript
// Before
import { parksService } from '@/lib/firebase/parks-service'

// After
import { optimizedParksService } from '@/lib/services/optimized-parks-service'

// Usage (same interface, enhanced features)
const parks = await optimizedParksService.getAll({ limit: 10 })
```

This architecture provides a solid foundation for scalable, maintainable Disney vacation planning application development! 🎢✨