const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Import search functions (simplified versions for serverless)
async function searchWeb(query, page = 1) {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${(page - 1) * 10}`;
    
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': userAgent },
      timeout: 8000
    });

    const $ = cheerio.load(response.data);
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

    return { results, query, page };
  } catch (error) {
    return { results: [], query, page, error: error.message };
  }
}

async function searchSocial(query, page = 1) {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // Search Reddit
    const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10&sort=relevance`;
    const redditResponse = await axios.get(redditUrl, {
      headers: { 'User-Agent': userAgent },
      timeout: 8000
    });

    const results = [];
    
    if (redditResponse.data.data && redditResponse.data.data.children) {
      redditResponse.data.data.children.slice(0, 5).forEach(item => {
        const post = item.data;
        results.push({
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: `https://reddit.com${post.permalink}`,
          score: post.score,
          platform: 'reddit',
          type: 'post'
        });
      });
    }

    return { results, query, page };
  } catch (error) {
    return { results: [], query, page, error: error.message };
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

    // Search both web and social in parallel
    const [webResults, socialResults] = await Promise.allSettled([
      searchWeb(query, page),
      searchSocial(query, page)
    ]);

    const results = {
      web: webResults.status === 'fulfilled' ? webResults.value : { results: [], error: webResults.reason?.message },
      social: socialResults.status === 'fulfilled' ? socialResults.value : { results: [], error: socialResults.reason?.message },
      query,
      page: parseInt(page)
    };

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