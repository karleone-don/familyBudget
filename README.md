# 💰 Family Budget Application

A comprehensive family budget management system with role-based access control, multi-user transaction tracking, AI-powered recommendations, and beautiful React dashboards.

---

## 🎯 Project Overview

**Family Budget** is a full-stack application that helps families manage their finances collaboratively. Users can:
- Track personal and family expenses
- Categorize transactions
- View spending patterns
- Get AI-powered budget recommendations
- Manage family members and roles

**Technology Stack:**
- **Backend:** Django 4.2.7 + Django REST Framework
- **Frontend:** React 19.2.0 with React Router
- **Database:** SQLite
- **Authentication:** Token-based (DRF)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Setup Instructions

#### 1️⃣ Backend Setup

```powershell
# Navigate to backend
cd back

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create test data (55 transactions with 3 users)
Get-Content scripts/create_test_family_data.py | python manage.py shell

# Start server
python manage.py runserver
```

**Backend runs on:** http://localhost:8000

#### 2️⃣ Frontend Setup

```powershell
# In a new terminal, navigate to frontend
cd front

# Install dependencies
npm install

# Set environment variable
$env:REACT_APP_API_URL = "http://localhost:8000"

# Start dev server
npm start
```

**Frontend runs on:** http://localhost:3000

---

## 🔐 Test Credentials

### Family "Тестовая Семья" (Test Family)

| User | Email | Password | Role | Dashboard |
|------|-------|----------|------|-----------|
| **Admin** | admin@testfamily.com | testpass123 | Family Admin | Family Dashboard |
| **Member** | member@testfamily.com | testpass123 | Family Member | Family Dashboard |
| **Kid** | kid@testfamily.com | testpass123 | Kid | Solo Dashboard |

---

## 📊 Dashboard Features

### Family Dashboard (Admin & Member)
- **Family Summary:** Total expenses, member count
- **Member List:** View all family members
- **Transactions:** All family expenses combined (55 test records)
- **Category Breakdown:** Spending by category with percentages
- **Spending Trends:** Historical patterns
- **AI Recommendations:** Budget optimization tips

### Solo Dashboard (Kid & Solo users)
- **Personal Summary:** Total expenses, transaction count, average
- **Category Breakdown:** Personal expenses by category with visualization
- **Transaction List:** Detailed personal transaction history
- **AI Recommendations:** Personalized savings tips

---

## 🏗️ Architecture

### Data Model

```
User (AbstractUser)
├── email, username, password
├── age, family_id, role_id
└── Finance (one-to-one)
    └── income, expenses, balance

Family
├── family_name, join_code
└── members (multiple Users)

Transaction
├── date, amount, description, type
├── finance_id (FK)
├── category_id (FK)
└── user (via Finance)

Category
├── category_name
├── user_id (NULL = shared/public)
└── transactions (multiple)

Role
├── role_name (admin, family_member, kid, solo)
└── users (multiple)
```

### API Endpoints

**Authentication:**
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration

**Transactions:**
- `GET /api/transactions/` - List user's transactions
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/by_category/` - Group by category
- `GET /api/transactions/by_user/` - Group by user

**Family:**
- `GET /api/families/my_family/` - Get user's family
- `GET /api/families/family_members/` - List family members
- `GET /api/families/family_transactions/` - All family transactions

**AI:**
- `GET /api/ai/recommendations/` - Get budget recommendations

---

## 📁 Project Structure

```
familyBudget/
├── back/                          # Django Backend
│   ├── family_budget/             # Project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── family_budget_app/         # Main app
│   │   ├── models.py              # Database models
│   │   ├── views.py               # API ViewSets
│   │   ├── serializers.py         # DRF Serializers
│   │   ├── urls.py                # API routes
│   │   ├── ai_service.py          # AI recommendations
│   │   ├── migrations/            # Database migrations
│   │   └── management/
│   │       └── commands/
│   │           └── create_roles.py
│   ├── scripts/                   # Utility scripts
│   │   └── create_test_family_data.py
│   ├── manage.py
│   ├── requirements.txt           # Python dependencies
│   └── db.sqlite3                 # SQLite database
│
├── front/                         # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js                 # Main app with routes
│   │   ├── index.js
│   │   ├── api/                   # API client functions
│   │   │   ├── auth.js
│   │   │   └── ai.js
│   │   ├── pages/                 # React components
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Solo/              # Personal dashboard
│   │   │   ├── Family/            # Family dashboard
│   │   │   ├── FamilyMember/      # Family member view
│   │   │   ├── AI/
│   │   │   └── Main/
│   │   └── setupTests.js
│   ├── package.json               # npm dependencies
│   └── .env.example               # Environment variables
│
├── README.md                      # This file
└── SETUP_AND_RUN.md              # Detailed setup guide
```

---

## 🧪 Testing

### Test Data Included
- **Family:** "Тестовая Семья" (Test Family)
- **Users:** 3 test accounts with different roles
- **Transactions:** 55 test records across 10 categories
- **Date Range:** Nov-Dec 2025
- **Categories:** Food, Transport, Housing, Beauty, Education, Entertainment, Healthcare, Shopping

### API Testing

```bash
# Login and get token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@testfamily.com", "password":"testpass123"}'

# Fetch transactions
curl -X GET http://localhost:8000/api/transactions/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Get family data
curl -X GET http://localhost:8000/api/families/my_family/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

---

## 🐛 Troubleshooting

### Common Issues

**"Port 8000 already in use"**
```powershell
# Kill the process using port 8000
Get-Process | Where-Object {$_.ProcessName -eq "python"} | Stop-Process -Force
```

**"Cannot connect to backend"**
- Verify backend is running on http://localhost:8000
- Check firewall settings
- Ensure API_URL environment variable is set correctly

**"404 errors on API calls"**
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache and cookies
- Verify backend routes match frontend API calls

**"No data displaying"**
- Ensure test data was created: `python manage.py shell < scripts/create_test_family_data.py`
- Check browser console for API errors (F12)
- Verify auth token is stored in localStorage

**"npm start fails"**
```powershell
# Clear node modules and reinstall
rm -r node_modules package-lock.json
npm install
npm start
```

---

## 📝 Development Notes

### Key Features Implemented

✅ Token-based authentication  
✅ Role-based access control (Admin, Member, Kid, Solo)  
✅ Multi-user family transactions  
✅ Category-based expense tracking  
✅ Personal vs family transaction filtering  
✅ AI budget recommendations  
✅ Responsive React dashboards  
✅ SQLite database with proper relationships  
✅ REST API with DRF  
✅ Test data generation script  

### Frontend Routes

```javascript
GET  /                      // Home page
GET  /login                 // Login page
GET  /register              // Registration page
GET  /solo                  // Solo dashboard (personal expenses)
GET  /family                // Family dashboard
GET  /family-member/:userId // Family member view
GET  /admin-dashboard       // Routes to Family dashboard (admin role)
GET  /member-dashboard      // Routes to Family dashboard (member role)
GET  /kid-dashboard         // Routes to Solo dashboard (kid role)
GET  /solo-dashboard        // Routes to Solo dashboard (solo role)
GET  /ai-assistant          // AI recommendations page
```

---

## 🚀 Deployment

### Backend (Django)
```bash
# Install production dependencies
pip install gunicorn whitenoise

# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn
gunicorn family_budget.wsgi:application --bind 0.0.0.0:8000
```

### Frontend (React)
```bash
# Build for production
npm run build

# The build folder is ready to be deployed to any static hosting service
```

---

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👥 Contributors

Created as a comprehensive family budget management solution with AI-powered recommendations.

---

## 🎉 Ready to Use!

Both backend and frontend are fully functional and tested. Start the servers and login with test credentials to explore the features!

```
Backend:  http://localhost:8000
Frontend: http://localhost:3000

Test Email: admin@testfamily.com
Password: testpass123
```

Happy budgeting! 💰
