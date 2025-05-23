"use client"

import { useState, useEffect, useMemo } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon, BoltIcon, CalendarIcon, MapIcon, QuestionMarkCircleIcon, ClockIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

// FAQ data organized by categories
const faqData: FAQCategory = {
    "lightning-lane": [
        {
            question: "What is the difference between Lightning Lane Multi Pass and Genie+?",
            answer: "Lightning Lane Multi Pass is the new name for Disney Genie+. It also introduces the ability to book Lightning Lane reservations ahead of time. Disney resort guests can book up to 7 days in advance; all other guests can book up to 3 days in advance. Guests may choose 3 Lightning Lane experiences and times ahead of their visit within one theme park. On the day of their visit, guests may select another Lightning Lane once they have redeemed one selection. Selections for a second park cannot occur until this point. Selections are made before purchasing the Lightning Lane Multi Pass option. Dynamic pricing will remain in effect. Selection groups are also tiered, allowing users to only select one of the most in-demand attractions at a time."
        },
        {
            question: "What is the difference between Lightning Lane Single Pass and Individual Lightning Lane?",
            answer: "Lightning Lane Single Pass is the new name for Individual Lightning lanes. It also introduces the ability to book Lightning Lane reservations ahead of time."
        },
        {
            question: "How many Lightning Lane Single Pass purchases can you make in a day?",
            answer: "Each guest may purchase up to 2 Lightning Lane Single Passes per day."
        },
        {
            question: "What is Genie+?",
            answer: "Genie+ (or Genie Plus) is a paid replacement to the FastPass+ system with some different rules. The system provides access to the Lightning Lane, which typically provides much shorter wait times than the standby queue. Guests can reserve a slot in the Lightning Lane with an hour return time; guests must return within that window to join the Lightning Lane for that attraction to experience it."
        },
        {
            question: "When can Genie+ be purchased?",
            answer: "Beginning at 12 AM on the day of a Disney World theme park visit, Genie+ can be purchased on a per person basis for a variable amount of money (prices are tracked each day in our Genie+ Price Tracker). Currently, Genie+ cannot be purchased ahead of the time, only on the day of a theme park visit. It has sold out on a few occasions, but never before 10:00 AM."
        },
        {
            question: "When can you make Genie+ selections?",
            answer: "Beginning at 7 AM, guests can make their first Genie+ selection in the My Disney Experience app on the Tip Board. The next Genie+ selection can be made immediately after the first selection is redeemed (i.e. you tap into the attraction) or 2 hours after the park's opening. This same sequence repeats for the duration of the day. Note that the time counter is not from resort guest early opening. For example, if the Magic Kingdom opens at 9 AM, you can make another Genie+ selection at 11 AM if the return time for your first selection is after 11 AM. You can hold several Genie+ selections at a time by accruing them every 2 hours. This process is called stacking."
        },
        {
            question: "What is an Individual Lightning Lane?",
            answer: "An Individual Lightning Lane (ILL) is a single use pass to access the Lightning Lane of an attraction for a fee per person. This allows for a shorter wait time to ride the attraction. ILLs can be purchased without having Disney Genie+. Resort guests can purchase ILL beginning at 7 AM. Offsite visitors can purchase ILL beginning at the respective park's opening. The attractions and price for ILL is tracked every day on our ILL Price page."
        }
    ],
    "virtual-queue": [
        {
            question: "What is the difference between a Virtual Queue and boarding group at Disney World?",
            answer: "Virtual Queue and a boarding group go hand-in-hand. When you join a Virtual Queue, you are given a boarding group number. They start at 1 and can go up into the 200's. At different points throughout the day, sets of boarding groups will be called. If your group is within that set, you can join the standby queue for the attraction. Be prepared to wait in a decent line after your group is called."
        },
        {
            question: "What Disney World attractions offer a Virtual Queue?",
            answer: "Currently, only TRON Lightcycle/Run at the Magic Kingdom and Guardians of the Galaxy: Cosmic Rewind at EPCOT offer a Virtual Queue. It can be joined through the My Disney Experience app at 7 AM and 1 PM each day."
        },
        {
            question: "Can you do the Virtual Queue twice for the same ride on the same day?",
            answer: "Yes and no. If you do not have access to Disney's Extended Evening Hours or a ticket to a special event such as Mickey's Not-So-Scary Halloween Party or Mickey's Very Merry Christmas Party, you can only ride TRON Lightcycle/Run (Magic Kingdom) or Guardians of the Galaxy: Cosmic Rewind (EPCOT) with a Virtual Queue once per day. A boarding group can be obtained either at 7 AM or 1 PM. If you have access to Extended Evening Hours or a special ticketed event, and you obtained a boarding group at 7 AM or 1 PM, you can try to another Virtual Queue boarding group at 6 PM."
        }
    ],
    "crowd-calendar": [
        {
            question: "What are the busiest times at Walt Disney World?",
            answer: "Spring break, typically the week of Easter, the week of Thanksgiving, and the week after Christmas through New Year's Day. View the Walt Disney World Crowd Calendar to see the busiest and least busy times to visit."
        },
        {
            question: "When is the best time to visit Walt Disney World in 2024?",
            answer: "Based on this past year, the best months to visit the Walt Disney World Resort in 2024 are May, August, and September."
        },
        {
            question: "Is Disney World busy in January?",
            answer: "Yes, January is busy at Walt Disney World, with wait times averaging 42 minutes per attraction resort wide. Certain weeks within the month will be less crowded."
        },
        {
            question: "Is Disney World busy in February?",
            answer: "Yes, February is busy at Walt Disney World, with wait times averaging 41 minutes per attraction resort wide. Certain weeks within the month will be less crowded."
        },
        {
            question: "Is Disney World busy in March?",
            answer: "Yes, March is busy at Walt Disney World, with wait times averaging 39 minutes per attraction resort wide. Early March is the best time to visit before Spring Break begins."
        },
        {
            question: "Is Disney World busy in April?",
            answer: "Yes, April is busy at Walt Disney World, with wait times averaging 40 minutes per attraction resort wide. It is busiest the week of Easter. After Easter, crowds lessen."
        },
        {
            question: "Is Disney World busy in May?",
            answer: "No, May is one of the best times to visit Walt Disney World, with wait times averaging 31 minutes per attraction resort wide."
        },
        {
            question: "Is Disney World busy in June?",
            answer: "Yes, June is moderately busy at Walt Disney World, with wait times averaging 37 minutes per attraction resort wide."
        },
        {
            question: "Is Disney World busy in July?",
            answer: "Yes, July is moderately busy at Walt Disney World, with wait times averaging 36 minutes per attraction resort wide."
        },
        {
            question: "Is Disney World busy in August?",
            answer: "Early August is moderately busy at Walt Disney World, but crowds lessen once local schools begin in the middle of the month. Wait times average 32 minutes per attraction resort wide."
        },
        {
            question: "Is Disney World busy in September?",
            answer: "No, September is typically one of the best times to vist Walt Disney World, with wait times averaging 30 minutes per attraction resort wide."
        },
        {
            question: "Is Disney World busy in October?",
            answer: "Yes, October is moderately busy at Walt Disney World, with wait times averaging 42 minutes per attraction resort wide. Many fall breaks occur in October, leading to bigger crowds."
        },
        {
            question: "Is Disney World busy in November?",
            answer: "Yes, November is busy at Walt Disney World, with wait times averaging 41 minutes per attraction resort wide. Around Veteran's Day and the week of Thanksgiving are the busiest times."
        },
        {
            question: "Is Disney World busy in December?",
            answer: "Yes, December is busy at Walt Disney World, with wait times averaging 46 minutes per attraction resort wide. Early December is not a bad time to go. The week between Christmas and New Year's in the busiest time of the year."
        }
    ],
    "park-strategies": [
        {
            question: "What is rope drop at Disney parks?",
            answer: "Short answer: rope drop is when the park first opens. Rope dropping is to get to the park at or before park opening. Typically, you can enter some portion of the park and a rope will block further entry into the park at various points. Guests will form lines at these areas. Once it is park opening time, a Cast Member will drop the rope, letting guests into experience the park's attractions."
        }
    ]
}

// Types for our FAQ data
type FAQItem = {
    question: string
    answer: string
}

type FAQCategory = {
    [key: string]: FAQItem[]
}

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState("all")
    const [searchResults, setSearchResults] = useState<FAQItem[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Flatten all FAQ items for searching
    const allFAQs = useMemo(() => {
        return Object.values(faqData).flat()
    }, [])

    // Handle search
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        const query = searchQuery.toLowerCase()

        const results = allFAQs.filter(
            item =>
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query)
        )

        setSearchResults(results)

        // Auto-expand search results
        const newExpandedItems = new Set<string>()
        results.forEach(item => newExpandedItems.add(item.question))
        setExpandedItems(newExpandedItems)

    }, [searchQuery, allFAQs])

    // Handle accordion toggle
    const toggleAccordion = (question: string) => {
        const newExpandedItems = new Set(expandedItems)
        if (newExpandedItems.has(question)) {
            newExpandedItems.delete(question)
        } else {
            newExpandedItems.add(question)
        }
        setExpandedItems(newExpandedItems)
    }

    // Function to get the appropriate icon for each category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "lightning-lane":
                return <BoltIcon className="h-5 w-5 text-amber-500" />
            case "virtual-queue":
                return <ClockIcon className="h-5 w-5 text-teal-500" />
            case "crowd-calendar":
                return <CalendarIcon className="h-5 w-5 text-blue-500" />
            case "park-strategies":
                return <MapIcon className="h-5 w-5 text-purple-500" />
            default:
                return <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-500" />
        }
    }

    // Function to get human-readable category names
    const getCategoryName = (category: string) => {
        switch (category) {
            case "lightning-lane":
                return "Lightning Lane & Genie+"
            case "virtual-queue":
                return "Virtual Queue"
            case "crowd-calendar":
                return "Crowd Calendar"
            case "park-strategies":
                return "Park Strategies"
            default:
                return category
        }
    }

    // Extracted function for rendering search results when no results found
    const renderNoSearchResults = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-10 text-center"
        >
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            >
                <QuestionMarkCircleIcon className="h-16 w-16 mx-auto text-purple-400" />
            </motion.div>
            <h3 className="mt-4 text-lg font-medium font-display">No results found</h3>
            <p className="mt-2 text-muted-foreground">
                Try adjusting your search query or browse categories
            </p>
        </motion.div>
    )

    // Extracted function for rendering accordion items
    const renderAccordionItem = (item: FAQItem, index: number) => (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            key={item.question}
        >
            <AccordionItem value={item.question} className="border border-slate-200 dark:border-slate-800 rounded-lg mb-4 overflow-hidden">
                <AccordionTrigger
                    onClick={() => toggleAccordion(item.question)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 px-5 py-4 group transition-all duration-300"
                >
                    <div className="flex items-start gap-3 text-left">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mt-0.5 text-blue-600 dark:text-blue-300">
                            <QuestionMarkCircleIcon className="h-4 w-4" />
                        </div>
                        <span className="font-display group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {item.question}
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="prose dark:prose-invert max-w-none pl-8 font-body"
                    >
                        <p>{item.answer}</p>
                    </motion.div>
                </AccordionContent>
            </AccordionItem>
        </motion.div>
    )

    // Extracted function for rendering search results
    const renderSearchResults = () => {
        if (searchResults.length === 0) {
            return renderNoSearchResults()
        }

        return (
            <Accordion type="multiple" className="w-full">
                {searchResults.map((item, index) => renderAccordionItem(item, index))}
            </Accordion>
        )
    }

    // Extracted function for rendering a category of FAQ items
    const renderCategoryItems = (category: string, items: FAQItem[]) => (
        <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryGradient(category)}`}>
                    {getCategoryIcon(category)}
                </div>
                <h2 className="text-2xl font-bold font-display tracking-tight">{getCategoryName(category)}</h2>
            </div>
            <Accordion type="multiple" className="w-full">
                {items.map((item, index) => renderAccordionItem(item, index))}
            </Accordion>
        </motion.div>
    )

    // Extracted function for rendering items for a specific tab
    const renderTabItems = () => {
        const items = faqData[activeTab as keyof typeof faqData] || []
        return (
            <Accordion type="multiple" className="w-full">
                {items.map((item, index) => renderAccordionItem(item, index))}
            </Accordion>
        )
    }

    // Extracted function for rendering all categories
    const renderAllCategories = () => (
        Object.entries(faqData).map(([category, items]) =>
            renderCategoryItems(category, items)
        )
    )

    // Render FAQ items based on active tab or search results
    const renderFAQItems = () => {
        // If searching, show search results
        if (isSearching) {
            return renderSearchResults()
        }

        // If not searching, show tab content
        if (activeTab === "all") {
            return renderAllCategories()
        } else {
            return renderTabItems()
        }
    }

    // Extracted function for rendering category preview items
    const renderCategoryPreviewItems = (category: string) => (
        <ul className="text-sm space-y-2">
            {faqData[category as keyof typeof faqData].slice(0, 3).map((item, index) => (
                <li key={item.question}>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-2 text-muted-foreground group cursor-pointer"
                        onClick={() => {
                            setActiveTab(category);
                            const newExpandedItems = new Set(expandedItems);
                            newExpandedItems.add(item.question);
                            setExpandedItems(newExpandedItems);
                        }}
                    >
                        <span className={`h-2 w-2 rounded-full ${getCategoryDot(category)}`}></span>
                        <span className="truncate group-hover:text-foreground transition-colors duration-300">{item.question}</span>
                    </motion.div>
                </li>
            ))}
            {faqData[category as keyof typeof faqData].length > 3 && (
                <li>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="text-primary font-medium cursor-pointer hover:underline mt-1"
                        onClick={() => setActiveTab(category)}
                    >
                        + {faqData[category as keyof typeof faqData].length - 3} more questions...
                    </motion.div>
                </li>
            )}
        </ul>
    )

    // Extracted function for rendering popular categories section
    const renderPopularCategories = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {Object.keys(faqData).map((category, index) => (
                <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                    <Card
                        className="overflow-hidden transition-all hover:shadow-xl cursor-pointer bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 h-full border-t-4"
                        style={{ borderTopColor: getCategoryColor(category) }}
                        onClick={() => setActiveTab(category)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${getCategoryBg(category)}`}>
                                    {getCategoryIcon(category)}
                                </div>
                                <CardTitle className="font-display tracking-tight">{getCategoryName(category)}</CardTitle>
                            </div>
                            <CardDescription className="font-body">
                                {faqData[category as keyof typeof faqData].length} questions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderCategoryPreviewItems(category)}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Nunito:wght@300;400;500;600;700&display=swap');

                :root {
                    --font-display: 'Montserrat', sans-serif;
                    --font-body: 'Nunito', sans-serif;
                }

                .font-display {
                    font-family: var(--font-display);
                }

                .font-body {
                    font-family: var(--font-body);
                }

                .prose p {
                    font-family: var(--font-body);
                    line-height: 1.7;
                }
            `}</style>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-body">
                {/* Hero section with animated background */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative text-center mb-16 pb-4"
                >
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.2),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(255,188,0,0.15),transparent_50%)]"></div>
                    </div>

                    <motion.h1
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 pb-2 font-display"
                    >
                        Disney Vacation FAQ
                    </motion.h1>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto font-body">
                            Find answers to the most common questions about planning your magical Disney experience
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                    ></motion.div>
                </motion.div>

                {/* Search section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className="mb-10 overflow-hidden border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardContent className="pt-6 pb-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="What are you looking for? Try 'Genie+' or 'Virtual Queue'..."
                                    className="pl-12 h-14 text-base rounded-full border-2 focus:border-blue-500 transition-all duration-300 shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </motion.button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tab navigation */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-10"
                >
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6 p-1 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl">
                            <TabsTrigger value="all" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300">
                                <QuestionMarkCircleIcon className="h-4 w-4" />
                                <span>All Questions</span>
                            </TabsTrigger>
                            {Object.keys(faqData).map((category) => (
                                <TabsTrigger
                                    key={category}
                                    value={category}
                                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300"
                                >
                                    {getCategoryIcon(category)}
                                    <span>{getCategoryName(category)}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Tab content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + (isSearching ? 'search' : '')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TabsContent value={activeTab} className="mt-0">
                                    {renderFAQItems()}
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>

                {/* Popular categories */}
                {!isSearching && activeTab === "all" && renderPopularCategories()}

                {/* Still have questions section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 mt-16 border-none shadow-lg overflow-hidden">
                        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
                            <div>
                                <h3 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Still have questions?</h3>
                                <p className="text-muted-foreground mt-2">Contact our Disney vacation planning experts for personalized assistance</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-7 rounded-full transition-all duration-300"
                                >
                                    Contact Support
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold py-3 px-7 rounded-full transition-colors duration-300"
                                >
                                    Visit Help Center
                                </motion.button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    )
}

// Helper function to get a color for each category
function getCategoryColor(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "#f59e0b" // amber
        case "virtual-queue":
            return "#10b981" // emerald
        case "crowd-calendar":
            return "#3b82f6" // blue
        case "park-strategies":
            return "#8b5cf6" // purple
        default:
            return "#6b7280" // gray
    }
}

// Helper function to get background color for category icons
function getCategoryBg(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "bg-amber-100 dark:bg-amber-900/30"
        case "virtual-queue":
            return "bg-emerald-100 dark:bg-emerald-900/30"
        case "crowd-calendar":
            return "bg-blue-100 dark:bg-blue-900/30"
        case "park-strategies":
            return "bg-purple-100 dark:bg-purple-900/30"
        default:
            return "bg-slate-100 dark:bg-slate-800"
    }
}

// Helper function to get gradient colors for category headers
function getCategoryGradient(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10"
        case "virtual-queue":
            return "from-emerald-100 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/10"
        case "crowd-calendar":
            return "from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10"
        case "park-strategies":
            return "from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10"
        default:
            return "from-slate-100 to-slate-50 dark:from-slate-800/20 dark:to-slate-800/10"
    }
}

// Helper function to get dot colors for category items
function getCategoryDot(category: string): string {
    switch (category) {
        case "lightning-lane":
            return "bg-amber-500"
        case "virtual-queue":
            return "bg-emerald-500"
        case "crowd-calendar":
            return "bg-blue-500"
        case "park-strategies":
            return "bg-purple-500"
        default:
            return "bg-slate-500"
    }
}