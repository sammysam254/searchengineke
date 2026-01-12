import React from 'react';
import ResultItem from './ResultItem';

const SearchResults = ({ results, activeTab, onTabChange, onSearch }) => {
  if (!results) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'web':
        return results.results?.map((result, index) => (
          <ResultItem key={index} result={result} />
        ));
      
      case 'social':
        return results.results?.map((result, index) => (
          <ResultItem key={index} result={result} />
        ));
      
      case 'all':
        const allResults = [];
        
        // Add web results
        if (results.web?.results) {
          allResults.push(...results.web.results.map(r => ({ ...r, source: 'web' })));
        }
        
        // Add social results
        if (results.social?.results) {
          allResults.push(...results.social.results.map(r => ({ ...r, source: 'social' })));
        }
        
        return allResults.map((result, index) => (
          <ResultItem key={index} result={result} />
        ));
      
      default:
        return <div>No results found</div>;
    }
  };

  const getResultCount = () => {
    if (activeTab === 'all') {
      const webCount = results.web?.results?.length || 0;
      const socialCount = results.social?.results?.length || 0;
      return webCount + socialCount;
    }
    return results.results?.length || 0;
  };

  const renderSearchEngineStats = () => {
    if (results.sourceStats) {
      return (
        <div className="search-engine-stats">
          <p className="stats-title">Search engines used:</p>
          <div className="stats-grid">
            {Object.entries(results.sourceStats).map(([engine, stats]) => (
              <div key={engine} className={`stat-item ${stats.error ? 'error' : 'success'}`}>
                <span className="engine-name">{engine}</span>
                <span className="result-count">{stats.count} results</span>
                {stats.error && <span className="error-text">({stats.error})</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderPagination = () => {
    const currentPage = results.page || 1;
    const hasNextPage = results.hasNextPage;
    const hasPrevPage = currentPage > 1;

    if (!hasNextPage && !hasPrevPage) return null;

    return (
      <div className="pagination">
        {hasPrevPage && (
          <button 
            className="pagination-btn prev"
            onClick={() => onSearch && onSearch(results.query, activeTab, currentPage - 1)}
          >
            ← Previous
          </button>
        )}
        
        <span className="page-info">
          Page {currentPage}
          {results.totalResults && (
            <span className="total-results">
              {' '}of about {results.totalResults.toLocaleString()} results
            </span>
          )}
        </span>
        
        {hasNextPage && (
          <button 
            className="pagination-btn next"
            onClick={() => onSearch && onSearch(results.query, activeTab, currentPage + 1)}
          >
            Next →
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <p>About {getResultCount()} results for "{results.query}"</p>
        {results.note && (
          <div className="search-note">
            <p>{results.note}</p>
          </div>
        )}
      </div>
      
      {renderSearchEngineStats()}
      
      {activeTab === 'all' && (
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            All Results
          </div>
          <div 
            className={`tab ${activeTab === 'web' ? 'active' : ''}`}
            onClick={() => onTabChange('web')}
          >
            Web ({results.web?.results?.length || 0})
          </div>
          <div 
            className={`tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => onTabChange('social')}
          >
            Social Media ({results.social?.results?.length || 0})
          </div>
        </div>
      )}
      
      <div className="results-list">
        {renderTabContent()}
      </div>
      
      {renderPagination()}
      
      {getResultCount() === 0 && (
        <div className="no-results">
          <p>No results found. Try different keywords or check your spelling.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;