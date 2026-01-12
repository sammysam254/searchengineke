import React from 'react';

const ResultItem = ({ result }) => {
  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      github: '#333',
      reddit: '#ff4500',
      twitter: '#1da1f2',
      linkedin: '#0077b5',
      web: '#34a853',
      google: '#4285f4'
    };
    return colors[platform] || '#666';
  };

  return (
    <div className="result-item">
      <div className="result-header">
        <a 
          href={result.url || result.profileUrl} 
          className="result-title"
          // Remove target="_blank" and rel="noopener noreferrer" to open in same tab
        >
          {result.title || result.username || 'Untitled'}
        </a>
        
        {result.source && (
          <span 
            className="result-platform"
            style={{ 
              backgroundColor: getPlatformColor(result.source) + '20', 
              color: getPlatformColor(result.source) 
            }}
          >
            {result.source}
          </span>
        )}
        
        {result.platform && result.platform !== result.source && (
          <span 
            className="result-platform"
            style={{ 
              backgroundColor: getPlatformColor(result.platform) + '20', 
              color: getPlatformColor(result.platform) 
            }}
          >
            {result.platform}
          </span>
        )}
      </div>
      
      <div className="result-url">
        {formatUrl(result.url || result.profileUrl || '')}
      </div>
      
      <div className="result-snippet">
        {result.snippet || result.bio || result.content || 'No description available'}
      </div>
      
      {result.type === 'profile' && result.username && (
        <div className="result-meta">
          <span>Username: @{result.username}</span>
        </div>
      )}
      
      {result.type === 'post' && (
        <div className="result-meta">
          {result.author && <span>By: {result.author}</span>}
          {result.subreddit && <span> in r/{result.subreddit}</span>}
          {result.score && <span> • Score: {result.score}</span>}
        </div>
      )}
      
      {result.created && (
        <div className="result-date">
          {new Date(result.created).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default ResultItem;