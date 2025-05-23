import * as itineraries from './schema/itineraries'
import * as users from './schema/users'
import * as vacations from './schema/vacations'
import * as locations from './schema/locations'

// Export all schema objects
export {
    itineraries,
    users,
    vacations,
    locations,
}

// Create a single db object containing all schemas
export const schema = {
    ...itineraries,
    ...users,
    ...vacations,
    ...locations,
}