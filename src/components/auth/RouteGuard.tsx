"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface RouteGuardProps {
    readonly children: ReactNode
    readonly redirectTo?: string
}

export function RouteGuard({
    children,
    redirectTo = "/login"
}: RouteGuardProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Wait until auth state is determined
        if (!loading) {
            // If not authenticated, redirect to login
            if (!user) {
                router.push(`${redirectTo}?returnUrl=${encodeURIComponent(window.location.pathname)}`)
            }
        }
    }, [user, loading, router, redirectTo])

    // Show nothing while loading or if user isn't authenticated
    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl animate-spin">⏳</div>
            </div>
        )
    }

    // If authenticated, render children
    return <>{children}</>
}