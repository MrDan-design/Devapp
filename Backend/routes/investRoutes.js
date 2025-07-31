const express = require('express');
const db = require('../config/db');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');


router.post('/', verifyToken, async (req, res)=> {
    const userId = req.user.id;
    const { category_id, amount, duration } =req.body;

    if (!category_id || !amount || !duration) {
        return res.status(400).json({ message: 'cateory_id, amount, duration required'});
    }

    // 1 Fetch category info
    const [catRows] = await db.query(
        'SELECT * FROM investment_categories WHERE id = ?',
        [category_id]
    );

    if (!catRows.length) return res.status(400).json({ message: 'Invalid category.'});
    const cat = catRows[0];

    if (amount < cat.min_amount) {
        return res.status(400).json({ message: `Minimum for this category is $${cat.min_amount}.`});
    }

    //2. Calculate shares (proportional to min rule)
    const shares = (amount / cat.min_amount) * cat.min_shares;

    const roiPercent = cat[`roi_${duration}`];
    //3 Check balance
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const balanceUSD = userRows[0].balance;
    if (balanceUSD < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance.'});
    }

    //4 compute end date
    const durationMap = {
        '5days': 5,
        '1month': 30,
        '3months': 90,
        'annual': 365
    };
    const days = durationMap[duration];
    if(!days) return res.status(400).json({ message: 'Inavalid Duration.'});


    //5 Transaction: debit + insert investment
    const conn = await db.rawConnection.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            'UPDATE users SET balance = balance - ? WHERE id = ?',
            [amount, userId]
        );

        await conn.query(
            `INSERT INTO investments
            (user_id, category_id, amount_invested, shares_given, duration, roi_percent, end_date)
            VALUES (?,?,?,?,?,?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
            [userId, category_id, amount, shares, duration, roiPercent, days]
        );

        await conn.commit();
        res.json({
            message: 'Investment successful',
            amount_invested:amount,
            shares_given: shares.toFixed(4),
            balance_left: (balanceUSD - amount).toFixed(2)
        });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error'});
    } finally {
        conn.release();
    }
});

router.get('/categories', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM investment_categories ORDER BY min_amount ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/chart-data', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT DATE(start_date) AS date, SUM(amount_invested) AS total
      FROM investments
      WHERE user_id = ? AND status IN ('active', 'completed')
      GROUP BY DATE(start_date)
      ORDER BY date ASC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('Chart data error:', err);
    res.status(500).json({ message: 'Failed to fetch chart data' });
  }
});

module.exports = router;
