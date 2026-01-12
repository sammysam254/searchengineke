const axios = require('axios');

const headers = {
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
    
    console.log(`Google search for: ${query}, page: ${page}`);
    
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'SearchEngine/1.0',
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
      note: `Google Search - ${results.length} results in ${data.searchInformation?.searchTime}s`
    };
  } catch (error) {
    console.error('Google search error:', error.message);
    throw error;
  }
}

// Direct social media search
async function searchSocialDirect(query, page = 1) {
  try {
    console.log(`Social search for: ${query}, page: ${page}`);
    
    // Search Reddit using JSON API
    const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=8&sort=relevance&t=all`;
    const redditResponse = await axios.get(redditUrl, {
      headers: { 
        'User-Agent': 'SearchEngine/1.0 (by /u/searchbot)',
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

    console.log(`Found ${results.length} social results`);
    return {
      results,
      query,
      page: parseInt(page),
      hasNextPage: results.length >= 8,
      note: `Social Media Search - ${results.length} results from Reddit`
    };
  } catch (error) {
    console.error('Social search error:', error.message);
    return {
      results: [],
      query,
      page: parseInt(page),
      hasNextPage: false,
      error: error.message
    };
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { q: query, page = 1 } = event.queryStringParameters || {};
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    console.log(`Combined search for: ${query}, page: ${page}`);

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
      page: parseInt(page)
    };

    // Handle Google API quota exceeded
    if (webResults.status === 'rejected' && webResults.reason?.response?.status === 403) {
      combinedResults.web = {
        results: [
          {
            title: "Google API Quota Exceeded",
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: "You've used your 100 free Google searches for today. Click here to search directly on Google.",
            source: 'quota'
          }
        ],
        query,
        page,
        note: "Daily quota of 100 searches exceeded. Try again tomorrow."
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(combinedResults)
    };
  } catch (error) {
    console.error('Combined search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Combined search failed',
        details: error.message 
      })
    };
  }
};