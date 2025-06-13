"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/AuthContext"
import {
    Sun,
    Moon,
    Sparkles,
    Menu,
    X,
    LogOut,
    Settings,
    Calendar,
    Utensils,
    Users,
    DollarSign,
    MessageSquare,
    Home,
    Compass,
    Castle,
    Rocket,
    Star,
    Bell,
    Search,
    ChevronRight,
    Wand2,
    Crown,
    Gift} from "lucide-react"
import { BorderBeam } from "@/components/magicui/border-beam"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { RainbowButton } from "@/components/magicui/rainbow-button"

// Floating particles component
const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: window.innerHeight + 50,
                    }}
                    animate={{
                        y: -50,
                        x: Math.random() * window.innerWidth,
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5,
                    }}
                    style={{
                        filter: "blur(1px)",
                        boxShadow: "0 0 10px rgba(255, 255, 0, 0.5)",
                    }}
                />
            ))}
        </div>
    )
}

// Enhanced navigation items with more Disney magic
const navigationItems = [
    {
        title: "Parks",
        href: "/parks",
        icon: Castle,
        description: "Explore the magic of all Disney parks",
        gradient: "from-blue-500 to-purple-600",
        items: [
            {
                title: "Magic Kingdom",
                href: "/parks/magic-kingdom",
                icon: Castle,
                color: "text-blue-500",
                description: "Where dreams come true",
                badge: "Most Popular"
            },
            {
                title: "EPCOT",
                href: "/parks/epcot",
                icon: Rocket,
                color: "text-purple-500",
                description: "Journey around the world",
                badge: "Food & Wine"
            },
            {
                title: "Hollywood Studios",
                href: "/parks/hollywood-studios",
                icon: Star,
                color: "text-red-500",
                description: "Action and adventure await"
            },
            {
                title: "Animal Kingdom",
                href: "/parks/animal-kingdom",
                icon: Compass,
                color: "text-green-500",
                description: "Explore nature's wonders"
            },
        ],
    },
    {
        title: "Planning",
        href: "/planning",
        icon: Wand2,
        description: "Create your perfect magical day",
        gradient: "from-pink-500 to-rose-600",
        items: [
            {
                title: "Itinerary Builder",
                href: "/itinerary",
                icon: Calendar,
                color: "text-blue-500",
                description: "Plan every magical moment",
                badge: "AI Powered"
            },
            {
                title: "Dining Reservations",
                href: "/dining",
                icon: Utensils,
                color: "text-orange-500",
                description: "Book magical dining experiences"
            },
            {
                title: "Budget Tracker",
                href: "/budget",
                icon: DollarSign,
                color: "text-green-500",
                description: "Keep track of your expenses"
            },
            {
                title: "Group Planning",
                href: "/group",
                icon: Users,
                color: "text-purple-500",
                description: "Coordinate with your party"
            },
        ],
    },
    {
        title: "Explore",
        href: "/explore",
        icon: Compass,
        description: "Discover hidden gems and attractions",
        gradient: "from-orange-500 to-yellow-600",
        items: [
            {
                title: "Attractions",
                href: "/attractions",
                icon: Rocket,
                color: "text-blue-500",
                description: "Find your next adventure",
                badge: "New"
            },
            {
                title: "Resorts",
                href: "/resorts",
                icon: Home,
                color: "text-pink-500",
                description: "Rest in magical comfort"
            },
            {
                title: "Disney Springs",
                href: "/disney-springs",
                icon: Sparkles,
                color: "text-purple-500",
                description: "Shop, dine, and play"
            },
            {
                title: "Events",
                href: "/events",
                icon: Gift,
                color: "text-yellow-500",
                description: "Special celebrations year-round"
            },
        ],
    },
]

// Interactive hover card component
const HoverCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        x.set((e.clientX - rect.left) / rect.width - 0.5)
        y.set((e.clientY - rect.top) / rect.height - 0.5)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            className={cn("relative group", className)}
            style={{
                transformStyle: "preserve-3d",
            }}
        >
            <motion.div
                style={{
                    rotateY: useTransform(x, [-0.5, 0.5], [-10, 10]),
                    rotateX: useTransform(y, [-0.5, 0.5], [10, -10]),
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </motion.div>
    )
}

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const { user, logout } = useAuth()
    const { scrollY } = useScroll()

    // Spring animations for smooth interactions
    const headerY = useSpring(useTransform(scrollY, [0, 100], [0, -10]), {
        stiffness: 300,
        damping: 30,
    })

    const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.98])

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ y: headerY, opacity: headerOpacity }}
                className={cn(
                    "sticky top-0 z-50 w-full transition-all duration-500",
                    isScrolled
                        ? "bg-gradient-to-b from-background/95 via-background/90 to-background/80 backdrop-blur-2xl border-b border-border/30 shadow-2xl shadow-primary/5"
                        : "bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-xl"
                )}
            >
                {/* Magical background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient-x" />
                    <FloatingParticles />
                </div>

                <div className="container relative mx-auto px-4">
                    <div className="flex h-20 items-center justify-between">
                        {/* Logo with enhanced animations */}
                        <Link href="/" className="flex items-center space-x-3 group relative">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500" />
                                <Castle className="h-10 w-10 text-primary relative z-10 drop-shadow-lg" />
                                <motion.div
                                    className="absolute -top-1 -right-1"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                >
                                    <Sparkles className="h-4 w-4 text-yellow-400" />
                                </motion.div>
                            </motion.div>
                            <div className="relative">
                                <SparklesText
                                    className="text-2xl font-bold font-luckiest hidden sm:block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
                                    sparklesCount={5}
                                >
                                    Woody&apos;s Planner
                                </SparklesText>
                                <motion.div
                                    className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                />
                            </div>
                        </Link>

                        {/* Desktop Navigation with enhanced styling */}
                        <NavigationMenu className="hidden lg:flex">
                            <NavigationMenuList className="space-x-2">
                                {navigationItems.map((item, index) => (
                                    <NavigationMenuItem key={item.title}>
                                        <NavigationMenuTrigger className="bg-transparent hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 data-[state=open]:bg-gradient-to-r data-[state=open]:from-primary/20 data-[state=open]:to-secondary/20 px-4 py-2 rounded-xl transition-all duration-300 group">
                                            <motion.div
                                                className="flex items-center space-x-2"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", item.gradient, "group-hover:shadow-lg transition-all duration-300")}>
                                                    <item.icon className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="font-medium">{item.title}</span>
                                            </motion.div>
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                                className="relative"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg" />
                                                <div className="grid w-[450px] gap-3 p-6 md:w-[550px] md:grid-cols-2 lg:w-[700px] relative">
                                                    <div className="row-span-3">
                                                        <NavigationMenuLink asChild>
                                                            <HoverCard>
                                                                <Link
                                                                    className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                                                                    href={item.href}
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                                    <div className={cn("p-3 rounded-xl bg-gradient-to-br mb-4 w-fit", item.gradient, "shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110")}>
                                                                        <item.icon className="h-8 w-8 text-white" />
                                                                    </div>
                                                                    <div className="mb-2 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                                        {item.title}
                                                                    </div>
                                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                                        {item.description}
                                                                    </p>
                                                                    <motion.div
                                                                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100"
                                                                        initial={{ x: -10 }}
                                                                        whileHover={{ x: 0 }}
                                                                    >
                                                                        <ChevronRight className="h-5 w-5 text-primary" />
                                                                    </motion.div>
                                                                </Link>
                                                            </HoverCard>
                                                        </NavigationMenuLink>
                                                    </div>
                                                    {item.items?.map((subItem, subIndex) => (
                                                        <NavigationMenuLink key={subItem.title} asChild>
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: subIndex * 0.05 }}
                                                            >
                                                                <Link
                                                                    href={subItem.href}
                                                                    className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:scale-[1.02] focus:bg-accent focus:text-accent-foreground group relative overflow-hidden"
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500" />
                                                                    <div className="flex items-center space-x-3 relative">
                                                                        <div className={cn("p-1.5 rounded-lg bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm group-hover:scale-110 transition-all duration-300", subItem.color)}>
                                                                            <subItem.icon className={cn("h-4 w-4 transition-all duration-300", subItem.color)} />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
                                                                                    {subItem.title}
                                                                                </div>
                                                                                {subItem.badge && (
                                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-medium">
                                                                                        {subItem.badge}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {subItem.description && (
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    {subItem.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-primary" />
                                                                    </div>
                                                                </Link>
                                                            </motion.div>
                                                        </NavigationMenuLink>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* Right Side Actions with enhanced effects */}
                        <div className="flex items-center space-x-3">
                            {/* Enhanced Search */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative hidden sm:block"
                            >
                                <motion.div
                                    className={cn(
                                        "absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl transition-all duration-500",
                                        searchFocused ? "opacity-100 scale-110" : "opacity-0 scale-100"
                                    )}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative overflow-hidden rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                >
                                    <Search className="h-5 w-5" />
                                    <span className="sr-only">Search</span>
                                </Button>
                            </motion.div>

                            {/* Enhanced Notifications */}
                            {user && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative overflow-hidden rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <motion.span
                                            className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [1, 0.8, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        <span className="sr-only">Notifications</span>
                                    </Button>
                                </motion.div>
                            )}

                            {/* Enhanced Theme Toggle */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="relative overflow-hidden rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
                                >
                                    <AnimatePresence mode="wait">
                                        {theme === "dark" ? (
                                            <motion.div
                                                key="moon"
                                                initial={{ rotate: -90, opacity: 0, scale: 0 }}
                                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                exit={{ rotate: 90, opacity: 0, scale: 0 }}
                                                transition={{ duration: 0.3, type: "spring" }}
                                                className="absolute"
                                            >
                                                <Moon className="h-5 w-5" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="sun"
                                                initial={{ rotate: 90, opacity: 0, scale: 0 }}
                                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                exit={{ rotate: -90, opacity: 0, scale: 0 }}
                                                transition={{ duration: 0.3, type: "spring" }}
                                                className="absolute"
                                            >
                                                <Sun className="h-5 w-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </motion.div>

                            {/* Enhanced User Menu */}
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 hover:scale-105 transition-transform">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-md" />
                                            <Avatar className="h-11 w-11 ring-[2px] ring-primary/20 ring-offset-2 ring-offset-background">
                                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                                                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64" align="end" forceMount>
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.photoURL || undefined} />
                                                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                                            {user.displayName?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="text-sm font-semibold leading-none">{user.displayName || "Guest"}</p>
                                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/dashboard" className="cursor-pointer group">
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all mr-2">
                                                        <Crown className="h-4 w-4 text-primary" />
                                                    </div>
                                                    Dashboard
                                                    <span className="ml-auto text-xs text-muted-foreground">Pro</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/settings" className="cursor-pointer group">
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-600/10 group-hover:from-gray-500/20 group-hover:to-gray-600/20 transition-all mr-2">
                                                        <Settings className="h-4 w-4" />
                                                    </div>
                                                    Settings
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/messages" className="cursor-pointer group">
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-500/10 group-hover:from-green-500/20 group-hover:to-teal-500/20 transition-all mr-2">
                                                        <MessageSquare className="h-4 w-4" />
                                                    </div>
                                                    Messages
                                                    <span className="ml-auto text-xs bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-2 py-0.5 rounded-full font-semibold">3</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600 group">
                                                <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all mr-2">
                                                    <LogOut className="h-4 w-4" />
                                                </div>
                                                Sign out
                                            </DropdownMenuItem>
                                        </motion.div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/auth/signin">
                                    <RainbowButton className="hidden sm:flex shadow-lg hover:shadow-2xl transition-all duration-300">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Sign In
                                    </RainbowButton>
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <AnimatePresence mode="wait">
                                    {isMobileMenuOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                        >
                                            <X className="h-6 w-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                        >
                                            <Menu className="h-6 w-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Animated Border with gradient */}
                <BorderBeam
                    size={300}
                    duration={15}
                    delay={9}
                    className="opacity-30"
                />
            </motion.header>

            {/* Enhanced Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, type: "spring" }}
                        className="fixed inset-x-0 top-20 z-40 lg:hidden"
                    >
                        <div className="bg-gradient-to-b from-background/98 to-background/95 backdrop-blur-2xl border-b border-border/30 shadow-2xl">
                            <nav className="container mx-auto px-4 py-6">
                                <div className="space-y-6">
                                    {navigationItems.map((item, index) => (
                                        <motion.div
                                            key={item.title}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="space-y-3"
                                        >
                                            <Link
                                                href={item.href}
                                                className="flex items-center space-x-3 text-lg font-semibold hover:text-primary transition-colors group"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className={cn("p-2 rounded-lg bg-gradient-to-br", item.gradient, "group-hover:shadow-lg transition-all duration-300")}>
                                                    <item.icon className="h-5 w-5 text-white" />
                                                </div>
                                                <span>{item.title}</span>
                                                <ChevronRight className="h-5 w-5 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                            <div className="ml-12 space-y-2">
                                                {item.items?.map((subItem) => (
                                                    <Link
                                                        key={subItem.title}
                                                        href={subItem.href}
                                                        className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{subItem.title}</span>
                                                            {subItem.badge && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary">
                                                                    {subItem.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {!user && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: navigationItems.length * 0.1 }}
                                        >
                                            <Link
                                                href="/auth/signin"
                                                className="block"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg">
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Sign In to the Magic
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}