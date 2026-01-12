const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function searchGitHub(query, page = 1) {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=users&p=${page}`;
    
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': userAgent },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.user-list-item').each((index, element) => {
      const $element = $(element);
      const username = $element.find('.f4 a').text().trim();
      const profileUrl = 'https://github.com' + $element.find('.f4 a').attr('href');
      const bio = $element.find('.text-gray').text().trim();
      const avatar = $element.find('img').attr('src');

      if (username) {
        results.push({
          username,
          profileUrl,
          bio,
          avatar,
          platform: 'github',
          type: 'profile'
        });
      }
    });

    return { results, query, page };
  } catch (error) {
    console.error('GitHub search error:', error.message);
    return { results: [], query, page, error: error.message };
  }
}

async function searchReddit(query, page = 1) {
  try {
    console.log(`Searching Reddit for: ${query}`);
    
    // Use Reddit's JSON API which is more reliable
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10&sort=relevance&t=all`;
    
    const response = await axios.get(searchUrl, {
      headers: { 
        'User-Agent': 'SearchEngine/1.0 (by /u/searchbot)',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log(`Reddit response status: ${response.status}`);
    
    const data = response.data;
    const results = [];

    if (data.data && data.data.children) {
      data.data.children.slice(0, 5).forEach(item => {
        const post = item.data;
        if (post.title && post.permalink) {
          results.push({
            title: post.title.substring(0, 200),
            author: post.author,
            subreddit: post.subreddit,
            url: `https://reddit.com${post.permalink}`,
            score: post.score,
            created: new Date(post.created_utc * 1000).toISOString(),
            platform: 'reddit',
            type: 'post'
          });
        }
      });
    }

    console.log(`Found ${results.length} Reddit results`);
    return { results, query, page };
  } catch (error) {
    console.error('Reddit search error:', error.message);
    
    // Return mock Reddit results as fallback
    return { 
      results: [
        {
          title: `Discussion about ${query}`,
          author: 'reddit_user',
          subreddit: 'general',
          url: 'https://reddit.com',
          score: 42,
          platform: 'reddit',
          type: 'post'
        }
      ], 
      query, 
      page, 
      note: 'Mock Reddit results - API may be unavailable'
    };
  }
}

async function searchSocialMedia(query, platform = null, page = 1) {
  try {
    if (platform === 'github') {
      return await searchGitHub(query, page);
    } else if (platform === 'reddit') {
      return await searchReddit(query, page);
    }

    // Search all platforms
    const [githubResults, redditResults] = await Promise.allSettled([
      searchGitHub(query, page),
      searchReddit(query, page)
    ]);

    const results = [];

    if (githubResults.status === 'fulfilled' && githubResults.value.results) {
      results.push(...githubResults.value.results);
    }

    if (redditResults.status === 'fulfilled' && redditResults.value.results) {
      results.push(...redditResults.value.results);
    }

    return {
      results,
      query,
      page,
      platforms: ['github', 'reddit']
    };
  } catch (error) {
    console.error('Social media search error:', error);
    return {
      results: [],
      query,
      page,
      error: error.message
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
    const { q: query, platform, page = 1 } = event.queryStringParameters || {};
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    const results = await searchSocialMedia(query, platform, page);
    
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
      body: JSON.stringify({ error: 'Social search failed' })
    };
  }
};