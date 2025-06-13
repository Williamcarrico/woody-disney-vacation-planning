/**
 * React hooks for analytics tracking
 */

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { analyticsService, analytics } from './analytics-service'

/**
 * Track page views automatically
 */
export function usePageTracking() {
    const pathname = usePathname()
    const previousPathname = useRef<string>()

    useEffect(() => {
        if (pathname !== previousPathname.current) {
            analytics.pageView(pathname)
            previousPathname.current = pathname
        }
    }, [pathname])
}

/**
 * Track user engagement time on page
 */
export function useEngagementTracking() {
    const startTime = useRef<number>()
    const isVisible = useRef<boolean>(true)
    const totalEngagementTime = useRef<number>(0)

    useEffect(() => {
        startTime.current = Date.now()

        const handleVisibilityChange = () => {
            const now = Date.now()
            
            if (document.hidden) {
                // Page became hidden - pause timer
                if (startTime.current && isVisible.current) {
                    totalEngagementTime.current += now - startTime.current
                }
                isVisible.current = false
            } else {
                // Page became visible - restart timer
                startTime.current = now
                isVisible.current = true
            }
        }

        const handleBeforeUnload = () => {
            const now = Date.now()
            if (startTime.current && isVisible.current) {
                totalEngagementTime.current += now - startTime.current
            }

            // Track final engagement time
            analyticsService.trackEngagement({
                engagementType: 'session_end',
                sessionDuration: Math.round(totalEngagementTime.current / 1000)
            })
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
            
            // Track engagement when component unmounts
            const now = Date.now()
            if (startTime.current && isVisible.current) {
                totalEngagementTime.current += now - startTime.current
            }
        }
    }, [])

    return {
        getEngagementTime: () => totalEngagementTime.current
    }
}

/**
 * Track component performance
 */
export function usePerformanceTracking(componentName: string) {
    const renderStart = useRef<number>()
    const mountTime = useRef<number>()

    useEffect(() => {
        renderStart.current = performance.now()
        
        // Track mount time on next tick
        const timeoutId = setTimeout(() => {
            if (renderStart.current) {
                mountTime.current = performance.now() - renderStart.current
                analyticsService.trackPerformance({
                    metricType: 'component_render',
                    duration: mountTime.current,
                    component: componentName
                })
            }
        }, 0)

        return () => clearTimeout(timeoutId)
    }, [componentName])

    const trackAction = useCallback((action: string) => {
        const actionStart = performance.now()
        
        return () => {
            const actionDuration = performance.now() - actionStart
            analyticsService.trackPerformance({
                metricType: 'user_action',
                duration: actionDuration,
                component: componentName,
                action
            })
        }
    }, [componentName])

    return {
        trackAction,
        getMountTime: () => mountTime.current
    }
}

/**
 * Track feature usage with automatic timing
 */
export function useFeatureTracking(featureName: string) {
    const featureStart = useRef<number>()
    const usageCount = useRef<number>(0)

    const startFeature = useCallback((context?: string) => {
        featureStart.current = Date.now()
        usageCount.current++
        
        analyticsService.trackRealtimeFeatureUsage({
            feature: featureName as any,
            action: 'used',
            context
        })
    }, [featureName])

    const endFeature = useCallback((success: boolean = true) => {
        if (featureStart.current) {
            const duration = Date.now() - featureStart.current
            
            analyticsService.trackPerformance({
                metricType: 'user_action',
                duration,
                action: `${featureName}_${success ? 'completed' : 'abandoned'}`
            })
            
            featureStart.current = undefined
        }
    }, [featureName])

    return {
        startFeature,
        endFeature,
        getUsageCount: () => usageCount.current
    }
}

/**
 * Track form interactions and conversions
 */
export function useFormTracking(formName: string) {
    const formStart = useRef<number>()
    const fieldInteractions = useRef<Record<string, number>>({})

    const startForm = useCallback(() => {
        formStart.current = Date.now()
        analytics.featureUsed('form_started', formName)
    }, [formName])

    const trackFieldInteraction = useCallback((fieldName: string) => {
        fieldInteractions.current[fieldName] = (fieldInteractions.current[fieldName] || 0) + 1
        analytics.userAction('field_interaction', 'form', `${formName}_${fieldName}`)
    }, [formName])

    const trackFormSubmission = useCallback((success: boolean, errorMessage?: string) => {
        const duration = formStart.current ? Date.now() - formStart.current : 0
        
        if (success) {
            analytics.conversion('form_submission', 1, formName)
            analyticsService.trackEngagement({
                engagementType: 'task_completion',
                task: `form_${formName}`,
                sessionDuration: Math.round(duration / 1000)
            })
        } else {
            analyticsService.trackError({
                errorType: 'user_action',
                errorMessage: errorMessage || 'Form submission failed',
                page: formName,
                action: 'form_submit',
                severity: 'medium'
            })
        }

        analyticsService.trackPerformance({
            metricType: 'user_action',
            duration,
            action: `form_${success ? 'completed' : 'failed'}`,
            page: formName
        })
    }, [formName])

    const trackFormAbandonment = useCallback((lastField?: string) => {
        const duration = formStart.current ? Date.now() - formStart.current : 0
        
        analytics.userAction('form_abandoned', 'form', `${formName}_${lastField || 'unknown'}`)
        
        analyticsService.trackPerformance({
            metricType: 'user_action',
            duration,
            action: 'form_abandoned',
            page: formName
        })
    }, [formName])

    return {
        startForm,
        trackFieldInteraction,
        trackFormSubmission,
        trackFormAbandonment,
        getFieldInteractions: () => fieldInteractions.current
    }
}

/**
 * Track search behavior
 */
export function useSearchTracking() {
    const searchStart = useRef<number>()
    const currentQuery = useRef<string>()

    const trackSearch = useCallback((
        query: string,
        category: 'attractions' | 'restaurants' | 'resorts' | 'general',
        resultsCount: number
    ) => {
        searchStart.current = Date.now()
        currentQuery.current = query
        
        analyticsService.trackSearch({
            searchTerm: query,
            searchCategory: category,
            resultsCount
        })
    }, [])

    const trackSearchResult = useCallback((selectedIndex: number, resultId?: string) => {
        if (currentQuery.current) {
            const searchDuration = searchStart.current ? Date.now() - searchStart.current : 0
            
            analyticsService.trackSearch({
                searchTerm: currentQuery.current,
                searchCategory: 'general',
                resultsCount: 0, // Not relevant for result selection
                selectedResultIndex: selectedIndex
            })

            analyticsService.trackPerformance({
                metricType: 'user_action',
                duration: searchDuration,
                action: 'search_result_selected'
            })

            analytics.userAction('search_result_clicked', 'search', `${currentQuery.current}_${selectedIndex}`)
        }
    }, [])

    const trackSearchRefinement = useCallback((refinementType: 'filter' | 'sort' | 'new_query') => {
        analytics.userAction('search_refined', 'search', refinementType)
    }, [])

    return {
        trackSearch,
        trackSearchResult,
        trackSearchRefinement
    }
}

/**
 * Track Disney-specific interactions
 */
export function useDisneyTracking() {
    const trackAttraction = useCallback((
        attractionId: string,
        attractionName: string,
        parkId: string,
        action: 'view' | 'favorite' | 'add_to_itinerary' | 'remove_from_itinerary',
        waitTime?: number
    ) => {
        analyticsService.trackAttractionInteraction({
            attractionId,
            attractionName,
            parkId,
            action,
            waitTime
        })
    }, [])

    const trackDining = useCallback((
        restaurantId: string,
        restaurantName: string,
        parkId: string | undefined,
        reservationDate: string,
        partySize: number,
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
        status: 'attempted' | 'successful' | 'failed'
    ) => {
        analyticsService.trackDiningReservation({
            restaurantId,
            restaurantName,
            parkId,
            reservationDate,
            partySize,
            mealType,
            status
        })
    }, [])

    const trackVacation = useCallback((
        destination: string,
        partySize: number,
        startDate: string,
        endDate: string,
        planningStyle?: 'guided' | 'manual'
    ) => {
        analyticsService.trackVacationPlanningStarted({
            destination,
            partySize,
            startDate,
            endDate,
            planningStyle
        })
    }, [])

    const trackBudget = useCallback((
        totalBudget: number,
        budgetCategories: Record<string, number>,
        partySize: number,
        tripDuration: number
    ) => {
        analyticsService.trackBudgetPlanning({
            totalBudget,
            budgetCategories,
            partySize,
            tripDuration
        })
    }, [])

    const trackItinerary = useCallback((
        optimizationType: 'manual' | 'ai_suggested' | 'template',
        parkId: string,
        activitiesCount: number,
        totalWalkingTime?: number,
        conflictsResolved?: number
    ) => {
        analyticsService.trackItineraryOptimization({
            optimizationType,
            parkId,
            activitiesCount,
            totalWalkingTime,
            conflictsResolved
        })
    }, [])

    return {
        trackAttraction,
        trackDining,
        trackVacation,
        trackBudget,
        trackItinerary
    }
}

/**
 * Track errors automatically
 */
export function useErrorTracking() {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            analyticsService.trackError({
                errorType: 'javascript',
                errorMessage: event.message,
                page: window.location.pathname,
                severity: 'high'
            })
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            analyticsService.trackError({
                errorType: 'javascript',
                errorMessage: event.reason?.toString() || 'Unhandled promise rejection',
                page: window.location.pathname,
                severity: 'medium'
            })
        }

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        return () => {
            window.removeEventListener('error', handleError)
            window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
    }, [])

    const trackCustomError = useCallback((
        errorType: 'network' | 'firebase' | 'user_action',
        errorMessage: string,
        errorCode?: string,
        action?: string,
        severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ) => {
        analyticsService.trackError({
            errorType,
            errorMessage,
            errorCode,
            page: window.location.pathname,
            action,
            severity
        })
    }, [])

    return { trackCustomError }
}