@echo off
title DevApp Full Stack Startup
color 0A

echo ===============================================
echo           DevApp Full Stack Startup
echo ===============================================
echo.

echo [STEP 1] Starting Backend Server...
echo ===============================================
cd /d "c:\Users\rrfm0\Desktop\devapp\Backend"
echo Current directory: %CD%
echo.

echo Testing backend startup...
start "Backend Server" cmd /k "node start-all.js"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo [STEP 2] Starting Frontend Development Server...
echo ===============================================
cd /d "c:\Users\rrfm0\Desktop\devapp\frontend"
echo Current directory: %CD%
echo.

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo [STEP 3] Opening Test Pages...
echo ===============================================
timeout /t 5 /nobreak >nul

echo Opening backend health check...
start http://localhost:4000/health

timeout /t 2 /nobreak >nul

echo Opening frontend application...
start http://localhost:5174

echo.
echo ===============================================
echo           Both servers should be running!
echo ===============================================
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5174
echo.
echo Check the opened windows for any errors.
echo You can now test the beautiful authentication form!
echo.
pause
