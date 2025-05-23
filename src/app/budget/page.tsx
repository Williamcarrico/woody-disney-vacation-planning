import DisneyBudgetCalculator from '@/components/budget/DisneyBudgetCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Disney Vacation Budget Planner | Advanced Planning Tool',
    description: 'Comprehensive Disney World vacation budget calculator with advanced features, real-time pricing, and intelligent recommendations.',
    keywords: 'Disney World, budget calculator, vacation planning, Disney budget, trip planner',
}

export default function BudgetPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-950">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Header Section */}
            <div className="relative z-10">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Disney Vacation
                            <span className="block text-4xl md:text-5xl mt-2">Budget Planner</span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Plan your magical Disney World vacation with our comprehensive budget calculator.
                            Get intelligent recommendations, track expenses, and optimize your dream trip.
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50M+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Annual Visitors</div>
                            </div>
                            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">4</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Theme Parks</div>
                            </div>
                            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">25+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Resort Hotels</div>
                            </div>
                            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">100+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Attractions</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Calculator Section */}
            <div className="relative z-10">
                <DisneyBudgetCalculator />
            </div>

            {/* Footer Section */}
            <div className="relative z-10 mt-16">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Planning Tips for Your Disney Vacation
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6 text-left">
                                <div>
                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Best Times to Visit</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Consider visiting during off-peak seasons for lower prices and smaller crowds.
                                        September, early November, and January-February offer great value.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Money-Saving Tips</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Book dining reservations 60 days in advance, consider Disney meal plans,
                                        and look for package deals that include tickets and accommodation.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Budget Optimization</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Use our calculator to compare different scenarios, consider off-site hotels,
                                        and factor in a 15-20% contingency for unexpected expenses.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}