const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const upload = require('../middlewares/upload')

const verifyToken = require('../middlewares/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

//Signup route
router.post('/signup', async (req, res) => {
    const { fullname, email, password, country, currency, nextOfKin, nextOfKinNumber } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required'});
    }

    try {
        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        await db.query('INSERT INTO users (fullname, email, password, country, currency, next_of_kin, next_of_kin_number) VALUES (?, ?, ?, ?, ?, ?, ?)', [fullname, email, hashedPassword, country, nextOfKin, nextOfKinNumber || null, currency || 'USD']);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Login Route
router.post('/login', async (req, res) =>{
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: 'Email and password are required'});
    }

    try {
        // Find the user by email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if(users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password'});
        }

        const user = users[0];
        console.log('Entered:', password, 'Hashed:', user.password);
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password'});
        }

        //Create JWT token
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            is_admin: user.is_admin
        }, process.env.JWT_SECRET, { expiresIn: '7d'});

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
        //res.json({ token, user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Server error"});
    }
});

router.get('/profile', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        users.fullname, 
        users.profile_image, 
        subscription_plans.name AS plan 
      FROM users
      LEFT JOIN subscription_plans 
        ON users.subscription_plan_id = subscription_plans.id
      WHERE users.id = ?
    `, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      fullname: rows[0].fullname, 
      profileImage: rows[0].profile_image,
      plan: rows[0].plan || 'None'
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/profile/image", verifyToken, upload("profile").single("image"), async (req, res) => {
  const userId = req.user.id;
  const imageUrl = `/uploads/profile/${req.file.filename}`;

  try {
    await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [imageUrl, userId]);
    res.json({ message: "Image uploaded successfully", profileImage: imageUrl });
  } catch (err) {
    console.error("Error saving profile image:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user route
router.get('/balance', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch shares balance and total invested
    const [[inv]] = await db.query(
      `SELECT 
         COALESCE(SUM(shares_given), 0) AS shares_balance,
         COALESCE(SUM(amount_invested), 0) AS total_invested
       FROM investments
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    // 2. Fetch USD balance
    const [[user]] = await db.query(
      "SELECT balance, email FROM users WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      name: user.email.split('@')[0],         // or full name if you later include that
      walletBalance: user.balance,            // ✅ clearer than "usd_balance"
      sharesBalance: inv.shares_balance,      // ✅ renamed for clarity
      totalInvested: inv.total_invested       // ✅ renamed for clarity
    });

  } catch (err) {
    console.error('Balance fetch error:', err);
    res.status(500).json({ message: 'Server error fetching balance info' });
  }
});

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

router.post('/subscribe/request', verifyToken, async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      'INSERT INTO pending_subscriptions (user_id, plan_id) VALUES (?, ?)',
      [userId, planId]
    );

    res.json({ message: 'Subscription request submitted for approval.' });
  } catch (err) {
    console.error('Error inserting subscription request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;