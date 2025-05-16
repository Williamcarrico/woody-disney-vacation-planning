'use client'
// 'use client' is omitted to make this a server component by default
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Wand2, Users, Rocket, Sparkles, Map, MessageCircle } from 'lucide-react'


function AnimatedSection({ children, delay = 0 }: Readonly<{ children: React.ReactNode; delay?: number }>) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay }}
            className="w-full max-w-4xl mx-auto px-4 py-12"
        >
            {children}
        </motion.section>
    )
}

function AboutUsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
            <motion.header
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full flex flex-col items-center pt-24 pb-8"
            >
                <h1 className="text-5xl font-extrabold tracking-tight text-center bg-gradient-to-r from-pink-400 via-fuchsia-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
                    Crafting Magical Memories Together
                </h1>
                <p className="mt-6 text-lg max-w-2xl text-center text-slate-200">
                    Transforming Disney World group vacations from chaos to seamless magic—one memory at a time.
                </p>
            </motion.header>
            <Separator className="max-w-2xl mx-auto my-4 bg-gradient-to-r from-pink-400 via-fuchsia-500 to-indigo-400 h-1 rounded-full opacity-60" />
            <AnimatedSection delay={0.1}>
                <SectionStory />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
                <SectionMission />
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
                <SectionPlatform />
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
                <SectionInnovation />
            </AnimatedSection>
            <AnimatedSection delay={0.5}>
                <SectionDifference />
            </AnimatedSection>
            <AnimatedSection delay={0.6}>
                <SectionJoin />
            </AnimatedSection>
        </main>
    )
}

export default AboutUsPage

// --- Subcomponents ---

function SectionStory() {
    return (
        <Card className="bg-gradient-to-br from-[#1e293b]/80 to-[#334155]/80 border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <Avatar className="ring-4 ring-fuchsia-400 h-24 w-24">
                    <AvatarImage src="/images/Wiiliam_Carrico.png" alt="William Carrico" />
                    <AvatarFallback>WC</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Wand2 className="text-pink-400" /> Our Story
                    </h2>
                    <p className="mt-4 text-slate-200">
                        In the bustling landscape of vacation planning, a vision was born. William Carrico, a passionate developer and Disney enthusiast, observed a universal challenge: coordinating Disney World vacations across multiple friends and family members often devolved into chaos. What should be joyful anticipation frequently became a labyrinth of scattered text messages, missed calls, and conflicting itineraries.
                    </p>
                    <p className="mt-2 text-slate-300">
                        This observation sparked the creation of our platform—a comprehensive solution designed to transform the Disney World vacation planning experience from fragmented to seamless, from stressful to magical.
                    </p>
                </div>
            </div>
        </Card>
    )
}

function SectionMission() {
    return (
        <Card className="bg-gradient-to-br from-[#334155]/80 to-[#1e293b]/80 border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="text-fuchsia-400" /> Our Mission
                    </h2>
                    <p className="mt-4 text-slate-200">
                        We&apos;re revolutionizing how groups experience the wonder of Walt Disney World by providing a unified platform where collaboration meets expertise. Our mission is to elevate every aspect of your Disney adventure—from initial dreaming to real-time park navigation—enabling more meaningful connections and memories that last a lifetime.
                    </p>
                </div>
                <div className="flex-1 flex justify-center">
                    <Badge variant="outline" className="text-lg px-6 py-3 border-fuchsia-400 bg-fuchsia-900/20 text-fuchsia-200">
                        Elevate Every Memory
                    </Badge>
                </div>
            </div>
        </Card>
    )
}

function SectionPlatform() {
    return (
        <Card className="bg-gradient-to-br from-[#1e293b]/80 to-[#334155]/80 border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="text-indigo-400" /> The Platform
                    </h2>
                    <ul className="mt-4 space-y-2 text-slate-200 list-disc list-inside">
                        <li><strong>Collaborative Planning</strong> flourishes through democratic decision-making tools</li>
                        <li><strong>Real-Time Coordination</strong> eliminates the need for constant communication</li>
                        <li><strong>Data-Driven Optimization</strong> transforms your experience through predictive analytics</li>
                        <li><strong>Personalized Recommendations</strong> ensure each group member discovers their perfect Disney day</li>
                    </ul>
                </div>
                <div className="flex-1 flex flex-col items-center gap-4">
                    <Tabs defaultValue="wait-times" className="w-full max-w-xs">
                        <TabsList className="bg-slate-800/80">
                            <TabsTrigger value="wait-times">Wait Times</TabsTrigger>
                            <TabsTrigger value="dining">Dining</TabsTrigger>
                            <TabsTrigger value="group">Group Chat</TabsTrigger>
                        </TabsList>
                        <TabsContent value="wait-times">
                            <FeatureCard
                                icon={<Map className="text-pink-400" />}
                                title="Live Wait Times"
                                description="Access real-time ride wait times and optimize your day on the fly."
                            />
                        </TabsContent>
                        <TabsContent value="dining">
                            <FeatureCard
                                icon={<MessageCircle className="text-fuchsia-400" />}
                                title="Dining Reservations"
                                description="Book and manage group dining seamlessly, with personalized suggestions."
                            />
                        </TabsContent>
                        <TabsContent value="group">
                            <FeatureCard
                                icon={<Users className="text-indigo-400" />}
                                title="Group Messaging"
                                description="Stay connected with your group, share updates, and coordinate effortlessly."
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Card>
    )
}

function SectionInnovation() {
    return (
        <Card className="bg-gradient-to-br from-[#334155]/80 to-[#1e293b]/80 border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="flex-1 flex flex-col gap-4">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Rocket className="text-pink-400" /> Innovation & Technology
                    </h2>
                    <ul className="mt-4 space-y-2 text-slate-200 list-disc list-inside">
                        <li>Advanced predictive algorithms analyzing historical crowd patterns</li>
                        <li>Real-time data integration with park systems</li>
                        <li>Secure location sharing with precise privacy controls</li>
                        <li>Intuitive collaborative interfaces designed for all ages and technical abilities</li>
                    </ul>
                </div>
                <div className="flex-1 flex flex-col items-center gap-4">
                    <Suspense fallback={<div className="h-40 w-full flex items-center justify-center"><span>Loading carousel...</span></div>}>
                        <InnovationCarousel />
                    </Suspense>
                </div>
            </div>
        </Card>
    )
}

function SectionDifference() {
    return (
        <Card className="bg-gradient-to-br from-[#1e293b]/80 to-[#334155]/80 border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="text-fuchsia-400" /> The Difference
                    </h2>
                    <p className="mt-4 text-slate-200">
                        Unlike traditional vacation planning tools, our platform was designed specifically for the unique dynamics of group Disney vacations. We recognize that these trips represent more than just travel—they&apos;re opportunities for connection, celebration, and shared wonder.
                    </p>
                    <p className="mt-2 text-slate-300">
                        By transforming disconnected planning efforts into a cohesive experience, we&apos;re not just streamlining logistics; we&apos;re creating space for deeper engagement with both Disney&apos;s magic and with each other.
                    </p>
                </div>
            </div>
        </Card>
    )
}

function SectionJoin() {
    return (
        <Card className="bg-gradient-to-br from-[#334155]/80 to-[#1e293b]/80 border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Wand2 className="text-pink-400" /> Join Our Journey
                    </h2>
                    <p className="mt-4 text-slate-200">
                        As we continuously enhance our platform with new features and refinements, we invite you to be part of our story. Every vacation planned through our service helps us better understand how to perfect the art of group Disney experiences.
                    </p>
                    <p className="mt-2 text-slate-300">
                        Together, we&apos;re reimagining what a Disney World vacation can be—not just a destination, but a journey where the planning becomes part of the magic.
                    </p>
                    <div className="mt-6 flex gap-4">
                        <Button variant="default" size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg">
                            Start Planning
                        </Button>
                        <Button variant="outline" size="lg" className="border-fuchsia-400 text-fuchsia-200">
                            Contact Us
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function FeatureCard({ icon, title, description }: Readonly<{ icon: React.ReactNode; title: string; description: string }>) {
    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-slate-900/70 rounded-xl shadow-md">
            <div className="text-3xl">{icon}</div>
            <div className="font-semibold text-lg text-slate-100">{title}</div>
            <div className="text-slate-300 text-sm text-center">{description}</div>
        </div>
    )
}

function InnovationCarousel() {
    // Placeholder for a carousel of futuristic features/tech (could be replaced with real data)
    const items = [
        {
            title: 'AI-Powered Itinerary',
            description: 'Let our AI craft the perfect day for your group, adapting in real time to park conditions.',
            icon: <Rocket className="text-pink-400" />
        },
        {
            title: 'Live Location Sharing',
            description: 'See where your group is in the park, with privacy-first controls for peace of mind.',
            icon: <Map className="text-indigo-400" />
        },
        {
            title: 'MagicLink Invites',
            description: 'Invite friends with a single tap—no accounts required for guests.',
            icon: <Wand2 className="text-fuchsia-400" />
        },
        {
            title: 'Smart Notifications',
            description: 'Get timely nudges for parades, dining, and must-see attractions, tailored to your group.',
            icon: <Sparkles className="text-pink-400" />
        }
    ]
    return (
        <Carousel className="w-full max-w-xs">
            <CarouselContent>
                {items.map((item) => (
                    <CarouselItem key={item.title}>
                        <FeatureCard {...item} />
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}

// --- Types ---
// (If needed, add interfaces here for props, etc.)