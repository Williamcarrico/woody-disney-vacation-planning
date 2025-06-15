import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Geofence, LocationData, GeofenceEvent } from '@/lib/services/consolidated-geofencing';
import type { SmartZone, PredictiveAlert, MovementPattern, BehavioralContext } from '@/lib/services/advanced-geofencing';

export interface GeofencingState {
  // Geofences
  geofences: Map<string, Geofence>;
  activeGeofences: Set<string>;
  
  // Smart zones
  smartZones: Map<string, SmartZone>;
  activeSmartZones: Set<string>;
  
  // User patterns and context
  movementPatterns: Map<string, MovementPattern>;
  behavioralContexts: Map<string, BehavioralContext>;
  
  // Alerts and events
  recentEvents: GeofenceEvent[];
  predictiveAlerts: PredictiveAlert[];
  
  // Settings
  isEnabled: boolean;
  cooldownPeriods: Map<string, number>; // geofenceId -> timestamp
  notificationSettings: {
    enter: boolean;
    exit: boolean;
    dwell: boolean;
    predictive: boolean;
    sound: boolean;
    vibration: boolean;
  };
}

export interface GeofencingActions {
  // Geofence management
  addGeofence: (geofence: Geofence) => void;
  updateGeofence: (id: string, updates: Partial<Geofence>) => void;
  removeGeofence: (id: string) => void;
  toggleGeofence: (id: string) => void;
  
  // Smart zone management
  addSmartZone: (zone: SmartZone) => void;
  updateSmartZone: (id: string, updates: Partial<SmartZone>) => void;
  removeSmartZone: (id: string) => void;
  
  // Location processing
  processLocation: (userId: string, location: LocationData) => void;
  
  // Pattern and context updates
  updateMovementPattern: (userId: string, pattern: MovementPattern) => void;
  updateBehavioralContext: (userId: string, context: BehavioralContext) => void;
  
  // Event and alert handling
  addEvent: (event: GeofenceEvent) => void;
  addPredictiveAlert: (alert: PredictiveAlert) => void;
  clearOldEvents: (keepCount?: number) => void;
  
  // Settings
  setEnabled: (enabled: boolean) => void;
  updateNotificationSettings: (settings: Partial<GeofencingState['notificationSettings']>) => void;
  setCooldown: (geofenceId: string, duration: number) => void;
  
  // Utility
  reset: () => void;
}

const initialState: GeofencingState = {
  geofences: new Map(),
  activeGeofences: new Set(),
  smartZones: new Map(),
  activeSmartZones: new Set(),
  movementPatterns: new Map(),
  behavioralContexts: new Map(),
  recentEvents: [],
  predictiveAlerts: [],
  isEnabled: true,
  cooldownPeriods: new Map(),
  notificationSettings: {
    enter: true,
    exit: true,
    dwell: false,
    predictive: true,
    sound: false,
    vibration: true,
  },
};

export const useGeofencingStore = create<GeofencingState & GeofencingActions>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      ...initialState,

      // Geofence management
      addGeofence: (geofence) =>
        set((state) => {
          state.geofences.set(geofence.id, geofence);
          if (geofence.active) {
            state.activeGeofences.add(geofence.id);
          }
        }),

      updateGeofence: (id, updates) =>
        set((state) => {
          const geofence = state.geofences.get(id);
          if (geofence) {
            Object.assign(geofence, updates);
            if (updates.active !== undefined) {
              if (updates.active) {
                state.activeGeofences.add(id);
              } else {
                state.activeGeofences.delete(id);
              }
            }
          }
        }),

      removeGeofence: (id) =>
        set((state) => {
          state.geofences.delete(id);
          state.activeGeofences.delete(id);
          state.cooldownPeriods.delete(id);
        }),

      toggleGeofence: (id) =>
        set((state) => {
          const geofence = state.geofences.get(id);
          if (geofence) {
            geofence.active = !geofence.active;
            if (geofence.active) {
              state.activeGeofences.add(id);
            } else {
              state.activeGeofences.delete(id);
            }
          }
        }),

      // Smart zone management
      addSmartZone: (zone) =>
        set((state) => {
          state.smartZones.set(zone.id, zone);
          state.activeSmartZones.add(zone.id);
        }),

      updateSmartZone: (id, updates) =>
        set((state) => {
          const zone = state.smartZones.get(id);
          if (zone) {
            Object.assign(zone, updates);
          }
        }),

      removeSmartZone: (id) =>
        set((state) => {
          state.smartZones.delete(id);
          state.activeSmartZones.delete(id);
        }),

      // Location processing
      processLocation: (userId, location) =>
        set((state) => {
          // This would integrate with the geofencing service
          // For now, we'll just update the timestamp
          const now = Date.now();
          
          // Check cooldowns
          state.cooldownPeriods.forEach((timestamp, geofenceId) => {
            if (now > timestamp) {
              state.cooldownPeriods.delete(geofenceId);
            }
          });
        }),

      // Pattern and context updates
      updateMovementPattern: (userId, pattern) =>
        set((state) => {
          state.movementPatterns.set(userId, pattern);
        }),

      updateBehavioralContext: (userId, context) =>
        set((state) => {
          state.behavioralContexts.set(userId, context);
        }),

      // Event and alert handling
      addEvent: (event) =>
        set((state) => {
          state.recentEvents.unshift(event);
          // Keep only last 100 events
          if (state.recentEvents.length > 100) {
            state.recentEvents = state.recentEvents.slice(0, 100);
          }
        }),

      addPredictiveAlert: (alert) =>
        set((state) => {
          state.predictiveAlerts.unshift(alert);
          // Keep only last 50 alerts
          if (state.predictiveAlerts.length > 50) {
            state.predictiveAlerts = state.predictiveAlerts.slice(0, 50);
          }
        }),

      clearOldEvents: (keepCount = 20) =>
        set((state) => {
          state.recentEvents = state.recentEvents.slice(0, keepCount);
          state.predictiveAlerts = state.predictiveAlerts.slice(0, keepCount);
        }),

      // Settings
      setEnabled: (enabled) =>
        set((state) => {
          state.isEnabled = enabled;
        }),

      updateNotificationSettings: (settings) =>
        set((state) => {
          Object.assign(state.notificationSettings, settings);
        }),

      setCooldown: (geofenceId, duration) =>
        set((state) => {
          state.cooldownPeriods.set(geofenceId, Date.now() + duration);
        }),

      // Utility
      reset: () => set(initialState),
    })),
    {
      name: 'GeofencingStore',
    }
  )
);

// Selectors
export const geofencingSelectors = {
  activeGeofencesList: (state: GeofencingState) =>
    Array.from(state.activeGeofences)
      .map(id => state.geofences.get(id))
      .filter(Boolean) as Geofence[],
  
  activeSmartZonesList: (state: GeofencingState) =>
    Array.from(state.activeSmartZones)
      .map(id => state.smartZones.get(id))
      .filter(Boolean) as SmartZone[],
  
  recentEnterEvents: (state: GeofencingState) =>
    state.recentEvents.filter(event => event.type === 'enter'),
  
  highPriorityAlerts: (state: GeofencingState) =>
    state.predictiveAlerts.filter(alert => 
      alert.priority === 'high' || alert.priority === 'urgent'
    ),
  
  getUserPattern: (userId: string) => (state: GeofencingState) =>
    state.movementPatterns.get(userId),
  
  getUserContext: (userId: string) => (state: GeofencingState) =>
    state.behavioralContexts.get(userId),
  
  isInCooldown: (geofenceId: string) => (state: GeofencingState) => {
    const cooldownEnd = state.cooldownPeriods.get(geofenceId);
    return cooldownEnd ? Date.now() < cooldownEnd : false;
  },
};