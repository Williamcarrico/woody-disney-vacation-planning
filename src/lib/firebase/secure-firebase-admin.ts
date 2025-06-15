import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'
import crypto from 'crypto'

// Configuration interface for better type safety
interface FirebaseAdminConfig {
  projectId: string
  clientEmail: string
  privateKey: string
  databaseURL?: string
}

// Security utilities
class SecurityUtils {
  // Validate private key format without exposing it in logs
  static validatePrivateKey(key: string): boolean {
    const hasBeginMarker = key.includes('-----BEGIN PRIVATE KEY-----')
    const hasEndMarker = key.includes('-----END PRIVATE KEY-----')
    const hasMinLength = key.length > 100
    
    return hasBeginMarker && hasEndMarker && hasMinLength
  }

  // Sanitize error messages to avoid leaking sensitive info
  static sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      // Remove any potential credentials from error messages
      return error.message
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
        .replace(/-----BEGIN[^-]+-----[\s\S]+-----END[^-]+-----/g, '[KEY_REDACTED]')
        .replace(/[a-zA-Z0-9-_.]+\.firebaseapp\.com/g, '[PROJECT_REDACTED]')
    }
    return 'Unknown error occurred'
  }

  // Secure key processing with validation
  static processPrivateKey(rawKey: string): string {
    if (!rawKey) {
      throw new Error('Private key is required')
    }

    // Remove quotes and unescape newlines
    const processed = rawKey
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n')

    // Validate the processed key
    if (!this.validatePrivateKey(processed)) {
      throw new Error('Invalid private key format')
    }

    return processed
  }
}

// Singleton pattern for admin instance
class FirebaseAdminManager {
  private static instance: admin.app.App | null = null
  private static initializationPromise: Promise<admin.app.App> | null = null
  private static initAttempts = 0
  private static readonly MAX_INIT_ATTEMPTS = 3

  // Get configuration from environment with validation
  private static getConfig(): FirebaseAdminConfig {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    // Validate all required fields
    const missingFields: string[] = []
    if (!projectId) missingFields.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
    if (!clientEmail) missingFields.push('FIREBASE_CLIENT_EMAIL')
    if (!privateKey) missingFields.push('FIREBASE_PRIVATE_KEY')

    if (missingFields.length > 0) {
      throw new Error(`Missing required Firebase Admin configuration: ${missingFields.join(', ')}`)
    }

    return {
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: privateKey!,
      databaseURL: `https://${projectId}.firebaseio.com`
    }
  }

  // Initialize admin with retry logic
  private static async initializeAdmin(): Promise<admin.app.App> {
    if (this.instance) {
      return this.instance
    }

    // Return existing initialization promise if in progress
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.performInitialization()
    
    try {
      this.instance = await this.initializationPromise
      return this.instance
    } catch (error) {
      this.initializationPromise = null
      throw error
    }
  }

  private static async performInitialization(): Promise<admin.app.App> {
    while (this.initAttempts < this.MAX_INIT_ATTEMPTS) {
      try {
        this.initAttempts++

        // Check if already initialized
        const apps = getApps()
        if (apps.length > 0) {
          return apps[0]
        }

        // Get and validate configuration
        const config = this.getConfig()
        const processedKey = SecurityUtils.processPrivateKey(config.privateKey)

        // Initialize Firebase Admin
        const app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: processedKey,
          }),
          databaseURL: config.databaseURL,
        })

        console.log('Firebase Admin initialized successfully')
        return app

      } catch (error) {
        const sanitizedError = SecurityUtils.sanitizeError(error)
        console.error(`Firebase Admin initialization attempt ${this.initAttempts} failed:`, sanitizedError)

        if (this.initAttempts >= this.MAX_INIT_ATTEMPTS) {
          throw new Error(`Failed to initialize Firebase Admin after ${this.MAX_INIT_ATTEMPTS} attempts: ${sanitizedError}`)
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, this.initAttempts) * 1000))
      }
    }

    throw new Error('Failed to initialize Firebase Admin')
  }

  // Public method to get admin instance
  static async getInstance(): Promise<admin.app.App> {
    return this.initializeAdmin()
  }

  // Reset for testing purposes
  static reset(): void {
    this.instance = null
    this.initializationPromise = null
    this.initAttempts = 0
  }
}

// Rate limiting for admin operations
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly windowMs = 60000 // 1 minute
  private readonly maxRequests = 100

  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.windowMs)
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

// Create a global rate limiter instance
const rateLimiter = new RateLimiter()

// Clean up rate limiter every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000)
}

// Export secure initialization function
export async function initAdmin(): Promise<admin.app.App> {
  return FirebaseAdminManager.getInstance()
}

// Export secure helper functions with rate limiting
export async function getAuth(rateLimitKey?: string): Promise<admin.auth.Auth> {
  if (rateLimitKey && !rateLimiter.isAllowed(rateLimitKey)) {
    throw new Error('Rate limit exceeded')
  }
  
  const app = await initAdmin()
  return app.auth()
}

export async function getFirestore(rateLimitKey?: string): Promise<admin.firestore.Firestore> {
  if (rateLimitKey && !rateLimiter.isAllowed(rateLimitKey)) {
    throw new Error('Rate limit exceeded')
  }
  
  const app = await initAdmin()
  return app.firestore()
}

// Export for testing purposes
export const _testUtils = {
  SecurityUtils,
  FirebaseAdminManager,
  RateLimiter,
  rateLimiter
}