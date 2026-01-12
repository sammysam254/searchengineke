import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query, searchType, page = 1) => {
    setLoading(true);
    setError(null);

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

  return (
    <div className="App">
      {/* Top Loading Bar */}
      <div id="top-loading-bar" className="top-loading-bar"></div>
      
      <div className="container">
        <header className="app-header">
          <h1>Google Search</h1>
          <p>Search the web with Google's powerful search engine</p>
        </header>
        
        <SearchBox onSearch={handleSearch} />
        
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Searching...</div>
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