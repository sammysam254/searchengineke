const https = require('https');
const { URL } = require('url');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Native HTTPS request function
function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'SearchEngine/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ data: jsonData, status: res.statusCode });
        } catch (error) {
          reject(new Error(`JSON parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Direct Google Custom Search implementation using native HTTPS
async function searchGoogleDirect(query, page = 1) {
  const apiKey = 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
  const searchEngineId = '9665ae5d79a464466';
  
  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Native Google search for: ${query}, page: ${page}`);
    
    const response = await httpsRequest(url);
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }
    
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
      hasNextPage: results.length === 10
    };
  } catch (error) {
    console.error('Native Google search error:', error.message);
    throw error;
  }
}

exports.handler = async (event, context) => {
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

    console.log(`Native web search for: ${query}, page: ${page}`);

    // Try native Google search
    try {
      const results = await searchGoogleDirect(query, page);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(results)
      };
    } catch (error) {
      console.log('Native Google search failed:', error.message);
      
      // Handle specific Google API errors
      if (error.message.includes('403')) {
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
          note: "Daily quota exceeded. Try again tomorrow."
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(quotaResults)
        };
      }
    }

    // Fallback results
    const fallbackResults = {
      results: [
        {
          title: `Search results for "${query}"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: 'Click here to search directly on Google.',
          source: 'fallback'
        }
      ],
      query,
      page: parseInt(page),
      totalResults: 1,
      hasNextPage: false,
      note: 'Fallback results - API temporarily unavailable'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackResults)
    };
  } catch (error) {
    console.error('Native web search error:', error);
    
    const errorResponse = { 
      error: 'Native web search failed',
      details: error.message,
      query: event.queryStringParameters?.q || 'unknown',
      results: []
    };
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
};