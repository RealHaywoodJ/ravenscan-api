'use client';

import { useEffect } from 'react';
import { Sentry } from './sentry';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to Sentry
    if (typeof window !== 'undefined' && Sentry) {
      Sentry.captureException(error);
    }
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}