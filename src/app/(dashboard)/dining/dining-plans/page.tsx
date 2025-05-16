import { Metadata } from "next"
import Link from "next/link"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
    title: "Disney Dining Plans | Walt Disney World Vacation Planning",
    description: "Explore Disney Dining Plans for your Walt Disney World vacation. Compare Quick-Service and Table-Service options, view pricing, and learn how to maximize your dining experience.",
}

export default function DiningPlansPage() {
    return (
        <main className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex flex-col space-y-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Disney Dining Plans</h1>
                <p className="text-lg text-muted-foreground">
                    Add convenience and flexibility to your Walt Disney World vacation with prepaid dining options
                </p>
            </div>

            <section className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Convenience & Flexibility</h2>
                        <p>
                            Dining plans add convenience and flexibility of prepaid meals and snacks to your vacation—and give you peace of mind.
                            There are more than 200 locations to dine at throughout Disney Resort hotels, theme parks and select locations at Disney Springs.
                            So there&apos;s something to delight nearly every taste!
                        </p>
                        <div className="flex flex-col space-y-2">
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Make dining reservations up to 60 days in advance</span>
                            </span>
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>No need to carry cash for meals</span>
                            </span>
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Planning and budgeting in advance is simple</span>
                            </span>
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Track remaining meals and snacks via My Disney Experience app</span>
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Value & Savings</h2>
                        <p>
                            For travel in 2025: You can save up to 20% on dining for kids ages 3 to 9 when you purchase a dining plan
                            for your family as part of a Walt Disney Travel Company package.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For travel in 2026</h3>
                            <p className="text-blue-700 dark:text-blue-400">
                                Get a free dining plan for kids (ages 3 to 9) with the purchase of an eligible
                                Walt Disney Travel Company package, for arrivals most nights in 2026.
                            </p>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-medium mb-2">Vacation Value</h3>
                            <p>
                                Dining plans include prepaid meals and snacks—so you can spend more time with your family
                                enjoying the Disney magic and less time on meal budgeting while at Walt Disney World Resort.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-4">How Dining Plans Work</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground mb-3">
                                <span className="font-bold">1</span>
                            </div>
                            <p>Your meals and snacks are loaded onto your Disney band or card</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground mb-3">
                                <span className="font-bold">2</span>
                            </div>
                            <p>Touch your Disney band or card to the magic point when making a purchase</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground mb-3">
                                <span className="font-bold">3</span>
                            </div>
                            <p>Your server will give you a receipt showing your updated meal balance</p>
                        </div>
                    </div>
                </div>
            </section>

            <Separator className="my-8" />

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Pick the Best Option for Your Family</h2>

                <Tabs defaultValue="quick-service" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="quick-service">Disney Quick-Service Dining Plan</TabsTrigger>
                        <TabsTrigger value="dining">Disney Dining Plan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="quick-service">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Disney Quick-Service Dining Plan</CardTitle>
                                <CardDescription>
                                    For families on the go all day, this is a fast and easy meal plan option—especially when you have little ones in tow.
                                </CardDescription>
                                <Badge variant="outline" className="mt-2">Available at 100+ locations</Badge>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/2">
                                        <p className="mb-4">
                                            With the Disney Quick-Service Dining Plan you can dine at a variety of Quick-Service locations
                                            when you&apos;re ready to stop and enjoy a casual meal. Just order at a counter or register and then
                                            find a seat—no dining reservations required!
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">What&apos;s Included</h4>
                                            <p className="text-sm mb-2">Everyone in the party ages 3 and over receives the following per night of stay:</p>
                                            <ul className="space-y-2 list-disc list-inside">
                                                <li>2 Quick-Service Meals</li>
                                                <li>1 Snack/Nonalcoholic Drink</li>
                                                <li>1 Resort-Refillable Drink Mug</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="md:w-1/2">
                                        <h4 className="font-semibold mb-2">Quick-Service Meal Includes:</h4>
                                        <div className="space-y-4">
                                            <div className="bg-muted p-4 rounded-lg">
                                                <h5 className="font-medium mb-2">For Breakfast, Lunch, or Dinner:</h5>
                                                <ul className="list-disc list-inside text-sm">
                                                    <li>1 Entrée</li>
                                                    <li>1 Nonalcoholic Beverage (or Alcoholic Beverage, for Guests 21 and older)</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="font-medium mb-2">Snack Options Include:</h5>
                                                <ul className="list-disc list-inside text-sm">
                                                    <li>Frozen ice cream novelty, popsicle or fruit bar</li>
                                                    <li>Popcorn (single-serving box)</li>
                                                    <li>20-ounce fountain soft drink</li>
                                                    <li>20-ounce bottle of water</li>
                                                    <li>Single-serving bag of snacks</li>
                                                    <li>Piece of whole fruit</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Important Information</h4>
                                    <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                        <li>Guests ages 3 to 9 must order from a children&apos;s menu, where available</li>
                                        <li>Plan must be purchased for entire length of stay and for the entire party (ages 3 and up)</li>
                                        <li>Meals are nontransferable between party members</li>
                                        <li>Unused meals and snacks expire at midnight on day of checkout</li>
                                        <li>Resort-refillable mugs are eligible for refills from self-service beverage islands at any Disney Resort hotel Quick-Service location</li>
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                    Example: If you book a 4-night package, each Guest (ages 3 and up) receives 8 Quick-Service meals and 4 Snacks
                                    which can be used at any time during your 4-night stay.
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="dining">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Disney Dining Plan</CardTitle>
                                <CardDescription>
                                    Want to slow down a little and savor special family moments over sit-down meals—or watch the kids light up during Character Dining?
                                </CardDescription>
                                <Badge variant="outline" className="mt-2">Available at 170+ locations</Badge>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/2">
                                        <p className="mb-4">
                                            Experience classic dining options at both Quick-Service and Table-Service restaurants—including Character dining locations.
                                            This option allows you to easily plan your meals: Quick-Service when you&apos;re on the go and Table-Service when you&apos;re ready
                                            to savor the moment.
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">What&apos;s Included</h4>
                                            <p className="text-sm mb-2">Everyone in the party ages 3 and over receives the following per night of stay:</p>
                                            <ul className="space-y-2 list-disc list-inside">
                                                <li>1 Quick-Service Meal</li>
                                                <li>1 Table-Service Meal</li>
                                                <li>1 Snack/Nonalcoholic Drink</li>
                                                <li>1 Resort-Refillable Drink Mug</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="md:w-1/2">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">Table-Service Meal Includes:</h4>
                                                <div className="bg-muted p-4 rounded-lg">
                                                    <h5 className="font-medium mb-1">For Breakfast:</h5>
                                                    <ul className="list-disc list-inside text-sm">
                                                        <li>1 Entrée</li>
                                                        <li>1 Beverage (including specialty beverages)</li>
                                                        <li>OR 1 Full Buffet/Family-Style Meal and Beverage</li>
                                                    </ul>

                                                    <h5 className="font-medium mb-1 mt-3">For Lunch/Dinner:</h5>
                                                    <ul className="list-disc list-inside text-sm">
                                                        <li>1 Entrée</li>
                                                        <li>1 Dessert</li>
                                                        <li>1 Beverage (including specialty and alcoholic beverages, for guests 21+)</li>
                                                        <li>OR 1 Full Buffet/Family-Style Meal and Beverage</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Special Dining Experiences:</h4>
                                                <ul className="list-disc list-inside text-sm">
                                                    <li className="mb-1"><span className="font-medium">Character Dining</span>: Dine with Disney Characters (some locations require 2 Table-Service credits)</li>
                                                    <li className="mb-1"><span className="font-medium">Signature Dining</span>: Fine dining experiences (requires 2 Table-Service credits)</li>
                                                    <li className="mb-1"><span className="font-medium">Dinner Shows</span>: Entertainment with your meal (requires 2 Table-Service credits)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
                                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Dining Reservations</h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        Advance reservations for Table-Service restaurants, Character Dining, and Signature Dining are strongly recommended
                                        and can be made up to 60 days prior to your visit. Dinner shows require advance reservations.
                                    </p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Important Information</h4>
                                    <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                        <li>Reservations at Table-Service restaurants are highly recommended and are subject to availability</li>
                                        <li>Guests ages 3 to 9 must order from a children&apos;s menu, where available</li>
                                        <li>Plan must be purchased for the entire length of stay and for the entire party (ages 3 and up)</li>
                                        <li>Gratuities are not included (except at dinner shows and Cinderella&apos;s Royal Table)</li>
                                        <li>An 18% gratuity will automatically be added to your bill for parties of 6 or more</li>
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                    Example: If you book a 4-night package, each Guest (ages 3 and up) receives 4 Table-Service meals, 4 Quick-Service meals,
                                    and 4 Snacks which can be used at any time during your 4-night stay.
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </section>

            <Separator className="my-8" />

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">How to Get a Dining Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase a Disney Resort Hotel Package</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Guests of Disney Resort hotels can choose one of the Disney Resort Hotel Packages
                                that includes a dining plan. These packages offer the convenience and flexibility
                                of prepaid dining at over 200 locations throughout Walt Disney World Resort.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Add to an Existing Reservation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Already have a Disney Resort hotel reservation? Contact Disney to modify your
                                reservation and add a dining plan to your vacation package.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">How to Use Your Dining Plan</h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/2">
                                    <h3 className="text-xl font-medium mb-3">Using Your Plan</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                                            <span>Present your valid Disney Resort ID (MagicBand, Disney MagicMobile pass or Key to the World card) to your server or cashier at participating restaurants.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                                            <span>For special dietary requests, mention them when ordering or speak with a chef or manager.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                                            <span>If dining with another party that&apos;s also on a dining plan, notify the server which meals should be redeemed for each party.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="md:w-1/2">
                                    <h3 className="text-xl font-medium mb-3">Tracking Your Plan</h3>
                                    <p className="mb-3">Your dining plan usage is electronically linked to your reservation. Keep track of your remaining meals and snacks in 3 ways:</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                                            <span>View your remaining meals and snacks in the My Disney Experience app.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                                            <span>Check your dining receipts. Remaining meals and snacks are printed on them.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                                            <span>Ask your Resort Concierge or Guest Relations to obtain them at any time.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="bg-muted p-4 rounded-lg text-center mt-4">
                                <p className="font-medium">Remember: Unused meals and snacks will roll over day to day and expire at midnight on day of checkout.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <div className="flex justify-center mt-8">
                <Button asChild size="lg">
                    <Link href="/planning">
                        Start Planning Your Disney Vacation
                    </Link>
                </Button>
            </div>
        </main>
    )
}