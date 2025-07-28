// Test database connection without starting full server
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MySQL connection...');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✓ Connected to MySQL!');
        
        const [rows] = await connection.execute('SELECT NOW() as current_time');
        console.log('✓ Query successful:', rows[0]);
        
        await connection.end();
        console.log('✓ Connection closed');
        
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

testConnection().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
