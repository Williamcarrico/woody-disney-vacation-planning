"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { CircleOff, LogOutIcon } from 'lucide-react'

export default function Logout() {
    const router = useRouter()
    const { logout, user } = useAuth()

    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [logoutCompleted, setLogoutCompleted] = useState(false)

    // If not logged in, redirect to login
    useEffect(() => {
        if (!user && !isLoggingOut && !logoutCompleted) {
            router.push('/login')
        }
    }, [user, router, isLoggingOut, logoutCompleted])

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            setError(null)

            await logout()
            setLogoutCompleted(true)

            // After a brief delay to show success state, redirect to login
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (error) {
            console.error('Logout error:', error)
            setError('An error occurred during logout. Please try again.')
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <AuthFormWrapper
            title={logoutCompleted ? "You've been logged out" : "Log out of your account?"}
            description={
                logoutCompleted
                    ? "Thank you for using Disney Vacation Planning. See you next time!"
                    : "You're about to sign out of your Disney Vacation Planning account"
            }
        >
            <div className="text-center p-6">
                {logoutCompleted ? (
                    <div className="space-y-6">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <CircleOff className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            You have successfully logged out of your account.
                        </p>

                        <Button
                            variant="default"
                            className="w-full mt-4"
                            onClick={() => router.push('/login')}
                        >
                            Log back in
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <LogOutIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Are you sure you want to log out? Your vacation planning data is securely saved and will be available when you log back in.
                        </p>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm mt-4">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col space-y-3 mt-6">
                            <Button
                                variant="destructive"
                                className="w-full"
                                disabled={isLoggingOut}
                                onClick={handleLogout}
                            >
                                {isLoggingOut ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                        Logging out...
                                    </>
                                ) : (
                                    "Log Out"
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={isLoggingOut}
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-8">
                Not ready to leave?{' '}
                <Link
                    href="/dashboard"
                    className="text-primary font-medium hover:underline"
                >
                    Return to dashboard
                </Link>
            </div>
        </AuthFormWrapper>
    )
}