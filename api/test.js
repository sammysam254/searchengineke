export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const testResponse = {
      message: 'Vercel API test successful!',
      timestamp: new Date().toISOString(),
      method: req.method,
      query: req.query,
      platform: 'vercel',
      status: 'working',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    };

    return res.status(200).json(testResponse);
  } catch (error) {
    return res.status(500).json({
      error: 'Test failed',
      details: error.message,
      platform: 'vercel'
    });
  }
}