import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import TrendingSection from './components/TrendingSection';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTrending, setShowTrending] = useState(true);

  const handleSearch = async (query, page = 1) => {
    setLoading(true);
    setError(null);
    setShowTrending(false); // Hide trending when searching

    try {
      // Detect platform and use appropriate API endpoint
      let apiUrl;
      const isVercel = window.location.hostname.includes('vercel.app') || 
                      window.location.hostname.includes('vercel.com');
      const isNetlify = window.location.hostname.includes('netlify.app') || 
                       window.location.hostname.includes('netlify.com');
      
      if (process.env.NODE_ENV === 'production') {
        if (isVercel) {
          // Vercel deployment
          apiUrl = `/api/search-web?q=${encodeURIComponent(query)}&page=${page}`;
        } else if (isNetlify) {
          // Netlify deployment - use simple test for now
          apiUrl = `/.netlify/functions/search-simple-test?q=${encodeURIComponent(query)}&page=${page}`;
        } else {
          // Default to Vercel API structure
          apiUrl = `/api/search-web?q=${encodeURIComponent(query)}&page=${page}`;
        }
      } else {
        // Local development
        apiUrl = `/api/search/web?q=${encodeURIComponent(query)}&page=${page}`;
      }
      
      console.log('Calling API:', apiUrl);
      let response = await fetch(apiUrl);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Try to parse JSON with error handling
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Search results:', data);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(`Search failed: ${err.message}`);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    setResults(null);
    setShowTrending(true);
    setError(null);
  };

  return (
    <div className="App">
      {/* Top Loading Bar */}
      <div id="top-loading-bar" className="top-loading-bar"></div>
      
      <div className="container">
        <header className="app-header">
          <div className="logo-container" onClick={handleLogoClick}>
            <div className="infinitum-logo-wrapper">
              <div className="logo-3d">
                <div className="logo-symbol">
                  <div className="infinity-part-1"></div>
                  <div className="infinity-part-2"></div>
                </div>
              </div>
              <h1 className="infinitum-text">INFINITUM</h1>
            </div>
          </div>
          <p className="tagline">Infinite Search. Infinite Possibilities.</p>
        </header>
        
        <SearchBox onSearch={handleSearch} />
        
        {showTrending && !results && !loading && (
          <TrendingSection onSearch={handleSearch} />
        )}
        
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Searching the infinite web...</div>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        {error && <div className="error">Error: {error}</div>}
        
        {results && !loading && (
          <SearchResults 
            results={results} 
            activeTab="web"
            onTabChange={() => {}}
            onSearch={handleSearch}
          />
        )}
      </div>
    </div>
  );
}

export default App;