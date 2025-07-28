@echo off
echo ===============================================
echo          DevApp Frontend Startup
echo ===============================================
echo.

cd /d "C:\Users\rrfm0\Desktop\devapp\frontend"

echo Current directory: %CD%
echo.

echo Checking if node_modules exists...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting frontend development server...
echo Frontend will be available at: http://localhost:5174
echo.

npm run dev

pause
