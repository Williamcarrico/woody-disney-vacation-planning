'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
    Sun,
    Wind,
    Thermometer,
    MapPin,
    Calendar,
    Clock,
    Umbrella,
    Shirt,
    Camera
} from 'lucide-react'

// Magic UI Components
import { BorderBeam } from '@/components/ui/border-beam'
import { MagicCard } from '@/components/ui/magic-card'
import { Meteors } from '@/components/ui/meteors'
import { Particles } from '@/components/ui/particles'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import { RetroGrid } from '@/components/ui/retro-grid'

// Existing Weather Components
import WeatherForecastWidget from './WeatherForecastWidget'
import CurrentWeather from './CurrentWeather'
import LocationSearch from './LocationSearch'
import { WeatherLocation, TemperatureUnit } from '@/types/weather'

interface WeatherDashboardProps {
    className?: string
}

const parkLocations = [
    { name: 'Magic Kingdom', location: 'Bay Lake, FL' },
    { name: 'EPCOT', location: 'Bay Lake, FL' },
    { name: 'Hollywood Studios', location: 'Bay Lake, FL' },
    { name: 'Animal Kingdom', location: 'Bay Lake, FL' },
    { name: 'Disney Springs', location: 'Lake Buena Vista, FL' },
    { name: 'Universal Studios', location: 'Orlando, FL' },
]

const weatherTips = [
    {
        icon: <Umbrella className="h-5 w-5" />,
        title: "Rain Gear",
        description: "Florida afternoon showers are common. Pack a poncho or umbrella!"
    },
    {
        icon: <Shirt className="h-5 w-5" />,
        title: "Dress in Layers",
        description: "Morning can be cool, but afternoons get warm. Layer up!"
    },
    {
        icon: <Camera className="h-5 w-5" />,
        title: "Photo Weather",
        description: "Overcast skies can create perfect lighting for photos!"
    }
]

export default function WeatherDashboard({ className }: WeatherDashboardProps) {
    const [selectedLocation, setSelectedLocation] = useState<string | WeatherLocation>('Orlando, FL')
    const [units, setUnits] = useState<TemperatureUnit>('imperial')
    const [activeTab, setActiveTab] = useState('overview')
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const handleLocationChange = (location: string | WeatherLocation) => {
        setSelectedLocation(location)
    }

    return (
        <div className={cn("relative min-h-screen overflow-hidden", className)}>
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <AnimatedGridPattern
                    numSquares={30}
                    maxOpacity={0.1}
                    duration={3}
                    repeatDelay={1}
                    className="[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
                />
                <Particles
                    className="absolute inset-0"
                    quantity={100}
                    ease={80}
                    color="#60a5fa"
                    refresh
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Weather Forecast
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Plan your magical Disney vacation with real-time weather updates
                    </p>

                    {/* Current Time & Date */}
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{currentTime.toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{currentTime.toLocaleDateString()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Main Weather Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="detailed">Detailed</TabsTrigger>
                        <TabsTrigger value="parks">Parks</TabsTrigger>
                        <TabsTrigger value="planning">Planning</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Weather Widget */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="lg:col-span-2"
                            >
                                <MagicCard className="p-0 overflow-hidden">
                                    <WeatherForecastWidget
                                        location={selectedLocation}
                                        units={units}
                                        showForecast={true}
                                        daysToShow={7}
                                        onLocationChange={handleLocationChange}
                                        className="border-none shadow-none"
                                    />
                                    <BorderBeam size={100} duration={12} delay={9} />
                                </MagicCard>
                            </motion.div>

                            {/* Side Panel */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="space-y-6"
                            >
                                {/* Location Search */}
                                <Card className="relative overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Location
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <LocationSearch
                                            defaultLocation={typeof selectedLocation === 'string' ? selectedLocation : selectedLocation.name || ''}
                                            onLocationSelect={handleLocationChange}
                                        />
                                    </CardContent>
                                    <BorderBeam size={50} duration={8} delay={2} />
                                </Card>

                                {/* Units Toggle */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Thermometer className="h-5 w-5" />
                                            Units
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={units === 'imperial' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setUnits('imperial')}
                                            >
                                                °F
                                            </Button>
                                            <Button
                                                variant={units === 'metric' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setUnits('metric')}
                                            >
                                                °C
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Weather Tips */}
                                <Card className="relative overflow-hidden">
                                    <CardHeader>
                                        <CardTitle>Weather Tips</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {weatherTips.map((tip, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="text-blue-500 mt-1">
                                                    {tip.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm">{tip.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </CardContent>
                                    <Meteors number={10} />
                                </Card>
                            </motion.div>
                        </div>
                    </TabsContent>

                    {/* Detailed Tab */}
                    <TabsContent value="detailed" className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <MagicCard className="p-0">
                                <WeatherForecastWidget
                                    location={selectedLocation}
                                    units={units}
                                    showForecast={true}
                                    daysToShow={14}
                                    onLocationChange={handleLocationChange}
                                    className="border-none shadow-none"
                                />
                            </MagicCard>
                        </motion.div>
                    </TabsContent>

                    {/* Parks Tab */}
                    <TabsContent value="parks" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {parkLocations.map((park, index) => (
                                <motion.div
                                    key={park.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <MagicCard className="p-0 h-full">
                                        <Card className="border-none shadow-none h-full">
                                            <CardHeader>
                                                <CardTitle className="text-lg">{park.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{park.location}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <CurrentWeather
                                                    location={park.location}
                                                    values={{
                                                        temperature: 75,
                                                        temperatureApparent: 78,
                                                        humidity: 65,
                                                        windSpeed: 8,
                                                        weatherCode: 1000,
                                                        precipitationProbability: 20,
                                                        uvIndex: 6,
                                                        visibility: 10,
                                                        pressureSurfaceLevel: 1013,
                                                        cloudCover: 25,
                                                        dewPoint: 60,
                                                        freezingRainIntensity: 0,
                                                        rainIntensity: 0,
                                                        sleetIntensity: 0,
                                                        snowIntensity: 0,
                                                        uvHealthConcern: 2,
                                                        windDirection: 180,
                                                        windGust: 12,
                                                        cloudBase: 2000,
                                                        cloudCeiling: 5000
                                                    }}
                                                    units={units}
                                                />
                                            </CardContent>
                                        </Card>
                                    </MagicCard>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Planning Tab */}
                    <TabsContent value="planning" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 7-Day Planning */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Card className="relative overflow-hidden">
                                    <CardHeader>
                                        <CardTitle>7-Day Planning Guide</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Best days for outdoor activities
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {Array.from({ length: 7 }).map((_, index) => {
                                            const date = new Date()
                                            date.setDate(date.getDate() + index)
                                            const isGoodDay = Math.random() > 0.3

                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                    <div>
                                                        <p className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                                        <p className="text-sm text-muted-foreground">{date.toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge variant={isGoodDay ? 'default' : 'secondary'}>
                                                        {isGoodDay ? 'Great' : 'Fair'}
                                                    </Badge>
                                                </div>
                                            )
                                        })}
                                    </CardContent>
                                    <RetroGrid />
                                </Card>
                            </motion.div>

                            {/* Packing Suggestions */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Card className="relative overflow-hidden">
                                    <CardHeader>
                                        <CardTitle>Packing Suggestions</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Based on weather forecast
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Umbrella className="h-5 w-5 text-blue-500" />
                                                <span>Rain jacket or poncho</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Sun className="h-5 w-5 text-yellow-500" />
                                                <span>Sunscreen (SPF 30+)</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Shirt className="h-5 w-5 text-green-500" />
                                                <span>Light, breathable clothing</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Wind className="h-5 w-5 text-gray-500" />
                                                <span>Light jacket for evenings</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <Meteors number={15} />
                                </Card>
                            </motion.div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}