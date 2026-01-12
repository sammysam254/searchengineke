const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function searchWeb(query, page = 1) {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${(page - 1) * 10}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 10000
    });

    return parseSearchResults(response.data, query, page);
  } catch (error) {
    console.error('Web search error:', error.message);
    return {
      results: [],
      query,
      page,
      error: 'Failed to fetch search results'
    };
  }
}

function parseSearchResults(html, query, page) {
  const $ = cheerio.load(html);
  const results = [];

  $('.result').each((index, element) => {
    const $element = $(element);
    const title = $element.find('.result__title a').text().trim();
    const url = $element.find('.result__title a').attr('href');
    const snippet = $element.find('.result__snippet').text().trim();
    
    if (title && url) {
      results.push({
        title,
        url: url.startsWith('//') ? `https:${url}` : url,
        snippet,
        source: 'web'
      });
    }
  });

  return {
    results,
    query,
    page: parseInt(page),
    totalResults: results.length,
    hasNextPage: results.length >= 10
  };
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