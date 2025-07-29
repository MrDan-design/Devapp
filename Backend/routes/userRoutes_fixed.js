const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const upload = require('../middlewares/upload.js');
const verifyToken = require('../middlewares/authMiddleware.js');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ✅ SIGNUP (PostgreSQL compatible)
router.post('/signup', async (req, res) => {
  const { fullname, email, password, country, currency, nextOfKin, nextOfKinNumber } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists (PostgreSQL syntax)
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (PostgreSQL syntax)
    await db.query(
      'INSERT INTO users (fullname, email, password, country, currency, next_of_kin, next_of_kin_number) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [fullname, email, hashedPassword, country, currency || 'USD', nextOfKin || null, nextOfKinNumber || null]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ LOGIN (PostgreSQL compatible)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const users = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (users.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = users.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email,
      is_admin: user.is_admin
    }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        balance: user.balance,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ GET USER PROFILE (PostgreSQL compatible)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await db.query('SELECT fullname, profile_image, subscription_plan_id FROM users WHERE id = $1', [userId]);
    
    if (users.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users.rows[0];
    let subscriptionName = null;
    
    if (user.subscription_plan_id) {
      const plans = await db.query('SELECT name FROM subscription_plans WHERE id = $1', [user.subscription_plan_id]);
      if (plans.rows.length > 0) {
        subscriptionName = plans.rows[0].name;
      }
    }

    res.json({
      fullname: user.fullname,
      profile_image: user.profile_image,
      subscription_plan: subscriptionName
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ UPLOAD PROFILE IMAGE (PostgreSQL compatible)
router.post('/upload-profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    await db.query('UPDATE users SET profile_image = $1 WHERE id = $2', [imageUrl, userId]);
    res.json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ GET DASHBOARD DATA (PostgreSQL compatible)
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const investments = await db.query('SELECT shares_given, amount_invested FROM investments WHERE user_id = $1 AND status = $2', [userId, 'active']);
    
    let totalShares = 0;
    let totalInvested = 0;
    
    investments.rows.forEach(investment => {
      totalShares += parseFloat(investment.shares_given);
      totalInvested += parseFloat(investment.amount_invested);
    });
    
    const users = await db.query('SELECT balance, email FROM users WHERE id = $1', [userId]);
    const user = users.rows[0];

    res.json({
      balance: user.balance,
      totalShares,
      totalInvested,
      email: user.email
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
