const express = require('express');
const router = express.Router();
const db = require('../config/db');
const getUploader = require('../middlewares/upload'); // adjust path as needed
const verifyToken = require('../middlewares/authMiddleware'); // Add authentication

const upload = getUploader('paymentProofs'); // uploads/paymentProofs

// POST /api/pending-subscriptions
router.post('/', verifyToken, upload.single('paymentProof'), async (req, res) => {
  try {
    const { plan_id } = req.body;
    const user_id = req.user?.id; // authenticated user
    const payment_proof = req.file?.filename;

    if (!user_id || !plan_id || !payment_proof) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await db.query(
      'INSERT INTO pending_subscriptions (user_id, plan_id, payment_proof) VALUES ($1, $2, $3)',
      [user_id, plan_id, payment_proof]
    );

    res.status(201).json({ message: 'Subscription request submitted successfully' });
  } catch (err) {
    console.error('Error submitting subscription:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
