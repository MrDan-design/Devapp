const express = require('express');
const db = require('../config/db');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/crypto', verifyToken, async (req, res) => {
    const { crypto_type, tx_hash, amount_usd } = req.body;
    const userId = req.user.id;

    if (!crypto_type || !tx_hash || !amount_usd) {
        return res.status(400).json({ message: 'Missing required fields'});
    }

    try {
        await db.query(
            `INSERT INTO deposits (user_id, method, crypto_type, tx_hash, amount_usd, status)
            VALUES (?, 'crypto', ?, ?, ?, 'pending')`
            [userId, crypto_type, tx_hash, amount_usd]
        );

        res.status(200).json({ message: 'Deposit request submitted. Awaiting confirmation'});
    } catch (err) {
        console.error('Deposit error:', err);
        res.status(500).json({ message:'Server error'});
    }
});

router.get('/wallets', async (req, res) => {
  try {
    const [wallets] = await db.query(`SELECT crypto_type, address FROM wallet_addresses`);
    res.status(200).json(wallets);
  } catch (err) {
    console.error('Wallet fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//POST /api/deposit/gift-card
router.post('/gift-card', verifyToken, upload.fields([
  { name: 'card_front_image', maxCount: 1 },
  { name: 'card_back_image', maxCount: 1 }
]), async (req, res) => {
  const { card_country, card_type, card_value } = req.body;
  const userId = req.user.id;

  if (!card_country || !card_type || !card_value) {
    return res.status(400).json({ message: 'Missing card information.'});
  }

  const frontImage = req.files['card_front_image']?.[0]?.filename || null;
  const backImage = req.files['card_back_image']?.[0]?.filename || null;

  try {
    await db.query(
      `INSERT INTO deposits (user_id, method, card_country, card_type, card_value, card_front_image, card_back_image, amount_usd, status)
      VALUES (?, 'gift_card', ?,?,?,?,?,? 'pending')`,
      [userId, card_country, card_type, card_value, frontImage, backImage, card_value]
    );

    res.status(200).json({ message:'Gift card submitted. Awaiting confirmation'});
  } catch (err){
    console.error('Gift card deposit error:', err);
    res.status(500).json({ message: 'Server error'});
  }
})

module.exports = router;