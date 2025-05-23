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
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log Three.js specific errors
        if (error.message.includes('Could not load') ||
            error.message.includes('Texture') ||
            error.message.includes('CORS') ||
            error.message.includes('undefined')) {
            console.warn('Three.js texture/asset loading error:', error.message);
            console.info('This error has been caught and handled gracefully.');
        } else {
            console.error('Three.js Error Boundary caught an error:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback || (
                <div className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg">
                    <div className="text-center text-white">
                        <div className="text-2xl mb-2">✨</div>
                        <p className="text-sm opacity-80">3D scene temporarily unavailable</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ThreeErrorBoundary;