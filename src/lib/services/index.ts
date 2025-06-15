/**
 * Services Barrel Export
 * Centralized export for all service modules
 */

// Analytics Services
export { 
    AnalyticsService,
    type AnalyticsEvent,
    type AnalyticsUser,
    type AnalyticsSession,
    type AnalyticsMetrics,
    type AnalyticsReport,
    type AnalyticsReportType,
    type AnalyticsReportPeriod,
    type AnalyticsReportFilter
} from './analytics-service'

// Wait Time Analytics
export { 
    WaitTimeAnalyticsService,
    waitTimeAnalyticsService,
    getPredictionsForAttraction,
    analyzeParkCrowds,
    detectWaitTimeAnomalies,
    getHistoricalTrends,
    getOptimizedItinerary,
    type WaitTimePrediction,
    type CrowdAnalysis,
    type HistoricalTrend,
    type AnomalyDetection,
    type OptimizationRecommendation
} from './wait-time-analytics'

// Geofence Service
export {
    GeofenceService,
    geofenceService,
    type Geofence,
    type GeofenceEvent,
    type GeofenceAlert,
    type LocationData,
    type GeofenceMonitor,
    type GeofenceNotification
} from './geofence-service'

// Park Service
export {
    ParkService,
    type Park,
    type ParkHours,
    type ParkEvent,
    type ParkCalendar
} from './park-service'

// Restaurant Service
export {
    RestaurantService,
    type Restaurant,
    type RestaurantReservation,
    type RestaurantAvailability,
    type MenuSection
} from './restaurant-service'

// Chat Service
export {
    ChatService,
    type ChatMessage,
    type ChatRoom,
    type ChatUser,
    type ChatNotification
} from './chat-service'

// Weather Service
export {
    WeatherService,
    weatherService,
    type WeatherData,
    type WeatherForecast,
    type WeatherAlert,
    type WeatherConditions
} from './weather-service'

// Virtual Queue Service
export {
    VirtualQueueService,
    type VirtualQueue,
    type QueueReservation,
    type QueueStatus,
    type QueueAvailability
} from './virtual-queue-service'

// Recommendation Service
export {
    RecommendationService,
    type Recommendation,
    type RecommendationCriteria,
    type RecommendationScore,
    type UserPreferences
} from './recommendation-service'

// Itinerary Service
export {
    ItineraryService,
    type Itinerary,
    type ItineraryItem,
    type ItineraryOptimization,
    type ItineraryConstraints
} from './itinerary-service'

// Wait Time Scraper Service
export {
    WaitTimeScraperService,
    triggerDataCollection,
    getDataQualityMetrics,
    getScrapingSessionStatus,
    type ScrapingSession,
    type DataQualityMetrics,
    type ScrapingStatus
} from './wait-time-scraper' 