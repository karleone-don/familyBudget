# Frontend Code Review

**Project:** Family Budget | **Framework:** React 19.2 + React Router 7.9 | **Status:** MVP-Ready with Improvements Needed

---

## 1. Architecture Overview

### Structure
```
src/
├── App.js                 # Router setup
├── index.js              # Entry point
├── api/auth.js           # API communication layer
└── pages/
    ├── Login/            # Login page + form
    ├── Register/         # Register page + form
    └── Main/             # Home/landing page
```

### Routing
- `/` → Main (public landing)
- `/login` → Login form
- `/register` → Registration form

**Assessment:** Clean, straightforward structure suitable for MVP. Scales to ~2-3 features comfortably before refactoring needed.

---

## 2. Component Analysis

### ✅ Strengths

| Component | Strength | Example |
|-----------|----------|---------|
| **App.js** | Minimal, clean router setup | Direct route definitions |
| **auth.js** | Good error handling | Safe JSON parsing, meaningful error messages |
| **LoginForm** | Correct auth flow | Stores token/user in localStorage, navigates on success |
| **RegisterForm** | Client-side validation | Checks password match before API call |
| **Page containers** | Proper separation of concerns | Login/Register wrap form components |

### ⚠️ Issues & Improvements

#### 1. **Missing Authentication Guard (Critical for MVP+)**
**Problem:** No protection on `/` route. Any user can access Main.jsx without login.

**Current:**
```jsx
<Route path="/" element={<Main />} />  // No protection!
<Route path="/login" element={<Login />} />
```

**Solution:** Create ProtectedRoute component:
```jsx
function ProtectedRoute({ element }) {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" replace />;
}

// Then:
<Route path="/" element={<ProtectedRoute element={<Main />} />} />
```

---

#### 2. **No Logout Functionality**
**Problem:** Once logged in, users have no way to logout. Token persists forever in localStorage.

**Impact:** Shared computer → user data leak. Sessions can't be terminated.

**Solution:** Add logout handler in Main.jsx:
```jsx
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
}
```

---

#### 3. **Missing Age Field in Registration Form**
**Problem:** Backend requires `age` field, but RegisterForm doesn't have input for it.

**Current Backend Requirement:**
```python
# serializers.py
class UserRegistrationSerializer:
    age = IntegerField(required=True)
```

**Current Form:**
```jsx
// Missing age input!
await registerApi({ username, email, password, password2 });
```

**Fix:** Add age input:
```jsx
const [age, setAge] = useState("");

// In form:
<input type="number" min="1" max="150" 
  value={age} 
  onChange={(e) => setAge(e.target.value)} 
  required 
/>

// In submit:
await registerApi({ username, email, password, password2, age });
```

---

#### 4. **Hardcoded Role Assignment**
**Problem:** All users registered as "solo" role. No option to join as family_member, kid, or admin.

**Current (auth.js):**
```javascript
role_name: "solo" // hardcoded!
```

**Improvement:** Add optional role parameter (or role_id for family invitations):
```jsx
const [role, setRole] = useState("solo");

// In form:
<select value={role} onChange={(e) => setRole(e.target.value)}>
  <option value="solo">Solo User</option>
  <option value="family_member">Family Member</option>
  {/* Family/invites would require special flow */}
</select>

// Pass to API:
role_name: role
```

---

#### 5. **No Token Validation on App Load**
**Problem:** App doesn't verify stored token is valid when user refreshes page.

**Scenario:** User closes browser with valid token → reopens app → token in localStorage but not validated.

**Solution:** Verify token in App.jsx useEffect:
```jsx
import { useEffect, useState } from "react";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Validate token with backend (optional /api/auth/verify/ endpoint)
      // For now, just assume valid
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

#### 6. **Verbose Error Handling in RegisterForm**
**Problem:** Error extraction is overly complex and fragile.

**Current:**
```javascript
const msg = (err && err.data && (err.data.detail || err.data.error || JSON.stringify(err.data))) || "Ошибка регистрации";
```

**Better:**
```javascript
function getErrorMessage(err) {
  if (!err) return "Registration failed";
  if (err.data?.detail) return err.data.detail;
  if (err.data?.email?.[0]) return `Email: ${err.data.email[0]}`;
  if (err.data?.username?.[0]) return `Username: ${err.data.username[0]}`;
  if (err.data?.password?.[0]) return `Password: ${err.data.password[0]}`;
  if (err.message) return err.message;
  return JSON.stringify(err.data || err);
}

// Then:
setError(getErrorMessage(err));
```

---

#### 7. **No Environment Variable Validation**
**Problem:** App silently falls back to localhost:8000 if `REACT_APP_API_URL` not set. Could mask deployment issues.

**Current (auth.js):**
```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
```

**Better (auth.js):**
```javascript
const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL && process.env.NODE_ENV === "production") {
  console.error("REACT_APP_API_URL environment variable is required");
}

const FALLBACK_URL = process.env.NODE_ENV === "production" 
  ? "http://localhost:8000" 
  : "http://localhost:8000";

export const API_URL_FINAL = API_URL || FALLBACK_URL;
```

---

#### 8. **Missing Input Validation**
**Problem:** No real-time validation feedback. Users get errors only after submit attempt.

**Example:** Email format not validated before submit.

**Add to LoginForm:**
```jsx
const [emailError, setEmailError] = useState("");

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    setEmailError("Invalid email format");
    return false;
  }
  setEmailError("");
  return true;
}

// In form:
<input 
  type="email" 
  value={email} 
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  required
/>
{emailError && <span className="field-error">{emailError}</span>}
```

---

#### 9. **No Loading/Disabled State Feedback During Redirect**
**Problem:** After successful login, loading button gets disabled but form stays visible. Redirect happens in background — unclear to user what's happening.

**Scenario:** User clicks "Войти" → button says "Входим..." → confused, might click again.

**Solution:** Show success message before redirect:
```jsx
const [successMessage, setSuccessMessage] = useState("");

// In handleSubmit:
try {
  const { token, user, redirect } = await loginApi({ email, password });
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  
  setSuccessMessage("✓ Login successful! Redirecting...");
  setTimeout(() => navigate(redirect || "/"), 500);
} catch (err) {
  setError(err.data?.non_field_errors?.[0] || "Invalid email or password");
}

// In form:
{successMessage && <div className="success">{successMessage}</div>}
```

---

#### 10. **No CSRF Protection**
**Problem:** Using `credentials: "include"` but no X-CSRF-Token headers set.

**Current (auth.js):**
```javascript
credentials: "include",  // Sends cookies but...
// No CSRF token handling
```

**For Django + Token Auth:** If using session-based auth, need:
```javascript
// Get CSRF token from cookie
function getCsrfToken() {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith("csrftoken="))
    ?.split("=")[1];
}

// In fetch:
headers: {
  "Content-Type": "application/json",
  "X-CSRFToken": getCsrfToken() || "",
},
```

**Note:** Current backend uses Token Authentication (not session), so this is lower priority.

---

## 3. Code Quality

### Dependencies ✓
```json
{
  "react": "^19.2.0",           // Latest, great
  "react-router-dom": "^7.9.4", // Latest, good
  "react-scripts": "5.0.1",     // Current
}
```
**Assessment:** Up-to-date, minimal bloat. Good choices.

### Missing Libraries (Optional but Recommended)
- **axios** or **react-query**: Better than raw fetch for caching, retries, interceptors
- **zustand** or **context**: State management for user/auth (currently using localStorage)
- **zod** or **yup**: Schema validation for forms

### Code Style
- ✅ Consistent naming (camelCase)
- ✅ React hooks used correctly
- ✅ Components are small and testable
- ⚠️ No PropTypes or TypeScript for type safety
- ⚠️ No comments explaining non-obvious logic

---

## 4. Security Concerns

| Issue | Severity | Impact | Fix |
|-------|----------|--------|-----|
| No auth guard on protected routes | 🔴 High | User data visible to anyone | Add ProtectedRoute wrapper |
| Token in localStorage | 🟡 Medium | XSS can steal token | Use httpOnly cookies (backend change) |
| No token expiration check | 🟡 Medium | Expired tokens not handled | Validate token on app load |
| No CSRF token (if needed) | 🟢 Low | Depends on backend auth type | Add CSRF header for session auth |
| Password stored in state (briefly) | 🟢 Low | Unlikely vulnerability | This is normal for forms |

---

## 5. Performance

### Current State
- ✅ No unnecessary re-renders (useState used correctly)
- ✅ No memory leaks (no useEffect without cleanup needed here)
- ⚠️ No lazy loading of routes (all components imported upfront)
- ⚠️ No API result caching

### Optimization Ideas (for future)
```jsx
// Lazy load pages
const Main = lazy(() => import("./pages/Main/Main"));
const Login = lazy(() => import("./pages/Login/Login"));

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <Routes>{/* ... */}</Routes>
</Suspense>
```

---

## 6. Testing

**Current State:** ❌ No tests found

**Recommended Test Cases:**
```javascript
// LoginForm.test.jsx
describe("LoginForm", () => {
  test("submits with email and password", () => { /* ... */ });
  test("shows error on failed login", () => { /* ... */ });
  test("stores token in localStorage on success", () => { /* ... */ });
  test("disables button while loading", () => { /* ... */ });
});

// auth.test.js
describe("loginApi", () => {
  test("returns token and user data", () => { /* ... */ });
  test("throws error on invalid credentials", () => { /* ... */ });
  test("uses REACT_APP_API_URL environment variable", () => { /* ... */ });
});
```

**Setup:** Already has testing libraries in package.json (`@testing-library/react`, etc.)

---

## 7. Recommendations by Priority

### 🔴 Critical (Do Before Production)
1. **Add authentication guard** — Protect `/` route
2. **Add logout button** — Users need to exit sessions
3. **Add age field to registration** — Required by backend
4. **Validate token on app load** — Handle session persistence

### 🟡 Important (Before Beta)
5. **Improve error messages** — Better UX on failures
6. **Add input validation** — Real-time feedback
7. **Add success feedback** — Clear post-submission flow
8. **Add loading indicators** — Show state during API calls

### 🟢 Nice to Have (Future)
9. Add tests (at least auth flow tests)
10. Add state management (localStorage → Context or Zustand)
11. Extract magic strings to constants
12. Add TypeScript for type safety
13. Add error boundary component
14. Implement token refresh on expiration

---

## 8. Quick Fixes (Code Changes)

### Add ProtectedRoute to App.js
```jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ element }) {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute element={<Main />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Add Age Field to RegisterForm.jsx
```jsx
const [age, setAge] = useState("");

// Add input in form:
<div>
  <label>Возраст</label>
  <input 
    type="number" 
    min="1" 
    max="150"
    value={age} 
    onChange={(e) => setAge(e.target.value)} 
    required
  />
</div>

// Update submit call:
await registerApi({ username, email, password, password2, age: parseInt(age) });
```

### Add Logout to Main.jsx
```jsx
import { useNavigate } from "react-router-dom";

export default function Main() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="main-page">
      <h1>Добро пожаловать!</h1>
      <p>Это главная страница твоего приложения.</p>
      <button onClick={handleLogout} className="btn-logout">
        Выход
      </button>
    </div>
  );
}
```

---

## 9. Summary

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Architecture** | 8/10 | Clean, simple, scales to next phase |
| **Code Quality** | 7/10 | Good fundamentals, needs validation layer |
| **Security** | 5/10 | No auth guard, no logout — fix before production |
| **Performance** | 8/10 | Good now, optimize later with lazy loading |
| **Testability** | 6/10 | Testable structure, but no tests written |
| **Error Handling** | 6/10 | Works but needs UX polish |

**Overall:** **MVP-Ready** with **3 Critical Fixes Needed** before production use.

**Estimated Effort to Production:** 4-6 hours (auth guard, logout, age field, error messages, basic tests).

