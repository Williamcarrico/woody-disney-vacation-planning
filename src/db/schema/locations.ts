import { pgTable, text, timestamp, uuid, json, boolean, real, integer, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
import { vacations } from './vacations'

// Enums for better type safety
export const locationTypeEnum = pgEnum('location_type', ['current', 'historical', 'planned'])
export const geofenceTypeEnum = pgEnum('geofence_type', ['attraction', 'meeting', 'safety', 'custom', 'directional', 'altitude'])
export const alertTypeEnum = pgEnum('alert_type', ['entry', 'exit', 'proximity', 'separation', 'safety'])

// User location tracking table
export const userLocations = pgTable('user_locations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    vacationId: uuid('vacation_id').references(() => vacations.id),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    accuracy: real('accuracy'), // GPS accuracy in meters
    altitude: real('altitude'),
    heading: real('heading'), // Direction of travel in degrees
    speed: real('speed'), // Speed in m/s
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    type: locationTypeEnum('type').notNull().default('current'),
    metadata: json('metadata').$type<{
        deviceInfo?: string
        networkType?: string
        batteryLevel?: number
        isBackground?: boolean
        parkArea?: string
        attraction?: string
        activity?: string
    }>(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Geofences table
export const geofences = pgTable('geofences', {
    id: uuid('id').defaultRandom().primaryKey(),
    vacationId: uuid('vacation_id').references(() => vacations.id),
    createdBy: text('created_by').notNull().references(() => users.id),
    name: text('name').notNull(),
    description: text('description'),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    radius: real('radius').notNull(), // Radius in meters
    type: geofenceTypeEnum('type').notNull().default('custom'),
    isActive: boolean('is_active').default(true),

    // Directional geofencing support
    direction: real('direction'), // Direction angle in degrees (0-360)
    directionRange: real('direction_range'), // Range of direction in degrees

    // Altitude geofencing support
    minAltitude: real('min_altitude'),
    maxAltitude: real('max_altitude'),

    // Time-based activation
    activeStartTime: timestamp('active_start_time'),
    activeEndTime: timestamp('active_end_time'),

    // Advanced settings
    settings: json('settings').$type<{
        notifyOnEntry?: boolean
        notifyOnExit?: boolean
        cooldownMinutes?: number
        maxAlerts?: number
        triggerDistance?: number
        requiresMovement?: boolean
        parkArea?: string
        attraction?: string
        customMessage?: string
        soundAlert?: boolean
        vibrationAlert?: boolean
        priority?: 'low' | 'medium' | 'high' | 'urgent'
    }>().default({}),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Geofence alerts/triggers table
export const geofenceAlerts = pgTable('geofence_alerts', {
    id: uuid('id').defaultRandom().primaryKey(),
    geofenceId: uuid('geofence_id').notNull().references(() => geofences.id),
    userId: text('user_id').notNull().references(() => users.id),
    vacationId: uuid('vacation_id').references(() => vacations.id),
    alertType: alertTypeEnum('alert_type').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    distance: real('distance'), // Distance from geofence center when triggered
    message: text('message'),
    isRead: boolean('is_read').default(false),
    metadata: json('metadata').$type<{
        accuracy?: number
        speed?: number
        heading?: number
        triggeredAt?: string
        deviceInfo?: string
        userAgent?: string
    }>(),
    triggeredAt: timestamp('triggered_at').notNull().defaultNow(),
    readAt: timestamp('read_at'),
})

// Location sharing preferences
export const locationSharing = pgTable('location_sharing', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    vacationId: uuid('vacation_id').notNull().references(() => vacations.id),
    shareWith: text('share_with').notNull().references(() => users.id), // Who can see this user's location
    isEnabled: boolean('is_enabled').default(true),
    shareCurrentLocation: boolean('share_current_location').default(true),
    shareHistoricalLocation: boolean('share_historical_location').default(false),
    alertOnGeofenceEntry: boolean('alert_on_geofence_entry').default(true),
    alertOnSeparation: boolean('alert_on_separation').default(true),
    maxSeparationDistance: real('max_separation_distance').default(200), // meters
    settings: json('settings').$type<{
        updateInterval?: number // seconds
        accuracy?: 'high' | 'medium' | 'low'
        backgroundUpdates?: boolean
        onlyInParks?: boolean
        shareETA?: boolean
        shareActivity?: boolean
    }>().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Location analytics for insights
export const locationAnalytics = pgTable('location_analytics', {
    id: uuid('id').defaultRandom().primaryKey(),
    vacationId: uuid('vacation_id').notNull().references(() => vacations.id),
    userId: text('user_id').notNull().references(() => users.id),
    date: timestamp('date').notNull(),
    totalDistance: real('total_distance'), // Total distance traveled in meters
    averageSpeed: real('average_speed'), // Average speed in m/s
    maxSpeed: real('max_speed'), // Maximum speed in m/s
    timeInParks: integer('time_in_parks'), // Time spent in Disney parks in minutes
    timeAtAttractions: integer('time_at_attractions'), // Time at attractions in minutes
    attractionsVisited: json('attractions_visited').$type<string[]>().default([]),
    areasVisited: json('areas_visited').$type<string[]>().default([]),
    geofenceTriggered: integer('geofence_triggered').default(0),
    stepsEstimate: integer('steps_estimate'), // Estimated steps based on movement
    caloriesEstimate: integer('calories_estimate'), // Estimated calories burned
    metadata: json('metadata').$type<{
        weather?: string
        temperature?: number
        crowdLevels?: string
        specialEvents?: string[]
        notes?: string
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Types for TypeScript
export type UserLocation = typeof userLocations.$inferSelect
export type NewUserLocation = typeof userLocations.$inferInsert
export type Geofence = typeof geofences.$inferSelect
export type NewGeofence = typeof geofences.$inferInsert
export type GeofenceAlert = typeof geofenceAlerts.$inferSelect
export type NewGeofenceAlert = typeof geofenceAlerts.$inferInsert
export type LocationSharing = typeof locationSharing.$inferSelect
export type NewLocationSharing = typeof locationSharing.$inferInsert
export type LocationAnalytics = typeof locationAnalytics.$inferSelect
export type NewLocationAnalytics = typeof locationAnalytics.$inferInsert