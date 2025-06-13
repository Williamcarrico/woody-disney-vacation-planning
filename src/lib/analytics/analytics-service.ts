/**
 * Comprehensive Analytics Service for Disney Vacation Planning App
 * Tracks user behavior, performance metrics, and business insights
 */

import { getAnalytics, logEvent, setUserProperties, setUserId, Analytics } from 'firebase/analytics'
import { app } from '@/lib/firebase/config'

interface UserProperties {
    favoriteParks?: string[]
    planningStyle?: 'detailed' | 'flexible' | 'spontaneous'
    partySize?: number
    visitFrequency?: 'first-time' | 'occasional' | 'frequent' | 'annual-passholder'
    preferredDiningStyle?: 'quick-service' | 'table-service' | 'character-dining' | 'mixed'
    budgetRange?: 'budget' | 'moderate' | 'deluxe' | 'luxury'
    userSegment?: 'family' | 'couple' | 'solo' | 'group'
}

interface PageViewData {
    page_title: string
    page_location: string
    engagement_time_msec?: number
    custom_parameters?: Record<string, any>
}

interface CustomEventData {
    event_category?: string
    event_label?: string
    value?: number
    custom_parameters?: Record<string, any>
}

class AnalyticsService {
    private analytics: Analytics | null = null
    private isInitialized = false
    private eventQueue: Array<{ name: string; parameters: any }> = []

    constructor() {
        this.initialize()
    }

    /**
     * Initialize Firebase Analytics
     */
    private async initialize(): Promise<void> {
        try {
            if (typeof window !== 'undefined' && !this.isInitialized) {
                this.analytics = getAnalytics(app)
                this.isInitialized = true
                
                // Process queued events
                this.eventQueue.forEach(({ name, parameters }) => {
                    this.logEvent(name, parameters)
                })
                this.eventQueue = []
                
                console.log('[Analytics] Initialized successfully')
            }
        } catch (error) {
            console.error('[Analytics] Initialization failed:', error)
        }
    }

    /**
     * Log a custom event
     */
    logEvent(eventName: string, parameters: CustomEventData = {}): void {
        if (!this.isInitialized || !this.analytics) {
            // Queue event if analytics not ready
            this.eventQueue.push({ name: eventName, parameters })
            return
        }

        try {
            logEvent(this.analytics, eventName, {
                ...parameters,
                timestamp: Date.now(),
                user_agent: navigator.userAgent,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`
            })
        } catch (error) {
            console.error('[Analytics] Failed to log event:', eventName, error)
        }
    }

    /**
     * Track page views
     */
    trackPageView(data: PageViewData): void {
        this.logEvent('page_view', {
            page_title: data.page_title,
            page_location: data.page_location,
            engagement_time_msec: data.engagement_time_msec,
            ...data.custom_parameters
        })
    }

    /**
     * Set user properties for segmentation
     */
    setUserProperties(properties: UserProperties): void {
        if (!this.isInitialized || !this.analytics) return

        try {
            setUserProperties(this.analytics, properties)
        } catch (error) {
            console.error('[Analytics] Failed to set user properties:', error)
        }
    }

    /**
     * Set user ID for cross-device tracking
     */
    setUserId(userId: string): void {
        if (!this.isInitialized || !this.analytics) return

        try {
            setUserId(this.analytics, userId)
        } catch (error) {
            console.error('[Analytics] Failed to set user ID:', error)
        }
    }

    // Disney Vacation Planning Specific Events

    /**
     * Track vacation planning started
     */
    trackVacationPlanningStarted(data: {
        destination: string
        partySize: number
        startDate: string
        endDate: string
        planningStyle?: 'guided' | 'manual'
    }): void {
        this.logEvent('vacation_planning_started', {
            event_category: 'vacation_planning',
            destination: data.destination,
            party_size: data.partySize,
            trip_duration: this.calculateDaysDifference(data.startDate, data.endDate),
            planning_style: data.planningStyle || 'manual',
            value: data.partySize
        })
    }

    /**
     * Track attraction interactions
     */
    trackAttractionInteraction(data: {
        attractionId: string
        attractionName: string
        parkId: string
        action: 'view' | 'favorite' | 'add_to_itinerary' | 'remove_from_itinerary'
        waitTime?: number
    }): void {
        this.logEvent('attraction_interaction', {
            event_category: 'attractions',
            attraction_id: data.attractionId,
            attraction_name: data.attractionName,
            park_id: data.parkId,
            interaction_type: data.action,
            wait_time_minutes: data.waitTime,
            event_label: `${data.parkId}_${data.attractionId}`
        })
    }

    /**
     * Track dining reservations
     */
    trackDiningReservation(data: {
        restaurantId: string
        restaurantName: string
        parkId?: string
        reservationDate: string
        partySize: number
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
        status: 'attempted' | 'successful' | 'failed'
    }): void {
        this.logEvent('dining_reservation', {
            event_category: 'dining',
            restaurant_id: data.restaurantId,
            restaurant_name: data.restaurantName,
            park_id: data.parkId,
            reservation_date: data.reservationDate,
            party_size: data.partySize,
            meal_type: data.mealType,
            reservation_status: data.status,
            value: data.partySize
        })
    }

    /**
     * Track budget planning
     */
    trackBudgetPlanning(data: {
        totalBudget: number
        budgetCategories: Record<string, number>
        partySize: number
        tripDuration: number
    }): void {
        this.logEvent('budget_planning', {
            event_category: 'budget',
            total_budget: data.totalBudget,
            budget_per_person: Math.round(data.totalBudget / data.partySize),
            budget_per_day: Math.round(data.totalBudget / data.tripDuration),
            accommodation_budget: data.budgetCategories.accommodation,
            food_budget: data.budgetCategories.food,
            tickets_budget: data.budgetCategories.tickets,
            extras_budget: data.budgetCategories.extras,
            value: data.totalBudget
        })
    }

    /**
     * Track itinerary optimization
     */
    trackItineraryOptimization(data: {
        optimizationType: 'manual' | 'ai_suggested' | 'template'
        parkId: string
        activitiesCount: number
        totalWalkingTime?: number
        conflictsResolved?: number
    }): void {
        this.logEvent('itinerary_optimization', {
            event_category: 'itinerary',
            optimization_type: data.optimizationType,
            park_id: data.parkId,
            activities_count: data.activitiesCount,
            walking_time_minutes: data.totalWalkingTime,
            conflicts_resolved: data.conflictsResolved,
            value: data.activitiesCount
        })
    }

    /**
     * Track real-time features usage
     */
    trackRealtimeFeatureUsage(data: {
        feature: 'wait_times' | 'location_sharing' | 'group_messaging' | 'live_updates'
        action: 'enabled' | 'disabled' | 'used'
        context?: string
    }): void {
        this.logEvent('realtime_feature_usage', {
            event_category: 'realtime',
            feature_name: data.feature,
            feature_action: data.action,
            usage_context: data.context
        })
    }

    /**
     * Track social sharing
     */
    trackSocialSharing(data: {
        contentType: 'itinerary' | 'photo' | 'achievement' | 'vacation'
        platform: 'facebook' | 'twitter' | 'instagram' | 'link' | 'message'
        contentId?: string
    }): void {
        this.logEvent('share', {
            event_category: 'social',
            content_type: data.contentType,
            platform: data.platform,
            content_id: data.contentId,
            method: data.platform
        })
    }

    /**
     * Track search behavior
     */
    trackSearch(data: {
        searchTerm: string
        searchCategory: 'attractions' | 'restaurants' | 'resorts' | 'general'
        resultsCount: number
        selectedResultIndex?: number
    }): void {
        this.logEvent('search', {
            event_category: 'search',
            search_term: data.searchTerm,
            search_category: data.searchCategory,
            results_count: data.resultsCount,
            selected_result_index: data.selectedResultIndex
        })
    }

    /**
     * Track user engagement metrics
     */
    trackEngagement(data: {
        engagementType: 'session_start' | 'session_end' | 'feature_discovery' | 'task_completion'
        sessionDuration?: number
        pagesViewed?: number
        actionsPerformed?: number
        feature?: string
        task?: string
    }): void {
        this.logEvent('engagement', {
            event_category: 'engagement',
            engagement_type: data.engagementType,
            session_duration_seconds: data.sessionDuration,
            pages_viewed: data.pagesViewed,
            actions_performed: data.actionsPerformed,
            discovered_feature: data.feature,
            completed_task: data.task,
            value: data.sessionDuration || data.actionsPerformed || 1
        })
    }

    /**
     * Track errors and performance issues
     */
    trackError(data: {
        errorType: 'javascript' | 'network' | 'firebase' | 'user_action'
        errorMessage: string
        errorCode?: string
        page?: string
        action?: string
        severity: 'low' | 'medium' | 'high' | 'critical'
    }): void {
        this.logEvent('error_occurred', {
            event_category: 'errors',
            error_type: data.errorType,
            error_message: data.errorMessage,
            error_code: data.errorCode,
            error_page: data.page,
            error_action: data.action,
            error_severity: data.severity
        })
    }

    /**
     * Track performance metrics
     */
    trackPerformance(data: {
        metricType: 'page_load' | 'api_response' | 'component_render' | 'user_action'
        duration: number
        page?: string
        component?: string
        action?: string
    }): void {
        this.logEvent('performance_metric', {
            event_category: 'performance',
            metric_type: data.metricType,
            duration_ms: data.duration,
            performance_page: data.page,
            performance_component: data.component,
            performance_action: data.action,
            value: data.duration
        })
    }

    /**
     * Helper method to calculate days difference
     */
    private calculateDaysDifference(startDate: string, endDate: string): number {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
}

// Create singleton instance
export const analyticsService = new AnalyticsService()

// Convenience functions for common events
export const analytics = {
    // Page tracking
    pageView: (page: string, title?: string) => {
        analyticsService.trackPageView({
            page_title: title || document.title,
            page_location: window.location.href
        })
    },

    // User actions
    userAction: (action: string, category: string, label?: string, value?: number) => {
        analyticsService.logEvent('user_action', {
            event_category: category,
            event_label: label,
            action_name: action,
            value
        })
    },

    // Feature usage
    featureUsed: (feature: string, context?: string) => {
        analyticsService.logEvent('feature_used', {
            event_category: 'features',
            feature_name: feature,
            usage_context: context
        })
    },

    // Conversion tracking
    conversion: (type: string, value?: number, transactionId?: string) => {
        analyticsService.logEvent('conversion', {
            event_category: 'conversions',
            conversion_type: type,
            value,
            transaction_id: transactionId
        })
    }
}

// Export for direct use
export { analyticsService }