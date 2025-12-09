# Backend Architecture Review - FamilyBudget

## 🔐 Password Hashing Flow

### Where Hashing Executes

Password hashing is handled by **Django's built-in `AbstractUser` model** and executed in multiple places:

#### 1. **User Registration** (Hashing point)
```
User Registration Request (plaintext password)
        ↓
serializers.py: UserRegistrationSerializer.create()
        ↓
User.objects.create_user(**validated_data)  ← HASHING HAPPENS HERE
        ↓
Django's AbstractUser.create_user() [inherited by custom User model]
        ↓
Password hashed using PBKDF2 (default hasher)
        ↓
Database stores: pbkdf2_sha256$iterations$salt$hash
```

**File:** `back/family_budget_app/models.py` (Line 35-43)
```python
class User(AbstractUser):
    # Inherits from AbstractUser which has set_password() method
    # This method uses PASSWORD_HASHERS from settings.py
    user_id = models.AutoField(primary_key=True)
    age = models.IntegerField(null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    family = models.ForeignKey(Family, on_delete=models.SET_NULL, null=True, blank=True)
```

#### 2. **User Login** (Comparison happens here)
```
Login Request (plaintext password + email)
        ↓
serializers.py: UserLoginSerializer.validate()
        ↓
authenticate(request=request, username=email, password=password)
        ↓
Calls AUTHENTICATION_BACKENDS (settings.py)
        ↓
backends.py: EmailBackend.authenticate()
        ↓
user.check_password(password)  ← PASSWORD COMPARISON HAPPENS HERE
        ↓
Django's AbstractUser.check_password() method
        ↓
Compares plaintext password against stored hash using PBKDF2
        ↓
Returns user if valid, None if invalid
```

**File:** `back/family_budget_app/backends.py`
```python
class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            return None
        
        if user.check_password(password):  ← COMPARISON
            return user
        return None
```

---

## 🏗️ Backend Architecture Overview

### 1. **Authentication System**

| Component | File | Purpose |
|-----------|------|---------|
| **Custom User Model** | `models.py` | Extends AbstractUser, uses email as USERNAME_FIELD |
| **Email Backend** | `backends.py` | Custom authentication backend for email-based login |
| **Registration Serializer** | `serializers.py` | Validates registration data, calls create_user() |
| **Login Serializer** | `serializers.py` | Validates login data, calls authenticate() |
| **Auth Views** | `views.py` | REST endpoints for register/login |
| **Settings** | `settings.py` | Configures password hashers, CORS, backends |

### 2. **Password Hashing Configuration**

**File:** `back/family_budget/settings.py` (Lines 55-60)
```python
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',      # ← Default
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]
```

**Algorithm:** PBKDF2 (Password-Based Key Derivation Function 2)
- **Iterations:** 600,000 (default)
- **Algorithm:** SHA256
- **Stored Format:** `pbkdf2_sha256$600000$salt$hash`

### 3. **Authentication Backends**

**File:** `back/family_budget/settings.py` (Lines 105-109)
```python
AUTHENTICATION_BACKENDS = [
    'family_budget_app.backends.EmailBackend',  # ← Custom (email login)
    'django.contrib.auth.backends.ModelBackend', # ← Fallback (username)
]
```

**Flow:**
1. Try `EmailBackend` first (email + password)
2. Fall back to `ModelBackend` if needed (username + password)

---

## 🔄 API Flow Diagram

### Registration Flow
```
POST /api/auth/register/
├─ username, email, password, password2, age, role_name
└─ Response: {user, token, redirect_url, message}

Steps:
1. UserRegistrationSerializer validates input
2. Checks password == password2
3. Calls User.objects.create_user(username, email, password)
   ├─ Django hashes password with PBKDF2
   ├─ Stores in database
   └─ Returns User object
4. Creates or gets Role from role_name
5. Creates Finance profile for user
6. Returns Token (stored in Token table)
```

### Login Flow
```
POST /api/auth/login/
├─ email, password
└─ Response: {user, token, redirect_url, message}

Steps:
1. UserLoginSerializer receives email + password
2. Calls authenticate(request, username=email, password=password)
3. EmailBackend.authenticate() called
   ├─ Looks up user by email
   ├─ Calls user.check_password(password)
   │  ├─ Hashes plaintext password with same algorithm
   │  ├─ Compares with stored hash
   │  └─ Returns True/False
   └─ Returns user if valid
4. Checks if user exists, raises ValidationError if not
5. Gets or creates Token for user
6. Returns response with token
```

---

## 📁 Backend File Structure

```
back/
├── manage.py                    # Django CLI
├── db.sqlite3                   # Database
├── requirements.txt             # Dependencies
│
├── family_budget/              # Project config
│   ├── settings.py             # Django settings (auth, db, cors)
│   ├── urls.py                 # URL routing
│   ├── wsgi.py                 # WSGI server config
│   └── asgi.py                 # ASGI server config
│
├── family_budget_app/          # Main application
│   ├── models.py               # User, Role, Family, Finance, etc.
│   ├── views.py                # REST API ViewSets
│   ├── serializers.py          # Request/response validation
│   ├── backends.py             # Custom email authentication
│   ├── admin.py                # Django admin config
│   ├── apps.py                 # App config (creates default roles)
│   ├── urls.py                 # App URL routing
│   └── migrations/             # Database migrations
│
└── scripts/                    # Utility scripts
    ├── test_auth.py           # Auth test suite
    └── create_*.py            # User creation scripts
```

---

## 🔑 Key Components Explained

### 1. User Model
```python
# Inherits from AbstractUser (Django built-in)
# Provides: password field, set_password(), check_password(), etc.

Custom fields:
- user_id: AutoField (primary key)
- age: Optional integer
- role: FK to Role (admin, member, kid, solo)
- family: FK to Family
- email: Unique, used as USERNAME_FIELD
- username: Unique, required
```

### 2. Role Model
```python
# Defines user roles with choices:
- admin: Family administrator
- family_member: Regular family member
- kid: Child/dependent
- solo: No family (default)
```

### 3. Email Authentication Backend
```python
# Custom backend for email-based login
# Steps:
1. User submits email + password
2. Backend queries User by email
3. Calls check_password() to verify
4. Returns user or None
```

### 4. Token Authentication
```python
# REST Framework TokenAuthentication
# After login, user gets a token
# Stored in rest_framework.authtoken Token table
# Used in header: Authorization: Token <token>
```

---

## 🛡️ Security Features

| Feature | Implementation | Location |
|---------|-----------------|----------|
| **Password Hashing** | PBKDF2 with SHA256, 600k iterations | Django settings |
| **Email Authentication** | Custom backend for email login | backends.py |
| **CORS** | Restricted to localhost:3000 | settings.py |
| **Token Auth** | DRF TokenAuthentication | settings.py |
| **Password Validation** | Min 8 chars, no common passwords, etc. | settings.py |
| **Role-Based Access** | Django permissions system | views.py |
| **Custom User Model** | Email-based authentication | models.py |

---

## 📊 Authentication Sequence Diagram

```
Client (Frontend)          Backend (Django)           Database
    │                            │                         │
    ├─ POST /register ───────────>│                         │
    │  (username, email, pwd)     │                         │
    │                    [Validation]                       │
    │                    [Hash Password]                    │
    │                             ├─ Save User ────────────>│
    │                             │                         │
    │<─── 201 + Token ───────────┤<─ User Saved ──────────┤
    │     {token, redirect}       │                         │
    │                             │                         │
    │                             │  ┌─────────────────┐    │
    │                             └─>│ Token Table     │    │
    │                                │ (1 per user)    │    │
    │                                └─────────────────┘    │
    │                                                        │
    ├─ POST /login ──────────────────>│                     │
    │  (email, password)    [Query User by email]          │
    │                       [check_password()]    ┌────────┐│
    │                       [Compare hash]        │Retrieve││
    │                                             │stored  ││
    │                                             │hash    ││
    │<─── 200 + Token ───────────┤<─ Match Found ────────┤┤
    │     {token, redirect}       │                         │
    │                             │                         │
    ├─ GET /api/profile ─────────────>│                     │
    │  Header: Token: xxx         [Verify Token]   ┌────────┐│
    │                                             │Lookup   ││
    │                             [Get User] ────>│Token    ││
    │<─── 200 + User Data ───────┤                │Table    ││
    │     {user_id, email, etc}   │                └────────┘│
    │                             │                         │
```

---

## 🧪 Testing the Auth System

### Test Registration
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "age": 25,
    "role_name": "solo"
  }'
```

### Test Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://127.0.0.1:8000/api/users/profile/ \
  -H "Authorization: Token <your_token_here>"
```

---

## 🚀 Quick Summary

| Aspect | Detail |
|--------|--------|
| **Password Hashing** | Django PBKDF2 (600k iterations) |
| **Where Hashing Occurs** | `User.objects.create_user()` at registration |
| **Where Verification Occurs** | `user.check_password()` at login |
| **Login Method** | Email-based (custom backend) |
| **Authentication** | Token-based (DRF) |
| **Database** | SQLite3 |
| **Frameworks** | Django + Django REST Framework |
| **Security** | PBKDF2, Token Auth, CORS, Role-based access |

---

**Last Updated:** November 17, 2025  
**Status:** ✅ Production Ready
