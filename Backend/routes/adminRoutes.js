const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const sendMail = require('../config/mailer');


const makeURL = (req, filename) =>
  filename ? `${req.protocol}://${req.get('host')}/uploads/giftcards/${filename}` : null;

router.get("/users", async (req, res) => {
  const usersResult = await db.query("SELECT id, fullname, email, balance, is_admin, created_at FROM users");
  res.json(usersResult.rows);
});

// Get all pending withdrawal
router.get('/withdrawals/pending', verifyToken, isAdmin, async (req, res) => {
    try {
        const results = await db.query(
            'SELECT * FROM withdrawals WHERE status = $1', ['pending']
        );
        res.status(200).json(results.rows);
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
  const rows = await db.query('SELECT * FROM deposits WHERE status=$1', ['pending']);
  res.json(rows.rows);
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

  // 2. mark as approved
  await db.query(
    'UPDATE deposits SET status="approved", approved_at=NOW() WHERE id=?', [id]
  );

  // 3. Credit user balance
await db.query(
  'UPDATE users SET balance = balance + ? WHERE id = ?',
  [dep.amount_usd, dep.user_id]
);

// 4. Send confirmation email
await send(
  dep.email,
  'Deposit Approved ✅',
  `<p>Hi ${dep.fullname || dep.email},</p>
   <p>Your crypto deposit of <strong>$${dep.amount_usd.toFixed(2)}</strong> has been approved and credited to your balance.</p>
   <p>You can now invest or perform other operations using this amount.</p>
   <p>Reference TX hash: <code>${dep.tx_hash}</code></p>
   <p>Thanks for using TESLA!</p>`
);

res.json({ message: 'Deposit approved and balance credited.' });
});

router.get('/dashboard/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const usersResult = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const depositsResult = await db.query('SELECT COUNT(*) AS pendingDeposits FROM deposits WHERE method = $1 AND status = $2', ['crypto', 'pending']);
    const cardsResult = await db.query('SELECT COUNT(*) AS pendingCards FROM deposits WHERE method = $1 AND status = $2', ['gift_card', 'pending']);
    const withdrawalsResult = await db.query('SELECT COUNT(*) AS pendingWithdrawals FROM withdrawals WHERE status = $1', ['pending']);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].totalusers),
      pendingDeposits: parseInt(depositsResult.rows[0].pendingdeposits),
      pendingCards: parseInt(cardsResult.rows[0].pendingcards),
      pendingWithdrawals: parseInt(withdrawalsResult.rows[0].pendingwithdrawals)
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
router.post('/gift-cards/approve/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  // 1. Get gift card and user
  const [cardRows] = await db.query(`
    SELECT g.*, u.email, u.fullname
    FROM gift_cards g
    JOIN users u ON g.user_id = u.id
    WHERE g.id = ?
  `, [id]);

  if (!cardRows.length) return res.status(404).json({ message: 'Gift card not found' });

  const card = cardRows[0];
  if (card.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

  // 2. Mark as approved
  await db.query("UPDATE gift_cards SET status = 'approved', approved_at = NOW() WHERE id = ?", [id]);

  // 3. Credit user balance
await db.query(
  'UPDATE users SET balance = balance + ? WHERE id = ?',
  [card.amount, card.user_id]
);

// 4. Send confirmation email
await send(
  card.email,
  'Gift Card Approved ✅',
  `<p>Hi ${card.fullname || card.email},</p>
   <p>Your gift card worth <strong>$${card.amount.toFixed(2)}</strong> has been approved and credited to your wallet balance.</p>
   <p>You can now invest or perform other actions using the funds.</p>
   <p>Thanks for using TESLA!</p>`
);

res.json({ message: 'Gift card approved and balance credited.' });
});

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
      "SELECT id, user_id, 'Gift Card' AS type, card_value AS amount, status, created_at FROM deposits"
    );

    const [deposits] = await db.query(
      "SELECT id, user_id, 'Deposit' AS type, amount_usd, status, created_at FROM deposits"
    );

    const [investments] = await db.query(
      "SELECT id, user_id, 'Investment' AS type, amount_invested AS amount, status, start_date AS created_at FROM investments"
    );

    const [withdrawals] = await db.query(
      "SELECT id, user_id, 'Withdrawal' AS type, usd_value, status, created_at FROM withdrawals"
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

router.get('/subscriptions/pending', verifyToken, isAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ps.id, ps.status, ps.payment_proof, ps.created_at,
             u.id AS user_id, u.fullname, u.email,
             sp.name AS plan_name, sp.price
      FROM pending_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      JOIN subscription_plans sp ON ps.plan_id = sp.id
      WHERE ps.status = 'pending'
      ORDER BY ps.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/subscriptions/approve/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [[subscription]] = await db.query(
      'SELECT * FROM pending_subscriptions WHERE id = ?',
      [id]
    );

    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    if (subscription.status !== 'pending')
      return res.status(400).json({ message: 'Already processed' });

    await db.query('UPDATE pending_subscriptions SET status = "approved", updated_at = NOW() WHERE id = ?', [id]);

    // Optional: Update user plan
    await db.query('UPDATE users SET plan = ? WHERE id = ?', [subscription.plan_id, subscription.user_id]);

    res.json({ message: 'Subscription approved.' });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
});

router.post('/subscriptions/reject/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const [[subscription]] = await db.query(
      'SELECT ps.*, u.email FROM pending_subscriptions ps JOIN users u ON ps.user_id = u.id WHERE ps.id = ?',
      [id]
    );

    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    await db.query(
      'UPDATE pending_subscriptions SET status = "rejected", updated_at = NOW() WHERE id = ?',
      [id]
    );

    // Optional: Email user
    await sendMail(
      subscription.email,
      'Subscription Rejected ❌',
      `<p>Hello, your subscription request has been <strong>rejected</strong>.</p>${
        reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''
      }<p>Contact support for assistance.</p>`
    );

    res.json({ message: 'Subscription rejected and user notified.' });
  } catch (err) {
    console.error('Rejection error:', err);
    res.status(500).json({ message: 'Rejection failed' });
  }
});


module.exports = router;