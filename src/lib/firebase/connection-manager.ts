/**
 * Connection Manager for optimizing Firebase real-time subscriptions
 * Prevents memory leaks and reduces simultaneous connections
 */

import { Unsubscribe } from 'firebase/firestore'

export class ConnectionManager {
    private connections = new Map<string, Unsubscribe>()
    private connectionCount = 0
    private maxConnections = 10 // Reasonable limit for mobile performance

    /**
     * Subscribe to a real-time listener with automatic cleanup
     */
    subscribe(key: string, subscriptionFactory: () => Unsubscribe): void {
        // Cleanup existing connection for this key
        this.unsubscribe(key)

        // Check connection limit
        if (this.connectionCount >= this.maxConnections) {
            console.warn(`[ConnectionManager] Max connections (${this.maxConnections}) reached. Consider unsubscribing unused listeners.`)
            this.cleanupOldestConnection()
        }

        // Create new subscription
        const unsubscribe = subscriptionFactory()
        this.connections.set(key, unsubscribe)
        this.connectionCount++

        console.debug(`[ConnectionManager] Subscribed to ${key}. Active connections: ${this.connectionCount}`)
    }

    /**
     * Unsubscribe from a specific listener
     */
    unsubscribe(key: string): boolean {
        const unsubscribe = this.connections.get(key)
        if (unsubscribe) {
            unsubscribe()
            this.connections.delete(key)
            this.connectionCount--
            console.debug(`[ConnectionManager] Unsubscribed from ${key}. Active connections: ${this.connectionCount}`)
            return true
        }
        return false
    }

    /**
     * Unsubscribe from multiple listeners by pattern
     */
    unsubscribePattern(pattern: string): number {
        let unsubscribed = 0
        for (const [key] of this.connections) {
            if (key.includes(pattern)) {
                this.unsubscribe(key)
                unsubscribed++
            }
        }
        return unsubscribed
    }

    /**
     * Cleanup the oldest connection when limit is reached
     */
    private cleanupOldestConnection(): void {
        const firstKey = this.connections.keys().next().value
        if (firstKey) {
            console.warn(`[ConnectionManager] Cleaning up oldest connection: ${firstKey}`)
            this.unsubscribe(firstKey)
        }
    }

    /**
     * Unsubscribe from all connections
     */
    unsubscribeAll(): void {
        console.debug(`[ConnectionManager] Cleaning up all ${this.connectionCount} connections`)
        for (const [key, unsubscribe] of this.connections) {
            unsubscribe()
            console.debug(`[ConnectionManager] Cleaned up ${key}`)
        }
        this.connections.clear()
        this.connectionCount = 0
    }

    /**
     * Get current connection statistics
     */
    getStats(): { activeConnections: number; maxConnections: number; connections: string[] } {
        return {
            activeConnections: this.connectionCount,
            maxConnections: this.maxConnections,
            connections: Array.from(this.connections.keys())
        }
    }

    /**
     * Set maximum number of concurrent connections
     */
    setMaxConnections(limit: number): void {
        this.maxConnections = Math.max(1, limit)
        
        // Cleanup excess connections if new limit is lower
        while (this.connectionCount > this.maxConnections) {
            this.cleanupOldestConnection()
        }
    }
}

// Global connection manager instance
export const connectionManager = new ConnectionManager()

// Cleanup connections when page unloads
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        connectionManager.unsubscribeAll()
    })
}