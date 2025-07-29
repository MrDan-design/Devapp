# 🚀 Deploy Backend to Render.com

## 📋 **Step-by-Step Deployment**

### **1. Create Render Account**
- Go to [render.com](https://render.com)
- Sign up with GitHub (recommended)
- Connect your GitHub repository

### **2. Create PostgreSQL Database**
1. **Dashboard** → **New** → **PostgreSQL**
2. **Name**: `devapp-database`
3. **Plan**: Free (512 MB)
4. **Region**: Choose closest to your users
5. Click **Create Database**
6. **Copy connection details** (you'll need these)

### **3. Create Web Service**
1. **Dashboard** → **New** → **Web Service**
2. **Connect Repository**: `MrDan-design/Devapp`
3. **Configuration**:
   - **Name**: `devapp-backend`
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
   - **Plan**: Free ($0/month)

### **4. Environment Variables**
Add these in **Environment** tab:

```
DB_HOST=dpg-d2411druibrs73aesjk0-a.oregon-postgres.render.com
DB_USER=devapp_database_user
DB_PASSWORD=4dpOwTsWVeVL9TVhmWETeiUDCWbgu12Z
DB_NAME=devapp_database
JWT_SECRET=41667d3f76ef579322571709f54753a3f46206584013049ec54424644986e70df581d72df5e452abfff9397760eebf1af7e82f2489f55f79f561185c55fb633f
PORT=4000
FRONTEND_URL=https://tslaxai.io
GMAIL_USER=teslawallet.tco@gmail.com
GMAIL_PASS=fnyaneqpmfsnsrdv
```

**🔍 Here's how I mapped your database details:**
- **DB_HOST**: `dpg-d2411druibrs73aesjk0-a.oregon-postgres.render.com` (External hostname)
- **DB_USER**: `devapp_database_user` (Username)  
- **DB_PASSWORD**: `4dpOwTsWVeVL9TVhmWETeiUDCWbgu12Z` (Password)
- **DB_NAME**: `devapp_database` (Database name)

### **5. Deploy**
1. Click **Create Web Service**
2. Wait for deployment (3-5 minutes)
3. Your backend will be available at: `https://devapp-backend-<random>.onrender.com`

### **6. Update Frontend Environment**
Once deployed, update `frontend/.env`:

```env
VITE_API_BASE_URL=https://devapp-backend-<your-render-url>.onrender.com/api
VITE_OAUTH_BASE_URL=https://devapp-backend-<your-render-url>.onrender.com/api
```

### **7. Database Setup**

**Option A: Use Render's Database Console**
1. Go to your PostgreSQL database in Render dashboard
2. Click **"Connect"** → **"PSQL"** 
3. Copy and paste the entire content from `database/postgresql_schema.sql`
4. Execute the SQL commands

**Option B: Use Local Connection**
```bash
# Use the PSQL command from your database details
PGPASSWORD=4dpOwTsWVeVL9TVhmWETeiUDCWbgu12Z psql -h dpg-d2411druibrs73aesjk0-a.oregon-postgres.render.com -U devapp_database_user devapp_database

# Then copy/paste the SQL from database/postgresql_schema.sql
```

**What this creates:**
- ✅ All tables (users, investments, deposits, withdrawals, etc.)
- ✅ Sample data (subscription plans, wallet addresses)
- ✅ Admin user (email: teslawallet.tco@gmail.com, password: admin123)
- ✅ Foreign key relationships
```

## 🎯 **Why Render over Vercel for Backend?**

| Feature | Render | Vercel |
|---------|--------|---------|
| **Database** | ✅ Built-in PostgreSQL/MySQL | ❌ External only |
| **Always-on** | ✅ Real server | ❌ Serverless cold starts |
| **File uploads** | ✅ Persistent storage | ❌ Temporary only |
| **WebSockets** | ✅ Full support | ❌ Limited |
| **Background jobs** | ✅ Supported | ❌ Not ideal |
| **Free tier** | ✅ 750 hours/month | ✅ Function limits |

## 📱 **After Deployment:**

1. **Test API**: `https://your-backend.onrender.com/api/health`
2. **Update frontend** environment variables
3. **Redeploy frontend** to pick up new API URL
4. **Test authentication** from your live site

## 🔄 **Auto-Deploy Setup:**
Render will automatically redeploy when you push to your `main` branch!

---

**Need help?** The deployment usually takes 3-5 minutes. Let me know once you have the Render URL and I'll help update your frontend configuration!
