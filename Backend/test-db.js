const mysql = require('mysql2');
require('dotenv').config();

console.log('Testing MySQL connection...');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('✓ Database connected successfully!');
    
    // Test a simple query
    connection.query('SELECT NOW() as current_time', (err, results) => {
        if (err) {
            console.error('Query failed:', err);
        } else {
            console.log('✓ Query successful:', results[0]);
        }
        connection.end();
    });
});
