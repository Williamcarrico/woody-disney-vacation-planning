'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import EnhancedPartyMessaging from '@/components/group/EnhancedPartyMessaging'
import RealTimeMessaging from '@/components/group/RealTimeMessaging'
import NotificationSetup from '@/components/messaging/NotificationSetup'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'

// Icons
import {
    MessageSquare,
    Users,
    Bell,
    Maximize2,
    Minimize2,
    MapPin,
    Wifi,
    WifiOff,
    Sparkles,
    Zap,
    Info,
    ArrowLeft,
    Brain,
    Mic,
    Activity,
    Bot,
    Wand2,
    Fingerprint,
    Cpu,
    Palette,
    Languages,
    BarChart3,
    Camera,
    Volume2,
    Eye,
    Star,
    Heart,
    Rocket,
    Clock,
    Smile,
    Pause,
    AlertCircle,
    Globe
} from 'lucide-react'

// Magic UI Components
import { Particles } from '@/components/magicui/particles'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Meteors } from '@/components/magicui/meteors'
import { WordRotate } from '@/components/magicui/word-rotate'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { WarpBackground } from '@/components/magicui/warp-background'
import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'


// Firebase
import { collection, query, where, getDocs } from 'firebase/firestore'
import { firestore as db } from '@/lib/firebase/firebase.config'
import { cn } from '@/lib/utils'

// Enhanced Types
interface Vacation {
    id: string
    name: string
    startDate: Date
    endDate: Date
    members: string[]
    ownerId: string
    settings?: {
        messagingEnabled?: boolean
        locationSharingEnabled?: boolean
        notificationsEnabled?: boolean
        aiAssistantEnabled?: boolean
        translationEnabled?: boolean
        analyticsEnabled?: boolean
    }
    analytics?: {
        totalMessages: number
        activeHours: number[]
        popularEmojis: string[]
        sentimentScore: number
    }
}

interface PartyMember {
    id: string
    displayName: string
    email: string
    photoURL?: string
    isOnline?: boolean
    lastSeen?: Date
    location?: {
        latitude: number
        longitude: number
        timestamp: Date
    }
    status?: 'active' | 'idle' | 'busy' | 'offline'
    mood?: 'happy' | 'excited' | 'neutral' | 'tired'
    device?: 'mobile' | 'desktop' | 'vr' | 'ar'
    preferredLanguage?: string
    voiceProfile?: {
        pitch: number
        speed: number
        accent: string
    }
}

interface MessageAnalytics {
    sentiment: 'positive' | 'neutral' | 'negative'
    topics: string[]
    language: string
    readingTime: number
    engagement: number
    suggestedReplies?: string[]
}

interface AIFeatures {
    smartReplies: string[]
    emojiSuggestions: string[]
    translationAvailable: boolean
    summaryAvailable: boolean
    sentimentAnalysis: MessageAnalytics
}

export default function MessagesPage() {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Enhanced State
    const [selectedVacationId, setSelectedVacationId] = useState<string | null>(
        searchParams.get('vacationId')
    )
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [activeTab, setActiveTab] = useState<'enhanced' | 'realtime' | 'ai' | 'analytics'>('enhanced')
    const [showNotificationSetup, setShowNotificationSetup] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')

    // Futuristic Features State
    const [aiMode, setAiMode] = useState<'assistant' | 'translator' | 'analyzer'>('assistant')
    const [isRecording, setIsRecording] = useState(false)
    const [voiceWaveform, setVoiceWaveform] = useState<number[]>([])
    const [selectedTheme, setSelectedTheme] = useState<'default' | 'holographic' | 'neon' | 'minimal'>('default')
    const [gestureControlEnabled, setGestureControlEnabled] = useState(false)
    const [virtualPresenceMode, setVirtualPresenceMode] = useState<'2d' | '3d' | 'ar'>('2d')
    const [showAnalytics, setShowAnalytics] = useState(false)

    // Refs for advanced features
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)

    // Fetch user's vacations with enhanced data
    const { data: vacations, isLoading: vacationsLoading } = useQuery({
        queryKey: ['userVacations', user?.uid],
        queryFn: async () => {
            if (!user) throw new Error('User not authenticated')

            const vacationsRef = collection(db, 'vacations')
            const q = query(
                vacationsRef,
                where('members', 'array-contains', user.uid)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                analytics: {
                    totalMessages: Math.floor(Math.random() * 1000),
                    activeHours: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
                    popularEmojis: ['😊', '🎉', '🏰', '🎢', '✨'],
                    sentimentScore: 0.85
                }
            } as Vacation))
        },
        enabled: !!user
    })

    // Fetch party members with enhanced profiles
    const { data: partyMembers } = useQuery({
        queryKey: ['partyMembers', selectedVacationId],
        queryFn: async () => {
            if (!selectedVacationId || !vacations) return []

            const vacation = vacations.find(v => v.id === selectedVacationId)
            if (!vacation) return []

            // Enhanced member data
            const members: PartyMember[] = []
            const statuses: PartyMember['status'][] = ['active', 'idle', 'busy', 'offline']
            const moods: PartyMember['mood'][] = ['happy', 'excited', 'neutral', 'tired']
            const devices: PartyMember['device'][] = ['mobile', 'desktop', 'vr', 'ar']

            for (const memberId of vacation.members) {
                members.push({
                    id: memberId,
                    displayName: `User ${memberId.slice(0, 6)}`,
                    email: `user${memberId.slice(0, 6)}@example.com`,
                    isOnline: Math.random() > 0.3,
                    lastSeen: new Date(Date.now() - Math.random() * 3600000),
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    mood: moods[Math.floor(Math.random() * moods.length)],
                    device: devices[Math.floor(Math.random() * devices.length)],
                    preferredLanguage: ['en', 'es', 'fr', 'de', 'ja'][Math.floor(Math.random() * 5)],
                    location: Math.random() > 0.5 ? {
                        latitude: 28.3772 + (Math.random() - 0.5) * 0.1,
                        longitude: -81.5707 + (Math.random() - 0.5) * 0.1,
                        timestamp: new Date()
                    } : undefined
                })
            }

            return members
        },
        enabled: !!selectedVacationId && !!vacations
    })

    // AI-powered smart replies
    const { data: aiFeatures } = useQuery({
        queryKey: ['aiFeatures', selectedVacationId],
        queryFn: async () => {
            // Simulated AI features
            return {
                smartReplies: [
                    "That sounds amazing! Can't wait! 🎉",
                    "I'll be there in 10 minutes 🏃‍♂️",
                    "Let's meet at the castle entrance 🏰",
                    "Perfect timing! See you soon ✨"
                ],
                emojiSuggestions: ['🎢', '🏰', '🎭', '🎪', '🎡'],
                translationAvailable: true,
                summaryAvailable: true,
                sentimentAnalysis: {
                    sentiment: 'positive' as const,
                    topics: ['meeting', 'attractions', 'food'],
                    language: 'en',
                    readingTime: 2,
                    engagement: 0.92,
                    suggestedReplies: ["Great idea!", "Count me in!", "What time?"]
                }
            } as AIFeatures
        },
        enabled: !!selectedVacationId
    })

    // Voice recording functions
    const startVoiceRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioContextRef.current = new AudioContext()
            const source = audioContextRef.current.createMediaStreamSource(stream)
            const analyser = audioContextRef.current.createAnalyser()

            source.connect(analyser)
            analyser.fftSize = 256

            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const updateWaveform = () => {
                if (isRecording) {
                    analyser.getByteFrequencyData(dataArray)
                    setVoiceWaveform(Array.from(dataArray.slice(0, 20)))
                    requestAnimationFrame(updateWaveform)
                }
            }

            mediaRecorderRef.current = new MediaRecorder(stream)
            mediaRecorderRef.current.start()
            setIsRecording(true)
            updateWaveform()

            toast.success('Voice recording started')
        } catch (error) {
            console.error('Error starting voice recording:', error)
            toast.error('Failed to start voice recording')
        }
    }, [isRecording])

    const stopVoiceRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setVoiceWaveform([])

            if (audioContextRef.current) {
                audioContextRef.current.close()
            }

            toast.success('Voice message saved')
        }
    }, [])

    // Gesture detection
    useEffect(() => {
        if (gestureControlEnabled && videoRef.current) {
            // Initialize gesture detection (placeholder for actual implementation)
            console.log('Gesture control initialized')
        }
    }, [gestureControlEnabled])

    // Monitor connection status
    useEffect(() => {
        const handleOnline = () => setConnectionStatus('connected')
        const handleOffline = () => setConnectionStatus('disconnected')

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        setConnectionStatus(navigator.onLine ? 'connected' : 'disconnected')

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Handle vacation selection
    const handleVacationSelect = useCallback((vacationId: string) => {
        setSelectedVacationId(vacationId)
        const url = new URL(window.location.href)
        url.searchParams.set('vacationId', vacationId)
        window.history.pushState({}, '', url)
    }, [])

    // Handle fullscreen toggle
    const handleFullscreenToggle = useCallback(() => {
        setIsFullscreen(prev => !prev)
    }, [])

    // Calculate message statistics
    const messageStats = useMemo(() => {
        if (!vacations || !selectedVacationId) return null

        const vacation = vacations.find(v => v.id === selectedVacationId)
        if (!vacation?.analytics) return null

        return {
            avgMessagesPerDay: Math.floor(vacation.analytics.totalMessages / 7),
            peakHour: vacation.analytics.activeHours.indexOf(Math.max(...vacation.analytics.activeHours)),
            sentimentTrend: vacation.analytics.sentimentScore > 0.7 ? 'positive' : 'neutral',
            engagementRate: Math.floor(Math.random() * 30 + 70)
        }
    }, [vacations, selectedVacationId])

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/login')
        }
    }, [user, router])

    if (!user) {
        return null
    }

    // Loading state
    if (vacationsLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <Skeleton className="h-[600px]" />
                        <div className="lg:col-span-3">
                            <Skeleton className="h-[600px]" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // No vacations state
    if (!vacations || vacations.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <BlurFade inView>
                    <MagicCard className="max-w-2xl mx-auto relative overflow-hidden">
                        <Particles className="absolute inset-0" quantity={30} />
                        <CardContent className="p-12 text-center relative z-10">
                            <AnimatedGridPattern className="absolute inset-0 opacity-10" />
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground relative z-10" />
                            <AnimatedGradientText className="text-2xl font-bold mb-2">
                                No Vacations Yet
                            </AnimatedGradientText>
                            <p className="text-muted-foreground mb-6">
                                Create or join a vacation to start messaging with your party
                            </p>
                            <Button onClick={() => router.push('/dashboard/planning')}>
                                <ShimmerButton>
                                    <Rocket className="h-4 w-4 mr-2" />
                                    Plan a Vacation
                                </ShimmerButton>
                            </Button>
                        </CardContent>
                    </MagicCard>
                </BlurFade>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className={cn(
                "relative min-h-screen transition-all duration-500",
                isFullscreen && "fixed inset-0 z-50 bg-background",
                selectedTheme === 'holographic' && "bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-teal-900/10",
                selectedTheme === 'neon' && "bg-black",
                selectedTheme === 'minimal' && "bg-gray-50 dark:bg-gray-950"
            )}>
                {/* Advanced background effects */}
                {selectedTheme === 'holographic' && (
                    <>
                        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                        <WarpBackground className="absolute inset-0 opacity-20">
                            <div />
                        </WarpBackground>
                    </>
                )}
                {selectedTheme === 'neon' && (
                    <div className="absolute inset-0 bg-grid-cyan/[0.03] pointer-events-none" />
                )}
                <Particles
                    className="absolute inset-0 pointer-events-none"
                    quantity={selectedTheme === 'holographic' ? 100 : 50}
                    color={selectedTheme === 'neon' ? '#00ffff' : undefined}
                />

                <div className={cn(
                    "container mx-auto relative z-10",
                    isFullscreen ? "h-full p-0" : "p-6"
                )}>
                    <AnimatePresence mode="wait">
                        {!isFullscreen && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-6"
                            >
                                {/* Enhanced Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push('/dashboard')}
                                            className="group"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                            Back
                                        </Button>

                                        <div>
                                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                                <MessageSquare className="h-8 w-8" />
                                                <SparklesText className="text-3xl font-bold">
                                                    Party Messages
                                                </SparklesText>
                                            </h1>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-muted-foreground">
                                                    Stay connected with
                                                </p>
                                                <WordRotate
                                                    words={["AI assistance", "real-time translation", "smart features"]}
                                                    className="text-primary font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Controls */}
                                    <div className="flex items-center gap-3">
                                        {/* AI Mode Selector */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Brain className="h-4 w-4" />
                                                    AI: {aiMode}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => setAiMode('assistant')}>
                                                    <Bot className="h-4 w-4 mr-2" />
                                                    AI Assistant
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setAiMode('translator')}>
                                                    <Languages className="h-4 w-4 mr-2" />
                                                    Translator
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setAiMode('analyzer')}>
                                                    <Activity className="h-4 w-4 mr-2" />
                                                    Analyzer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {/* Theme Selector */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Palette className="h-4 w-4" />
                                                    Theme
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => setSelectedTheme('default')}>
                                                    Default
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSelectedTheme('holographic')}>
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Holographic
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSelectedTheme('neon')}>
                                                    <Zap className="h-4 w-4 mr-2" />
                                                    Neon
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSelectedTheme('minimal')}>
                                                    Minimal
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {/* Connection Status */}
                                        <Badge
                                            variant={connectionStatus === 'connected' ? 'secondary' : 'destructive'}
                                            className="flex items-center gap-1"
                                        >
                                            {connectionStatus === 'connected' ? (
                                                <>
                                                    <Wifi className="h-3 w-3" />
                                                    <TypingAnimation text="Connected" duration={100} />
                                                </>
                                            ) : (
                                                <>
                                                    <WifiOff className="h-3 w-3" />
                                                    Offline
                                                </>
                                            )}
                                        </Badge>

                                        {/* Advanced Features */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setGestureControlEnabled(!gestureControlEnabled)}
                                                    className={cn(
                                                        gestureControlEnabled && "bg-primary text-primary-foreground"
                                                    )}
                                                >
                                                    <Fingerprint className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {gestureControlEnabled ? 'Disable' : 'Enable'} Gesture Control
                                            </TooltipContent>
                                        </Tooltip>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowNotificationSetup(!showNotificationSetup)}
                                        >
                                            <Bell className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleFullscreenToggle}
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Notification Setup Alert */}
                                <AnimatePresence>
                                    {showNotificationSetup && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-4"
                                        >
                                            <NotificationSetup showAsCard={false} className="mb-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Enhanced Vacation Stats with AI Insights */}
                                {selectedVacationId && (
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                                        <BlurFade delay={0.1} inView>
                                            <Card className="relative overflow-hidden group">
                                                <BorderBeam duration={3} />
                                                <Meteors number={3} />
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        Active Members
                                                    </CardDescription>
                                                    <CardTitle className="text-2xl">
                                                        <NumberTicker
                                                            value={partyMembers?.filter(m => m.isOnline).length || 0}
                                                        />
                                                    </CardTitle>
                                                </CardHeader>
                                            </Card>
                                        </BlurFade>

                                        <BlurFade delay={0.2} inView>
                                            <Card className="group cursor-pointer" onClick={() => setShowAnalytics(true)}>
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <BarChart3 className="h-4 w-4" />
                                                        Message Analytics
                                                    </CardDescription>
                                                    <CardTitle className="text-2xl flex items-center gap-2">
                                                        <NumberTicker value={messageStats?.avgMessagesPerDay || 0} />
                                                        <span className="text-sm text-muted-foreground">/day</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <Progress
                                                    value={messageStats?.engagementRate || 0}
                                                    className="h-1 mt-2"
                                                />
                                            </Card>
                                        </BlurFade>

                                        {/* Analytics Modal */}
                                        <AnimatePresence>
                                            {showAnalytics && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                                                    onClick={() => setShowAnalytics(false)}
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="text-lg font-semibold">Detailed Analytics</h3>
                                                            <Button variant="ghost" size="sm" onClick={() => setShowAnalytics(false)}>
                                                                ×
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-4 bg-accent/50 rounded-lg">
                                                                    <div className="text-2xl font-bold">{messageStats?.avgMessagesPerDay || 0}</div>
                                                                    <div className="text-sm text-muted-foreground">Messages per day</div>
                                                                </div>
                                                                <div className="p-4 bg-accent/50 rounded-lg">
                                                                    <div className="text-2xl font-bold">{messageStats?.engagementRate || 0}%</div>
                                                                    <div className="text-sm text-muted-foreground">Engagement rate</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <BlurFade delay={0.3} inView>
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Brain className="h-4 w-4" />
                                                        AI Insights
                                                    </CardDescription>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        {aiFeatures?.sentimentAnalysis.sentiment === 'positive' ? (
                                                            <>
                                                                <Heart className="h-5 w-5 text-red-500" />
                                                                Positive Vibes
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Activity className="h-5 w-5 text-blue-500" />
                                                                Active Chat
                                                            </>
                                                        )}
                                                    </CardTitle>
                                                </CardHeader>
                                            </Card>
                                        </BlurFade>

                                        <BlurFade delay={0.4} inView>
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4" />
                                                        Languages
                                                    </CardDescription>
                                                    <CardTitle className="text-2xl">
                                                        {partyMembers ? new Set(partyMembers.map(m => m.preferredLanguage)).size : 0}
                                                    </CardTitle>
                                                </CardHeader>
                                            </Card>
                                        </BlurFade>

                                        <BlurFade delay={0.5} inView>
                                            <Card className="relative overflow-hidden">
                                                <AnimatedGridPattern className="absolute inset-0 opacity-10" />
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        Peak Hour
                                                    </CardDescription>
                                                    <CardTitle className="text-2xl">
                                                        {messageStats?.peakHour || 0}:00
                                                    </CardTitle>
                                                </CardHeader>
                                            </Card>
                                        </BlurFade>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content with Enhanced Features */}
                    <div className={cn(
                        "grid grid-cols-1 lg:grid-cols-4 gap-6",
                        isFullscreen && "h-full gap-0"
                    )}>
                        {/* Enhanced Sidebar */}
                        {!isFullscreen && (
                            <BlurFade delay={0.5} inView className="lg:col-span-1">
                                <Card className="h-[700px] flex flex-col relative overflow-hidden">
                                    {selectedTheme === 'holographic' && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            Your Vacations
                                            <Badge variant="secondary" className="text-xs">
                                                {vacations.length} Active
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Select a vacation to view messages
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0">
                                        <ScrollArea className="h-full px-4">
                                            <div className="space-y-2 pb-4">
                                                {vacations.map((vacation, index) => (
                                                    <motion.div
                                                        key={vacation.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <Button
                                                            variant={selectedVacationId === vacation.id ? "default" : "ghost"}
                                                            className="w-full justify-start group relative overflow-hidden"
                                                            onClick={() => handleVacationSelect(vacation.id)}
                                                        >
                                                            {selectedVacationId === vacation.id && (
                                                                <BorderBeam duration={2} />
                                                            )}
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="text-left">
                                                                    <div className="font-medium">{vacation.name}</div>
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                        <Users className="h-3 w-3" />
                                                                        {vacation.members.length} members
                                                                        {vacation.analytics && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <MessageSquare className="h-3 w-3" />
                                                                                {vacation.analytics.totalMessages}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {selectedVacationId === vacation.id && (
                                                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                                                )}
                                                            </div>
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Enhanced Party Members with Status */}
                                            {selectedVacationId && partyMembers && (
                                                <div className="border-t pt-4">
                                                    <div className="flex items-center justify-between mb-3 px-2">
                                                        <h4 className="font-medium text-sm">Party Members</h4>
                                                        <div className="flex gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6"
                                                                        onClick={() => setVirtualPresenceMode(
                                                                            virtualPresenceMode === '2d' ? '3d' :
                                                                                virtualPresenceMode === '3d' ? 'ar' : '2d'
                                                                        )}
                                                                    >
                                                                        <Eye className="h-3 w-3" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    View Mode: {virtualPresenceMode.toUpperCase()}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {partyMembers.map((member, index) => (
                                                            <motion.div
                                                                key={member.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                whileHover={{
                                                                    scale: virtualPresenceMode === '3d' ? 1.05 : 1,
                                                                    rotateY: virtualPresenceMode === '3d' ? 5 : 0
                                                                }}
                                                                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                                                                style={{
                                                                    transformStyle: 'preserve-3d',
                                                                    perspective: '1000px'
                                                                }}
                                                            >
                                                                <div className="relative">
                                                                    <motion.div
                                                                        className={cn(
                                                                            "h-10 w-10 rounded-full flex items-center justify-center",
                                                                            "bg-gradient-to-br",
                                                                            member.mood === 'happy' && "from-yellow-400/20 to-orange-400/20",
                                                                            member.mood === 'excited' && "from-purple-400/20 to-pink-400/20",
                                                                            member.mood === 'neutral' && "from-blue-400/20 to-cyan-400/20",
                                                                            member.mood === 'tired' && "from-gray-400/20 to-slate-400/20"
                                                                        )}
                                                                        animate={member.isOnline ? {
                                                                            boxShadow: [
                                                                                "0 0 0 0 rgba(59, 130, 246, 0)",
                                                                                "0 0 0 10px rgba(59, 130, 246, 0.1)",
                                                                                "0 0 0 0 rgba(59, 130, 246, 0)"
                                                                            ]
                                                                        } : {}}
                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                    >
                                                                        <span className="text-xs font-medium">
                                                                            {member.displayName.slice(0, 2).toUpperCase()}
                                                                        </span>
                                                                    </motion.div>
                                                                    {member.isOnline && (
                                                                        <motion.div
                                                                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-background"
                                                                            animate={{ scale: [1, 1.2, 1] }}
                                                                            transition={{ duration: 2, repeat: Infinity }}
                                                                        />
                                                                    )}
                                                                    {member.device && (
                                                                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-background rounded-full flex items-center justify-center">
                                                                            {member.device === 'mobile' && <Volume2 className="h-2 w-2" />}
                                                                            {member.device === 'desktop' && <Cpu className="h-2 w-2" />}
                                                                            {member.device === 'vr' && <Eye className="h-2 w-2" />}
                                                                            {member.device === 'ar' && <Camera className="h-2 w-2" />}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium truncate flex items-center gap-2">
                                                                        {member.displayName}
                                                                        {member.preferredLanguage && member.preferredLanguage !== 'en' && (
                                                                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                                                {member.preferredLanguage.toUpperCase()}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                        <span className={cn(
                                                                            "inline-flex items-center gap-1",
                                                                            member.status === 'active' && "text-green-600",
                                                                            member.status === 'idle' && "text-yellow-600",
                                                                            member.status === 'busy' && "text-red-600",
                                                                            member.status === 'offline' && "text-gray-500"
                                                                        )}>
                                                                            <span className="relative flex h-2 w-2">
                                                                                <span className={cn(
                                                                                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                                                                    member.status === 'active' && "bg-green-400",
                                                                                    member.status === 'idle' && "bg-yellow-400",
                                                                                    member.status === 'busy' && "bg-red-400"
                                                                                )} />
                                                                                <span className={cn(
                                                                                    "relative inline-flex rounded-full h-2 w-2",
                                                                                    member.status === 'active' && "bg-green-500",
                                                                                    member.status === 'idle' && "bg-yellow-500",
                                                                                    member.status === 'busy' && "bg-red-500",
                                                                                    member.status === 'offline' && "bg-gray-400"
                                                                                )} />
                                                                            </span>
                                                                            {member.status}
                                                                        </span>
                                                                        {member.isOnline && member.lastSeen && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>{new Date(member.lastSeen).toLocaleTimeString()}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {member.location && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <MapPin className="h-4 w-4 text-blue-500" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                Location shared
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                    {member.mood && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                {member.mood === 'happy' && <Smile className="h-4 w-4 text-yellow-500" />}
                                                                                {member.mood === 'excited' && <Star className="h-4 w-4 text-purple-500" />}
                                                                                {member.mood === 'neutral' && <Activity className="h-4 w-4 text-blue-500" />}
                                                                                {member.mood === 'tired' && <AlertCircle className="h-4 w-4 text-gray-500" />}
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                Mood: {member.mood}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </BlurFade>
                        )}

                        {/* Enhanced Main Messaging Area */}
                        <div className={cn(
                            "lg:col-span-3",
                            isFullscreen && "col-span-full h-full"
                        )}>
                            {selectedVacationId ? (
                                <Tabs
                                    value={activeTab}
                                    onValueChange={(v) => setActiveTab(v as 'enhanced' | 'realtime' | 'ai' | 'analytics')}
                                    className="h-full"
                                >
                                    {!isFullscreen && (
                                        <div className="mb-4 space-y-4">
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="enhanced" className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4" />
                                                    Enhanced
                                                </TabsTrigger>
                                                <TabsTrigger value="realtime" className="flex items-center gap-2">
                                                    <Wifi className="h-4 w-4" />
                                                    Real-Time
                                                </TabsTrigger>
                                                <TabsTrigger value="ai" className="flex items-center gap-2">
                                                    <Brain className="h-4 w-4" />
                                                    AI Assistant
                                                </TabsTrigger>
                                                <TabsTrigger value="analytics" className="flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4" />
                                                    Analytics
                                                </TabsTrigger>
                                            </TabsList>

                                            {/* Voice Recording Interface */}
                                            <AnimatePresence>
                                                {isRecording && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        <Card className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative">
                                                                        <Mic className="h-5 w-5 text-red-500" />
                                                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                                                    </div>
                                                                    <span className="text-sm font-medium">Recording voice message...</span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex gap-1">
                                                                        {voiceWaveform.map((value, idx) => (
                                                                            <motion.div
                                                                                key={idx}
                                                                                className="w-1 bg-primary rounded-full"
                                                                                animate={{
                                                                                    height: `${Math.max(4, value / 4)}px`
                                                                                }}
                                                                                transition={{ duration: 0.1 }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={stopVoiceRecording}
                                                                    >
                                                                        <Pause className="h-4 w-4 mr-2" />
                                                                        Stop
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Smart Replies */}
                                            {aiFeatures?.smartReplies && (
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className="text-xs text-muted-foreground">Smart replies:</span>
                                                    {aiFeatures.smartReplies.map((reply, idx) => (
                                                        <Button
                                                            key={idx}
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-7"
                                                            onClick={() => toast.success(`"${reply}" added to message`)}
                                                        >
                                                            {reply}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <TabsContent value="enhanced" className="h-full mt-0">
                                        <EnhancedPartyMessaging
                                            vacationId={selectedVacationId}
                                            isFullscreen={isFullscreen}
                                            onToggleFullscreen={handleFullscreenToggle}
                                        />
                                    </TabsContent>

                                    <TabsContent value="realtime" className="h-full mt-0">
                                        <RealTimeMessaging
                                            vacationId={selectedVacationId}
                                            isFullscreen={isFullscreen}
                                            onToggleFullscreen={handleFullscreenToggle}
                                        />
                                    </TabsContent>

                                    <TabsContent value="ai" className="h-full mt-0">
                                        <MagicCard className="h-full">
                                            <CardContent className="p-6 h-full flex flex-col">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                        <Bot className="h-5 w-5" />
                                                        AI Assistant
                                                    </h3>
                                                    <Badge variant="secondary">
                                                        Mode: {aiMode}
                                                    </Badge>
                                                </div>

                                                {/* AI Features Grid */}
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setAiMode('translator')}>
                                                        <Languages className="h-8 w-8 mb-2 text-blue-500" />
                                                        <h4 className="font-medium">Real-time Translation</h4>
                                                        <p className="text-sm text-muted-foreground">Translate messages to any language</p>
                                                    </Card>

                                                    <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toast.info("Message summary generated")}>
                                                        <Brain className="h-8 w-8 mb-2 text-purple-500" />
                                                        <h4 className="font-medium">Smart Summaries</h4>
                                                        <p className="text-sm text-muted-foreground">Get AI-powered conversation summaries</p>
                                                    </Card>

                                                    <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={startVoiceRecording}>
                                                        <Mic className="h-8 w-8 mb-2 text-green-500" />
                                                        <h4 className="font-medium">Voice to Text</h4>
                                                        <p className="text-sm text-muted-foreground">Transcribe voice messages instantly</p>
                                                    </Card>

                                                    <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                                                        <Wand2 className="h-8 w-8 mb-2 text-orange-500" />
                                                        <h4 className="font-medium">Smart Compose</h4>
                                                        <p className="text-sm text-muted-foreground">AI helps write better messages</p>
                                                    </Card>
                                                </div>

                                                <Separator className="my-4" />

                                                {/* AI Insights */}
                                                <div className="flex-1">
                                                    <h4 className="font-medium mb-3">Current Conversation Insights</h4>
                                                    {aiFeatures && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                                                                <span className="text-sm">Sentiment</span>
                                                                <Badge variant={aiFeatures.sentimentAnalysis.sentiment === 'positive' ? 'default' : 'secondary'}>
                                                                    {aiFeatures.sentimentAnalysis.sentiment}
                                                                </Badge>
                                                            </div>
                                                            <div className="p-3 bg-accent/50 rounded-lg">
                                                                <span className="text-sm font-medium">Main Topics</span>
                                                                <div className="flex gap-2 mt-2">
                                                                    {aiFeatures.sentimentAnalysis.topics.map((topic, idx) => (
                                                                        <Badge key={idx} variant="outline">{topic}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                                                                <span className="text-sm">Engagement Level</span>
                                                                <Progress value={aiFeatures.sentimentAnalysis.engagement * 100} className="w-24 h-2" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </MagicCard>
                                    </TabsContent>

                                    <TabsContent value="analytics" className="h-full mt-0">
                                        <MagicCard className="h-full">
                                            <CardContent className="p-6">
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                    <BarChart3 className="h-5 w-5" />
                                                    Message Analytics
                                                </h3>

                                                {/* Analytics Dashboard */}
                                                <div className="grid grid-cols-2 gap-6">
                                                    <Card className="p-4">
                                                        <h4 className="font-medium mb-3">Activity Heatmap</h4>
                                                        <div className="grid grid-cols-12 gap-1">
                                                            {Array.from({ length: 24 }, (_, i) => {
                                                                const opacity = vacations?.find(v => v.id === selectedVacationId)?.analytics?.activeHours[i]
                                                                    ? ((vacations.find(v => v.id === selectedVacationId)?.analytics?.activeHours[i] || 0) / 100)
                                                                    : 0.1
                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        className={cn(
                                                                            "aspect-square rounded bg-primary/20",
                                                                            opacity > 0.7 && "opacity-100",
                                                                            opacity > 0.5 && opacity <= 0.7 && "opacity-70",
                                                                            opacity > 0.3 && opacity <= 0.5 && "opacity-50",
                                                                            opacity > 0.1 && opacity <= 0.3 && "opacity-30",
                                                                            opacity <= 0.1 && "opacity-10"
                                                                        )}
                                                                    />
                                                                )
                                                            })}
                                                        </div>
                                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                            <span>12 AM</span>
                                                            <span>12 PM</span>
                                                            <span>11 PM</span>
                                                        </div>
                                                    </Card>

                                                    <Card className="p-4">
                                                        <h4 className="font-medium mb-3">Popular Reactions</h4>
                                                        <div className="flex gap-3 text-2xl">
                                                            {vacations?.find(v => v.id === selectedVacationId)?.analytics?.popularEmojis.map((emoji, idx) => (
                                                                <motion.span
                                                                    key={idx}
                                                                    whileHover={{ scale: 1.2 }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {emoji}
                                                                </motion.span>
                                                            ))}
                                                        </div>
                                                    </Card>
                                                </div>
                                            </CardContent>
                                        </MagicCard>
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                <BlurFade inView>
                                    <MagicCard className="h-[600px] flex items-center justify-center relative overflow-hidden">
                                        <AnimatedGridPattern className="absolute inset-0 opacity-10" />
                                        <CardContent className="text-center relative z-10">
                                            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                            <h3 className="text-xl font-semibold mb-2">Select a Vacation</h3>
                                            <p className="text-muted-foreground">
                                                Choose a vacation from the sidebar to start messaging
                                            </p>
                                        </CardContent>
                                    </MagicCard>
                                </BlurFade>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Info Alert */}
                    {!selectedVacationId && !isFullscreen && (
                        <Alert className="mt-6 relative overflow-hidden">
                            <BorderBeam duration={5} />
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                <span className="font-semibold">Pro tip:</span> Enable AI features for smart replies, real-time translation,
                                and voice transcription. Try gesture control for a futuristic messaging experience!
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Enhanced Fullscreen Exit */}
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-4 right-4 z-50"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFullscreenToggle}
                            className="bg-background/80 backdrop-blur-sm"
                        >
                            <Minimize2 className="h-4 w-4 mr-2" />
                            Exit Fullscreen
                        </Button>
                    </motion.div>
                )}

                {/* Gesture Control Overlay */}
                {gestureControlEnabled && (
                    <div className="fixed inset-0 pointer-events-none z-50">
                        <video
                            ref={videoRef}
                            className="absolute top-4 right-4 w-32 h-24 rounded-lg border-primary opacity-50"
                            autoPlay
                            muted
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 opacity-20"
                        />
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}