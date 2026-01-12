const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Multiple search engine implementations
class MultiSearchEngine {
  constructor() {
    this.timeout = 10000;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  // Google Custom Search API
  async searchGoogle(query, page = 1) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      console.log('Google API credentials not configured');
      return { results: [], source: 'google', error: 'API not configured' };
    }

    try {
      const startIndex = (page - 1) * 10 + 1;
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}`;
      
      const response = await axios.get(url, { timeout: this.timeout });
      const data = response.data;
      
      const results = data.items?.map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'google'
      })) || [];

      return {
        results,
        totalResults: parseInt(data.searchInformation?.totalResults || 0),
        source: 'google'
      };
    } catch (error) {
      console.error('Google search error:', error.message);
      return { results: [], source: 'google', error: error.message };
    }
  }

  // Bing Search API
  async searchBing(query, page = 1) {
    const apiKey = process.env.BING_API_KEY;
    
    if (!apiKey) {
      console.log('Bing API key not configured');
      return { results: [], source: 'bing', error: 'API not configured' };
    }

    try {
      const offset = (page - 1) * 10;
      const url = 'https://api.bing.microsoft.com/v7.0/search';
      
      const response = await axios.get(url, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'User-Agent': this.userAgent
        },
        params: {
          q: query,
          count: 10,
          offset,
          mkt: 'en-US',
          safesearch: 'Moderate'
        },
        timeout: this.timeout
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
        totalResults: data.webPages?.totalEstimatedMatches || 0,
        source: 'bing'
      };
    } catch (error) {
      console.error('Bing search error:', error.message);
      return { results: [], source: 'bing', error: error.message };
    }
  }

  // DuckDuckGo Search (scraping fallback)
  async searchDuckDuckGo(query, page = 1) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${(page - 1) * 10}`;
      
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });

      const cheerio = require('cheerio');
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
            source: 'duckduckgo'
          });
        }
      });

      return {
        results,
        source: 'duckduckgo'
      };
    } catch (error) {
      console.error('DuckDuckGo search error:', error.message);
      return { results: [], source: 'duckduckgo', error: error.message };
    }
  }

  // Yahoo Search (via scraping)
  async searchYahoo(query, page = 1) {
    try {
      const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}&b=${(page - 1) * 10 + 1}`;
      
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });

      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      const results = [];

      $('.algo').each((index, element) => {
        const $element = $(element);
        const title = $element.find('h3 a').text().trim();
        const url = $element.find('h3 a').attr('href');
        const snippet = $element.find('.compText').text().trim();
        
        if (title && url) {
          results.push({
            title,
            url,
            snippet,
            source: 'yahoo'
          });
        }
      });

      return {
        results,
        source: 'yahoo'
      };
    } catch (error) {
      console.error('Yahoo search error:', error.message);
      return { results: [], source: 'yahoo', error: error.message };
    }
  }

  // Yandex Search
  async searchYandex(query, page = 1) {
    try {
      const searchUrl = `https://yandex.com/search/?text=${encodeURIComponent(query)}&p=${page - 1}`;
      
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });

      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      const results = [];

      $('.serp-item').each((index, element) => {
        const $element = $(element);
        const title = $element.find('.organic__title-wrapper a').text().trim();
        const url = $element.find('.organic__title-wrapper a').attr('href');
        const snippet = $element.find('.organic__text').text().trim();
        
        if (title && url) {
          results.push({
            title,
            url: url.startsWith('//') ? `https:${url}` : url,
            snippet,
            source: 'yandex'
          });
        }
      });

      return {
        results,
        source: 'yandex'
      };
    } catch (error) {
      console.error('Yandex search error:', error.message);
      return { results: [], source: 'yandex', error: error.message };
    }
  }

  // Aggregate results from multiple search engines
  async searchAll(query, page = 1) {
    console.log(`Multi-search for: ${query}, page: ${page}`);
    
    // Run searches in parallel
    const searchPromises = [
      this.searchGoogle(query, page),
      this.searchBing(query, page),
      this.searchDuckDuckGo(query, page),
      this.searchYahoo(query, page),
      this.searchYandex(query, page)
    ];

    const searchResults = await Promise.allSettled(searchPromises);
    
    // Combine and deduplicate results
    const allResults = [];
    const seenUrls = new Set();
    const sourceStats = {};

    searchResults.forEach((result, index) => {
      const sources = ['google', 'bing', 'duckduckgo', 'yahoo', 'yandex'];
      const sourceName = sources[index];
      
      if (result.status === 'fulfilled' && result.value.results) {
        const sourceResults = result.value.results;
        sourceStats[sourceName] = {
          count: sourceResults.length,
          error: result.value.error || null
        };

        sourceResults.forEach(item => {
          // Deduplicate by URL
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            allResults.push({
              ...item,
              rank: allResults.length + 1
            });
          }
        });
      } else {
        sourceStats[sourceName] = {
          count: 0,
          error: result.reason?.message || 'Search failed'
        };
      }
    });

    // Sort by relevance (prioritize Google and Bing results)
    allResults.sort((a, b) => {
      const sourceOrder = { google: 1, bing: 2, duckduckgo: 3, yahoo: 4, yandex: 5 };
      return sourceOrder[a.source] - sourceOrder[b.source];
    });

    return {
      results: allResults.slice(0, 20), // Limit to top 20 results
      query,
      page,
      totalResults: allResults.length,
      sourceStats,
      searchEngines: Object.keys(sourceStats)
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
    const { q: query, page = 1, engine = 'all' } = event.queryStringParameters || {};
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    const searchEngine = new MultiSearchEngine();
    let results;

    // Choose specific search engine or search all
    switch (engine) {
      case 'google':
        results = await searchEngine.searchGoogle(query, page);
        break;
      case 'bing':
        results = await searchEngine.searchBing(query, page);
        break;
      case 'duckduckgo':
        results = await searchEngine.searchDuckDuckGo(query, page);
        break;
      case 'yahoo':
        results = await searchEngine.searchYahoo(query, page);
        break;
      case 'yandex':
        results = await searchEngine.searchYandex(query, page);
        break;
      default:
        results = await searchEngine.searchAll(query, page);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results)
    };
  } catch (error) {
    console.error('Multi-search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Multi-search failed',
        details: error.message 
      })
    };
  }
};