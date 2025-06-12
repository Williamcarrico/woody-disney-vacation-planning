"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { NumberTicker } from '@/components/magicui/number-ticker'
import {
    Clock,
    Star,
    MapPin,
    Users,
    Calendar,
    Search,
    Sparkles,
    Waves,
    Thermometer,
    Sun,
    Droplets,
    Mountain,
    Timer,
    Lightbulb,
    Target,
    Info
} from 'lucide-react'

interface WaterAttraction {
    id: string
    name: string
    area: string
    type: string
    height: string
    rating: number
    waitTime: number
    description: string
    tips: string[]
    accessibility: string[]
    duration: string
    intensity: 'Low' | 'Moderate' | 'High' | 'Extreme'
    ageGroup: string[]
    bestTime: string[]
    icon: string
}

const waterAttractions: WaterAttraction[] = [
    {
        id: 'surf-pool',
        name: 'Surf Pool',
        area: 'Central Lagoon',
        type: 'Wave Pool',
        height: 'Any Height',
        rating: 4.8,
        waitTime: 0,
        description: 'Experience one of the world\'s largest wave pools with waves up to 6 feet high, perfect for bodysurf or floating.',
        tips: [
            'Waves operate on 30-minute cycles',
            'Best bodysurf during high wave periods',
            'Calm periods perfect for floating',
            'Can get very crowded during peak times'
        ],
        accessibility: ['Water Transfer Required', 'Life Jackets Available'],
        duration: 'Continuous',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Early Morning', 'Late Afternoon'],
        icon: '🌊'
    },
    {
        id: 'castaway-creek',
        name: 'Castaway Creek',
        area: 'Around Park',
        type: 'Lazy River',
        height: 'Any Height',
        rating: 4.6,
        waitTime: 0,
        description: 'Float peacefully on this 2,100-foot lazy river that winds around the entire park through tropical landscapes.',
        tips: [
            'Complete circuit takes about 30 minutes',
            'Tubes provided at entry points',
            'Great way to see the whole park',
            'Perfect for relaxation between slides'
        ],
        accessibility: ['Water Transfer Required', 'Tubes Provided'],
        duration: '30 minutes',
        intensity: 'Low',
        ageGroup: ['All Ages'],
        bestTime: ['Anytime'],
        icon: '🛟'
    },
    {
        id: 'crush-n-gusher',
        name: 'Crush \'n\' Gusher',
        area: 'Hideaway Bay',
        type: 'Water Coaster',
        height: '48" (122cm)',
        rating: 4.7,
        waitTime: 45,
        description: 'Three thrilling water coasters that use water jets to propel you uphill and downhill like a roller coaster.',
        tips: [
            'Three different slides: Banana Blaster, Coconut Crusher, Pineapple Plunger',
            'Unique uphill water coaster experience',
            'Can have long waits - go early',
            'Most thrilling water attraction in the park'
        ],
        accessibility: ['Must Transfer from Wheelchair', 'Height Requirement'],
        duration: '2 minutes',
        intensity: 'High',
        ageGroup: ['Teens', 'Adults'],
        bestTime: ['Rope Drop', 'Late Evening'],
        icon: '🎢'
    },
    {
        id: 'humunga-kowabunga',
        name: 'Humunga Kowabunga',
        area: 'Mount Mayday',
        type: 'Speed Slide',
        height: '48" (122cm)',
        rating: 4.5,
        waitTime: 35,
        description: 'Three high-speed body slides with trap doors that drop you into dark tubes at speeds up to 30 mph.',
        tips: [
            'Trap door creates sudden drop sensation',
            'Very fast and intense',
            'Three identical slides',
            'Not for those afraid of heights or speed'
        ],
        accessibility: ['Must Transfer from Wheelchair', 'Height Requirement'],
        duration: '1 minute',
        intensity: 'Extreme',
        ageGroup: ['Teens', 'Adults'],
        bestTime: ['Morning', 'Evening'],
        icon: '⚡'
    },
    {
        id: 'gang-plank-falls',
        name: 'Gang Plank Falls',
        area: 'Mount Mayday',
        type: 'Family Raft Ride',
        height: 'Any Height',
        rating: 4.3,
        waitTime: 25,
        description: 'Four-person raft adventure through 300 feet of rushing rapids, waterfalls, and caves.',
        tips: [
            'Great for families',
            'Four people per raft',
            'Moderate thrills with beautiful scenery',
            'Can get wet from waterfalls'
        ],
        accessibility: ['Water Transfer Required', 'Family Friendly'],
        duration: '3 minutes',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Morning', 'Afternoon'],
        icon: '🚣'
    },
    {
        id: 'keelhaul-falls',
        name: 'Keelhaul Falls',
        area: 'Mount Mayday',
        type: 'Tube Slide',
        height: 'Any Height',
        rating: 4.2,
        waitTime: 20,
        description: 'The longest tube slide in the park at 400 feet, winding through dark and light sections.',
        tips: [
            'Longest slide experience',
            'Mix of enclosed and open sections',
            'Great for first-time sliders',
            'Beautiful views during open sections'
        ],
        accessibility: ['Water Transfer Required', 'Tubes Provided'],
        duration: '2 minutes',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Anytime'],
        icon: '🌀'
    },
    {
        id: 'mayday-falls',
        name: 'Mayday Falls',
        area: 'Mount Mayday',
        type: 'Tube Slide',
        height: 'Any Height',
        rating: 4.1,
        waitTime: 15,
        description: 'Single-tube adventure winding through caves and past waterfalls with scenic tropical landscapes.',
        tips: [
            'Most scenic slide in the park',
            'Single rider tube slide',
            'Great photo opportunities',
            'Perfect balance of thrills and beauty'
        ],
        accessibility: ['Water Transfer Required', 'Tubes Provided'],
        duration: '2 minutes',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Anytime'],
        icon: '🏞️'
    },
    {
        id: 'storm-slides',
        name: 'Storm Slides',
        area: 'Mount Mayday',
        type: 'Body Slide',
        height: 'Any Height',
        rating: 4.0,
        waitTime: 15,
        description: 'Three body slides - Jib Jammer, Stern Burner, and Rudder Buster - with different experiences.',
        tips: [
            'Three different slide experiences',
            'Racing with friends possible',
            'Good for building confidence',
            'Shorter wait times usually'
        ],
        accessibility: ['Water Transfer Required', 'Multiple Options'],
        duration: '1 minute',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Anytime'],
        icon: '⛈️'
    },
    {
        id: 'ketchakiddee-creek',
        name: 'Ketchakiddee Creek',
        area: 'Kids Area',
        type: 'Children\'s Play Area',
        height: 'Under 48" (122cm)',
        rating: 4.4,
        waitTime: 0,
        description: 'Interactive water playground for young children with mini-slides, fountains, and wading pools.',
        tips: [
            'Designed specifically for young children',
            'Sandy bottom wading pool',
            'Mini slides and water features',
            'Parents can supervise easily'
        ],
        accessibility: ['Water Transfer Required', 'Age Restricted'],
        duration: 'Open Play',
        intensity: 'Low',
        ageGroup: ['Toddlers', 'Young Kids'],
        bestTime: ['Anytime'],
        icon: '🧒'
    },
    {
        id: 'bay-slides',
        name: 'Bay Slides',
        area: 'Hideaway Bay',
        type: 'Beginner Slides',
        height: 'Any Height',
        rating: 3.8,
        waitTime: 10,
        description: 'Two gentle slides perfect for beginners or those wanting a milder slide experience.',
        tips: [
            'Perfect for first-time sliders',
            'Shorter and gentler than other slides',
            'Great confidence builders',
            'Usually shorter wait times'
        ],
        accessibility: ['Water Transfer Required', 'Beginner Friendly'],
        duration: '1 minute',
        intensity: 'Low',
        ageGroup: ['Kids', 'Teens'],
        bestTime: ['Anytime'],
        icon: '🏄'
    },
    {
        id: 'miss-adventure-falls',
        name: 'Miss Adventure Falls',
        area: 'Hideaway Bay',
        type: 'Family Raft Ride',
        height: 'Any Height',
        rating: 4.5,
        waitTime: 30,
        description: 'Join Captain Mary Oceaneer on a treasure-hunting adventure through the wreckage of her ship.',
        tips: [
            'Newest attraction in the park',
            'Great theming and storytelling',
            'Family-friendly adventure',
            'Look for hidden treasures and details'
        ],
        accessibility: ['Water Transfer Required', 'Family Friendly'],
        duration: '4 minutes',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Morning', 'Afternoon'],
        icon: '🏴‍☠️'
    }
]

const parkAreas = [
    {
        id: 'mount-mayday',
        name: 'Mount Mayday',
        description: 'The centerpiece of Typhoon Lagoon featuring Miss Tilly shipwreck and major water slides',
        attractions: ['humunga-kowabunga', 'gang-plank-falls', 'keelhaul-falls', 'mayday-falls', 'storm-slides'],
        icon: '🏔️'
    },
    {
        id: 'surf-pool',
        name: 'Typhoon Lagoon',
        description: 'The massive wave pool that gives the park its name',
        attractions: ['surf-pool'],
        icon: '🌊'
    },
    {
        id: 'hideaway-bay',
        name: 'Hideaway Bay',
        description: 'Home to the thrilling Crush \'n\' Gusher water coasters and Miss Adventure Falls',
        attractions: ['crush-n-gusher', 'bay-slides', 'miss-adventure-falls'],
        icon: '🏖️'
    },
    {
        id: 'kids-area',
        name: 'Ketchakiddee Creek',
        description: 'Special play area designed for young children',
        attractions: ['ketchakiddee-creek'],
        icon: '🧒'
    },
    {
        id: 'lazy-river',
        name: 'Castaway Creek',
        description: 'Relaxing lazy river that circles the entire park',
        attractions: ['castaway-creek'],
        icon: '🛟'
    }
]

const parkInfo = {
    opened: 'June 1, 1989',
    theme: 'Storm-ravaged tropical paradise',
    size: '61 acres',
    wavePool: '2.75 acres (one of world\'s largest)',
    lazyRiver: '2,100 feet long',
    slides: '11 water attractions',
    mountMayday: '95 feet tall with Miss Tilly shipwreck',
    maxWaveHeight: '6 feet',
    yearlyVisitors: 'Over 2 million guests'
}

export default function TyphoonLagoonPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedArea, setSelectedArea] = useState('all')
    const [selectedIntensity, setSelectedIntensity] = useState('all')
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('all')

    const filteredAttractions = waterAttractions.filter(attraction => {
        const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attraction.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesArea = selectedArea === 'all' || attraction.area.toLowerCase().includes(selectedArea.toLowerCase())
        const matchesIntensity = selectedIntensity === 'all' || attraction.intensity === selectedIntensity
        const matchesAgeGroup = selectedAgeGroup === 'all' || attraction.ageGroup.includes(selectedAgeGroup)

        return matchesSearch && matchesArea && matchesIntensity && matchesAgeGroup
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white">
                <div className="absolute inset-0 bg-[url('/images/parks/typhoon-lagoon-bg.jpg')] bg-cover bg-center opacity-20" />
                <div className="relative container mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Waves className="h-12 w-12" />
                            <SparklesText
                                className="text-4xl md:text-6xl font-bold"
                            >
                                Disney&apos;s Typhoon Lagoon
                            </SparklesText>
                        </div>
                        <p className="text-xl md:text-2xl mb-6 opacity-90">
                            A Storm-Ravaged Tropical Paradise
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                <Calendar className="h-4 w-4 mr-1" />
                                Opened {parkInfo.opened}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                <MapPin className="h-4 w-4 mr-1" />
                                {parkInfo.size}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                <Waves className="h-4 w-4 mr-1" />
                                World&apos;s Largest Wave Pool
                            </Badge>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <MagicCard className="p-6 text-center">
                        <Waves className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">
                            <NumberTicker value={6} />ft
                        </div>
                        <div className="text-sm text-muted-foreground">Max Wave Height</div>
                    </MagicCard>
                    <MagicCard className="p-6 text-center">
                        <Mountain className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">
                            <NumberTicker value={11} />
                        </div>
                        <div className="text-sm text-muted-foreground">Water Attractions</div>
                    </MagicCard>
                    <MagicCard className="p-6 text-center">
                        <Timer className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold text-orange-600">
                            <NumberTicker value={2100} />ft
                        </div>
                        <div className="text-sm text-muted-foreground">Lazy River Length</div>
                    </MagicCard>
                    <MagicCard className="p-6 text-center">
                        <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                        <div className="text-2xl font-bold text-yellow-600">
                            <NumberTicker value={35} />
                        </div>
                        <div className="text-sm text-muted-foreground">Years Operating</div>
                    </MagicCard>
                </motion.div>

                <Tabs defaultValue="attractions" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="attractions">Attractions</TabsTrigger>
                        <TabsTrigger value="areas">Park Areas</TabsTrigger>
                        <TabsTrigger value="planning">Planning</TabsTrigger>
                        <TabsTrigger value="info">Park Info</TabsTrigger>
                    </TabsList>

                    <TabsContent value="attractions" className="space-y-6">
                        {/* Filters */}
                        <MagicCard className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search attractions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={selectedArea} onValueChange={setSelectedArea}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Select area" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Areas</SelectItem>
                                        <SelectItem value="mount mayday">Mount Mayday</SelectItem>
                                        <SelectItem value="central lagoon">Central Lagoon</SelectItem>
                                        <SelectItem value="hideaway bay">Hideaway Bay</SelectItem>
                                        <SelectItem value="kids area">Kids Area</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedIntensity} onValueChange={setSelectedIntensity}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Intensity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Intensities</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Moderate">Moderate</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Extreme">Extreme</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Age Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ages</SelectItem>
                                        <SelectItem value="Toddlers">Toddlers</SelectItem>
                                        <SelectItem value="Kids">Kids</SelectItem>
                                        <SelectItem value="Teens">Teens</SelectItem>
                                        <SelectItem value="Adults">Adults</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </MagicCard>

                        {/* Attractions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAttractions.map((attraction, index) => (
                                <motion.div
                                    key={attraction.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <MagicCard className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                                        <div className="relative">
                                            <div className="h-48 bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                                                <span className="text-6xl">{attraction.icon}</span>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <Badge
                                                    variant={
                                                        attraction.intensity === 'Low' ? 'secondary' :
                                                            attraction.intensity === 'Moderate' ? 'default' :
                                                                attraction.intensity === 'High' ? 'destructive' : 'destructive'
                                                    }
                                                >
                                                    {attraction.intensity}
                                                </Badge>
                                            </div>
                                            {attraction.waitTime > 0 && (
                                                <div className="absolute top-4 left-4">
                                                    <Badge variant="outline" className="bg-white/90">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {attraction.waitTime}m
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                                                    {attraction.name}
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">{attraction.rating}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant="outline">{attraction.area}</Badge>
                                                <Badge variant="outline">{attraction.type}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                                {attraction.description}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4" />
                                                    <span>{attraction.height}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Timer className="h-4 w-4" />
                                                    <span>{attraction.duration}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex flex-wrap gap-1">
                                                    {attraction.ageGroup.slice(0, 3).map((group) => (
                                                        <Badge key={group} variant="secondary" className="text-xs">
                                                            {group}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <BorderBeam size={250} duration={12} delay={9} />
                                    </MagicCard>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="areas" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {parkAreas.map((area, index) => (
                                <motion.div
                                    key={area.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <MagicCard className="h-full p-6">
                                        <div className="text-center mb-4">
                                            <span className="text-4xl mb-2 block">{area.icon}</span>
                                            <h3 className="font-bold text-xl mb-2">{area.name}</h3>
                                            <p className="text-muted-foreground text-sm">{area.description}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">Attractions:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {area.attractions.map((attractionId) => {
                                                    const attraction = waterAttractions.find(a => a.id === attractionId)
                                                    return attraction ? (
                                                        <Badge key={attractionId} variant="outline" className="text-xs">
                                                            {attraction.name}
                                                        </Badge>
                                                    ) : null
                                                })}
                                            </div>
                                        </div>
                                    </MagicCard>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="planning" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MagicCard className="p-6">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" />
                                    Best Times to Visit
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Sun className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">Early Morning (Rope Drop)</div>
                                            <div className="text-sm text-muted-foreground">Shortest wait times for popular slides</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Thermometer className="h-5 w-5 text-orange-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">Late Afternoon</div>
                                            <div className="text-sm text-muted-foreground">Crowds thin out, perfect for wave pool</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">Weekdays</div>
                                            <div className="text-sm text-muted-foreground">Generally less crowded than weekends</div>
                                        </div>
                                    </div>
                                </div>
                            </MagicCard>

                            <MagicCard className="p-6">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Pro Tips
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">🏃‍♂️</span>
                                        <div>
                                            <div className="font-medium">Start with Crush &apos;n&apos; Gusher</div>
                                            <div className="text-sm text-muted-foreground">Longest waits, tackle it first</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">🌊</span>
                                        <div>
                                            <div className="font-medium">Wave Pool Timing</div>
                                            <div className="text-sm text-muted-foreground">Waves run for 30 minutes, then 30 minutes calm</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">🧴</span>
                                        <div>
                                            <div className="font-medium">Bring Sunscreen</div>
                                            <div className="text-sm text-muted-foreground">Reapply frequently, especially after slides</div>
                                        </div>
                                    </div>
                                </div>
                            </MagicCard>
                        </div>

                        <MagicCard className="p-6">
                            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                What to Bring
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Essentials</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Swimwear</li>
                                        <li>• Towels</li>
                                        <li>• Sunscreen (reef-safe)</li>
                                        <li>• Water shoes</li>
                                        <li>• Waterproof phone case</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Comfort Items</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Umbrella or pop-up tent</li>
                                        <li>• Cooler with snacks</li>
                                        <li>• Refillable water bottle</li>
                                        <li>• Waterproof bag</li>
                                        <li>• Portable charger</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">For Kids</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Life jackets (provided free)</li>
                                        <li>• Swim diapers</li>
                                        <li>• Snacks and drinks</li>
                                        <li>• Toys for kids area</li>
                                        <li>• Extra clothes</li>
                                    </ul>
                                </div>
                            </div>
                        </MagicCard>
                    </TabsContent>

                    <TabsContent value="info" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MagicCard className="p-6">
                                <h3 className="font-bold text-xl mb-4">Park Information</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Opened:</span>
                                        <span className="font-medium">{parkInfo.opened}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Theme:</span>
                                        <span className="font-medium">{parkInfo.theme}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Size:</span>
                                        <span className="font-medium">{parkInfo.size}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Wave Pool:</span>
                                        <span className="font-medium">{parkInfo.wavePool}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Max Wave Height:</span>
                                        <span className="font-medium">{parkInfo.maxWaveHeight}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Lazy River:</span>
                                        <span className="font-medium">{parkInfo.lazyRiver}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mount Mayday:</span>
                                        <span className="font-medium">{parkInfo.mountMayday}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Attractions:</span>
                                        <span className="font-medium">{parkInfo.slides}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Annual Visitors:</span>
                                        <span className="font-medium">{parkInfo.yearlyVisitors}</span>
                                    </div>
                                </div>
                            </MagicCard>

                            <MagicCard className="p-6">
                                <h3 className="font-bold text-xl mb-4">Operating Hours</h3>
                                <div className="space-y-3">
                                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">10:00 AM - 5:00 PM</div>
                                        <div className="text-sm text-muted-foreground">Typical Operating Hours</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>• Hours vary by season</p>
                                        <p>• Extended hours during summer</p>
                                        <p>• Closed for annual maintenance (typically January)</p>
                                        <p>• Weather dependent - may close for storms</p>
                                    </div>
                                </div>
                            </MagicCard>
                        </div>

                        <MagicCard className="p-6">
                            <h3 className="font-bold text-xl mb-4">Special Events</h3>
                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="h-6 w-6 text-purple-600" />
                                    <h4 className="font-bold text-lg">H2O Glow Nights</h4>
                                </div>
                                <p className="text-muted-foreground mb-3">
                                    Special after-hours event featuring glowing decorations, DJ entertainment,
                                    character meet and greets, and exclusive food offerings.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary">Summer Nights</Badge>
                                    <Badge variant="secondary">Limited Tickets</Badge>
                                    <Badge variant="secondary">Shorter Wait Times</Badge>
                                    <Badge variant="secondary">Special Entertainment</Badge>
                                </div>
                            </div>
                        </MagicCard>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}