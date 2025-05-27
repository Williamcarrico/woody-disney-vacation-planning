import { useEffect, useState, useCallback } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

interface ScrollState {
    isScrolled: boolean
    scrollDirection: 'up' | 'down' | null
    scrollProgress: number
    scrollY: number
    scrollVelocity: number
    isAtTop: boolean
    isAtBottom: boolean
    documentHeight: number
}

interface UseAdvancedScrollOptions {
    threshold?: number
    smoothing?: number
    velocityThreshold?: number
}

export function useAdvancedScroll(options: UseAdvancedScrollOptions = {}) {
    const {
        threshold = 20,
        smoothing = 0.1,
        velocityThreshold = 0.5
    } = options

    const [scrollState, setScrollState] = useState<ScrollState>({
        isScrolled: false,
        scrollDirection: null,
        scrollProgress: 0,
        scrollY: 0,
        scrollVelocity: 0,
        isAtTop: true,
        isAtBottom: false,
        documentHeight: 0
    })

    const scrollY = useMotionValue(0)
    const scrollYSmooth = useSpring(scrollY, {
        stiffness: 100,
        damping: 30,
        restSpeed: smoothing
    })
    const scrollProgress = useTransform(
        scrollYSmooth,
        [0, scrollState.documentHeight - window.innerHeight],
        [0, 1]
    )

    const lastScrollY = useMotionValue(0)
    const lastTime = useMotionValue(Date.now())

    const updateScrollState = useCallback(() => {
        const currentScrollY = window.scrollY
        const currentTime = Date.now()
        const deltaTime = currentTime - lastTime.get()
        const deltaScroll = currentScrollY - lastScrollY.get()

        // Calculate velocity
        const velocity = deltaTime > 0 ? deltaScroll / deltaTime : 0

        // Determine scroll direction
        let direction: 'up' | 'down' | null = null
        if (Math.abs(velocity) > velocityThreshold) {
            direction = velocity > 0 ? 'down' : 'up'
        }

        // Calculate document height
        const docHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        )

        // Check if at top or bottom
        const isAtTop = currentScrollY <= threshold
        const isAtBottom = currentScrollY + window.innerHeight >= docHeight - threshold

        // Update motion values
        scrollY.set(currentScrollY)
        lastScrollY.set(currentScrollY)
        lastTime.set(currentTime)

        // Update state
        setScrollState(prev => ({
            ...prev,
            isScrolled: currentScrollY > threshold,
            scrollDirection: direction || prev.scrollDirection,
            scrollProgress: scrollProgress.get(),
            scrollY: currentScrollY,
            scrollVelocity: velocity,
            isAtTop,
            isAtBottom,
            documentHeight: docHeight
        }))
    }, [threshold, velocityThreshold, scrollY, scrollProgress, lastScrollY, lastTime])

    useEffect(() => {
        // Initial update
        updateScrollState()

        // Throttled scroll handler
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateScrollState()
                    ticking = false
                })
                ticking = true
            }
        }

        // Handle resize
        const handleResize = () => {
            updateScrollState()
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
        }
    }, [updateScrollState])

    return {
        ...scrollState,
        scrollYMotion: scrollYSmooth,
        scrollProgressMotion: scrollProgress,
        // Utility values
        scrollPercentage: scrollState.scrollProgress * 100,
        isScrollingUp: scrollState.scrollDirection === 'up',
        isScrollingDown: scrollState.scrollDirection === 'down',
        // Smooth values for animations
        smoothScrollY: scrollYSmooth,
        // Methods
        scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        scrollToBottom: () => window.scrollTo({ top: scrollState.documentHeight, behavior: 'smooth' }),
        scrollTo: (y: number) => window.scrollTo({ top: y, behavior: 'smooth' })
    }
}