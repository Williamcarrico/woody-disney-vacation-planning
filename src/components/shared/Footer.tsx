'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Youtube, Mail, ArrowUp } from 'lucide-react'

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    const footerLinks = {
        'Planning': [
            { name: 'Getting Started', href: '/planning/getting-started' },
            { name: 'Parks Guide', href: '/planning/parks-guide' },
            { name: 'Travel Tips', href: '/planning/travel-tips' },
            { name: 'FAQ', href: '/planning/faq' }
        ],
        'Features': [
            { name: 'Itinerary Builder', href: '/itinerary' },
            { name: 'Wait Time Tracker', href: '/attractions' },
            { name: 'Dining Reservations', href: '/dining' },
            { name: 'Group Planning', href: '/group' }
        ],
        'Parks': [
            { name: 'Magic Kingdom', href: '/parks/magic-kingdom' },
            { name: 'EPCOT', href: '/parks/epcot' },
            { name: 'Hollywood Studios', href: '/parks/hollywood-studios' },
            { name: 'Animal Kingdom', href: '/parks/animal-kingdom' }
        ],
        'Support': [
            { name: 'Contact Us', href: '/support/contact' },
            { name: 'Help Center', href: '/support/help' },
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

    return (
        <footer className="bg-black text-white relative">
            {/* Top Wavy Border */}
            <div className="w-full h-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 clip-wave"></div>

            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="block mb-4">
                            <div className="relative h-14 w-40">
                                <Image
                                    src="/images/woody.png"
                                    alt="Woody's Planning Tool"
                                    width={160}
                                    height={140}
                                    className="object-contain"
                                />
                            </div>
                        </Link>

                        <p className="text-gray-400 text-sm mb-6">
                            Creating magical vacation experiences with personalized planning tools and real-time information.
                        </p>

                        {/* Social Media Links */}
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="space-y-4">
                            <h3 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                {category}
                            </h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors flex items-center group"
                                        >
                                            <span className="h-0.5 w-0 bg-pink-500 mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter Signup */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="max-w-xl mx-auto text-center">
                        <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                            Join Our Magical Newsletter
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Get the latest updates, planning tips, and exclusive offers.
                        </p>
                        <form className="flex gap-2 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 rounded-l-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-r-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Woody&apos;s Planning Tool. All rights reserved.
                    </p>

                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                        <button
                            onClick={scrollToTop}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-white/5 py-4 text-xs text-center text-gray-500">
                <div className="container mx-auto px-4">
                    <p>
                        This is an unofficial vacation planning tool.
                        All parks, attractions, and related elements belong to their respective owners.
                    </p>
                </div>
            </div>
        </footer>
    )
}