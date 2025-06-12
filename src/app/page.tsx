"use client";

import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// MagicUI Components
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ConfettiButton } from "@/components/magicui/confetti";
import { MagicCard } from "@/components/magicui/magic-card";
import { Marquee } from "@/components/magicui/marquee";
import { Meteors } from "@/components/magicui/meteors";
import { MorphingText } from "@/components/magicui/morphing-text";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { WarpBackground } from "@/components/magicui/warp-background";
import { WordRotate } from "@/components/magicui/word-rotate";

// Icons (you may need to install lucide-react if not already installed)
import {
    Calendar,
    Users,
    MapPin,
    Star,
    Zap,
    Smartphone,
    Heart
} from "lucide-react";

// Navigation Component
function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">W</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            WaltWise
                        </span>
                    </motion.div>

                    <div className="hidden md:flex items-center space-x-8">
                        {["Features", "Pricing", "About", "Contact"].map((item) => (
                            <motion.a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-white/80 hover:text-white transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {item}
                            </motion.a>
                        ))}
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <ShimmerButton className="px-6 py-2">
                            Get Started
                        </ShimmerButton>
                    </motion.div>
                </div>
            </div>
        </motion.nav>
    );
}

// Hero Section
function HeroSection() {
    const [mounted, setMounted] = useState(false);
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.section
            ref={heroRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            style={{ y, opacity }}
        >
            <WarpBackground className="absolute inset-0">
                <AnimatedGridPattern
                    className="absolute inset-0 opacity-30"
                    width={40}
                    height={40}
                    numSquares={50}
                    maxOpacity={0.3}
                />
            </WarpBackground>

            <Meteors number={20} className="absolute inset-0" />

            <div className="relative z-20 container mx-auto px-6 text-center">
                <BlurFade delay={0.2}>
                    <AnimatedGradientText className="mb-8">
                        🎭 The Future of Disney Planning is Here
                    </AnimatedGradientText>
                </BlurFade>

                <BlurFade delay={0.4}>
                    <SparklesText
                        className="text-6xl md:text-8xl font-bold mb-6"
                        colors={{ first: "#3b82f6", second: "#8b5cf6" }}
                    >
                        WaltWise
                    </SparklesText>
                </BlurFade>

                <BlurFade delay={0.6}>
                    <div className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
                        <MorphingText
                            texts={[
                                "Revolutionary Disney World vacation planning",
                                "Intelligent itinerary optimization",
                                "Real-time party communication",
                                "Magical experience guaranteed"
                            ]}
                        />
                    </div>
                </BlurFade>

                <BlurFade delay={0.8}>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
                        <ConfettiButton
                            asChild
                            options={{
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.6 }
                            }}
                        >
                            <RainbowButton className="px-8 py-4 text-lg font-semibold">
                                Start Planning Your Magic ✨
                            </RainbowButton>
                        </ConfettiButton>

                        <motion.button
                            className="px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Watch Demo 🎬
                        </motion.button>
                    </div>
                </BlurFade>

                <BlurFade delay={1.0}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
                        {[
                            { number: 50000, label: "Happy Families", suffix: "+" },
                            { number: 4.9, label: "User Rating", suffix: "/5" },
                            { number: 2, label: "Million", suffix: "M+ Plans" },
                            { number: 99, label: "Success Rate", suffix: "%" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 + index * 0.1 }}
                            >
                                <div className="text-3xl font-bold text-white mb-2">
                                    <NumberTicker value={stat.number} />
                                    {stat.suffix}
                                </div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </BlurFade>
            </div>

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 border border-white/30 rounded-full flex justify-center"
                >
                    <motion.div
                        animate={{ y: [0, 16, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1 h-3 bg-white/50 rounded-full mt-2"
                    />
                </motion.div>
            </div>
        </motion.section>
    );
}

// Features Section
function FeaturesSection() {
    const featuresRef = useRef(null);
    const isInView = useInView(featuresRef, { once: true, margin: "-100px" });

    const features = [
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Smart Itinerary Builder",
            description: "AI-powered planning that optimizes your park days for maximum magic and minimum wait times.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Party Coordination",
            description: "Keep your entire vacation party synchronized with real-time updates and group messaging.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <MapPin className="w-8 h-8" />,
            title: "Live Park Maps",
            description: "Interactive maps with real-time wait times, show schedules, and dining availability.",
            color: "from-green-500 to-teal-500"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Lightning Lane Optimizer",
            description: "Maximize your Lightning Lane usage with intelligent booking recommendations.",
            color: "from-yellow-500 to-orange-500"
        },
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Mobile-First Design",
            description: "Seamless experience across all devices with offline capability for the parks.",
            color: "from-indigo-500 to-purple-500"
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Memory Keeper",
            description: "Capture and share magical moments with built-in photo albums and trip journals.",
            color: "from-pink-500 to-rose-500"
        }
    ];

    return (
        <section ref={featuresRef} id="features" className="py-24 relative">
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <TypingAnimation
                        text="Magical Features That Make Dreams Come True"
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                        duration={100}
                    />
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        Experience Disney World planning like never before with our revolutionary features
                        designed to maximize your magical moments.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <MagicCard
                                className="p-8 h-full bg-white/5 backdrop-blur-sm border border-white/10"
                                gradientColor="#1e40af"
                                gradientOpacity={0.1}
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-xl bg-gradient-to-r flex items-center justify-center mb-6",
                                    feature.color
                                )}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-white/70 leading-relaxed">{feature.description}</p>
                                <BorderBeam className="mt-4" />
                            </MagicCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Testimonials Section
function TestimonialsSection() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Disney Mom of 3",
            content: "WaltWise transformed our Disney vacation! The AI planning saved us hours of wait time and the family coordination features kept everyone happy.",
            avatar: "/images/avatars/sarah.jpg",
            rating: 5
        },
        {
            name: "Mike Chen",
            role: "Annual Passholder",
            content: "As someone who visits Disney World regularly, WaltWise has become my go-to planning tool. The Lightning Lane optimization is incredible!",
            avatar: "/images/avatars/mike.jpg",
            rating: 5
        },
        {
            name: "The Rodriguez Family",
            role: "First-time Visitors",
            content: "We were overwhelmed planning our first Disney trip, but WaltWise made it magical from day one. The recommendations were spot-on!",
            avatar: "/images/avatars/rodriguez.jpg",
            rating: 5
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <WordRotate
                        words={["Magical", "Amazing", "Incredible", "Unforgettable"]}
                        className="text-5xl font-bold text-white mb-4"
                    />
                    <h2 className="text-2xl text-white/80">Stories from Disney Families</h2>
                </motion.div>

                <Marquee className="py-8" pauseOnHover>
                    {testimonials.map((testimonial, index) => (
                        <NeonGradientCard
                            key={index}
                            className="w-96 mx-4"
                            neonColors={{ firstColor: "#3b82f6", secondColor: "#8b5cf6" }}
                        >
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    {Array.from({ length: testimonial.rating }, (_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-white/90 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-white font-bold">{testimonial.name[0]}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{testimonial.name}</div>
                                        <div className="text-sm text-white/60">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        </NeonGradientCard>
                    ))}
                </Marquee>
            </div>
        </section>
    );
}

// CTA Section
function CTASection() {
    return (
        <section className="py-24 relative">
            <WarpBackground className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </WarpBackground>

            <div className="container mx-auto px-6 text-center relative z-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <SparklesText
                        className="text-5xl md:text-7xl font-bold mb-8"
                        colors={{ first: "#fbbf24", second: "#f59e0b" }}
                    >
                        Ready for Magic?
                    </SparklesText>

                    <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
                        Join thousands of families who have transformed their Disney World
                        vacations with WaltWise. Your magical adventure awaits!
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <ConfettiButton
                            asChild
                            options={{
                                particleCount: 150,
                                spread: 100,
                                origin: { y: 0.6 }
                            }}
                        >
                            <ShimmerButton className="px-12 py-4 text-xl font-bold">
                                Start Your Free Trial ✨
                            </ShimmerButton>
                        </ConfettiButton>

                        <motion.button
                            className="px-8 py-4 text-lg font-semibold border border-white/30 rounded-lg text-white hover:bg-white/10 transition-all"
                            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.6)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Schedule Demo 📞
                        </motion.button>
                    </div>

                    <div className="mt-12 text-sm text-white/60">
                        ✨ No credit card required • 14-day free trial • Cancel anytime
                    </div>
                </motion.div>
            </div>
        </section>
    );
}


// Main Page Component
export default function LandingPage() {
    return (
        <main className="relative">
            <Navigation />
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <CTASection />
        </main>
    );
}