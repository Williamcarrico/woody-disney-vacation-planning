/**
 * Extended Validated Services
 * 
 * Additional validated service implementations for remaining collections
 */

import { ZodError } from 'zod'
import * as schemas from '@/lib/schemas/firebase-validation'
import { ValidatedFirestoreService, ValidationError, QueryOptions } from './validated-firestore-service'

export class ValidatedItineraryService {
    static async getItinerary(id: string) {
        return ValidatedFirestoreService.getDocument('itineraries', id, schemas.itinerarySchema)
    }

    static async getItineraries(userId: string, options?: QueryOptions) {
        return ValidatedFirestoreService.getDocuments('itineraries', schemas.itinerarySchema, {
            ...options,
            where: [{ field: 'userId', operator: '==', value: userId }, ...(options?.where || [])]
        })
    }

    static async getItineraryByShareCode(shareCode: string) {
        const result = await ValidatedFirestoreService.getDocuments('itineraries', schemas.itinerarySchema, {
            where: [{ field: 'shareCode', operator: '==', value: shareCode }],
            limit: 1
        })
        return result.data[0] || null
    }

    static async createItinerary(data: schemas.CreateItineraryInput) {
        return ValidatedFirestoreService.createDocument('itineraries', data, schemas.createItineraryInputSchema)
    }

    static async updateItinerary(id: string, data: Partial<schemas.CreateItineraryInput>) {
        return ValidatedFirestoreService.updateDocument('itineraries', id, data, schemas.createItineraryInputSchema.partial())
    }

    static async deleteItinerary(id: string) {
        return ValidatedFirestoreService.deleteDocument('itineraries', id)
    }

    static subscribeToItineraries(
        userId: string,
        callback: (itineraries: schemas.Itinerary[]) => void,
        onValidationError?: (errors: Array<{ id: string; errors: ZodError['errors'] }>) => void
    ) {
        return ValidatedFirestoreService.subscribeToCollection(
            'itineraries',
            schemas.itinerarySchema,
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                onValidationError
            },
            callback
        )
    }
}

export class ValidatedCalendarEventService {
    static async getCalendarEvent(id: string) {
        return ValidatedFirestoreService.getDocument('calendarEvents', id, schemas.calendarEventSchema)
    }

    static async getCalendarEvents(vacationId: string, options?: QueryOptions) {
        return ValidatedFirestoreService.getDocuments('calendarEvents', schemas.calendarEventSchema, {
            ...options,
            where: [{ field: 'vacationId', operator: '==', value: vacationId }, ...(options?.where || [])]
        })
    }

    static async createCalendarEvent(data: schemas.CreateCalendarEventInput) {
        return ValidatedFirestoreService.createDocument('calendarEvents', data, schemas.createCalendarEventInputSchema)
    }

    static async updateCalendarEvent(id: string, data: Partial<schemas.CreateCalendarEventInput>) {
        return ValidatedFirestoreService.updateDocument('calendarEvents', id, data, schemas.createCalendarEventInputSchema.partial())
    }

    static async deleteCalendarEvent(id: string) {
        return ValidatedFirestoreService.deleteDocument('calendarEvents', id)
    }

    static subscribeToCalendarEvents(
        vacationId: string,
        callback: (events: schemas.CalendarEvent[]) => void,
        onValidationError?: (errors: Array<{ id: string; errors: ZodError['errors'] }>) => void
    ) {
        return ValidatedFirestoreService.subscribeToCollection(
            'calendarEvents',
            schemas.calendarEventSchema,
            {
                where: [{ field: 'vacationId', operator: '==', value: vacationId }],
                orderBy: [{ field: 'date', direction: 'asc' }],
                onValidationError
            },
            callback
        )
    }
}

export class ValidatedUserLocationService {
    static async getUserLocation(id: string) {
        return ValidatedFirestoreService.getDocument('userLocations', id, schemas.userLocationSchema)
    }

    static async getUserLocations(userId: string, options?: QueryOptions) {
        return ValidatedFirestoreService.getDocuments('userLocations', schemas.userLocationSchema, {
            ...options,
            where: [{ field: 'userId', operator: '==', value: userId }, ...(options?.where || [])]
        })
    }

    static async getCurrentLocation(userId: string) {
        const result = await ValidatedFirestoreService.getDocuments('userLocations', schemas.userLocationSchema, {
            where: [
                { field: 'userId', operator: '==', value: userId },
                { field: 'type', operator: '==', value: 'current' },
                { field: 'isActive', operator: '==', value: true }
            ],
            orderBy: [{ field: 'timestamp', direction: 'desc' }],
            limit: 1
        })
        return result.data[0] || null
    }

    static async createUserLocation(data: schemas.CreateUserLocationInput) {
        return ValidatedFirestoreService.createDocument('userLocations', data, schemas.createUserLocationInputSchema)
    }

    static async updateUserLocation(id: string, data: Partial<schemas.CreateUserLocationInput>) {
        return ValidatedFirestoreService.updateDocument('userLocations', id, data, schemas.createUserLocationInputSchema.partial())
    }

    static subscribeToUserLocations(
        userId: string,
        callback: (locations: schemas.UserLocation[]) => void,
        onValidationError?: (errors: Array<{ id: string; errors: ZodError['errors'] }>) => void
    ) {
        return ValidatedFirestoreService.subscribeToCollection(
            'userLocations',
            schemas.userLocationSchema,
            {
                where: [{ field: 'userId', operator: '==', value: userId }],
                orderBy: [{ field: 'timestamp', direction: 'desc' }],
                onValidationError
            },
            callback
        )
    }
}

export class ValidatedGeofenceService {
    static async getGeofence(id: string) {
        return ValidatedFirestoreService.getDocument('geofences', id, schemas.geofenceSchema)
    }

    static async getGeofences(options?: QueryOptions & { vacationId?: string }) {
        const queryOptions = { ...options }
        if (options?.vacationId) {
            queryOptions.where = [
                ...(queryOptions.where || []),
                { field: 'vacationId', operator: '==', value: options.vacationId }
            ]
        }
        return ValidatedFirestoreService.getDocuments('geofences', schemas.geofenceSchema, queryOptions)
    }

    static async getActiveGeofences(vacationId?: string) {
        const where: Array<{ field: string; operator: any; value: unknown }> = [
            { field: 'isActive', operator: '==', value: true }
        ]
        if (vacationId) {
            where.push({ field: 'vacationId', operator: '==', value: vacationId })
        }
        return ValidatedFirestoreService.getDocuments('geofences', schemas.geofenceSchema, { where })
    }

    static async createGeofence(data: schemas.CreateGeofenceInput) {
        return ValidatedFirestoreService.createDocument('geofences', data, schemas.createGeofenceInputSchema)
    }

    static async updateGeofence(id: string, data: Partial<schemas.CreateGeofenceInput>) {
        return ValidatedFirestoreService.updateDocument('geofences', id, data, schemas.createGeofenceInputSchema.partial())
    }

    static async deleteGeofence(id: string) {
        return ValidatedFirestoreService.deleteDocument('geofences', id)
    }

    static subscribeToGeofences(
        options: {
            vacationId?: string
            onlyActive?: boolean
        },
        callback: (geofences: schemas.Geofence[]) => void,
        onValidationError?: (errors: Array<{ id: string; errors: ZodError['errors'] }>) => void
    ) {
        const where: Array<{ field: string; operator: any; value: unknown }> = []
        
        if (options.vacationId) {
            where.push({ field: 'vacationId', operator: '==', value: options.vacationId })
        }
        
        if (options.onlyActive) {
            where.push({ field: 'isActive', operator: '==', value: true })
        }

        return ValidatedFirestoreService.subscribeToCollection(
            'geofences',
            schemas.geofenceSchema,
            { where, onValidationError },
            callback
        )
    }
} 