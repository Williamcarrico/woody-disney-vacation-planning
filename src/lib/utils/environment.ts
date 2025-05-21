/**
 * Utility functions for environment detection and conditional imports
 */

/**
 * Checks if code is running in Edge runtime
 */
export const isEdgeRuntime = () => {
    try {
        // Check for Edge runtime by examining available env variables
        return typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge'
    } catch (e) {
        // If process is not defined, we're in Edge runtime
        return true
    }
}

/**
 * Safely imports a module only in Node.js environment
 * Returns a mock or alternative implementation in Edge runtime
 */
export const safeNodeImport = <T>(
    nodeModule: () => T,
    edgeFallback: T
): T => {
    if (isEdgeRuntime()) {
        return edgeFallback
    }

    try {
        return nodeModule()
    } catch (error) {
        console.warn(`Failed to import Node.js module, using fallback:`, error)
        return edgeFallback
    }
}

/**
 * Mock implementation of logging utils for Edge runtime
 */
export const createEdgeLogger = (name: string) => {
    return {
        info: (message: string, ...args: any[]) =>
            console.log(`[INFO] [${name}]`, message, ...args),
        error: (message: string, ...args: any[]) =>
            console.error(`[ERROR] [${name}]`, message, ...args),
        warn: (message: string, ...args: any[]) =>
            console.warn(`[WARN] [${name}]`, message, ...args),
        debug: (message: string, ...args: any[]) =>
            console.debug(`[DEBUG] [${name}]`, message, ...args)
    }
}