const express = require('express');
const axios = require('axios');
const db = require('../config/db');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();
const sendMail = require('../config/mailer');

//CoinGecko and Finnhub base URLs
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const FINNHUB_URL = 'https://finnhub.io/api/v1/quote';
const FINNHUB_KEY =process.env.FINNHUB_KEY;

//Swap cryptocurrency route
router.post('/crypto-to-shares', verifyToken, async (req, res) => {
    const { cryptoSymbol, amount, stockSymbol } = req.body;
    const userId = req.user.id;

    try {
        // 1. Get live crypto-to-USD rate
        const cryptoRes = await axios.get(`${COINGECKO_URL}?ids=${cryptoSymbol}&vs_currencies=usd`);
        const cryptoRate = cryptoRes.data[cryptoSymbol].usd;
        const usdValue = amount * cryptoRate;

        // 2. Get live stock price
        const stockRes = await axios.get(`${FINNHUB_URL}?symbol=${stockSymbol}&token=${FINNHUB_KEY}`);
        const stockPrice = stockRes.data.c;

        if (!stockPrice || stockPrice === 0) {
            return res.status(400).json({ message: 'Invalid stock symbol or unavailable price'});
        }

        const sharesToBuy = usdValue / stockPrice;


        // 3. Save transaction to database
        await db.query(
            `INSERT INTO user_shares(user_id, company_symbol, shares_owned, total_invested_usd)
            VALUES (?, ?, ?, ?)`,
            [userId, stockSymbol, sharesToBuy, usdValue]
        );

        // 4. Deduct equivalent USD from user's balance
        await db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [usdValue, userId]);

        res.status(200).json({
            mesaage: 'Swap Successful',
            shares_bought: sharesToBuy.toFixed(4),
            invested_usd: usd.toFixed(2),
            stock: stosckSymbol.toUpperCase(),
        });
    } catch (err) {
        console.error('Swap error:', err);
        res.status(500).json({ message: 'Server error'});
    }
});

// Reverse swap route
router.post('/shares-to-crypto', verifyToken, async (req, res) => {
    const { stockSymbol, sharesToSell, cryptoSymbol} = req.body;
    const userId = req.user.id;

    try {
        // Get live stock price
        const stockRes = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_KEY}`);
        const stockPrice = stockRes.data.c;

        if (!stockPrice || stockPrice === 0) {
      return res.status(400).json({ message: 'Invalid or unavailable stock symbol.' });
    }

    // 2. Get crypto price in USD
    const cryptoRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbol}&vs_currencies=usd`);
    const cryptoRate = cryptoRes.data[cryptoSymbol]?.usd;

    if (!cryptoRate || cryptoRate === 0) {
      return res.status(400).json({ message: 'Invalid or unavailable crypto symbol.' });
    }

    // 3. Check if user owns enough shares
    const [rows] = await db.query(
      "SELECT * FROM user_shares WHERE user_id = ? AND company_symbol = ?",
      [userId, stockSymbol]
    );

    const userShares = rows[0];
    if (!userShares || userShares.shares_owned < sharesToSell) {
      return res.status(400).json({ message: 'Not enough shares to complete this swap.' });
    }

    // 4. Calculate USD value and crypto amount
    const usdValue = sharesToSell * stockPrice;
    const cryptoAmount = usdValue / cryptoRate;

    // 5. Update shares
    const newShareBalance = userShares.shares_owned - sharesToSell;

    if (newShareBalance > 0) {
      await db.query(
        "UPDATE user_shares SET shares_owned = ? WHERE id = ?",
        [newShareBalance, userShares.id]
      );
    } else {
      await db.query("DELETE FROM user_shares WHERE id = ?", [userShares.id]);
    }

    // 6. (Optional) Update user balance or wallet — here we’ll return result only
    res.status(200).json({
      message: 'Swap successful',
      crypto_received: cryptoAmount.toFixed(8),
      usd_value: usdValue.toFixed(2),
      crypto: cryptoSymbol.toUpperCase()
    });
    } catch (err) {
    console.error('Reverse swap error:', err);
    res.status(500).json({ message: 'Server error during swap.' });
  }
});

// Take out shares route
router.post('/take-out-shares', verifyToken, async (req, res) => {
  const { stockSymbol, sharesToTakeOut, cryptoSymbol } = req.body;
  const userId = req.user.id;

  try {
    // Get stock price
    const stockRes = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_KEY}`);
    const stockPrice = stockRes.data.c;

    if (!stockPrice) return res.status(400).json({ message: 'Invalid stock symbol.' });

    // Get crypto price
    const cryptoRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbol}&vs_currencies=usd`);
    const cryptoRate = cryptoRes.data[cryptoSymbol]?.usd;

    if (!cryptoRate) return res.status(400).json({ message: 'Invalid crypto symbol.' });

    // Check user's shares
    const [rows] = await db.query(
      "SELECT * FROM user_shares WHERE user_id = ? AND company_symbol = ?",
      [userId, stockSymbol]
    );

    const userShares = rows[0];
    if (!userShares || userShares.shares_owned < sharesToTakeOut) {
      return res.status(400).json({ message: 'Insufficient shares.' });
    }

    // Calculate values
    const usdValue = sharesToTakeOut * stockPrice;
    const cryptoAmount = usdValue / cryptoRate;

    // Update shares
    const newBalance = userShares.shares_owned - sharesToTakeOut;
    if (newBalance > 0) {
      await db.query("UPDATE user_shares SET shares_owned = ? WHERE id = ?", [newBalance, userShares.id]);
    } else {
      await db.query("DELETE FROM user_shares WHERE id = ?", [userShares.id]);
    }

    // Insert withdrawal request
    await db.query(
      `INSERT INTO withdrawals (user_id, shares_symbol, shares_amount, usd_value, crypto_symbol, crypto_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, stockSymbol, sharesToTakeOut, usdValue, cryptoSymbol, cryptoAmount]
    );

    // Send email notification
    const [userRow] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
    const userEmail = userRow[0].email;

    // Send email notification
    await sendMail(
  userEmail,
  'Withdrawal Request Received',
  `<p>Hi ${userEmail},</p>
   <p>We have received your request to take out <strong>${sharesToTakeOut}</strong> shares of <strong>${stockSymbol}</strong>.</p>
   <p>This will be processed by our admin team shortly.</p>
   <p>Thanks,<br/>TESLA Wallet Team</p>`
);
    res.status(200).json({
      message: 'Take out request successful. Pending approval.',
      crypto_value: cryptoAmount.toFixed(8),
      usd_value: usdValue.toFixed(2),
      status: 'pending'
    });

  } catch (err) {
    console.error('Take out error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;