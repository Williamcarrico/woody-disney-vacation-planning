'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
    DollarSign,
    AlertTriangle,
    Target,
    Wallet,
    CreditCard,
    PiggyBank,
    ShoppingCart,
    Utensils,
    Gift,
    Camera,
    MapPin,
    Clock,
    Star,
    BarChart3,
    Settings,
    Calculator,
    Sparkles,
    LucideIcon
} from "lucide-react"
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Import Magic UI components
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { BlurFade } from '@/components/magicui/blur-fade'

interface BudgetAwareRecommendationsProps {
    vacationId: string
    className?: string
}

interface BudgetCategory {
    id: string
    name: string
    budgeted: number
    spent: number
    remaining: number
    icon: LucideIcon
}

interface SmartBudgetRecommendation {
    id: string
    type: 'save' | 'spend' | 'alert' | 'opportunity'
    category: string
    title: string
    description: string
    amount: number
    priority: 'low' | 'medium' | 'high' | 'urgent'
    confidence: number
    location?: {
        name: string
        distance: number
        coordinates: { lat: number; lng: number }
    }
    timeframe: string
    actions: string[]
    reasons: string[]
    savings?: number
    expiresAt?: Date
}

export default function BudgetAwareRecommendations({
    vacationId,
    className
}: BudgetAwareRecommendationsProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // State management
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [budgetAlertThreshold, setBudgetAlertThreshold] = useState([80]) // 80% spending threshold
    const [smartSpendingEnabled, setSmartSpendingEnabled] = useState(true)
    const [locationBasedDeals, setLocationBasedDeals] = useState(true)
    const [spendingPredictionsEnabled, setSpendingPredictionsEnabled] = useState(true)

    // Mock budget data (in real app, fetch from budget API)
    const budgetCategories: BudgetCategory[] = [
        {
            id: 'food',
            name: 'Food & Dining',
            budgeted: 800,
            spent: 320,
            remaining: 480,
            icon: Utensils
        },
        {
            id: 'souvenirs',
            name: 'Souvenirs & Gifts',
            budgeted: 300,
            spent: 180,
            remaining: 120,
            icon: Gift
        },
        {
            id: 'entertainment',
            name: 'Entertainment',
            budgeted: 200,
            spent: 45,
            remaining: 155,
            icon: Star
        },
        {
            id: 'photos',
            name: 'PhotoPass & Memories',
            budgeted: 150,
            spent: 75,
            remaining: 75,
            icon: Camera
        },
        {
            id: 'extras',
            name: 'Extras & Unexpected',
            budgeted: 250,
            spent: 60,
            remaining: 190,
            icon: Sparkles
        }
    ]

    // Calculate total budget stats
    const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0)
    const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0)
    const totalRemaining = budgetCategories.reduce((sum, cat) => sum + cat.remaining, 0)
    const spentPercentage = (totalSpent / totalBudget) * 100

    // Fetch smart budget recommendations
    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['budget-recommendations', vacationId, selectedCategory],
        queryFn: async () => {
            // Mock smart recommendations (in real app, fetch from AI service)
            const recs: SmartBudgetRecommendation[] = []

            // Check each budget category for recommendations
            budgetCategories.forEach(category => {
                const spentPercentage = (category.spent / category.budgeted) * 100

                // Overspending alert
                if (spentPercentage > budgetAlertThreshold[0]) {
                    recs.push({
                        id: `overspend-${category.id}`,
                        type: 'alert',
                        category: category.name,
                        title: `${category.name} Budget Alert`,
                        description: `You've spent ${spentPercentage.toFixed(0)}% of your ${category.name.toLowerCase()} budget`,
                        amount: category.spent,
                        priority: spentPercentage > 90 ? 'urgent' : 'high',
                        confidence: 0.95,
                        timeframe: 'immediate',
                        actions: ['Review recent purchases', 'Set spending limit', 'Find alternatives'],
                        reasons: [
                            `${spentPercentage.toFixed(0)}% of budget used`,
                            'Still have vacation days remaining',
                            'Consider adjusting spending habits'
                        ]
                    })
                }

                // Underspending opportunity
                if (spentPercentage < 30 && category.id !== 'extras') {
                    recs.push({
                        id: `underspend-${category.id}`,
                        type: 'opportunity',
                        category: category.name,
                        title: `${category.name} Opportunity`,
                        description: `You have $${category.remaining} remaining in your ${category.name.toLowerCase()} budget`,
                        amount: category.remaining,
                        priority: 'medium',
                        confidence: 0.85,
                        timeframe: 'vacation',
                        actions: ['Explore premium options', 'Try signature experiences', 'Add special treats'],
                        reasons: [
                            `Only ${spentPercentage.toFixed(0)}% of budget used`,
                            'Room for special experiences',
                            'Maximize vacation value'
                        ]
                    })
                }
            })

            // Location-based deal recommendations
            if (locationBasedDeals) {
                recs.push({
                    id: 'location-deal-1',
                    type: 'save',
                    category: 'Food & Dining',
                    title: 'Mobile Order Discount at Cosmic Ray\'s',
                    description: '15% off when you mobile order before 2 PM',
                    amount: 12,
                    priority: 'medium',
                    confidence: 0.9,
                    location: {
                        name: 'Cosmic Ray\'s Starlight Cafe',
                        distance: 450,
                        coordinates: { lat: 28.4156, lng: -81.5776 }
                    },
                    timeframe: '2 hours',
                    actions: ['Open mobile order', 'Walk to restaurant', 'Save on lunch'],
                    reasons: ['Close to your location', 'Time-limited offer', 'Popular restaurant'],
                    savings: 12,
                    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
                })

                recs.push({
                    id: 'location-deal-2',
                    type: 'opportunity',
                    category: 'Souvenirs & Gifts',
                    title: 'Disney PhotoPass at Space Mountain',
                    description: 'Capture magical moments on this iconic attraction',
                    amount: 25,
                    priority: 'low',
                    confidence: 0.75,
                    location: {
                        name: 'Space Mountain',
                        distance: 200,
                        coordinates: { lat: 28.4156, lng: -81.5776 }
                    },
                    timeframe: 'now',
                    actions: ['Add PhotoPass', 'Enjoy the ride', 'Share memories'],
                    reasons: ['You\'re nearby', 'Perfect lighting', 'Within photo budget']
                })
            }

            // Smart spending predictions
            if (spendingPredictionsEnabled) {
                const daysRemaining = 3 // Mock - calculate from vacation dates
                const currentDailySpending = totalSpent / 2 // Assume 2 days spent so far
                const projectedTotal = currentDailySpending * (daysRemaining + 2)

                if (projectedTotal > totalBudget) {
                    recs.push({
                        id: 'spending-prediction',
                        type: 'alert',
                        category: 'Overall Budget',
                        title: 'Spending Pace Alert',
                        description: `At current pace, you'll exceed budget by $${(projectedTotal - totalBudget).toFixed(0)}`,
                        amount: projectedTotal - totalBudget,
                        priority: 'high',
                        confidence: 0.8,
                        timeframe: 'vacation end',
                        actions: ['Reduce daily spending', 'Find free activities', 'Adjust remaining plans'],
                        reasons: [
                            `Current daily average: $${currentDailySpending.toFixed(0)}`,
                            `${daysRemaining} days remaining`,
                            'Projection based on spending pattern'
                        ]
                    })
                }
            }

            return recs.sort((a, b) => {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
            })
        },
        enabled: !!vacationId,
        refetchInterval: 300000 // Refresh every 5 minutes
    })

    // Filter recommendations
    const filteredRecommendations = useMemo(() => {
        if (!recommendations) return []

        if (selectedCategory === 'all') {
            return recommendations
        }

        return recommendations.filter(rec =>
            rec.category.toLowerCase().includes(selectedCategory.toLowerCase())
        )
    }, [recommendations, selectedCategory])

    // Get recommendation type color and icon
    const getRecommendationTypeInfo = (type: string) => {
        switch (type) {
            case 'save':
                return {
                    color: 'bg-green-100 text-green-600 border-green-200',
                    icon: <PiggyBank className="h-4 w-4" />,
                    label: 'Save Money'
                }
            case 'spend':
                return {
                    color: 'bg-blue-100 text-blue-600 border-blue-200',
                    icon: <ShoppingCart className="h-4 w-4" />,
                    label: 'Spend Wisely'
                }
            case 'alert':
                return {
                    color: 'bg-red-100 text-red-600 border-red-200',
                    icon: <AlertTriangle className="h-4 w-4" />,
                    label: 'Budget Alert'
                }
            case 'opportunity':
                return {
                    color: 'bg-purple-100 text-purple-600 border-purple-200',
                    icon: <Sparkles className="h-4 w-4" />,
                    label: 'Opportunity'
                }
            default:
                return {
                    color: 'bg-gray-100 text-gray-600 border-gray-200',
                    icon: <DollarSign className="h-4 w-4" />,
                    label: 'General'
                }
        }
    }

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500'
            case 'high': return 'bg-orange-500'
            case 'medium': return 'bg-yellow-500'
            default: return 'bg-green-500'
        }
    }

    // Suppress unused variable warning by logging it (can be removed when user is actually used)
    if (user) {
        // User context is available if needed
    }

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <SparklesText className="text-2xl font-bold tracking-tight">
                        Smart Budget Assistant
                    </SparklesText>
                    <p className="text-muted-foreground">
                        AI-powered budget recommendations for your Disney vacation
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <ShimmerButton className="h-9">
                        <Settings className="h-4 w-4 mr-2" />
                        Budget Settings
                    </ShimmerButton>
                </div>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <BlurFade delay={0.1}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Wallet className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Budget</p>
                                <p className="text-xl font-bold">
                                    $<NumberTicker value={totalBudget} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.2}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <CreditCard className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Spent</p>
                                <p className="text-xl font-bold">
                                    $<NumberTicker value={totalSpent} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.3}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <PiggyBank className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Remaining</p>
                                <p className="text-xl font-bold">
                                    $<NumberTicker value={totalRemaining} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.4}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Budget Used</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={Math.round(spentPercentage)} />%
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>
            </div>

            {/* Budget Progress by Category */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Budget Progress by Category
                    </CardTitle>
                    <CardDescription>
                        Track spending across different vacation categories
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {budgetCategories.map((category, index) => {
                            const percentage = (category.spent / category.budgeted) * 100
                            const Icon = category.icon

                            return (
                                <BlurFade key={category.id} delay={index * 0.1}>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                ${category.spent} / ${category.budgeted}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Progress
                                                value={percentage}
                                                className={cn(
                                                    "h-2",
                                                    percentage > 90 && "bg-red-100",
                                                    percentage > 75 && percentage <= 90 && "bg-yellow-100"
                                                )}
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{percentage.toFixed(1)}% used</span>
                                                <span>${category.remaining} remaining</span>
                                            </div>
                                        </div>
                                    </div>
                                </BlurFade>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Smart Budget Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Smart Budget Controls
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="smart-spending">Smart Spending Suggestions</Label>
                                <Switch
                                    id="smart-spending"
                                    checked={smartSpendingEnabled}
                                    onCheckedChange={setSmartSpendingEnabled}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="location-deals">Location-Based Deals</Label>
                                <Switch
                                    id="location-deals"
                                    checked={locationBasedDeals}
                                    onCheckedChange={setLocationBasedDeals}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="spending-predictions">Spending Predictions</Label>
                                <Switch
                                    id="spending-predictions"
                                    checked={spendingPredictionsEnabled}
                                    onCheckedChange={setSpendingPredictionsEnabled}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Budget Alert Threshold</Label>
                                <div className="mt-2 space-y-2">
                                    <Slider
                                        value={budgetAlertThreshold}
                                        onValueChange={setBudgetAlertThreshold}
                                        max={100}
                                        min={50}
                                        step={5}
                                        className="w-full"
                                    />
                                    <div className="text-sm text-muted-foreground">
                                        Alert when {budgetAlertThreshold[0]}% of category budget is spent
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Filter Recommendations</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="food">Food & Dining</SelectItem>
                                        <SelectItem value="souvenirs">Souvenirs & Gifts</SelectItem>
                                        <SelectItem value="entertainment">Entertainment</SelectItem>
                                        <SelectItem value="photos">PhotoPass & Memories</SelectItem>
                                        <SelectItem value="extras">Extras & Unexpected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Smart Recommendations */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Smart Budget Recommendations ({filteredRecommendations?.length || 0})
                </h3>

                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                    ))
                ) : filteredRecommendations && filteredRecommendations.length > 0 ? (
                    filteredRecommendations.map((recommendation, index) => {
                        const typeInfo = getRecommendationTypeInfo(recommendation.type)

                        return (
                            <BlurFade key={recommendation.id} delay={index * 0.1}>
                                <MagicCard className="p-6 relative overflow-hidden">
                                    {recommendation.priority === 'urgent' && <BorderBeam />}

                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-3 rounded-lg border",
                                                typeInfo.color
                                            )}>
                                                {typeInfo.icon}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {recommendation.title}
                                                    </h3>

                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            getPriorityColor(recommendation.priority)
                                                        )} />

                                                        <Badge variant="outline" className="text-xs">
                                                            {typeInfo.label}
                                                        </Badge>

                                                        {recommendation.expiresAt && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Expires {format(recommendation.expiresAt, 'h:mm a')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-muted-foreground mb-3">
                                                    {recommendation.description}
                                                </p>

                                                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                        <span>${recommendation.amount}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{recommendation.timeframe}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Target className="h-4 w-4 text-muted-foreground" />
                                                        <span>{Math.round(recommendation.confidence * 100)}% confidence</span>
                                                    </div>
                                                </div>

                                                {recommendation.location && (
                                                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-primary" />
                                                            <span className="font-medium">{recommendation.location.name}</span>
                                                            <span className="text-muted-foreground">
                                                                • {recommendation.location.distance}m away
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {recommendation.reasons.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-sm font-medium mb-2">Why this recommendation:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {recommendation.reasons.map((reason, i) => (
                                                                <Badge key={i} variant="secondary" className="text-xs">
                                                                    {reason}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-2">
                                                    {recommendation.actions.map((action, i) => (
                                                        <Button
                                                            key={i}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Handle action based on type
                                                                if (action.includes('mobile order')) {
                                                                    toast.success('Opening mobile order...')
                                                                } else if (action.includes('location')) {
                                                                    toast.success('Opening navigation...')
                                                                } else {
                                                                    toast.info(`Action: ${action}`)
                                                                }
                                                            }}
                                                        >
                                                            {action}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="mb-2">
                                                <div className="text-lg font-bold text-primary">
                                                    {recommendation.priority.toUpperCase()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Priority</div>
                                            </div>

                                            {recommendation.savings && (
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-green-600">
                                                        Save ${recommendation.savings}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Potential savings</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </MagicCard>
                            </BlurFade>
                        )
                    })
                ) : (
                    <Card className="p-8 text-center">
                        <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No budget recommendations</h3>
                        <p className="text-muted-foreground mb-4">
                            Your spending is on track! We&apos;ll notify you of any opportunities.
                        </p>
                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['budget-recommendations'] })}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Check for Updates
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    )
}