# MySQL Database Setup Guide for DevApp

## Quick Solution Options

### Option 1: Use the Password Finder Script
1. Open Command Prompt as Administrator
2. Navigate to: `C:\Users\rrfm0\Desktop\devapp`
3. Run: `mysql-password-finder.bat`
4. Follow the prompts

### Option 2: Manual MySQL Setup

#### Step 1: Find Your MySQL Password
Try these common passwords in MySQL Workbench or command line:
- (empty password)
- `root`
- `password`
- `mysql`
- The password you set during MySQL installation

#### Step 2: Connect to MySQL
```cmd
mysql -u root -p
```
Enter your password when prompted.

#### Step 3: Create Database
```sql
CREATE DATABASE IF NOT EXISTS devapp;
USE devapp;
```

#### Step 4: Import Database
Exit MySQL and run:
```cmd
cd C:\Users\rrfm0\Desktop\devapp
mysql -u root -p devapp < database\devapp_full.sql
```

#### Step 5: Update .env File
Update `Backend\.env` with the working password:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_working_password
DB_NAME=devapp
```

### Option 3: Reset MySQL Root Password

If you forgot the password:

#### Windows Method:
1. Open Services (Win+R → services.msc)
2. Stop "MySQL" service
3. Open Command Prompt as Administrator
4. Run: `mysqld --skip-grant-tables --shared-memory`
5. Open another Command Prompt:
```cmd
mysql -u root
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```
6. Restart MySQL service
7. Use 'newpassword' as your MySQL password

### Option 4: Use MySQL Workbench (Easiest)

1. Open MySQL Workbench
2. Try connecting with different passwords
3. Once connected, run these queries:
```sql
CREATE DATABASE IF NOT EXISTS devapp;
USE devapp;
```
4. Go to Server → Data Import
5. Select "Import from Self-Contained File"
6. Choose: `C:\Users\rrfm0\Desktop\devapp\database\devapp_full.sql`
7. Select "devapp" as Default Target Schema
8. Click "Start Import"

## After Successful Setup

### Test the Connection:
```cmd
cd C:\Users\rrfm0\Desktop\devapp\Backend
node test-mysql-simple.js
```

### Start Your Backend:
```cmd
node app.js
```

### Test Your App:
Visit: `http://localhost:5174`

## Troubleshooting

### Common Issues:
1. **MySQL not found**: Add MySQL to your PATH environment variable
2. **Access denied**: Wrong password - try the reset method
3. **Database import fails**: Check file permissions and paths
4. **Connection timeout**: Check if MySQL service is running

### Get MySQL Path:
Usually located at: `C:\Program Files\MySQL\MySQL Server X.X\bin\`

### Check MySQL Service:
```cmd
net start | findstr MySQL
```

## Quick Commands Reference

```cmd
# Test connection
mysql -u root -p -e "SELECT 'Connected!' as status"

# Create database
mysql -u root -p -e "CREATE DATABASE devapp"

# Import database
mysql -u root -p devapp < database\devapp_full.sql

# Check tables
mysql -u root -p devapp -e "SHOW TABLES"
```
