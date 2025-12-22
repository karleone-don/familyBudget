# 🚀 AI Recommendations Setup Guide

## Issue Fixed
The "Failed to generate recommendations: Failed to fetch" error was caused by the frontend trying to connect to `127.0.0.1:8000` while the backend was only accessible via `localhost:8000` from the React development server.

## Changes Made

### 1. Frontend API Configuration
**File**: `front/src/api/ai.js`
- Changed API URL from hardcoded `127.0.0.1:8000` to environment-aware `localhost:8000`
- Added support for `REACT_APP_API_URL` environment variable
- Improved error messages for better debugging
- Added `credentials: 'include'` for CORS

### 2. Environment Configuration  
**File**: `front/.env`
```
REACT_APP_API_URL=http://localhost:8000
```

### 3. Backend ALLOWED_HOSTS
**File**: `back/family_budget/settings.py`
```python
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']
```

### 4. Improved Error Handling
- Better error messages in the frontend
- Added specific error detection for connection failures
- Clear instructions when backend is not running

## How to Run

### Step 1: Start the Backend
```bash
cd back
python manage.py runserver
```
**Output should show:**
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Start the Frontend (in a new terminal)
```bash
cd front
npm start
```
**Output should show:**
```
Compiled successfully!
Local: http://localhost:3000
```

### Step 3: Test AI Recommendations
1. Open `http://localhost:3000` in your browser
2. Log in with your account
3. Navigate to "AI Recommendations"
4. Click "Generate My Recommendations"

## Troubleshooting

### Error: "Cannot connect to server"
**Solution**: Make sure the backend is running
```bash
cd back
python manage.py runserver
```

### Error: "Please log in first"
**Solution**: Make sure you're logged in before generating recommendations

### Error: CORS issues
**Solution**: The CORS is already configured to allow all origins (`CORS_ALLOW_ALL_ORIGINS = True`)

## Technical Details

### API Endpoint
- **URL**: `http://localhost:8000/api/ai/recommendations/`
- **Method**: POST
- **Authentication**: Token-based (uses Authorization header)
- **Response**: Returns recommendations and finance summary

### Expected Response
```json
{
  "recommendations": "# AI Financial Advice...",
  "finance_summary": {
    "balance": 0.0,
    "income": 0.0,
    "expenses": 0.0,
    "expense_breakdown": {}
  }
}
```

## Success Indicators
✅ Backend logs show "Request received from user"
✅ Backend logs show "Response generated successfully"
✅ Frontend displays recommendation text without errors
✅ Finance summary shows correctly

## Environment Variables

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8000)

### Backend (no additional env vars needed for AI recommendations)
- API key is stored in settings.py (Gemini API)
- Database is SQLite (db.sqlite3)
