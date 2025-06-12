import { z } from 'zod';

// Location-related schemas
export const LocationMetadataSchema = z.object({
  deviceInfo: z.string().optional(),
  networkType: z.string().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  isBackground: z.boolean().optional(),
  parkArea: z.string().optional(),
  attraction: z.string().optional(),
  activity: z.string().optional(),
}).optional();

export const LocationUpdateBodySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  userId: z.string().min(1),
  userName: z.string().min(1),
  vacationId: z.string().optional(),
  accuracy: z.number().positive().optional(),
  altitude: z.number().optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
  timestamp: z.string().datetime().optional(),
  metadata: LocationMetadataSchema,
});

export const LocationAnalyticsQuerySchema = z.object({
  vacationId: z.string().optional(),
  userId: z.string().optional(),
  type: z.enum(['current', 'historical', 'planned', 'all']).default('current'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  includeAnalytics: z.boolean().default(false),
});

// Database types
export const UserLocationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  vacationId: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().nullable(),
  altitude: z.number().nullable(),
  heading: z.number().nullable(),
  speed: z.number().nullable(),
  timestamp: z.date(),
  type: z.enum(['current', 'historical', 'planned']),
  metadata: z.record(z.unknown()).nullable(),
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// API Response schemas
export const LocationAnalyticsSchema = z.object({
  totalLocationPoints: z.number(),
  uniqueUsers: z.number(),
  averageAccuracy: z.number().nullable(),
  maxSpeed: z.number().nullable(),
  averageSpeed: z.number().nullable(),
  parkAreasVisited: z.array(z.string()),
  dateRange: z.object({
    start: z.string().nullable(),
    end: z.string().nullable(),
  }),
});

export const GeofenceEventSchema = z.object({
  id: z.string(),
  geofenceId: z.string(),
  userId: z.string(),
  vacationId: z.string(),
  alertType: z.enum(['entry', 'exit', 'dwell']),
  latitude: z.number(),
  longitude: z.number(),
  distance: z.number(),
  message: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  triggeredAt: z.date(),
});

export const LocationUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    location: UserLocationSchema,
    geofenceEvents: z.array(GeofenceEventSchema),
    eventsTriggered: z.number(),
  }),
});

export const LocationGetResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    locations: z.array(UserLocationSchema).optional(),
    locationsByUser: z.record(z.array(UserLocationSchema)).optional(),
    totalUsers: z.number().optional(),
    analytics: LocationAnalyticsSchema.nullable(),
    pagination: z.object({
      limit: z.number(),
      offset: z.number(),
      total: z.number(),
    }).optional(),
  }),
  vacationId: z.string(),
});

// Drizzle ORM types (properly typed)
export interface DrizzleDB {
  insert: (table: any) => {
    values: (data: any) => {
      returning: () => Promise<any[]>;
    };
  };
  update: (table: any) => {
    set: (data: any) => {
      where: (condition: any) => Promise<any>;
    };
  };
  select: (fields?: any) => {
    from: (table: any) => {
      where?: (condition: any) => any;
      orderBy?: (...args: any[]) => any;
      limit?: (limit: number) => any;
      offset?: (offset: number) => any;
    };
  };
  selectDistinct: (fields: any) => {
    from: (table: any) => {
      where: (condition: any) => {
        then: (fn: (rows: any[]) => any) => Promise<any>;
      };
    };
  };
  delete: (table: any) => {
    where: (condition: any) => {
      returning: () => Promise<any[]>;
    };
  };
}

export interface DrizzleOperators {
  eq: (column: any, value: any) => any;
  and: (...conditions: any[]) => any;
  desc: (column: any) => any;
  gte: (column: any, value: any) => any;
  lte: (column: any, value: any) => any;
  avg: (column: any) => any;
  count: () => any;
  max: (column: any) => any;
}

export interface UserLocationTable {
  id: any;
  userId: any;
  vacationId: any;
  latitude: any;
  longitude: any;
  accuracy: any;
  altitude: any;
  heading: any;
  speed: any;
  timestamp: any;
  type: any;
  metadata: any;
  isActive: any;
}

export interface GeofencingService {
  loadGeofences: (vacationId: string) => Promise<void>;
  processLocationUpdate: (
    locationData: {
      userId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
      altitude?: number;
      heading?: number;
      speed?: number;
      timestamp: Date;
      metadata?: Record<string, unknown>;
    },
    userName: string
  ) => Promise<z.infer<typeof GeofenceEventSchema>[]>;
}

// Type exports
export type LocationUpdateBody = z.infer<typeof LocationUpdateBodySchema>;
export type LocationAnalyticsQuery = z.infer<typeof LocationAnalyticsQuerySchema>;
export type UserLocation = z.infer<typeof UserLocationSchema>;
export type LocationAnalytics = z.infer<typeof LocationAnalyticsSchema>;
export type GeofenceEvent = z.infer<typeof GeofenceEventSchema>;
export type LocationUpdateResponse = z.infer<typeof LocationUpdateResponseSchema>;
export type LocationGetResponse = z.infer<typeof LocationGetResponseSchema>;