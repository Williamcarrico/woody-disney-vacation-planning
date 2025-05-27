'use client'

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ThreeErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        console.error('Three.js Error Boundary caught:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can log the error to an error reporting service
        console.error('Three.js Error Details:', error, errorInfo);

        // Check for specific error types
        if (error.message?.includes('Worker module') || error.message?.includes('init did not return')) {
            console.warn('Worker initialization error detected - this can be safely ignored in development');
        }

        if (error.message?.includes('Could not load')) {
            console.warn('Asset loading error detected - using fallback resources');
        }
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                this.props.fallback || (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-8">
                        <div className="text-center text-white">
                            <div className="text-6xl mb-4 animate-pulse">🏰</div>
                            <h3 className="text-xl font-fredoka mb-2">3D View Unavailable</h3>
                            <p className="text-sm opacity-80 font-comic">
                                The magical castle is taking a break!
                            </p>
                            <p className="text-xs opacity-60 mt-2">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

export default ThreeErrorBoundary;