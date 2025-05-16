'use client'

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

const CarouselContext = React.createContext<{
    api?: any
    currentIndex: number
    canScrollPrev: boolean
    canScrollNext: boolean
    scrollPrev: () => void
    scrollNext: () => void
    onSelect: (index: number) => void
}>({
    currentIndex: 0,
    canScrollPrev: false,
    canScrollNext: false,
    scrollPrev: () => { },
    scrollNext: () => { },
    onSelect: () => { },
})

function useCarousel() {
    const context = React.useContext(CarouselContext)
    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />")
    }
    return context
}

const Carousel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        opts?: any
        orientation?: "horizontal" | "vertical"
        setApi?: (api: any) => void
    }
>(
    (
        {
            orientation = "horizontal",
            opts,
            setApi,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const [carouselRef, setCarouselRef] = React.useState<HTMLDivElement | null>(
            null
        )
        const [api, setApiState] = React.useState<any>(null)
        const [currentIndex, setCurrentIndex] = React.useState(0)
        const [canScrollPrev, setCanScrollPrev] = React.useState(false)
        const [canScrollNext, setCanScrollNext] = React.useState(false)

        const onSelect = React.useCallback((index: number) => {
            if (!api) return
            api.scrollTo(index)
        }, [api])

        const scrollPrev = React.useCallback(() => {
            if (!api) return
            api.scrollPrev()
        }, [api])

        const scrollNext = React.useCallback(() => {
            if (!api) return
            api.scrollNext()
        }, [api])

        React.useEffect(() => {
            // Simple implementation - using array of child elements
            if (carouselRef) {
                const children = Array.from(carouselRef.children)
                const childCount = children.length
                setCanScrollNext(currentIndex < childCount - 1)
                setCanScrollPrev(currentIndex > 0)
            }
        }, [api, carouselRef, currentIndex])

        React.useEffect(() => {
            if (!carouselRef) return

            const handleNextScroll = () => {
                if (currentIndex < carouselRef.children.length - 1) {
                    setCurrentIndex(currentIndex + 1)
                }
            }

            const handlePrevScroll = () => {
                if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1)
                }
            }

            // Simulate API for basic carousel functionality
            const mockApi = {
                scrollNext: handleNextScroll,
                scrollPrev: handlePrevScroll,
                scrollTo: (index: number) => {
                    if (index >= 0 && index < carouselRef.children.length) {
                        setCurrentIndex(index)
                    }
                }
            }

            setApiState(mockApi)
            if (setApi) {
                setApi(mockApi)
            }
        }, [carouselRef, currentIndex, setApi])

        const handleRef = React.useCallback((node: HTMLDivElement) => {
            setCarouselRef(node)
            if (typeof ref === "function") {
                ref(node)
            } else if (ref) {
                ref.current = node
            }
        }, [ref])

        return (
            <CarouselContext.Provider
                value={{
                    api,
                    currentIndex,
                    canScrollPrev,
                    canScrollNext,
                    scrollPrev,
                    scrollNext,
                    onSelect,
                }}
            >
                <div
                    ref={handleRef}
                    className={cn("relative", className)}
                    role="region"
                    aria-roledescription="carousel"
                    {...props}
                >
                    {children}
                </div>
            </CarouselContext.Provider>
        )
    }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { currentIndex } = useCarousel()

    return (
        <div
            ref={ref}
            className={cn(
                "flex transition-transform duration-300 ease-in-out",
                className
            )}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            {...props}
        />
    )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            role="group"
            aria-roledescription="slide"
            className={cn("min-w-0 flex-shrink-0 flex-grow-0 basis-full", className)}
            {...props}
        />
    )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    const { scrollPrev, canScrollPrev } = useCarousel()

    return (
        <button
            ref={ref}
            className={cn(
                "absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md hover:bg-white disabled:opacity-50",
                className
            )}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            {...props}
        >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Previous slide</span>
        </button>
    )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    const { scrollNext, canScrollNext } = useCarousel()

    return (
        <button
            ref={ref}
            className={cn(
                "absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md hover:bg-white disabled:opacity-50",
                className
            )}
            disabled={!canScrollNext}
            onClick={scrollNext}
            {...props}
        >
            <ArrowRightIcon className="h-4 w-4" />
            <span className="sr-only">Next slide</span>
        </button>
    )
})
CarouselNext.displayName = "CarouselNext"

export {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
}