'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, ArrowUp, Send } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    const footerLinkCategories = {
        'Navigate': [
            { name: 'Home', href: '/' },
            { name: 'Parks', href: '/parks' },
            { name: 'Attractions', href: '/attractions' },
            { name: 'Dining', href: '/dining' },
        ],
        'Planning Tools': [
            { name: 'Itinerary Builder', href: '/itinerary' },
            { name: 'Group Planning', href: '/group' },
            { name: 'Budget Calculator', href: '/planning/budget' },
            { name: 'Packing Checklist', href: '/planning/checklist' }
        ],
        'Resources': [
            { name: 'Park Hours', href: '/parks/hours' },
            { name: 'Resort Information', href: '/resorts' },
            { name: 'Travel Tips', href: '/planning/travel-tips' },
            { name: 'FAQs', href: '/faq' }
        ],
        'Connect': [
            { name: 'About Us', href: '/about' },
            { name: 'Contact Support', href: '/support/contact' },
            { name: 'Terms of Service', href: '/support/terms' },
            { name: 'Privacy Policy', href: '/support/privacy' }
        ]
    }

    const socialLinks = [
        { icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com', name: 'Facebook' },
        { icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com', name: 'Twitter' },
        { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com', name: 'Instagram' },
        { icon: <Youtube className="h-5 w-5" />, href: 'https://youtube.com', name: 'YouTube' }
    ]

    const viewportOnce = { once: true, amount: 0.1 }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 80, damping: 15 }
        }
    }

    const linkHoverEffect = {
        hover: {
            x: 10,
            color: "var(--tw-color-pink-500)",
            textShadow: "0 0 8px rgba(236, 72, 153, 0.3)",
            transition: { duration: 0.3, type: "spring", stiffness: 200 }
        }
    }

    const socialIconHover = {
        hover: {
            scale: 1.2,
            rotate: 5,
            filter: "drop-shadow(0 0 10px rgba(236, 72, 153, 0.5))",
            transition: { type: 'spring', stiffness: 300 }
        },
        tap: { scale: 0.9 }
    }

    const buttonHover = {
        hover: {
            scale: 1.05,
            boxShadow: "0px 5px 20px rgba(var(--color-pink-500-rgb),0.4)",
            transition: { type: 'spring', stiffness: 300 }
        },
        tap: { scale: 0.98 }
    }

    const logoHover = {
        hover: {
            filter: "brightness(1.2)",
            transition: { duration: 0.3 }
        }
    }

    return (
        <motion.footer
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="bg-gradient-to-br from-neutral-900 via-black to-neutral-900 text-neutral-300 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-blue-700 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-purple-700 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slower"></div>
                <div className="absolute top-1/3 -right-1/3 w-1/2 h-1/2 bg-gradient-radial from-pink-700 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slowest"></div>
            </div>

            <div className="container mx-auto px-6 py-10 sm:py-14 lg:py-16 relative z-10">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12"
                >
                    <motion.div variants={itemVariants} className="lg:col-span-4 md:col-span-1">
                        <Link
                            href="/"
                            aria-label="Woody's Planning Tool logo and homepage link"
                            className="inline-block mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-sm group"
                        >
                            <motion.div
                                className="flex items-center space-x-3 group-hover:opacity-90 transition-opacity"
                                variants={logoHover}
                                whileHover="hover"
                            >
                                <div className="relative h-12 w-12 flex items-center justify-center">
                                    <motion.div
                                        className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(156,39,176,0.5)]"
                                        initial={{ scale: 0.9 }}
                                        whileInView={{
                                            scale: [0.9, 1.05, 0.9],
                                            boxShadow: [
                                                "0 0 15px rgba(156,39,176,0.5)",
                                                "0 0 22px rgba(156,39,176,0.8)",
                                                "0 0 15px rgba(156,39,176,0.5)"
                                            ]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 4,
                                            ease: "easeInOut"
                                        }}
                                        viewport={viewportOnce}
                                    >
                                        <motion.span
                                            className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"
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
                                            className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-white rounded-full"
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
                                        <motion.span
                                            className="absolute top-3 left-2 w-1 h-1 bg-white rounded-full"
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0.8, 1.2, 0.8]
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 2.2,
                                                delay: 1,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="absolute top-[-7px] left-[-2px] w-5 h-5 rounded-full bg-black shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                        initial={{ scale: 0.95 }}
                                        whileInView={{ scale: [0.95, 1.05, 0.95] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 4,
                                            ease: "easeInOut",
                                            delay: 0.2
                                        }}
                                        viewport={viewportOnce}
                                    />

                                    <motion.div
                                        className="absolute top-[-7px] right-[-2px] w-5 h-5 rounded-full bg-black shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                        initial={{ scale: 0.95 }}
                                        whileInView={{ scale: [0.95, 1.05, 0.95] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 4,
                                            ease: "easeInOut"
                                        }}
                                        viewport={viewportOnce}
                                    />
                                </div>
                                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400">
                                    Woody&apos;s
                                </span>
                            </motion.div>
                        </Link>
                        <motion.p variants={itemVariants} className="text-neutral-400 text-sm mb-5 leading-relaxed max-w-xs">
                            Crafting unforgettable Disney adventures with smart planning tools and up-to-the-minute insights.
                        </motion.p>
                        <motion.div variants={itemVariants} className="flex space-x-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variants={socialIconHover}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="p-2.5 rounded-full text-neutral-400 bg-neutral-800/70 hover:bg-gradient-to-br hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-5 md:col-span-1 grid grid-cols-2 sm:grid-cols-2 gap-8"
                    >
                        {Object.entries(footerLinkCategories).slice(0, 2).map(([category, links]) => (
                            <motion.div key={category} variants={itemVariants} className="space-y-2.5">
                                <h3 className="text-sm font-semibold mb-3 text-neutral-100 tracking-wider uppercase">
                                    {category}
                                </h3>
                                <ul className="space-y-2">
                                    {links.map((link) => (
                                        <motion.li key={link.name} variants={itemVariants}>
                                            <motion.div variants={linkHoverEffect} whileHover="hover">
                                                <Link
                                                    href={link.href}
                                                    className="text-neutral-400 hover:text-pink-500 transition-colors duration-200 text-sm pb-0.5 inline-block relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-pink-500 after:to-purple-500 hover:after:w-full after:transition-all after:duration-300"
                                                >
                                                    {link.name}
                                                </Link>
                                            </motion.div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-3 md:col-span-2 grid grid-cols-1 sm:grid-cols-1 gap-8"
                    >
                        {Object.entries(footerLinkCategories).slice(2).map(([category, links]) => (
                            <motion.div key={category} variants={itemVariants} className="space-y-2.5">
                                <h3 className="text-sm font-semibold mb-3 text-neutral-100 tracking-wider uppercase">
                                    {category}
                                </h3>
                                <ul className="space-y-2">
                                    {links.map((link) => (
                                        <motion.li key={link.name} variants={itemVariants}>
                                            <motion.div variants={linkHoverEffect} whileHover="hover">
                                                <Link
                                                    href={link.href}
                                                    className="text-neutral-400 hover:text-pink-500 transition-colors duration-200 text-sm pb-0.5 inline-block relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-pink-500 after:to-purple-500 hover:after:w-full after:transition-all after:duration-300"
                                                >
                                                    {link.name}
                                                </Link>
                                            </motion.div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-12 md:mt-14 pt-8 md:pt-10 border-t border-neutral-700/60">
                    <div className="max-w-xl mx-auto text-center">
                        <motion.h3 variants={itemVariants} className="text-xl sm:text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400">
                            Stay Ahead of the Magic
                        </motion.h3>
                        <motion.p variants={itemVariants} className="text-neutral-400 mb-6 text-sm sm:text-base max-w-md mx-auto">
                            Subscribe for exclusive Disney planning insights, park updates, and special offers delivered to your inbox.
                        </motion.p>
                        <motion.form variants={itemVariants} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                                <motion.input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-neutral-800/70 border border-neutral-700 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-neutral-500 transition-all hover:border-neutral-500 hover:bg-neutral-800"
                                    whileHover={{ boxShadow: "0 0 10px rgba(168, 85, 247, 0.2)" }}
                                    transition={{ duration: 0.2 }}
                                />
                            </div>
                            <motion.button
                                type="submit"
                                variants={buttonHover}
                                whileHover="hover"
                                whileTap="tap"
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg hover:shadow-pink-500/30 relative overflow-hidden"
                            >
                                <motion.span
                                    className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 opacity-0"
                                    whileHover={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                                <span className="relative flex items-center gap-2">
                                    <Send className="h-5 w-5" />
                                    <span>Subscribe</span>
                                </span>
                            </motion.button>
                        </motion.form>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-12 md:mt-14 pt-6 border-t border-neutral-700/60 flex flex-col md:flex-row justify-between items-center text-sm">
                    <motion.p variants={itemVariants} className="text-neutral-500 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Woody&apos;s Planning Tool. Crafted with magic.
                    </motion.p>
                    <div className="flex items-center gap-4">
                        <Link href="/support/privacy" className="text-neutral-500 hover:text-pink-400 transition-colors">Privacy</Link>
                        <span className="text-neutral-600">|</span>
                        <Link href="/support/terms" className="text-neutral-500 hover:text-pink-400 transition-colors">Terms</Link>
                        <motion.button
                            onClick={scrollToTop}
                            variants={buttonHover}
                            whileHover="hover"
                            whileTap="tap"
                            className="ml-4 p-2.5 rounded-full bg-neutral-800/70 text-neutral-400 hover:bg-gradient-to-br hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-colors"
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="bg-black/30 py-3 text-xs text-center text-neutral-600">
                <div className="container mx-auto px-4">
                    <p>
                        Woody&apos;s Planning Tool is an independent, unofficial resource and is not affiliated with, endorsed by, or sponsored by The Walt Disney Company or its affiliates.
                        All Disney parks, attractions, characters, and related elements are trademarks and &copy; Disney.
                    </p>
                </div>
            </motion.div>
        </motion.footer>
    )
}