@echo off
echo === Backend Server Test ===
echo.

cd /d "c:\Users\rrfm0\Desktop\devapp\Backend"

echo Current directory: %CD%
echo.

echo Testing Node.js...
node --version
echo.

echo Testing database connection...
node test-mysql.js
echo.

echo Checking port 4000...
netstat -an | findstr :4000
if errorlevel 1 (
    echo Port 4000 is available
) else (
    echo Port 4000 is in use
)
echo.

echo Starting minimal server...
echo Press Ctrl+C to stop
echo.
node minimal-server.js

pause
