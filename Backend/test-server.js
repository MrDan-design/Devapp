const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000'
  ],
  credentials: true,
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Test signup route
app.post('/api/users/signup', (req, res) => {
  console.log('Signup request received:', req.body);
  res.json({ message: 'Signup endpoint working! (Database not connected yet)' });
});

// Test login route
app.post('/api/users/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({ 
    message: 'Login endpoint working!', 
    token: 'test-token-123',
    user: { id: 1, email: req.body.email, fullname: 'Test User' }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server is running on port ${PORT}`);
  console.log('CORS enabled for ports 5173, 5174, and 3000');
});
