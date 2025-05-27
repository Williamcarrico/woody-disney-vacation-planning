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
    Globe as GlobeIcon,
    Clock,
    Star,
    Users,
    MapPin,
    Utensils,
    Zap,
    Sparkles,
    Rocket,
    Wand2,
    Info,
    AlertTriangle,
    Timer,
    Music,
    IceCream,
    Palette,
    Leaf,
    Cog,
    Flag
} from 'lucide-react'

interface Attraction {
    id: string
    name: string
    neighborhood: string
    type: 'thrill' | 'family' | 'kids' | 'show' | 'experience'
    waitTime: number
    lightningLane: boolean
    height?: string
    description: string
    tips: string[]
    rating: number
    duration: string
    accessibility: string[]
    fastFacts: string[]
    status?: 'open' | 'closed' | 'coming-soon'
}

interface DiningLocation {
    id: string
    name: string
    type: 'table-service' | 'quick-service' | 'snack' | 'festival-booth'
    neighborhood: string
    cuisine: string
    priceRange: '$' | '$$' | '$$$' | '$$$$'
    rating: number
    signature: string[]
    reservations: boolean
    description: string
}

interface Festival {
    id: string
    name: string
    dates: string
    description: string
    highlights: string[]
    foodBooths: number
    entertainment: string[]
    status: 'active' | 'upcoming' | 'ended'
}

interface Entertainment {
    id: string
    name: string
    type: 'fireworks' | 'show' | 'character-meet' | 'concert' | 'street-performance' | 'cultural-experience' | 'educational' | 'seasonal'
    category: 'nighttime-spectacular' | 'pavilion-show' | 'character-experience' | 'live-music' | 'cultural-presentation' | 'educational-film' | 'interactive-experience' | 'seasonal-event'
    times: string[]
    duration: string
    location: string
    neighborhood: string
    description: string
    detailedDescription: string
    tips: string[]
    rating: number
    capacity?: number
    ageRecommendation: string
    accessibility: string[]
    fastFacts: string[]
    seasonality?: 'year-round' | 'seasonal' | 'festival-only' | 'holiday-only'
    weatherDependent: boolean
    reservationRequired: boolean
    diningPackageAvailable: boolean
    photoPassIncluded: boolean
    languages?: string[]
    specialEffects: string[]
    bestViewingSpots: string[]
    crowdLevel: 'low' | 'moderate' | 'high' | 'very-high'
    status: 'active' | 'seasonal' | 'coming-soon' | 'temporarily-closed'
    characters?: string[]
    musicGenre?: string
    culturalFocus?: string
    educationalTopics?: string[]
    interactiveElements?: string[]
    merchandise?: string[]
    relatedAttractions?: string[]
}

interface ParkHours {
    date: string
    open: string
    close: string
    earlyEntry?: string
    extendedHours?: string
}

const epcotAttractions: Attraction[] = [
    {
        id: 'guardians-galaxy',
        name: 'Guardians of the Galaxy: Cosmic Rewind',
        neighborhood: 'World Discovery',
        type: 'thrill',
        waitTime: 85,
        lightningLane: true,
        height: '42" (107 cm)',
        description: 'Join the Guardians on an intergalactic chase through space and time on this innovative indoor coaster.',
        tips: [
            'One of the best attractions at Disney World',
            'Rotating vehicles provide 360-degree views',
            'Features awesome soundtrack from the movies',
            'Virtual queue may be required during peak times'
        ],
        rating: 4.9,
        duration: '2:30',
        accessibility: ['Must transfer from wheelchair', 'Audio description available'],
        fastFacts: [
            'Opened in 2022',
            'First reverse-launch coaster at Disney',
            'Features rotating vehicles',
            'One of the longest indoor coasters'
        ]
    },
    {
        id: 'test-track',
        name: 'Test Track 3.0',
        neighborhood: 'World Discovery',
        type: 'thrill',
        waitTime: 0,
        lightningLane: true,
        height: '40" (102 cm)',
        description: 'Experience the evolution of transportation through six themed exhibits before testing your vehicle at high speeds.',
        tips: [
            'Completely reimagined for 2025',
            'New story celebrates human innovation',
            'Features outdoor high-speed section',
            'Single rider line available'
        ],
        rating: 4.6,
        duration: '4:30',
        accessibility: ['Must transfer from wheelchair', 'Assistive listening available'],
        fastFacts: [
            'Reopening late summer 2025',
            'Third iteration of the attraction',
            'Sponsored by General Motors',
            'Reaches speeds up to 65 mph'
        ],
        status: 'coming-soon'
    },
    {
        id: 'frozen-ever-after',
        name: 'Frozen Ever After',
        neighborhood: 'World Showcase - Norway',
        type: 'family',
        waitTime: 70,
        lightningLane: true,
        description: 'Journey to Arendelle and join Anna, Elsa, and Olaf in this magical boat ride through the kingdom.',
        tips: [
            'Very popular - get Lightning Lane',
            'Features all your favorite Frozen songs',
            'Beautiful animatronics and effects',
            'Great for Frozen fans of all ages'
        ],
        rating: 4.4,
        duration: '5:00',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'Opened in 2016',
            'Located in Norway Pavilion',
            'Features advanced animatronics',
            'Replaced Maelstrom attraction'
        ]
    },
    {
        id: 'remy-ratatouille',
        name: "Remy's Ratatouille Adventure",
        neighborhood: 'World Showcase - France',
        type: 'family',
        waitTime: 55,
        lightningLane: true,
        description: 'Shrink down to the size of a rat and scurry through Gusteau\'s restaurant in this 4D trackless adventure.',
        tips: [
            'Trackless ride system creates unique experience',
            '4D effects include scents and water',
            'Great for families with young children',
            'Single rider line available'
        ],
        rating: 4.3,
        duration: '4:30',
        accessibility: ['Must transfer from wheelchair', 'Audio description available'],
        fastFacts: [
            'Opened in 2021',
            'Clone of Disneyland Paris attraction',
            'Trackless ride system',
            'Features 4D effects'
        ]
    },
    {
        id: 'spaceship-earth',
        name: 'Spaceship Earth',
        neighborhood: 'World Celebration',
        type: 'family',
        waitTime: 25,
        lightningLane: false,
        description: 'Journey through the history of human communication in EPCOT\'s iconic geodesic sphere.',
        tips: [
            'Classic EPCOT attraction - must do',
            'Great for all ages',
            'Interactive finale with touch screens',
            'New Spaceship Earth Lounge opening 2025'
        ],
        rating: 4.2,
        duration: '15:00',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'EPCOT\'s icon since 1982',
            'Geodesic sphere design',
            'Features time machine vehicles',
            'Narrated by Judi Dench'
        ]
    },
    {
        id: 'soarin',
        name: 'Soarin\' Around the World',
        neighborhood: 'World Nature',
        type: 'family',
        waitTime: 40,
        lightningLane: true,
        height: '40" (102 cm)',
        description: 'Soar above iconic landmarks from around the world in this breathtaking flight simulator.',
        tips: [
            'Sit in the middle for best experience',
            'Features scents and wind effects',
            'Updated with new finale scene',
            'Great for all ages'
        ],
        rating: 4.5,
        duration: '5:30',
        accessibility: ['Must transfer from wheelchair', 'Audio description available'],
        fastFacts: [
            'Updated in 2016',
            'Features locations worldwide',
            'Hang-gliding simulation',
            'IMAX-style projection'
        ]
    },
    {
        id: 'living-with-land',
        name: 'Living with the Land',
        neighborhood: 'World Nature',
        type: 'experience',
        waitTime: 15,
        lightningLane: false,
        description: 'Explore innovative farming techniques and sustainable agriculture on this peaceful boat tour.',
        tips: [
            'Educational and relaxing',
            'See real growing experiments',
            'Great for learning about sustainability',
            'Hidden Mickeys throughout'
        ],
        rating: 4.1,
        duration: '14:00',
        accessibility: ['Wheelchair accessible', 'Audio description available'],
        fastFacts: [
            'Opening day attraction (1982)',
            'Features real growing labs',
            'Boat ride through greenhouses',
            'Educational focus on agriculture'
        ]
    },
    {
        id: 'mission-space',
        name: 'Mission: SPACE',
        neighborhood: 'World Discovery',
        type: 'thrill',
        waitTime: 30,
        lightningLane: true,
        height: '44" (112 cm)',
        description: 'Train like an astronaut and experience a mission to Mars in this intense space simulator.',
        tips: [
            'Choose Orange (intense) or Green (less intense)',
            'Orange mission has spinning centrifuge',
            'Green mission is family-friendly',
            'Not recommended if prone to motion sickness'
        ],
        rating: 3.9,
        duration: '5:00',
        accessibility: ['Must transfer from wheelchair', 'Service animals not permitted'],
        fastFacts: [
            'Opened in 2003',
            'Two different experiences',
            'Centrifuge creates G-forces',
            'Sponsored by HP Enterprise'
        ]
    }
]

const epcotDining: DiningLocation[] = [
    {
        id: 'space-220',
        name: 'Space 220 Restaurant',
        type: 'table-service',
        neighborhood: 'World Discovery',
        cuisine: 'Contemporary American',
        priceRange: '$$$$',
        rating: 4.2,
        signature: ['Space elevator experience', 'Views of Earth', 'Unique atmosphere'],
        reservations: true,
        description: 'Dine 220 miles above Earth in this immersive space-themed restaurant with stunning views.'
    },
    {
        id: 'monsieur-paul',
        name: 'Monsieur Paul',
        type: 'table-service',
        neighborhood: 'World Showcase - France',
        cuisine: 'French Fine Dining',
        priceRange: '$$$$',
        rating: 4.7,
        signature: ['Michelin-quality cuisine', 'Elegant atmosphere', 'Wine pairings'],
        reservations: true,
        description: 'Upscale French restaurant offering exquisite cuisine and an extensive wine selection.'
    },
    {
        id: 'le-cellier',
        name: 'Le Cellier Steakhouse',
        type: 'table-service',
        neighborhood: 'World Showcase - Canada',
        cuisine: 'Steakhouse',
        priceRange: '$$$',
        rating: 4.5,
        signature: ['Canadian cheddar cheese soup', 'Premium steaks', 'Wine cellar atmosphere'],
        reservations: true,
        description: 'Canadian-themed steakhouse known for its famous cheese soup and premium cuts of meat.'
    },
    {
        id: 'akershus',
        name: 'Akershus Royal Banquet Hall',
        type: 'table-service',
        neighborhood: 'World Showcase - Norway',
        cuisine: 'Norwegian',
        priceRange: '$$$',
        rating: 4.1,
        signature: ['Princess character dining', 'Norwegian buffet', 'Castle setting'],
        reservations: true,
        description: 'Princess character dining experience in a medieval castle setting with Norwegian cuisine.'
    },
    {
        id: 'sunshine-seasons',
        name: 'Sunshine Seasons',
        type: 'quick-service',
        neighborhood: 'World Nature',
        cuisine: 'International',
        priceRange: '$$',
        rating: 4.0,
        signature: ['Fresh ingredients', 'Multiple food stations', 'Healthy options'],
        reservations: false,
        description: 'Food court-style restaurant featuring fresh, seasonal ingredients from multiple cuisines.'
    },
    {
        id: 'school-bread',
        name: 'Kringla Bakeri Og Kafe',
        type: 'snack',
        neighborhood: 'World Showcase - Norway',
        cuisine: 'Norwegian Pastries',
        priceRange: '$',
        rating: 4.6,
        signature: ['School Bread', 'Norwegian pastries', 'Sweet pretzels'],
        reservations: false,
        description: 'Authentic Norwegian bakery famous for its School Bread and traditional pastries.'
    }
]

const epcotFestivals: Festival[] = [
    {
        id: 'festival-arts',
        name: 'EPCOT International Festival of the Arts',
        dates: 'January 17 - February 24, 2025',
        description: 'Celebrate creativity with visual arts, culinary arts, and performing arts throughout the park.',
        highlights: [
            'Disney on Broadway Concert Series',
            'Figment\'s Brush with the Masters scavenger hunt',
            'Paint-by-number murals',
            'Artful food and beverages'
        ],
        foodBooths: 15,
        entertainment: ['Disney on Broadway concerts', 'Street performers', 'Art demonstrations'],
        status: 'active'
    },
    {
        id: 'flower-garden',
        name: 'EPCOT International Flower & Garden Festival',
        dates: 'March 5 - June 2, 2025',
        description: 'Experience stunning topiaries, beautiful gardens, and fresh flavors during this springtime celebration.',
        highlights: [
            'Disney character topiaries',
            'Butterfly garden',
            'Garden Rocks Concert Series',
            'Outdoor kitchens with fresh cuisine'
        ],
        foodBooths: 20,
        entertainment: ['Garden Rocks concerts', 'Spike\'s Pollen-Nation Exploration'],
        status: 'upcoming'
    },
    {
        id: 'food-wine',
        name: 'EPCOT International Food & Wine Festival',
        dates: 'July - November 2025',
        description: 'Taste your way around the world with global marketplaces and culinary demonstrations.',
        highlights: [
            'Global marketplace booths',
            'Eat to the Beat Concert Series',
            'Remy\'s Ratatouille Hide & Squeak',
            'Emile\'s Fromage Montage'
        ],
        foodBooths: 35,
        entertainment: ['Eat to the Beat concerts', 'Celebrity chef demonstrations'],
        status: 'upcoming'
    },
    {
        id: 'festival-holidays',
        name: 'EPCOT International Festival of the Holidays',
        dates: 'November - December 2025',
        description: 'Celebrate holiday traditions from around the world with storytellers, food, and festivities.',
        highlights: [
            'Candlelight Processional',
            'Holiday storytellers',
            'Holiday cookie stroll',
            'Seasonal decorations'
        ],
        foodBooths: 15,
        entertainment: ['Candlelight Processional', 'Holiday storytellers', 'Joyful! concerts'],
        status: 'upcoming'
    }
]

const epcotEntertainment: Entertainment[] = [
    {
        id: 'luminous',
        name: 'Luminous: The Symphony of Us',
        type: 'fireworks',
        category: 'nighttime-spectacular',
        times: ['9:00 PM', '10:00 PM (Weekends)'],
        duration: '17:00',
        location: 'World Showcase Lagoon',
        neighborhood: 'World Showcase',
        description: 'EPCOT\'s newest nighttime spectacular celebrating the connections that unite us all.',
        detailedDescription: 'Luminous: The Symphony of Us is a breathtaking nighttime spectacular that combines fireworks, fountains, lasers, and music to tell the story of how we are all connected. The show features an original musical score performed by a live orchestra, with stunning pyrotechnics launched from multiple locations around World Showcase Lagoon. The experience celebrates the diversity of cultures represented in EPCOT while highlighting our shared humanity and the bonds that unite us across the globe.',
        tips: [
            'New show debuted in December 2023',
            'Best viewing from World Showcase Promenade between Italy and Germany',
            'Fireworks dining packages available at select restaurants',
            'Show may be cancelled due to weather - check Disney app',
            'Arrive 45-60 minutes early for prime viewing spots',
            'Consider watching from Rose & Crown or Spice Road Table for elevated views'
        ],
        rating: 4.8,
        capacity: 25000,
        ageRecommendation: 'All ages',
        accessibility: [
            'Wheelchair accessible viewing areas available',
            'Assistive listening devices available',
            'Service animals welcome',
            'Designated viewing areas for guests with disabilities'
        ],
        fastFacts: [
            'Features over 1,000 fireworks effects',
            'Uses 150+ water fountains synchronized to music',
            'Includes projection mapping on Spaceship Earth',
            'Original score composed specifically for EPCOT',
            'Replaced EPCOT Forever in December 2023'
        ],
        seasonality: 'year-round',
        weatherDependent: true,
        reservationRequired: false,
        diningPackageAvailable: true,
        photoPassIncluded: true,
        specialEffects: [
            'Pyrotechnics',
            'Water fountains',
            'Laser effects',
            'Projection mapping',
            'Synchronized lighting',
            'Atmospheric effects'
        ],
        bestViewingSpots: [
            'World Showcase Promenade (Italy to Germany)',
            'Rose & Crown Dining Room terrace',
            'Spice Road Table outdoor seating',
            'Japan Pavilion bridge',
            'Morocco Pavilion waterfront',
            'Canada Pavilion steps'
        ],
        crowdLevel: 'very-high',
        status: 'active',
        relatedAttractions: ['Spaceship Earth', 'World Showcase Pavilions']
    },
    {
        id: 'awesome-planet',
        name: 'Awesome Planet',
        type: 'educational',
        category: 'educational-film',
        times: ['Every 20 minutes', '9:00 AM - 8:00 PM'],
        duration: '18:00',
        location: 'Harvest Theater',
        neighborhood: 'World Nature',
        description: 'Immersive film celebrating the beauty and diversity of our planet.',
        detailedDescription: 'Awesome Planet is a stunning 18-minute film experience that takes guests on a breathtaking journey around the world to witness the incredible diversity and beauty of our planet. Featuring spectacular cinematography and an inspiring musical score, the film showcases everything from vast landscapes and diverse ecosystems to the amazing creatures that call Earth home. The experience emphasizes the importance of environmental conservation and our role as stewards of the planet.',
        tips: [
            'Climate-controlled theater perfect for hot Florida days',
            'Great for all ages and educational for children',
            'No height requirements or restrictions',
            'Perfect break between attractions',
            'Features stunning 4K cinematography',
            'Inspirational message about environmental conservation'
        ],
        rating: 4.2,
        capacity: 428,
        ageRecommendation: 'All ages',
        accessibility: [
            'Wheelchair accessible',
            'Audio description available',
            'Assistive listening devices available',
            'Closed captioning available'
        ],
        fastFacts: [
            'Opened in 2019',
            'Features footage from around the world',
            'Narrated by Ty Burrell',
            'Located in The Land Pavilion',
            'Replaced Circle of Life film'
        ],
        seasonality: 'year-round',
        weatherDependent: false,
        reservationRequired: false,
        diningPackageAvailable: false,
        photoPassIncluded: false,
        educationalTopics: [
            'Environmental conservation',
            'Global ecosystems',
            'Wildlife diversity',
            'Climate awareness',
            'Sustainability'
        ],
        specialEffects: [
            '4K projection',
            'Surround sound',
            'Climate-controlled environment'
        ],
        bestViewingSpots: [
            'Center seats for optimal viewing',
            'Any seat provides excellent view'
        ],
        crowdLevel: 'low',
        status: 'active',
        relatedAttractions: ['Living with the Land', 'Soarin\' Around the World']
    },
    {
        id: 'american-adventure',
        name: 'The American Adventure',
        type: 'show',
        category: 'cultural-presentation',
        times: ['Every 30 minutes', '9:00 AM - 8:30 PM'],
        duration: '29:00',
        location: 'American Adventure Theater',
        neighborhood: 'World Showcase - USA',
        description: 'Audio-animatronic show telling the story of American history and ideals.',
        detailedDescription: 'The American Adventure is a magnificent 29-minute audio-animatronic presentation that chronicles the American story from the nation\'s earliest days through modern times. Featuring incredibly lifelike Audio-Animatronics figures of historical figures like Benjamin Franklin and Mark Twain, the show combines cutting-edge technology with inspiring storytelling to celebrate the American spirit of innovation, perseverance, and freedom. The experience includes stirring musical performances and dramatic recreations of pivotal moments in American history.',
        tips: [
            'Classic EPCOT attraction since opening day',
            'Features some of Disney\'s most advanced animatronics',
            'Air-conditioned theater perfect for midday break',
            'Educational and inspiring for all ages',
            'Great way to learn about American history',
            'Beautiful patriotic music throughout'
        ],
        rating: 4.4,
        capacity: 1024,
        ageRecommendation: 'All ages, especially educational for school-age children',
        accessibility: [
            'Wheelchair accessible',
            'Audio description available',
            'Assistive listening devices available',
            'Closed captioning available'
        ],
        fastFacts: [
            'Opening day attraction (1982)',
            'Features 35 Audio-Animatronics figures',
            'Weighs over 175 tons total',
            'Stage rises from 3 stories underground',
            'Includes a 72-foot-wide screen'
        ],
        seasonality: 'year-round',
        weatherDependent: false,
        reservationRequired: false,
        diningPackageAvailable: false,
        photoPassIncluded: false,
        culturalFocus: 'American history and values',
        educationalTopics: [
            'American history',
            'Historical figures',
            'National ideals',
            'Cultural heritage',
            'Patriotic values'
        ],
        specialEffects: [
            'Advanced Audio-Animatronics',
            'Multi-level staging',
            'Projection effects',
            'Surround sound',
            'Atmospheric lighting'
        ],
        bestViewingSpots: [
            'Center orchestra seats',
            'Front mezzanine for overview perspective'
        ],
        crowdLevel: 'moderate',
        status: 'active',
        relatedAttractions: ['Hall of Presidents (Magic Kingdom)', 'Liberty Square']
    },
    {
        id: 'voices-of-liberty',
        name: 'Voices of Liberty',
        type: 'concert',
        category: 'live-music',
        times: ['Multiple times daily', 'Check Times Guide'],
        duration: '15:00',
        location: 'American Adventure Rotunda',
        neighborhood: 'World Showcase - USA',
        description: 'A cappella vocal group performing patriotic American songs in beautiful harmony.',
        detailedDescription: 'Voices of Liberty is EPCOT\'s premier a cappella ensemble, featuring talented vocalists who perform stirring renditions of classic American songs in the rotunda of The American Adventure pavilion. This exceptional group, dressed in colonial-era costumes, delivers powerful performances of patriotic favorites, folk songs, and spirituals that celebrate the American musical heritage. Their performances create an intimate and moving experience that perfectly complements the cultural atmosphere of the American pavilion.',
        tips: [
            'Performances happen throughout the day',
            'Check Times Guide for exact schedule',
            'Beautiful acoustics in the rotunda',
            'Free performance - no admission required',
            'Great photo opportunities with performers',
            'Often perform seasonal and holiday music'
        ],
        rating: 4.6,
        ageRecommendation: 'All ages',
        accessibility: [
            'Wheelchair accessible',
            'Standing room performance',
            'Clear sightlines from multiple angles'
        ],
        fastFacts: [
            'Performing since EPCOT\'s opening',
            'All vocals - no instrumental accompaniment',
            'Costumes authentic to colonial period',
            'Repertoire includes over 50 songs',
            'Members audition from across the country'
        ],
        seasonality: 'year-round',
        weatherDependent: false,
        reservationRequired: false,
        diningPackageAvailable: false,
        photoPassIncluded: true,
        musicGenre: 'Patriotic/Folk/A Cappella',
        specialEffects: [
            'Natural acoustics',
            'Authentic period costumes',
            'Intimate setting'
        ],
        bestViewingSpots: [
            'Center of rotunda for best acoustics',
            'Balcony level for elevated view',
            'Near columns for acoustic enhancement'
        ],
        crowdLevel: 'moderate',
        status: 'active'
    },
    {
        id: 'mariachi-cobre',
        name: 'Mariachi Cobre',
        type: 'concert',
        category: 'live-music',
        times: ['Multiple times daily', 'Check Times Guide'],
        duration: '20:00',
        location: 'Mexico Pavilion',
        neighborhood: 'World Showcase - Mexico',
        description: 'Authentic mariachi band performing traditional Mexican music with passion and skill.',
        detailedDescription: 'Mariachi Cobre brings the vibrant sounds and rich traditions of Mexico to life with their authentic mariachi performances. This talented ensemble, featuring traditional instruments like guitars, violins, trumpets, and the distinctive guitarrón, performs classic Mexican folk songs, romantic ballads, and festive celebration music. Their colorful traditional costumes and passionate performances create an immersive cultural experience that transports guests to the heart of Mexico.',
        tips: [
            'Authentic mariachi group from Mexico',
            'Performances throughout the day',
            'Traditional costumes and instruments',
            'Great for photos and videos',
            'Educational about Mexican culture',
            'Often interact with audience'
        ],
        rating: 4.5,
        ageRecommendation: 'All ages',
        accessibility: [
            'Wheelchair accessible viewing',
            'Outdoor performance area',
            'Multiple viewing angles available'
        ],
        fastFacts: [
            'Performing at EPCOT since 1982',
            'Authentic mariachi from Mexico',
            'Traditional instruments and costumes',
            'Repertoire spans centuries of Mexican music',
            'UNESCO recognized mariachi as cultural heritage'
        ],
        seasonality: 'year-round',
        weatherDependent: true,
        reservationRequired: false,
        diningPackageAvailable: false,
        photoPassIncluded: true,
        musicGenre: 'Traditional Mexican/Mariachi',
        culturalFocus: 'Mexican musical heritage',
        specialEffects: [
            'Traditional instruments',
            'Authentic costumes',
            'Outdoor acoustics'
        ],
        bestViewingSpots: [
            'Mexico Pavilion courtyard',
            'Near the pyramid entrance',
            'Outdoor seating areas'
        ],
        crowdLevel: 'moderate',
        status: 'active'
    },
    {
        id: 'matsuriza',
        name: 'Matsuriza Taiko Drummers',
        type: 'cultural-experience',
        category: 'cultural-presentation',
        times: ['Multiple times daily', 'Check Times Guide'],
        duration: '25:00',
        location: 'Japan Pavilion',
        neighborhood: 'World Showcase - Japan',
        description: 'Powerful and mesmerizing traditional Japanese taiko drumming performances.',
        detailedDescription: 'Matsuriza presents the ancient art of taiko drumming with incredible power, precision, and artistry. These master drummers use traditional Japanese drums of various sizes to create thunderous rhythms that have been part of Japanese culture for over 1,400 years. The performance combines physical strength, spiritual discipline, and artistic expression, creating a mesmerizing spectacle that demonstrates the deep cultural significance of taiko in Japanese tradition.',
        tips: [
            'Incredibly powerful and loud performances',
            'Traditional Japanese art form',
            'Great for all ages to experience',
            'Educational about Japanese culture',
            'Performances are weather dependent',
            'Arrive early for best viewing spots'
        ],
        rating: 4.7,
        ageRecommendation: 'All ages (may be loud for sensitive ears)',
        accessibility: [
            'Wheelchair accessible viewing',
            'Outdoor performance area',
            'Multiple viewing angles',
            'May be loud for hearing-sensitive guests'
        ],
        fastFacts: [
            'Taiko drumming dates back 1,400+ years',
            'Drums made from traditional materials',
            'Requires years of training and discipline',
            'Combines physical and spiritual elements',
            'Authentic performers from Japan'
        ],
        seasonality: 'year-round',
        weatherDependent: true,
        reservationRequired: false,
        diningPackageAvailable: false,
        photoPassIncluded: true,
        culturalFocus: 'Japanese traditional arts',
        educationalTopics: [
            'Japanese culture',
            'Traditional music',
            'Spiritual practices',
            'Historical arts'
        ],
        specialEffects: [
            'Traditional taiko drums',
            'Authentic costumes',
            'Powerful acoustics',
            'Rhythmic choreography'
        ],
        bestViewingSpots: [
            'Japan Pavilion courtyard',
            'Near the pagoda',
            'Elevated viewing areas'
        ],
        crowdLevel: 'moderate',
        status: 'active'
    },
    {
        id: 'sergio',
        name: 'Sergio the Italian Mime',
        type: 'street-performance',
        category: 'interactive-experience',
        times: ['Multiple times daily', 'Roaming performance'],
        duration: '10:00',
        location: 'Italy Pavilion',
        neighborhood: 'World Showcase - Italy',
        description: 'Charming and hilarious mime performances bringing Italian comedy to life.',
        detailedDescription: 'Sergio is EPCOT\'s beloved Italian mime who delights guests with his charming personality and hilarious physical comedy. This talented performer brings the classic art of mime to life with Italian flair, creating spontaneous and interactive entertainment that engages guests of all ages. His performances often involve audience participation, creating memorable moments and photo opportunities while celebrating the playful spirit of Italian street performance.',
        tips: [
            'Interactive performances with guests',
            'Great for photos and videos',
            'Family-friendly entertainment',
            'Roaming performer - times vary',
            'Classic mime artistry',
            'Brings Italian charm to the pavilion'
        ],
        rating: 4.3,
        ageRecommendation: 'All ages, especially fun for children',
        accessibility: [
            'Wheelchair accessible',
            'Visual performance art',
            'Interactive with all guests'
        ],
        fastFacts: [
            'Classic street performance art',
            'Interactive with guests',
            'Traditional mime techniques',
            'Italian cultural entertainment',
            'Spontaneous performances'
        ],
        seasonality: 'year-round',
        weatherDependent: true,
        reservationRequired: false,
        diningPackageAvailable: false,
        photoPassIncluded: true,
        interactiveElements: [
            'Audience participation',
            'Photo opportunities',
            'Improvisational comedy',
            'Guest interaction'
        ],
        specialEffects: [
            'Physical comedy',
            'Mime artistry',
            'Interactive elements'
        ],
        bestViewingSpots: [
            'Italy Pavilion plaza',
            'Near the fountain',
            'Outdoor seating areas'
        ],
        crowdLevel: 'low',
        status: 'active'
    },
    {
        id: 'holiday-storytellers',
        name: 'Holiday Storytellers',
        type: 'seasonal',
        category: 'seasonal-event',
        times: ['Multiple times daily during holidays'],
        duration: '15:00',
        location: 'Various World Showcase Pavilions',
        neighborhood: 'World Showcase',
        description: 'Seasonal storytellers sharing holiday traditions from around the world.',
        detailedDescription: 'During EPCOT\'s Festival of the Holidays, talented storytellers appear throughout World Showcase to share the unique holiday traditions and customs from their respective countries. These engaging performances provide cultural education and entertainment, featuring traditional stories, songs, and customs that celebrate how different cultures around the world observe the holiday season.',
        tips: [
            'Only available during Festival of the Holidays',
            'Different stories at each pavilion',
            'Educational and entertaining',
            'Great for learning about world cultures',
            'Family-friendly programming',
            'Check festival guide for schedules'
        ],
        rating: 4.4,
        ageRecommendation: 'All ages, especially educational for children',
        accessibility: [
            'Wheelchair accessible',
            'Various indoor and outdoor locations',
            'Clear sightlines available'
        ],
        fastFacts: [
            'Seasonal programming only',
            'Different traditions represented',
            'Educational cultural content',
            'Interactive storytelling',
            'Multiple pavilions participate'
        ],
        seasonality: 'holiday-only',
        weatherDependent: false,
        reservationRequired: false,
        diningPackageAvailable: false,
        photoPassIncluded: true,
        culturalFocus: 'Global holiday traditions',
        educationalTopics: [
            'World cultures',
            'Holiday traditions',
            'Cultural diversity',
            'International customs'
        ],
        specialEffects: [
            'Traditional costumes',
            'Cultural props',
            'Interactive storytelling'
        ],
        bestViewingSpots: [
            'Varies by pavilion',
            'Indoor theaters when available',
            'Outdoor performance areas'
        ],
        crowdLevel: 'moderate',
        status: 'seasonal'
    },
    {
        id: 'candlelight-processional',
        name: 'Candlelight Processional',
        type: 'seasonal',
        category: 'seasonal-event',
        times: ['Multiple shows nightly during holidays'],
        duration: '40:00',
        location: 'America Gardens Theatre',
        neighborhood: 'World Showcase - USA',
        description: 'Inspiring holiday concert featuring celebrity narrators, choir, and orchestra.',
        detailedDescription: 'The Candlelight Processional is EPCOT\'s most beloved holiday tradition, featuring a magnificent 50-piece orchestra, a mass choir of over 400 voices, and celebrity guest narrators who tell the Christmas story. This deeply moving and inspirational performance combines classical and contemporary holiday music with the timeless narrative of Christmas, creating an unforgettable experience that has become a cherished tradition for many families.',
        tips: [
            'Most popular holiday event at EPCOT',
            'Dining packages highly recommended',
            'Celebrity narrators change nightly',
            'Arrive very early for standby seating',
            'Bring tissues - very emotional experience',
            'Multiple shows per night during season'
        ],
        rating: 4.9,
        capacity: 1800,
        ageRecommendation: 'All ages, especially meaningful for families',
        accessibility: [
            'Wheelchair accessible seating',
            'Assistive listening devices available',
            'Designated accessible viewing areas'
        ],
        fastFacts: [
            'EPCOT tradition since 1994',
            '50-piece orchestra',
            '400+ voice choir',
            'Celebrity narrators each night',
            'Performed in multiple languages'
        ],
        seasonality: 'holiday-only',
        weatherDependent: false,
        reservationRequired: true,
        diningPackageAvailable: true,
        photoPassIncluded: true,
        characters: ['Celebrity narrators (varies nightly)'],
        musicGenre: 'Holiday/Classical/Contemporary',
        specialEffects: [
            'Live orchestra',
            'Mass choir',
            'Candlelight ceremony',
            'Professional lighting',
            'Acoustic excellence'
        ],
        bestViewingSpots: [
            'Center orchestra with dining package',
            'Front rows for intimate experience',
            'Elevated seating for full view'
        ],
        crowdLevel: 'very-high',
        status: 'seasonal',
        merchandise: [
            'Candlelight Processional merchandise',
            'Holiday-themed items',
            'Commemorative programs'
        ]
    }
]

const currentParkHours: ParkHours[] = [
    { date: 'Today', open: '9:00 AM', close: '9:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Tomorrow', open: '9:00 AM', close: '9:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Wednesday', open: '9:00 AM', close: '9:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Thursday', open: '9:00 AM', close: '9:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Friday', open: '9:00 AM', close: '10:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Saturday', open: '9:00 AM', close: '10:00 PM', earlyEntry: '8:30 AM' },
    { date: 'Sunday', open: '9:00 AM', close: '9:00 PM', earlyEntry: '8:30 AM' }
]

const parkStats = {
    totalAttractions: 12,
    averageWaitTime: 35,
    crowdLevel: 6,
    weatherTemp: 78,
    weatherCondition: 'Partly Cloudy',
    activeFestivals: 1
}

const neighborhoods = [
    { name: 'World Celebration', icon: <Sparkles className="h-4 w-4" />, color: 'bg-purple-500', description: 'Central hub with Spaceship Earth' },
    { name: 'World Discovery', icon: <Rocket className="h-4 w-4" />, color: 'bg-blue-500', description: 'Future technology and space' },
    { name: 'World Nature', icon: <Leaf className="h-4 w-4" />, color: 'bg-green-500', description: 'Natural world and environment' },
    { name: 'World Showcase', icon: <GlobeIcon className="h-4 w-4" />, color: 'bg-orange-500', description: '11 country pavilions' }
]

const worldShowcaseCountries = [
    { name: 'Mexico', flag: '🇲🇽', attraction: 'Gran Fiesta Tour', dining: 'La Hacienda de San Angel' },
    { name: 'Norway', flag: '🇳🇴', attraction: 'Frozen Ever After', dining: 'Akershus Royal Banquet Hall' },
    { name: 'China', flag: '🇨🇳', attraction: 'Reflections of China', dining: 'Nine Dragons Restaurant' },
    { name: 'Germany', flag: '🇩🇪', attraction: 'Meet Snow White', dining: 'Biergarten Restaurant' },
    { name: 'Italy', flag: '🇮🇹', attraction: 'Meet Belle', dining: 'Via Napoli' },
    { name: 'USA', flag: '🇺🇸', attraction: 'The American Adventure', dining: 'Liberty Inn' },
    { name: 'Japan', flag: '🇯🇵', attraction: 'Meet Mulan', dining: 'Teppan Edo' },
    { name: 'Morocco', flag: '🇲🇦', attraction: 'Gallery of Arts', dining: 'Restaurant Marrakesh' },
    { name: 'France', flag: '🇫🇷', attraction: 'Remy\'s Ratatouille Adventure', dining: 'Monsieur Paul' },
    { name: 'United Kingdom', flag: '🇬🇧', attraction: 'Meet Alice & Mary Poppins', dining: 'Rose & Crown' },
    { name: 'Canada', flag: '🇨🇦', attraction: 'O Canada!', dining: 'Le Cellier Steakhouse' }
]

export default function EpcotPage() {
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'wait-time' | 'rating' | 'name'>('wait-time')
    const [selectedEntertainmentCategory, setSelectedEntertainmentCategory] = useState<string>('all')
    const [entertainmentSortBy, setEntertainmentSortBy] = useState<'rating' | 'duration' | 'name' | 'crowd-level'>('rating')

    const filteredAttractions = epcotAttractions
        .filter(attraction => selectedNeighborhood === 'all' || attraction.neighborhood.includes(selectedNeighborhood))
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

    const filteredEntertainment = epcotEntertainment
        .filter(entertainment => selectedEntertainmentCategory === 'all' || entertainment.category === selectedEntertainmentCategory)
        .sort((a, b) => {
            switch (entertainmentSortBy) {
                case 'rating':
                    return b.rating - a.rating
                case 'duration':
                    const aDuration = parseInt(a.duration.split(':')[0]) * 60 + parseInt(a.duration.split(':')[1])
                    const bDuration = parseInt(b.duration.split(':')[0]) * 60 + parseInt(b.duration.split(':')[1])
                    return bDuration - aDuration
                case 'crowd-level':
                    const crowdOrder = { 'low': 1, 'moderate': 2, 'high': 3, 'very-high': 4 }
                    return crowdOrder[b.crowdLevel] - crowdOrder[a.crowdLevel]
                case 'name':
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

    const activeFestival = epcotFestivals.find(festival => festival.status === 'active')

    const entertainmentCategories = [
        { id: 'all', name: 'All Entertainment', icon: <Music className="h-4 w-4" /> },
        { id: 'nighttime-spectacular', name: 'Nighttime Shows', icon: <Sparkles className="h-4 w-4" /> },
        { id: 'live-music', name: 'Live Music', icon: <Music className="h-4 w-4" /> },
        { id: 'cultural-presentation', name: 'Cultural Shows', icon: <GlobeIcon className="h-4 w-4" /> },
        { id: 'educational-film', name: 'Educational Films', icon: <Star className="h-4 w-4" /> },
        { id: 'interactive-experience', name: 'Interactive', icon: <Users className="h-4 w-4" /> },
        { id: 'seasonal-event', name: 'Seasonal Events', icon: <Palette className="h-4 w-4" /> }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-blue-950 dark:via-green-950 dark:to-purple-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 text-white">
                <div className="absolute inset-0 bg-black/20" />
                <Meteors number={30} />

                <div className="relative container mx-auto px-6 py-16">
                    <BlurFade delay={0.1}>
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <GlobeIcon className="h-12 w-12" />
                                <SparklesText className="text-5xl font-bold">
                                    EPCOT
                                </SparklesText>
                            </div>
                            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                                Discover the wonders of human achievement and the beauty of our world. Experience innovation,
                                culture, and cuisine from around the globe in Disney&apos;s most unique theme park.
                            </p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 max-w-3xl mx-auto">
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
                                            <NumberTicker value={11} />
                                        </div>
                                        <div className="text-sm text-blue-100">Countries</div>
                                    </div>
                                </MagicCard>
                                <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            <NumberTicker value={parkStats.activeFestivals} />
                                        </div>
                                        <div className="text-sm text-blue-100">Active Festival</div>
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

            {/* Park Hours & Festival Info */}
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

                        {/* Active Festival */}
                        {activeFestival && (
                            <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Palette className="h-6 w-6 text-purple-600" />
                                    <h3 className="text-xl font-semibold">Active Festival</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-semibold text-purple-600">{activeFestival.name}</h4>
                                        <p className="text-sm text-muted-foreground">{activeFestival.dates}</p>
                                    </div>
                                    <p className="text-sm">{activeFestival.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Utensils className="h-4 w-4 text-orange-500" />
                                            <span>{activeFestival.foodBooths} Food Booths</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Music className="h-4 w-4 text-green-500" />
                                            <span>Live Entertainment</span>
                                        </div>
                                    </div>
                                </div>
                            </MagicCard>
                        )}

                        {/* Important Alerts */}
                        <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                                <h3 className="text-xl font-semibold">Park Updates</h3>
                            </div>
                            <div className="grid md:grid-cols-3 gap-3">
                                <Alert>
                                    <Cog className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Test Track 3.0</strong> reopening late summer 2025 with new story
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Spaceship Earth Lounge</strong> opening late spring 2025
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <Palette className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Festival of the Arts</strong> running through February 24
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </MagicCard>
                    </div>
                </BlurFade>

                {/* Main Content Tabs */}
                <BlurFade delay={0.3}>
                    <Tabs defaultValue="attractions" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
                            <TabsTrigger value="attractions" className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Attractions
                            </TabsTrigger>
                            <TabsTrigger value="entertainment" className="flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                Entertainment
                            </TabsTrigger>
                            <TabsTrigger value="festivals" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Festivals
                            </TabsTrigger>
                            <TabsTrigger value="dining" className="flex items-center gap-2">
                                <Utensils className="h-4 w-4" />
                                Dining
                            </TabsTrigger>
                            <TabsTrigger value="countries" className="flex items-center gap-2">
                                <Flag className="h-4 w-4" />
                                Countries
                            </TabsTrigger>
                            <TabsTrigger value="neighborhoods" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Areas
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
                                        variant={selectedNeighborhood === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedNeighborhood('all')}
                                    >
                                        All Areas
                                    </Button>
                                    {neighborhoods.map((neighborhood) => (
                                        <Button
                                            key={neighborhood.name}
                                            variant={selectedNeighborhood === neighborhood.name ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedNeighborhood(neighborhood.name)}
                                            className="flex items-center gap-2"
                                        >
                                            {neighborhood.icon}
                                            {neighborhood.name}
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
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {attraction.neighborhood}
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
                                                            {attraction.status === 'coming-soon' && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Coming Soon
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
                                                        {attraction.status === 'coming-soon' ? (
                                                            <div className="text-sm font-semibold text-orange-600">
                                                                Coming Soon
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="text-2xl font-bold text-blue-600">
                                                                    {attraction.waitTime}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">min wait</div>
                                                            </>
                                                        )}
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

                        {/* Entertainment Tab */}
                        <TabsContent value="entertainment" className="space-y-6">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {entertainmentCategories.map((category) => (
                                        <Button
                                            key={category.id}
                                            variant={selectedEntertainmentCategory === category.id ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedEntertainmentCategory(category.id)}
                                            className="flex items-center gap-2"
                                        >
                                            {category.icon}
                                            {category.name}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={entertainmentSortBy === 'rating' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setEntertainmentSortBy('rating')}
                                    >
                                        <Star className="h-4 w-4 mr-2" />
                                        Rating
                                    </Button>
                                    <Button
                                        variant={entertainmentSortBy === 'duration' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setEntertainmentSortBy('duration')}
                                    >
                                        <Timer className="h-4 w-4 mr-2" />
                                        Duration
                                    </Button>
                                    <Button
                                        variant={entertainmentSortBy === 'crowd-level' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setEntertainmentSortBy('crowd-level')}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Crowds
                                    </Button>
                                </div>
                            </div>

                            {/* Entertainment Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEntertainment.map((entertainment, index) => (
                                    <motion.div
                                        key={entertainment.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg mb-2">{entertainment.name}</CardTitle>
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {entertainment.neighborhood}
                                                            </Badge>
                                                            <Badge
                                                                variant={entertainment.type === 'fireworks' ? 'destructive' :
                                                                    entertainment.type === 'show' ? 'default' :
                                                                        entertainment.type === 'concert' ? 'secondary' : 'outline'}
                                                                className="text-xs"
                                                            >
                                                                {entertainment.type}
                                                            </Badge>
                                                            {entertainment.reservationRequired && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Reservations
                                                                </Badge>
                                                            )}
                                                            {entertainment.diningPackageAvailable && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Utensils className="h-3 w-3 mr-1" />
                                                                    Dining Package
                                                                </Badge>
                                                            )}
                                                            {entertainment.status === 'seasonal' && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Seasonal
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                {entertainment.rating}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Timer className="h-4 w-4" />
                                                                {entertainment.duration}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-4 w-4" />
                                                                <span className={`text-xs px-2 py-1 rounded-full ${entertainment.crowdLevel === 'low' ? 'bg-green-100 text-green-800' :
                                                                    entertainment.crowdLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                                        entertainment.crowdLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                            'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {entertainment.crowdLevel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {entertainment.description}
                                                </p>

                                                {/* Show Times */}
                                                <div className="mb-3">
                                                    <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-blue-500" />
                                                        Show Times
                                                    </h5>
                                                    <div className="flex flex-wrap gap-1">
                                                        {entertainment.times.map((time, i) => (
                                                            <Badge key={i} variant="outline" className="text-xs">
                                                                {time}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Age Recommendation */}
                                                <div className="mb-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-4 w-4 text-green-500" />
                                                        <span className="font-medium">Ages:</span>
                                                        <span className="text-muted-foreground">{entertainment.ageRecommendation}</span>
                                                    </div>
                                                </div>

                                                {/* Special Effects */}
                                                {entertainment.specialEffects.length > 0 && (
                                                    <div className="mb-3">
                                                        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                            <Sparkles className="h-4 w-4 text-purple-500" />
                                                            Special Effects
                                                        </h5>
                                                        <div className="flex flex-wrap gap-1">
                                                            {entertainment.specialEffects.slice(0, 3).map((effect, i) => (
                                                                <Badge key={i} variant="secondary" className="text-xs">
                                                                    {effect}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Weather Dependent Warning */}
                                                {entertainment.weatherDependent && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center gap-2 text-sm text-orange-600">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            <span>Weather dependent</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pro Tips */}
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-semibold">Pro Tips:</h5>
                                                    <ul className="text-xs text-muted-foreground space-y-1">
                                                        {entertainment.tips.slice(0, 2).map((tip, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <Sparkles className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Best Viewing Spots */}
                                                {entertainment.bestViewingSpots.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-red-500" />
                                                            Best Viewing
                                                        </h5>
                                                        <ul className="text-xs text-muted-foreground space-y-1">
                                                            {entertainment.bestViewingSpots.slice(0, 2).map((spot, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <MapPin className="h-3 w-3 mt-0.5 text-red-500 flex-shrink-0" />
                                                                    {spot}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Festivals Tab */}
                        <TabsContent value="festivals" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {epcotFestivals.map((festival, index) => (
                                    <motion.div
                                        key={festival.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{festival.name}</CardTitle>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge
                                                                variant={festival.status === 'active' ? 'default' :
                                                                    festival.status === 'upcoming' ? 'secondary' : 'outline'}
                                                            >
                                                                {festival.status}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">{festival.dates}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-purple-600">
                                                            {festival.foodBooths}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">food booths</div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {festival.description}
                                                </p>
                                                <div className="space-y-3">
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-2">Festival Highlights:</h5>
                                                        <ul className="text-xs text-muted-foreground space-y-1">
                                                            {festival.highlights.map((highlight, i) => (
                                                                <li key={i} className="flex items-center gap-2">
                                                                    <Sparkles className="h-3 w-3 text-yellow-500" />
                                                                    {highlight}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-2">Entertainment:</h5>
                                                        <ul className="text-xs text-muted-foreground space-y-1">
                                                            {festival.entertainment.map((show, i) => (
                                                                <li key={i} className="flex items-center gap-2">
                                                                    <Music className="h-3 w-3 text-green-500" />
                                                                    {show}
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

                        {/* Dining Tab */}
                        <TabsContent value="dining" className="space-y-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {epcotDining.map((restaurant, index) => (
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
                                                            <Badge variant="secondary">{restaurant.neighborhood}</Badge>
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

                        {/* Countries Tab */}
                        <TabsContent value="countries" className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold mb-4">World Showcase Pavilions</h3>
                                <p className="text-muted-foreground">
                                    Journey around the world and experience the culture, cuisine, and attractions of 11 different countries.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {worldShowcaseCountries.map((country, index) => (
                                    <motion.div
                                        key={country.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-3xl">{country.flag}</div>
                                                    <CardTitle className="text-lg">{country.name}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                                            <Star className="h-3 w-3 text-yellow-500" />
                                                            Main Attraction
                                                        </h5>
                                                        <p className="text-sm text-muted-foreground">{country.attraction}</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                                            <Utensils className="h-3 w-3 text-green-500" />
                                                            Featured Dining
                                                        </h5>
                                                        <p className="text-sm text-muted-foreground">{country.dining}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </MagicCard>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Neighborhoods Tab */}
                        <TabsContent value="neighborhoods" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {neighborhoods.map((neighborhood, index) => (
                                    <motion.div
                                        key={neighborhood.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <MagicCard className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${neighborhood.color} text-white`}>
                                                        {neighborhood.icon}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{neighborhood.name}</CardTitle>
                                                        <p className="text-sm text-muted-foreground">{neighborhood.description}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-2">Key Attractions:</h5>
                                                        <ul className="text-sm text-muted-foreground space-y-1">
                                                            {epcotAttractions
                                                                .filter(attraction => attraction.neighborhood.includes(neighborhood.name))
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
                                                            {epcotDining
                                                                .filter(restaurant => restaurant.neighborhood.includes(neighborhood.name))
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
                                        Essential EPCOT Tips
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Start with Guardians:</strong> Book Lightning Lane for Cosmic Rewind first thing
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Festival Strategy:</strong> Try 2-3 food booths per visit to avoid overwhelming your palate
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>World Showcase:</strong> Start at Mexico and work clockwise for best flow
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Dining Reservations:</strong> Book popular restaurants 60 days in advance
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Fireworks Viewing:</strong> Arrive 45-60 minutes early for best spots around the lagoon
                                            </div>
                                        </li>
                                    </ul>
                                </MagicCard>

                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-purple-600" />
                                        Festival Tips
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Festival Passport:</strong> Get stamped at each booth for special rewards
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Share Portions:</strong> Festival portions are perfect for sharing between 2-3 people
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Concert Series:</strong> Arrive 30 minutes early for America Gardens Theatre shows
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Mobile Order:</strong> Use Disney app to skip lines at festival booths
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
                                                <li>• Weekdays during school year</li>
                                                <li>• Early morning (rope drop)</li>
                                                <li>• Late evening after fireworks</li>
                                                <li>• Between festivals</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-red-600 mb-2">Busy Times</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Festival weekends</li>
                                                <li>• Food & Wine Festival</li>
                                                <li>• Holiday periods</li>
                                                <li>• Concert nights</li>
                                            </ul>
                                        </div>
                                    </div>
                                </MagicCard>

                                <MagicCard className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <GlobeIcon className="h-5 w-5 text-green-600" />
                                        World Showcase Tips
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Kidcot Fun Stops:</strong> Kids can get stamps and color at each pavilion
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Cultural Representatives:</strong> Chat with cast members from each country
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Shopping:</strong> Each pavilion has unique merchandise from that country
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <strong>Character Meets:</strong> Find unique characters in their home countries
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