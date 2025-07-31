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

// Database abstraction layer - handles PostgreSQL vs MySQL differences
const dbQuery = async (sql, params = []) => {
    try {
        if (isRender) {
            // PostgreSQL (Render) - use $1, $2, $3 syntax
            let pgSql = sql;
            let paramIndex = 1;
            
            // Replace each ? with $1, $2, $3, etc.
            pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
            
            // Handle MySQL backtick identifiers - convert to PostgreSQL double quotes
            pgSql = pgSql.replace(/`([^`]+)`/g, '"$1"');
            
            if (process.env.NODE_ENV === 'development') {
                console.log('🐘 PostgreSQL Query:', pgSql, 'Params:', params);
            }
            
            // PostgreSQL returns { rows: [...], rowCount: n }
            const result = await db.query(pgSql, params);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('🐘 PostgreSQL Result rows:', result.rows?.length || 0);
            }
            
            // Return in consistent format: [rows]
            return [result.rows || []];
            
        } else {
            // MySQL (Local) - use ? syntax
            if (process.env.NODE_ENV === 'development') {
                console.log('🐬 MySQL Query:', sql, 'Params:', params);
            }
            
            // MySQL with mysql2/promise returns [rows, fields]
            const [rows, fields] = await db.query(sql, params);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('🐬 MySQL Result rows:', rows?.length || 0);
            }
            
            // Return in consistent format: [rows]
            return [rows || []];
        }
    } catch (error) {
        console.error('❌ Database Query Error:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ SQL:', sql);
            console.error('❌ Params:', params);
        }
        throw error;
    }
};

// Export the abstracted query function
module.exports = {
    query: dbQuery,
    isRender,
    rawConnection: db
};