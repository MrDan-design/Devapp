const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const upload = require('../middlewares/upload.js');
const verifyToken = require('../middlewares/authMiddleware.js');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ✅ SIGNUP
router.post('/signup', async (req, res) => {
  const { fullname, email, password, country, currency, nextOfKin, nextOfKinNumber } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {

    // Check if user exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
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

// ✅ LOGIN
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
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        balance: user.balance,
        is_admin: user.is_admin,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PROFILE GET
router.get('/profile', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {

    const [users] = await db.query('SELECT fullname, profile_image, subscription_plan_id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[0];
    let planName = 'None';
    if (user.subscription_plan_id) {
      const [plans] = await db.query('SELECT name FROM subscription_plans WHERE id = ?', [user.subscription_plan_id]);
      if (plans.length > 0) planName = plans[0].name;
    }
    res.json({
      fullname: user.fullname,
      profileImage: user.profile_image,
      plan: planName,
    });

  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PROFILE IMAGE UPLOAD
router.post("/profile/image", verifyToken, upload("profile").single("image"), async (req, res) => {
  const userId = req.user.id;
  const imageUrl = `/uploads/profile/${req.file.filename}`;

  try {
    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, userId]);
    res.json({ message: "Image uploaded successfully", profileImage: imageUrl });
  } catch (err) {
    console.error("Error saving profile image:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ BALANCE
router.get('/balance', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {

    const [investments] = await db.query('SELECT shares_given, amount_invested FROM investments WHERE user_id = ? AND status = ?', [userId, 'active']);
    let sharesBalance = 0;
    let totalInvested = 0;
    investments.forEach(inv => {
      sharesBalance += inv.shares_given || 0;
      totalInvested += inv.amount_invested || 0;
    });
    const [users] = await db.query('SELECT balance, email FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      name: users[0].email.split('@')[0],
      walletBalance: users[0].balance,
      sharesBalance: sharesBalance,
      totalInvested: totalInvested
    });

  } catch (err) {
    console.error('Balance fetch error:', err);
    res.status(500).json({ message: 'Server error fetching balance info' });
  }
});

// ✅ UPGRADE PLAN
router.post('/upgrade', async (req, res) => {
  const { userId, planId } = req.body;

  if (!userId || !planId) {
    return res.status(400).json({ message: 'User ID and plan ID are required.' });
  }

  try {
    const [planExists] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
    if (planExists.length === 0) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }
    await db.query('UPDATE users SET subscription_plan_id = ? WHERE id = ?', [planId, userId]);
    res.json({ message: 'Subscription upgraded successfully.' });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ✅ SUBSCRIPTION REQUEST
router.post('/subscribe/request', verifyToken, async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    await db.query('INSERT INTO pending_subscriptions (user_id, plan_id) VALUES (?, ?)', [userId, planId]);
    res.json({ message: 'Subscription request submitted for approval.' });
  } catch (err) {
    console.error('Error inserting subscription request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

