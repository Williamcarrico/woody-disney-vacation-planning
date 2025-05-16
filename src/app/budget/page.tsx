import DisneyBudgetCalculator from '@/components/budget/DisneyBudgetCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Disney Vacation Budget Calculator | Plan Your Trip',
    description: 'Calculate and plan your Disney vacation budget with our interactive calculator. Estimate costs for tickets, dining, accommodations, and more.',
    keywords: 'disney budget, vacation planning, disney cost calculator, disney trip planner'
}

export default function BudgetPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto rounded-xl shadow-xl bg-white p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Disney Vacation Budget Calculator</h1>
                <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
                    Plan your magical Disney vacation with confidence by estimating all your expenses in one place.
                </p>
                <DisneyBudgetCalculator />
            </div>
        </main>
    )
}