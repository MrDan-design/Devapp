const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔧 MySQL Database Setup & Troubleshooting');
console.log('==========================================');
console.log('');

async function setupDatabase() {
    // Step 1: Test connection without password (for initial setup)
    console.log('📋 Step 1: Testing MySQL connection options...');
    
    const connectionOptions = [
        // Try with current .env password
        {
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD,
            name: 'Current .env password'
        },
        // Try with empty password
        {
            host: 'localhost',
            user: 'root',
            password: '',
            name: 'Empty password'
        },
        // Try with common passwords
        {
            host: 'localhost',
            user: 'root',
            password: 'root',
            name: 'Password: root'
        },
        {
            host: 'localhost',
            user: 'root',
            password: 'password',
            name: 'Password: password'
        },
        {
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            name: 'Password: mysql'
        }
    ];

    let workingConnection = null;

    for (const option of connectionOptions) {
        try {
            console.log(`   Testing: ${option.name}...`);
            const connection = await mysql.createConnection({
                host: option.host,
                user: option.user,
                password: option.password
            });
            
            console.log(`   ✅ SUCCESS: ${option.name} works!`);
            workingConnection = option;
            await connection.end();
            break;
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        }
    }

    if (!workingConnection) {
        console.log('');
        console.log('❌ No working MySQL connection found!');
        console.log('');
        console.log('🔧 Manual Fix Required:');
        console.log('1. Open MySQL Command Line Client or MySQL Workbench');
        console.log('2. Reset root password with:');
        console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'newpassword\';');
        console.log('3. Update .env file with the new password');
        console.log('');
        return false;
    }

    console.log('');
    console.log('📋 Step 2: Setting up database and user...');

    try {
        const connection = await mysql.createConnection({
            host: workingConnection.host,
            user: workingConnection.user,
            password: workingConnection.password
        });

        // Create database if it doesn't exist
        console.log('   Creating database "devapp"...');
        await connection.execute('CREATE DATABASE IF NOT EXISTS devapp');
        console.log('   ✅ Database "devapp" ready');

        // Create a dedicated user for the app
        console.log('   Creating app user...');
        try {
            await connection.execute('DROP USER IF EXISTS \'devapp_user\'@\'localhost\'');
            await connection.execute('CREATE USER \'devapp_user\'@\'localhost\' IDENTIFIED BY \'devapp_password\'');
            await connection.execute('GRANT ALL PRIVILEGES ON devapp.* TO \'devapp_user\'@\'localhost\'');
            await connection.execute('FLUSH PRIVILEGES');
            console.log('   ✅ User "devapp_user" created with password "devapp_password"');
        } catch (userError) {
            console.log('   ⚠ User creation failed, will use root:', userError.message);
        }

        await connection.end();

        // Step 3: Test app database connection
        console.log('');
        console.log('📋 Step 3: Testing app database connection...');

        // Try with new user first
        let appConnection = null;
        try {
            appConnection = await mysql.createConnection({
                host: 'localhost',
                user: 'devapp_user',
                password: 'devapp_password',
                database: 'devapp'
            });
            console.log('   ✅ App user connection successful!');
            
            // Update .env recommendation
            console.log('');
            console.log('🔄 Recommended .env settings:');
            console.log('DB_HOST=localhost');
            console.log('DB_USER=devapp_user');
            console.log('DB_PASSWORD=devapp_password');
            console.log('DB_NAME=devapp');

        } catch (error) {
            // Fall back to root
            appConnection = await mysql.createConnection({
                host: workingConnection.host,
                user: workingConnection.user,
                password: workingConnection.password,
                database: 'devapp'
            });
            console.log('   ✅ Root connection to devapp database successful!');
            
            console.log('');
            console.log('🔄 Update your .env file:');
            console.log(`DB_HOST=localhost`);
            console.log(`DB_USER=${workingConnection.user}`);
            console.log(`DB_PASSWORD=${workingConnection.password}`);
            console.log(`DB_NAME=devapp`);
        }

        // Test a simple query
        const [rows] = await appConnection.execute('SELECT NOW() as current_time');
        console.log('   ✅ Test query successful:', rows[0].current_time);

        await appConnection.end();

        console.log('');
        console.log('✅ Database setup complete!');
        console.log('');
        console.log('🚀 Next steps:');
        console.log('1. Update your .env file with the working credentials above');
        console.log('2. Import the database schema: mysql -u [user] -p devapp < database/devapp_full.sql');
        console.log('3. Restart your backend server');

        return true;

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        return false;
    }
}

setupDatabase().catch(console.error);
