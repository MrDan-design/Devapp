const db = require('../config/db');

// Create or get existing chat
const createChat = async (userId) => {
  const [existing] = await db.query('SELECT * FROM chats WHERE user_id = ?', [userId]);
  if (existing.length > 0) return existing[0];

  const [result] = await db.query('INSERT INTO chats (user_id) VALUES (?)', [userId]);
  return { id: result.insertId, user_id: userId };
};

// Store a message
const storeMessage = async ({ chat_id, sender, message }) => {
  await db.query(
    'INSERT INTO messages (chat_id, sender, message) VALUES (?, ?, ?)',
    [chat_id, sender, message]
  );
};

module.exports = { createChat, storeMessage };
