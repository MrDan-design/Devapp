const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient.js');
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
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (existingUserError) throw existingUserError;
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        fullname,
        email,
        password: hashedPassword,
        country,
        currency: currency || 'USD',
        next_of_kin: nextOfKin || null,
        next_of_kin_number: nextOfKinNumber || null,
      }]);

    if (insertError) throw insertError;

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
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (findError) throw findError;

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
    const { data: users, error } = await supabase
      .from('users')
      .select('fullname, profile_image, subscription_plans(name)')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      fullname: users.fullname,
      profileImage: users.profile_image,
      plan: users.subscription_plans?.name || 'None',
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
    const { error } = await supabase
      .from('users')
      .update({ profile_image: imageUrl })
      .eq('id', userId);

    if (error) throw error;

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
    const { data: investments, error: invError } = await supabase
      .from('investments')
      .select('shares_given, amount_invested')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (invError) throw invError;

    let sharesBalance = 0;
    let totalInvested = 0;
    investments.forEach(inv => {
      sharesBalance += inv.shares_given || 0;
      totalInvested += inv.amount_invested || 0;
    });

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('balance, email')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    res.status(200).json({
      name: users.email.split('@')[0],
      walletBalance: users.balance,
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
    const { data: planExists, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId);

    if (planError) throw planError;

    if (planExists.length === 0) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ subscription_plan_id: planId })
      .eq('id', userId);

    if (updateError) throw updateError;

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
    const { error } = await supabase
      .from('pending_subscriptions')
      .insert([{ user_id: userId, plan_id: planId }]);

    if (error) throw error;

    res.json({ message: 'Subscription request submitted for approval.' });
  } catch (err) {
    console.error('Error inserting subscription request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

