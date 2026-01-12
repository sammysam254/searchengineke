exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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

    // Simple mock results
    const mockResults = {
      results: [
        {
          title: `Search results for "${query}"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `You searched for "${query}". This is a test result to verify the function is working correctly.`,
          source: 'test'
        },
        {
          title: `${query} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
          snippet: `Find information about ${query} on Wikipedia.`,
          source: 'test'
        },
        {
          title: `${query} - GitHub`,
          url: `https://github.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Discover repositories related to ${query} on GitHub.`,
          source: 'test'
        }
      ],
      query,
      page: parseInt(page),
      totalResults: 3,
      hasNextPage: false,
      note: 'Test results - function is working correctly'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResults)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Search test failed',
        details: error.message,
        query: event.queryStringParameters?.q || 'unknown'
      })
    };
  }
};