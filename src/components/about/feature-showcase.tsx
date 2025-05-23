'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Map, MessageCircle, Users } from 'lucide-react'

const features = [
    {
        id: 'wait-times',
        title: 'Live Wait Times',
        description: 'Access real-time ride wait times and optimize your day with predictive analytics.',
        icon: Map,
        color: 'from-violet-500 to-purple-500',
        stats: { accuracy: '99%', updates: 'Every 30s' }
    },
    {
        id: 'dining',
        title: 'Smart Dining',
        description: 'AI-powered dining recommendations based on your group preferences and availability.',
        icon: MessageCircle,
        color: 'from-fuchsia-500 to-pink-500',
        stats: { reservations: '10K+', satisfaction: '98%' }
    },
    {
        id: 'group',
        title: 'Group Coordination',
        description: 'Real-time location sharing and seamless communication for your entire group.',
        icon: Users,
        color: 'from-cyan-500 to-blue-500',
        stats: { groups: '5K+', efficiency: '+40%' }
    }
]

export function FeatureShowcase() {
    const [activeFeature, setActiveFeature] = useState(features[0])

    return (
        <div className="w-full max-w-md mx-auto">
            <Tabs
                value={activeFeature.id}
                onValueChange={(value) => {
                    const feature = features.find(f => f.id === value)
                    if (feature) setActiveFeature(feature)
                }}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                    {features.map((feature) => (
                        <TabsTrigger
                            key={feature.id}
                            value={feature.id}
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-fuchsia-500/20"
                        >
                            <feature.icon className="w-4 h-4" />
                        </TabsTrigger>
                    ))}
                </TabsList>

                <AnimatePresence mode="wait">
                    {features.map((feature) => (
                        <TabsContent key={feature.id} value={feature.id} className="mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <FeatureCard feature={feature} />
                            </motion.div>
                        </TabsContent>
                    ))}
                </AnimatePresence>
            </Tabs>
        </div>
    )
}

function FeatureCard({ feature }: { feature: typeof features[0] }) {
    return (
        <motion.div
            className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color}/20`}>
                    <feature.icon className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                </div>

                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>

                <div className="flex gap-2 mt-4">
                    {Object.entries(feature.stats).map(([key, value]) => (
                        <Badge
                            key={key}
                            variant="outline"
                            className="text-xs border-slate-600 bg-slate-800/50"
                        >
                            {key}: {value}
                        </Badge>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}