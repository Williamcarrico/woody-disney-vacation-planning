import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './schema/users'
import { vacations } from './schema/vacations'
import { itineraries } from './schema/itineraries'
import { calendarEvents, eventSharing, eventHistory } from './schema/calendar-events'

// Get database connection string from environment variable with fallback
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/disney_vacation'

let client: any = null;
let db: any = null;

try {
    // Create a PostgreSQL client with error handling
    client = postgres(connectionString, {
        prepare: false, // Disable prepared statements for edge compatibility
        max: 10, // Maximum number of connections
        idle_timeout: 60, // Idle connections timeout in seconds
        connect_timeout: 10, // Connection timeout in seconds
        onnotice: () => { }, // Suppress notices
        onparameter: () => { }, // Suppress parameter notices
    })

    // Create a Drizzle ORM instance
    db = drizzle(client, {
        schema: {
            users,
            vacations,
            itineraries,
            calendarEvents,
            eventSharing,
            eventHistory
        }
    })

    console.log('✅ Database connection initialized successfully')
} catch (error) {
    console.warn('⚠️ Database connection failed, running in fallback mode:', error)

    // Create a mock database object for fallback
    db = {
        select: () => ({
            from: () => ({
                where: () => ({
                    orderBy: () => ({
                        limit: () => ({
                            offset: () => Promise.resolve([])
                        })
                    })
                })
            })
        }),
        insert: () => ({
            values: () => ({
                returning: () => Promise.resolve([])
            })
        }),
        update: () => ({
            set: () => ({
                where: () => Promise.resolve([])
            })
        }),
        delete: () => ({
            where: () => Promise.resolve([])
        })
    }
}

export { db, users, vacations, itineraries, calendarEvents, eventSharing, eventHistory }

// Graceful shutdown
if (typeof process !== 'undefined') {
    process.on('SIGINT', async () => {
        if (client && typeof client.end === 'function') {
            await client.end()
        }
        process.exit(0)
    })

    process.on('SIGTERM', async () => {
        if (client && typeof client.end === 'function') {
            await client.end()
        }
        process.exit(0)
    })
}