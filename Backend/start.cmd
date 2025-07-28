@echo off
echo Starting DevApp Backend Server...
echo =================================
echo.

echo Environment Check:
node --version
echo Current directory: %CD%
echo.

echo Starting server with CORS fix...
echo Server will be available at: http://localhost:4000
echo CORS enabled for: http://localhost:5174
echo.

node start-all.js
