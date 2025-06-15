import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { Auth, getAuth } from 'firebase-admin/auth'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import { Database, getDatabase } from 'firebase-admin/database'
import { Storage, getStorage } from 'firebase-admin/storage'
import { Messaging, getMessaging } from 'firebase-admin/messaging'
import { firebaseErrorHandler, FirebaseErrorType } from './firebase-error-handler'
import { performanceMonitor } from './firebase-performance'

// Enhanced Admin SDK configuration with performance monitoring
interface AdminSDKConfig {
  projectId: string
  clientEmail: string
  privateKey: string
  databaseURL: string
  storageBucket: string
}

// Service account configuration with validation
class AdminSDKService {
  private static instance: AdminSDKService | null = null
  private app: App | null = null
  private auth: Auth | null = null
  private firestore: Firestore | null = null
  private database: Database | null = null
  private storage: Storage | null = null
  private messaging: Messaging | null = null
  private initialized = false

  private constructor() {}

  static getInstance(): AdminSDKService {
    if (!this.instance) {
      this.instance = new AdminSDKService()
    }
    return this.instance
  }

  // Initialize Admin SDK with enhanced error handling
  async initialize(): Promise<void> {
    if (this.initialized) return

    const trace = performanceMonitor.startTrace('admin_sdk_initialization')
    
    try {
      const config = this.getConfig()
      
      // Check if already initialized
      if (getApps().length > 0) {
        this.app = getApp()
      } else {
        // Initialize with service account
        this.app = initializeApp({
          credential: cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: this.formatPrivateKey(config.privateKey)
          }),
          databaseURL: config.databaseURL,
          storageBucket: config.storageBucket
        })
      }

      // Initialize services lazily
      this.initialized = true
      
      performanceMonitor.recordOperation({
        operationName: 'admin_sdk_initialization',
        duration: Date.now() - (trace as any).startTime,
        success: true
      })
      
      trace?.stop()
      
      console.log('✅ Firebase Admin SDK initialized successfully')
      
    } catch (error) {
      performanceMonitor.recordOperation({
        operationName: 'admin_sdk_initialization',
        duration: Date.now() - (trace as any).startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      trace?.stop()
      
      throw error
    }
  }

  // Get configuration with environment validation
  private getConfig(): AdminSDKConfig {
    const config: AdminSDKConfig = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''
    }

    // Validate required fields
    const missingFields: string[] = []
    if (!config.projectId) missingFields.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
    if (!config.clientEmail) missingFields.push('FIREBASE_CLIENT_EMAIL')
    if (!config.privateKey) missingFields.push('FIREBASE_PRIVATE_KEY')

    if (missingFields.length > 0) {
      throw new Error(`Missing required Firebase Admin configuration: ${missingFields.join(', ')}`)
    }

    // Set defaults for optional fields
    if (!config.databaseURL) {
      config.databaseURL = `https://${config.projectId}-default-rtdb.firebaseio.com`
    }
    if (!config.storageBucket) {
      config.storageBucket = `${config.projectId}.appspot.com`
    }

    return config
  }

  // Format private key properly
  private formatPrivateKey(key: string): string {
    if (!key) throw new Error('Private key is required')
    
    // Remove quotes and unescape newlines
    const formatted = key
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n')
    
    // Validate key format
    if (!formatted.includes('-----BEGIN PRIVATE KEY-----') || 
        !formatted.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format')
    }
    
    return formatted
  }

  // Get Auth service with error handling
  async getAuth(): Promise<Auth> {
    if (!this.initialized) await this.initialize()
    
    if (!this.auth) {
      this.auth = getAuth(this.app!)
    }
    
    return this.auth
  }

  // Get Firestore service with optimization
  async getFirestore(): Promise<Firestore> {
    if (!this.initialized) await this.initialize()
    
    if (!this.firestore) {
      this.firestore = getFirestore(this.app!)
      
      // Apply Firestore settings for better performance
      this.firestore.settings({
        ignoreUndefinedProperties: true,
        preferRest: false // Use gRPC for better performance
      })
    }
    
    return this.firestore
  }

  // Get Realtime Database service
  async getDatabase(): Promise<Database> {
    if (!this.initialized) await this.initialize()
    
    if (!this.database) {
      this.database = getDatabase(this.app!)
    }
    
    return this.database
  }

  // Get Storage service
  async getStorage(): Promise<Storage> {
    if (!this.initialized) await this.initialize()
    
    if (!this.storage) {
      this.storage = getStorage(this.app!)
    }
    
    return this.storage
  }

  // Get Messaging service
  async getMessaging(): Promise<Messaging> {
    if (!this.initialized) await this.initialize()
    
    if (!this.messaging) {
      this.messaging = getMessaging(this.app!)
    }
    
    return this.messaging
  }

  // Verify ID token with caching
  async verifyIdToken(idToken: string, checkRevoked = true): Promise<any> {
    const trace = performanceMonitor.startTrace('verify_id_token')
    
    try {
      const auth = await this.getAuth()
      const decodedToken = await auth.verifyIdToken(idToken, checkRevoked)
      
      trace?.stop()
      return decodedToken
      
    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Create custom token with claims
  async createCustomToken(uid: string, claims?: object): Promise<string> {
    const auth = await this.getAuth()
    return auth.createCustomToken(uid, claims)
  }

  // Batch user operations
  async batchGetUsers(uids: string[]): Promise<any[]> {
    const auth = await this.getAuth()
    const batchSize = 100 // Firebase limit
    const results: any[] = []
    
    for (let i = 0; i < uids.length; i += batchSize) {
      const batch = uids.slice(i, i + batchSize)
      const { users } = await auth.getUsers(batch.map(uid => ({ uid })))
      results.push(...users)
    }
    
    return results
  }

  // Set custom user claims
  async setCustomUserClaims(uid: string, claims: object): Promise<void> {
    const auth = await this.getAuth()
    await auth.setCustomUserClaims(uid, claims)
  }

  // Revoke refresh tokens
  async revokeRefreshTokens(uid: string): Promise<void> {
    const auth = await this.getAuth()
    await auth.revokeRefreshTokens(uid)
  }

  // Send FCM message with retry
  async sendMessage(message: any): Promise<string> {
    return firebaseErrorHandler.executeWithProtection(
      async () => {
        const messaging = await this.getMessaging()
        return messaging.send(message)
      },
      {
        operationName: 'send_fcm_message',
        retryConfig: {
          maxRetries: 3,
          retryableErrors: [FirebaseErrorType.NETWORK, FirebaseErrorType.UNAVAILABLE]
        }
      }
    )
  }

  // Send multicast message
  async sendMulticastMessage(message: any): Promise<any> {
    const messaging = await this.getMessaging()
    return messaging.sendEachForMulticast(message)
  }

  // Topic management
  async subscribeToTopic(tokens: string[], topic: string): Promise<any> {
    const messaging = await this.getMessaging()
    return messaging.subscribeToTopic(tokens, topic)
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<any> {
    const messaging = await this.getMessaging()
    return messaging.unsubscribeFromTopic(tokens, topic)
  }
}

// Export singleton instance
export const adminSDK = AdminSDKService.getInstance()

// Helper functions for common operations
export async function verifyUserToken(token: string): Promise<any> {
  return adminSDK.verifyIdToken(token)
}

export async function createUserToken(uid: string, claims?: object): Promise<string> {
  return adminSDK.createCustomToken(uid, claims)
}

export async function sendNotification(message: any): Promise<string> {
  return adminSDK.sendMessage(message)
}

export async function getAdminAuth(): Promise<Auth> {
  return adminSDK.getAuth()
}

export async function getAdminFirestore(): Promise<Firestore> {
  return adminSDK.getFirestore()
}

export async function getAdminDatabase(): Promise<Database> {
  return adminSDK.getDatabase()
}

export async function getAdminStorage(): Promise<Storage> {
  return adminSDK.getStorage()
}

// Initialize on server startup
if (typeof window === 'undefined') {
  adminSDK.initialize().catch(error => {
    console.error('Failed to initialize Firebase Admin SDK:', error)
  })
}