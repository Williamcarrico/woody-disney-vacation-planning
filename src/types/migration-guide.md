# Type System Migration Guide

This guide explains how to migrate from the duplicate type definitions to the unified shared type system.

## Overview

The codebase had several duplicate type definitions across different files:

1. **Attraction & AccessibilityInfo** - duplicated in `attraction.ts`, `parks.ts`, `themeparks.ts`
2. **DisneyPark, SnackLocation, MenuCategory, MenuItem, ParkingInfo** - duplicated in `parks.ts`, `themeparks.ts`
3. **PriceRange enum** - duplicated in `disneysprings.ts`, `dining.ts`
4. **MenuHighlight** - duplicated in `disneysprings.ts`, `dining.ts`
5. **OperatingHours** - duplicated in `parks.ts`, `dining.ts`

These have been consolidated into `src/types/shared.ts`.

## Migration Steps

### 1. Update Imports

Replace old imports with imports from `shared.ts`:

```typescript
// OLD - Multiple files importing different versions
import { PriceRange } from '@/types/dining'
import { PriceRange } from '@/types/disneysprings'

// NEW - Single source of truth
import { PriceRange } from '@/types/shared'
```

### 2. Enum Value Updates

#### PriceRange Migration

**Old values (disneysprings.ts):**
```typescript
enum PriceRange {
  Low = "$",
  Medium = "$$", 
  High = "$$$",
  VeryHigh = "$$$$"
}
```

**Old values (dining.ts):**
```typescript
enum PriceRange {
  BUDGET = "$",
  MODERATE = "$$",
  EXPENSIVE = "$$$", 
  LUXURY = "$$$$"
}
```

**New unified values:**
```typescript
enum PriceRange {
  LOW = "$",
  MODERATE = "$$",
  HIGH = "$$$", 
  LUXURY = "$$$$"
}
```

**Migration mapping:**
- `disneysprings.Low` → `shared.LOW`
- `disneysprings.Medium` → `shared.MODERATE`
- `disneysprings.High` → `shared.HIGH`
- `disneysprings.VeryHigh` → `shared.LUXURY`
- `dining.BUDGET` → `shared.LOW`
- `dining.MODERATE` → `shared.MODERATE`
- `dining.EXPENSIVE` → `shared.HIGH`
- `dining.LUXURY` → `shared.LUXURY`

### 3. Interface Property Updates

#### Attraction Interface

The unified Attraction interface includes properties from all versions:

```typescript
// Supports both area and landName for backward compatibility
interface Attraction {
  // ... other properties
  area?: string        // From disneysprings version
  landName?: string    // From parks version
  landId?: string      // From themeparks version
  waitTime?: number | null  // Unified type (was number | undefined in some versions)
}
```

#### AccessibilityInfo Interface

The unified interface combines all accessibility features:

```typescript
interface AccessibilityInfo {
  // Core properties (all versions)
  wheelchairAccessible: boolean
  serviceAnimalsAllowed: boolean
  
  // Extended properties (some versions)
  assistiveListening?: boolean
  audioDescription?: boolean
  brailleMenu?: boolean
  
  // Service-specific info (parks version)
  services?: {
    das?: { available: boolean; description: string }
    wheelchairRental?: { available: boolean; locations: string[]; cost: string }
  }
}
```

#### MenuHighlight Interface

The unified interface includes allergen information:

```typescript
interface MenuHighlight {
  name: string
  description: string
  price?: number
  imageUrl?: string
  category?: string
  isSignature?: boolean
  diningPlanCredits?: number
  allergens?: string[]  // Added from dining.ts version
}
```

#### OperatingHours Interface

The unified interface supports both structured and string formats:

```typescript
interface OperatingHours {
  typical: {
    monday: { open: string; close: string }
    // ... other days
  }
  extendedEvening?: boolean
  earlyEntry?: boolean
  specialEvents?: string[]
  // Legacy format support
  [key: string]: any
}
```

### 4. File-by-File Migration

#### src/types/attraction.ts
- Import shared types: `Attraction`, `AccessibilityInfo`, `AttractionType`, etc.
- Remove duplicate type definitions
- Keep attraction-specific enums and interfaces

#### src/types/parks.ts  
- Import shared types: `DisneyPark`, `OperatingHours`, `Attraction`, etc.
- Remove duplicate type definitions
- Keep park-specific interfaces

#### src/types/themeparks.ts
- Import shared types: `DisneyPark`, `Attraction`, `MenuCategory`, etc.
- Remove duplicate type definitions  
- Keep themeparks.wiki API specific types

#### src/types/dining.ts
- Import shared types: `PriceRange`, `MenuHighlight`, `OperatingHours`
- Remove duplicate type definitions
- Keep dining-specific enums and interfaces

#### src/types/disneysprings.ts
- Import shared types: `PriceRange`, `MenuHighlight`
- Remove duplicate type definitions
- Keep Disney Springs specific interfaces

### 5. Component Updates

Update components that use the old type imports:

```typescript
// OLD
import { PriceRange } from '@/types/dining'

// NEW  
import { PriceRange } from '@/types/shared'

// Update enum usage if needed
const price = PriceRange.LOW // instead of PriceRange.BUDGET
```

### 6. Data Migration

Update data files and seed scripts:

```typescript
// OLD
{ priceRange: "Budget" }

// NEW
{ priceRange: PriceRange.LOW }
```

## Benefits of Migration

1. **Eliminates Type Drift** - Single source of truth prevents type definitions from diverging
2. **Better Type Safety** - Unified interfaces catch mismatches at compile time
3. **Easier Maintenance** - Changes only need to be made in one place
4. **Improved Consistency** - All parts of the app use the same data structures
5. **Better IDE Support** - Autocomplete and refactoring work consistently

## Validation

After migration, verify:

1. All TypeScript files compile without errors
2. Existing tests pass
3. Runtime behavior remains unchanged
4. No type casting workarounds are needed

## Gradual Migration

You can migrate gradually:

1. Start with the most commonly used types (PriceRange, Attraction)
2. Update one domain at a time (attractions, then dining, etc.)
3. Use type aliases for temporary backward compatibility:

```typescript
// Temporary backward compatibility
export { PriceRange as DiningPriceRange } from './shared'
```

## Common Issues

### Property Name Conflicts
Some interfaces had properties with different names (`area` vs `landName`). The unified interface supports both for backward compatibility.

### Enum Value Changes
Update code that references the old enum values to use the new standardized names.

### Optional vs Required Properties
The unified interfaces make conflicting properties optional to maintain compatibility.

This migration will significantly improve the type safety and maintainability of the codebase. 