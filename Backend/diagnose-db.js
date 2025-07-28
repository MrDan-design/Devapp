const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔍 MySQL Connection Troubleshooting');
console.log('=====================================');
console.log('');

async function testConnection() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'devapp'
    };
    
    console.log('📋 Connection Config:');
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Password: ${config.password ? '***' + config.password.slice(-3) : 'NOT SET'}`);
    console.log('');

    // Test 1: Connection without database
    console.log('🔄 Test 1: Connecting without specific database...');
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password
        });
        console.log('✅ Basic connection successful!');
        
        // Check databases
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📁 Available databases:');
        databases.forEach(db => {
            console.log(`   - ${db.Database}`);
        });
        
        await connection.end();
    } catch (error) {
        console.log('❌ Basic connection failed:', error.message);
        
        // Test with common alternative passwords/users
        console.log('');
        console.log('🔄 Trying alternative configurations...');
        
        const alternatives = [
            { user: 'root', password: '' },
            { user: 'root', password: 'root' },
            { user: 'root', password: 'password' },
            { user: 'mysql', password: '' }
        ];
        
        for (const alt of alternatives) {
            try {
                console.log(`   Testing: ${alt.user}/${alt.password || '(empty)'}`);
                const testConnection = await mysql.createConnection({
                    host: config.host,
                    user: alt.user,
                    password: alt.password
                });
                console.log(`   ✅ Success with ${alt.user}/${alt.password || '(empty)'}`);
                await testConnection.end();
                break;
            } catch (err) {
                console.log(`   ❌ Failed: ${err.message}`);
            }
        }
        return;
    }

    // Test 2: Connection with specific database
    console.log('');
    console.log('🔄 Test 2: Connecting to specific database...');
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Database connection successful!');
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Available tables:');
        if (tables.length === 0) {
            console.log('   (No tables found - database might be empty)');
        } else {
            tables.forEach(table => {
                console.log(`   - ${Object.values(table)[0]}`);
            });
        }
        
        await connection.end();
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        
        if (error.message.includes('Unknown database')) {
            console.log('');
            console.log('💡 The database "devapp" doesn\'t exist. Do you want to create it?');
            console.log('   You can run: CREATE DATABASE devapp;');
        }
    }
}

testConnection().catch(console.error);
