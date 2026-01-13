import React, { useState } from 'react';
import AISearchBox from './components/AISearchBox';
import SearchResults from './components/SearchResults';
import AIResults from './components/AIResults';
import TrendingSection from './components/TrendingSection';
import { getApiEndpoint, getFallbackEndpoints, getPlatformInfo } from './utils/platformDetection';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTrending, setShowTrending] = useState(true);
  const [isAIMode, setIsAIMode] = useState(false);

  const handleSearch = async (query, page = 1, mode = 'web') => {
    setLoading(true);
    setError(null);
    setShowTrending(false); // Hide trending when searching

    try {
      // Determine endpoint based on mode
      const endpoint = mode === 'ai' ? 'search-ai' : 'search-web';
      const apiUrl = getApiEndpoint(endpoint, query, page);
      const fallbackUrls = getFallbackEndpoints(endpoint, query, page);
      const platformInfo = getPlatformInfo();
      
      console.log(`Calling ${mode.toUpperCase()} API on ${platformInfo.name}:`, apiUrl);
      
      // Try primary endpoint first
      let response = await fetch(apiUrl);
      let attemptedUrl = apiUrl;
      
      // If primary fails and we have fallbacks, try them
      if (!response.ok && fallbackUrls.length > 0) {
        console.log('Primary endpoint failed, trying fallbacks...');
        
        for (const fallbackUrl of fallbackUrls) {
          console.log('Trying fallback:', fallbackUrl);
          try {
            response = await fetch(fallbackUrl);
            if (response.ok) {
              attemptedUrl = fallbackUrl;
              console.log('Fallback succeeded:', fallbackUrl);
              break;
            }
          } catch (fallbackError) {
            console.log('Fallback failed:', fallbackUrl, fallbackError.message);
          }
        }
      }
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: All endpoints failed`);
      }
      
      // Try to parse JSON with error handling
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200) + '...');
        
        // Check if response looks like HTML instead of JSON
        if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
          throw new Error('Server returned HTML instead of JSON - function not found');
        }
        
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        
        // Provide helpful error message for HTML responses
        if (jsonError.message.includes('HTML instead of JSON')) {
          throw new Error('Search function not deployed correctly. Please check deployment.');
        }
        
        throw new Error('Invalid JSON response from server');
      }
      
      // Add platform info to results
      data.platformInfo = platformInfo;
      data.usedEndpoint = attemptedUrl;
      data.searchMode = mode;
      
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

  const handleToggleAI = (aiMode) => {
    setIsAIMode(aiMode);
    setResults(null);
    setError(null);
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
        
        <AISearchBox 
          onSearch={handleSearch} 
          isAIMode={isAIMode}
          onToggleAI={handleToggleAI}
        />
        
        {showTrending && !results && !loading && !isAIMode && (
          <TrendingSection onSearch={handleSearch} />
        )}
        
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">
              {isAIMode ? 'AI is thinking...' : 'Searching the infinite web...'}
            </div>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        {error && <div className="error">Error: {error}</div>}
        
        {results && !loading && (
          results.searchMode === 'ai' ? (
            <AIResults 
              results={results} 
              onSearch={handleSearch}
            />
          ) : (
            <SearchResults 
              results={results} 
              activeTab="web"
              onTabChange={() => {}}
              onSearch={handleSearch}
            />
          )
        )}
      </div>
      
      {/* Contact Ticker - Always Visible */}
      <div className="contact-ticker" onClick={() => window.open('tel:0707116562', '_self')}>
        <div className="ticker-content">
          Designed by Sam • Contact 0707116562 for any software • Designed by Sam • Contact 0707116562 for any software • Designed by Sam • Contact 0707116562 for any software • 
        </div>
      </div>
    </div>
  );
}

export default App;