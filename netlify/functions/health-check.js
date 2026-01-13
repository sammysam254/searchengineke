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
    const healthInfo = {
      status: 'healthy',
      message: 'Netlify function is working correctly',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      query: event.queryStringParameters,
      availableFunctions: [
        'search-web',
        'search-web-native', 
        'search-simple-test',
        'test-search',
        'debug',
        'health-check'
      ],
      platform: 'netlify'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(healthInfo, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        status: 'error',
        error: 'Health check failed',
        details: error.message,
        platform: 'netlify'
      })
    };
  }
};