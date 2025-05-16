'use client'

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Wand2, Map, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    gsap.to(containerRef.current, {
      opacity: 1,
      duration: 1,
      delay: 0.2
    });

    gsap.from(".hero-title-span", {
      duration: 0.8,
      y: 70,
      opacity: 0,
      stagger: 0.25,
      delay: 0.5,
      ease: "power3.out"
    });

    gsap.from(".hero-paragraph", {
      duration: 0.8,
      y: 50,
      opacity: 0,
      delay: 1.0,
      ease: "power3.out"
    });

    gsap.from(".hero-buttons-container", {
      duration: 0.8,
      y: 30,
      opacity: 0,
      delay: 1.4,
      ease: "power3.out"
    });

    const heroSection = containerRef.current.querySelector('.hero-section-background') as HTMLElement;
    if (heroSection) {
      const castleImage = heroSection.querySelector('.hero-castle-image') as HTMLElement;
      if (castleImage) {
        const parallaxTweenX = gsap.quickTo(castleImage, "x", { duration: 0.8, ease: "power3.out" });
        const parallaxTweenY = gsap.quickTo(castleImage, "y", { duration: 0.8, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { offsetWidth, offsetHeight } = heroSection;
          const xPercent = (clientX / offsetWidth - 0.5) * 2;
          const yPercent = (clientY / offsetHeight - 0.5) * 2;

          parallaxTweenX(xPercent * -15);
          parallaxTweenY(yPercent * -8);
        };
        heroSection.addEventListener('mousemove', handleMouseMove as EventListener);

        return () => {
          heroSection.removeEventListener('mousemove', handleMouseMove as EventListener);
        };
      }
    }
  }, { scope: containerRef, dependencies: [] });

  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-blue-500" />,
      title: "Personalized Itineraries",
      description: "Create custom daily plans optimized for minimal wait times and maximum fun.",
      href: "/planning",
      color: "from-blue-600 to-purple-600",
    },
    {
      icon: <Wand2 className="h-10 w-10 text-pink-500" />,
      title: "Attraction Finder",
      description: "Discover attractions perfect for your group with personalized recommendations.",
      href: "/attractions",
      color: "from-pink-600 to-red-600",
    },
    {
      icon: <Map className="h-10 w-10 text-green-500" />,
      title: "Interactive Park Maps",
      description: "Navigate parks effortlessly with real-time updates and directions.",
      href: "/map",
      color: "from-green-600 to-teal-600",
    },
    {
      icon: <Clock className="h-10 w-10 text-yellow-500" />,
      title: "Wait Time Tracker",
      description: "Get real-time wait times for all attractions and optimize your schedule.",
      href: "/attractions",
      color: "from-yellow-600 to-orange-600",
    },
    {
      icon: <Users className="h-10 w-10 text-purple-500" />,
      title: "Group Planning",
      description: "Collaborate with family and friends to plan the perfect vacation together.",
      href: "/group",
      color: "from-purple-600 to-indigo-600",
    }
  ];

  const parks = [
    {
      name: 'Magic Kingdom',
      href: '/parks/magic-kingdom',
      imagePath: '/images/Magic-Kingdom.jpg'
    },
    {
      name: 'EPCOT',
      href: '/parks/epcot',
      imagePath: '/images/epcot.jpg'
    },
    {
      name: 'Hollywood Studios',
      href: '/parks/hollywood-studios',
      imagePath: '/images/Disneys-Hollywood-Studios.jpg'
    },
    {
      name: 'Animal Kingdom',
      href: '/parks/animal-kingdom',
      imagePath: '/images/animal-kingdom.jpg'
    }
  ];

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <motion.div ref={containerRef} className="opacity-0">
      <section className="hero-section-background relative min-h-screen flex items-center overflow-hidden bg-magic-gradient bg-stars">
        <div className="firework"></div>
        <div className="firework"></div>
        <div className="firework"></div>
        <div className="castle-silhouette"></div>
        <div className="container mx-auto px-4 pt-20 pb-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-glow">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 pb-2 hero-title-span">
                  Plan Your Magical
                </span>
                <span className="block text-white hero-title-span">Adventure with Woody</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-xl hero-paragraph">
                Create unforgettable memories with our interactive vacation planner. Personalized itineraries, real-time updates, and expert recommendations.
              </p>
              <div className="flex flex-wrap gap-4 pt-4 hero-buttons-container">
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Link
                    href="/planning"
                    className="px-8 py-4 rounded-full font-medium text-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                  >
                    Start Planning
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Link
                    href="/attractions"
                    className="px-8 py-4 rounded-full font-medium text-lg bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    Explore Attractions <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
            <div className="relative magic-sparkle">
              <div className="relative w-full h-[400px]">
                <Image
                  src="/images/castle-silhouette.png"
                  alt="Castle Silhouette"
                  fill
                  className="object-contain animate-glow hero-castle-image"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <motion.section
        className="py-24 bg-black"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-pink-500 to-purple-500">
              Magical Tools for Perfect Planning
            </h2>
            <p className="text-gray-300 text-lg">
              Our suite of planning tools helps you create the most magical vacation experience possible.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all hover:shadow-xl hover:shadow-purple-500/5 group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`rounded-full p-4 bg-gradient-to-br ${feature.color} w-fit mb-6`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-glow transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-6">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="flex items-center text-white font-medium group-hover:text-purple-400 transition-colors gap-2"
                >
                  Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-24 bg-gradient-to-b from-black to-indigo-950/50"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">Parks</span>
            </h2>
            <p className="text-gray-300 text-lg">
              Discover the magic of theme parks with our comprehensive guides and real-time information.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {parks.map((park) => (
              <motion.div
                key={park.name}
                variants={itemVariants}
                whileHover={{ y: -8, boxShadow: "0px 15px 25px rgba(0,0,0,0.25)" }}
                className="relative group overflow-hidden rounded-xl h-full"
              >
                <Link
                  href={park.href}
                  passHref
                  className="block h-full w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                  <div className="relative h-[400px] w-full overflow-hidden">
                    <Image
                      src={park.imagePath}
                      alt={park.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-xl font-bold text-white mb-2">{park.name}</h3>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-24 bg-black"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={itemVariants}
            className="rounded-3xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-lg border border-white/10 p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
          >
            <div className="magic-sparkle"></div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white text-glow"
            >
              Ready to Create <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500">Magical Memories?</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Join thousands of families who have planned their perfect vacation with Woody&apos;s planning tools.
            </motion.p>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full font-medium text-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/20 transition-all inline-block"
              >
                Start Your Free Plan Today
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
