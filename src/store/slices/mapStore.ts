import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Coordinate, Bounds, Marker } from '@/types/maps';

export interface MapState {
  // Map configuration
  center: Coordinate;
  zoom: number;
  bounds: Bounds | null;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  
  // Markers and overlays
  markers: Map<string, Marker>;
  selectedMarkerId: string | null;
  visibleMarkerTypes: Set<string>;
  
  // User location
  userLocation: Coordinate | null;
  isTrackingLocation: boolean;
  locationAccuracy: number | null;
  
  // Group members
  groupMemberLocations: Map<string, {
    userId: string;
    location: Coordinate;
    lastUpdated: Date;
    activity?: string;
  }>;
  
  // UI state
  isMapReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MapActions {
  // Map controls
  setCenter: (center: Coordinate) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: Bounds) => void;
  setMapType: (type: MapState['mapType']) => void;
  fitBounds: (bounds: Bounds, padding?: number) => void;
  
  // Marker management
  addMarker: (marker: Marker) => void;
  updateMarker: (id: string, updates: Partial<Marker>) => void;
  removeMarker: (id: string) => void;
  clearMarkers: () => void;
  selectMarker: (id: string | null) => void;
  toggleMarkerType: (type: string) => void;
  
  // Location tracking
  setUserLocation: (location: Coordinate, accuracy?: number) => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  
  // Group member tracking
  updateGroupMemberLocation: (userId: string, location: Coordinate, activity?: string) => void;
  removeGroupMember: (userId: string) => void;
  clearGroupMembers: () => void;
  
  // UI state
  setMapReady: (ready: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility actions
  reset: () => void;
}

const initialState: MapState = {
  center: { lat: 28.3772, lng: -81.5707 }, // Walt Disney World
  zoom: 14,
  bounds: null,
  mapType: 'roadmap',
  markers: new Map(),
  selectedMarkerId: null,
  visibleMarkerTypes: new Set(['attraction', 'restaurant', 'restroom']),
  userLocation: null,
  isTrackingLocation: false,
  locationAccuracy: null,
  groupMemberLocations: new Map(),
  isMapReady: false,
  isLoading: false,
  error: null,
};

export const useMapStore = create<MapState & MapActions>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => ({
        // Initial state
        ...initialState,

        // Map controls
        setCenter: (center) =>
          set((state) => {
            state.center = center;
          }),

        setZoom: (zoom) =>
          set((state) => {
            state.zoom = Math.max(0, Math.min(22, zoom));
          }),

        setBounds: (bounds) =>
          set((state) => {
            state.bounds = bounds;
          }),

        setMapType: (type) =>
          set((state) => {
            state.mapType = type;
          }),

        fitBounds: (bounds, padding = 0.1) =>
          set((state) => {
            state.bounds = bounds;
            // Calculate appropriate zoom level
            const latDiff = bounds.north - bounds.south;
            const lngDiff = bounds.east - bounds.west;
            const maxDiff = Math.max(latDiff, lngDiff);
            
            // Rough calculation for zoom level
            let zoom = 16;
            if (maxDiff > 0.5) zoom = 10;
            else if (maxDiff > 0.2) zoom = 12;
            else if (maxDiff > 0.1) zoom = 14;
            
            state.zoom = zoom;
            state.center = {
              lat: (bounds.north + bounds.south) / 2,
              lng: (bounds.east + bounds.west) / 2,
            };
          }),

        // Marker management
        addMarker: (marker) =>
          set((state) => {
            state.markers.set(marker.id, marker);
          }),

        updateMarker: (id, updates) =>
          set((state) => {
            const marker = state.markers.get(id);
            if (marker) {
              Object.assign(marker, updates);
            }
          }),

        removeMarker: (id) =>
          set((state) => {
            state.markers.delete(id);
            if (state.selectedMarkerId === id) {
              state.selectedMarkerId = null;
            }
          }),

        clearMarkers: () =>
          set((state) => {
            state.markers.clear();
            state.selectedMarkerId = null;
          }),

        selectMarker: (id) =>
          set((state) => {
            state.selectedMarkerId = id;
          }),

        toggleMarkerType: (type) =>
          set((state) => {
            if (state.visibleMarkerTypes.has(type)) {
              state.visibleMarkerTypes.delete(type);
            } else {
              state.visibleMarkerTypes.add(type);
            }
          }),

        // Location tracking
        setUserLocation: (location, accuracy) =>
          set((state) => {
            state.userLocation = location;
            if (accuracy !== undefined) {
              state.locationAccuracy = accuracy;
            }
          }),

        startLocationTracking: () =>
          set((state) => {
            state.isTrackingLocation = true;
          }),

        stopLocationTracking: () =>
          set((state) => {
            state.isTrackingLocation = false;
            state.userLocation = null;
            state.locationAccuracy = null;
          }),

        // Group member tracking
        updateGroupMemberLocation: (userId, location, activity) =>
          set((state) => {
            state.groupMemberLocations.set(userId, {
              userId,
              location,
              lastUpdated: new Date(),
              activity,
            });
          }),

        removeGroupMember: (userId) =>
          set((state) => {
            state.groupMemberLocations.delete(userId);
          }),

        clearGroupMembers: () =>
          set((state) => {
            state.groupMemberLocations.clear();
          }),

        // UI state
        setMapReady: (ready) =>
          set((state) => {
            state.isMapReady = ready;
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
            state.isLoading = false;
          }),

        // Utility actions
        reset: () => set(initialState),
      })),
      {
        name: 'MapStore',
      }
    )
  )
);

// Selectors
export const mapSelectors = {
  visibleMarkers: (state: MapState) => 
    Array.from(state.markers.values()).filter(
      marker => state.visibleMarkerTypes.has(marker.type)
    ),
  
  selectedMarker: (state: MapState) =>
    state.selectedMarkerId ? state.markers.get(state.selectedMarkerId) : null,
  
  groupMemberCount: (state: MapState) =>
    state.groupMemberLocations.size,
  
  isLocationAvailable: (state: MapState) =>
    state.userLocation !== null,
  
  mapBounds: (state: MapState) => {
    if (state.bounds) return state.bounds;
    
    // Calculate bounds from visible markers
    const markers = Array.from(state.markers.values());
    if (markers.length === 0) return null;
    
    let north = -90, south = 90, east = -180, west = 180;
    
    markers.forEach(marker => {
      north = Math.max(north, marker.position.lat);
      south = Math.min(south, marker.position.lat);
      east = Math.max(east, marker.position.lng);
      west = Math.min(west, marker.position.lng);
    });
    
    return { north, south, east, west };
  },
};

// Subscribe to location changes
if (typeof window !== 'undefined') {
  useMapStore.subscribe(
    (state) => state.isTrackingLocation,
    (isTracking) => {
      if (isTracking) {
        // Start watching location
        if ('geolocation' in navigator) {
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              useMapStore.getState().setUserLocation(
                {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                position.coords.accuracy
              );
            },
            (error) => {
              useMapStore.getState().setError(error.message);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 5000,
            }
          );
          
          // Store watchId for cleanup
          (window as any).__mapWatchId = watchId;
        }
      } else {
        // Stop watching location
        const watchId = (window as any).__mapWatchId;
        if (watchId !== undefined) {
          navigator.geolocation.clearWatch(watchId);
          delete (window as any).__mapWatchId;
        }
      }
    }
  );
}