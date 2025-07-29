// Quick database table setup script
const express = require('express');
const db = require('./Backend/config/db');

async function createMissingTables() {
  try {
    console.log('🚀 Creating missing database tables...');

    // Create deposits table
    await db.query(`
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

    // Create withdrawals table
    await db.query(`
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

    console.log('✅ Tables created successfully!');
    
    // Test the tables
    const depositTest = await db.query('SELECT COUNT(*) as count FROM deposits');
    const withdrawalTest = await db.query('SELECT COUNT(*) as count FROM withdrawals');
    
    console.log(`📊 Deposits table: ${depositTest.rows[0].count} records`);
    console.log(`📊 Withdrawals table: ${withdrawalTest.rows[0].count} records`);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return false;
  }
}

createMissingTables();
