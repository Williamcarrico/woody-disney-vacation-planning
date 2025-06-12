// GSAP exports with proper loading
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Register plugins dynamically to avoid SSR issues
if (typeof window !== 'undefined') {
  const { ScrollTrigger } = require('gsap/ScrollTrigger');
  const { TextPlugin } = require('gsap/TextPlugin');
  
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Re-export everything needed
export { gsap, useGSAP };
export { ScrollTrigger } from 'gsap/ScrollTrigger';
export { TextPlugin } from 'gsap/TextPlugin';