"use client"

import { Suspense, useState, useCallback, useMemo, memo } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'

// Auth & Context
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

// Hooks for real data
import { useUserStats } from '@/hooks/useUserStats'
import { useNotifications } from '@/hooks/useNotifications'

// Import hook return types
import type { UseUserStatsReturn } from '@/hooks/useUserStats'
import type { UseNotificationsReturn } from '@/hooks/useNotifications'

// Import Notification interface for type safety
interface Notification {
    id: string
    title: string
    message: string
    category: string
    read: boolean
    createdAt: string
    actionUrl?: string
    priority: 'low' | 'medium' | 'high'
    type: 'wait_time' | 'dining' | 'weather' | 'system' | 'achievement'
}

// Type guard function with proper safety checks
function isValidNotification(item: unknown): item is Notification {
    if (typeof item !== 'object' || item === null) {
        return false
    }

    const obj = item as Record<string, unknown>

    // Check required properties with proper type guards
    const hasRequiredProps = (
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.message === 'string' &&
        typeof obj.category === 'string' &&
        typeof obj.read === 'boolean' &&
        typeof obj.createdAt === 'string'
    )

    if (!hasRequiredProps) return false

    // Check optional properties safely
    const validPriority = obj.priority === undefined ||
        (typeof obj.priority === 'string' && ['low', 'medium', 'high'].includes(obj.priority))
    const validType = obj.type === undefined ||
        (typeof obj.type === 'string' && ['wait_time', 'dining', 'weather', 'system', 'achievement'].includes(obj.type))

    return validPriority && validType
}

// Type guard for user stats with improved safety
function isValidUserStats(data: unknown): data is {
    achievementLevel?: string
    totalVisits?: number
    upcomingReservations?: number
} {
    if (typeof data !== 'object' || data === null) {
        return false
    }

    const obj = data as Record<string, unknown>

    const validAchievementLevel = obj.achievementLevel === undefined || typeof obj.achievementLevel === 'string'
    const validTotalVisits = obj.totalVisits === undefined || typeof obj.totalVisits === 'number'
    const validUpcomingReservations = obj.upcomingReservations === undefined || typeof obj.upcomingReservations === 'number'

    return validAchievementLevel && validTotalVisits && validUpcomingReservations
}

// UI Components (optimized imports)
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Dynamic imports for optimization
const MagicCard = dynamic(() => import('@/components/magicui/magic-card').then(mod => ({ default: mod.MagicCard })), {
    loading: () => <div className="animate-pulse bg-muted rounded-lg h-32" />,
    ssr: false
})

const BorderBeam = dynamic(() => import('@/components/magicui/border-beam').then(mod => ({ default: mod.BorderBeam })), {
    ssr: false
})

const SparklesText = dynamic(() => import('@/components/magicui/sparkles-text').then(mod => ({ default: mod.SparklesText })), {
    loading: () => <span className="text-lg font-bold">Disney Magic</span>,
    ssr: false
})

const BlurFade = dynamic(() => import('@/components/magicui/blur-fade').then(mod => ({ default: mod.BlurFade })), {
    ssr: false
})

// Icons
import {
    LayoutDashboard,
    Calendar,
    MapPin,
    Utensils,
    Clock,
    Users,
    Settings,
    Bell,
    Search,
    Menu,
    Star,
    Route,
    Hotel,
    Sparkles,
    Crown,
    PartyPopper,
    LogOut,
    User,
    ChevronRight,
    HelpCircle,
    Globe,
    Map,
    Camera,
    Bookmark,
    Shield,
    Zap,
    Phone
} from 'lucide-react'

// Utils
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children: React.ReactNode
}

interface NavigationItem {
    id: string
    title: string
    href: string
    icon: React.ReactNode
    badge?: string
    isNew?: boolean
    isPremium?: boolean
    description?: string
    children?: NavigationItem[]
    notification?: number
}

// Enhanced navigation with real features
const navigationItems: NavigationItem[] = [
    {
        id: 'overview',
        title: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        description: 'Your vacation command center'
    },
    {
        id: 'planning',
        title: 'AI Trip Planner',
        href: '/dashboard/planning',
        icon: <Calendar className="h-4 w-4" />,
        badge: 'AI',
        description: 'Intelligent Disney day planning'
    },
    {
        id: 'optimizer',
        title: 'Route Optimizer',
        href: '/dashboard/optimizer',
        icon: <Route className="h-4 w-4" />,
        isNew: true,
        description: 'Minimize wait times with smart routing'
    },
    {
        id: 'attractions',
        title: 'Live Wait Times',
        href: '/dashboard/attractions',
        icon: <Star className="h-4 w-4" />,
        description: 'Real-time attraction data & Lightning Lanes'
    },
    {
        id: 'dining',
        title: 'Dining Reservations',
        href: '/dashboard/dining',
        icon: <Utensils className="h-4 w-4" />,
        description: 'Restaurant bookings & meal plans'
    },
    {
        id: 'resorts',
        title: 'Resort Booking',
        href: '/dashboard/resorts',
        icon: <Hotel className="h-4 w-4" />,
        description: 'Hotels, amenities & room service'
    },
    {
        id: 'group',
        title: 'Travel Party',
        href: '/dashboard/group',
        icon: <Users className="h-4 w-4" />,
        description: 'Coordinate with family & friends'
    },
    {
        id: 'itinerary',
        title: 'My Itineraries',
        href: '/dashboard/itinerary',
        icon: <Map className="h-4 w-4" />,
        description: 'Saved plans & shared itineraries'
    },
    {
        id: 'parks',
        title: 'Interactive Maps',
        href: '/dashboard/parks',
        icon: <MapPin className="h-4 w-4" />,
        description: 'Navigate parks with GPS precision'
    },
    {
        id: 'events',
        title: 'Special Events',
        href: '/dashboard/events',
        icon: <PartyPopper className="h-4 w-4" />,
        description: 'Seasonal celebrations & limited events'
    },
    {
        id: 'disneysprings',
        title: 'Disney Springs',
        href: '/dashboard/disneysprings',
        icon: <Globe className="h-4 w-4" />,
        description: 'Shopping, dining & entertainment hub'
    },
    {
        id: 'memories',
        title: 'Photo Memories',
        href: '/dashboard/memories',
        icon: <Camera className="h-4 w-4" />,
        isNew: true,
        description: 'PhotoPass & vacation memories'
    }
]

const quickActions = [
    {
        title: 'Book Dining',
        icon: <Utensils className="h-3 w-3" />,
        href: '/dashboard/dining',
        description: 'Find & reserve restaurants'
    },
    {
        title: 'Check Wait Times',
        icon: <Clock className="h-3 w-3" />,
        href: '/dashboard/attractions',
        description: 'Live attraction data'
    },
    {
        title: 'Optimize Route',
        icon: <Route className="h-3 w-3" />,
        href: '/dashboard/optimizer',
        description: 'Plan efficient park routes'
    },
    {
        title: 'View Maps',
        icon: <Map className="h-3 w-3" />,
        href: '/dashboard/parks',
        description: 'Interactive park navigation'
    },
    {
        title: 'Live Updates',
        icon: <Zap className="h-3 w-3" />,
        href: '/dashboard/notifications',
        description: 'Real-time park alerts'
    },
    {
        title: 'Support',
        icon: <Phone className="h-3 w-3" />,
        href: '/dashboard/support',
        description: '24/7 vacation assistance'
    }
]

// Memoized sidebar component for performance
const DashboardSidebar = memo(({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) => {
    const pathname = usePathname()
    const { user } = useAuth()

    // Get hook data with proper typing
    const userStatsResult: UseUserStatsReturn = useUserStats()
    const notificationsResult: UseNotificationsReturn = useNotifications()

    // Memoize active state calculation
    const isItemActive = useCallback((href: string) => {
        return pathname === href || pathname.startsWith(href + '/')
    }, [pathname])

    // Memoize user display data
    const userDisplayData = useMemo(() => {
        if (!user) return { initials: 'G', displayName: 'Disney Guest' }

        const displayName = user.displayName || user.email?.split('@')[0] || 'Disney Guest'
        const initials = displayName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)

        return { initials, displayName }
    }, [user])

    // Extract and validate data safely with proper type checking
    const rawUserStats = userStatsResult.userStats
    const userStatsError = userStatsResult.error
    const statsLoading = userStatsResult.isLoading

    const rawNotifications = notificationsResult.notifications
    const notificationsError = notificationsResult.error

    // Safe userStats with proper type checking
    const safeUserStats = rawUserStats && !userStatsError && isValidUserStats(rawUserStats)
        ? rawUserStats
        : null

    // Safe notifications with proper type checking and filtering
    const safeNotifications = Array.isArray(rawNotifications) && !notificationsError
        ? rawNotifications.filter(isValidNotification)
        : []

    // Animation variants
    const sidebarVariants = {
        expanded: { width: 280 },
        collapsed: { width: 80 }
    }

    const contentVariants = {
        expanded: { opacity: 1, x: 0 },
        collapsed: { opacity: 0, x: -20 }
    }

    return (
        <motion.div
            initial={false}
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative h-full bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-r border-border/50 overflow-hidden"
        >
            <BorderBeam size={250} duration={12} delay={9} />

            {/* Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                key="logo"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <SparklesText className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Disney Magic
                                </SparklesText>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-8 w-8 hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <motion.div
                            animate={{ rotate: isCollapsed ? 0 : 180 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </div>
            </div>

            {/* User Stats Card */}
            <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.div
                        key="user-stats"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="p-4"
                    >
                        <MagicCard className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-0 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-10 w-10 ring-purple-200 dark:ring-purple-800 ring-offset-2">
                                    <AvatarImage
                                        src={user?.photoURL || ''}
                                        alt={userDisplayData.displayName}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                        {userDisplayData.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {userDisplayData.displayName}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Crown className="h-3 w-3 text-yellow-500" />
                                        <p className="text-xs text-muted-foreground truncate">
                                            {statsLoading ? 'Loading...' : (safeUserStats?.achievementLevel || 'New Explorer')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {userStatsError ? (
                                <div className="text-xs text-red-500 text-center py-2">
                                    Unable to load stats
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded cursor-pointer"
                                    >
                                        <div className="font-semibold text-blue-700 dark:text-blue-300">
                                            {statsLoading ? '...' : safeUserStats?.totalVisits || 0}
                                        </div>
                                        <div className="text-blue-600 dark:text-blue-400">Visits</div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded cursor-pointer"
                                    >
                                        <div className="font-semibold text-purple-700 dark:text-purple-300">
                                            {statsLoading ? '...' : safeUserStats?.upcomingReservations || 0}
                                        </div>
                                        <div className="text-purple-600 dark:text-purple-400">Plans</div>
                                    </motion.div>
                                </div>
                            )}
                        </MagicCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4">
                <nav className="space-y-1 py-4" role="navigation" aria-label="Main navigation">
                    {navigationItems.map((item, index) => {
                        const isActive = isItemActive(item.href)
                        const hasNotification = safeNotifications.some(n => n.category === item.id && !n.read)

                        return (
                            <TooltipProvider key={item.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ x: isCollapsed ? 0 : 4 }}
                                        >
                                            <Button
                                                variant={isActive ? "default" : "ghost"}
                                                className={cn(
                                                    "w-full justify-start gap-3 h-10 relative group transition-all duration-200",
                                                    isActive
                                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                                                        : "hover:bg-white/60 dark:hover:bg-black/30 hover:shadow-md",
                                                    isCollapsed && "justify-center px-2"
                                                )}
                                                asChild
                                            >
                                                <a href={item.href} aria-label={item.title}>
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className="relative">
                                                            {item.icon}
                                                            {hasNotification && (
                                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                            )}
                                                        </div>
                                                        <AnimatePresence mode="wait">
                                                            {!isCollapsed && (
                                                                <motion.div
                                                                    key="nav-content"
                                                                    variants={contentVariants}
                                                                    initial="collapsed"
                                                                    animate="expanded"
                                                                    exit="collapsed"
                                                                    className="flex items-center justify-between w-full"
                                                                >
                                                                    <span className="flex-1 text-left font-medium">{item.title}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        {item.badge && (
                                                                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 font-semibold">
                                                                                {item.badge}
                                                                            </Badge>
                                                                        )}
                                                                        {item.isNew && (
                                                                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 animate-pulse">
                                                                                New
                                                                            </Badge>
                                                                        )}
                                                                        {item.isPremium && (
                                                                            <Crown className="h-3 w-3 text-yellow-500" />
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTab"
                                                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md -z-10"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </a>
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right" className="ml-2 max-w-xs">
                                            <p className="font-medium">{item.title}</p>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                            )}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </nav>
            </ScrollArea>

            {/* Quick Actions */}
            <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.div
                        key="quick-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 border-t border-border/50"
                    >
                        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            Quick Actions
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action, index) => (
                                <motion.div
                                    key={action.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border-border/50 transition-all duration-200 group"
                                        asChild
                                    >
                                        <a href={action.href} className="flex items-center gap-1.5" title={action.description}>
                                            <div className="group-hover:scale-110 transition-transform duration-200">
                                                {action.icon}
                                            </div>
                                            <span className="truncate font-medium">{action.title}</span>
                                        </a>
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
})

DashboardSidebar.displayName = 'DashboardSidebar'

// Memoized header component
const DashboardHeader = memo(() => {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { notifications, markAsRead, unreadCount, error: notificationsError } = useNotifications()
    const [_searchOpen, setSearchOpen] = useState(false)

    // Safe notifications with proper type checking and memoized markAsRead function
    const safeNotifications = notifications && !notificationsError && Array.isArray(notifications)
        ? notifications.filter(isValidNotification)
        : []
    const safeUnreadCount = typeof unreadCount === 'number' ? unreadCount : 0

    const safeMarkAsRead = useMemo(() => {
        return markAsRead && typeof markAsRead === 'function' ? markAsRead : () => Promise.resolve()
    }, [markAsRead])

    // Generate breadcrumbs from pathname
    const breadcrumbs = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        const crumbs: Array<{ title: string; href: string; isLast?: boolean }> = []

        let currentPath = ''
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`

            // Map segments to friendly names
            const segmentMap: Record<string, string> = {
                'dashboard': 'Dashboard',
                'planning': 'AI Trip Planner',
                'optimizer': 'Route Optimizer',
                'attractions': 'Live Wait Times',
                'dining': 'Dining Reservations',
                'resorts': 'Resort Booking',
                'group': 'Travel Party',
                'itinerary': 'My Itineraries',
                'parks': 'Interactive Maps',
                'events': 'Special Events',
                'disneysprings': 'Disney Springs',
                'memories': 'Photo Memories',
                'settings': 'Settings'
            }

            const title = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

            crumbs.push({
                title,
                href: currentPath,
                isLast: index === segments.length - 1
            })
        })

        return crumbs
    }, [pathname])

    const handleNotificationClick = useCallback(async (notificationId: string) => {
        await safeMarkAsRead(notificationId)
    }, [safeMarkAsRead])

    const handleLogout = useCallback(async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }, [logout])

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Breadcrumbs */}
                <BlurFade delay={0.1}>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.href} className="flex items-center">
                                    {index > 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {crumb.isLast ? (
                                            <BreadcrumbPage className="font-medium">
                                                {crumb.title}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink
                                                href={crumb.href}
                                                className="hover:text-foreground transition-colors"
                                            >
                                                {crumb.title}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </BlurFade>

                {/* Header Actions */}
                <BlurFade delay={0.2}>
                    <div className="flex items-center gap-3">
                        {/* Global Search */}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-all duration-200 min-w-[120px] justify-start"
                                onClick={() => setSearchOpen(true)}
                            >
                                <Search className="h-4 w-4" />
                                <span className="hidden sm:inline text-muted-foreground">Search...</span>
                                <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                                    ⌘K
                                </kbd>
                            </Button>
                        </motion.div>

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="relative bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-all duration-200"
                                    >
                                        <Bell className="h-4 w-4" />
                                        <AnimatePresence>
                                            {safeUnreadCount > 0 && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute -top-2 -right-2"
                                                >
                                                    <Badge
                                                        variant="destructive"
                                                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                                                    >
                                                        {safeUnreadCount > 99 ? '99+' : safeUnreadCount}
                                                    </Badge>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
                                <DropdownMenuLabel className="flex items-center justify-between">
                                    <span>Notifications</span>
                                    {safeUnreadCount > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {safeUnreadCount} new
                                        </Badge>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {safeNotifications?.length ? (
                                    safeNotifications.slice(0, 10).map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                            onClick={() => handleNotificationClick(notification.id)}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    notification.read ? "bg-muted" : "bg-blue-500 animate-pulse"
                                                )} />
                                                <span className="font-medium text-sm">{notification.title}</span>
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    {new Date(notification.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground ml-4">
                                                {notification.message}
                                            </p>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled className="text-center text-muted-foreground">
                                        No notifications
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8 ring-purple-200 dark:ring-purple-800">
                                        <AvatarImage src={user?.photoURL || ''} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user?.displayName || 'Disney Guest'}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href="/dashboard/settings" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Profile Settings
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="/dashboard/settings" className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Preferences
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="/dashboard/memories" className="flex items-center gap-2">
                                        <Bookmark className="h-4 w-4" />
                                        Saved Items
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    Help & Support
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Privacy & Security
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </BlurFade>
            </div>
        </header>
    )
})

DashboardHeader.displayName = 'DashboardHeader'

// Mobile sidebar component
const MobileSidebar = memo(({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
                {children}
            </SheetContent>
        </Sheet>
    )
})

MobileSidebar.displayName = 'MobileSidebar'

// Main layout component

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <ProtectedRoute>
            <TooltipProvider>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex h-screen">
                        {/* Sidebar */}
                        <DashboardSidebar
                            isCollapsed={sidebarCollapsed}
                            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                        />

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <DashboardHeader />
                            <main className="flex-1 overflow-y-auto">
                                <div className="container mx-auto p-6 space-y-6">
                                    <Suspense fallback={
                                        <div className="flex items-center justify-center h-64">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    }>
                                        <BlurFade delay={0.3}>
                                            {children}
                                        </BlurFade>
                                    </Suspense>
                                </div>
                            </main>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur">
                            <div className="flex h-16 items-center justify-between px-4">
                                <MobileSidebar>
                                    <DashboardSidebar
                                        isCollapsed={false}
                                        onToggle={() => { }}
                                    />
                                </MobileSidebar>

                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Disney Magic
                                    </span>
                                </div>

                                <Button variant="outline" size="icon" className="relative">
                                    <Bell className="h-4 w-4" />
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                                    >
                                        3
                                    </Badge>
                                </Button>
                            </div>
                        </header>

                        <main className="p-4">
                            <Suspense fallback={
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            }>
                                {children}
                            </Suspense>
                        </main>
                    </div>
                </div>
            </TooltipProvider>
        </ProtectedRoute>
    )
}