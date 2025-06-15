import { FirebaseError } from 'firebase/app'
import { FirestoreError } from 'firebase/firestore'

// Error classification
export enum FirebaseErrorType {
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  INTERNAL = 'INTERNAL',
  UNAVAILABLE = 'UNAVAILABLE',
  DATA_LOSS = 'DATA_LOSS',
  UNKNOWN = 'UNKNOWN'
}

// Structured error response
export interface FirebaseErrorResponse {
  type: FirebaseErrorType
  message: string
  code: string
  isRetriable: boolean
  suggestedAction?: string
  metadata?: Record<string, any>
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors: FirebaseErrorType[]
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    FirebaseErrorType.NETWORK,
    FirebaseErrorType.UNAVAILABLE,
    FirebaseErrorType.INTERNAL,
    FirebaseErrorType.RESOURCE_EXHAUSTED
  ]
}

// Error classifier
export class FirebaseErrorClassifier {
  static classify(error: unknown): FirebaseErrorResponse {
    if (error instanceof FirebaseError || error instanceof FirestoreError) {
      return this.classifyFirebaseError(error)
    }
    
    if (error instanceof Error) {
      return this.classifyGenericError(error)
    }
    
    return {
      type: FirebaseErrorType.UNKNOWN,
      message: 'An unknown error occurred',
      code: 'unknown',
      isRetriable: false
    }
  }

  private static classifyFirebaseError(error: FirebaseError | FirestoreError): FirebaseErrorResponse {
    const errorMap: Record<string, { type: FirebaseErrorType; isRetriable: boolean; suggestedAction?: string }> = {
      // Network errors
      'unavailable': {
        type: FirebaseErrorType.UNAVAILABLE,
        isRetriable: true,
        suggestedAction: 'Check your internet connection and try again'
      },
      'network-request-failed': {
        type: FirebaseErrorType.NETWORK,
        isRetriable: true,
        suggestedAction: 'Check your internet connection and try again'
      },
      
      // Permission errors
      'permission-denied': {
        type: FirebaseErrorType.PERMISSION,
        isRetriable: false,
        suggestedAction: 'You do not have permission to perform this action'
      },
      'unauthorized': {
        type: FirebaseErrorType.UNAUTHENTICATED,
        isRetriable: false,
        suggestedAction: 'Please sign in to continue'
      },
      'unauthenticated': {
        type: FirebaseErrorType.UNAUTHENTICATED,
        isRetriable: false,
        suggestedAction: 'Please sign in to continue'
      },
      
      // Resource errors
      'not-found': {
        type: FirebaseErrorType.NOT_FOUND,
        isRetriable: false,
        suggestedAction: 'The requested resource was not found'
      },
      'already-exists': {
        type: FirebaseErrorType.ALREADY_EXISTS,
        isRetriable: false,
        suggestedAction: 'This resource already exists'
      },
      
      // Rate limiting
      'resource-exhausted': {
        type: FirebaseErrorType.RESOURCE_EXHAUSTED,
        isRetriable: true,
        suggestedAction: 'Too many requests. Please try again later'
      },
      
      // Data errors
      'invalid-argument': {
        type: FirebaseErrorType.INVALID_ARGUMENT,
        isRetriable: false,
        suggestedAction: 'Invalid data provided'
      },
      'failed-precondition': {
        type: FirebaseErrorType.INVALID_ARGUMENT,
        isRetriable: false,
        suggestedAction: 'Operation cannot be performed in the current state'
      },
      
      // Internal errors
      'internal': {
        type: FirebaseErrorType.INTERNAL,
        isRetriable: true,
        suggestedAction: 'An internal error occurred. Please try again'
      },
      'data-loss': {
        type: FirebaseErrorType.DATA_LOSS,
        isRetriable: false,
        suggestedAction: 'Data loss detected. Please contact support'
      }
    }

    const errorInfo = errorMap[error.code] || {
      type: FirebaseErrorType.UNKNOWN,
      isRetriable: false
    }

    return {
      type: errorInfo.type,
      message: error.message,
      code: error.code,
      isRetriable: errorInfo.isRetriable,
      suggestedAction: errorInfo.suggestedAction
    }
  }

  private static classifyGenericError(error: Error): FirebaseErrorResponse {
    // Check for network-related errors
    if (error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch')) {
      return {
        type: FirebaseErrorType.NETWORK,
        message: error.message,
        code: 'network-error',
        isRetriable: true,
        suggestedAction: 'Check your internet connection and try again'
      }
    }

    return {
      type: FirebaseErrorType.UNKNOWN,
      message: error.message,
      code: 'unknown-error',
      isRetriable: false
    }
  }
}

// Retry utility with exponential backoff
export class RetryManager {
  constructor(private config: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  async execute<T>(
    operation: () => Promise<T>,
    context?: { operationName?: string; metadata?: Record<string, any> }
  ): Promise<T> {
    let lastError: unknown
    let delay = this.config.initialDelayMs

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const errorInfo = FirebaseErrorClassifier.classify(error)

        // Log the error
        console.error(`Firebase operation failed (attempt ${attempt + 1}/${this.config.maxRetries + 1})`, {
          operation: context?.operationName,
          error: errorInfo,
          metadata: context?.metadata
        })

        // Check if we should retry
        if (attempt === this.config.maxRetries || !this.shouldRetry(errorInfo)) {
          throw this.enhanceError(error, errorInfo, attempt + 1)
        }

        // Wait before retrying
        await this.delay(delay)
        delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelayMs)
      }
    }

    throw lastError
  }

  private shouldRetry(errorInfo: FirebaseErrorResponse): boolean {
    return errorInfo.isRetriable && 
           this.config.retryableErrors.includes(errorInfo.type)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private enhanceError(
    originalError: unknown,
    errorInfo: FirebaseErrorResponse,
    attempts: number
  ): Error {
    const error = originalError instanceof Error ? originalError : new Error('Firebase operation failed')
    
    // Add retry information to the error
    ;(error as any).firebaseErrorType = errorInfo.type
    ;(error as any).attempts = attempts
    ;(error as any).isRetriable = errorInfo.isRetriable
    ;(error as any).suggestedAction = errorInfo.suggestedAction
    
    return error
  }
}

// Circuit breaker for preventing cascading failures
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1 minute
    private readonly halfOpenRequests = 1
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open - service temporarily unavailable')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    if (this.state === 'half-open') {
      this.state = 'closed'
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state
  }

  reset(): void {
    this.failures = 0
    this.lastFailureTime = 0
    this.state = 'closed'
  }
}

// Composite error handler with retry and circuit breaker
export class FirebaseErrorHandler {
  private retryManager: RetryManager
  private circuitBreakers: Map<string, CircuitBreaker> = new Map()

  constructor(retryConfig?: Partial<RetryConfig>) {
    this.retryManager = new RetryManager({
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig
    })
  }

  async executeWithProtection<T>(
    operation: () => Promise<T>,
    options: {
      operationName: string
      circuitBreakerKey?: string
      metadata?: Record<string, any>
      retryConfig?: Partial<RetryConfig>
    }
  ): Promise<T> {
    // Get or create circuit breaker
    const circuitBreaker = this.getCircuitBreaker(
      options.circuitBreakerKey || options.operationName
    )

    // Execute with circuit breaker protection
    return circuitBreaker.execute(async () => {
      // Execute with retry logic
      const retryManager = options.retryConfig 
        ? new RetryManager({ ...DEFAULT_RETRY_CONFIG, ...options.retryConfig })
        : this.retryManager

      return retryManager.execute(operation, {
        operationName: options.operationName,
        metadata: options.metadata
      })
    })
  }

  private getCircuitBreaker(key: string): CircuitBreaker {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker())
    }
    return this.circuitBreakers.get(key)!
  }

  // Get circuit breaker status
  getCircuitBreakerStatus(key: string): 'closed' | 'open' | 'half-open' | undefined {
    return this.circuitBreakers.get(key)?.getState()
  }

  // Reset a specific circuit breaker
  resetCircuitBreaker(key: string): void {
    this.circuitBreakers.get(key)?.reset()
  }

  // Reset all circuit breakers
  resetAllCircuitBreakers(): void {
    this.circuitBreakers.forEach(cb => cb.reset())
  }
}

// Global error handler instance
export const firebaseErrorHandler = new FirebaseErrorHandler()

// Convenience function for wrapping Firebase operations
export async function withFirebaseErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  options?: {
    circuitBreakerKey?: string
    metadata?: Record<string, any>
    retryConfig?: Partial<RetryConfig>
  }
): Promise<T> {
  return firebaseErrorHandler.executeWithProtection(operation, {
    operationName,
    ...options
  })
}