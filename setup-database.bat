@echo off
echo ===============================================
echo        MySQL Database Setup for DevApp
echo ===============================================
echo.

echo This script will help you fix the MySQL database connection
echo.

echo Step 1: Testing MySQL Connection
echo ================================
echo.

echo Trying to connect to MySQL...
mysql --version
if errorlevel 1 (
    echo MySQL command line not found!
    echo Please install MySQL or add it to your PATH
    pause
    exit /b 1
)

echo.
echo Step 2: Connect to MySQL and Setup Database
echo ===========================================
echo.
echo You will need to enter your MySQL root password.
echo If you don't know it, try these common passwords:
echo   - (empty - just press Enter)
echo   - root
echo   - password
echo   - mysql
echo.

echo Connecting to MySQL as root...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS devapp; SHOW DATABASES;"

if errorlevel 1 (
    echo.
    echo ❌ MySQL connection failed!
    echo.
    echo Please try these solutions:
    echo 1. Reset MySQL root password
    echo 2. Use MySQL Workbench to connect
    echo 3. Check if MySQL service is running
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database connection successful!
echo.

echo Step 3: Import Database Schema
echo ==============================
echo.

cd /d "%~dp0.."
echo Current directory: %CD%

if exist "database\devapp_full.sql" (
    echo Importing full database...
    mysql -u root -p devapp < database\devapp_full.sql
    echo ✅ Full database imported!
) else if exist "database\schema.sql" (
    echo Importing schema...
    mysql -u root -p devapp < database\schema.sql
    echo ✅ Schema imported!
) else (
    echo ❌ No database files found!
    echo Expected: database\devapp_full.sql or database\schema.sql
    pause
    exit /b 1
)

echo.
echo Step 4: Test Connection
echo ======================
echo.

mysql -u root -p devapp -e "SHOW TABLES; SELECT COUNT(*) as user_count FROM users;"

echo.
echo ===============================================
echo            Database Setup Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Update your .env file if needed
echo 2. Restart your backend server
echo 3. Test the application
echo.

pause
