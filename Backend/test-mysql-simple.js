const mysql = require('mysql2');
require('dotenv').config();

// Simple connection test
console.log('MySQL Connection Test');
console.log('====================');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('User:', process.env.DB_USER || 'root'); 
console.log('Database:', process.env.DB_NAME || 'devapp');
console.log('');

// Test 1: Try with .env credentials
console.log('Test 1: Using .env credentials...');
const connection1 = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'devapp'
});

connection1.connect((err) => {
    if (err) {
        console.log('❌ Failed:', err.message);
        console.log('');
        
        // Test 2: Try without password
        console.log('Test 2: Trying with empty password...');
        const connection2 = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'devapp'
        });
        
        connection2.connect((err2) => {
            if (err2) {
                console.log('❌ Failed:', err2.message);
                console.log('');
                console.log('🔧 Manual setup required:');
                console.log('1. Open Command Prompt as Administrator');
                console.log('2. Run: mysql -u root -p');
                console.log('3. Enter your MySQL password');
                console.log('4. Run: CREATE DATABASE devapp;');
                console.log('5. Run: USE devapp;');
                console.log('6. Import the schema file');
            } else {
                console.log('✅ Success with empty password!');
                console.log('');
                console.log('Update your .env file:');
                console.log('DB_PASSWORD=');
                connection2.end();
            }
        });
    } else {
        console.log('✅ Connection successful with .env credentials!');
        
        // Test query
        connection1.query('SELECT NOW() as time', (err, results) => {
            if (err) {
                console.log('Query failed:', err.message);
            } else {
                console.log('✅ Query successful:', results[0]);
            }
            connection1.end();
        });
    }
});
