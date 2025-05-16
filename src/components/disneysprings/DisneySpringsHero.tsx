"use client"

export default function DisneySpringsHero() {
    return (
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 h-80">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/disney-springs/disney-springs-hero.jpg')] bg-cover bg-center opacity-30"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="relative flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Disney Springs</h1>
                <p className="text-xl text-white/90 max-w-3xl">
                    Discover a vibrant waterfront district filled with unique shops, incredible dining, and world-class entertainment.
                </p>
            </div>
        </div>
    )
}