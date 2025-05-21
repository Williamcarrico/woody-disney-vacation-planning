'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';

export default function GsapExample() {
    // Create refs for the elements we want to animate
    const boxRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use the useGSAP hook to create animations
    useGSAP(() => {
        // Simple animation for the box
        gsap.fromTo(
            boxRef.current,
            {
                opacity: 0,
                y: 100,
                scale: 0.8
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: "elastic.out(1, 0.5)"
            }
        );

        // Create a scroll-triggered animation
        const boxes = containerRef.current?.querySelectorAll('.scroll-box');

        if (boxes?.length) {
            gsap.from(boxes, {
                y: 100,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        }

        // Cleanup function - useGSAP will handle this automatically
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div className="py-8 space-y-16">
            {/* Initial animation example */}
            <div className="flex justify-center">
                <div
                    ref={boxRef}
                    className="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-lg flex items-center justify-center text-white font-bold"
                >
                    GSAP Box
                </div>
            </div>

            {/* Scroll animation example */}
            <div ref={containerRef} className="space-y-4 max-w-md mx-auto">
                <h2 className="text-xl font-bold text-center">Scroll Animation Example</h2>
                <p className="text-center text-gray-500 mb-8">Scroll down to see the animations</p>

                {[
                    { id: 'box-1', number: 1 },
                    { id: 'box-2', number: 2 },
                    { id: 'box-3', number: 3 },
                    { id: 'box-4', number: 4 },
                    { id: 'box-5', number: 5 }
                ].map((item) => (
                    <div
                        key={item.id}
                        className="scroll-box p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md text-white"
                    >
                        Scroll Box {item.number}
                    </div>
                ))}
            </div>
        </div>
    );
}