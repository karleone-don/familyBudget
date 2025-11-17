# Quick Reference Guide

## Start Development Environment

### Terminal 1: Backend Server
```powershell
cd "C:\Users\Jahs\WebstormProjects\familyBudget\back"
python manage.py runserver 127.0.0.1:8000
```

### Terminal 2: Frontend Server  
```powershell
cd "C:\Users\Jahs\WebstormProjects\familyBudget\front"
npm start
```

Then open: http://localhost:3000

---

## Test Credentials (Copy & Paste Ready)

### Admin User
- **Email:** `admin1@example.com`
- **Password:** `adminpass123`
- **Role:** Administrator
- **Dashboard:** `/admin-dashboard`

### Family Member
- **Email:** `member1@example.com`
- **Password:** `memberpass123`
- **Role:** Family Member
- **Dashboard:** `/member-dashboard`

### Kid
- **Email:** `kid1@example.com`
- **Password:** `kidpass123`
- **Role:** Kid
- **Dashboard:** `/kid-dashboard`

### Solo User
- **Email:** `solo@example.com`
- **Password:** `solopass123`
- **Role:** Solo (No Family)
- **Dashboard:** `/solo-dashboard`

---

## Test API with cURL

### Test Admin Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@example.com",
    "password": "adminpass123"
  }'
```

### Expected Response
```json
{
  "user": {
    "user_id": 2,
    "username": "admin1",
    "email": "admin1@example.com",
    "role_name": "admin",
    "family_name": "TestFamily"
  },
  "token": "7ff015356609104b8218b085397d5f36e735f4c1",
  "redirect_url": "/admin-dashboard",
  "message": "Login successful"
}
```

### Register New User
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "age": 25,
    "role_name": "solo"
  }'
```

---

## Run Test Suite

```powershell
cd "C:\Users\Jahs\WebstormProjects\familyBudget\back"
python scripts/test_auth.py
```

**Expected output:** 5 successful logins ✓, token validation ✓, redirect URLs ✓

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register/` | Create new user account |
| POST | `/api/auth/login/` | Authenticate user & get token |
| GET | `/api/users/profile/` | Get current user profile |
| GET | `/api/users/` | List all users (admin only) |
| POST | `/api/families/` | Create family |
| GET | `/api/families/` | List families |

---

## Common Issues

### Backend won't start
```
Error: Address already in use
```
**Solution:** Change port or kill process on 8000:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend CORS error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Ensure backend is running at `http://127.0.0.1:8000`

### Invalid credentials error
- Double-check email spelling
- Use credentials from "Test Credentials" section above
- Reset with `python manage.py migrate` if needed

### Database locked
```
sqlite3.OperationalError: database is locked
```
**Solution:** Restart backend server

---

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Settings | `back/family_budget/settings.py` | Django config |
| Models | `back/family_budget_app/models.py` | Database schema |
| Views | `back/family_budget_app/views.py` | API endpoints |
| Serializers | `back/family_budget_app/serializers.py` | Data validation |
| Frontend | `front/src/App.js` | React main app |
| Database | `back/db.sqlite3` | SQLite database |
| Tests | `back/scripts/test_auth.py` | Auth test suite |

---

## Database Commands

### Run migrations
```powershell
cd "C:\Users\Jahs\WebstormProjects\familyBudget\back"
python manage.py migrate
```

### Create superuser (admin)
```powershell
python manage.py createsuperuser
```

### Access Django admin panel
1. Create superuser (above)
2. Go to: `http://127.0.0.1:8000/admin/`
3. Login with superuser credentials

### Reset database (WARNING: Deletes all data)
```powershell
del db.sqlite3
python manage.py migrate
```

---

## Git Commands

### Check status
```bash
git status
```

### Add and commit changes
```bash
git add .
git commit -m "Your message"
```

### Push to remote
```bash
git push origin main
```

### View changes
```bash
git diff
```

---

## Documentation Files

- **`AUTH_DOCUMENTATION.md`** - Complete authentication API guide with examples
- **`CLEANUP_SUMMARY.md`** - Summary of what was cleaned and fixed
- **`QUICK_REFERENCE.md`** - This file (quick copy-paste commands)

---

## Frontend Pages

| URL | Component | Purpose |
|-----|-----------|---------|
| `/` | Main | Home page |
| `/login` | Login | User login |
| `/register` | Register | User registration |
| `/admin-dashboard` | Main | Admin dashboard |
| `/member-dashboard` | Main | Member dashboard |
| `/kid-dashboard` | Main | Kid dashboard |
| `/solo-dashboard` | Main | Solo user dashboard |

---

## Troubleshooting Checklist

Before asking for help, verify:
- [ ] Backend running on `http://127.0.0.1:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Using credentials from "Test Credentials" section
- [ ] Run `test_auth.py` to verify auth is working
- [ ] Check browser console (F12) for error messages
- [ ] Check backend terminal for error messages
- [ ] Database exists at `back/db.sqlite3`
