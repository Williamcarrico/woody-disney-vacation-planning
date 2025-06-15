'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useMapStore, mapSelectors } from '@/store/slices/mapStore';
import { useGeofencingStore } from '@/store/slices/geofencingStore';
import { useDebounce, useThrottle } from '@/hooks/common';
import { cn } from '@/lib/utils';
import { PerformanceMonitor, withPerformanceMonitoring, measureOperation } from '@/lib/performance/performance-monitor';
import { measurePerformance } from '@/lib/performance/optimization-utils';
import type { Marker, Coordinate } from '@/types/maps';

interface OptimizedInteractiveMapProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  showSearch?: boolean;
  showUserLocation?: boolean;
  onMarkerClick?: (marker: Marker) => void;
}

// Performance-monitored search component
const SearchBox = withPerformanceMonitoring(
  memo(function SearchBox() {
    const [query, setQuery] = React.useState('');
    const debouncedQuery = useDebounce(query, 500);
    const { setCenter, setZoom } = useMapStore();

    const handleSearch = useCallback(async () => {
      if (!debouncedQuery.trim()) return;

      // Measure the search operation
      return measureOperation('map-search', async () => {
        const response = await fetch('/api/maps/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'geocode',
            address: debouncedQuery,
          }),
        });

        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
          const location = data.results[0].geometry.location;
          setCenter({ lat: location.lat, lng: location.lng });
          setZoom(15);
        }
      });
    }, [debouncedQuery, setCenter, setZoom]);

    React.useEffect(() => {
      if (debouncedQuery) {
        handleSearch();
      }
    }, [debouncedQuery, handleSearch]);

    return (
      <div className="absolute top-2 left-2 right-2 flex gap-2 max-w-96 z-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="flex-1 px-3 py-2 rounded-md border bg-white/90"
        />
      </div>
    );
  }),
  'MapSearchBox'
);

// Performance-monitored marker component
const OptimizedMarker = withPerformanceMonitoring(
  memo<{
    marker: Marker;
    isSelected: boolean;
    onClick: (marker: Marker) => void;
  }>(
    function OptimizedMarker({ marker, isSelected, onClick }) {
      const handleClick = useCallback(() => {
        // Measure marker click handling
        measureOperation('marker-click', () => {
          onClick(marker);
        });
      }, [marker, onClick]);

      return (
        <AdvancedMarker
          position={marker.position}
          onClick={handleClick}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-transform',
              isSelected && 'scale-125',
              marker.type === 'attraction' && 'bg-blue-500',
              marker.type === 'restaurant' && 'bg-orange-500',
              marker.type === 'custom' && 'bg-purple-500'
            )}
          >
            <span className="text-white text-xs font-bold">
              {marker.title.charAt(0)}
            </span>
          </div>
        </AdvancedMarker>
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.marker.id === nextProps.marker.id &&
        prevProps.marker.position.lat === nextProps.marker.position.lat &&
        prevProps.marker.position.lng === nextProps.marker.position.lng &&
        prevProps.isSelected === nextProps.isSelected
      );
    }
  ),
  'MapMarker'
);

// Performance-monitored user location button
const UserLocationButton = withPerformanceMonitoring(
  memo(function UserLocationButton() {
    const { setCenter, startLocationTracking, stopLocationTracking, isTrackingLocation } = useMapStore();

    const handleClick = useCallback(() => {
      measureOperation('user-location-toggle', async () => {
        if (isTrackingLocation) {
          stopLocationTracking();
        } else {
          startLocationTracking();
          
          if ('geolocation' in navigator) {
            return new Promise<void>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  });
                  resolve();
                },
                (error) => {
                  console.error('Location error:', error);
                  reject(error);
                }
              );
            });
          }
        }
      });
    }, [isTrackingLocation, setCenter, startLocationTracking, stopLocationTracking]);

    return (
      <button
        onClick={handleClick}
        className={cn(
          'absolute right-2 bottom-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-colors',
          isTrackingLocation && 'bg-blue-500 text-white'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4" y1="12" x2="2" y2="12" />
          <line x1="22" y1="12" x2="20" y2="12" />
        </svg>
      </button>
    );
  }),
  'UserLocationButton'
);

// Main component with comprehensive performance monitoring
export const MonitoredOptimizedInteractiveMap = measurePerformance('InteractiveMap')(
  memo<OptimizedInteractiveMapProps>(
    function MonitoredOptimizedInteractiveMap({
      className,
      height = 500,
      width = '100%',
      showSearch = true,
      showUserLocation = true,
      onMarkerClick,
    }) {
      const {
        center,
        zoom,
        mapType,
        selectedMarkerId,
        setCenter,
        setZoom,
        selectMarker,
      } = useMapStore();

      // Use selector for visible markers
      const visibleMarkers = useMapStore(mapSelectors.visibleMarkers);
      const selectedMarker = useMapStore(mapSelectors.selectedMarker);

      // Throttle map movement events with performance monitoring
      const handleCenterChanged = useThrottle((newCenter: Coordinate) => {
        measureOperation('map-center-change', () => {
          setCenter(newCenter);
        });
      }, 100);

      const handleZoomChanged = useThrottle((newZoom: number) => {
        measureOperation('map-zoom-change', () => {
          setZoom(newZoom);
        });
      }, 100);

      // Memoize map options
      const mapOptions = useMemo(
        () => ({
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          mapTypeId: mapType,
        }),
        [mapType]
      );

      // Handle marker click with performance monitoring
      const handleMarkerClick = useCallback(
        (marker: Marker) => {
          measureOperation('marker-selection', () => {
            selectMarker(marker.id);
            onMarkerClick?.(marker);
          });
        },
        [selectMarker, onMarkerClick]
      );

      // Memoize style object
      const containerStyle = useMemo(
        () => ({
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
        }),
        [height, width]
      );

      return (
        <PerformanceMonitor id="InteractiveMapContainer">
          <div className={cn('relative', className)} style={containerStyle}>
            <PerformanceMonitor id="GoogleMap">
              <Map
                center={center}
                zoom={zoom}
                options={mapOptions}
                onCenterChanged={handleCenterChanged}
                onZoomChanged={handleZoomChanged}
              >
                {/* Render markers with individual monitoring */}
                <PerformanceMonitor id="MapMarkers">
                  {visibleMarkers.map((marker) => (
                    <OptimizedMarker
                      key={marker.id}
                      marker={marker}
                      isSelected={marker.id === selectedMarkerId}
                      onClick={handleMarkerClick}
                    />
                  ))}
                </PerformanceMonitor>

                {/* Info window for selected marker */}
                {selectedMarker && (
                  <PerformanceMonitor id="InfoWindow">
                    <InfoWindow
                      position={selectedMarker.position}
                      onCloseClick={() => selectMarker(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-semibold">{selectedMarker.title}</h3>
                        {selectedMarker.type === 'attraction' && 'waitTime' in selectedMarker && (
                          <p className="text-sm text-gray-600">
                            Wait time: {selectedMarker.waitTime} min
                          </p>
                        )}
                      </div>
                    </InfoWindow>
                  </PerformanceMonitor>
                )}
              </Map>
            </PerformanceMonitor>

            {/* Search box */}
            {showSearch && <SearchBox />}

            {/* User location button */}
            {showUserLocation && <UserLocationButton />}
          </div>
        </PerformanceMonitor>
      );
    }
  )
);

export default MonitoredOptimizedInteractiveMap;