# AI Budget Assistant - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd back
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python manage.py runserver
```

Server will be available at: `http://127.0.0.1:8000`

---

## 📝 Getting Your Authentication Token

### Method 1: Register New User
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "age": 25,
    "role_name": "solo"
  }'
```

**Response:** (save the `token` value)
```json
{
  "user": {...},
  "token": "abc123xyz...",
  "redirect_url": "/solo-dashboard",
  "message": "User registered successfully"
}
```

### Method 2: Login Existing User
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@example.com",
    "password": "password123"
  }'
```

---

## 🧪 Testing AI Endpoints

### Set Token Variable
```bash
TOKEN="your_token_here"
BASE_URL="http://127.0.0.1:8000/api/ai"
```

### 1. Test Spending Analysis
```bash
curl -X GET ${BASE_URL}/analyze/ \
  -H "Authorization: Token ${TOKEN}"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "total_expenses": 2739.74,
    "total_income": 5000.00,
    "net_balance": 2260.26,
    "by_category": {...},
    "top_categories": [...],
    "transaction_count": 21
  }
}
```

### 2. Test Expense Prediction
```bash
curl -X GET "${BASE_URL}/predict/?months_ahead=3" \
  -H "Authorization: Token ${TOKEN}"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "predicted_expenses": [1300.00, 1325.50, 1350.00],
    "predicted_income": [2500.00, 2550.00, 2600.00],
    "confidence_score": 0.87,
    "model_accuracy": 0.92,
    "prediction_months": ["2025-01", "2025-02", "2025-03"]
  }
}
```

### 3. Test Budget Recommendations
```bash
curl -X GET ${BASE_URL}/recommendations/ \
  -H "Authorization: Token ${TOKEN}"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "type": "category_alert",
        "title": "High Spending in Shopping",
        "description": "...",
        "potential_savings": 37.53,
        "priority": "high"
      }
    ],
    "total_potential_savings": 287.53
  }
}
```

### 4. Test Anomaly Detection
```bash
curl -X GET "${BASE_URL}/anomalies/?threshold=2.0" \
  -H "Authorization: Token ${TOKEN}"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "anomalies": [
      {
        "transaction_id": 42,
        "amount": 500.00,
        "category": "Shopping",
        "reason": "Amount $500.00 is 2.5x standard deviations from average",
        "severity": "high",
        "zscore": 2.5
      }
    ],
    "anomaly_count": 1
  }
}
```

### 5. Test Transaction Categorization
```bash
curl -X POST ${BASE_URL}/categorize/ \
  -H "Authorization: Token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"description": "Starbucks coffee downtown"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "suggested_category": "Food & Dining",
    "confidence": 1.0,
    "all_categories": [
      {
        "name": "Food & Dining",
        "confidence": 1.0,
        "keywords_matched": ["coffee"]
      }
    ]
  }
}
```

---

## 🧬 Create Sample Transactions (for Testing)

Run the test script to create sample data:
```bash
cd back
python test_ai_service.py
```

This will:
- Create 21 sample transactions
- Generate income/expense data across multiple categories
- Run all AI tests
- Output comprehensive results

---

## 📊 Using Postman (Optional)

### Import Collection
1. Open Postman
2. Click "Import"
3. Select "Request"
4. Paste the following URLs:

```
POST http://127.0.0.1:8000/api/auth/register/
POST http://127.0.0.1:8000/api/auth/login/
GET http://127.0.0.1:8000/api/ai/analyze/
GET http://127.0.0.1:8000/api/ai/predict/?months_ahead=3
GET http://127.0.0.1:8000/api/ai/recommendations/
GET http://127.0.0.1:8000/api/ai/anomalies/?threshold=2.0
POST http://127.0.0.1:8000/api/ai/categorize/
```

### Add Authorization
1. For each request:
2. Go to "Authorization" tab
3. Type: "Bearer Token"
4. Token: (paste your token from login)

---

## 🐍 Python Script for Testing

```python
import requests

# Configuration
BASE_URL = "http://127.0.0.1:8000"
TOKEN = "your_token_here"

headers = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}

# Test each endpoint
endpoints = {
    "analyze": f"{BASE_URL}/api/ai/analyze/",
    "predict": f"{BASE_URL}/api/ai/predict/?months_ahead=3",
    "recommendations": f"{BASE_URL}/api/ai/recommendations/",
    "anomalies": f"{BASE_URL}/api/ai/anomalies/?threshold=2.0",
}

print("🧪 Testing AI Budget Assistant Endpoints\n")

for name, url in endpoints.items():
    print(f"Testing {name}...")
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ {name}: {response.status_code}")
        print(f"   Data keys: {list(data.get('data', {}).keys())[:3]}...\n")
    else:
        print(f"❌ {name}: {response.status_code}")
        print(f"   Error: {response.text}\n")

# Test categorization
print("Testing categorize...")
response = requests.post(
    f"{BASE_URL}/api/ai/categorize/",
    headers=headers,
    json={"description": "Starbucks coffee"}
)

if response.status_code == 200:
    data = response.json()
    print(f"✅ categorize: {response.status_code}")
    print(f"   Suggested: {data['data']['suggested_category']}\n")
else:
    print(f"❌ categorize: {response.status_code}\n")

print("🎉 All tests complete!")
```

---

## 🔧 Troubleshooting

### Issue: "Invalid token"
**Solution:** Get a new token by logging in:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin1@example.com", "password": "password123"}'
```

### Issue: "Insufficient transaction history"
**Solution:** Create sample data:
```bash
python test_ai_service.py
```

### Issue: No data in responses
**Solution:** Ensure your user has transactions:
```bash
# Create a transaction first
curl -X POST http://127.0.0.1:8000/api/transactions/ \
  -H "Authorization: Token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "finance": 1,
    "amount": "50.00",
    "type": "expense",
    "category": 1,
    "description": "Test expense"
  }'
```

### Issue: "No categories found"
**Solution:** Create categories:
```bash
# Create categories via Django admin or API
curl -X POST http://127.0.0.1:8000/api/categories/ \
  -H "Authorization: Token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"category_name": "Food & Dining"}'
```

---

## 📱 Frontend Integration

### React Hook Example
```jsx
import { useEffect, useState } from 'react';

function useAIAnalysis(token) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    fetch('http://127.0.0.1:8000/api/ai/analyze/', {
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setAnalysis(d.data);
        setError(null);
      })
      .catch(e => {
        setError(e.message);
        setAnalysis(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return { analysis, loading, error };
}

export default useAIAnalysis;
```

---

## 📚 Next Steps

1. **Test all 5 endpoints** using the curl commands above
2. **Review API documentation** in `AI_ASSISTANT_API.md`
3. **Check implementation** in `family_budget_app/ai_service.py`
4. **Integrate into frontend** - use provided React examples
5. **Create dashboard** - visualize analysis data
6. **Add auto-categorization** - in transaction creation form
7. **Set up alerts** - for anomalies and budget overruns

---

## 📖 Documentation Files

- **AI_ASSISTANT_API.md** - Full API reference (endpoint descriptions, examples, error handling)
- **AI_IMPLEMENTATION_SUMMARY.md** - Implementation details (architecture, algorithms, test results)
- **ai_service.py** - Source code with docstrings (500+ lines)
- **test_ai_service.py** - Test suite and usage examples

---

## ✅ Quick Checklist

- [ ] Install ML dependencies (`pip install -r requirements.txt`)
- [ ] Start Django server (`python manage.py runserver`)
- [ ] Get authentication token (register or login)
- [ ] Test each AI endpoint (use curl commands above)
- [ ] Create sample transactions (run `test_ai_service.py`)
- [ ] Review API documentation
- [ ] Plan frontend integration
- [ ] Deploy to production

---

**Status:** ✅ Ready to Use

**Last Updated:** December 9, 2025

