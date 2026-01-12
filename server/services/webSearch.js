const axios = require('axios');
const cheerio = require('cheerio');

class WebSearchService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async searchWeb(query, page = 1) {
    try {
      // Using DuckDuckGo as it's more permissive than Google for scraping
      const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${(page - 1) * 10}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });

      return this.parseSearchResults(response.data, query, page);
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

  parseSearchResults(html, query, page) {
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

  // Alternative search using Bing (requires API key)
  async searchBing(query, page = 1) {
    if (!process.env.BING_API_KEY) {
      throw new Error('Bing API key not configured');
    }

    try {
      const offset = (page - 1) * 10;
      const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY
        },
        params: {
          q: query,
          count: 10,
          offset,
          mkt: 'en-US'
        }
      });

      const data = response.data;
      const results = data.webPages?.value?.map(item => ({
        title: item.name,
        url: item.url,
        snippet: item.snippet,
        source: 'bing'
      })) || [];

      return {
        results,
        query,
        page,
        totalResults: data.webPages?.totalEstimatedMatches || 0,
        hasNextPage: results.length === 10
      };
    } catch (error) {
      console.error('Bing search error:', error.message);
      throw error;
    }
  }
}

const webSearchService = new WebSearchService();

module.exports = {
  searchWeb: (query, page) => webSearchService.searchWeb(query, page),
  searchBing: (query, page) => webSearchService.searchBing(query, page)
};