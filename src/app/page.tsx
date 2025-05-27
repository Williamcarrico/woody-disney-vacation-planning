'use client'

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Sparkles, Trophy, Dice6, Puzzle } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Particles } from '@/components/magicui/particles';
import { Marquee } from '@/components/magicui/marquee';
import { Kalam, Fredoka, Bubblegum_Sans, Pacifico, Grandstander, Comic_Neue, Bungee, Caveat } from 'next/font/google';
import { BorderBeam } from '@/components/magicui/border-beam';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { BlurFade } from '@/components/magicui/blur-fade';
import { Meteors } from '@/components/magicui/meteors';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { cn } from "@/lib/utils";

// Enhanced Disney-inspired fonts
import {
  Lilita_One,
  Luckiest_Guy,
  Titan_One,
  Modak,
  Sigmar_One,
  Bungee_Shade,
  Shrikhand,
  Bowlby_One,
  Righteous,
  Baloo_2,
  Chicle,
  Sniglet,
  Chewy,
  Patrick_Hand,
  Permanent_Marker,
  Amatic_SC,
  Gloria_Hallelujah,
  Architects_Daughter,
  Kaushan_Script,
  Dancing_Script,
  Lobster,
  Abril_Fatface,
  Bebas_Neue,
  Rubik_Wet_Paint,
  Rubik_Glitch,
  Rubik_Moonrocks,
  Rubik_Puddles,
  Rubik_Spray_Paint
} from 'next/font/google';

// Initialize fonts
const kalam = Kalam({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
});

const bubblegum = Bubblegum_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bubblegum',
});

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pacifico',
});

const grandstander = Grandstander({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-grandstander',
});

const comic = Comic_Neue({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-comic',
});

const bungee = Bungee({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bungee',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
});

const lilitaOne = Lilita_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-lilita'
});

const luckiestGuy = Luckiest_Guy({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-luckiest'
});

const titanOne = Titan_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-titan'
});

const modak = Modak({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-modak'
});

const sigmarOne = Sigmar_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-sigmar'
});

const bungeeShade = Bungee_Shade({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bungee-shade'
});

const shrikhand = Shrikhand({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-shrikhand'
});

const bowlbyOne = Bowlby_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bowlby'
});

const righteous = Righteous({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-righteous'
});

const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-baloo'
});

const chicle = Chicle({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-chicle'
});

const sniglet = Sniglet({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-sniglet'
});

const chewy = Chewy({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-chewy'
});

const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-patrick'
});

const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-permanent'
});

const amaticSc = Amatic_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-amatic'
});

const gloriaHallelujah = Gloria_Hallelujah({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-gloria'
});

const architectsDaughter = Architects_Daughter({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-architects'
});

const kaushanScript = Kaushan_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-kaushan'
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dancing'
});

const lobster = Lobster({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-lobster'
});

const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-abril'
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas'
});

const rubikWetPaint = Rubik_Wet_Paint({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rubik-wet'
});

const rubikGlitch = Rubik_Glitch({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rubik-glitch'
});

const rubikMoonrocks = Rubik_Moonrocks({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rubik-moon'
});

const rubikPuddles = Rubik_Puddles({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rubik-puddles'
});

const rubikSprayPaint = Rubik_Spray_Paint({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rubik-spray'
});

// Enhanced Sound Effects Hook
const useSound = () => {
  const [isMuted, setIsMuted] = useState(true);

  const playSound = useCallback((soundType: 'sparkle' | 'click' | 'woosh' | 'success' | 'magic' | 'pop' | 'coin' | 'fairy' | 'win' | 'lose' | 'powerup' | 'achievement') => {
    if (isMuted) return;

    try {
      interface WindowWithWebkitAudio extends Window {
        webkitAudioContext?: typeof AudioContext;
      }

      const windowWithAudio = window as WindowWithWebkitAudio;
      const AudioContextClass = window.AudioContext || windowWithAudio.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (soundType) {
        case 'sparkle':
          oscillator.frequency.value = 1600;
          gainNode.gain.value = 0.1;
          break;
        case 'click':
          oscillator.frequency.value = 400;
          gainNode.gain.value = 0.2;
          break;
        case 'woosh':
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.15;
          break;
        case 'success':
          oscillator.frequency.value = 1200;
          gainNode.gain.value = 0.2;
          break;
        case 'magic':
          oscillator.frequency.value = 1800;
          gainNode.gain.value = 0.12;
          break;
        case 'pop':
          oscillator.frequency.value = 300;
          gainNode.gain.value = 0.18;
          break;
        case 'coin':
          oscillator.frequency.value = 1000;
          gainNode.gain.value = 0.15;
          break;
        case 'fairy':
          oscillator.frequency.value = 2000;
          gainNode.gain.value = 0.08;
          break;
        case 'win':
          oscillator.frequency.value = 1500;
          gainNode.gain.value = 0.2;
          break;
        case 'lose':
          oscillator.frequency.value = 200;
          gainNode.gain.value = 0.15;
          break;
        case 'powerup':
          oscillator.frequency.value = 2200;
          gainNode.gain.value = 0.1;
          break;
        case 'achievement':
          oscillator.frequency.value = 1600;
          gainNode.gain.value = 0.18;
          break;
      }

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn('Web Audio API not available:', error);
    }
  }, [isMuted]);

  return { isMuted, setIsMuted, playSound };
};

// Enhanced Mickey Mouse Cursor with Walt Disney theming
function WaltCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] mix-blend-difference"
      animate={{
        x: mousePos.x - 15,
        y: mousePos.y - 15,
        scale: isClicking ? 1.2 : 1
      }}
      transition={{ type: "spring", damping: 20, stiffness: 400, mass: 0.1 }}
    >
      <div className="relative">
        <motion.div
          className="absolute w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"
          animate={{ rotate: isClicking ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="absolute -top-3 -left-3 w-5 h-5 bg-gradient-to-br from-pink-400 to-red-500 rounded-full shadow-lg"
          animate={{ scale: isClicking ? 1.2 : 1 }}
        />
        <motion.div
          className="absolute -top-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg"
          animate={{ scale: isClicking ? 1.2 : 1 }}
        />
        {isClicking && (
          <motion.div
            className="absolute inset-0 w-8 h-8 bg-white rounded-full opacity-30"
            initial={{ scale: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
  );
}

// Enhanced Disney Character Floating Animation
// function FloatingCharacter({
//   character,
//   delay = 0,
//   duration = 20,
//   path = "circle",
//   scale = 1
// }: {
//   character: string,
//   delay?: number,
//   duration?: number,
//   path?: "circle" | "infinity" | "wave" | "zigzag",
//   scale?: number
// }) {
//   const getPath = () => {
//     switch (path) {
//       case "infinity":
//         return {
//           x: [0, 100, 0, -100, 0],
//           y: [0, -50, 0, 50, 0],
//           rotate: [0, 180, 360, 540, 720]
//         };
//       case "wave":
//         return {
//           x: [0, 100, 200, 300, 400],
//           y: [0, -30, 0, 30, 0],
//           rotate: [0, 90, 180, 270, 360]
//         };
//       case "zigzag":
//         return {
//           x: [0, 50, -50, 50, 0],
//           y: [0, -100, -50, -150, -200],
//           rotate: [0, 45, -45, 45, 0]
//         };
//       default:
//         return {
//           x: [0, 50, 0, -50, 0],
//           y: [0, -50, -70, -50, 0],
//           rotate: [0, 360, 720, 1080, 1440]
//         };
//     }
//   };

//   const pathData = getPath();

//   return (
//     <motion.div
//       className="absolute text-4xl select-none"
//       style={{ scale }}
//       animate={pathData}
//       transition={{
//         duration,
//         delay,
//         repeat: Infinity,
//         ease: "linear"
//       }}
//     >
//       {character}
//     </motion.div>
//   );
// }

// Enhanced Planning Tools Feature Component
// function PlanningToolFeature({
//   title,
//   description,
//   icon,
//   stats,
//   color,
//   features,
//   demoAction,
//   pricing,
//   category,
//   isPopular = false
// }: {
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   stats: string;
//   color: string;
//   features: string[];
//   demoAction: string;
//   pricing: string;
//   category: string;
//   isPopular?: boolean;
// }) {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [showDemo, setShowDemo] = useState(false);
//   const { playSound } = useSound();

//   return (
//     <motion.div
//       className="relative h-full group"
//       onHoverStart={() => setIsHovered(true)}
//       onHoverEnd={() => setIsHovered(false)}
//       whileHover={{ y: -8, scale: 1.02 }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//     >
//       {isPopular && (
//         <motion.div
//           className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
//           animate={{ rotate: [0, 5, -5, 0] }}
//           transition={{ duration: 2, repeat: Infinity }}
//         >
//           <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold font-fredoka shadow-xl border-2 border-white">
//             ⭐ Most Popular ⭐
//           </div>
//         </motion.div>
//       )}

//       <MagicCard
//         className="h-full relative overflow-hidden"
//         gradientColor="#D946EF"
//         gradientOpacity={0.1}
//       >
//         <div className={cn(
//           "h-full p-8 rounded-3xl bg-gradient-to-br shadow-2xl border border-white/10 backdrop-blur-xl cursor-pointer relative overflow-hidden transition-all duration-500",
//           color,
//           isHovered && "border-white/30 shadow-3xl",
//           isPopular && "ring-4 ring-yellow-400/50"
//         )}
//           onClick={() => {
//             setIsExpanded(!isExpanded);
//             playSound('click');
//           }}
//         >
//           <div className="absolute inset-0 opacity-20">
//             <Particles
//               className="absolute inset-0"
//               quantity={30}
//               staticity={50}
//               color="#FFD700"
//               size={0.3}
//               vx={0.02}
//               vy={-0.02}
//             />
//           </div>

//           <motion.div
//             className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-comic text-white/90 border border-white/20"
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.3 }}
//           >
//             {category}
//           </motion.div>

//           <div className="flex items-start justify-between mb-6 relative z-10">
//             <motion.div
//               className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg"
//               whileHover={{ rotate: 360, scale: 1.15 }}
//               transition={{ duration: 0.6, type: "spring" }}
//             >
//               {icon}
//             </motion.div>
//             <motion.div
//               className="flex flex-col items-end gap-2"
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               <div className="text-white/70 text-sm font-comic px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
//                 {stats}
//               </div>
//               <div className="text-yellow-300 text-xs font-fredoka px-2 py-1 rounded-full bg-yellow-400/20">
//                 {pricing}
//               </div>
//             </motion.div>
//           </div>

//           <div className="relative z-10">
//             <h3 className="text-3xl font-bold text-white mb-4 font-fredoka leading-tight">
//               <SparklesText className="text-white">
//                 {title}
//               </SparklesText>
//             </h3>

//             <p className="text-white/90 mb-6 font-comic leading-relaxed text-lg">
//               {description}
//             </p>

//             <div className="space-y-3 mb-6">
//               {features.slice(0, 3).map((feature, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.4 + i * 0.1 }}
//                   className="flex items-center gap-3 text-white/80 text-sm font-comic"
//                 >
//                   <motion.div
//                     className="w-2 h-2 rounded-full bg-yellow-400"
//                     animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
//                     transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
//                   />
//                   {feature}
//                 </motion.div>
//               ))}
//             </div>

//             <AnimatePresence>
//               {isExpanded && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="space-y-3 mb-6"
//                 >
//                   {features.slice(3).map((feature, i) => (
//                     <motion.div
//                       key={i + 3}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: i * 0.1 }}
//                       className="flex items-center gap-3 text-white/80 text-sm font-comic"
//                     >
//                       <Sparkles className="w-3 h-3 text-yellow-300" />
//                       {feature}
//                     </motion.div>
//                   ))}

//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
//                   >
//                     <h4 className="text-white font-fredoka text-lg mb-2">✨ Try it now:</h4>
//                     <p className="text-white/80 text-sm font-comic mb-3">{demoAction}</p>
//                     <ShimmerButton
//                       className="w-full"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowDemo(true);
//                         playSound('magic');
//                       }}
//                     >
//                       Launch Demo
//                     </ShimmerButton>
//                   </motion.div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <motion.div
//               className="flex items-center justify-between text-white/90 font-fredoka"
//               whileHover={{ x: 5 }}
//             >
//               <span className="text-lg mr-2">{isExpanded ? 'Show Less' : 'Explore Features'}</span>
//               <motion.div
//                 animate={{ rotate: isExpanded ? 180 : 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="p-2 rounded-full bg-white/10 backdrop-blur-sm"
//               >
//                 <ArrowRight className="w-5 h-5" />
//               </motion.div>
//             </div>
//           </div>

//           <BorderBeam size={120} duration={8} delay={Math.random() * 3} />

//           <motion.div
//             className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 rounded-3xl"
//             animate={{ opacity: isHovered ? 1 : 0 }}
//             transition={{ duration: 0.3 }}
//           />
//         </div>
//       </MagicCard>

//       <AnimatePresence>
//         {showDemo && (
//           <motion.div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowDemo(false)}
//           >
//             <motion.div
//               className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 max-w-md w-full border border-white/20 backdrop-blur-xl"
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="text-center">
//                 <motion.div
//                   className="text-6xl mb-4"
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//                 >
//                   ✨
//                 </motion.div>
//                 <h3 className="text-2xl font-bold text-white mb-4 font-fredoka">{title} Demo</h3>
//                 <p className="text-white/80 font-comic mb-6">{demoAction}</p>
//                 <div className="space-y-3">
//                   <ConfettiButton onClick={() => playSound('achievement')}>
//                     Amazing! Close Demo
//                   </ConfettiButton>
//                   <button
//                     onClick={() => setShowDemo(false)}
//                     className="w-full px-4 py-2 bg-white/10 rounded-xl text-white font-comic text-sm hover:bg-white/20 transition-all"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

// Enhanced Interactive Feature Showcase
function InteractiveFeatureShowcase() {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const { playSound } = useSound();

  // Walt's AI Maps Demo Component
  const WaltAIMapsDemo = () => {
    const [selectedPark, setSelectedPark] = useState('magic-kingdom');
    const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);
    const [mapView, setMapView] = useState('attractions');
    const [currentTime, setCurrentTime] = useState(new Date());

    const parks = {
      'magic-kingdom': {
        name: 'Magic Kingdom',
        icon: '🏰',
        attractions: [
          { id: 'space-mountain', name: 'Space Mountain', wait: 45, type: 'thrill', coords: { x: 60, y: 40 } },
          { id: 'haunted-mansion', name: 'Haunted Mansion', wait: 25, type: 'family', coords: { x: 20, y: 60 } },
          { id: 'pirates', name: 'Pirates of the Caribbean', wait: 30, type: 'family', coords: { x: 30, y: 70 } },
          { id: 'big-thunder', name: 'Big Thunder Mountain', wait: 35, type: 'thrill', coords: { x: 70, y: 65 } }
        ],
        dining: [
          { id: 'be-our-guest', name: "Be Our Guest", type: 'table', coords: { x: 40, y: 30 } },
          { id: 'dole-whip', name: 'Dole Whip Stand', type: 'quick', coords: { x: 80, y: 50 } }
        ]
      },
      'epcot': {
        name: 'EPCOT',
        icon: '🌍',
        attractions: [
          { id: 'spaceship-earth', name: 'Spaceship Earth', wait: 15, type: 'family', coords: { x: 50, y: 50 } },
          { id: 'test-track', name: 'Test Track', wait: 85, type: 'thrill', coords: { x: 30, y: 40 } },
          { id: 'frozen', name: 'Frozen Ever After', wait: 65, type: 'family', coords: { x: 70, y: 60 } }
        ],
        dining: [
          { id: 'space-220', name: 'Space 220', type: 'table', coords: { x: 40, y: 40 } },
          { id: 'les-halles', name: 'Les Halles Boulangerie', type: 'quick', coords: { x: 60, y: 70 } }
        ]
      }
    };

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const currentPark = parks[selectedPark as keyof typeof parks];
    const currentData = mapView === 'attractions' ? currentPark.attractions : currentPark.dining;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-white font-fredoka">Walt&apos;s AI Maps</h4>
          <div className="text-xs text-white/70 font-comic">
            Live: {currentTime.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(parks).map(([key, park]) => (
            <motion.button
              key={key}
              onClick={() => {
                setSelectedPark(key);
                setSelectedAttraction(null);
                playSound('click');
              }}
              className={cn(
                "p-2 rounded-lg text-xs font-comic transition-all",
                selectedPark === key
                  ? "bg-blue-500/30 border border-blue-400/50 text-white"
                  : "bg-white/10 border border-white/20 text-white/70 hover:bg-white/20"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {park.icon} {park.name}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          {['attractions', 'dining'].map((view) => (
            <motion.button
              key={view}
              onClick={() => {
                setMapView(view);
                setSelectedAttraction(null);
                playSound('pop');
              }}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-comic capitalize transition-all",
                mapView === view
                  ? "bg-yellow-500/30 border border-yellow-400/50 text-white"
                  : "bg-white/10 border border-white/20 text-white/70 hover:bg-white/20"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {view === 'attractions' ? '🎢' : '🍽️'} {view}
            </motion.button>
          ))}
        </div>

        <div className="relative bg-gradient-to-br from-green-800/30 to-blue-800/30 rounded-lg h-48 border border-white/20 overflow-hidden">
          <div className="absolute inset-2 bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-md">
            {currentData.map((item) => (
              <motion.div
                key={item.id}
                className={cn(
                  "absolute w-3 h-3 rounded-full cursor-pointer border-white/50",
                  mapView === 'attractions'
                    ? item.type === 'thrill'
                      ? "bg-red-500 shadow-red-500/50 border-2"
                      : "bg-blue-500 shadow-blue-500/50 border-2"
                    : item.type === 'table'
                      ? "bg-purple-500 shadow-purple-500/50 border-2"
                      : "bg-orange-500 shadow-orange-500/50 border-2"
                )}
                style={{
                  left: `${item.coords.x}%`,
                  top: `${item.coords.y}%`,
                  filter: 'drop-shadow(0 0 6px currentColor)'
                }}
                onClick={() => {
                  setSelectedAttraction(selectedAttraction === item.id ? null : item.id);
                  playSound('sparkle');
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: selectedAttraction === item.id ? [1, 1.5, 1] : 1,
                  boxShadow: selectedAttraction === item.id
                    ? ['0 0 0px currentColor', '0 0 15px currentColor', '0 0 0px currentColor']
                    : '0 0 0px currentColor'
                }}
                transition={{ duration: 0.5, repeat: selectedAttraction === item.id ? Infinity : 0 }}
              />
            ))}

            {selectedAttraction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-white/20"
              >
                {(() => {
                  const item = currentData.find(item => item.id === selectedAttraction);
                  return (
                    <div>
                      <h5 className="text-white font-fredoka text-sm mb-1">{item?.name}</h5>
                      {mapView === 'attractions' && 'wait' in item! && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cn(
                            "px-2 py-1 rounded-full font-comic",
                            (item as { wait: number }).wait < 30 ? "bg-green-500/30 text-green-300" :
                              (item as { wait: number }).wait < 60 ? "bg-yellow-500/30 text-yellow-300" :
                                "bg-red-500/30 text-red-300"
                          )}>
                            ⏱️ {(item as { wait: number }).wait} min wait
                          </span>
                          <span className="text-white/70">
                            {(item as { type: string }).type === 'thrill' ? '🎢' : '👨‍👩‍👧‍👦'} {(item as { type: string }).type}
                          </span>
                        </div>
                      )}
                      {mapView === 'dining' && (
                        <div className="text-xs text-white/70">
                          {(item as { type: string }).type === 'table' ? '🍽️ Table Service' : '🥤 Quick Service'}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </div>

          <div className="absolute top-2 right-2">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>

        <div className="text-xs text-white/60 font-comic text-center">
          Tap markers to see real-time info • AI-powered predictions
        </div>
      </div>
    );
  };

  // Quantum Queue Intelligence Demo
  const QuantumQueueDemo = () => {
    const [selectedAttraction, setSelectedAttraction] = useState('space-mountain');
    const [currentWait, setCurrentWait] = useState(45);
    const [predictions, setPredictions] = useState<Array<{
      time: string;
      wait: number;
      confidence: number;
      recommendation: string;
    }>>([]);

    const attractions = useMemo(() => ({
      'space-mountain': { name: 'Space Mountain', baseWait: 45, popularity: 0.9 },
      'big-thunder': { name: 'Big Thunder Mountain', baseWait: 35, popularity: 0.7 },
      'pirates': { name: 'Pirates of the Caribbean', baseWait: 30, popularity: 0.8 },
      'haunted-mansion': { name: 'Haunted Mansion', baseWait: 25, popularity: 0.75 }
    }), []);

    useEffect(() => {
      const generatePredictions = () => {
        const hours = [];
        const currentHour = new Date().getHours();
        const baseWait = attractions[selectedAttraction as keyof typeof attractions].baseWait;
        const popularity = attractions[selectedAttraction as keyof typeof attractions].popularity;

        for (let i = 0; i < 12; i++) {
          const hour = (currentHour + i) % 24;
          let multiplier = 1;

          // Morning rush
          if (hour >= 9 && hour <= 11) multiplier = 1.4;
          // Lunch time
          else if (hour >= 12 && hour <= 14) multiplier = 0.8;
          // Evening peak
          else if (hour >= 16 && hour <= 19) multiplier = 1.6;
          // Night
          else if (hour >= 20 || hour <= 8) multiplier = 0.6;

          // Add randomness and popularity factor
          const variance = (Math.random() - 0.5) * 0.3;
          const finalWait = Math.max(5, Math.round(baseWait * multiplier * popularity * (1 + variance)));

          hours.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            wait: finalWait,
            confidence: Math.round(85 + Math.random() * 10),
            recommendation: finalWait < 30 ? 'optimal' : finalWait < 60 ? 'good' : 'busy'
          });
        }
        setPredictions(hours);
      };

      generatePredictions();
      const interval = setInterval(generatePredictions, 30000);
      return () => clearInterval(interval);
    }, [selectedAttraction, attractions]);

    useEffect(() => {
      const updateCurrentWait = () => {
        const baseWait = attractions[selectedAttraction as keyof typeof attractions].baseWait;
        const variance = (Math.random() - 0.5) * 10;
        setCurrentWait(Math.max(5, Math.round(baseWait + variance)));
      };

      updateCurrentWait();
      const interval = setInterval(updateCurrentWait, 5000);
      return () => clearInterval(interval);
    }, [selectedAttraction, attractions]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-white font-fredoka">Quantum Queue Intelligence</h4>
          <motion.div
            className="flex items-center gap-1 text-xs text-green-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Live AI
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(attractions).map(([key, attraction]) => (
            <motion.button
              key={key}
              onClick={() => {
                setSelectedAttraction(key);
                playSound('click');
              }}
              className={cn(
                "p-2 rounded-lg text-xs font-comic transition-all text-left",
                selectedAttraction === key
                  ? "bg-purple-500/30 border border-purple-400/50 text-white"
                  : "bg-white/10 border border-white/20 text-white/70 hover:bg-white/20"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-bold">{attraction.name}</div>
              <div className="text-xs opacity-70">Popularity: {Math.round(attraction.popularity * 100)}%</div>
            </motion.button>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-3 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-fredoka text-white">Current Wait Time</h5>
            <motion.div
              key={currentWait}
              initial={{ scale: 1.2, color: '#FFD700' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold"
            >
              {currentWait} min
            </motion.div>
          </div>

          <div className="space-y-2">
            <h6 className="text-sm font-fredoka text-white/90">Next 12 Hours Forecast</h6>
            <div className="grid grid-cols-4 gap-1 text-xs">
              {predictions.slice(0, 8).map((pred, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-1.5 rounded-md text-center border",
                    pred.recommendation === 'optimal' ? "bg-green-500/20 border-green-400/30 text-green-300" :
                      pred.recommendation === 'good' ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-300" :
                        "bg-red-500/20 border-red-400/30 text-red-300"
                  )}
                >
                  <div className="font-comic">{pred.time}</div>
                  <div className="font-bold">{pred.wait}m</div>
                  <div className="text-xs opacity-70">{pred.confidence}%</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2 bg-white/10 rounded-md">
            <div className="text-xs font-comic text-white/80">
              <span className="text-yellow-300">⚡ AI Recommendation:</span>{' '}
              {predictions[0]?.recommendation === 'optimal'
                ? "Perfect time to ride! Minimal wait expected."
                : predictions[0]?.recommendation === 'good'
                  ? "Good time to visit. Moderate wait times."
                  : "Consider waiting or using Genie+ for this attraction."
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Personalized Magic Engine Demo
  const PersonalizedMagicDemo = () => {
    const [familyProfile, setFamilyProfile] = useState({
      adults: 2,
      children: 2,
      ages: [8, 12],
      interests: ['thrill-rides', 'character-meets'],
      budget: 'moderate',
      mobility: 'standard'
    });
    const [recommendations, setRecommendations] = useState<Array<{
      type: string;
      title: string;
      reason: string;
      match: number;
      time: string;
      icon: string;
    }>>([]);
    const [magicScore, setMagicScore] = useState(92);

    useEffect(() => {
      const generateRecommendations = () => {
        const baseRecommendations = [
          {
            type: 'attraction',
            title: 'Big Thunder Mountain',
            reason: 'Perfect thrill level for ages 8-12',
            match: 95,
            time: '10:30 AM',
            icon: '🎢'
          },
          {
            type: 'dining',
            title: 'Be Our Guest Restaurant',
            reason: 'Character theming appeals to your family',
            match: 88,
            time: '12:30 PM',
            icon: '🍽️'
          },
          {
            type: 'experience',
            title: 'Mickey Meet & Greet',
            reason: 'High priority for character-loving families',
            match: 93,
            time: '2:15 PM',
            icon: '🐭'
          },
          {
            type: 'show',
            title: 'Festival of Fantasy Parade',
            reason: 'Great for mixed-age families',
            match: 90,
            time: '3:00 PM',
            icon: '🎭'
          }
        ];

        // Adjust recommendations based on family profile
        const adjustedRecs = baseRecommendations.map(rec => {
          let adjustedMatch = rec.match;

          if (familyProfile.interests.includes('thrill-rides') && rec.type === 'attraction') {
            adjustedMatch += 5;
          }
          if (familyProfile.interests.includes('character-meets') && rec.type === 'experience') {
            adjustedMatch += 7;
          }

          return { ...rec, match: Math.min(99, adjustedMatch) };
        });

        setRecommendations(adjustedRecs);

        // Calculate magic score
        const avgMatch = adjustedRecs.reduce((sum, rec) => sum + rec.match, 0) / adjustedRecs.length;
        setMagicScore(Math.round(avgMatch));
      };

      generateRecommendations();
    }, [familyProfile]);

    const updateProfile = (field: string, value: number | number[] | string[]) => {
      setFamilyProfile(prev => ({ ...prev, [field]: value }));
      playSound('click');
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-white font-fredoka">Personalized Magic Engine</h4>
          <motion.div
            className="flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-400/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-xs font-comic text-white">Magic Score:</span>
            <motion.span
              key={magicScore}
              initial={{ scale: 1.2, color: '#FFD700' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              className="text-sm font-bold"
            >
              {magicScore}%
            </motion.span>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="space-y-2">
            <label className="text-white/80 font-comic">Family Size</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(num => (
                <motion.button
                  key={num}
                  onClick={() => updateProfile('adults', num)}
                  className={cn(
                    "w-8 h-8 rounded-md font-bold transition-all",
                    familyProfile.adults === num
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {num}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/80 font-comic">Kids Ages</label>
            <div className="flex gap-1">
              {['4-7', '8-12', '13+'].map(range => (
                <motion.button
                  key={range}
                  onClick={() => {
                    const ageGroup = range === '4-7' ? [5, 6] : range === '8-12' ? [8, 12] : [14, 16];
                    updateProfile('ages', ageGroup);
                  }}
                  className={cn(
                    "px-2 py-1 rounded-md font-comic transition-all text-xs",
                    JSON.stringify(familyProfile.ages) === JSON.stringify(range === '4-7' ? [5, 6] : range === '8-12' ? [8, 12] : [14, 16])
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {range}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white/80 font-comic text-xs">Interests</label>
          <div className="flex flex-wrap gap-1">
            {[
              { key: 'thrill-rides', label: '🎢 Thrill Rides' },
              { key: 'character-meets', label: '🐭 Characters' },
              { key: 'shows', label: '🎭 Shows' },
              { key: 'dining', label: '🍽️ Fine Dining' }
            ].map(interest => (
              <motion.button
                key={interest.key}
                onClick={() => {
                  const newInterests = familyProfile.interests.includes(interest.key)
                    ? familyProfile.interests.filter(i => i !== interest.key)
                    : [...familyProfile.interests, interest.key];
                  updateProfile('interests', newInterests);
                }}
                className={cn(
                  "px-2 py-1 rounded-md font-comic transition-all text-xs",
                  familyProfile.interests.includes(interest.key)
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {interest.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-lg p-3 border border-white/20">
          <h5 className="text-sm font-fredoka text-white mb-2">✨ Your Personalized Recommendations</h5>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/10 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rec.icon}</span>
                  <div>
                    <div className="text-xs font-fredoka text-white">{rec.title}</div>
                    <div className="text-xs text-white/70 font-comic">{rec.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    rec.match >= 90 ? "bg-green-500/30 text-green-300" :
                      rec.match >= 80 ? "bg-yellow-500/30 text-yellow-300" :
                        "bg-orange-500/30 text-orange-300"
                  )}>
                    {rec.match}%
                  </div>
                  <div className="text-xs text-white/60 font-comic">{rec.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Family Harmony Hub Demo
  const FamilyHarmonyDemo = () => {
    const [familyMembers] = useState([
      { id: 1, name: 'Dad', avatar: '👨', status: 'online', location: 'Space Mountain', battery: 85 },
      { id: 2, name: 'Mom', avatar: '👩', status: 'online', location: 'Haunted Mansion', battery: 92 },
      { id: 3, name: 'Emma', avatar: '👧', status: 'online', location: 'Space Mountain', battery: 67 },
      { id: 4, name: 'Jake', avatar: '👦', status: 'away', location: 'Big Thunder Mountain', battery: 43 }
    ]);

    const [messages, setMessages] = useState([
      { id: 1, sender: 'Mom', text: 'Meet at Space Mountain in 10 mins?', time: '2:15 PM', type: 'suggestion' },
      { id: 2, sender: 'Dad', text: '👍 Sounds good!', time: '2:16 PM', type: 'response' },
      { id: 3, sender: 'System', text: 'Emma and Jake added to group navigation', time: '2:17 PM', type: 'system' }
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('family');

    const sendMessage = () => {
      if (!newMessage.trim()) return;

      const newMsg = {
        id: messages.length + 1,
        sender: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'message' as const
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      playSound('pop');
    };

    const quickActions = [
      { icon: '📍', label: 'Share Location', action: () => playSound('click') },
      { icon: '🍽️', label: 'Find Food', action: () => playSound('click') },
      { icon: '🚻', label: 'Find Restroom', action: () => playSound('click') },
      { icon: '⏰', label: 'Set Meeting', action: () => playSound('click') }
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-white font-fredoka">Family Harmony Hub</h4>
          <div className="flex gap-1">
            {['family', 'chat'].map(tab => (
              <motion.button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  playSound('click');
                }}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-comic capitalize transition-all",
                  activeTab === tab
                    ? "bg-green-500/30 border border-green-400/50 text-white"
                    : "bg-white/10 border border-white/20 text-white/70 hover:bg-white/20"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab === 'family' ? '👨‍👩‍👧‍👦' : '💬'} {tab}
              </motion.button>
            ))}
          </div>
        </div>

        {activeTab === 'family' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {familyMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-900/30 to-green-900/30 rounded-lg p-2 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{member.avatar}</span>
                      <div>
                        <div className="text-sm font-fredoka text-white">{member.name}</div>
                        <div className={cn(
                          "text-xs font-comic",
                          member.status === 'online' ? "text-green-300" :
                            member.status === 'away' ? "text-yellow-300" : "text-red-300"
                        )}>
                          {member.status}
                        </div>
                      </div>
                    </div>
                    <motion.div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        member.status === 'online' ? "bg-green-400" :
                          member.status === 'away' ? "bg-yellow-400" : "bg-red-400"
                      )}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>

                  <div className="text-xs text-white/70 font-comic mb-1">
                    📍 {member.location}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/60">🔋</span>
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          member.battery > 50 ? "bg-green-400" :
                            member.battery > 20 ? "bg-yellow-400" : "bg-red-400"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${member.battery}%` }}
                        transition={{ delay: index * 0.2, duration: 1 }}
                      />
                    </div>
                    <span className="text-xs text-white/60 font-comic">{member.battery}%</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 border border-white/20">
              <h5 className="text-sm font-fredoka text-white mb-2">Quick Actions</h5>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={action.action}
                    className="p-2 bg-white/10 rounded-lg text-center hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-lg mb-1">{action.icon}</div>
                    <div className="text-xs font-comic text-white/80">{action.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg p-3 border border-white/20 h-32 overflow-y-auto">
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "p-2 rounded-lg text-xs",
                      msg.type === 'system' ? "bg-gray-600/30 text-gray-300 text-center" :
                        msg.sender === 'You' ? "bg-blue-500/30 text-blue-200 ml-4" :
                          "bg-white/10 text-white mr-4"
                    )}
                  >
                    {msg.type !== 'system' && (
                      <div className="font-fredoka text-white/90 mb-1">{msg.sender}</div>
                    )}
                    <div className="font-comic">{msg.text}</div>
                    <div className="text-xs text-white/60 mt-1">{msg.time}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-xs font-comic focus:outline-none focus:border-white/40"
              />
              <motion.button
                onClick={sendMessage}
                className="px-3 py-2 bg-blue-500 rounded-lg text-white text-xs font-fredoka hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Smart Budget Wizard Demo
  const SmartBudgetDemo = () => {
    const [budget] = useState({
      total: 3500,
      spent: 1247,
      categories: {
        tickets: { budgeted: 1200, spent: 1200, name: 'Park Tickets' },
        dining: { budgeted: 800, spent: 312, name: 'Dining' },
        lodging: { budgeted: 1000, spent: 0, name: 'Hotel' },
        souvenirs: { budgeted: 300, spent: 47, name: 'Souvenirs' },
        extras: { budgeted: 200, spent: 0, name: 'Extras' }
      }
    });

    const [suggestions] = useState([
      { text: 'Switch to quick service lunch to save $45', savings: 45, type: 'dining' },
      { text: 'Book character breakfast for magical experience', cost: 85, type: 'experience' },
      { text: 'Consider Disney Springs for souvenirs (20% savings)', savings: 60, type: 'shopping' }
    ]);

    const remaining = budget.total - budget.spent;
    const percentSpent = (budget.spent / budget.total) * 100;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-white font-fredoka">Smart Budget Wizard</h4>
          <div className="text-xs text-white/70 font-comic">
            Day 2 of 5
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-lg p-3 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-fredoka text-white">Budget Overview</h5>
            <div className="text-right">
              <div className="text-lg font-bold text-green-300">${remaining.toLocaleString()}</div>
              <div className="text-xs text-white/70 font-comic">remaining</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/80 font-comic">${budget.spent.toLocaleString()} spent</span>
              <span className="text-white/80 font-comic">${budget.total.toLocaleString()} total</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  percentSpent < 50 ? "bg-green-400" :
                    percentSpent < 80 ? "bg-yellow-400" : "bg-red-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentSpent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(budget.categories).map(([key, category], index) => {
              const categoryPercent = (category.spent / category.budgeted) * 100;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/90 font-comic">{category.name}</span>
                      <span className="text-white/70">${category.spent}/${category.budgeted}</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          categoryPercent < 70 ? "bg-green-400" :
                            categoryPercent < 100 ? "bg-yellow-400" : "bg-red-400"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, categoryPercent)}%` }}
                        transition={{ delay: index * 0.2, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-3 border border-white/20">
          <h5 className="text-sm font-fredoka text-white mb-2">💡 Smart Suggestions</h5>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/10 rounded-md"
              >
                <div className="flex-1">
                  <p className="text-xs font-comic text-white">{suggestion.text}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold",
                  'savings' in suggestion ? "bg-green-500/30 text-green-300" : "bg-blue-500/30 text-blue-300"
                )}>
                  {'savings' in suggestion ? `-$${suggestion.savings}` : `+$${suggestion.cost}`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Magical Moments Tracker Demo
  const MagicalMomentsDemo = () => {
    const [moments] = useState([
      {
        id: 1,
        title: 'First Castle Photo',
        time: '9:15 AM',
        location: 'Magic Kingdom Entrance',
        type: 'photo',
        participants: ['Dad', 'Mom', 'Emma', 'Jake'],
        mood: 'excited',
        icon: '📸'
      },
      {
        id: 2,
        title: 'Emma met Mickey Mouse',
        time: '11:30 AM',
        location: 'Town Square Theater',
        type: 'character',
        participants: ['Emma'],
        mood: 'magical',
        icon: '🐭'
      },
      {
        id: 3,
        title: 'Space Mountain Victory',
        time: '1:45 PM',
        location: 'Tomorrowland',
        type: 'achievement',
        participants: ['Jake'],
        mood: 'proud',
        icon: '🎢'
      }
    ]);

    const [stats] = useState({
      totalMoments: 23,
      photosToken: 47,
      charactersMet: 8,
      ridesCompleted: 12,
      magicalMoments: 5
    });

    const moodColors = {
      excited: 'from-yellow-500 to-orange-500',
      magical: 'from-purple-500 to-pink-500',
      proud: 'from-blue-500 to-green-500',
      happy: 'from-green-500 to-cyan-500'
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-white font-fredoka">Magical Moments Tracker</h4>
          <motion.div
            className="flex items-center gap-1 text-xs text-purple-300"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ {stats.totalMoments} moments
          </motion.div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Photos', value: stats.photosToken, icon: '📸' },
            { label: 'Characters', value: stats.charactersMet, icon: '🐭' },
            { label: 'Rides', value: stats.ridesCompleted, icon: '🎢' },
            { label: 'Magic', value: stats.magicalMoments, icon: '⭐' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-lg p-2 text-center border border-white/20"
            >
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/70 font-comic">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-lg p-3 border border-white/20 max-h-40 overflow-y-auto">
          <h5 className="text-sm font-fredoka text-white mb-2">Today&apos;s Moments</h5>
          <div className="space-y-2">
            {moments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-2 rounded-lg border border-white/20 bg-gradient-to-r",
                  moodColors[moment.mood as keyof typeof moodColors]
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{moment.icon}</span>
                    <div>
                      <div className="text-sm font-fredoka text-white">{moment.title}</div>
                      <div className="text-xs text-white/80 font-comic">{moment.location}</div>
                      <div className="text-xs text-white/70">
                        {moment.participants.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-white/80 font-comic">{moment.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          className="w-full p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-fredoka text-sm hover:scale-105 transition-transform"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => playSound('magic')}
        >
          ➕ Add New Moment
        </motion.button>
      </div>
    );
  };

  const showcaseFeatures = [
    {
      title: "Walt&apos;s Wisdom AI Maps",
      description: "Interactive real-time park maps with AI-powered predictions and live attraction data",
      preview: "🗺️",
      color: "from-blue-500 to-cyan-500",
      stats: "99.9% accuracy",
      component: <WaltAIMapsDemo />
    },
    {
      title: "Quantum Queue Intelligence",
      description: "Revolutionary AI wait time forecasting using quantum computing principles for perfect timing",
      preview: "⏱️",
      color: "from-green-500 to-emerald-500",
      stats: "Save 4.5+ hours daily",
      component: <QuantumQueueDemo />
    },
    {
      title: "Personalized Magic Engine",
      description: "Advanced ML that creates tailored magical experiences based on your family&apos;s unique preferences",
      preview: "🎯",
      color: "from-purple-500 to-pink-500",
      stats: "98% satisfaction",
      component: <PersonalizedMagicDemo />
    },
    {
      title: "Family Harmony Hub",
      description: "Sophisticated group coordination system ensuring everyone experiences their perfect Disney day",
      preview: "👥",
      color: "from-orange-500 to-red-500",
      stats: "Zero family conflicts",
      component: <FamilyHarmonyDemo />
    },
    {
      title: "Smart Budget Wizard",
      description: "Intelligent budget tracking with real-time suggestions and predictive spending analysis",
      preview: "💰",
      color: "from-yellow-500 to-orange-500",
      stats: "Save 15% on average",
      component: <SmartBudgetDemo />
    },
    {
      title: "Magical Moments Tracker",
      description: "Capture and organize your family&apos;s Disney memories with AI-powered moment recognition",
      preview: "✨",
      color: "from-pink-500 to-purple-500",
      stats: "Never forget magic",
      component: <MagicalMomentsDemo />
    }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setSelectedFeature((prev) => (prev + 1) % showcaseFeatures.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlay, showcaseFeatures.length]);

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl p-8 backdrop-blur-sm border border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Particles
          className="absolute inset-0"
          quantity={50}
          staticity={50}
          color="#FFD700"
          size={0.3}
          vx={0.02}
          vy={-0.02}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-3xl font-bold text-white font-fredoka mb-2">Interactive Feature Preview</h3>
            <p className="text-white/70 font-comic">Experience our revolutionary vacation planning technology</p>
          </motion.div>

          <motion.button
            onClick={() => {
              setIsAutoPlay(!isAutoPlay);
              playSound('click');
            }}
            className={cn(
              "px-4 py-2 rounded-full font-comic text-sm transition-all border",
              isAutoPlay
                ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                : "bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAutoPlay ? "⏸️ Pause Auto-Demo" : "▶️ Play Auto-Demo"}
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {showcaseFeatures.map((feature, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setSelectedFeature(i);
                setIsAutoPlay(false);
                playSound('pop');
              }}
              className={cn(
                "p-3 rounded-2xl border transition-all text-center relative overflow-hidden",
                selectedFeature === i
                  ? "bg-white/20 border-white/40 scale-105 shadow-lg"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:scale-102"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {selectedFeature === i && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              )}

              <motion.div
                className="text-2xl mb-2"
                animate={selectedFeature === i ? {
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ duration: 2, repeat: selectedFeature === i ? Infinity : 0 }}
              >
                {feature.preview}
              </motion.div>

              <div className="text-white text-xs font-fredoka font-bold leading-tight mb-1">{feature.title}</div>
              <div className="text-yellow-300 text-xs font-comic">{feature.stats}</div>

              {selectedFeature === i && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFeature}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", damping: 20 }}
            className={cn(
              "p-6 rounded-2xl bg-gradient-to-br relative overflow-hidden border border-white/20",
              showcaseFeatures[selectedFeature].color,
              "min-h-[400px]"
            )}
          >
            <Meteors number={15} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2 font-fredoka">
                    {showcaseFeatures[selectedFeature].title}
                  </h4>
                  <p className="text-white/90 font-comic text-sm leading-relaxed">
                    {showcaseFeatures[selectedFeature].description}
                  </p>
                </div>

                <motion.div
                  className="text-4xl"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {showcaseFeatures[selectedFeature].preview}
                </motion.div>
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                {showcaseFeatures[selectedFeature].component}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/40"></div>
                  <div className="w-3 h-3 rounded-full bg-white/60"></div>
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                </div>
                <div className="text-yellow-300 font-fredoka text-sm bg-white/20 px-3 py-1 rounded-full border border-white/30">
                  {showcaseFeatures[selectedFeature].stats}
                </div>
              </div>
            </div>

            <BorderBeam size={150} duration={12} />
          </motion.div>
        </AnimatePresence>

        {isAutoPlay && (
          <motion.div
            className="mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex gap-1">
              {showcaseFeatures.map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    selectedFeature === i ? "bg-white" : "bg-white/30"
                  )}
                  animate={selectedFeature === i ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5, repeat: selectedFeature === i ? Infinity : 0 }}
                />
              ))}
            </div>
            <span className="text-xs text-white/60 font-comic ml-2">Auto-advancing in 8s</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Comprehensive Disney Games Section
function DisneyGamesSection() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { playSound } = useSound();

  // Memory Card Game
  const MemoryCardGame = () => {
    const [cards, setCards] = useState<{ id: number, emoji: string, isFlipped: boolean, isMatched: boolean }[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const disneyEmojis = ['🏰', '🎠', '🎪', '🎭', '🎯', '🎨', '🎸', '🎺'];

    const initializeGame = () => {
      const gameCards = [...disneyEmojis, ...disneyEmojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
          id: index,
          emoji,
          isFlipped: false,
          isMatched: false
        }));
      setCards(gameCards);
      setFlippedCards([]);
      setScore(0);
      setMoves(0);
      setGameStarted(true);
      playSound('magic');
    };

    const handleCardClick = (cardId: number) => {
      if (flippedCards.length === 2) return;
      if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

      const newCards = [...cards];
      newCards[cardId].isFlipped = true;
      setCards(newCards);

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      if (newFlippedCards.length === 2) {
        setMoves(moves + 1);
        const [first, second] = newFlippedCards;

        if (cards[first].emoji === cards[second].emoji) {
          setTimeout(() => {
            const matchedCards = [...newCards];
            matchedCards[first].isMatched = true;
            matchedCards[second].isMatched = true;
            setCards(matchedCards);
            setScore(score + 100);
            setFlippedCards([]);
            playSound('achievement');

            if (matchedCards.every(card => card.isMatched)) {
              playSound('win');
            }
          }, 500);
        } else {
          setTimeout(() => {
            const resetCards = [...newCards];
            resetCards[first].isFlipped = false;
            resetCards[second].isFlipped = false;
            setCards(resetCards);
            setFlippedCards([]);
            playSound('lose');
          }, 1000);
        }
      } else {
        playSound('click');
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-fredoka">Walt&apos;s Memory Palace</h3>
          <div className="flex gap-4 text-xs">
            <span className="text-yellow-400 font-comic">{score} pts</span>
            <span className="text-blue-400 font-comic">{moves} moves</span>
          </div>
        </div>

        {!gameStarted ? (
          <div className="text-center py-2">
            <motion.button
              onClick={initializeGame}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-fredoka text-sm hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ Start Memory Game
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-4 gap-1.5 flex-shrink-0">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  className={cn(
                    "w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center text-sm transition-all duration-300",
                    card.isFlipped || card.isMatched
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                      : "bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700"
                  )}
                  onClick={() => handleCardClick(card.id)}
                  whileHover={{ scale: 1.1, rotateY: 15 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    scale: card.isMatched ? [1, 1.2, 1] : 1,
                    rotateY: card.isFlipped || card.isMatched ? [0, 180, 0] : 0
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
                </motion.div>
              ))}
            </div>

            {cards.every(card => card.isMatched) && gameStarted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex-1 text-center p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-2xl mb-1"
                >
                  🎉
                </motion.div>
                <h4 className="text-sm font-bold text-white font-fredoka">Victory!</h4>
                <p className="text-xs text-white/80 font-comic mb-2">Completed in {moves} moves!</p>
                <motion.button
                  onClick={initializeGame}
                  className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white font-fredoka text-xs hover:scale-105 transition-transform"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Disney Trivia Game
  const DisneyTriviaGame = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const triviaQuestions = [
      {
        question: "What year did Walt Disney World open?",
        options: ["1969", "1971", "1973", "1975"],
        correct: "1971"
      },
      {
        question: "Which Disney park has the most roller coasters?",
        options: ["Magic Kingdom", "EPCOT", "Hollywood Studios", "Animal Kingdom"],
        correct: "Magic Kingdom"
      },
      {
        question: "What is the fastest ride at Walt Disney World?",
        options: ["Space Mountain", "Expedition Everest", "Test Track", "Rock 'n' Roller Coaster"],
        correct: "Test Track"
      }
    ];

    const startGame = () => {
      setGameStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
      playSound('magic');
    };

    const handleAnswer = (answer: string) => {
      setSelectedAnswer(answer);
      const isCorrect = answer === triviaQuestions[currentQuestion].correct;

      if (isCorrect) {
        setScore(score + 100);
        playSound('achievement');
      } else {
        playSound('lose');
      }

      setTimeout(() => {
        if (currentQuestion < triviaQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
        } else {
          setShowResult(true);
          if (score >= 200) playSound('win');
        }
      }, 1500);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-fredoka">Disney Wisdom Challenge</h3>
          {gameStarted && !showResult && (
            <div className="flex gap-4 text-xs">
              <span className="text-yellow-400 font-comic">{score} pts</span>
              <span className="text-blue-400 font-comic">Q{currentQuestion + 1}/{triviaQuestions.length}</span>
            </div>
          )}
        </div>

        {!gameStarted ? (
          <div className="text-center py-2">
            <motion.button
              onClick={startGame}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-fredoka text-sm hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🧠 Start Challenge
            </motion.button>
          </div>
        ) : showResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30"
          >
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl mb-1"
            >
              {score >= 200 ? "🏆" : score >= 100 ? "⭐" : "🎯"}
            </motion.div>
            <h4 className="text-sm font-bold text-white font-fredoka mb-1">
              {score >= 200 ? "Disney Expert!" : score >= 100 ? "Disney Fan!" : "Keep Learning!"}
            </h4>
            <p className="text-xs text-white/80 font-comic mb-2">Score: {score}/{triviaQuestions.length * 100}</p>
            <motion.button
              onClick={startGame}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-fredoka text-xs hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </motion.div>
        ) : (
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="text-sm font-bold text-white mb-2 font-fredoka">
              {triviaQuestions[currentQuestion].question}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {triviaQuestions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={cn(
                    "p-2 rounded-lg font-comic transition-all text-xs",
                    selectedAnswer === null
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : selectedAnswer === option
                        ? option === triviaQuestions[currentQuestion].correct
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : option === triviaQuestions[currentQuestion].correct
                          ? "bg-green-500 text-white"
                          : "bg-white/10 text-white/50"
                  )}
                  whileHover={selectedAnswer === null ? { scale: 1.02, y: -2 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Walt's Wisdom Slot Machine
  const WisdomSlotMachine = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [slots, setSlots] = useState(['🏰', '🎪', '🎭']);
    const [score, setScore] = useState(1000);
    const [message, setMessage] = useState('');

    const symbols = ['🏰', '🎪', '🎭', '🎠', '🎯', '🎨', '⭐', '💎'];
    const wisdomQuotes = [
      "All our dreams can come true!",
      "It's kind of fun to do the impossible.",
      "If you can dream it, you can do it!",
      "Disneyland is a work of love."
    ];

    const spin = () => {
      if (isSpinning || score < 50) return;

      setIsSpinning(true);
      setScore(score - 50);
      playSound('coin');

      let spins = 0;
      const spinInterval = setInterval(() => {
        setSlots([
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ]);

        spins++;
        if (spins >= 15) {
          clearInterval(spinInterval);

          const finalSlots = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
          ];
          setSlots(finalSlots);

          const isJackpot = finalSlots.every(slot => slot === finalSlots[0]);
          const isPair = finalSlots[0] === finalSlots[1] ||
            finalSlots[1] === finalSlots[2] ||
            finalSlots[0] === finalSlots[2];

          if (isJackpot) {
            const winnings = 500;
            setScore(score + winnings - 50);
            setMessage(`🎉 JACKPOT! +${winnings} coins!`);
            playSound('win');
          } else if (isPair) {
            const winnings = 100;
            setScore(score + winnings - 50);
            setMessage(`✨ Pair! +${winnings} coins!`);
            playSound('achievement');
          } else {
            setMessage(wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)]);
            playSound('fairy');
          }

          setIsSpinning(false);
        }
      }, 80);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-fredoka">Walt&apos;s Wisdom Slots</h3>
          <div className="text-xs text-yellow-400 font-comic">💰 {score} coins</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-3 flex-shrink-0">
            <div className="bg-black rounded-md p-2 mb-2">
              <div className="flex justify-center gap-1 text-2xl">
                {slots.map((symbol, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/10 rounded-md p-1 min-w-[40px] flex items-center justify-center"
                    animate={isSpinning ? {
                      rotateX: 360,
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration: 0.1,
                      repeat: isSpinning ? Infinity : 0,
                      delay: index * 0.1
                    }}
                  >
                    {symbol}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={spin}
                disabled={isSpinning || score < 50}
                className={cn(
                  "px-4 py-1.5 rounded-lg font-fredoka transition-all text-xs",
                  score >= 50 && !isSpinning
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:scale-105"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                )}
                whileHover={score >= 50 && !isSpinning ? { scale: 1.05, y: -2 } : {}}
                whileTap={score >= 50 && !isSpinning ? { scale: 0.95 } : {}}
                animate={isSpinning ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
              >
                {isSpinning ? "Spinning..." : "🎰 Spin!"}
              </motion.button>
            </div>
          </div>

          <div className="flex-1 min-h-[60px] flex items-center">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 rounded-lg p-2 w-full"
              >
                <p className="text-white font-comic italic text-xs leading-relaxed">{message}</p>
              </motion.div>
            )}
          </div>
        </div>

        {score < 50 && (
          <div className="text-center">
            <motion.button
              onClick={() => {
                setScore(1000);
                setMessage('');
                playSound('magic');
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-fredoka text-xs hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💫 Reset Coins
            </motion.button>
          </div>
        )}
      </div>
    );
  };

  const games = [
    {
      id: 'memory',
      title: 'Memory Palace',
      description: 'Disney-themed card matching',
      icon: <Puzzle className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      component: <MemoryCardGame />
    },
    {
      id: 'trivia',
      title: 'Wisdom Challenge',
      description: 'Test your Disney knowledge',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      component: <DisneyTriviaGame />
    },
    {
      id: 'slots',
      title: 'Wisdom Slots',
      description: 'Spin for quotes & coins',
      icon: <Dice6 className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
      component: <WisdomSlotMachine />
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 px-4 relative scroll-reveal bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900"
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-3"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-lg shadow-lg">
              🏰
            </div>
            <motion.h2
              className="text-2xl md:text-3xl font-bold font-bungee-shade bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Disney Games Arcade
            </motion.h2>
          </motion.div>

          <motion.p
            className="text-sm text-gray-300 font-fredoka max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Experience magical games inspired by Walt Disney&apos;s imagination ✨
          </motion.p>
        </motion.div>

        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {games.map((game, index) => (
              <BlurFade key={game.id} delay={0.1 + index * 0.05}>
                <motion.div
                  className="group cursor-pointer"
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedGame(game.id);
                    playSound('magic');
                  }}
                >
                  <NeonGradientCard className="h-full">
                    <div className={cn(
                      "h-full p-4 rounded-2xl bg-gradient-to-br shadow-xl border border-white/10 backdrop-blur-xl relative overflow-hidden",
                      game.color
                    )}>
                      <div className="absolute inset-0 opacity-20">
                        <Particles
                          className="absolute inset-0"
                          quantity={15}
                          staticity={50}
                          color="#FFD700"
                          size={0.3}
                        />
                      </div>

                      <div className="relative z-10 text-center">
                        <motion.div
                          className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg mx-auto w-fit mb-3"
                          whileHover={{
                            rotate: 360,
                            scale: 1.1,
                            boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)"
                          }}
                          transition={{ duration: 0.6, type: "spring" }}
                        >
                          <div className="text-white">
                            {game.icon}
                          </div>
                        </motion.div>

                        <h3 className="text-lg font-bold text-white mb-2 font-fredoka">
                          {game.title}
                        </h3>

                        <p className="text-white/90 font-comic text-xs mb-3">
                          {game.description}
                        </p>

                        <motion.div
                          className="flex items-center justify-center text-white/90 font-fredoka text-xs"
                          whileHover={{ x: 3 }}
                        >
                          <span className="mr-1">Play Now</span>
                          <Sparkles className="w-3 h-3" />
                        </motion.div>
                      </div>

                      <BorderBeam size={100} duration={6} />
                    </div>
                  </NeonGradientCard>
                </motion.div>
              </BlurFade>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-4 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  onClick={() => {
                    setSelectedGame(null);
                    playSound('click');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-white font-comic hover:bg-white/20 transition-all text-xs"
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Back
                </motion.button>

                <motion.h3
                  className="text-lg font-bold text-white font-fredoka"
                  animate={{
                    textShadow: [
                      "0 0 5px rgba(255, 255, 255, 0.3)",
                      "0 0 10px rgba(255, 255, 255, 0.5)",
                      "0 0 5px rgba(255, 255, 255, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {games.find(g => g.id === selectedGame)?.title}
                </motion.h3>

                <div className="w-16"></div>
              </div>

              {games.find(g => g.id === selectedGame)?.component}
            </motion.div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const [showWaltCursor, setShowWaltCursor] = useState(false);
  const { isMuted, setIsMuted, playSound } = useSound();
  const [isLoaded, setIsLoaded] = useState(false);

  // Enhanced Easter egg: Disney konami code
  useEffect(() => {
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'w', 'a', 'l', 't'];
    let current = 0;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === sequence[current] || e.key === sequence[current].toLowerCase()) {
        current++;
        if (current === sequence.length) {
          setShowWaltCursor(true);
          playSound('achievement');
          setTimeout(() => setShowWaltCursor(false), 15000);
          current = 0;
        }
      } else {
        current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playSound]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Enhanced GSAP animations
  useGSAP(() => {
    if (!containerRef.current || !isLoaded) return;

    try {
      gsap.registerPlugin(ScrollTrigger);

      const entranceTl = gsap.timeline();

      const titleChars = containerRef.current.querySelectorAll('.hero-title-char');
      if (titleChars.length) {
        entranceTl.from(titleChars, {
          opacity: 0,
          y: 100,
          rotateX: -90,
          stagger: {
            each: 0.03,
            from: "random"
          },
          duration: 1,
          ease: "elastic.out(1, 0.5)"
        });
      }

      gsap.to(".float-element", {
        y: "random(-20, 20)",
        x: "random(-15, 15)",
        rotation: "random(-10, 10)",
        duration: "random(4, 7)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.2,
          from: "random"
        }
      });

      gsap.to(".sparkle-element", {
        scale: "random(1.2, 2)",
        opacity: "random(0.7, 1)",
        duration: "random(1.5, 3)",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.15,
          from: "random"
        }
      });

      gsap.to(".rainbow-text", {
        backgroundPosition: "300% center",
        duration: 4,
        repeat: -1,
        ease: "none"
      });

      ScrollTrigger.batch(".scroll-reveal", {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0,
            y: 120,
            rotateX: -40,
            stagger: 0.2,
            duration: 1.2,
            ease: "back.out(1.7)"
          });
        },
        once: true,
        start: "top 85%"
      });

    } catch (error) {
      console.warn('GSAP animation error:', error);
    }
  }, { scope: containerRef, dependencies: [isLoaded] });

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "min-h-screen",
        isLoaded ? "opacity-100" : "opacity-0",
        "transition-opacity duration-1000",
        kalam.variable, fredoka.variable, bubblegum.variable, pacifico.variable,
        grandstander.variable, comic.variable, bungee.variable, caveat.variable,
        lilitaOne.variable, luckiestGuy.variable, titanOne.variable, modak.variable,
        sigmarOne.variable, bungeeShade.variable, shrikhand.variable, bowlbyOne.variable,
        righteous.variable, baloo2.variable, chicle.variable, sniglet.variable,
        chewy.variable, patrickHand.variable, permanentMarker.variable, amaticSc.variable,
        gloriaHallelujah.variable, architectsDaughter.variable, kaushanScript.variable,
        dancingScript.variable, lobster.variable, abrilFatface.variable, bebasNeue.variable,
        rubikWetPaint.variable, rubikGlitch.variable, rubikMoonrocks.variable,
        rubikPuddles.variable, rubikSprayPaint.variable
      )}
    >
      {/* Enhanced Walt Cursor Easter Egg */}
      {showWaltCursor && <WaltCursor />}

      {/* Enhanced Sound Control */}
      <motion.button
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
        onClick={() => {
          setIsMuted(!isMuted);
          playSound('click');
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </motion.button>

      {/* Magical Hero Section */}
      <motion.section
        className="hero-section relative min-h-screen flex items-center overflow-hidden"
        style={{ opacity: heroOpacity }}
      >
        {/* Multi-layer animated background */}
        <div className="absolute inset-0 -z-10">
          {/* Base gradient with animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
            animate={{
              background: [
                "linear-gradient(45deg, #312e81, #581c87, #831843)",
                "linear-gradient(135deg, #1e1b4b, #6b21a8, #be123c)",
                "linear-gradient(225deg, #1e3a8a, #7c2d12, #991b1b)",
                "linear-gradient(315deg, #312e81, #581c87, #831843)"
              ]
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />

          {/* Particle overlay */}
          <div className="absolute inset-0">
            <Particles
              className="absolute inset-0"
              quantity={150}
              staticity={30}
              color="#FFD700"
              size={0.8}
              vx={0.05}
              vy={-0.05}
            />
          </div>
        </div>

        {/* Main content container */}
        <div className="container mx-auto px-4 relative z-10">
          {/* Disney-style Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-block mb-8"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-4xl shadow-2xl border border-white/20">
                ✨
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight">
              <span className="font-permanent bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                WaltWise
              </span>
              <br />
              <span className="font-fredoka text-5xl md:text-7xl lg:text-8xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Vacation Planning
              </span>
              <br />
              <span className="font-chewy text-4xl md:text-6xl lg:text-7xl text-yellow-300">
                EXPERIENCE
              </span>
            </h1>

            <motion.p
              className="text-2xl md:text-3xl text-white/90 font-caveat max-w-3xl mx-auto mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Where Walt Disney&apos;s Legacy Meets Cutting-Edge Technology to Create Perfect Family Vacations ✨
            </motion.p>
          </motion.div>

          {/* Additional Disney elements */}
          <div className="absolute -bottom-20 left-0 w-full h-20 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
        </div>
      </motion.section>

      {/* Interactive feature showcase - Moved outside hero section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto">
          <BlurFade delay={0.3}>
            <div className="mb-16">
              <InteractiveFeatureShowcase />
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Disney Games Arcade Section - Moved outside hero section */}
      <DisneyGamesSection />

      {/* Enhanced floating elements marquee */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h3 className="text-3xl font-bold text-white font-fredoka mb-4">
              Powered by Disney Magic Technology
            </h3>
          </motion.div>

          <Marquee pauseOnHover className="text-white/60 font-caveat text-xl">
            {[
              "🧠 Neural Magic Networks",
              "⚡ Quantum Dream Processing",
              "🎯 Predictive Modeling",
              "🔮 Future Forecasting",
              "🌟 Magic Algorithms",
              "🎪 Experience Optimization"
            ].map((item, i) => (
              <motion.span
                key={i}
                className="mx-8 flex items-center gap-3 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                {item}
              </motion.span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Call-to-action section */}
      <section className="py-20 px-4 bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
              <motion.div
                className="text-6xl mb-6"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🏰
              </motion.div>
              <h3 className="text-4xl font-bold text-white mb-6 font-bubblegum">
                Ready to Experience the Magic?
              </h3>
              <p className="text-xl text-white/80 mb-8 font-comic max-w-2xl mx-auto">
                Join over 250,000 families who have discovered the secret to perfect Disney vacation planning with WaltWise
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RainbowButton>
                  <Link href="/signup" className="text-lg px-8 py-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Start Free Trial
                  </Link>
                </RainbowButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        :root {
          --font-kalam: ${kalam.style.fontFamily};
          --font-fredoka: ${fredoka.style.fontFamily};
          --font-bubblegum: ${bubblegum.style.fontFamily};
          --font-pacifico: ${pacifico.style.fontFamily};
          --font-grandstander: ${grandstander.style.fontFamily};
          --font-comic: ${comic.style.fontFamily};
          --font-bungee: ${bungee.style.fontFamily};
          --font-caveat: ${caveat.style.fontFamily};
          --font-permanent: ${permanentMarker.style.fontFamily};
        }

        .font-kalam { font-family: var(--font-kalam); }
        .font-fredoka { font-family: var(--font-fredoka); }
        .font-bubblegum { font-family: var(--font-bubblegum); }
        .font-pacifico { font-family: var(--font-pacifico); }
        .font-grandstander { font-family: var(--font-grandstander); }
        .font-comic { font-family: var(--font-comic); }
        .font-bungee { font-family: var(--font-bungee); }
        .font-caveat { font-family: var(--font-caveat); }
        .font-permanent { font-family: var(--font-permanent); }

        .rainbow-text {
          background-size: 200% auto;
          background-image: linear-gradient(
            90deg,
            #ff0000 0%,
            #ff7f00 14.28%,
            #ffff00 28.56%,
            #00ff00 42.84%,
            #0000ff 57.12%,
            #4b0082 71.4%,
            #9400d3 85.68%,
            #ff0000 100%
          );
        }

        .text-glow {
          text-shadow:
            0 0 10px currentColor,
            0 0 20px currentColor,
            0 0 30px currentColor;
        }

        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }

        body {
          cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTAiIGZpbGw9IiNGRkQ3MDAiLz4KPGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjQiIGZpbGw9IiNGRkQ3MDAiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSI4IiByPSI0IiBmaWxsPSIjRkZENzAwIi8+Cjwvc3ZnPg=='), auto;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .float-element {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }

        .sparkle-element {
          animation: sparkle 2s ease-in-out infinite;
        }

        .disney-castle-bg {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff10' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: bottom;
          background-size: cover;
        }
      `}</style>
    </motion.div>
  );
}
