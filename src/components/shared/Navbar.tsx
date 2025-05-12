'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LogIn, User, MoonStar, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'))
        }

        window.addEventListener('scroll', handleScroll)
        checkDarkMode()

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark')
        setIsDarkMode(!isDarkMode)
    }

    const navLinks = [
        { name: 'Parks', href: '/parks' },
        { name: 'Attractions', href: '/attractions' },
        { name: 'Dining', href: '/dining' },
        { name: 'Planning', href: '/planning' },
        { name: 'Itinerary', href: '/itinerary' },
    ]

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative flex items-center">
                        <div className="relative h-12 w-36 overflow-hidden">
                            <Image
                                src="/images/woody.png"
                                alt="Woody's Planning Tool"
                                width={100}
                                height={56}
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                        <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 hidden md:block">
                            Woody's Planning Tool
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:text-pink-400 relative group ${pathname === link.href ? 'text-pink-400' : 'text-white'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ${pathname === link.href ? 'w-4/5' : 'w-0 group-hover:w-2/3'
                                    }`}></span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Menu (Desktop) */}
                    <div className="hidden md:flex items-center space-x-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
                        </button>

                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white hover:bg-white/10 transition-colors"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Login</span>
                        </Link>

                        <Link
                            href="/signup"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
                        >
                            <User className="h-4 w-4" />
                            <span>Sign Up</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-white rounded-full hover:bg-white/10"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-black/95 pt-20 px-4 md:hidden flex flex-col animate-fadeIn backdrop-blur-lg">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 text-lg font-medium border-l-4 ${pathname === link.href
                                        ? 'border-pink-500 text-pink-400 bg-pink-500/10'
                                        : 'border-transparent text-white hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/10'
                                        } transition-all duration-300`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto mb-10 grid grid-cols-2 gap-3 pt-6 border-t border-white/20">
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
                                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                            </button>

                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
                            >
                                <LogIn className="h-5 w-5" />
                                <span>Login</span>
                            </Link>

                            <Link
                                href="/signup"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 py-3 col-span-2 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
                            >
                                <User className="h-5 w-5" />
                                <span>Sign Up</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}