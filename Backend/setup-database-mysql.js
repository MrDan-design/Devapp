const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        // First connect without specifying database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Create database if it doesn't exist
        await connection.execute('CREATE DATABASE IF NOT EXISTS devapp');
        console.log('✅ Database devapp created/verified');
        
        // Close connection and reconnect to the specific database
        await connection.end();
        
        // Connect to the devapp database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            database: 'devapp'  // Now specify the database
        });
        
        console.log('✅ Connected to devapp database');
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
                console.log('✅ Executed:', statement.substring(0, 50) + '...');
            }
        }
        
        console.log('✅ Database schema setup complete!');
        
        // Test with a simple query
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Tables created:', tables.map(t => Object.values(t)[0]).join(', '));
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if called directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('🎉 Database setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = setupDatabase;
