import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app'
import { Analytics, getAnalytics, isSupported as isAnalyticsSupported, logEvent } from 'firebase/analytics'
import { 
  Auth, 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  connectAuthEmulator
} from 'firebase/auth'
import { 
  Firestore, 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
  clearIndexedDbPersistence,
  terminate
} from 'firebase/firestore'
import { 
  Database, 
  getDatabase, 
  connectDatabaseEmulator,
  goOffline,
  goOnline
} from 'firebase/database'
import { Storage, getStorage, connectStorageEmulator } from 'firebase/storage'
import { Messaging, getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging'
import { Performance, getPerformance } from 'firebase/performance'
import { connectionManager } from './connection-manager'
import { performanceMonitor } from './firebase-performance'

// Firebase configuration with validation
interface FirebaseConfig extends FirebaseOptions {
  enablePersistence?: boolean
  enableMultiTab?: boolean
  persistenceType?: 'local' | 'session' | 'indexed'
  enableEmulators?: boolean
  emulatorConfig?: {
    auth?: { host: string; port: number }
    firestore?: { host: string; port: number }
    database?: { host: string; port: number }
    storage?: { host: string; port: number }
  }
}

// Optimized Firebase client service
class FirebaseClientService {
  private static instance: FirebaseClientService | null = null
  private app: FirebaseApp | null = null
  private auth: Auth | null = null
  private firestore: Firestore | null = null
  private database: Database | null = null
  private storage: Storage | null = null
  private analytics: Analytics | null = null
  private messaging: Messaging | null = null
  private performance: Performance | null = null
  private initialized = false
  private persistenceEnabled = false
  private networkStatus: 'online' | 'offline' = 'online'

  private constructor() {}

  static getInstance(): FirebaseClientService {
    if (!this.instance) {
      this.instance = new FirebaseClientService()
    }
    return this.instance
  }

  // Initialize Firebase with optimized settings
  async initialize(config?: FirebaseConfig): Promise<void> {
    if (this.initialized) return

    const trace = performanceMonitor.startTrace('firebase_client_initialization')
    
    try {
      // Get configuration
      const firebaseConfig = this.getConfig(config)
      
      // Initialize app
      this.app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
      
      // Initialize core services
      await this.initializeServices(firebaseConfig)
      
      // Setup persistence if enabled
      if (firebaseConfig.enablePersistence) {
        await this.setupPersistence(firebaseConfig)
      }
      
      // Connect to emulators if enabled
      if (firebaseConfig.enableEmulators && firebaseConfig.emulatorConfig) {
        await this.connectEmulators(firebaseConfig.emulatorConfig)
      }
      
      // Setup network monitoring
      this.setupNetworkMonitoring()
      
      this.initialized = true
      
      performanceMonitor.recordOperation({
        operationName: 'firebase_client_initialization',
        duration: Date.now() - (trace as any).startTime,
        success: true
      })
      
      trace?.stop()
      
      console.log('✅ Firebase client initialized successfully')
      
    } catch (error) {
      performanceMonitor.recordOperation({
        operationName: 'firebase_client_initialization',
        duration: Date.now() - (trace as any).startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      trace?.stop()
      
      throw error
    }
  }

  // Get configuration with defaults
  private getConfig(customConfig?: FirebaseConfig): FirebaseConfig {
    const baseConfig: FirebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      
      // Default options
      enablePersistence: true,
      enableMultiTab: true,
      persistenceType: 'indexed',
      enableEmulators: process.env.NODE_ENV === 'development',
      
      // Override with custom config
      ...customConfig
    }

    // Validate required fields
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
    const missing = required.filter(field => !baseConfig[field as keyof FirebaseConfig])
    
    if (missing.length > 0) {
      throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`)
    }

    return baseConfig
  }

  // Initialize services with lazy loading
  private async initializeServices(config: FirebaseConfig): Promise<void> {
    // Auth is always initialized
    this.auth = getAuth(this.app!)
    
    // Firestore is always initialized
    this.firestore = getFirestore(this.app!)
    
    // Database is initialized if URL is provided
    if (config.databaseURL) {
      this.database = getDatabase(this.app!, config.databaseURL)
    }
    
    // Storage is always initialized
    this.storage = getStorage(this.app!)
    
    // Initialize analytics if supported
    if (typeof window !== 'undefined') {
      const analyticsSupported = await isAnalyticsSupported()
      if (analyticsSupported && config.measurementId) {
        this.analytics = getAnalytics(this.app!)
      }
      
      // Initialize messaging if supported
      const messagingSupported = await isMessagingSupported()
      if (messagingSupported) {
        this.messaging = getMessaging(this.app!)
      }
      
      // Initialize performance monitoring
      this.performance = getPerformance(this.app!)
    }
  }

  // Setup persistence with fallback
  private async setupPersistence(config: FirebaseConfig): Promise<void> {
    if (this.persistenceEnabled || typeof window === 'undefined') return
    
    try {
      // Setup auth persistence
      if (this.auth) {
        const persistenceMode = config.persistenceType === 'session' 
          ? browserSessionPersistence 
          : config.persistenceType === 'indexed'
          ? indexedDBLocalPersistence
          : browserLocalPersistence
          
        await setPersistence(this.auth, persistenceMode)
      }
      
      // Setup Firestore persistence
      if (this.firestore) {
        try {
          if (config.enableMultiTab) {
            await enableMultiTabIndexedDbPersistence(this.firestore)
            console.log('✅ Multi-tab Firestore persistence enabled')
          } else {
            await enableIndexedDbPersistence(this.firestore)
            console.log('✅ Single-tab Firestore persistence enabled')
          }
          this.persistenceEnabled = true
        } catch (error: any) {
          if (error.code === 'failed-precondition') {
            console.warn('Firestore persistence failed: Multiple tabs open')
          } else if (error.code === 'unimplemented') {
            console.warn('Firestore persistence not supported in this browser')
          } else {
            throw error
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to setup persistence:', error)
    }
  }

  // Connect to Firebase emulators
  private async connectEmulators(config: any): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      // Connect Auth emulator
      if (this.auth && config.auth && !this.auth.config.emulator) {
        connectAuthEmulator(this.auth, `http://${config.auth.host}:${config.auth.port}`)
        console.log('✅ Connected to Auth emulator')
      }
      
      // Connect Firestore emulator
      if (this.firestore && config.firestore) {
        connectFirestoreEmulator(this.firestore, config.firestore.host, config.firestore.port)
        console.log('✅ Connected to Firestore emulator')
      }
      
      // Connect Database emulator
      if (this.database && config.database) {
        connectDatabaseEmulator(this.database, config.database.host, config.database.port)
        console.log('✅ Connected to Database emulator')
      }
      
      // Connect Storage emulator
      if (this.storage && config.storage) {
        connectStorageEmulator(this.storage, config.storage.host, config.storage.port)
        console.log('✅ Connected to Storage emulator')
      }
      
    } catch (error) {
      console.error('Failed to connect to emulators:', error)
    }
  }

  // Setup network monitoring
  private setupNetworkMonitoring(): void {
    if (typeof window === 'undefined') return
    
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.networkStatus = 'online'
      this.handleNetworkChange(true)
    })
    
    window.addEventListener('offline', () => {
      this.networkStatus = 'offline'
      this.handleNetworkChange(false)
    })
  }

  // Handle network status changes
  private async handleNetworkChange(isOnline: boolean): Promise<void> {
    console.log(`🌐 Network status: ${isOnline ? 'online' : 'offline'}`)
    
    // Handle Firestore network
    if (this.firestore) {
      try {
        if (isOnline) {
          await enableNetwork(this.firestore)
        } else {
          await disableNetwork(this.firestore)
        }
      } catch (error) {
        console.error('Failed to update Firestore network status:', error)
      }
    }
    
    // Handle Database network
    if (this.database) {
      try {
        if (isOnline) {
          goOnline(this.database)
        } else {
          goOffline(this.database)
        }
      } catch (error) {
        console.error('Failed to update Database network status:', error)
      }
    }
    
    // Log network event
    if (this.analytics) {
      logEvent(this.analytics, 'network_status_change', {
        status: isOnline ? 'online' : 'offline',
        timestamp: Date.now()
      })
    }
  }

  // Get services
  getApp(): FirebaseApp {
    if (!this.app) throw new Error('Firebase not initialized')
    return this.app
  }

  getAuth(): Auth {
    if (!this.auth) throw new Error('Auth not initialized')
    return this.auth
  }

  getFirestore(): Firestore {
    if (!this.firestore) throw new Error('Firestore not initialized')
    return this.firestore
  }

  getDatabase(): Database {
    if (!this.database) throw new Error('Database not initialized')
    return this.database
  }

  getStorage(): Storage {
    if (!this.storage) throw new Error('Storage not initialized')
    return this.storage
  }

  getAnalytics(): Analytics | null {
    return this.analytics
  }

  getMessaging(): Messaging | null {
    return this.messaging
  }

  getPerformance(): Performance | null {
    return this.performance
  }

  // Network status
  isOnline(): boolean {
    return this.networkStatus === 'online'
  }

  // Clear all persistence
  async clearPersistence(): Promise<void> {
    if (this.firestore) {
      await clearIndexedDbPersistence(this.firestore)
    }
  }

  // Terminate all connections
  async terminate(): Promise<void> {
    // Cleanup all subscriptions
    connectionManager.unsubscribeAll()
    
    // Terminate Firestore
    if (this.firestore) {
      await terminate(this.firestore)
    }
    
    // Go offline for Database
    if (this.database) {
      goOffline(this.database)
    }
    
    this.initialized = false
  }
}

// Export singleton instance
export const firebaseClient = FirebaseClientService.getInstance()

// Export convenience getters
export const getClientApp = () => firebaseClient.getApp()
export const getClientAuth = () => firebaseClient.getAuth()
export const getClientFirestore = () => firebaseClient.getFirestore()
export const getClientDatabase = () => firebaseClient.getDatabase()
export const getClientStorage = () => firebaseClient.getStorage()
export const getClientAnalytics = () => firebaseClient.getAnalytics()
export const getClientMessaging = () => firebaseClient.getMessaging()
export const getClientPerformance = () => firebaseClient.getPerformance()

// Initialize on client side
if (typeof window !== 'undefined') {
  firebaseClient.initialize().catch(error => {
    console.error('Failed to initialize Firebase client:', error)
  })
}