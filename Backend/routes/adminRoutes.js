const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const sendMail = require('../config/mailer');


const makeURL = (req, filename) =>
  filename ? `${req.protocol}://${req.get('host')}/uploads/giftcards/${filename}` : null;

router.get("/users", async (req, res) => {
  const [users] = await db.query("SELECT id, fullname, email, balance, is_admin, created_at FROM users");
  res.json(users);
});

// Get all pending withdrawal
router.get('/withdrawals/pending', verifyToken, isAdmin, async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT * FROM withdrawals WHERE status = "pending"'
        );
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: 'Server error'});
    }
});

// Approve withdrawal
router.post('/withdrawals/approve/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
    // 1. Get withdrawal + user info
    const [rows] = await db.query(`
      SELECT w.*, u.email 
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      WHERE w.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    const withdrawal = rows[0];

    // 2. Update withdrawal status
    await db.query(
      'UPDATE withdrawals SET status = "approved", approved_at = NOW() WHERE id = ?',
      [id]
    );

    // 3. Send email to user
    await sendMail(
      withdrawal.email,
      'Withdrawal Approved ✅',
      `<p>Hi ${withdrawal.email},</p>
       <p>Your withdrawal request to take out <strong>${withdrawal.shares_amount}</strong> shares of <strong>${withdrawal.shares_symbol}</strong> has been <strong>approved</strong>.</p>
       <p>You will receive <strong>${withdrawal.crypto_amount.toFixed(8)}</strong> ${withdrawal.crypto_symbol.toUpperCase()} in your crypto wallet shortly.</p>
       <p>Thanks,<br/>TESLA Wallet Team</p>`
    );

    res.status(200).json({ message: 'Withdrawal approved and email sent.' });

  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
});

// see all pending deposits
router.get('/deposits/pending', verifyToken, isAdmin, async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM deposits WHERE status="pending"');
  res.json(rows);
});

/* ---  approve a specific deposit  --- */
router.post('/deposits/approve/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  // 1. fetch deposit + user email
  const [depRows] = await db.query(`
      SELECT d.*, u.email, u.fullname
      FROM deposits d
      JOIN   users u ON d.user_id = u.id
      WHERE  d.id = ?`, [id]);

  if (!depRows.length) return res.status(404).json({ message: 'Deposit not found' });
  const dep = depRows[0];
  if (dep.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

  // 2. mark as approved & timestamp
  await db.query(
    'UPDATE deposits SET status="approved", approved_at=NOW() WHERE id=?', [id]
  );

  // 3. credit user USD balance
  await db.query(
    'UPDATE users SET balance = balance + ? WHERE id=?',
    [dep.amount_usd, dep.user_id]
  );

  // 4. send confirmation email
  await send(
    dep.email,
    'Deposit Approved ✅',
    `
     <p>Hi ${dep.fullname || dep.email},</p>
     <p>Your crypto deposit of <strong>$${dep.amount_usd.toFixed(2)}</strong> has been approved and
        is now available in your TESLA wallet.</p>
     <p>Reference TX hash: <code>${dep.tx_hash}</code></p>
     <p>Thanks for using TESLA!</p>`
  );

  res.json({ message: 'Deposit approved & balance updated.' });
});

router.get('/dashboard/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [[users]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[deposits]] = await db.query('SELECT COUNT(*) AS pendingDeposits FROM deposits WHERE status = "pending"');
    const [[cards]] = await db.query('SELECT COUNT(*) AS pendingCards FROM gift_cards WHERE status = "pending"');
    const [[withdrawals]] = await db.query('SELECT COUNT(*) AS pendingWithdrawals FROM withdrawals WHERE status = "pending"');

    res.json({
      totalUsers: users.totalUsers,
      pendingDeposits: deposits.pendingDeposits,
      pendingCards: cards.pendingCards,
      pendingWithdrawals: withdrawals.pendingWithdrawals
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

router.get('/deposits/gift-cards', verifyToken, isAdmin, async (_req, res) => {
  try {
    // Grab pending gift‑card deposits plus user email/ name
    const [rows] = await db.query(`
      SELECT d.id, d.card_country, d.card_type, d.card_value,
             d.card_front_image, d.card_back_image,
             d.created_at, u.email, u.fullname
      FROM   deposits d
      JOIN   users u ON d.user_id = u.id
      WHERE  d.method = 'gift_card' AND d.status = 'pending'
      ORDER  BY d.created_at DESC
    `);

    // Attach full image URLs
    const data = rows.map(r => ({
      ...r,
      front_url: makeURL(req, r.card_front_image),
      back_url:  makeURL(req, r.card_back_image)
    }));

    res.json(data);           // frontend / Postman will show an array of objects
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------- REJECT a pending deposit ---------- */
router.post('/deposits/reject/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;          // optional string

  try {
    // fetch deposit + user
    const [rows] = await db.query(`
      SELECT d.*, u.email, u.fullname
      FROM   deposits d 
      JOIN   users u ON d.user_id = u.id
      WHERE  d.id = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Deposit not found' });
    }
    const dep = rows[0];

    if (dep.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    // update status → rejected (+ reason if supplied)
    await db.query(
      'UPDATE deposits SET status="rejected", rejection_reason=? WHERE id=?',
      [reason || null, id]
    );

    // notify the user
    await sendMail(
      dep.email,
      'Deposit Rejected ❌',
      `
      <p>Hi ${dep.fullname || dep.email},</p>
      <p>Unfortunately, your gift‑card/crypto deposit dated <strong>${new Date(
        dep.created_at
      ).toLocaleDateString()}</strong> has been <strong>rejected</strong>.</p>
      ${
        reason
          ? `<p><b>Reason:</b> ${reason}</p>`
          : ''
      }
      <p>Please contact support if you need more information.</p>
      <p>– TESLA Wallet Team</p>`
    );

    res.json({ message: 'Deposit rejected and user notified.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all investments
router.get("/investments", verifyToken, isAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM investments ORDER BY duration DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching investments:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Approve an investment
router.post('/admin/process-investments', verifyToken, isAdmin, async (_req, res) => {
  const [matured] = await db.query (`
    SELECT * FROM investments
    WHERE status='active' AND end_date <= NOW()`);

    for (const inv of matured) {
      const profit = inv.amount_invested * (inv.roi_percent / 100);
      await db.query('UPDATE users SET balance = balance + ? WHERE id =?', [profit, inv.user_id]);
      await db.query('UPDATE investments SET status ="completed" WHERE id=?',
        [inv.id]
      );
    }
    res.json({ processed: matured.length});
})

router.get("/all-transactions", verifyToken, isAdmin, async (req, res) => {
  try {
    const [giftcards] = await db.query(
      `SELECT id, user_id, 'Gift Card' AS type, card_value AS amount, status, created_at FROM deposits`
    );

    const [deposits] = await db.query(
      `SELECT id, user_id, 'Deposit' AS type, amount_usd, status, created_at FROM deposits`
    );

    const [investments] = await db.query(
      `SELECT id, user_id, 'Investment' AS type, amount_invested AS amount, status, start_date AS created_at FROM investments`
    );

    const [withdrawals] = await db.query(
      `SELECT id, user_id, 'Withdrawal' AS type, usd_value, status, created_at FROM withdrawals`
    );

    const allTransactions = [
      ...giftcards,
      ...deposits,
      ...investments,
      ...withdrawals
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(allTransactions);
  } catch (err) {
    console.error("Fetch all transactions error:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

module.exports = router;