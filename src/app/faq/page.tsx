"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    MagnifyingGlassIcon,
    BoltIcon,
    CalendarIcon,
    MapIcon,
    QuestionMarkCircleIcon,
    ClockIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    XCircleIcon,
    MicrophoneIcon,
    DocumentDuplicateIcon
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useDebounce } from "@/hooks/use-debounce"
import Fuse from "fuse.js"
import { toast } from "sonner"

// Dynamic imports for Magic UI components
const AnimatedGradientText = dynamic(() => import("@/components/magicui/animated-gradient-text"), { ssr: false })
const SparklesText = dynamic(() => import("@/components/magicui/sparkles-text").then(mod => ({ default: mod.SparklesText })), { ssr: false })
const NumberTicker = dynamic(() => import("@/components/magicui/number-ticker").then(mod => ({ default: mod.NumberTicker })), { ssr: false })
const BorderBeam = dynamic(() => import("@/components/magicui/border-beam").then(mod => ({ default: mod.BorderBeam })), { ssr: false })
const MagicCard = dynamic(() => import("@/components/magicui/magic-card").then(mod => ({ default: mod.MagicCard })), { ssr: false })
const Particles = dynamic(() => import("@/components/magicui/particles").then(mod => ({ default: mod.Particles })), { ssr: false })
const BlurFade = dynamic(() => import("@/components/magicui/blur-fade"), { ssr: false })
const Confetti = dynamic(() => import("@/components/magicui/confetti").then(mod => ({ default: mod.Confetti })), { ssr: false })
const Meteors = dynamic(() => import("@/components/magicui/meteors").then(mod => ({ default: mod.Meteors })), { ssr: false })
const ShimmerButton = dynamic(() => import("@/components/magicui/shimmer-button").then(mod => ({ default: mod.ShimmerButton })), { ssr: false })
const RainbowButton = dynamic(() => import("@/components/magicui/rainbow-button").then(mod => ({ default: mod.RainbowButton })), { ssr: false })
const Dock = dynamic(() => import("@/components/magicui/dock").then(mod => ({
    default: mod.Dock,
    DockIcon: mod.DockIcon
})), { ssr: false })
const Marquee = dynamic(() => import("@/components/magicui/marquee").then(mod => ({ default: mod.Marquee })), { ssr: false })
const AvatarCircles = dynamic(() => import("@/components/magicui/avatar-circles").then(mod => ({ default: mod.AvatarCircles })), { ssr: false })

// Enhanced FAQ data structure
interface EnhancedFAQItem {
    id: string
    question: string
    answer: string
    category: string
    tags: string[]
    media?: {
        type: 'video' | 'image' | 'interactive'
        url: string
        thumbnail?: string
    }
    relatedQuestions?: string[]
    helpfulCount: number
    lastUpdated: Date
    expertVerified?: boolean
}

// Convert existing FAQ data to enhanced structure
const enhancedFaqData: Record<string, EnhancedFAQItem[]> = {
    "lightning-lane": [
        {
            id: "ll-1",
            question: "What is the difference between Lightning Lane Multi Pass and Genie+?",
            answer: "Lightning Lane Multi Pass is the new name for Disney Genie+. It also introduces the ability to book Lightning Lane reservations ahead of time. Disney resort guests can book up to 7 days in advance; all other guests can book up to 3 days in advance. Guests may choose 3 Lightning Lane experiences and times ahead of their visit within one theme park. On the day of their visit, guests may select another Lightning Lane once they have redeemed one selection. Selections for a second park cannot occur until this point. Selections are made before purchasing the Lightning Lane Multi Pass option. Dynamic pricing will remain in effect. Selection groups are also tiered, allowing users to only select one of the most in-demand attractions at a time.",
            category: "lightning-lane",
            tags: ["genie+", "lightning lane", "reservations", "booking"],
            helpfulCount: 245,
            lastUpdated: new Date("2024-01-15"),
            expertVerified: true,
            relatedQuestions: ["ll-2", "ll-4"]
        },
        {
            id: "ll-2",
            question: "What is the difference between Lightning Lane Single Pass and Individual Lightning Lane?",
            answer: "Lightning Lane Single Pass is the new name for Individual Lightning lanes. It also introduces the ability to book Lightning Lane reservations ahead of time.",
            category: "lightning-lane",
            tags: ["lightning lane", "single pass", "individual"],
            helpfulCount: 189,
            lastUpdated: new Date("2024-01-15"),
            expertVerified: true
        },
        {
            id: "ll-3",
            question: "How many Lightning Lane Single Pass purchases can you make in a day?",
            answer: "Each guest may purchase up to 2 Lightning Lane Single Passes per day.",
            category: "lightning-lane",
            tags: ["lightning lane", "single pass", "limits"],
            helpfulCount: 156,
            lastUpdated: new Date("2024-01-10"),
            expertVerified: true
        },
        {
            id: "ll-4",
            question: "What is Genie+?",
            answer: "Genie+ (or Genie Plus) is a paid replacement to the FastPass+ system with some different rules. The system provides access to the Lightning Lane, which typically provides much shorter wait times than the standby queue. Guests can reserve a slot in the Lightning Lane with an hour return time; guests must return within that window to join the Lightning Lane for that attraction to experience it.",
            category: "lightning-lane",
            tags: ["genie+", "fastpass", "lightning lane"],
            helpfulCount: 312,
            lastUpdated: new Date("2024-01-08"),
            expertVerified: true
        },
        {
            id: "ll-5",
            question: "When can Genie+ be purchased?",
            answer: "Beginning at 12 AM on the day of a Disney World theme park visit, Genie+ can be purchased on a per person basis for a variable amount of money (prices are tracked each day in our Genie+ Price Tracker). Currently, Genie+ cannot be purchased ahead of the time, only on the day of a theme park visit. It has sold out on a few occasions, but never before 10:00 AM.",
            category: "lightning-lane",
            tags: ["genie+", "purchase", "timing", "pricing"],
            helpfulCount: 278,
            lastUpdated: new Date("2024-01-12"),
            expertVerified: true
        },
        {
            id: "ll-6",
            question: "When can you make Genie+ selections?",
            answer: "Beginning at 7 AM, guests can make their first Genie+ selection in the My Disney Experience app on the Tip Board. The next Genie+ selection can be made immediately after the first selection is redeemed (i.e. you tap into the attraction) or 2 hours after the park's opening. This same sequence repeats for the duration of the day. Note that the time counter is not from resort guest early opening. For example, if the Magic Kingdom opens at 9 AM, you can make another Genie+ selection at 11 AM if the return time for your first selection is after 11 AM. You can hold several Genie+ selections at a time by accruing them every 2 hours. This process is called stacking.",
            category: "lightning-lane",
            tags: ["genie+", "selections", "timing", "stacking"],
            helpfulCount: 334,
            lastUpdated: new Date("2024-01-14"),
            expertVerified: true
        },
        {
            id: "ll-7",
            question: "What is an Individual Lightning Lane?",
            answer: "An Individual Lightning Lane (ILL) is a single use pass to access the Lightning Lane of an attraction for a fee per person. This allows for a shorter wait time to ride the attraction. ILLs can be purchased without having Disney Genie+. Resort guests can purchase ILL beginning at 7 AM. Offsite visitors can purchase ILL beginning at the respective park's opening. The attractions and price for ILL is tracked every day on our ILL Price page.",
            category: "lightning-lane",
            tags: ["individual lightning lane", "ILL", "purchase"],
            helpfulCount: 267,
            lastUpdated: new Date("2024-01-11"),
            expertVerified: true
        }
    ],
    "virtual-queue": [
        {
            id: "vq-1",
            question: "What is the difference between a Virtual Queue and boarding group at Disney World?",
            answer: "Virtual Queue and a boarding group go hand-in-hand. When you join a Virtual Queue, you are given a boarding group number. They start at 1 and can go up into the 200's. At different points throughout the day, sets of boarding groups will be called. If your group is within that set, you can join the standby queue for the attraction. Be prepared to wait in a decent line after your group is called.",
            category: "virtual-queue",
            tags: ["virtual queue", "boarding group", "process"],
            helpfulCount: 198,
            lastUpdated: new Date("2024-01-13"),
            expertVerified: true
        },
        {
            id: "vq-2",
            question: "What Disney World attractions offer a Virtual Queue?",
            answer: "Currently, only TRON Lightcycle/Run at the Magic Kingdom and Guardians of the Galaxy: Cosmic Rewind at EPCOT offer a Virtual Queue. It can be joined through the My Disney Experience app at 7 AM and 1 PM each day.",
            category: "virtual-queue",
            tags: ["virtual queue", "attractions", "TRON", "Guardians"],
            helpfulCount: 223,
            lastUpdated: new Date("2024-01-16"),
            expertVerified: true
        },
        {
            id: "vq-3",
            question: "Can you do the Virtual Queue twice for the same ride on the same day?",
            answer: "Yes and no. If you do not have access to Disney's Extended Evening Hours or a ticket to a special event such as Mickey's Not-So-Scary Halloween Party or Mickey's Very Merry Christmas Party, you can only ride TRON Lightcycle/Run (Magic Kingdom) or Guardians of the Galaxy: Cosmic Rewind (EPCOT) with a Virtual Queue once per day. A boarding group can be obtained either at 7 AM or 1 PM. If you have access to Extended Evening Hours or a special ticketed event, and you obtained a boarding group at 7 AM or 1 PM, you can try to another Virtual Queue boarding group at 6 PM.",
            category: "virtual-queue",
            tags: ["virtual queue", "multiple rides", "extended hours"],
            helpfulCount: 176,
            lastUpdated: new Date("2024-01-09"),
            expertVerified: true
        }
    ],
    "crowd-calendar": [
        {
            id: "cc-1",
            question: "What are the busiest times at Walt Disney World?",
            answer: "Spring break, typically the week of Easter, the week of Thanksgiving, and the week after Christmas through New Year's Day. View the Walt Disney World Crowd Calendar to see the busiest and least busy times to visit.",
            category: "crowd-calendar",
            tags: ["crowds", "busy times", "planning"],
            helpfulCount: 412,
            lastUpdated: new Date("2024-01-17"),
            expertVerified: true
        },
        {
            id: "cc-2",
            question: "When is the best time to visit Walt Disney World in 2024?",
            answer: "Based on this past year, the best months to visit the Walt Disney World Resort in 2024 are May, August, and September.",
            category: "crowd-calendar",
            tags: ["best time", "2024", "planning"],
            helpfulCount: 389,
            lastUpdated: new Date("2024-01-18"),
            expertVerified: true
        },
        {
            id: "cc-3",
            question: "Is Disney World busy in January?",
            answer: "Yes, January is busy at Walt Disney World, with wait times averaging 42 minutes per attraction resort wide. Certain weeks within the month will be less crowded.",
            category: "crowd-calendar",
            tags: ["january", "crowds", "wait times"],
            helpfulCount: 145,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-4",
            question: "Is Disney World busy in February?",
            answer: "Yes, February is busy at Walt Disney World, with wait times averaging 41 minutes per attraction resort wide. Certain weeks within the month will be less crowded.",
            category: "crowd-calendar",
            tags: ["february", "crowds", "wait times"],
            helpfulCount: 132,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-5",
            question: "Is Disney World busy in March?",
            answer: "Yes, March is busy at Walt Disney World, with wait times averaging 39 minutes per attraction resort wide. Early March is the best time to visit before Spring Break begins.",
            category: "crowd-calendar",
            tags: ["march", "crowds", "spring break"],
            helpfulCount: 156,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-6",
            question: "Is Disney World busy in April?",
            answer: "Yes, April is busy at Walt Disney World, with wait times averaging 40 minutes per attraction resort wide. It is busiest the week of Easter. After Easter, crowds lessen.",
            category: "crowd-calendar",
            tags: ["april", "crowds", "easter"],
            helpfulCount: 167,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-7",
            question: "Is Disney World busy in May?",
            answer: "No, May is one of the best times to visit Walt Disney World, with wait times averaging 31 minutes per attraction resort wide.",
            category: "crowd-calendar",
            tags: ["may", "best time", "low crowds"],
            helpfulCount: 234,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-8",
            question: "Is Disney World busy in June?",
            answer: "Yes, June is moderately busy at Walt Disney World, with wait times averaging 37 minutes per attraction resort wide.",
            category: "crowd-calendar",
            tags: ["june", "summer", "crowds"],
            helpfulCount: 123,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-9",
            question: "Is Disney World busy in July?",
            answer: "Yes, July is moderately busy at Walt Disney World, with wait times averaging 36 minutes per attraction resort wide.",
            category: "crowd-calendar",
            tags: ["july", "summer", "crowds"],
            helpfulCount: 119,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-10",
            question: "Is Disney World busy in August?",
            answer: "Early August is moderately busy at Walt Disney World, but crowds lessen once local schools begin in the middle of the month. Wait times average 32 minutes per attraction resort wide.",
            category: "crowd-calendar",
            tags: ["august", "back to school", "crowds"],
            helpfulCount: 178,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-11",
            question: "Is Disney World busy in September?",
            answer: "No, September is typically one of the best times to vist Walt Disney World, with wait times averaging 30 minutes per attraction resort wide.",
            category: "crowd-calendar",
            tags: ["september", "best time", "low crowds"],
            helpfulCount: 256,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-12",
            question: "Is Disney World busy in October?",
            answer: "Yes, October is moderately busy at Walt Disney World, with wait times averaging 42 minutes per attraction resort wide. Many fall breaks occur in October, leading to bigger crowds.",
            category: "crowd-calendar",
            tags: ["october", "fall", "halloween"],
            helpfulCount: 189,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-13",
            question: "Is Disney World busy in November?",
            answer: "Yes, November is busy at Walt Disney World, with wait times averaging 41 minutes per attraction resort wide. Around Veteran's Day and the week of Thanksgiving are the busiest times.",
            category: "crowd-calendar",
            tags: ["november", "thanksgiving", "crowds"],
            helpfulCount: 201,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        },
        {
            id: "cc-14",
            question: "Is Disney World busy in December?",
            answer: "Yes, December is busy at Walt Disney World, with wait times averaging 46 minutes per attraction resort wide. Early December is not a bad time to go. The week between Christmas and New Year's in the busiest time of the year.",
            category: "crowd-calendar",
            tags: ["december", "christmas", "new year"],
            helpfulCount: 298,
            lastUpdated: new Date("2024-01-05"),
            expertVerified: true
        }
    ],
    "park-strategies": [
        {
            id: "ps-1",
            question: "What is rope drop at Disney parks?",
            answer: "Short answer: rope drop is when the park first opens. Rope dropping is to get to the park at or before park opening. Typically, you can enter some portion of the park and a rope will block further entry into the park at various points. Guests will form lines at these areas. Once it is park opening time, a Cast Member will drop the rope, letting guests into experience the park's attractions.",
            category: "park-strategies",
            tags: ["rope drop", "early entry", "strategy"],
            helpfulCount: 367,
            lastUpdated: new Date("2024-01-07"),
            expertVerified: true
        }
    ]
}

// Flatten all FAQ items for searching
const allEnhancedFAQs = Object.values(enhancedFaqData).flat()

// Search placeholder texts for typing animation
const searchPlaceholders = [
    "What are you looking for? Try 'Genie+'...",
    "Search for 'Virtual Queue'...",
    "Ask about 'crowd calendar'...",
    "Find info on 'Lightning Lane'...",
    "Discover park strategies..."
]

// Recently asked questions for marquee
const recentQuestions = [
    "How early should I arrive for rope drop?",
    "Can I book Genie+ for multiple parks?",
    "What's the best month to visit Disney World?",
    "How do Virtual Queues work?",
    "Is Lightning Lane worth it?",
    "When do crowds die down in summer?"
]

// Expert avatars
const expertAvatars = [
    { imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=disney1", profileUrl: "#" },
    { imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=disney2", profileUrl: "#" },
    { imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=disney3", profileUrl: "#" },
    { imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=disney4", profileUrl: "#" }
]

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState("all")
    const [searchResults, setSearchResults] = useState<EnhancedFAQItem[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({})
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
    const [showVoiceSearch, setShowVoiceSearch] = useState(false)
    const [searchHistory, setSearchHistory] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    // Scroll progress
    const { scrollYProgress } = useScroll()
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

    // Initialize Fuse.js for fuzzy search
    const fuse = useMemo(() => {
        return new Fuse(allEnhancedFAQs, {
            keys: [
                { name: 'question', weight: 0.7 },
                { name: 'answer', weight: 0.2 },
                { name: 'tags', weight: 0.1 }
            ],
            threshold: 0.3,
            includeScore: true,
            includeMatches: true
        })
    }, [])

    // Rotate search placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPlaceholder((prev) => (prev + 1) % searchPlaceholders.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    // Handle fuzzy search
    useEffect(() => {
        if (debouncedSearchQuery.trim() === "") {
            setSearchResults([])
            setIsSearching(false)
            setShowSuggestions(false)
            return
        }

        setIsSearching(true)
        setShowSuggestions(true)

        const results = fuse.search(debouncedSearchQuery)
        const mappedResults = results.map(result => result.item)

        setSearchResults(mappedResults)

        // Auto-expand search results
        const newExpandedItems = new Set<string>()
        mappedResults.forEach(item => newExpandedItems.add(item.id))
        setExpandedItems(newExpandedItems)

        // Show confetti for exact matches
        if (results.length > 0 && results[0].score && results[0].score < 0.1) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
        }

        // Add to search history
        if (!searchHistory.includes(debouncedSearchQuery)) {
            setSearchHistory(prev => [debouncedSearchQuery, ...prev.slice(0, 4)])
        }

    }, [debouncedSearchQuery, fuse, searchHistory])

    // Handle accordion toggle
    const toggleAccordion = (id: string) => {
        const newExpandedItems = new Set(expandedItems)
        if (newExpandedItems.has(id)) {
            newExpandedItems.delete(id)
        } else {
            newExpandedItems.add(id)
        }
        setExpandedItems(newExpandedItems)
    }

    // Handle helpful vote
    const handleHelpfulVote = (id: string, isHelpful: boolean) => {
        setHelpfulVotes(prev => ({ ...prev, [id]: isHelpful }))
        toast.success(isHelpful ? "Thanks for your feedback!" : "We'll work on improving this answer")
    }

    // Handle copy to clipboard
    const handleCopyLink = async (id: string) => {
        const url = `${window.location.origin}/faq#${id}`
        await navigator.clipboard.writeText(url)
        setCopiedId(id)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopiedId(null), 2000)
    }

    // Handle voice search (mock implementation)
    const handleVoiceSearch = () => {
        setShowVoiceSearch(true)
        // In a real implementation, you would use the Web Speech API
        setTimeout(() => {
            setSearchQuery("What is Genie+?")
            setShowVoiceSearch(false)
        }, 2000)
    }

    // Function to get the appropriate icon for each category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "lightning-lane":
                return <BoltIcon className="h-5 w-5 text-amber-500" />
            case "virtual-queue":
                return <ClockIcon className="h-5 w-5 text-teal-500" />
            case "crowd-calendar":
                return <CalendarIcon className="h-5 w-5 text-blue-500" />
            case "park-strategies":
                return <MapIcon className="h-5 w-5 text-purple-500" />
            default:
                return <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-500" />
        }
    }

    // Function to get human-readable category names
    const getCategoryName = (category: string) => {
        switch (category) {
            case "lightning-lane":
                return "Lightning Lane & Genie+"
            case "virtual-queue":
                return "Virtual Queue"
            case "crowd-calendar":
                return "Crowd Calendar"
            case "park-strategies":
                return "Park Strategies"
            default:
                return category
        }
    }

    // Render no search results
    const renderNoSearchResults = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-10 text-center"
        >
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            >
                <QuestionMarkCircleIcon className="h-16 w-16 mx-auto text-purple-400" />
            </motion.div>
            <h3 className="mt-4 text-lg font-medium font-display">No results found</h3>
            <p className="mt-2 text-muted-foreground">
                Try adjusting your search query or browse categories
            </p>
            {searchHistory.length > 0 && (
                <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-2">Recent searches:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {searchHistory.map((query, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-secondary/80"
                                onClick={() => setSearchQuery(query)}
                            >
                                {query}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )

    // Render accordion item with enhancements
    const renderAccordionItem = (item: EnhancedFAQItem, index: number) => (
        <BlurFade key={item.id} delay={index * 0.05} inView>
            <AccordionItem value={item.id} className="border border-slate-200 dark:border-slate-800 rounded-lg mb-4 overflow-hidden group">
                <AccordionTrigger
                    onClick={() => toggleAccordion(item.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 px-5 py-4 transition-all duration-300"
                >
                    <div className="flex items-start gap-3 text-left w-full">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mt-0.5 text-blue-600 dark:text-blue-300">
                            <QuestionMarkCircleIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <span className="font-display group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                {item.question}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                {item.expertVerified && (
                                    <Badge variant="secondary" className="text-xs">
                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                        Expert Verified
                                    </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    {item.helpfulCount} found helpful
                                </span>
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="pl-8"
                    >
                        <div className="prose dark:prose-invert max-w-none font-body">
                            <p>{item.answer}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {item.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">Was this helpful?</span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={helpfulVotes[item.id] === true ? "default" : "outline"}
                                        onClick={() => handleHelpfulVote(item.id, true)}
                                        className="h-8"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                        Yes
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={helpfulVotes[item.id] === false ? "default" : "outline"}
                                        onClick={() => handleHelpfulVote(item.id, false)}
                                        className="h-8"
                                    >
                                        <XCircleIcon className="h-4 w-4 mr-1" />
                                        No
                                    </Button>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyLink(item.id)}
                                className="h-8"
                            >
                                {copiedId === item.id ? (
                                    <>
                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                                        Share
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Related Questions */}
                        {item.relatedQuestions && item.relatedQuestions.length > 0 && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-sm font-medium mb-2">Related questions:</p>
                                <div className="space-y-1">
                                    {item.relatedQuestions.map(relatedId => {
                                        const relatedItem = allEnhancedFAQs.find(faq => faq.id === relatedId)
                                        if (!relatedItem) return null
                                        return (
                                            <button
                                                key={relatedId}
                                                onClick={() => {
                                                    setActiveTab(relatedItem.category)
                                                    toggleAccordion(relatedId)
                                                    document.getElementById(relatedId)?.scrollIntoView({ behavior: 'smooth' })
                                                }}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline text-left"
                                            >
                                                → {relatedItem.question}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AccordionContent>
            </AccordionItem>
        </BlurFade>
    )

    // Render search results
    const renderSearchResults = () => {
        if (searchResults.length === 0) {
            return renderNoSearchResults()
        }

        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">
                        Found <NumberTicker value={searchResults.length} /> results
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery("")
                            setSearchResults([])
                            setIsSearching(false)
                        }}
                    >
                        Clear search
                    </Button>
                </div>
                <Accordion type="multiple" value={Array.from(expandedItems)} className="w-full">
                    {searchResults.map((item, index) => renderAccordionItem(item, index))}
                </Accordion>
            </div>
        )
    }

    // Render category items
    const renderCategoryItems = (category: string, items: EnhancedFAQItem[]) => (
        <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryGradient(category)}`}>
                    {getCategoryIcon(category)}
                </div>
                <h2 className="text-2xl font-bold font-display tracking-tight">{getCategoryName(category)}</h2>
            </div>
            <Accordion type="multiple" value={Array.from(expandedItems)} className="w-full">
                {items.map((item, index) => renderAccordionItem(item, index))}
            </Accordion>
        </motion.div>
    )

    // Render tab items
    const renderTabItems = () => {
        const items = enhancedFaqData[activeTab as keyof typeof enhancedFaqData] || []
        return (
            <Accordion type="multiple" value={Array.from(expandedItems)} className="w-full">
                {items.map((item, index) => renderAccordionItem(item, index))}
            </Accordion>
        )
    }

    // Render all categories
    const renderAllCategories = () => (
        Object.entries(enhancedFaqData).map(([category, items]) =>
            renderCategoryItems(category, items)
        )
    )

    // Render FAQ items based on active tab or search results
    const renderFAQItems = () => {
        if (isSearching) {
            return renderSearchResults()
        }

        if (activeTab === "all") {
            return renderAllCategories()
        } else {
            return renderTabItems()
        }
    }

    // Render category preview items
    const renderCategoryPreviewItems = (category: string) => (
        <ul className="text-sm space-y-2">
            {enhancedFaqData[category as keyof typeof enhancedFaqData].slice(0, 3).map((item, index) => (
                <li key={item.id}>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-2 text-muted-foreground group cursor-pointer"
                        onClick={() => {
                            setActiveTab(category);
                            const newExpandedItems = new Set(expandedItems);
                            newExpandedItems.add(item.id);
                            setExpandedItems(newExpandedItems);
                        }}
                    >
                        <span className={`h-2 w-2 rounded-full ${getCategoryDot(category)}`}></span>
                        <span className="truncate group-hover:text-foreground transition-colors duration-300">{item.question}</span>
                    </motion.div>
                </li>
            ))}
            {enhancedFaqData[category as keyof typeof enhancedFaqData].length > 3 && (
                <li>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="text-primary font-medium cursor-pointer hover:underline mt-1"
                        onClick={() => setActiveTab(category)}
                    >
                        + {enhancedFaqData[category as keyof typeof enhancedFaqData].length - 3} more questions...
                    </motion.div>
                </li>
            )}
        </ul>
    )

    // Render popular categories with Magic UI cards
    const renderPopularCategories = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {Object.keys(enhancedFaqData).map((category, index) => (
                <BlurFade key={category} delay={index * 0.1} inView>
                    <div
                        className="cursor-pointer h-full"
                        onClick={() => setActiveTab(category)}
                    >
                        <MagicCard
                            className="h-full"
                            gradientColor={getCategoryColor(category)}
                        >
                            <div className="relative overflow-hidden h-full">
                                <Meteors number={3} />
                                <Card className="h-full border-0 bg-transparent">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${getCategoryBg(category)} relative z-10`}>
                                                {getCategoryIcon(category)}
                                            </div>
                                            <CardTitle className="font-display tracking-tight">{getCategoryName(category)}</CardTitle>
                                        </div>
                                        <CardDescription className="font-body">
                                            {enhancedFaqData[category as keyof typeof enhancedFaqData].length} questions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {renderCategoryPreviewItems(category)}
                                    </CardContent>
                                </Card>
                            </div>
                        </MagicCard>
                    </div>
                </BlurFade>
            ))}
        </div>
    )

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Nunito:wght@300;400;500;600;700&display=swap');

                :root {
                    --font-display: 'Montserrat', sans-serif;
                    --font-body: 'Nunito', sans-serif;
                }

                .font-display {
                    font-family: var(--font-display);
                }

                .font-body {
                    font-family: var(--font-body);
                }

                .prose p {
                    font-family: var(--font-body);
                    line-height: 1.7;
                }
            `}</style>

            {/* Scroll Progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform-origin-left z-50"
                style={{ scaleX }}
            />

            {/* Particles Background */}
            <div className="fixed inset-0 -z-10">
                <Particles
                    className="absolute inset-0"
                    quantity={50}
                    ease={80}
                    color="#8b5cf6"
                    refresh
                />
            </div>

            {/* Confetti */}
            {showConfetti && <Confetti />}

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-body relative">
                {/* Hero section with animated background */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative text-center mb-16 pb-4"
                >
                    <SparklesText className="text-4xl font-extrabold tracking-tight sm:text-5xl font-display">
                        Disney Vacation FAQ
                    </SparklesText>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <AnimatedGradientText className="mt-4">
                            <span className="text-xl max-w-3xl mx-auto font-body">
                                Find answers to the most common questions about planning your magical Disney experience
                            </span>
                        </AnimatedGradientText>
                    </motion.div>

                    {/* Expert Avatars */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-6 flex justify-center"
                    >
                        <AvatarCircles
                            avatarUrls={expertAvatars}
                            numPeople={99}
                        />
                    </motion.div>
                </motion.div>

                {/* Search section with BorderBeam */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mb-10"
                >
                    <Card className="overflow-hidden border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative">
                        <BorderBeam />
                        <CardContent className="pt-6 pb-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder={searchPlaceholders[currentPlaceholder]}
                                    className="pl-12 pr-24 h-14 text-base rounded-full border-2 focus:border-blue-500 transition-all duration-300 shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {searchQuery && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="text-muted-foreground hover:text-foreground p-1 rounded-full"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            <XCircleIcon className="h-5 w-5" />
                                        </motion.button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        onClick={handleVoiceSearch}
                                    >
                                        <MicrophoneIcon className={`h-5 w-5 ${showVoiceSearch ? 'text-red-500 animate-pulse' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            {/* Search Suggestions */}
                            <AnimatePresence>
                                {showSuggestions && searchHistory.length > 0 && !searchQuery && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg border z-10"
                                    >
                                        <p className="text-sm text-muted-foreground mb-2">Recent searches</p>
                                        <div className="space-y-2">
                                            {searchHistory.map((query, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSearchQuery(query)}
                                                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <ClockIcon className="h-4 w-4 inline mr-2 text-muted-foreground" />
                                                    {query}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recently Asked Questions Marquee */}
                {!isSearching && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mb-10"
                    >
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Trending Questions</h3>
                        <Marquee pauseOnHover className="[--duration:40s]">
                            {recentQuestions.map((question, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="mx-2 cursor-pointer hover:bg-secondary/80"
                                    onClick={() => setSearchQuery(question)}
                                >
                                    <SparklesIcon className="h-3 w-3 mr-1" />
                                    {question}
                                </Badge>
                            ))}
                        </Marquee>
                    </motion.div>
                )}

                {/* Quick Navigation Dock */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mb-10 flex justify-center"
                >
                    <Dock direction="middle">
                        {Object.keys(enhancedFaqData).map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`p-3 rounded-lg transition-all ${activeTab === category
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {getCategoryIcon(category)}
                            </button>
                        ))}
                    </Dock>
                </motion.div>

                {/* Tab navigation */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mb-10"
                >
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6 p-1 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl">
                            <TabsTrigger value="all" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300">
                                <QuestionMarkCircleIcon className="h-4 w-4" />
                                <span>All Questions</span>
                            </TabsTrigger>
                            {Object.keys(enhancedFaqData).map((category) => (
                                <TabsTrigger
                                    key={category}
                                    value={category}
                                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300"
                                >
                                    {getCategoryIcon(category)}
                                    <span>{getCategoryName(category)}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Tab content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + (isSearching ? 'search' : '')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TabsContent value={activeTab} className="mt-0">
                                    {renderFAQItems()}
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>

                {/* Popular categories */}
                {!isSearching && activeTab === "all" && renderPopularCategories()}

                {/* Still have questions section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 mt-16 border-none shadow-lg overflow-hidden">
                        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
                            <div>
                                <h3 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                                    Still have questions?
                                </h3>
                                <p className="text-muted-foreground mt-2">
                                    Contact our Disney vacation planning experts for personalized assistance
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Average response time: 2 hours
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <RainbowButton>
                                    Contact Support
                                </RainbowButton>
                                <ShimmerButton className="shadow-2xl">
                                    <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                        Visit Help Center
                                    </span>
                                </ShimmerButton>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    )
}

// Helper function to get a color for each category
function getCategoryColor(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "#f59e0b" // amber
        case "virtual-queue":
            return "#10b981" // emerald
        case "crowd-calendar":
            return "#3b82f6" // blue
        case "park-strategies":
            return "#8b5cf6" // purple
        default:
            return "#6b7280" // gray
    }
}

// Helper function to get background color for category icons
function getCategoryBg(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "bg-amber-100 dark:bg-amber-900/30"
        case "virtual-queue":
            return "bg-emerald-100 dark:bg-emerald-900/30"
        case "crowd-calendar":
            return "bg-blue-100 dark:bg-blue-900/30"
        case "park-strategies":
            return "bg-purple-100 dark:bg-purple-900/30"
        default:
            return "bg-slate-100 dark:bg-slate-800"
    }
}

// Helper function to get gradient colors for category headers
function getCategoryGradient(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10"
        case "virtual-queue":
            return "from-emerald-100 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/10"
        case "crowd-calendar":
            return "from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10"
        case "park-strategies":
            return "from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10"
        default:
            return "from-slate-100 to-slate-50 dark:from-slate-800/20 dark:to-slate-800/10"
    }
}

// Helper function to get dot colors for category items
function getCategoryDot(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "bg-amber-500"
        case "virtual-queue":
            return "bg-emerald-500"
        case "crowd-calendar":
            return "bg-blue-500"
        case "park-strategies":
            return "bg-purple-500"
        default:
            return "bg-slate-500"
    }
}