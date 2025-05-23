import { Suspense } from 'react'
import { Metadata } from 'next'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Wand2, Users, Rocket, Sparkles, MessageCircle, Brain, Shield, Zap, Globe, Clock, Star } from 'lucide-react'
import { AnimatedSection } from '@/components/about/animated-section'
import { FloatingParticles } from '@/components/about/floating-particles'
import { InteractiveCard } from '@/components/about/interactive-card'
import { FeatureShowcase } from '@/components/about/feature-showcase'
import { StoryTimeline } from '@/components/about/story-timeline'
import { TechStack } from '@/components/about/tech-stack'
import { TeamMember } from '@/components/about/team-member'

export const metadata: Metadata = {
    title: 'About Us | Crafting Magical Memories Together',
    description: 'Discover our story, mission, and the technology behind the platform revolutionizing Disney World group vacation planning.',
    openGraph: {
        title: 'About Us | Crafting Magical Memories Together',
        description: 'Discover our story, mission, and the technology behind the platform revolutionizing Disney World group vacation planning.',
        type: 'website',
    }
}

function AboutPage() {
    return (
        <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-900/50 to-slate-950" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <FloatingParticles />

            {/* Hero Section */}
            <section className="relative z-10 w-full flex flex-col items-center pt-32 pb-16 px-4">
                <div className="text-center max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Revolutionizing Disney Vacation Planning</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-center mb-8">
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                            Crafting Magical
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                            Memories Together
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12">
                        Transforming Disney World group vacations from chaos to seamless magic—
                        <span className="text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text font-semibold">
                            one memory at a time
                        </span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105"
                        >
                            <Rocket className="w-5 h-5 mr-2" />
                            Start Your Journey
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-violet-400/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 transition-all duration-300"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Contact Us
                        </Button>
                    </div>
                </div>

                <Separator className="max-w-3xl mx-auto bg-gradient-to-r from-transparent via-violet-500/50 to-transparent h-px" />
            </section>

            {/* Main Content */}
            <div className="relative z-10 space-y-24 pb-24">
                <AnimatedSection delay={0.1}>
                    <StorySection />
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                    <MissionSection />
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                    <PlatformSection />
                </AnimatedSection>

                <AnimatedSection delay={0.4}>
                    <InnovationSection />
                </AnimatedSection>

                <AnimatedSection delay={0.5}>
                    <TechStackSection />
                </AnimatedSection>

                <AnimatedSection delay={0.6}>
                    <DifferenceSection />
                </AnimatedSection>

                <AnimatedSection delay={0.7}>
                    <JoinSection />
                </AnimatedSection>
            </div>
        </main>
    )
}

export default AboutPage

// --- Section Components ---

function StorySection() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <InteractiveCard className="overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-12 p-8 lg:p-12">
                    <div className="flex-shrink-0">
                        <TeamMember
                            name="William Carrico"
                            role="Founder & Lead Developer"
                            image="/images/Wiiliam_Carrico.png"
                            bio="Passionate developer and Disney enthusiast"
                        />
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                                <Wand2 className="w-8 h-8 text-violet-400" />
                            </div>
                            <h2 className="text-4xl font-bold text-white">Our Story</h2>
                        </div>

                        <StoryTimeline />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Brain className="w-6 h-6 text-cyan-400" />
                                    <h3 className="text-lg font-semibold text-white">The Problem</h3>
                                </div>
                                <p className="text-slate-300">
                                    Scattered text messages, missed calls, and conflicting itineraries turned joyful Disney planning into chaos.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="w-6 h-6 text-fuchsia-400" />
                                    <h3 className="text-lg font-semibold text-white">The Solution</h3>
                                </div>
                                <p className="text-slate-300">
                                    A comprehensive platform designed to transform fragmented planning into seamless magic.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </InteractiveCard>
        </div>
    )
}

function MissionSection() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <InteractiveCard className="text-center">
                <div className="p-8 lg:p-12 space-y-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/30">
                            <Sparkles className="w-10 h-10 text-fuchsia-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">Our Mission</h2>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <p className="text-xl text-slate-200 leading-relaxed mb-8">
                            We&apos;re revolutionizing how groups experience the wonder of Walt Disney World by providing a
                            <span className="text-transparent bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text font-semibold"> unified platform </span>
                            where collaboration meets expertise.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: Users, title: "Unite Groups", description: "Bring everyone together in one collaborative space" },
                                { icon: Zap, title: "Optimize Experience", description: "Leverage data to create perfect Disney days" },
                                { icon: Star, title: "Create Memories", description: "Enable deeper connections and lasting memories" }
                            ].map((item, index) => (
                                <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 backdrop-blur-sm hover:border-fuchsia-500/50 transition-all duration-300">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20">
                                            <item.icon className="w-8 h-8 text-fuchsia-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                        <p className="text-slate-300">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </InteractiveCard>
        </div>
    )
}

function PlatformSection() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <InteractiveCard>
                <div className="p-8 lg:p-12">
                    <div className="flex items-center gap-3 mb-12 justify-center">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                            <Users className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">The Platform</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="grid gap-6">
                                {[
                                    {
                                        icon: Users,
                                        title: "Collaborative Planning",
                                        description: "Democratic decision-making tools that ensure everyone's voice is heard",
                                        color: "from-violet-500 to-purple-500"
                                    },
                                    {
                                        icon: Clock,
                                        title: "Real-Time Coordination",
                                        description: "Eliminate constant communication with live updates and smart notifications",
                                        color: "from-cyan-500 to-blue-500"
                                    },
                                    {
                                        icon: Brain,
                                        title: "Data-Driven Optimization",
                                        description: "Predictive analytics transform your experience through intelligent insights",
                                        color: "from-fuchsia-500 to-pink-500"
                                    },
                                    {
                                        icon: Star,
                                        title: "Personalized Recommendations",
                                        description: "Each group member discovers their perfect Disney day through AI curation",
                                        color: "from-emerald-500 to-teal-500"
                                    }
                                ].map((feature, index) => (
                                    <div key={index} className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}/20 group-hover:${feature.color}/30 transition-all duration-300`}>
                                                <feature.icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                                <p className="text-slate-300">{feature.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Suspense fallback={<div className="w-full h-96 rounded-2xl bg-slate-800/50 animate-pulse" />}>
                                <FeatureShowcase />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </InteractiveCard>
        </div>
    )
}

function InnovationSection() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <InteractiveCard>
                <div className="p-8 lg:p-12">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                                <Rocket className="w-10 h-10 text-orange-400" />
                            </div>
                            <h2 className="text-4xl font-bold text-white">Innovation & Technology</h2>
                        </div>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                            Powered by cutting-edge technology and forward-thinking design, our platform sets new standards for vacation planning.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Brain,
                                title: "AI-Powered Analytics",
                                description: "Advanced predictive algorithms analyzing historical crowd patterns and real-time data",
                                gradient: "from-violet-500 to-purple-500"
                            },
                            {
                                icon: Shield,
                                title: "Privacy-First Design",
                                description: "Secure location sharing with granular privacy controls and end-to-end encryption",
                                gradient: "from-emerald-500 to-teal-500"
                            },
                            {
                                icon: Globe,
                                title: "Real-Time Integration",
                                description: "Live data streams from park systems providing up-to-the-minute information",
                                gradient: "from-cyan-500 to-blue-500"
                            },
                            {
                                icon: Zap,
                                title: "Intuitive Interfaces",
                                description: "Collaborative tools designed for all ages and technical abilities with accessibility-first approach",
                                gradient: "from-fuchsia-500 to-pink-500"
                            }
                        ].map((tech, index) => (
                            <div key={index} className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 hover:scale-105">
                                <div className="text-center space-y-4">
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tech.gradient}/20 group-hover:${tech.gradient}/30 transition-all duration-300`}>
                                        <tech.icon className={`w-8 h-8 bg-gradient-to-r ${tech.gradient} bg-clip-text text-transparent`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{tech.title}</h3>
                                    <p className="text-sm text-slate-300">{tech.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </InteractiveCard>
        </div>
    )
}

function TechStackSection() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Built with Modern Technology</h2>
                <p className="text-xl text-slate-300">Leveraging the latest tools and frameworks for optimal performance</p>
            </div>
            <Suspense fallback={<div className="w-full h-64 rounded-2xl bg-slate-800/50 animate-pulse" />}>
                <TechStack />
            </Suspense>
        </div>
    )
}

function DifferenceSection() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <InteractiveCard className="text-center">
                <div className="p-8 lg:p-12 space-y-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                            <Sparkles className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">The Difference</h2>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <p className="text-xl text-slate-200 leading-relaxed">
                            Unlike traditional vacation planning tools, our platform was designed specifically for the
                            <span className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text font-semibold"> unique dynamics </span>
                            of group Disney vacations.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 mt-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Traditional Planning
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        "Scattered across multiple apps",
                                        "Generic travel tools",
                                        "Limited group coordination",
                                        "No real-time updates",
                                        "One-size-fits-all approach"
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                            <span className="text-slate-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Our Approach
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        "All-in-one unified platform",
                                        "Disney-specific optimization",
                                        "Advanced group dynamics",
                                        "Live data integration",
                                        "Personalized for each member"
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                                            <span className="text-slate-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                            <p className="text-lg text-slate-200">
                                We&apos;re not just streamlining logistics; we&apos;re creating space for deeper engagement with both Disney&apos;s magic and with each other.
                            </p>
                        </div>
                    </div>
                </div>
            </InteractiveCard>
        </div>
    )
}

function JoinSection() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <InteractiveCard className="text-center">
                <div className="p-8 lg:p-12 space-y-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                            <Wand2 className="w-10 h-10 text-violet-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">Join Our Journey</h2>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        <p className="text-xl text-slate-200 leading-relaxed">
                            As we continuously enhance our platform with new features and refinements, we invite you to be part of our story.
                            Every vacation planned through our service helps us better understand how to perfect the art of group Disney experiences.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 my-12">
                            {[
                                { number: "10,000+", label: "Happy Families", icon: Users },
                                { number: "500+", label: "Magical Vacations", icon: Star },
                                { number: "98%", label: "Satisfaction Rate", icon: Sparkles }
                            ].map((stat, index) => (
                                <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 backdrop-blur-sm">
                                    <div className="flex flex-col items-center space-y-2">
                                        <stat.icon className="w-8 h-8 text-violet-400 mb-2" />
                                        <div className="text-3xl font-bold text-white">{stat.number}</div>
                                        <div className="text-slate-300">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <p className="text-lg text-slate-300">
                                Together, we&apos;re reimagining what a Disney World vacation can be—not just a destination, but a journey where the planning becomes part of the magic.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105"
                                >
                                    <Rocket className="w-5 h-5 mr-2" />
                                    Start Planning Your Magic
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-violet-400/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 transition-all duration-300"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Get in Touch
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </InteractiveCard>
        </div>
    )
}

// --- Types ---
// (If needed, add interfaces here for props, etc.)