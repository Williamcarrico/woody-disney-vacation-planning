/**
 * Unified type exports for the Disney Vacation Planning app
 * Provides a single entry point for all type definitions
 */

// =============================================================================
// DOMAIN TYPES
// =============================================================================

// Parks and Attractions
export * from './parks.model';

// Dining
export * from './dining.model';

// Events and Calendar
export * from './events.model';

// =============================================================================
// API TYPES
// =============================================================================

// API Response Types
// TODO: Fix duplicate exports with parks.model and resort.model
// export * from './api-types';

// Shared API Types
// TODO: Fix duplicate exports with attraction.ts
// export * from './api';

// =============================================================================
// INFRASTRUCTURE TYPES
// =============================================================================

// Shared/Common Types
// TODO: Fix duplicate exports with parks.model
// export * from './shared';

// Resort Types
export * from './resort.model';

// Attraction Types
export * from './attraction';

// Theme Parks API Types
export * from './themeparks';

// Disney Springs Types
export * from './disneysprings';

// Weather Types
export * from './weather';

// Messaging Types
export * from './messaging';

// Calendar Events Types
export * from './calendar-events';

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Strict Types
export * from './strict-types';

// Map Provider Types
export * from './map-provider';

// Unified Resort Types - Export only non-conflicting exports
export {
    // Constants (no conflicts, these are objects not types/enums)
    RESORT_CATEGORIES,
    RESORT_AREAS,
    ROOM_TYPES,
    TRANSPORTATION_TYPES,
    AMENITY_CATEGORIES,
    
    // Schemas (no conflicts)
    coordinatesSchema,
    priceRangeSchema,
    contactInfoSchema,
    addressSchema,
    locationSchema,
    amenitySchema,
    diningLocationSchema,
    recreationActivitySchema,
    transportationOptionSchema,
    roomTypeSchema,
    pricingSchema,
    resortSchema,
    createResortSchema,
    updateResortSchema,
    resortQuerySchema,
    
    // Types - renamed to avoid conflicts with resort.model.ts
    type Resort as UnifiedResort,
    type CreateResortInput as UnifiedCreateResortInput,
    type UpdateResortInput as UnifiedUpdateResortInput,
    // Don't export ResortCategory and ResortArea types as they conflict
    
    // These types don't conflict
    type ResortQuery,
    type ResortListResponse,
    type ResortDetailResponse,
    
    // Validation functions (no conflicts)
    validateResort,
    validateCreateResort,
    validateUpdateResort,
    isResort
} from './unified-resort';