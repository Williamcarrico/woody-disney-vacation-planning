'use client'

import { motion } from 'framer-motion'
import { InteractiveCard } from './interactive-card'

const technologies = [
    {
        category: "Frontend",
        items: [
            { name: "Next.js 15", color: "from-gray-900 to-gray-700" },
            { name: "React 18", color: "from-blue-500 to-cyan-500" },
            { name: "TypeScript", color: "from-blue-600 to-blue-400" },
            { name: "Tailwind CSS", color: "from-cyan-500 to-teal-500" },
            { name: "Framer Motion", color: "from-pink-500 to-rose-500" }
        ]
    },
    {
        category: "Backend",
        items: [
            { name: "Node.js", color: "from-green-600 to-green-400" },
            { name: "Prisma", color: "from-indigo-600 to-purple-500" },
            { name: "Supabase", color: "from-emerald-600 to-teal-500" },
            { name: "GraphQL", color: "from-pink-600 to-purple-500" }
        ]
    },
    {
        category: "Infrastructure",
        items: [
            { name: "Vercel", color: "from-gray-900 to-gray-600" },
            { name: "PostgreSQL", color: "from-blue-700 to-blue-500" },
            { name: "Redis", color: "from-red-600 to-red-400" },
            { name: "Docker", color: "from-blue-600 to-cyan-500" }
        ]
    }
]

export function TechStack() {
    return (
        <InteractiveCard>
            <div className="p-8 lg:p-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {technologies.map((category, categoryIndex) => (
                        <motion.div
                            key={category.category}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white text-center mb-6">
                                {category.category}
                            </h3>

                            <div className="space-y-3">
                                {category.items.map((tech, techIndex) => (
                                    <motion.div
                                        key={tech.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.3,
                                            delay: categoryIndex * 0.1 + techIndex * 0.05
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        className={`
                                            p-4 rounded-xl text-center font-medium text-white
                                            bg-gradient-to-r ${tech.color}/20
                                            border border-slate-700/50 backdrop-blur-sm
                                            hover:border-slate-600/70 transition-all duration-300
                                            cursor-pointer
                                        `}
                                    >
                                        <span className={`bg-gradient-to-r ${tech.color} bg-clip-text text-transparent font-semibold`}>
                                            {tech.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </InteractiveCard>
    )
}