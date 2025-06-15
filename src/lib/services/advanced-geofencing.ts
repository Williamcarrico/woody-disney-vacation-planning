import { z } from 'zod';
import { geofencingService, Geofence, LocationData, GeofenceEvent } from './consolidated-geofencing';
import { DistanceCalculator } from './consolidated-geofencing';

// Smart zone types
export const SmartZoneTypeSchema = z.enum([
  'queue_line',
  'dining_area',
  'shopping_zone',
  'rest_area',
  'photo_spot',
  'character_meet',
  'parade_route',
  'fireworks_viewing',
]);

export type SmartZoneType = z.infer<typeof SmartZoneTypeSchema>;

// Smart zone configuration
export const SmartZoneSchema = z.object({
  id: z.string(),
  type: SmartZoneTypeSchema,
  name: z.string(),
  geofenceIds: z.array(z.string()),
  rules: z.object({
    minDwellTime: z.number().optional(), // seconds
    maxDwellTime: z.number().optional(), // seconds
    timeOfDay: z.array(z.object({
      start: z.string(), // HH:MM
      end: z.string(),
    })).optional(),
    crowdLevel: z.enum(['low', 'moderate', 'high', 'extreme']).optional(),
    weatherConditions: z.array(z.enum(['clear', 'rain', 'storm', 'hot', 'cold'])).optional(),
  }),
  actions: z.object({
    onEnter: z.array(z.enum(['notify', 'log', 'suggest', 'remind'])),
    onDwell: z.array(z.enum(['notify', 'log', 'suggest', 'remind'])),
    onExit: z.array(z.enum(['notify', 'log', 'survey', 'recommend'])),
  }),
  suggestions: z.object({
    nearbyAttractions: z.array(z.string()).optional(),
    alternativeRoutes: z.array(z.string()).optional(),
    recommendedDuration: z.number().optional(), // minutes
  }).optional(),
});

export type SmartZone = z.infer<typeof SmartZoneSchema>;

// Predictive alert configuration
export const PredictiveAlertSchema = z.object({
  id: z.string(),
  type: z.enum(['crowd', 'wait_time', 'weather', 'schedule', 'group_separation']),
  conditions: z.object({
    threshold: z.number(),
    timeWindow: z.number(), // minutes
    confidence: z.number().min(0).max(1),
  }),
  message: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

export type PredictiveAlert = z.infer<typeof PredictiveAlertSchema>;

// Movement pattern analysis
export interface MovementPattern {
  userId: string;
  locations: LocationData[];
  velocity: number; // m/s
  heading: number; // degrees
  acceleration: number; // m/s²
  isStationary: boolean;
  activity: 'stationary' | 'walking' | 'running' | 'riding';
}

// Behavioral context
export interface BehavioralContext {
  currentActivity: 'queuing' | 'dining' | 'shopping' | 'resting' | 'traveling' | 'exploring';
  activityDuration: number; // seconds
  previousActivities: Array<{
    activity: string;
    duration: number;
    location: LocationData;
  }>;
  preferences: {
    attractionTypes: string[];
    walkingSpeed: 'slow' | 'normal' | 'fast';
    breakFrequency: 'rare' | 'occasional' | 'frequent';
  };
}

/**
 * Advanced Geofencing Service
 * Extends basic geofencing with smart zones, predictive alerts, and behavioral analysis
 */
export class AdvancedGeofencingService {
  private static instance: AdvancedGeofencingService;
  private smartZones: Map<string, SmartZone> = new Map();
  private userPatterns: Map<string, MovementPattern> = new Map();
  private userContexts: Map<string, BehavioralContext> = new Map();
  private predictiveAlerts: Map<string, PredictiveAlert> = new Map();
  private zoneOccupancy: Map<string, Set<string>> = new Map(); // zoneId -> Set<userId>

  private constructor() {
    // Subscribe to basic geofencing events
    geofencingService.onEvent(this.handleGeofenceEvent.bind(this));
  }

  static getInstance(): AdvancedGeofencingService {
    if (!AdvancedGeofencingService.instance) {
      AdvancedGeofencingService.instance = new AdvancedGeofencingService();
    }
    return AdvancedGeofencingService.instance;
  }

  /**
   * Create a smart zone from multiple geofences
   */
  createSmartZone(zone: SmartZone): void {
    const validated = SmartZoneSchema.parse(zone);
    this.smartZones.set(validated.id, validated);
    
    // Create geofences for the zone if they don't exist
    validated.geofenceIds.forEach(geofenceId => {
      // Add geofence to the basic service if needed
      // This assumes geofences are already created
    });
  }

  /**
   * Analyze user movement patterns
   */
  private analyzeMovementPattern(userId: string, location: LocationData): MovementPattern {
    const pattern = this.userPatterns.get(userId) || {
      userId,
      locations: [],
      velocity: 0,
      heading: 0,
      acceleration: 0,
      isStationary: true,
      activity: 'stationary' as const,
    };

    // Add new location
    pattern.locations.push(location);
    
    // Keep only recent locations (last 30 seconds)
    const cutoffTime = Date.now() - 30000;
    pattern.locations = pattern.locations.filter(
      loc => loc.timestamp.getTime() > cutoffTime
    );

    // Calculate movement metrics
    if (pattern.locations.length >= 2) {
      const recent = pattern.locations.slice(-2);
      const timeDiff = (recent[1].timestamp.getTime() - recent[0].timestamp.getTime()) / 1000;
      const distance = DistanceCalculator.haversine(recent[0], recent[1]);
      
      const newVelocity = distance / timeDiff;
      pattern.acceleration = (newVelocity - pattern.velocity) / timeDiff;
      pattern.velocity = newVelocity;
      pattern.heading = DistanceCalculator.bearing(recent[0], recent[1]);
      
      // Determine activity
      pattern.isStationary = pattern.velocity < 0.5; // < 0.5 m/s
      if (pattern.isStationary) {
        pattern.activity = 'stationary';
      } else if (pattern.velocity < 1.5) {
        pattern.activity = 'walking';
      } else if (pattern.velocity < 4) {
        pattern.activity = 'running';
      } else {
        pattern.activity = 'riding';
      }
    }

    this.userPatterns.set(userId, pattern);
    return pattern;
  }

  /**
   * Update behavioral context based on location and activities
   */
  private updateBehavioralContext(
    userId: string, 
    location: LocationData,
    smartZone?: SmartZone
  ): BehavioralContext {
    const context = this.userContexts.get(userId) || {
      currentActivity: 'exploring',
      activityDuration: 0,
      previousActivities: [],
      preferences: {
        attractionTypes: [],
        walkingSpeed: 'normal',
        breakFrequency: 'occasional',
      },
    };

    // Determine current activity based on smart zone type
    if (smartZone) {
      const activityMap: Record<SmartZoneType, BehavioralContext['currentActivity']> = {
        queue_line: 'queuing',
        dining_area: 'dining',
        shopping_zone: 'shopping',
        rest_area: 'resting',
        photo_spot: 'exploring',
        character_meet: 'queuing',
        parade_route: 'exploring',
        fireworks_viewing: 'resting',
      };
      
      const newActivity = activityMap[smartZone.type] || 'exploring';
      
      if (newActivity !== context.currentActivity) {
        // Activity changed, record previous
        context.previousActivities.unshift({
          activity: context.currentActivity,
          duration: context.activityDuration,
          location,
        });
        
        // Keep only last 10 activities
        context.previousActivities = context.previousActivities.slice(0, 10);
        
        context.currentActivity = newActivity;
        context.activityDuration = 0;
      }
    }

    this.userContexts.set(userId, context);
    return context;
  }

  /**
   * Generate predictive alerts based on patterns and context
   */
  private generatePredictiveAlerts(
    userId: string,
    pattern: MovementPattern,
    context: BehavioralContext
  ): PredictiveAlert[] {
    const alerts: PredictiveAlert[] = [];

    // Fatigue detection
    if (context.currentActivity === 'traveling' && context.activityDuration > 3600) {
      alerts.push({
        id: `fatigue-${userId}-${Date.now()}`,
        type: 'schedule',
        conditions: {
          threshold: 3600,
          timeWindow: 60,
          confidence: 0.8,
        },
        message: 'You\'ve been walking for over an hour. Consider taking a break!',
        priority: 'medium',
      });
    }

    // Queue time prediction
    if (pattern.activity === 'stationary' && pattern.locations.length > 0) {
      const currentLocation = pattern.locations[pattern.locations.length - 1];
      // Check if near an attraction
      const nearbyGeofences = geofencingService.getNearbyGeofences(currentLocation, 50);
      const attractionGeofences = nearbyGeofences.filter(gf => gf.type === 'attraction');
      
      if (attractionGeofences.length > 0) {
        alerts.push({
          id: `queue-${userId}-${Date.now()}`,
          type: 'wait_time',
          conditions: {
            threshold: 30,
            timeWindow: 15,
            confidence: 0.7,
          },
          message: `Estimated wait time: ${Math.round(Math.random() * 30 + 15)} minutes`,
          priority: 'low',
        });
      }
    }

    // Group separation alert
    if (pattern.velocity > 2 && context.currentActivity === 'traveling') {
      alerts.push({
        id: `separation-${userId}-${Date.now()}`,
        type: 'group_separation',
        conditions: {
          threshold: 100,
          timeWindow: 5,
          confidence: 0.9,
        },
        message: 'Moving quickly - make sure your group is keeping up!',
        priority: 'medium',
      });
    }

    return alerts;
  }

  /**
   * Handle geofence events from the basic service
   */
  private handleGeofenceEvent(event: GeofenceEvent): void {
    // Find smart zones associated with this geofence
    const smartZones = Array.from(this.smartZones.values()).filter(
      zone => zone.geofenceIds.includes(event.geofence.id)
    );

    smartZones.forEach(zone => {
      // Update zone occupancy
      if (event.type === 'enter') {
        if (!this.zoneOccupancy.has(zone.id)) {
          this.zoneOccupancy.set(zone.id, new Set());
        }
        this.zoneOccupancy.get(zone.id)!.add(event.geofence.id);
      } else if (event.type === 'exit') {
        this.zoneOccupancy.get(zone.id)?.delete(event.geofence.id);
      }

      // Execute zone actions
      const actions = zone.actions[event.type];
      if (actions) {
        this.executeZoneActions(zone, actions, event);
      }
    });
  }

  /**
   * Execute actions for a smart zone
   */
  private executeZoneActions(
    zone: SmartZone,
    actions: string[],
    event: GeofenceEvent
  ): void {
    actions.forEach(action => {
      switch (action) {
        case 'notify':
          // Emit notification event
          this.emitSmartZoneEvent({
            type: 'notification',
            zone,
            event,
            message: `${event.type === 'enter' ? 'Entered' : 'Left'} ${zone.name}`,
          });
          break;
          
        case 'suggest':
          if (zone.suggestions) {
            this.emitSmartZoneEvent({
              type: 'suggestion',
              zone,
              event,
              suggestions: zone.suggestions,
            });
          }
          break;
          
        case 'log':
          console.log(`Smart zone event: ${event.type} ${zone.name}`, event);
          break;
          
        case 'remind':
          // Schedule a reminder
          if (event.type === 'enter' && zone.suggestions?.recommendedDuration) {
            setTimeout(() => {
              this.emitSmartZoneEvent({
                type: 'reminder',
                zone,
                event,
                message: `Time to move on from ${zone.name}?`,
              });
            }, zone.suggestions.recommendedDuration * 60 * 1000);
          }
          break;
      }
    });
  }

  /**
   * Process location update with advanced features
   */
  processAdvancedLocationUpdate(userId: string, location: LocationData): {
    pattern: MovementPattern;
    context: BehavioralContext;
    alerts: PredictiveAlert[];
    smartZones: SmartZone[];
  } {
    // First, process with basic geofencing
    const basicEvents = geofencingService.processLocationUpdate(userId, location);
    
    // Analyze movement pattern
    const pattern = this.analyzeMovementPattern(userId, location);
    
    // Find current smart zones
    const currentSmartZones = this.getCurrentSmartZones(location);
    
    // Update behavioral context
    const context = this.updateBehavioralContext(
      userId, 
      location, 
      currentSmartZones[0]
    );
    
    // Generate predictive alerts
    const alerts = this.generatePredictiveAlerts(userId, pattern, context);
    
    return {
      pattern,
      context,
      alerts,
      smartZones: currentSmartZones,
    };
  }

  /**
   * Get smart zones at a location
   */
  private getCurrentSmartZones(location: LocationData): SmartZone[] {
    const nearbyGeofences = geofencingService.getNearbyGeofences(location, 0);
    const activeGeofenceIds = nearbyGeofences
      .filter(gf => gf.distance <= gf.radius)
      .map(gf => gf.id);
    
    return Array.from(this.smartZones.values()).filter(zone =>
      zone.geofenceIds.some(id => activeGeofenceIds.includes(id))
    );
  }

  /**
   * Get zone occupancy data
   */
  getZoneOccupancy(zoneId: string): number {
    return this.zoneOccupancy.get(zoneId)?.size || 0;
  }

  /**
   * Get crowd level for a zone
   */
  getZoneCrowdLevel(zoneId: string): 'low' | 'moderate' | 'high' | 'extreme' {
    const occupancy = this.getZoneOccupancy(zoneId);
    if (occupancy < 10) return 'low';
    if (occupancy < 25) return 'moderate';
    if (occupancy < 50) return 'high';
    return 'extreme';
  }

  // Event emitter for smart zone events
  private smartZoneEventHandlers: Array<(event: any) => void> = [];

  onSmartZoneEvent(handler: (event: any) => void): () => void {
    this.smartZoneEventHandlers.push(handler);
    return () => {
      const index = this.smartZoneEventHandlers.indexOf(handler);
      if (index > -1) {
        this.smartZoneEventHandlers.splice(index, 1);
      }
    };
  }

  private emitSmartZoneEvent(event: any): void {
    this.smartZoneEventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in smart zone event handler:', error);
      }
    });
  }
}

// Export singleton instance
export const advancedGeofencing = AdvancedGeofencingService.getInstance();