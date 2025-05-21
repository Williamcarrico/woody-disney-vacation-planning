import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './schema/users'
import { vacations } from './schema/vacations'
import { itineraries } from './schema/itineraries'

// Get database connection string from environment variable
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/disney_vacation'

// Create a PostgreSQL client
const client = postgres(connectionString, {
    prepare: false, // Disable prepared statements for edge compatibility
    max: 10, // Maximum number of connections
    idle_timeout: 60, // Idle connections timeout in seconds
})

// Create a Drizzle ORM instance
export const db = drizzle(client, {
    schema: {
        users,
        vacations,
        itineraries
    }
})

export { users, vacations, itineraries }