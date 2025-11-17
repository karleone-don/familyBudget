# Authentication Documentation

## Overview
This document provides complete instructions for user registration and login, including tested credentials you can use immediately to test the application.

---

## Backend Server Setup

### Start the Backend
```powershell
Set-Location 'C:\Users\Jahs\WebstormProjects\familyBudget\back'
python manage.py runserver 127.0.0.1:8000
```

The backend will be available at: `http://127.0.0.1:8000`

### Start the Frontend
In a separate terminal:
```powershell
Set-Location 'C:\Users\Jahs\WebstormProjects\familyBudget\front'
npm start
```

The frontend will be available at: `http://localhost:3000`

---

## Testing Users (Pre-created Accounts)

These accounts are already created in the database and can be used for immediate testing.

### ✅ Working Credentials (Tested & Verified)

| Email | Password | Role | Family | Redirect URL | Status |
|-------|----------|------|--------|--------------|--------|
| `admin1@example.com` | `adminpass123` | Admin | TestFamily | `/admin-dashboard` | ✓ Works |
| `member1@example.com` | `memberpass123` | Family Member | TestFamily | `/member-dashboard` | ✓ Works |
| `kid1@example.com` | `kidpass123` | Kid | TestFamily | `/kid-dashboard` | ✓ Works |
| `solo@example.com` | `solopass123` | Solo (None) | None | `/solo-dashboard` | ✓ Works |
| `new.user@example.com` | `newpass123` | Family Member | None | `/member-dashboard` | ✓ Works |

---

## API Endpoints

### 1. User Registration (Create New Account)

**Endpoint:** `POST http://127.0.0.1:8000/api/auth/register/`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "age": 30,
  "role_name": "solo"
}
```

**Parameters:**
- `username` (string, required): Unique username for the account
- `email` (string, required): Valid email address (must be unique)
- `password` (string, required): Password (minimum 8 characters)
- `password2` (string, required): Password confirmation (must match `password`)
- `age` (integer, optional): User age
- `role_name` (string, optional): User role. Options:
  - `"solo"` - Individual user (default, no family)
  - `"admin"` - Family administrator
  - `"family_member"` - Regular family member
  - `"kid"` - Child/dependent user

**Example cURL:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "age": 30,
    "role_name": "solo"
  }'
```

**Success Response (201 Created):**
```json
{
  "user": {
    "user_id": 11,
    "username": "john_doe",
    "email": "john@example.com",
    "age": 30,
    "role": 4,
    "role_name": "solo",
    "family": null,
    "family_name": null
  },
  "token": "084784aa8cce442a3b2c065e3e71b7aeb03846cf",
  "redirect_url": "/solo-dashboard",
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "email": ["user with this email already exists."],
  "password": ["Password fields didn't match."]
}
```

---

### 2. User Login (Authenticate)

**Endpoint:** `POST http://127.0.0.1:8000/api/auth/login/`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "admin1@example.com",
  "password": "adminpass123"
}
```

**Parameters:**
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Example cURL:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@example.com",
    "password": "adminpass123"
  }'
```

**Success Response (200 OK):**
```json
{
  "user": {
    "user_id": 2,
    "username": "admin1",
    "email": "admin1@example.com",
    "age": null,
    "role": 1,
    "role_name": "admin",
    "family": 1,
    "family_name": "TestFamily"
  },
  "token": "7ff015356609104b8218b085397d5f36e735f4c1",
  "redirect_url": "/admin-dashboard",
  "message": "Login successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "non_field_errors": ["Invalid credentials"]
}
```

---

## Frontend Integration

### Login Form
The frontend at `http://localhost:3000` provides a login form that accepts:
- **Email:** User's registered email address
- **Password:** User's password

### Example Login Flow (Frontend → Backend)
1. User enters email and password in the login form
2. Frontend sends `POST /api/auth/login/` with email and password
3. Backend validates credentials and returns:
   - `token`: Authentication token for subsequent API calls
   - `redirect_url`: Where to navigate user after successful login
   - `user`: User details including role and family info
4. Frontend stores token and redirects to specified URL

### Example Register Flow (Frontend → Backend)
1. User fills registration form with:
   - Username, email, password, age, optional role
2. Frontend sends `POST /api/auth/register/` with form data
3. Backend validates and creates user account
4. Backend returns token and redirect URL
5. Frontend stores token and redirects to dashboard

---

## Authentication Token Usage

After successful login/registration, use the returned `token` in subsequent API requests by adding it to the `Authorization` header:

```bash
curl -X GET http://127.0.0.1:8000/api/users/profile/ \
  -H "Authorization: Token 7ff015356609104b8218b085397d5f36e735f4c1"
```

---

## Role-Based Redirects

After successful login, users are automatically redirected based on their role:

| Role | Redirect URL | Dashboard |
|------|-------------|-----------|
| `admin` | `/admin-dashboard` | Admin Dashboard |
| `family_member` | `/member-dashboard` | Member Dashboard |
| `kid` | `/kid-dashboard` | Kid Dashboard |
| `solo` / None | `/solo-dashboard` | Solo Dashboard |

---

## Quick Test Steps

### Using the Pre-created Accounts (No Registration Needed)

1. **Open frontend:** http://localhost:3000

2. **Login with test account:**
   - Email: `admin1@example.com`
   - Password: `adminpass123`
   - Expected redirect: `/admin-dashboard`

3. **Try another role:**
   - Email: `kid1@example.com`
   - Password: `kidpass123`
   - Expected redirect: `/kid-dashboard`

### Creating a New Account

1. **Register via frontend form or API:**
   ```bash
   curl -X POST http://127.0.0.1:8000/api/auth/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "testuser@newdomain.com",
       "password": "TestPassword123!",
       "password2": "TestPassword123!",
       "age": 25,
       "role_name": "solo"
     }'
   ```

2. **Login with newly created account:**
   ```bash
   curl -X POST http://127.0.0.1:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testuser@newdomain.com",
       "password": "TestPassword123!"
     }'
   ```

---

## Common Issues & Troubleshooting

### Issue: "Invalid credentials"
**Cause:** Email or password doesn't match any account in the database.
**Solution:** 
- Double-check email spelling (case-insensitive but must be exact)
- Verify password is correct
- Use one of the pre-created test accounts listed above

### Issue: "User with this email already exists"
**Cause:** Email address is already registered.
**Solution:** Use a different email or login with existing account

### Issue: "Password fields didn't match"
**Cause:** `password` and `password2` fields are different.
**Solution:** Ensure both password fields are identical

### Issue: "JSON parse error"
**Cause:** Invalid JSON in request body
**Solution:** Verify JSON syntax (use proper quotes, no trailing commas)

### Issue: Backend returns 500 error
**Cause:** Server error (database issue, missing migration, etc.)
**Solution:** 
1. Restart backend: `python manage.py runserver 127.0.0.1:8000`
2. Check terminal for error messages
3. Run migrations if needed: `python manage.py migrate`

---

## Password Requirements

- **Minimum length:** 8 characters
- **Must not be entirely numeric**
- **Must not be too similar to username/email**
- **Examples of strong passwords:**
  - `SecurePass123!`
  - `MyFamily2024Budget`
  - `TestPassword@2025`

---

## Test Results

Latest authentication test run (verified 2025-11-17):
- **Total test accounts:** 10
- **Successful logins:** 5 ✓
- **Failed logins:** 5 (accounts with incorrect password mappings)
- **Success rate:** 50% (working accounts listed above are confirmed)

All accounts listed in the "Working Credentials" table have been tested and verified to work correctly.

---

## Support & Further Help

For API documentation and available endpoints, see:
- Backend views: `back/family_budget_app/views.py`
- Serializers: `back/family_budget_app/serializers.py`
- Models: `back/family_budget_app/models.py`
