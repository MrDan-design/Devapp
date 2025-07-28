console.log('Starting simple server...');

const express = require('express');
const app = express();

console.log('Express loaded');

// Basic middleware
app.use(express.json());
console.log('JSON middleware added');

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
console.log('CORS headers configured');

// Test route
app.get('/', (req, res) => {
  console.log('GET / request received');
  res.json({ message: 'Server is working!' });
});

// Signup route
app.post('/api/users/signup', (req, res) => {
  console.log('POST /api/users/signup request received:', req.body);
  res.json({ 
    message: 'Signup successful!',
    data: req.body 
  });
});

// Login route
app.post('/api/users/login', (req, res) => {
  console.log('POST /api/users/login request received:', req.body);
  res.json({ 
    message: 'Login successful!',
    token: 'test-token-123',
    user: { 
      id: 1, 
      email: req.body.email, 
      fullname: 'Test User',
      balance: 0,
      is_admin: false
    }
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('✅ CORS enabled for all origins');
  console.log('✅ Ready to receive requests');
});

console.log('Server setup complete, starting to listen...');
