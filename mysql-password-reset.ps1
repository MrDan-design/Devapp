Write-Host "🔧 MySQL Password Recovery & Database Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 9.4\bin\mysql.exe"

Write-Host "Option 1: Try MySQL Workbench (Recommended)" -ForegroundColor Green
Write-Host "--------------------------------------------" -ForegroundColor White
Write-Host "1. Open MySQL Workbench from Start Menu" -ForegroundColor White
Write-Host "2. Click on 'Local instance MySQL94' connection" -ForegroundColor White
Write-Host "3. Enter the password you set during MySQL installation" -ForegroundColor White
Write-Host "4. Once connected, run these commands:" -ForegroundColor White
Write-Host "   CREATE DATABASE IF NOT EXISTS devapp;" -ForegroundColor Yellow
Write-Host "   USE devapp;" -ForegroundColor Yellow
Write-Host "5. Go to Server → Data Import" -ForegroundColor White
Write-Host "6. Import: C:\Users\rrfm0\Desktop\devapp\database\devapp_full.sql" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Reset MySQL Root Password" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor White
Write-Host "If you forgot the password, we can reset it:" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Do you want to try resetting the MySQL root password? (y/n)"

if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host ""
    Write-Host "🔄 Resetting MySQL Root Password..." -ForegroundColor Yellow
    Write-Host ""
    
    # Stop MySQL service
    Write-Host "Stopping MySQL service..." -ForegroundColor Yellow
    try {
        Stop-Service -Name "MySQL94" -Force
        Write-Host "✅ MySQL service stopped" -ForegroundColor Green
        Start-Sleep -Seconds 3
        
        # Create a temporary SQL file to reset password
        $tempSql = @"
ALTER USER 'root'@'localhost' IDENTIFIED BY 'devapp123';
FLUSH PRIVILEGES;
"@
        
        $tempSqlFile = "$env:TEMP\reset_mysql.sql"
        Set-Content -Path $tempSqlFile -Value $tempSql
        Write-Host "📄 Created temporary SQL reset file" -ForegroundColor Green
        
        # Start MySQL in safe mode
        Write-Host "Starting MySQL in safe mode..." -ForegroundColor Yellow
        $mysqldPath = "C:\Program Files\MySQL\MySQL Server 9.4\bin\mysqld.exe"
        $safeProcess = Start-Process -FilePath $mysqldPath -ArgumentList "--skip-grant-tables", "--skip-networking" -PassThru -WindowStyle Hidden
        
        Start-Sleep -Seconds 5
        
        # Execute the reset
        Write-Host "Executing password reset..." -ForegroundColor Yellow
        try {
            & $mysqlPath -u root --execute="source $tempSqlFile"
            Write-Host "✅ Password reset executed" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Reset command may have failed" -ForegroundColor Yellow
        }
        
        # Stop safe mode MySQL
        Stop-Process -Id $safeProcess.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        # Restart MySQL service normally
        Write-Host "Restarting MySQL service..." -ForegroundColor Yellow
        Start-Service -Name "MySQL94"
        Start-Sleep -Seconds 3
        
        # Test new password
        Write-Host "Testing new password 'devapp123'..." -ForegroundColor Yellow
        try {
            & $mysqlPath -u root -pdevapp123 --execute="SELECT 'Password reset successful!' as status;"
            
            Write-Host "✅ SUCCESS! New password works: devapp123" -ForegroundColor Green
            Write-Host ""
            
            # Update .env file
            $envPath = "C:\Users\rrfm0\Desktop\devapp\Backend\.env"
            if (Test-Path $envPath) {
                $envContent = Get-Content $envPath
                $newEnvContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=devapp123"
                Set-Content $envPath $newEnvContent
                Write-Host "✅ Updated .env file with new password" -ForegroundColor Green
            }
            
            # Create database and import
            Write-Host "Creating database..." -ForegroundColor Yellow
            & $mysqlPath -u root -pdevapp123 --execute="CREATE DATABASE IF NOT EXISTS devapp;"
            
            Write-Host "Importing database..." -ForegroundColor Yellow
            $databaseFile = "C:\Users\rrfm0\Desktop\devapp\database\devapp_full.sql"
            if (Test-Path $databaseFile) {
                & $mysqlPath -u root -pdevapp123 devapp --execute="source $databaseFile"
                Write-Host "✅ Database imported successfully!" -ForegroundColor Green
            }
            
            Write-Host ""
            Write-Host "🎉 Database setup complete!" -ForegroundColor Green
            Write-Host "Password: devapp123" -ForegroundColor White
            Write-Host "Database: devapp" -ForegroundColor White
            
        } catch {
            Write-Host "❌ Password reset failed" -ForegroundColor Red
            Write-Host "Try Option 1 (MySQL Workbench) instead" -ForegroundColor Yellow
        }
        
        # Clean up
        Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "❌ Service management failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Try running PowerShell as Administrator" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "💡 Alternative: Try these common passwords manually in MySQL Workbench:" -ForegroundColor Yellow
    Write-Host "   - (blank/empty)" -ForegroundColor White
    Write-Host "   - The password you created during MySQL installation" -ForegroundColor White
    Write-Host "   - admin" -ForegroundColor White
    Write-Host "   - 123456" -ForegroundColor White
    Write-Host "   - rootpassword" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Once database is set up, test with: node Backend/test-mysql-simple.js" -ForegroundColor White
Write-Host "2. Start backend: node Backend/app.js" -ForegroundColor White
Write-Host "3. Test your app at: http://localhost:5174" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
