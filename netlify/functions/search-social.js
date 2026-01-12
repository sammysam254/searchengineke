const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function searchGitHub(query, page = 1) {
  try {
    console.log(`Searching GitHub for: ${query}, page: ${page}`);
    
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // First try searching for repositories
    const repoSearchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories&p=${page}`;
    
    const response = await axios.get(repoSearchUrl, {
      headers: { 'User-Agent': userAgent },
      timeout: 15000
    });

    console.log(`GitHub response status: ${response.status}`);
    
    const $ = cheerio.load(response.data);
    const results = [];

    $('.repo-list-item').each((index, element) => {
      const $element = $(element);
      const title = $element.find('h3 a').text().trim();
      const url = 'https://github.com' + $element.find('h3 a').attr('href');
      const description = $element.find('p').text().trim();
      const language = $element.find('[itemprop="programmingLanguage"]').text().trim();
      const stars = $element.find('.octicon-star').parent().text().trim();

      if (title && url) {
        results.push({
          title,
          url,
          snippet: description || `GitHub repository for ${title}. ${language ? `Written in ${language}.` : ''} ${stars ? `⭐ ${stars}` : ''}`,
          platform: 'github',
          type: 'repository',
          language,
          stars
        });
      }
    });

    // If no repositories found, try searching for users
    if (results.length === 0) {
      const userSearchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=users&p=${page}`;
      const userResponse = await axios.get(userSearchUrl, {
        headers: { 'User-Agent': userAgent },
        timeout: 15000
      });

      const $users = cheerio.load(userResponse.data);
      $users('.user-list-item').each((index, element) => {
        const $element = $users(element);
        const username = $element.find('.f4 a').text().trim();
        const profileUrl = 'https://github.com' + $element.find('.f4 a').attr('href');
        const bio = $element.find('.text-gray').text().trim();

        if (username) {
          results.push({
            title: `${username} - GitHub Profile`,
            url: profileUrl,
            snippet: bio || `GitHub user profile for ${username}`,
            platform: 'github',
            type: 'profile',
            username
          });
        }
      });
    }

    console.log(`Found ${results.length} GitHub results`);
    return { 
      results: results.slice(0, 8), 
      query, 
      page,
      hasNextPage: results.length >= 8
    };
  } catch (error) {
    console.error('GitHub search error:', error.message);
    
    // Return empty results instead of fake ones
    return { 
      results: [], 
      query, 
      page,
      hasNextPage: false,
      error: `GitHub search failed: ${error.message}`
    };
  }
}

async function searchReddit(query, page = 1) {
  try {
    console.log(`Searching Reddit for: ${query}, page: ${page}`);
    
    // Use Reddit's JSON API which is more reliable
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10&sort=relevance&t=all`;
    
    const response = await axios.get(searchUrl, {
      headers: { 
        'User-Agent': 'SearchEngine/1.0 (by /u/searchbot)',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log(`Reddit response status: ${response.status}`);
    
    const data = response.data;
    const results = [];

    if (data.data && data.data.children) {
      data.data.children.slice(0, 8).forEach(item => {
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
            type: 'post',
            snippet: post.selftext ? post.selftext.substring(0, 300) : `Discussion in r/${post.subreddit} by u/${post.author}`
          });
        }
      });
    }

    console.log(`Found ${results.length} Reddit results`);
    return { 
      results, 
      query, 
      page,
      hasNextPage: results.length >= 8,
      totalResults: data.data?.dist || results.length
    };
  } catch (error) {
    console.error('Reddit search error:', error.message);
    
    // Return empty results instead of fake ones
    return { 
      results: [], 
      query, 
      page,
      hasNextPage: false,
      error: `Reddit search failed: ${error.message}`
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
    let hasNextPage = false;
    let totalResults = 0;

    if (githubResults.status === 'fulfilled' && githubResults.value.results) {
      results.push(...githubResults.value.results);
      if (githubResults.value.hasNextPage) hasNextPage = true;
      totalResults += githubResults.value.totalResults || githubResults.value.results.length;
    }

    if (redditResults.status === 'fulfilled' && redditResults.value.results) {
      results.push(...redditResults.value.results);
      if (redditResults.value.hasNextPage) hasNextPage = true;
      totalResults += redditResults.value.totalResults || redditResults.value.results.length;
    }

    return {
      results,
      query,
      page: parseInt(page),
      hasNextPage,
      totalResults,
      platforms: ['github', 'reddit'],
      note: `Social media search - ${results.length} results from GitHub and Reddit`
    };
  } catch (error) {
    console.error('Social media search error:', error);
    return {
      results: [],
      query,
      page: parseInt(page),
      hasNextPage: false,
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