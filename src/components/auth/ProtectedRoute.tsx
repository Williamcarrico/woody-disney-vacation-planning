"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { EmailVerificationBanner } from './EmailVerificationBanner'

interface ProtectedRouteProps {
    readonly children: React.ReactNode
}

export function ProtectedRoute({ children }: Readonly<ProtectedRouteProps>) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // If not loading and no user, redirect to login
        if (!loading && !user) {
            // Pass the current route as a redirect parameter
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        }
    }, [user, loading, router, pathname])

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    // Only render children if authenticated
    return user ? (
        <>
            {/* Only show verification banner if user's email is not verified */}
            {user && !user.emailVerified && <EmailVerificationBanner user={user} />}
            {children}
        </>
    ) : null
}