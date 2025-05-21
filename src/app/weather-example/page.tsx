import React from 'react'
import { WeatherForecastWidget } from '@/components/weather'
import '@/components/weather/animations.css'

export const metadata = {
    title: 'Weather Forecast Example - Disney Vacation Planning',
    description: 'Example of the Weather Forecast Widget for Disney vacation planning',
}

export default function WeatherExamplePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Weather Forecast for Disney Vacations</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Orlando Weather</h2>
                    <p className="text-muted-foreground mb-6">
                        Check the current weather and forecast for your Disney World vacation.
                        Plan your park visits based on weather conditions.
                    </p>

                    <div className="mt-4">
                        <WeatherForecastWidget
                            location="Orlando, FL"
                            units="imperial"
                            daysToShow={5}
                            className="w-full"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Anaheim Weather</h2>
                    <p className="text-muted-foreground mb-6">
                        Check the current weather and forecast for your Disneyland vacation.
                        Prepare for your day at the parks with accurate weather data.
                    </p>

                    <div className="mt-4">
                        <WeatherForecastWidget
                            location="Anaheim, CA"
                            units="imperial"
                            showForecast={true}
                            daysToShow={3}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-4">Weather Tips for Disney Parks</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-card p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium mb-2">Rainy Day Essentials</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Pack ponchos instead of umbrellas</li>
                            <li>Bring extra socks to change into</li>
                            <li>Plan indoor attractions and shows</li>
                            <li>Check for weather-related closures</li>
                        </ul>
                    </div>

                    <div className="bg-card p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium mb-2">Hot Day Strategies</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Stay hydrated with water bottles</li>
                            <li>Take afternoon breaks during peak heat</li>
                            <li>Wear light, breathable clothing</li>
                            <li>Use cooling towels and hats</li>
                        </ul>
                    </div>

                    <div className="bg-card p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium mb-2">Cold Weather Planning</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Dress in layers for temperature changes</li>
                            <li>Bring gloves and hats during winter</li>
                            <li>Check for seasonal event schedules</li>
                            <li>Watch for reduced hours in off-season</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground">
                <p>Weather data provided by Tomorrow.io API</p>
            </div>
        </div>
    )
}