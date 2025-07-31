// Environment variable checker for missing configurations
require('dotenv').config();

console.log('🔍 Checking environment variables...');

const requiredVars = [
    'DB_HOST',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
];

const optionalVars = [
    'FINNHUB_KEY',
    'GMAIL_USER',
    'GMAIL_PASS',
    'FRONTEND_URL'
];

console.log('\n✅ Required Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? '✅ Set' : '⚠️ Missing (feature may not work)'}`);
});

console.log('\n💡 Notes:');
console.log('- FINNHUB_KEY: Required for stock prices (get free key at finnhub.io)');
console.log('- GMAIL_*: Required for email notifications');
console.log('- FRONTEND_URL: Used for CORS and redirects');
