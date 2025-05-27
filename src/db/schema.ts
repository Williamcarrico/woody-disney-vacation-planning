import * as itineraries from './schema/itineraries'
import * as users from './schema/users'
import * as vacations from './schema/vacations'
import * as locations from './schema/locations'
import * as calendarEvents from './schema/calendar-events'

// Export all schema objects
export {
    itineraries,
    users,
    vacations,
    locations,
    calendarEvents,
}

// Create a single db object containing all schemas
export const schema = {
    ...itineraries,
    ...users,
    ...vacations,
    ...locations,
    ...calendarEvents,
}