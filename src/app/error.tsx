'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12">
            <div className="mx-auto max-w-md text-center">
                <h2 className="text-3xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    {error.message || 'An unexpected error occurred'}
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button onClick={reset} variant="default">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        Go to homepage
                    </Button>
                </div>
            </div>
        </div>
    );
}