"use client"

import { useState, FormEvent, ChangeEvent } from 'react'
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper'
import { FormInput } from '@/components/auth/FormInput'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { AlertCircleIcon, ArrowLeftIcon, CheckCircle2Icon } from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import { getEmailErrorMessage, getFirebaseErrorMessage } from '@/lib/utils/auth-validation'

export default function ForgotPassword() {
    const { forgotPassword } = useAuth()

    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [formError, setFormError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        setEmailError('')
        setFormError('')
    }

    const validateForm = (): boolean => {
        const error = getEmailErrorMessage(email)
        setEmailError(error)
        return !error
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setIsSubmitting(true)
            setFormError('')

            await forgotPassword(email)
            setIsSuccess(true)
        } catch (error) {
            console.error('Error sending password reset:', error)
            const errorMessage = getFirebaseErrorMessage(error as FirebaseError)
            setFormError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthFormWrapper
            title={isSuccess ? "Check your email" : "Reset your password"}
            description={
                isSuccess
                    ? "We've sent password reset instructions to your email"
                    : "Enter your email and we'll send you instructions to reset your password"
            }
            footer={
                <div className="mt-4 text-sm flex items-center justify-center">
                    <Link
                        href="/login"
                        className="flex items-center text-primary font-medium hover:underline"
                    >
                        <ArrowLeftIcon className="w-3 h-3 mr-1" />
                        Back to login
                    </Link>
                </div>
            }
        >
            {isSuccess ? (
                <div className="text-center p-4">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
                        <CheckCircle2Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                        We&apos;ve sent an email to <span className="font-medium">{email}</span> with instructions to reset your password.
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-8">
                        If you don&apos;t see it in your inbox, please check your spam folder. The link in the email will expire in 1 hour.
                    </p>

                    <Button
                        className="w-full"
                        onClick={() => {
                            setEmail('')
                            setIsSuccess(false)
                        }}
                    >
                        Try a different email
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        error={emailError}
                        required
                    />

                    {formError && (
                        <div className="flex bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                            <AlertCircleIcon className="h-5 w-5 flex-shrink-0 mr-2" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full spinner"></div>
                                Sending...
                            </>
                        ) : (
                            "Send Reset Instructions"
                        )}
                    </Button>

                    <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </form>
            )}
        </AuthFormWrapper>
    )
}