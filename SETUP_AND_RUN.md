# 🚀 Complete Setup & Run Guide

This guide will walk you through running the entire Family Budget application (backend + frontend) and accessing the dashboards.

## Prerequisites
- Python 3.9+ installed
- Node.js 16+ installed
- PostgreSQL or SQLite (already configured)

---

## 📋 Step-by-Step Setup

### Step 1: Backend Setup & Database Migrations

Open PowerShell and navigate to the backend folder:

```powershell
cd C:\Users\Jahs\WebstormProjects\familyBudget\back
```

**Activate Python virtual environment:**
```powershell
# If you have venv already created
.\venv\Scripts\Activate.ps1

# If you need to create venv first
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Install dependencies:**
```powershell
pip install -r requirements.txt
```

**Run database migrations:**
```powershell
python manage.py migrate
```

**Create test data (with family, users, and transactions):**
```powershell
Get-Content 'scripts/create_test_family_data.py' | python manage.py shell
```

**Start the Django backend server:**
```powershell
python manage.py runserver
```

Output should show:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ Backend is now running on `http://localhost:8000`

---

### Step 2: Frontend Setup

**Open a NEW PowerShell window** (keep backend running in the first one)

Navigate to frontend folder:
```powershell
cd C:\Users\Jahs\WebstormProjects\familyBudget\front
```

**Install dependencies (first time only):**
```powershell
npm install
```

**Set environment variables:**
```powershell
$env:REACT_APP_API_URL = "http://localhost:8000"
```

**Start React development server:**
```powershell
npm start
```

Output should show:
```
Compiled successfully!
You can now view family-budget in the browser.
  Local:            http://localhost:3000
```

✅ Frontend is now running on `http://localhost:3000`

---

## 🔐 Login Credentials

The test data created 3 users with different roles:

### **Solo User (Solo Dashboard)**
```
Email:    solo@testfamily.com
Password: testpass123
```
- ✅ See personal expenses
- ✅ View AI recommendations
- ✅ See category breakdown
- ❌ No family access

### **Family Admin (Family Dashboard)**
```
Email:    admin@testfamily.com
Password: testpass123
```
- ✅ See all family transactions
- ✅ View family member expenses
- ✅ View AI recommendations
- ✅ Access Family Dashboard

### **Family Member (Can see Family Dashboard)**
```
Email:    member@testfamily.com
Password: testpass123
```
- ✅ See family transactions
- ✅ View other family members' expenses
- ✅ Limited admin features

### **Kid (Kid Dashboard - Simple View)**
```
Email:    kid@testfamily.com
Password: testpass123
```
- ✅ See personal allowance/pocket money
- ❌ Cannot see family data
- ❌ Limited features

---

## 📊 Testing the Dashboards

### 1. **Solo Dashboard** (Personal Expenses)
- Login with: `solo@testfamily.com` / `testpass123`
- You'll see:
  - 💰 Total expenses summary
  - 📊 Transaction count
  - 📈 Average expense per transaction
  - 📋 Category breakdown table with percentages
  - 📝 Detailed transaction list
  - 💡 AI recommendations

### 2. **Family Dashboard** (Multi-user Family View)
- Login with: `admin@testfamily.com` / `testpass123` or `member@testfamily.com` / `testpass123`
- You'll see:
  - 👨‍👩‍👧‍👦 Family summary
  - 💰 Total family expenses
  - 👥 Family members list
  - 📊 Family transactions (all members combined)
  - 📈 Category breakdown for entire family
  - 💡 AI recommendations for family

### 3. **Kid Dashboard** (Limited View)
- Login with: `kid@testfamily.com` / `testpass123`
- You'll see:
  - Simple expense tracker
  - Personal transactions only
  - No family data access

---

## 🧪 Quick Test Checklist

After logging in, verify:

- [ ] Dashboard loads without errors
- [ ] Summary cards show numbers (total expenses, count, average)
- [ ] Category breakdown table displays all categories
- [ ] Transactions list shows expense details
- [ ] AI recommendations appear (if implemented)
- [ ] All text is in Russian (Мои Расходы, Категории, etc.)

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
```powershell
# Check if backend is running
curl http://localhost:8000/api/transactions/

# Should return JSON data
```

### "Token error / Not authenticated"
- Clear browser cookies: `F12 → Application → Cookies → Delete`
- Logout and login again

### "Database has no data"
```powershell
# Re-run test data script
Get-Content 'scripts/create_test_family_data.py' | python manage.py shell
```

### "Port 8000 or 3000 already in use"
```powershell
# Kill process using port 8000
Get-Process | Where-Object {$_.ProcessName -eq "python"} | Stop-Process -Force

# Kill process using port 3000
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### "npm start fails"
```powershell
# Clear node modules and reinstall
rm -r node_modules
npm install
npm start
```

---

## 📚 Architecture Summary

```
Browser (http://localhost:3000)
        ↓
React Frontend (Solo/Family/Kid Dashboard)
        ↓ (REST API calls)
Django Backend (http://localhost:8000)
        ↓
SQLite Database (db.sqlite3)
```

### Data Flow
1. **Login** → User enters email/password
2. **Token Exchange** → Backend returns auth token
3. **Store Token** → Frontend saves token in localStorage
4. **Dashboard Load** → Frontend fetches transactions via API
5. **Display Data** → Component renders transactions from database

---

## 🔗 Important URLs

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:3000 | React app (Solo/Family/Kid dashboards) |
| Backend API | http://localhost:8000/api/ | REST API endpoints |
| Admin Panel | http://localhost:8000/admin/ | Django admin (create users manually if needed) |
| Transactions | http://localhost:8000/api/transactions/ | Get/create transactions |
| Families | http://localhost:8000/api/families/ | Family management |
| AI | http://localhost:8000/api/ai/ | AI recommendations |

---

## 📝 Sample Test Data Created

**Family:** "Тестовая Семья" (Test Family)

**Users:**
- test_admin (admin@testfamily.com) - Role: Admin
- test_member (member@testfamily.com) - Role: Family Member
- test_kid (kid@testfamily.com) - Role: Kid

**Transactions:** 55 test transactions across:
- 🍽️ Еда (Food)
- 🚗 Транспорт (Transport)
- 🏠 Жилье (Housing)
- 💄 Красота (Beauty)
- 📚 Образование (Education)
- 🎮 Развлечение (Entertainment)
- 💊 Здоровье (Healthcare)
- 🛒 Покупки (Shopping)

---

## ✅ Verify Everything Works

Once both servers are running:

```powershell
# Test backend
curl http://localhost:8000/api/transactions/ -H "Authorization: Token YOUR_TOKEN"

# Test frontend loads
curl http://localhost:3000
```

Then open browser: **http://localhost:3000**

---

## 🔐 Test Credentials

Use the following credentials to login to the application:

### Family (Admin Access)
- **Email:** admin1@example.com
- **Password:** admin123

### Family Member
- **Email:** member1@example.com
- **Password:** member123

### Kid (Family Access)
- **Email:** kid1@example.com
- **Password:** kid123

### Solo User (Personal Budget)
- **Email:** solo@example.com
- **Password:** solo123

### Additional Test Users
- **Email:** zhaks@email.com  
  **Password:** password123

- **Email:** qq@email.com  
  **Password:** password123

- **Email:** test@example.com  
  **Password:** password123

Each user type has access to different dashboards:
- **Admin/Family Members:** Full Family Budget Dashboard with all members' data
- **Kid:** Limited family view with transaction tracking
- **Solo:** Personal Budget Dashboard with personal expenses only

---

## 🎯 Next Steps

1. ✅ Start backend server
2. ✅ Start frontend server
3. ✅ Open http://localhost:3000 in browser
4. ✅ Login with test credentials (see section above)
5. ✅ Explore Solo/Family dashboards
6. ✅ Check AI recommendations

Enjoy! 🎉
