'use client';

import React, { useState } from 'react';
import { CollaborativeTripPlanner } from './CollaborativeTripPlanner';
import { RealtimeGroupChat } from './RealtimeGroupChat';
import { ActiveUsersPresence } from './ActiveUsersPresence';
import { InteractiveMap } from '@/components/maps/interactive-map';
import { useAdvancedGeofencing } from '@/hooks/useAdvancedGeofencing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Map,
    MessageCircle,
    Calendar,
    Users,
    Settings,
    Share2,
    Navigation,
    Bell,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeCollaborationDashboardProps {
    userId: string;
    userName: string;
    userAvatar?: string;
    groupId: string;
    className?: string;
}

export function RealtimeCollaborationDashboard({
    userId,
    userName,
    userAvatar,
    groupId,
    className
}: RealtimeCollaborationDashboardProps) {
    const [activeTab, setActiveTab] = useState('map');
    const [isLocationSharing, setIsLocationSharing] = useState(false);

    // Use advanced geofencing with location tracking
    const {
        startWatching,
        stopWatching,
        isWatching,
        lastLocation,
        currentPattern,
        activeSmartZones,
        recentAlerts,
    } = useAdvancedGeofencing({
        userId,
        enablePredictiveAlerts: true,
        enableSmartZones: true,
        onPredictiveAlert: (alert) => {
            console.log('Predictive alert:', alert);
        },
    });

    // Toggle location sharing
    const toggleLocationSharing = () => {
        if (isLocationSharing) {
            stopWatching();
            setIsLocationSharing(false);
        } else {
            startWatching();
            setIsLocationSharing(true);
        }
    };

    return (
        <div className={cn('w-full space-y-4', className)}>
            {/* Header with status */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CardTitle>Group Collaboration</CardTitle>
                            <Badge variant="secondary" className="gap-1">
                                <Users className="h-3 w-3" />
                                Group: {groupId}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={toggleLocationSharing}
                                variant={isLocationSharing ? 'default' : 'outline'}
                                size="sm"
                            >
                                <Navigation className={cn(
                                    'h-4 w-4 mr-2',
                                    isLocationSharing && 'animate-pulse'
                                )} />
                                {isLocationSharing ? 'Sharing Location' : 'Share Location'}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {currentPattern?.activity || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">Current Activity</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {currentPattern?.velocity ? `${(currentPattern.velocity * 2.237).toFixed(1)} mph` : '0 mph'}
                            </p>
                            <p className="text-xs text-muted-foreground">Speed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{activeSmartZones.length}</p>
                            <p className="text-xs text-muted-foreground">Active Zones</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{recentAlerts.length}</p>
                            <p className="text-xs text-muted-foreground">Recent Alerts</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active users presence bar */}
            <ActiveUsersPresence
                userId={userId}
                roomId={groupId}
                compact={true}
            />

            {/* Main content tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="map" className="gap-2">
                        <Map className="h-4 w-4" />
                        <span className="hidden sm:inline">Map</span>
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">Plan</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Users</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="map" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Real-time Group Map</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InteractiveMap
                                userId={userId}
                                height={500}
                                showUserLocation={isLocationSharing}
                                showSearch={true}
                                groupMembers={[]} // This would come from WebSocket
                                geofences={activeSmartZones.map(zone => ({
                                    id: zone.id,
                                    name: zone.name,
                                    lat: 0, // Would come from zone data
                                    lng: 0,
                                    radius: 100,
                                    type: 'custom',
                                }))}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="chat" className="mt-4">
                    <RealtimeGroupChat
                        userId={userId}
                        userName={userName}
                        userAvatar={userAvatar}
                        roomId={groupId}
                        height={600}
                    />
                </TabsContent>

                <TabsContent value="plan" className="mt-4">
                    <CollaborativeTripPlanner
                        userId={userId}
                        roomId={groupId}
                    />
                </TabsContent>

                <TabsContent value="users" className="mt-4">
                    <ActiveUsersPresence
                        userId={userId}
                        roomId={groupId}
                        showDetails={true}
                    />
                </TabsContent>
            </Tabs>

            {/* Recent alerts */}
            {recentAlerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Recent Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentAlerts.slice(0, 3).map((alert, index) => (
                                <Alert key={index} variant={alert.priority === 'urgent' ? 'destructive' : 'default'}>
                                    <Activity className="h-4 w-4" />
                                    <AlertDescription>{alert.message}</AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}