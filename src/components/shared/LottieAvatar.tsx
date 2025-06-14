'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface LottieAvatarProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  animation?: 'welcome' | 'magic' | 'celebration'
}

const LottieAvatar: React.FC<LottieAvatarProps> = ({ 
  className = '', 
  size = 'lg',
  animation = 'magic' 
}) => {
  const lottieRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentAction, setCurrentAction] = useState<string>('')

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  }

  const animationSources = {
    welcome: '/animations/disney-welcome.json',
    magic: '/animations/disney-magic.json',
    celebration: '/animations/disney-celebration.json'
  }

  useEffect(() => {
    // Dynamically import lottie-web for better performance
    const loadLottie = async () => {
      try {
        const lottie = await import('lottie-web')
        
        if (lottieRef.current) {
          const animationInstance = lottie.default.loadAnimation({
            container: lottieRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: animationSources[animation],
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
              clearCanvas: true,
              progressiveLoad: true,
              hideOnTransparent: true
            }
          })

          animationInstance.addEventListener('DOMLoaded', () => {
            setIsLoaded(true)
            setCurrentAction('Animation loaded successfully')
          })

          animationInstance.addEventListener('error', () => {
            setCurrentAction('Animation failed to load')
          })

          // Cleanup function
          return () => {
            animationInstance.destroy()
          }
        }
      } catch (error) {
        console.warn('Lottie animation failed to load:', error)
        setCurrentAction('Using fallback animation')
      }
    }

    loadLottie()
  }, [animation])

  // Fallback animation using CSS and emoji when Lottie fails
  const FallbackAnimation = () => (
    <motion.div
      className={`${sizeClasses[size]} flex items-center justify-center text-4xl`}
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <span role="img" aria-label="Disney magic">
        ✨🏰✨
      </span>
    </motion.div>
  )

  // Interaction methods for programmatic control
  const playSegment = (start: number, end: number) => {
    if (lottieRef.current && isLoaded) {
      setCurrentAction(`Playing segment ${start}-${end}`)
      // This would be implemented with the actual lottie instance
    }
  }

  const nod = () => playSegment(0, 30)
  const shake = () => playSegment(30, 60)
  const celebrate = () => playSegment(60, 120)

  return (
    <div className={`relative ${className}`}>
      {/* Lottie Animation Container */}
      <motion.div
        ref={lottieRef}
        className={`${sizeClasses[size]} mx-auto relative z-10`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
        }}
      />

      {/* Fallback when Lottie fails to load */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FallbackAnimation />
        </div>
      )}

      {/* Magical sparkle effects around the avatar */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Accessibility live region for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {currentAction && `Disney avatar: ${currentAction}`}
      </div>

      {/* Interactive buttons for demonstration (hidden by default) */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 hidden group-hover:flex space-x-2">
        <button
          onClick={nod}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          aria-label="Make avatar nod"
        >
          Nod
        </button>
        <button
          onClick={shake}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          aria-label="Make avatar shake head"
        >
          Shake
        </button>
        <button
          onClick={celebrate}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          aria-label="Make avatar celebrate"
        >
          Celebrate
        </button>
      </div>
    </div>
  )
}

export default LottieAvatar 