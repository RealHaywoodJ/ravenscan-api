
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const savedHistory = JSON.parse(localStorage.getItem('search-history') || '[]');
    setHistory(savedHistory);
  };

  const handleRerun = (query) => {
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  const handleDelete = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));
    toast.success('🗑️ Removed from history');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Search History</h2>
          
          {history.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No search history yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded border">
                  <div>
                    <h3 className="font-medium">{item.query}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRerun(item.query)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      aria-label={`Re-run search for ${item.query}`}
                    >
                      Re-run
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      aria-label={`Delete search for ${item.query}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <a href="/" className="text-blue-600 hover:underline">← Back to Search</a>
        </div>
      </div>
    </div>
  );
}
