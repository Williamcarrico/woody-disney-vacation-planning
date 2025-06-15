import { z } from 'zod';

// Coordinate types
export const CoordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type Coordinate = z.infer<typeof CoordinateSchema>;

// Extended coordinate with optional altitude
export const ExtendedCoordinateSchema = CoordinateSchema.extend({
  altitude: z.number().optional(),
});

export type ExtendedCoordinate = z.infer<typeof ExtendedCoordinateSchema>;

// Bounds type for map viewport
export const BoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

export type Bounds = z.infer<typeof BoundsSchema>;

// Location with metadata
export const LocationMetadataSchema = z.object({
  accuracy: z.number().optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().optional(),
  timestamp: z.date(),
});

export type LocationMetadata = z.infer<typeof LocationMetadataSchema>;

// Full location data
export const LocationDataSchema = ExtendedCoordinateSchema.merge(LocationMetadataSchema);

export type LocationData = z.infer<typeof LocationDataSchema>;

// Marker types
export const MarkerTypeSchema = z.enum([
  'attraction',
  'restaurant',
  'restroom',
  'shop',
  'hotel',
  'parking',
  'transportation',
  'entertainment',
  'service',
  'custom',
]);

export type MarkerType = z.infer<typeof MarkerTypeSchema>;

// Marker status
export const MarkerStatusSchema = z.enum([
  'OPERATING',
  'DOWN',
  'CLOSED',
  'REFURBISHMENT',
  'WEATHER',
  'CAPACITY',
]);

export type MarkerStatus = z.infer<typeof MarkerStatusSchema>;

// Base marker
export const BaseMarkerSchema = z.object({
  id: z.string(),
  position: CoordinateSchema,
  title: z.string(),
  type: MarkerTypeSchema,
  visible: z.boolean().default(true),
  clickable: z.boolean().default(true),
  draggable: z.boolean().default(false),
  zIndex: z.number().optional(),
});

export type BaseMarker = z.infer<typeof BaseMarkerSchema>;

// Disney attraction marker
export const AttractionMarkerSchema = BaseMarkerSchema.extend({
  type: z.literal('attraction'),
  waitTime: z.number().optional(),
  status: MarkerStatusSchema,
  fastPassAvailable: z.boolean().optional(),
  heightRestriction: z.number().optional(), // in cm
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export type AttractionMarker = z.infer<typeof AttractionMarkerSchema>;

// Restaurant marker
export const RestaurantMarkerSchema = BaseMarkerSchema.extend({
  type: z.literal('restaurant'),
  cuisine: z.array(z.string()).optional(),
  priceLevel: z.number().min(1).max(4).optional(),
  rating: z.number().min(0).max(5).optional(),
  reservationRequired: z.boolean().optional(),
  mealPeriods: z.array(z.enum(['breakfast', 'lunch', 'dinner'])).optional(),
});

export type RestaurantMarker = z.infer<typeof RestaurantMarkerSchema>;

// Group member marker
export const GroupMemberMarkerSchema = BaseMarkerSchema.extend({
  type: z.literal('custom'),
  memberId: z.string(),
  memberName: z.string(),
  avatar: z.string().url().optional(),
  lastUpdated: z.date(),
  battery: z.number().min(0).max(100).optional(),
  status: z.enum(['active', 'idle', 'offline']).default('active'),
});

export type GroupMemberMarker = z.infer<typeof GroupMemberMarkerSchema>;

// Union type for all markers
export const MarkerSchema = z.discriminatedUnion('type', [
  AttractionMarkerSchema,
  RestaurantMarkerSchema,
  BaseMarkerSchema,
]);

export type Marker = z.infer<typeof MarkerSchema>;

// Map style configuration
export const MapStyleSchema = z.object({
  mapId: z.string().optional(),
  styles: z.array(z.any()).optional(), // Google Maps style array
  disableDefaultUI: z.boolean().optional(),
  zoomControl: z.boolean().optional(),
  mapTypeControl: z.boolean().optional(),
  scaleControl: z.boolean().optional(),
  streetViewControl: z.boolean().optional(),
  rotateControl: z.boolean().optional(),
  fullscreenControl: z.boolean().optional(),
});

export type MapStyle = z.infer<typeof MapStyleSchema>;

// Map configuration
export const MapConfigSchema = z.object({
  center: CoordinateSchema,
  zoom: z.number().min(0).max(22),
  minZoom: z.number().min(0).max(22).optional(),
  maxZoom: z.number().min(0).max(22).optional(),
  restriction: z.object({
    latLngBounds: BoundsSchema,
    strictBounds: z.boolean().optional(),
  }).optional(),
  mapTypeId: z.enum(['roadmap', 'satellite', 'hybrid', 'terrain']).optional(),
  heading: z.number().min(0).max(360).optional(),
  tilt: z.number().min(0).max(60).optional(),
  clickableIcons: z.boolean().optional(),
  disableDoubleClickZoom: z.boolean().optional(),
  draggable: z.boolean().optional(),
  keyboardShortcuts: z.boolean().optional(),
  scrollwheel: z.boolean().optional(),
  gestureHandling: z.enum(['cooperative', 'greedy', 'none', 'auto']).optional(),
});

export type MapConfig = z.infer<typeof MapConfigSchema>;

// Polyline/Route types
export const RouteSchema = z.object({
  id: z.string(),
  path: z.array(CoordinateSchema),
  strokeColor: z.string().optional(),
  strokeOpacity: z.number().min(0).max(1).optional(),
  strokeWeight: z.number().optional(),
  geodesic: z.boolean().optional(),
  editable: z.boolean().optional(),
  draggable: z.boolean().optional(),
  visible: z.boolean().default(true),
});

export type Route = z.infer<typeof RouteSchema>;

// Heat map data point
export const HeatmapPointSchema = z.object({
  location: CoordinateSchema,
  weight: z.number().optional(),
});

export type HeatmapPoint = z.infer<typeof HeatmapPointSchema>;

// Cluster configuration
export const ClusterConfigSchema = z.object({
  gridSize: z.number().optional(),
  maxZoom: z.number().optional(),
  zoomOnClick: z.boolean().optional(),
  averageCenter: z.boolean().optional(),
  minimumClusterSize: z.number().optional(),
  styles: z.array(z.object({
    url: z.string(),
    height: z.number(),
    width: z.number(),
    textColor: z.string().optional(),
    textSize: z.number().optional(),
  })).optional(),
});

export type ClusterConfig = z.infer<typeof ClusterConfigSchema>;

// Info window content
export const InfoWindowContentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  actions: z.array(z.object({
    label: z.string(),
    onClick: z.function().optional(),
    href: z.string().url().optional(),
  })).optional(),
  customContent: z.any().optional(), // React component
});

export type InfoWindowContent = z.infer<typeof InfoWindowContentSchema>;

// Drawing tools types
export const DrawingShapeSchema = z.object({
  id: z.string(),
  type: z.enum(['marker', 'circle', 'polygon', 'polyline', 'rectangle']),
  editable: z.boolean().default(true),
  draggable: z.boolean().default(true),
  data: z.any(), // Shape-specific data
});

export type DrawingShape = z.infer<typeof DrawingShapeSchema>;

// Map events
export const MapEventTypeSchema = z.enum([
  'click',
  'dblclick',
  'rightclick',
  'mousemove',
  'mouseout',
  'mouseover',
  'drag',
  'dragend',
  'dragstart',
  'idle',
  'bounds_changed',
  'center_changed',
  'zoom_changed',
  'tilesloaded',
]);

export type MapEventType = z.infer<typeof MapEventTypeSchema>;

// Map event data
export const MapEventSchema = z.object({
  type: MapEventTypeSchema,
  latLng: CoordinateSchema.optional(),
  pixel: z.object({ x: z.number(), y: z.number() }).optional(),
  placeId: z.string().optional(),
  feature: z.any().optional(),
});

export type MapEvent = z.infer<typeof MapEventSchema>;

// Disney-specific types
export const DisneyParkSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  center: CoordinateSchema,
  bounds: BoundsSchema,
  defaultZoom: z.number(),
  timezone: z.string(),
  resort: z.enum(['WDW', 'DLR', 'DLP', 'TDR', 'HKDL', 'SHDR']),
});

export type DisneyPark = z.infer<typeof DisneyParkSchema>;

// Wait time data
export const WaitTimeDataSchema = z.object({
  attractionId: z.string(),
  currentWait: z.number(),
  fastPassAvailable: z.boolean(),
  fastPassReturn: z.string().optional(),
  status: MarkerStatusSchema,
  lastUpdate: z.date(),
  trend: z.enum(['increasing', 'decreasing', 'stable']).optional(),
  predictedWait: z.number().optional(),
});

export type WaitTimeData = z.infer<typeof WaitTimeDataSchema>;

// Export all schemas for runtime validation
export const MapSchemas = {
  Coordinate: CoordinateSchema,
  ExtendedCoordinate: ExtendedCoordinateSchema,
  Bounds: BoundsSchema,
  LocationMetadata: LocationMetadataSchema,
  LocationData: LocationDataSchema,
  MarkerType: MarkerTypeSchema,
  MarkerStatus: MarkerStatusSchema,
  BaseMarker: BaseMarkerSchema,
  AttractionMarker: AttractionMarkerSchema,
  RestaurantMarker: RestaurantMarkerSchema,
  GroupMemberMarker: GroupMemberMarkerSchema,
  Marker: MarkerSchema,
  MapStyle: MapStyleSchema,
  MapConfig: MapConfigSchema,
  Route: RouteSchema,
  HeatmapPoint: HeatmapPointSchema,
  ClusterConfig: ClusterConfigSchema,
  InfoWindowContent: InfoWindowContentSchema,
  DrawingShape: DrawingShapeSchema,
  MapEventType: MapEventTypeSchema,
  MapEvent: MapEventSchema,
  DisneyPark: DisneyParkSchema,
  WaitTimeData: WaitTimeDataSchema,
};