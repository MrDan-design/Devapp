Write-Host "=== Backend Server Startup Test ===" -ForegroundColor Cyan
Write-Host ""

# Set working directory
$backendDir = "c:\Users\rrfm0\Desktop\devapp\Backend"
Set-Location $backendDir

Write-Host "Working directory: $backendDir" -ForegroundColor Yellow
Write-Host ""

# Test 1: Check files exist
Write-Host "1. Checking required files..." -ForegroundColor Green
if (Test-Path "app.js") { Write-Host "✓ app.js found" -ForegroundColor Green } else { Write-Host "✗ app.js missing" -ForegroundColor Red }
if (Test-Path ".env") { Write-Host "✓ .env found" -ForegroundColor Green } else { Write-Host "✗ .env missing" -ForegroundColor Red }
if (Test-Path "package.json") { Write-Host "✓ package.json found" -ForegroundColor Green } else { Write-Host "✗ package.json missing" -ForegroundColor Red }
if (Test-Path "node_modules") { Write-Host "✓ node_modules found" -ForegroundColor Green } else { Write-Host "✗ node_modules missing" -ForegroundColor Red }
Write-Host ""

# Test 2: Check Node.js
Write-Host "2. Checking Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
}
Write-Host ""

# Test 3: Test database connection
Write-Host "3. Testing database connection..." -ForegroundColor Green
node test-mysql.js
Write-Host ""

# Test 4: Check if port 4000 is available
Write-Host "4. Checking port 4000..." -ForegroundColor Green
$portCheck = netstat -an | findstr :4000
if ($portCheck) {
    Write-Host "⚠ Port 4000 is already in use:" -ForegroundColor Yellow
    Write-Host $portCheck
} else {
    Write-Host "✓ Port 4000 is available" -ForegroundColor Green
}
Write-Host ""

# Test 5: Start minimal server
Write-Host "5. Starting minimal server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
node minimal-server.js
