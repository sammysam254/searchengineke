const axios = require('axios');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Direct Google Custom Search implementation
async function searchGoogleDirect(query, page = 1) {
  const apiKey = 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
  const searchEngineId = '9665ae5d79a464466';
  
  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Vercel Google search for: ${query}, page: ${page}`);
    
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'INFINITUM-SearchEngine/1.0',
        'Accept': 'application/json'
      }
    });
    
    const data = response.data;
    const results = data.items?.map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: 'google',
      displayLink: item.displayLink
    })) || [];

    return {
      results,
      query,
      page: parseInt(page),
      totalResults: parseInt(data.searchInformation?.totalResults || 0),
      searchTime: data.searchInformation?.searchTime,
      hasNextPage: results.length === 10,
      note: `Google Search - ${results.length} results in ${data.searchInformation?.searchTime}s`,
      platform: 'vercel'
    };
  } catch (error) {
    console.error('Vercel Google search error:', error.message);
    throw error;
  }
}

// Social media search using Reddit API
async function searchSocialDirect(query, page = 1) {
  try {
    console.log(`Vercel social search for: ${query}, page: ${page}`);
    
    const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=8&sort=relevance&t=all`;
    const redditResponse = await axios.get(redditUrl, {
      headers: { 
        'User-Agent': 'INFINITUM-SearchEngine/1.0 (by /u/infinitum)',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const results = [];
    
    if (redditResponse.data.data && redditResponse.data.data.children) {
      redditResponse.data.data.children.forEach(item => {
        const post = item.data;
        if (post.title && post.permalink) {
          results.push({
            title: post.title.substring(0, 200),
            url: `https://reddit.com${post.permalink}`,
            snippet: post.selftext ? post.selftext.substring(0, 300) : `Discussion in r/${post.subreddit} by u/${post.author}`,
            source: 'reddit',
            platform: 'reddit',
            author: post.author,
            subreddit: post.subreddit,
            score: post.score,
            type: 'post'
          });
        }
      });
    }

    return {
      results,
      query,
      page: parseInt(page),
      hasNextPage: results.length >= 8,
      note: `Social Media Search - ${results.length} results from Reddit`,
      platform: 'vercel'
    };
  } catch (error) {
    console.error('Vercel social search error:', error.message);
    return {
      results: [],
      query,
      page: parseInt(page),
      hasNextPage: false,
      error: error.message,
      platform: 'vercel'
    };
  }
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q: query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Vercel combined search for: ${query}, page: ${page}`);

    // Search both Google and Social Media in parallel
    const [webResults, socialResults] = await Promise.allSettled([
      searchGoogleDirect(query, page),
      searchSocialDirect(query, page)
    ]);

    const combinedResults = {
      web: webResults.status === 'fulfilled' ? webResults.value : { 
        results: [], 
        error: webResults.reason?.message || 'Web search failed' 
      },
      social: socialResults.status === 'fulfilled' ? socialResults.value : { 
        results: [], 
        error: socialResults.reason?.message || 'Social search failed' 
      },
      query,
      page: parseInt(page),
      platform: 'vercel'
    };

    // Handle Google API quota exceeded
    if (webResults.status === 'rejected' && webResults.reason?.response?.status === 403) {
      combinedResults.web = {
        results: [
          {
            title: "Google API Quota Exceeded",
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: "Daily quota exceeded. Click to search directly on Google.",
            source: 'quota'
          }
        ],
        query,
        page: parseInt(page),
        note: "Daily quota exceeded. Try again tomorrow.",
        platform: 'vercel'
      };
    }

    return res.status(200).json(combinedResults);
  } catch (error) {
    console.error('Vercel combined search error:', error);
    
    const errorResponse = {
      error: 'Vercel combined search failed',
      details: error.message,
      query: req.query?.q || 'unknown',
      results: [],
      platform: 'vercel'
    };
    
    return res.status(500).json(errorResponse);
  }
}