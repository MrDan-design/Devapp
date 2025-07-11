const cron = require('node-cron');
const db = require('../config/db');

// Schedule the investment processing task to run every day at midnight
cron.schedule('0 1 * * *', async () => {
    console.log('[CRON] Investment processor started:', new Date().toISOString());

    try {
        // 1. Fetch all matured, still active investments
        const [matured] = await db.query(`
            SELECT id, user_id, amount_invested, roi_percent 
            FROM investments WHERE status = 'active' AND end_date <= NOW()`);

        if (!matured.length) {
            console.log('[CRON] No matured investments found.');
            return;
        }

        // 2. process each matured row in one transaction
        for (const inv of matured) {
            const profit = inv.amount_invested * (inv.roi_percent / 100);

            await db.query('UPDATE users SET balance = balance + ? WHERE id=?', [profit, inv.user_id]);
            await db.query(`
                UPDATE investments
                SET status = 'completed', completed_at = NOW()
                WHERE id=?`, [inv.id]);

            console.log(
             `[CRON] Investment #${inv.id} → user #${inv.user_id} credited +$${profit.toFixed(
                2
             )}`
            );
        }

        console.log(`[CRON] ✅ Processed ${matured.length} investment(s).`);
    } catch (err) {
        console.error('[CRON] ❌ Error processing investments:', err);
    }
});