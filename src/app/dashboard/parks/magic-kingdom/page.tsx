"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Magic UI Components
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Meteors } from '@/components/magicui/meteors'
import { NumberTicker } from '@/components/magicui/number-ticker'

// Icons
import {
    Castle,
    Clock,
    Star,
    Users,
    MapPin,
    Utensils,
    Camera,
    Zap,
    Crown,
    Sparkles,
    Rocket,
    Mountain,
    Ghost,
    Ship,
    Wand2,
    Info,
    AlertTriangle,
    Timer,
    PartyPopper,
    Music,
    Gift,
    IceCream,
    ShoppingBag,
    Baby,
    Accessibility,
    Volume2
} from 'lucide-react'

interface Attraction {
    id: string
    name: string
    land: string
    type: 'thrill' | 'family' | 'kids' | 'show'
    waitTime: number
    lightningLane: boolean
    height?: string
    description: string
    tips: string[]
    rating: number
    duration: string
    accessibility: string[]
    fastFacts: string[]
}

interface DiningLocation {
    id: string
    name: string
    type: 'table-service' | 'quick-service' | 'snack'
    land: string
    cuisine: string
    priceRange: '$' | '$$' | '$$$' | '$$$$'
    rating: number
    signature: string[]
    reservations: boolean
    description: string
}

interface Entertainment {
    id: string
    name: string
    type: 'parade' | 'fireworks' | 'show' | 'character-meet'
    times: string[]
    duration: string
    location: string
    description: string
    tips: string[]
}

interface ParkHours {
    date: string
    open: string
    close: string
    earlyEntry?: string
    extendedHours?: string
}

const magicKingdomAttractions: Attraction[] = [
    {
        id: 'space-mountain',
        name: 'Space Mountain',
        land: 'Tomorrowland',
        type: 'thrill',
        waitTime: 75,
        lightningLane: true,
        height: '44" (112 cm)',
        description: 'Blast off on a thrilling indoor roller coaster through the cosmos in complete darkness.',
        tips: [
            'Best experienced at park opening or late evening',
            'Single rider line available',
            'Very dark - not suitable for those afraid of the dark',
            'Smooth ride despite being vintage'
        ],
        rating: 4.5,
        duration: '2:30',
        accessibility: ['Must transfer from wheelchair', 'Service animals not permitted'],
        fastFacts: [
            'Opened in 1975',
            'Completely enclosed roller coaster',
            'Features synchronized soundtrack',
            'One of the most popular attractions'
        ]
    },
    {
        id: 'seven-dwarfs-mine-train',
        name: 'Seven Dwarfs Mine Train',
        land: 'Fantasyland',
        type: 'family',
        waitTime: 90,
        lightningLane: true,
        height: '38" (97 cm)',
        description: 'Join the Seven Dwarfs on a musical adventure through their diamond mine on swaying mine cars.',
        tips: [
            'Most popular family coaster - get Lightning Lane',
            'Cars sway side to side for unique experience',
            'Great for first-time coaster riders',
            'Beautiful animatronics inside the mine'
        ],
        rating: 4.7,
        duration: '2:30',
        accessibility: ['Must transfer from wheelchair', 'Assistive listening available'],
        fastFacts: [
            'Opened in 2014',
            'Features swaying mine cars',
            'Advanced Audio-Animatronics',
            'Part of New Fantasyland expansion'
        ]
    },
    {
        id: 'tiana-bayou-adventure',
        name: "Tiana's Bayou Adventure",
        land: 'Frontierland',
        type: 'thrill',
        waitTime: 120,
        lightningLane: true,
        height: '40" (102 cm)',
        description: 'Join Princess Tiana and Louis on a musical adventure through the bayou as you prepare for a Mardi Gras celebration.',
        tips: [
            'Newest attraction - expect very long waits',
            'Virtual queue may be required',
            'You will get wet - especially in front seats',
            'Story follows Princess and the Frog'
        ],
        rating: 4.8,
        duration: '11:00',
        accessibility: ['Must transfer from wheelchair', 'Audio description available'],
        fastFacts: [
            'Opened in 2024',
            'Replaced Splash Mountain',
            'Features 17 Audio-Animatronic figures',
            'Includes new original song'
        ]
    },
    {
        id: 'haunted-mansion',
        name: 'The Haunted Mansion',
        land: 'Liberty Square',
        type: 'family',
        waitTime: 45,
        lightningLane: true,
        description: 'Tour a ghostly manor filled with 999 happy haunts in this classic dark ride.',
        tips: [
            'Classic Disney attraction - must do',
            'Not scary for most children',
            'Pay attention to portrait gallery',
            'Look for hidden details throughout'
        ],
        rating: 4.6,
        duration: '9:00',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'Opened in 1971',
            '999 happy haunts',
            'Doom Buggies transport system',
            'Holiday overlay during Christmas'
        ]
    },
    {
        id: 'pirates-caribbean',
        name: 'Pirates of the Caribbean',
        land: 'Adventureland',
        type: 'family',
        waitTime: 35,
        lightningLane: false,
        description: 'Set sail with Captain Jack Sparrow on a swashbuckling adventure through pirate-infested waters.',
        tips: [
            'Classic boat ride with amazing detail',
            'Front row gets slightly wet',
            'Look for Captain Jack Sparrow',
            'Great for all ages'
        ],
        rating: 4.4,
        duration: '8:30',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'Opened in 1973',
            'Inspired the movie franchise',
            'Features Audio-Animatronics',
            'Boat ride through pirate scenes'
        ]
    },
    {
        id: 'big-thunder-mountain',
        name: 'Big Thunder Mountain Railroad',
        land: 'Frontierland',
        type: 'family',
        waitTime: 55,
        lightningLane: true,
        height: '40" (102 cm)',
        description: 'Race through a haunted mining cavern aboard a runaway mine train in the wildest ride in the wilderness.',
        tips: [
            'Great starter coaster for kids',
            'Sit on right side for better views',
            'Look for goats on the mountain',
            'Smooth family-friendly thrills'
        ],
        rating: 4.3,
        duration: '3:30',
        accessibility: ['Must transfer from wheelchair', 'Assistive listening available'],
        fastFacts: [
            'Opened in 1980',
            'Wildest ride in the wilderness',
            'Built around natural rock formations',
            'Features mining town theming'
        ]
    },
    {
        id: 'peter-pan-flight',
        name: "Peter Pan's Flight",
        land: 'Fantasyland',
        type: 'family',
        waitTime: 65,
        lightningLane: true,
        description: 'Soar over London and Neverland aboard a flying pirate ship with Peter Pan, Wendy, and Tinker Bell.',
        tips: [
            'Consistently long waits - get Lightning Lane',
            'Flying over London is magical',
            'Great for young children',
            'Classic Fantasyland dark ride'
        ],
        rating: 4.2,
        duration: '2:45',
        accessibility: ['Must transfer from wheelchair', 'Audio description available'],
        fastFacts: [
            'Opened in 1971',
            'Suspended dark ride',
            'Flies over miniature London',
            'Based on Disney\'s Peter Pan'
        ]
    },
    {
        id: 'jungle-cruise',
        name: 'Jungle Cruise',
        land: 'Adventureland',
        type: 'family',
        waitTime: 40,
        lightningLane: true,
        description: 'Embark on a guided boat tour through exotic jungles filled with dangerous animals and corny jokes.',
        tips: [
            'Skipper jokes make each ride unique',
            'Great for all ages',
            'Inspired the movie with The Rock',
            'Classic opening day attraction'
        ],
        rating: 4.1,
        duration: '10:00',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'Opening day attraction (1971)',
            'Famous for skipper puns',
            'Inspired Jungle Cruise movie',
            'Features animatronic animals'
        ]
    }
]

const magicKingdomDining: DiningLocation[] = [
    {
        id: 'be-our-guest',
        name: 'Be Our Guest Restaurant',
        type: 'table-service',
        land: 'Fantasyland',
        cuisine: 'French',
        priceRange: '$$$',
        rating: 4.3,
        signature: ['Beast\'s Castle setting', 'Enchanted Rose', 'Grey Stuff dessert'],
        reservations: true,
        description: 'Dine in the Beast\'s enchanted castle with three themed dining rooms and French-inspired cuisine.'
    },
    {
        id: 'cinderella-royal-table',
        name: 'Cinderella\'s Royal Table',
        type: 'table-service',
        land: 'Fantasyland',
        cuisine: 'American',
        priceRange: '$$$$',
        rating: 4.1,
        signature: ['Princess character dining', 'Castle location', 'Royal treatment'],
        reservations: true,
        description: 'Dine like royalty inside Cinderella Castle with Disney Princesses in this premium character dining experience.'
    },
    {
        id: 'crystal-palace',
        name: 'The Crystal Palace',
        type: 'table-service',
        land: 'Main Street U.S.A.',
        cuisine: 'American Buffet',
        priceRange: '$$$',
        rating: 4.0,
        signature: ['Winnie the Pooh characters', 'Victorian greenhouse setting', 'All-you-care-to-eat buffet'],
        reservations: true,
        description: 'Victorian-style restaurant featuring Winnie the Pooh and friends with an extensive buffet.'
    },
    {
        id: 'dole-whip',
        name: 'Aloha Isle',
        type: 'snack',
        land: 'Adventureland',
        cuisine: 'Snacks',
        priceRange: '$',
        rating: 4.8,
        signature: ['Original Dole Whip', 'Pineapple float', 'Tropical treats'],
        reservations: false,
        description: 'Home of the famous Dole Whip soft-serve and other tropical treats in Adventureland.'
    },
    {
        id: 'pecos-bill',
        name: 'Pecos Bill Tall Tale Inn and Cafe',
        type: 'quick-service',
        land: 'Frontierland',
        cuisine: 'Tex-Mex',
        priceRange: '$$',
        rating: 3.8,
        signature: ['Loaded nachos', 'Toppings bar', 'Western theming'],
        reservations: false,
        description: 'Western-themed quick-service restaurant featuring Tex-Mex cuisine with an extensive toppings bar.'
    },
    {
        id: 'plaza-restaurant',
        name: 'The Plaza Restaurant',
        type: 'table-service',
        land: 'Main Street U.S.A.',
        cuisine: 'American',
        priceRange: '$$',
        rating: 3.9,
        signature: ['Main Street location', 'Classic American fare', 'Fried chicken'],
        reservations: true,
        description: 'Turn-of-the-century restaurant on Main Street serving classic American comfort food.'
    }
]

const magicKingdomEntertainment: Entertainment[] = [
    {
        id: 'happily-ever-after',
        name: 'Happily Ever After',
        type: 'fireworks',
        times: ['9:00 PM'],
        duration: '18:00',
        location: 'Cinderella Castle',
        description: 'Spectacular fireworks show featuring Disney stories projected on Cinderella Castle with soaring music.',
        tips: [
            'Arrive 60-90 minutes early for best spots',
            'Main Street offers great views',
            'Dessert parties available for premium viewing',
            'Show may be cancelled due to weather'
        ]
    },
    {
        id: 'disney-starlight-parade',
        name: 'Disney Starlight: Dream the Night Away',
        type: 'parade',
        times: ['8:00 PM'],
        duration: '20:00',
        location: 'Main Street U.S.A. to Frontierland',
        description: 'New nighttime parade featuring beloved Disney characters with dazzling lights and music.',
        tips: [
            'New for 2025!',
            'Stake out spots 45 minutes early',
            'Frontierland has fewer crowds',
            'Features characters from Encanto, Frozen, Moana'
        ]
    },
    {
        id: 'festival-of-fantasy',
        name: 'Disney Festival of Fantasy Parade',
        type: 'parade',
        times: ['3:00 PM'],
        duration: '12:00',
        location: 'Frontierland to Main Street U.S.A.',
        description: 'Colorful daytime parade celebrating Disney stories with elaborate floats and costumes.',
        tips: [
            'Best daytime parade at Disney World',
            'Maleficent dragon breathes fire',
            'Great photo opportunities',
            'Runs daily when weather permits'
        ]
    },
    {
        id: 'mickey-meet-greet',
        name: 'Meet Mickey at Town Square Theater',
        type: 'character-meet',
        times: ['9:00 AM - 9:00 PM'],
        duration: '5:00',
        location: 'Main Street U.S.A.',
        description: 'Meet Mickey Mouse in his magician outfit at the historic Town Square Theater.',
        tips: [
            'PhotoPass photographers available',
            'Mickey speaks and interacts',
            'Air conditioned location',
            'Great for first Disney visit'
        ]
    }
]

const currentParkHours: ParkHours[] = [
    { date: 'Today', open: '9:00 AM', close: '10:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Tomorrow', open: '9:00 AM', close: '11:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Wednesday', open: '9:00 AM', close: '10:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Thursday', open: '9:00 AM', close: '9:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Friday', open: '9:00 AM', close: '11:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Saturday', open: '8:00 AM', close: '12:00 AM', earlyEntry: '7:30 AM' },
    { date: 'Sunday', open: '8:00 AM', close: '11:00 PM', earlyEntry: '7:30 AM' }
]

const parkStats = {
    totalAttractions: 25,
    averageWaitTime: 45,
    crowdLevel: 7,
    weatherTemp: 78,
    weatherCondition: 'Partly Cloudy'
}

const lands = [
    { name: 'Main Street U.S.A.', icon: <Castle className="h-4 w-4" />, color: 'bg-red-500' },
    { name: 'Adventureland', icon: <Ship className="h-4 w-4" />, color: 'bg-green-500' },
    { name: 'Frontierland', icon: <Mountain className="h-4 w-4" />, color: 'bg-orange-500' },
    { name: 'Liberty Square', icon: <Ghost className="h-4 w-4" />, color: 'bg-purple-500' },
    { name: 'Fantasyland', icon: <Crown className="h-4 w-4" />, color: 'bg-pink-500' },
    { name: 'Tomorrowland', icon: <Rocket className="h-4 w-4" />, color: 'bg-blue-500' }
]

export default function MagicKingdomPage() {
    const [selectedLand, setSelectedLand] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'wait-time' | 'rating' | 'name'>('wait-time')

    const filteredAttractions = magicKingdomAttractions
        .filter(attraction => selectedLand === 'all' || attraction.land === selectedLand)
        .sort((a, b) => {
            switch (sortBy) {
                case 'wait-time':
                    return b.waitTime - a.waitTime
                case 'rating':
                    return b.rating - a.rating
                case 'name':
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                <div className="absolute inset-0 bg-black/20" />
                <Meteors number={20} />

                <div className="relative container mx-auto px-6 py-16">
                    <BlurFade delay={0.1}>
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Castle className="h-12 w-12" />
                                <SparklesText className="text-5xl font-bold">
                                    Magic Kingdom
                                </SparklesText>
                            </div>
                            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                                The Most Magical Place on Earth awaits! Experience classic Disney magic, thrilling attractions,
                                and unforgettable moments in Walt Disney World&apos;s flagship theme park.
                            </p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.totalAttractions} />
                                        </div>
                                        <div className="text-sm text-blue-100">Attractions</div>
                                    </div>
                                </MagicCard>
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.averageWaitTime} />m
                                        </div>
                                        <div className="text-sm text-blue-100">Avg Wait</div>
                                    </div>
                                </MagicCard>
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.crowdLevel} />/10
                                        </div>
                                        <div className="text-sm text-blue-100">Crowd Level</div>
                                    </div>
                                </MagicCard>
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.weatherTemp} />°F
                                        </div>
                                        <div className="text-sm text-blue-100">Temperature</div>
                                    </div>
                                </MagicCard>
                            </div>
                        </div>
                    </BlurFade>
                </div>
            </div>

            {/* Park Hours & Important Info */}
            <div className="container mx-auto px-6 py-8">
                <BlurFade delay={0.2}>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Today's Hours */}
                        <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                            <BorderBeam size={250} duration={12} delay={9} />
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="h-6 w-6 text-blue-600" />
                                <h3 className="text-xl font-semibold">Today&apos;s Hours</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Early Entry (Resort Guests)</span>
                                    <Badge variant="secondary">{currentParkHours[0].earlyEntry}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Park Hours</span>
                                    <Badge variant="default">
                                        {currentParkHours[0].open} - {currentParkHours[0].close}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="text-sm text-muted-foreground">
                                    <Info className="h-4 w-4 inline mr-2" />
                                    Early entry available 30 minutes before official opening for Disney Resort guests
                                </div>
                            </div>
                        </MagicCard>

                        {/* Important Alerts */}
                        <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                                <h3 className="text-xl font-semibold">Park Alerts</h3>
                            </div>
                            <div className="space-y-3">
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>New!</strong> Disney Starlight parade debuts summer 2025
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <Timer className="h-4 w-4" />
                                    <AlertDescription>
                                        Tiana&apos;s Bayou Adventure may require virtual queue during peak times
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <PartyPopper className="h-4 w-4" />
                                    <AlertDescription>
                                        Mickey&apos;s Very Merry Christmas Party select nights Nov-Dec
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </MagicCard>
                    </div>
                </BlurFade>

                {/* Main Content Tabs */}
                <BlurFade delay={0.3}>
                    <Tabs defaultValue="attractions" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                            <TabsTrigger value="attractions" className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Attractions
                            </TabsTrigger>
                            <TabsTrigger value="dining" className="flex items-center gap-2">
                                <Utensils className="h-4 w-4" />
                                Dining
                            </TabsTrigger>
                            <TabsTrigger value="entertainment" className="flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                Shows
                            </TabsTrigger>
                            <TabsTrigger value="lands" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Lands
                            </TabsTrigger>
                            <TabsTrigger value="tips" className="flex items-center gap-2">
                                <Wand2 className="h-4 w-4" />
                                Tips
                            </TabsTrigger>
                        </TabsList>

                        {/* Attractions Tab */}
                        <TabsContent value="attractions" className="space-y-6">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={selectedLand === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedLand('all')}
                                    >
                                        All Lands
                                    </Button>
                                    {lands.map((land) => (
                                        <Button
                                            key={land.name}
                                            variant={selectedLand === land.name ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedLand(land.name)}
                                            className="flex items-center gap-2"
                                        >
                                            {land.icon}
                                            {land.name}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={sortBy === 'wait-time' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSortBy('wait-time')}
                                    >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Wait Time
                                    </Button>
                                    <Button
                                        variant={sortBy === 'rating' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSortBy('rating')}
                                    >
                                        <Star className="h-4 w-4 mr-2" />
                                        Rating
                                    </Button>
                                </div>
                            </div>

                            {/* Attractions Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAttractions.map((attraction, index) => (
                                    <motion.div
                                        key={attraction.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg mb-2">{attraction.name}</CardTitle>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {attraction.land}
                                                            </Badge>
                                                            <Badge
                                                                variant={attraction.type === 'thrill' ? 'destructive' :
                                                                    attraction.type === 'family' ? 'default' : 'outline'}
                                                                className="text-xs"
                                                            >
                                                                {attraction.type}
                                                            </Badge>
                                                            {attraction.lightningLane && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Zap className="h-3 w-3 mr-1" />
                                                                    LL
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                {attraction.rating}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Timer className="h-4 w-4" />
                                                                {attraction.duration}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {attraction.waitTime}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">min wait</div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {attraction.description}
                                                </p>
                                                {attraction.height && (
                                                    <div className="flex items-center gap-2 mb-3 text-sm">
                                                        <Users className="h-4 w-4 text-orange-500" />
                                                        <span>Height requirement: {attraction.height}</span>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-semibold">Pro Tips:</h5>
                                                    <ul className="text-xs text-muted-foreground space-y-1">
                                                        {attraction.tips.slice(0, 2).map((tip, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <Sparkles className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Dining Tab */}
                        <TabsContent value="dining" className="space-y-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {magicKingdomDining.map((restaurant, index) => (
                                    <motion.div
                                        key={restaurant.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="secondary">{restaurant.land}</Badge>
                                                            <Badge variant="outline">{restaurant.type}</Badge>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-sm">{restaurant.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-green-600">
                                                            {restaurant.priceRange}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {restaurant.reservations ? 'Reservations' : 'Walk-up'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {restaurant.description}
                                                </p>
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-semibold">Signature Items:</h5>
                                                    <ul className="text-xs text-muted-foreground space-y-1">
                                                        {restaurant.signature.map((item, i) => (
                                                            <li key={i} className="flex items-center gap-2">
                                                                <IceCream className="h-3 w-3 text-pink-500" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Entertainment Tab */}
                        <TabsContent value="entertainment" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {magicKingdomEntertainment.map((show, index) => (
                                    <motion.div
                                        key={show.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{show.name}</CardTitle>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="secondary">{show.location}</Badge>
                                                            <Badge variant="outline">{show.type}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-semibold text-purple-600">
                                                            {show.duration}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">duration</div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {show.description}
                                                </p>
                                                <div className="space-y-3">
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-2">Show Times:</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {show.times.map((time, i) => (
                                                                <Badge key={i} variant="outline">
                                                                    {time}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-2">Tips:</h5>
                                                        <ul className="text-xs text-muted-foreground space-y-1">
                                                            {show.tips.slice(0, 2).map((tip, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <Sparkles className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                                                    {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Lands Tab */}
                        <TabsContent value="lands" className="space-y-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lands.map((land, index) => (
                                    <motion.div
                                        key={land.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${land.color} text-white`}>
                                                        {land.icon}
                                                    </div>
                                                    <CardTitle className="text-lg">{land.name}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-2">Key Attractions:</h5>
                                                        <ul className="text-sm text-muted-foreground space-y-1">
                                                            {magicKingdomAttractions
                                                                .filter(attraction => attraction.land === land.name)
                                                                .slice(0, 3)
                                                                .map((attraction, i) => (
                                                                    <li key={i} className="flex items-center gap-2">
                                                                        <Star className="h-3 w-3 text-yellow-500" />
                                                                        {attraction.name}
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-2">Dining Options:</h5>
                                                        <ul className="text-sm text-muted-foreground space-y-1">
                                                            {magicKingdomDining
                                                                .filter(restaurant => restaurant.land === land.name)
                                                                .slice(0, 2)
                                                                .map((restaurant, i) => (
                                                                    <li key={i} className="flex items-center gap-2">
                                                                        <Utensils className="h-3 w-3 text-green-500" />
                                                                        {restaurant.name}
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Tips Tab */}
                        <TabsContent value="tips" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Wand2 className="h-5 w-5 text-purple-600" />
                                        Essential Magic Kingdom Tips
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Arrive Early:</strong> Be at the park 30-60 minutes before opening for rope drop
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Lightning Lane Strategy:</strong> Book Seven Dwarfs Mine Train or Tiana&apos;s Bayou Adventure first
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Parade Viewing:</strong> Stake out spots 45-60 minutes early for Festival of Fantasy
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Dining Reservations:</strong> Book 60 days in advance (Disney Resort guests get extra 10 days)
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Mobile Order:</strong> Use the Disney app to skip lines at quick-service restaurants
                                            </div>
                                        </li>
                                    </ul>
                                </MagicCard>

                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        Best Times to Visit
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-green-600 mb-2">Low Crowd Times</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Mid-January to mid-March</li>
                                                <li>• Late April to mid-May</li>
                                                <li>• Mid-September to mid-November</li>
                                                <li>• Weekdays during school year</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-red-600 mb-2">Avoid These Times</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Christmas/New Year weeks</li>
                                                <li>• Easter week</li>
                                                <li>• Summer months (June-August)</li>
                                                <li>• Major holiday weekends</li>
                                            </ul>
                                        </div>
                                    </div>
                                </MagicCard>

                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Baby className="h-5 w-5 text-pink-600" />
                                        Family-Friendly Features
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Baby className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Baby Care Centers:</strong> Located near Crystal Palace with changing tables, nursing areas
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Rider Switch:</strong> Available on attractions with height requirements
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Accessibility className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Accessibility:</strong> Most attractions wheelchair accessible or transfer required
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Volume2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Assistive Listening:</strong> Available at most shows and attractions
                                            </div>
                                        </li>
                                    </ul>
                                </MagicCard>

                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-orange-600" />
                                        Shopping & Souvenirs
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Gift className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Emporium:</strong> Main Street&apos;s largest shop with classic Disney merchandise
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Crown className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Bibbidi Bobbidi Boutique:</strong> Princess makeovers in Fantasyland
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Camera className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>PhotoPass:</strong> Professional photos at key locations throughout the park
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <ShoppingBag className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Package Delivery:</strong> Send purchases to your resort or park exit
                                            </div>
                                        </li>
                                    </ul>
                                </MagicCard>
                            </div>
                        </TabsContent>
                    </Tabs>
                </BlurFade>
            </div>
        </div>
    )
}