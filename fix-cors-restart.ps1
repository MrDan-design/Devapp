Write-Host "🔧 Fixing CORS Issue and Restarting Backend..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location "c:\Users\rrfm0\Desktop\devapp\Backend"

# Stop existing Node processes
Write-Host "⏹️ Stopping existing Node.js processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Existing processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ No existing Node processes found" -ForegroundColor Gray
}

# Wait a moment
Start-Sleep -Seconds 2

# Check port availability
$portTest = Test-NetConnection -ComputerName localhost -Port 4000 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portTest) {
    Write-Host "⚠ Port 4000 still in use. Waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "🚀 Starting backend server with fixed CORS configuration..." -ForegroundColor Green
Write-Host "   • Allowing origin: http://localhost:5174 (your frontend)" -ForegroundColor White
Write-Host "   • Backend URL: http://localhost:4000" -ForegroundColor White
Write-Host "   • Health check: http://localhost:4000/health" -ForegroundColor White
Write-Host ""

# Start the server
node start-all.js
