import React from 'react';
import ResultItem from './ResultItem';

const SearchResults = ({ results, activeTab, onTabChange, onSearch }) => {
  if (!results) return null;

  const renderTabContent = () => {
    return results.results?.map((result, index) => (
      <ResultItem key={index} result={result} />
    ));
  };

  const getResultCount = () => {
    return results.results?.length || 0;
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
            onClick={() => onSearch && onSearch(results.query, 'web', currentPage - 1)}
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
            onClick={() => onSearch && onSearch(results.query, 'web', currentPage + 1)}
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
      </div>
      
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