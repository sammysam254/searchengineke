const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Google Custom Search implementation
async function searchGoogle(query, page = 1) {
  // Hardcoded credentials for Netlify free plan
  const apiKey = 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
  const searchEngineId = '9665ae5d79a464466';
  
  console.log(`Google search for: ${query}, page: ${page}`);
  console.log(`Using hardcoded API credentials`);

  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Making request to Google API...`);
    
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'SearchEngine/1.0',
        'Accept': 'application/json'
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
      hasNextPage: results.length === 10,
      source: 'google'
    };
  } catch (error) {
    console.error('Google search error:', error.message);
    console.error('Error details:', error.response?.data);
    
    // Return helpful error information
    let errorMessage = 'Google search failed';
    let setupInstructions = [];
    
    if (error.response?.status === 403) {
      errorMessage = 'Google API quota exceeded (100 searches/day limit)';
      setupInstructions = [
        {
          title: "Daily Quota Exceeded",
          url: "https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas",
          snippet: "You've used your 100 free Google searches for today. The quota resets at midnight Pacific Time. Try again tomorrow or upgrade to a paid plan.",
          source: 'error'
        },
        {
          title: `Search "${query}" on Google directly`,
          url: "https://www.google.com/search?q=" + encodeURIComponent(query),
          snippet: "Click here to search directly on Google while we wait for the API quota to reset.",
          source: 'error'
        }
      ];
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid API request';
      setupInstructions = [
        {
          title: "API Configuration Issue",
          url: "https://console.cloud.google.com/apis/api/customsearch.googleapis.com",
          snippet: "There may be an issue with the API configuration. Please check the Google Cloud Console.",
          source: 'error'
        }
      ];
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Network connection issue';
      setupInstructions = [
        {
          title: `Search for "${query}" - Network Error`,
          url: "https://www.google.com/search?q=" + encodeURIComponent(query),
          snippet: "There was a network issue connecting to Google's API. Click here to search directly on Google.",
          source: 'error'
        }
      ];
    } else {
      setupInstructions = [
        {
          title: `Search for "${query}" - Temporary Error`,
          url: "https://www.google.com/search?q=" + encodeURIComponent(query),
          snippet: "There was a temporary issue with the search API. You can search directly on Google using this link.",
          source: 'error'
        }
      ];
    }

    return {
      results: setupInstructions,
      query,
      page,
      error: errorMessage,
      note: `Error: ${errorMessage}. See alternative options below.`
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