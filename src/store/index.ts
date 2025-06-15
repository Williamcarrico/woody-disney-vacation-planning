/**
 * Centralized State Management with Zustand
 * 
 * This file exports all store slices for the application
 * Each slice is responsible for a specific domain of the app
 */

export { useUserStore } from './slices/userStore';
export { useMapStore } from './slices/mapStore';
export { useGeofencingStore } from './slices/geofencingStore';
export { useCollaborationStore } from './slices/collaborationStore';
export { useTripPlanStore } from './slices/tripPlanStore';
export { useUIStore } from './slices/uiStore';
export { useNotificationStore } from './slices/notificationStore';

// Re-export types
export type { UserState, UserActions } from './slices/userStore';
export type { MapState, MapActions } from './slices/mapStore';
export type { GeofencingState, GeofencingActions } from './slices/geofencingStore';
export type { CollaborationState, CollaborationActions } from './slices/collaborationStore';
export type { TripPlanState, TripPlanActions } from './slices/tripPlanStore';
export type { UIState, UIActions } from './slices/uiStore';
export type { NotificationState, NotificationActions } from './slices/notificationStore';