const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const plans = await db.query('SELECT * FROM subscription_plans');
        res.json(plans[0]); // Fix: access the actual rows data
    } catch (err) {
        console.error('Error fetching subscription plans:', err);
        
        // Return mock data when database is not available
        const mockPlans = [
            {
                id: 1,
                name: 'Megapack Momentum',
                price: 7155.99,
                benefits: 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Xploration Zenith',
                price: 2820.00,
                benefits: 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team',
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Hyperloop Horizon',
                price: 1250.00,
                benefits: 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning',
                created_at: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Falcon Flight',
                price: 450.00,
                benefits: 'No withdrawal limit, Account on max security, VVIP granted',
                created_at: new Date().toISOString()
            },
            {
                id: 5,
                name: 'Boring Blueprint',
                price: 180.55,
                benefits: 'Withdrawal limit, Account on max security',
                created_at: new Date().toISOString()
            }
        ];
        
        console.log('📦 Returning mock subscription plans');
        res.json(mockPlans);
    }
});

router.post('/submit', async (req, res) => {
  const { userId, planId, paymentProof } = req.body;

  if (!userId || !planId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.query(
      `INSERT INTO pending_subscriptions (user_id, plan_id, payment_proof, status)
       VALUES ($1, $2, $3, $4)`,
      [userId, planId, paymentProof || null, 'pending']
    );

    res.json({ message: 'Subscription request submitted successfully' });
  } catch (err) {
    console.error('Error submitting subscription request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;