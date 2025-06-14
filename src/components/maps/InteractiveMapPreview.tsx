'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Clock, Users, Star, Navigation, Zap, TrendingUp, Shield, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InteractiveMap, LocationData, GroupMember, GeofenceData } from '@/components/maps/interactive-map'
import { GoogleMapsProvider } from '@/components/maps/google-maps-provider'

// Park locations with actual Disney World coordinates
const PARK_LOCATIONS = {
  mk: { lat: 28.4177, lng: -81.5812, name: 'Magic Kingdom' },
  epcot: { lat: 28.3747, lng: -81.5494, name: 'EPCOT' },
  hs: { lat: 28.3588, lng: -81.5907, name: 'Hollywood Studios' },
  ak: { lat: 28.3553, lng: -81.5901, name: 'Animal Kingdom' }
} as const

type ParkId = keyof typeof PARK_LOCATIONS

interface ParkData {
  id: ParkId
  name: string
  icon: string
  crowdLevel: 'low' | 'medium' | 'high'
  featured: boolean
  color: string
  avgWaitTime: number
  totalAttractions: number
  operatingHours: string
  safetyAlerts?: number
  activeGeofences?: number
}

interface AttractionData extends LocationData {
  parkId: ParkId
  fastPassAvailable?: boolean
  popularity: number
}

const InteractiveMapPreview: React.FC = () => {
  const [selectedPark, setSelectedPark] = useState<ParkId>('mk')
  const [hoveredAttraction, setHoveredAttraction] = useState<string | null>(null)
  const [showRealTimeData, setShowRealTimeData] = useState(true)
  const [mapCenter, setMapCenter] = useState(PARK_LOCATIONS.mk)
  const [mapZoom, setMapZoom] = useState(15)
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
  const [activeGeofences, setActiveGeofences] = useState<GeofenceData[]>([])
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

  // Fetch real park data from API
  const { data: parksData, isLoading: parksLoading } = useQuery({
    queryKey: ['parks-preview'],
    queryFn: async (): Promise<ParkData[]> => {
      const response = await fetch('/api/parks?preview=true')
      if (!response.ok) throw new Error('Failed to fetch parks data')
      const data = await response.json()
      
      // Transform API data to our format with enhanced features
      return [
        {
          id: 'mk' as ParkId,
          name: 'Magic Kingdom',
          icon: '🏰',
          crowdLevel: data.mk?.crowdLevel || 'medium',
          featured: true,
          color: 'from-blue-400 to-purple-500',
          avgWaitTime: data.mk?.avgWaitTime || 35,
          totalAttractions: data.mk?.totalAttractions || 25,
          operatingHours: data.mk?.operatingHours || '9:00 AM - 10:00 PM',
          safetyAlerts: data.mk?.safetyAlerts || 0,
          activeGeofences: data.mk?.activeGeofences || 3
        },
        {
          id: 'epcot' as ParkId,
          name: 'EPCOT',
          icon: '🌍',
          crowdLevel: data.epcot?.crowdLevel || 'low',
          featured: false,
          color: 'from-green-400 to-blue-500',
          avgWaitTime: data.epcot?.avgWaitTime || 25,
          totalAttractions: data.epcot?.totalAttractions || 15,
          operatingHours: data.epcot?.operatingHours || '9:00 AM - 9:00 PM',
          safetyAlerts: data.epcot?.safetyAlerts || 0,
          activeGeofences: data.epcot?.activeGeofences || 2
        },
        {
          id: 'hs' as ParkId,
          name: 'Hollywood Studios',
          icon: '🎬',
          crowdLevel: data.hs?.crowdLevel || 'high',
          featured: true,
          color: 'from-yellow-400 to-red-500',
          avgWaitTime: data.hs?.avgWaitTime || 55,
          totalAttractions: data.hs?.totalAttractions || 18,
          operatingHours: data.hs?.operatingHours || '9:00 AM - 8:00 PM',
          safetyAlerts: data.hs?.safetyAlerts || 1,
          activeGeofences: data.hs?.activeGeofences || 4
        },
        {
          id: 'ak' as ParkId,
          name: 'Animal Kingdom',
          icon: '🦁',
          crowdLevel: data.ak?.crowdLevel || 'medium',
          featured: false,
          color: 'from-orange-400 to-green-500',
          avgWaitTime: data.ak?.avgWaitTime || 30,
          totalAttractions: data.ak?.totalAttractions || 12,
          operatingHours: data.ak?.operatingHours || '8:00 AM - 7:00 PM',
          safetyAlerts: data.ak?.safetyAlerts || 0,
          activeGeofences: data.ak?.activeGeofences || 2
        }
      ]
    },
    refetchInterval: showRealTimeData ? 60000 : false, // Refresh every minute if real-time is enabled
    staleTime: 30000
  })

  // Fetch attractions for selected park
  const { data: attractions, isLoading: attractionsLoading } = useQuery({
    queryKey: ['attractions-preview', selectedPark],
    queryFn: async (): Promise<AttractionData[]> => {
      const response = await fetch(`/api/parks/${selectedPark}/attractions?limit=8&preview=true`)
      if (!response.ok) throw new Error('Failed to fetch attractions')
      const data = await response.json()
      
      return data.map((attraction: any, index: number) => ({
        id: attraction.id || `attraction-${index}`,
        name: attraction.name,
        description: attraction.description,
        lat: attraction.lat || (PARK_LOCATIONS[selectedPark].lat + (Math.random() - 0.5) * 0.01),
        lng: attraction.lng || (PARK_LOCATIONS[selectedPark].lng + (Math.random() - 0.5) * 0.01),
        type: 'attraction',
        waitTime: attraction.waitTime,
        status: attraction.status || 'OPERATING',
        imageUrl: attraction.imageUrl,
        parkId: selectedPark,
        fastPassAvailable: attraction.fastPassAvailable,
        popularity: attraction.popularity || Math.floor(Math.random() * 100)
      }))
    },
    enabled: !!selectedPark,
    refetchInterval: showRealTimeData ? 120000 : false, // Refresh every 2 minutes
    staleTime: 60000
  })

  // Fetch live stats
  const { data: liveStats } = useQuery({
    queryKey: ['live-stats-preview'],
    queryFn: async () => {
      const response = await fetch('/api/parks/stats?preview=true')
      if (!response.ok) throw new Error('Failed to fetch live stats')
      return response.json()
    },
    refetchInterval: showRealTimeData ? 30000 : false, // Refresh every 30 seconds
    staleTime: 15000
  })

  // Fetch geofence data when advanced features are enabled
  const { data: geofenceData } = useQuery({
    queryKey: ['geofences-preview', selectedPark],
    queryFn: async (): Promise<GeofenceData[]> => {
      if (!showAdvancedFeatures) return []
      
      // Demo geofences for the selected park
      const baseLocation = PARK_LOCATIONS[selectedPark]
      return [
        {
          id: `${selectedPark}-entrance`,
          lat: baseLocation.lat + 0.002,
          lng: baseLocation.lng - 0.002,
          radius: 150,
          name: 'Park Entrance',
          type: 'meeting'
        },
        {
          id: `${selectedPark}-center`,
          lat: baseLocation.lat,
          lng: baseLocation.lng,
          radius: 200,
          name: 'Central Hub',
          type: 'attraction'
        },
        {
          id: `${selectedPark}-safety`,
          lat: baseLocation.lat - 0.001,
          lng: baseLocation.lng + 0.001,
          radius: 100,
          name: 'Safety Zone',
          type: 'custom'
        }
      ]
    },
    enabled: showAdvancedFeatures && !!selectedPark,
    refetchInterval: showRealTimeData ? 60000 : false
  })

  // Demo group members
  const { data: demoGroupMembers } = useQuery({
    queryKey: ['group-members-preview', selectedPark],
    queryFn: async (): Promise<GroupMember[]> => {
      if (!showAdvancedFeatures) return []
      
      const baseLocation = PARK_LOCATIONS[selectedPark]
      return [
        {
          id: 'member-1',
          name: 'Alice',
          avatar: '/avatars/alice.jpg',
          lat: baseLocation.lat + 0.001,
          lng: baseLocation.lng + 0.001,
          lastUpdated: new Date()
        },
        {
          id: 'member-2',
          name: 'Bob',
          avatar: '/avatars/bob.jpg',
          lat: baseLocation.lat - 0.001,
          lng: baseLocation.lng - 0.001,
          lastUpdated: new Date(Date.now() - 120000) // 2 minutes ago
        }
      ]
    },
    enabled: showAdvancedFeatures && !!selectedPark,
    refetchInterval: showRealTimeData ? 30000 : false
  })

  // Update map center when park changes
  useEffect(() => {
    if (selectedPark) {
      setMapCenter(PARK_LOCATIONS[selectedPark])
      setMapZoom(15)
    }
  }, [selectedPark])

  // Update geofences and group members when data changes
  useEffect(() => {
    if (geofenceData) {
      setActiveGeofences(geofenceData)
    }
  }, [geofenceData])

  useEffect(() => {
    if (demoGroupMembers) {
      setGroupMembers(demoGroupMembers)
    }
  }, [demoGroupMembers])

  const handleParkSelect = useCallback((parkId: ParkId) => {
    setSelectedPark(parkId)
    setHoveredAttraction(null)
  }, [])

  const handleGeofenceEnter = useCallback((geofence: GeofenceData) => {
    console.log('Geofence entered:', geofence.name)
    // In a real app, this would trigger notifications
  }, [])

  const handleGeofenceExit = useCallback((geofence: GeofenceData) => {
    console.log('Geofence exited:', geofence.name)
  }, [])

  const handleGroupMemberDistanceAlert = useCallback((memberId: string, distance: number) => {
    console.log(`Group member ${memberId} is ${distance}m away`)
  }, [])

  const getCrowdColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-red-500'
    }
  }

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 20) return 'text-green-500'
    if (waitTime <= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const selectedParkData = parksData?.find(park => park.id === selectedPark)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Enhanced Controls Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              showRealTimeData ? "bg-green-400" : "bg-gray-400"
            )} />
            <span className="text-sm font-medium">
              {showRealTimeData ? 'Live Data' : 'Demo Mode'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRealTimeData(!showRealTimeData)}
            className="gap-2"
          >
            <Zap className={cn("h-4 w-4", showRealTimeData && "text-yellow-500")} />
            {showRealTimeData ? 'Live' : 'Demo'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
            className="gap-2"
          >
            <Shield className={cn("h-4 w-4", showAdvancedFeatures && "text-blue-500")} />
            Advanced Features
          </Button>
          {showAdvancedFeatures && (
            <Badge variant="secondary" className="gap-1">
              <Compass className="h-3 w-3" />
              Geofencing Active
            </Badge>
          )}
        </div>
      </div>

      {/* Enhanced Park Selector */}
      <div className="flex flex-wrap justify-center gap-3">
        {parksLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-52 rounded-2xl" />
          ))
        ) : (
          parksData?.map((park) => (
            <motion.button
              key={park.id}
              onClick={() => handleParkSelect(park.id)}
              className={cn(
                "relative overflow-hidden rounded-2xl p-4 text-white font-semibold transition-all duration-300",
                selectedPark === park.id ? 'ring-4 ring-white ring-opacity-50 scale-105' : 'hover:scale-105'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${park.color} opacity-90`} />
              <div className="relative flex items-center space-x-3">
                <span className="text-2xl" role="img" aria-label={park.name}>
                  {park.icon}
                </span>
                <div className="text-left">
                  <p className="font-bold text-sm">{park.name}</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <Clock className="h-3 w-3" />
                    <span className={getWaitTimeColor(park.avgWaitTime)}>
                      {park.avgWaitTime}min avg
                    </span>
                    <span className={getCrowdColor(park.crowdLevel)}>
                      • {park.crowdLevel}
                    </span>
                  </div>
                  <div className="text-xs opacity-75 mt-1 space-y-1">
                    <div>{park.totalAttractions} attractions • {park.operatingHours}</div>
                    {showAdvancedFeatures && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {park.activeGeofences} zones
                        </span>
                        {park.safetyAlerts && park.safetyAlerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {park.safetyAlerts} alerts
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {park.featured && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs"
                >
                  ⭐ Featured
                </Badge>
              )}
              
              {/* Live indicator for selected park */}
              {selectedPark === park.id && showRealTimeData && (
                <div className="absolute bottom-2 right-2">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs">Live</span>
                  </div>
                </div>
              )}
            </motion.button>
          ))
        )}
      </div>

      {/* Enhanced Interactive Map */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-2 border-white/20">
        <CardContent className="p-0">
          <div className="relative h-96">
            <Suspense fallback={
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading interactive map...</p>
                </div>
              </div>
            }>
              <GoogleMapsProvider>
                <InteractiveMap
                  height="100%"
                  width="100%"
                  initialCenter={mapCenter}
                  initialZoom={mapZoom}
                  markers={attractions || []}
                  groupMembers={showAdvancedFeatures ? groupMembers : []}
                  geofences={showAdvancedFeatures ? activeGeofences : []}
                  showSearch={false}
                  showUserLocation={false}
                  showWaitTimes={true}
                  onGeofenceEnter={handleGeofenceEnter}
                  onGeofenceExit={handleGeofenceExit}
                  onGroupMemberDistanceAlert={handleGroupMemberDistanceAlert}
                  maxGroupSeparationDistance={200}
                  className="rounded-lg"
                />
              </GoogleMapsProvider>
            </Suspense>

            {/* Enhanced Live Stats Overlay */}
            <div className="absolute top-4 left-4 space-y-2 z-10">
              <Badge className="bg-white/90 text-slate-800 font-semibold backdrop-blur-sm">
                <Users className="h-3 w-3 mr-1" />
                {showRealTimeData ? 'Live Data' : 'Demo Mode'}
              </Badge>
              
              <AnimatePresence>
                {liveStats && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Open: {liveStats.openAttractions || selectedParkData?.totalAttractions || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      <span>Avg Wait: {selectedParkData?.avgWaitTime || 0} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span>Weather: {liveStats.weather?.temperature || 75}°F {liveStats.weather?.condition || '☀️'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <span>Crowd: {selectedParkData?.crowdLevel || 'medium'}</span>
                    </div>
                    {showAdvancedFeatures && (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          <span>Active Zones: {activeGeofences.length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                          <span>Group Members: {groupMembers.length}</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Attraction Count Badge */}
            <div className="absolute top-4 right-4 z-10 space-y-2">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                <Navigation className="h-3 w-3 mr-1" />
                {attractions?.length || 0} locations
              </Badge>
              {showAdvancedFeatures && (
                <Badge variant="outline" className="bg-white/90 backdrop-blur-sm block">
                  <Shield className="h-3 w-3 mr-1" />
                  Enhanced Features
                </Badge>
              )}
            </div>
          </div>

          {/* Enhanced Action Bar */}
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span>Explore {selectedParkData?.name}</span>
                  {showRealTimeData && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  )}
                  {showAdvancedFeatures && (
                    <Badge variant="outline" className="text-xs">
                      <Compass className="h-3 w-3 mr-1" />
                      Advanced
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {selectedParkData?.totalAttractions} attractions • Avg wait: {selectedParkData?.avgWaitTime}min • {selectedParkData?.crowdLevel} crowds
                  {showAdvancedFeatures && selectedParkData?.activeGeofences && (
                    <> • {selectedParkData.activeGeofences} safety zones</>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Save Favorites
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => window.open('/map', '_blank')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Full Map Experience
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Stats with Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Attractions Open', 
            value: selectedParkData?.totalAttractions?.toString() || '0', 
            icon: '🎢',
            trend: liveStats?.attractionTrend
          },
          { 
            label: 'Avg Wait Time', 
            value: `${selectedParkData?.avgWaitTime || 0} min`, 
            icon: '⏱️',
            trend: liveStats?.waitTimeTrend
          },
          { 
            label: 'Weather', 
            value: `${liveStats?.weather?.temperature || 75}°F`, 
            icon: liveStats?.weather?.icon || '☀️',
            trend: liveStats?.weatherTrend
          },
          showAdvancedFeatures ? {
            label: 'Safety Zones',
            value: selectedParkData?.activeGeofences?.toString() || '0',
            icon: '🛡️',
            trend: 'stable' as const
          } : { 
            label: 'Crowd Level', 
            value: selectedParkData?.crowdLevel || 'Medium', 
            icon: '👥',
            trend: liveStats?.crowdTrend
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="text-center p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
              <div className="text-2xl mb-2 flex items-center justify-center gap-2">
                <span>{stat.icon}</span>
                {stat.trend && (
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    stat.trend === 'up' ? "text-green-500" :
                    stat.trend === 'down' ? "text-red-500" : "text-gray-500"
                  )} />
                )}
              </div>
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">{stat.label}</div>
              {showRealTimeData && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Advanced Features Panel */}
      <AnimatePresence>
        {showAdvancedFeatures && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 border-dashed">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Advanced Safety & Tracking Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Geofencing</h4>
                    <p className="text-xs text-muted-foreground">
                      {activeGeofences.length} active safety zones monitoring your group's location
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Group Tracking</h4>
                    <p className="text-xs text-muted-foreground">
                      {groupMembers.length} group members being tracked in real-time
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Smart Alerts</h4>
                    <p className="text-xs text-muted-foreground">
                      Instant notifications for safety zones and group separation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InteractiveMapPreview 