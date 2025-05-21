import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User, ThumbsUp, ThumbsDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useItineraryOptimizer } from "@/engines/itinerary/optimizer"
import type { OptimizationResult, ItineraryItem } from "@/engines/itinerary/optimizer"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    thinking?: boolean
    feedbackGiven?: "positive" | "negative"
}

interface ExtractedParameters {
    partySize: number
    hasChildren: boolean
    childrenAges: number[]
    preferences: {
        ridePreference: "all" | "thrill" | "family"
        maxWaitTime: number
        walkingPace: "slow" | "moderate" | "fast"
        breakDuration: number
    }
    useGeniePlus: boolean
    useIndividualLightningLane: boolean
}

interface PlannerChatProps {
    readonly parkId: string
    readonly date: string
    readonly onItineraryGenerated: (result: OptimizationResult) => void
}

export function PlannerChat({ parkId, date, onItineraryGenerated }: PlannerChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi there! I can help you plan your perfect Disney day. Tell me about your group and what you'd like to do!",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const { optimizeItinerary } = useItineraryOptimizer()

    // Auto-scroll to the bottom when new messages appear
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages])

    const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

    const processMessage = async (userMessage: string) => {
        // Analyze the user's message to extract parameters for the itinerary
        const params = extractParametersFromMessage(userMessage)

        // Add thinking state for the AI
        const thinkingId = generateMessageId()
        setMessages(prev => [
            ...prev,
            {
                id: thinkingId,
                role: "assistant",
                content: "Thinking about your perfect day...",
                timestamp: new Date(),
                thinking: true
            }
        ])

        try {
            // Call the optimizer with the extracted parameters
            const result: OptimizationResult = await optimizeItinerary({
                parkId,
                date,
                ...params
            })

            // Remove the thinking message
            setMessages(prev => prev.filter(msg => msg.id !== thinkingId))

            // Add the response message
            setMessages(prev => [
                ...prev,
                {
                    id: generateMessageId(),
                    role: "assistant",
                    content: generateResponseFromResult(result),
                    timestamp: new Date()
                }
            ])

            // Pass the result up to the parent
            onItineraryGenerated(result)
        } catch (error) {
            console.error("Error generating itinerary:", error)

            // Remove the thinking message
            setMessages(prev => prev.filter(msg => msg.id !== thinkingId))

            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    id: generateMessageId(),
                    role: "assistant",
                    content: "I'm sorry, I had trouble planning your itinerary. Please try again with different details.",
                    timestamp: new Date()
                }
            ])
        }
    }

    const extractParametersFromMessage = (message: string): ExtractedParameters => {
        // This is a simple rule-based extraction - in a real system, you'd use a proper NLP service
        const params: ExtractedParameters = {
            partySize: 2,
            hasChildren: false,
            childrenAges: [],
            preferences: {
                ridePreference: "all",
                maxWaitTime: 60,
                walkingPace: "moderate",
                breakDuration: 60
            },
            useGeniePlus: false,
            useIndividualLightningLane: false,
        }

        // Extract party size
        const partySizeRegex = /(\d+)\s+(?:people|persons|adults|kids|children|family members|group)/i
        const partySizeMatch = partySizeRegex.exec(message)
        if (partySizeMatch) {
            params.partySize = parseInt(partySizeMatch[1])
        }

        // Check for children
        params.hasChildren = /children|kids|toddlers|infants|babies/i.test(message)

        // Extract children ages if mentioned
        const ageRegex = /age(?:s)?[^\d]+(\d+)(?:[^\d]+(\d+))?(?:[^\d]+(\d+))?/i
        const ageMatches = ageRegex.exec(message)
        if (ageMatches) {
            params.childrenAges = ageMatches.slice(1).filter(Boolean).map(age => parseInt(age))
        }

        // Extract ride preferences
        if (/thrill|roller coaster|fast|exciting|adventure/i.test(message)) {
            params.preferences.ridePreference = "thrill"
        } else if (/family|kid friendly|gentle|calm|slow/i.test(message)) {
            params.preferences.ridePreference = "family"
        }

        // Extract wait time tolerance
        const waitTimeRegex = /wait(?:ing)?\s+(?:time|times|period|periods)?\s+(?:of\s+)?(?:up\s+to\s+)?(\d+)/i
        const waitTimeMatch = waitTimeRegex.exec(message)
        if (waitTimeMatch) {
            params.preferences.maxWaitTime = parseInt(waitTimeMatch[1])
        }

        // Extract walking pace
        if (/slow\s+pace|slowly|take\s+our\s+time/i.test(message)) {
            params.preferences.walkingPace = "slow"
        } else if (/fast\s+pace|quickly|hurry|rapid/i.test(message)) {
            params.preferences.walkingPace = "fast"
        }

        // Check if they want to use Genie+ or Lightning Lane
        params.useGeniePlus = /genie\s*\+|genie\s+plus/i.test(message)
        params.useIndividualLightningLane = /lightning\s+lane|individual\s+lightning|fast\s+pass/i.test(message)

        // Extract break duration
        const breakRegex = /break(?:s)?\s+(?:of\s+)?(?:around\s+)?(\d+)/i
        const breakMatch = breakRegex.exec(message)
        if (breakMatch) {
            params.preferences.breakDuration = parseInt(breakMatch[1])
        }

        return params
    }

    const generateResponseFromResult = (result: OptimizationResult) => {
        const stats = result.stats
        const attractions = result.itinerary.filter((item: ItineraryItem) => item.type === "RIDE" || item.type === "SHOW").length
        const firstAttraction = result.itinerary.find((item: ItineraryItem) => item.type === "RIDE")?.name || "attractions"
        const lastAttraction = result.itinerary.filter((item: ItineraryItem) => item.type === "RIDE").pop()?.name || "experiences"

        return `I've created an amazing day for you! Your itinerary includes ${attractions} attractions with about ${stats.expectedWaitTime} minutes of total wait time. You'll start with ${firstAttraction} and end your day with ${lastAttraction}. I've optimized your route to minimize walking (${stats.walkingDistance.toFixed(1)} km total) and wait times. You can view the full plan below, and I've also included some alternative plans for different scenarios like rain or focusing on morning/evening activities.`
    }

    const sendMessage = () => {
        if (!input.trim()) return

        // Add the user message
        const newUserMessage: Message = {
            id: generateMessageId(),
            role: "user",
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newUserMessage])
        setInput("")
        setIsLoading(true)

        // Process the message
        processMessage(input).finally(() => {
            setIsLoading(false)
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const giveFeedback = (messageId: string, feedback: "positive" | "negative") => {
        setMessages(prev =>
            prev.map(message =>
                message.id === messageId
                    ? { ...message, feedbackGiven: feedback }
                    : message
            )
        )
        // In a real implementation, you would send this feedback to your server
        // to improve the model's responses
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-lg">
            <div className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3 max-w-[80%]",
                                    message.role === "user" ? "ml-auto justify-end" : ""
                                )}
                            >
                                {message.role === "assistant" && (
                                    <Avatar className="h-8 w-8">
                                        <Bot className="h-5 w-5" />
                                    </Avatar>
                                )}
                                <div>
                                    <div
                                        className={cn(
                                            "rounded-lg px-4 py-2 text-sm",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        {message.thinking ? (
                                            <div className="flex items-center gap-2">
                                                <span>{message.content}</span>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                    {message.role === "assistant" && !message.thinking && (
                                        <div className="flex gap-1 mt-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 rounded-full p-0"
                                                onClick={() => giveFeedback(message.id, "positive")}
                                                disabled={message.feedbackGiven !== undefined}
                                            >
                                                <ThumbsUp
                                                    className={cn(
                                                        "h-4 w-4",
                                                        message.feedbackGiven === "positive"
                                                            ? "text-green-500 fill-green-500"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 rounded-full p-0"
                                                onClick={() => giveFeedback(message.id, "negative")}
                                                disabled={message.feedbackGiven !== undefined}
                                            >
                                                <ThumbsDown
                                                    className={cn(
                                                        "h-4 w-4",
                                                        message.feedbackGiven === "negative"
                                                            ? "text-red-500 fill-red-500"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {message.role === "user" && (
                                    <Avatar className="h-8 w-8">
                                        <User className="h-5 w-5" />
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your ideal Disney day... (e.g., 'We are a family of 4 with kids aged 5 and 8 who love princesses and adventures. We prefer shorter wait times and need breaks for lunch.')"
                        className="flex-1 min-h-[80px]"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="self-end"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}