const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const plans = await db.query('SELECT * FROM subscription_plans');
        res.json(plans.rows);
    } catch (err) {
        console.error('Error fetching subscription plan:', err)
        res.status(500).json({ message: 'Server error'})
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