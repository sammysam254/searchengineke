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
      // Use simple test function for now due to JSON issues
      if (endpoint === 'search-web') {
        return `/.netlify/functions/search-simple-test?${queryParam}&${pageParam}`;
      }
      return `/.netlify/functions/${endpoint}?${queryParam}&${pageParam}`;
    
    case 'local':
    default:
      return `/api/search/web?${queryParam}&${pageParam}`;
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