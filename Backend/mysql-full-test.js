const mysql = require('mysql2');
require('dotenv').config();

// MySQL full path
const MYSQL_PATH = '"C:\\Program Files\\MySQL\\MySQL Server 9.4\\bin\\mysql.exe"';

console.log('🔍 MySQL Database Setup with Full Path');
console.log('=====================================');
console.log('MySQL Path:', MYSQL_PATH);
console.log('');

// Test connection with various passwords
const passwords = [
    { name: 'Empty password', value: '' },
    { name: 'Current .env password', value: process.env.DB_PASSWORD },
    { name: 'Password: root', value: 'root' },
    { name: 'Password: password', value: 'password' },
    { name: 'Password: mysql', value: 'mysql' }
];

async function testPasswords() {
    console.log('🔐 Testing MySQL passwords...');
    console.log('');

    for (const pwd of passwords) {
        try {
            console.log(`Testing: ${pwd.name}...`);
            
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: pwd.value
            });

            await new Promise((resolve, reject) => {
                connection.connect((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            console.log(`✅ SUCCESS: ${pwd.name} works!`);
            
            // Test creating database
            await new Promise((resolve, reject) => {
                connection.query('CREATE DATABASE IF NOT EXISTS devapp', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log('✅ Database "devapp" created/verified');
            
            // Test using database
            await new Promise((resolve, reject) => {
                connection.query('USE devapp', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log('✅ Connected to devapp database');
            
            connection.end();
            
            console.log('');
            console.log('🎉 SUCCESS! Working credentials found:');
            console.log('Host: localhost');
            console.log('User: root');
            console.log(`Password: ${pwd.value || '(empty)'}`);
            console.log('Database: devapp');
            console.log('');
            
            // Update .env file
            const fs = require('fs');
            const path = require('path');
            
            try {
                const envPath = path.join(__dirname, '.env');
                let envContent = fs.readFileSync(envPath, 'utf8');
                envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${pwd.value}`);
                fs.writeFileSync(envPath, envContent);
                console.log('✅ .env file updated with working password');
            } catch (error) {
                console.log('⚠ Could not update .env file:', error.message);
            }
            
            console.log('');
            console.log('🚀 Next steps:');
            console.log('1. Import database: Use the command below in PowerShell');
            console.log(`   & "${MYSQL_PATH.replace(/"/g, '')}" -u root ${pwd.value ? `-p${pwd.value}` : ''} devapp < ..\\database\\devapp_full.sql`);
            console.log('2. Start backend: node app.js');
            console.log('3. Test your application');
            
            return true;
            
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }
    
    console.log('');
    console.log('❌ No working password found!');
    console.log('');
    console.log('🔧 Manual solutions:');
    console.log('1. Reset MySQL root password');
    console.log('2. Use MySQL Workbench to connect');
    console.log('3. Create a new MySQL user');
    
    return false;
}

testPasswords().catch(console.error);
