'use client'

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Play, Volume2, VolumeX, Sparkles, Clock, MapPin, Users, Calendar, Star, Wand2, Gift } from "lucide-react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Particles } from '@/components/magicui/particles';
import { Marquee } from '@/components/magicui/marquee';
import { Kalam, Fredoka, Bubblegum_Sans, Pacifico, Grandstander, Comic_Neue, Bungee, Caveat } from 'next/font/google';
import { BorderBeam } from '@/components/magicui/border-beam';
import { MagicCard } from '@/components/magicui/magic-card';
import { Meteors } from '@/components/magicui/meteors';
import { ConfettiButton } from '@/components/magicui/confetti';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { TextReveal } from '@/components/magicui/text-reveal';
import { WordRotate } from '@/components/magicui/word-rotate';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { BlurFade } from '@/components/magicui/blur-fade';
import { cn } from "@/lib/utils";
import DisneyWorld3D from "@/components/three/DisneyWorld3D";

// Disney-inspired Google fonts
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

// Sound Effects Hook
const useSound = () => {
  const [isMuted, setIsMuted] = useState(true);

  const playSound = (soundType: 'sparkle' | 'click' | 'woosh' | 'success') => {
    if (isMuted) return;

    // Sound implementation would go here
    // For demo purposes, we'll use Web Audio API
    try {
      // Use proper type checking for browser compatibility
      const AudioContextClass = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
      }

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if Web Audio API is not available
      console.warn('Web Audio API not available:', error);
    }
  };

  return { isMuted, setIsMuted, playSound };
};

// Animated Counter Component
function CounterAnimation({
  value,
  duration = 2,
  suffix = "",
  easing = "easeOut"
}: {
  value: string | number,
  duration?: number,
  suffix?: string,
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut"
}) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const end = parseInt(value.toString());
    if (isNaN(end)) return;

    let startTime: number | null = null;
    const animationDuration = duration * 1000;

    const easingFunctions = {
      linear: (t: number) => t,
      easeIn: (t: number) => t * t,
      easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
      easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      const easedProgress = easingFunctions[easing](progress);
      const currentCount = Math.floor(easedProgress * end);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, easing, isInView]);

  return (
    <span ref={nodeRef} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Mickey Mouse Cursor
function MickeyCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] mix-blend-difference"
      animate={{ x: mousePos.x - 15, y: mousePos.y - 15 }}
      transition={{ type: "spring", damping: 20, stiffness: 400, mass: 0.1 }}
    >
      <div className="relative">
        <div className="absolute w-8 h-8 bg-white rounded-full"></div>
        <div className="absolute -top-3 -left-3 w-5 h-5 bg-white rounded-full"></div>
        <div className="absolute -top-3 -right-3 w-5 h-5 bg-white rounded-full"></div>
      </div>
    </motion.div>
  );
}

// Disney Character Floating Animation
function FloatingCharacter({
  character,
  delay = 0,
  duration = 20,
  path = "circle"
}: {
  character: string,
  delay?: number,
  duration?: number,
  path?: "circle" | "infinity" | "wave"
}) {
  const getPath = () => {
    switch (path) {
      case "infinity":
        return {
          x: [0, 100, 0, -100, 0],
          y: [0, -50, 0, 50, 0]
        };
      case "wave":
        return {
          x: [0, 100, 200, 300, 400],
          y: [0, -30, 0, 30, 0]
        };
      default: // circle
        return {
          x: [0, 50, 0, -50, 0],
          y: [0, -50, -70, -50, 0]
        };
    }
  };

  const pathData = getPath();

  return (
    <motion.div
      className="absolute text-4xl"
      animate={pathData}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {character}
    </motion.div>
  );
}

// Kids Section Character Card
function CharacterCard({
  name,
  emoji,
  description,
  color,
  onClick
}: {
  name: string,
  emoji: string,
  description: string,
  color: string,
  onClick: () => void
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-full h-64 cursor-pointer"
      onClick={() => {
        setIsFlipped(!isFlipped);
        onClick();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            className={`absolute inset-0 ${color} rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg`}
            initial={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{
                y: [0, -10, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {emoji}
            </motion.div>
            <h3 className="text-2xl font-bold text-white font-bubblegum">{name}</h3>
            <p className="text-white/80 text-sm mt-2 font-comic">Tap to meet me!</p>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className={`absolute inset-0 ${color} rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg`}
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white text-center font-comic text-lg">{description}</p>
            <motion.button
              className="mt-4 px-4 py-2 bg-white/20 rounded-full text-white font-fredoka"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Tap again! ✨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// FIXED: Interactive Game Component with proper logic
function MagicMemoryGame() {
  const [cards, setCards] = useState<Array<{ id: number, emoji: string, isFlipped: boolean, isMatched: boolean }>>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize game with properly shuffled cards
    const emojis = ['🏰', '👸', '🦄', '🎠', '🎪', '🎨'];
    const gameCards = [...emojis, ...emojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5); // Proper shuffle

    setCards(gameCards);
  }, []);

  const handleCardClick = (cardId: number) => {
    // Prevent clicks during processing or if game is complete
    if (isProcessing || isComplete) return;

    // Find the actual card
    const clickedCard = cards[cardId];
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

    // If two cards are already selected, ignore
    if (selectedCards.length >= 2) return;

    // Flip the card
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    const newSelectedCards = [...selectedCards, cardId];
    setSelectedCards(newSelectedCards);

    // If this is the second card
    if (newSelectedCards.length === 2) {
      setIsProcessing(true);
      setMoves(prev => prev + 1);

      const [firstCardId, secondCardId] = newSelectedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      setTimeout(() => {
        if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
          // Match found - mark as matched
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isMatched: true }
                : card
            )
          );

          // Check if game is complete
          const updatedCards = cards.map(card =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true }
              : card
          );

          if (updatedCards.every(card => card.isMatched)) {
            setIsComplete(true);
          }
        } else {
          // No match - flip cards back
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }

        setSelectedCards([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const resetGame = () => {
    const emojis = ['🏰', '👸', '🦄', '🎠', '🎪', '🎨'];
    const gameCards = [...emojis, ...emojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(gameCards);
    setSelectedCards([]);
    setMoves(0);
    setIsComplete(false);
    setIsProcessing(false);
  };

  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-3xl font-bold font-bungee text-white">
          Magic Memory Match! 🎮
        </h3>
        <motion.button
          onClick={resetGame}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-fredoka text-sm hover:from-pink-600 hover:to-purple-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          New Game
        </motion.button>
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-6">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={cn(
              "aspect-square rounded-xl cursor-pointer flex items-center justify-center text-3xl shadow-lg border-2 transition-all duration-300",
              card.isFlipped || card.isMatched
                ? 'bg-gradient-to-br from-yellow-400 to-pink-400 border-yellow-300'
                : 'bg-gradient-to-br from-blue-400 to-purple-400 border-blue-300 hover:from-blue-300 hover:to-purple-300',
              card.isMatched && 'ring-green-400/60',
              isProcessing && selectedCards.includes(card.id) && !card.isMatched && 'animate-pulse'
            )}
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
            animate={card.isMatched ? {
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="select-none">
              {card.isFlipped || card.isMatched ? card.emoji : '❓'}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-white">
        <p className="font-fredoka text-lg mb-2">Moves: {moves}</p>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-2xl font-bold font-bubblegum">🎉 Magical! You Won! 🎉</p>
            <p className="text-sm font-comic text-white/80">Completed in {moves} moves!</p>
            <ConfettiButton>
              Celebrate! 🎊
            </ConfettiButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// FIXED: Enhanced Planning Tools Feature Component with sophisticated design
function PlanningToolFeature({
  title,
  description,
  icon,
  stats,
  color,
  features,
  demoAction,
  pricing,
  category
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: string;
  color: string;
  features: string[];
  demoAction: string;
  pricing: string;
  category: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <motion.div
      className="relative h-full group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <MagicCard
        className="h-full relative overflow-hidden"
        gradientColor="#D946EF"
        gradientOpacity={0.1}
      >
        <div className={cn(
          "h-full p-8 rounded-3xl bg-gradient-to-br shadow-2xl border border-white/10 backdrop-blur-xl cursor-pointer relative overflow-hidden transition-all duration-500",
          color,
          isHovered && "border-white/30 shadow-3xl"
        )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 opacity-20">
            <Particles
              className="absolute inset-0"
              quantity={30}
              staticity={50}
              color="#FFD700"
              size={0.3}
              vx={0.02}
              vy={-0.02}
            />
          </div>

          {/* Category badge */}
          <motion.div
            className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-comic text-white/90 border border-white/20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {category}
          </motion.div>

          {/* Header section */}
          <div className="flex items-start justify-between mb-6 relative z-10">
            <motion.div
              className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg"
              whileHover={{ rotate: 360, scale: 1.15 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              {icon}
            </motion.div>
            <motion.div
              className="flex flex-col items-end gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-white/70 text-sm font-comic px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {stats}
              </div>
              <div className="text-yellow-300 text-xs font-fredoka px-2 py-1 rounded-full bg-yellow-400/20">
                {pricing}
              </div>
            </motion.div>
          </div>

          {/* Content section */}
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-4 font-fredoka leading-tight">
              <SparklesText className="text-white">
                {title}
              </SparklesText>
            </h3>

            <p className="text-white/90 mb-6 font-comic leading-relaxed text-lg">
              {description}
            </p>

            {/* Feature list - always visible for first 3 */}
            <div className="space-y-3 mb-6">
              {features.slice(0, 3).map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/80 text-sm font-comic"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-yellow-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                  {feature}
                </motion.div>
              ))}
            </div>

            {/* Expanded features */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 mb-6"
                >
                  {features.slice(3).map((feature, i) => (
                    <motion.div
                      key={i + 3}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-white/80 text-sm font-comic"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      {feature}
                    </motion.div>
                  ))}

                  {/* Demo section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <h4 className="text-white font-fredoka text-lg mb-2">✨ Try it now:</h4>
                    <p className="text-white/80 text-sm font-comic mb-3">{demoAction}</p>
                    <ShimmerButton
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDemo(true);
                      }}
                    >
                      Launch Demo
                    </ShimmerButton>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action button */}
            <motion.div
              className="flex items-center justify-between text-white/90 font-fredoka"
              whileHover={{ x: 5 }}
            >
              <span className="text-lg">{isExpanded ? 'Show Less' : 'Explore Features'}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>

          {/* Animated border */}
          <BorderBeam size={150} duration={12} delay={Math.random() * 3} />

          {/* Hover effect overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 rounded-3xl"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </MagicCard>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 max-w-md w-full border border-white/20 backdrop-blur-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ✨
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4 font-fredoka">{title} Demo</h3>
                <p className="text-white/80 font-comic mb-6">{demoAction}</p>
                <div className="space-y-3">
                  <ConfettiButton>
                    Amazing! Close Demo
                  </ConfettiButton>
                  <button
                    onClick={() => setShowDemo(false)}
                    className="w-full px-4 py-2 bg-white/10 rounded-xl text-white font-comic text-sm hover:bg-white/20 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Enhanced Interactive Feature Showcase
function InteractiveFeatureShowcase() {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const showcaseFeatures = [
    {
      title: "Real-Time Park Maps",
      description: "Interactive maps with live updates on attractions, dining, and character locations",
      preview: "🗺️",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Smart Queue Predictions",
      description: "AI-powered wait time forecasting based on historical data and real-time conditions",
      preview: "⏱️",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Personalized Recommendations",
      description: "Tailored suggestions based on your family's preferences, age groups, and interests",
      preview: "🎯",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Social Planning Hub",
      description: "Collaborate with friends and family members to plan the perfect group adventure",
      preview: "👥",
      color: "from-orange-500 to-red-500"
    }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setSelectedFeature((prev) => (prev + 1) % showcaseFeatures.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, showcaseFeatures.length]);

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-bold text-white font-fredoka">Interactive Preview</h3>
        <motion.button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={cn(
            "px-4 py-2 rounded-full font-comic text-sm transition-all",
            isAutoPlay
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAutoPlay ? "⏸️ Pause" : "▶️ Play"}
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {showcaseFeatures.map((feature, i) => (
          <motion.button
            key={i}
            onClick={() => {
              setSelectedFeature(i);
              setIsAutoPlay(false);
            }}
            className={cn(
              "p-4 rounded-2xl border transition-all text-center",
              selectedFeature === i
                ? "bg-white/20 border-white/40 scale-105"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            )}
            whileHover={{ scale: selectedFeature === i ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-3xl mb-2">{feature.preview}</div>
            <div className="text-white text-xs font-comic">{feature.title}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "p-6 rounded-2xl bg-gradient-to-br",
            showcaseFeatures[selectedFeature].color
          )}
        >
          <h4 className="text-2xl font-bold text-white mb-3 font-fredoka">
            {showcaseFeatures[selectedFeature].title}
          </h4>
          <p className="text-white/90 font-comic text-lg">
            {showcaseFeatures[selectedFeature].description}
          </p>
          <div className="mt-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
            <div className="w-3 h-3 rounded-full bg-white/60"></div>
            <div className="w-3 h-3 rounded-full bg-white/80"></div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// FIXED: Enhanced features with sophisticated content and design
const magicalFeatures = [
  {
    title: "AI-Powered Itinerary Wizard",
    description: "Revolutionary AI that learns your family's preferences and creates optimized daily plans that maximize magic while minimizing wait times.",
    icon: <Wand2 className="h-8 w-8 text-white" />,
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    stats: "97% satisfaction",
    category: "Essential",
    pricing: "Included",
    demoAction: "Watch as our AI creates a personalized 3-day itinerary in under 30 seconds!",
    features: [
      "Machine learning preference detection",
      "Dynamic crowd prediction algorithms",
      "Weather-adaptive plan adjustments",
      "Real-time itinerary optimization",
      "Multi-park hopping strategies",
      "Character dining coordination",
      "PhotoPass+ integration",
      "Surprise moment planning",
      "Family member preference balancing"
    ]
  },
  {
    title: "Quantum Wait Time Oracle",
    description: "Predictive analytics engine that forecasts wait times up to 6 hours in advance using quantum computing principles and crowd flow modeling.",
    icon: <Clock className="h-8 w-8 text-white" />,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    stats: "Save 3+ hours daily",
    category: "Time Saver",
    pricing: "Premium",
    demoAction: "Experience real-time wait predictions with 95% accuracy for every attraction!",
    features: [
      "Quantum prediction algorithms",
      "6-hour advance forecasting",
      "Crowd density heat maps",
      "Alternative route suggestions",
      "Lightning Lane optimization",
      "Weather impact modeling",
      "Special event adjustments",
      "Historical pattern analysis",
      "Real-time recalibration"
    ]
  },
  {
    title: "Character Location Network",
    description: "Advanced tracking system providing real-time character locations, meet & greet schedules, and exclusive character interactions throughout the parks.",
    icon: <MapPin className="h-8 w-8 text-white" />,
    gradient: "from-red-500 via-pink-500 to-rose-500",
    stats: "150+ characters tracked",
    category: "Character Magic",
    pricing: "Standard",
    demoAction: "See live character locations and get notified when your favorites are nearby!",
    features: [
      "Real-time character GPS tracking",
      "Meet & greet schedule alerts",
      "Character interaction history",
      "Rare character notifications",
      "Photo opportunity planning",
      "Autograph book management",
      "Character dining availability",
      "Special event character appearances",
      "Surprise character encounters"
    ]
  },
  {
    title: "Family Synchronization Hub",
    description: "Military-grade coordination system keeping families connected with location sharing, emergency protocols, and seamless communication across the parks.",
    icon: <Users className="h-8 w-8 text-white" />,
    gradient: "from-green-500 via-emerald-500 to-cyan-500",
    stats: "Zero lost family members",
    category: "Safety First",
    pricing: "Included",
    demoAction: "Test our family tracking system with live location sharing and instant messaging!",
    features: [
      "Real-time family GPS tracking",
      "Secure in-app messaging",
      "Emergency reunification protocols",
      "Split-up activity coordination",
      "Shared shopping lists",
      "Photo sharing hub",
      "Child safety alerts",
      "Meet-up point suggestions",
      "Battery level monitoring"
    ]
  },
  {
    title: "Culinary Discovery Engine",
    description: "Sophisticated dining intelligence system that finds perfect meals, handles complex dietary needs, and unlocks secret menu experiences.",
    icon: <Gift className="h-8 w-8 text-white" />,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    stats: "300+ dining options",
    category: "Foodie Paradise",
    pricing: "Standard",
    demoAction: "Discover hidden menu items and get instant reservations at sold-out restaurants!",
    features: [
      "Allergy-safe dining finder",
      "Secret menu item database",
      "Instant reservation notifications",
      "Dietary preference matching",
      "Mobile order optimization",
      "Character dining scheduler",
      "Food truck location tracking",
      "Wine & dine event planning",
      "Chef recommendation engine"
    ]
  },
  {
    title: "Magic Concierge Assistant",
    description: "Personal Disney expert powered by decades of insider knowledge, providing exclusive tips, hidden secrets, and magical surprise orchestration.",
    icon: <Star className="h-8 w-8 text-white" />,
    gradient: "from-purple-500 via-violet-500 to-purple-700",
    stats: "10,000+ insider secrets",
    category: "VIP Experience",
    pricing: "Premium+",
    demoAction: "Unlock exclusive Disney secrets and hidden experiences known only to Cast Members!",
    features: [
      "Cast Member insider knowledge",
      "Hidden Mickey treasure maps",
      "Secret experience unlocking",
      "VIP tour recommendations",
      "Behind-the-scenes access",
      "Surprise celebration planning",
      "Exclusive photo spot guides",
      "Disney history storytelling",
      "Magical moment orchestration"
    ]
  }
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const [showMickey, setShowMickey] = useState(false);
  const { isMuted, setIsMuted, playSound } = useSound();

  // Easter egg: Konami code
  useEffect(() => {
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let current = 0;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === sequence[current]) {
        current++;
        if (current === sequence.length) {
          setShowMickey(true);
          playSound('success');
          setTimeout(() => setShowMickey(false), 10000);
          current = 0;
        }
      } else {
        current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playSound]);

  // Enhanced GSAP animations
  useGSAP(() => {
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Create magical entrance timeline
    const entranceTl = gsap.timeline();

    // Page reveal with Disney magic
    entranceTl.to(containerRef.current, {
      opacity: 1,
      duration: 1.2,
      ease: "power3.out"
    });

    // Character-by-character title animation
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
      }, "-=0.5");
    }

    // Floating animation for decorative elements
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

    // Sparkle animations
    gsap.to(".sparkle-element", {
      scale: "1.5",
      opacity: "1",
      duration: 2,
      repeat: -1,
      yoyo: true,
      stagger: {
        each: 0.1,
        from: "random"
      }
    });

    // Rainbow text effect
    gsap.to(".rainbow-text", {
      backgroundPosition: "200% center",
      duration: 3,
      repeat: -1,
      ease: "none"
    });

    // Scroll-triggered animations
    ScrollTrigger.batch(".scroll-reveal", {
      onEnter: (elements) => {
        gsap.from(elements, {
          opacity: 0,
          y: 100,
          rotateX: -30,
          stagger: 0.15,
          duration: 1,
          ease: "back.out(1.7)"
        });
      },
      once: true,
      start: "top 85%"
    });

    // Parallax for hero elements
    gsap.to(".hero-bg-layer-1", {
      yPercent: -50,
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.to(".hero-bg-layer-2", {
      yPercent: -30,
      xPercent: 10,
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1.5
      }
    });

    gsap.to(".hero-bg-layer-3", {
      yPercent: -20,
      xPercent: -5,
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 0.5
      }
    });
  }, { scope: containerRef, dependencies: [] });

  const disneyCharacters = [
    { name: "Mickey Mouse", emoji: "🐭", description: "Hi pal! I'm here to make your day magical!", color: "bg-gradient-to-br from-red-500 to-black" },
    { name: "Princess Elsa", emoji: "❄️", description: "Let it go and enjoy your magical adventure!", color: "bg-gradient-to-br from-blue-400 to-blue-600" },
    { name: "Buzz Lightyear", emoji: "🚀", description: "To infinity and beyond! Ready for adventure?", color: "bg-gradient-to-br from-green-500 to-purple-600" },
    { name: "Winnie the Pooh", emoji: "🍯", description: "Oh bother! Let's find some hunny together!", color: "bg-gradient-to-br from-yellow-400 to-orange-500" }
  ];

  return (
    <motion.div
      ref={containerRef}
      className={`opacity-0 ${kalam.variable} ${fredoka.variable} ${bubblegum.variable} ${pacifico.variable} ${grandstander.variable} ${comic.variable} ${bungee.variable} ${caveat.variable}`}
    >
      {/* Mickey Mouse Cursor Easter Egg */}
      {showMickey && <MickeyCursor />}

      {/* Sound Control */}
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
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="absolute inset-0 bg-[url('/images/stars-pattern.svg')] opacity-20"></div>
        </div>

        {/* Animated background layers */}
        <div className="absolute inset-0">
          {/* Layer 1: Floating clouds */}
          <div className="hero-bg-layer-1 absolute inset-0">
            <div className="absolute top-10 left-10 w-64 h-32 bg-white/10 rounded-full blur-3xl float-element"></div>
            <div className="absolute top-32 right-20 w-96 h-48 bg-pink-500/10 rounded-full blur-3xl float-element animation-delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-40 bg-blue-500/10 rounded-full blur-3xl float-element animation-delay-2000"></div>
          </div>

          {/* Layer 2: Floating Disney characters */}
          <div className="hero-bg-layer-2 absolute inset-0">
            <FloatingCharacter character="✨" delay={0} path="infinity" />
            <FloatingCharacter character="🏰" delay={2} path="circle" />
            <FloatingCharacter character="🎠" delay={4} path="wave" />
            <FloatingCharacter character="🎪" delay={6} path="circle" />
          </div>

          {/* Layer 3: Sparkles and particles */}
          <div className="hero-bg-layer-3 absolute inset-0">
            <Particles
              className="absolute inset-0"
              quantity={120}
              staticity={30}
              color="#FFD700"
              size={0.4}
              vx={0.1}
              vy={-0.1}
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 pt-24 pb-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div className="space-y-8">
              {/* Animated title */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatedGradientText className="text-sm font-fredoka">
                    ✨ Welcome to the Magic ✨
                  </AnimatedGradientText>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <SparklesText
                    className="text-white font-bungee hero-title-char"
                  >
                    Plan Your
                  </SparklesText>
                  <br />
                  <span className="relative inline-block">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 font-bubblegum rainbow-text">
                      Disney Dream
                    </span>
                    <motion.span
                      className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-30 blur-lg"
                      animate={{
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  </span>
                  <br />
                  <WordRotate
                    words={["Adventure", "Vacation", "Experience", "Journey"]}
                    className="text-white font-grandstander"
                  />
                </h1>
              </div>

              {/* Subtitle with typing effect */}
              <div className="text-xl text-gray-200 font-fredoka">
                <TypingAnimation
                  text="Create magical memories with personalized itineraries, real-time updates, and pixie dust!"
                  duration={50}
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-6">
                <RainbowButton
                  onClick={() => playSound('sparkle')}
                >
                  <Link href="/planning" className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Start Planning Magic
                  </Link>
                </RainbowButton>

                <ShimmerButton
                  className="shadow-2xl"
                  onClick={() => playSound('click')}
                >
                  <Link href="/attractions" className="flex items-center gap-2">
                    Explore Attractions
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </ShimmerButton>
              </div>

              {/* Fun stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                {[
                  { label: "Happy Families", value: "50,000", icon: "👨‍👩‍👧‍👦" },
                  { label: "Magic Moments", value: "1M", icon: "✨" },
                  { label: "Dreams Made", value: "100K", icon: "🌟" }
                ].map((stat, i) => (
                  <BlurFade key={i} delay={0.5 + i * 0.1}>
                    <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold text-white font-fredoka">
                        <CounterAnimation value={stat.value} duration={2.5} suffix="+" />
                      </div>
                      <div className="text-sm text-white/80 font-comic">{stat.label}</div>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </motion.div>

            {/* Right: Interactive 3D Disney Castle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1, type: "spring" }}
              className="relative"
            >
              <div className="relative h-[700px] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10">
                <MagicCard
                  className="h-full w-full"
                  gradientColor="#D946EF"
                >
                  <DisneyWorld3D />
                </MagicCard>
                <BorderBeam size={200} duration={12} delay={3} />

                {/* 3D Feature Badge */}
                <motion.div
                  className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-fredoka shadow-lg"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  ✨ Interactive 3D Castle
                </motion.div>

                {/* Performance indicator */}
                <motion.div
                  className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/20 rounded px-2 py-1 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                >
                  WebGL Accelerated
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Kids Zone Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-pink-100 to-yellow-100">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/confetti-pattern.svg')] opacity-10"></div>
          <Meteors number={20} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-bubblegum">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                Kids Magic Zone
              </span>
              <span className="ml-4 text-4xl">🎈</span>
            </h2>
            <p className="text-xl text-gray-700 font-comic">
              Special features designed just for our littlest dreamers!
            </p>
          </motion.div>

          {/* Character Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {disneyCharacters.map((character, i) => (
              <BlurFade key={i} delay={0.2 + i * 0.1}>
                <CharacterCard
                  {...character}
                  onClick={() => playSound('sparkle')}
                />
              </BlurFade>
            ))}
          </div>

          {/* Interactive Games */}
          <div className="grid lg:grid-cols-2 gap-8">
            <BlurFade delay={0.5}>
              <MagicMemoryGame />
            </BlurFade>

            <BlurFade delay={0.6}>
              <div className="bg-gradient-to-br from-blue-600/20 to-green-600/20 rounded-3xl p-8">
                <h3 className="text-3xl font-bold text-center mb-6 font-bungee text-white">
                  Magic Countdown! ⏰
                </h3>
                <div className="text-center">
                  <p className="text-6xl font-bold text-white font-fredoka mb-4">
                    <CounterAnimation value="10" duration={10} easing="linear" />
                  </p>
                  <p className="text-xl text-white/80 font-comic">
                    Days until your magical adventure!
                  </p>
                  <motion.div
                    className="mt-6 text-8xl"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity
                    }}
                  >
                    🎉
                  </motion.div>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Multi-layer animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900"></div>
          <div className="absolute inset-0 bg-[url('/images/constellation-pattern.svg')] opacity-10"></div>
          <div className="absolute inset-0">
            <Particles
              className="absolute inset-0"
              quantity={150}
              staticity={40}
              color="#FFD700"
              size={0.5}
              vx={0.05}
              vy={-0.05}
            />
          </div>

          {/* Floating magical elements */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-20 w-4 h-4 rounded-full bg-yellow-400/60"
              animate={{
                y: [0, -30, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-40 right-32 w-3 h-3 rounded-full bg-pink-400/60"
              animate={{
                y: [0, -25, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute bottom-32 left-1/3 w-5 h-5 rounded-full bg-purple-400/60"
              animate={{
                y: [0, -35, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 2 }}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced header section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              className="inline-block mb-6"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center text-4xl">
                ✨
              </div>
            </motion.div>

            <h2 className="text-6xl md:text-8xl font-bold mb-8 text-white font-bungee">
              <TextReveal text="Magical Planning Tools" />
            </h2>

            <motion.p
              className="text-2xl text-gray-300 font-fredoka max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Harness the power of cutting-edge technology to create the most magical Disney experience imaginable
            </motion.p>

            {/* Feature category tags */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {["AI-Powered", "Real-Time", "Personalized", "Family-Safe", "Insider Access"].map((tag, i) => (
                <motion.span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-comic"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  transition={{ delay: i * 0.1 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Interactive feature showcase */}
          <BlurFade delay={0.3}>
            <div className="mb-16">
              <InteractiveFeatureShowcase />
            </div>
          </BlurFade>

          {/* Enhanced grid layout with sophisticated features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-8xl mx-auto">
            {magicalFeatures.map((feature, i) => (
              <BlurFade key={i} delay={0.4 + i * 0.1}>
                <PlanningToolFeature
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  stats={feature.stats}
                  color={feature.gradient}
                  features={feature.features}
                  demoAction={feature.demoAction}
                  pricing={feature.pricing}
                  category={feature.category}
                />
              </BlurFade>
            ))}
          </div>

          {/* Enhanced floating elements marquee */}
          <div className="mt-20">
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
                "🚀 Quantum Computing",
                "🧠 Machine Learning AI",
                "📡 Real-Time Analytics",
                "🎯 Predictive Modeling",
                "🔮 Future Forecasting",
                "⚡ Lightning Processing",
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

          {/* Call-to-action section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20"
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
                🎭
              </motion.div>
              <h3 className="text-4xl font-bold text-white mb-6 font-bubblegum">
                Ready to Experience the Magic?
              </h3>
              <p className="text-xl text-white/80 mb-8 font-comic max-w-2xl mx-auto">
                Join over 100,000 families who have already discovered the secret to perfect Disney planning
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RainbowButton>
                  <Link href="/signup" className="text-lg px-8 py-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Start Free Trial
                  </Link>
                </RainbowButton>
                <ShimmerButton className="shadow-2xl">
                  <Link href="/features" className="text-lg px-8 py-4 flex items-center gap-2">
                    See All Features
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </ShimmerButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx global>{`
        /* Font variables */
        :root {
          --font-kalam: ${kalam.style.fontFamily};
          --font-fredoka: ${fredoka.style.fontFamily};
          --font-bubblegum: ${bubblegum.style.fontFamily};
          --font-pacifico: ${pacifico.style.fontFamily};
          --font-grandstander: ${grandstander.style.fontFamily};
          --font-comic: ${comic.style.fontFamily};
          --font-bungee: ${bungee.style.fontFamily};
          --font-caveat: ${caveat.style.fontFamily};
        }

        /* Font classes */
        .font-kalam { font-family: var(--font-kalam); }
        .font-fredoka { font-family: var(--font-fredoka); }
        .font-bubblegum { font-family: var(--font-bubblegum); }
        .font-pacifico { font-family: var(--font-pacifico); }
        .font-grandstander { font-family: var(--font-grandstander); }
        .font-comic { font-family: var(--font-comic); }
        .font-bungee { font-family: var(--font-bungee); }
        .font-caveat { font-family: var(--font-caveat); }

        /* Rainbow text animation */
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

        /* Text glow effect */
        .text-glow {
          text-shadow:
            0 0 10px currentColor,
            0 0 20px currentColor,
            0 0 30px currentColor;
        }

        /* Animation delays */
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }

        /* Custom cursor */
        body {
          cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTAiIGZpbGw9IiNGRkQ3MDAiLz4KPGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjQiIGZpbGw9IiNGRkQ3MDAiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSI4IiByPSI0IiBmaWxsPSIjRkZENzAwIi8+Cjwvc3ZnPg=='), auto;
        }

        /* Floating animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .float-element {
          animation: float 6s ease-in-out infinite;
        }

        /* Sparkle animation */
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }

        .sparkle-element {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}
