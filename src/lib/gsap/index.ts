'use client';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { Draggable } from "gsap/Draggable";
import { MotionPathHelper } from "gsap/MotionPathHelper";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register all plugins
gsap.registerPlugin(
    Draggable,
    MotionPathHelper,
    MotionPathPlugin,
    MorphSVGPlugin,
    Physics2DPlugin,
    ScrollTrigger
);

// Set default GSAP configurations if needed
gsap.defaults({
    ease: "power2.out",
    duration: 0.7
});

// Export everything for easy imports elsewhere in the app
export {
    gsap,
    useGSAP,
    Draggable,
    MotionPathHelper,
    MotionPathPlugin,
    MorphSVGPlugin,
    Physics2DPlugin,
    ScrollTrigger
};