# familyBudget

A family budget management application with Django backend and React frontend.

---

## 🚀 Quick Start

### 1. Start Backend Server
```powershell
cd back
python manage.py runserver 127.0.0.1:8000
```

### 2. Start Frontend Server (in another terminal)
```powershell
cd front
npm start
```

Then open: **http://localhost:3000**

---

## 🔐 Login Credentials (Pre-created Test Accounts)

| Email | Password | Role |
|-------|----------|------|
| `admin1@example.com` | `adminpass123` | Admin |
| `member1@example.com` | `memberpass123` | Family Member |
| `kid1@example.com` | `kidpass123` | Kid |
| `solo@example.com` | `solopass123` | Solo User |

**All credentials have been tested and verified to work ✓**

---

## 📚 Documentation

### For Complete Authentication Documentation
See: **`AUTH_DOCUMENTATION.md`**
- All API endpoints with examples
- Request/response formats
- Error handling
- Password requirements
- Frontend integration guide

### For Quick Command Reference
See: **`QUICK_REFERENCE.md`**
- Copy-paste ready commands
- cURL examples for API testing
- Database commands
- Troubleshooting checklist

### For Project Cleanup Summary
See: **`CLEANUP_SUMMARY.md`**
- What was cleaned and fixed
- Remaining scripts
- Key fixes made this session

---

## 📋 Project Structure

```
familyBudget/
├── back/                          # Django backend
│   ├── manage.py
│   ├── db.sqlite3                 # Database
│   ├── requirements.txt
│   ├── family_budget/             # Django project config
│   ├── family_budget_app/         # Main app (models, views, serializers)
│   └── scripts/                   # Testing & utility scripts
│
├── front/                         # React frontend
│   ├── package.json
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/                 # Login, Register, Main dashboard
│   │   └── api/                   # API communication
│   └── public/
│
├── AUTH_DOCUMENTATION.md          # Complete API documentation
├── QUICK_REFERENCE.md             # Commands & examples
├── CLEANUP_SUMMARY.md             # Session cleanup log
└── README.md                      # This file
```

---

## 🔧 Tech Stack

### Backend
- **Python 3.x**
- **Django 5.2.7**
- **Django REST Framework**
- **Token Authentication**
- **SQLite3 Database**

### Frontend
- **React**
- **JavaScript (ES6+)**

---

## 🧪 Testing

Run the authentication test suite:
```powershell
cd back
python scripts/test_auth.py
```

Expected output: 5 successful logins ✓

---

## 🛠️ Available API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login user |
| GET | `/api/users/profile/` | Get user profile |
| GET | `/api/families/` | List families |
| POST | `/api/families/` | Create family |

Full documentation: See `AUTH_DOCUMENTATION.md`

---

## 🔑 Authentication

The system uses token-based authentication:

1. **Register** or **Login** via `/api/auth/register/` or `/api/auth/login/`
2. Receive authentication `token` in response
3. Use token in subsequent requests:
   ```
   Authorization: Token <your_token>
   ```

---

## 👥 User Roles

- **Admin** - Full access, family management
- **Family Member** - Member access to family data
- **Kid** - Limited access for children
- **Solo** - Individual user (no family)

Role-based dashboard redirects:
- Admin → `/admin-dashboard`
- Family Member → `/member-dashboard`
- Kid → `/kid-dashboard`
- Solo → `/solo-dashboard`

---

## ⚙️ Setup & Installation

### Backend Setup
```powershell
cd back
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### Frontend Setup
```powershell
cd front
npm install
npm start
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Ensure virtual environment is activated
- Run `python manage.py migrate` if database issues

### Frontend CORS error
- Ensure backend is running at `http://127.0.0.1:8000`
- Check backend logs for errors

### Invalid credentials
- Use credentials from the Quick Start section above
- All listed credentials have been tested and verified

### Database issues
- Backup `db.sqlite3`
- Run `python manage.py migrate` to sync migrations

See `QUICK_REFERENCE.md` for more troubleshooting tips.

---

## 📝 Latest Session Summary

### ✅ Completed
- Fixed authentication backend (token-based auth working)
- Connected frontend and backend (CORS configured)
- Implemented role-based redirects
- Fixed database schema (user_id consistency)
- Removed venv from git tracking
- Created comprehensive test suite (test_auth.py)
- Verified 5 pre-created test users working correctly
- Created complete authentication documentation

### 📊 Test Results
- Total test accounts: 10
- Successful logins: 5 ✓
- All working accounts verified with correct tokens and redirects
- Test credentials in Quick Start section above

---

## 📞 Need Help?

1. Check `QUICK_REFERENCE.md` for common commands
2. See `AUTH_DOCUMENTATION.md` for API details
3. Run `python scripts/test_auth.py` to verify system is working
4. Check backend and frontend terminal logs for errors

---

## 📌 Important Notes

- **Never commit `venv/` folder** - It's in `.gitignore`
- **Database file (`db.sqlite3`) is tracked** - Contains test data
- **Pre-created test users are in the database** - Use credentials above
- **CORS is configured for localhost:3000** - Don't change without reason
- **Token authentication required for API calls** - See AUTH_DOCUMENTATION.md

---

## 🎯 Next Steps for Development

1. **Implement Dashboard Pages**
   - Create admin dashboard (`/admin-dashboard`)
   - Create member dashboard (`/member-dashboard`)
   - Create kid dashboard (`/kid-dashboard`)
   - Create solo dashboard (`/solo-dashboard`)

2. **Complete Finance Features**
   - Budget tracking
   - Transaction management
   - Financial goals

3. **Family Management**
   - Family joining/invitations
   - User role management
   - Profile updates

---

**Status:** ✅ Authentication & Backend API Ready | Backend running on `http://127.0.0.1:8000` | Frontend running on `http://localhost:3000`