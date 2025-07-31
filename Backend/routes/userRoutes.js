const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const getUploader = require('../middlewares/upload.js');
const verifyToken = require('../middlewares/authMiddleware.js');

// Create upload instance for profile images
const upload = getUploader('profiles');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ✅ SIGNUP (PostgreSQL compatible)
router.post('/signup', async (req, res) => {
  const { fullname, email, password, country, currency, nextOfKin, nextOfKinNumber } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists (MySQL syntax)
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (MySQL syntax)
    await db.query(
      'INSERT INTO users (fullname, email, password, country, currency, next_of_kin, next_of_kin_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fullname, email, hashedPassword, country, currency || 'USD', nextOfKin || null, nextOfKinNumber || null]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ LOGIN (MySQL compatible)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = users[0];

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

// ✅ GET USER PROFILE (MySQL compatible)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query('SELECT fullname, profile_image, subscription_plan_id FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    let subscriptionName = null;
    
    if (user.subscription_plan_id) {
      const [plans] = await db.query('SELECT name FROM subscription_plans WHERE id = ?', [user.subscription_plan_id]);
      if (plans.length > 0) {
        subscriptionName = plans[0].name;
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

// ✅ UPLOAD PROFILE IMAGE (MySQL compatible)
router.post('/upload-profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, userId]);
    res.json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ GET DASHBOARD DATA (MySQL compatible)
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [investments] = await db.query('SELECT shares_given, amount_invested FROM investments WHERE user_id = ? AND status = ?', [userId, 'active']);
    
    let totalShares = 0;
    let totalInvested = 0;
    
    investments.forEach(investment => {
      totalShares += parseFloat(investment.shares_given || 0);
      totalInvested += parseFloat(investment.amount_invested || 0);
    });
    
    const [users] = await db.query('SELECT balance, email FROM users WHERE id = ?', [userId]);
    const user = users[0];

    res.json({
      balance: user?.balance || 0,
      totalShares,
      totalInvested,
      email: user?.email
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
