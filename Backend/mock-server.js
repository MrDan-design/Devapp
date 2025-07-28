const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Mock database - in-memory storage for testing
let users = [
    {
        id: 1,
        fullname: 'Test User',
        email: 'test@example.com',
        password: '$2a$10$example.hashed.password', // Will be replaced
        country: 'Test Country',
        currency: 'USD'
    }
];

// Initialize test user with proper hashed password
async function initMockData() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    users[0].password = hashedPassword;
    console.log('📋 Mock user initialized: test@example.com / password123');
}

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'DevApp Backend is running! (Mock Database Mode)', 
        time: new Date().toISOString(),
        status: 'OK',
        mode: 'MOCK_DATABASE',
        users_count: users.length
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        mode: 'MOCK_DATABASE'
    });
});

// Signup route
app.post('/api/users/signup', async (req, res) => {
    try {
        console.log('📝 Signup request:', req.body.email);
        
        const { fullname, email, password, country, currency } = req.body;
        
        if (!fullname || !email || !password || !country || !currency) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: users.length + 1,
            fullname,
            email,
            password: hashedPassword,
            country,
            currency
        };
        
        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ User created successfully:', email);
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                fullname,
                email,
                country,
                currency
            }
        });

    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
app.post('/api/users/login', async (req, res) => {
    try {
        console.log('🔐 Login request:', req.body.email);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
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

// Get user balance route
app.get('/api/users/balance', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header required' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('📊 Balance request for user:', decoded.email);

        // Mock dashboard data
        const dashboardData = {
            balance: 25420.75,
            sharesBalance: 45650.25,
            totalInvestment: 71071.00,
            portfolioChange: 12.5,
            recentTransactions: [
                {
                    id: 1,
                    type: 'deposit',
                    amount: 1000,
                    description: 'Wallet funding',
                    date: new Date().toISOString(),
                    status: 'completed'
                },
                {
                    id: 2,
                    type: 'investment',
                    amount: 500,
                    description: 'AAPL stock purchase',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    status: 'completed'
                },
                {
                    id: 3,
                    type: 'dividend',
                    amount: 25.50,
                    description: 'MSFT dividend payment',
                    date: new Date(Date.now() - 172800000).toISOString(),
                    status: 'completed'
                }
            ]
        };

        res.json(dashboardData);

    } catch (error) {
        console.error('❌ Balance fetch error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get top stocks route
app.get('/api/stocks/top', async (req, res) => {
    try {
        console.log('📈 Top stocks request');

        // Mock top stocks data
        const topStocks = [
            {
                symbol: 'AAPL',
                name: 'Apple Inc.',
                price: 182.52,
                change: 2.34,
                changePercent: 1.30,
                marketCap: '2.85T'
            },
            {
                symbol: 'MSFT',
                name: 'Microsoft Corporation',
                price: 343.89,
                change: -1.23,
                changePercent: -0.36,
                marketCap: '2.55T'
            },
            {
                symbol: 'GOOGL',
                name: 'Alphabet Inc.',
                price: 139.69,
                change: 0.87,
                changePercent: 0.63,
                marketCap: '1.75T'
            },
            {
                symbol: 'AMZN',
                name: 'Amazon.com Inc.',
                price: 145.86,
                change: 3.21,
                changePercent: 2.25,
                marketCap: '1.51T'
            },
            {
                symbol: 'TSLA',
                name: 'Tesla Inc.',
                price: 248.50,
                change: -5.67,
                changePercent: -2.23,
                marketCap: '789B'
            }
        ];

        res.json(topStocks);

    } catch (error) {
        console.error('❌ Stocks fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 4000;

async function startServer() {
    await initMockData();
    
    app.listen(PORT, () => {
        console.log('🚀 DevApp Backend (Mock Database) running on http://localhost:' + PORT);
        console.log('📊 Health check: http://localhost:' + PORT + '/health');
        console.log('🔗 CORS enabled for: http://localhost:5174');
        console.log('');
        console.log('🎮 Mock Database Mode:');
        console.log('   • No MySQL required - uses in-memory storage');
        console.log('   • Test user: test@example.com / password123');
        console.log('   • Create new accounts via signup form');
        console.log('');
        console.log('💡 Ready to test the beautiful authentication form!');
        console.log('   Visit: http://localhost:5174');
    });
}

startServer().catch(console.error);

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
