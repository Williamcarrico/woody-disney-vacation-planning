"use client"

import { useState } from 'react'
import { AlertCircle, X, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { User } from 'firebase/auth'
import { resendVerificationEmail } from '@/lib/firebase/auth'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

interface EmailVerificationBannerProps {
    readonly user: User
}

export function EmailVerificationBanner({ user }: EmailVerificationBannerProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [isResending, setIsResending] = useState(false)
    const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // Skip banner if email is already verified
    if (user.emailVerified || !isVisible) return null

    const handleResend = async () => {
        try {
            setIsResending(true)
            setResendStatus('idle')
            await resendVerificationEmail(user)
            setResendStatus('success')
        } catch (error) {
            console.error('Error resending verification email:', error)
            setResendStatus('error')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <Alert className="relative bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 mb-6">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-3 right-3 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 p-1 rounded-full"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-medium">
                Verify your email address
            </AlertTitle>
            <AlertDescription className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                <p className="mb-3">
                    Please verify your email ({user.email}) to access all features of your account.
                </p>

                {resendStatus === 'success' && (
                    <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-md text-sm mb-3">
                        Verification email sent! Please check your inbox.
                    </div>
                )}

                {resendStatus === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-2 rounded-md text-sm mb-3">
                        Failed to resend verification email. Please try again later.
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    onClick={handleResend}
                    disabled={isResending}
                >
                    {isResending ? (
                        <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Sending...
                        </>
                    ) : (
                        <>
                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                            Resend Verification Email
                        </>
                    )}
                </Button>
            </AlertDescription>
        </Alert>
    )
}