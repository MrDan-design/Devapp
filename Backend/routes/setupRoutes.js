const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

// Database setup endpoint for MySQL (Railway)
router.post('/setup', async (req, res) => {
  try {
    console.log('� Setting up Railway MySQL database...');

    // Test connection first
    const [testResult] = await db.query('SELECT 1 as test');
    console.log('✅ Database connection successful');

    // Create users table first (needed for foreign keys)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'USD',
        phone VARCHAR(50),
        next_of_kin VARCHAR(255),
        next_of_kin_phone VARCHAR(50),
        balance DECIMAL(15,2) DEFAULT 0.00,
        is_admin BOOLEAN DEFAULT FALSE,
        profile_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create deposits table
    await db.query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        method VARCHAR(20) NOT NULL,
        crypto_type VARCHAR(20),
        card_value DECIMAL(10, 2),
        amount_usd DECIMAL(10, 2),
        tx_hash TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        card_country VARCHAR(100),
        card_type VARCHAR(100),
        card_front_image TEXT,
        card_back_image TEXT,
        rejection_reason TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Deposits table created');

    // Create withdrawals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        shares_symbol VARCHAR(10),
        shares_amount DECIMAL(10, 4),
        usd_value DECIMAL(10, 2),
        crypto_symbol VARCHAR(20),
        crypto_amount DECIMAL(18, 8),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Withdrawals table created');

    // Create wallet_addresses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallet_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        crypto_type VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Wallet addresses table created');

    // Create subscription_plans table
    await db.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        benefits TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Subscription plans table created');

    // Create investment_categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS investment_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        min_amount DECIMAL(10, 2) NOT NULL,
        min_shares DECIMAL(10, 4) NOT NULL,
        roi_5days DECIMAL(6, 2) DEFAULT 10.00,
        roi_1month DECIMAL(6, 2) DEFAULT 40.00,
        roi_3months DECIMAL(6, 2) DEFAULT 300.00,
        roi_annual DECIMAL(6, 2) DEFAULT 1000.00
      )
    `);
    console.log('✅ Investment categories table created');

    // Create pending_subscriptions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS pending_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        payment_proof VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
      )
    `);
    console.log('✅ Pending subscriptions table created');

    // Create investments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        category_id INT,
        amount_invested DECIMAL(10, 2),
        shares_given DECIMAL(10, 4),
        duration VARCHAR(20),
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        roi_percent DECIMAL(5, 2),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES investment_categories(id)
      )
    `);
    console.log('✅ Investments table created');

    // Create transactions table
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
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.query(`
      INSERT IGNORE INTO users (fullname, email, password, balance, is_admin) 
      VALUES (?, ?, ?, ?, ?)
    `, ['Admin User', 'teslawallet.tco@gmail.com', adminPassword, 10000.00, true]);
    console.log('✅ Admin user created');

    // Insert subscription plans
    await db.query(`
      INSERT IGNORE INTO subscription_plans (name, price, benefits) VALUES
      ('Megapack Momentum', 7155.99, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team'),
      ('Xploration Zenith', 2820.00, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team'),
      ('Hyperloop Horizon', 1250.00, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning'),
      ('Falcon Flight', 450.00, 'No withdrawal limit, Account on max security, VVIP granted'),
      ('Boring Blueprint', 180.55, 'Withdrawal limit, Account on max security')
    `);
    console.log('✅ Subscription plans inserted');

    // Insert investment categories
    await db.query(`
      INSERT IGNORE INTO investment_categories (name, min_amount, min_shares, roi_5days, roi_1month, roi_3months, roi_annual) VALUES
      ('Small Investors', 100.00, 0.2000, 10.00, 40.00, 300.00, 1000.00),
      ('XAI shares', 250.00, 4.0000, 10.00, 40.00, 300.00, 1000.00),
      ('Model 3 Shares', 2000.00, 20.0000, 10.00, 40.00, 300.00, 1000.00),
      ('Venture Shares', 10000.00, 42.0000, 10.00, 40.00, 300.00, 1000.00),
      ('Space Shares', 65000.00, 185.0000, 10.00, 40.00, 300.00, 1000.00)
    `);
    console.log('✅ Investment categories inserted');

    // Insert wallet addresses
    await db.query(`
      INSERT IGNORE INTO wallet_addresses (crypto_type, address) VALUES
      ('Bitcoin', 'bc1q7a2atsnahug8q5cg8qpyl7n3c8f3u6acykthxh'),
      ('Ethereum', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B'),
      ('Doge', 'DBzZBv3nDadiC7oyxoW8PQDPs1UbL68irs'),
      ('Solana', 'dUbNVjuNMFnmFFd9ZzMdDUQJQ9RagXG7BRPAmS9KF2q'),
      ('Polygon', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B'),
      ('USDT (TRC20)', 'TQrZ3QTx3xfB3B9E8pGXEzC5RdGt4Mk9gh'),
      ('Binance Coin', 'bnb1nwhwu5ujyzy6z3xpx2mfpv6xwz5kkh7q8h3qv0'),
      ('Cardano', 'addr1qxpx2mfpv6xwz5kkh7q8h3qv0nwhwu5ujyzy6z3xpx2mfpv6xwz5kkh7q8h3qv0')
    `);
    console.log('✅ Wallet addresses inserted');

    // Get final stats
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [planCount] = await db.query('SELECT COUNT(*) as count FROM subscription_plans');
    const [categoryCount] = await db.query('SELECT COUNT(*) as count FROM investment_categories');
    
    console.log('🎉 Railway MySQL database setup complete!');
    
    res.json({
      success: true,
      message: 'Railway MySQL database setup completed successfully',
      database: 'Railway MySQL',
      tables_created: [
        'users', 'deposits', 'withdrawals', 'wallet_addresses', 'subscription_plans', 
        'pending_subscriptions', 'investment_categories', 'investments', 'transactions'
      ],
      stats: {
        users: userCount[0].count,
        subscription_plans: planCount[0].count,
        investment_categories: categoryCount[0].count
      },
      admin_user: 'teslawallet.tco@gmail.com'
    });

  } catch (error) {
    console.error('❌ Database setup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Railway MySQL database setup failed', 
      error: error.message 
    });
  }
});

module.exports = router;
