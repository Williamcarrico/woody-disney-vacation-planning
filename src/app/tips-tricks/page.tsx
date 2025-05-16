'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import {
    Calendar,
    DollarSign,
    Map,
    Home,
    Ticket,
    UtensilsCrossed,
    Smartphone,
    Sparkles,
    Baby,
    CalendarClock,
    Footprints,
    PackageOpen,
    Wine,
    Search,
    ChevronRight
} from 'lucide-react';

// Define categories and their icons
const categories = [
    { id: 'booking', name: 'Booking & Timing', icon: <Calendar className="h-6 w-6" /> },
    { id: 'accommodation', name: 'Accommodation', icon: <Home className="h-6 w-6" /> },
    { id: 'tickets', name: 'Tickets & Passes', icon: <Ticket className="h-6 w-6" /> },
    { id: 'money', name: 'Money-Saving', icon: <DollarSign className="h-6 w-6" /> },
    { id: 'navigation', name: 'Park Navigation', icon: <Map className="h-6 w-6" /> },
    { id: 'dining', name: 'Dining', icon: <UtensilsCrossed className="h-6 w-6" /> },
    { id: 'tech', name: 'Tech Tips', icon: <Smartphone className="h-6 w-6" /> },
    { id: 'hidden', name: 'Hidden Gems', icon: <Sparkles className="h-6 w-6" /> },
    { id: 'kids', name: 'Tips for Kids', icon: <Baby className="h-6 w-6" /> },
    { id: 'seasonal', name: 'Seasonal Events', icon: <CalendarClock className="h-6 w-6" /> },
    { id: 'hopping', name: 'Park Hopping', icon: <Footprints className="h-6 w-6" /> },
    { id: 'packing', name: 'Packing Tips', icon: <PackageOpen className="h-6 w-6" /> },
    { id: 'adults', name: 'For Adults', icon: <Wine className="h-6 w-6" /> },
];

// Define the tips data structure
const tipsData = {
    booking: [
        {
            title: 'Best times to visit',
            description: 'Book during off-peak times, like early September or late January. We\'ve found the crowds are smaller and the weather more pleasant.'
        },
        {
            title: 'Dining reservations',
            description: 'Make dining reservations 60 days in advance (or 60+10 for Disney Resort guests). Popular restaurants like Be Our Guest book up fast!'
        },
        {
            title: 'Travel agency benefits',
            description: 'Use a high-rated Disney travel agency like The Vacationeer. They\'ve helped us plan, find deals, and save time—at no extra cost.'
        },
        { title: 'Airport selection', description: 'Book flights to Orlando International Airport (MCO). It offers the most convenient airport access to Disney World.' },
        { title: 'TSA checkpoint optimization', description: 'When flying into MCO, use the free Reserve Powered by Clear service. It can potentially reduce your TSA checkpoint wait times.' },
        { title: 'Rest days', description: 'Plan for at least one rest day during your trip. We learned this the hard way after a week of non-stop park hopping left us exhausted.' },
        { title: 'Crowd calendar planning', description: 'Check our Disney Crowd Calendar before booking. We use these to plan our visits during less busy periods.' }
    ],
    accommodation: [
        { title: 'Budget-friendly options', description: 'Consider staying at Disney Value Resorts like Pop Century for budget-friendly trips. The Skyliner access is a bonus!' },
        { title: 'Off-property savings', description: 'Stay off-property for savings. Some nearby hotels offer complimentary transportation to Disney parks.' },
        {
            title: 'Disney Vacation Club benefits', description: 'Join Disney Vacation Club for significant savings on accommodations. It\'s been worth it for our frequent visits.'
        },
        {
            title: 'DVC point rentals', description: 'Consider renting DVC points for luxury accommodations at a fraction of the cost. We\'ve stayed at Animal Kingdom Lodge this way!'
        },
        { title: 'Strategic resort location', description: 'Research resort locations relative to your favorite parks. Staying close to your most-visited park can save valuable time.' }
    ],
    tickets: [
        { title: 'Park Hopper advantages', description: 'Consider Park Hopper tickets for flexibility. Our family loves starting at Magic Kingdom and ending at Epcot for dinner in World Showcase.' },
        {
            title: 'Annual Pass calculations', description: 'Do the math on Annual Passes. For our family, they\'ve provided significant savings when visiting 11-12 or more days per year.'
        },
        {
            title: 'AAA discounts', description: 'Join AAA for hotel discounts. We\'ve offset membership costs through savings on accommodations.'
        },
        { title: 'Special discounts', description: 'Look into special ticket offers for Florida residents or military members. These can offer substantial savings if you qualify.' }
    ],
    money: [
        { title: 'Special offers', description: 'Check for special offers on Disney\'s official website before booking. We\'ve found resort packages that saved us up to 30% on our stay!' },
        { title: 'Discounted gift cards', description: 'Buy discounted Disney gift cards at Target with a RedCard for 5% off. We use these for everything from meals to souvenirs.' },
        { title: 'Airport transportation', description: 'Use rideshare services like Uber or Lyft for convenient airport transfers. Often cheaper than taxis or car rentals.' },
        {
            title: 'Travel insurance', description: 'Consider purchasing travel insurance. It\'s given us peace of mind for our bigger Disney trips.'
        },
        { title: 'Bring your own supplies', description: 'Pack your own ponchos, autograph books, and glow sticks. Disney-branded versions can be pricey in the parks.' },
        { title: 'Water and snacks', description: 'Bring refillable water bottles and snacks. We fill up at water fountains or ask for free ice water at quick-service locations.' },
        { title: 'Share meals', description: `Share meals at table-service restaurants to cut costs. We've found portions are often large enough to split.` },
        { title: 'Souvenir shopping', description: `Avoid buying Disney souvenirs in the parks. We shop at Disney outlet stores or online for better deals.` },
        { title: 'Park Hopper alternatives', description: `Skip the Park Hopper option if you are on a tight budget. We've found focusing on one park per day can be just as enjoyable and more relaxed.` },
        { title: 'Bring your own stroller', description: `Bring your own stroller for young kids. Renting strollers can add up quickly over multiple days.` },
        { title: 'Budget control', description: `Use Disney gift cards to stick to your budget. It helps us avoid overspending.` }
    ],
    navigation: [
        { title: 'Early arrival', description: `Arrive 30-45 minutes before park opening for shorter lines. We've walked onto Seven Dwarfs Mine Train this way!` },
        { title: 'App utilization', description: `Use the My Disney Experience app to check wait times and make Lightning Lane reservations. It's been invaluable for our family.` },
        { title: 'Early Theme Park Entry', description: 'Take advantage of Early Theme Park Entry if staying at any Disney Resort. Those extra 30 minutes make a big difference!' },
        { title: 'Extended Evening Hours', description: 'Use Extended Evening Hours if staying at a Disney Deluxe Resort. The parks are magical with smaller crowds at night.' },
        { title: 'Lightning Lane strategies', description: 'Use the Lightning Lane Multi Pass system to book up to three experiences seven days in advance if staying at a Disney Resort. It\'s a game-changer for popular rides!' },
        { title: 'Early Theme Park Entry', description: `Take advantage of Early Theme Park Entry if staying at any Disney Resort. Those extra 30 minutes make a big difference!` },
        { title: 'Extended Evening Hours', description: `Use Extended Evening Hours if staying at a Disney Deluxe Resort. The parks are magical with smaller crowds at night.` },
        { title: 'Lightning Lane strategies', description: `Use the Lightning Lane Multi Pass system to book up to three experiences seven days in advance if staying at a Disney Resort. It's a game-changer for popular rides!` },
        { title: 'Strategic timing', description: `Visit popular attractions during parades or fireworks. We rode Space Mountain twice during one fireworks show!` },
        { title: 'Single Rider benefits', description: `Use Single Rider Lines when available. My son loves this option for multiple rides on Test Track.` },
        { title: 'Quiet areas', description: `Explore less crowded areas like Tom Sawyer Island during peak times. It's a great place for kids to burn off energy.` },
        { title: 'Magic Kingdom path', description: `Start in Adventureland and work clockwise around Magic Kingdom. We've found this route to be most efficient.` },
        {
            title: 'Child safety', description: 'Use temporary tattoos like SafetyTat with your phone number on your children. It's a discreet safety measure if they get separated from you.' },
            { title: 'Animal viewing', description: `Visit Animal Kingdom attractions early when animals are most active. Our morning Kilimanjaro Safaris rides have been amazing.` },
            { title: 'Rider switch', description: `Use rider switch for attractions with height restrictions. It allows both parents to enjoy the ride without waiting in line twice.` },
        { title: 'Park closing strategy', description: `Join a line right before park closing. You'll still get to ride even after the official closing time.` },
        { title: 'Secret entrance', description: `Try Animal Kingdom's secret entrance through the Rainforest Cafe gift shop. We've often found shorter lines here.` },
        { title: 'Animation experience', description: `Visit the Animation Experience at Conservation Station in Animal Kingdom. My budding artists love learning to draw Disney characters.` },
        { title: 'Monorail tips', description: `Opt for the Resort Monorail when leaving Magic Kingdom. It often has shorter lines than the Express Monorail.` },
        { title: 'Magic Kingdom exit', description: `Exit Magic Kingdom through Main Street shops after fireworks. These interconnected stores provide a less crowded route out.` },
        { title: 'Epcot strategy', description: `Visit Epcot's World Showcase in the morning. Most guests start elsewhere, making afternoons more crowded in the countries of the World Showcase.` }
    ],
    dining: [
        { title: 'Character dining', description: `Book Disney Character Dining for efficient Character meet-and-greets. Topolino's Terrace is our favorite for a special breakfast with rare characters.` },
        { title: 'Lunch vs. dinner', description: `Make lunch reservations for popular restaurants to avoid dinner crowds. We love late lunches at Sci-Fi Dine-In Theater.` },
    { title: 'Lunch vs. dinner', description: 'Make lunch reservations for popular restaurants to avoid dinner crowds. We love late lunches at Sci-Fi Dine-In Theater.' },
    dining: [
        { title: 'Mobile ordering', description: `Use mobile ordering to save time at quick-service restaurants. It's a lifesaver during busy meal times.` },
        { title: 'Character dining', description: `Book Disney Character Dining for efficient Character meet-and-greets. Topolino's Terrace is our favorite for a special breakfast with rare characters.` },
        { title: 'Lunch vs. dinner', description: `Make lunch reservations for popular restaurants to avoid dinner crowds. We love late lunches at Sci-Fi Dine-In Theater.` },
    { title: 'World Showcase exploration', description: `Explore World Showcase for unique dining experiences. We love trying new cuisines at the various country pavilions.` },
    { title: 'Resort dining', description: `Don't overlook resort restaurants. Some of our best meals have been at places like Sanaa at Animal Kingdom Lodge.` },
    { title: 'World Showcase exploration', description: `Explore World Showcase for unique dining experiences. We love trying new cuisines at the various country pavilions.` },
    { title: 'Resort dining', description: `Don't overlook resort restaurants. Some of our best meals have been at places like Sanaa at Animal Kingdom Lodge.` },
    { title: 'Free soda sampling', description: `Sample free sodas from around the world at Club Cool in Epcot. It's a fun and refreshing break during your park day.` },
    { title: 'Landry\'s Select Club', description: `Join the Landry's Select Club if dining at Rainforest Cafe, T-Rex Cafe, or Yak and Yeti. The $25 one-time fee gets you priority seating, birthday rewards, and other perks.` }
],
{ title: 'Free WiFi', description: `Take advantage of Disney's free Wi-Fi throughout the parks. It's generally reliable for checking wait times and making plans.` },
],
tech: [
    { title: 'Portable charger', description: `Bring a portable phone charger for all-day app usage. We learned this lesson after our phones died mid-afternoon!` },
    { title: 'MagicBand+', description: `Use MagicBand+ for convenient park entry and interactive experiences. My kids love the light-up features during fireworks.` },
tech: [
    { title: 'Portable charger', description: `Bring a portable phone charger for all-day app usage. We learned this lesson after our phones died mid-afternoon!` },
    { title: 'MagicBand+', description: `Use MagicBand+ for convenient park entry and interactive experiences. My kids love the light-up features during fireworks.` },
    { title: 'Free WiFi', description: `Take advantage of Disney's free Wi-Fi throughout the parks. It's generally reliable for checking wait times and making plans.` },
    { title: 'Animal trails', description: 'Explore Animal Kingdom\'s walking trails for up-close animal encounters. The Gorilla Falls Exploration Trail is our favorite.' },
{ title: 'Itinerary planning', description: `Use Disney's free itinerary planning feature (in the app) for personalized suggestions. It's helped us discover new attractions.` },
{ title: 'Drawing classes', description: `Check out free drawing classes at Art of Animation Resort. It's a fun activity even if you're not staying there.` },
{ title: 'Behind-the-scenes tour', description: `Take the Keys to the Kingdom tour for a behind-the-scenes look at Magic Kingdom. It gave us a whole new appreciation for the park.` },
{ title: 'Play Disney Parks app', description: `Use the Play Disney Parks app for interactive queue experiences. It makes waiting in line much more enjoyable.` },
hidden: [
    { title: 'PeopleMover break', description: `Ride the Tomorrowland Transit Authority PeopleMover for a relaxing break. It's our go-to when we need a few minutes off our feet.` },
    { title: 'Water Pageant', description: `Watch the Electrical Water Pageant from the Polynesian Resort beach. It's a charming, often overlooked nighttime show.` },
hidden: [
    { title: 'PeopleMover break', description: `Ride the Tomorrowland Transit Authority PeopleMover for a relaxing break. It's our go-to when we need a few minutes off our feet.` },
    { title: 'Water Pageant', description: `Watch the Electrical Water Pageant from the Polynesian Resort beach. It's a charming, often overlooked nighttime show.` },
    { title: 'Animation Experience', description: `Visit the Animation Experience at Conservation Station in Animal Kingdom. My budding artists love learning to draw Disney characters.` },
    { title: 'Animal trails', description: `Explore Animal Kingdom's walking trails for up-close animal encounters. The Gorilla Falls Exploration Trail is our favorite.` },
    { title: 'Drawing classes', description: `Check out free drawing classes at Art of Animation Resort. It's a fun activity even if you're not staying there.` },
    { title: 'Behind-the-scenes tour', description: `Take the Keys to the Kingdom tour for a behind-the-scenes look at Magic Kingdom. It gave us a whole new appreciation for the park.` },
    { title: 'Disney Springs', description: `Visit Disney Springs for shopping, dining, and a change of pace. We love exploring the shops and grabbing a bite at Earl of Sandwich.` }
],
kids: [
    { title: 'Character breakfast', description: `Book a character breakfast on your first park day. It's a magical way to start your trip and meet multiple characters at once.` },
    { title: 'Extra clothes', description: `Pack extra clothes for water play areas and unexpected messes. We learned this the hard way after a Dole Whip spill!` },
    { title: 'Glow sticks', description: `Bring glow sticks for nighttime parades and fireworks. They're fun and much cheaper than buying light-up toys in the parks.` },
    { title: 'Scavenger hunt', description: `Make a family trip scavenger hunt. It's a fun way to explore the parks and keep kids engaged.` }
],
    { title: 'First aid kit', description: 'Pack a small first aid kit with essentials. Band-Aids, pain relievers, and blister pads have saved us more than once.' },
    { title: 'Water bottle', description: 'Bring a refillable water bottle and snacks. Staying hydrated and fueled is key for long park days.' },
    { title: 'Weather preparation', description: 'Dress in layers and pack for changing weather. Orlando weather can be unpredictable, so we always bring ponchos and extra clothes.' },
    { title: 'Scavenger hunt', description: `Make a family trip scavenger hunt. It's a fun way to explore the parks and keep kids engaged.` }
],
    seasonal: [
    { title: 'First aid kit', description: 'Pack a small first aid kit with essentials. Band-Aids, pain relievers, and blister pads have saved us more than once.' },
    { title: 'Water bottle', description: 'Bring a refillable water bottle and snacks. Staying hydrated and fueled is key for long park days.' },
    { title: 'Weather preparation', description: 'Dress in layers and pack for changing weather. Orlando weather can be unpredictable, so we always bring ponchos and extra clothes.' },
    { title: 'Scavenger hunt', description: `Make a family trip scavenger hunt. It's a fun way to explore the parks and keep kids engaged.` }
],
seasonal: [
],
        ],
            const [searchQuery, setSearchQuery] = useState('');
packing: [
    { title: 'First aid kit', description: `Pack a small first aid kit with essentials. Band-Aids, pain relievers, and blister pads have saved us more than once.` },
    { title: 'Water bottle', description: `Bring a refillable water bottle and snacks. Staying hydrated and fueled is key for long park days.` },
    { title: 'Weather preparation', description: `Dress in layers and pack for changing weather. Orlando weather can be unpredictable, so we always bring ponchos and extra clothes.` },
    { title: 'Comfortable shoes', description: `Wear comfortable shoes. We've learned the hard way that fashion should never come before comfort at Disney!` },
packing: [
packing: [
        { title: 'Trader Sam\'s', description: `Visit Trader Sam's Grog Grotto at the Polynesian Resort for unique cocktails. It's a fun, themed experience.` },
        { title: 'Disney Springs nightlife', description: `Check out Disney Springs for nightlife and entertainment. We love catching a show at House of Blues.` },
        { title: 'Specialty tours', description: `Take a specialty tour for a unique Disney experience. The Wild Africa Trek at Animal Kingdom is unforgettable.` },
        { title: 'Spa day', description: `Book a spa day at Grand Floridian or Saratoga Springs. It's a great way to relax and recharge.` }
    { title: 'Water parks', description: `Use Park Hopper Plus tickets for Disney water parks and mini-golf. On hot days, we love cooling off at Blizzard Beach.` }
],
    ? Object.entries(tipsData).flatMap(([category, tips]) =>
        tips.filter(tip =>
            tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tip.description.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(tip => ({ ...tip, category }))
    )
    : [];

// GSAP animations
useGSAP(() => {
    if (!pageRef.current) return;

    // Initial animations
    const timeline = gsap.timeline();

    timeline.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    timeline.from(categoriesRef.current?.querySelectorAll('.category-card'), {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.5');

    // Scroll animations
    gsap.from('.tip-card', {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none'
        }
    });

    // Cleanup
    return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
}, [activeCategory]);

return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        {/* Castle silhouette and fireworks background effects */}
        <div className="castle-silhouette"></div>
        <div className="firework"></div>
        <div className="firework"></div>
        <div className="firework"></div>

        {/* Header section */}
        <div
            ref={headerRef}
            className="relative pt-16 pb-10 px-4 sm:px-6 lg:px-8 text-center z-10"
        >
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold text-indigo-800 dark:text-indigo-200 mb-4"
            >
                Expert Disney World Planning Tips
                <span className="animate-sparkle bg-clip-text text-transparent"> & Tricks</span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
            >
                Insider knowledge and strategies to make your Disney vacation truly magical
            </motion.p>

            {/* Search bar */}
            <div className="mt-8 max-w-md mx-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for tips..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Display search results if search query exists */}
        {searchQuery.length > 2 && (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <h2 className="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-200">
                    Search Results ({filteredTips.length})
                </h2>

                {filteredTips.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTips.map((tip, index) => (
                            <Card
                                key={`${tip.category}-${index}`}
                                className="tip-card p-4 hover:shadow-md transition-shadow border border-indigo-100 dark:border-indigo-900"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">{tip.title}</h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            Category: {categories.find(c => c.id === tip.category)?.name}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">{tip.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No tips found matching your search. Try a different term!</p>
                    </div>
                )}
            </div>
        )}

        {/* Categories section - only show if not searching */}
        {searchQuery.length <= 2 && (
            <>
                <div
                    ref={categoriesRef}
                    className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12"
                >
                    <h2 className="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-200">Categories</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories.map((category) => (
                            <Card
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`category-card cursor-pointer p-4 flex flex-col items-center justify-center text-center transition-all ${activeCategory === category.id
                                    ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 shadow-md animate-pulse-slow'
                                    : 'hover:bg-indigo-50 dark:hover:bg-indigo-950'
                                    }`}
                            >
                                <div className={`mb-2 p-2 rounded-full ${activeCategory === category.id
                                    ? 'text-indigo-600 dark:text-indigo-300'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {category.icon}
                                </div>
                                <h3 className={`text-sm font-medium ${activeCategory === category.id
                                    ? 'text-indigo-800 dark:text-indigo-200'
                                    : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {category.name}
                                </h3>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Tips content */}
                <div
                    ref={contentRef}
                    className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                            {categories.find(c => c.id === activeCategory)?.name} Tips
                        </h2>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">{tipsData[activeCategory as keyof typeof tipsData]?.length || 0} Tips</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tipsData[activeCategory as keyof typeof tipsData]?.map((tip, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card
                                    className="tip-card relative h-full p-5 overflow-hidden border border-indigo-100 dark:border-indigo-900 hover:shadow-lg transition-all"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 opacity-10 rounded-bl-full" />

                                    <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">{tip.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{tip.description}</p>

                                    <div className="absolute bottom-3 right-3">
                                        <div className="text-indigo-500 dark:text-indigo-400 animate-pulse-slow">
                                            <Sparkles size={16} />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </>
        )}

        {/* Final tip and CTA */}
        <div className="bg-indigo-100 dark:bg-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="container mx-auto max-w-3xl text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="animate-float"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 dark:text-indigo-200 mb-4">Final Disney Wisdom</h2>
                    <p className="text-lg text-indigo-700 dark:text-indigo-300 mb-6">
                        "Relax and enjoy the magic! Remember, the most important part of any Disney trip is creating magical memories with your family."
                    </p>
                    <Link
                        href="/planning"
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        Start Planning Your Trip
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                </motion.div>
            </div>

            {/* Background effects */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-200 to-transparent dark:from-indigo-800 dark:to-transparent opacity-30" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-20" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-20" />
        </div>
    </div>
);
        }