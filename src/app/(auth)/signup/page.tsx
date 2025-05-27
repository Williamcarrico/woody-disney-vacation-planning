"use client"

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper'
import { SocialLoginButton } from '@/components/auth/SocialLoginButton'
import { Button } from '@/components/ui/button'
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
import { Sparkles, Star, Castle, Wand2, Heart, Users, MapPin, LucideIcon } from 'lucide-react'

// Magical floating particles component
const FloatingParticles = () => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        size: 1 + Math.random() * 3
    }))

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 opacity-20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}

// Magical sparkle effect
const SparkleEffect = ({ active }: { active: boolean }) => (
    <AnimatePresence>
        {active && (
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                        style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            rotate: [0, 180, 360],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 2,
                        }}
                    />
                ))}
            </motion.div>
        )}
    </AnimatePresence>
)

// Enhanced Form Input with magical interactions
const MagicalFormInput = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    required,
    icon: Icon
}: {
    id: string
    label: string
    type?: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    placeholder: string
    error?: string
    required?: boolean
    icon?: LucideIcon
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    useEffect(() => {
        setHasValue(value.length > 0)
    }, [value])

    return (
        <motion.div
            className="relative group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className="relative">
                {/* Magical background glow */}
                <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 blur-sm"
                    animate={{
                        opacity: isFocused ? 1 : 0,
                        scale: isFocused ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                />

                {/* Icon */}
                {Icon && (
                    <motion.div
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                        animate={{
                            color: isFocused ? "#8b5cf6" : "#64748b",
                            scale: isFocused ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <Icon className="w-5 h-5" />
                    </motion.div>
                )}

                {/* Floating label */}
                <motion.label
                    htmlFor={id}
                    className="absolute left-4 text-slate-500 pointer-events-none transition-all duration-300 ease-in-out origin-left"
                    animate={{
                        y: isFocused || hasValue ? -32 : 0,
                        x: isFocused || hasValue ? 0 : Icon ? 28 : 0,
                        scale: isFocused || hasValue ? 0.85 : 1,
                        color: error ? "#ef4444" : isFocused ? "#8b5cf6" : "#64748b",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    {label} {required && <span className="text-red-400">*</span>}
                </motion.label>

                <motion.input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={isFocused ? placeholder : ""}
                    className={`
                        w-full px-4 py-4 ${Icon ? 'pl-12' : ''} rounded-xl border-2
                        bg-white/10 backdrop-blur-sm
                        transition-all duration-300 ease-in-out
                        focus:outline-none focus:ring-0
                        ${error
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200/50 focus:border-purple-400 hover:border-purple-300'
                        }
                        placeholder:text-slate-400/70
                        text-slate-800 dark:text-slate-200
                    `}
                    whileFocus={{ scale: 1.02 }}
                />

                {/* Sparkle effect on focus */}
                <SparkleEffect active={isFocused} />
            </div>

            {/* Error message with animation */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            ⚠️
                        </motion.div>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// Magical progress indicator
const MagicalProgressIndicator = ({ progress }: { progress: number }) => (
    <motion.div className="w-full bg-slate-200/20 rounded-full h-2 overflow-hidden mb-6">
        <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <motion.div
                className="absolute inset-0 bg-white/30 rounded-full"
                animate={{
                    x: ["-100%", "100%"],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </motion.div>
    </motion.div>
)

export default function Signup() {
    const router = useRouter()
    const { signUp, googleSignIn } = useAuth()
    const controls = useAnimation()

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
    const [rememberMe, setRememberMe] = useState(true)
    const [formProgress, setFormProgress] = useState(0)
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

    // Calculate form progress
    useEffect(() => {
        const fields = [formData.name, formData.email, formData.password, formData.confirmPassword]
        const filledFields = fields.filter(field => field.length > 0).length
        const progress = (filledFields / fields.length) * 100
        setFormProgress(progress)
    }, [formData])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))

        // Clear error when user starts typing with animation
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

        if (!validateForm()) {
            // Shake animation for invalid form
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5 }
            })
            return
        }

        try {
            setIsSubmitting(true)
            setFormErrors(prev => ({ ...prev, form: '' }))

            // Show success animation
            setShowSuccessAnimation(true)

            await signUp(formData.email, formData.password, formData.name, rememberMe)

            // Magical success transition
            await controls.start({
                scale: 1.05,
                opacity: 0.8,
                transition: { duration: 0.5 }
            })

            router.push('/dashboard')
        } catch (error) {
            console.error('Error signing up:', error)
            const errorMessage = getFirebaseErrorMessage(error as FirebaseError)
            setFormErrors(prev => ({ ...prev, form: errorMessage }))
            setShowSuccessAnimation(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn(rememberMe)
            router.push('/dashboard')
        } catch (error) {
            console.error('Google sign in error:', error)
            const errorMessage = getFirebaseErrorMessage(error as FirebaseError)
            setFormErrors(prev => ({ ...prev, form: errorMessage }))
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Magical background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
            </div>

            {/* Floating particles */}
            <FloatingParticles />

            {/* Magical castle silhouette */}
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-10"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 0.1 }}
                transition={{ duration: 2, ease: "easeOut" }}
            >
                <Castle className="w-96 h-96 text-white" />
            </motion.div>

            <AuthFormWrapper
                title=""
                description=""
                footer=""
            >
                <motion.div
                    className="relative z-10"
                    animate={controls}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Magical header */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <motion.div
                            className="inline-flex items-center gap-3 mb-4"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </motion.div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                                Begin Your Magic
                            </h1>
                            <motion.div
                                animate={{ rotate: [360, 0] }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            >
                                <Star className="w-8 h-8 text-pink-400" />
                            </motion.div>
                        </motion.div>
                        <p className="text-slate-300 text-lg">
                            Create your account and unlock a world of Disney wonder
                        </p>
                    </motion.div>

                    {/* Progress indicator */}
                    <MagicalProgressIndicator progress={formProgress} />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Social login with magical styling */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <SocialLoginButton
                                provider="google"
                                onClick={handleGoogleSignIn}
                                className="mb-4 relative overflow-hidden group"
                            />
                        </motion.div>

                        {/* Magical divider */}
                        <div className="relative flex items-center gap-4 py-4">
                            <motion.div
                                className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                            />
                            <motion.span
                                className="text-sm text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-purple-400/30"
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                            >
                                <Wand2 className="w-4 h-4 inline mr-2" />
                                OR
                            </motion.span>
                            <motion.div
                                className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                            />
                        </div>

                        {/* Enhanced form inputs */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <MagicalFormInput
                                id="name"
                                label="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your magical name"
                                error={formErrors.name}
                                required
                                icon={Users}
                            />

                            <MagicalFormInput
                                id="email"
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                error={formErrors.email}
                                required
                                icon={MapPin}
                            />

                            <MagicalFormInput
                                id="password"
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a secure password"
                                error={formErrors.password}
                                required
                                icon={Wand2}
                            />

                            <MagicalFormInput
                                id="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your magical password"
                                error={formErrors.confirmPassword}
                                required
                                icon={Heart}
                            />
                        </motion.div>

                        {/* Enhanced remember me */}
                        <motion.div
                            className="flex items-center space-x-3"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <motion.div
                                className="relative"
                                whileTap={{ scale: 0.95 }}
                            >
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="sr-only"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                <motion.div
                                    className="w-6 h-6 rounded-md border-purple-400 bg-white/10 backdrop-blur-sm cursor-pointer flex items-center justify-center"
                                    animate={{
                                        backgroundColor: rememberMe ? "rgb(139, 92, 246)" : "rgba(255, 255, 255, 0.1)",
                                        borderColor: rememberMe ? "rgb(139, 92, 246)" : "rgb(168, 85, 247)",
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setRememberMe(!rememberMe)}
                                >
                                    <AnimatePresence>
                                        {rememberMe && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 90 }}
                                                transition={{ type: "spring", stiffness: 600, damping: 25 }}
                                            >
                                                ✓
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                            <label
                                htmlFor="remember"
                                className="text-sm text-slate-300 cursor-pointer select-none"
                            >
                                Keep me signed in for 30 magical days
                            </label>
                        </motion.div>

                        {/* Enhanced error display */}
                        <AnimatePresence>
                            {formErrors.form && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                    className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <div className="relative flex items-center gap-3">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 0.5, repeat: 3 }}
                                        >
                                            ⚠️
                                        </motion.div>
                                        {formErrors.form}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Magical submit button */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="submit"
                                className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-700 text-white font-semibold py-4 px-8 rounded-xl border-0 transition-all duration-300 group"
                                disabled={isSubmitting}
                            >
                                {/* Magical shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />

                                <div className="relative flex items-center justify-center gap-3">
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                className="w-5 h-5 border-[4px] border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            Creating your magical account...
                                        </>
                                    ) : (
                                        <>
                                            <motion.div
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Sparkles className="w-5 h-5" />
                                            </motion.div>
                                            Begin Your Adventure
                                            <motion.div
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                ✨
                                            </motion.div>
                                        </>
                                    )}
                                </div>

                                {/* Success animation overlay */}
                                <AnimatePresence>
                                    {showSuccessAnimation && (
                                        <motion.div
                                            className="absolute inset-0 bg-green-500"
                                            initial={{ scale: 0, borderRadius: "50%" }}
                                            animate={{ scale: 2, borderRadius: "0%" }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </Button>
                        </motion.div>

                        {/* Enhanced footer */}
                        <motion.div
                            className="text-center space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            <p className="text-sm text-slate-400">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-purple-400 font-medium hover:text-purple-300 transition-colors underline decoration-purple-400/30 hover:decoration-purple-300"
                                >
                                    Sign in to your kingdom
                                </Link>
                            </p>

                            <p className="text-xs text-slate-500 leading-relaxed">
                                By creating an account, you agree to our{' '}
                                <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                                    Privacy Policy
                                </Link>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </AuthFormWrapper>
        </div>
    )
}