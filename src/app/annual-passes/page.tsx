"use client"

import React, { useState, useEffect } from "react"
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, XIcon, SparklesIcon, ShieldCheckIcon, CalendarDaysIcon, CarIcon, UtensilsIcon, ShoppingBagIcon } from "lucide-react"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { MagicCard } from "@/components/magicui/magic-card"
import { BorderBeam } from "@/components/magicui/border-beam"
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { WordRotate } from "@/components/magicui/word-rotate"
import { Particles } from "@/components/magicui/particles"
import { Meteors } from "@/components/magicui/meteors"
import { BlurFade } from "@/components/magicui/blur-fade"
import { TypingAnimation } from "@/components/magicui/typing-animation"
import { cn } from "@/lib/utils"

interface AnnualPass {
    id: string
    name: string
    tagline: string
    eligibility: string
    price: string
    monthlyPayment: string
    reservations: number
    blockoutDates: string
    hasBlockouts: boolean
    standardParking: boolean
    discountDining: string
    discountMerchandise: string
    color: 'primary' | 'purple' | 'blue' | 'green'
    gradient: string
    features: Array<{
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
        title: string
        description: string
    }>
}

const annualPasses: AnnualPass[] = [
    {
        id: "incredi-pass",
        name: "Disney Incredi-Pass",
        tagline: "The Ultimate Disney Experience",
        eligibility: "Available to all guests",
        price: "$1,549.00",
        monthlyPayment: "$129.23",
        reservations: 5,
        blockoutDates: "No blockout dates apply",
        hasBlockouts: false,
        standardParking: true,
        discountDining: "Save on select dining",
        discountMerchandise: "Up to 20% off select merchandise in store",
        color: "primary",
        gradient: "from-amber-300 via-orange-300 to-red-400",
        features: [
            { icon: SparklesIcon, title: "Unlimited Access", description: "365 days of magic" },
            { icon: ShieldCheckIcon, title: "Premium Benefits", description: "Exclusive perks" },
            { icon: CalendarDaysIcon, title: "No Blockouts", description: "Visit any day" }
        ]
    },
    {
        id: "sorcerer-pass",
        name: "Disney Sorcerer Pass",
        tagline: "Magical Moments Year-Round",
        eligibility: "Florida Residents and Eligible Disney Vacation Club Members Only",
        price: "$1,079.00",
        monthlyPayment: "$87.52",
        reservations: 5,
        blockoutDates: "Blockout dates, on select days during select holiday periods",
        hasBlockouts: true,
        standardParking: true,
        discountDining: "Save on select dining",
        discountMerchandise: "Up to 20% off select merchandise in store",
        color: "purple",
        gradient: "from-purple-400 via-violet-400 to-indigo-400",
        features: [
            { icon: SparklesIcon, title: "5 Reservations", description: "At a time" },
            { icon: CarIcon, title: "Free Parking", description: "Standard theme park" },
            { icon: ShoppingBagIcon, title: "20% Savings", description: "On merchandise" }
        ]
    },
    {
        id: "pirate-pass",
        name: "Disney Pirate Pass",
        tagline: "Adventure Awaits",
        eligibility: "Florida Residents Only",
        price: "$829.00",
        monthlyPayment: "$65.33",
        reservations: 4,
        blockoutDates: "Blockout dates apply, including peak and holiday periods",
        hasBlockouts: true,
        standardParking: true,
        discountDining: "Save on select dining",
        discountMerchandise: "Up to 20% off select merchandise in store",
        color: "blue",
        gradient: "from-blue-400 via-cyan-400 to-teal-400",
        features: [
            { icon: CalendarDaysIcon, title: "4 Reservations", description: "Flexible planning" },
            { icon: UtensilsIcon, title: "Dining Savings", description: "Select locations" },
            { icon: CarIcon, title: "Included Parking", description: "All theme parks" }
        ]
    },
    {
        id: "pixie-dust-pass",
        name: "Disney Pixie Dust Pass",
        tagline: "Weekday Magic",
        eligibility: "Florida Residents Only",
        price: "$469.00",
        monthlyPayment: "$33.38",
        reservations: 3,
        blockoutDates: "Blockout dates apply, including peak and holiday periods. Mondays through Fridays only during certain times of the year.",
        hasBlockouts: true,
        standardParking: true,
        discountDining: "Save on select dining",
        discountMerchandise: "Up to 20% off select merchandise in store",
        color: "green",
        gradient: "from-green-400 via-emerald-400 to-teal-400",
        features: [
            { icon: CalendarDaysIcon, title: "Weekday Access", description: "Mon-Fri visits" },
            { icon: ShoppingBagIcon, title: "Great Value", description: "Lowest price point" },
            { icon: CarIcon, title: "Parking Included", description: "Standard parking" }
        ]
    }
]

interface AnnualPassCardProps {
    pass: AnnualPass
    onCompare: (passId: string) => void
    isSelected: boolean
    index: number
}

const AnnualPassCard = ({ pass, onCompare, isSelected, index }: AnnualPassCardProps) => {
    return (
        <BlurFade delay={0.25 + index * 0.05} inView>
            <NeonGradientCard
                className="relative h-full group overflow-hidden"
                borderRadius={16}
            >
                {pass.id === "incredi-pass" && <Meteors number={20} />}
                <MagicCard
                    className="h-full border-0 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm overflow-hidden"
                    gradientColor={pass.gradient}
                >
                    <CardHeader className="relative text-center pb-2 overflow-hidden">
                        {isSelected && <BorderBeam size={250} duration={12} delay={9} />}
                        <AnimatedGradientText className="mb-2">
                            <Badge variant="outline" className="border-2 px-3 py-1 max-w-full truncate">
                                {pass.eligibility}
                            </Badge>
                        </AnimatedGradientText>
                        <CardTitle className="text-2xl font-bold mb-2 px-2">
                            <div className="overflow-hidden">
                                <SparklesText className="text-2xl break-words hyphens-auto" sparklesCount={pass.id === "incredi-pass" ? 8 : 4}>
                                    {pass.name}
                                </SparklesText>
                            </div>
                        </CardTitle>
                        <CardDescription className="px-2">
                            <div className="overflow-hidden">
                                <TypingAnimation
                                    className="text-sm text-muted-foreground break-words"
                                    text={pass.tagline}
                                    duration={100}
                                />
                            </div>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow px-4 overflow-hidden">
                        <div className="text-center mb-6">
                            <div className="mb-4">
                                <div className="text-3xl font-bold text-primary mb-2 break-words">
                                    {pass.price}
                                </div>
                                <p className="text-sm text-muted-foreground">Annual Price</p>
                            </div>

                            <div className="border-t pt-4">
                                <div className="text-xl font-semibold mb-1 break-words">
                                    {pass.monthlyPayment}<span className="text-sm font-normal">/month*</span>
                                </div>
                                <p className="text-xs text-muted-foreground break-words">
                                    12 Monthly Payments with $99 Down Payment
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-6">
                            {pass.features.map((feature, i) => (
                                <BlurFade key={i} delay={0.3 + i * 0.1} inView>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm hover:from-background/70 hover:to-background/50 transition-all overflow-hidden">
                                        <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm break-words">{feature.title}</p>
                                            <p className="text-xs text-muted-foreground break-words">{feature.description}</p>
                                        </div>
                                    </div>
                                </BlurFade>
                            ))}
                        </div>

                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="min-w-5 mt-1 text-primary flex-shrink-0">•</span>
                                <span className="break-words">This pass can hold up to <strong>{pass.reservations} reservations</strong> at a time</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="min-w-5 mt-1 text-primary flex-shrink-0">•</span>
                                <span className={cn(
                                    "break-words",
                                    pass.hasBlockouts ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
                                )}>
                                    {pass.blockoutDates}
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="min-w-5 mt-1 text-primary flex-shrink-0">•</span>
                                <span className="break-words">{pass.discountMerchandise}</span>
                            </li>
                        </ul>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 pt-4 px-4">
                        <ShimmerButton
                            className={cn(
                                "w-full relative overflow-hidden",
                                isSelected && "ring-2 ring-offset-2 ring-offset-background"
                            )}
                            onClick={() => onCompare(pass.id)}
                            shimmerColor={pass.gradient}
                        >
                            <span className="relative z-10 break-words text-center px-2">
                                {isSelected ? "✓ Selected for Comparison" : "Compare This Pass"}
                            </span>
                        </ShimmerButton>
                    </CardFooter>
                </MagicCard>
            </NeonGradientCard>
        </BlurFade>
    )
}

export default function AnnualPassesPage() {
    const [selectedPasses, setSelectedPasses] = useState<string[]>([])
    const [showParticles, setShowParticles] = useState(false)

    useEffect(() => {
        setShowParticles(true)
    }, [])

    const togglePassComparison = (passId: string) => {
        setSelectedPasses(prev =>
            prev.includes(passId)
                ? prev.filter(id => id !== passId)
                : [...prev, passId]
        )
    }

    const showComparison = selectedPasses.length > 0

    const words = ["Experience", "Adventure", "Magic", "Memories", "Dreams"]

    return (
        <div className="relative min-h-screen">
            {showParticles && (
                <Particles
                    className="absolute inset-0"
                    quantity={100}
                    ease={80}
                    color="#ffffff"
                    refresh
                />
            )}

            <div className="container mx-auto py-12 relative z-10">
                <BlurFade delay={0.1} inView>
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            <div className="overflow-hidden">
                                <AnimatedGradientText>
                                    <span>Walt Disney World</span>
                                </AnimatedGradientText>
                            </div>
                            <div className="overflow-hidden">
                                <SparklesText className="text-5xl md:text-6xl mt-2" sparklesCount={10}>
                                    Annual Passes
                                </SparklesText>
                            </div>
                        </h1>
                        <div className="text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                            <div className="mb-4 min-h-[2.5rem] flex items-center justify-center overflow-hidden">
                                <span>Unlock a year of </span>
                                <div className="ml-2 overflow-hidden">
                                    <WordRotate
                                        words={words}
                                        className="text-primary font-semibold"
                                    />
                                </div>
                            </div>
                            <div className="leading-relaxed break-words">
                                Annual Passes allow you to enjoy the magic all year long. Discover all the possibilities
                                a Walt Disney World Annual Pass can bring to your vacation planning.
                            </div>
                        </div>
                    </div>
                </BlurFade>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {annualPasses.map((pass, index) => (
                        <AnnualPassCard
                            key={pass.id}
                            pass={pass}
                            onCompare={togglePassComparison}
                            isSelected={selectedPasses.includes(pass.id)}
                            index={index}
                        />
                    ))}
                </div>

                {showComparison && (
                    <BlurFade delay={0.2} inView>
                        <NeonGradientCard className="mt-12 overflow-hidden" borderRadius={16}>
                            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-6 overflow-hidden">
                                <h2 className="text-3xl font-bold mb-6 text-center">
                                    <div className="overflow-hidden">
                                        <AnimatedGradientText>
                                            Annual Pass Comparison
                                        </AnimatedGradientText>
                                    </div>
                                </h2>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableCaption>Walt Disney World Annual Pass Comparison Chart</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[200px] min-w-[200px]">Features</TableHead>
                                                {selectedPasses.map(passId => {
                                                    const pass = annualPasses.find(p => p.id === passId)
                                                    return (
                                                        <TableHead key={passId} className="text-center min-w-[180px]">
                                                            <div className="overflow-hidden">
                                                                <SparklesText className="text-sm break-words" sparklesCount={3}>
                                                                    {pass?.name}
                                                                </SparklesText>
                                                            </div>
                                                        </TableHead>
                                                    )
                                                })}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">Price</TableCell>
                                                {selectedPasses.map(passId => {
                                                    const pass = annualPasses.find(p => p.id === passId)
                                                    return (
                                                        <TableCell key={passId} className="text-center font-bold text-lg break-words">
                                                            {pass?.price}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Monthly Payment</TableCell>
                                                {selectedPasses.map(passId => {
                                                    const pass = annualPasses.find(p => p.id === passId)
                                                    return (
                                                        <TableCell key={passId} className="text-center break-words">{pass?.monthlyPayment}/month*</TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Eligibility</TableCell>
                                                {selectedPasses.map(passId => {
                                                    const pass = annualPasses.find(p => p.id === passId)
                                                    return (
                                                        <TableCell key={passId} className="text-center">
                                                            <div className="overflow-hidden">
                                                                <AnimatedGradientText>
                                                                    <Badge variant="outline" className="border-2 max-w-full truncate">
                                                                        {pass?.eligibility}
                                                                    </Badge>
                                                                </AnimatedGradientText>
                                                            </div>
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Park Reservations</TableCell>
                                                {selectedPasses.map(passId => {
                                                    const pass = annualPasses.find(p => p.id === passId)
                                                    return (
                                                        <TableCell key={passId} className="text-center">
                                                            <div className="flex items-center justify-center gap-2 overflow-hidden">
                                                                <CalendarDaysIcon className="w-4 h-4 text-primary flex-shrink-0" />
                                                                <span className="break-words">Up to {pass?.reservations}</span>
                                                            </div>
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Blockout Dates</TableCell>
                                                {selectedPasses.map(passId => {
                                                    const pass = annualPasses.find(p => p.id === passId)
                                                    return (
                                                        <TableCell key={passId} className="text-center">
                                                            {pass?.hasBlockouts ? (
                                                                <div className="flex items-center justify-center gap-2 text-amber-500 overflow-hidden">
                                                                    <XIcon className="w-4 h-4 flex-shrink-0" />
                                                                    <span className="break-words">Yes</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-2 text-green-500 overflow-hidden">
                                                                    <CheckIcon className="w-4 h-4 flex-shrink-0" />
                                                                    <span className="break-words">None</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Standard Parking</TableCell>
                                                {selectedPasses.map(passId => {
                                                    const pass = annualPasses.find(p => p.id === passId)
                                                    return (
                                                        <TableCell key={passId} className="text-center">
                                                            {pass?.standardParking ? (
                                                                <div className="flex items-center justify-center gap-2 text-green-500 overflow-hidden">
                                                                    <CarIcon className="w-4 h-4 flex-shrink-0" />
                                                                    <CheckIcon className="w-4 h-4 flex-shrink-0" />
                                                                </div>
                                                            ) : (
                                                                <XIcon className="mx-auto h-5 w-5 text-red-500" />
                                                            )}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Dining Discounts</TableCell>
                                                {selectedPasses.map(passId => (
                                                    <TableCell key={passId} className="text-center">
                                                        <div className="flex items-center justify-center gap-2 text-green-500 overflow-hidden">
                                                            <UtensilsIcon className="w-4 h-4 flex-shrink-0" />
                                                            <CheckIcon className="w-4 h-4 flex-shrink-0" />
                                                        </div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Merchandise Discounts</TableCell>
                                                {selectedPasses.map(passId => (
                                                    <TableCell key={passId} className="text-center">
                                                        <div className="flex items-center justify-center gap-2 text-green-500 overflow-hidden">
                                                            <ShoppingBagIcon className="w-4 h-4 flex-shrink-0" />
                                                            <span className="break-words">20%</span>
                                                        </div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="mt-8 text-center">
                                    <ShimmerButton
                                        onClick={() => setSelectedPasses([])}
                                        className="px-8 overflow-hidden"
                                        shimmerColor="from-red-400 to-orange-400"
                                    >
                                        <span className="break-words">Clear Comparison</span>
                                    </ShimmerButton>
                                </div>
                            </div>
                        </NeonGradientCard>
                    </BlurFade>
                )}

                <BlurFade delay={0.3} inView>
                    <div className="mt-12 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg p-6 border overflow-hidden">
                        <h3 className="font-semibold text-base mb-3 break-words">Important Information</h3>
                        <p className="mb-2 break-words">*Monthly payment option requires Florida residency and valid ID. Subject to additional terms and conditions.</p>
                        <p className="mb-2 break-words">¹To enter a theme park, each passholder must have a theme park reservation in addition to a valid pass. Theme park reservations are limited and are subject to availability and applicable pass blockout dates.</p>
                        <p className="mb-4 break-words">²Discounts apply to select locations and items. Some restrictions may apply.</p>
                        <p className="font-medium break-words">Annual Passes are subject to the Walt Disney World Resort Annual Pass Terms and Conditions.</p>
                    </div>
                </BlurFade>
            </div>
        </div>
    )
}