# Type Migration Scripts

This directory contains scripts and utilities to help migrate from duplicate type definitions to the unified shared type system.

## Files

- `migrate-types.ts` - Automated migration script
- `../src/types/shared.ts` - Unified type definitions
- `../src/types/migration-guide.md` - Detailed migration guide

## Quick Start

### 1. Preview Migration (Dry Run)
```bash
# Preview what would be changed without making any modifications
npx ts-node scripts/migrate-types.ts --dry-run
```

### 2. Run Migration
```bash
# Apply the migration changes
npx ts-node scripts/migrate-types.ts
```

### 3. Manual Cleanup
After running the automated migration:

1. Review the migration report for manual changes needed
2. Update any remaining type references
3. Remove duplicate type definitions from the original files
4. Run TypeScript compiler to check for errors
5. Run tests to ensure functionality is preserved

## What the Migration Does

### Automatic Changes
- Updates import statements to use shared types
- Converts enum value references to the new unified names
- Reports on files that need manual attention

### Manual Changes Required
- Remove duplicate type definitions from original files
- Update any complex type usage that the script can't automatically handle
- Resolve any TypeScript compilation errors

## Affected Types

The migration consolidates these duplicate definitions:

1. **PriceRange** (disneysprings.ts, dining.ts)
2. **MenuHighlight** (disneysprings.ts, dining.ts)  
3. **OperatingHours** (parks.ts, dining.ts)
4. **Attraction** (attraction.ts, parks.ts, themeparks.ts)
5. **AccessibilityInfo** (attraction.ts, parks.ts, themeparks.ts)
6. **DisneyPark** (parks.ts, themeparks.ts)
7. **SnackLocation** (parks.ts, themeparks.ts)
8. **MenuCategory** (parks.ts, themeparks.ts)
9. **MenuItem** (parks.ts, themeparks.ts)  
10. **ParkingInfo** (parks.ts, themeparks.ts)

## Benefits

- ✅ Eliminates type drift between files
- ✅ Single source of truth for all common types
- ✅ Better TypeScript IntelliSense and error checking  
- ✅ Easier maintenance and updates
- ✅ Consistent data structures across the application

## Troubleshooting

### TypeScript Errors After Migration
If you encounter TypeScript errors after migration:

1. Check the migration report for manual changes needed
2. Ensure all old type definitions are removed from source files
3. Update any complex type usage that wasn't automatically migrated
4. Consider adding type aliases for backward compatibility if needed

### Enum Value Errors
If you see errors about enum values:

1. Check that old enum values are updated to the new standardized names
2. Update any string literals that reference the old enum values
3. Consider using string literal types if the enum values are used in data files

### Property Name Conflicts
The unified interfaces support both old and new property names for backward compatibility:

- `area` and `landName` are both supported
- `waitTime` is now `number | null` instead of `number | undefined`

For any issues, refer to the detailed migration guide at `src/types/migration-guide.md`. 