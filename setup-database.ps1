Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "        MySQL Database Setup for DevApp" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
Write-Host "🔍 Checking MySQL installation..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version 2>$null
    Write-Host "✅ MySQL found: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL command line not found!" -ForegroundColor Red
    Write-Host "Please install MySQL or add it to your PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "🔧 Database Setup Options:" -ForegroundColor Green
Write-Host "1. Auto-setup (try common passwords)" -ForegroundColor White
Write-Host "2. Manual setup (you provide password)" -ForegroundColor White
Write-Host "3. Import existing database dump" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choose option (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔄 Trying common MySQL passwords..." -ForegroundColor Yellow
        
        $passwords = @("", "root", "password", "mysql")
        $success = $false
        
        foreach ($pwd in $passwords) {
            $pwdText = if ($pwd -eq "") { "(empty)" } else { $pwd }
            Write-Host "   Testing password: $pwdText" -ForegroundColor Gray
            
            try {
                if ($pwd -eq "") {
                    $result = mysql -u root -e "CREATE DATABASE IF NOT EXISTS devapp; USE devapp; SELECT 'Success' as status;" 2>$null
                } else {
                    $result = mysql -u root -p$pwd -e "CREATE DATABASE IF NOT EXISTS devapp; USE devapp; SELECT 'Success' as status;" 2>$null
                }
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "   ✅ Success with password: $pwdText" -ForegroundColor Green
                    $success = $true
                    
                    # Update .env file
                    $envPath = "C:\Users\rrfm0\Desktop\devapp\Backend\.env"
                    if (Test-Path $envPath) {
                        $envContent = Get-Content $envPath
                        $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$pwd"
                        Set-Content $envPath $envContent
                        Write-Host "   ✅ .env file updated" -ForegroundColor Green
                    }
                    break
                }
            } catch {
                Write-Host "   ❌ Failed" -ForegroundColor Red
            }
        }
        
        if (-not $success) {
            Write-Host "❌ All common passwords failed" -ForegroundColor Red
            Write-Host "Please try option 2 (manual setup)" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        $password = Read-Host "Enter MySQL root password" -AsSecureString
        $pwd = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        Write-Host "🔄 Testing connection..." -ForegroundColor Yellow
        try {
            mysql -u root -p$pwd -e "CREATE DATABASE IF NOT EXISTS devapp;"
            Write-Host "✅ Database created successfully!" -ForegroundColor Green
            
            # Update .env
            $envPath = "C:\Users\rrfm0\Desktop\devapp\Backend\.env"
            if (Test-Path $envPath) {
                $envContent = Get-Content $envPath
                $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$pwd"
                Set-Content $envPath $envContent
                Write-Host "✅ .env file updated" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Connection failed" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📁 Looking for database files..." -ForegroundColor Yellow
        
        $databasePath = "C:\Users\rrfm0\Desktop\devapp\database"
        $fullSql = Join-Path $databasePath "devapp_full.sql"
        $schemaSql = Join-Path $databasePath "schema.sql"
        
        if (Test-Path $fullSql) {
            Write-Host "✅ Found: devapp_full.sql" -ForegroundColor Green
            $password = Read-Host "Enter MySQL root password" -AsSecureString
            $pwd = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            
            Write-Host "📥 Importing database..." -ForegroundColor Yellow
            mysql -u root -p$pwd devapp < $fullSql
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database imported successfully!" -ForegroundColor Green
            } else {
                Write-Host "❌ Import failed" -ForegroundColor Red
            }
        } elseif (Test-Path $schemaSql) {
            Write-Host "✅ Found: schema.sql" -ForegroundColor Green
            # Similar import process
        } else {
            Write-Host "❌ No database files found" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "Invalid option" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🧪 Testing final connection..." -ForegroundColor Yellow
Set-Location "C:\Users\rrfm0\Desktop\devapp\Backend"
node test-mysql-simple.js

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "            Setup Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the connection with: node test-mysql-simple.js" -ForegroundColor White
Write-Host "2. Start your backend: node app.js" -ForegroundColor White
Write-Host "3. Test your application" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
