/**
 * Firebase Data Connect Service
 *
 * This service provides a wrapper around Firebase Data Connect operations
 * for the Disney Vacation Planning application.
 */

import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect'
import { app } from './firebase.config'

// Initialize Data Connect
const dataConnect = getDataConnect(app, {
    connector: 'default',
    location: 'us-east1',
    service: 'woody-vacation-planning-tool-service'
})

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
    connectDataConnectEmulator(dataConnect, 'localhost', 9399)
}

// Export types from generated SDK (these will be generated when you run firebase dataconnect:sdk:generate)
// export type { User, Park, Attraction, Restaurant, Resort, Itinerary, VacationParty, Message, Location } from '@firebasegen/default-connector'

/**
 * User Operations
 */
export const UserOperations = {
    async getUser(_id: string) {
        // This will use the generated SDK once available
        // return await getUserQuery({ id })
        console.log('Data Connect SDK not yet generated. Run: firebase dataconnect:sdk:generate')
        return null
    },

    async getUserByEmail(_email: string) {
        // return await getUserByEmailQuery({ email })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async createUser(_data: {
        displayName: string
        email?: string
        photoUrl?: string
        preferences?: Record<string, unknown>
    }) {
        // return await createUserMutation(data)
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async updateUser(_id: string, _data: Partial<{
        displayName: string
        email: string
        photoUrl: string
        preferences: Record<string, unknown>
    }>) {
        // return await updateUserMutation({ id, ...data })
        console.log('Data Connect SDK not yet generated')
        return null
    }
}

/**
 * Park Operations
 */
export const ParkOperations = {
    async getAllParks() {
        // return await getAllParksQuery()
        console.log('Data Connect SDK not yet generated')
        return []
    },

    async getPark(_id: string) {
        // return await getParkQuery({ id })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async createPark(_data: {
        name: string
        description: string
        operatingHours?: string
    }) {
        // return await createParkMutation(data)
        console.log('Data Connect SDK not yet generated')
        return null
    }
}

/**
 * Attraction Operations
 */
export const AttractionOperations = {
    async getAttraction(_id: string) {
        // return await getAttractionQuery({ id })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async getAttractionsByPark(_parkId: string) {
        // return await getAttractionsByParkQuery({ parkId })
        console.log('Data Connect SDK not yet generated')
        return []
    },

    async updateWaitTime(_id: string, _waitTime: number) {
        // return await updateAttractionWaitTimeMutation({ id, waitTime })
        console.log('Data Connect SDK not yet generated')
        return null
    }
}

/**
 * Resort Operations
 */
export const ResortOperations = {
    async getAllResorts() {
        // return await getAllResortsQuery()
        console.log('Data Connect SDK not yet generated')
        return []
    },

    async getResort(_id: string) {
        // return await getResortQuery({ id })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async getResortsByCategory(_category: string) {
        // return await getResortsByCategoryQuery({ category })
        console.log('Data Connect SDK not yet generated')
        return []
    }
}

/**
 * Itinerary Operations
 */
export const ItineraryOperations = {
    async getUserItineraries(_userId: string) {
        // return await getUserItinerariesQuery({ userId })
        console.log('Data Connect SDK not yet generated')
        return []
    },

    async getItinerary(_id: string) {
        // return await getItineraryQuery({ id })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async createItinerary(_data: {
        userId: string
        name: string
        startDate: string
        endDate: string
        notes?: string
    }) {
        // return await createItineraryMutation(data)
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async updateItinerary(_id: string, _data: Partial<{
        name: string
        startDate: string
        endDate: string
        notes: string
    }>) {
        // return await updateItineraryMutation({ id, ...data })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async deleteItinerary(_id: string) {
        // return await deleteItineraryMutation({ id })
        console.log('Data Connect SDK not yet generated')
        return null
    }
}

/**
 * Vacation Party Operations
 */
export const VacationPartyOperations = {
    async getVacationParty(_id: string) {
        // return await getVacationPartyQuery({ id })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async getUserVacationParties(_userId: string) {
        // return await getUserVacationPartiesQuery({ userId })
        console.log('Data Connect SDK not yet generated')
        return []
    },

    async createVacationParty(_name: string) {
        // return await createVacationPartyMutation({ name })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async addUserToParty(_userId: string, _vacationPartyId: string) {
        // return await addUserToVacationPartyMutation({ userId, vacationPartyId })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async removeUserFromParty(_userId: string, _vacationPartyId: string) {
        // return await removeUserFromVacationPartyMutation({ userId, vacationPartyId })
        console.log('Data Connect SDK not yet generated')
        return null
    }
}

/**
 * Message Operations
 */
export const MessageOperations = {
    async getVacationPartyMessages(_vacationPartyId: string, _limit: number = 50) {
        // return await getVacationPartyMessagesQuery({ vacationPartyId, limit })
        console.log('Data Connect SDK not yet generated')
        return []
    },

    async sendMessage(_userId: string, _vacationPartyId: string, _content: string) {
        // return await sendMessageMutation({ userId, vacationPartyId, content })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async deleteMessage(_id: string) {
        // return await deleteMessageMutation({ id })
        console.log('Data Connect SDK not yet generated')
        return null
    }
}

/**
 * Location Operations
 */
export const LocationOperations = {
    async getUserLocation(_userId: string) {
        // return await getUserLocationQuery({ userId })
        console.log('Data Connect SDK not yet generated')
        return null
    },

    async getRecentLocations(_userIds: string[], _since: Date) {
        // return await getRecentLocationsQuery({ userIds, since: since.toISOString() })
        console.log('Data Connect SDK not yet generated')
        return []
    },

    async updateLocation(_userId: string, _latitude: number, _longitude: number) {
        // return await updateLocationMutation({ userId, latitude, longitude })
        console.log('Data Connect SDK not yet generated')
        return null
    }
}

/**
 * Instructions for completing Data Connect integration:
 *
 * 1. Deploy Data Connect schema and connectors:
 *    firebase dataconnect:services:deploy
 *
 * 2. Generate TypeScript SDK:
 *    firebase dataconnect:sdk:generate
 *
 * 3. Import generated types and functions from '@firebasegen/default-connector'
 *
 * 4. Replace console.log statements with actual SDK calls
 *
 * 5. Add error handling and retry logic as needed
 *
 * 6. Consider implementing caching for frequently accessed data
 */

const dataConnectService = {
    UserOperations,
    ParkOperations,
    AttractionOperations,
    ResortOperations,
    ItineraryOperations,
    VacationPartyOperations,
    MessageOperations,
    LocationOperations
}

export default dataConnectService