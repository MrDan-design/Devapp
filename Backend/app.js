const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('./config/passport');
const path = require('path');
const passport = require('passport');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

const userRoutes = require('./routes/userRoutes');
const swapRoutes = require('./routes/swapRoutes');
const adminRoutes = require('./routes/adminRoutes');
const depositRoutes = require('./routes/depositRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const investRoutes = require('./routes/investRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const stockRoutes = require('./routes/stockRoutes');


app.use(cors());
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
app.use('/api/transaction', transactionRoutes);

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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});