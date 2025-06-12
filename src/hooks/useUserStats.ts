import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'

interface UserStats {
    totalVisits: number
    upcomingReservations: number
    magicMoments: number
    achievementLevel: string
    totalPoints: number
    favoriteAttractions: string[]
    visitHistory: Array<{
        date: string
        park: string
        attractions: number
    }>
}

// Define and export the hook's return type
export interface UseUserStatsReturn {
    userStats: UserStats | null
    isLoading: boolean
    error: string | null
}

export function useUserStats(): UseUserStatsReturn {
    const { user } = useAuth()
    const [userStats, setUserStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.uid) {
            setIsLoading(false)
            return
        }

        const userStatsRef = doc(firestore, 'userStats', user.uid)

        const unsubscribe = onSnapshot(
            userStatsRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setUserStats(snapshot.data() as UserStats)
                } else {
                    // Initialize default stats for new users
                    setUserStats({
                        totalVisits: 0,
                        upcomingReservations: 0,
                        magicMoments: 0,
                        achievementLevel: 'New Explorer',
                        totalPoints: 0,
                        favoriteAttractions: [],
                        visitHistory: []
                    })
                }
                setIsLoading(false)
                setError(null)
            },
            (err) => {
                console.error('Error fetching user stats:', err)
                setError('Failed to load user statistics')
                setIsLoading(false)
            }
        )

        return () => unsubscribe()
    }, [user?.uid])

    return { userStats, isLoading, error }
}