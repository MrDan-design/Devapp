@echo off
echo Fixing CORS and restarting backend server...
echo.

cd /d "c:\Users\rrfm0\Desktop\devapp\Backend"

echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Waiting for processes to stop...
timeout /t 2 /nobreak >nul

echo Starting backend server with fixed CORS...
echo Backend will be available at: http://localhost:4000
echo CORS enabled for: http://localhost:5174 (your frontend)
echo.

node start-all.js

pause
