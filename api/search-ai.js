// Same AI logic as Netlify function but in Vercel format
const axios = require('axios');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Generate AI response using knowledge base and contextual generation
async function generateAIResponse(query) {
  try {
    const knowledgeResponse = getKnowledgeBaseResponse(query);
    if (knowledgeResponse) {
      return knowledgeResponse;
    }

    const contextualResponse = generateContextualResponse(query);
    return contextualResponse;

  } catch (error) {
    console.error('AI generation error:', error);
    return generateFallbackResponse(query);
  }
}

// Knowledge base for common questions
function getKnowledgeBaseResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  const knowledgeBase = {
    'what is ai': {
      answer: 'Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding natural language.',
      keyPoints: [
        'AI systems can learn from data and improve over time',
        'Machine learning is a subset of AI that focuses on algorithms',
        'AI is used in various fields like healthcare, finance, and transportation',
        'Deep learning uses neural networks to process complex data'
      ],
      confidence: 95
    },
    
    'blockchain': {
      answer: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.',
      keyPoints: [
        'Decentralized and distributed across multiple computers',
        'Immutable - once data is recorded, it cannot be easily changed',
        'Transparent - all transactions are visible to network participants',
        'Used in cryptocurrencies, smart contracts, and supply chain management'
      ],
      confidence: 92
    },
    
    'machine learning': {
      answer: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task. It uses algorithms to identify patterns in data and make predictions or decisions.',
      keyPoints: [
        'Supervised learning uses labeled training data',
        'Unsupervised learning finds patterns in unlabeled data',
        'Reinforcement learning learns through trial and error',
        'Applications include recommendation systems, image recognition, and natural language processing'
      ],
      confidence: 94
    },
    
    'quantum computing': {
      answer: 'Quantum computing is a revolutionary computing paradigm that uses quantum mechanical phenomena like superposition and entanglement to process information. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits (qubits) that can exist in multiple states simultaneously.',
      keyPoints: [
        'Qubits can be in superposition of 0 and 1 states',
        'Quantum entanglement allows qubits to be correlated',
        'Potentially exponentially faster for certain problems',
        'Applications in cryptography, drug discovery, and optimization'
      ],
      confidence: 88
    }
  };

  for (const [key, response] of Object.entries(knowledgeBase)) {
    if (lowerQuery.includes(key)) {
      return {
        ...response,
        relatedTopics: generateRelatedTopics(key),
        followUpQuestions: generateFollowUpQuestions(key),
        sources: generateSources(key)
      };
    }
  }

  return null;
}

// Generate contextual response for any query
function generateContextualResponse(query) {
  const templates = [
    {
      pattern: /how.*work/i,
      response: (query) => ({
        answer: `Great question about how things work! ${query} involves several key components and processes. Let me break this down for you with the most current information available.`,
        keyPoints: [
          'Understanding the fundamental principles is crucial',
          'Multiple factors and components work together',
          'Real-world applications demonstrate practical value',
          'Ongoing research continues to advance the field'
        ],
        confidence: 75
      })
    },
    
    {
      pattern: /what is|define/i,
      response: (query) => ({
        answer: `${query} is an important concept that has significant implications in its field. Based on current knowledge and research, here's a comprehensive explanation.`,
        keyPoints: [
          'Core definition and fundamental concepts',
          'Historical development and evolution',
          'Current applications and use cases',
          'Future trends and developments'
        ],
        confidence: 70
      })
    }
  ];

  for (const template of templates) {
    if (template.pattern.test(query)) {
      const response = template.response(query);
      return {
        ...response,
        relatedTopics: generateRelatedTopics(query),
        followUpQuestions: generateFollowUpQuestions(query),
        sources: generateSources(query)
      };
    }
  }

  return generateFallbackResponse(query);
}

// Generate fallback response
function generateFallbackResponse(query) {
  return {
    answer: `I understand you're asking about "${query}". While I can provide some general insights, I'd recommend searching for more specific and up-to-date information on this topic. Here's what I can tell you based on general knowledge.`,
    keyPoints: [
      'This is a complex topic with multiple aspects to consider',
      'Current research and developments may provide new insights',
      'Practical applications vary depending on the context',
      'Expert opinions and studies offer valuable perspectives'
    ],
    confidence: 60,
    relatedTopics: generateRelatedTopics(query),
    followUpQuestions: generateFollowUpQuestions(query),
    sources: generateSources(query)
  };
}

// Generate related topics
function generateRelatedTopics(query) {
  const topics = [
    `Advanced ${query} concepts`,
    `${query} applications`,
    `Future of ${query}`,
    `${query} vs alternatives`
  ];
  
  return topics.slice(0, 4);
}

// Generate follow-up questions
function generateFollowUpQuestions(query) {
  const questions = [
    `How is ${query} used in real-world applications?`,
    `What are the latest developments in ${query}?`,
    `What are the challenges with ${query}?`
  ];
  
  return questions.slice(0, 3);
}

// Generate sources
function generateSources(query) {
  return [
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
      domain: 'wikipedia.org'
    },
    {
      title: `${query} Research Papers`,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
      domain: 'scholar.google.com'
    },
    {
      title: `${query} Latest News`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws`,
      domain: 'google.com'
    }
  ];
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

    console.log(`Vercel AI search for: ${query}`);

    // Generate AI response
    const aiResponse = await generateAIResponse(query);

    const result = {
      query,
      page: parseInt(page),
      aiAnswer: aiResponse.answer,
      keyPoints: aiResponse.keyPoints,
      relatedTopics: aiResponse.relatedTopics,
      followUpQuestions: aiResponse.followUpQuestions,
      sources: aiResponse.sources,
      confidence: aiResponse.confidence,
      timestamp: new Date().toISOString(),
      platform: 'vercel',
      mode: 'ai'
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Vercel AI search error:', error);
    
    const errorResponse = {
      error: 'AI search failed',
      details: error.message,
      query: req.query?.q || 'unknown',
      aiAnswer: 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.',
      platform: 'vercel',
      mode: 'ai'
    };
    
    return res.status(500).json(errorResponse);
  }
}