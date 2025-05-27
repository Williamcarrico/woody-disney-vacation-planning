"use client";

import React, { HTMLAttributes, useCallback, useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  perspective?: number;
  beamsPerSide?: number;
  beamSize?: number;
  beamDelayMax?: number;
  beamDelayMin?: number;
  beamDuration?: number;
  gridColor?: string;
}

interface BeamProps {
  width: string | number;
  x: string | number;
  delay: number;
  duration: number;
  hue: number;
  aspectRatio: number;
}

const Beam = ({
  width,
  x,
  delay,
  duration,
  hue,
  aspectRatio,
}: BeamProps) => {
  const beamClasses = cn(
    "absolute top-0 warp-beam",
    `[--beam-x:${x}]`,
    `[--beam-width:${width}]`,
    `[--beam-aspect-ratio:${aspectRatio}]`,
    `[--beam-hue:${hue}]`
  );

  return (
    <motion.div
      className={beamClasses}
      initial={{ y: "100cqmax", x: "-50%" }}
      animate={{ y: "-100%", x: "-50%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = "var(--border)",
  ...props
}) => {
  const [isClient, setIsClient] = useState(false);
  const [beamData, setBeamData] = useState<{
    topBeams: Array<{ x: number; delay: number; hue: number; aspectRatio: number }>;
    rightBeams: Array<{ x: number; delay: number; hue: number; aspectRatio: number }>;
    bottomBeams: Array<{ x: number; delay: number; hue: number; aspectRatio: number }>;
    leftBeams: Array<{ x: number; delay: number; hue: number; aspectRatio: number }>;
  }>({
    topBeams: [],
    rightBeams: [],
    bottomBeams: [],
    leftBeams: [],
  });

  // Use Tailwind arbitrary properties instead of inline styles
  const containerClasses = cn(
    "warp-container pointer-events-none absolute left-0 top-0 size-full overflow-hidden [clipPath:inset(0)] [container-type:size] [transform-style:preserve-3d]",
    `[--warp-perspective:${perspective}px]`,
    `[--warp-grid-color:${gridColor}]`,
    `[--warp-beam-size:${beamSize}%]`
  );

  const generateBeams = useCallback(() => {
    const beams = [];
    const cellsPerSide = Math.floor(100 / beamSize);
    const step = cellsPerSide / beamsPerSide;

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step);
      const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
      const hue = Math.floor(Math.random() * 360);
      const aspectRatio = Math.floor(Math.random() * 10) + 1;
      beams.push({ x, delay, hue, aspectRatio });
    }
    return beams;
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

  useEffect(() => {
    setIsClient(true);
    setBeamData({
      topBeams: generateBeams(),
      rightBeams: generateBeams(),
      bottomBeams: generateBeams(),
      leftBeams: generateBeams(),
    });
  }, [generateBeams]);

  // Don't render beams on server to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={cn("relative rounded border p-20", className)} {...props}>
        <div className={containerClasses}>
          {/* Render grid background without beams on server */}
          <div className="warp-grid absolute z-20 [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]" />
          <div className="warp-grid absolute top-full [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]" />
          <div className="warp-grid absolute left-0 top-0 [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [transform-origin:0%_0%] [transform:rotate(90deg)_rotateX(-90deg)] [width:100cqh]" />
          <div className="warp-grid absolute right-0 top-0 [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [width:100cqh] [transform-origin:100%_0%] [transform:rotate(-90deg)_rotateX(-90deg)]" />
        </div>
        <div className="relative">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded border p-20", className)} {...props}>
      <div className={containerClasses}>
        {/* top side */}
        <div className="warp-grid absolute z-20 [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]">
          {beamData.topBeams.map((beam, index) => (
            <Beam
              key={`top-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* bottom side */}
        <div className="warp-grid absolute top-full [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]">
          {beamData.bottomBeams.map((beam, index) => (
            <Beam
              key={`bottom-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* left side */}
        <div className="warp-grid absolute left-0 top-0 [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [transform-origin:0%_0%] [transform:rotate(90deg)_rotateX(-90deg)] [width:100cqh]">
          {beamData.leftBeams.map((beam, index) => (
            <Beam
              key={`left-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* right side */}
        <div className="warp-grid absolute right-0 top-0 [transform-style:preserve-3d] [container-type:inline-size] [height:100cqmax] [width:100cqh] [transform-origin:100%_0%] [transform:rotate(-90deg)_rotateX(-90deg)]">
          {beamData.rightBeams.map((beam, index) => (
            <Beam
              key={`right-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
};
