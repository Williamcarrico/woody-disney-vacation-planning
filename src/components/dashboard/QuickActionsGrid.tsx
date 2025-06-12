import {
    Calendar, Clock, Utensils, Zap, Users, Wallet, Hotel, Route,
    Crown, TrendingUp, ArrowRight, Plus, Map, Camera, Ticket,
    Heart, Gift, Bus, Shield
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"

// Magic UI Components
import { MagicCard } from "@/components/magicui/magic-card"
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Meteors } from "@/components/magicui/meteors"

// Utils
import { cn } from "@/lib/utils"

interface QuickActionsGridProps {
    userId: string
    hasActiveVacation?: boolean
    vacationId?: string
}

interface QuickAction {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    href: string
    color: string
    gradient: string
    isNew?: boolean
    isTrending?: boolean
    isPremium?: boolean
    requiresVacation?: boolean
}

const quickActions: QuickAction[] = [
    {
        id: 'planning',
        title: 'Trip Planner',
        description: 'Plan your perfect Disney day',
        icon: <Calendar className="h-6 w-6" />,
        href: '/dashboard/planning',
        color: 'bg-blue-500',
        gradient: 'from-blue-500 to-cyan-500',
        isTrending: true
    },
    {
        id: 'optimizer',
        title: 'Route Optimizer',
        description: 'Optimize your park route',
        icon: <Route className="h-6 w-6" />,
        href: '/dashboard/optimizer',
        color: 'bg-purple-500',
        gradient: 'from-purple-500 to-pink-500',
        isNew: true
    },
    {
        id: 'dining',
        title: 'Dining Reservations',
        description: 'Find and book restaurants',
        icon: <Utensils className="h-6 w-6" />,
        href: '/dashboard/dining',
        color: 'bg-orange-500',
        gradient: 'from-orange-500 to-red-500'
    },
    {
        id: 'attractions',
        title: 'Wait Times',
        description: 'Live attraction wait times',
        icon: <Clock className="h-6 w-6" />,
        href: '/dashboard/attractions',
        color: 'bg-green-500',
        gradient: 'from-green-500 to-emerald-500'
    },
    {
        id: 'group',
        title: 'Group Planning',
        description: 'Plan with friends & family',
        icon: <Users className="h-6 w-6" />,
        href: '/dashboard/group',
        color: 'bg-indigo-500',
        gradient: 'from-indigo-500 to-blue-500',
        requiresVacation: true
    },
    {
        id: 'budget',
        title: 'Budget Tracker',
        description: 'Track vacation expenses',
        icon: <Wallet className="h-6 w-6" />,
        href: '/budget',
        color: 'bg-yellow-500',
        gradient: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'resorts',
        title: 'Resort Hotels',
        description: 'Explore Disney resorts',
        icon: <Hotel className="h-6 w-6" />,
        href: '/dashboard/resorts',
        color: 'bg-teal-500',
        gradient: 'from-teal-500 to-cyan-500'
    },
    {
        id: 'genie',
        title: 'Genie+ Planning',
        description: 'Lightning Lane optimization',
        icon: <Zap className="h-6 w-6" />,
        href: '/dashboard/genie',
        color: 'bg-violet-500',
        gradient: 'from-violet-500 to-purple-500',
        isPremium: true
    },
    {
        id: 'photopass',
        title: 'PhotoPass',
        description: 'View & download photos',
        icon: <Camera className="h-6 w-6" />,
        href: '/dashboard/photos',
        color: 'bg-pink-500',
        gradient: 'from-pink-500 to-rose-500'
    },
    {
        id: 'tickets',
        title: 'Park Tickets',
        description: 'Manage park tickets',
        icon: <Ticket className="h-6 w-6" />,
        href: '/dashboard/tickets',
        color: 'bg-amber-500',
        gradient: 'from-amber-500 to-yellow-500'
    },
    {
        id: 'maps',
        title: 'Interactive Maps',
        description: 'Explore park maps',
        icon: <Map className="h-6 w-6" />,
        href: '/map',
        color: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-green-500'
    },
    {
        id: 'transportation',
        title: 'Transportation',
        description: 'Disney transport info',
        icon: <Bus className="h-6 w-6" />,
        href: '/dashboard/transportation',
        color: 'bg-slate-500',
        gradient: 'from-slate-500 to-gray-500',
        isNew: true
    }
]

function QuickActionCard({ action, delay = 0, disabled = false }: {
    action: QuickAction
    delay?: number
    disabled?: boolean
}) {
    const cardContent = (
        <MagicCard className={cn(
            "h-full border-0 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm",
            disabled && "opacity-60"
        )}>
            <CardContent className="p-6 relative">
                {action.isPremium && !disabled && <Meteors number={10} />}

                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-r transition-all duration-300",
                        action.gradient,
                        !disabled && "group-hover:scale-110"
                    )}>
                        <div className="text-white">
                            {action.icon}
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {action.isNew && (
                            <Badge variant="secondary" className="text-xs">
                                New
                            </Badge>
                        )}
                        {action.isTrending && (
                            <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                            </Badge>
                        )}
                        {action.isPremium && (
                            <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    {disabled && action.requiresVacation && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                            Requires active vacation
                        </p>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "w-full mt-4 transition-all",
                        !disabled && "group-hover:bg-primary/10"
                    )}
                    disabled={disabled}
                    asChild={!disabled}
                >
                    {disabled ? (
                        <span className="flex items-center justify-center gap-2">
                            <Shield className="h-4 w-4" />
                            Locked
                        </span>
                    ) : (
                        <a href={action.href} className="flex items-center justify-center gap-2">
                            Open
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    )}
                </Button>

                {action.isPremium && !disabled && <BorderBeam size={250} duration={12} delay={9} />}
            </CardContent>
        </MagicCard>
    )

    if (action.isPremium && !disabled) {
        return (
            <BlurFade delay={delay}>
                <NeonGradientCard className="relative group cursor-pointer overflow-hidden h-full">
                    {cardContent}
                </NeonGradientCard>
            </BlurFade>
        )
    }

    return (
        <BlurFade delay={delay}>
            <div className={cn(
                "relative group overflow-hidden h-full",
                !disabled && "cursor-pointer hover:shadow-lg transition-all duration-300"
            )}>
                {cardContent}
            </div>
        </BlurFade>
    )
}

export default async function QuickActionsGrid({
    userId,
    hasActiveVacation = false,
    vacationId
}: QuickActionsGridProps) {
    return (
        <section className="space-y-6">
            <BlurFade delay={0.1}>
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Quick Actions
                    </h3>
                    {!hasActiveVacation && (
                        <Button variant="outline" size="sm" asChild>
                            <a href="/dashboard/planning">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Vacation
                            </a>
                        </Button>
                    )}
                </div>
            </BlurFade>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                    <QuickActionCard
                        key={action.id}
                        action={action}
                        delay={0.1 + index * 0.05}
                        disabled={action.requiresVacation && !hasActiveVacation}
                    />
                ))}
            </div>

            {!hasActiveVacation && (
                <BlurFade delay={0.8}>
                    <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                            <Heart className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                    Start Planning Your Magic
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    Create a vacation to unlock group planning features and personalized recommendations.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                                    asChild
                                >
                                    <a href="/dashboard/planning">
                                        <Gift className="h-4 w-4 mr-2" />
                                        Create Your First Vacation
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </BlurFade>
            )}
        </section>
    )
}