'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import TripOverview from "@/components/dashboard/TripOverview"
import { Separator } from "@/components/ui/separator"
import { Code, Database, Zap, Shield, RefreshCw, BarChart3 } from "lucide-react"

/**
 * Demo page showcasing the TripOverview component with comprehensive data fetching
 *
 * Features demonstrated:
 * - Real-time data fetching with React Query
 * - Sophisticated error handling and retry logic
 * - Caching and performance optimization
 * - Loading states and skeleton UI
 * - Optimistic updates and mutations
 * - Type-safe API interactions
 */
export default function TripOverviewDemoPage() {
    const [vacationId, setVacationId] = useState('550e8400-e29b-41d4-a716-446655440000')
    const [currentVacationId, setCurrentVacationId] = useState(vacationId)

    const handleLoadVacation = () => {
        setCurrentVacationId(vacationId)
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">TripOverview Component Demo</h1>
                        <p className="text-muted-foreground">
                            Showcasing sophisticated data fetching with React Query, error handling, and performance optimization
                        </p>
                    </div>
                </div>

                {/* Feature Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <Zap className="h-3 w-3" />
                        React Query Integration
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Type-Safe APIs
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Auto Retry Logic
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Performance Monitoring
                    </Badge>
                </div>
            </div>

            <Separator />

            {/* Demo Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Demo Controls
                    </CardTitle>
                    <CardDescription>
                        Test the TripOverview component with different vacation IDs to see data fetching in action
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="vacation-id">Vacation ID</Label>
                            <Input
                                id="vacation-id"
                                value={vacationId}
                                onChange={(e) => setVacationId(e.target.value)}
                                placeholder="Enter a vacation ID (UUID format)"
                                className="font-mono"
                            />
                        </div>
                        <Button onClick={handleLoadVacation}>
                            Load Vacation
                        </Button>
                    </div>

                    {/* Sample IDs */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Sample Vacation IDs:</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                '550e8400-e29b-41d4-a716-446655440000',
                                '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                                '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
                                'invalid-id-for-testing'
                            ].map((id) => (
                                <Button
                                    key={id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setVacationId(id)}
                                    className="font-mono text-xs"
                                >
                                    {id.length > 20 ? `${id.substring(0, 20)}...` : id}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Component Showcase */}
            <Tabs defaultValue="standard" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="standard">Standard View</TabsTrigger>
                    <TabsTrigger value="compact">Compact View</TabsTrigger>
                    <TabsTrigger value="no-actions">Read-Only</TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Standard TripOverview</CardTitle>
                            <CardDescription>
                                Full-featured component with all actions and detailed information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TripOverview
                                vacationId={currentVacationId}
                                showActions={true}
                                compact={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compact" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compact TripOverview</CardTitle>
                            <CardDescription>
                                Space-efficient version suitable for dashboards and sidebars
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TripOverview
                                vacationId={currentVacationId}
                                showActions={true}
                                compact={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="no-actions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Read-Only TripOverview</CardTitle>
                            <CardDescription>
                                Display-only version without edit, share, or archive actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TripOverview
                                vacationId={currentVacationId}
                                showActions={false}
                                compact={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Implementation Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Implementation Highlights</CardTitle>
                    <CardDescription>
                        Key features and technical details of the data fetching implementation
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                Data Fetching Features
                            </h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• React Query integration for caching and synchronization</li>
                                <li>• Automatic retry with exponential backoff</li>
                                <li>• Request deduplication and background refetching</li>
                                <li>• Optimistic updates for better UX</li>
                                <li>• Type-safe API interactions with Zod validation</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                Error Handling & Performance
                            </h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Comprehensive error handling with custom error types</li>
                                <li>• Loading states with skeleton UI</li>
                                <li>• Performance monitoring and analytics</li>
                                <li>• Request timeout and abort signal support</li>
                                <li>• Memory-efficient caching with TTL</li>
                            </ul>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h4 className="font-semibold">API Endpoint Structure</h4>
                        <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                            <div className="space-y-1">
                                <div><span className="text-green-600">GET</span> /api/vacations/[vacationId]</div>
                                <div><span className="text-blue-600">PATCH</span> /api/vacations/[vacationId]</div>
                                <div><span className="text-red-600">DELETE</span> /api/vacations/[vacationId]</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold">Service Layer Architecture</h4>
                        <div className="bg-muted p-4 rounded-lg text-sm">
                            <div className="space-y-1">
                                <div>📁 <code>src/lib/services/vacation.service.ts</code> - Core service logic</div>
                                <div>🎣 <code>src/hooks/useVacation.ts</code> - React Query integration</div>
                                <div>🛡️ <code>src/app/api/vacations/[vacationId]/route.ts</code> - API endpoints</div>
                                <div>🎨 <code>src/components/dashboard/TripOverview.tsx</code> - UI component</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}