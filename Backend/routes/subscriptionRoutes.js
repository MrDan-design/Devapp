const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
  // Central mock plans used as a safe fallback
  const mockPlans = [
    { id: 1, name: 'Megapack Momentum', price: 7155.99, benefits: 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team', created_at: new Date().toISOString() },
    { id: 2, name: 'Xploration Zenith', price: 2820.00, benefits: 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team', created_at: new Date().toISOString() },
    { id: 3, name: 'Hyperloop Horizon', price: 1250.00, benefits: 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning', created_at: new Date().toISOString() },
    { id: 4, name: 'Falcon Flight', price: 450.00, benefits: 'No withdrawal limit, Account on max security, VVIP granted', created_at: new Date().toISOString() },
    { id: 5, name: 'Boring Blueprint', price: 180.55, benefits: 'Withdrawal limit, Account on max security', created_at: new Date().toISOString() }
  ];

  try {
    const result = await db.query('SELECT * FROM subscription_plans');

    // db.query returns [rows, fields] in mysql2/promise wrapper used here.
    // Our wrapper may return [rows] or a custom shape; normalize defensively.
    let rows = null;
    if (!result) rows = null;
    else if (Array.isArray(result) && Array.isArray(result[0])) rows = result[0];
    else if (Array.isArray(result)) rows = result; // already rows
    else rows = null;

    if (rows && rows.length > 0) {
      console.log(`📦 Returning ${rows.length} subscription plans from DB`);
      return res.status(200).json(rows);
    }

    console.warn('⚠️ Subscription plans table empty or missing, returning mock plans');
    return res.status(200).json(mockPlans);

  } catch (err) {
    console.error('❌ Error fetching subscription plans from DB - returning mock plans:', err?.message || err);
    return res.status(200).json(mockPlans);
  }
});

// Get user's current subscription status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's current subscription plan
    const userResult = await db.query(
      'SELECT subscription_plan_id FROM users WHERE id = ?',
      [userId]
    );
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const subscriptionPlanId = userResult[0].subscription_plan_id;
    
    if (!subscriptionPlanId) {
      return res.json({ 
        hasSubscription: false, 
        currentPlan: null,
        pendingRequests: []
      });
    }
    
    // Get subscription plan details
    const planResult = await db.query(
      'SELECT * FROM subscription_plans WHERE id = ?',
      [subscriptionPlanId]
    );
    
    // Get pending subscription requests
    const pendingResult = await db.query(
      'SELECT * FROM pending_subscriptions WHERE user_id = ? AND status = "pending"',
      [userId]
    );
    
    res.json({
      hasSubscription: true,
      currentPlan: planResult[0] || null,
      pendingRequests: pendingResult || []
    });
    
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit', verifyToken, async (req, res) => {
  const { planId, paymentProof } = req.body;
  const userId = req.user.id;

  if (!planId) {
    return res.status(400).json({ message: 'Plan ID is required' });
  }

  try {
    // Check if user already has a pending request
    const existingRequest = await db.query(
      'SELECT * FROM pending_subscriptions WHERE user_id = ? AND status = "pending"',
      [userId]
    );
    
    if (existingRequest && existingRequest.length > 0) {
      return res.status(400).json({ message: 'You already have a pending subscription request' });
    }
    
    await db.query(
      `INSERT INTO pending_subscriptions (user_id, plan_id, payment_proof, status)
       VALUES (?, ?, ?, ?)`,
      [userId, planId, paymentProof || null, 'pending']
    );

    console.log(`📝 Subscription request submitted - User: ${userId}, Plan: ${planId}`);
    res.json({ message: 'Subscription request submitted successfully' });
  } catch (err) {
    console.error('Error submitting subscription request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;