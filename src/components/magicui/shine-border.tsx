"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ShineBorderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number;
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[];
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className,
  ...props
}: ShineBorderProps) {
  const shineColorValue = Array.isArray(shineColor) ? shineColor.join(",") : shineColor;

  return (
    <div
      className={cn(
        "shine-border",
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine",
        className,
      )}
      data-border-width={borderWidth}
      data-duration={duration}
      data-shine-color={shineColorValue}
      {...props}
    />
  );
}
