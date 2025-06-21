
'use client';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [searchName, setSearchName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('ravenscan-api-key');
    if (savedApiKey) setApiKey(savedApiKey);
    
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const handleApiKeyChange = (value) => {
    setApiKey(value);
    localStorage.setItem('ravenscan-api-key', value);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchName.trim() || searchName.length < 3) {
      toast.error('Please enter at least 3 characters');
      return;
    }

    if (!apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://ravenscan-api.etmunson91.replit.app/check?name=${encodeURIComponent(searchName)}`, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
      
      // Save to history
      const historyItem = {
        query: searchName,
        date: new Date().toISOString(),
        results: data
      };
      
      const history = JSON.parse(localStorage.getItem('search-history') || '[]');
      history.unshift(historyItem);
      localStorage.setItem('search-history', JSON.stringify(history.slice(0, 50))); // Keep last 50
      
      toast.success('✅ Search completed and saved!');
    } catch (error) {
      console.error('Search error:', error);
      toast.error(`Search failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (rating) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, query: searchName }),
      });
      toast.success('Thanks for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RavenScan
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Brand Intelligence & Social Media Username Checker
          </p>
        </header>

        {/* API Key Input */}
        <div className="mb-6">
          <label htmlFor="api-key" className="block text-sm font-medium mb-2">
            API Key
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="Enter your RavenScan API key"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="API Key"
          />
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="search-name" className="block text-sm font-medium mb-2">
                Brand/Username to Check
              </label>
              <input
                id="search-name"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter brand name or username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Brand name to search"
                required
                minLength={3}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading || !searchName.trim() || !apiKey.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                aria-label="Search for brand availability"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Checking...
                  </>
                ) : (
                  'Check Availability'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Results for "{results.brand_name}"</h2>
              
              {/* Domains */}
              {results.domains && Object.keys(results.domains).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Domains</h3>
                  <div className="grid gap-2">
                    {Object.entries(results.domains).map(([domain, status]) => (
                      <div key={domain} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border">
                        <span className="font-mono">{domain}</span>
                        <span className={`font-medium ${status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                          {status === 'available' ? '✅ Available' : '❌ Taken'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Platforms */}
              {results.socials && Object.keys(results.socials).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Social Media Platforms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(results.socials).map(([platform, status]) => (
                      <div key={platform} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border">
                        <span className="capitalize font-medium">{platform}</span>
                        <span className={`font-medium ${
                          status === 'available' ? 'text-green-600' : 
                          status === 'taken' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {status === 'available' ? '✅' : status === 'taken' ? '❌' : '⚠️'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Info */}
              {results.seo && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">SEO Analysis</h3>
                  <div className="bg-white dark:bg-gray-700 rounded border p-4">
                    <p className="mb-2">Search Results: <span className="font-medium">{results.seo.hits?.toLocaleString() || 0}</span></p>
                    {results.seo.top_results && results.seo.top_results.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Top Results:</p>
                        <ul className="space-y-1">
                          {results.seo.top_results.slice(0, 3).map((url, index) => (
                            <li key={index}>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {results.suggestions && results.suggestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Alternative Suggestions</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.suggestions.map((suggestion, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Widget */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">How helpful were these results?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback('positive')}
                  className="text-2xl hover:scale-110 transition-transform"
                  aria-label="Positive feedback"
                >
                  😃
                </button>
                <button
                  onClick={() => handleFeedback('neutral')}
                  className="text-2xl hover:scale-110 transition-transform"
                  aria-label="Neutral feedback"
                >
                  😐
                </button>
                <button
                  onClick={() => handleFeedback('negative')}
                  className="text-2xl hover:scale-110 transition-transform"
                  aria-label="Negative feedback"
                >
                  😢
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 text-center space-x-4">
          <a href="/login" className="text-blue-600 hover:underline">Login</a>
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
        </div>
      </div>
    </div>
  );
}
