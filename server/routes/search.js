const express = require('express');
const router = express.Router();
const { searchWeb } = require('../services/webSearch');
const { searchSocialMedia } = require('../services/socialSearch');
const { cacheResult, getCachedResult } = require('../database/cache');

// General web search
router.get('/web', async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Check cache first
    const cacheKey = `web:${query}:${page}`;
    const cached = await getCachedResult(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const results = await searchWeb(query, page);
    
    // Cache results for 1 hour
    await cacheResult(cacheKey, results, 3600);
    
    res.json(results);
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Social media search
router.get('/social', async (req, res) => {
  try {
    const { q: query, platform, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const cacheKey = `social:${platform || 'all'}:${query}:${page}`;
    const cached = await getCachedResult(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const results = await searchSocialMedia(query, platform, page);
    
    // Cache results for 30 minutes
    await cacheResult(cacheKey, results, 1800);
    
    res.json(results);
  } catch (error) {
    console.error('Social search error:', error);
    res.status(500).json({ error: 'Social search failed' });
  }
});

// Combined search
router.get('/all', async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const [webResults, socialResults] = await Promise.allSettled([
      searchWeb(query, page),
      searchSocialMedia(query, null, page)
    ]);

    const results = {
      web: webResults.status === 'fulfilled' ? webResults.value : { results: [], error: webResults.reason?.message },
      social: socialResults.status === 'fulfilled' ? socialResults.value : { results: [], error: socialResults.reason?.message },
      query,
      page: parseInt(page)
    };

    res.json(results);
  } catch (error) {
    console.error('Combined search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;