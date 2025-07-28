require('dotenv').config();

console.log('🔍 Environment Variables Check:');
console.log('================================');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('');
console.log('🌐 Expected CORS Origins:');
console.log('- http://localhost:5173');
console.log('- http://localhost:5174');
console.log('- http://localhost:3000');
console.log('- ' + process.env.FRONTEND_URL);
console.log('');

// Test CORS configuration
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

console.log('📋 CORS Configuration:');
console.log(JSON.stringify(corsOptions, null, 2));
