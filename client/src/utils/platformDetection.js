// Platform detection utility for INFINITUM Search Engine

export const detectPlatform = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return 'local';
  }
  
  if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
    return 'vercel';
  }
  
  if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
    return 'netlify';
  }
  
  // Default to vercel for custom domains
  return 'vercel';
};

export const getApiEndpoint = (endpoint, query, page = 1) => {
  const platform = detectPlatform();
  const encodedQuery = encodeURIComponent(query);
  const pageParam = `page=${page}`;
  const queryParam = `q=${encodedQuery}`;
  
  switch (platform) {
    case 'vercel':
      return `/api/${endpoint}?${queryParam}&${pageParam}`;
    
    case 'netlify':
      // Use the working search-web function instead of test function
      if (endpoint === 'search-web') {
        return `/.netlify/functions/search-web?${queryParam}&${pageParam}`;
      }
      return `/.netlify/functions/${endpoint}?${queryParam}&${pageParam}`;
    
    case 'local':
    default:
      return `/api/search/web?${queryParam}&${pageParam}`;
  }
};

// Get fallback endpoints to try if primary fails
export const getFallbackEndpoints = (endpoint, query, page = 1) => {
  const platform = detectPlatform();
  const encodedQuery = encodeURIComponent(query);
  const pageParam = `page=${page}`;
  const queryParam = `q=${encodedQuery}`;
  
  if (platform === 'netlify') {
    // Try multiple Netlify functions in order of preference
    return [
      `/.netlify/functions/search-web?${queryParam}&${pageParam}`,
      `/.netlify/functions/search-web-native?${queryParam}&${pageParam}`,
      `/.netlify/functions/search-simple-test?${queryParam}&${pageParam}`,
      `/.netlify/functions/test-search?${queryParam}&${pageParam}`
    ];
  }
  
  return []; // No fallbacks for other platforms
};

// Test if Netlify functions are deployed
export const testNetlifyFunctions = async () => {
  try {
    const response = await fetch('/.netlify/functions/health-check');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Netlify health check failed:', error);
    return null;
  }
};

export const getPlatformInfo = () => {
  const platform = detectPlatform();
  
  const platformInfo = {
    local: {
      name: 'Local Development',
      color: '#10b981',
      icon: '💻'
    },
    vercel: {
      name: 'Vercel',
      color: '#000000',
      icon: '▲'
    },
    netlify: {
      name: 'Netlify',
      color: '#00c7b7',
      icon: '🌐'
    }
  };
  
  return {
    platform,
    ...platformInfo[platform]
  };
};