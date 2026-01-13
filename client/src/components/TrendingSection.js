import React, { useState, useEffect } from 'react';

const TrendingSection = ({ onSearch }) => {
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [suggestedWebsites, setSuggestedWebsites] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Trending searches that refresh every hour
  const trendingData = [
    // Tech & AI
    ['ChatGPT', 'Artificial Intelligence', 'Machine Learning', 'Blockchain', 'Cryptocurrency'],
    ['React JS', 'Python Programming', 'Web Development', 'Cloud Computing', 'Cybersecurity'],
    ['iPhone 15', 'Tesla Model 3', 'Gaming Laptops', 'Smart Watches', 'VR Headsets'],
    
    // Entertainment & Culture
    ['Netflix Movies', 'Spotify Playlists', 'YouTube Trends', 'TikTok Viral', 'Instagram Reels'],
    ['Marvel Movies', 'Anime Series', 'K-Pop Music', 'Gaming News', 'Celebrity News'],
    ['Travel Destinations', 'Food Recipes', 'Fitness Tips', 'Fashion Trends', 'Home Decor'],
    
    // News & Current Events
    ['World News', 'Climate Change', 'Space Exploration', 'Economic Updates', 'Health News'],
    ['Sports Updates', 'Olympic Games', 'Football News', 'Basketball Scores', 'Tennis Matches'],
    ['Stock Market', 'Real Estate', 'Job Market', 'Education News', 'Science Discoveries']
  ];

  // Suggested websites that refresh every 30 minutes
  const websiteData = [
    // Productivity & Tools
    [
      { name: 'GitHub', url: 'https://github.com', desc: 'Code repositories and collaboration' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: 'Programming Q&A community' },
      { name: 'CodePen', url: 'https://codepen.io', desc: 'Front-end code playground' },
      { name: 'Figma', url: 'https://figma.com', desc: 'Collaborative design tool' },
      { name: 'Notion', url: 'https://notion.so', desc: 'All-in-one workspace' }
    ],
    
    // Learning & Education
    [
      { name: 'Coursera', url: 'https://coursera.org', desc: 'Online courses from universities' },
      { name: 'Khan Academy', url: 'https://khanacademy.org', desc: 'Free online learning' },
      { name: 'freeCodeCamp', url: 'https://freecodecamp.org', desc: 'Learn to code for free' },
      { name: 'Udemy', url: 'https://udemy.com', desc: 'Online skill development' },
      { name: 'Duolingo', url: 'https://duolingo.com', desc: 'Language learning platform' }
    ],
    
    // Entertainment & Media
    [
      { name: 'YouTube', url: 'https://youtube.com', desc: 'Video sharing platform' },
      { name: 'Spotify', url: 'https://spotify.com', desc: 'Music streaming service' },
      { name: 'Netflix', url: 'https://netflix.com', desc: 'Streaming entertainment' },
      { name: 'Twitch', url: 'https://twitch.tv', desc: 'Live streaming platform' },
      { name: 'Reddit', url: 'https://reddit.com', desc: 'Social news aggregation' }
    ],
    
    // News & Information
    [
      { name: 'BBC News', url: 'https://bbc.com/news', desc: 'Global news coverage' },
      { name: 'Wikipedia', url: 'https://wikipedia.org', desc: 'Free encyclopedia' },
      { name: 'Medium', url: 'https://medium.com', desc: 'Publishing platform' },
      { name: 'TED', url: 'https://ted.com', desc: 'Ideas worth spreading' },
      { name: 'National Geographic', url: 'https://nationalgeographic.com', desc: 'Science and exploration' }
    ]
  ];

  useEffect(() => {
    const updateContent = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Update trending searches every hour
      const hourIndex = now.getHours() % trendingData.length;
      setTrendingSearches(trendingData[hourIndex]);
      
      // Update suggested websites every 30 minutes
      const halfHourIndex = Math.floor(now.getMinutes() / 30) + (now.getHours() * 2);
      const websiteIndex = halfHourIndex % websiteData.length;
      setSuggestedWebsites(websiteData[websiteIndex]);
    };

    // Initial update
    updateContent();

    // Update every minute to check for changes
    const interval = setInterval(updateContent, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleTrendingClick = (search) => {
    onSearch(search, 1, 'web'); // Always start with page 1 and web mode
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="trending-section">
      <div className="trending-container">
        {/* Trending Searches */}
        <div className="trending-searches">
          <div className="section-header">
            <h3>🔥 Trending Now</h3>
            <span className="update-time">Updates hourly • {formatTime(currentTime)}</span>
          </div>
          <div className="trending-grid">
            {trendingSearches.map((search, index) => (
              <button
                key={index}
                className="trending-item"
                onClick={() => handleTrendingClick(search)}
              >
                <span className="trending-icon">🔍</span>
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Websites */}
        <div className="suggested-websites">
          <div className="section-header">
            <h3>🌟 Discover</h3>
            <span className="update-time">Refreshes every 30min</span>
          </div>
          <div className="websites-grid">
            {suggestedWebsites.map((site, index) => (
              <a
                key={index}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="website-card"
                onClick={(e) => {
                  // Show loading bar for external links
                  const loadingBar = document.getElementById('top-loading-bar');
                  if (loadingBar) {
                    loadingBar.style.display = 'block';
                    loadingBar.style.width = '0%';
                    
                    let width = 0;
                    const interval = setInterval(() => {
                      width += Math.random() * 20;
                      if (width > 90) width = 90;
                      loadingBar.style.width = width + '%';
                    }, 100);
                    
                    setTimeout(() => {
                      clearInterval(interval);
                      loadingBar.style.width = '100%';
                      setTimeout(() => {
                        loadingBar.style.display = 'none';
                      }, 500);
                    }, 1000);
                  }
                }}
              >
                <div className="website-name">{site.name}</div>
                <div className="website-desc">{site.desc}</div>
                <div className="website-arrow">→</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Search Suggestions */}
      <div className="quick-suggestions">
        <p>Try searching for:</p>
        <div className="quick-tags">
          {['Latest News', 'Weather Today', 'Stock Market', 'Movie Reviews', 'Recipe Ideas'].map((tag, index) => (
            <button
              key={index}
              className="quick-tag"
              onClick={() => handleTrendingClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;