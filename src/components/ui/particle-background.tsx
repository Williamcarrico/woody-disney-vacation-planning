'use client';

import React from 'react';

interface ParticleBackgroundProps {
    particleCount?: number;
    particleColor?: string;
    particleSize?: number;
    speed?: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Simple CSS animation background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        </div>
    );
};

export default ParticleBackground;