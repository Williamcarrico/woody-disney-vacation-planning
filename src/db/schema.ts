import * as itineraries from './schema/itineraries'

// Export all schema objects
export {
    itineraries,
    // Add others as they are created
    // users,
    // vacations,
}

// Create a single db object containing all schemas
export const schema = {
    ...itineraries,
    // Spread others as they are created
    // ...users,
    // ...vacations,
}