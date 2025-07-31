const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('./config/passport');
const path = require('path');
const passport = require('passport');
require('dotenv').config(); // Load environment variables from .env file
const { setupDatabase } = require('./config/setupDatabase'); // Add database setup

const http = require('http'); // <-- New
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app); // <-- Wrap express in http server
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://tslaxai.io',
      'https://www.tslaxai.io',
      'http://www.tslaxai.io',
      'https://devapp-bay.vercel.app',
      process.env.FRONTEND_URL
    ],
    methods: ['GET', 'POST'],
    credentials: true
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
const setupRoutes = require('./routes/setupRoutes');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    // Your production domains
    'https://tslaxai.io',
    'https://www.tslaxai.io',
    'http://www.tslaxai.io',
    'http://tslaxai.io',
    // Vercel deployment
    'https://devapp-bay.vercel.app',
    'https://devapp-bay.vercel.app/',
    // Allow Vercel preview deployments
    /https:\/\/devapp-bay-.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
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
app.use('/api/setup', setupRoutes);

// Database setup endpoint (run once to create tables)
app.get('/api/setup-database', async (req, res) => {
    try {
        const result = await setupDatabase();
        res.json(result);
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health check endpoint (without database dependency)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend is running', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        port: process.env.PORT
    });
});

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
    try {
        const [result] = await db.query('SELECT NOW() AS current_time');
        res.json({
            status: 'OK',
            message: 'Database connection successful',
            timestamp: result[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Test signup endpoint (MySQL compatible)
app.post('/api/test-signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    
    if (!fullname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        const bcrypt = require('bcryptjs');
        
        // Check if user exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        await db.query(
            'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
            [fullname, email, hashedPassword]
        );
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Test signup error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Simple test route to confirm db connection is working
app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() AS current_time');
        res.send(`Wallet app backend is running! Time: ${result[0].current_time}`);
    } catch (error) {
        console.error('DB error:', error);
        res.status(500).send('Database connection error');
    }
});

// Quick table setup endpoint (temporary)
app.get('/api/quick-setup-tables', async (req, res) => {
    try {
        console.log('🚀 Creating missing database tables...');

        // Create deposits table
        await db.query(`
            CREATE TABLE IF NOT EXISTS deposits (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                method VARCHAR(20) NOT NULL,
                crypto_type VARCHAR(20),
                amount_usd DECIMAL(10, 2),
                tx_hash TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create withdrawals table
        await db.query(`
            CREATE TABLE IF NOT EXISTS withdrawals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                usd_value DECIMAL(10, 2),
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Tables created successfully!');
        
        // Test the tables
        const depositTest = await db.query('SELECT COUNT(*) as count FROM deposits');
        const withdrawalTest = await db.query('SELECT COUNT(*) as count FROM withdrawals');
        
        res.json({
            success: true,
            message: 'Tables created successfully',
            deposits: depositTest.rows[0].count,
            withdrawals: withdrawalTest.rows[0].count
        });
        
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 4000;

// Test database connection on startup
async function testDatabaseConnection() {
    try {
        const result = await db.query('SELECT NOW() AS current_time');
        console.log('✅ Database connected successfully at:', result[0].current_time);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // Don't exit, let the app start anyway
    }
}

require('./cron/investmentProcessor');

// Start server with error handling
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    await testDatabaseConnection();
});