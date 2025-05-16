"use client"

import { DisneySpringLocation } from "@/types/disneysprings"
import DisneySpringsCard from "./DisneySpringsCard"

interface DisneySpringsLocationCategoryProps {
    readonly title: string
    readonly description: string
    readonly locations: readonly DisneySpringLocation[]
}

export default function DisneySpringsLocationCategory({
    title,
    description,
    locations
}: DisneySpringsLocationCategoryProps) {
    if (locations.length === 0) {
        return null
    }

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map(location => (
                    <DisneySpringsCard key={location.id} location={location} />
                ))}
            </div>
        </section>
    )
}