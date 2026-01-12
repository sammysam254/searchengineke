const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Google Custom Search implementation
async function searchGoogle(query, page = 1) {
  const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '9665ae5d79a464466';
  
  console.log(`Google search for: ${query}, page: ${page}`);
  console.log(`API Key: ${apiKey ? 'Present' : 'Missing'}`);
  console.log(`Search Engine ID: ${searchEngineId}`);

  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Making request to Google API...`);
    
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'SearchEngine/1.0'
      }
    });
    
    const data = response.data;
    console.log(`Google API response status: ${response.status}`);
    console.log(`Total results: ${data.searchInformation?.totalResults || 0}`);
    
    const results = data.items?.map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: 'google',
      displayLink: item.displayLink,
      formattedUrl: item.formattedUrl
    })) || [];

    return {
      results,
      query,
      page: parseInt(page),
      totalResults: parseInt(data.searchInformation?.totalResults || 0),
      searchTime: data.searchInformation?.searchTime,
      hasNextPage: results.length === 10,
      source: 'google',
      note: `Powered by Google Custom Search API - ${results.length} results found in ${data.searchInformation?.searchTime} seconds`
    };
  } catch (error) {
    console.error('Google search error:', error.message);
    console.error('Error details:', error.response?.data);
    
    // Return helpful error information
    let errorMessage = 'Google search failed';
    let setupInstructions = [];
    
    if (error.response?.status === 403) {
      errorMessage = 'Google API quota exceeded';
      setupInstructions = [
        {
          title: "Daily Quota Exceeded (100 searches/day)",
          url: "https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas",
          snippet: "You've used your 100 free Google searches for today. The quota resets at midnight Pacific Time. Upgrade to paid plan for more searches.",
          source: 'error'
        },
        {
          title: "Check Your Usage",
          url: "https://console.cloud.google.com/apis/api/customsearch.googleapis.com/metrics",
          snippet: "Monitor your API usage and see when your quota will reset. Consider upgrading if you need more than 100 searches per day.",
          source: 'error'
        }
      ];
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid API configuration';
      setupInstructions = [
        {
          title: "API Configuration Error",
          url: "https://console.cloud.google.com/apis/api/customsearch.googleapis.com",
          snippet: "Please verify your Google API key is valid and the Custom Search API is enabled in your Google Cloud Console.",
          source: 'error'
        }
      ];
    } else {
      setupInstructions = [
        {
          title: `Search for "${query}" - Temporary Error`,
          url: "https://www.google.com/search?q=" + encodeURIComponent(query),
          snippet: "There was a temporary issue with the Google search API. You can search directly on Google using this link.",
          source: 'error'
        }
      ];
    }

    return {
      results: setupInstructions,
      query,
      page,
      error: errorMessage,
      note: `Error: ${errorMessage}. ${setupInstructions.length > 0 ? 'See alternative options below.' : ''}`
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

    const results = await searchGoogle(query, page);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Google search failed',
        details: error.message 
      })
    };
  }
};