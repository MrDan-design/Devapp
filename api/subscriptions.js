// Vercel serverless function for subscription plans
// This provides a backup API endpoint if the main Render backend is unavailable

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Return the same subscription plans that are in the static JSON
    const subscriptionPlans = [
      {
        "id": 1,
        "name": "Megapack Momentum",
        "price": 7155.99,
        "benefits": "No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team",
        "created_at": "2025-08-24T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Xploration Zenith",
        "price": 2820.00,
        "benefits": "No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning",
        "created_at": "2025-08-24T00:00:00.000Z"
      },
      {
        "id": 3,
        "name": "Hyperloop Horizon",
        "price": 1250.00,
        "benefits": "No withdrawal limit, Account on max security, VVIP granted",
        "created_at": "2025-08-24T00:00:00.000Z"
      },
      {
        "id": 4,
        "name": "Falcon Flight",
        "price": 450.00,
        "benefits": "No withdrawal limit, Account on max security, VVIP granted",
        "created_at": "2025-08-24T00:00:00.000Z"
      },
      {
        "id": 5,
        "name": "Boring Blueprint",
        "price": 180.55,
        "benefits": "Withdrawal limit, Account on max security",
        "created_at": "2025-08-24T00:00:00.000Z"
      }
    ];

    // Return the plans with proper headers
    res.status(200).json(subscriptionPlans);
    
  } catch (error) {
    console.error('Error in subscriptions API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch subscription plans'
    });
  }
}
