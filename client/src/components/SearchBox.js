import React, { useState } from 'react';

const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e, searchType = 'web') => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e, 'web');
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={(e) => handleSubmit(e, 'web')}>
        <input
          type="text"
          className="search-input"
          placeholder="Search the web..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        <div className="search-buttons">
          <button 
            type="button"
            className="search-btn"
            onClick={(e) => handleSubmit(e, 'web')}
          >
            Google Search
          </button>
          <button 
            type="button"
            className="search-btn secondary"
            onClick={(e) => handleSubmit(e, 'web')}
          >
            I'm Feeling Lucky
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBox;