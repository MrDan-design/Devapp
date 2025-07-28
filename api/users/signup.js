const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock database for demo (in production, you'd use a real database)
let users = [];

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'devapp-jwt-secret-2025-production-key-super-secure';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with',
  'Access-Control-Allow-Credentials': 'true'
};

export default async function handler(req, res) {
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullname, email, password, country, currency, nextOfKin, nextOfKinNumber } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

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
}
