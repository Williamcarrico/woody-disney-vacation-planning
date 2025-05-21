'use client'

/**
 * Onboarding Tooltip Component
 *
 * This component provides contextual help and guidance to users through tooltips.
 * It can be used for onboarding flows, feature introductions, and in-app guidance.
 *
 * @module components/shared/onboarding-tooltip
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

/**
 * Tooltip variant styling using CVA
 */
const tooltipVariants = cva(
    "relative rounded-lg text-sm shadow-lg",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground",
                secondary: "bg-secondary text-secondary-foreground",
                outline: "bg-background text-foreground border border-input",
                destructive: "bg-destructive text-destructive-foreground",
                info: "bg-blue-500 text-white",
                success: "bg-green-500 text-white",
                warning: "bg-amber-500 text-white",
            },
            size: {
                default: "max-w-xs p-4",
                sm: "max-w-xs p-2",
                lg: "max-w-md p-5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

/**
 * Props for the OnboardingTooltip component
 */
interface OnboardingTooltipProps extends VariantProps<typeof tooltipVariants> {
    /** Unique identifier for the tooltip */
    id: string
    /** Content to be displayed inside the tooltip */
    content: React.ReactNode
    /** The element that triggers the tooltip */
    children: React.ReactNode
    /** Title of the tooltip */
    title?: string
    /** Whether the tooltip should be shown by default */
    defaultOpen?: boolean
    /** Whether the tooltip can be dismissed */
    dismissible?: boolean
    /** Function to call when the tooltip is dismissed */
    onDismiss?: () => void
    /** Whether to show the tooltip only once per session */
    showOnce?: boolean
    /** Whether to show the tooltip only on the first visit */
    showOnFirstVisit?: boolean
    /** Step number for multi-step onboarding flows */
    step?: number
    /** Total steps in a multi-step onboarding flow */
    totalSteps?: number
    /** Class name for styling the tooltip content */
    className?: string
    /** Icon to display in the tooltip */
    icon?: React.ReactNode
    /** Position of the tooltip */
    position?: 'top' | 'bottom' | 'left' | 'right'
    /** Whether the tooltip should be disabled */
    disabled?: boolean
}

/**
 * Onboarding Tooltip Component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <OnboardingTooltip id="attractions-tooltip" content="Click here to view attractions">
 *   <AttractionButton />
 * </OnboardingTooltip>
 *
 * // With custom styling and options
 * <OnboardingTooltip
 *   id="optimizer-intro"
 *   content="The optimizer will create the perfect plan for your day"
 *   title="Optimizer Introduction"
 *   variant="info"
 *   size="lg"
 *   showOnce
 *   dismissible
 * >
 *   <OptimizerButton />
 * </OnboardingTooltip>
 * ```
 */
function OnboardingTooltip({
    id,
    content,
    children,
    title,
    defaultOpen = false,
    dismissible = true,
    onDismiss,
    showOnce = false,
    showOnFirstVisit = false,
    step,
    totalSteps,
    className,
    variant,
    size,
    icon,
    position = 'top',
    disabled = false,
}: OnboardingTooltipProps) {
    const [open, setOpen] = useState(defaultOpen)
    const [dismissed, setDismissed] = useState(false)

    // Check if the tooltip should be shown based on localStorage
    useEffect(() => {
        if (disabled) {
            setOpen(false)
            return
        }

        if (showOnce || showOnFirstVisit) {
            const tooltipState = localStorage.getItem(`onboarding-tooltip-${id}`)
            if (tooltipState === 'dismissed') {
                setOpen(false)
                setDismissed(true)
            } else if (defaultOpen) {
                setOpen(true)
            }
        }
    }, [id, showOnce, showOnFirstVisit, defaultOpen, disabled])

    // Handle dismissing the tooltip
    const handleDismiss = () => {
        setOpen(false)
        setDismissed(true)

        if (showOnce || showOnFirstVisit) {
            localStorage.setItem(`onboarding-tooltip-${id}`, 'dismissed')
        }

        if (onDismiss) {
            onDismiss()
        }
    }

    // Determine proper position side
    const getPositionSide = () => {
        switch (position) {
            case 'top':
                return 'top'
            case 'bottom':
                return 'bottom'
            case 'left':
                return 'left'
            case 'right':
                return 'right'
            default:
                return 'top'
        }
    }

    if (dismissed || disabled) {
        return <>{children}</>
    }

    return (
        <TooltipProvider>
            <Tooltip open={open} onOpenChange={setOpen}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side={getPositionSide()}
                    className={cn(tooltipVariants({ variant, size }), className)}
                >
                    <div className="flex flex-col gap-2">
                        {(title || dismissible) && (
                            <div className="flex items-center justify-between">
                                {title && <h4 className="font-medium">{title}</h4>}
                                {dismissible && (
                                    <button
                                        onClick={handleDismiss}
                                        className="h-5 w-5 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        aria-label="Close tooltip"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex items-start gap-2">
                            {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
                            <div>{content}</div>
                        </div>

                        {step && totalSteps && (
                            <div className="mt-2 flex items-center justify-between text-xs opacity-70">
                                <span>
                                    Step {step} of {totalSteps}
                                </span>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalSteps }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-1 w-5 rounded-full",
                                                i + 1 === step
                                                    ? "bg-current opacity-100"
                                                    : "bg-current opacity-30"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export { OnboardingTooltip, tooltipVariants }