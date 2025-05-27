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
    TreePine,
    Clock,
    Star,
    Users,
    MapPin,
    Utensils,
    Camera,
    Zap,
    Heart,
    Sparkles,
    Mountain,
    Wand2,
    Info,
    AlertTriangle,
    Timer,
    Music,
    IceCream,
    Sun,
    PawPrint,
    Globe,
    Train,
    Bug
} from 'lucide-react'

interface Attraction {
    id: string
    name: string
    land: string
    type: 'thrill' | 'family' | 'kids' | 'show' | 'trail'
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
    type: 'parade' | 'fireworks' | 'show' | 'character-meet' | 'projection'
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

const animalKingdomAttractions: Attraction[] = [
    {
        id: 'avatar-flight-passage',
        name: 'Avatar Flight of Passage',
        land: 'Pandora - The World of Avatar',
        type: 'thrill',
        waitTime: 120,
        lightningLane: true,
        height: '44" (112 cm)',
        description: 'Soar on the back of a mountain banshee over the breathtaking world of Pandora in this groundbreaking 3D flight simulator.',
        tips: [
            'Most popular attraction - get Lightning Lane or arrive at rope drop',
            'Incredible 3D experience with realistic banshee breathing',
            'Not suitable for those with motion sickness or fear of heights',
            'Practice vehicle available at entrance for larger guests'
        ],
        rating: 4.9,
        duration: '4:30',
        accessibility: ['Must transfer from wheelchair', 'Height restriction applies'],
        fastFacts: [
            'Opened in 2017',
            'Uses cutting-edge flight simulation technology',
            'Features bioluminescent Pandora landscapes',
            'Recorded with London Symphony Orchestra'
        ]
    },
    {
        id: 'navi-river-journey',
        name: "Na'vi River Journey",
        land: 'Pandora - The World of Avatar',
        type: 'family',
        waitTime: 75,
        lightningLane: true,
        description: 'Journey through a bioluminescent rainforest on a mystical river to encounter the Na\'vi Shaman of Songs.',
        tips: [
            'Beautiful boat ride through glowing Pandora',
            'Great for all ages and families',
            'Stunning animatronic Shaman figure',
            'Best experienced after dark when Pandora glows'
        ],
        rating: 4.3,
        duration: '4:30',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'Opened in 2017',
            'Features advanced animatronics',
            'Bioluminescent plants react to guests',
            'Peaceful boat ride experience'
        ]
    },
    {
        id: 'kilimanjaro-safaris',
        name: 'Kilimanjaro Safaris',
        land: 'Africa',
        type: 'family',
        waitTime: 45,
        lightningLane: true,
        description: 'Embark on an authentic African safari adventure to see real animals including lions, elephants, giraffes, and rhinos.',
        tips: [
            'Best in early morning or late afternoon when animals are active',
            'Sit on left side for better animal viewing',
            'Bring camera with zoom lens',
            'Each safari is different - animals roam freely'
        ],
        rating: 4.6,
        duration: '18:00',
        accessibility: ['Wheelchair accessible', 'Service animals permitted'],
        fastFacts: [
            'Opening day attraction (1998)',
            '110-acre savanna',
            'Over 34 species of animals',
            'Authentic African baobab trees'
        ]
    },
    {
        id: 'expedition-everest',
        name: 'Expedition Everest',
        land: 'Asia',
        type: 'thrill',
        waitTime: 60,
        lightningLane: true,
        height: '44" (112 cm)',
        description: 'Race through the Himalayas on a high-speed train and encounter the legendary Yeti on this thrilling roller coaster.',
        tips: [
            'Tallest mountain at Walt Disney World',
            'Backwards section adds unique thrill',
            'Single rider line available',
            'Great views of park from queue'
        ],
        rating: 4.5,
        duration: '3:30',
        accessibility: ['Must transfer from wheelchair', 'Height restriction applies'],
        fastFacts: [
            'Opened in 2006',
            '199 feet tall',
            'Cost $100 million to build',
            'Features elaborate Yeti animatronic'
        ]
    },
    {
        id: 'dinosaur',
        name: 'DINOSAUR',
        land: 'DinoLand U.S.A.',
        type: 'thrill',
        waitTime: 35,
        lightningLane: false,
        height: '40" (102 cm)',
        description: 'Travel back 65 million years to rescue an Iguanodon before the meteor that killed the dinosaurs strikes.',
        tips: [
            'Dark ride with sudden movements and loud sounds',
            'Not suitable for young children',
            'Enhanced motion vehicle creates realistic experience',
            'Based on Disney\'s Dinosaur movie'
        ],
        rating: 4.1,
        duration: '3:30',
        accessibility: ['Must transfer from wheelchair', 'Height restriction applies'],
        fastFacts: [
            'Opened in 1998',
            'Originally called Countdown to Extinction',
            'Features time travel storyline',
            'Advanced motion simulation technology'
        ]
    },
    {
        id: 'kali-river-rapids',
        name: 'Kali River Rapids',
        land: 'Asia',
        type: 'thrill',
        waitTime: 40,
        lightningLane: false,
        height: '38" (97 cm)',
        description: 'Navigate raging rapids through a lush Asian rainforest on this thrilling white-water raft adventure.',
        tips: [
            'You will get soaked - bring poncho or change of clothes',
            'Often opens late and closes early',
            'Lockers available for belongings',
            'Best on hot days for cooling off'
        ],
        rating: 3.9,
        duration: '5:00',
        accessibility: ['Must transfer from wheelchair', 'Height restriction applies'],
        fastFacts: [
            'Opened in 1999',
            'Environmental conservation message',
            '12-person circular rafts',
            'Seasonal operation'
        ]
    },
    {
        id: 'festival-lion-king',
        name: 'Festival of the Lion King',
        land: 'Africa',
        type: 'show',
        waitTime: 0,
        lightningLane: false,
        description: 'Celebrate the Circle of Life with Simba, Timon, and Pumbaa in this spectacular musical theater show.',
        tips: [
            'One of the best shows at Disney World',
            'Arrive 30 minutes early for good seats',
            'Interactive show with audience participation',
            'Air conditioned theater'
        ],
        rating: 4.8,
        duration: '30:00',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'Opened in 1998',
            'Features live performers and puppets',
            'Based on The Lion King movie',
            'Theater-in-the-round format'
        ]
    },
    {
        id: 'gorilla-falls-trail',
        name: 'Gorilla Falls Exploration Trail',
        land: 'Africa',
        type: 'trail',
        waitTime: 0,
        lightningLane: false,
        description: 'Walk through lush African landscapes to observe gorillas, hippos, exotic birds, and other African wildlife.',
        tips: [
            'Self-paced walking trail',
            'Best when animals are active (morning/evening)',
            'Bring camera for close-up animal photos',
            'Educational information throughout'
        ],
        rating: 4.2,
        duration: '25:00',
        accessibility: ['Wheelchair accessible', 'Service animals permitted'],
        fastFacts: [
            'Opening day attraction (1998)',
            'Features Western Lowland Gorillas',
            'Multiple animal habitats',
            'Research and conservation focus'
        ]
    }
]

const animalKingdomDining: DiningLocation[] = [
    {
        id: 'tusker-house',
        name: 'Tusker House Restaurant',
        type: 'table-service',
        land: 'Africa',
        cuisine: 'African-Inspired Buffet',
        priceRange: '$$$',
        rating: 4.4,
        signature: ['Donald Duck character dining', 'African-spiced dishes', 'Jungle Juice'],
        reservations: true,
        description: 'Enjoy an African-inspired buffet with Donald Duck and friends in this vibrant restaurant themed to an African marketplace.'
    },
    {
        id: 'tiffins',
        name: 'Tiffins',
        type: 'table-service',
        land: 'Discovery Island',
        cuisine: 'Global Cuisine',
        priceRange: '$$$$',
        rating: 4.6,
        signature: ['Signature dining', 'Artistic atmosphere', 'Global flavors'],
        reservations: true,
        description: 'Upscale dining featuring globally-inspired dishes in an elegant setting adorned with concept art and artifacts.'
    },
    {
        id: 'yak-yeti',
        name: 'Yak & Yeti Restaurant',
        land: 'Asia',
        type: 'table-service',
        cuisine: 'Asian Fusion',
        priceRange: '$$$',
        rating: 4.1,
        signature: ['Ahi Tuna Nachos', 'Crispy Mahi Mahi', 'Asian fusion cuisine'],
        reservations: true,
        description: 'Asian fusion restaurant in a Nepalese-themed setting near Expedition Everest with indoor and outdoor seating.'
    },
    {
        id: 'flame-tree-bbq',
        name: 'Flame Tree Barbecue',
        type: 'quick-service',
        land: 'Discovery Island',
        cuisine: 'American BBQ',
        priceRange: '$$',
        rating: 4.3,
        signature: ['Smoked ribs', 'Pulled pork', 'Waterfront seating'],
        reservations: false,
        description: 'Outdoor barbecue restaurant with scenic waterfront seating overlooking the Discovery River.'
    },
    {
        id: 'satu-li-canteen',
        name: "Satu'li Canteen",
        type: 'quick-service',
        land: 'Pandora - The World of Avatar',
        cuisine: 'Healthy Bowls',
        priceRange: '$$',
        rating: 4.2,
        signature: ['Customizable bowls', 'Healthy options', 'Pandora theming'],
        reservations: false,
        description: 'Healthy, customizable bowls with proteins, bases, and sauces in the beautiful Pandora setting.'
    },
    {
        id: 'harambe-market',
        name: 'Harambe Market',
        type: 'quick-service',
        land: 'Africa',
        cuisine: 'African Street Food',
        priceRange: '$$',
        rating: 4.0,
        signature: ['African-spiced chicken', 'Ribs', 'Street food atmosphere'],
        reservations: false,
        description: 'Outdoor marketplace offering African-inspired street food in an authentic village setting.'
    }
]

const animalKingdomEntertainment: Entertainment[] = [
    {
        id: 'tree-life-awakenings',
        name: 'Tree of Life Awakenings',
        type: 'projection',
        times: ['Dusk until park close'],
        duration: '3:00',
        location: 'Discovery Island',
        description: 'Magical projection show that brings the Tree of Life to life with stories of animals and nature.',
        tips: [
            'Multiple short shows throughout evening',
            'No set schedule - happens continuously',
            'Best viewed from Discovery Island',
            'Different animal stories rotate'
        ]
    },
    {
        id: 'finding-nemo-musical',
        name: 'Finding Nemo: The Big Blue... and Beyond!',
        type: 'show',
        times: ['Multiple times daily'],
        duration: '40:00',
        location: 'DinoLand U.S.A.',
        description: 'Broadway-style musical featuring Nemo, Dory, and friends with spectacular puppetry and music.',
        tips: [
            'Arrive 30 minutes early for good seats',
            'One of Disney\'s best stage shows',
            'Air conditioned theater',
            'Great for all ages'
        ]
    },
    {
        id: 'up-bird-adventure',
        name: 'UP! A Great Bird Adventure',
        type: 'show',
        times: ['Multiple times daily'],
        duration: '25:00',
        location: 'Asia',
        description: 'Live bird show featuring Russell and Dug from UP! with exotic birds from around the world.',
        tips: [
            'Outdoor amphitheater show',
            'Features real exotic birds',
            'Educational and entertaining',
            'May be cancelled in bad weather'
        ]
    },
    {
        id: 'character-greetings',
        name: 'Character Greetings',
        type: 'character-meet',
        times: ['Throughout park hours'],
        duration: '5:00',
        location: 'Various locations',
        description: 'Meet Disney characters including Mickey, Minnie, Donald, and unique Animal Kingdom characters.',
        tips: [
            'Check My Disney Experience app for times',
            'PhotoPass photographers available',
            'Some characters unique to Animal Kingdom',
            'Lines shorter in late afternoon'
        ]
    }
]

const currentParkHours: ParkHours[] = [
    { date: 'Today', open: '8:00 AM', close: '6:00 PM', earlyEntry: '7:30 AM' },
    { date: 'Tomorrow', open: '8:00 AM', close: '7:00 PM', earlyEntry: '7:30 AM' },
    { date: 'Wednesday', open: '8:00 AM', close: '6:00 PM', earlyEntry: '7:30 AM' },
    { date: 'Thursday', open: '8:00 AM', close: '6:00 PM', earlyEntry: '7:30 AM' },
    { date: 'Friday', open: '8:00 AM', close: '7:00 PM', earlyEntry: '7:30 AM' },
    { date: 'Saturday', open: '8:00 AM', close: '8:00 PM', earlyEntry: '7:30 AM' },
    { date: 'Sunday', open: '8:00 AM', close: '7:00 PM', earlyEntry: '7:30 AM' }
]

const parkStats = {
    totalAttractions: 18,
    averageWaitTime: 35,
    crowdLevel: 6,
    weatherTemp: 82,
    weatherCondition: 'Sunny'
}

const lands = [
    { name: 'Discovery Island', icon: <TreePine className="h-4 w-4" />, color: 'bg-green-500' },
    { name: 'Pandora - The World of Avatar', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500' },
    { name: 'Africa', icon: <PawPrint className="h-4 w-4" />, color: 'bg-orange-500' },
    { name: 'Asia', icon: <Mountain className="h-4 w-4" />, color: 'bg-red-500' },
    { name: 'DinoLand U.S.A.', icon: <Bug className="h-4 w-4" />, color: 'bg-purple-500' },
    { name: "Rafiki's Planet Watch", icon: <Train className="h-4 w-4" />, color: 'bg-yellow-500' }
]

export default function AnimalKingdomPage() {
    const [selectedLand, setSelectedLand] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'wait-time' | 'rating' | 'name'>('wait-time')

    const filteredAttractions = animalKingdomAttractions
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-green-950 dark:via-blue-950 dark:to-orange-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white">
                <div className="absolute inset-0 bg-black/20" />
                <Meteors number={20} />

                <div className="relative container mx-auto px-6 py-16">
                    <BlurFade delay={0.1}>
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <TreePine className="h-12 w-12" />
                                <SparklesText className="text-5xl font-bold">
                                    Disney&apos;s Animal Kingdom
                                </SparklesText>
                            </div>
                            <p className="text-xl text-green-100 max-w-3xl mx-auto">
                                Welcome to a magical kingdom where animals, adventure, and Disney storytelling come together.
                                Experience the wonder of nature and the thrill of discovery in Disney&apos;s wildest theme park.
                            </p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.totalAttractions} />
                                        </div>
                                        <div className="text-sm text-green-100">Attractions</div>
                                    </div>
                                </MagicCard>
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.averageWaitTime} />m
                                        </div>
                                        <div className="text-sm text-green-100">Avg Wait</div>
                                    </div>
                                </MagicCard>
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.crowdLevel} />/10
                                        </div>
                                        <div className="text-sm text-green-100">Crowd Level</div>
                                    </div>
                                </MagicCard>
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.weatherTemp} />°F
                                        </div>
                                        <div className="text-sm text-green-100">Temperature</div>
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
                                <Clock className="h-6 w-6 text-green-600" />
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
                                    Animal Kingdom typically has the shortest hours of all Disney parks
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
                                        <strong>Hot Tip!</strong> Kilimanjaro Safaris closes early - check times
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <Timer className="h-4 w-4" />
                                    <AlertDescription>
                                        Avatar Flight of Passage has longest waits - get Lightning Lane
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <Sun className="h-4 w-4" />
                                    <AlertDescription>
                                        Best animal viewing in early morning and late afternoon
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
                                                                    attraction.type === 'family' ? 'default' :
                                                                        attraction.type === 'show' ? 'secondary' : 'outline'}
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
                                                        <div className="text-2xl font-bold text-green-600">
                                                            {attraction.waitTime || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {attraction.waitTime ? 'min wait' : 'show times'}
                                                        </div>
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
                                {animalKingdomDining.map((restaurant, index) => (
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
                                {animalKingdomEntertainment.map((show, index) => (
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
                                                            {animalKingdomAttractions
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
                                                            {animalKingdomDining
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
                                        Essential Animal Kingdom Tips
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Early Arrival:</strong> Animals are most active in the morning - arrive at rope drop
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Avatar Priority:</strong> Get Lightning Lane for Flight of Passage or arrive first thing
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Safari Strategy:</strong> Kilimanjaro Safaris closes early - check times daily
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Show Planning:</strong> Festival of the Lion King is a must-do - arrive 30 minutes early
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Pandora at Night:</strong> Stay late to see Pandora&apos;s bioluminescence come alive
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
                                            <h4 className="font-semibold text-green-600 mb-2">Optimal Animal Viewing</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Early morning (park opening)</li>
                                                <li>• Late afternoon (2-3 hours before close)</li>
                                                <li>• Cooler, overcast days</li>
                                                <li>• Avoid midday heat</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-orange-600 mb-2">Crowd Patterns</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Lightest crowds: Weekdays in off-season</li>
                                                <li>• Busiest: Weekends and holidays</li>
                                                <li>• Peak times: 11 AM - 2 PM</li>
                                                <li>• Best strategy: Early arrival or late afternoon</li>
                                            </ul>
                                        </div>
                                    </div>
                                </MagicCard>

                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Camera className="h-5 w-5 text-green-600" />
                                        Photography Tips
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Safari Photography:</strong> Bring zoom lens and sit on left side of vehicle
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Pandora Magic:</strong> Best photos after sunset when everything glows
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Tree of Life:</strong> Multiple angles available - walk around for best shots
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Animal Trails:</strong> Be patient and quiet for best wildlife photos
                                            </div>
                                        </li>
                                    </ul>
                                </MagicCard>

                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-red-600" />
                                        Conservation & Education
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Disney Conservation Fund:</strong> Learn about real conservation efforts
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Educational Opportunities:</strong> Talk to animal care specialists on trails
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Rafiki&apos;s Planet Watch:</strong> Behind-the-scenes look at animal care
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Conservation Station:</strong> Interactive exhibits about wildlife protection
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