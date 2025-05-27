import { UserLocation } from '@/db/schema/locations'

interface PartyMember {
    id: string
    name: string
    age?: number
    preferences: {
        attractions: string[]
        dining: string[]
        accessibility: string[]
        energyLevel: 'low' | 'medium' | 'high'
    }
    currentLocation?: UserLocation
}

interface Attraction {
    id: string
    name: string
    parkArea: string
    type: string
    minHeight?: number
    accessibility: string[]
    averageWaitTime: number
    currentWaitTime: number
    fastPassAvailable: boolean
    coordinates: { lat: number; lng: number }
    photoPassLocations: string[]
}

interface DiningOption {
    id: string
    name: string
    type: 'quick-service' | 'table-service' | 'snack'
    cuisine: string[]
    coordinates: { lat: number; lng: number }
    averageWaitTime: number
    reservationRequired: boolean
    accessibility: string[]
}

interface WeatherCondition {
    temperature: number
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
    precipitation: number
    windSpeed: number
    uvIndex: number
}

interface ShowData {
    id: string
    name: string
    time: Date
    location: { lat: number; lng: number }
    duration: number
    type: string
}

interface RestArea {
    name: string
    coordinates: { lat: number; lng: number }
    type: string
}

interface MeetingPoint {
    point: {
        name: string
        coordinates: { lat: number; lng: number }
        type: string
    }
    partySpread: number
    maxWalkTime: number
}

interface PhotoData {
    attraction: Attraction
    photoLocations: string[]
}

interface Recommendation {
    id: string
    type: 'attraction' | 'dining' | 'photo' | 'rest' | 'show' | 'shopping' | 'meeting'
    title: string
    description: string
    priority: number
    confidence: number
    estimatedTime: number
    walkingTime: number
    distanceFromUser: number
    reasons: string[]
    data: Attraction | DiningOption | ShowData | RestArea | MeetingPoint | PhotoData
    expiresAt?: Date
    weatherDependent?: boolean
}

export class LocationAwareRecommendationEngine {
    private static instance: LocationAwareRecommendationEngine
    private attractions: Map<string, Attraction> = new Map()
    private diningOptions: Map<string, DiningOption> = new Map()
    private weatherCondition: WeatherCondition | null = null
    private crowdLevels: Map<string, number> = new Map() // area -> crowd level (1-10)

    private constructor() { }

    public static getInstance(): LocationAwareRecommendationEngine {
        if (!LocationAwareRecommendationEngine.instance) {
            LocationAwareRecommendationEngine.instance = new LocationAwareRecommendationEngine()
        }
        return LocationAwareRecommendationEngine.instance
    }

    /**
     * Generate comprehensive recommendations based on current context
     */
    public async generateRecommendations(
        vacationId: string,
        partyMembers: PartyMember[],
        currentTime: Date = new Date()
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = []

        // Get current weather
        await this.updateWeatherCondition()

        // Get real-time data
        await this.updateRealTimeData()

        // Generate different types of recommendations
        const attractionRecs = await this.generateAttractionRecommendations(partyMembers, currentTime)
        const diningRecs = await this.generateDiningRecommendations(partyMembers, currentTime)
        const photoRecs = await this.generatePhotoRecommendations(partyMembers, currentTime)
        const restRecs = await this.generateRestRecommendations(partyMembers, currentTime)
        const showRecs = await this.generateShowRecommendations(partyMembers, currentTime)
        const meetingRecs = await this.generateMeetingPointRecommendations(partyMembers)

        recommendations.push(
            ...attractionRecs,
            ...diningRecs,
            ...photoRecs,
            ...restRecs,
            ...showRecs,
            ...meetingRecs
        )

        // Sort by priority and confidence
        recommendations.sort((a, b) => {
            const scoreDiff = (b.priority * b.confidence) - (a.priority * a.confidence)
            if (scoreDiff === 0) {
                return a.distanceFromUser - b.distanceFromUser // Closer is better for equal scores
            }
            return scoreDiff
        })

        return recommendations.slice(0, 10) // Return top 10 recommendations
    }

    /**
     * Generate attraction recommendations based on location and preferences
     */
    private async generateAttractionRecommendations(
        partyMembers: PartyMember[],
        currentTime: Date
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = []
        const userLocation = this.getPartyCenter(partyMembers)

        if (!userLocation) return recommendations

        // Weather-aware filtering
        const suitableAttractions = Array.from(this.attractions.values()).filter(attraction => {
            if (this.weatherCondition?.condition === 'rainy') {
                return attraction.type === 'indoor' || attraction.type === 'covered'
            }
            if (this.weatherCondition?.temperature && this.weatherCondition.temperature > 32) {
                return attraction.type === 'indoor' || attraction.type === 'water'
            }
            return true
        })

        for (const attraction of suitableAttractions) {
            const distance = this.calculateDistance(userLocation, attraction.coordinates)

            // Skip if too far (more than 2km)
            if (distance > 2000) continue

            const walkingTime = this.estimateWalkingTime(distance)
            const suitabilityScore = this.calculateAttractionSuitability(attraction, partyMembers)

            if (suitabilityScore > 0.3) { // Only recommend if reasonably suitable
                const reasons = this.generateAttractionReasons(attraction, partyMembers, distance)

                recommendations.push({
                    id: `attraction-${attraction.id}`,
                    type: 'attraction',
                    title: attraction.name,
                    description: `${attraction.currentWaitTime} min wait • ${Math.round(distance)}m away`,
                    priority: this.calculateAttractionPriority(attraction, suitabilityScore, currentTime),
                    confidence: suitabilityScore,
                    estimatedTime: attraction.averageWaitTime + 30, // Wait + ride time
                    walkingTime,
                    distanceFromUser: distance,
                    reasons,
                    data: attraction,
                    weatherDependent: attraction.type === 'outdoor'
                })
            }
        }

        return recommendations
    }

    /**
     * Generate dining recommendations based on time, location, and preferences
     */
    private async generateDiningRecommendations(
        partyMembers: PartyMember[],
        currentTime: Date
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = []
        const userLocation = this.getPartyCenter(partyMembers)
        const hour = currentTime.getHours()

        if (!userLocation) return recommendations

        // Determine meal time
        const mealTime = this.determineMealTime(hour)
        if (!mealTime) return recommendations

        for (const dining of this.diningOptions.values()) {
            const distance = this.calculateDistance(userLocation, dining.coordinates)

            // Skip if too far
            if (distance > 1500) continue

            const walkingTime = this.estimateWalkingTime(distance)
            const suitabilityScore = this.calculateDiningSuitability(dining, partyMembers, mealTime)

            if (suitabilityScore > 0.4) {
                const reasons = this.generateDiningReasons(dining, partyMembers, mealTime, distance)

                recommendations.push({
                    id: `dining-${dining.id}`,
                    type: 'dining',
                    title: dining.name,
                    description: `${dining.type} • ${Math.round(distance)}m away`,
                    priority: this.calculateDiningPriority(dining, suitabilityScore, mealTime, hour),
                    confidence: suitabilityScore,
                    estimatedTime: dining.type === 'table-service' ? 90 : 20,
                    walkingTime,
                    distanceFromUser: distance,
                    reasons,
                    data: dining
                })
            }
        }

        return recommendations
    }

    /**
     * Generate photo opportunity recommendations
     */
    private async generatePhotoRecommendations(
        partyMembers: PartyMember[],
        currentTime: Date
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = []
        const userLocation = this.getPartyCenter(partyMembers)
        const hour = currentTime.getHours()

        if (!userLocation) return recommendations

        // Golden hour times (best for photos)
        const isGoldenHour = hour <= 10 || hour >= 17
        const lightingQuality = isGoldenHour ? 'excellent' : this.getLightingQuality(hour)

        // Find nearby attractions with PhotoPass locations
        for (const attraction of this.attractions.values()) {
            if (attraction.photoPassLocations.length === 0) continue

            const distance = this.calculateDistance(userLocation, attraction.coordinates)
            if (distance > 800) continue // Only nearby photo spots

            const walkingTime = this.estimateWalkingTime(distance)
            const photoScore = this.calculatePhotoOpportunityScore(attraction, lightingQuality, distance)

            if (photoScore > 0.5) {
                recommendations.push({
                    id: `photo-${attraction.id}`,
                    type: 'photo',
                    title: `Photo at ${attraction.name}`,
                    description: `Great ${lightingQuality} lighting • ${attraction.photoPassLocations.length} PhotoPass spots`,
                    priority: isGoldenHour ? 8 : 6,
                    confidence: photoScore,
                    estimatedTime: 15,
                    walkingTime,
                    distanceFromUser: distance,
                    reasons: [
                        `${lightingQuality.charAt(0).toUpperCase() + lightingQuality.slice(1)} lighting conditions`,
                        `${attraction.photoPassLocations.length} professional PhotoPass locations`,
                        'Close to your current location'
                    ],
                    data: { attraction, photoLocations: attraction.photoPassLocations },
                    expiresAt: this.calculatePhotoExpirationTime(currentTime, lightingQuality)
                })
            }
        }

        return recommendations
    }

    /**
     * Generate rest/break recommendations based on party energy levels
     */
    private async generateRestRecommendations(
        partyMembers: PartyMember[],
        currentTime: Date
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = []
        const userLocation = this.getPartyCenter(partyMembers)

        if (!userLocation) return recommendations

        // Check if party needs rest
        const lowEnergyMembers = partyMembers.filter(member => member.preferences.energyLevel === 'low')
        const restPriority = this.calculateRestPriority(partyMembers, currentTime)

        if (restPriority < 5) return recommendations // Not urgent

        // Find nearby rest areas
        const restAreas = [
            { name: 'Main Street Seating Area', coordinates: { lat: 28.4177, lng: -81.5812 }, type: 'seating' },
            { name: 'Fantasyland Gardens', coordinates: { lat: 28.4198, lng: -81.5789 }, type: 'park' },
            { name: 'Tomorrowland Terrace', coordinates: { lat: 28.4156, lng: -81.5776 }, type: 'covered' }
        ]

        for (const area of restAreas) {
            const distance = this.calculateDistance(userLocation, area.coordinates)
            if (distance > 1000) continue

            const walkingTime = this.estimateWalkingTime(distance)

            recommendations.push({
                id: `rest-${area.name.replace(/\s+/g, '-').toLowerCase()}`,
                type: 'rest',
                title: `Take a break at ${area.name}`,
                description: `${area.type} area • ${Math.round(distance)}m away`,
                priority: restPriority,
                confidence: 0.8,
                estimatedTime: 20,
                walkingTime,
                distanceFromUser: distance,
                reasons: [
                    `${lowEnergyMembers.length} party member(s) need rest`,
                    `Comfortable ${area.type} seating`,
                    'Close to your location'
                ],
                data: area
            })
        }

        return recommendations
    }

    /**
     * Generate show and entertainment recommendations
     */
    private async generateShowRecommendations(
        partyMembers: PartyMember[],
        currentTime: Date
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = []
        const userLocation = this.getPartyCenter(partyMembers)

        if (!userLocation) return recommendations

        // Mock show data (in real app, fetch from Disney API)
        const upcomingShows = [
            {
                id: 'happily-ever-after',
                name: 'Happily Ever After',
                time: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                location: { lat: 28.4177, lng: -81.5812 },
                duration: 18,
                type: 'fireworks'
            },
            {
                id: 'festival-of-fantasy',
                name: 'Festival of Fantasy Parade',
                time: new Date(currentTime.getTime() + 45 * 60 * 1000), // 45 minutes from now
                location: { lat: 28.4189, lng: -81.5801 },
                duration: 20,
                type: 'parade'
            }
        ]

        for (const show of upcomingShows) {
            const distance = this.calculateDistance(userLocation, show.location)
            const timeUntilShow = (show.time.getTime() - currentTime.getTime()) / (1000 * 60) // minutes
            const walkingTime = this.estimateWalkingTime(distance)

            // Check if we can make it to the show with some buffer time
            const arrivalBuffer = show.type === 'fireworks' ? 30 : 15 // minutes
            const canMakeIt = timeUntilShow > (walkingTime + arrivalBuffer)

            if (canMakeIt && timeUntilShow < 120) { // Within 2 hours
                const showScore = this.calculateShowSuitability(show, partyMembers, timeUntilShow)

                recommendations.push({
                    id: `show-${show.id}`,
                    type: 'show',
                    title: show.name,
                    description: `Starts in ${Math.round(timeUntilShow)} minutes • ${show.duration} min show`,
                    priority: Math.min(9, Math.floor(10 - (timeUntilShow / 20))), // Higher priority as show approaches
                    confidence: showScore,
                    estimatedTime: show.duration + arrivalBuffer,
                    walkingTime,
                    distanceFromUser: distance,
                    reasons: [
                        `Show starts in ${Math.round(timeUntilShow)} minutes`,
                        `Perfect timing to get good viewing spot`,
                        `Popular ${show.type} show`
                    ],
                    data: show,
                    expiresAt: new Date(show.time.getTime() - arrivalBuffer * 60 * 1000)
                })
            }
        }

        return recommendations
    }

    /**
     * Generate meeting point recommendations for separated party members
     */
    private async generateMeetingPointRecommendations(
        partyMembers: PartyMember[]
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = []

        // Check if party is spread out
        const memberLocations = partyMembers
            .filter(member => member.currentLocation)
            .map(member => member.currentLocation!)

        if (memberLocations.length < 2) return recommendations

        const spreadDistance = this.calculatePartySpread(memberLocations)

        // Only suggest meeting points if party is spread out more than 500m
        if (spreadDistance < 500) return recommendations

        const centerPoint = this.calculateGeographicCenter(memberLocations)

        // Find good meeting points near the center
        const meetingPoints = [
            { name: 'Castle Hub', coordinates: { lat: 28.4177, lng: -81.5812 }, type: 'landmark' },
            { name: 'Partners Statue', coordinates: { lat: 28.4175, lng: -81.5815 }, type: 'landmark' },
            { name: 'Carousel Area', coordinates: { lat: 28.4198, lng: -81.5789 }, type: 'attraction' }
        ]

        for (const point of meetingPoints) {
            const distanceFromCenter = this.calculateDistance(centerPoint, point.coordinates)

            if (distanceFromCenter < 800) { // Within reasonable distance of party center
                const maxWalkingTime = Math.max(
                    ...memberLocations.map(loc =>
                        this.estimateWalkingTime(this.calculateDistance(
                            { lat: loc.latitude, lng: loc.longitude },
                            point.coordinates
                        ))
                    )
                )

                recommendations.push({
                    id: `meeting-${point.name.replace(/\s+/g, '-').toLowerCase()}`,
                    type: 'meeting',
                    title: `Meet at ${point.name}`,
                    description: `Central location • Max ${maxWalkingTime} min walk for anyone`,
                    priority: Math.floor(spreadDistance / 100), // Higher priority for more spread out party
                    confidence: 0.9,
                    estimatedTime: 10,
                    walkingTime: maxWalkingTime,
                    distanceFromUser: distanceFromCenter,
                    reasons: [
                        `Party is spread across ${Math.round(spreadDistance)}m`,
                        `Central ${point.type} location`,
                        'Easy to find landmark'
                    ],
                    data: { point, partySpread: spreadDistance, maxWalkTime: maxWalkingTime }
                })
            }
        }

        return recommendations
    }

    // Helper methods
    private getPartyCenter(partyMembers: PartyMember[]): { lat: number; lng: number } | null {
        const locatedMembers = partyMembers.filter((member): member is PartyMember & { currentLocation: UserLocation } =>
            member.currentLocation !== undefined
        )
        if (locatedMembers.length === 0) return null

        const avgLat = locatedMembers.reduce((sum, member) => sum + member.currentLocation.latitude, 0) / locatedMembers.length
        const avgLng = locatedMembers.reduce((sum, member) => sum + member.currentLocation.longitude, 0) / locatedMembers.length

        return { lat: avgLat, lng: avgLng }
    }

    private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
        const R = 6371e3 // Earth's radius in meters
        const φ1 = point1.lat * Math.PI / 180
        const φ2 = point2.lat * Math.PI / 180
        const Δφ = (point2.lat - point1.lat) * Math.PI / 180
        const Δλ = (point2.lng - point1.lng) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }

    private estimateWalkingTime(distanceMeters: number): number {
        // Average walking speed of 4 km/h = 67 m/min
        return Math.ceil(distanceMeters / 67)
    }

    private calculateAttractionSuitability(attraction: Attraction, partyMembers: PartyMember[]): number {
        let score = 0.5 // Base score

        // Age appropriateness
        const hasChildren = partyMembers.some(member => member.age && member.age < 12)
        const hasAdults = partyMembers.some(member => !member.age || member.age >= 18)

        if (attraction.type === 'family' || attraction.type === 'all-ages') {
            score += 0.2
        }

        // Adjust score based on party composition
        if (hasChildren && (attraction.type === 'thrill' || attraction.type === 'intense')) {
            score -= 0.3
        }
        if (hasAdults && !hasChildren && attraction.type === 'kiddie') {
            score -= 0.2
        }

        // Height requirements
        if (attraction.minHeight) {
            const allCanRide = partyMembers.every(member => !member.age || member.age >= 10) // Assume height
            if (allCanRide) score += 0.1
            else score -= 0.3
        }

        // Wait time consideration
        if (attraction.currentWaitTime < 30) score += 0.2
        else if (attraction.currentWaitTime > 60) score -= 0.2

        // Preference matching
        const preferenceMatches = partyMembers.reduce((matches, member) => {
            return matches + member.preferences.attractions.filter(pref =>
                attraction.name.toLowerCase().includes(pref.toLowerCase()) ||
                attraction.type.toLowerCase().includes(pref.toLowerCase())
            ).length
        }, 0)

        score += Math.min(0.3, preferenceMatches * 0.1)

        return Math.max(0, Math.min(1, score))
    }

    private calculateDiningSuitability(dining: DiningOption, partyMembers: PartyMember[], mealTime: string): number {
        let score = 0.5

        // Meal time appropriateness
        if (mealTime === 'breakfast' && dining.type === 'quick-service') score += 0.2
        if (mealTime === 'lunch' && dining.type !== 'snack') score += 0.2
        if (mealTime === 'dinner' && dining.type === 'table-service') score += 0.3

        // Preference matching
        const preferenceMatches = partyMembers.reduce((matches, member) => {
            return matches + member.preferences.dining.filter(pref =>
                dining.cuisine.some(cuisine => cuisine.toLowerCase().includes(pref.toLowerCase()))
            ).length
        }, 0)

        score += Math.min(0.3, preferenceMatches * 0.1)

        // Accessibility
        const needsAccessibility = partyMembers.some(member => member.preferences.accessibility.length > 0)
        if (needsAccessibility && dining.accessibility.length > 0) {
            score += 0.2
        }

        return Math.max(0, Math.min(1, score))
    }

    private determineMealTime(hour: number): string | null {
        if (hour >= 7 && hour <= 10) return 'breakfast'
        if (hour >= 11 && hour <= 14) return 'lunch'
        if (hour >= 17 && hour <= 21) return 'dinner'
        if (hour >= 14 && hour <= 17) return 'snack'
        return null
    }

    private calculateAttractionPriority(attraction: Attraction, suitabilityScore: number, currentTime: Date): number {
        let priority = Math.floor(suitabilityScore * 10)

        // Time-based adjustments
        const hour = currentTime.getHours()
        if (hour >= 12 && hour <= 15 && attraction.type === 'outdoor') {
            priority -= 2 // Avoid outdoor attractions during hot midday
        }

        // Fast Pass consideration
        if (attraction.fastPassAvailable && attraction.currentWaitTime > 45) {
            priority += 2
        }

        // Crowd level consideration
        const crowdLevel = this.crowdLevels.get(attraction.parkArea) || 5
        if (crowdLevel < 4) priority += 1
        else if (crowdLevel > 7) priority -= 1

        return Math.max(1, Math.min(10, priority))
    }

    private calculateDiningPriority(dining: DiningOption, suitabilityScore: number, mealTime: string, hour: number): number {
        let priority = Math.floor(suitabilityScore * 10)

        // Urgency based on meal time
        if (mealTime === 'lunch' && hour >= 13) priority += 2
        if (mealTime === 'dinner' && hour >= 19) priority += 3

        // Reservation requirements
        if (dining.reservationRequired && !dining.reservationRequired) {
            priority -= 2 // Lower priority if reservations needed but not available
        }

        return Math.max(1, Math.min(10, priority))
    }

    private calculateRestPriority(partyMembers: PartyMember[], currentTime: Date): number {
        const hour = currentTime.getHours()
        let priority = 0

        // Energy level assessment
        const lowEnergyCount = partyMembers.filter(m => m.preferences.energyLevel === 'low').length
        priority += lowEnergyCount * 3

        // Time-based fatigue
        if (hour >= 14 && hour <= 16) priority += 2 // Afternoon fatigue
        if (hour >= 20) priority += 3 // Evening fatigue

        // Weather consideration
        if (this.weatherCondition?.temperature && this.weatherCondition.temperature > 30) {
            priority += 2 // Heat fatigue
        }

        return Math.min(10, priority)
    }

    // Additional helper methods for data updates
    private async updateWeatherCondition(): Promise<void> {
        try {
            // In real implementation, fetch from weather API
            this.weatherCondition = {
                temperature: 28,
                condition: 'sunny',
                precipitation: 0,
                windSpeed: 10,
                uvIndex: 7
            }
        } catch (error) {
            console.error('Failed to update weather:', error)
        }
    }

    private async updateRealTimeData(): Promise<void> {
        try {
            // In real implementation, fetch from Disney API
            // Update attraction wait times, crowd levels, etc.
        } catch (error) {
            console.error('Failed to update real-time data:', error)
        }
    }

    private generateAttractionReasons(attraction: Attraction, partyMembers: PartyMember[], distance: number): string[] {
        const reasons = []

        if (attraction.currentWaitTime < 30) {
            reasons.push('Short wait time')
        }

        if (distance < 300) {
            reasons.push('Very close to your location')
        }

        if (attraction.fastPassAvailable) {
            reasons.push('FastPass available')
        }

        if (this.weatherCondition?.condition === 'rainy' && attraction.type === 'indoor') {
            reasons.push('Perfect for current weather')
        }

        return reasons
    }

    private generateDiningReasons(dining: DiningOption, partyMembers: PartyMember[], mealTime: string, distance: number): string[] {
        const reasons = []

        reasons.push(`Great for ${mealTime}`)

        if (distance < 200) {
            reasons.push('Very close by')
        }

        if (!dining.reservationRequired) {
            reasons.push('No reservation needed')
        }

        if (dining.accessibility.length > 0) {
            reasons.push('Accessibility friendly')
        }

        return reasons
    }

    private getLightingQuality(hour: number): string {
        if (hour <= 10 || hour >= 17) return 'excellent'
        if (hour <= 12 || hour >= 15) return 'good'
        return 'fair'
    }

    private calculatePhotoOpportunityScore(attraction: Attraction, lightingQuality: string, distance: number): number {
        let score = 0.5

        // Lighting quality
        if (lightingQuality === 'excellent') score += 0.3
        else if (lightingQuality === 'good') score += 0.2

        // Distance factor
        if (distance < 300) score += 0.2

        // Number of PhotoPass locations
        score += Math.min(0.2, attraction.photoPassLocations.length * 0.05)

        return Math.max(0, Math.min(1, score))
    }

    private calculatePhotoExpirationTime(currentTime: Date, lightingQuality: string): Date {
        const expirationMinutes = lightingQuality === 'excellent' ? 90 : 60
        return new Date(currentTime.getTime() + expirationMinutes * 60 * 1000)
    }

    private calculateShowSuitability(show: ShowData, partyMembers: PartyMember[], timeUntilShow: number): number {
        let score = 0.7 // Base score for shows

        // Timing appropriateness
        if (timeUntilShow > 30 && timeUntilShow < 90) {
            score += 0.2 // Perfect timing window
        }

        // Age appropriateness
        const hasChildren = partyMembers.some(member => member.age && member.age < 12)
        if (show.type === 'parade' && hasChildren) score += 0.1
        if (show.type === 'fireworks') score += 0.1 // Universal appeal

        return Math.max(0, Math.min(1, score))
    }

    private calculatePartySpread(locations: UserLocation[]): number {
        if (locations.length < 2) return 0

        let maxDistance = 0
        for (let i = 0; i < locations.length; i++) {
            for (let j = i + 1; j < locations.length; j++) {
                const distance = this.calculateDistance(
                    { lat: locations[i].latitude, lng: locations[i].longitude },
                    { lat: locations[j].latitude, lng: locations[j].longitude }
                )
                maxDistance = Math.max(maxDistance, distance)
            }
        }

        return maxDistance
    }

    private calculateGeographicCenter(locations: UserLocation[]): { lat: number; lng: number } {
        const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length
        const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length
        return { lat: avgLat, lng: avgLng }
    }
}

export const locationAwareRecommendationEngine = LocationAwareRecommendationEngine.getInstance()