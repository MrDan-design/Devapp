Write-Host "Starting Wallet App Backend Server..." -ForegroundColor Green

# Change to backend directory
Set-Location "c:\Users\HomePC\Devapp\Backend"

# Check if required files exist
if (!(Test-Path "app.js")) {
    Write-Host "Error: app.js not found!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

# Start the server
Write-Host "Starting server on port 4000..." -ForegroundColor Yellow
node app.js
