const express = require('express');
const { createChat, storeMessage } = require('../controllers/chatController');
const db = require('../config/db');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/start/:userId', verifyToken, async (req, res) => {
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
    console.error('Chat start error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/chats', verifyToken, async (req, res) => {
  try {
    const [chats] = await db.query(`
      SELECT chats.id AS chat_id, 
         u.fullname AS user_name, 
         u.id AS user_id
  FROM chats
  JOIN users u 
    ON (u.id = IF(chats.user1_id = 1, chats.user2_id, chats.user1_id))
  ORDER BY chats.updated_at DESC
    `);
    res.json(chats);
  } catch (err) {
    console.error('Admin chats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const [messages] = await db.query('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC', [chatId]);
    res.json(messages);
  } catch (err) {
    console.error('Messages fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message (add this endpoint for non-socket messaging)
router.post('/:chatId/messages', verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const [result] = await db.query(
      'INSERT INTO messages (chat_id, sender_id, content) VALUES (?, ?, ?)',
      [chatId, senderId, content.trim()]
    );

    const [message] = await db.query(
      'SELECT * FROM messages WHERE id = ?',
      [result.insertId]
    );

    res.json({ 
      success: true, 
      message: message[0] 
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
