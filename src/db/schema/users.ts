import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: text('id').primaryKey(), // Using Firebase Auth UID as primary key
    email: text('email').notNull().unique(),
    displayName: text('display_name'),
    photoURL: text('photo_url'),
    isEmailVerified: boolean('is_email_verified').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at'),
    preferences: jsonb('preferences').$type<{
        theme?: 'light' | 'dark' | 'system'
        emailNotifications?: boolean
        pushNotifications?: boolean
        language?: string
    }>().default({}),
    role: text('role').default('user'),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert