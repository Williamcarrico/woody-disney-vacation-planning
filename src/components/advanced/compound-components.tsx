/**
 * Advanced Compound Components Architecture
 * Sophisticated, reusable, and highly composable React components
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useMemo, 
  useEffect,
  forwardRef,
  ComponentPropsWithoutRef,
  ElementRef,
  ReactNode,
  Children,
  cloneElement,
  isValidElement
} from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

// Advanced Context System for Compound Components
interface CompoundComponentContextValue {
  state: Record<string, any>
  actions: Record<string, (...args: any[]) => void>
  config: Record<string, any>
  refs: Record<string, React.RefObject<any>>
}

function createCompoundContext<T extends CompoundComponentContextValue>(name: string) {
  const Context = createContext<T | null>(null)
  
  function useCompoundContext(componentName: string): T {
    const context = useContext(Context)
    if (!context) {
      throw new Error(`${componentName} must be used within ${name}`)
    }
    return context
  }
  
  return [Context, useCompoundContext] as const
}

// Magic Card Compound Component - Enhanced Disney-themed card system
interface MagicCardContextValue extends CompoundComponentContextValue {
  state: {
    isHovered: boolean
    isExpanded: boolean
    isLoading: boolean
    isSelected: boolean
    data: any
  }
  actions: {
    setHovered: (hovered: boolean) => void
    setExpanded: (expanded: boolean) => void
    setLoading: (loading: boolean) => void
    setSelected: (selected: boolean) => void
    setData: (data: any) => void
  }
  config: {
    variant: 'park' | 'attraction' | 'restaurant' | 'event'
    size: 'sm' | 'md' | 'lg' | 'xl'
    animation: 'none' | 'hover' | 'float' | 'glow'
    interactive: boolean
    selectable: boolean
  }
}

const [MagicCardContext, useMagicCardContext] = createCompoundContext<MagicCardContextValue>('MagicCard')

interface MagicCardRootProps extends ComponentPropsWithoutRef<'div'> {
  variant?: MagicCardContextValue['config']['variant']
  size?: MagicCardContextValue['config']['size']
  animation?: MagicCardContextValue['config']['animation']
  interactive?: boolean
  selectable?: boolean
  data?: any
  onSelectionChange?: (selected: boolean) => void
}

const MagicCardRoot = forwardRef<ElementRef<'div'>, MagicCardRootProps>(
  ({ 
    children, 
    className, 
    variant = 'park', 
    size = 'md', 
    animation = 'hover',
    interactive = true,
    selectable = false,
    data,
    onSelectionChange,
    ...props 
  }, ref) => {
    const [isHovered, setHovered] = useState(false)
    const [isExpanded, setExpanded] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [isSelected, setSelected] = useState(false)

    const handleSelectionChange = useCallback((selected: boolean) => {
      setSelected(selected)
      onSelectionChange?.(selected)
    }, [onSelectionChange])

    const contextValue: MagicCardContextValue = useMemo(() => ({
      state: {
        isHovered,
        isExpanded,
        isLoading,
        isSelected,
        data
      },
      actions: {
        setHovered,
        setExpanded,
        setLoading,
        setSelected: handleSelectionChange,
        setData: (newData) => data = newData
      },
      config: {
        variant,
        size,
        animation,
        interactive,
        selectable
      },
      refs: {}
    }), [isHovered, isExpanded, isLoading, isSelected, data, variant, size, animation, interactive, selectable, handleSelectionChange])

    const sizeClasses = {
      sm: 'w-64 h-32',
      md: 'w-80 h-48',
      lg: 'w-96 h-64',
      xl: 'w-full h-80'
    }

    const variantClasses = {
      park: 'border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50',
      attraction: 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50',
      restaurant: 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50',
      event: 'border-green-200 bg-gradient-to-br from-green-50 to-blue-50'
    }

    const animationVariants = {
      none: {},
      hover: {
        scale: isHovered ? 1.05 : 1,
        rotateY: isHovered ? 5 : 0,
        transition: { duration: 0.3, ease: 'easeOut' }
      },
      float: {
        y: isHovered ? -10 : 0,
        scale: isHovered ? 1.02 : 1,
        transition: { duration: 0.4, ease: 'easeOut' }
      },
      glow: {
        boxShadow: isHovered 
          ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(124, 58, 237, 0.3)'
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.3 }
      }
    }

    return (
      <MagicCardContext.Provider value={contextValue}>
        <motion.div
          ref={ref}
          className={cn(
            'relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300',
            sizeClasses[size],
            variantClasses[variant],
            isSelected && 'ring-4 ring-blue-500 ring-opacity-50',
            interactive && 'hover:shadow-lg',
            className
          )}
          onHoverStart={() => interactive && setHovered(true)}
          onHoverEnd={() => interactive && setHovered(false)}
          onClick={() => selectable && handleSelectionChange(!isSelected)}
          animate={animationVariants[animation]}
          {...props}
        >
          {children}
        </motion.div>
      </MagicCardContext.Provider>
    )
  }
)

// Magic Card Header with smart layout
interface MagicCardHeaderProps extends ComponentPropsWithoutRef<'div'> {
  showAvatar?: boolean
  showBadge?: boolean
  badgeText?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const MagicCardHeader = forwardRef<ElementRef<'div'>, MagicCardHeaderProps>(
  ({ children, className, showAvatar = false, showBadge = false, badgeText, badgeVariant = 'default', ...props }, ref) => {
    const { state, config } = useMagicCardContext('MagicCardHeader')

    return (
      <div
        ref={ref}
        className={cn(
          'relative p-4 pb-2',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {showAvatar && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={state.data?.imageUrl} />
                  <AvatarFallback>
                    {state.data?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
          
          {showBadge && badgeText && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant={badgeVariant} className="ml-2">
                {badgeText}
              </Badge>
            </motion.div>
          )}
        </div>
      </div>
    )
  }
)

// Magic Card Title with dynamic sizing
const MagicCardTitle = forwardRef<ElementRef<'h3'>, ComponentPropsWithoutRef<'h3'>>(
  ({ children, className, ...props }, ref) => {
    const { config, state } = useMagicCardContext('MagicCardTitle')
    
    const sizeClasses = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl'
    }

    return (
      <motion.h3
        ref={ref}
        className={cn(
          'font-bold text-gray-900 leading-tight',
          sizeClasses[config.size],
          state.isLoading && 'animate-pulse',
          className
        )}
        layout
        {...props}
      >
        {state.isLoading ? <Skeleton className="h-6 w-3/4" /> : children}
      </motion.h3>
    )
  }
)

// Magic Card Description with automatic truncation
interface MagicCardDescriptionProps extends ComponentPropsWithoutRef<'p'> {
  maxLines?: number
  expandable?: boolean
}

const MagicCardDescription = forwardRef<ElementRef<'p'>, MagicCardDescriptionProps>(
  ({ children, className, maxLines = 2, expandable = false, ...props }, ref) => {
    const { state, actions } = useMagicCardContext('MagicCardDescription')
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpansion = useCallback(() => {
      if (expandable) {
        setIsExpanded(!isExpanded)
        actions.setExpanded(!isExpanded)
      }
    }, [expandable, isExpanded, actions])

    const lineClampClass = isExpanded ? '' : `line-clamp-${maxLines}`

    return (
      <div>
        <motion.p
          ref={ref}
          className={cn(
            'text-gray-600 text-sm leading-relaxed',
            lineClampClass,
            expandable && 'cursor-pointer',
            state.isLoading && 'animate-pulse',
            className
          )}
          onClick={toggleExpansion}
          layout
          {...props}
        >
          {state.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            children
          )}
        </motion.p>
        
        {expandable && !state.isLoading && (
          <motion.button
            className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
            onClick={toggleExpansion}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </motion.button>
        )}
      </div>
    )
  }
)

// Magic Card Content with smart layout
interface MagicCardContentProps extends ComponentPropsWithoutRef<'div'> {
  layout?: 'vertical' | 'horizontal' | 'grid'
}

const MagicCardContent = forwardRef<ElementRef<'div'>, MagicCardContentProps>(
  ({ children, className, layout = 'vertical', ...props }, ref) => {
    const { state, config } = useMagicCardContext('MagicCardContent')

    const layoutClasses = {
      vertical: 'flex flex-col space-y-3',
      horizontal: 'flex items-center space-x-4',
      grid: 'grid grid-cols-2 gap-3'
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'px-4 py-2 flex-1',
          layoutClasses[layout],
          className
        )}
        layout
        {...props}
      >
        <AnimatePresence mode="wait">
          {state.isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

// Magic Card Stats with animated counters
interface MagicCardStatsProps extends ComponentPropsWithoutRef<'div'> {
  stats: Array<{
    label: string
    value: number | string
    format?: 'number' | 'percentage' | 'currency' | 'time'
    trend?: 'up' | 'down' | 'neutral'
    icon?: ReactNode
  }>
  columns?: 2 | 3 | 4
}

const MagicCardStats = forwardRef<ElementRef<'div'>, MagicCardStatsProps>(
  ({ className, stats, columns = 2, ...props }, ref) => {
    const { state } = useMagicCardContext('MagicCardStats')

    const formatValue = (value: number | string, format?: string): string => {
      if (typeof value === 'string') return value
      
      switch (format) {
        case 'percentage':
          return `${value}%`
        case 'currency':
          return `$${value.toLocaleString()}`
        case 'time':
          return `${value}min`
        default:
          return value.toLocaleString()
      }
    }

    const getTrendColor = (trend?: string): string => {
      switch (trend) {
        case 'up': return 'text-green-600'
        case 'down': return 'text-red-600'
        default: return 'text-gray-600'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          `grid grid-cols-${columns} gap-4`,
          className
        )}
        {...props}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            {stat.icon && (
              <div className="flex justify-center mb-1">
                {stat.icon}
              </div>
            )}
            <div className={cn(
              'text-lg font-bold',
              getTrendColor(stat.trend)
            )}>
              {state.isLoading ? (
                <Skeleton className="h-6 w-16 mx-auto" />
              ) : (
                <motion.span
                  key={stat.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatValue(stat.value, stat.format)}
                </motion.span>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
)

// Magic Card Progress with animations
interface MagicCardProgressProps extends ComponentPropsWithoutRef<'div'> {
  label: string
  value: number
  max?: number
  showValue?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const MagicCardProgress = forwardRef<ElementRef<'div'>, MagicCardProgressProps>(
  ({ className, label, value, max = 100, showValue = true, color = 'blue', ...props }, ref) => {
    const { state } = useMagicCardContext('MagicCardProgress')
    const [animatedValue, setAnimatedValue] = useState(0)

    useEffect(() => {
      if (!state.isLoading) {
        const timer = setTimeout(() => {
          setAnimatedValue(value)
        }, 300)
        return () => clearTimeout(timer)
      }
    }, [value, state.isLoading])

    const percentage = (animatedValue / max) * 100

    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500'
    }

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
          {showValue && (
            <span className="text-sm text-gray-500">
              {state.isLoading ? (
                <Skeleton className="h-4 w-8" />
              ) : (
                `${Math.round(animatedValue)}/${max}`
              )}
            </span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={cn('h-2 rounded-full', colorClasses[color])}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    )
  }
)

// Magic Card Actions with smart spacing
interface MagicCardActionsProps extends ComponentPropsWithoutRef<'div'> {
  align?: 'left' | 'center' | 'right' | 'space-between'
  size?: 'sm' | 'md' | 'lg'
}

const MagicCardActions = forwardRef<ElementRef<'div'>, MagicCardActionsProps>(
  ({ children, className, align = 'right', size = 'md', ...props }, ref) => {
    const { state, config } = useMagicCardContext('MagicCardActions')

    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      'space-between': 'justify-between'
    }

    const sizeClasses = {
      sm: 'gap-2 p-2',
      md: 'gap-3 p-4',
      lg: 'gap-4 p-6'
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'flex items-center',
          alignClasses[align],
          sizeClasses[size],
          'border-t border-gray-100',
          className
        )}
        layout
        {...props}
      >
        <AnimatePresence>
          {!state.isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {Children.map(children, (child, index) =>
                isValidElement(child) ? (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {cloneElement(child, {
                      size: size === 'sm' ? 'sm' : 'default',
                      ...child.props
                    })}
                  </motion.div>
                ) : child
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

// Compound component object
export const MagicCard = {
  Root: MagicCardRoot,
  Header: MagicCardHeader,
  Title: MagicCardTitle,
  Description: MagicCardDescription,
  Content: MagicCardContent,
  Stats: MagicCardStats,
  Progress: MagicCardProgress,
  Actions: MagicCardActions
}

// Set display names for better debugging
MagicCardRoot.displayName = 'MagicCard.Root'
MagicCardHeader.displayName = 'MagicCard.Header'
MagicCardTitle.displayName = 'MagicCard.Title'
MagicCardDescription.displayName = 'MagicCard.Description'
MagicCardContent.displayName = 'MagicCard.Content'
MagicCardStats.displayName = 'MagicCard.Stats'
MagicCardProgress.displayName = 'MagicCard.Progress'
MagicCardActions.displayName = 'MagicCard.Actions'

// Export context and types for advanced usage
export { MagicCardContext, useMagicCardContext, type MagicCardContextValue }

// Higher-order component for easy theming
export function withMagicCardTheme<P extends object>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<MagicCardRootProps> = {}
) {
  const ThemedComponent = React.forwardRef<any, P & Partial<MagicCardRootProps>>((props, ref) => (
    <Component ref={ref} {...defaultProps} {...props} />
  ))

  ThemedComponent.displayName = `withMagicCardTheme(${Component.displayName || Component.name})`
  return ThemedComponent
}

// Preset configurations for common use cases
export const MagicCardPresets = {
  ParkCard: withMagicCardTheme(MagicCard.Root, {
    variant: 'park',
    size: 'lg',
    animation: 'hover',
    selectable: true
  }),
  
  AttractionCard: withMagicCardTheme(MagicCard.Root, {
    variant: 'attraction',
    size: 'md',
    animation: 'float',
    interactive: true
  }),
  
  RestaurantCard: withMagicCardTheme(MagicCard.Root, {
    variant: 'restaurant',
    size: 'md',
    animation: 'glow'
  }),
  
  EventCard: withMagicCardTheme(MagicCard.Root, {
    variant: 'event',
    size: 'sm',
    animation: 'hover'
  })
}

// Usage examples and documentation
export const MagicCardExamples = {
  // Example: Basic park card
  ParkCardExample: () => (
    <MagicCard.Root variant="park" size="lg" animation="hover" selectable>
      <MagicCard.Header showAvatar showBadge badgeText="Popular" badgeVariant="default">
        <MagicCard.Title>Magic Kingdom</MagicCard.Title>
        <MagicCard.Description maxLines={2} expandable>
          The most magical place on earth with classic attractions, enchanting shows, and beloved Disney characters.
        </MagicCard.Description>
      </MagicCard.Header>
      
      <MagicCard.Content>
        <MagicCard.Stats
          stats={[
            { label: 'Wait Time', value: 45, format: 'time', trend: 'down' },
            { label: 'Crowd Level', value: 'Medium', trend: 'neutral' },
            { label: 'Rating', value: 4.8, format: 'number', trend: 'up' },
            { label: 'Open Until', value: '10:00 PM', trend: 'neutral' }
          ]}
          columns={2}
        />
        
        <MagicCard.Progress
          label="Capacity"
          value={75}
          color="blue"
          showValue
        />
      </MagicCard.Content>
      
      <MagicCard.Actions align="space-between">
        <Button variant="outline" size="sm">View Map</Button>
        <Button size="sm">Get Directions</Button>
      </MagicCard.Actions>
    </MagicCard.Root>
  )
}