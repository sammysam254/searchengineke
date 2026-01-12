# API Setup Guide

This guide will help you set up API keys for multiple search engines to power your search engine with real results from Google, Bing, and other providers.

## 🔑 API Keys Setup

### 1. Google Custom Search API

**Free Tier**: 100 searches per day  
**Paid**: $5 per 1,000 queries after free tier

#### Steps:
1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create a new project** or select existing one
3. **Enable Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
5. **Create Custom Search Engine**:
   - Go to [programmablesearchengine.google.com](https://programmablesearchengine.google.com)
   - Click "Add" to create new search engine
   - Choose "Search the entire web"
   - Copy your Search Engine ID

#### Environment Variables:
```bash
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 2. Microsoft Bing Search API

**Free Tier**: 1,000 searches per month  
**Paid**: $3 per 1,000 queries after free tier

#### Steps:
1. **Go to Azure Portal**: [portal.azure.com](https://portal.azure.com)
2. **Create Azure account** (free tier available)
3. **Create Bing Search Resource**:
   - Click "Create a resource"
   - Search for "Bing Search"
   - Select "Bing Search v7"
   - Choose pricing tier (F1 for free)
   - Create the resource
4. **Get API Key**:
   - Go to your Bing Search resource
   - Click "Keys and Endpoint"
   - Copy Key 1

#### Environment Variables:
```bash
BING_API_KEY=your_bing_api_key_here
```

### 3. Alternative Search Engines (Optional)

#### DuckDuckGo
- **No API key required** - uses web scraping
- Already implemented as fallback

#### Yahoo Search
- Uses web scraping (no API key needed)
- Less reliable due to anti-bot measures

#### Yandex Search
- Uses web scraping (no API key needed)
- Good for international results

## 🚀 Netlify Environment Variables Setup

### Method 1: Netlify Dashboard
1. Go to your Netlify site dashboard
2. Click "Site settings"
3. Go to "Environment variables"
4. Add each API key:
   - `GOOGLE_API_KEY`
   - `GOOGLE_SEARCH_ENGINE_ID`
   - `BING_API_KEY`

### Method 2: Netlify CLI
```bash
netlify env:set GOOGLE_API_KEY "your_google_api_key"
netlify env:set GOOGLE_SEARCH_ENGINE_ID "your_search_engine_id"
netlify env:set BING_API_KEY "your_bing_api_key"
```

## 🔧 Testing Your Setup

### 1. Without API Keys
- Search engine will work with fallback results
- Shows "test results" to verify functionality

### 2. With Google API Only
- Will use Google Custom Search for primary results
- Falls back to scraping for additional sources

### 3. With Both Google and Bing APIs
- Combines results from both search engines
- Provides comprehensive search coverage
- Best user experience

## 💰 Cost Estimation

### Free Usage (No API Keys)
- **Cost**: $0
- **Features**: Web scraping, social media search
- **Limitations**: May be blocked by some sites

### Basic Setup (Google API Only)
- **Cost**: Free for 100 searches/day, then $5/1000 queries
- **Features**: High-quality Google results + scraping fallbacks
- **Recommended for**: Personal projects, testing

### Premium Setup (Google + Bing APIs)
- **Cost**: ~$8/1000 combined queries
- **Features**: Best search quality, redundancy, comprehensive results
- **Recommended for**: Production applications

## 🛠️ Implementation Details

### Search Priority Order:
1. **Google Custom Search** (if API key available)
2. **Bing Search API** (if API key available)
3. **DuckDuckGo** (web scraping)
4. **Yahoo Search** (web scraping)
5. **Yandex Search** (web scraping)

### Result Aggregation:
- Combines results from all available sources
- Removes duplicates by URL
- Prioritizes API results over scraped results
- Limits to top 20 results for performance

### Error Handling:
- If API quota exceeded, falls back to scraping
- If scraping fails, shows informative error
- Graceful degradation ensures site always works

## 🔍 Search Engine Features

### With API Keys:
- ✅ Real-time search results
- ✅ High accuracy and relevance
- ✅ Fast response times
- ✅ Reliable uptime
- ✅ Rich metadata (snippets, titles, URLs)

### Without API Keys:
- ✅ Basic web scraping results
- ✅ Social media search (Reddit, GitHub)
- ⚠️ May be slower or blocked occasionally
- ⚠️ Limited result quality

## 🚨 Important Notes

1. **API Quotas**: Monitor your usage to avoid unexpected charges
2. **Rate Limits**: APIs have rate limits - implement caching if needed
3. **Terms of Service**: Comply with each search engine's terms
4. **Backup Strategy**: Always have fallback methods
5. **Security**: Never commit API keys to version control

## 🎯 Quick Start

1. **Deploy without API keys** first to test basic functionality
2. **Add Google API key** for immediate improvement
3. **Add Bing API key** for comprehensive coverage
4. **Monitor usage** and adjust as needed

Your search engine will work immediately and improve as you add API keys!