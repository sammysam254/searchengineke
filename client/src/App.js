import React, { useState, useEffect } from 'react';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import TrendingSection from './components/TrendingSection';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTrending, setShowTrending] = useState(true);

  const handleSearch = async (query, searchType, page = 1) => {
    setLoading(true);
    setError(null);
    setShowTrending(false); // Hide trending when searching

    try {
      // Always use web search (Google API)
      let apiUrl;
      if (process.env.NODE_ENV === 'production') {
        apiUrl = `/.netlify/functions/search-web?q=${encodeURIComponent(query)}&page=${page}`;
      } else {
        apiUrl = `/api/search/web?q=${encodeURIComponent(query)}&page=${page}`;
      }
      
      console.log('Calling API:', apiUrl);
      let response = await fetch(apiUrl);
      let data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
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
            <h1 className="infinitum-logo">
              <span className="logo-i">I</span>
              <span className="logo-n">N</span>
              <span className="logo-f">F</span>
              <span className="logo-i2">I</span>
              <span className="logo-n2">N</span>
              <span className="logo-i3">I</span>
              <span className="logo-t">T</span>
              <span className="logo-u">U</span>
              <span className="logo-m">M</span>
            </h1>
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