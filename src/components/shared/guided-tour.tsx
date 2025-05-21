'use client'

/**
 * Guided Tour Component
 *
 * This component provides a step-by-step guided tour for onboarding new users
 * or introducing new features. It highlights different parts of the UI and
 * provides contextual information.
 *
 * @module components/shared/guided-tour
 */

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import styles from './guided-tour.module.css'

/**
 * Tour step styling using CVA
 */
const tourStepVariants = cva(
    "fixed z-50 flex flex-col gap-4 rounded-lg bg-background shadow-lg border p-5 max-w-md",
    {
        variants: {
            variant: {
                default: "border-border",
                primary: "border-primary",
                info: "border-blue-500",
                success: "border-green-500",
                warning: "border-amber-500",
            },
        },
        defaultVariants: {
            variant: "primary",
        },
    }
)

/**
 * Tour highlight styling using CVA
 */
const highlightVariants = cva(
    "absolute z-40 rounded-md",
    {
        variants: {
            variant: {
                default: "ring-4 ring-primary/50",
                primary: "ring-4 ring-primary/50",
                info: "ring-4 ring-blue-500/50",
                success: "ring-4 ring-green-500/50",
                warning: "ring-4 ring-amber-500/50",
            },
        },
        defaultVariants: {
            variant: "primary",
        },
    }
)

/**
 * Tour step interface
 */
export interface TourStep {
    /** Target element selector or ref */
    target: string | React.RefObject<HTMLElement>
    /** Title of the step */
    title: string
    /** Content/description of the step */
    content: React.ReactNode
    /** Position of the tooltip relative to the target */
    position?: 'top' | 'bottom' | 'left' | 'right'
    /** Whether to highlight the target element */
    highlight?: boolean
    /** Offset from the target element (in pixels) */
    offset?: number
    /** Custom action to perform when this step is active */
    onActive?: () => void
}

/**
 * Props for the GuidedTour component
 */
export interface GuidedTourProps extends VariantProps<typeof tourStepVariants> {
    /** Unique identifier for the tour */
    id: string
    /** Array of tour steps */
    steps: TourStep[]
    /** Whether the tour is active */
    isActive: boolean
    /** Function to call when the tour is completed */
    onComplete?: () => void
    /** Function to call when the tour is closed */
    onClose?: () => void
    /** Label for the next button */
    nextLabel?: string
    /** Label for the back button */
    backLabel?: string
    /** Label for the skip button */
    skipLabel?: string
    /** Label for the finish button */
    finishLabel?: string
    /** Whether to show progress indicators */
    showProgress?: boolean
    /** Whether to mask the rest of the UI */
    mask?: boolean
    /** Z-index for the tour elements */
    zIndex?: number
    /** Whether the tour should start at a specific step */
    startAtStep?: number
    /** Whether to persist the tour state in localStorage */
    persist?: boolean
    /** Whether to show the tour only once */
    showOnce?: boolean
    /** Additional class name for the tour step */
    className?: string
}

/**
 * Guided Tour Component
 *
 * @example
 * ```tsx
 * // Define tour steps
 * const tourSteps: TourStep[] = [
 *   {
 *     target: '#dashboard-intro',
 *     title: 'Welcome to the Dashboard',
 *     content: 'This is your central hub for planning your Disney vacation.',
 *     position: 'bottom',
 *     highlight: true
 *   },
 *   {
 *     target: '#optimizer-button',
 *     title: 'Itinerary Optimizer',
 *     content: 'Click here to create an optimized plan for your park visit.',
 *     position: 'right',
 *     highlight: true
 *   }
 * ]
 *
 * // Use the tour component
 * <GuidedTour
 *   id="dashboard-tour"
 *   steps={tourSteps}
 *   isActive={showTour}
 *   onComplete={() => setShowTour(false)}
 *   onClose={() => setShowTour(false)}
 *   mask
 *   showOnce
 * />
 * ```
 */
function GuidedTour({
    id,
    steps,
    isActive,
    onComplete,
    onClose,
    nextLabel = "Next",
    backLabel = "Back",
    skipLabel = "Skip Tour",
    finishLabel = "Finish",
    showProgress = true,
    mask = false,
    zIndex = 9999,
    startAtStep = 0,
    persist = true,
    showOnce = false,
    className,
    variant,
}: GuidedTourProps) {
    const [currentStep, setCurrentStep] = useState(startAtStep)
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
    const [hasLocalStorage, setHasLocalStorage] = useState(false)

    // Replace the handleClose function with a memoized version
    const handleClose = useCallback(() => {
        setIsVisible(false)
        if (onClose) {
            onClose()
        }
    }, [onClose])

    // Add handleClose to the dependency array of the useEffect that checks localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasLocalStorage(true)
            if (persist && showOnce) {
                const tourCompleted = localStorage.getItem(`guided-tour-${id}`) === 'completed'
                if (tourCompleted) {
                    handleClose()
                }
            }
        }
    }, [id, persist, showOnce, handleClose])

    // Calculate position for the current step
    const calculatePosition = useCallback(() => {
        if (!isActive || steps.length === 0 || currentStep >= steps.length) {
            return
        }

        const step = steps[currentStep]
        const targetElement = typeof step.target === 'string'
            ? document.querySelector(step.target) as HTMLElement
            : step.target.current

        if (!targetElement) {
            console.warn(`Target element not found for step ${currentStep}`)
            return
        }

        // Get element position
        const rect = targetElement.getBoundingClientRect()
        setHighlightRect(step.highlight ? rect : null)

        // Calculate tooltip position based on specified position
        const offset = step.offset || 20
        let x = 0
        let y = 0

        switch (step.position) {
            case 'top':
                x = rect.left + rect.width / 2
                y = rect.top - offset
                break
            case 'bottom':
                x = rect.left + rect.width / 2
                y = rect.bottom + offset
                break
            case 'left':
                x = rect.left - offset
                y = rect.top + rect.height / 2
                break
            case 'right':
                x = rect.right + offset
                y = rect.top + rect.height / 2
                break
            default:
                // Default to bottom
                x = rect.left + rect.width / 2
                y = rect.bottom + offset
        }

        // Ensure the tooltip stays within viewport
        const tooltipWidth = 350 // Approximate max-width of tooltip
        const tooltipHeight = 200 // Approximate max-height of tooltip

        // Adjust horizontal position to keep within viewport
        if (x - tooltipWidth / 2 < 10) {
            x = tooltipWidth / 2 + 10 // Left edge with padding
        } else if (x + tooltipWidth / 2 > window.innerWidth - 10) {
            x = window.innerWidth - tooltipWidth / 2 - 10 // Right edge with padding
        }

        // Adjust vertical position to keep within viewport
        if (y - tooltipHeight < 10 && step.position === 'top') {
            // If doesn't fit on top, flip to bottom
            y = rect.bottom + offset
        } else if (y + tooltipHeight > window.innerHeight - 10 && step.position === 'bottom') {
            // If doesn't fit on bottom, flip to top
            y = rect.top - offset
        }

        setPosition({ x, y })

        // Execute onActive callback if available
        if (step.onActive) {
            step.onActive()
        }
    }, [isActive, steps, currentStep])

    // Update position when current step or window size changes
    useEffect(() => {
        if (!isActive) return

        setIsVisible(true)
        calculatePosition()

        const handleResize = () => {
            calculatePosition()
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [isActive, currentStep, calculatePosition])

    // Handle next step
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
        } else {
            handleComplete()
        }
    }

    // Handle back step
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    // Handle tour completion
    const handleComplete = () => {
        setIsVisible(false)
        if (persist && showOnce && hasLocalStorage) {
            localStorage.setItem(`guided-tour-${id}`, 'completed')
        }
        if (onComplete) {
            onComplete()
        }
    }

    // If tour is not active, don't render anything
    if (!isActive || !isVisible) {
        return null
    }

    // Get current step
    const currentTourStep = steps[currentStep]
    if (!currentTourStep) return null

    // Calculate position styling based on step position
    const getPositionStyles = () => {
        const stepPosition = currentTourStep.position || 'bottom'
        let translateX = '-50%'
        let translateY = '-50%'

        switch (stepPosition) {
            case 'top':
                translateY = '0'
                return { bottom: '20px', left: `${position.x}px`, transform: `translateX(${translateX})` }
            case 'bottom':
                translateY = '0'
                return { top: '20px', left: `${position.x}px`, transform: `translateX(${translateX})` }
            case 'left':
                translateX = '0'
                return { right: '20px', top: `${position.y}px`, transform: `translateY(${translateY})` }
            case 'right':
                translateX = '0'
                return { left: '20px', top: `${position.y}px`, transform: `translateY(${translateY})` }
            default:
                return { top: '20px', left: `${position.x}px`, transform: `translateX(${translateX})` }
        }
    }

    return createPortal(
        <>
            {/* Background mask if enabled */}
            {mask && (
                <div
                    className={`fixed inset-0 bg-black/60 z-${zIndex - 1}`}
                    onClick={handleClose}
                />
            )}

            {/* Highlight target element if applicable */}
            {highlightRect && (
                <div
                    className={cn(highlightVariants({ variant }), `z-${zIndex - 1}`, styles.highlightRect)}
                    ref={(el) => {
                        if (el) {
                            el.style.setProperty('--top', `${highlightRect.top - 4 + window.scrollY}px`)
                            el.style.setProperty('--left', `${highlightRect.left - 4 + window.scrollX}px`)
                            el.style.setProperty('--width', `${highlightRect.width + 8}px`)
                            el.style.setProperty('--height', `${highlightRect.height + 8}px`)
                        }
                    }}
                />
            )}

            {/* Tour step tooltip */}
            <div
                className={cn(tourStepVariants({ variant }), className, `z-${zIndex}`, styles.tourPosition)}
                ref={(el) => {
                    if (el) {
                        Object.entries(getPositionStyles()).forEach(([key, value]) => {
                            el.style.setProperty(`--${key}`, value)
                        })
                    }
                }}
            >
                {/* Title and close button */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{currentTourStep.title}</h3>
                    <button
                        onClick={handleClose}
                        className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label="Close tour"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Step content */}
                <div className="text-sm text-muted-foreground">{currentTourStep.content}</div>

                {/* Progress indicator */}
                {showProgress && (
                    <div className="mt-2 flex items-center justify-center gap-1">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "h-1.5 w-6 rounded-full transition-colors",
                                    index === currentStep
                                        ? "bg-primary"
                                        : "bg-primary/20"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-2 flex items-center justify-between">
                    <div>
                        {currentStep > 0 ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-3 w-3" />
                                {backLabel}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClose}
                            >
                                {skipLabel}
                            </Button>
                        )}
                    </div>
                    <Button
                        size="sm"
                        onClick={handleNext}
                        className="gap-1"
                    >
                        {currentStep < steps.length - 1 ? (
                            <>
                                {nextLabel}
                                <ChevronRight className="h-3 w-3" />
                            </>
                        ) : (
                            finishLabel
                        )}
                    </Button>
                </div>
            </div>
        </>,
        document.body
    )
}

export { GuidedTour, tourStepVariants, highlightVariants }