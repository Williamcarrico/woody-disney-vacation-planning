"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
    number?: number;
    minDelay?: number;
    maxDelay?: number;
    minDuration?: number;
    maxDuration?: number;
    angle?: number;
    className?: string;
}

interface MeteorData {
    angle: number;
    top: string;
    left: string;
    delay: string;
    duration: string;
}

export const Meteors = ({
    number = 20,
    minDelay = 0.2,
    maxDelay = 1.2,
    minDuration = 2,
    maxDuration = 10,
    angle = 215,
    className,
}: MeteorsProps) => {
    const [meteorData, setMeteorData] = useState<MeteorData[]>([]);

    useEffect(() => {
        const data: MeteorData[] = [...new Array(number)].map(() => ({
            angle: -angle,
            top: "-5%",
            left: `calc(0% + ${Math.floor(Math.random() * window.innerWidth)}px)`,
            delay: Math.random() * (maxDelay - minDelay) + minDelay + "s",
            duration:
                Math.floor(Math.random() * (maxDuration - minDuration) + minDuration) +
                "s",
        }));
        setMeteorData(data);
    }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

    return (
        <div className="meteor-container">
            {meteorData.map((meteor, idx) => (
                // Meteor Head
                <span
                    key={idx}
                    className={cn(
                        "meteor-item pointer-events-none absolute size-0.5 animate-meteor rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]",
                        className,
                    )}
                    data-angle={meteor.angle}
                    data-top={meteor.top}
                    data-left={meteor.left}
                    data-delay={meteor.delay}
                    data-duration={meteor.duration}
                >
                    {/* Meteor Tail */}
                    <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-zinc-500 to-transparent" />
                </span>
            ))}
            <style jsx>{`
                .meteor-item {
                    transform: rotate(${meteorData[0]?.angle || 0}deg);
                    top: ${meteorData[0]?.top || '-5%'};
                    left: ${meteorData[0]?.left || '0%'};
                    animation-delay: ${meteorData[0]?.delay || '0s'};
                    animation-duration: ${meteorData[0]?.duration || '1s'};
                }
            `}</style>
        </div>
    );
};