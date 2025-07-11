const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middlewares/authMiddleware');
const { parse } = require('dotenv');


router.get('/history', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = (req.query.type || 'all').toLowerCase();

    //Map of SQL snippets per type
    const sources = {
        deposit: `
      SELECT id, 'Crypto Deposit' AS label, amount_usd AS amount, status, created_at
      FROM   deposits
      WHERE  user_id = ? AND method = 'crypto'
    `,
    gift_card: `
      SELECT id, 'Gift Card' AS label, card_value AS amount, status, created_at
      FROM   deposits
      WHERE  user_id = ? AND method = 'gift_card'
    `,
    investment: `
      SELECT id, 'Share Purchase' AS label, amount_invested AS amount, status, start_date AS created_at
      FROM   investments
      WHERE  user_id = ?
    `,
    withdrawal: `
      SELECT id, 'Withdrawal' AS label, usd_value AS amount, status, created_at
      FROM   withdrawals
      WHERE  user_id = ?
    `
    };

    // Build the UNION ALL query
  let unionSql = '';
  if (type === 'all') {
    unionSql = Object.values(sources).join(' UNION ALL ');
  } else {
    if (!sources[type])
      return res.status(400).json({ message: 'Invalid type filter.' });
    unionSql = sources[type];
  }

  // Apply ordering + pagination
  const finalSql = `
    ${unionSql}
    ORDER BY created_at DESC
    LIMIT  ? OFFSET ?
  `;

  try {
    // Build params: userId will be repeated for each UNION
    const repeatCount = (type === 'all') ? 4 : 1;
    const params      = Array(repeatCount).fill(userId).concat([limit, offset]);

    const [rows] = await db.query(finalSql, params);
    res.json({ page, limit, results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load history' });
  }
});

module.exports = router;