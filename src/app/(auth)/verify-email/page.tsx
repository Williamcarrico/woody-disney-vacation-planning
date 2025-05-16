"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmail } from '@/lib/firebase/auth'
import { Button } from '@/components/ui/button'
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const actionCode = searchParams.get('oobCode')

        if (!actionCode) {
            setVerificationState('error')
            setErrorMessage('Invalid or expired verification link. Please request a new verification email.')
            return
        }

        const verifyUserEmail = async () => {
            try {
                await verifyEmail(actionCode)
                setVerificationState('success')
            } catch (error) {
                console.error('Error verifying email:', error)
                setVerificationState('error')
                setErrorMessage('Unable to verify email. The link may have expired or already been used.')
            }
        }

        verifyUserEmail()
    }, [searchParams])

    return (
        <AuthFormWrapper
            title="Email Verification"
            description="Verifying your email address"
        >
            <div className="flex flex-col items-center justify-center py-8">
                {verificationState === 'loading' && (
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Verifying your email...</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            This will only take a moment.
                        </p>
                    </div>
                )}

                {verificationState === 'success' && (
                    <div className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Email Verified!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your email has been successfully verified. You can now access all features of your account.
                        </p>
                        <Button onClick={() => router.push('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                )}

                {verificationState === 'error' && (
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {errorMessage}
                        </p>
                        <div className="space-y-3">
                            <Link href="/login">
                                <Button variant="outline" className="w-full">
                                    Return to Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthFormWrapper>
    )
}