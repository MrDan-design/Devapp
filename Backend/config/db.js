require('dotenv').config();
const mysql = require('mysql2/promise');

// MySQL configuration for both local and production
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'devapp',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Production SSL settings for Railway
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('🐬 Connecting to MySQL database...');
console.log('Host:', dbConfig.host);
console.log('Database:', dbConfig.database);
console.log('Port:', dbConfig.port);

const db = mysql.createPool(dbConfig);

// Test connection
db.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL Database connection failed:', err.message);
        console.error('Connection config:', { ...dbConfig, password: '[HIDDEN]' });
    });

// Simplified database query function - MySQL only
const dbQuery = async (sql, params = []) => {
    try {
        console.log('� MySQL Query:', sql);
        console.log('🐬 MySQL Params:', params);
        
        // MySQL with mysql2/promise returns [rows, fields]
        const [rows, fields] = await db.query(sql, params);
        
        console.log('🐬 MySQL Result rows:', rows?.length || 0);
        
        // Return in consistent format: [rows]
        return [rows || []];
        
    } catch (error) {
        console.error('❌ Database Query Error:', error.message);
        console.error('❌ SQL:', sql);
        console.error('❌ Params:', params);
        throw error;
    }
};

// Export the query function and raw connection
module.exports = {
    query: dbQuery,
    rawConnection: db
};