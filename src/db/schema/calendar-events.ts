import { pgTable, text, timestamp, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { vacations } from './vacations'
import { users } from './users'

// Calendar Events table
export const calendarEvents = pgTable('calendar_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    vacationId: uuid('vacation_id').notNull().references(() => vacations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Basic event information
    title: text('title').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    startTime: text('start_time'), // Format: "HH:MM"
    endTime: text('end_time'), // Format: "HH:MM"

    // Event categorization
    type: text('type').notNull().$type<'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment'>(),
    priority: text('priority').notNull().default('medium').$type<'low' | 'medium' | 'high' | 'critical'>(),
    status: text('status').notNull().default('planned').$type<'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified'>(),

    // Location information
    parkId: text('park_id'),
    attractionId: text('attraction_id'),
    locationName: text('location_name'),

    // Visual and organizational
    isHighlighted: boolean('is_highlighted').default(false),
    notes: text('notes'),
    tags: jsonb('tags').$type<string[]>(),
    color: text('color'),
    icon: text('icon'),
    participants: jsonb('participants').$type<string[]>(),

    // Reminder settings
    reminder: jsonb('reminder').$type<{
        enabled: boolean
        time: string
        type: 'notification' | 'email' | 'sms'
    }>(),

    // Reservation details
    reservation: jsonb('reservation').$type<{
        id: string
        name: string
        time: string
        partySize: number
        confirmed: boolean
        confirmationNumber?: string
        specialRequests?: string
        cost?: number
        prepaid?: boolean
    }>(),

    // Weather information
    weather: jsonb('weather').$type<{
        condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'partly-cloudy' | 'windy'
        highTemp: number
        lowTemp: number
        precipitation: number
        humidity: number
        windSpeed: number
        uvIndex: number
        visibility: number
        sunrise: string
        sunset: string
        moonPhase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'
    }>(),

    // Budget tracking
    budget: jsonb('budget').$type<{
        estimated: number
        actual?: number
        currency: string
        category: string
    }>(),

    // Transportation details
    transportation: jsonb('transportation').$type<{
        type: 'bus' | 'monorail' | 'boat' | 'skyliner' | 'car' | 'uber' | 'walk'
        pickupLocation?: string
        pickupTime?: string
        duration?: number
    }>(),

    // Task checklist
    checklist: jsonb('checklist').$type<Array<{
        id: string
        task: string
        completed: boolean
        dueTime?: string
    }>>(),

    // File attachments
    attachments: jsonb('attachments').$type<Array<{
        type: 'image' | 'document' | 'link'
        url: string
        title: string
        thumbnail?: string
    }>>(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    // Indexes for performance
    vacationIdIdx: index('calendar_events_vacation_id_idx').on(table.vacationId),
    userIdIdx: index('calendar_events_user_id_idx').on(table.userId),
    dateIdx: index('calendar_events_date_idx').on(table.date),
    typeIdx: index('calendar_events_type_idx').on(table.type),
    statusIdx: index('calendar_events_status_idx').on(table.status),
    vacationDateIdx: index('calendar_events_vacation_date_idx').on(table.vacationId, table.date),
}))

// Relations
export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
    vacation: one(vacations, {
        fields: [calendarEvents.vacationId],
        references: [vacations.id],
    }),
    user: one(users, {
        fields: [calendarEvents.userId],
        references: [users.id],
    }),
}))

// Event sharing table for collaborative events
export const eventSharing = pgTable('event_sharing', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull().references(() => calendarEvents.id, { onDelete: 'cascade' }),
    sharedWithUserId: uuid('shared_with_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    permission: text('permission').notNull().default('view').$type<'view' | 'edit' | 'admin'>(),
    sharedBy: uuid('shared_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    sharedAt: timestamp('shared_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    eventIdIdx: index('event_sharing_event_id_idx').on(table.eventId),
    sharedWithUserIdIdx: index('event_sharing_shared_with_user_id_idx').on(table.sharedWithUserId),
}))

export const eventSharingRelations = relations(eventSharing, ({ one }) => ({
    event: one(calendarEvents, {
        fields: [eventSharing.eventId],
        references: [calendarEvents.id],
    }),
    sharedWithUser: one(users, {
        fields: [eventSharing.sharedWithUserId],
        references: [users.id],
    }),
    sharedByUser: one(users, {
        fields: [eventSharing.sharedBy],
        references: [users.id],
    }),
}))

// Event history for tracking changes
export const eventHistory = pgTable('event_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull().references(() => calendarEvents.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull().$type<'created' | 'updated' | 'deleted' | 'shared' | 'status_changed'>(),
    changes: jsonb('changes').$type<Record<string, unknown>>(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    eventIdIdx: index('event_history_event_id_idx').on(table.eventId),
    timestampIdx: index('event_history_timestamp_idx').on(table.timestamp),
}))

export const eventHistoryRelations = relations(eventHistory, ({ one }) => ({
    event: one(calendarEvents, {
        fields: [eventHistory.eventId],
        references: [calendarEvents.id],
    }),
    user: one(users, {
        fields: [eventHistory.userId],
        references: [users.id],
    }),
}))