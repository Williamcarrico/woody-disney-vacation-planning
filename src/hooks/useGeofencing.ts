import { useEffect, useState, useCallback, useRef } from 'react';
import { geofencingService, Geofence, GeofenceEvent, LocationData } from '@/lib/services/consolidated-geofencing';
import { toast } from '@/components/ui/use-toast';

interface UseGeofencingOptions {
  userId: string;
  onEnter?: (event: GeofenceEvent) => void;
  onExit?: (event: GeofenceEvent) => void;
  onDwell?: (event: GeofenceEvent) => void;
  enableToasts?: boolean;
  enableSound?: boolean;
  enableVibration?: boolean;
}

interface UseGeofencingReturn {
  addGeofence: (geofence: Geofence) => void;
  removeGeofence: (id: string) => void;
  updateLocation: (location: LocationData) => void;
  getNearbyGeofences: (maxDistance?: number) => Array<Geofence & { distance: number }>;
  activeGeofences: Geofence[];
  lastLocation: LocationData | null;
  isProcessing: boolean;
}

export function useGeofencing(options: UseGeofencingOptions): UseGeofencingReturn {
  const {
    userId,
    onEnter,
    onExit,
    onDwell,
    enableToasts = true,
    enableSound = false,
    enableVibration = true,
  } = options;

  const [activeGeofences, setActiveGeofences] = useState<Geofence[]>([]);
  const [lastLocation, setLastLocation] = useState<LocationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Handle geofence events
  const handleGeofenceEvent = useCallback((event: GeofenceEvent) => {
    // Call appropriate handler
    switch (event.type) {
      case 'enter':
        onEnter?.(event);
        break;
      case 'exit':
        onExit?.(event);
        break;
      case 'dwell':
        onDwell?.(event);
        break;
    }

    // Show toast notification if enabled
    if (enableToasts) {
      const title = event.type === 'enter' 
        ? `Entered ${event.geofence.name}`
        : event.type === 'exit'
        ? `Left ${event.geofence.name}`
        : `Staying at ${event.geofence.name}`;

      const variant = event.geofence.priority === 'urgent' 
        ? 'destructive' 
        : event.geofence.priority === 'high'
        ? 'default'
        : undefined;

      toast({
        title,
        description: event.geofence.description,
        variant,
      });
    }

    // Play sound if enabled and geofence has sound alert
    if (enableSound && event.geofence.alerts?.sound) {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Failed to play sound:', error);
      }
    }

    // Trigger vibration if enabled and supported
    if (enableVibration && event.geofence.alerts?.vibrate && 'vibrate' in navigator) {
      try {
        navigator.vibrate(200);
      } catch (error) {
        console.error('Failed to vibrate:', error);
      }
    }
  }, [onEnter, onExit, onDwell, enableToasts, enableSound, enableVibration]);

  // Subscribe to geofence events
  useEffect(() => {
    unsubscribeRef.current = geofencingService.onEvent(handleGeofenceEvent);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [handleGeofenceEvent]);

  // Add geofence
  const addGeofence = useCallback((geofence: Geofence) => {
    geofencingService.addGeofence(geofence);
    setActiveGeofences(geofencingService.getActiveGeofences());
  }, []);

  // Remove geofence
  const removeGeofence = useCallback((id: string) => {
    geofencingService.removeGeofence(id);
    setActiveGeofences(geofencingService.getActiveGeofences());
  }, []);

  // Update location
  const updateLocation = useCallback((location: LocationData) => {
    setIsProcessing(true);
    try {
      geofencingService.processLocationUpdate(userId, location);
      setLastLocation(location);
    } finally {
      setIsProcessing(false);
    }
  }, [userId]);

  // Get nearby geofences
  const getNearbyGeofences = useCallback((maxDistance?: number) => {
    if (!lastLocation) return [];
    return geofencingService.getNearbyGeofences(lastLocation, maxDistance);
  }, [lastLocation]);

  // Load active geofences on mount
  useEffect(() => {
    setActiveGeofences(geofencingService.getActiveGeofences());
  }, []);

  return {
    addGeofence,
    removeGeofence,
    updateLocation,
    getNearbyGeofences,
    activeGeofences,
    lastLocation,
    isProcessing,
  };
}

// Hook for watching user's location with geofencing
export function useGeofencingWithLocation(options: UseGeofencingOptions & {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
}) {
  const {
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 10000,
    ...geofencingOptions
  } = options;

  const geofencing = useGeofencing(geofencingOptions);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  // Start watching location
  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsWatching(true);
    setLocationError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: new Date(position.timestamp),
        };
        geofencing.updateLocation(location);
      },
      (error) => {
        setLocationError(error.message);
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy,
        maximumAge,
        timeout,
      }
    );

    setWatchId(id);
  }, [geofencing, enableHighAccuracy, maximumAge, timeout]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...geofencing,
    startWatching,
    stopWatching,
    isWatching,
    locationError,
  };
}