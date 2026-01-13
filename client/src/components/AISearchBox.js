import React, { useState } from 'react';

const AISearchBox = ({ onSearch, isAIMode, onToggleAI }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), 1, isAIMode ? 'ai' : 'web');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleAISuggestion = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion, 1, 'ai');
  };

  const aiSuggestions = [
    'Explain quantum computing in simple terms',
    'What are the latest AI developments in 2024?',
    'How does blockchain technology work?',
    'Compare renewable energy sources',
    'Summarize the benefits of machine learning',
    'What is the future of space exploration?'
  ];

  return (
    <div className="ai-search-container">
      {/* AI Mode Toggle */}
      <div className="ai-mode-toggle">
        <button 
          className={`mode-btn ${!isAIMode ? 'active' : ''}`}
          onClick={() => onToggleAI(false)}
        >
          <span className="mode-icon">🔍</span>
          Web Search
        </button>
        <button 
          className={`mode-btn ${isAIMode ? 'active' : ''}`}
          onClick={() => onToggleAI(true)}
        >
          <span className="mode-icon">🤖</span>
          AI Mode
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <span className="search-icon">{isAIMode ? '🤖' : '🔍'}</span>
          <input
            type="text"
            className={`search-input ${isAIMode ? 'ai-mode' : ''}`}
            placeholder={isAIMode ? "Ask AI anything..." : "Search the infinite web..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <span className="infinity-icon">∞</span>
        </div>
        
        <div className="search-buttons">
          <button 
            type="submit"
            className={`search-btn ${isAIMode ? 'ai-primary' : 'primary'}`}
          >
            <span className="btn-icon">{isAIMode ? '🧠' : '🚀'}</span>
            {isAIMode ? 'Ask AI' : 'Infinitum Search'}
          </button>
          <button 
            type="button"
            className="search-btn secondary"
            onClick={() => {
              const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
              if (isAIMode) {
                handleAISuggestion(randomSuggestion);
              } else {
                setQuery(randomSuggestion);
                onSearch(randomSuggestion, 1, 'web');
              }
            }}
          >
            <span className="btn-icon">✨</span>
            {isAIMode ? "I'm Feeling Curious" : "I'm Feeling Infinite"}
          </button>
        </div>
      </form>

      {/* AI Suggestions */}
      {isAIMode && (
        <div className="ai-suggestions">
          <p className="suggestions-title">💡 Try asking AI:</p>
          <div className="suggestions-grid">
            {aiSuggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleAISuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearchBox;