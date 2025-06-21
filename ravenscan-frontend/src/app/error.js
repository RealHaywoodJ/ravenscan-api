
'use client';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
    toast.error('Something went wrong. Please try again.');
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
