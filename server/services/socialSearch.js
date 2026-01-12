const axios = require('axios');
const cheerio = require('cheerio');

class SocialSearchService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.platforms = {
      twitter: 'https://nitter.net/search?q=',
      github: 'https://github.com/search?q=',
      linkedin: 'https://www.linkedin.com/search/results/people/?keywords=',
      reddit: 'https://www.reddit.com/search/?q='
    };
  }

  async searchSocialMedia(query, platform = null, page = 1) {
    try {
      if (platform && this.platforms[platform]) {
        return await this.searchPlatform(platform, query, page);
      }

      // Search all platforms
      const platformPromises = Object.keys(this.platforms).map(async (platformName) => {
        try {
          const result = await this.searchPlatform(platformName, query, page);
          return { platform: platformName, ...result };
        } catch (error) {
          return { platform: platformName, results: [], error: error.message };
        }
      });

      const platformResults = await Promise.allSettled(platformPromises);
      const results = [];

      platformResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.results) {
          results.push(...result.value.results.map(item => ({
            ...item,
            platform: result.value.platform
          })));
        }
      });

      return {
        results,
        query,
        page,
        platforms: Object.keys(this.platforms)
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

  async searchPlatform(platform, query, page = 1) {
    switch (platform) {
      case 'github':
        return await this.searchGitHub(query, page);
      case 'reddit':
        return await this.searchReddit(query, page);
      case 'twitter':
        return await this.searchTwitter(query, page);
      case 'linkedin':
        return await this.searchLinkedIn(query, page);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async searchGitHub(query, page = 1) {
    try {
      const searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=users&p=${page}`;
      
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
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

  async searchReddit(query, page = 1) {
    try {
      // Using Reddit's JSON API
      const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=25&sort=relevance`;
      
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const data = response.data;
      const results = [];

      if (data.data && data.data.children) {
        data.data.children.forEach(item => {
          const post = item.data;
          results.push({
            title: post.title,
            author: post.author,
            subreddit: post.subreddit,
            url: `https://reddit.com${post.permalink}`,
            score: post.score,
            created: new Date(post.created_utc * 1000).toISOString(),
            platform: 'reddit',
            type: 'post'
          });
        });
      }

      return { results, query, page };
    } catch (error) {
      console.error('Reddit search error:', error.message);
      return { results: [], query, page, error: error.message };
    }
  }

  async searchTwitter(query, page = 1) {
    // Note: Twitter/X API requires authentication and has strict rate limits
    // This is a placeholder implementation using Nitter (alternative Twitter frontend)
    try {
      const searchUrl = `https://nitter.net/search?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results = [];

      $('.timeline-item').each((index, element) => {
        const $element = $(element);
        const username = $element.find('.username').text().trim();
        const content = $element.find('.tweet-content').text().trim();
        const profileUrl = 'https://nitter.net' + $element.find('.username').attr('href');

        if (username && content) {
          results.push({
            username,
            content,
            profileUrl,
            platform: 'twitter',
            type: 'tweet'
          });
        }
      });

      return { results, query, page };
    } catch (error) {
      console.error('Twitter search error:', error.message);
      return { results: [], query, page, error: error.message };
    }
  }

  async searchLinkedIn(query, page = 1) {
    // LinkedIn has strict anti-scraping measures
    // This would typically require their API or specialized tools
    return {
      results: [],
      query,
      page,
      error: 'LinkedIn search requires API access or specialized tools'
    };
  }
}

const socialSearchService = new SocialSearchService();

module.exports = {
  searchSocialMedia: (query, platform, page) => socialSearchService.searchSocialMedia(query, platform, page)
};