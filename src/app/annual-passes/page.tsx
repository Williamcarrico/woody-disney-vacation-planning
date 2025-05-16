"use client"

import React, { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { CheckIcon, XIcon } from "lucide-react"

const annualPasses = [
    {
        id: "incredi-pass",
        name: "Disney Incredi-Pass",
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
    },
    {
        id: "sorcerer-pass",
        name: "Disney Sorcerer Pass",
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
    },
    {
        id: "pirate-pass",
        name: "Disney Pirate Pass",
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
    },
    {
        id: "pixie-dust-pass",
        name: "Disney Pixie Dust Pass",
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
    }
]

// Different color classes for each pass type
const colorClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    purple: "bg-purple-600 text-white hover:bg-purple-500",
    blue: "bg-blue-600 text-white hover:bg-blue-500",
    green: "bg-green-600 text-white hover:bg-green-500"
}

const AnnualPassCard = ({ pass, onCompare, isSelected }) => {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-col items-center text-center">
                <CardTitle className="text-xl font-bold">{pass.name}</CardTitle>
                <CardDescription>
                    <Badge variant={isSelected ? "default" : "outline"} className="mb-2">
                        {pass.eligibility}
                    </Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-center mb-6">
                    <p className="text-3xl font-bold">{pass.price}</p>
                    <p className="text-sm text-muted-foreground">Annual Price</p>
                    <p className="text-lg mt-2">{pass.monthlyPayment}<span className="text-sm">/month*</span></p>
                    <p className="text-xs text-muted-foreground">12 Monthly Payments with $99 Down Payment</p>
                </div>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="min-w-5 mt-1">•</span>
                        <span>Admission to one or more Walt Disney World Resort theme parks with an advance reservation</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="min-w-5 mt-1">•</span>
                        <span>This pass can hold up to {pass.reservations} reservations at a time on a rolling basis</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="min-w-5 mt-1">•</span>
                        <span>{pass.blockoutDates}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="min-w-5 mt-1">•</span>
                        <span>Standard theme park parking</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="min-w-5 mt-1">•</span>
                        <span>{pass.discountDining}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="min-w-5 mt-1">•</span>
                        <span>{pass.discountMerchandise}</span>
                    </li>
                </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    className={`w-full ${isSelected ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : colorClasses[pass.color]}`}
                    onClick={() => onCompare(pass.id)}
                >
                    {isSelected ? "Selected for Comparison" : "Compare Pass"}
                </Button>
                <Button variant="outline" className="w-full">
                    Learn More
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function AnnualPassesPage() {
    const [selectedPasses, setSelectedPasses] = useState<string[]>([])

    const togglePassComparison = (passId: string) => {
        setSelectedPasses(prev =>
            prev.includes(passId)
                ? prev.filter(id => id !== passId)
                : [...prev, passId]
        )
    }

    const showComparison = selectedPasses.length > 0

    return (
        <div className="container mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Walt Disney World Annual Passes</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Annual Passes allow you to enjoy the magic all year long. Discover all the possibilities
                    a Walt Disney World Annual Pass can bring to your vacation planning.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {annualPasses.map(pass => (
                    <AnnualPassCard
                        key={pass.id}
                        pass={pass}
                        onCompare={togglePassComparison}
                        isSelected={selectedPasses.includes(pass.id)}
                    />
                ))}
            </div>

            {showComparison && (
                <div className="mt-12 bg-background rounded-lg border p-6 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-2xl font-bold mb-6 text-center">Annual Pass Comparison</h2>
                    <Table>
                        <TableCaption>Walt Disney World Annual Pass Comparison Chart</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Features</TableHead>
                                {selectedPasses.map(passId => {
                                    const pass = annualPasses.find(p => p.id === passId)
                                    return (
                                        <TableHead key={passId} className="text-center">{pass?.name}</TableHead>
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
                                        <TableCell key={passId} className="text-center">{pass?.price}</TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Monthly Payment</TableCell>
                                {selectedPasses.map(passId => {
                                    const pass = annualPasses.find(p => p.id === passId)
                                    return (
                                        <TableCell key={passId} className="text-center">{pass?.monthlyPayment}/month*</TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Eligibility</TableCell>
                                {selectedPasses.map(passId => {
                                    const pass = annualPasses.find(p => p.id === passId)
                                    return (
                                        <TableCell key={passId} className="text-center">
                                            <Badge variant="outline">{pass?.eligibility}</Badge>
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Park Reservations</TableCell>
                                {selectedPasses.map(passId => {
                                    const pass = annualPasses.find(p => p.id === passId)
                                    return (
                                        <TableCell key={passId} className="text-center">Up to {pass?.reservations} at a time</TableCell>
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
                                                <span className="text-amber-500">Yes, with restrictions</span>
                                            ) : (
                                                <span className="text-green-500">None</span>
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
                                                <CheckIcon className="mx-auto h-5 w-5 text-green-500" />
                                            ) : (
                                                <XIcon className="mx-auto h-5 w-5 text-red-500" />
                                            )}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Dining Discounts</TableCell>
                                {selectedPasses.map(passId => {
                                    const pass = annualPasses.find(p => p.id === passId)
                                    return (
                                        <TableCell key={passId} className="text-center">Yes</TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Merchandise Discounts</TableCell>
                                {selectedPasses.map(passId => {
                                    const pass = annualPasses.find(p => p.id === passId)
                                    return (
                                        <TableCell key={passId} className="text-center">Up to 20%</TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="mt-8 text-center">
                        <Button onClick={() => setSelectedPasses([])}>Clear Comparison</Button>
                    </div>
                </div>
            )}

            <div className="mt-12 text-sm text-muted-foreground">
                <p className="mb-2">*Monthly payment option requires Florida residency and valid ID. Subject to additional terms and conditions.</p>
                <p className="mb-2">¹To enter a theme park, each passholder must have a theme park reservation in addition to a valid pass. Theme park reservations are limited and are subject to availability and applicable pass blockout dates.</p>
                <p className="mb-4">²Discounts apply to select locations and items. Some restrictions may apply.</p>
                <p>Annual Passes are subject to the Walt Disney World Resort Annual Pass Terms and Conditions.</p>
            </div>
        </div>
    )
}