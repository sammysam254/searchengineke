import React, { useState } from 'react';

const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), 1); // Always start with page 1
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleFeelingLucky = (e) => {
    e.preventDefault();
    const luckySearches = [
      'Amazing facts about space',
      'Latest technology trends',
      'Beautiful places to visit',
      'Interesting science discoveries',
      'Cool programming projects',
      'Inspiring success stories',
      'Creative art ideas',
      'Healthy lifestyle tips'
    ];
    const randomSearch = luckySearches[Math.floor(Math.random() * luckySearches.length)];
    onSearch(randomSearch, 1); // Always start with page 1
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search the infinite web..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <span className="infinity-icon">∞</span>
        </div>
        
        <div className="search-buttons">
          <button 
            type="submit"
            className="search-btn primary"
          >
            <span className="btn-icon">🚀</span>
            Infinitum Search
          </button>
          <button 
            type="button"
            className="search-btn secondary"
            onClick={handleFeelingLucky}
          >
            <span className="btn-icon">✨</span>
            I'm Feeling Infinite
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBox;