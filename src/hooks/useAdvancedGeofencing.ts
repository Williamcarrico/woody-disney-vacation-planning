import { useState, useEffect, useCallback } from 'react';
import { useGeofencingWithLocation } from './useGeofencing';
import { 
  advancedGeofencing, 
  SmartZone, 
  PredictiveAlert,
  MovementPattern,
  BehavioralContext 
} from '@/lib/services/advanced-geofencing';
import { LocationData } from '@/lib/services/consolidated-geofencing';
import { toast } from '@/components/ui/use-toast';

interface UseAdvancedGeofencingOptions {
  userId: string;
  enablePredictiveAlerts?: boolean;
  enableSmartZones?: boolean;
  enablePatternAnalysis?: boolean;
  onSmartZoneEnter?: (zone: SmartZone) => void;
  onSmartZoneExit?: (zone: SmartZone) => void;
  onPredictiveAlert?: (alert: PredictiveAlert) => void;
  onPatternChange?: (pattern: MovementPattern) => void;
  onContextChange?: (context: BehavioralContext) => void;
}

interface UseAdvancedGeofencingReturn {
  // Basic geofencing features
  startWatching: () => void;
  stopWatching: () => void;
  isWatching: boolean;
  lastLocation: LocationData | null;
  locationError: string | null;
  
  // Advanced features
  currentPattern: MovementPattern | null;
  currentContext: BehavioralContext | null;
  activeSmartZones: SmartZone[];
  recentAlerts: PredictiveAlert[];
  
  // Zone management
  createSmartZone: (zone: SmartZone) => void;
  getZoneOccupancy: (zoneId: string) => number;
  getZoneCrowdLevel: (zoneId: string) => 'low' | 'moderate' | 'high' | 'extreme';
}

export function useAdvancedGeofencing(
  options: UseAdvancedGeofencingOptions
): UseAdvancedGeofencingReturn {
  const {
    userId,
    enablePredictiveAlerts = true,
    enableSmartZones = true,
    enablePatternAnalysis = true,
    onSmartZoneEnter,
    onSmartZoneExit,
    onPredictiveAlert,
    onPatternChange,
    onContextChange,
  } = options;

  // State
  const [currentPattern, setCurrentPattern] = useState<MovementPattern | null>(null);
  const [currentContext, setCurrentContext] = useState<BehavioralContext | null>(null);
  const [activeSmartZones, setActiveSmartZones] = useState<SmartZone[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<PredictiveAlert[]>([]);
  const [previousZones, setPreviousZones] = useState<Set<string>>(new Set());

  // Use basic geofencing with location tracking
  const basicGeofencing = useGeofencingWithLocation({
    userId,
    enableToasts: false, // We'll handle our own notifications
  });

  // Process advanced features when location updates
  useEffect(() => {
    if (!basicGeofencing.lastLocation) return;

    const result = advancedGeofencing.processAdvancedLocationUpdate(
      userId,
      basicGeofencing.lastLocation
    );

    // Update pattern
    if (enablePatternAnalysis && result.pattern) {
      setCurrentPattern(result.pattern);
      onPatternChange?.(result.pattern);
    }

    // Update context
    if (result.context) {
      setCurrentContext(result.context);
      onContextChange?.(result.context);
    }

    // Handle smart zones
    if (enableSmartZones) {
      const currentZoneIds = new Set(result.smartZones.map(z => z.id));
      
      // Check for zone enters
      result.smartZones.forEach(zone => {
        if (!previousZones.has(zone.id)) {
          onSmartZoneEnter?.(zone);
          toast({
            title: `Entered ${zone.name}`,
            description: getZoneDescription(zone),
          });
        }
      });

      // Check for zone exits
      previousZones.forEach(zoneId => {
        if (!currentZoneIds.has(zoneId)) {
          const zone = result.smartZones.find(z => z.id === zoneId);
          if (zone) {
            onSmartZoneExit?.(zone);
          }
        }
      });

      setPreviousZones(currentZoneIds);
      setActiveSmartZones(result.smartZones);
    }

    // Handle predictive alerts
    if (enablePredictiveAlerts && result.alerts.length > 0) {
      result.alerts.forEach(alert => {
        onPredictiveAlert?.(alert);
        
        // Show toast for high priority alerts
        if (alert.priority === 'high' || alert.priority === 'urgent') {
          toast({
            title: 'Smart Alert',
            description: alert.message,
            variant: alert.priority === 'urgent' ? 'destructive' : 'default',
          });
        }
      });

      // Keep last 10 alerts
      setRecentAlerts(prev => [...result.alerts, ...prev].slice(0, 10));
    }
  }, [
    basicGeofencing.lastLocation,
    userId,
    enablePatternAnalysis,
    enableSmartZones,
    enablePredictiveAlerts,
    onSmartZoneEnter,
    onSmartZoneExit,
    onPredictiveAlert,
    onPatternChange,
    onContextChange,
  ]);

  // Subscribe to smart zone events
  useEffect(() => {
    const unsubscribe = advancedGeofencing.onSmartZoneEvent((event) => {
      console.log('Smart zone event:', event);
      
      // Handle different event types
      switch (event.type) {
        case 'suggestion':
          if (event.suggestions?.nearbyAttractions?.length > 0) {
            toast({
              title: 'Nearby Attractions',
              description: `Check out: ${event.suggestions.nearbyAttractions.join(', ')}`,
            });
          }
          break;
          
        case 'reminder':
          toast({
            title: 'Time Check',
            description: event.message,
          });
          break;
      }
    });

    return unsubscribe;
  }, []);

  // Helper functions
  const createSmartZone = useCallback((zone: SmartZone) => {
    advancedGeofencing.createSmartZone(zone);
  }, []);

  const getZoneOccupancy = useCallback((zoneId: string) => {
    return advancedGeofencing.getZoneOccupancy(zoneId);
  }, []);

  const getZoneCrowdLevel = useCallback((zoneId: string) => {
    return advancedGeofencing.getZoneCrowdLevel(zoneId);
  }, []);

  return {
    // Basic features
    startWatching: basicGeofencing.startWatching,
    stopWatching: basicGeofencing.stopWatching,
    isWatching: basicGeofencing.isWatching,
    lastLocation: basicGeofencing.lastLocation,
    locationError: basicGeofencing.locationError,
    
    // Advanced features
    currentPattern,
    currentContext,
    activeSmartZones,
    recentAlerts,
    
    // Zone management
    createSmartZone,
    getZoneOccupancy,
    getZoneCrowdLevel,
  };
}

// Helper function to get zone description
function getZoneDescription(zone: SmartZone): string {
  const descriptions: Record<string, string> = {
    queue_line: 'You\'re in a queue area',
    dining_area: 'Enjoy your meal!',
    shopping_zone: 'Happy shopping!',
    rest_area: 'Take a break and relax',
    photo_spot: 'Perfect spot for photos!',
    character_meet: 'Character meet & greet area',
    parade_route: 'Parade viewing area',
    fireworks_viewing: 'Great spot for fireworks',
  };
  
  return descriptions[zone.type] || zone.name;
}