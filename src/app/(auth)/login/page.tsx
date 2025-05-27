"use client"

import { useState, FormEvent, ChangeEvent, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react'
import { FormInput } from '@/components/auth/FormInput'
import { SocialLoginButton } from '@/components/auth/SocialLoginButton'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { FirebaseError } from 'firebase/app'
import { getEmailErrorMessage, getFirebaseErrorMessage } from '@/lib/utils/auth-validation'
import {
    SparklesIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    EyeIcon,
    EyeOffIcon,
    KeyIcon,
    MailIcon,
    LockIcon,
    WandIcon,
    Castle,
    Star,
    Loader2,
    ArrowRightIcon,
    UserCheckIcon,
    Fingerprint
} from 'lucide-react'
import { ShineBorder } from '@/components/magicui/shine-border'
import { BorderBeam } from '@/components/magicui/border-beam'
import { MagicCard } from '@/components/magicui/magic-card'
import BlurFade from '@/components/magicui/blur-fade'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { cn } from '@/lib/utils'

// Enhanced form validation with strength checking
const validatePasswordStrength = (password: string) => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const score = Object.values(checks).filter(Boolean).length
    const strength: 'weak' | 'medium' | 'strong' = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
    return { checks, score, strength }
}

// Enhanced email validation
const validateEmailAdvanced = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const isValid = emailRegex.test(email)
    const domain = email.split('@')[1]
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']
    const isCommonDomain = commonDomains.includes(domain?.toLowerCase())

    return { isValid, isCommonDomain, domain }
}

// Magnetic hover effect
interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    onClick?: () => void
}

const MagneticButton = ({ children, className, type, disabled, onClick }: MagneticButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { damping: 25, stiffness: 300 })
    const springY = useSpring(y, { damping: 25, stiffness: 300 })

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set((e.clientX - centerX) * 0.1)
        y.set((e.clientY - centerY) * 0.1)
    }, [x, y])

    const handleMouseLeave = useCallback(() => {
        x.set(0)
        y.set(0)
    }, [x, y])

    return (
        <motion.button
            ref={ref}
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={className}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.button>
    )
}

// Enhanced form state interface
interface EnhancedFormState {
    email: string
    password: string
    showPassword: boolean
    emailTouched: boolean
    passwordTouched: boolean
    isEmailValid: boolean
    passwordStrength: 'weak' | 'medium' | 'strong' | null
}

interface UIState {
    isSubmitting: boolean
    rememberMe: boolean
    showAdvancedOptions: boolean
    attemptCount: number
    lastAttemptTime: Date | null
    showSuccessAnimation: boolean
}

export default function EnhancedLogin() {
    const router = useRouter()
    const { signIn, googleSignIn } = useAuth()
    const formRef = useRef<HTMLFormElement>(null)

    // Enhanced form state
    const [formState, setFormState] = useState<EnhancedFormState>({
        email: '',
        password: '',
        showPassword: false,
        emailTouched: false,
        passwordTouched: false,
        isEmailValid: false,
        passwordStrength: null
    })

    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        form: ''
    })

    const [uiState, setUiState] = useState<UIState>({
        isSubmitting: false,
        rememberMe: false,
        showAdvancedOptions: false,
        attemptCount: 0,
        lastAttemptTime: null,
        showSuccessAnimation: false
    })

    // Real-time validation effects
    useEffect(() => {
        if (formState.emailTouched && formState.email) {
            const emailValidation = validateEmailAdvanced(formState.email)
            setFormState(prev => ({ ...prev, isEmailValid: emailValidation.isValid }))

            if (!emailValidation.isValid) {
                setFormErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
            } else {
                setFormErrors(prev => ({ ...prev, email: '' }))
            }
        }
    }, [formState.email, formState.emailTouched])

    useEffect(() => {
        if (formState.passwordTouched && formState.password) {
            const passwordValidation = validatePasswordStrength(formState.password)
            setFormState(prev => ({ ...prev, passwordStrength: passwordValidation.strength }))

            if (passwordValidation.score < 2) {
                setFormErrors(prev => ({
                    ...prev,
                    password: 'Password should be stronger. Try adding uppercase, numbers, or symbols.'
                }))
            } else {
                setFormErrors(prev => ({ ...prev, password: '' }))
            }
        }
    }, [formState.password, formState.passwordTouched])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        setFormState(prev => ({
            ...prev,
            [id]: value,
            [`${id}Touched`]: true
        }))

        // Clear form errors when user starts typing
        if (id === 'email' || id === 'password') {
            if (formErrors[id]) {
                setFormErrors(prev => ({ ...prev, [id]: '' }))
            }
        }
    }

    const togglePasswordVisibility = () => {
        setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))
    }

    const validateForm = (): boolean => {
        const emailError = getEmailErrorMessage(formState.email)
        const passwordError = !formState.password ? "Password is required" : ""

        setFormErrors({
            email: emailError,
            password: passwordError,
            form: ''
        })

        return !emailError && !passwordError
    }

    // Enhanced redirect path logic
    const getRedirectPath = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            const redirectPath = urlParams.get('redirect')

            // Enhanced security check for redirect path
            if (redirectPath &&
                redirectPath.startsWith('/') &&
                !redirectPath.startsWith('//') &&
                !redirectPath.includes('..')) {
                return redirectPath
            }
        }

        return '/dashboard'
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        // Rate limiting check
        if (uiState.attemptCount >= 3 && uiState.lastAttemptTime) {
            const timeSinceLastAttempt = Date.now() - uiState.lastAttemptTime.getTime()
            if (timeSinceLastAttempt < 60000) { // 1 minute cooldown
                setFormErrors(prev => ({
                    ...prev,
                    form: 'Too many login attempts. Please wait a minute before trying again.'
                }))
                return
            }
        }

        try {
            setUiState(prev => ({ ...prev, isSubmitting: true }))
            setFormErrors(prev => ({ ...prev, form: '' }))

            await signIn(formState.email, formState.password, uiState.rememberMe)

            // Success animation
            setUiState(prev => ({ ...prev, showSuccessAnimation: true }))

            // Delay redirect for animation
            setTimeout(() => {
                router.push(getRedirectPath())
            }, 1000)
        } catch (error) {
            console.error('Login error:', error)
            const errorMessage = error instanceof FirebaseError
                ? getFirebaseErrorMessage(error)
                : 'An unexpected error occurred. Please try again.'

            setFormErrors(prev => ({ ...prev, form: errorMessage }))
            setUiState(prev => ({
                ...prev,
                attemptCount: prev.attemptCount + 1,
                lastAttemptTime: new Date()
            }))
        } finally {
            setUiState(prev => ({ ...prev, isSubmitting: false }))
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setUiState(prev => ({ ...prev, isSubmitting: true }))
            await googleSignIn(uiState.rememberMe)

            setUiState(prev => ({ ...prev, showSuccessAnimation: true }))
            setTimeout(() => {
                router.push(getRedirectPath())
            }, 1000)
        } catch (error) {
            console.error('Google sign in error:', error)
            const errorMessage = error instanceof FirebaseError
                ? getFirebaseErrorMessage(error)
                : 'An unexpected error occurred. Please try again.'
            setFormErrors(prev => ({ ...prev, form: errorMessage }))
            setUiState(prev => ({ ...prev, isSubmitting: false }))
        }
    }

    // Password strength indicator component
    const PasswordStrengthIndicator = () => {
        if (!formState.passwordTouched || !formState.password || !formState.passwordStrength) return null

        const strength = formState.passwordStrength
        const colors = {
            weak: 'bg-red-500',
            medium: 'bg-yellow-500',
            strong: 'bg-green-500'
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
            >
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Strength:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                            <div
                                key={level}
                                className={cn(
                                    "h-1 w-6 rounded-full transition-colors",
                                    level <= (strength === 'weak' ? 1 : strength === 'medium' ? 2 : 3)
                                        ? colors[strength]
                                        : 'bg-muted'
                                )}
                            />
                        ))}
                    </div>
                    <span className={cn(
                        "capitalize font-medium",
                        strength === 'weak' ? 'text-red-500' :
                            strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    )}>
                        {strength}
                    </span>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated background pattern */}
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                className="inset-0 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
            />

            {/* Enhanced background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-40 right-32 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                />
                <motion.div
                    className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-400/15 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 4 }}
                />
            </div>

            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
                {/* Enhanced Logo Section */}
                <BlurFade delay={0.1} className="mb-8 flex flex-col items-center">
                    <motion.div
                        className="mb-6 relative group"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <ShineBorder
                            className="rounded-xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                            borderWidth={2}
                            duration={8}
                            shineColor={["#8b5cf6", "#3b82f6", "#8b5cf6"]}
                        >
                            <div className="flex items-center gap-3">
                                <Castle className="h-10 w-10 text-primary" />
                                <div>
                                    <SparklesText
                                        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                        sparklesCount={8}
                                    >
                                        Disney Vacation
                                    </SparklesText>
                                    <p className="text-sm text-muted-foreground">Planning Portal</p>
                                </div>
                            </div>
                        </ShineBorder>
                    </motion.div>

                    <AnimatedGradientText className="mb-4">
                        ✨ Welcome back to the magic! ✨
                    </AnimatedGradientText>
                </BlurFade>

                {/* Enhanced Form Card */}
                <BlurFade delay={0.3} className="w-full max-w-md">
                    <MagicCard
                        className="relative p-1 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-slate-900/50 dark:to-slate-800/50"
                        gradientSize={300}
                        gradientColor="#8b5cf620"
                        gradientFrom="#3b82f6"
                        gradientTo="#8b5cf6"
                    >
                        <BorderBeam
                            size={200}
                            duration={8}
                            colorFrom="#3b82f6"
                            colorTo="#8b5cf6"
                        />

                        <Card className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0">
                            <CardContent className="p-8">
                                {/* Success Animation */}
                                <AnimatePresence>
                                    {uiState.showSuccessAnimation && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-lg z-50"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: "spring" }}
                                                className="text-center"
                                            >
                                                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-2" />
                                                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                                                    Welcome back!
                                                </p>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Enhanced Welcome Message */}
                                <motion.div
                                    className="text-center mb-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Welcome Back!
                                    </h1>
                                    <p className="text-muted-foreground flex items-center justify-center gap-2">
                                        <WandIcon className="h-4 w-4" />
                                        Continue planning your magical adventure
                                    </p>
                                </motion.div>

                                {/* Enhanced Info Card */}
                                <BlurFade delay={0.5}>
                                    <motion.div
                                        className="mb-6 relative overflow-hidden rounded-lg"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 border border-blue-100 dark:border-blue-900/50">
                                            <div className="flex items-start gap-3">
                                                <motion.div
                                                    animate={{ rotate: [0, 10, -10, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                                >
                                                    <SparklesIcon className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
                                                </motion.div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Access your personalized dashboard
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3" />
                                                            Saved itineraries
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ShieldCheckIcon className="h-3 w-3" />
                                                            Real-time wait times
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </BlurFade>

                                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                                    {/* Enhanced Social Login */}
                                    <BlurFade delay={0.6}>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <SocialLoginButton
                                                provider="google"
                                                onClick={handleGoogleSignIn}
                                                className="mb-4 relative overflow-hidden"
                                            />
                                        </motion.div>
                                    </BlurFade>

                                    <BlurFade delay={0.7}>
                                        <div className="relative flex items-center gap-4 py-4">
                                            <Separator className="flex-1" />
                                            <motion.span
                                                className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 rounded-full border"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                OR
                                            </motion.span>
                                            <Separator className="flex-1" />
                                        </div>
                                    </BlurFade>

                                    {/* Enhanced Email Input */}
                                    <BlurFade delay={0.8}>
                                        <motion.div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                                <MailIcon className="h-4 w-4 text-blue-500" />
                                                Email Address
                                                {formState.isEmailValid && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring" }}
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                    </motion.div>
                                                )}
                                            </Label>
                                            <FormInput
                                                id="email"
                                                label=""
                                                type="email"
                                                value={formState.email}
                                                onChange={handleInputChange}
                                                placeholder="your.email@example.com"
                                                error={formErrors.email}
                                                required
                                                className="transition-all duration-200"
                                            />
                                        </motion.div>
                                    </BlurFade>

                                    {/* Enhanced Password Input */}
                                    <BlurFade delay={0.9}>
                                        <motion.div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                                                <LockIcon className="h-4 w-4 text-purple-500" />
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <FormInput
                                                    id="password"
                                                    label=""
                                                    type={formState.showPassword ? "text" : "password"}
                                                    value={formState.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    error={formErrors.password}
                                                    required
                                                    className="pr-12 transition-all duration-200"
                                                />
                                                <motion.button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                    onClick={togglePasswordVisibility}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {formState.showPassword ? (
                                                            <motion.div
                                                                key="hide"
                                                                initial={{ opacity: 0, rotate: -90 }}
                                                                animate={{ opacity: 1, rotate: 0 }}
                                                                exit={{ opacity: 0, rotate: 90 }}
                                                            >
                                                                <EyeOffIcon className="h-4 w-4" />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="show"
                                                                initial={{ opacity: 0, rotate: -90 }}
                                                                animate={{ opacity: 1, rotate: 0 }}
                                                                exit={{ opacity: 0, rotate: 90 }}
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.button>
                                            </div>
                                            <PasswordStrengthIndicator />
                                        </motion.div>
                                    </BlurFade>

                                    {/* Enhanced Options Row */}
                                    <BlurFade delay={1.0}>
                                        <div className="flex justify-between items-center text-sm">
                                            <motion.div
                                                className="flex items-center space-x-2"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Checkbox
                                                    id="remember"
                                                    checked={uiState.rememberMe}
                                                    onCheckedChange={(checked) =>
                                                        setUiState(prev => ({ ...prev, rememberMe: !!checked }))
                                                    }
                                                />
                                                <Label
                                                    htmlFor="remember"
                                                    className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer flex items-center gap-2"
                                                >
                                                    <UserCheckIcon className="h-3 w-3" />
                                                    Remember me
                                                </Label>
                                            </motion.div>
                                            <motion.div whileHover={{ scale: 1.05 }}>
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-primary hover:underline text-xs flex items-center gap-1 transition-colors"
                                                >
                                                    <KeyIcon className="h-3 w-3" />
                                                    Forgot password?
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </BlurFade>

                                    {/* Enhanced Error Display */}
                                    <AnimatePresence>
                                        {formErrors.form && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm flex items-start gap-3"
                                            >
                                                <AlertCircleIcon className="h-5 w-5 flex-shrink0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Authentication Error</p>
                                                    <p className="text-xs mt-1 opacity-90">{formErrors.form}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Enhanced Submit Button */}
                                    <BlurFade delay={1.1}>
                                        <MagneticButton
                                            type="submit"
                                            className={cn(
                                                "w-full relative overflow-hidden group",
                                                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                                                "text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300",
                                                "shadow-lg hover:shadow-xl transform-gpu",
                                                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                                                "focus:outline-none focus:ring focus:ring-blue-500/30 focus:ring-offset-2"
                                            )}
                                            disabled={uiState.isSubmitting || uiState.showSuccessAnimation}
                                        >
                                            <ShineBorder
                                                className="absolute inset-0 rounded-lg"
                                                borderWidth={1}
                                                duration={3}
                                                shineColor={["#ffffff40", "#ffffff60", "#ffffff40"]}
                                            />
                                            <motion.div
                                                className="relative flex items-center justify-center gap-2"
                                                whileHover={{ x: 2 }}
                                            >
                                                <AnimatePresence mode="wait">
                                                    {uiState.isSubmitting ? (
                                                        <motion.div
                                                            key="loading"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span>Signing you in...</span>
                                                        </motion.div>
                                                    ) : uiState.showSuccessAnimation ? (
                                                        <motion.div
                                                            key="success"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <CheckCircleIcon className="h-4 w-4" />
                                                            <span>Welcome back!</span>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="default"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <span>Sign In</span>
                                                            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </MagneticButton>
                                    </BlurFade>

                                    {/* Enhanced Security Notice */}
                                    <BlurFade delay={1.2}>
                                        <motion.div
                                            className="text-center mt-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                <Fingerprint className="h-4 w-4" />
                                                <span>Your data is protected with enterprise-grade encryption</span>
                                            </div>
                                        </motion.div>
                                    </BlurFade>
                                </form>

                                {/* Enhanced Footer */}
                                <BlurFade delay={1.3}>
                                    <motion.div
                                        className="text-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-800"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            New to Disney Vacation Planning?{' '}
                                            <Link
                                                href="/signup"
                                                className="text-primary font-medium hover:underline transition-colors inline-flex items-center gap-1"
                                            >
                                                Create your magical account
                                                <motion.span
                                                    animate={{ x: [0, 2, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="inline-block"
                                                >
                                                    <WandIcon className="h-3 w-3" />
                                                </motion.span>
                                            </Link>
                                        </p>
                                    </motion.div>
                                </BlurFade>
                            </CardContent>
                        </Card>
                    </MagicCard>
                </BlurFade>
            </div>
        </div>
    )
}