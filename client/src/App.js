import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (query, searchType, page = 1) => {
    setLoading(true);
    setError(null);
    setActiveTab(searchType);

    try {
      // Try the main search first, then fallback to simple search
      let apiUrl;
      if (process.env.NODE_ENV === 'production') {
        apiUrl = `/.netlify/functions/search-${searchType}?q=${encodeURIComponent(query)}&page=${page}`;
      } else {
        apiUrl = `/api/search/${searchType}?q=${encodeURIComponent(query)}&page=${page}`;
      }
      
      console.log('Calling API:', apiUrl);
      let response = await fetch(apiUrl);
      let data = await response.json();
      
      // If main search fails, try simple search (only for page 1)
      if ((!response.ok || data.error) && page === 1) {
        console.log('Main search failed, trying simple search...');
        const simpleUrl = process.env.NODE_ENV === 'production' 
          ? `/.netlify/functions/search-simple?q=${encodeURIComponent(query)}`
          : `/.netlify/functions/search-simple?q=${encodeURIComponent(query)}`;
        
        response = await fetch(simpleUrl);
        data = await response.json();
      }
      
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
      <div className="container">
        <header className="app-header">
          <h1>Social Search Engine</h1>
          <p>Search the web and social media platforms</p>
        </header>
        
        <SearchBox onSearch={handleSearch} />
        
        {loading && <div className="loading">Searching...</div>}
        {error && <div className="error">Error: {error}</div>}
        {results && (
          <SearchResults 
            results={results} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSearch={handleSearch}
          />
        )}
      </div>
    </div>
  );
}

export default App;