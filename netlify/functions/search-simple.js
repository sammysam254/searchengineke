// Simple search function that returns mock results for testing
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  console.log('Simple search function called');
  console.log('Event:', JSON.stringify(event, null, 2));

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

    // Return mock results for testing
    const mockResults = {
      results: [
        {
          title: `Search results for "${query}"`,
          url: 'https://example.com',
          snippet: 'This is a test result to verify the search engine is working properly.',
          source: 'web'
        },
        {
          title: `${query} - Wikipedia`,
          url: 'https://wikipedia.org',
          snippet: `Wikipedia article about ${query}. This is a mock result for testing purposes.`,
          source: 'web'
        },
        {
          title: `Learn about ${query}`,
          url: 'https://github.com',
          snippet: `GitHub repositories and resources related to ${query}.`,
          source: 'web'
        }
      ],
      query,
      page: parseInt(page),
      totalResults: 3,
      hasNextPage: false,
      note: 'These are test results. The search engine is working!'
    };

    console.log('Returning mock results:', mockResults);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResults)
    };
  } catch (error) {
    console.error('Simple search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Simple search failed',
        details: error.message 
      })
    };
  }
};