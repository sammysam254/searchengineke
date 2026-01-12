const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

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

    // Use Google search function directly
    try {
      const googleSearchUrl = `/.netlify/functions/search-google?q=${encodeURIComponent(query)}&page=${page}`;
      const response = await axios.get(`https://${event.headers.host}${googleSearchUrl}`, {
        timeout: 20000
      });
      
      if (response.data && response.data.results) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(response.data)
        };
      }
    } catch (error) {
      console.log('Google search failed, using fallback:', error.message);
    }

    // Fallback results if Google search fails
    const fallbackResults = {
      results: [
        {
          title: `Search results for "${query}"`,
          url: 'https://example.com',
          snippet: 'Your search engine is working! Configure your Google Search Engine ID for real results.',
          source: 'fallback'
        },
        {
          title: `${query} - Setup Instructions`,
          url: 'https://programmablesearchengine.google.com/controlpanel/all',
          snippet: 'Create a Google Custom Search Engine to get real search results. Click here to get started.',
          source: 'fallback'
        },
        {
          title: `Learn more about ${query}`,
          url: 'https://wikipedia.org',
          snippet: `Find comprehensive information about ${query} from various online sources.`,
          source: 'fallback'
        }
      ],
      query,
      page: parseInt(page),
      totalResults: 3,
      hasNextPage: false,
      note: 'Fallback results - Add your Google Search Engine ID for real search results'
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