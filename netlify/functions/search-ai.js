const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const GOOGLE_API_KEY = 'AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM';
const SEARCH_ENGINE_ID = '9665ae5d79a464466';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`;

// Get search results from Google
async function searchGoogleDirect(query, page = 1) {
  try {
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&start=${startIndex}`;
    
    console.log(`Google search for Gemini AI: ${query}`);
    
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

// Use Gemini AI to analyze search results
async function analyzeWithGemini(query, searchResults) {
  try {
    if (!searchResults || searchResults.length === 0) {
      throw new Error('No search results to analyze');
    }

    // Prepare simplified context from search results
    const context = searchResults.slice(0, 5).map((result, index) => 
      `${index + 1}. ${result.title}\n${result.snippet}`
    ).join('\n\n');

    // Simplified prompt for Gemini
    const prompt = `Based on these search results about "${query}":

${context}

Provide a helpful answer in this exact JSON format:
{
  "answer": "A clear 2-3 sentence answer based on the search results",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "relatedTopics": ["topic 1", "topic 2", "topic 3", "topic 4"],
  "followUpQuestions": ["question 1?", "question 2?", "question 3?"]
}`;

    console.log('Calling Gemini AI...');
    
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      },
      {
        timeout: 20000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const geminiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!geminiText) {
      throw new Error('No response from Gemini AI');
    }

    console.log('Gemini AI response received');

    // Parse JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.log('JSON parse failed, using text response');
      // Fallback: use the text as answer
      parsedResponse = {
        answer: geminiText.substring(0, 500),
        keyPoints: extractPointsFromText(geminiText),
        relatedTopics: generateSimpleTopics(query),
        followUpQuestions: generateSimpleQuestions(query)
      };
    }

    return {
      answer: parsedResponse.answer || 'Unable to generate answer',
      keyPoints: parsedResponse.keyPoints || [],
      relatedTopics: parsedResponse.relatedTopics || [],
      followUpQuestions: parsedResponse.followUpQuestions || [],
      confidence: 90,
      sources: searchResults.slice(0, 5).map(r => ({
        title: r.title,
        url: r.url,
        domain: r.displayLink
      })),
      searchResultsCount: searchResults.length,
      aiModel: 'Gemini Pro'
    };

  } catch (error) {
    console.error('Gemini AI error:', error.response?.data || error.message);
    throw error;
  }
}

// Helper functions
function extractPointsFromText(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 4).map(s => s.trim());
}

function generateSimpleTopics(query) {
  return [
    `${query} explained`,
    `${query} guide`,
    `${query} tutorial`,
    `Latest ${query} news`
  ];
}

function generateSimpleQuestions(query) {
  return [
    `What is ${query}?`,
    `How does ${query} work?`,
    `Where to learn ${query}?`
  ];
}

// Generate fallback response when search or AI fails
function generateFallbackResponse(query, searchResults = []) {
  const hasResults = searchResults && searchResults.length > 0;
  
  return {
    answer: hasResults 
      ? `I found ${searchResults.length} search results for "${query}". While I couldn't analyze them with AI, you can check the sources below for information.`
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
    aiModel: 'Fallback Mode'
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

    console.log(`AI search for: ${query}`);

    // Step 1: Get search results
    let searchResults = [];
    try {
      searchResults = await searchGoogleDirect(query, page);
      console.log(`Found ${searchResults.length} search results`);
    } catch (searchError) {
      console.error('Search failed:', searchError.message);
    }

    // If no search results, return fallback immediately
    if (!searchResults || searchResults.length === 0) {
      const fallback = generateFallbackResponse(query, []);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          query,
          page: parseInt(page),
          aiAnswer: fallback.answer,
          keyPoints: fallback.keyPoints,
          relatedTopics: fallback.relatedTopics,
          followUpQuestions: fallback.followUpQuestions,
          sources: fallback.sources,
          confidence: fallback.confidence,
          aiModel: fallback.aiModel,
          searchResultsAnalyzed: 0,
          timestamp: new Date().toISOString(),
          platform: 'netlify',
          mode: 'ai'
        })
      };
    }

    // Step 2: Try to analyze with Gemini AI
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeWithGemini(query, searchResults);
      console.log('Gemini AI analysis successful');
    } catch (geminiError) {
      console.error('Gemini AI failed:', geminiError.message);
      
      // Use fallback with search results
      const fallback = generateFallbackResponse(query, searchResults);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          query,
          page: parseInt(page),
          aiAnswer: fallback.answer,
          keyPoints: fallback.keyPoints,
          relatedTopics: fallback.relatedTopics,
          followUpQuestions: fallback.followUpQuestions,
          sources: fallback.sources,
          confidence: fallback.confidence,
          aiModel: fallback.aiModel,
          searchResultsAnalyzed: searchResults.length,
          timestamp: new Date().toISOString(),
          platform: 'netlify',
          mode: 'ai',
          note: 'Using fallback due to AI error'
        })
      };
    }

    // Step 3: Return successful AI response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
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
        platform: 'netlify',
        mode: 'ai',
        note: `Powered by ${aiAnalysis.aiModel}`
      })
    };

  } catch (error) {
    console.error('AI search error:', error);
    
    return {
      statusCode: 200, // Return 200 to avoid breaking the UI
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
        aiModel: 'Error Mode',
        platform: 'netlify',
        mode: 'ai',
        error: error.message
      })
    };
  }
};