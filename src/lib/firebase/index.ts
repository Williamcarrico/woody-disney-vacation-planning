/**
 * Firebase Services Barrel Export
 * Centralized export for all Firebase modules
 */

// Firebase Configuration
export {
    auth,
    firestore,
    storage,
    analytics,
    performance,
    messaging,
    remoteConfig,
    functions
} from './firebase.config'

// Collections
export {
    COLLECTIONS,
    STORAGE_BUCKETS,
    type FirebaseVacation,
    type FirebaseAccommodation,
    type FirebaseAttraction,
    type FirebaseGeofence,
    type FirebaseResort,
    type FirebaseRestaurant,
    type FirebaseWaitTime,
    type FirebaseUserProfile,
    timestampToFirebase,
    firebaseToTimestamp
} from './collections'

// Auth Service
export {
    authService,
    type AuthUser,
    type AuthError
} from './auth-service'

// Vacation Service
export {
    VacationService,
    vacationService,
    type VacationFilters,
    type PaginationOptions
} from './vacation-service'

// Enhanced Vacation Service (with compatibility layer)
export {
    VacationService as EnhancedVacationService,
    vacationService as enhancedVacationService,
    type Vacation,
    type VacationUpdate,
    type VacationServiceResponse,
    VacationServiceError,
    VacationErrorCodes,
    formatVacationForDisplay,
    getRecommendedTicketType
} from './vacation-service-enhanced'

// Firestore Service
export {
    ResortService,
    AttractionService,
    GeofenceService,
    RestaurantService,
    WaitTimeService,
    UserService
} from './firestore-service'

// Firebase Data Manager
export {
    FirebaseDataManager,
    dataManager
} from './firebase-data-manager'

// Optimized Queries
export {
    createOptimizedQuery,
    queryWithPagination,
    queryWithCache,
    batchGet,
    batchWrite,
    type QueryOptions,
    type PaginatedResult
} from './optimized-queries'

// Real-time Listeners
export {
    createRealtimeListener,
    createCollectionListener,
    createDocumentListener,
    type ListenerOptions,
    type UnsubscribeFunction
} from './realtime-listeners' 