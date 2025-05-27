"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import {
    Clock,
    Star,
    MapPin,
    Users,
    Calendar,
    Search,
    Heart,
    Camera,
    Utensils,
    Music,
    Sparkles,
    Zap,
    Rocket,
    Film,
    Trophy,
    AlertTriangle,
    Info,
    Timer,
    DollarSign,
    Lightbulb,
    Target
} from 'lucide-react'

interface Attraction {
    id: string
    name: string
    land: string
    type: string
    height: string
    rating: number
    waitTime: number
    description: string
    tips: string[]
    fastPass: boolean
    singleRider: boolean
    photoPass: boolean
    accessibility: string[]
    duration: string
    intensity: 'Low' | 'Moderate' | 'High' | 'Extreme'
    ageGroup: string[]
    bestTime: string[]
    icon: string
}

interface Restaurant {
    id: string
    name: string
    land: string
    type: string
    cuisine: string
    rating: number
    priceRange: string
    description: string
    signature: string[]
    reservations: boolean
    mobileOrder: boolean
    diningPlan: boolean
    accessibility: string[]
    hours: string
    tips: string[]
    icon: string
}

interface Entertainment {
    id: string
    name: string
    land: string
    type: string
    rating: number
    duration: string
    description: string
    showTimes: string[]
    tips: string[]
    accessibility: string[]
    ageGroup: string[]
    capacity: string
    icon: string
}

interface Land {
    id: string
    name: string
    theme: string
    description: string
    attractions: number
    dining: number
    shopping: number
    icon: string
    color: string
    tips: string[]
}

interface ParkHours {
    date: string
    open: string
    close: string
    earlyEntry: string
    extendedHours?: string
    special?: string
}

const attractions: Attraction[] = [
    {
        id: 'rise-resistance',
        name: 'Star Wars: Rise of the Resistance',
        land: 'Star Wars: Galaxy\'s Edge',
        type: 'Dark Ride',
        height: '40" (102cm)',
        rating: 4.9,
        waitTime: 120,
        description: 'Join the Resistance in an epic battle against the First Order in this groundbreaking attraction that combines multiple ride systems.',
        tips: [
            'Most popular attraction - arrive at rope drop or purchase Individual Lightning Lane',
            'Experience lasts about 15 minutes total',
            'Multiple pre-shows and ride vehicles',
            'Can be unreliable - have backup plans'
        ],
        fastPass: false,
        singleRider: true,
        photoPass: true,
        accessibility: ['Wheelchair Transfer', 'Audio Description', 'Assistive Listening'],
        duration: '15 minutes',
        intensity: 'Moderate',
        ageGroup: ['Teens', 'Adults'],
        bestTime: ['Rope Drop', 'Late Evening'],
        icon: '🚀'
    },
    {
        id: 'millennium-falcon',
        name: 'Millennium Falcon: Smugglers Run',
        land: 'Star Wars: Galaxy\'s Edge',
        type: 'Flight Simulator',
        height: '38" (97cm)',
        rating: 4.3,
        waitTime: 75,
        description: 'Take control of the fastest ship in the galaxy on a customized secret mission.',
        tips: [
            'Interactive experience - your performance affects the ride',
            'Pilot positions are most popular',
            'Single rider line available',
            'Great for Star Wars fans'
        ],
        fastPass: true,
        singleRider: true,
        photoPass: true,
        accessibility: ['Wheelchair Transfer', 'Audio Description'],
        duration: '5 minutes',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Morning', 'Evening'],
        icon: '🚁'
    },
    {
        id: 'mickey-runaway-railway',
        name: 'Mickey & Minnie\'s Runaway Railway',
        land: 'Hollywood Boulevard',
        type: 'Trackless Dark Ride',
        height: 'Any Height',
        rating: 4.5,
        waitTime: 85,
        description: 'Step into a Mickey Mouse cartoon for a zany adventure with state-of-the-art technology.',
        tips: [
            'No height requirement - great for families',
            'Trackless ride system',
            'Located in Chinese Theatre',
            'Popular with all ages'
        ],
        fastPass: true,
        singleRider: false,
        photoPass: true,
        accessibility: ['Wheelchair Accessible', 'Audio Description', 'Assistive Listening'],
        duration: '5 minutes',
        intensity: 'Low',
        ageGroup: ['Toddlers', 'Kids', 'Teens', 'Adults'],
        bestTime: ['Early Morning', 'Late Evening'],
        icon: '🐭'
    },
    {
        id: 'tower-terror',
        name: 'The Twilight Zone Tower of Terror',
        land: 'Sunset Boulevard',
        type: 'Drop Tower',
        height: '40" (102cm)',
        rating: 4.7,
        waitTime: 65,
        description: 'Enter the Hollywood Tower Hotel for a terrifying drop into the Twilight Zone.',
        tips: [
            'Multiple drop sequences - never the same twice',
            'Great theming and atmosphere',
            'Can be intense for some guests',
            'PhotoPass available at exit'
        ],
        fastPass: true,
        singleRider: false,
        photoPass: true,
        accessibility: ['Wheelchair Transfer', 'Audio Description'],
        duration: '10 minutes',
        intensity: 'High',
        ageGroup: ['Teens', 'Adults'],
        bestTime: ['Morning', 'Evening'],
        icon: '🏨'
    },
    {
        id: 'rock-roller-coaster',
        name: 'Rock \'n\' Roller Coaster Starring Aerosmith',
        land: 'Sunset Boulevard',
        type: 'Indoor Roller Coaster',
        height: '48" (122cm)',
        rating: 4.4,
        waitTime: 70,
        description: 'Launch from 0 to 57 mph in 2.8 seconds on this high-speed indoor coaster with Aerosmith soundtrack.',
        tips: [
            'Only upside-down coaster at Disney World',
            'Launches immediately - no slow climb',
            'Loud music throughout ride',
            'Will be rethemed to Muppets in the future'
        ],
        fastPass: true,
        singleRider: false,
        photoPass: true,
        accessibility: ['Wheelchair Transfer'],
        duration: '3 minutes',
        intensity: 'Extreme',
        ageGroup: ['Teens', 'Adults'],
        bestTime: ['Morning', 'Evening'],
        icon: '🎸'
    },
    {
        id: 'slinky-dog-dash',
        name: 'Slinky Dog Dash',
        land: 'Toy Story Land',
        type: 'Family Coaster',
        height: '38" (97cm)',
        rating: 4.2,
        waitTime: 90,
        description: 'Ride Slinky Dog through Andy\'s backyard on this family-friendly roller coaster.',
        tips: [
            'Great first coaster for kids',
            'Longest wait times in Toy Story Land',
            'Best views of park from top',
            'Very popular with families'
        ],
        fastPass: true,
        singleRider: false,
        photoPass: true,
        accessibility: ['Wheelchair Transfer', 'Audio Description'],
        duration: '2 minutes',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Rope Drop', 'Late Evening'],
        icon: '🐕'
    },
    {
        id: 'toy-story-mania',
        name: 'Toy Story Mania!',
        land: 'Toy Story Land',
        type: '3D Interactive Ride',
        height: 'Any Height',
        rating: 4.3,
        waitTime: 60,
        description: 'Play carnival games in 4D with your favorite Toy Story characters.',
        tips: [
            'Competitive scoring system',
            'Great for all ages',
            'Pull string hard for higher scores',
            'Multiple game scenes'
        ],
        fastPass: true,
        singleRider: false,
        photoPass: false,
        accessibility: ['Wheelchair Accessible', 'Audio Description'],
        duration: '7 minutes',
        intensity: 'Low',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Morning', 'Evening'],
        icon: '🎯'
    },
    {
        id: 'star-tours',
        name: 'Star Tours – The Adventures Continue',
        land: 'Echo Lake',
        type: '3D Flight Simulator',
        height: '40" (102cm)',
        rating: 4.0,
        waitTime: 35,
        description: 'Journey to different planets in the Star Wars universe on this motion simulator.',
        tips: [
            'Multiple storylines and destinations',
            'Recently updated with new sequences',
            'Motion sickness possible',
            'Classic Disney attraction'
        ],
        fastPass: true,
        singleRider: false,
        photoPass: false,
        accessibility: ['Wheelchair Transfer', 'Audio Description'],
        duration: '7 minutes',
        intensity: 'Moderate',
        ageGroup: ['Kids', 'Teens', 'Adults'],
        bestTime: ['Anytime'],
        icon: '🌌'
    },
    {
        id: 'alien-swirling-saucers',
        name: 'Alien Swirling Saucers',
        land: 'Toy Story Land',
        type: 'Spinning Ride',
        height: 'Any Height',
        rating: 3.5,
        waitTime: 45,
        description: 'Spin around with the little green aliens from Toy Story.',
        tips: [
            'Similar to Dumbo but with aliens',
            'Good for young children',
            'Can cause motion sickness',
            'Shorter ride experience'
        ],
        fastPass: true,
        singleRider: false,
        photoPass: false,
        accessibility: ['Wheelchair Transfer'],
        duration: '2 minutes',
        intensity: 'Low',
        ageGroup: ['Toddlers', 'Kids'],
        bestTime: ['Anytime'],
        icon: '👽'
    }
]

const restaurants: Restaurant[] = [
    {
        id: 'ogas-cantina',
        name: 'Oga\'s Cantina',
        land: 'Star Wars: Galaxy\'s Edge',
        type: 'Lounge',
        cuisine: 'Star Wars Themed',
        rating: 4.6,
        priceRange: '$$',
        description: 'The galaxy\'s most notorious watering hole with exotic drinks and galactic atmosphere.',
        signature: ['Fuzzy Tauntaun', 'Blue Bantha', 'Jedi Mind Trick'],
        reservations: true,
        mobileOrder: false,
        diningPlan: false,
        accessibility: ['Wheelchair Accessible'],
        hours: '9:00 AM - 9:00 PM',
        tips: [
            'Reservations essential - book 60 days out',
            '45-minute time limit',
            'Standing room only',
            'Unique alcoholic and non-alcoholic drinks'
        ],
        icon: '🍹'
    },
    {
        id: 'docking-bay-7',
        name: 'Docking Bay 7 Food and Cargo',
        land: 'Star Wars: Galaxy\'s Edge',
        type: 'Quick Service',
        cuisine: 'Star Wars Themed',
        rating: 4.2,
        priceRange: '$',
        description: 'Galactic cuisine from across the galaxy in a working spaceport.',
        signature: ['Fried Endorian Tip-Yip', 'Felucian Garden Spread', 'Blue Bantha Cookie'],
        reservations: false,
        mobileOrder: true,
        diningPlan: true,
        accessibility: ['Wheelchair Accessible'],
        hours: '9:00 AM - 9:00 PM',
        tips: [
            'Unique Star Wars themed food',
            'Mobile order recommended',
            'Try the blue milk',
            'Outdoor seating available'
        ],
        icon: '🚀'
    },
    {
        id: 'hollywood-brown-derby',
        name: 'The Hollywood Brown Derby',
        land: 'Hollywood Boulevard',
        type: 'Table Service',
        cuisine: 'American Fine Dining',
        rating: 4.4,
        priceRange: '$$$',
        description: 'Upscale dining inspired by the famous Hollywood restaurant with signature Cobb salad.',
        signature: ['Original Cobb Salad', 'Grapefruit Cake', 'Filet Mignon'],
        reservations: true,
        mobileOrder: false,
        diningPlan: true,
        accessibility: ['Wheelchair Accessible'],
        hours: '11:30 AM - 9:00 PM',
        tips: [
            'Famous for the original Cobb salad',
            'Elegant atmosphere',
            'Celebrity caricatures on walls',
            'Advance reservations recommended'
        ],
        icon: '🎩'
    },
    {
        id: 'sci-fi-dine-in',
        name: 'Sci-Fi Dine-In Theater Restaurant',
        land: 'Commissary Lane',
        type: 'Table Service',
        cuisine: 'American',
        rating: 4.1,
        priceRange: '$$',
        description: 'Dine in classic cars while watching B-movie sci-fi clips under the stars.',
        signature: ['Milkshakes', 'BBQ Ribs', 'Fried Chicken'],
        reservations: true,
        mobileOrder: false,
        diningPlan: true,
        accessibility: ['Wheelchair Accessible'],
        hours: '11:00 AM - 9:00 PM',
        tips: [
            'Unique car-themed seating',
            'Great atmosphere for families',
            'Limited conversation due to movie clips',
            'Popular for the experience'
        ],
        icon: '🚗'
    },
    {
        id: 'mama-melroses',
        name: 'Mama Melrose\'s Ristorante Italiano',
        land: 'Grand Avenue',
        type: 'Table Service',
        cuisine: 'Italian',
        rating: 3.9,
        priceRange: '$$',
        description: 'Family-style Italian restaurant with wood-fired pizzas and classic pasta dishes.',
        signature: ['Wood-fired Pizza', 'Chicken Parmigiana', 'Tiramisu'],
        reservations: true,
        mobileOrder: false,
        diningPlan: true,
        accessibility: ['Wheelchair Accessible'],
        hours: '11:30 AM - 9:00 PM',
        tips: [
            'Good for large groups',
            'Fantasmic! dining package available',
            'Authentic Italian atmosphere',
            'Wood-fired oven pizzas'
        ],
        icon: '🍕'
    },
    {
        id: 'woodys-lunch-box',
        name: 'Woody\'s Lunch Box',
        land: 'Toy Story Land',
        type: 'Quick Service',
        cuisine: 'American Comfort Food',
        rating: 4.0,
        priceRange: '$',
        description: 'Comfort food favorites served from Andy\'s lunch box in Toy Story Land.',
        signature: ['Totchos', 'BBQ Brisket Melt', 'Lunch Box Tart'],
        reservations: false,
        mobileOrder: true,
        diningPlan: true,
        accessibility: ['Wheelchair Accessible'],
        hours: '8:00 AM - 9:00 PM',
        tips: [
            'Try the famous Totchos',
            'Breakfast items available',
            'Limited seating',
            'Mobile order strongly recommended'
        ],
        icon: '🧸'
    },
    {
        id: 'roundup-rodeo-bbq',
        name: 'Roundup Rodeo BBQ',
        land: 'Toy Story Land',
        type: 'Table Service',
        cuisine: 'BBQ',
        rating: 4.2,
        priceRange: '$$',
        description: 'All-you-care-to-enjoy BBQ in a toy-themed Western setting.',
        signature: ['Smoked Brisket', 'Pulled Pork', 'Mac and Cheese'],
        reservations: true,
        mobileOrder: false,
        diningPlan: true,
        accessibility: ['Wheelchair Accessible'],
        hours: '11:00 AM - 9:00 PM',
        tips: [
            'All-you-care-to-enjoy format',
            'Great for families',
            'Toy-themed decor',
            'Good value for money'
        ],
        icon: '🤠'
    },
    {
        id: 'baseline-tap-house',
        name: 'BaseLine Tap House',
        land: 'Grand Avenue',
        type: 'Lounge',
        cuisine: 'Bar Snacks',
        rating: 4.3,
        priceRange: '$$',
        description: 'California-inspired craft beer and wine bar with small plates.',
        signature: ['Craft Beer Selection', 'Pretzel Bread', 'Charcuterie'],
        reservations: false,
        mobileOrder: false,
        diningPlan: false,
        accessibility: ['Wheelchair Accessible'],
        hours: '11:00 AM - 9:00 PM',
        tips: [
            'Great beer selection',
            'Outdoor seating',
            'Perfect for adults',
            'Small plates to share'
        ],
        icon: '🍺'
    }
]

const entertainment: Entertainment[] = [
    {
        id: 'fantasmic',
        name: 'Fantasmic!',
        land: 'Sunset Boulevard',
        type: 'Nighttime Spectacular',
        rating: 4.8,
        duration: '30 minutes',
        description: 'Mickey Mouse\'s imagination comes to life in this spectacular nighttime show with water, fire, and projections.',
        showTimes: ['9:00 PM'],
        tips: [
            'Arrive 45-60 minutes early for best seats',
            'Dining packages available',
            'Can be cancelled due to weather',
            'Bring cushions for concrete seating'
        ],
        accessibility: ['Wheelchair Accessible', 'Assistive Listening'],
        ageGroup: ['All Ages'],
        capacity: '6,900',
        icon: '🎆'
    },
    {
        id: 'indiana-jones-stunt',
        name: 'Indiana Jones Epic Stunt Spectacular!',
        land: 'Echo Lake',
        type: 'Stunt Show',
        rating: 4.5,
        duration: '30 minutes',
        description: 'Behind-the-scenes look at movie stunts with live action sequences from Indiana Jones films.',
        showTimes: ['10:45 AM', '12:00 PM', '1:15 PM', '3:15 PM', '4:30 PM'],
        tips: [
            'Arrive 15-20 minutes early',
            'Volunteers may be selected from audience',
            'Great for all ages',
            'Air-conditioned theater'
        ],
        accessibility: ['Wheelchair Accessible', 'Audio Description', 'Assistive Listening'],
        ageGroup: ['All Ages'],
        capacity: '2,000',
        icon: '🎬'
    },
    {
        id: 'beauty-beast',
        name: 'Beauty and the Beast - Live on Stage',
        land: 'Sunset Boulevard',
        type: 'Musical',
        rating: 4.3,
        duration: '25 minutes',
        description: 'Broadway-style musical retelling the tale as old as time with elaborate costumes and sets.',
        showTimes: ['11:00 AM', '1:00 PM', '2:00 PM', '4:00 PM', '5:00 PM'],
        tips: [
            'Popular with families',
            'Air-conditioned theater',
            'Beautiful costumes and sets',
            'Arrive 10-15 minutes early'
        ],
        accessibility: ['Wheelchair Accessible', 'Audio Description', 'Assistive Listening'],
        ageGroup: ['All Ages'],
        capacity: '1,500',
        icon: '🌹'
    },
    {
        id: 'frozen-singalong',
        name: 'For the First Time in Forever: A Frozen Sing-Along Celebration',
        land: 'Echo Lake',
        type: 'Sing-Along Show',
        rating: 4.2,
        duration: '25 minutes',
        description: 'Interactive sing-along celebration of Frozen with Anna, Elsa, and hilarious royal historians.',
        showTimes: ['9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:30 PM', '5:30 PM', '6:30 PM'],
        tips: [
            'Great for Frozen fans',
            'Interactive and fun',
            'Air-conditioned theater',
            'Multiple shows daily'
        ],
        accessibility: ['Wheelchair Accessible', 'Audio Description', 'Assistive Listening'],
        ageGroup: ['Kids', 'Families'],
        capacity: '1,000',
        icon: '❄️'
    },
    {
        id: 'little-mermaid-musical',
        name: 'The Little Mermaid – A Musical Adventure',
        land: 'Animation Courtyard',
        type: 'Musical',
        rating: 4.4,
        duration: '30 minutes',
        description: 'Fully reimagined theatrical production inspired by the classic Disney film with stunning effects.',
        showTimes: ['Coming Summer 2025'],
        tips: [
            'Brand new show opening Summer 2025',
            'Cutting-edge effects',
            'Musical numbers from the film',
            'Advance planning recommended'
        ],
        accessibility: ['Wheelchair Accessible', 'Audio Description', 'Assistive Listening'],
        ageGroup: ['All Ages'],
        capacity: '1,000',
        icon: '🧜‍♀️'
    },
    {
        id: 'villains-show',
        name: 'Disney Villains: Unfairly Ever After',
        land: 'Sunset Boulevard',
        type: 'Villains Show',
        rating: 4.0,
        duration: '25 minutes',
        description: 'New villains stage show featuring Cruella de Vil, Captain Hook, and Maleficent in the Magic Mirror realm.',
        showTimes: ['Coming Summer 2025'],
        tips: [
            'Brand new show opening Summer 2025',
            'Features live villain appearances',
            'Located in Sunset Showcase',
            'Perfect for villain fans'
        ],
        accessibility: ['Wheelchair Accessible', 'Audio Description', 'Assistive Listening'],
        ageGroup: ['All Ages'],
        capacity: '1,000',
        icon: '🦹‍♀️'
    },
    {
        id: 'disney-junior-play',
        name: 'Disney Junior Play and Dance!',
        land: 'Animation Courtyard',
        type: 'Interactive Show',
        rating: 4.1,
        duration: '20 minutes',
        description: 'Interactive show perfect for young children featuring Disney Junior characters.',
        showTimes: ['Multiple times daily'],
        tips: [
            'Perfect for toddlers and preschoolers',
            'Interactive dancing and singing',
            'Air-conditioned theater',
            'Characters may vary'
        ],
        accessibility: ['Wheelchair Accessible', 'Audio Description'],
        ageGroup: ['Toddlers', 'Preschoolers'],
        capacity: '400',
        icon: '🎵'
    }
]

const lands: Land[] = [
    {
        id: 'hollywood-boulevard',
        name: 'Hollywood Boulevard',
        theme: '1930s Hollywood',
        description: 'Step into the golden age of Hollywood with classic architecture and the iconic Chinese Theatre.',
        attractions: 2,
        dining: 3,
        shopping: 5,
        icon: '🎬',
        color: 'from-amber-400 to-orange-600',
        tips: [
            'Main entrance area with iconic Chinese Theatre',
            'Great photo opportunities',
            'Mickey & Minnie\'s Runaway Railway located here',
            'Shopping and dining options'
        ]
    },
    {
        id: 'sunset-boulevard',
        name: 'Sunset Boulevard',
        theme: 'Hollywood\'s Golden Age',
        description: 'Experience the glamour and excitement of classic Hollywood with thrilling attractions.',
        attractions: 3,
        dining: 4,
        shopping: 3,
        icon: '🌅',
        color: 'from-purple-400 to-pink-600',
        tips: [
            'Home to Tower of Terror and Rock \'n\' Roller Coaster',
            'Fantasmic! nighttime spectacular',
            'Beauty and the Beast show',
            'Great dining options'
        ]
    },
    {
        id: 'star-wars-galaxys-edge',
        name: 'Star Wars: Galaxy\'s Edge',
        theme: 'Planet Batuu',
        description: 'Live your own Star Wars story on the remote planet of Batuu.',
        attractions: 2,
        dining: 5,
        shopping: 4,
        icon: '⭐',
        color: 'from-blue-400 to-purple-600',
        tips: [
            'Most immersive land at Disney World',
            'Rise of the Resistance is most popular',
            'Build your own lightsaber at Savi\'s Workshop',
            'Oga\'s Cantina requires reservations'
        ]
    },
    {
        id: 'toy-story-land',
        name: 'Toy Story Land',
        theme: 'Andy\'s Backyard',
        description: 'Shrink down to toy size and play in Andy\'s backyard with your favorite Toy Story characters.',
        attractions: 3,
        dining: 2,
        shopping: 2,
        icon: '🧸',
        color: 'from-yellow-400 to-red-600',
        tips: [
            'Great for families with children',
            'Slinky Dog Dash is very popular',
            'Limited shade - bring sun protection',
            'Woody\'s Lunch Box for quick meals'
        ]
    },
    {
        id: 'echo-lake',
        name: 'Echo Lake',
        theme: 'Classic Hollywood',
        description: 'Enjoy classic attractions and shows around the peaceful Echo Lake.',
        attractions: 2,
        dining: 3,
        shopping: 2,
        icon: '🏞️',
        color: 'from-teal-400 to-blue-600',
        tips: [
            'Home to Indiana Jones stunt show',
            'Star Tours for Star Wars fans',
            'Frozen Sing-Along celebration',
            'Good area for shows and entertainment'
        ]
    },
    {
        id: 'grand-avenue',
        name: 'Grand Avenue',
        theme: 'Los Angeles Streets',
        description: 'Explore the streets of Los Angeles with Muppets-themed attractions and dining.',
        attractions: 1,
        dining: 3,
        shopping: 2,
        icon: '🏙️',
        color: 'from-green-400 to-teal-600',
        tips: [
            'MuppetVision 3D closing June 2025',
            'Will become Monsters Inc. land',
            'BaseLine Tap House for adults',
            'Great dining options'
        ]
    },
    {
        id: 'animation-courtyard',
        name: 'Animation Courtyard',
        theme: 'Disney Animation',
        description: 'Celebrate the art of Disney animation with character meet and greets and shows.',
        attractions: 1,
        dining: 1,
        shopping: 2,
        icon: '✏️',
        color: 'from-pink-400 to-purple-600',
        tips: [
            'Great for character meet and greets',
            'Disney Junior shows for young kids',
            'Little Mermaid show coming Summer 2025',
            'Less crowded area of park'
        ]
    }
]

const parkHours: ParkHours[] = [
    {
        date: 'Today',
        open: '9:00 AM',
        close: '9:00 PM',
        earlyEntry: '8:30 AM',
        special: 'Disney After Hours available select nights'
    },
    {
        date: 'Tomorrow',
        open: '9:00 AM',
        close: '10:00 PM',
        earlyEntry: '8:30 AM'
    },
    {
        date: 'This Weekend',
        open: '8:00 AM',
        close: '11:00 PM',
        earlyEntry: '7:30 AM',
        extendedHours: '11:00 PM - 1:00 AM'
    }
]

const tips = {
    planning: [
        'Arrive 45-60 minutes before official opening for rope drop',
        'Purchase Individual Lightning Lane for Rise of the Resistance',
        'Make dining reservations 60 days in advance',
        'Download the My Disney Experience app',
        'Consider Disney After Hours events for shorter wait times'
    ],
    attractions: [
        'Rise of the Resistance is the most popular - plan accordingly',
        'Single rider lines available for select attractions',
        'Height requirements vary - check before visiting',
        'Some attractions may close temporarily due to weather',
        'PhotoPass photographers available at major attractions'
    ],
    dining: [
        'Use mobile ordering to save time',
        'Oga\'s Cantina requires advance reservations',
        'Try unique Star Wars themed food in Galaxy\'s Edge',
        'Fantasmic! dining packages guarantee show seating',
        'Many restaurants offer plant-based options'
    ],
    shows: [
        'Arrive 15-30 minutes early for popular shows',
        'Fantasmic! can be cancelled due to weather',
        'Multiple shows daily for most entertainment',
        'Air-conditioned theaters provide relief from heat',
        'Some shows offer assistive listening devices'
    ],
    crowds: [
        'Weekdays are typically less crowded than weekends',
        'Early morning and late evening have shorter wait times',
        'Holidays and school breaks are busiest',
        'Use Lightning Lane Multi Pass for popular attractions',
        'Consider park hopping to avoid crowds'
    ],
    budget: [
        'Bring your own water bottle and snacks',
        'Look for Disney gift card discounts',
        'Consider staying off-property to save money',
        'Annual Passholders receive dining and merchandise discounts',
        'Free activities include character meet and greets'
    ]
}

export default function HollywoodStudiosPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLand, setSelectedLand] = useState('all')
    const [sortBy, setSortBy] = useState('rating')
    const [favorites, setFavorites] = useState<string[]>([])

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(fav => fav !== id)
                : [...prev, id]
        )
    }

    const filteredAttractions = attractions
        .filter(attraction => {
            const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attraction.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesLand = selectedLand === 'all' || attraction.land === selectedLand
            return matchesSearch && matchesLand
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating
                case 'waitTime':
                    return a.waitTime - b.waitTime
                case 'name':
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

    const filteredRestaurants = restaurants
        .filter(restaurant => {
            const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesLand = selectedLand === 'all' || restaurant.land === selectedLand
            return matchesSearch && matchesLand
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating
                case 'name':
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

    const filteredEntertainment = entertainment
        .filter(show => {
            const matchesSearch = show.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                show.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesLand = selectedLand === 'all' || show.land === selectedLand
            return matchesSearch && matchesLand
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating
                case 'name':
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <SparklesText className="text-5xl md:text-7xl font-bold text-white mb-6">
                            Disney&apos;s Hollywood Studios
                        </SparklesText>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Where the magic of movies comes to life in the most immersive theme park experience
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                    >
                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                            <div className="text-center">
                                <Film className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">
                                    <NumberTicker value={21} />
                                </div>
                                <p className="text-blue-100 text-sm">Attractions & Shows</p>
                            </div>
                            <BorderBeam size={250} duration={12} delay={9} />
                        </MagicCard>

                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                            <div className="text-center">
                                <Utensils className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">
                                    <NumberTicker value={35} />+
                                </div>
                                <p className="text-blue-100 text-sm">Dining Locations</p>
                            </div>
                            <BorderBeam size={250} duration={12} delay={9} />
                        </MagicCard>

                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                            <div className="text-center">
                                <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">
                                    <NumberTicker value={7} />
                                </div>
                                <p className="text-blue-100 text-sm">Themed Lands</p>
                            </div>
                            <BorderBeam size={250} duration={12} delay={9} />
                        </MagicCard>

                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                            <div className="text-center">
                                <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">
                                    <NumberTicker value={135} />
                                </div>
                                <p className="text-blue-100 text-sm">Acres of Magic</p>
                            </div>
                            <BorderBeam size={250} duration={12} delay={9} />
                        </MagicCard>
                    </motion.div>
                </div>
            </section>

            {/* Today's Hours & Alerts */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <Clock className="w-6 h-6 mr-2 text-blue-400" />
                                Today&apos;s Hours
                            </h3>
                            <div className="space-y-3">
                                {parkHours.map((hours, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-blue-100">{hours.date}</span>
                                        <div className="text-right">
                                            <div className="text-white font-semibold">
                                                {hours.open} - {hours.close}
                                            </div>
                                            <div className="text-sm text-blue-200">
                                                Early Entry: {hours.earlyEntry}
                                            </div>
                                            {hours.extendedHours && (
                                                <div className="text-sm text-green-300">
                                                    Extended Hours: {hours.extendedHours}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <BorderBeam size={250} duration={12} delay={9} />
                        </MagicCard>

                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <AlertTriangle className="w-6 h-6 mr-2 text-yellow-400" />
                                Park Alerts
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-white font-medium">MuppetVision 3D Closing</p>
                                        <p className="text-blue-200 text-sm">Final performances June 7, 2025</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-white font-medium">New Shows Coming Summer 2025</p>
                                        <p className="text-blue-200 text-sm">Little Mermaid Musical & Villains Show</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Timer className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-white font-medium">Disney After Hours</p>
                                        <p className="text-blue-200 text-sm">Select nights through September 2025</p>
                                    </div>
                                </div>
                            </div>
                            <BorderBeam size={250} duration={12} delay={9} />
                        </MagicCard>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="attractions" className="w-full">
                        <TabsList className="grid w-full grid-cols-6 mb-8 bg-white/10 backdrop-blur-sm">
                            <TabsTrigger value="attractions" className="data-[state=active]:bg-white/20">
                                Attractions
                            </TabsTrigger>
                            <TabsTrigger value="dining" className="data-[state=active]:bg-white/20">
                                Dining
                            </TabsTrigger>
                            <TabsTrigger value="entertainment" className="data-[state=active]:bg-white/20">
                                Entertainment
                            </TabsTrigger>
                            <TabsTrigger value="lands" className="data-[state=active]:bg-white/20">
                                Lands
                            </TabsTrigger>
                            <TabsTrigger value="tips" className="data-[state=active]:bg-white/20">
                                Tips
                            </TabsTrigger>
                            <TabsTrigger value="hours" className="data-[state=active]:bg-white/20">
                                Hours
                            </TabsTrigger>
                        </TabsList>

                        {/* Search and Filter Controls */}
                        <div className="mb-8 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search attractions, dining, or entertainment..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <Select value={selectedLand} onValueChange={setSelectedLand}>
                                    <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder="Select Land" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Lands</SelectItem>
                                        {lands.map(land => (
                                            <SelectItem key={land.id} value={land.name}>{land.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rating">Rating</SelectItem>
                                        <SelectItem value="waitTime">Wait Time</SelectItem>
                                        <SelectItem value="name">Name</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <TabsContent value="attractions" className="space-y-6">
                            <div className="grid gap-6">
                                {filteredAttractions.map((attraction, index) => (
                                    <motion.div
                                        key={attraction.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                                                                <span className="text-2xl mr-2">{attraction.icon}</span>
                                                                {attraction.name}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleFavorite(attraction.id)}
                                                                    className="ml-2 text-white hover:text-red-400"
                                                                >
                                                                    <Heart
                                                                        className={`w-4 h-4 ${favorites.includes(attraction.id) ? 'fill-red-400 text-red-400' : ''}`}
                                                                    />
                                                                </Button>
                                                            </h3>
                                                            <div className="flex items-center space-x-4 mb-2">
                                                                <Badge variant="secondary" className="bg-blue-600/50 text-white">
                                                                    {attraction.land}
                                                                </Badge>
                                                                <Badge variant="outline" className="border-white/30 text-white">
                                                                    {attraction.type}
                                                                </Badge>
                                                                <div className="flex items-center text-yellow-400">
                                                                    <Star className="w-4 h-4 fill-current mr-1" />
                                                                    <span className="text-white">{attraction.rating}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-4 text-sm text-blue-200 mb-4">
                                                                <span className="flex items-center">
                                                                    <Users className="w-4 h-4 mr-1" />
                                                                    {attraction.height}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Clock className="w-4 h-4 mr-1" />
                                                                    {attraction.duration}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Zap className="w-4 h-4 mr-1" />
                                                                    {attraction.intensity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-white mb-1">
                                                                {attraction.waitTime} min
                                                            </div>
                                                            <div className="text-sm text-blue-200">Current Wait</div>
                                                        </div>
                                                    </div>

                                                    <p className="text-blue-100 mb-4">{attraction.description}</p>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        {attraction.fastPass && (
                                                            <div className="flex items-center text-green-300">
                                                                <Zap className="w-4 h-4 mr-1" />
                                                                <span className="text-sm">Lightning Lane</span>
                                                            </div>
                                                        )}
                                                        {attraction.singleRider && (
                                                            <div className="flex items-center text-blue-300">
                                                                <Users className="w-4 h-4 mr-1" />
                                                                <span className="text-sm">Single Rider</span>
                                                            </div>
                                                        )}
                                                        {attraction.photoPass && (
                                                            <div className="flex items-center text-purple-300">
                                                                <Camera className="w-4 h-4 mr-1" />
                                                                <span className="text-sm">PhotoPass</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-white flex items-center">
                                                            <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                                                            Pro Tips
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {attraction.tips.map((tip, tipIndex) => (
                                                                <li key={tipIndex} className="text-sm text-blue-200 flex items-start">
                                                                    <span className="text-yellow-400 mr-2">•</span>
                                                                    {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <BorderBeam size={250} duration={12} delay={9} />
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="dining" className="space-y-6">
                            <div className="grid gap-6">
                                {filteredRestaurants.map((restaurant, index) => (
                                    <motion.div
                                        key={restaurant.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                                                                <span className="text-2xl mr-2">{restaurant.icon}</span>
                                                                {restaurant.name}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleFavorite(restaurant.id)}
                                                                    className="ml-2 text-white hover:text-red-400"
                                                                >
                                                                    <Heart
                                                                        className={`w-4 h-4 ${favorites.includes(restaurant.id) ? 'fill-red-400 text-red-400' : ''}`}
                                                                    />
                                                                </Button>
                                                            </h3>
                                                            <div className="flex items-center space-x-4 mb-2">
                                                                <Badge variant="secondary" className="bg-green-600/50 text-white">
                                                                    {restaurant.land}
                                                                </Badge>
                                                                <Badge variant="outline" className="border-white/30 text-white">
                                                                    {restaurant.type}
                                                                </Badge>
                                                                <div className="flex items-center text-yellow-400">
                                                                    <Star className="w-4 h-4 fill-current mr-1" />
                                                                    <span className="text-white">{restaurant.rating}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-4 text-sm text-blue-200 mb-4">
                                                                <span className="flex items-center">
                                                                    <DollarSign className="w-4 h-4 mr-1" />
                                                                    {restaurant.priceRange}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Utensils className="w-4 h-4 mr-1" />
                                                                    {restaurant.cuisine}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Clock className="w-4 h-4 mr-1" />
                                                                    {restaurant.hours}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-blue-100 mb-4">{restaurant.description}</p>

                                                    <div className="mb-4">
                                                        <h4 className="font-semibold text-white mb-2 flex items-center">
                                                            <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                                                            Signature Items
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {restaurant.signature.map((item, itemIndex) => (
                                                                <Badge key={itemIndex} variant="outline" className="border-yellow-400/50 text-yellow-300">
                                                                    {item}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        {restaurant.reservations && (
                                                            <div className="flex items-center text-green-300">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                <span className="text-sm">Reservations</span>
                                                            </div>
                                                        )}
                                                        {restaurant.mobileOrder && (
                                                            <div className="flex items-center text-blue-300">
                                                                <Zap className="w-4 h-4 mr-1" />
                                                                <span className="text-sm">Mobile Order</span>
                                                            </div>
                                                        )}
                                                        {restaurant.diningPlan && (
                                                            <div className="flex items-center text-purple-300">
                                                                <Star className="w-4 h-4 mr-1" />
                                                                <span className="text-sm">Dining Plan</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-white flex items-center">
                                                            <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                                                            Dining Tips
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {restaurant.tips.map((tip, tipIndex) => (
                                                                <li key={tipIndex} className="text-sm text-blue-200 flex items-start">
                                                                    <span className="text-yellow-400 mr-2">•</span>
                                                                    {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <BorderBeam size={250} duration={12} delay={9} />
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="entertainment" className="space-y-6">
                            <div className="grid gap-6">
                                {filteredEntertainment.map((show, index) => (
                                    <motion.div
                                        key={show.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                                                                <span className="text-2xl mr-2">{show.icon}</span>
                                                                {show.name}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleFavorite(show.id)}
                                                                    className="ml-2 text-white hover:text-red-400"
                                                                >
                                                                    <Heart
                                                                        className={`w-4 h-4 ${favorites.includes(show.id) ? 'fill-red-400 text-red-400' : ''}`}
                                                                    />
                                                                </Button>
                                                            </h3>
                                                            <div className="flex items-center space-x-4 mb-2">
                                                                <Badge variant="secondary" className="bg-purple-600/50 text-white">
                                                                    {show.land}
                                                                </Badge>
                                                                <Badge variant="outline" className="border-white/30 text-white">
                                                                    {show.type}
                                                                </Badge>
                                                                <div className="flex items-center text-yellow-400">
                                                                    <Star className="w-4 h-4 fill-current mr-1" />
                                                                    <span className="text-white">{show.rating}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-4 text-sm text-blue-200 mb-4">
                                                                <span className="flex items-center">
                                                                    <Clock className="w-4 h-4 mr-1" />
                                                                    {show.duration}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Users className="w-4 h-4 mr-1" />
                                                                    {show.capacity} capacity
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-blue-100 mb-4">{show.description}</p>

                                                    <div className="mb-4">
                                                        <h4 className="font-semibold text-white mb-2 flex items-center">
                                                            <Clock className="w-4 h-4 mr-2 text-blue-400" />
                                                            Show Times
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {show.showTimes.map((time, timeIndex) => (
                                                                <Badge key={timeIndex} variant="outline" className="border-blue-400/50 text-blue-300">
                                                                    {time}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-white flex items-center">
                                                            <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                                                            Show Tips
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {show.tips.map((tip, tipIndex) => (
                                                                <li key={tipIndex} className="text-sm text-blue-200 flex items-start">
                                                                    <span className="text-yellow-400 mr-2">•</span>
                                                                    {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <BorderBeam size={250} duration={12} delay={9} />
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="lands" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {lands.map((land, index) => (
                                    <motion.div
                                        key={land.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                                            <div className={`w-full h-32 bg-gradient-to-r ${land.color} rounded-lg mb-4 flex items-center justify-center`}>
                                                <span className="text-6xl">{land.icon}</span>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-2">{land.name}</h3>
                                            <p className="text-blue-200 text-sm mb-4">{land.theme}</p>
                                            <p className="text-blue-100 mb-4">{land.description}</p>

                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-white">{land.attractions}</div>
                                                    <div className="text-xs text-blue-200">Attractions</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-white">{land.dining}</div>
                                                    <div className="text-xs text-blue-200">Dining</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-white">{land.shopping}</div>
                                                    <div className="text-xs text-blue-200">Shopping</div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-white flex items-center">
                                                    <Target className="w-4 h-4 mr-2 text-yellow-400" />
                                                    Land Tips
                                                </h4>
                                                <ul className="space-y-1">
                                                    {land.tips.map((tip, tipIndex) => (
                                                        <li key={tipIndex} className="text-sm text-blue-200 flex items-start">
                                                            <span className="text-yellow-400 mr-2">•</span>
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <BorderBeam size={250} duration={12} delay={9} />
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {Object.entries(tips).map(([category, tipList], index) => (
                                    <motion.div
                                        key={category}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20 h-full">
                                            <h3 className="text-2xl font-bold text-white mb-4 capitalize flex items-center">
                                                {category === 'planning' && <Calendar className="w-6 h-6 mr-2 text-blue-400" />}
                                                {category === 'attractions' && <Rocket className="w-6 h-6 mr-2 text-purple-400" />}
                                                {category === 'dining' && <Utensils className="w-6 h-6 mr-2 text-green-400" />}
                                                {category === 'shows' && <Music className="w-6 h-6 mr-2 text-pink-400" />}
                                                {category === 'crowds' && <Users className="w-6 h-6 mr-2 text-orange-400" />}
                                                {category === 'budget' && <DollarSign className="w-6 h-6 mr-2 text-yellow-400" />}
                                                {category} Tips
                                            </h3>
                                            <ul className="space-y-3">
                                                {tipList.map((tip, tipIndex) => (
                                                    <li key={tipIndex} className="text-blue-100 flex items-start">
                                                        <Lightbulb className="w-4 h-4 mr-2 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                            <BorderBeam size={250} duration={12} delay={9} />
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="hours" className="space-y-6">
                            <div className="grid gap-6">
                                <MagicCard className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                                        <Clock className="w-6 h-6 mr-2 text-blue-400" />
                                        Park Hours & Special Events
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-xl font-semibold text-white mb-4">Regular Hours</h4>
                                            <div className="space-y-3">
                                                {parkHours.map((hours, index) => (
                                                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                        <span className="text-blue-100 font-medium">{hours.date}</span>
                                                        <div className="text-right">
                                                            <div className="text-white font-semibold">
                                                                {hours.open} - {hours.close}
                                                            </div>
                                                            <div className="text-sm text-blue-200">
                                                                Early Entry: {hours.earlyEntry}
                                                            </div>
                                                            {hours.extendedHours && (
                                                                <div className="text-sm text-green-300">
                                                                    Extended: {hours.extendedHours}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xl font-semibold text-white mb-4">Special Events</h4>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-purple-600/20 rounded-lg">
                                                    <h5 className="text-white font-semibold">Disney After Hours</h5>
                                                    <p className="text-purple-200 text-sm">Select nights through September 2025</p>
                                                    <p className="text-purple-100 text-sm">Shorter wait times, special character meet & greets</p>
                                                </div>
                                                <div className="p-3 bg-orange-600/20 rounded-lg">
                                                    <h5 className="text-white font-semibold">Disney Jollywood Nights</h5>
                                                    <p className="text-orange-200 text-sm">Holiday season 2025 (dates TBA)</p>
                                                    <p className="text-orange-100 text-sm">Holiday-themed entertainment and treats</p>
                                                </div>
                                                <div className="p-3 bg-green-600/20 rounded-lg">
                                                    <h5 className="text-white font-semibold">Extended Evening Hours</h5>
                                                    <p className="text-green-200 text-sm">Select nights for Deluxe Resort guests</p>
                                                    <p className="text-green-100 text-sm">Extra 2 hours after regular park closing</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <BorderBeam size={250} duration={12} delay={9} />
                                </MagicCard>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <AnimatedGradientText className="text-4xl md:text-5xl font-bold mb-6">
                            🎬 Ready for Your Hollywood Adventure? 🌟
                        </AnimatedGradientText>
                        <p className="text-xl text-blue-100 mb-8">
                            Experience the magic of movies and immerse yourself in the most technologically advanced theme park at Walt Disney World
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <RainbowButton className="px-8 py-3">
                                Plan Your Visit
                            </RainbowButton>
                            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                                View Park Map
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}