const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

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

// Get user route
router.get('/balance', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);

        if(rows.length === 0) {
            return res.status(404).json({ message: 'User not found'});
        }

        res.status(200).json({
            balance: rows[0].balance
        });
    } catch(err) {
        console.error('Balance error:', err);
        res.status(500).json({ message: 'Server error'});
    }
})

module.exports = router;