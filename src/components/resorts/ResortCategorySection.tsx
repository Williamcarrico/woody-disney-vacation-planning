"use client"

import { Resort } from "@/types/unified-resort"
import ResortCard from "./ResortCard"

interface ResortCategorySectionProps {
    readonly title: string
    readonly description: string
    readonly resorts: readonly Resort[]
}

export default function ResortCategorySection({
    title,
    description,
    resorts
}: ResortCategorySectionProps) {
    if (resorts.length === 0) {
        return null
    }

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resorts.map(resort => (
                    <ResortCard key={resort.id} resort={resort} />
                ))}
            </div>
        </section>
    )
}