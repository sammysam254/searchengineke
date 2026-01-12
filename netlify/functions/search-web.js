const axios = require('axios');
const cheerio = require('cheerio');

// Add timeout and better error handling
const axiosConfig = {
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
  }
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function searchWeb(query, page = 1) {
  try {
    console.log(`Searching for: ${query}, page: ${page}`);
    
    // Try multiple search engines as fallback
    const searchEngines = [
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${(page - 1) * 10}`,
      `https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${(page - 1) * 10 + 1}`
    ];

    for (let i = 0; i < searchEngines.length; i++) {
      try {
        console.log(`Trying search engine ${i + 1}: ${searchEngines[i]}`);
        
        const response = await axios.get(searchEngines[i], {
          ...axiosConfig,
          timeout: 10000
        });

        console.log(`Response status: ${response.status}`);
        
        if (i === 0) {
          return parseSearchResults(response.data, query, page);
        } else {
          return parseBingResults(response.data, query, page);
        }
      } catch (error) {
        console.error(`Search engine ${i + 1} failed:`, error.message);
        if (i === searchEngines.length - 1) {
          throw error;
        }
        continue;
      }
    }
  } catch (error) {
    console.error('All search engines failed:', error.message);
    return {
      results: [],
      query,
      page,
      error: `Search failed: ${error.message}`
    };
  }
}

function parseSearchResults(html, query, page) {
  try {
    const $ = cheerio.load(html);
    const results = [];

    // Try multiple selectors for different search engines
    const selectors = [
      '.result',
      '.web-result',
      '.b_algo',
      '.g'
    ];

    for (const selector of selectors) {
      $(selector).each((index, element) => {
        const $element = $(element);
        
        // Try different title selectors
        let title = $element.find('.result__title a').text().trim() ||
                   $element.find('h3 a').text().trim() ||
                   $element.find('h2 a').text().trim() ||
                   $element.find('a').first().text().trim();
        
        // Try different URL selectors
        let url = $element.find('.result__title a').attr('href') ||
                 $element.find('h3 a').attr('href') ||
                 $element.find('h2 a').attr('href') ||
                 $element.find('a').first().attr('href');
        
        // Try different snippet selectors
        let snippet = $element.find('.result__snippet').text().trim() ||
                     $element.find('.b_caption p').text().trim() ||
                     $element.find('.s').text().trim() ||
                     $element.find('span').text().trim();
        
        if (title && url) {
          // Clean up URL
          if (url.startsWith('//')) {
            url = `https:${url}`;
          } else if (url.startsWith('/')) {
            url = `https://duckduckgo.com${url}`;
          }
          
          results.push({
            title: title.substring(0, 200), // Limit title length
            url,
            snippet: snippet.substring(0, 300), // Limit snippet length
            source: 'web'
          });
        }
      });
      
      if (results.length > 0) break; // Stop if we found results
    }

    return {
      results: results.slice(0, 10), // Limit to 10 results
      query,
      page: parseInt(page),
      totalResults: results.length,
      hasNextPage: results.length >= 10
    };
  } catch (error) {
    console.error('Parse error:', error.message);
    return {
      results: [],
      query,
      page,
      error: `Parse failed: ${error.message}`
    };
  }
}

function parseBingResults(html, query, page) {
  try {
    const $ = cheerio.load(html);
    const results = [];

    $('.b_algo').each((index, element) => {
      const $element = $(element);
      const title = $element.find('h2 a').text().trim();
      const url = $element.find('h2 a').attr('href');
      const snippet = $element.find('.b_caption p').text().trim();
      
      if (title && url) {
        results.push({
          title: title.substring(0, 200),
          url,
          snippet: snippet.substring(0, 300),
          source: 'web'
        });
      }
    });

    return {
      results: results.slice(0, 10),
      query,
      page: parseInt(page),
      totalResults: results.length,
      hasNextPage: results.length >= 10
    };
  } catch (error) {
    console.error('Bing parse error:', error.message);
    return {
      results: [],
      query,
      page,
      error: `Bing parse failed: ${error.message}`
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

    const results = await searchWeb(query, page);
    
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
      body: JSON.stringify({ error: 'Search failed' })
    };
  }
};