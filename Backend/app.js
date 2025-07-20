const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('./config/passport');
const path = require('path');
const passport = require('passport');
require('dotenv').config(); // Load environment variables from .env file

const http = require('http'); // <-- New
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app); // <-- Wrap express in http server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // You can specify your frontend origin
    methods: ['GET', 'POST'],
  }
});

// SOCKET.IO HANDLER
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on('chat message', (msg) => {
    console.log('Received message:', msg);
    io.to(msg.chat_id).emit('chat message', msg); // Emit to chat room
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const userRoutes = require('./routes/userRoutes');
const swapRoutes = require('./routes/swapRoutes');
const adminRoutes = require('./routes/adminRoutes');
const depositRoutes = require('./routes/depositRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const investRoutes = require('./routes/investRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const stockRoutes = require('./routes/stockRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const pendingSubscriptionsRoutes = require('./routes/pendingSubscriptionsRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/deposit', depositRoutes);
app.use(passport.initialize());
app.use('/api/auth', require('./routes/oauthRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/invest', investRoutes);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/stocks', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/withdrawals', withdrawalRoutes)
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/pending-subscriptions', pendingSubscriptionsRoutes);
app.use('/api/chat', chatRoutes);

// Simple test route to confirm db connection is working
app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() AS current_time');
        res.send(`Wallet app backend is running! Time: ${rows[0].current_time}`);
    } catch (error) {
        console.error('DB error:', error);
        res.status(500).send('Database connection error');
    }
});

const PORT = 5000;
require('./cron/investmentProcessor');
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});