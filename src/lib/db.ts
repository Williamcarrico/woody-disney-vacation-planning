import { db } from '@/db'
import { FirestoreService, UserService } from '@/lib/firebase/firestore-service'
import { realtimeDB } from '@/lib/firebase/realtime-database'

// Export the Drizzle database instance
export { db }

// Export Firebase services
export { FirestoreService, realtimeDB }

// Create service instances for backwards compatibility
export const firestoreService = FirestoreService

// For backwards compatibility with Prisma-style API routes,
// we'll create a mock prisma object that redirects to Firebase/Drizzle
// Note: ESLint unsafe-any rules disabled for this compatibility layer
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const prisma = {
    user: {
        findUnique: async ({ where, include }: any) => {
            // Use Firebase Auth for user data
            const userData = await UserService.getUserProfile(where.id)
            return userData
        },
        findMany: async ({ where, include, orderBy }: any) => {
            const users = await UserService.getUsers(where)
            return users
        }
    },

    parkVisit: {
        findMany: async ({ where, orderBy }: any) => {
            const visits = await UserService.getParkVisits(where.userId, {
                startDate: where.visitDate?.gte,
                endDate: where.visitDate?.lte
            })
            return visits
        }
    },

    reservation: {
        findMany: async ({ where, include }: any) => {
            const reservations = await UserService.getReservations(where.userId, {
                status: where.status?.in,
                startTime: where.reservationTime?.gte
            })
            return reservations
        }
    },

    attractionVisit: {
        findMany: async ({ where, include }: any) => {
            const visits = await UserService.getAttractionVisits(where.userId, {
                startDate: where.visitDate?.gte,
                status: where.status
            })
            return visits
        }
    },

    expense: {
        aggregate: async ({ where, _sum, _count }: any) => {
            const expenses = await UserService.getExpenses(where.userId, {
                startDate: where.date?.gte
            })

            const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

            return {
                _sum: { amount: total },
                _count: expenses.length
            }
        }
    },

    userAchievement: {
        findMany: async ({ where, include }: any) => {
            const achievements = await UserService.getUserAchievements(where.userId)
            return achievements.filter(a => a.unlockedAt !== null)
        }
    },

    photo: {
        count: async ({ where }: any) => {
            const photos = await UserService.getPhotos(where.userId, {
                startDate: where.createdAt?.gte
            })
            return photos.length
        }
    },

    friendship: {
        count: async ({ where }: any) => {
            const friends = await UserService.getFriendships(where.OR[0].requesterId || where.OR[1].addresseeId)
            return friends.filter(f => f.status === 'ACCEPTED').length
        }
    },

    fitnessData: {
        findMany: async ({ where, select }: any) => {
            const fitnessData = await UserService.getFitnessData(where.userId, {
                startDate: where.date?.gte
            })
            return fitnessData
        }
    },

    fastPass: {
        findMany: async ({ where }: any) => {
            const fastPasses = await UserService.getFastPasses(where.userId, {
                startDate: where.usedAt?.gte,
                status: where.status
            })
            return fastPasses
        }
    },

    parkCapacity: {
        findFirst: async ({ where, orderBy }: any) => {
            const capacity = await UserService.getParkCapacity({
                date: where.date?.gte
            })
            return capacity
        }
    },

    magicMoment: {
        count: async ({ where }: any) => {
            const moments = await UserService.getMagicMoments(where.userId, {
                startDate: where.createdAt?.gte
            })
            return moments.length
        }
    },

    // Event types for reservation API
    diningReservation: {
        findMany: async ({ where, include }: any) => {
            return await UserService.getDiningReservations(where.userId, where)
        }
    },

    attractionReservation: {
        findMany: async ({ where, include }: any) => {
            return await UserService.getAttractionReservations(where.userId, where)
        }
    },

    showReservation: {
        findMany: async ({ where, include }: any) => {
            return await UserService.getShowReservations(where.userId, where)
        }
    },

    lightningLane: {
        findMany: async ({ where, include }: any) => {
            return await UserService.getLightningLanes(where.userId, where)
        }
    },

    specialEvent: {
        findMany: async ({ where, include }: any) => {
            return await UserService.getSpecialEvents(where.userId, where)
        }
    },

    geniePlus: {
        findMany: async ({ where, include }: any) => {
            return await UserService.getGeniePlus(where.userId, where)
        }
    }
}

// Export default database for backwards compatibility
export default db