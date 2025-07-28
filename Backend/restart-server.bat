@echo off
echo ===============================================
echo    Restarting DevApp Backend with New APIs
echo ===============================================
echo.

echo Stopping existing Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Waiting for processes to stop...
timeout /t 2 /nobreak >nul

echo Starting updated mock server...
echo New endpoints added:
echo   • GET /api/users/balance (with auth)
echo   • GET /api/stocks/top
echo.

node mock-server.js

pause
