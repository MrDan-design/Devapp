const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'devapp',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL Database connection failed:', err.message);
    });

// Handle pool errors
pool.on('error', (err) => {
    console.error('MySQL Pool Error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect...');
    }
});

module.exports = pool;
