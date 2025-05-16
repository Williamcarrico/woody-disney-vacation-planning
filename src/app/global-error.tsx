'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to your error reporting service
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                        <div className="text-center">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                Something went wrong!
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Sorry, an unexpected error has occurred.
                            </p>
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                                {error.message || 'Unknown error'}
                            </p>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={reset}
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="mt-4 w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}