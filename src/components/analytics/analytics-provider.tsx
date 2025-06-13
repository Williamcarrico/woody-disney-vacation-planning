"use client"

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { analyticsService } from '@/lib/analytics/analytics-service'
import { usePageTracking, useEngagementTracking, useErrorTracking } from '@/lib/analytics/analytics-hooks'

interface AnalyticsContextType {
    trackEvent: (eventName: string, parameters?: Record<string, any>) => void
    trackPageView: (page: string, title?: string) => void
    trackUserAction: (action: string, category: string, label?: string, value?: number) => void
    trackFeatureUsage: (feature: string, context?: string) => void
    trackConversion: (type: string, value?: number, transactionId?: string) => void
    trackError: (error: Error, context?: string) => void
    setUserProperties: (properties: Record<string, any>) => void
    setUserId: (userId: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

interface AnalyticsProviderProps {
    children: ReactNode
    userId?: string
    userProperties?: Record<string, any>
    enableAutoTracking?: boolean
    debugMode?: boolean
}

export function AnalyticsProvider({
    children,
    userId,
    userProperties,
    enableAutoTracking = true,
    debugMode = false
}: AnalyticsProviderProps) {
    const pathname = usePathname()

    // Auto-tracking hooks
    usePageTracking()
    useEngagementTracking()
    useErrorTracking()

    // Initialize user data
    useEffect(() => {
        if (userId) {
            analyticsService.setUserId(userId)
        }
    }, [userId])

    useEffect(() => {
        if (userProperties) {
            analyticsService.setUserProperties(userProperties)
        }
    }, [userProperties])

    // Track session start
    useEffect(() => {
        analyticsService.trackEngagement({
            engagementType: 'session_start'
        })

        // Track initial feature discovery
        const features = [
            'vacation_planning',
            'itinerary_builder',
            'dining_reservations',
            'wait_times',
            'budget_tracker'
        ]

        features.forEach(feature => {
            analyticsService.trackEngagement({
                engagementType: 'feature_discovery',
                feature
            })
        })
    }, [])

    // Debug logging
    useEffect(() => {
        if (debugMode) {
            console.log('[Analytics] Provider initialized', {
                pathname,
                userId,
                userProperties,
                enableAutoTracking
            })
        }
    }, [pathname, userId, userProperties, enableAutoTracking, debugMode])

    const contextValue: AnalyticsContextType = {
        trackEvent: (eventName: string, parameters?: Record<string, any>) => {
            analyticsService.logEvent(eventName, parameters)
            if (debugMode) {
                console.log('[Analytics] Event tracked:', eventName, parameters)
            }
        },

        trackPageView: (page: string, title?: string) => {
            analyticsService.trackPageView({
                page_title: title || document.title,
                page_location: window.location.href
            })
            if (debugMode) {
                console.log('[Analytics] Page view tracked:', page, title)
            }
        },

        trackUserAction: (action: string, category: string, label?: string, value?: number) => {
            analyticsService.logEvent('user_action', {
                event_category: category,
                event_label: label,
                action_name: action,
                value
            })
            if (debugMode) {
                console.log('[Analytics] User action tracked:', { action, category, label, value })
            }
        },

        trackFeatureUsage: (feature: string, context?: string) => {
            analyticsService.logEvent('feature_used', {
                event_category: 'features',
                feature_name: feature,
                usage_context: context
            })
            if (debugMode) {
                console.log('[Analytics] Feature usage tracked:', feature, context)
            }
        },

        trackConversion: (type: string, value?: number, transactionId?: string) => {
            analyticsService.logEvent('conversion', {
                event_category: 'conversions',
                conversion_type: type,
                value,
                transaction_id: transactionId
            })
            if (debugMode) {
                console.log('[Analytics] Conversion tracked:', { type, value, transactionId })
            }
        },

        trackError: (error: Error, context?: string) => {
            analyticsService.trackError({
                errorType: 'javascript',
                errorMessage: error.message,
                page: pathname,
                action: context,
                severity: 'medium'
            })
            if (debugMode) {
                console.log('[Analytics] Error tracked:', error.message, context)
            }
        },

        setUserProperties: (properties: Record<string, any>) => {
            analyticsService.setUserProperties(properties)
            if (debugMode) {
                console.log('[Analytics] User properties set:', properties)
            }
        },

        setUserId: (userId: string) => {
            analyticsService.setUserId(userId)
            if (debugMode) {
                console.log('[Analytics] User ID set:', userId)
            }
        }
    }

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {children}
        </AnalyticsContext.Provider>
    )
}

export function useAnalytics(): AnalyticsContextType {
    const context = useContext(AnalyticsContext)
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider')
    }
    return context
}

// Higher-order component for automatic component tracking
export function withAnalytics<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName: string
) {
    const WithAnalyticsComponent = (props: P) => {
        const analytics = useAnalytics()

        useEffect(() => {
            analytics.trackFeatureUsage('component_viewed', componentName)
        }, [analytics])

        return <WrappedComponent {...props} />
    }

    WithAnalyticsComponent.displayName = `withAnalytics(${componentName})`
    return WithAnalyticsComponent
}

// Hook for component-specific analytics
export function useComponentAnalytics(componentName: string) {
    const analytics = useAnalytics()

    useEffect(() => {
        analytics.trackFeatureUsage('component_mounted', componentName)
    }, [analytics, componentName])

    return {
        trackComponentAction: (action: string, value?: number) => {
            analytics.trackUserAction(action, 'component', componentName, value)
        },
        trackComponentError: (error: Error) => {
            analytics.trackError(error, `component_${componentName}`)
        },
        trackComponentFeature: (feature: string) => {
            analytics.trackFeatureUsage(feature, componentName)
        }
    }
}