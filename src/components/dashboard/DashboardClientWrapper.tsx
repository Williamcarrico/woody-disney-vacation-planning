"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { database } from "@/lib/firebase/firebase.config"
import { ref, onValue, off } from "firebase/database"

interface DashboardClientWrapperProps {
    userId: string
    currentVacation?: any
}

export default function DashboardClientWrapper({
    userId,
    currentVacation
}: DashboardClientWrapperProps) {
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        // Subscribe to real-time notifications
        const notificationsRef = ref(database, `users/${userId}/notifications`)
        const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                const notifications = Object.values(data) as any[]
                const unreadNotifications = notifications.filter(n => !n.read)

                if (unreadNotifications.length > 0) {
                    const latest = unreadNotifications[0]
                    toast(latest.title, {
                        description: latest.description,
                        action: latest.actionLabel ? {
                            label: latest.actionLabel,
                            onClick: () => {
                                if (latest.actionUrl) {
                                    router.push(latest.actionUrl)
                                }
                            }
                        } : undefined
                    })
                }
            }
        })

        // Subscribe to vacation updates if there's an active vacation
        let unsubscribeVacation: (() => void) | undefined
        if (currentVacation?.id) {
            const vacationRef = ref(database, `vacations/${currentVacation.id}/updates`)
            unsubscribeVacation = onValue(vacationRef, (snapshot) => {
                const updates = snapshot.val()
                if (updates) {
                    // Refresh the page to show new data
                    router.refresh()
                }
            })
        }

        // Cleanup subscriptions
        return () => {
            off(notificationsRef, 'value', unsubscribeNotifications)
            if (unsubscribeVacation) {
                unsubscribeVacation()
            }
        }
    }, [userId, currentVacation?.id, router])

    // This component doesn't render anything visible
    return null
}