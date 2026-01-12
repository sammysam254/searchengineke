import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (query, searchType) => {
    setLoading(true);
    setError(null);
    setActiveTab(searchType);

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? `/.netlify/functions/search-${searchType}?q=${encodeURIComponent(query)}`
        : `/api/search/${searchType}?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      setResults(data);
    } catch (err) {
      setError(err.message);
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
          />
        )}
      </div>
    </div>
  );
}

export default App;