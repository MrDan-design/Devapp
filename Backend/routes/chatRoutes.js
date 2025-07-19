const express = require('express');
const { createChat, storeMessage } = require('../controllers/chatController');
const db = require('../config/db');
const router = express.Router();


router.get('/start/:userId', async (req, res) => {
  const userId = req.params.userId;
  const adminId = 1; // fixed for now

  try {
    const [chat] = await db.query(
      'SELECT * FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [userId, adminId, adminId, userId]
    );

    if (chat.length > 0) {
      res.json({ chat_id: chat[0].id });
    } else {
      const [result] = await db.query(
        'INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)',
        [userId, adminId]
      );
      res.json({ chat_id: result.insertId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/admin/chats', async (req, res) => {
  const [chats] = await db.query(`
    SELECT chats.id AS chat_id, 
       u.name AS user_name, 
       u.id AS user_id
FROM chats
JOIN users u 
  ON (u.id = IF(chats.user1_id = 1, chats.user2_id, chats.user1_id))
ORDER BY chats.updated_at DESC
  `);
  res.json(chats);
});
// Get messages for a specific chat
router.get('/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const [messages] = await db.query('SELECT * FROM messages WHERE chat_id = ?', [chatId]);
  res.json(messages);
});



module.exports = router;
