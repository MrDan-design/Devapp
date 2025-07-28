@echo off
echo ===============================================
echo        MySQL Password Discovery Tool
echo ===============================================
echo.

echo Testing common MySQL passwords...
echo.

REM Test 1: Empty password
echo Testing: Empty password
mysql -u root -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Empty password works!
    goto :setup_database
)
echo ❌ Failed: Empty password

REM Test 2: Password "root"
echo Testing: Password "root"
mysql -u root -proot -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Password "root" works!
    set MYSQL_PASS=root
    goto :setup_database
)
echo ❌ Failed: Password "root"

REM Test 3: Password "password"
echo Testing: Password "password"
mysql -u root -ppassword -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Password "password" works!
    set MYSQL_PASS=password
    goto :setup_database
)
echo ❌ Failed: Password "password"

REM Test 4: Password "mysql"
echo Testing: Password "mysql"
mysql -u root -pmysql -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Password "mysql" works!
    set MYSQL_PASS=mysql
    goto :setup_database
)
echo ❌ Failed: Password "mysql"

REM Test 5: Current .env password
echo Testing: Current .env password
mysql -u root -pLightholdbossamuelebiloma4321$$ -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: .env password works!
    set MYSQL_PASS=Lightholdbossamuelebiloma4321$$
    goto :setup_database
)
echo ❌ Failed: .env password

echo.
echo ❌ All common passwords failed!
echo.
echo 🔧 Manual steps required:
echo 1. Try MySQL Workbench or phpMyAdmin
echo 2. Reset MySQL root password
echo 3. Or provide the correct password manually
echo.

echo Would you like to try entering the password manually? (y/n)
set /p manual_input=
if /i "%manual_input%"=="y" goto :manual_password

echo.
echo You can also try these advanced options:
echo 1. Reset MySQL root password using safe mode
echo 2. Create a new MySQL user for the app
echo 3. Use MySQL Workbench to manage the database
echo.
pause
goto :end

:manual_password
echo.
echo Please enter your MySQL root password:
set /p MYSQL_PASS=Password: 

echo Testing provided password...
mysql -u root -p%MYSQL_PASS% -e "SELECT 'SUCCESS' as result" 2>nul
if %errorlevel% == 0 (
    echo ✅ SUCCESS: Your password works!
    goto :setup_database
) else (
    echo ❌ Failed: Password incorrect
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
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS devapp;"
) else (
    mysql -u root -p%MYSQL_PASS% -e "CREATE DATABASE IF NOT EXISTS devapp;"
)

if %errorlevel% == 0 (
    echo ✅ Database "devapp" created successfully!
) else (
    echo ❌ Failed to create database
    pause
    goto :end
)

echo.
echo Importing database schema...
cd /d "%~dp0"

if exist "database\devapp_full.sql" (
    echo Found devapp_full.sql - importing full database...
    if "%MYSQL_PASS%"=="" (
        mysql -u root devapp < database\devapp_full.sql
    ) else (
        mysql -u root -p%MYSQL_PASS% devapp < database\devapp_full.sql
    )
    
    if %errorlevel% == 0 (
        echo ✅ Full database imported successfully!
    ) else (
        echo ❌ Failed to import database
    )
) else if exist "database\schema.sql" (
    echo Found schema.sql - importing schema...
    if "%MYSQL_PASS%"=="" (
        mysql -u root devapp < database\schema.sql
    ) else (
        mysql -u root -p%MYSQL_PASS% devapp < database\schema.sql
    )
    
    if %errorlevel% == 0 (
        echo ✅ Schema imported successfully!
    ) else (
        echo ❌ Failed to import schema
    )
) else (
    echo ❌ No database files found in database\ folder
)

echo.
echo Updating .env file...
cd Backend
if exist ".env" (
    echo Backing up current .env...
    copy .env .env.backup >nul
    
    echo Updating DB_PASSWORD in .env...
    powershell -Command "(Get-Content .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%MYSQL_PASS%' | Set-Content .env"
    echo ✅ .env file updated!
) else (
    echo ❌ .env file not found
)

echo.
echo Testing final connection...
node test-mysql-simple.js

echo.
echo ===============================================
echo            Database Setup Complete!
echo ===============================================
echo.
echo Your MySQL credentials:
echo Username: root
echo Password: %MYSQL_PASS%
echo Database: devapp
echo.
echo Next steps:
echo 1. Start your backend: node app.js
echo 2. Test your application at http://localhost:5174
echo.

:end
pause
