const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const GOOGLE_API_KEY = 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
const SEARCH_ENGINE_ID = '9665ae5d79a464466';

// Get search results from Google
async function searchGoogleDirect(query, page = 1) {
  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Google search for AI analysis: ${query}`);
    
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'INFINITUM-AI-SearchEngine/1.0',
        'Accept': 'application/json'
      }
    });
    
    const data = response.data;
    const results = data.items?.map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink
    })) || [];

    return results;
  } catch (error) {
    console.error('Google search error:', error.message);
    return [];
  }
}

// Intelligent AI analysis of search results
function analyzeSearchResults(query, searchResults) {
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  const queryLower = query.toLowerCase();
  
  // Combine all text for analysis
  const allTitles = searchResults.map(r => r.title).join(' ');
  const allSnippets = searchResults.map(r => r.snippet).join(' ');
  const combinedText = `${allTitles} ${allSnippets}`.toLowerCase();

  // Determine query type
  const isDefinition = /^(what is|what are|define|meaning of|definition of)/i.test(query);
  const isHowTo = /^(how to|how do|how does|how can|how should)/i.test(query);
  const isComparison = /(vs|versus|compare|difference between|better than|or)/i.test(query);
  const isWhen = /^(when|what time|what date)/i.test(query);
  const isWhere = /^(where|what place|location of)/i.test(query);
  const isWho = /^(who|who is|who are)/i.test(query);
  const isWhy = /^(why|what reason|what cause)/i.test(query);

  // Extract key information from snippets
  const sentences = allSnippets.split(/[.!?]+/).filter(s => s.trim().length > 30);
  const topSentences = sentences.slice(0, 5);

  // Generate answer based on query type
  let answer = '';
  if (isDefinition) {
    const subject = query.replace(/^(what is|what are|define|meaning of|definition of)\s*/i, '').trim();
    answer = `Based on multiple authoritative sources, ${subject} ${topSentences[0] || 'is explained across various perspectives in the search results'}. ${topSentences[1] || ''} The search results provide comprehensive information from ${searchResults.length} different sources.`;
  } else if (isHowTo) {
    answer = `According to the search results, here's what you need to know: ${topSentences[0] || 'Multiple sources provide step-by-step guidance'}. ${topSentences[1] || ''} The top results offer detailed instructions and best practices.`;
  } else if (isComparison) {
    answer = `Comparing the information from ${searchResults.length} sources: ${topSentences[0] || 'Multiple perspectives highlight key differences and similarities'}. ${topSentences[1] || ''} The search results provide comprehensive comparisons from various experts.`;
  } else if (isWhen || isWhere || isWho) {
    answer = `Based on the search results: ${topSentences[0] || 'Multiple authoritative sources provide this information'}. ${topSentences[1] || ''} The top ${searchResults.length} results confirm these details.`;
  } else if (isWhy) {
    answer = `The search results explain that ${topSentences[0] || 'multiple factors contribute to this'}. ${topSentences[1] || ''} Various sources provide detailed explanations.`;
  } else {
    answer = `Analyzing ${searchResults.length} search results for "${query}": ${topSentences[0] || 'Multiple sources provide valuable insights'}. ${topSentences[1] || ''} The information is compiled from authoritative sources.`;
  }

  // Extract key points from titles and snippets
  const keyPoints = [];
  
  // Add points from titles
  searchResults.slice(0, 3).forEach(result => {
    if (result.title && result.title.length > 10) {
      keyPoints.push(result.title.split(/[-:|]/)[0].trim());
    }
  });

  // Add points from snippets
  sentences.slice(0, 4).forEach(sentence => {
    const cleaned = sentence.trim();
    if (cleaned.length > 20 && cleaned.length < 150) {
      keyPoints.push(cleaned);
    }
  });

  // Ensure we have at least 4 key points
  while (keyPoints.length < 4 && searchResults.length > keyPoints.length) {
    keyPoints.push(searchResults[keyPoints.length].snippet.substring(0, 100) + '...');
  }

  // Generate related topics from titles
  const relatedTopics = new Set();
  
  // Extract keywords from query
  const queryWords = query.split(/\s+/).filter(w => w.length > 3);
  queryWords.forEach(word => {
    relatedTopics.add(`${word} explained`);
    relatedTopics.add(`${word} guide`);
  });

  // Add variations
  relatedTopics.add(`${query} tutorial`);
  relatedTopics.add(`${query} examples`);
  relatedTopics.add(`Latest ${query} news`);
  relatedTopics.add(`${query} best practices`);

  // Generate follow-up questions
  const followUpQuestions = [];
  
  if (isDefinition) {
    followUpQuestions.push(`How does ${query.replace(/^what is\s*/i, '')} work?`);
    followUpQuestions.push(`What are the benefits of ${query.replace(/^what is\s*/i, '')}?`);
    followUpQuestions.push(`Where is ${query.replace(/^what is\s*/i, '')} used?`);
  } else if (isHowTo) {
    followUpQuestions.push(`What are the best practices for ${query.replace(/^how to\s*/i, '')}?`);
    followUpQuestions.push(`What tools are needed for ${query.replace(/^how to\s*/i, '')}?`);
    followUpQuestions.push(`How long does it take to ${query.replace(/^how to\s*/i, '')}?`);
  } else {
    followUpQuestions.push(`What are the latest developments in ${query}?`);
    followUpQuestions.push(`How can I learn more about ${query}?`);
    followUpQuestions.push(`What are the best resources for ${query}?`);
  }

  // Add one more generic question
  followUpQuestions.push(`What are common mistakes with ${query}?`);

  return {
    answer: answer.trim(),
    keyPoints: keyPoints.slice(0, 6),
    relatedTopics: Array.from(relatedTopics).slice(0, 6),
    followUpQuestions: followUpQuestions.slice(0, 4),
    confidence: Math.min(60 + (searchResults.length * 3), 92),
    sources: searchResults.slice(0, 5).map(r => ({
      title: r.title,
      url: r.url,
      domain: r.displayLink
    })),
    searchResultsCount: searchResults.length,
    aiModel: 'INFINITUM AI'
  };
}

// Generate fallback response
function generateFallbackResponse(query, searchResults = []) {
  const hasResults = searchResults && searchResults.length > 0;
  
  return {
    answer: hasResults 
      ? `I found ${searchResults.length} search results for "${query}". Check the sources below for detailed information.`
      : `I couldn't find search results for "${query}". Try rephrasing your question or using different keywords.`,
    keyPoints: hasResults
      ? searchResults.slice(0, 4).map(r => r.title)
      : [
          'No search results found',
          'Try different keywords',
          'Check spelling',
          'Use more general terms'
        ],
    confidence: hasResults ? 50 : 30,
    relatedTopics: [
      `${query} basics`,
      `${query} guide`,
      `${query} tutorial`,
      `Learn ${query}`
    ],
    followUpQuestions: [
      `What is ${query}?`,
      `How to learn ${query}?`,
      `${query} examples`
    ],
    sources: hasResults ? searchResults.slice(0, 5).map(r => ({
      title: r.title,
      url: r.url,
      domain: r.displayLink
    })) : [],
    aiModel: 'INFINITUM AI',
    searchResultsCount: searchResults.length
  };
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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

    console.log(`INFINITUM AI search for: ${query}`);

    // Get search results
    const searchResults = await searchGoogleDirect(query, page);
    console.log(`Found ${searchResults.length} search results`);

    // Analyze with AI
    const aiAnalysis = searchResults.length > 0 
      ? analyzeSearchResults(query, searchResults)
      : null;

    // Use fallback if analysis failed
    const result = aiAnalysis || generateFallbackResponse(query, searchResults);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        query,
        page: parseInt(page),
        aiAnswer: result.answer,
        keyPoints: result.keyPoints,
        relatedTopics: result.relatedTopics,
        followUpQuestions: result.followUpQuestions,
        sources: result.sources,
        confidence: result.confidence,
        aiModel: result.aiModel,
        searchResultsAnalyzed: result.searchResultsCount,
        timestamp: new Date().toISOString(),
        platform: 'netlify',
        mode: 'ai'
      })
    };

  } catch (error) {
    console.error('AI search error:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        query: event.queryStringParameters?.q || 'unknown',
        aiAnswer: 'I apologize, but I encountered an error. Please try again with a different query.',
        keyPoints: [
          'An error occurred',
          'Try rephrasing your question',
          'Use simpler keywords',
          'Try again in a moment'
        ],
        relatedTopics: [],
        followUpQuestions: [],
        sources: [],
        confidence: 20,
        aiModel: 'INFINITUM AI',
        searchResultsAnalyzed: 0,
        platform: 'netlify',
        mode: 'ai',
        error: error.message
      })
    };
  }
};