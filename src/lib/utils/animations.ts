import { Variants } from 'framer-motion'

// Sophisticated animation variants
export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

export const fadeInScale: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
}

export const slideInFromLeft: Variants = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
}

export const slideInFromRight: Variants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
}

// Stagger children animations
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
}

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
}

// Advanced hover effects
export const hoverScale = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
}

export const hoverGlow = {
    whileHover: {
        boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)',
        transition: { duration: 0.3 }
    }
}

// 3D rotation effects
export const rotate3D: Variants = {
    initial: { rotateY: -90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: 90, opacity: 0 }
}

// Morphing text effect
export const morphText: Variants = {
    initial: {
        opacity: 0,
        filter: 'blur(10px)',
        scale: 0.8
    },
    animate: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.6, 0.01, -0.05, 0.95]
        }
    }
}

// Glitch effect
export const glitchEffect = {
    animate: {
        x: [0, -2, 2, -2, 2, 0],
        y: [0, 2, -2, 2, -2, 0],
        filter: [
            'hue-rotate(0deg)',
            'hue-rotate(90deg)',
            'hue-rotate(180deg)',
            'hue-rotate(270deg)',
            'hue-rotate(360deg)',
        ],
        transition: {
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 5
        }
    }
}

// Floating animation
export const floatingAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

// Pulse animation
export const pulseAnimation = {
    animate: {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

// Advanced spring configurations
export const springConfig = {
    gentle: { type: "spring", stiffness: 100, damping: 15 },
    wobbly: { type: "spring", stiffness: 180, damping: 12 },
    stiff: { type: "spring", stiffness: 300, damping: 20 },
    slow: { type: "spring", stiffness: 50, damping: 20 }
}

// Parallax scroll effect helper
export const parallaxY = (offset: number = 50) => ({
    initial: { y: -offset },
    animate: { y: offset },
    transition: { ease: "linear" }
})

// Reveal animation for text
export const textReveal: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        clipPath: 'inset(100% 0% 0% 0%)'
    },
    animate: {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
}

// Shimmer effect
export const shimmerEffect = {
    animate: {
        backgroundPosition: ['200% 0%', '-200% 0%'],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
        }
    }
}

// Utility function to create custom bounce effect
export const createBounceEffect = (intensity: number = 1) => ({
    animate: {
        y: [0, -10 * intensity, 0],
        transition: {
            duration: 0.6,
            times: [0, 0.3, 1],
            ease: [0.68, -0.55, 0.265, 1.55]
        }
    }
})

// Utility function for sequential animations
export const createSequentialAnimation = (
    animations: Variants[],
    staggerDelay: number = 0.1
) => ({
    animate: {
        transition: {
            staggerChildren: staggerDelay
        }
    },
    children: animations
})

// Advanced gradient animation
export const gradientAnimation = {
    animate: {
        background: [
            'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
        ],
        transition: {
            duration: 10,
            repeat: Infinity,
            ease: "linear"
        }
    }
}

// Magnetic hover effect configuration
export const magneticHover = {
    rest: { x: 0, y: 0 },
    hover: { x: 0, y: 0 } // Values will be set dynamically
}

// Utility to calculate magnetic effect
export const calculateMagneticEffect = (
    e: React.MouseEvent<HTMLElement>,
    strength: number = 0.5
) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    return {
        x: x * strength,
        y: y * strength
    }
}