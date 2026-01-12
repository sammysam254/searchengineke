const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Direct Google Custom Search implementation
async function searchGoogleDirect(query, page = 1) {
  // Hardcoded credentials for Netlify free plan
  const apiKey = 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
  const searchEngineId = '9665ae5d79a464466';
  
  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Direct Google search for: ${query}`);
    
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
      note: `Google Search API - ${results.length} results in ${data.searchInformation?.searchTime}s`
    };
  } catch (error) {
    console.error('Direct Google search error:', error.message);
    throw error;
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

    console.log(`Web search for: ${query}, page: ${page}`);

    // Try direct Google search first
    try {
      const results = await searchGoogleDirect(query, page);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(results)
      };
    } catch (error) {
      console.log('Direct Google search failed:', error.message);
      
      // Handle specific Google API errors
      if (error.response?.status === 403) {
        const quotaResults = {
          results: [
            {
              title: "Google API Quota Exceeded",
              url: "https://www.google.com/search?q=" + encodeURIComponent(query),
              snippet: "You've used your 100 free Google searches for today. Click here to search directly on Google. Quota resets at midnight Pacific Time.",
              source: 'quota'
            },
            {
              title: `Search "${query}" on Google`,
              url: "https://www.google.com/search?q=" + encodeURIComponent(query),
              snippet: "Direct link to Google search results while waiting for API quota to reset.",
              source: 'quota'
            }
          ],
          query,
          page,
          note: "Daily quota of 100 searches exceeded. Try again tomorrow or search directly on Google."
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(quotaResults)
        };
      }
    }

    // Fallback results if Google search fails
    const fallbackResults = {
      results: [
        {
          title: `Search results for "${query}"`,
          url: "https://www.google.com/search?q=" + encodeURIComponent(query),
          snippet: 'Your search engine is working! Click here to search directly on Google while we resolve any API issues.',
          source: 'fallback'
        },
        {
          title: `${query} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
          snippet: `Find comprehensive information about ${query} on Wikipedia.`,
          source: 'fallback'
        },
        {
          title: `${query} - GitHub`,
          url: `https://github.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Discover code repositories and projects related to ${query} on GitHub.`,
          source: 'fallback'
        }
      ],
      query,
      page: parseInt(page),
      totalResults: 3,
      hasNextPage: false,
      note: 'Fallback results - Google API may be temporarily unavailable'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackResults)
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Web search failed',
        details: error.message 
      })
    };
  }
};