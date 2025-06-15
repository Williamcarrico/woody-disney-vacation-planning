# TypeScript Strictness Fixes Guide

This guide helps address common TypeScript violations that appear after enabling stricter compiler options.

## Common Violations and Fixes

### 1. Property Access from Index Signature (`noPropertyAccessFromIndexSignature`)

**Error**: `Property 'X' comes from an index signature, so it must be accessed with ['X']`

**Fix**: Use bracket notation for index signature access

```typescript
// Before
const apiKey = process.env.FIREBASE_API_KEY

// After
const apiKey = process.env['FIREBASE_API_KEY']

// Or better, use type assertions
const env = process.env as Record<string, string>
const apiKey = env['FIREBASE_API_KEY']
```

### 2. Exact Optional Properties (`exactOptionalPropertyTypes`)

**Error**: `Type 'string | undefined' is not assignable to type 'string'`

**Fix**: Handle undefined explicitly

```typescript
// Before
interface Config {
    apiKey?: string
}
const config: Config = {
    apiKey: process.env['API_KEY'] // Could be undefined
}

// After - Option 1: Required with fallback
const config: Config = {
    apiKey: process.env['API_KEY'] || 'default-key'
}

// After - Option 2: Type guard
const apiKey = process.env['API_KEY']
if (apiKey) {
    const config: Config = { apiKey }
}

// After - Option 3: Non-null assertion (use carefully)
const config: Config = {
    apiKey: process.env['API_KEY']!
}
```

### 3. Array Access with `noUncheckedIndexedAccess`

**Error**: Object is possibly 'undefined'

**Fix**: Check for undefined before use

```typescript
// Before
const firstItem = array[0]
console.log(firstItem.name)

// After
const firstItem = array[0]
if (firstItem) {
    console.log(firstItem.name)
}

// Or use optional chaining
console.log(array[0]?.name)
```

### 4. Next.js Route Parameter Types

**Error**: Route context type mismatches

**Fix**: Use proper async params pattern

```typescript
// Before
export default function Page({ params }: { params: { id: string } }) {
    // ...
}

// After (Next.js 15+)
export default async function Page({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params
    // ...
}
```

## Specific Fixes for Common Patterns

### Environment Variables

Create a typed environment helper:

```typescript
// src/lib/env.ts
export function getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key]
    if (!value && !fallback) {
        throw new Error(`Missing required environment variable: ${key}`)
    }
    return value || fallback!
}

// Usage
import { getEnvVar } from '@/lib/env'

const firebaseConfig = {
    apiKey: getEnvVar('FIREBASE_API_KEY'),
    authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
    // etc.
}
```

### Firebase Initialization

```typescript
// src/lib/firebase/safe-init.ts
import { initializeApp, FirebaseOptions } from 'firebase/app'
import { getEnvVar } from '@/lib/env'

function getFirebaseConfig(): FirebaseOptions {
    return {
        apiKey: getEnvVar('FIREBASE_API_KEY'),
        authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvVar('FIREBASE_PROJECT_ID'),
        storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('FIREBASE_APP_ID'),
    }
}

export const app = initializeApp(getFirebaseConfig())
```

### Safe Array Operations

```typescript
// src/lib/utils/array-helpers.ts

export function getFirstItem<T>(array: T[]): T | undefined {
    return array[0]
}

export function getItemAtIndex<T>(array: T[], index: number): T | undefined {
    return array[index]
}

export function requireItemAtIndex<T>(array: T[], index: number, message?: string): T {
    const item = array[index]
    if (!item) {
        throw new Error(message || `No item at index ${index}`)
    }
    return item
}

// Usage
const items = ['a', 'b', 'c']
const first = getFirstItem(items) // string | undefined
if (first) {
    console.log(first.toUpperCase())
}

// Or when you're sure it exists
const required = requireItemAtIndex(items, 0, 'Array must not be empty')
console.log(required.toUpperCase()) // Safe!
```

### Object Property Access

```typescript
// src/lib/utils/object-helpers.ts

export function getProperty<T, K extends keyof T>(
    obj: T,
    key: K
): T[K] | undefined {
    return obj[key]
}

export function hasProperty<T extends object, K extends PropertyKey>(
    obj: T,
    key: K
): obj is T & Record<K, unknown> {
    return key in obj
}

// Usage
const data: Record<string, unknown> = { name: 'test' }

if (hasProperty(data, 'name') && typeof data.name === 'string') {
    console.log(data.name.toUpperCase())
}
```

## Migration Strategy

### Phase 1: Critical Fixes
1. Fix build-blocking errors
2. Add non-null assertions where safe
3. Use fallback values for optional configs

### Phase 2: Proper Error Handling
1. Replace non-null assertions with proper checks
2. Add error boundaries for runtime failures
3. Implement proper logging

### Phase 3: Type Refinement
1. Create proper type guards
2. Use discriminated unions where appropriate
3. Remove any remaining `any` types

## Temporary Workarounds

If you need to deploy before fixing all issues:

```json
// tsconfig.json - Temporarily disable specific rules
{
  "compilerOptions": {
    // Keep most strict settings
    "strict": true,
    "noUncheckedIndexedAccess": true,
    
    // Temporarily disable problematic ones
    "exactOptionalPropertyTypes": false,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

Then gradually re-enable them as you fix violations.

## ESLint Configuration

Add these rules to catch issues early:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
  }
}
```

## Testing Strategies

```typescript
// src/lib/test-utils/type-tests.ts

// Test that optional properties work correctly
type TestOptional = {
    required: string
    optional?: string
}

const valid: TestOptional = { required: 'test' }
const alsoValid: TestOptional = { required: 'test', optional: 'test' }

// This should error with exactOptionalPropertyTypes
// const invalid: TestOptional = { required: 'test', optional: undefined }

// Test array access
function testArrayAccess<T>(arr: T[]): T | undefined {
    return arr[0] // Should return T | undefined with noUncheckedIndexedAccess
}
```

Remember: These stricter settings help catch real bugs. Take time to fix them properly rather than just suppressing the errors! 