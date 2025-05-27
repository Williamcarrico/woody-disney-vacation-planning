"use client"

import { Suspense, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

// Auth & Context
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

// UI Components
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

// Magic UI Components
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { BlurFade } from '@/components/magicui/blur-fade'

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
    ChevronLeft,
    HelpCircle,
    Globe,
    Map
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
}

interface UserStats {
    totalVisits: number
    upcomingReservations: number
    magicMoments: number
    achievementLevel: string
}

const navigationItems: NavigationItem[] = [
    {
        id: 'overview',
        title: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        description: 'Your vacation overview'
    },
    {
        id: 'planning',
        title: 'Trip Planner',
        href: '/dashboard/planning',
        icon: <Calendar className="h-4 w-4" />,
        badge: 'AI',
        description: 'Plan your perfect Disney day'
    },
    {
        id: 'optimizer',
        title: 'Route Optimizer',
        href: '/dashboard/optimizer',
        icon: <Route className="h-4 w-4" />,
        isNew: true,
        description: 'Optimize your park routes'
    },
    {
        id: 'attractions',
        title: 'Attractions',
        href: '/dashboard/attractions',
        icon: <Star className="h-4 w-4" />,
        description: 'Wait times & Lightning Lanes'
    },
    {
        id: 'dining',
        title: 'Dining',
        href: '/dashboard/dining',
        icon: <Utensils className="h-4 w-4" />,
        description: 'Reservations & meal plans'
    },
    {
        id: 'resorts',
        title: 'Resorts',
        href: '/dashboard/resorts',
        icon: <Hotel className="h-4 w-4" />,
        description: 'Hotel bookings & amenities'
    },
    {
        id: 'group',
        title: 'My Party',
        href: '/dashboard/group',
        icon: <Users className="h-4 w-4" />,
        description: 'Manage your travel group'
    },
    {
        id: 'itinerary',
        title: 'Itineraries',
        href: '/dashboard/itinerary',
        icon: <Map className="h-4 w-4" />,
        description: 'Your saved plans'
    },
    {
        id: 'parks',
        title: 'Park Maps',
        href: '/dashboard/parks',
        icon: <MapPin className="h-4 w-4" />,
        description: 'Interactive park maps'
    },
    {
        id: 'events',
        title: 'Special Events',
        href: '/dashboard/events',
        icon: <PartyPopper className="h-4 w-4" />,
        description: 'Seasonal celebrations'
    },
    {
        id: 'disneysprings',
        title: 'Disney Springs',
        href: '/dashboard/disneysprings',
        icon: <Globe className="h-4 w-4" />,
        description: 'Shopping & entertainment'
    }
]

const quickActions = [
    { title: 'Book Dining', icon: <Utensils className="h-3 w-3" />, href: '/dashboard/dining' },
    { title: 'Check Wait Times', icon: <Clock className="h-3 w-3" />, href: '/dashboard/attractions' },
    { title: 'Plan Route', icon: <Route className="h-3 w-3" />, href: '/dashboard/optimizer' },
    { title: 'View Map', icon: <Map className="h-3 w-3" />, href: '/dashboard/parks' }
]

function DashboardSidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname()
    const { user } = useAuth()

    const mockUserStats: UserStats = {
        totalVisits: 12,
        upcomingReservations: 8,
        magicMoments: 23,
        achievementLevel: 'Magic Kingdom Explorer'
    }

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative h-full bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-r border-border/50"
        >
            <BorderBeam size={250} duration={12} delay={9} />

            {/* Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <SparklesText className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Disney Magic
                            </SparklesText>
                        </motion.div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-8 w-8 hover:bg-white/50 dark:hover:bg-black/20"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* User Stats Card */}
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4"
                >
                    <MagicCard className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10 ring-purple-200 dark:ring-purple-800">
                                <AvatarImage src={user?.photoURL || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user?.displayName || 'Disney Guest'}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Crown className="h-3 w-3 text-yellow-500" />
                                    <p className="text-xs text-muted-foreground truncate">
                                        {mockUserStats.achievementLevel}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                                <div className="font-semibold text-blue-700 dark:text-blue-300">
                                    {mockUserStats.totalVisits}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400">Visits</div>
                            </div>
                            <div className="text-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                                <div className="font-semibold text-purple-700 dark:text-purple-300">
                                    {mockUserStats.upcomingReservations}
                                </div>
                                <div className="text-purple-600 dark:text-purple-400">Plans</div>
                            </div>
                        </div>
                    </MagicCard>
                </motion.div>
            )}

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4">
                <nav className="space-y-2 py-4">
                    {navigationItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                            <TooltipProvider key={item.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Button
                                                variant={isActive ? "default" : "ghost"}
                                                className={cn(
                                                    "w-full justify-start gap-3 h-10 relative group",
                                                    isActive
                                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                                        : "hover:bg-white/50 dark:hover:bg-black/20",
                                                    isCollapsed && "justify-center px-2"
                                                )}
                                                asChild
                                            >
                                                <a href={item.href}>
                                                    <div className="flex items-center gap-3">
                                                        {item.icon}
                                                        {!isCollapsed && (
                                                            <>
                                                                <span className="flex-1 text-left">{item.title}</span>
                                                                <div className="flex items-center gap-1">
                                                                    {item.badge && (
                                                                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                                                            {item.badge}
                                                                        </Badge>
                                                                    )}
                                                                    {item.isNew && (
                                                                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                                                            New
                                                                        </Badge>
                                                                    )}
                                                                    {item.isPremium && (
                                                                        <Crown className="h-3 w-3 text-yellow-500" />
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
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
                                        <TooltipContent side="right" className="ml-2">
                                            <p className="font-medium">{item.title}</p>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
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
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 border-t border-border/50"
                >
                    <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                        Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action) => (
                            <Button
                                key={action.title}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border-border/50"
                                asChild
                            >
                                <a href={action.href} className="flex items-center gap-1.5">
                                    {action.icon}
                                    <span className="truncate">{action.title}</span>
                                </a>
                            </Button>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

function DashboardHeader() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [notifications] = useState(3) // Mock notification count

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean)
        const breadcrumbs: Array<{ title: string; href: string; isLast?: boolean }> = [{ title: 'Home', href: '/' }]

        let currentPath = ''
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`
            const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
            breadcrumbs.push({
                title,
                href: currentPath,
                isLast: index === segments.length - 1
            })
        })

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()

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
                        {/* Search */}
                        <Button variant="outline" size="sm" className="gap-2 bg-white/50 dark:bg-black/20">
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline">Search...</span>
                        </Button>

                        {/* Notifications */}
                        <Button variant="outline" size="icon" className="relative bg-white/50 dark:bg-black/20">
                            <Bell className="h-4 w-4" />
                            {notifications > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    {notifications}
                                </Badge>
                            )}
                        </Button>

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
                                        Profile
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="/dashboard/settings" className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    Help & Support
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600 dark:text-red-400"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </BlurFade>
            </div>
        </header>
    )
}

function MobileSidebar({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
                {children}
            </SheetContent>
        </Sheet>
    )
}

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