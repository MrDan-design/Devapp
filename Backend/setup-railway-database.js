#!/usr/bin/env node

// Setup script for Railway MySQL database
require('dotenv').config();

async function setupRailwayDatabase() {
    console.log('🚂 Setting up Railway MySQL database...');
    
    try {
        const db = require('./config/db.js');
        
        // Test connection first
        console.log('📡 Testing database connection...');
        const [testResult] = await db.query('SELECT 1 as test');
        console.log('✅ Database connection successful');
        
        // Create tables
        console.log('📋 Creating database schema...');
        
        // Users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                country VARCHAR(100),
                currency VARCHAR(10) DEFAULT 'USD',
                next_of_kin VARCHAR(255),
                next_of_kin_number VARCHAR(50),
                balance DECIMAL(15,2) DEFAULT 0.00,
                is_admin BOOLEAN DEFAULT FALSE,
                profile_image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');
        
        // Investments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS investments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                plan_name VARCHAR(100) NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                roi_percentage DECIMAL(5,2) NOT NULL,
                duration_days INT NOT NULL,
                status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Investments table created');
        
        // Transactions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type ENUM('deposit', 'withdrawal', 'investment', 'profit') NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Transactions table created');
        
        // Create admin user
        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        await db.query(`
            INSERT IGNORE INTO users (fullname, email, password, balance, is_admin) 
            VALUES (?, ?, ?, ?, ?)
        `, ['Admin User', 'teslawallet.tco@gmail.com', adminPassword, 10000.00, true]);
        
        console.log('✅ Admin user created (email: teslawallet.tco@gmail.com, password: admin123)');
        
        // Verify setup
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        console.log(`✅ Database setup complete! Users: ${userCount[0].count}`);
        
        console.log('🎉 Railway MySQL database is ready for production!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

setupRailwayDatabase();
