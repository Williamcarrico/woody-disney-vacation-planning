"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    Castle,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Heart,
    Sparkles,
    Star,
    Zap,
    Rocket,
    Globe,
    Shield,
    HelpCircle,
    FileText,
    Users,
    Calendar,
    Map,
    Utensils,
    Camera,
    DollarSign,
    MessageSquare,
    Home,
    Compass,
    ArrowRight,
    CheckCircle
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern"
import { BorderBeam } from "@/components/magicui/border-beam"
import { MagicCard } from "@/components/magicui/magic-card"
import { Meteors } from "@/components/magicui/meteors"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

// Footer links configuration
const footerLinks = {
    explore: [
        { title: "Magic Kingdom", href: "/parks/magic-kingdom", icon: Castle },
        { title: "EPCOT", href: "/parks/epcot", icon: Rocket },
        { title: "Hollywood Studios", href: "/parks/hollywood-studios", icon: Star },
        { title: "Animal Kingdom", href: "/parks/animal-kingdom", icon: Compass },
        { title: "Disney Springs", href: "/disney-springs", icon: Sparkles },
        { title: "Resorts", href: "/resorts", icon: Home },
    ],
    planning: [
        { title: "Itinerary Builder", href: "/itinerary", icon: Calendar },
        { title: "Dining Reservations", href: "/dining", icon: Utensils },
        { title: "Budget Tracker", href: "/budget", icon: DollarSign },
        { title: "Group Planning", href: "/group", icon: Users },
        { title: "Photo Memories", href: "/photos", icon: Camera },
        { title: "Messages", href: "/messages", icon: MessageSquare },
    ],
    support: [
        { title: "Help Center", href: "/help", icon: HelpCircle },
        { title: "Contact Us", href: "/contact", icon: Mail },
        { title: "Privacy Policy", href: "/privacy", icon: Shield },
        { title: "Terms of Service", href: "/terms", icon: FileText },
        { title: "Accessibility", href: "/accessibility", icon: Users },
        { title: "Site Map", href: "/sitemap", icon: Map },
    ],
}

// Social links
const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/woodysplanner", color: "hover:text-blue-600" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/woodysplanner", color: "hover:text-sky-500" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/woodysplanner", color: "hover:text-pink-600" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/woodysplanner", color: "hover:text-red-600" },
]

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10,
        },
    },
}

export default function Footer() {
    const [email, setEmail] = useState("")
    const [isSubscribing, setIsSubscribing] = useState(false)

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setIsSubscribing(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success("Welcome to the magic! Check your inbox for a special surprise 🎉")
        setEmail("")
        setIsSubscribing(false)
    }

    return (
        <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                <AnimatedGridPattern
                    numSquares={30}
                    maxOpacity={0.1}
                    duration={3}
                    repeatDelay={1}
                    className="[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
                />
                <Meteors number={20} />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-12">
                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <MagicCard
                        className="flex flex-col items-center justify-center p-8 text-center"
                        gradientColor="#D9D9D955"
                    >
                        <SparklesText
                            className="mb-4 text-3xl font-bold font-luckiest"
                            sparklesCount={5}
                        >
                            Stay Magical
                        </SparklesText>
                        <p className="mb-6 max-w-md text-muted-foreground">
                            Get exclusive Disney planning tips, special offers, and magical updates delivered to your inbox!
                        </p>
                        <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-background/50 backdrop-blur-sm"
                                disabled={isSubscribing}
                            />
                            <Button
                                type="submit"
                                disabled={isSubscribing}
                                className="relative overflow-hidden group"
                            >
                                {isSubscribing ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                        Subscribe
                                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                                    </>
                                )}
                            </Button>
                        </form>
                        <p className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Join 50,000+ magical planners
                        </p>
                    </MagicCard>
                </motion.div>

                {/* Main Footer Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
                >
                    {/* Brand Section */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-50" />
                                <Castle className="h-10 w-10 text-primary relative z-10" />
                            </motion.div>
                            <span className="text-xl font-bold font-luckiest">Woody&apos;s Planner</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Your magical companion for planning the perfect Disney vacation.
                            Making dreams come true, one trip at a time.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        "text-muted-foreground transition-colors",
                                        social.color
                                    )}
                                >
                                    <social.icon className="h-5 w-5" />
                                    <span className="sr-only">{social.name}</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Explore Links */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Compass className="h-5 w-5 text-primary" />
                            Explore
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.explore.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <link.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            {link.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Planning Links */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Planning Tools
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.planning.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <link.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            {link.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support Links */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Support
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <link.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            {link.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>

                <Separator className="my-8" />

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left"
                >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>© {new Date().getFullYear()} Woody&apos;s Disney Vacation Planner</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> and magic
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <AnimatedShinyText className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Secure & Trusted
                        </AnimatedShinyText>
                        <AnimatedShinyText className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Available 24/7
                        </AnimatedShinyText>
                        <AnimatedShinyText className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Lightning Fast
                        </AnimatedShinyText>
                    </div>
                </motion.div>

                {/* Animated Border */}
                <BorderBeam
                    size={300}
                    duration={15}
                    delay={0}
                    className="absolute inset-0 opacity-30"
                />
            </div>
        </footer>
    )
}
