const express = require("express");
const router = express.Router();
const db = require("../config/db");
const axios = require("axios");
const verifyToken = require("../middlewares/authMiddleware");
const sendMail = require("../config/mailer");

router.post('/take-out', verifyToken, async (req, res) => {
  const { amount_usd, crypto_symbol, wallet_address } = req.body;
  const userId = req.user.id;
  const [user] = await db.promise().query(
  'SELECT subscription_plan_id FROM users WHERE id = ?', [userId]
);

if (!user[0].subscription_plan_id) {
  return res.status(403).json({ message: 'Upgrade your account to withdraw funds.' });
}

  if (!amount_usd || !crypto_symbol || !wallet_address) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [userRows] = await db.query('SELECT balance, email FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.balance < amount_usd) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    const cryptoRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto_symbol}&vs_currencies=usd`);
    const rate = cryptoRes.data[crypto_symbol]?.usd;
    if (!rate) return res.status(400).json({ message: 'Invalid crypto symbol.' });

    const crypto_amount = (amount_usd / rate).toFixed(8);

    await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount_usd, userId]);

    await db.query(`
      INSERT INTO withdrawals (user_id, usd_value, crypto_symbol, crypto_amount, wallet_address)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, amount_usd, crypto_symbol, crypto_amount, wallet_address]);

    await sendMail(
      user.email,
      'Withdrawal Request Submitted',
      `<p>Your withdrawal of $${amount_usd} (~${crypto_amount} ${crypto_symbol.toUpperCase()}) is being processed.</p>`
    );

    res.status(200).json({
      message: 'Withdrawal request submitted.',
      crypto_amount
    });

  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;