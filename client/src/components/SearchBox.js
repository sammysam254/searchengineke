import React, { useState } from 'react';

const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e, searchType = 'all') => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e, 'all');
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={(e) => handleSubmit(e, 'all')}>
        <input
          type="text"
          className="search-input"
          placeholder="Search the web and social media..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        <div className="search-buttons">
          <button 
            type="button"
            className="search-btn"
            onClick={(e) => handleSubmit(e, 'all')}
          >
            Search All
          </button>
          <button 
            type="button"
            className="search-btn secondary"
            onClick={(e) => handleSubmit(e, 'web')}
          >
            Web Only
          </button>
          <button 
            type="button"
            className="search-btn secondary"
            onClick={(e) => handleSubmit(e, 'social')}
          >
            Social Media
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBox;