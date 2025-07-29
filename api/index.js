const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://devapp-lovat.vercel.app',
    'https://devapp-mrdan-design.vercel.app',
    'https://devapp-bay.vercel.app',
    // Your production domains
    'https://tslaxai.io',
    'https://www.tslaxai.io',
    'http://www.tslaxai.io',
    'http://tslaxai.io',
    /\.vercel\.app$/,
    /\.netlify\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

app.use(express.json());

// Mock database for demo (in production, you'd use a real database)
const users = [];

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Signup endpoint
app.post('/api/users/signup', async (req, res) => {
  try {
    const { fullname, email, password, country, currency, nextOfKin, nextOfKinNumber } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: Date.now(),
      fullname,
      email,
      password: hashedPassword,
      country,
      currency: currency || 'USD',
      nextOfKin,
      nextOfKinNumber,
      balance: 0.00,
      createdAt: new Date()
    };

    users.push(user);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mock endpoints for other features
app.get('/api/users/balance', (req, res) => {
  res.json({ balance: 1250.50, currency: 'USD' });
});

app.get('/api/stocks/top', (req, res) => {
  res.json([
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: '+2.45%' },
    { id: 2, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: '+1.23%' },
    { id: 3, symbol: 'MSFT', name: 'Microsoft Corp.', price: 310.15, change: '+0.98%' }
  ]);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    message: 'DevApp Backend API is running on Vercel!'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DevApp Backend API',
    endpoints: [
      'POST /api/users/signup',
      'POST /api/users/login',
      'GET /api/users/balance',
      'GET /api/stocks/top',
      'GET /api/health'
    ]
  });
});

module.exports = app;
