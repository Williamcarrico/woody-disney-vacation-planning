'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Users, Rocket, Target } from 'lucide-react'

const timelineEvents = [
    {
        icon: Lightbulb,
        title: "The Spark",
        description: "Observed the chaos of group Disney planning",
        color: "from-yellow-500 to-orange-500"
    },
    {
        icon: Users,
        title: "Understanding",
        description: "Recognized the need for unified collaboration",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: Target,
        title: "Vision",
        description: "Designed a comprehensive solution",
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: Rocket,
        title: "Innovation",
        description: "Built the platform that transforms planning",
        color: "from-violet-500 to-purple-500"
    }
]

export function StoryTimeline() {
    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50" />

            <div className="space-y-8">
                {timelineEvents.map((event, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative flex items-start gap-4"
                    >
                        {/* Timeline dot */}
                        <div className={`relative z-10 p-3 rounded-full bg-gradient-to-br ${event.color}/20 border-[2px] border-slate-700`}>
                            <event.icon className={`w-6 h-6 bg-gradient-to-r ${event.color} bg-clip-text text-transparent`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <h4 className="text-lg font-semibold text-white mb-2">{event.title}</h4>
                            <p className="text-slate-300">{event.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}