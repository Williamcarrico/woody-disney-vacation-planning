import { motion } from 'framer-motion'
import { Sparkles, Castle, Star } from 'lucide-react'

// Magical shimmer animation
const shimmer = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
        duration: 2,
        ease: 'linear',
        repeat: Infinity,
    }
}

// Sparkle animation for magical elements
const sparkleAnimation = {
    animate: {
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180, 360]
    },
    transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1
    }
}

export function EnhancedDashboardSkeleton() {
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-blue-900/90 to-pink-900/90" />
            
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-2 space-y-4">
                        {/* Greeting skeleton */}
                        <div className="flex items-center space-x-3">
                            <motion.div {...sparkleAnimation}>
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </motion.div>
                            <motion.div
                                className="h-12 w-80 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 rounded-lg"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                        </div>
                        
                        {/* Time & Date skeleton */}
                        <div className="flex items-center space-x-6">
                            <motion.div
                                className="h-6 w-32 bg-white/10 rounded"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                            <motion.div
                                className="h-6 w-48 bg-white/10 rounded"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                        </div>
                        
                        {/* Vacation info skeleton */}
                        <motion.div
                            className="bg-white/10 rounded-2xl p-6 border border-white/20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Castle className="w-6 h-6 text-purple-400" />
                                    <div className="space-y-2">
                                        <motion.div
                                            className="h-6 w-48 bg-white/10 rounded"
                                            {...shimmer}
                                            style={{
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                                backgroundSize: '200% 100%',
                                            }}
                                        />
                                        <motion.div
                                            className="h-4 w-32 bg-white/10 rounded"
                                            {...shimmer}
                                            style={{
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                                backgroundSize: '200% 100%',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <motion.div
                                        className="h-8 w-12 bg-yellow-400/20 rounded mb-1"
                                        {...shimmer}
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                            backgroundSize: '200% 100%',
                                        }}
                                    />
                                    <motion.div
                                        className="h-4 w-16 bg-white/10 rounded"
                                        {...shimmer}
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                            backgroundSize: '200% 100%',
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    
                    {/* Magical tip skeleton */}
                    <div className="lg:col-span-1">
                        <motion.div
                            className="bg-yellow-400/10 rounded-2xl p-6 border border-yellow-400/30"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="space-y-3">
                                <motion.div
                                    className="h-6 w-32 bg-yellow-400/20 rounded"
                                    {...shimmer}
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                        backgroundSize: '200% 100%',
                                    }}
                                />
                                <motion.div
                                    className="h-4 w-full bg-white/10 rounded"
                                    {...shimmer}
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                        backgroundSize: '200% 100%',
                                    }}
                                />
                                <motion.div
                                    className="h-4 w-3/4 bg-white/10 rounded"
                                    {...shimmer}
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                        backgroundSize: '200% 100%',
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function MagicalStatsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="text-center space-y-2">
                <motion.div
                    className="h-8 w-64 mx-auto bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 rounded"
                    {...shimmer}
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />
                <motion.div
                    className="h-4 w-96 mx-auto bg-white/10 rounded"
                    {...shimmer}
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />
            </div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <motion.div
                        key={index}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <motion.div
                                className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center"
                                {...sparkleAnimation}
                            >
                                <Star className="w-6 h-6 text-purple-400" />
                            </motion.div>
                        </div>
                        
                        <motion.div
                            className="h-8 w-20 bg-purple-500/20 rounded mb-2"
                            {...shimmer}
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                        />
                        
                        <motion.div
                            className="h-4 w-32 bg-white/10 rounded"
                            {...shimmer}
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export function DisneyActionsSkeleton() {
    return (
        <div className="space-y-4">
            <motion.div
                className="h-6 w-48 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded mx-auto"
                {...shimmer}
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    backgroundSize: '200% 100%',
                }}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <motion.div
                        key={index}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <motion.div
                            className="w-12 h-12 bg-blue-500/20 rounded-lg mx-auto mb-3 flex items-center justify-center"
                            {...sparkleAnimation}
                        >
                            <Castle className="w-6 h-6 text-blue-400" />
                        </motion.div>
                        
                        <motion.div
                            className="h-4 w-full bg-white/10 rounded mb-1"
                            {...shimmer}
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                        />
                        
                        <motion.div
                            className="h-3 w-3/4 bg-white/10 rounded mx-auto"
                            {...shimmer}
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export function ImmersiveWeatherSkeleton() {
    return (
        <motion.div
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex items-center justify-between mb-4">
                <motion.div
                    className="h-6 w-32 bg-blue-400/20 rounded"
                    {...shimmer}
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />
                <motion.div {...sparkleAnimation}>
                    <Star className="w-6 h-6 text-blue-400" />
                </motion.div>
            </div>
            
            <div className="text-center space-y-4">
                <motion.div
                    className="h-16 w-24 mx-auto bg-blue-400/20 rounded-xl"
                    {...shimmer}
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <motion.div
                            key={index}
                            className="space-y-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <motion.div
                                className="h-4 w-full bg-white/10 rounded"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                            <motion.div
                                className="h-3 w-3/4 bg-white/10 rounded mx-auto"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

export function DisneyEventsSkeleton() {
    return (
        <motion.div
            className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex items-center justify-between mb-4">
                <motion.div
                    className="h-6 w-36 bg-pink-400/20 rounded"
                    {...shimmer}
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />
                <motion.div {...sparkleAnimation}>
                    <Sparkles className="w-5 h-5 text-pink-400" />
                </motion.div>
            </div>
            
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <motion.div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <motion.div
                            className="w-8 h-8 bg-pink-400/20 rounded-lg flex items-center justify-center"
                            {...sparkleAnimation}
                        >
                            <Star className="w-4 h-4 text-pink-400" />
                        </motion.div>
                        
                        <div className="flex-1 space-y-2">
                            <motion.div
                                className="h-4 w-full bg-white/10 rounded"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                            <motion.div
                                className="h-3 w-2/3 bg-white/10 rounded"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

export function MagicalAchievementsSkeleton() {
    return (
        <motion.div
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex items-center justify-between mb-4">
                <motion.div
                    className="h-6 w-32 bg-yellow-400/20 rounded"
                    {...shimmer}
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />
                <motion.div {...sparkleAnimation}>
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
            </div>
            
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <motion.div
                        key={index}
                        className="p-3 bg-white/5 rounded-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <motion.div
                                className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center"
                                {...sparkleAnimation}
                            >
                                <Star className="w-4 h-4 text-yellow-400" />
                            </motion.div>
                            
                            <motion.div
                                className="h-4 flex-1 bg-white/10 rounded"
                                {...shimmer}
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                        </div>
                        
                        <motion.div
                            className="h-3 w-full bg-white/10 rounded mb-2"
                            {...shimmer}
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                        />
                        
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.random() * 100}%` }}
                                transition={{ duration: 2, delay: index * 0.2 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
} 