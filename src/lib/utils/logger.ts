import { safeNodeImport, createEdgeLogger, isEdgeRuntime } from './environment'

/**
 * Create a logger instance that works in both Node.js and Edge runtime
 */
export const createLogger = (name: string) => {
    // If we're in Edge runtime, always use the Edge logger
    if (isEdgeRuntime()) {
        return createEdgeLogger(name)
    }

    // Safely import the google-logging-utils only in Node.js environment
    return safeNodeImport(
        () => {
            try {
                // Dynamic import to avoid issues with Edge runtime
                // Do not use require for better module compatibility
                const googleLoggingUtils = require('google-logging-utils')
                return googleLoggingUtils.createLogger(name)
            } catch (e) {
                console.warn(`Failed to load Google logging utils: ${e.message}`)
                // Fallback to simple logger if import fails
                return {
                    info: (message: string, ...args: any[]) => console.log(`[INFO] [${name}]`, message, ...args),
                    error: (message: string, ...args: any[]) => console.error(`[ERROR] [${name}]`, message, ...args),
                    warn: (message: string, ...args: any[]) => console.warn(`[WARN] [${name}]`, message, ...args),
                    debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] [${name}]`, message, ...args)
                }
            }
        },
        // Fallback implementation for Edge runtime
        createEdgeLogger(name)
    )
}

// Export a default logger for general use
export const logger = createLogger('app')