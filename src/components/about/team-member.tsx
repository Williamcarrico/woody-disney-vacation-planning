'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface TeamMemberProps {
    name: string
    role: string
    image: string
    bio: string
}

export function TeamMember({ name, role, image, bio }: TeamMemberProps) {
    const initials = name.split(' ').map(n => n[0]).join('')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-4"
        >
            <motion.div
                whileHover={{ scale: 1.1, rotateY: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
            >
                <Avatar
                    className="w-32 h-32 shadow-2xl shadow-violet-500/25"
                    style={{ border: '4px solid rgb(139 92 246 / 0.5)' }}
                >
                    <AvatarImage src={image} alt={name} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {/* Animated glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 blur-xl opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>

            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{name}</h3>
                <Badge
                    variant="outline"
                    className="border-violet-400/50 bg-violet-500/10 text-violet-300 px-3 py-1"
                >
                    {role}
                </Badge>
                <p className="text-slate-300 text-sm max-w-xs">{bio}</p>
            </div>
        </motion.div>
    )
}