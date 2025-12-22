# Family Budget App - AI Recommendations Fix

## Problem Solved ✅
The "Failed to generate recommendations: Failed to fetch" error has been fixed!

### Root Cause
The frontend was trying to connect to `127.0.0.1:8000` while React's development server (running on `localhost:3000`) needs to connect to `localhost:8000`.

## Quick Start

### Option 1: Using Batch Scripts (Windows)

1. **Open first terminal and run:**
   ```bash
   start_backend.bat
   ```
   Wait for: `Starting development server at http://127.0.0.1:8000/`

2. **Open second terminal and run:**
   ```bash
   start_frontend.bat
   ```
   Wait for: `Compiled successfully! You can now view your app in browser`

3. **Open browser:**
   - Navigate to `http://localhost:3000`
   - Login with your account
   - Go to "AI Recommendations"
   - Click "Generate My Recommendations" ✨

### Option 2: Manual Terminal Commands

**Terminal 1 - Backend:**
```bash
cd "C:\Users\abzal\Desktop\kbtu\bis\back"
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd "C:\Users\abzal\Desktop\kbtu\bis\front"
npm start
```

## What Was Fixed

### 1. Frontend API Configuration
**File**: `front/src/api/ai.js`
```javascript
// OLD
const API_URL = 'http://127.0.0.1:8000';

// NEW
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### 2. Environment Configuration
**File**: `front/.env` (created)
```
REACT_APP_API_URL=http://localhost:8000
```

### 3. Backend Configuration
**File**: `back/family_budget/settings.py`
```python
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']
```

### 4. Improved Error Handling
- Better error messages for debugging
- Detection of connection vs. authentication errors
- Clear instructions when backend is down

## Verification

### ✅ Backend is Running
Look for this in the backend terminal:
```
Starting development server at http://127.0.0.1:8000/
```

### ✅ Frontend is Running
Look for this in the frontend terminal:
```
Compiled successfully!
Local:            http://localhost:3000
```

### ✅ AI Recommendations Working
- You can click "Generate My Recommendations" without errors
- Recommendations are displayed
- Finance summary is shown

## Troubleshooting

### "Cannot connect to server"
- Make sure backend is running with `python manage.py runserver`
- Verify it says "Starting development server at http://127.0.0.1:8000/"

### "Please log in first"
- Make sure you're logged in before generating recommendations
- Check that token is saved in localStorage

### "HTTP error! status: 404"
- Make sure you're using `localhost:8000` not `127.0.0.1:8000`
- The backend routes are registered at `/api/ai/recommendations/`

### "HTTP error! status: 401"
- Authentication token is expired or invalid
- Log out and log in again

### "HTTP error! status: 500"
- There's an error in the backend
- Check backend terminal for detailed error messages
- Make sure user has Finance data created

## API Details

### Endpoint
- **URL**: `/api/ai/recommendations/`
- **Method**: POST
- **Auth**: Token-based (Authorization header)
- **Host**: `http://localhost:8000`

### Request
```bash
curl -X POST http://localhost:8000/api/ai/recommendations/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "recommendations": "# Financial Recommendations...",
  "finance_summary": {
    "balance": 0.0,
    "income": 0.0,
    "expenses": 0.0,
    "expense_breakdown": {}
  }
}
```

## Database Requirements

Make sure you have a Finance record:
```bash
cd back
python manage.py shell
```

```python
from family_budget_app.models import User, Finance
user = User.objects.get(email='your@email.com')
finance, created = Finance.objects.get_or_create(user=user)
if created:
    print("Finance record created!")
else:
    print("Finance record already exists")
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
```

### Backend
No additional env variables needed for AI recommendations - everything is in `settings.py`

## Success Indicators

### Backend Terminal Output
```
[AI RECOMMENDATIONS] Request received from user: user@email.com
[AI RECOMMENDATIONS] User: username (user@email.com)
[AI RECOMMENDATIONS] Finance found: Balance=..., Income=..., Expenses=...
[AI RECOMMENDATIONS] Found X transactions
[AI RECOMMENDATIONS] Response generated successfully
```

### Frontend Display
- "Generate My Recommendations" button becomes enabled
- Clicking it shows "Generating... ⏳"
- Recommendations appear as formatted text
- Finance summary cards show
- Expense breakdown is displayed

## Additional Resources

- [Django Settings](back/family_budget/settings.py)
- [Frontend API](front/src/api/ai.js)
- [AI Recommendations Page](front/src/pages/AIRecommendations/AIRecommendations.jsx)
- [Backend View](back/family_budget_app/views.py) - Search for `AIRecommendationsView`

## Contact & Support

If you encounter any issues:
1. Check the error message carefully
2. Verify backend is running
3. Check browser console (F12 → Console tab)
4. Check backend terminal for error logs
5. Make sure you're logged in

---

**Last Updated**: December 22, 2025
**Status**: ✅ All working and tested!
