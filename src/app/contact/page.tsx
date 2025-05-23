'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InteractiveMap } from '@/components/maps/interactive-map';
import { submitContactForm, ContactFormData } from '@/lib/firebase/contact';
import {
    MessageCircle,
    Send,
    MapPin,
    Phone,
    Mail,
    AlertCircle,
    CheckCircle2,
    Sparkles
} from 'lucide-react';

// Disney World location
const disneyWorldLocation = {
    lat: 28.3852,
    lng: -81.5639
};

export default function ContactPage() {
    // Form state
    const [formState, setFormState] = useState<ContactFormData>({
        name: '',
        email: '',
        message: '',
    });
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formError, setFormError] = useState<string | null>(null);

    // Refs for GSAP animations
    const pageRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const infoCardsRef = useRef<HTMLDivElement>(null);

    // Particle system refs
    const particleContainerRef = useRef<HTMLDivElement>(null);

    // Interactive background effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Framer Motion scroll animations
    const { scrollYProgress } = useScroll();
    const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

    // Mouse move handler for interactive elements
    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        mouseX.set(clientX);
        mouseY.set(clientY);

        // Update glow effect position for WebGL/gradient elements
        if (pageRef.current) {
            const rect = pageRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            gsap.to('.glow-point', {
                x: x,
                y: y,
                duration: 0.6,
                ease: 'power2.out',
            });
        }
    };

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        setFormError(null);

        try {
            const result = await submitContactForm(formState);

            if (result.success) {
                setFormStatus('success');
                setFormState({
                    name: '',
                    email: '',
                    message: ''
                });
                // Trigger success animation
                gsap.to(formRef.current, {
                    y: -10,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.to(formRef.current, {
                            y: 0,
                            opacity: 1,
                            delay: 0.3,
                            duration: 0.8,
                            ease: 'elastic.out(1, 0.5)'
                        });
                    }
                });
            } else {
                setFormStatus('error');
                setFormError(result.error || 'An error occurred while submitting the form');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormStatus('error');
            setFormError('Something went wrong. Please try again later.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // GSAP animations
    useGSAP(() => {
        if (pageRef.current) {
            // Stagger animation for elements entrance
            const timeline = gsap.timeline();

            timeline.from(titleRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });

            timeline.from(subtitleRef.current, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.6');

            timeline.from(formRef.current, {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.4');

            timeline.from(mapContainerRef.current, {
                x: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.6');

            timeline.from(infoCardsRef.current, {
                x: -30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.7');

            // Create parallax scrolling effect
            ScrollTrigger.create({
                trigger: pageRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                onUpdate: (self) => {
                    gsap.to('.parallax-bg', {
                        y: self.progress * 150,
                        ease: 'none',
                    });
                }
            });

            // Create a magical particle effect
            if (particleContainerRef.current) {
                // Generate particles
                const particleCount = 30;
                const container = particleContainerRef.current;

                // Clear any existing particles
                container.innerHTML = '';

                // Create new particles
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'absolute rounded-full bg-primary/30 pointer-events-none';

                    // Random size between 5px and 20px
                    const size = Math.random() * 15 + 5;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;

                    // Random initial position
                    particle.style.left = `${Math.random() * 100}%`;
                    particle.style.top = `${Math.random() * 100}%`;

                    container.appendChild(particle);

                    // Animate each particle
                    gsap.to(particle, {
                        x: `random(-100, 100)`,
                        y: `random(-100, 100)`,
                        opacity: `random(0.1, 0.7)`,
                        duration: `random(10, 20)`,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut'
                    });
                }
            }
        }
    }, []);

    return (
        <div
            ref={pageRef}
            className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
            onMouseMove={handleMouseMove}
        >
            {/* Magical particle system */}
            <div ref={particleContainerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />

            {/* Animated background glow */}
            <div className="glow-point absolute top-0 left-0 w-0 h-0 pointer-events-none">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[60px]" />
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full bg-primary/20 blur-[30px]" />
            </div>

            <div className="container mx-auto px-4 py-12">
                <motion.div
                    style={{ y: parallaxY, opacity, scale }}
                    className="flex flex-col items-center mb-16"
                >
                    <motion.h1
                        ref={titleRef}
                        className="text-4xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-primary to-blue-500"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        Get in Touch
                    </motion.h1>
                    <motion.p
                        ref={subtitleRef}
                        className="text-xl md:text-2xl text-center max-w-3xl text-muted-foreground"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        Let us help you plan your dream Disney vacation
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    >
                        <form ref={formRef} onSubmit={handleSubmit} className="bg-card/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <MessageCircle className="mr-3 text-primary" />
                                Send Us a Message
                            </h2>

                            {formStatus === 'success' && (
                                <motion.div
                                    className="mb-6 bg-green-500/20 border border-green-500/40 text-green-500 rounded-lg p-4 flex items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <CheckCircle2 className="mr-3 h-5 w-5" />
                                    <span>Your message has been sent successfully! We&apos;ll get back to you soon.</span>
                                </motion.div>
                            )}

                            {formStatus === 'error' && (
                                <motion.div
                                    className="mb-6 bg-red-500/20 border border-red-500/40 text-red-500 rounded-lg p-4 flex items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <AlertCircle className="mr-3 h-5 w-5" />
                                    <span>{formError || 'An error occurred. Please try again.'}</span>
                                </motion.div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formState.name}
                                        onChange={handleInputChange}
                                        placeholder="Your name"
                                        className="bg-background/50 border-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formState.email}
                                        onChange={handleInputChange}
                                        placeholder="your.email@example.com"
                                        className="bg-background/50 border-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formState.message}
                                        onChange={handleInputChange}
                                        placeholder="How can we help with your Disney vacation planning?"
                                        className="min-h-[120px] bg-background/50 border-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full group"
                                    disabled={formStatus === 'submitting'}
                                >
                                    {formStatus === 'submitting' ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            Send Message
                                            <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <motion.div
                            ref={infoCardsRef}
                            className="mt-8 space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                        >
                            <div className="bg-card/40 backdrop-blur-md rounded-xl p-4 flex items-center shadow-lg transform transition-transform hover:translate-x-2">
                                <div className="bg-primary/20 p-3 rounded-full mr-4">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Location</h3>
                                    <p className="text-muted-foreground">Walt Disney World Resort, Orlando, FL</p>
                                </div>
                            </div>

                            <div className="bg-card/40 backdrop-blur-md rounded-xl p-4 flex items-center shadow-lg transform transition-transform hover:translate-x-2">
                                <div className="bg-primary/20 p-3 rounded-full mr-4">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Phone</h3>
                                    <p className="text-muted-foreground">(407) 939-5277</p>
                                </div>
                            </div>

                            <div className="bg-card/40 backdrop-blur-md rounded-xl p-4 flex items-center shadow-lg transform transition-transform hover:translate-x-2">
                                <div className="bg-primary/20 p-3 rounded-full mr-4">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Email</h3>
                                    <p className="text-muted-foreground">contact@woodydisney.planning</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        ref={mapContainerRef}
                        className="h-[600px] relative overflow-hidden rounded-2xl shadow-2xl"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    >
                        {/* Replace GoogleMap with our new InteractiveMap component */}
                        <InteractiveMap
                            initialCenter={disneyWorldLocation}
                            initialZoom={15}
                            height="100%"
                            width="100%"
                            showSearch={true}
                        />

                        {/* Decorative elements */}
                        <div className="absolute top-4 left-4 z-10 bg-card/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg">
                            <h3 className="font-bold flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                Disney World, FL
                            </h3>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}