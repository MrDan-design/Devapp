const express = require('express');
const bcrypt = require('bcryptjs'); // Use bcryptjs for better compatibility
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const getUploader = require('../middlewares/upload.js');
const verifyToken = require('../middlewares/authMiddleware.js');

// Create upload instance for profile images
const upload = getUploader('profiles');


const router = express.Router();

// Ensure JWT_SECRET is properly loaded
if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET environment variable is not set!');
    throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

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

// ✅ LOGIN (MySQL/PostgreSQL compatible with comprehensive error handling)
router.post('/login', async (req, res) => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) console.log('🔍 Login request received');
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      if (isDev) console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      if (isDev) console.log('❌ Invalid data types for email or password');
      return res.status(400).json({ message: 'Email and password must be strings' });
    }

    if (isDev) console.log('🔍 Attempting login for email:', email);

    // Database query
    const [users] = await db.query('SELECT id, email, fullname, password, balance, is_admin FROM users WHERE email = ?', [email]);
    
    if (!users || users.length === 0) {
      if (isDev) console.log('❌ No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    if (isDev) console.log('✅ User found - ID:', user.id);

    // Password comparison
    if (!user.password) {
      if (isDev) console.log('❌ User has no password set');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      if (isDev) console.log('❌ Password mismatch');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // JWT creation
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin || false
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Success response
    const responseData = {
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        balance: user.balance || 0,
        is_admin: user.is_admin || false
      }
    };

    if (isDev) console.log('✅ Login successful for user:', email);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error.message);
    
    // Only show stack trace in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Stack:', error.stack);
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message,
        stack: error.stack
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error'
      });
    }
  }
});

// ✅ GET USER PROFILE (MySQL compatible)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query(`
      SELECT fullname, email, country, currency, next_of_kin, next_of_kin_number, 
             profile_image, subscription_plan_id 
      FROM users WHERE id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    let subscriptionName = 'Free';
    
    if (user.subscription_plan_id) {
      const [plans] = await db.query('SELECT name FROM subscription_plans WHERE id = ?', [user.subscription_plan_id]);
      if (plans.length > 0) {
        subscriptionName = plans[0].name;
      }
    }

    res.json({
      fullname: user.fullname,
      email: user.email,
      country: user.country,
      currency: user.currency,
      phone: '', // Not in database yet
      next_of_kin: user.next_of_kin,
      next_of_kin_phone: user.next_of_kin_number,
      profile_image: user.profile_image,
      subscription_plan: subscriptionName
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ UPDATE USER PROFILE (MySQL compatible)
router.put('/profile', verifyToken, upload.single('profile_image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, email, country, currency, nextOfKin, nextOfKinPhone } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];
    
    if (fullname) {
      updateFields.push('fullname = ?');
      updateValues.push(fullname);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (country) {
      updateFields.push('country = ?');
      updateValues.push(country);
    }
    if (currency) {
      updateFields.push('currency = ?');
      updateValues.push(currency);
    }
    if (nextOfKin) {
      updateFields.push('next_of_kin = ?');
      updateValues.push(nextOfKin);
    }
    if (nextOfKinPhone) {
      updateFields.push('next_of_kin_number = ?');
      updateValues.push(nextOfKinPhone);
    }
    
    // Handle profile image upload
    if (req.file) {
      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      updateFields.push('profile_image = ?');
      updateValues.push(imageUrl);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    updateValues.push(userId);
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await db.query(updateQuery, updateValues);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ CHANGE PASSWORD (MySQL compatible)
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    
    // Get current user
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
    
    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Password change error:', error);
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

// 🔍 PRODUCTION DEBUG ENDPOINT - Check environment and database
router.get('/debug/production', async (req, res) => {
  try {
    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        isRender: !!process.env.DATABASE_URL,
        hasJWT: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        dbType: !!process.env.DATABASE_URL ? 'PostgreSQL' : 'MySQL'
      },
      timestamp: new Date().toISOString()
    };

    // Test database connection
    try {
      const [testResult] = await db.query('SELECT 1 as test');
      debugInfo.database = {
        connected: true,
        testQuery: testResult
      };
    } catch (dbError) {
      debugInfo.database = {
        connected: false,
        error: dbError.message
      };
    }

    // Test users table
    try {
      const [userCount] = await db.query('SELECT COUNT(*) as count FROM users LIMIT 1');
      debugInfo.usersTable = {
        accessible: true,
        userCount: userCount[0]?.count || 0
      };
    } catch (tableError) {
      debugInfo.usersTable = {
        accessible: false,
        error: tableError.message
      };
    }

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
