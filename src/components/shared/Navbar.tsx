'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, LogIn, User, MoonStar, Sun, ChevronDown, Home, Map, Calendar, Utensils, TicketIcon, DollarSign, Lightbulb, HelpCircle, Hotel, Users, Sparkles, ShoppingBag, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { APP_NAME, APP_FULL_NAME } from '@/lib/utils/constants'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [hoveredPath, setHoveredPath] = useState('')
    const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pathname = usePathname()

    // Clear timeout on component unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        const checkDarkMode = () => {
            if (typeof window !== 'undefined') {
                const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches
                const explicitPreference = localStorage.getItem('theme')
                if (explicitPreference === 'dark') {
                    document.documentElement.classList.add('dark')
                    setIsDarkMode(true)
                } else if (explicitPreference === 'light') {
                    document.documentElement.classList.remove('dark')
                    setIsDarkMode(false)
                } else {
                    setIsDarkMode(darkModePreference)
                    if (darkModePreference) document.documentElement.classList.add('dark')
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        checkDarkMode()

        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleDarkModeChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.documentElement.classList.add('dark')
                    setIsDarkMode(true)
                } else {
                    document.documentElement.classList.remove('dark')
                    setIsDarkMode(false)
                }
            }
        }
        darkModeMediaQuery.addEventListener('change', handleDarkModeChange)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            darkModeMediaQuery.removeEventListener('change', handleDarkModeChange)
        }
    }, [])

    const toggleDarkMode = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDarkMode(false)
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDarkMode(true)
        }
    }

    // Define dropdown menus
    const dropdownMenus = {
        planning: {
            title: 'Planning',
            icon: <Calendar className="h-4 w-4" />,
            items: [
                { name: 'Trip Planning', href: '/dashboard/planning', icon: <Calendar className="h-4 w-4" /> },
                { name: 'Itinerary Optimizer', href: '/dashboard/optimizer', icon: <Sparkles className="h-4 w-4" /> },
                { name: 'Vacation Party', href: '/dashboard/group', icon: <Users className="h-4 w-4" /> },
                { name: 'Budget Calculator', href: '/budget', icon: <DollarSign className="h-4 w-4" /> },
                { name: 'Tips & Tricks', href: '/tips-tricks', icon: <Lightbulb className="h-4 w-4" /> },
                { name: 'FAQ', href: '/faq', icon: <HelpCircle className="h-4 w-4" /> },
            ]
        },
        destinations: {
            title: 'Destinations',
            icon: <Map className="h-4 w-4" />,
            items: [
                { name: 'Parks', href: '/dashboard/parks/history', icon: <TicketIcon className="h-4 w-4" /> },
                { name: 'Attractions', href: '/dashboard/attractions', icon: <Sparkles className="h-4 w-4" /> },
                { name: 'Resorts', href: '/dashboard/resorts', icon: <Hotel className="h-4 w-4" /> },
                { name: 'Disney Springs', href: '/dashboard/disneysprings', icon: <ShoppingBag className="h-4 w-4" /> },
                { name: 'Interactive Map', href: '/map', icon: <Map className="h-4 w-4" /> },
            ]
        },
        experiences: {
            title: 'Experiences',
            icon: <Sparkles className="h-4 w-4" />,
            items: [
                { name: 'Dining', href: '/dashboard/dining', icon: <Utensils className="h-4 w-4" /> },
                { name: 'Events', href: '/dashboard/events', icon: <Calendar className="h-4 w-4" /> },
                { name: 'Annual Passes', href: '/annual-passes', icon: <TicketIcon className="h-4 w-4" /> },
            ]
        }
    }

    // Legacy nav links for direct top-level navigation
    const standaloneNavLinks = [
        { name: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
        { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
    ]

    const logoVariants = {
        scrolled: { scale: 0.9, y: -2 },
        top: { scale: 1, y: 0 },
    }

    const navContainerVariants = {
        scrolled: {
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(10px)',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        top: {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            backdropFilter: 'blur(0px)',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            boxShadow: '0 0px 0px 0px rgba(0, 0, 0, 0)',
        },
    }

    if (isDarkMode) {
        navContainerVariants.scrolled.backgroundColor = 'rgba(17, 24, 39, 0.8)'
    } else {
        navContainerVariants.scrolled.backgroundColor = 'rgba(255, 255, 255, 0.8)'
    }

    const handleDropdownHover = (key: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setHoveredDropdown(key)
    }

    const handleDropdownLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setHoveredDropdown(null)
        }, 300)
    }

    // Check if the current path matches any item in a dropdown menu
    const isDropdownActive = (dropdown: { items: { href: string }[] }) => {
        return dropdown.items.some(item => pathname === item.href)
    }

    return (
        <motion.nav
            initial="top"
            animate={isScrolled ? 'scrolled' : 'top'}
            variants={navContainerVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 w-full z-50"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <motion.div
                        variants={logoVariants}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <Link href="/" className="relative flex items-center group">
                            <div
                                role="img"
                                aria-label={`${APP_FULL_NAME} Mickey-inspired logo`}
                                className="relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                            >
                                <motion.div
                                    className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(109,40,217,0.5)] overflow-hidden"
                                    initial={{ scale: 0.9 }}
                                    animate={{
                                        scale: [0.9, 1.05, 0.9],
                                        boxShadow: [
                                            "0 0 15px rgba(109,40,217,0.5)",
                                            "0 0 20px rgba(109,40,217,0.8)",
                                            "0 0 15px rgba(109,40,217,0.5)"
                                        ]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {/* Castle silhouette inside the circle */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="castle-silhouette w-4 h-4 opacity-70"></div>
                                    </div>

                                    <motion.span
                                        className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0.8, 1.2, 0.8]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 2,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <motion.span
                                        className="absolute bottom-2 left-1 w-1 h-1 bg-white rounded-full"
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0.8, 1.2, 0.8]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            delay: 0.5,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>

                                {/* Mickey ear accents */}
                                <motion.div
                                    className="absolute top-[-5px] sm:top-[-6px] left-[-1px] sm:left-[-2px] w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: [0.95, 1.05, 0.95] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3.5,
                                        ease: "easeInOut",
                                        delay: 0.2
                                    }}
                                />

                                <motion.div
                                    className="absolute top-[-5px] sm:top-[-6px] right-[-1px] sm:right-[-2px] w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: [0.95, 1.05, 0.95] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3.5,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>
                            <span className={`ml-3 text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hidden sm:block transition-opacity duration-300 ${isScrolled ? 'opacity-0 sm:opacity-100' : 'opacity-100'} font-luckiest`}>
                                {APP_NAME}
                            </span>
                            <span className={`ml-1 text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 hidden md:block transition-opacity duration-300 ${isScrolled ? 'opacity-0 md:opacity-100' : 'opacity-100'} font-cabin-sketch`}>
                                Disney Vacation Planning
                            </span>
                        </Link>
                    </motion.div>

                    <LayoutGroup>
                        <div className="hidden md:flex items-center space-x-1 bg-neutral-800/50 dark:bg-neutral-900/60 p-1 rounded-full shadow-inner">
                            {/* Standalone Direct Links */}
                            {standaloneNavLinks.map((link) => {
                                const isActive = pathname === link.href

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onMouseEnter={() => setHoveredPath(link.href)}
                                        onMouseLeave={() => setHoveredPath('')}
                                        className={`px-4 py-2 rounded-full text-sm font-medium relative transition-colors duration-200 flex items-center gap-1
                                            ${isActive ? 'text-white' : 'text-neutral-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100'}
                                        `}
                                    >
                                        {link.icon}
                                        <span>{link.name}</span>
                                        {(isActive || hoveredPath === link.href) && (
                                            <motion.div
                                                layoutId="activeNavLinkHighlight"
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full z-[-1]"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
                                            />
                                        )}
                                        {isActive && <span className="absolute inset-0 mix-blend-overlay rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{ textShadow: '0 0 5px var(--tw-prose-body)' }}></span>}
                                    </Link>
                                )
                            })}

                            {/* Dropdown Menus */}
                            {Object.entries(dropdownMenus).map(([key, dropdown]) => {
                                const isActive = isDropdownActive(dropdown)

                                return (
                                    <div
                                        key={key}
                                        className="relative"
                                        onMouseEnter={() => handleDropdownHover(key)}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        <button
                                            className={`px-4 py-2 rounded-full text-sm font-medium relative transition-colors duration-200 flex items-center gap-1
                                                ${isActive ? 'text-white' : 'text-neutral-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100'}
                                            `}
                                        >
                                            {dropdown.icon}
                                            <span>{dropdown.title}</span>
                                            <ChevronDown className="h-3.5 w-3.5 ml-1 transition-transform duration-200"
                                                style={{ transform: hoveredDropdown === key ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            />
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeNavLinkHighlight"
                                                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full z-[-1]"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
                                                />
                                            )}
                                        </button>

                                        {hoveredDropdown === key && (
                                            <AnimatePresence>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 rounded-lg bg-neutral-800/95 dark:bg-neutral-900/95 shadow-lg backdrop-blur-sm overflow-hidden z-50"
                                                >
                                                    <div className="p-1.5 flex flex-col">
                                                        {dropdown.items.map((item) => {
                                                            const isItemActive = pathname === item.href

                                                            return (
                                                                <Link
                                                                    key={item.name}
                                                                    href={item.href}
                                                                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200
                                                                        ${isItemActive
                                                                            ? 'bg-gradient-to-r from-blue-600/20 to-pink-600/20 text-white'
                                                                            : 'hover:bg-neutral-700/50 dark:hover:bg-neutral-800/50 text-neutral-300 dark:text-neutral-400 hover:text-white'
                                                                        }
                                                                    `}
                                                                >
                                                                    {item.icon}
                                                                    <span>{item.name}</span>
                                                                    {isItemActive && (
                                                                        <span className="flex-grow flex justify-end">
                                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            </AnimatePresence>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </LayoutGroup>

                    <div className="hidden md:flex items-center space-x-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-full text-neutral-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100 hover:bg-neutral-700/70 dark:hover:bg-neutral-800/70 transition-colors"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isDarkMode ? (
                                    <motion.div key="sun" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Sun className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <MoonStar className="h-5 w-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        <motion.div whileHover={{ scale: 1.05 }} >
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-neutral-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100 hover:bg-neutral-700/70 dark:hover:bg-neutral-800/70 transition-colors"
                            >
                                <LogIn className="h-4 w-4" />
                                <span className="text-sm">Login</span>
                            </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Link
                                href="/signup"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                            >
                                <User className="h-4 w-4" />
                                <span className="text-sm">Sign Up</span>
                            </Link>
                        </motion.div>
                    </div>

                    <div className="md:hidden flex items-center">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleDarkMode}
                            className="p-2.5 mr-2 rounded-full text-neutral-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100 hover:bg-neutral-700/70 dark:hover:bg-neutral-800/70 transition-colors"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isDarkMode ? (
                                    <motion.div key="sun-mobile" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Sun className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon-mobile" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <MoonStar className="h-5 w-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                        <motion.button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 rounded-full text-neutral-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100 hover:bg-neutral-700/70 dark:hover:bg-neutral-800/70 transition-colors"
                            aria-label="Toggle menu"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isMenuOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <X className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Menu className="h-6 w-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden absolute top-full left-0 w-full bg-neutral-900/95 dark:bg-black/95 backdrop-blur-lg shadow-xl pb-8 max-h-[80vh] overflow-y-auto"
                    >
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col space-y-1">
                            {/* Standalone Links */}
                            {standaloneNavLinks.map((link, index) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-2 px-4 py-3 text-base font-medium rounded-md transition-all duration-200
                                            ${pathname === link.href
                                                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white'
                                                : 'text-neutral-300 dark:text-neutral-400 hover:bg-neutral-700/50 dark:hover:bg-neutral-800/50 hover:text-white'
                                            }`}
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Dropdown Sections For Mobile */}
                            {Object.entries(dropdownMenus).map(([key, dropdown], sectionIndex) => (
                                <div key={key} className="pt-3 first:pt-0">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: standaloneNavLinks.length * 0.05 + sectionIndex * 0.05, duration: 0.3, ease: 'easeOut' }}
                                        className="px-4 py-2 text-sm font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-2"
                                    >
                                        {dropdown.icon}
                                        {dropdown.title}
                                    </motion.div>
                                    <div className="pl-4 border-l border-neutral-800 dark:border-neutral-700 ml-3 mt-1 space-y-1">
                                        {dropdown.items.map((item, itemIndex) => (
                                            <motion.div
                                                key={item.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: standaloneNavLinks.length * 0.05 + sectionIndex * 0.05 + (itemIndex + 1) * 0.04,
                                                    duration: 0.3,
                                                    ease: 'easeOut'
                                                }}
                                            >
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`flex items-center gap-2 px-4 py-2.5 text-base font-medium rounded-md transition-all duration-200
                                                        ${pathname === item.href
                                                            ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-white'
                                                            : 'text-neutral-300 dark:text-neutral-400 hover:bg-neutral-700/30 dark:hover:bg-neutral-800/30 hover:text-white'
                                                        }`}
                                                >
                                                    {item.icon}
                                                    {item.name}
                                                    {pathname === item.href && (
                                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    )}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-neutral-700/50 dark:border-neutral-800/50">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }}>
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full mb-3 px-4 py-3 rounded-md text-base font-medium bg-neutral-700/80 dark:bg-neutral-800/80 text-neutral-100 hover:bg-neutral-600/80 dark:hover:bg-neutral-700/80 transition-colors"
                                >
                                    <LogIn className="h-5 w-5" />
                                    <span>Login</span>
                                </Link>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }}>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-base font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
                                >
                                    <User className="h-5 w-5" />
                                    <span>Sign Up</span>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}