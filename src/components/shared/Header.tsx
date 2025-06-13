"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
    User,
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
    ChevronRight
} from "lucide-react"
import { BorderBeam } from "@/components/magicui/border-beam"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { RainbowButton } from "@/components/magicui/rainbow-button"

// Navigation items configuration
const navigationItems = [
    {
        title: "Parks",
        href: "/parks",
        icon: Castle,
        description: "Explore all Disney parks",
        items: [
            { title: "Magic Kingdom", href: "/parks/magic-kingdom", icon: Castle, color: "text-blue-500" },
            { title: "EPCOT", href: "/parks/epcot", icon: Rocket, color: "text-purple-500" },
            { title: "Hollywood Studios", href: "/parks/hollywood-studios", icon: Star, color: "text-red-500" },
            { title: "Animal Kingdom", href: "/parks/animal-kingdom", icon: Compass, color: "text-green-500" },
        ],
    },
    {
        title: "Planning",
        href: "/planning",
        icon: Calendar,
        description: "Plan your perfect trip",
        items: [
            { title: "Itinerary Builder", href: "/itinerary", icon: Calendar, color: "text-blue-500" },
            { title: "Dining Reservations", href: "/dining", icon: Utensils, color: "text-orange-500" },
            { title: "Budget Tracker", href: "/budget", icon: DollarSign, color: "text-green-500" },
            { title: "Group Planning", href: "/group", icon: Users, color: "text-purple-500" },
        ],
    },
    {
        title: "Explore",
        href: "/explore",
        icon: Compass,
        description: "Discover attractions",
        items: [
            { title: "Attractions", href: "/attractions", icon: Rocket, color: "text-blue-500" },
            { title: "Resorts", href: "/resorts", icon: Home, color: "text-pink-500" },
            { title: "Disney Springs", href: "/disney-springs", icon: Sparkles, color: "text-purple-500" },
            { title: "Events", href: "/events", icon: Star, color: "text-yellow-500" },
        ],
    },
]

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const { user, logout } = useAuth()

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
                className={cn(
                    "sticky top-0 z-40 w-full transition-all duration-300",
                    isScrolled
                        ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
                        : "bg-background/50 backdrop-blur-md"
                )}
            >
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                                <Castle className="h-8 w-8 text-primary relative z-10" />
                            </motion.div>
                            <SparklesText
                                className="text-xl font-bold font-luckiest hidden sm:block"
                                sparklesCount={3}
                            >
                                Woody&apos;s Planner
                            </SparklesText>
                        </Link>

                        {/* Desktop Navigation */}
                        <NavigationMenu className="hidden lg:flex">
                            <NavigationMenuList>
                                {navigationItems.map((item) => (
                                    <NavigationMenuItem key={item.title}>
                                        <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50">
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                <div className="row-span-3">
                                                    <NavigationMenuLink asChild>
                                                        <Link
                                                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:shadow-lg transition-all group"
                                                            href={item.href}
                                                        >
                                                            <item.icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                                                            <div className="mb-2 mt-4 text-lg font-medium">
                                                                {item.title}
                                                            </div>
                                                            <p className="text-sm leading-tight text-muted-foreground">
                                                                {item.description}
                                                            </p>
                                                        </Link>
                                                    </NavigationMenuLink>
                                                </div>
                                                {item.items?.map((subItem) => (
                                                    <NavigationMenuLink key={subItem.title} asChild>
                                                        <Link
                                                            href={subItem.href}
                                                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <subItem.icon className={cn("h-4 w-4 transition-colors", subItem.color)} />
                                                                <div className="text-sm font-medium leading-none">
                                                                    {subItem.title}
                                                                </div>
                                                                <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </Link>
                                                    </NavigationMenuLink>
                                                ))}
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Search Button */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative overflow-hidden"
                                >
                                    <Search className="h-5 w-5" />
                                    <span className="sr-only">Search</span>
                                </Button>
                            </motion.div>

                            {/* Notifications */}
                            {user && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative overflow-hidden"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="sr-only">Notifications</span>
                                    </Button>
                                </motion.div>
                            )}

                            {/* Theme Toggle */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="relative overflow-hidden"
                                >
                                    <AnimatePresence mode="wait">
                                        {theme === "dark" ? (
                                            <motion.div
                                                key="moon"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Moon className="h-5 w-5" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="sun"
                                                initial={{ rotate: 90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: -90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Sun className="h-5 w-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </motion.div>

                            {/* User Menu */}
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                            <Avatar className="h-10 w-10 ring-2">
                                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.displayName || "Guest"}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings" className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/messages" className="cursor-pointer">
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                Messages
                                                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">3</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/auth/signin">
                                    <RainbowButton className="hidden sm:flex">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Sign In
                                    </RainbowButton>
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
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

                {/* Animated Border */}
                <BorderBeam
                    size={250}
                    duration={12}
                    delay={9}
                    className="opacity-50"
                />
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-x-0 top-16 z-30 lg:hidden"
                    >
                        <div className="bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-xl">
                            <nav className="container mx-auto px-4 py-4">
                                <div className="space-y-4">
                                    {navigationItems.map((item) => (
                                        <div key={item.title} className="space-y-2">
                                            <Link
                                                href={item.href}
                                                className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.title}</span>
                                            </Link>
                                            <div className="ml-7 space-y-1">
                                                {item.items?.map((subItem) => (
                                                    <Link
                                                        key={subItem.title}
                                                        href={subItem.href}
                                                        className="block py-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {!user && (
                                        <Link
                                            href="/auth/signin"
                                            className="block"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Button className="w-full">
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Sign In
                                            </Button>
                                        </Link>
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