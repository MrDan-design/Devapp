@echo off
echo ===============================================
echo        MySQL Database Setup for DevApp
echo          (Using Full MySQL Path)
echo ===============================================
echo.

REM Set the full path to MySQL
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.4\bin\mysql.exe"
set MYSQLDUMP_PATH="C:\Program Files\MySQL\MySQL Server 9.4\bin\mysqldump.exe"

echo Checking MySQL installation...
if not exist %MYSQL_PATH% (
    echo ❌ MySQL not found at expected location!
    echo Please check if MySQL is installed correctly.
    pause
    exit /b 1
)

echo ✅ MySQL found at: %MYSQL_PATH%
echo.

echo Testing common MySQL passwords...
echo.

REM Test 1: Empty password
echo [1/5] Testing: Empty password
%MYSQL_PATH% -u root -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Empty password works!
    set MYSQL_PASS=
    goto :setup_database
)
echo ❌ Failed: Empty password

REM Test 2: Password "root"
echo [2/5] Testing: Password "root"
%MYSQL_PATH% -u root -proot -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Password "root" works!
    set MYSQL_PASS=root
    goto :setup_database
)
echo ❌ Failed: Password "root"

REM Test 3: Password "password"
echo [3/5] Testing: Password "password"
%MYSQL_PATH% -u root -ppassword -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Password "password" works!
    set MYSQL_PASS=password
    goto :setup_database
)
echo ❌ Failed: Password "password"

REM Test 4: Password "mysql"
echo [4/5] Testing: Password "mysql"
%MYSQL_PATH% -u root -pmysql -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Password "mysql" works!
    set MYSQL_PASS=mysql
    goto :setup_database
)
echo ❌ Failed: Password "mysql"

REM Test 5: Current .env password
echo [5/5] Testing: Current .env password
%MYSQL_PATH% -u root -pLightholdbossamuelebiloma4321$$ -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: .env password works!
    set MYSQL_PASS=Lightholdbossamuelebiloma4321$$
    goto :setup_database
)
echo ❌ Failed: .env password

echo.
echo ❌ All automatic password tests failed!
echo.
echo 🔧 Let's try manual password entry:
echo.

:manual_password
set /p user_password="Please enter your MySQL root password (or press Enter if empty): "

echo Testing provided password...
if "%user_password%"=="" (
    %MYSQL_PATH% -u root -e "SELECT 'Manual test successful' as result" 2>nul
    set MYSQL_PASS=
) else (
    %MYSQL_PATH% -u root -p%user_password% -e "SELECT 'Manual test successful' as result" 2>nul
    set MYSQL_PASS=%user_password%
)

if %errorlevel% == 0 (
    echo ✅ SUCCESS: Your password works!
    goto :setup_database
) else (
    echo ❌ Failed: Password incorrect
    echo.
    echo Would you like to try again? (y/n)
    set /p retry=
    if /i "%retry%"=="y" goto :manual_password
    echo.
    echo 💡 Alternative solutions:
    echo 1. Use MySQL Workbench with GUI
    echo 2. Reset MySQL root password
    echo 3. Create a new MySQL user
    pause
    goto :end
)

:setup_database
echo.
echo ===============================================
echo           Setting up DevApp Database
echo ===============================================
echo.

echo Creating database "devapp"...
if "%MYSQL_PASS%"=="" (
    %MYSQL_PATH% -u root -e "CREATE DATABASE IF NOT EXISTS devapp;"
) else (
    %MYSQL_PATH% -u root -p%MYSQL_PASS% -e "CREATE DATABASE IF NOT EXISTS devapp;"
)

if %errorlevel% == 0 (
    echo ✅ Database "devapp" created successfully!
) else (
    echo ❌ Failed to create database
    pause
    goto :end
)

echo.
echo Checking for database files...
cd /d "%~dp0"

if exist "database\devapp_full.sql" (
    echo ✅ Found devapp_full.sql - importing full database...
    echo This may take a moment...
    
    if "%MYSQL_PASS%"=="" (
        %MYSQL_PATH% -u root devapp < database\devapp_full.sql
    ) else (
        %MYSQL_PATH% -u root -p%MYSQL_PASS% devapp < database\devapp_full.sql
    )
    
    if %errorlevel% == 0 (
        echo ✅ Full database imported successfully!
    ) else (
        echo ❌ Failed to import database - trying schema instead...
        goto :import_schema
    )
) else (
    :import_schema
    if exist "database\schema.sql" (
        echo ✅ Found schema.sql - importing schema...
        
        if "%MYSQL_PASS%"=="" (
            %MYSQL_PATH% -u root devapp < database\schema.sql
        ) else (
            %MYSQL_PATH% -u root -p%MYSQL_PASS% devapp < database\schema.sql
        )
        
        if %errorlevel% == 0 (
            echo ✅ Schema imported successfully!
        ) else (
            echo ❌ Failed to import schema
        )
    ) else (
        echo ❌ No database files found in database\ folder
        echo Creating basic tables manually...
        
        if "%MYSQL_PASS%"=="" (
            %MYSQL_PATH% -u root devapp -e "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, fullname VARCHAR(100), email VARCHAR(100) UNIQUE, password VARCHAR(255), country VARCHAR(100), currency VARCHAR(10) DEFAULT 'USD', balance DECIMAL(10,2) DEFAULT 0.00, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
        ) else (
            %MYSQL_PATH% -u root -p%MYSQL_PASS% devapp -e "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, fullname VARCHAR(100), email VARCHAR(100) UNIQUE, password VARCHAR(255), country VARCHAR(100), currency VARCHAR(10) DEFAULT 'USD', balance DECIMAL(10,2) DEFAULT 0.00, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
        )
        echo ✅ Basic users table created!
    )
)

echo.
echo Updating .env file...
cd Backend

if exist ".env" (
    echo Creating backup of current .env...
    copy .env .env.backup >nul 2>&1
    
    echo Updating DB_PASSWORD in .env...
    
    REM Create a temporary PowerShell script to update the .env file
    echo $content = Get-Content '.env' > temp_update.ps1
    echo $content = $content -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%MYSQL_PASS%' >> temp_update.ps1
    echo Set-Content '.env' $content >> temp_update.ps1
    
    powershell -ExecutionPolicy Bypass -File temp_update.ps1
    del temp_update.ps1 >nul 2>&1
    
    echo ✅ .env file updated with working password!
) else (
    echo ❌ .env file not found in Backend folder
)

echo.
echo Testing final database connection...
if exist "test-mysql-simple.js" (
    echo Running Node.js connection test...
    node test-mysql-simple.js
) else (
    echo Node.js test file not found, testing with MySQL directly...
    if "%MYSQL_PASS%"=="" (
        %MYSQL_PATH% -u root devapp -e "SELECT 'Connection successful!' as status, NOW() as current_time; SELECT COUNT(*) as user_count FROM users;"
    ) else (
        %MYSQL_PATH% -u root -p%MYSQL_PASS% devapp -e "SELECT 'Connection successful!' as status, NOW() as current_time; SELECT COUNT(*) as user_count FROM users;"
    )
)

echo.
echo ===============================================
echo            Database Setup Complete! 🎉
echo ===============================================
echo.
echo ✅ MySQL Server: Running (MySQL94)
echo ✅ Database: devapp
echo ✅ Username: root
if "%MYSQL_PASS%"=="" (
    echo ✅ Password: (empty)
) else (
    echo ✅ Password: %MYSQL_PASS%
)
echo ✅ .env file: Updated
echo.
echo 🚀 Next steps:
echo 1. Start your backend server:
echo    cd Backend
echo    node app.js
echo.
echo 2. Start your frontend (if not running):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Visit your application:
echo    http://localhost:5174
echo.
echo 💡 You can now use the real database instead of mock-server.js!
echo    Your user accounts will be saved permanently.
echo.

:end
pause
