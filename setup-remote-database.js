const { Pool } = require('pg');

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗃️ Setting up missing database tables...');

    // Check existing tables
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Existing tables:', existingTables.rows.map(row => row.table_name));

    // Create deposits table
    await client.query(`
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
      )
    `);
    console.log('✅ Created deposits table');

    // Create withdrawals table
    await client.query(`
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
        approved_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created withdrawals table');

    // Create subscription_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        benefits TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created subscription_plans table');

    // Create pending_subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        payment_proof VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
      )
    `);
    console.log('✅ Created pending_subscriptions table');

    // Create investment_categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS investment_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        min_amount DECIMAL(10, 2) NOT NULL,
        min_shares DECIMAL(10, 4) NOT NULL,
        roi_5days DECIMAL(6, 2) DEFAULT 10.00,
        roi_1month DECIMAL(6, 2) DEFAULT 40.00,
        roi_3months DECIMAL(6, 2) DEFAULT 300.00,
        roi_annual DECIMAL(6, 2) DEFAULT 1000.00
      )
    `);
    console.log('✅ Created investment_categories table');

    // Create investments table
    await client.query(`
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
      )
    `);
    console.log('✅ Created investments table');

    // Insert subscription plans
    await client.query(`
      INSERT INTO subscription_plans (name, price, benefits) VALUES
      ('Megapack Momentum', 7155.99, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team'),
      ('Xploration Zenith', 2820.00, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning, Meet and Greet with the team'),
      ('Hyperloop Horizon', 1250.00, 'No withdrawal limit, Account on max security, VVIP granted, Cyber truck auctioning'),
      ('Falcon Flight', 450.00, 'No withdrawal limit, Account on max security, VVIP granted'),
      ('Boring Blueprint', 180.55, 'Withdrawal limit, Account on max security')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Inserted subscription plans');

    // Insert investment categories
    await client.query(`
      INSERT INTO investment_categories (name, min_amount, min_shares, roi_5days, roi_1month, roi_3months, roi_annual) VALUES
      ('Small Investors', 100.00, 0.2000, 10.00, 40.00, 300.00, 1000.00),
      ('XAI shares', 250.00, 4.0000, 10.00, 40.00, 300.00, 1000.00),
      ('Model 3 Shares', 2000.00, 20.0000, 10.00, 40.00, 300.00, 1000.00),
      ('Venture Shares', 10000.00, 42.0000, 10.00, 40.00, 300.00, 1000.00),
      ('Space Shares', 65000.00, 185.0000, 10.00, 40.00, 300.00, 1000.00)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Inserted investment categories');

    // Check final table count
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('🎉 Database setup complete!');
    console.log('📊 Final tables:', finalTables.rows.map(row => row.table_name));
    
    // Test a query to make sure everything works
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users: ${userCount.rows[0].count}`);
    
    const depositCount = await client.query('SELECT COUNT(*) as count FROM deposits');
    console.log(`💰 Total deposits: ${depositCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Database setup error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
