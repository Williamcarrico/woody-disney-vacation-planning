import { z } from 'zod';

// Unified geofence schema
export const GeofenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().positive(), // in meters
  type: z.enum(['attraction', 'restaurant', 'custom', 'safety', 'meetup']).default('custom'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  active: z.boolean().default(true),
  // Advanced features
  altitude: z.number().optional(), // in meters
  altitudeRadius: z.number().positive().optional(),
  direction: z.enum(['north', 'south', 'east', 'west', 'any']).optional(),
  directionAngle: z.number().min(0).max(360).optional(),
  schedule: z.object({
    startTime: z.string().optional(), // HH:MM format
    endTime: z.string().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
  // Alert configuration
  alerts: z.object({
    onEnter: z.boolean().default(true),
    onExit: z.boolean().default(true),
    onDwell: z.boolean().default(false),
    dwellTime: z.number().positive().optional(), // in seconds
    cooldown: z.number().positive().default(300), // 5 minutes default
    sound: z.boolean().default(false),
    vibrate: z.boolean().default(true),
  }).default({}),
  // Metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().optional(),
});

export type Geofence = z.infer<typeof GeofenceSchema>;

// Location data schema
export const LocationDataSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  accuracy: z.number().optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().optional(),
  timestamp: z.date().default(() => new Date()),
});

export type LocationData = z.infer<typeof LocationDataSchema>;

// Geofence event schema
export const GeofenceEventSchema = z.object({
  type: z.enum(['enter', 'exit', 'dwell']),
  geofence: GeofenceSchema,
  location: LocationDataSchema,
  distance: z.number(),
  timestamp: z.date(),
});

export type GeofenceEvent = z.infer<typeof GeofenceEventSchema>;

// Distance calculation utilities
export class DistanceCalculator {
  private static readonly EARTH_RADIUS_M = 6371000; // Earth radius in meters

  /**
   * Calculate distance between two points using Haversine formula
   * @returns Distance in meters
   */
  static haversine(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    
    const lat1 = toRad(point1.lat);
    const lat2 = toRad(point2.lat);
    const deltaLat = toRad(point2.lat - point1.lat);
    const deltaLng = toRad(point2.lng - point1.lng);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_M * c;
  }

  /**
   * Calculate bearing between two points
   * @returns Bearing in degrees (0-360)
   */
  static bearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);
    const deltaLng = toRad(to.lng - from.lng);

    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const bearing = toDeg(Math.atan2(x, y));
    return (bearing + 360) % 360;
  }

  /**
   * Calculate 3D distance including altitude
   * @returns Distance in meters
   */
  static distance3D(
    point1: { lat: number; lng: number; altitude?: number },
    point2: { lat: number; lng: number; altitude?: number }
  ): number {
    const horizontalDistance = this.haversine(point1, point2);
    
    if (point1.altitude !== undefined && point2.altitude !== undefined) {
      const altitudeDiff = Math.abs(point1.altitude - point2.altitude);
      return Math.sqrt(horizontalDistance ** 2 + altitudeDiff ** 2);
    }
    
    return horizontalDistance;
  }
}

/**
 * Consolidated geofencing service
 */
export class ConsolidatedGeofencingService {
  private static instance: ConsolidatedGeofencingService;
  private geofences: Map<string, Geofence> = new Map();
  private lastLocationsByUser: Map<string, LocationData> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private dwellTimers: Map<string, NodeJS.Timeout> = new Map();
  private eventHandlers: Array<(event: GeofenceEvent) => void> = [];

  private constructor() {}

  static getInstance(): ConsolidatedGeofencingService {
    if (!ConsolidatedGeofencingService.instance) {
      ConsolidatedGeofencingService.instance = new ConsolidatedGeofencingService();
    }
    return ConsolidatedGeofencingService.instance;
  }

  /**
   * Add or update a geofence
   */
  addGeofence(geofence: Geofence): void {
    const validated = GeofenceSchema.parse(geofence);
    this.geofences.set(validated.id, validated);
  }

  /**
   * Remove a geofence
   */
  removeGeofence(id: string): boolean {
    // Clear any dwell timers
    const timerId = `dwell-${id}`;
    if (this.dwellTimers.has(timerId)) {
      clearTimeout(this.dwellTimers.get(timerId)!);
      this.dwellTimers.delete(timerId);
    }
    
    return this.geofences.delete(id);
  }

  /**
   * Get all active geofences
   */
  getActiveGeofences(): Geofence[] {
    return Array.from(this.geofences.values()).filter(gf => gf.active);
  }

  /**
   * Check if a geofence is active based on schedule
   */
  private isGeofenceActiveNow(geofence: Geofence): boolean {
    if (!geofence.active) return false;
    if (!geofence.schedule) return true;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check day of week
    if (geofence.schedule.daysOfWeek && !geofence.schedule.daysOfWeek.includes(currentDay)) {
      return false;
    }

    // Check time range
    if (geofence.schedule.startTime && geofence.schedule.endTime) {
      const [startHour, startMin] = geofence.schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = geofence.schedule.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes < startMinutes) {
        // Crosses midnight
        return currentTime >= startMinutes || currentTime <= endMinutes;
      } else {
        return currentTime >= startMinutes && currentTime <= endMinutes;
      }
    }

    return true;
  }

  /**
   * Check if in cooldown period for a geofence
   */
  private isInCooldown(geofenceId: string, userId: string): boolean {
    const key = `${userId}-${geofenceId}`;
    const lastTrigger = this.cooldowns.get(key);
    if (!lastTrigger) return false;

    const geofence = this.geofences.get(geofenceId);
    if (!geofence) return false;

    const cooldownMs = (geofence.alerts?.cooldown || 300) * 1000;
    return Date.now() - lastTrigger < cooldownMs;
  }

  /**
   * Set cooldown for a geofence
   */
  private setCooldown(geofenceId: string, userId: string): void {
    const key = `${userId}-${geofenceId}`;
    this.cooldowns.set(key, Date.now());
  }

  /**
   * Check directional constraint
   */
  private checkDirectionalConstraint(
    geofence: Geofence,
    previousLocation: LocationData | undefined,
    currentLocation: LocationData
  ): boolean {
    if (!geofence.direction || geofence.direction === 'any') return true;
    if (!previousLocation) return true;

    const bearing = DistanceCalculator.bearing(previousLocation, currentLocation);
    const targetAngle = geofence.directionAngle || this.getAngleForDirection(geofence.direction);
    const tolerance = 45; // degrees

    const diff = Math.abs(bearing - targetAngle);
    return diff <= tolerance || diff >= (360 - tolerance);
  }

  private getAngleForDirection(direction: string): number {
    switch (direction) {
      case 'north': return 0;
      case 'east': return 90;
      case 'south': return 180;
      case 'west': return 270;
      default: return 0;
    }
  }

  /**
   * Check altitude constraint
   */
  private checkAltitudeConstraint(geofence: Geofence, location: LocationData): boolean {
    if (!geofence.altitude || !geofence.altitudeRadius) return true;
    if (location.altitude === undefined) return true;

    const altitudeDiff = Math.abs(location.altitude - geofence.altitude);
    return altitudeDiff <= geofence.altitudeRadius;
  }

  /**
   * Process location update for a user
   */
  processLocationUpdate(userId: string, location: LocationData): GeofenceEvent[] {
    const validated = LocationDataSchema.parse(location);
    const previousLocation = this.lastLocationsByUser.get(userId);
    this.lastLocationsByUser.set(userId, validated);

    const events: GeofenceEvent[] = [];

    for (const geofence of this.getActiveGeofences()) {
      if (!this.isGeofenceActiveNow(geofence)) continue;

      const distance = DistanceCalculator.distance3D(validated, geofence);
      const isInside = distance <= geofence.radius;
      const wasInside = previousLocation 
        ? DistanceCalculator.distance3D(previousLocation, geofence) <= geofence.radius
        : false;

      // Check constraints
      if (!this.checkAltitudeConstraint(geofence, validated)) continue;
      if (!this.checkDirectionalConstraint(geofence, previousLocation, validated)) continue;

      // Handle enter event
      if (isInside && !wasInside && geofence.alerts?.onEnter) {
        if (!this.isInCooldown(geofence.id, userId)) {
          const event: GeofenceEvent = {
            type: 'enter',
            geofence,
            location: validated,
            distance,
            timestamp: new Date(),
          };
          events.push(event);
          this.emitEvent(event);
          this.setCooldown(geofence.id, userId);

          // Start dwell timer if enabled
          if (geofence.alerts.onDwell && geofence.alerts.dwellTime) {
            this.startDwellTimer(userId, geofence, validated, distance);
          }
        }
      }

      // Handle exit event
      if (!isInside && wasInside && geofence.alerts?.onExit) {
        if (!this.isInCooldown(geofence.id, userId)) {
          const event: GeofenceEvent = {
            type: 'exit',
            geofence,
            location: validated,
            distance,
            timestamp: new Date(),
          };
          events.push(event);
          this.emitEvent(event);
          this.setCooldown(geofence.id, userId);

          // Clear dwell timer
          this.clearDwellTimer(userId, geofence.id);
        }
      }
    }

    return events;
  }

  /**
   * Start dwell timer for a geofence
   */
  private startDwellTimer(
    userId: string,
    geofence: Geofence,
    location: LocationData,
    distance: number
  ): void {
    const timerId = `dwell-${userId}-${geofence.id}`;
    
    // Clear existing timer
    if (this.dwellTimers.has(timerId)) {
      clearTimeout(this.dwellTimers.get(timerId)!);
    }

    const dwellTime = (geofence.alerts?.dwellTime || 60) * 1000;
    
    const timer = setTimeout(() => {
      if (!this.isInCooldown(geofence.id, userId)) {
        const event: GeofenceEvent = {
          type: 'dwell',
          geofence,
          location,
          distance,
          timestamp: new Date(),
        };
        this.emitEvent(event);
        this.setCooldown(geofence.id, userId);
      }
      this.dwellTimers.delete(timerId);
    }, dwellTime);

    this.dwellTimers.set(timerId, timer);
  }

  /**
   * Clear dwell timer
   */
  private clearDwellTimer(userId: string, geofenceId: string): void {
    const timerId = `dwell-${userId}-${geofenceId}`;
    if (this.dwellTimers.has(timerId)) {
      clearTimeout(this.dwellTimers.get(timerId)!);
      this.dwellTimers.delete(timerId);
    }
  }

  /**
   * Register event handler
   */
  onEvent(handler: (event: GeofenceEvent) => void): () => void {
    this.eventHandlers.push(handler);
    // Return unsubscribe function
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Emit event to all handlers
   */
  private emitEvent(event: GeofenceEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in geofence event handler:', error);
      }
    });
  }

  /**
   * Get nearby geofences sorted by distance
   */
  getNearbyGeofences(location: LocationData, maxDistance?: number): Array<Geofence & { distance: number }> {
    const validated = LocationDataSchema.parse(location);
    const nearby: Array<Geofence & { distance: number }> = [];

    for (const geofence of this.getActiveGeofences()) {
      const distance = DistanceCalculator.distance3D(validated, geofence);
      if (!maxDistance || distance <= maxDistance) {
        nearby.push({ ...geofence, distance });
      }
    }

    return nearby.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.geofences.clear();
    this.lastLocationsByUser.clear();
    this.cooldowns.clear();
    this.dwellTimers.forEach(timer => clearTimeout(timer));
    this.dwellTimers.clear();
    this.eventHandlers = [];
  }
}

// Export singleton instance
export const geofencingService = ConsolidatedGeofencingService.getInstance();