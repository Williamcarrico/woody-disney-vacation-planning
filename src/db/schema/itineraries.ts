import { pgTable, text, timestamp, uuid, json, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
import { vacations } from './vacations'

export const itineraries = pgTable('itineraries', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    vacationId: uuid('vacation_id').references(() => vacations.id),
    tripName: text('trip_name').notNull(),
    parkDays: json('park_days').notNull().$type<{
        date: string
        parkId: string
        activities: Array<{
            id?: string
            name: string
            type: string
            startTime: string
            endTime: string
            location?: string
            description?: string
            waitTime?: number
            walkingTime?: number
            notes?: string
        }>
    }[]>(),
    preferences: json('preferences').notNull().$type<{
        partySize?: number
        hasChildren?: boolean
        childrenAges?: number[]
        hasStroller?: boolean
        mobilityConsiderations?: boolean
        ridePreference?: 'thrill' | 'family' | 'all'
        maxWaitTime?: number
        walkingPace?: 'slow' | 'moderate' | 'fast'
        useGeniePlus?: boolean
        useIndividualLightningLane?: boolean
    }>(),
    isShared: boolean('is_shared').default(false),
    shareCode: text('share_code').unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Itinerary = typeof itineraries.$inferSelect
export type NewItinerary = typeof itineraries.$inferInsert