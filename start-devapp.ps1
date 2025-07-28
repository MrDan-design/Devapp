Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "           DevApp Full Stack Startup" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]$Port
        $listener.Start()
        $listener.Stop()
        return $false  # Port is available
    } catch {
        return $true   # Port is in use
    }
}

# Check ports
Write-Host "[PORT CHECK] Checking if ports are available..." -ForegroundColor Yellow
if (Test-Port 4000) {
    Write-Host "⚠ Port 4000 is already in use. Backend server might already be running." -ForegroundColor Yellow
} else {
    Write-Host "✓ Port 4000 is available for backend" -ForegroundColor Green
}

if (Test-Port 5174) {
    Write-Host "⚠ Port 5174 is already in use. Frontend server might already be running." -ForegroundColor Yellow
} else {
    Write-Host "✓ Port 5174 is available for frontend" -ForegroundColor Green
}
Write-Host ""

# Start Backend
Write-Host "[STEP 1] Starting Backend Server..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Set-Location "c:\Users\rrfm0\Desktop\devapp\Backend"
Write-Host "Backend directory: $(Get-Location)" -ForegroundColor Yellow

# Start backend in new window
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { Write-Host 'Backend Server Starting...' -ForegroundColor Green; node start-all.js }" -PassThru
Write-Host "✓ Backend server started in separate window (PID: $($backendProcess.Id))" -ForegroundColor Green

# Wait for backend to start
Write-Host "Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host ""
Write-Host "[STEP 2] Starting Frontend Development Server..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Set-Location "c:\Users\rrfm0\Desktop\devapp\frontend"
Write-Host "Frontend directory: $(Get-Location)" -ForegroundColor Yellow

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Start frontend in new window
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev }" -PassThru
Write-Host "✓ Frontend server started in separate window (PID: $($frontendProcess.Id))" -ForegroundColor Green

# Wait for frontend to start
Write-Host "Waiting 8 seconds for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Open browsers
Write-Host ""
Write-Host "[STEP 3] Opening Applications..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

Write-Host "Opening backend health check..." -ForegroundColor Yellow
Start-Process "http://localhost:4000/health"

Start-Sleep -Seconds 2

Write-Host "Opening frontend application..." -ForegroundColor Yellow
Start-Process "http://localhost:5174"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "           🚀 DevApp is now running!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Server:  http://localhost:4000" -ForegroundColor White
Write-Host "Frontend App:    http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "✨ Features ready to test:" -ForegroundColor Cyan
Write-Host "  • Beautiful authentication form with gradients" -ForegroundColor White
Write-Host "  • User signup and login functionality" -ForegroundColor White
Write-Host "  • MySQL database integration" -ForegroundColor White
Write-Host "  • CORS-enabled API communication" -ForegroundColor White
Write-Host ""
Write-Host "💡 Try creating a new account or logging in!" -ForegroundColor Yellow
Write-Host ""

# Keep script running
Write-Host "Press any key to close this window (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
