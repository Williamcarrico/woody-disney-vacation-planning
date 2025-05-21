import { pgTable, text, timestamp, uuid, json, boolean, date } from 'drizzle-orm/pg-core'
import { users } from './users'

export const vacations = pgTable('vacations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    name: text('name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    destination: text('destination').notNull().default('Walt Disney World'),
    budget: json('budget').$type<{
        total: number
        spent: number
        categories: {
            [key: string]: {
                planned: number
                actual: number
            }
        }
    }>(),
    travelers: json('travelers').$type<{
        adults: number
        children: number
        childrenAges?: number[]
    }>().notNull(),
    accommodations: json('accommodations').$type<{
        resortId?: string
        resortName?: string
        roomType?: string
        checkInDate?: string
        checkOutDate?: string
        confirmationNumber?: string
    }>(),
    notes: text('notes'),
    isArchived: boolean('is_archived').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Vacation = typeof vacations.$inferSelect
export type NewVacation = typeof vacations.$inferInsert