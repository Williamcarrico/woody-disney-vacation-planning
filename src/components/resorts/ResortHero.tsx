"use client"

import Image from "next/image"

export default function ResortHero() {
    return (
        <div className="relative h-[50vh] w-full overflow-hidden">
            <Image
                src="/images/resorts/resort-hero.jpg"
                alt="Disney World Resorts"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                    Disney Resorts
                </h1>
                <p className="text-xl md:text-2xl text-white max-w-3xl drop-shadow-md">
                    Immerse yourself in the magic with accommodations that are an experience unto themselves
                </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
        </div>
    )
}