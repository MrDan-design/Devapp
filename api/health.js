// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with',
  'Access-Control-Allow-Credentials': 'true'
};

export default function handler(req, res) {
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    message: 'DevApp API is running on Vercel!',
    endpoints: [
      'POST /api/users/signup',
      'POST /api/users/login',
      'GET /api/health'
    ]
  });
}
