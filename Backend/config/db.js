require('dotenv').config();

// Detect environment - if DATABASE_URL exists, we're on Render (PostgreSQL)
// Otherwise, we're local (MySQL)
const isRender = !!process.env.DATABASE_URL;

let db;

if (isRender) {
    // PostgreSQL for Render
    const { Pool } = require('pg');
    
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    console.log('🐘 Using PostgreSQL for Render deployment');
    
    // Test connection
    db.query('SELECT NOW() AS current_time')
        .then(result => {
            console.log('✅ PostgreSQL Database connected successfully');
        })
        .catch(err => {
            console.error('❌ PostgreSQL Database connection failed:', err.message);
        });
        
} else {
    // MySQL for local development
    const mysql = require('mysql2/promise');
    
    db = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'devapp',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    
    console.log('🐬 Using MySQL for local development');
    
    // Test connection
    db.getConnection()
        .then(connection => {
            console.log('✅ MySQL Database connected successfully');
            connection.release();
        })
        .catch(err => {
            console.error('❌ MySQL Database connection failed:', err.message);
        });
}

// Database abstraction layer - converts between PostgreSQL and MySQL syntax
const dbQuery = async (sql, params = []) => {
    if (isRender) {
        // PostgreSQL - use $1, $2, $3 syntax and return .rows
        let pgSql = sql;
        let paramIndex = 1;
        
        // Replace each ? with $1, $2, $3, etc.
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
        
        // Handle MySQL backtick identifiers - convert to PostgreSQL double quotes
        pgSql = pgSql.replace(/`([^`]+)`/g, '"$1"');
        
        console.log('🐘 PostgreSQL Query:', pgSql, 'Params:', params);
        
        const result = await db.query(pgSql, params);
        return [result.rows]; // Return in MySQL format [rows]
    } else {
        // MySQL - use ? syntax and return [rows]
        return await db.query(sql, params);
    }
};

// Export the abstracted query function
module.exports = {
    query: dbQuery,
    isRender,
    rawConnection: db
};