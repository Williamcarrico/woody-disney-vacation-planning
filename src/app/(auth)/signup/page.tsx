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
import {
    getEmailErrorMessage,
    getPasswordErrorMessage,
    getConfirmPasswordErrorMessage,
    getNameErrorMessage,
    getFirebaseErrorMessage
} from '@/lib/utils/auth-validation'

export default function Signup() {
    const router = useRouter()
    const { signUp, googleSignIn } = useAuth()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [formErrors, setFormErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        form: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))

        // Clear error when user starts typing
        if (formErrors[id as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [id]: '' }))
        }
    }

    const validateForm = (): boolean => {
        const nameError = getNameErrorMessage(formData.name)
        const emailError = getEmailErrorMessage(formData.email)
        const passwordError = getPasswordErrorMessage(formData.password)
        const confirmPasswordError = getConfirmPasswordErrorMessage(
            formData.password,
            formData.confirmPassword
        )

        setFormErrors({
            name: nameError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmPasswordError,
            form: ''
        })

        return !nameError && !emailError && !passwordError && !confirmPasswordError
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setIsSubmitting(true)
            setFormErrors(prev => ({ ...prev, form: '' }))

            await signUp(formData.email, formData.password, formData.name)
            router.push('/dashboard')
        } catch (error) {
            console.error('Error signing up:', error)
            const errorMessage = getFirebaseErrorMessage(error as FirebaseError)
            setFormErrors(prev => ({ ...prev, form: errorMessage }))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn()
            router.push('/dashboard')
        } catch (error) {
            console.error('Google sign in error:', error)
            const errorMessage = getFirebaseErrorMessage(error as FirebaseError)
            setFormErrors(prev => ({ ...prev, form: errorMessage }))
        }
    }

    return (
        <AuthFormWrapper
            title="Create your account"
            description="Sign up to start planning your magical Disney vacation"
            footer={
                <div className="text-center mt-4 text-sm">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-primary font-medium hover:underline"
                    >
                        Log in
                    </Link>
                </div>
            }
        >
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
                    id="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    error={formErrors.name}
                    required
                />

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

                <FormInput
                    id="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    error={formErrors.password}
                    required
                />

                <FormInput
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    error={formErrors.confirmPassword}
                    required
                />

                {formErrors.form && (
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                        {formErrors.form}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Creating account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </Link>
                </p>
            </form>
        </AuthFormWrapper>
    )
}