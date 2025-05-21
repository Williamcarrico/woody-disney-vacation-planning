import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { TrendingUpIcon, StarIcon, SparklesIcon } from "lucide-react"

interface PreferenceRecord {
    id: string
    type: "attraction" | "show" | "dining" | "character"
    name: string
    likeScore: number
    visitCount: number
    lastVisit: Date
    tags: string[]
}

interface RecommendationItem {
    id: string
    name: string
    type: string
    confidence: number
    reason: string
}

interface PreferenceLearnerProps {
    readonly userId: string
    readonly onRecommendationSelect: (recommendations: string[]) => void
}

export function PreferenceLearner({ userId, onRecommendationSelect }: PreferenceLearnerProps) {
    const [preferences, setPreferences] = useState<PreferenceRecord[]>([])
    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
    const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Simulate loading preference data for the user
    useEffect(() => {
        // In a real implementation, this would fetch from an API
        const mockFetchPreferences = async () => {
            setIsLoading(true)

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Mock preference data
            const mockPreferences: PreferenceRecord[] = [
                {
                    id: "space-mountain",
                    type: "attraction",
                    name: "Space Mountain",
                    likeScore: 0.92,
                    visitCount: 5,
                    lastVisit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                    tags: ["thrill", "dark", "indoor", "roller-coaster"]
                },
                {
                    id: "pirates-caribbean",
                    type: "attraction",
                    name: "Pirates of the Caribbean",
                    likeScore: 0.85,
                    visitCount: 3,
                    lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    tags: ["boat", "dark", "indoor", "classic"]
                },
                {
                    id: "haunted-mansion",
                    type: "attraction",
                    name: "Haunted Mansion",
                    likeScore: 0.78,
                    visitCount: 2,
                    lastVisit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                    tags: ["dark", "indoor", "classic", "slow"]
                },
                {
                    id: "splash-mountain",
                    type: "attraction",
                    name: "Splash Mountain",
                    likeScore: 0.65,
                    visitCount: 1,
                    lastVisit: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
                    tags: ["water", "outdoor", "drop", "thrill"]
                },
                {
                    id: "mickey-minnie",
                    type: "character",
                    name: "Mickey & Minnie",
                    likeScore: 0.9,
                    visitCount: 3,
                    lastVisit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                    tags: ["classic", "character", "photo", "signature"]
                }
            ]

            setPreferences(mockPreferences)

            // Generate recommendations based on preferences (currently mock)
            const mockRecommendations = generateRecommendations()
            setRecommendations(mockRecommendations)

            setIsLoading(false)
        }

        mockFetchPreferences()
    }, [userId])

    const generateRecommendations = (): RecommendationItem[] => {
        // In a real implementation, this would use a more sophisticated ML model
        // Here we'll just simulate recommendations based on the mock preferences

        // Extract favorite tags here if you plan to use them for weighting or filtering.
        // In this simplified example, we skip that step to keep ESLint happy.

        // Generate mock recommendations
        const mockRecommendations: RecommendationItem[] = [
            {
                id: "big-thunder-mountain",
                name: "Big Thunder Mountain Railroad",
                type: "attraction",
                confidence: 0.94,
                reason: "Based on your enjoyment of thrill rides like Space Mountain"
            },
            {
                id: "jungle-cruise",
                name: "Jungle Cruise",
                type: "attraction",
                confidence: 0.89,
                reason: "Similar to Pirates of the Caribbean that you've enjoyed"
            },
            {
                id: "tower-of-terror",
                name: "Tower of Terror",
                type: "attraction",
                confidence: 0.87,
                reason: "Matches your interest in thrill and dark rides"
            },
            {
                id: "expedition-everest",
                name: "Expedition Everest",
                type: "attraction",
                confidence: 0.82,
                reason: "Combines several elements you enjoy: thrills and storytelling"
            },
            {
                id: "princess-fairytale-hall",
                name: "Princess Fairytale Hall",
                type: "character",
                confidence: 0.75,
                reason: "Based on your interest in character experiences"
            },
            {
                id: "liberty-tree-tavern",
                name: "Liberty Tree Tavern",
                type: "dining",
                confidence: 0.73,
                reason: "Located near attractions you enjoy"
            },
            {
                id: "festival-of-fantasy",
                name: "Festival of Fantasy Parade",
                type: "show",
                confidence: 0.68,
                reason: "Features characters you've met previously"
            }
        ]

        return mockRecommendations
    }

    const toggleRecommendation = (id: string) => {
        setSelectedRecommendations(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id)
            } else {
                return [...prev, id]
            }
        })
    }

    const applyRecommendations = () => {
        onRecommendationSelect(selectedRecommendations)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                    AI Personalized Recommendations
                </CardTitle>
                <CardDescription>
                    Suggestions based on your past preferences and behavior
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-full max-w-md">
                            <Progress value={45} className="h-1" />
                        </div>
                        <p className="text-sm text-muted-foreground">Analyzing your preferences...</p>
                    </div>
                ) : (
                    <Tabs defaultValue="recommendations">
                        <TabsList className="mb-4">
                            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                            <TabsTrigger value="preferences">Your Preferences</TabsTrigger>
                        </TabsList>

                        <TabsContent value="recommendations">
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    Based on your past behavior, we recommend these experiences for your next visit:
                                </p>

                                <div className="space-y-4">
                                    {recommendations.map(rec => (
                                        <button
                                            key={rec.id}
                                            type="button"
                                            className={`p-4 rounded-lg border transition-colors cursor-pointer w-full text-left ${selectedRecommendations.includes(rec.id)
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                            onClick={() => toggleRecommendation(rec.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{rec.name}</h4>
                                                        <Badge variant="outline">{rec.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-background p-1 rounded-md border">
                                                    <TrendingUpIcon className="h-3 w-3 text-green-500" />
                                                    <span className="text-xs font-medium">{(rec.confidence * 100).toFixed(0)}% match</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button
                                        onClick={applyRecommendations}
                                        disabled={selectedRecommendations.length === 0}
                                    >
                                        Apply {selectedRecommendations.length} Recommendations
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="preferences">
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    These preferences have been learned from your past visits and interactions:
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Top Experiences</h3>
                                        <div className="space-y-3">
                                            {preferences
                                                .toSorted((a, b) => b.likeScore - a.likeScore)
                                                .slice(0, 3)
                                                .map(pref => (
                                                    <div key={pref.id} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                            <span>{pref.name}</span>
                                                            <Badge variant="outline" className="text-xs">{pref.type}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary w-progress-bar"
                                                                    data-progress-percent={`${pref.likeScore * 100}%`}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">{(pref.likeScore * 100).toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Your Interests</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(preferences.flatMap(p => p.tags))).map(tag => (
                                                <Badge key={tag} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Visit History</h3>
                                        <div className="space-y-3">
                                            {preferences
                                                .toSorted((a, b) => b.visitCount - a.visitCount)
                                                .map(pref => (
                                                    <div key={pref.id} className="flex items-center justify-between">
                                                        <span>{pref.name}</span>
                                                        <Badge variant="outline">
                                                            {pref.visitCount} visit{pref.visitCount !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    )
}