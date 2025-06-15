'use client'

import React, { useState, useEffect, useCallback, Suspense, lazy, memo, useRef, Component, ErrorInfo, ReactNode } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Calendar,
  Users,
  Star,
  Wand2,
  Castle,
  Heart,
  Globe,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { LiveGradientProvider, useLiveGradient, useGradientStyles } from '@/components/hero/LiveGradientProvider'
import { ReactQueryProvider } from '@/providers'

// Error Boundary Component for Three.js
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ThreeJSErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Three.js Error Boundary caught an error:', error, errorInfo)

    // Log error details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('🎆 Fireworks Error Details')
      console.error('Error:', error.message)
      console.error('Stack:', error.stack)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center text-white">
            <div className="text-center space-y-6 max-w-md px-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-16 w-16 text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold architects-daughter-regular">Fireworks Display Error</h3>
                <p className="text-sm opacity-75 gloria-hallelujah-regular">
                  The magical fireworks display encountered an issue. This might be due to your device&apos;s graphics capabilities.
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={this.handleRetry}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <p className="text-xs opacity-50 caveat-brush-regular">
                  If this continues, try using a different browser or updating your graphics drivers.
                </p>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Dynamic imports for performance optimization with better error handling
const ThreeJSWrapper = lazy(() => import('@/components/three/ThreeJSWrapper'))

const LottieAvatar = lazy(() => import('@/components/shared/LottieAvatar'))
const InteractiveMapPreview = lazy(() => import('@/components/maps/InteractiveMapPreview'))

// Park data for switcher
const PARKS = [
  {
    id: 'mk',
    name: 'Magic Kingdom',
    icon: '🏰',
    gradient: 'from-blue-400 via-purple-500 to-pink-500',
    occupancy: 75
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    icon: '🌍',
    gradient: 'from-green-400 via-blue-500 to-purple-500',
    occupancy: 60
  },
  {
    id: 'hs',
    name: 'Hollywood Studios',
    icon: '🎬',
    gradient: 'from-yellow-400 via-red-500 to-pink-500',
    occupancy: 85
  },
  {
    id: 'ak',
    name: 'Animal Kingdom',
    icon: '🦁',
    gradient: 'from-orange-400 via-yellow-500 to-green-500',
    occupancy: 70
  }
]

// Hero Section Component
const HeroSection: React.FC = memo(() => {
  const [activePark, setActivePark] = useState('mk')
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const { gradientData, isLoading } = useLiveGradient()
  const gradientStyles = useGradientStyles()

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50 dark:from-green-900 dark:via-purple-900 dark:to-yellow-900">
      {/* Live Dynamic Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 hero-live-gradient",
          gradientStyles && "hero-live-gradient-overlay hero-live-gradient-bg"
        )}
        style={gradientStyles ? {
          '--gradient-primary': gradientStyles.primary,
          '--gradient-secondary': gradientStyles.secondary,
          '--gradient-accent': gradientStyles.accent,
        } as React.CSSProperties : undefined}
      />

      {/* Enhanced Floating Orbs with Live Colors */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Red Orb - Passion & Adventure */}
        <motion.div
          className="absolute w-24 h-24 rounded-full opacity-20 blur-sm floating-orb-red"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blue Orb - Dreams & Magic */}
        <motion.div
          className="absolute w-32 h-32 rounded-full opacity-25 blur-sm floating-orb-blue"
          animate={{
            x: [0, -25, 35, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.9, 1.3, 1],
            rotate: [0, -120, 240, 360]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Yellow Orb - Joy & Happiness */}
        <motion.div
          className="absolute w-20 h-20 rounded-full opacity-30 blur-sm floating-orb-yellow"
          animate={{
            x: [0, -40, 15, 0],
            y: [0, -20, 45, 0],
            scale: [1, 1.4, 0.7, 1],
            rotate: [0, 90, 270, 360]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        {/* Green Orb - Nature & Growth */}
        <motion.div
          className="absolute w-28 h-28 rounded-full opacity-22 blur-sm floating-orb-green"
          animate={{
            x: [0, 20, -35, 0],
            y: [0, -60, 25, 0],
            scale: [1, 0.8, 1.2, 1],
            rotate: [0, -90, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Pink Orb - Love & Wonder */}
        <motion.div
          className="absolute w-26 h-26 rounded-full opacity-28 blur-sm floating-orb-pink"
          animate={{
            x: [0, -30, 25, 0],
            y: [0, 35, -45, 0],
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, 150, 300, 360]
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />

        {/* Orange Orb - Energy & Excitement */}
        <motion.div
          className="absolute w-22 h-22 rounded-full opacity-26 blur-sm floating-orb-orange"
          animate={{
            x: [0, -20, 40, 0],
            y: [0, -50, 15, 0],
            scale: [1, 0.7, 1.4, 1],
            rotate: [0, 200, -160, 360]
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        {/* Purple Orb - Mystery & Magic */}
        <motion.div
          className="absolute w-30 h-30 rounded-full opacity-24 blur-sm floating-orb-purple"
          animate={{
            x: [0, 45, -15, 0],
            y: [0, -25, 40, 0],
            scale: [1, 1.1, 0.85, 1],
            rotate: [0, -45, 225, 360]
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
      </div>

      {/* Live Data Indicator */}
      {gradientData && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 z-20"
        >
          <Card className="px-3 py-2 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <div className="flex items-center gap-2 text-xs">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isLoading ? "bg-yellow-400" : "bg-green-400"
              )} />
              <span>Live: {gradientData.averageCrowdLevel}/10 crowds • {gradientData.weather.temperature}°F {gradientData.weather.condition}</span>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Hero Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex min-h-screen items-center justify-center px-4 text-center"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <h1
              className={cn(
                "text-6xl md:text-8xl font-extrabold cabin-sketch-bold hero-text-disney-colors",
                gradientStyles && "hero-title-live-gradient hero-title-live-gradient-bg"
              )}
              style={gradientStyles ? {
                '--gradient-primary': gradientStyles.primary,
                '--gradient-secondary': gradientStyles.secondary,
                '--gradient-accent': gradientStyles.accent,
              } as React.CSSProperties : undefined}
            >
              WaltWise
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Where Dreams Meet Data - Your AI-Powered Disney Vacation Planning Companion
            </p>
          </motion.div>

          {/* Park Switcher Orbit */}
          <ParkSwitcherOrbit
            parks={PARKS}
            activePark={activePark}
            setActivePark={setActivePark}
          />

          {/* Hero CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl px-8 py-6 text-lg font-semibold transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Start Planning Magic
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl px-8 py-6 text-lg font-semibold border-2 hover:bg-white/10 backdrop-blur-sm"
            >
              <Globe className="h-5 w-5 mr-2" />
              Explore Parks
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <FloatingElements />
    </section>
  )
})

HeroSection.displayName = 'HeroSection'

// Park Switcher Orbit Component
const ParkSwitcherOrbit: React.FC<{
  parks: typeof PARKS
  activePark: string
  setActivePark: (park: string) => void
}> = memo(({ parks, activePark, setActivePark }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="relative mx-auto w-80 h-80 flex items-center justify-center"
    >
      {/* Central Hub */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
          <Castle className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Orbiting Park Icons */}
      {parks.map((park, index) => {
        const angle = (index * 90) - 90 // Start from top
        const radius = 120
        const x = Math.cos((angle * Math.PI) / 180) * radius
        const y = Math.sin((angle * Math.PI) / 180) * radius

        return (
          <motion.button
            key={park.id}
            className={cn(
              "absolute w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 transform hover:scale-110 park-orbit-element",
              `bg-gradient-to-r ${park.gradient}`,
              activePark === park.id ? "ring-[4px] ring-white scale-110" : ""
            )}
            style={{
              '--orbit-x': `${x}px`,
              '--orbit-y': `${y}px`,
            } as any}
            onClick={() => setActivePark(park.id)}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Select ${park.name}`}
          >
            <span role="img" aria-label={park.name}>
              {park.icon}
            </span>
          </motion.button>
        )
      })}
    </motion.div>
  )
})

ParkSwitcherOrbit.displayName = 'ParkSwitcherOrbit'

// Floating Elements Component
const FloatingElements: React.FC = memo(() => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Don't render on server or before dimensions are set
  if (dimensions.width === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400 opacity-30 floating-element-positioned"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
          style={{
            '--random-left': `${Math.random() * 100}%`,
            '--random-top': `${Math.random() * 100}%`,
          } as any}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
      ))}
    </div>
  )
})

FloatingElements.displayName = 'FloatingElements'

// Fireworks Mode Component
const FireworksMode: React.FC<{
  isActive: boolean
  onToggle: (active: boolean) => void
}> = memo(({ isActive, onToggle }) => {
  const [clickPositions, setClickPositions] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Check WebGL support
  const checkWebGLSupport = useCallback(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (error) {
      // Log WebGL detection errors for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('🎆 WebGL Support Detection Error:', error)
      }
      return false
    }
  }, [])

  // Initialize WebGL check
  useEffect(() => {
    if (isActive) {
      const supported = checkWebGLSupport()
      setWebGLSupported(supported)

      // Delay loading indicator for better UX
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 800)

      return () => clearTimeout(timer)
    } else {
      setIsLoading(true)
      setWebGLSupported(null)
    }
  }, [isActive, checkWebGLSupport])

  // Double-click timer for exit functionality
  const doubleClickTimer = useRef<NodeJS.Timeout | null>(null)
  const [clickCount, setClickCount] = useState(0)

  // Enhanced click handler that works with Three.js Canvas
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!isActive || !webGLSupported) return

    event.preventDefault()
    event.stopPropagation()

    // Handle double-click exit (backup method)
    setClickCount(prev => prev + 1)
    if (doubleClickTimer.current) {
      clearTimeout(doubleClickTimer.current)
    }

    doubleClickTimer.current = setTimeout(() => {
      if (clickCount >= 1) {
        // Single click - create firework
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        // Convert screen coordinates to normalized device coordinates (NDC)
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        const newFirework = {
          x,
          y,
          id: Date.now() + Math.random()
        }

        // Add haptic feedback for mobile devices
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }

        setClickPositions(prev => [...prev.slice(-3), newFirework]) // Keep only last 3 for performance
      }
      setClickCount(0)
    }, 300)

    // Double-click detection for backup exit
    if (clickCount === 1) {
      console.log('🚪 Double-click detected! Exiting fireworks (backup method)...')
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]) // Double vibration pattern
      }
      onToggle(false)
      setClickCount(0)
      if (doubleClickTimer.current) {
        clearTimeout(doubleClickTimer.current)
      }
    }
  }, [isActive, webGLSupported, clickCount, onToggle])

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !webGLSupported) return

    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault()

      // Create firework at random position
      const newFirework = {
        x: (Math.random() - 0.5) * 1.5, // Random position within reasonable bounds
        y: (Math.random() - 0.5) * 1.5,
        id: Date.now() + Math.random()
      }

      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      setClickPositions(prev => [...prev.slice(-3), newFirework])
    } else if (event.code === 'Escape') {
      onToggle(false)
    }
  }, [isActive, webGLSupported, onToggle])

  // Add keyboard event listeners
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, handleKeyDown])

  // Clear old click positions periodically for performance
  useEffect(() => {
    if (!isActive) return

    const cleanup = setInterval(() => {
      setClickPositions(prev => prev.slice(-2))
    }, 5000)

    return () => clearInterval(cleanup)
  }, [isActive])

  // Cleanup double-click timer on unmount
  useEffect(() => {
    return () => {
      if (doubleClickTimer.current) {
        clearTimeout(doubleClickTimer.current)
      }
    }
  }, [])

  // WebGL not supported fallback
  const WebGLFallback = () => (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center text-white">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold finger-paint-regular">WebGL Not Supported</h3>
          <p className="text-sm opacity-75 gloria-hallelujah-regular">
            Your device or browser doesn&apos;t support WebGL, which is required for the magical fireworks display.
          </p>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-2">🎆</div>
            <p className="text-lg font-semibold text-purple-300 caveat-brush-regular">
              Imagine beautiful fireworks here!
            </p>
          </div>
          <Button
            onClick={() => onToggle(false)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Close
          </Button>
          <p className="text-xs opacity-50 architects-daughter-regular">
            Try using Chrome, Firefox, or Safari for the best experience.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm cursor-crosshair"
          onClick={(e) => {
            // Only handle click if it's not on the exit button or its children
            const target = e.target
            if (target !== e.currentTarget &&
              target instanceof Element &&
              !target.closest('[data-exit-button]')) {
              handleCanvasClick(e)
            }
          }}
          role="application"
          aria-label="Fireworks display - Click anywhere to launch fireworks, press Escape to exit"
          tabIndex={0}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="text-white text-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-300 animate-pulse" />
                  </div>
                </div>
                <p className="text-lg font-semibold finger-paint-regular">Loading magical fireworks...</p>
                <p className="text-sm opacity-60 gloria-hallelujah-regular">Preparing the show just for you</p>
              </div>
            </div>
          )}

          {/* WebGL Not Supported */}
          {!isLoading && webGLSupported === false && <WebGLFallback />}

          {/* Main Fireworks Content */}
          {!isLoading && webGLSupported && (
            <>
              <Suspense
                fallback={
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="text-white text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                      <p className="caveat-brush-regular">Initializing fireworks engine...</p>
                    </div>
                  </div>
                }
              >
                <ThreeJSErrorBoundary>
                  <ThreeJSWrapper
                    clickPositions={clickPositions}
                    onRetry={() => {
                      console.log('Retrying Three.js load...')
                    }}
                  />
                </ThreeJSErrorBoundary>
              </Suspense>

              {/* Enhanced Exit Button with proper pointer events */}
              <div className="absolute top-4 right-4 z-[60] pointer-events-auto" data-exit-button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-red-500/30 hover:border-red-400/40 transition-all duration-200 hover:scale-105 pointer-events-auto shadow-lg"
                  data-exit-button
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onMouseEnter={() => {
                    console.log('Exit button hovered!')
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    console.log('🚪 Exit button clicked! Closing fireworks...')
                    // Add visual feedback
                    const button = e.currentTarget
                    button.style.transform = 'scale(0.95)'
                    setTimeout(() => {
                      button.style.transform = 'scale(1.05)'
                      setTimeout(() => {
                        onToggle(false)
                      }, 100)
                    }, 100)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                  }}
                  aria-label="Exit fireworks mode"
                >
                  <X className="h-4 w-4 mr-2" />
                  Exit Fireworks
                </Button>
              </div>

              {/* Enhanced Instructions with Animation */}
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center space-y-2 max-w-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.p
                  className="text-lg font-semibold gloria-hallelujah-regular"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 30px rgba(255,255,255,0.8)",
                      "0 0 20px rgba(255,255,255,0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎆 Click anywhere to launch fireworks! 🎆
                </motion.p>
                <p className="text-sm opacity-75 caveat-brush-regular">
                  Space/Enter for random fireworks • Escape or Exit button to exit
                </p>
                <p className="text-xs opacity-50 architects-daughter-regular">
                  💡 Backup exit: Double-click anywhere
                </p>
                <div className="flex justify-center space-x-4 text-xs opacity-60">
                  <span>🖱️ Click</span>
                  <span>⌨️ Keyboard</span>
                  <span>📱 Touch</span>
                  <span>🚪 Exit Button</span>
                </div>
              </motion.div>

              {/* Performance Stats (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-4 left-4 text-white text-xs opacity-50 space-y-1">
                  <div>Fireworks: {clickPositions.length}</div>
                  <div>WebGL: {webGLSupported ? '✅' : '❌'}</div>
                  <div>FPS: Auto-optimized</div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

FireworksMode.displayName = 'FireworksMode'

// Value Props Carousel Component
const ValuePropsCarousel: React.FC = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const valueProps = [
    {
      icon: <Wand2 className="h-12 w-12" />,
      title: "AI-Powered Planning",
      description: "Let our intelligent algorithms create the perfect itinerary tailored to your family's preferences and interests.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Clock className="h-12 w-12" />,
      title: "Real-Time Wait Times",
      description: "Skip the long lines with live wait time updates and smart routing through all four Disney World parks.",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Group Coordination",
      description: "Keep your entire group in sync with shared itineraries, real-time locations, and collaborative planning tools.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: <Star className="h-12 w-12" />,
      title: "Personalized Recommendations",
      description: "Discover hidden gems and must-do experiences based on your unique family profile and Disney history.",
      gradient: "from-yellow-500 to-orange-500"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % valueProps.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [valueProps.length])

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent finger-paint-regular">
            Why Choose WaltWise?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto architects-daughter-regular">
            Experience Disney magic like never before with our cutting-edge planning technology
          </p>
        </motion.div>

        <div className="relative overflow-hidden rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col lg:flex-row items-center gap-12"
            >
              <div className="flex-1 text-center lg:text-left space-y-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${valueProps[currentSlide]?.gradient} text-white`}>
                  {valueProps[currentSlide]?.icon}
                </div>
                <h3 className={`text-3xl font-bold text-slate-800 dark:text-white ${currentSlide === 0 ? 'gloria-hallelujah-regular' :
                  currentSlide === 1 ? 'caveat-brush-regular' :
                    currentSlide === 2 ? 'architects-daughter-regular' :
                      'finger-paint-regular'
                  }`}>
                  {valueProps[currentSlide]?.title}
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed gloria-hallelujah-regular">
                  {valueProps[currentSlide]?.description}
                </p>
              </div>
              <div className="flex-1">
                <div className="relative w-full h-80 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Placeholder for interactive demo */}
                  <div className="text-6xl opacity-50">
                    {valueProps[currentSlide]?.icon}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {valueProps.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  currentSlide === index
                    ? "bg-purple-500 w-8"
                    : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                )}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

ValuePropsCarousel.displayName = 'ValuePropsCarousel'

// Interactive Map Preview Component
const InteractiveMapSection: React.FC = memo(() => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent caveat-brush-regular">
            Explore the Magic
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto finger-paint-regular">
            Navigate Disney World like never before with our interactive park maps and real-time insights
          </p>
        </motion.div>

        <div className="relative rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 p-8">
          <Suspense
            fallback={
              <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              </div>
            }
          >
            <InteractiveMapPreview />
          </Suspense>
        </div>
      </div>
    </section>
  )
})

InteractiveMapSection.displayName = 'InteractiveMapSection'

// Itinerary CTA Component
const ItineraryCTA: React.FC = memo(() => {
  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent architects-daughter-regular">
              Ready for Your Magical Adventure?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed caveat-brush-regular">
              Join thousands of families who have already discovered the magic of stress-free Disney planning
            </p>
          </div>

          <div className="relative">
            <Suspense fallback={<div className="h-32 w-32 mx-auto" />}>
              <LottieAvatar />
            </Suspense>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl px-8 py-6 text-lg font-semibold"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Start Your Free Plan
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl px-8 py-6 text-lg font-semibold"
            >
              <Heart className="h-5 w-5 mr-2" />
              View Sample Itinerary
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
})

ItineraryCTA.displayName = 'ItineraryCTA'

// Main Page Component
const HomePage: React.FC = () => {
  const [fireworksMode, setFireworksMode] = useState(false)

  return (
    <ReactQueryProvider>
      <LiveGradientProvider>
        <main id="main-content" className="relative">
          {/* Fireworks Mode Toggle */}
          <div className="fixed top-20 right-4 z-40">
            <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium gloria-hallelujah-regular">🎆</span>
                <Switch
                  checked={fireworksMode}
                  onCheckedChange={setFireworksMode}
                  aria-label="Toggle fireworks mode"
                />
                <span className="text-sm font-medium finger-paint-regular">Fireworks</span>
              </div>
            </Card>
          </div>

          {/* Fireworks Mode Overlay */}
          <FireworksMode isActive={fireworksMode} onToggle={setFireworksMode} />

          {/* Page Sections */}
          <HeroSection />
          <ValuePropsCarousel />
          <InteractiveMapSection />
          <ItineraryCTA />
        </main>
      </LiveGradientProvider>
    </ReactQueryProvider>
  )
}

// Import Clock icon (was missing)
import { Clock } from 'lucide-react'

export default HomePage