// AI function that uses Gemini AI to analyze real search results
const axios = require('axios');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const GOOGLE_API_KEY = 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Get search results from Google
async function searchGoogleDirect(query, page = 1) {
  const searchEngineId = '9665ae5d79a464466';
  
  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Vercel Google search for Gemini AI: ${query}, page: ${page}`);
    
    const response = await axios.get(url, { 
      timeout: 15000,
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
      source: 'google',
      displayLink: item.displayLink
    })) || [];

    return {
      results,
      query,
      page: parseInt(page),
      totalResults: parseInt(data.searchInformation?.totalResults || 0),
      hasNextPage: results.length === 10
    };
  } catch (error) {
    console.error('Vercel Google search error:', error.message);
    throw error;
  }
}

// Use Gemini AI to analyze search results
async function analyzeWithGemini(query, searchResults) {
  try {
    // Prepare context from search results
    const searchContext = searchResults.map((result, index) => 
      `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.displayLink}`
    ).join('\n\n');

    // Create prompt for Gemini
    const prompt = `You are INFINITUM AI, an intelligent search assistant. A user searched for: "${query}"

Here are the top search results from the web:

${searchContext}

Based on these search results, provide a comprehensive, helpful answer that:
1. Directly answers the user's query
2. Synthesizes information from multiple sources
3. Is accurate and based on the provided search results
4. Is clear and easy to understand
5. Highlights the most important information

Also provide:
- 4-6 key points (bullet points)
- 4-6 related topics the user might want to explore
- 3-4 follow-up questions

Format your response as JSON with this structure:
{
  "answer": "Your comprehensive answer here",
  "keyPoints": ["point 1", "point 2", ...],
  "relatedTopics": ["topic 1", "topic 2", ...],
  "followUpQuestions": ["question 1", "question 2", ...]
}`;

    console.log('Calling Gemini AI from Vercel...');
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const geminiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!geminiResponse) {
      throw new Error('No response from Gemini AI');
    }

    console.log('Gemini AI response received on Vercel');

    // Parse JSON response from Gemini
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = geminiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       geminiResponse.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, geminiResponse];
      
      parsedResponse = JSON.parse(jsonMatch[1] || geminiResponse);
    } catch (parseError) {
      console.log('Failed to parse Gemini response as JSON, using fallback');
      // Fallback if JSON parsing fails
      parsedResponse = {
        answer: geminiResponse,
        keyPoints: extractKeyPointsFromText(geminiResponse),
        relatedTopics: generateRelatedTopics(query),
        followUpQuestions: generateFollowUpQuestions(query)
      };
    }

    return {
      answer: parsedResponse.answer || geminiResponse,
      keyPoints: parsedResponse.keyPoints || [],
      relatedTopics: parsedResponse.relatedTopics || [],
      followUpQuestions: parsedResponse.followUpQuestions || [],
      confidence: 90, // Gemini AI provides high confidence
      sources: searchResults.slice(0, 5).map(r => ({
        title: r.title,
        url: r.url,
        domain: r.displayLink
      })),
      searchResultsCount: searchResults.length,
      aiModel: 'Gemini Pro'
    };

  } catch (error) {
    console.error('Gemini AI error:', error.message);
    throw error;
  }
}

// Fallback functions
function extractKeyPointsFromText(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 5).map(s => s.trim());
}

function generateRelatedTopics(query) {
  return [
    `${query} explained`,
    `${query} guide`,
    `${query} examples`,
    `Latest ${query} trends`,
    `${query} best practices`,
    `${query} tutorial`
  ];
}

function generateFollowUpQuestions(query) {
  return [
    `What are the benefits of ${query}?`,
    `How does ${query} work?`,
    `What are the latest developments in ${query}?`,
    `Where can I learn more about ${query}?`
  ];
}

function generateFallbackResponse(query) {
  return {
    answer: `I searched for "${query}" but couldn't find sufficient search results to provide a comprehensive answer. This might be due to the query being very specific, new, or having limited online information. Please try rephrasing your question or searching for related terms.`,
    keyPoints: [
      'No comprehensive search results found for this query',
      'Try using different keywords or phrases',
      'Consider searching for related or broader topics',
      'Check spelling and try alternative terms'
    ],
    confidence: 30,
    relatedTopics: [
      `${query} alternatives`,
      `${query} related topics`,
      `${query} basics`
    ],
    followUpQuestions: [
      `What is ${query}?`,
      `How does ${query} work?`,
      `Where can I learn about ${query}?`
    ],
    sources: [],
    aiModel: 'Gemini Pro (Fallback)'
  };
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q: query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Vercel Gemini AI search for: ${query}`);

    // First, get search results from Google
    let searchData;
    try {
      searchData = await searchGoogleDirect(query, page);
    } catch (searchError) {
      console.log('Google search failed, using fallback:', searchError.message);
      
      const fallbackResponse = generateFallbackResponse(query);
      
      const result = {
        query,
        page: parseInt(page),
        aiAnswer: fallbackResponse.answer,
        keyPoints: fallbackResponse.keyPoints,
        relatedTopics: fallbackResponse.relatedTopics,
        followUpQuestions: fallbackResponse.followUpQuestions,
        sources: fallbackResponse.sources,
        confidence: fallbackResponse.confidence,
        aiModel: fallbackResponse.aiModel,
        timestamp: new Date().toISOString(),
        platform: 'vercel',
        mode: 'ai',
        note: 'AI response based on fallback due to search API issues'
      };

      return res.status(200).json(result);
    }

    // If no search results, return fallback
    if (!searchData.results || searchData.results.length === 0) {
      const fallbackResponse = generateFallbackResponse(query);
      
      const result = {
        query,
        page: parseInt(page),
        aiAnswer: fallbackResponse.answer,
        keyPoints: fallbackResponse.keyPoints,
        relatedTopics: fallbackResponse.relatedTopics,
        followUpQuestions: fallbackResponse.followUpQuestions,
        sources: fallbackResponse.sources,
        confidence: fallbackResponse.confidence,
        aiModel: fallbackResponse.aiModel,
        timestamp: new Date().toISOString(),
        platform: 'vercel',
        mode: 'ai',
        note: 'No search results found'
      };

      return res.status(200).json(result);
    }

    // Analyze with Gemini AI
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeWithGemini(query, searchData.results);
    } catch (geminiError) {
      console.error('Gemini AI failed:', geminiError.message);
      
      // Return search results with basic analysis if Gemini fails
      const fallbackResponse = generateFallbackResponse(query);
      fallbackResponse.answer = `I found ${searchData.results.length} search results for "${query}", but I'm having trouble analyzing them with AI right now. Please check the sources below for information.`;
      fallbackResponse.sources = searchData.results.slice(0, 5).map(r => ({
        title: r.title,
        url: r.url,
        domain: r.displayLink
      }));
      fallbackResponse.confidence = 50;
      fallbackResponse.aiModel = 'Gemini Pro (Error)';
      
      const result = {
        query,
        page: parseInt(page),
        aiAnswer: fallbackResponse.answer,
        keyPoints: fallbackResponse.keyPoints,
        relatedTopics: fallbackResponse.relatedTopics,
        followUpQuestions: fallbackResponse.followUpQuestions,
        sources: fallbackResponse.sources,
        confidence: fallbackResponse.confidence,
        aiModel: fallbackResponse.aiModel,
        searchResultsAnalyzed: searchData.results.length,
        timestamp: new Date().toISOString(),
        platform: 'vercel',
        mode: 'ai',
        note: 'Gemini AI error, showing search results'
      };

      return res.status(200).json(result);
    }

    const result = {
      query,
      page: parseInt(page),
      aiAnswer: aiAnalysis.answer,
      keyPoints: aiAnalysis.keyPoints,
      relatedTopics: aiAnalysis.relatedTopics,
      followUpQuestions: aiAnalysis.followUpQuestions,
      sources: aiAnalysis.sources,
      confidence: aiAnalysis.confidence,
      aiModel: aiAnalysis.aiModel,
      searchResultsAnalyzed: aiAnalysis.searchResultsCount,
      timestamp: new Date().toISOString(),
      platform: 'vercel',
      mode: 'ai',
      note: `Powered by ${aiAnalysis.aiModel} analyzing ${aiAnalysis.searchResultsCount} search results`
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Vercel AI search error:', error);
    
    const errorResponse = {
      error: 'AI search failed',
      details: error.message,
      query: req.query?.q || 'unknown',
      aiAnswer: 'I apologize, but I encountered an error while analyzing search results for your question. Please try again or rephrase your question.',
      platform: 'vercel',
      mode: 'ai',
      aiModel: 'Gemini Pro (Error)'
    };
    
    return res.status(500).json(errorResponse);
  }
}