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
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Disney Dining | Walt Disney World Vacation Planning",
    description: "Explore dining options at Walt Disney World Resort, including dining plans, restaurant information, and how to make reservations.",
}

export default function DiningPage() {
    return (
        <main className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex flex-col space-y-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Disney Dining</h1>
                <p className="text-lg text-muted-foreground">
                    Discover dining options for your Walt Disney World vacation
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Disney Dining Plans</CardTitle>
                        <CardDescription>
                            Add convenience and flexibility to your vacation with prepaid dining options
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="mb-4">
                            Dining plans include a certain number of prepaid meals and snacks, so you can spend less time
                            on meal budgeting while enjoying the Disney magic.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Quick-Service Dining Plan</li>
                            <li>Disney Dining Plan</li>
                            <li>Available at 200+ locations</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/dashboard/dining/dining-plans">
                                View Dining Plans
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Restaurant Reservations</CardTitle>
                        <CardDescription>
                            Make reservations for table-service restaurants and character dining
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="mb-4">
                            Advance dining reservations are highly recommended for table-service restaurants,
                            especially for character dining and signature dining experiences.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Book up to 60 days in advance</li>
                            <li>Character dining experiences</li>
                            <li>Special dietary accommodations</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="https://disneyworld.disney.go.com/dining-reservations/" target="_blank" rel="noopener noreferrer">
                                Make Reservations
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Mobile Food Ordering</CardTitle>
                        <CardDescription>
                            Save time by ordering meals in advance through the My Disney Experience app
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="mb-4">
                            Mobile ordering allows you to order food and beverages from select quick-service
                            restaurants around Walt Disney World Resort.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Order ahead and skip the line</li>
                            <li>Available at many quick-service locations</li>
                            <li>Pay with credit card or Disney Dining Plan</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="https://disneyworld.disney.go.com/guest-services/mobile-food-orders/" target="_blank" rel="noopener noreferrer">
                                Learn About Mobile Ordering
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Dining Experiences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium">Character Dining</h3>
                        <p>
                            Enjoy a meal with your favorite Disney Characters! These unique dining
                            experiences combine delicious food with character meet-and-greets,
                            providing memorable moments for the whole family.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Popular character dining locations include Chef Mickey&apos;s, Cinderella&apos;s Royal Table,
                            and Tusker House Restaurant.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium">Signature Dining</h3>
                        <p>
                            Experience exceptional dining with sophisticated menus, elegant ambiance,
                            and impeccable service. These fine dining establishments offer premium ingredients
                            and unique culinary experiences.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Signature dining locations include California Grill, Le Cellier Steakhouse,
                            and Jiko – The Cooking Place.
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-6">Dietary Accommodations</h2>
                <p className="mb-4">
                    Walt Disney World Resort is committed to offering a wide range of options for guests seeking
                    well-balanced meals, as well as those with lifestyle dining requests or special dietary requests.
                </p>
                <p className="mb-4">
                    Guests should note dietary requests at the time of reservation, and speak with a chef or manager
                    upon arrival at the dining location.
                </p>
                <div className="flex justify-center mt-8">
                    <Button asChild>
                        <Link href="https://disneyworld.disney.go.com/guest-services/special-dietary-requests/" target="_blank" rel="noopener noreferrer">
                            Special Dietary Requests
                        </Link>
                    </Button>
                </div>
            </section>
        </main>
    )
}