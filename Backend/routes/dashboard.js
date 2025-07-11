const express = require('express');
const db = require('../config/db');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');

//Get recent transactions for current user
router.get('/transactions/recent', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        //fetch latest 10 transactions
        const [crypto] = await db.query(
            `SELECT 'Cryto Deposit' AS type, amount_usd AS amount, status, created_at
            FROM deposits WHERE user_id = ? AND method = 'crypto' ORDER BY created_at DESC LIMIT 5`, [userId]
        );
        const [giftcards] = await db.query(
            `SELECT 'Gift Card' AS type, card_value AS amount, status, created_at
            FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId]
        );
        const [investments] = await db.query(
            `SELECT 'Share Purchase' AS type, amount_invested AS amount, status, start_date AS created_at
            FROM investments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId]);

        const [withdrawals] = await db.query(
            `SELECT 'Withdrawal' AS type, usd_value AS amount, status, created_at
            FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId]);

        /*const [swaps] = await db.query(
            `SELECT 'Swap' AS type, amount, status, created_at
            FROM swaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId]);*/

        // Combine all results and sort by created_at
        const all = [...crypto, ...giftcards, ...investments, ...withdrawals];
        const sorted = all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Limit to 10 most recent transactions
        res.json(sorted.slice(0,10));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load transactions.'});
    }
});

module.exports = router;