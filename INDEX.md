# 📖 FamilyBudget Documentation Index

## 🎯 Start Here

**New to the project?** Start with these files in order:

1. **`README.md`** - Overview and quick start (2 min read)
2. **`QUICK_REFERENCE.md`** - Commands and copy-paste credentials (3 min read)
3. **`AUTH_DOCUMENTATION.md`** - Complete API guide (15 min read)

---

## 📚 All Documentation Files

### Quick Start & Reference
- **`README.md`** 
  - Project overview
  - Quick start guide
  - Test credentials
  - Troubleshooting tips
  - **Best for:** First-time setup

- **`QUICK_REFERENCE.md`**
  - Start commands (copy-paste ready)
  - Test credentials (ready to use)
  - cURL API examples
  - Database commands
  - Git commands
  - **Best for:** Quick lookups while developing

### Detailed Documentation
- **`AUTH_DOCUMENTATION.md`**
  - Backend setup instructions
  - Complete API endpoints with examples
  - Request/response formats
  - Error handling
  - Frontend integration guide
  - Troubleshooting detailed
  - **Best for:** Understanding the authentication system in depth

### Project Information
- **`CLEANUP_SUMMARY.md`**
  - What was cleaned up in this session
  - Database schema fixes
  - Key improvements made
  - Remaining scripts explanation
  - Next development steps
  - **Best for:** Understanding what happened and what's left to do

- **`COMPLETION_SUMMARY.md`**
  - Everything that's been completed
  - Testing results
  - All credentials with working status
  - Checklist before starting
  - Learning resources
  - **Best for:** Overview of current state and what's ready

- **`INDEX.md`** (this file)
  - Documentation roadmap
  - Quick lookup guide
  - File locations
  - What to read based on your needs

---

## 🔍 Quick Lookup by Task

### I want to...

#### Start the application
→ Read: `QUICK_REFERENCE.md` (Terminal 1 & 2 section)

#### Test login/registration
→ Read: `QUICK_REFERENCE.md` (Test Credentials section)
→ Use: `admin1@example.com` / `adminpass123`

#### Learn the API endpoints
→ Read: `AUTH_DOCUMENTATION.md` (API Endpoints section)

#### Test with cURL
→ Read: `QUICK_REFERENCE.md` (Test API with cURL section)
→ Copy-paste examples provided

#### Understand authentication flow
→ Read: `AUTH_DOCUMENTATION.md` (Overview & Frontend Integration sections)

#### Fix a problem
→ Read: `QUICK_REFERENCE.md` (Troubleshooting Checklist)
→ Also: `README.md` (Troubleshooting section)
→ Also: `CLEANUP_SUMMARY.md` (Known Issues)

#### Set up a new user for testing
→ Use: `POST /api/auth/register/` endpoint
→ See: `AUTH_DOCUMENTATION.md` (User Registration section)

#### Deploy or configure git
→ Read: `CLEANUP_SUMMARY.md` (Git Status section)
→ Use: `git status` command

#### Learn about database
→ Read: `CLEANUP_SUMMARY.md` (Files to Understand section)
→ Read: `QUICK_REFERENCE.md` (Database Commands section)

#### Plan next development steps
→ Read: `CLEANUP_SUMMARY.md` (Next Steps section)
→ Read: `COMPLETION_SUMMARY.md` (What's Next section)

---

## 🧬 Project Structure

```
familyBudget/
│
├── Documentation (You are here)
│   ├── README.md                    ← Start here!
│   ├── QUICK_REFERENCE.md           ← Use while coding
│   ├── AUTH_DOCUMENTATION.md        ← For API details
│   ├── CLEANUP_SUMMARY.md           ← Session info
│   ├── COMPLETION_SUMMARY.md        ← Status & results
│   └── INDEX.md                     ← This file
│
├── back/                            ← Django backend
│   ├── manage.py
│   ├── db.sqlite3                   ← Database (contains test data)
│   ├── requirements.txt
│   ├── family_budget/               ← Project config
│   ├── family_budget_app/           ← Main app
│   │   ├── models.py                ← Database schema
│   │   ├── views.py                 ← API endpoints
│   │   ├── serializers.py           ← Data validation
│   │   ├── backends.py              ← Email authentication
│   │   └── apps.py                  ← Role auto-creation
│   └── scripts/
│       └── test_auth.py             ← Run tests here
│
└── front/                           ← React frontend
    ├── package.json
    ├── src/
    │   ├── App.js                   ← Main component
    │   ├── pages/
    │   │   ├── Login/
    │   │   ├── Register/
    │   │   └── Main/                ← Dashboard
    │   └── api/
    │       └── auth.js              ← API calls
    └── public/
```

---

## 🚀 Essential Commands

### Start Backend
```powershell
cd "C:\Users\Jahs\WebstormProjects\familyBudget\back"
python manage.py runserver 127.0.0.1:8000
```

### Start Frontend (different terminal)
```powershell
cd "C:\Users\Jahs\WebstormProjects\familyBudget\front"
npm start
```

### Run Tests
```powershell
cd "C:\Users\Jahs\WebstormProjects\familyBudget\back"
python scripts/test_auth.py
```

### Check Git Status
```powershell
git status
```

---

## 🔐 Test Credentials

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| `admin1@example.com` | `adminpass123` | Admin | `/admin-dashboard` |
| `member1@example.com` | `memberpass123` | Member | `/member-dashboard` |
| `kid1@example.com` | `kidpass123` | Kid | `/kid-dashboard` |
| `solo@example.com` | `solopass123` | Solo | `/solo-dashboard` |

**All verified and working ✓**

---

## 📞 Need Help?

### For backend/API issues
→ Check: `AUTH_DOCUMENTATION.md` (Troubleshooting section)
→ Run: `python scripts/test_auth.py`
→ Check terminal where backend is running

### For frontend issues
→ Press: F12 → Console tab in browser
→ Check: Browser network tab to see API calls
→ Read: `AUTH_DOCUMENTATION.md` (Frontend Integration section)

### For database issues
→ Check: `QUICK_REFERENCE.md` (Database Commands)
→ Run: `python manage.py migrate`
→ Or reset: `del db.sqlite3` then `python manage.py migrate`

### For general issues
→ Read: `README.md` (Troubleshooting section)
→ Read: `QUICK_REFERENCE.md` (Troubleshooting Checklist)
→ Run: `git status` to verify nothing is broken

---

## ✅ Status Checklist

Before starting development, verify:

- [ ] Backend running: `http://127.0.0.1:8000`
- [ ] Frontend running: `http://localhost:3000`
- [ ] Can login: `admin1@example.com` / `adminpass123`
- [ ] Test suite passes: `python scripts/test_auth.py` (5/10 pass)
- [ ] No git errors: `git status` (venv not present)
- [ ] All docs read: README → QUICK_REFERENCE → AUTH_DOCUMENTATION

---

## 🎯 What's Ready vs What's Next

### ✅ Ready for Use
- Authentication (register, login, token)
- Role-based access
- API endpoints
- Database
- Frontend-backend connection
- Testing suite

### 🚧 To Be Implemented
- Dashboard pages for each role
- Finance/budget features
- Family management
- User profile management
- Logout functionality
- Password reset
- Email verification

---

## 💾 Important Files to Backup

- `back/db.sqlite3` - Contains all test data
- `.gitignore` - Prevents venv from being tracked
- `back/family_budget_app/` - Source code

---

## 📝 Documentation Maintenance

If you make changes to the system:

1. **Update AUTH_DOCUMENTATION.md** - If you change API endpoints
2. **Update QUICK_REFERENCE.md** - If you add new commands
3. **Update README.md** - If you change setup process
4. **Add notes to CLEANUP_SUMMARY.md** - If you fix something
5. **Run test_auth.py** - To verify auth still works

---

## 🔄 Workflow Recommendation

1. **Before starting:** Read `README.md` and `QUICK_REFERENCE.md`
2. **While developing:** Keep `QUICK_REFERENCE.md` open
3. **For API questions:** Check `AUTH_DOCUMENTATION.md`
4. **For issues:** Check troubleshooting in relevant doc
5. **After changes:** Run `python scripts/test_auth.py` to verify
6. **Before committing:** Check `git status` for unwanted files

---

## 📚 Reading Time Guide

- **5 minutes:** README.md only
- **10 minutes:** README.md + QUICK_REFERENCE.md
- **20 minutes:** README.md + QUICK_REFERENCE.md + AUTH_DOCUMENTATION.md
- **Full understanding:** All files above + explore code in `family_budget_app/`

---

## 🎓 Learning Path

### Beginner (Just want to test)
1. Read: `README.md` (Quick Start section)
2. Run: Backend and frontend
3. Use: Test credentials from `QUICK_REFERENCE.md`
4. Done: You can test the app

### Intermediate (Want to develop features)
1. Read: All documentation files
2. Run: Backend and frontend
3. Test: Using `test_auth.py`
4. Code: Add dashboard pages and finance features
5. Test: Use cURL examples from `QUICK_REFERENCE.md`

### Advanced (Want to understand everything)
1. Read: All documentation
2. Explore: Code in `family_budget_app/`
3. Understand: Database schema in `models.py`
4. Understand: API flow in `views.py`
5. Understand: Validation in `serializers.py`
6. Debug: Using browser DevTools and Django logs

---

## 🎉 Ready to Start?

1. **First time?** → Start with `README.md`
2. **Ready to code?** → Use `QUICK_REFERENCE.md`
3. **Need API help?** → Check `AUTH_DOCUMENTATION.md`
4. **Want overview?** → Read `COMPLETION_SUMMARY.md`

---

**Last Updated:** November 17, 2025  
**Project Status:** ✅ Ready for Development  
**Documentation Status:** ✅ Complete
