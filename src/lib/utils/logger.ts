import { safeNodeImport, createEdgeLogger, isEdgeRuntime } from './environment'

// Define a consistent logger interface
interface Logger {
    info: (message: string, ...args: unknown[]) => void
    error: (message: string, ...args: unknown[]) => void
    warn: (message: string, ...args: unknown[]) => void
    debug: (message: string, ...args: unknown[]) => void
}

/**
 * Create a simple fallback logger implementation
 */
const createFallbackLogger = (name: string): Logger => ({
    info: (message: string, ...args: unknown[]) => console.log(`[INFO] [${name}]`, message, ...args),
    error: (message: string, ...args: unknown[]) => console.error(`[ERROR] [${name}]`, message, ...args),
    warn: (message: string, ...args: unknown[]) => console.warn(`[WARN] [${name}]`, message, ...args),
    debug: (message: string, ...args: unknown[]) => console.debug(`[DEBUG] [${name}]`, message, ...args)
})

/**
 * Attempt to load google-logging-utils in a Node.js environment
 */
const createGoogleLogger = (name: string): Logger => {
    try {
        // Only attempt to load in Node.js environment
        if (typeof require === 'undefined') {
            throw new Error('require is not available')
        }

        // Use require directly since we're in Node.js
        const googleLoggingUtils = require('google-logging-utils')

        // Try different possible export structures
        const createLoggerFn = googleLoggingUtils.createLogger ||
            googleLoggingUtils.default?.createLogger ||
            googleLoggingUtils.default

        if (typeof createLoggerFn === 'function') {
            return createLoggerFn(name)
        }

        throw new Error('createLogger function not found in google-logging-utils')
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.warn(`Failed to load Google logging utils: ${errorMessage}`)
        return createFallbackLogger(name)
    }
}

/**
 * Create a logger instance that works in both Node.js and Edge runtime
 */
export const createLogger = (name: string): Logger => {
    // If we're in Edge runtime, always use the Edge logger
    if (isEdgeRuntime()) {
        return createEdgeLogger(name)
    }

    // Safely import the google-logging-utils only in Node.js environment
    return safeNodeImport(
        () => createGoogleLogger(name),
        // Fallback implementation for Edge runtime
        createEdgeLogger(name)
    )
}

// Export a default logger for general use
export const logger = createLogger('app')