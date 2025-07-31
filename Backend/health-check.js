// Simple health check script for production debugging
require('dotenv').config();

const isRender = !!process.env.DATABASE_URL;

console.log('🔍 Environment Check:');
console.log('- isRender:', isRender);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);

async function testDatabase() {
    try {
        const db = require('./config/db.js');
        
        console.log('\n🔍 Testing database connection...');
        
        // Test a simple query
        const [rows] = await db.query('SELECT 1 as test');
        console.log('✅ Database query successful:', rows);
        
        // Test users table exists
        const [userCheck] = await db.query('SELECT COUNT(*) as count FROM users LIMIT 1');
        console.log('✅ Users table accessible:', userCheck);
        
        console.log('\n✅ All database tests passed!');
        
    } catch (error) {
        console.error('\n❌ Database test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDatabase();
