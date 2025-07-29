const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://devapp_user:hJQn0A85Q0qxODKBP6h4A6r7hV6KJFWO@dpg-cuon32dumphs73dshbq0-a.oregon-postgres.render.com/devapp',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupTables() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Check existing tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📊 Existing tables:', tables.rows.map(r => r.table_name));

    // Create deposits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        method VARCHAR(20) NOT NULL,
        crypto_type VARCHAR(20),
        amount_usd DECIMAL(10, 2),
        tx_hash TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created deposits table');

    // Create withdrawals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        usd_value DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created withdrawals table');

    // Check final tables
    const finalTables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('🎉 Final tables:', finalTables.rows.map(r => r.table_name));

    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setupTables();
