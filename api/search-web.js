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
      hasNextPage: results.length === 10,
      platform: 'vercel'
    };
  } catch (error) {
    console.error('Vercel Google search error:', error.message);
    throw error;
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

    console.log(`Vercel web search for: ${query}, page: ${page}`);

    // Try direct Google search
    try {
      const results = await searchGoogleDirect(query, page);
      return res.status(200).json(results);
    } catch (error) {
      console.log('Vercel Google search failed:', error.message);
      
      // Handle Google API quota exceeded
      if (error.response?.status === 403) {
        const quotaResults = {
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
          totalResults: 1,
          hasNextPage: false,
          note: "Daily quota exceeded. Try again tomorrow.",
          platform: 'vercel'
        };
        
        return res.status(200).json(quotaResults);
      }
    }

    // Fallback results
    const fallbackResults = {
      results: [
        {
          title: `Search results for "${query}"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: 'Your INFINITUM search engine is working on Vercel! Click here to search directly on Google.',
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
          snippet: `Discover code repositories related to ${query} on GitHub.`,
          source: 'fallback'
        }
      ],
      query,
      page: parseInt(page),
      totalResults: 3,
      hasNextPage: false,
      note: 'Fallback results - Google API may be temporarily unavailable',
      platform: 'vercel'
    };

    return res.status(200).json(fallbackResults);
  } catch (error) {
    console.error('Vercel web search error:', error);
    
    const errorResponse = { 
      error: 'Vercel web search failed',
      details: error.message,
      query: req.query?.q || 'unknown',
      results: [],
      platform: 'vercel'
    };
    
    return res.status(500).json(errorResponse);
  }
}