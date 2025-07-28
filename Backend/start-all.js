const fs = require('fs');
const path = require('path');

console.log('=== DevApp Backend Diagnostic & Startup ===\n');

// Check environment
console.log('1. Environment Check:');
console.log(`   Node.js version: ${process.version}`);
console.log(`   Current directory: ${process.cwd()}`);
console.log(`   Platform: ${process.platform}\n`);

// Check files
console.log('2. File Check:');
const requiredFiles = ['app.js', '.env', 'package.json'];
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✓ ${file} exists`);
    } else {
        console.log(`   ✗ ${file} missing`);
    }
});
console.log('');

// Test database connection
console.log('3. Database Connection Test:');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('   ✓ MySQL connection successful');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as user_count FROM users');
        console.log(`   ✓ Users table accessible (${rows[0].user_count} users)`);
        
        await connection.end();
        return true;
    } catch (error) {
        console.log(`   ✗ Database error: ${error.message}`);
        return false;
    }
}

async function startServer() {
    console.log('\n4. Starting Minimal Server:');
    
    const dbConnected = await testDatabase();
    if (!dbConnected) {
        console.log('   Cannot start server due to database issues');
        return;
    }
    
    console.log('   Starting on port 4000...\n');
    
    // Import and start the minimal server
    const express = require('express');
    const cors = require('cors');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const app = express();
    
    // Database pool
    const db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
    
    // CORS configuration
    app.use(cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.use(express.json());
    
    // Routes
    app.get('/', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT NOW() AS current_time');
            res.json({ 
                message: 'DevApp Backend is running!', 
                time: rows[0].current_time,
                status: 'OK'
            });
        } catch (error) {
            console.error('DB error:', error);
            res.status(500).json({ error: 'Database connection error' });
        }
    });
    
    app.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    
    // Signup
    app.post('/api/users/signup', async (req, res) => {
        try {
            console.log('📝 Signup request:', req.body.email);
            
            const { fullname, email, password, country, currency } = req.body;
            
            if (!fullname || !email || !password || !country || !currency) {
                return res.status(400).json({ error: 'All fields are required' });
            }
    
            const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.query(
                'INSERT INTO users (fullname, email, password, country, currency) VALUES (?, ?, ?, ?, ?)',
                [fullname, email, hashedPassword, country, currency]
            );
    
            const token = jwt.sign(
                { userId: result.insertId, email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
    
            console.log('✅ User created successfully:', email);
            res.status(201).json({
                message: 'User created successfully',
                token,
                user: { id: result.insertId, fullname, email, country, currency }
            });
        } catch (error) {
            console.error('❌ Signup error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    // Login
    app.post('/api/users/login', async (req, res) => {
        try {
            console.log('🔐 Login request:', req.body.email);
            
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
    
            const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
    
            const user = users[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
    
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
    
            console.log('✅ Login successful:', email);
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    fullname: user.fullname,
                    email: user.email,
                    country: user.country,
                    currency: user.currency
                }
            });
        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 CORS enabled for frontend ports`);
        console.log(`\n💡 Test in browser: http://localhost:${PORT}`);
        console.log(`💡 Open the frontend and try signing up/logging in!`);
    });
}

startServer().catch(console.error);
