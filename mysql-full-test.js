const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 MySQL Connection Test with Full Path');
console.log('=====================================');
console.log('');

const MYSQL_PATH = 'C:\\Program Files\\MySQL\\MySQL Server 9.4\\bin\\mysql.exe';

// Test passwords to try
const passwords = [
    { value: '', description: 'Empty password' },
    { value: 'root', description: 'Password: root' },
    { value: 'password', description: 'Password: password' },
    { value: 'mysql', description: 'Password: mysql' },
    { value: 'Lightholdbossamuelebiloma4321$$', description: 'Current .env password' }
];

async function testPassword(password, description) {
    return new Promise((resolve) => {
        console.log(`Testing: ${description}...`);
        
        const args = ['-u', 'root'];
        if (password) {
            args.push(`-p${password}`);
        }
        args.push('-e', 'SELECT "SUCCESS" as result');
        
        const mysql = spawn(MYSQL_PATH, args, {
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let output = '';
        let error = '';
        
        mysql.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        mysql.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        mysql.on('close', (code) => {
            if (code === 0 && output.includes('SUCCESS')) {
                console.log(`✅ SUCCESS: ${description} works!`);
                resolve({ success: true, password, description });
            } else {
                console.log(`❌ Failed: ${description}`);
                resolve({ success: false });
            }
        });
        
        mysql.on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            resolve({ success: false });
        });
    });
}

async function setupDatabase(workingPassword, description) {
    console.log('');
    console.log('🔧 Setting up database...');
    
    return new Promise((resolve) => {
        const args = ['-u', 'root'];
        if (workingPassword) {
            args.push(`-p${workingPassword}`);
        }
        args.push('-e', 'CREATE DATABASE IF NOT EXISTS devapp; USE devapp; SHOW TABLES;');
        
        const mysql = spawn(MYSQL_PATH, args, {
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let output = '';
        
        mysql.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        mysql.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Database "devapp" created/verified successfully!');
                console.log('Tables in database:', output);
                resolve(true);
            } else {
                console.log('❌ Failed to create database');
                resolve(false);
            }
        });
    });
}

async function updateEnvFile(password) {
    const fs = require('fs');
    const envPath = './Backend/.env';
    
    try {
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
            fs.writeFileSync(envPath, envContent);
            console.log('✅ .env file updated successfully!');
        } else {
            console.log('❌ .env file not found');
        }
    } catch (error) {
        console.log('❌ Failed to update .env file:', error.message);
    }
}

async function main() {
    let workingConnection = null;
    
    for (const passwordTest of passwords) {
        const result = await testPassword(passwordTest.value, passwordTest.description);
        if (result.success) {
            workingConnection = result;
            break;
        }
    }
    
    if (!workingConnection) {
        console.log('');
        console.log('❌ No working password found!');
        console.log('');
        console.log('🔧 Manual options:');
        console.log('1. Reset MySQL root password using MySQL Workbench');
        console.log('2. Use mysql_secure_installation to set a new password');
        console.log('3. Try connecting with MySQL Workbench GUI');
        return;
    }
    
    // Setup database
    const dbSetup = await setupDatabase(workingConnection.password, workingConnection.description);
    
    if (dbSetup) {
        // Update .env file
        await updateEnvFile(workingConnection.password);
        
        console.log('');
        console.log('✅ Database setup complete!');
        console.log('');
        console.log('🔄 Working credentials:');
        console.log(`   Username: root`);
        console.log(`   Password: ${workingConnection.password || '(empty)'}`);
        console.log(`   Database: devapp`);
        console.log('');
        console.log('🚀 Next steps:');
        console.log('1. Import database: Use the import script');
        console.log('2. Test Node.js connection: node test-mysql-simple.js');
        console.log('3. Start backend: node app.js');
    }
}

main().catch(console.error);
