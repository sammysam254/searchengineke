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

  try {
    const testResponse = {
      message: 'Test function working',
      timestamp: new Date().toISOString(),
      query: event.queryStringParameters?.q || 'no query',
      method: event.httpMethod,
      results: [
        {
          title: 'Test Result 1',
          url: 'https://example.com/1',
          snippet: 'This is a test result to verify JSON parsing',
          source: 'test'
        },
        {
          title: 'Test Result 2', 
          url: 'https://example.com/2',
          snippet: 'Another test result with proper JSON structure',
          source: 'test'
        }
      ],
      totalResults: 2,
      hasNextPage: false
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(testResponse)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Test function failed',
        details: error.message 
      })
    };
  }
};