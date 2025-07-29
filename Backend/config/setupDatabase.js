const pool = require('../config/db');

// Database setup function
async function setupDatabase() {
    try {
        console.log('🚀 Setting up database tables...');

        // Create tables SQL
        const createTablesSQL = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            fullname VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            balance DECIMAL(10, 2) DEFAULT 0.00,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            country VARCHAR(100),
            currency VARCHAR(10) DEFAULT 'USD',
            provider VARCHAR(20),
            provider_id VARCHAR(100),
            next_of_kin VARCHAR(255),
            next_of_kin_number VARCHAR(255),
            profile_image VARCHAR(255),
            subscription_plan_id INTEGER
        );

        -- Subscription plans table
        CREATE TABLE IF NOT EXISTS subscription_plans (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            benefits TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- User shares table
        CREATE TABLE IF NOT EXISTS user_shares (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            company_symbol VARCHAR(10) NOT NULL,
            shares_owned DECIMAL(10, 4) NOT NULL,
            total_invested_usd DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Investment categories table
        CREATE TABLE IF NOT EXISTS investment_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            min_amount DECIMAL(10, 2) NOT NULL,
            min_shares DECIMAL(10, 4) NOT NULL,
            roi_5days DECIMAL(6, 2) DEFAULT 10.00,
            roi_1month DECIMAL(6, 2) DEFAULT 40.00,
            roi_3months DECIMAL(6, 2) DEFAULT 300.00,
            roi_annual DECIMAL(6, 2) DEFAULT 1000.00
        );

        -- Investments table
        CREATE TABLE IF NOT EXISTS investments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            category_id INTEGER,
            amount_invested DECIMAL(10, 2),
            shares_given DECIMAL(10, 4),
            duration VARCHAR(20) CHECK (duration IN ('5days', '1month', '3months', 'annual')),
            start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_date TIMESTAMP,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
            roi_percent DECIMAL(5, 2),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES investment_categories(id)
        );

        -- Deposits table
        CREATE TABLE IF NOT EXISTS deposits (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            method VARCHAR(20) NOT NULL CHECK (method IN ('crypto', 'gift_card')),
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
        );

        -- Withdrawals table
        CREATE TABLE IF NOT EXISTS withdrawals (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            shares_symbol VARCHAR(10),
            shares_amount DECIMAL(10, 4),
            usd_value DECIMAL(10, 2),
            crypto_symbol VARCHAR(20),
            crypto_amount DECIMAL(18, 8),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Chats table
        CREATE TABLE IF NOT EXISTS chats (
            id SERIAL PRIMARY KEY,
            user1_id INTEGER NOT NULL,
            user2_id INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Messages table
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'bot')),
            sender_id INTEGER,
            receiver_id INTEGER,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            chat_id INTEGER NOT NULL
        );

        -- Pending subscriptions table
        CREATE TABLE IF NOT EXISTS pending_subscriptions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            payment_proof VARCHAR(255),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
        );

        -- Wallet addresses table
        CREATE TABLE IF NOT EXISTS wallet_addresses (
            id SERIAL PRIMARY KEY,
            crypto_type VARCHAR(50) NOT NULL,
            address TEXT NOT NULL
        );
        `;

        // Execute table creation
        await pool.query(createTablesSQL);
        console.log('✅ Tables created successfully');

        // Insert sample data
        const insertDataSQL = `
        -- Insert subscription plans
        INSERT INTO subscription_plans (name, price, benefits) VALUES
        ('Megapack Momentum', 7155.99, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team'),
        ('Xploration Zenith', 2820.00, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team'),
        ('Hyperloop Horizon', 1250.00, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning'),
        ('Falcon Flight', 450.00, 'No withdrawal limit, Account on max security, VVIP granted'),
        ('Boring Blueprint', 180.55, 'Withdrawal limit, Account on max security')
        ON CONFLICT DO NOTHING;

        -- Insert investment categories
        INSERT INTO investment_categories (name, min_amount, min_shares, roi_5days, roi_1month, roi_3months, roi_annual) VALUES
        ('Small Investors', 100.00, 0.2000, 10.00, 40.00, 300.00, 1000.00),
        ('XAI shares', 250.00, 4.0000, 10.00, 40.00, 300.00, 1000.00),
        ('Model 3 Shares', 2000.00, 20.0000, 10.00, 40.00, 300.00, 1000.00),
        ('Venture Shares', 10000.00, 42.0000, 10.00, 40.00, 300.00, 1000.00),
        ('Space Shares', 65000.00, 185.0000, 10.00, 40.00, 300.00, 1000.00)
        ON CONFLICT DO NOTHING;

        -- Insert wallet addresses
        INSERT INTO wallet_addresses (crypto_type, address) VALUES
        ('Bitcoin', 'bc1q7a2atsnahug8q5cg8qpyl7n3c8f3u6acykthxh'),
        ('Ethereum', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B'),
        ('Doge', 'DBzZBv3nDadiC7oyxoW8PQDPs1UbL68irs'),
        ('Solana', 'dUbNVjuNMFnmFFd9ZzMdDUQJQ9RagXG7BRPAmS9KF2q'),
        ('Polygon', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B')
        ON CONFLICT DO NOTHING;

        -- Insert admin user (password: admin123)
        INSERT INTO users (fullname, email, password, is_admin) VALUES
        ('Tesla Wallet Admin', 'teslawallet.tco@gmail.com', '$2b$10$8VE5QdpFDGS058iV9fy.jen9lUO5Gv.1kWrd3obI6fRM4uf763ivW', true)
        ON CONFLICT (email) DO NOTHING;
        `;

        await pool.query(insertDataSQL);
        console.log('✅ Sample data inserted successfully');

        // Add foreign key constraints after data insertion
        const constraintsSQL = `
        -- Add foreign key constraint for users table
        ALTER TABLE users 
        ADD CONSTRAINT fk_subscription_plan 
        FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id);
        `;

        try {
            await pool.query(constraintsSQL);
            console.log('✅ Foreign key constraints added');
        } catch (err) {
            console.log('⚠️ Foreign key constraints already exist or failed:', err.message);
        }

        return { success: true, message: 'Database setup completed successfully!' };

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        return { success: false, message: error.message };
    }
}

module.exports = { setupDatabase };
