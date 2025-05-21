"use client"

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper'
import { FormInput } from '@/components/auth/FormInput'
import { SocialLoginButton } from '@/components/auth/SocialLoginButton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { FirebaseError } from 'firebase/app'
import { getEmailErrorMessage, getFirebaseErrorMessage } from '@/lib/utils/auth-validation'
import { SparklesIcon } from 'lucide-react'

export default function Login() {
    const router = useRouter()
    const { signIn, googleSignIn } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        form: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))

        // Clear error when user starts typing
        if (formErrors[id as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [id]: '' }))
        }
    }

    const validateForm = (): boolean => {
        const emailError = getEmailErrorMessage(formData.email)
        const passwordError = !formData.password ? "Password is required" : ""

        setFormErrors({
            email: emailError,
            password: passwordError,
            form: ''
        })

        return !emailError && !passwordError
    }

    // Get redirect URL from the query string
    const getRedirectPath = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            const redirectPath = urlParams.get('redirect')

            // Only redirect to internal paths (start with /)
            if (redirectPath && redirectPath.startsWith('/')) {
                return redirectPath
            }
        }

        // Default redirect
        return '/dashboard'
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setIsSubmitting(true)
            setFormErrors(prev => ({ ...prev, form: '' }))

            await signIn(formData.email, formData.password, rememberMe)

            // Redirect to the original requested page or dashboard
            router.push(getRedirectPath())
        } catch (error) {
            console.error('Login error:', error)
            const errorMessage = getFirebaseErrorMessage(error as FirebaseError)
            setFormErrors(prev => ({ ...prev, form: errorMessage }))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn(rememberMe)
            // Redirect to the original requested page or dashboard
            router.push(getRedirectPath())
        } catch (error) {
            console.error('Google sign in error:', error)
            const errorMessage = getFirebaseErrorMessage(error as FirebaseError)
            setFormErrors(prev => ({ ...prev, form: errorMessage }))
        }
    }

    return (
        <AuthFormWrapper
            title="Welcome back!"
            description="Log in to continue planning your Disney adventure"
            footer={
                <div className="text-center mt-4 text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="text-primary font-medium hover:underline"
                    >
                        Sign up
                    </Link>
                </div>
            }
        >
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start">
                    <SparklesIcon className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Log in to access your saved itineraries, view wait times, and continue planning your magical Disney vacation!
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <SocialLoginButton
                    provider="google"
                    onClick={handleGoogleSignIn}
                    className="mb-2"
                />

                <div className="relative flex items-center gap-2 py-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">OR</span>
                    <Separator className="flex-1" />
                </div>

                <FormInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    error={formErrors.email}
                    required
                />

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <FormInput
                            id="password"
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Your password"
                            error={formErrors.password}
                            required
                        />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-300">
                                Remember me
                            </label>
                        </div>
                        <Link
                            href="/forgot-password"
                            className="text-primary hover:underline text-xs"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {formErrors.form && (
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                        {formErrors.form}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Logging in...
                        </>
                    ) : (
                        "Log In"
                    )}
                </Button>
            </form>
        </AuthFormWrapper>
    )
}