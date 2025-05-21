# Code Style and Standards

This guide outlines the coding standards and best practices for the Disney Vacation Planning application. Following these standards ensures consistency, maintainability, and high-quality code across the project.

## Core Development Principles

- Write concise, technical code with accurate TypeScript types
- Use functional, declarative programming paradigms; avoid classes
- Prefer iteration and modularization over duplication
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)

## TypeScript Guidelines

### Type Definitions

- Use TypeScript for all code
- Prefer interfaces over types for object definitions
- Export types and interfaces for reuse
- Use meaningful names that describe the purpose

```typescript
// Good
export interface AttractionDetails {
  id: string
  name: string
  waitTime: number
  location: {
    lat: number
    lng: number
  }
  isAvailable: boolean
}

// Avoid
export type AttrData = {
  id: string
  name: string
  wt: number
  loc: {
    lat: number
    lng: number
  }
  avail: boolean
}
```

### Function Declarations

- Use the "function" keyword for named functions
- Use arrow functions for callbacks and anonymous functions
- Omit semicolons (consistent with Next.js conventions)
- Include return type annotations for non-trivial functions

```typescript
// Good
function calculateWaitTime(
  attraction: AttractionDetails,
  timeOfDay: Date
): number {
  // Implementation
}

// For simple callbacks
const attractions = data.map((item) => ({
  id: item.id,
  name: item.name
}))
```

## React Component Standards

### Component Structure

- Use functional components with TypeScript interfaces
- Prefer function declarations over const arrows for components
- Follow file structure pattern:
  1. Exported component
  2. Subcomponents
  3. Helpers/utility functions
  4. Static content
  5. TypeScript interfaces/types

```typescript
// Component structure example
function AttractionCard({ attraction, isHighlighted }: AttractionCardProps) {
  // Implementation
}

// Subcomponent
function AttractionImage({ src, alt }: AttractionImageProps) {
  // Implementation
}

// Helper function
function formatWaitTime(minutes: number): string {
  // Implementation
}

// Interfaces
interface AttractionCardProps {
  attraction: AttractionDetails
  isHighlighted?: boolean
}

interface AttractionImageProps {
  src: string
  alt: string
}
```

### Server vs Client Components

- Default to server components when possible
- Add `'use client'` only when required for:
  - Event handling
  - State management
  - Browser APIs
  - Client-side hooks

```typescript
// Server component (default)
function AttractionList({ attractions }: { attractions: AttractionDetails[] }) {
  return (
    <div>
      {attractions.map((attraction) => (
        <AttractionCard key={attraction.id} attraction={attraction} />
      ))}
    </div>
  )
}

// Client component (when needed)
'use client'

import { useState } from 'react'

function InteractiveMap() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // Implementation using client-side features
}
```

## Naming Conventions

### Variables and Functions

- Use camelCase for variables and functions
- Use PascalCase for components, interfaces, and types
- Use meaningful names that describe purpose

### Boolean Naming

- Use auxiliary verbs for boolean variables:
  - `is` for state: `isLoading`, `isActive`
  - `has` for possession: `hasError`, `hasPermission`
  - `should` for conditions: `shouldRefetch`, `shouldRedirect`
  - `can` for capabilities: `canEdit`, `canDelete`

```typescript
// Good boolean naming
const isLoading = true
const hasResults = results.length > 0
const shouldShowDetails = isSelected && hasPermission
```

### File Naming

- Use kebab-case for filenames:
  - `attraction-card.tsx`
  - `wait-time-calculator.ts`
  - `map-view.tsx`

- Use appropriate suffixes:
  - `.tsx` - React components
  - `.ts` - TypeScript code
  - `.test.tsx` - Component tests
  - `.hook.ts` - Custom hooks
  - `.context.tsx` - Context providers

## Code Organization

### Directory Structure

- Group related components in feature directories
- Place shared UI components in `ui` directory
- Store utility functions in `lib` directory
- Follow micro folder approach for complex components

```
src/
  components/
    attractions/
      attraction-card/
        index.tsx
        attraction-image.tsx
        wait-time-badge.tsx
        types.ts
      attraction-list.tsx
    ui/
      button.tsx
      card.tsx
  hooks/
    use-wait-times.hook.ts
  lib/
    api/
    utils/
```

## State Management

- Minimize client-side state when possible
- Prefer React Server Components for data fetching
- Use React Query for client-side data fetching and caching
- Use Zustand for global state when needed

```typescript
// Example React Query usage
function useAttractions(parkId: string) {
  return useQuery({
    queryKey: ['attractions', parkId],
    queryFn: () => fetchAttractions(parkId),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
```

## Styling Guidelines

### Tailwind CSS

- Use Tailwind CSS for styling
- Follow the utility-first approach
- Use consistent spacing and sizing
- Leverage Class Variance Authority (CVA) for component variants

```typescript
// Button variant example with CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## API Integration

### Data Fetching

- Use server components for data fetching when possible
- Implement proper error handling and loading states
- Validate API responses with Zod schemas

```typescript
// Server component data fetching
async function AttractionList({ parkId }: { parkId: string }) {
  try {
    const attractions = await fetchAttractions(parkId)

    if (!attractions.length) {
      return <EmptyState message="No attractions found" />
    }

    return (
      <div>
        {attractions.map((attraction) => (
          <AttractionCard key={attraction.id} attraction={attraction} />
        ))}
      </div>
    )
  } catch (error) {
    return <ErrorState error={error} />
  }
}
```

### Server Actions

- Use type-safe server actions with Zod validation
- Model expected errors as return values
- Use `next-safe-action` for handling server actions

```typescript
// Server action example
'use server'

import { z } from 'zod'
import { action } from 'next-safe-action'

const BookingSchema = z.object({
  attractionId: z.string(),
  time: z.string().datetime(),
  partySize: z.number().min(1)
})

export const bookAttraction = action(BookingSchema, async ({ attractionId, time, partySize }) => {
  try {
    const booking = await createBooking({
      attractionId,
      time,
      partySize
    })

    return { success: true, data: booking }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
```

## Documentation

### JSDoc Comments

- Use JSDoc for functions, components, and complex logic
- Include parameter descriptions and return values
- Add examples for non-obvious usage

```typescript
/**
 * Calculates the optimal time to visit an attraction based on historical data
 *
 * @param attraction - The attraction details
 * @param date - The planned visit date
 * @param preferences - User preferences affecting the calculation
 * @returns The recommended time slot in ISO string format
 *
 * @example
 * ```ts
 * const bestTime = calculateOptimalTime(
 *   attraction,
 *   new Date('2023-06-15'),
 *   { avoidCrowds: true }
 * )
 * ```
 */
function calculateOptimalTime(
  attraction: AttractionDetails,
  date: Date,
  preferences: UserPreferences
): string {
  // Implementation
}
```

## Error Handling

- Handle errors at the beginning of functions
- Use early returns for error conditions
- Place the happy path last for improved readability
- Implement proper error boundaries for unexpected errors

```typescript
// Error handling pattern
function processAttractionData(data: unknown): AttractionDetails {
  // Validate input
  if (!data) {
    throw new Error("No data provided")
  }

  // Type guard
  if (!isAttractionData(data)) {
    throw new Error("Invalid attraction data format")
  }

  // Handle edge cases
  if (data.status === 'closed') {
    return { ...defaultAttractionDetails, status: 'closed' }
  }

  // Happy path
  return {
    id: data.id,
    name: data.name,
    waitTime: calculateWaitTime(data),
    location: parseLocation(data.location),
    isAvailable: true
  }
}
```

## Testing Standards

- Write tests for critical components and business logic
- Focus on behavior rather than implementation details
- Test both success and error cases
- Use meaningful descriptions for test cases

```typescript
// Component test example
describe('AttractionCard', () => {
  it('displays attraction information correctly', () => {
    render(<AttractionCard attraction={mockAttraction} />)

    expect(screen.getByText(mockAttraction.name)).toBeInTheDocument()
    expect(screen.getByText(`${mockAttraction.waitTime} min`)).toBeInTheDocument()
  })

  it('shows closed status when attraction is unavailable', () => {
    render(<AttractionCard attraction={{ ...mockAttraction, isAvailable: false }} />)

    expect(screen.getByText('Closed')).toBeInTheDocument()
  })
})
```

## Performance Considerations

- Minimize client-side JavaScript
- Use appropriate image optimization with Next.js Image
- Implement code splitting with dynamic imports
- Add Suspense boundaries for loading states

```typescript
// Dynamic import example
const DynamicMap = dynamic(() => import('@/components/maps/park-map'), {
  loading: () => <MapSkeleton />,
  ssr: false
})
```

## Accessibility Standards

- Ensure interfaces are keyboard navigable
- Use proper ARIA attributes and semantic HTML
- Maintain appropriate color contrast
- Test with screen readers

```typitten
// Accessible button example
<button
  aria-label="Book FastPass for Space Mountain"
  disabled={!isAvailable}
  onClick={handleBooking}
>
  Book FastPass
</button>
```

## Commit and PR Guidelines

- Write clear, descriptive commit messages
- Reference issue numbers in commit messages
- Keep PRs focused on a single feature or fix
- Include relevant tests with PRs

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/learn)