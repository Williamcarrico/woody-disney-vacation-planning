// src/engines/itinerary/optimizer.ts
import { getParkLiveData, getParkAttractions, getParkSchedule } from '@/lib/api/themeParks';
import { useWaitTimePrediction } from '@/hooks/useWaitTimePredictor';
import type {
    Attraction,
    Park,
    Itinerary,
    ItineraryItem,
    LiveData,
    ScheduleData
} from '@/types/api';

/**
 * Itinerary Optimization Engine
 *
 * This module provides a sophisticated algorithm to generate optimized Disney park itineraries
 * based on real-time wait data, user preferences, and historical trends.
 *
 * The optimizer uses a combination of:
 * - Constraint-based filtering
 * - Weighted scoring
 * - Multi-pass heuristic search
 * - Temporal adaptation for changing conditions
 */

// Types specific to the optimization engine
interface OptimizationParameters {
    // Park and date parameters
    parkId: string;
    date: string;
    startTime?: string; // ISO time string
    endTime?: string; // ISO time string

    // Party parameters
    partySize: number;
    hasChildren: boolean;
    childrenAges?: number[];
    hasStroller?: boolean;
    mobilityConsiderations?: boolean;

    // Preference parameters
    preferences: {
        priorityAttractions?: string[]; // Must-do attractions
        excludedAttractions?: string[]; // Skip these attractions
        ridePreference?: 'thrill' | 'family' | 'all'; // What kind of rides to prioritize
        maxWaitTime?: number; // Maximum acceptable wait time (minutes)
        walkingPace?: 'slow' | 'moderate' | 'fast'; // Walking pace preference
        breakDuration?: number; // Total break time in minutes
        lunchTime?: string; // Preferred lunch time (ISO time string)
        dinnerTime?: string; // Preferred dinner time (ISO time string)
    };

    // Advanced parameters
    useGeniePlus?: boolean;
    useIndividualLightningLane?: boolean;
    maxLightningLaneBudget?: number;
    accommodateHeight?: boolean; // Account for height restrictions
    rideRepeats?: boolean; // Allow repeat rides on favorites
    includeMeetAndGreets?: boolean;
    includeShows?: boolean;
    weatherAdaptation?: boolean; // Adapt for weather conditions
    crowdAvoidance?: boolean; // Prioritize least crowded times
}

interface OptimizationResult {
    itinerary: ItineraryItem[];
    stats: {
        totalAttractions: number;
        expectedWaitTime: number; // Total minutes waiting
        walkingDistance: number; // Approximate kilometers
        startTime: string; // ISO time string
        endTime: string; // ISO time string
        coveragePercentage: number; // % of desired attractions covered
        lightningLaneUsage: number; // Number of LL used
        lightningLaneCost?: number; // Total cost if using ILL
    };
    alternatives: {
        morningAlternative?: ItineraryItem[];
        afternoonAlternative?: ItineraryItem[];
        eveningAlternative?: ItineraryItem[];
        rainyDayPlan?: ItineraryItem[];
        lowWaitTimePlan?: ItineraryItem[];
        maxAttractionsPlan?: ItineraryItem[];
    };
}

// Attraction with additional metadata for optimization
interface AttractionWithMetadata extends Attraction {
    currentWaitTime?: number;
    predictedWaitTimes?: Map<string, number>; // Time slot -> predicted wait time
    duration: number; // Experience duration in minutes
    walkingTimeMap?: Map<string, number>; // Attraction ID -> walking time in minutes
    score: number; // Calculated priority score
    constraints: string[]; // Applied constraints
    lightning?: {
        available: boolean;
        type: 'GENIE_PLUS' | 'INDIVIDUAL';
        returnTimeWindows?: Array<{ start: string; end: string }>;
        price?: number;
    };
}

/**
 * Park Itinerary Optimizer class
 */
export class ParkItineraryOptimizer {
    private parkId: string;
    private date: string;
    private attractions: AttractionWithMetadata[] = [];
    private liveData: LiveData | null = null;
    private schedule: ScheduleData | null = null;
    private params: OptimizationParameters;
    private waitTimePredictor = useWaitTimePrediction();

    // Walking time estimates between park areas (in minutes)
    private static readonly WALKING_TIMES: Record<string, Record<string, number>> = {
        // Magic Kingdom areas
        "fantasyland": {
            "tomorrowland": 8,
            "liberty_square": 7,
            "frontierland": 10,
            "adventureland": 9,
            "main_street": 8
        },
        "tomorrowland": {
            "fantasyland": 8,
            "liberty_square": 10,
            "frontierland": 12,
            "adventureland": 11,
            "main_street": 8
        },
        // Add other areas and parks...
    };

    constructor(params: OptimizationParameters) {
        this.parkId = params.parkId;
        this.date = params.date;
        this.params = params;
    }

    /**
     * Initialize the optimizer by fetching necessary data
     */
    async initialize(): Promise<void> {
        try {
            // Fetch park attractions
            const attractionsData = await getParkAttractions(this.parkId);

            // Fetch live wait time data
            this.liveData = await getParkLiveData(this.parkId);

            // Fetch park schedule
            this.schedule = await getParkSchedule(this.parkId, this.date, this.date);

            // Initialize attractions with metadata
            this.attractions = attractionsData.map(attraction => {
                const currentWaitTime = this.liveData?.attractions[attraction.id]?.waitTime?.standby || 0;

                // Estimate attraction duration based on type and known data
                let duration = 0;
                switch (attraction.attractionType) {
                    case 'RIDE':
                        duration = attraction.duration || 5;
                        break;
                    case 'SHOW':
                        duration = attraction.duration || 20;
                        break;
                    case 'MEET_AND_GREET':
                        duration = 10;
                        break;
                    case 'PARADE':
                        duration = 25;
                        break;
                    default:
                        duration = 15;
                }

                // Add experience time to duration
                duration += currentWaitTime;

                return {
                    ...attraction,
                    currentWaitTime,
                    duration,
                    score: 0,
                    constraints: [],
                };
            });

            // Calculate walking times between attractions
            this.calculateWalkingTimes();

            // Generate wait time predictions for different times of day
            await this.generateWaitTimePredictions();

            // Apply initial scoring and constraints
            this.scoreAttractions();
            this.applyConstraints();

        } catch (error) {
            console.error("Failed to initialize optimizer:", error);
            throw error;
        }
    }

    /**
     * Calculate approximate walking times between attractions
     */
    private calculateWalkingTimes(): void {
        for (const attraction of this.attractions) {
            attraction.walkingTimeMap = new Map();

            for (const otherAttraction of this.attractions) {
                if (attraction.id === otherAttraction.id) {
                    attraction.walkingTimeMap.set(otherAttraction.id, 0);
                    continue;
                }

                // If we have the areas in our walking time map, use that
                const attractionArea = this.getAttractionArea(attraction);
                const otherAttractionArea = this.getAttractionArea(otherAttraction);

                if (
                    attractionArea &&
                    otherAttractionArea &&
                    ParkItineraryOptimizer.WALKING_TIMES[attractionArea] &&
                    ParkItineraryOptimizer.WALKING_TIMES[attractionArea][otherAttractionArea]
                ) {
                    const baseTime = ParkItineraryOptimizer.WALKING_TIMES[attractionArea][otherAttractionArea];

                    // Adjust for walking pace
                    let paceMultiplier = 1.0;
                    if (this.params.preferences.walkingPace === 'slow') {
                        paceMultiplier = 1.3;
                    } else if (this.params.preferences.walkingPace === 'fast') {
                        paceMultiplier = 0.8;
                    }

                    // Adjust for mobility considerations
                    if (this.params.mobilityConsiderations) {
                        paceMultiplier *= 1.5;
                    }

                    // Adjust for stroller
                    if (this.params.hasStroller) {
                        paceMultiplier *= 1.2;
                    }

                    attraction.walkingTimeMap.set(
                        otherAttraction.id,
                        Math.round(baseTime * paceMultiplier)
                    );
                } else {
                    // Fallback estimation based on distance if available
                    if (attraction.location && otherAttraction.location) {
                        const distanceKm = this.calculateDistance(
                            attraction.location.latitude,
                            attraction.location.longitude,
                            otherAttraction.location.latitude,
                            otherAttraction.location.longitude
                        );

                        // Estimate: 1km takes about 15 minutes to walk in a theme park with crowds
                        let walkingTime = Math.round(distanceKm * 15);

                        // Apply same pace adjustments
                        if (this.params.preferences.walkingPace === 'slow') {
                            walkingTime = Math.round(walkingTime * 1.3);
                        } else if (this.params.preferences.walkingPace === 'fast') {
                            walkingTime = Math.round(walkingTime * 0.8);
                        }

                        if (this.params.mobilityConsiderations) {
                            walkingTime = Math.round(walkingTime * 1.5);
                        }

                        if (this.params.hasStroller) {
                            walkingTime = Math.round(walkingTime * 1.2);
                        }

                        attraction.walkingTimeMap.set(otherAttraction.id, walkingTime);
                    } else {
                        // Default fallback
                        attraction.walkingTimeMap.set(otherAttraction.id, 10);
                    }
                }
            }
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Earth radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Get the area of an attraction based on its location or metadata
     */
    private getAttractionArea(attraction: Attraction): string | null {
        // This is a simplified example
        // In a real implementation, you would use the attraction's coordinates
        // to determine which area it's in, or use tags/metadata

        if (attraction.tags && attraction.tags.length > 0) {
            // Look for area tags like "fantasyland", "tomorrowland", etc.
            const areaTags = attraction.tags.filter(tag =>
                ['fantasyland', 'tomorrowland', 'frontierland', 'adventureland', 'liberty_square', 'main_street'].includes(tag)
            );

            if (areaTags.length > 0) {
                return areaTags[0];
            }
        }

        // Fallback: Try to determine from name or other properties
        const name = attraction.name.toLowerCase();
        if (name.includes("fantasy")) return "fantasyland";
        if (name.includes("tomorrow")) return "tomorrowland";
        if (name.includes("frontier")) return "frontierland";
        if (name.includes("adventure")) return "adventureland";
        if (name.includes("liberty")) return "liberty_square";
        if (name.includes("main street")) return "main_street";

        return null; // Unknown area
    }

    /**
     * Generate wait time predictions for different times of day
     */
    private async generateWaitTimePredictions(): Promise<void> {
        // Define time slots to predict (hourly from park open to close)
        const timeSlots: string[] = [];

        if (this.schedule && this.schedule.schedule.length > 0) {
            const scheduleForDate = this.schedule.schedule.find(s => s.date === this.date);

            if (scheduleForDate) {
                const openingTime = new Date(scheduleForDate.openingTime);
                const closingTime = new Date(scheduleForDate.closingTime);

                // Create time slots every hour
                let currentSlot = new Date(openingTime);
                while (currentSlot < closingTime) {
                    timeSlots.push(currentSlot.toISOString());
                    currentSlot = new Date(currentSlot.setHours(currentSlot.getHours() + 1));
                }
            }
        }

        // If no schedule found, use default time range (9am to 10pm)
        if (timeSlots.length === 0) {
            const dateObject = new Date(this.date);
            for (let hour = 9; hour <= 22; hour++) {
                const timeSlot = new Date(dateObject);
                timeSlot.setHours(hour, 0, 0, 0);
                timeSlots.push(timeSlot.toISOString());
            }
        }

        // Generate predictions for each attraction and time slot
        for (const attraction of this.attractions) {
            attraction.predictedWaitTimes = new Map();

            // Skip predictions for non-rides or attractions without wait times
            if (
                attraction.attractionType !== 'RIDE' ||
                attraction.currentWaitTime === undefined
            ) {
                continue;
            }

            for (const timeSlot of timeSlots) {
                const timeSlotDate = new Date(timeSlot);

                // Use the predictor to get estimated wait time for this slot
                const predictedWait = this.waitTimePredictor.predict(
                    attraction.id,
                    timeSlotDate,
                    attraction.currentWaitTime
                );

                if (predictedWait !== null) {
                    attraction.predictedWaitTimes.set(timeSlot, predictedWait);
                }
            }
        }
    }

    /**
     * Score attractions based on multiple factors
     */
    private scoreAttractions(): void {
        for (const attraction of this.attractions) {
            let score = 50; // Base score

            // Factor 1: Attraction type preference
            if (attraction.attractionType === 'RIDE') {
                // Check ride preference
                if (this.params.preferences.ridePreference === 'thrill') {
                    // Higher score for thrill rides (usually tagged with "thrill" or having height requirements)
                    if (
                        attraction.tags?.includes('thrill') ||
                        attraction.heightRequirement?.min && attraction.heightRequirement.min > 40
                    ) {
                        score += 20;
                    } else {
                        score -= 10;
                    }
                } else if (this.params.preferences.ridePreference === 'family') {
                    // Higher score for family rides (no height requirement or low requirement)
                    if (
                        !attraction.heightRequirement ||
                        (attraction.heightRequirement.min && attraction.heightRequirement.min <= 40)
                    ) {
                        score += 20;
                    } else {
                        score -= 10;
                    }
                }
            } else if (attraction.attractionType === 'SHOW') {
                // Adjust for show preference
                score += this.params.includeShows ? 15 : -30;
            } else if (attraction.attractionType === 'MEET_AND_GREET') {
                // Adjust for meet and greet preference
                score += this.params.includeMeetAndGreets ? 15 : -30;
            }

            // Factor 2: Wait time consideration
            if (attraction.currentWaitTime !== undefined) {
                // Prefer lower wait times, but don't completely dismiss popular attractions
                if (attraction.currentWaitTime <= 15) {
                    score += 15;
                } else if (attraction.currentWaitTime > this.params.preferences.maxWaitTime!) {
                    score -= 25;
                } else if (attraction.currentWaitTime > 60) {
                    score -= 10;
                }
            }

            // Factor 3: Priority attractions (must-do)
            if (this.params.preferences.priorityAttractions?.includes(attraction.id)) {
                score += 50; // Large boost for must-do attractions
            }

            // Factor 4: Excluded attractions
            if (this.params.preferences.excludedAttractions?.includes(attraction.id)) {
                score = -100; // Effectively exclude from consideration
            }

            // Factor 5: Lightning Lane availability
            if (
                (this.params.useGeniePlus || this.params.useIndividualLightningLane) &&
                attraction.lightning?.available
            ) {
                // Bonus for available Lightning Lane options
                if (
                    attraction.lightning.type === 'GENIE_PLUS' &&
                    this.params.useGeniePlus
                ) {
                    score += 10;
                } else if (
                    attraction.lightning.type === 'INDIVIDUAL' &&
                    this.params.useIndividualLightningLane &&
                    (!attraction.lightning.price ||
                        attraction.lightning.price <= (this.params.maxLightningLaneBudget || 0))
                ) {
                    score += 15;
                }
            }

            // Assign the final score
            attraction.score = score;
        }

        // Sort attractions by score (descending)
        this.attractions.sort((a, b) => b.score - a.score);
    }

    /**
     * Apply constraints to attractions
     */
    private applyConstraints(): void {
        for (const attraction of this.attractions) {
            // Skip already excluded attractions
            if (attraction.score <= 0) continue;

            // Constraint 1: Height requirements for children
            if (
                this.params.hasChildren &&
                this.params.childrenAges &&
                this.params.childrenAges.length > 0 &&
                this.params.accommodateHeight &&
                attraction.heightRequirement?.min
            ) {
                // Check if any child is too short for the ride
                const childHeight = this.estimateChildHeight(this.params.childrenAges);
                const minHeight = attraction.heightRequirement.min;

                if (childHeight < minHeight) {
                    attraction.constraints.push('HEIGHT_RESTRICTION');
                    attraction.score -= 80; // Significant penalty but not complete exclusion
                }
            }

            // Constraint 2: Mobility considerations
            if (
                this.params.mobilityConsiderations &&
                attraction.tags?.includes('mobility_challenging')
            ) {
                attraction.constraints.push('MOBILITY_CHALLENGING');
                attraction.score -= 70;
            }

            // Constraint 3: Weather adaptation
            if (
                this.params.weatherAdaptation &&
                attraction.tags?.includes('outdoor') &&
                this.isLikelyToRain() // Hypothetical weather check
            ) {
                attraction.constraints.push('WEATHER_SENSITIVE');
                attraction.score -= 30;
            }
        }

        // Re-sort attractions after applying constraints
        this.attractions.sort((a, b) => b.score - a.score);
    }

    /**
     * Estimate child height based on age (very approximate)
     */
    private estimateChildHeight(ages: number[]): number {
        // Very simple height estimation based on average growth charts
        // In a real implementation, you'd want something more sophisticated
        // or ask for actual heights

        // Find the smallest child's height
        const heights = ages.map(age => {
            if (age <= 2) return 85; // ~34 inches
            if (age <= 4) return 100; // ~40 inches
            if (age <= 6) return 115; // ~45 inches
            if (age <= 8) return 125; // ~49 inches
            if (age <= 10) return 135; // ~53 inches
            return 145; // ~57 inches (older children)
        });

        return Math.min(...heights);
    }

    /**
     * Check if rain is likely (simplified weather prediction)
     */
    private isLikelyToRain(): boolean {
        // In a real implementation, this would call a weather API
        // For now, we'll just use a simple random chance
        return Math.random() < 0.3; // 30% chance of rain
    }

    /**
     * Generate an optimized itinerary
     */
    async generateItinerary(): Promise<OptimizationResult> {
        // Ensure data is initialized
        if (this.attractions.length === 0) {
            await this.initialize();
        }

        // Determine start and end times
        let startTime: Date;
        let endTime: Date;

        if (this.schedule && this.schedule.schedule.length > 0) {
            const scheduleForDate = this.schedule.schedule.find(s => s.date === this.date);

            if (scheduleForDate) {
                startTime = new Date(this.params.startTime || scheduleForDate.openingTime);
                endTime = new Date(this.params.endTime || scheduleForDate.closingTime);
            } else {
                // Default: 9am to 9pm
                startTime = new Date(this.date);
                startTime.setHours(9, 0, 0, 0);
                endTime = new Date(this.date);
                endTime.setHours(21, 0, 0, 0);
            }
        } else {
            // Default: 9am to 9pm
            startTime = new Date(this.date);
            startTime.setHours(9, 0, 0, 0);
            endTime = new Date(this.date);
            endTime.setHours(21, 0, 0, 0);
        }

        // Override with user preferences if provided
        if (this.params.startTime) {
            startTime = new Date(this.params.startTime);
        }

        if (this.params.endTime) {
            endTime = new Date(this.params.endTime);
        }

        // Generate the primary itinerary
        const itinerary = this.buildItinerary(startTime, endTime);

        // Generate alternative itineraries
        const alternatives = this.generateAlternatives(startTime, endTime);

        // Calculate statistics
        const stats = this.calculateStats(itinerary);

        return {
            itinerary,
            stats,
            alternatives
        };
    }

    /**
     * Build the main itinerary using a heuristic algorithm
     */
    private buildItinerary(startTime: Date, endTime: Date): ItineraryItem[] {
        const itinerary: ItineraryItem[] = [];
        const usedAttractions = new Set<string>();
        let currentTime = new Date(startTime);
        let currentLocation: AttractionWithMetadata | null = null;
        let remainingBreakTime = this.params.preferences.breakDuration || 0;
        let usedLightningLanes = 0;
        let lightningLaneCost = 0;

        // Special handling for dining times
        const lunchTime = this.params.preferences.lunchTime
            ? new Date(this.params.preferences.lunchTime)
            : new Date(startTime.getTime() + (4 * 60 * 60 * 1000)); // Default: 4 hours after start

        const dinnerTime = this.params.preferences.dinnerTime
            ? new Date(this.params.preferences.dinnerTime)
            : new Date(startTime.getTime() + (9 * 60 * 60 * 1000)); // Default: 9 hours after start

        // Main planning loop - continue until we reach the end time or run out of attractions
        while (currentTime < endTime && usedAttractions.size < this.attractions.length) {
            // Check if it's time for a meal
            if (this.isWithinTimeRange(currentTime, lunchTime, 60)) {
                // Add lunch break
                itinerary.push({
                    type: 'DINING',
                    name: 'Lunch Break',
                    startTime: currentTime.toISOString(),
                    endTime: new Date(currentTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour lunch
                    location: currentLocation?.name || 'Nearby Restaurant'
                });

                currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
                remainingBreakTime = Math.max(0, remainingBreakTime - 60);
                continue;
            }

            if (this.isWithinTimeRange(currentTime, dinnerTime, 60)) {
                // Add dinner break
                itinerary.push({
                    type: 'DINING',
                    name: 'Dinner Break',
                    startTime: currentTime.toISOString(),
                    endTime: new Date(currentTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour dinner
                    location: currentLocation?.name || 'Nearby Restaurant'
                });

                currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
                remainingBreakTime = Math.max(0, remainingBreakTime - 60);
                continue;
            }

            // Check if we should add a break (we'll distribute remaining break time throughout the day)
            if (
                remainingBreakTime > 0 &&
                itinerary.length > 0 &&
                itinerary.length % 4 === 0 && // Every 4 attractions
                !itinerary[itinerary.length - 1].type.includes('BREAK')
            ) {
                const breakDuration = Math.min(remainingBreakTime, 30); // Up to 30 minute breaks

                itinerary.push({
                    type: 'BREAK',
                    name: 'Rest Break',
                    startTime: currentTime.toISOString(),
                    endTime: new Date(currentTime.getTime() + breakDuration * 60 * 1000).toISOString(),
                    location: currentLocation?.name || 'Nearby Rest Area'
                });

                currentTime = new Date(currentTime.getTime() + breakDuration * 60 * 1000);
                remainingBreakTime -= breakDuration;
                continue;
            }

            // Find the next best attraction to visit
            const nextAttraction = this.findNextBestAttraction(
                currentTime,
                currentLocation,
                usedAttractions,
                usedLightningLanes
            );

            if (!nextAttraction) {
                // No suitable attraction found - add a break
                const breakDuration = Math.min(remainingBreakTime > 0 ? remainingBreakTime : 30, 30);

                itinerary.push({
                    type: 'FLEXIBLE_TIME',
                    name: 'Flexible Time',
                    startTime: currentTime.toISOString(),
                    endTime: new Date(currentTime.getTime() + breakDuration * 60 * 1000).toISOString(),
                    description: 'Time for shopping, snacks, or revisiting favorites'
                });

                currentTime = new Date(currentTime.getTime() + breakDuration * 60 * 1000);

                if (remainingBreakTime > 0) {
                    remainingBreakTime -= breakDuration;
                }

                continue;
            }

            // Calculate walking time from current location
            let walkingTime = 0;
            if (currentLocation && nextAttraction.walkingTimeMap?.has(currentLocation.id)) {
                walkingTime = nextAttraction.walkingTimeMap.get(currentLocation.id) || 0;
            } else if (currentLocation) {
                // Default walking time if not specifically calculated
                walkingTime = 10;
            }

            // Update current time with walking time
            const arrivalTime = new Date(currentTime.getTime() + walkingTime * 60 * 1000);

            // Determine wait time based on current/predicted data
            let waitTime = nextAttraction.currentWaitTime || 0;

            // Check if we have a predicted wait time for a time slot close to arrival
            if (nextAttraction.predictedWaitTimes && nextAttraction.predictedWaitTimes.size > 0) {
                // Find the closest time slot
                let closestTimeSlot: string | null = null;
                let minDifference = Infinity;

                for (const timeSlot of nextAttraction.predictedWaitTimes.keys()) {
                    const timeSlotDate = new Date(timeSlot);
                    const difference = Math.abs(timeSlotDate.getTime() - arrivalTime.getTime());

                    if (difference < minDifference) {
                        minDifference = difference;
                        closestTimeSlot = timeSlot;
                    }
                }

                // Use predicted wait time if we found a close time slot
                if (closestTimeSlot && minDifference < 2 * 60 * 60 * 1000) { // Within 2 hours
                    waitTime = nextAttraction.predictedWaitTimes.get(closestTimeSlot) || waitTime;
                }
            }

            // Determine if we'll use Lightning Lane
            let useLightningLane = false;

            if (
                nextAttraction.lightning?.available &&
                (
                    (nextAttraction.lightning.type === 'GENIE_PLUS' && this.params.useGeniePlus) ||
                    (nextAttraction.lightning.type === 'INDIVIDUAL' && this.params.useIndividualLightningLane)
                ) &&
                waitTime > 20 // Only use for waits > 20 minutes
            ) {
                // Check budget for Individual Lightning Lane
                if (
                    nextAttraction.lightning.type === 'INDIVIDUAL' &&
                    nextAttraction.lightning.price &&
                    lightningLaneCost + nextAttraction.lightning.price <= (this.params.maxLightningLaneBudget || 0)
                ) {
                    useLightningLane = true;
                    lightningLaneCost += nextAttraction.lightning.price;
                } else if (nextAttraction.lightning.type === 'GENIE_PLUS') {
                    useLightningLane = true;
                }
            }

            // Adjust wait time if using Lightning Lane
            const effectiveWaitTime = useLightningLane ? Math.min(10, waitTime) : waitTime;

            // Calculate activity duration
            const activityDuration = nextAttraction.duration || 10; // Default 10 minutes if not specified

            // Create itinerary item
            itinerary.push({
                type: nextAttraction.attractionType,
                id: nextAttraction.id,
                name: nextAttraction.name,
                startTime: arrivalTime.toISOString(),
                endTime: new Date(
                    arrivalTime.getTime() +
                    (effectiveWaitTime + activityDuration) * 60 * 1000
                ).toISOString(),
                waitTime: effectiveWaitTime,
                walkingTime,
                lightningLane: useLightningLane
                    ? {
                        type: nextAttraction.lightning!.type,
                        price: nextAttraction.lightning!.price
                    }
                    : undefined,
                notes: this.generateAttractionNotes(nextAttraction)
            });

            // Update state for next iteration
            currentTime = new Date(
                arrivalTime.getTime() +
                (effectiveWaitTime + activityDuration) * 60 * 1000
            );

            currentLocation = nextAttraction;
            usedAttractions.add(nextAttraction.id);

            if (useLightningLane) {
                usedLightningLanes++;
            }
        }

        // Add any remaining break time at the end if needed
        if (remainingBreakTime > 15 && currentTime.getTime() + remainingBreakTime * 60 * 1000 <= endTime.getTime()) {
            itinerary.push({
                type: 'BREAK',
                name: 'Final Break',
                startTime: currentTime.toISOString(),
                endTime: new Date(currentTime.getTime() + remainingBreakTime * 60 * 1000).toISOString(),
                description: 'Time to rest, shop for souvenirs, or enjoy the park atmosphere'
            });
        }

        return itinerary;
    }

    /**
     * Check if a time is within a specified range of a target time
     */
    private isWithinTimeRange(time: Date, targetTime: Date, rangeMinutes: number): boolean {
        const diffMinutes = Math.abs(time.getTime() - targetTime.getTime()) / (60 * 1000);
        return diffMinutes <= rangeMinutes;
    }

    /**
     * Find the next best attraction to visit based on the current state
     */
    private findNextBestAttraction(
        currentTime: Date,
        currentLocation: AttractionWithMetadata | null,
        usedAttractions: Set<string>,
        usedLightningLanes: number
    ): AttractionWithMetadata | null {
        // Filter attractions that are already used (unless we allow repeats)
        const candidateAttractions = this.attractions.filter(attraction => {
            // Skip already used attractions unless we allow repeats and it's a priority
            if (
                usedAttractions.has(attraction.id) &&
                (!this.params.rideRepeats ||
                    !this.params.preferences.priorityAttractions?.includes(attraction.id))
            ) {
                return false;
            }

            // Skip excluded attractions or those with very low scores
            if (attraction.score < 0) {
                return false;
            }

            // Filter attractions based on wait time preference if applicable
            if (
                attraction.currentWaitTime !== undefined &&
                this.params.preferences.maxWaitTime &&
                attraction.currentWaitTime > this.params.preferences.maxWaitTime &&
                !attraction.lightning?.available
            ) {
                return false;
            }

            // Skip shows/entertainment that don't align with current time
            if (
                attraction.attractionType === 'SHOW' ||
                attraction.attractionType === 'PARADE'
            ) {
                // Check if there's a showtime within the next 1 hour
                // This would require show schedule data we don't have in this example

                // For now, we'll just include them
                return true;
            }

            return true;
        });

        if (candidateAttractions.length === 0) {
            return null;
        }

        // Score each candidate based on multiple factors
        const scoredCandidates = candidateAttractions.map(attraction => {
            let score = attraction.score;

            // Adjust score based on current location (favor nearby attractions)
            if (currentLocation && attraction.walkingTimeMap?.has(currentLocation.id)) {
                const walkingTime = attraction.walkingTimeMap.get(currentLocation.id) || 0;

                // Penalize long walks
                if (walkingTime > 15) {
                    score -= (walkingTime - 15) * 2;
                } else {
                    // Bonus for very close attractions
                    score += (15 - walkingTime);
                }
            }

            // Adjust score based on predicted wait times
            if (attraction.predictedWaitTimes && attraction.predictedWaitTimes.size > 0) {
                // Find the closest time slot
                let closestTimeSlot: string | null = null;
                let minDifference = Infinity;

                for (const timeSlot of attraction.predictedWaitTimes.keys()) {
                    const timeSlotDate = new Date(timeSlot);
                    const difference = Math.abs(timeSlotDate.getTime() - currentTime.getTime());

                    if (difference < minDifference) {
                        minDifference = difference;
                        closestTimeSlot = timeSlot;
                    }
                }

                // Adjust score based on predicted wait time
                if (closestTimeSlot) {
                    const predictedWait = attraction.predictedWaitTimes.get(closestTimeSlot) || 0;

                    if (predictedWait < 15) {
                        score += 20; // Big bonus for very short waits
                    } else if (predictedWait > 60) {
                        score -= 15; // Penalty for very long waits
                    }

                    // If the wait is predicted to decrease soon, wait for it
                    // This would require more sophisticated time-series prediction
                }
            }

            // Boost score for Lightning Lane if available
            if (
                attraction.lightning?.available &&
                (
                    (attraction.lightning.type === 'GENIE_PLUS' && this.params.useGeniePlus) ||
                    (attraction.lightning.type === 'INDIVIDUAL' && this.params.useIndividualLightningLane)
                )
            ) {
                // Prioritize Individual Lightning Lane attractions
                if (
                    attraction.lightning.type === 'INDIVIDUAL' &&
                    (!attraction.lightning.price ||
                        attraction.lightning.price <= (this.params.maxLightningLaneBudget || 0))
                ) {
                    score += 25;
                } else if (
                    attraction.lightning.type === 'GENIE_PLUS' &&
                    usedLightningLanes < 3 // Limit to 3 Genie+ per day in our model
                ) {
                    score += 15;
                }
            }

            return { attraction, score };
        });

        // Sort by adjusted score
        scoredCandidates.sort((a, b) => b.score - a.score);

        // Return the top candidate
        return scoredCandidates.length > 0 ? scoredCandidates[0].attraction : null;
    }

    /**
     * Generate special notes for an attraction
     */
    private generateAttractionNotes(attraction: AttractionWithMetadata): string | undefined {
        const notes: string[] = [];

        // Height requirement note
        if (attraction.heightRequirement?.min) {
            notes.push(`Height requirement: ${attraction.heightRequirement.min} ${attraction.heightRequirement.unit}`);
        }

        // Mobility note
        if (attraction.tags?.includes('mobility_challenging')) {
            notes.push('May be challenging for guests with mobility considerations');
        }

        // Weather note
        if (attraction.tags?.includes('outdoor') && this.isLikelyToRain()) {
            notes.push('Outdoor attraction - be prepared for weather');
        }

        // Return notes if we have any
        return notes.length > 0 ? notes.join('. ') : undefined;
    }

    /**
     * Generate alternative itineraries for different scenarios
     */
    private generateAlternatives(startTime: Date, endTime: Date): {
        morningAlternative?: ItineraryItem[];
        afternoonAlternative?: ItineraryItem[];
        eveningAlternative?: ItineraryItem[];
        rainyDayPlan?: ItineraryItem[];
        lowWaitTimePlan?: ItineraryItem[];
        maxAttractionsPlan?: ItineraryItem[];
    } {
        const alternatives: {
            morningAlternative?: ItineraryItem[];
            afternoonAlternative?: ItineraryItem[];
            eveningAlternative?: ItineraryItem[];
            rainyDayPlan?: ItineraryItem[];
            lowWaitTimePlan?: ItineraryItem[];
            maxAttractionsPlan?: ItineraryItem[];
        } = {};

        // Morning plan: Focus on most popular attractions early
        const morningEnd = new Date(startTime);
        morningEnd.setHours(12, 0, 0, 0);

        // For the morning plan, we'll modify our scoring to heavily prioritize popular attractions
        const originalScores = this.attractions.map(a => a.score);

        // Boost score for popular attractions
        this.attractions.forEach(attraction => {
            if (attraction.currentWaitTime && attraction.currentWaitTime > 30) {
                attraction.score += 30; // Boost popular attractions
            }
        });

        // Sort attractions for morning planning
        this.attractions.sort((a, b) => b.score - a.score);

        alternatives.morningAlternative = this.buildItinerary(startTime, morningEnd);

        // Restore original scores
        this.attractions.forEach((attraction, index) => {
            attraction.score = originalScores[index];
        });

        // Afternoon plan: Focus on shows and indoor attractions during hot/busy time
        const afternoonStart = new Date(startTime);
        afternoonStart.setHours(12, 0, 0, 0);
        const afternoonEnd = new Date(startTime);
        afternoonEnd.setHours(17, 0, 0, 0);

        // Boost indoor attractions and shows
        this.attractions.forEach(attraction => {
            if (
                attraction.attractionType === 'SHOW' ||
                (attraction.tags && !attraction.tags.includes('outdoor'))
            ) {
                attraction.score += 25;
            }
        });

        // Sort attractions for afternoon planning
        this.attractions.sort((a, b) => b.score - a.score);

        alternatives.afternoonAlternative = this.buildItinerary(afternoonStart, afternoonEnd);

        // Restore original scores
        this.attractions.forEach((attraction, index) => {
            attraction.score = originalScores[index];
        });

        // Evening plan: Focus on scenic attractions and nighttime experiences
        const eveningStart = new Date(startTime);
        eveningStart.setHours(17, 0, 0, 0);

        // Boost attractions that are better at night
        this.attractions.forEach(attraction => {
            if (attraction.tags?.includes('nighttime') || attraction.tags?.includes('scenic')) {
                attraction.score += 30;
            }
        });

        // Sort attractions for evening planning
        this.attractions.sort((a, b) => b.score - a.score);

        alternatives.eveningAlternative = this.buildItinerary(eveningStart, endTime);

        // Restore original scores
        this.attractions.forEach((attraction, index) => {
            attraction.score = originalScores[index];
        });

        // Rainy day plan: Focus on indoor attractions
        this.attractions.forEach(attraction => {
            if (attraction.tags?.includes('outdoor')) {
                attraction.score -= 50; // Heavily penalize outdoor attractions
            } else {
                attraction.score += 20; // Boost indoor attractions
            }
        });

        // Sort attractions for rainy day planning
        this.attractions.sort((a, b) => b.score - a.score);

        alternatives.rainyDayPlan = this.buildItinerary(startTime, endTime);

        // Restore original scores
        this.attractions.forEach((attraction, index) => {
            attraction.score = originalScores[index];
        });

        // Low wait time plan: Strictly prioritize low wait times
        this.attractions.forEach(attraction => {
            if (attraction.currentWaitTime !== undefined) {
                // Invert the wait time to score - lower waits get higher scores
                const waitScore = attraction.currentWaitTime <= 0 ? 100 : Math.max(0, 100 - attraction.currentWaitTime);
                attraction.score = waitScore;
            }
        });

        // Sort attractions by wait time (ascending)
        this.attractions.sort((a, b) => b.score - a.score);

        alternatives.lowWaitTimePlan = this.buildItinerary(startTime, endTime);

        // Restore original scores
        this.attractions.forEach((attraction, index) => {
            attraction.score = originalScores[index];
        });

        // Max attractions plan: Focus on shorter experiences to maximize attraction count
        this.attractions.forEach(attraction => {
            // Prioritize quick experiences
            if (attraction.duration && attraction.duration <= 10) {
                attraction.score += 30;
            } else if (attraction.duration && attraction.duration >= 20) {
                attraction.score -= 20;
            }

            // Penalize long waits even more
            if (attraction.currentWaitTime && attraction.currentWaitTime > 30) {
                attraction.score -= 30;
            }
        });

        // Sort attractions for maximum count planning
        this.attractions.sort((a, b) => b.score - a.score);

        alternatives.maxAttractionsPlan = this.buildItinerary(startTime, endTime);

        // Restore original scores
        this.attractions.forEach((attraction, index) => {
            attraction.score = originalScores[index];
        });

        return alternatives;
    }

    /**
     * Calculate statistics for the generated itinerary
     */
    private calculateStats(itinerary: ItineraryItem[]): OptimizationResult['stats'] {
        // Count total attractions
        const attractionItems = itinerary.filter(item =>
            item.type === 'RIDE' ||
            item.type === 'SHOW' ||
            item.type === 'ENTERTAINMENT' ||
            item.type === 'MEET_AND_GREET'
        );

        // Calculate total wait time
        const totalWaitTime = itinerary.reduce((sum, item) => {
            return sum + (item.waitTime || 0);
        }, 0);

        // Calculate walking distance
        const totalWalkingDistance = itinerary.reduce((sum, item) => {
            const walkingTime = item.walkingTime || 0;
            // Rough estimation: 1 minute of walking is about 0.08 km
            return sum + (walkingTime * 0.08);
        }, 0);

        // Find start and end times
        const startTime = itinerary.length > 0 ? itinerary[0].startTime : '';
        const endTime = itinerary.length > 0 ? itinerary[itinerary.length - 1].endTime : '';

        // Calculate coverage percentage
        let coveragePercentage = 0;

        if (this.params.preferences.priorityAttractions?.length) {
            const coveredPriorityAttractions = itinerary.filter(item =>
                this.params.preferences.priorityAttractions?.includes(item.id || '')
            ).length;

            coveragePercentage = (coveredPriorityAttractions / this.params.preferences.priorityAttractions.length) * 100;
        } else {
            // If no priority attractions specified, calculate based on all high-scored attractions
            const highScoredAttractions = this.attractions.filter(a => a.score > 50).length;
            const coveredHighScored = new Set(
                itinerary
                    .filter(item => item.id)
                    .map(item => item.id!)
            ).size;

            coveragePercentage = highScoredAttractions > 0
                ? (coveredHighScored / highScoredAttractions) * 100
                : 100;
        }

        // Calculate Lightning Lane usage
        const lightningLaneItems = itinerary.filter(item => item.lightningLane);

        // Calculate total Lightning Lane cost
        const lightningLaneCost = lightningLaneItems.reduce((sum, item) => {
            return sum + (item.lightningLane?.price || 0);
        }, 0);

        return {
            totalAttractions: attractionItems.length,
            expectedWaitTime: totalWaitTime,
            walkingDistance: parseFloat(totalWalkingDistance.toFixed(2)),
            startTime,
            endTime,
            coveragePercentage: parseFloat(coveragePercentage.toFixed(2)),
            lightningLaneUsage: lightningLaneItems.length,
            lightningLaneCost: lightningLaneCost > 0 ? lightningLaneCost : undefined
        };
    }
}

// Export a hook for easy use in components
export function useItineraryOptimizer() {
    return {
        createOptimizer: (params: OptimizationParameters) => new ParkItineraryOptimizer(params),
        optimizeItinerary: async (params: OptimizationParameters): Promise<OptimizationResult> => {
            const optimizer = new ParkItineraryOptimizer(params);
            return await optimizer.generateItinerary();
        }
    };
}