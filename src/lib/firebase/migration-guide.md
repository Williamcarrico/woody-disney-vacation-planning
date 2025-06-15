# Migration Guide: Transitioning to Validated Firestore Services

This guide explains how to migrate from the existing Firestore services to the new validated services that provide runtime type safety using Zod.

## Overview

The validated Firestore services provide:
- Runtime type validation for all data entering and leaving Firestore
- Detailed error reporting with validation context
- Fallback support for partial data recovery
- Type-safe subscriptions with error callbacks
- Caching with validation tracking

## Migration Steps

### 1. Update Imports

Replace existing service imports with validated versions:

```typescript
// Before
import { UserService, VacationService } from '@/lib/firebase/firestore-service'

// After
import { ValidatedUserService, ValidatedVacationService } from '@/lib/firebase/validated-firestore-service'
```

### 2. Handle Validation Errors

The new services may throw `ValidationError` when data doesn't match schemas:

```typescript
// Before
try {
    const user = await UserService.getUserProfile(userId)
    if (user) {
        // Use user data
    }
} catch (error) {
    console.error('Failed to fetch user')
}

// After
import { ValidationError } from '@/lib/firebase/validated-firestore-service'

try {
    const user = await ValidatedUserService.getUser(userId)
    if (user) {
        // User data is guaranteed to match the schema
    }
} catch (error) {
    if (error instanceof ValidationError) {
        console.error('Data validation failed:', error.errors)
        // Handle validation errors specifically
        // Consider showing user-friendly error or using fallback data
    } else {
        console.error('Failed to fetch user')
    }
}
```

### 3. Update Create/Update Operations

Input data is now validated before being sent to Firestore:

```typescript
// Before
const vacationId = await VacationService.createVacation({
    userId: auth.currentUser.uid,
    name: formData.name,
    startDate: formData.startDate,
    // ... other fields
})

// After
try {
    const vacationId = await ValidatedVacationService.createVacation({
        userId: auth.currentUser!.uid, // Note: stricter null checks with noUncheckedIndexedAccess
        name: formData.name,
        startDate: formData.startDate, // Must be ISO string format
        endDate: formData.endDate, // Required field
        travelers: {
            adults: formData.adults || 1, // Required with minimum
            children: formData.children || 0,
            childrenAges: formData.childrenAges // Will be validated against children count
        }
        // All required fields must be provided
    })
} catch (error) {
    if (error instanceof ValidationError) {
        // Show specific validation errors to user
        const fieldErrors = error.errors.reduce((acc, err) => {
            const field = err.path.join('.')
            acc[field] = err.message
            return acc
        }, {} as Record<string, string>)
        
        setFormErrors(fieldErrors)
    }
}
```

### 4. Update Subscriptions

Real-time subscriptions now include validation error callbacks:

```typescript
// Before
const unsubscribe = VacationService.subscribeToVacations(
    userId,
    (vacations) => {
        setVacations(vacations)
    }
)

// After
const unsubscribe = ValidatedVacationService.subscribeToVacations(
    userId,
    (vacations) => {
        // Only valid vacations are included
        setVacations(vacations)
    },
    (validationErrors) => {
        // Handle documents that failed validation
        console.warn('Some vacations failed validation:', validationErrors)
        // Optionally notify user about data issues
    }
)
```

### 5. Handle Stricter TypeScript Settings

With `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`:

```typescript
// Array access now returns T | undefined
const firstVacation = vacations[0]
if (firstVacation) {
    // Must check for undefined
}

// Object property access
const budget = vacation.budget
if (budget) {
    const total = budget.total // Safe access
}

// Optional properties must match exactly
interface UpdateData {
    name?: string
    // This is different from name: string | undefined
}

// Use Partial for updates
const updates: Partial<CreateVacationInput> = {
    name: newName || undefined, // Not null or empty string
}
```

### 6. Third-Party API Integration

Use the new validation middleware for external APIs:

```typescript
// Before
const response = await fetch(`${WEATHER_API_URL}/current`)
const weather = await response.json()

// After
import { createValidatedFetch, ThirdPartySchemas, FallbackProviders } from '@/lib/api/third-party-validation'

const weatherApi = createValidatedFetch(WEATHER_API_URL, {
    headers: {
        'Authorization': `Bearer ${process.env.WEATHER_API_KEY}`
    }
})

const weather = await weatherApi.getValidated(
    '/current',
    ThirdPartySchemas.weather.currentConditions,
    FallbackProviders.weather.currentConditions
)
// weather is guaranteed to match schema or fallback is used
```

### 7. Update Error Handling Patterns

Implement consistent error handling across the app:

```typescript
// Create a custom hook for validated data fetching
function useValidatedData<T>(
    fetcher: () => Promise<T | null>,
    dependencies: unknown[]
) {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [validationErrors, setValidationErrors] = useState<ZodError['errors'] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function fetchData() {
            try {
                setLoading(true)
                setError(null)
                setValidationErrors(null)
                
                const result = await fetcher()
                if (!cancelled) {
                    setData(result)
                }
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof ValidationError) {
                        setValidationErrors(err.errors)
                    } else {
                        setError(err as Error)
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            cancelled = true
        }
    }, dependencies)

    return { data, error, validationErrors, loading }
}

// Usage
const { data: vacation, error, validationErrors, loading } = useValidatedData(
    () => ValidatedVacationService.getVacation(vacationId),
    [vacationId]
)
```

## Common Issues and Solutions

### Issue: Timestamp Validation Failures

If you get timestamp validation errors, ensure dates are properly converted:

```typescript
// For input
import { Timestamp } from 'firebase/firestore'

const eventData = {
    date: Timestamp.fromDate(new Date(selectedDate)),
    // or for ISO strings
    date: Timestamp.fromDate(new Date(isoString))
}

// The schema handles multiple input formats
```

### Issue: Missing Required Fields

The schemas enforce all required fields. Check the schema definitions:

```typescript
// Review schema requirements
import { vacationSchema } from '@/lib/schemas/firebase-validation'

// Use TypeScript to ensure all fields are provided
const vacationInput: CreateVacationInput = {
    // TypeScript will error on missing required fields
}
```

### Issue: Partial Data from Legacy Documents

For existing data that might not match new schemas:

```typescript
// Use allowPartial option for reading legacy data
const resort = await ValidatedFirestoreService.getDocument(
    'resorts',
    resortId,
    resortSchema,
    { allowPartial: true }
)

// Or implement a migration script
async function migrateResorts() {
    const snapshot = await getDocs(collection(firestore, 'resorts'))
    const batch = writeBatch(firestore)
    
    for (const doc of snapshot.docs) {
        const data = doc.data()
        // Add missing required fields with defaults
        const updated = {
            ...data,
            searchTerms: data.searchTerms || [],
            areaIndex: data.areaIndex || '',
            // etc.
        }
        
        batch.update(doc.ref, updated)
    }
    
    await batch.commit()
}
```

## Best Practices

1. **Always handle ValidationError separately** from other errors to provide specific feedback

2. **Use TypeScript strictly** - The stricter settings will catch more potential runtime errors

3. **Test with invalid data** during development to ensure error handling works correctly

4. **Monitor validation errors** in production to identify data quality issues

5. **Use fallback providers** for third-party APIs to ensure app stability

6. **Document schema changes** and communicate them to the team

7. **Run validation in development** but consider relaxing in production for performance:

```typescript
const options = {
    useCache: true,
    allowPartial: process.env.NODE_ENV === 'production'
}
```

## Performance Considerations

- Validation adds minimal overhead (typically < 1ms per document)
- Caching is schema-aware, preventing stale data issues
- Batch operations validate all items before writing
- Real-time listeners validate on each update

## Rollback Plan

If issues arise, you can temporarily use the original services while fixing validation issues:

```typescript
// Temporary wrapper during migration
export const SafeUserService = process.env.USE_VALIDATION 
    ? ValidatedUserService 
    : UserService
```

Then gradually enable validation per service as issues are resolved. 