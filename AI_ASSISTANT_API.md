# AI Budget Assistant - API Documentation

## Overview

The AI Budget Assistant is an intelligent financial analysis system integrated into the FamilyBudget API. It provides:

- **Spending Analysis** - Category-wise breakdown, monthly trends
- **Expense Prediction** - ML-powered forecasting using linear regression
- **Smart Recommendations** - Personalized savings tips based on spending patterns
- **Anomaly Detection** - Identifies unusual transactions automatically
- **Transaction Categorization** - Auto-categorizes new transactions by description

All endpoints require authentication via Bearer token and analyze the authenticated user's transaction history.

---

## Base URL

```
http://localhost:8000/api/ai/
```

## Authentication

All endpoints require a valid authentication token in the `Authorization` header:

```
Authorization: Token <your_auth_token>
```

---

## Endpoints

### 1. Analyze Spending Patterns

**Endpoint:** `GET /api/ai/analyze/`

**Description:** Provides comprehensive analysis of spending patterns by category and time period.

**Request:**
```bash
curl -X GET http://localhost:8000/api/ai/analyze/ \
  -H "Authorization: Token your_token_here"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "total_expenses": 2500.50,
    "total_income": 5000.00,
    "net_balance": 2499.50,
    "by_category": {
      "Food & Dining": 450.75,
      "Transportation": 200.00,
      "Entertainment": 150.50,
      "Utilities": 125.00,
      "Shopping": 375.25
    },
    "by_month": {
      "2024-11": {
        "income": 2500.00,
        "expenses": 1250.25,
        "net": 1249.75
      },
      "2024-12": {
        "income": 2500.00,
        "expenses": 1250.25,
        "net": 1249.75
      }
    },
    "avg_monthly_expense": 1250.25,
    "top_categories": [
      ["Shopping", 375.25],
      ["Food & Dining", 450.75],
      ["Transportation", 200.00]
    ],
    "transaction_count": 47,
    "analysis_period_days": 60
  }
}
```

**Response (Empty History):**
```json
{
  "status": "success",
  "data": {
    "total_expenses": 0,
    "total_income": 0,
    "net_balance": 0,
    "by_category": {},
    "by_month": {},
    "avg_monthly_expense": 0,
    "top_categories": [],
    "transaction_count": 0,
    "analysis_period_days": 0
  }
}
```

**Use Cases:**
- Display dashboard widgets with spending summary
- Show category pie charts
- Track monthly trends over time
- Compare spending across time periods

---

### 2. Predict Monthly Expenses

**Endpoint:** `GET /api/ai/predict/?months_ahead=3`

**Description:** Predicts future monthly expenses and income using linear regression model trained on historical data.

**Query Parameters:**
- `months_ahead` (optional, default=1, max=12): Number of months to predict

**Request:**
```bash
curl -X GET "http://localhost:8000/api/ai/predict/?months_ahead=3" \
  -H "Authorization: Token your_token_here"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "predicted_expenses": [1300.00, 1325.50, 1350.00],
    "predicted_income": [2500.00, 2550.00, 2600.00],
    "predicted_net": [1200.00, 1224.50, 1250.00],
    "confidence_score": 0.87,
    "model_accuracy": 0.92,
    "prediction_months": [
      "2025-01",
      "2025-02",
      "2025-03"
    ],
    "historical_months": 12,
    "note": "Based on linear trend analysis of historical data"
  }
}
```

**Response (Insufficient Data):**
```json
{
  "status": "success",
  "data": {
    "predicted_expenses": [],
    "predicted_income": [],
    "confidence_score": 0.0,
    "model_accuracy": 0.0,
    "prediction_months": [],
    "note": "Insufficient transaction history (need at least 3 transactions)"
  }
}
```

**Model Details:**
- **Algorithm:** Linear Regression (scikit-learn)
- **Data:** All historical transactions grouped by month
- **Confidence:** Measured by R² score (0-1 scale)
- **Predictions:** Non-negative values automatically clipped
- **Minimum Data:** 2+ months of history required

**Use Cases:**
- Budget planning for upcoming months
- Forecasting cash flow
- Setting savings goals
- Identifying spending trends

---

### 3. Get Budget Recommendations

**Endpoint:** `GET /api/ai/recommendations/`

**Description:** Generates personalized budget recommendations based on spending analysis.

**Request:**
```bash
curl -X GET http://localhost:8000/api/ai/recommendations/ \
  -H "Authorization: Token your_token_here"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "type": "category_alert",
        "title": "High Spending in Shopping",
        "description": "Shopping is 45% above average. Consider reducing by 10%.",
        "potential_savings": 37.53,
        "priority": "high"
      },
      {
        "type": "budget_tip",
        "title": "High Expense-to-Income Ratio",
        "description": "You spend 50% of your income. Try to keep it below 80%.",
        "potential_savings": 250.00,
        "priority": "high"
      },
      {
        "type": "saving_opportunity",
        "title": "Build Emergency Fund ($7500.00)",
        "description": "Aim to save 3 months of income ($7500.00). Start with 5-10% of monthly income.",
        "potential_savings": 0,
        "priority": "medium"
      },
      {
        "type": "income_insight",
        "title": "Great Savings Rate!",
        "description": "You save 50% of your income. Keep it up!",
        "potential_savings": 0,
        "priority": "low"
      }
    ],
    "total_potential_savings": 287.53
  }
}
```

**Recommendation Types:**
- `category_alert` - Spending in a category is unusually high
- `budget_tip` - General budget improvement tips
- `saving_opportunity` - Specific savings goals (e.g., emergency fund)
- `income_insight` - Positive feedback on spending habits

**Priority Levels:**
- `high` - Act on this soon (save 50%+ of income)
- `medium` - Consider in planning (save 30-50% of income)
- `low` - Nice to know (save 50%+ of income)

**Use Cases:**
- Display personalized tips in mobile app
- Send weekly recommendation emails
- Create onboarding recommendations for new users
- Track saved money over time

---

### 4. Detect Anomalous Transactions

**Endpoint:** `GET /api/ai/anomalies/?threshold=2.0`

**Description:** Identifies unusual transactions using statistical anomaly detection (Z-score method).

**Query Parameters:**
- `threshold` (optional, default=2.0, min=1.0): Standard deviations from mean to flag as anomaly
  - 1.0 = more sensitive (more anomalies detected)
  - 2.0 = standard (normal anomalies)
  - 3.0 = stricter (only extreme outliers)

**Request:**
```bash
curl -X GET "http://localhost:8000/api/ai/anomalies/?threshold=2.0" \
  -H "Authorization: Token your_token_here"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "anomalies": [
      {
        "transaction_id": 42,
        "date": "2024-12-15T10:30:00",
        "amount": 500.00,
        "category": "Shopping",
        "description": "Black Friday bulk purchase",
        "reason": "Amount $500.00 is 2.5x standard deviations from average ($150.00) in Shopping",
        "severity": "high",
        "zscore": 2.5
      },
      {
        "transaction_id": 38,
        "date": "2024-12-10T14:15:00",
        "amount": 1200.00,
        "category": "Transportation",
        "description": "Flight ticket to NYC",
        "reason": "Amount $1200.00 is 3.2x standard deviations from average ($50.00) in Transportation",
        "severity": "high",
        "zscore": 3.2
      },
      {
        "transaction_id": 35,
        "date": "2024-12-05T09:00:00",
        "amount": 250.00,
        "category": "Food & Dining",
        "description": "Team dinner",
        "reason": "Amount $250.00 is 2.1x standard deviations from average ($25.00) in Food & Dining",
        "severity": "medium",
        "zscore": 2.1
      }
    ],
    "detection_method": "statistical (z-score)",
    "anomaly_count": 3
  }
}
```

**Response (Insufficient Data):**
```json
{
  "status": "success",
  "data": {
    "anomalies": [],
    "detection_method": "statistical (z-score)",
    "anomaly_count": 0,
    "note": "Need at least 3 transactions to detect anomalies"
  }
}
```

**Severity Levels:**
- `high` - 3+ standard deviations (very unusual)
- `medium` - 2-3 standard deviations (quite unusual)
- `low` - 2 standard deviations (slightly unusual)

**Detection Method:**
- Uses Z-score calculation per category
- Requires minimum 3 transactions per category
- Sorts by severity and statistical deviation
- Returns top 10 anomalies

**Use Cases:**
- Fraud detection alerts
- Unusual spending notifications
- Flag transactions for user review
- Identify special occasions or irregular purchases

---

### 5. Auto-Categorize Transaction

**Endpoint:** `POST /api/ai/categorize/`

**Description:** Automatically suggests category for a transaction based on description using keyword matching.

**Request:**
```bash
curl -X POST http://localhost:8000/api/ai/categorize/ \
  -H "Authorization: Token your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Starbucks coffee downtown"
  }'
```

**Request Body:**
```json
{
  "description": "Starbucks coffee downtown"
}
```

**Response (200 OK):**
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
      },
      {
        "name": "Transportation",
        "confidence": 0.0,
        "keywords_matched": []
      },
      {
        "name": "Shopping",
        "confidence": 0.0,
        "keywords_matched": []
      },
      {
        "name": "Entertainment",
        "confidence": 0.0,
        "keywords_matched": []
      },
      {
        "name": "Utilities",
        "confidence": 0.0,
        "keywords_matched": []
      }
    ]
  }
}
```

**Another Example:**
```bash
curl -X POST http://localhost:8000/api/ai/categorize/ \
  -H "Authorization: Token your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Uber ride to downtown"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "suggested_category": "Transportation",
    "confidence": 1.0,
    "all_categories": [
      {
        "name": "Transportation",
        "confidence": 1.0,
        "keywords_matched": ["uber"]
      },
      {
        "name": "Other",
        "confidence": 0.0,
        "keywords_matched": []
      }
    ]
  }
}
```

**Supported Categories & Keywords:**
- **Food & Dining:** restaurant, cafe, coffee, pizza, burger, groceries, supermarket, fast food, etc.
- **Transportation:** gas, uber, lyft, taxi, bus, parking, flight, airline, transit, etc.
- **Entertainment:** movie, netflix, spotify, concert, game, theater, streaming, etc.
- **Shopping:** mall, amazon, ebay, clothing, apparel, fashion, outlet, etc.
- **Utilities:** electricity, water, internet, phone, mobile, bill, etc.
- **Healthcare:** pharmacy, doctor, hospital, dental, medicine, therapy, etc.
- **Education:** school, university, tuition, course, books, training, etc.
- **Fitness:** gym, yoga, sports, workout, health club, trainer, etc.
- **Other:** Fallback category for unmatched descriptions

**Confidence Score:**
- `1.0` = Perfect match (all keywords matched)
- `0.5` = Good match (50% of keywords matched)
- `0.0` = No match (no keywords matched)

**Use Cases:**
- Auto-fill category when creating transactions
- Batch categorize historical transactions
- Improve transaction data quality
- Suggest category in transaction creation form

---

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request** - Invalid parameters:
```json
{
  "status": "error",
  "message": "description field is required"
}
```

**401 Unauthorized** - Missing or invalid token:
```json
{
  "detail": "Invalid token."
}
```

**500 Internal Server Error** - Server issue:
```json
{
  "status": "error",
  "message": "Error details here"
}
```

---

## Integration Examples

### Python / Requests
```python
import requests

TOKEN = "your_token_here"
BASE_URL = "http://localhost:8000/api/ai"
headers = {"Authorization": f"Token {TOKEN}"}

# Get spending analysis
response = requests.get(f"{BASE_URL}/analyze/", headers=headers)
analysis = response.json()

# Predict next 3 months
response = requests.get(f"{BASE_URL}/predict/?months_ahead=3", headers=headers)
predictions = response.json()

# Get recommendations
response = requests.get(f"{BASE_URL}/recommendations/", headers=headers)
recommendations = response.json()

# Detect anomalies
response = requests.get(f"{BASE_URL}/anomalies/?threshold=2.0", headers=headers)
anomalies = response.json()

# Categorize transaction
response = requests.post(
    f"{BASE_URL}/categorize/",
    headers=headers,
    json={"description": "Starbucks coffee"}
)
categorization = response.json()
```

### JavaScript / Fetch
```javascript
const TOKEN = "your_token_here";
const BASE_URL = "http://localhost:8000/api/ai";

async function analyzeSpending() {
  const response = await fetch(`${BASE_URL}/analyze/`, {
    headers: { "Authorization": `Token ${TOKEN}` }
  });
  return response.json();
}

async function predictExpenses(monthsAhead = 3) {
  const response = await fetch(
    `${BASE_URL}/predict/?months_ahead=${monthsAhead}`,
    { headers: { "Authorization": `Token ${TOKEN}` } }
  );
  return response.json();
}

async function getRecommendations() {
  const response = await fetch(`${BASE_URL}/recommendations/`, {
    headers: { "Authorization": `Token ${TOKEN}` }
  });
  return response.json();
}

async function detectAnomalies(threshold = 2.0) {
  const response = await fetch(
    `${BASE_URL}/anomalies/?threshold=${threshold}`,
    { headers: { "Authorization": `Token ${TOKEN}` } }
  );
  return response.json();
}

async function categorizeTransaction(description) {
  const response = await fetch(`${BASE_URL}/categorize/`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ description })
  });
  return response.json();
}
```

### React Component Example
```jsx
import { useState, useEffect } from 'react';

function AIAssistant({ token }) {
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch analysis
        const analysisRes = await fetch(
          'http://localhost:8000/api/ai/analyze/',
          { headers: { "Authorization": `Token ${token}` } }
        );
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData.data);

        // Fetch recommendations
        const recsRes = await fetch(
          'http://localhost:8000/api/ai/recommendations/',
          { headers: { "Authorization": `Token ${token}` } }
        );
        const recsData = await recsRes.json();
        setRecommendations(recsData.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) return <div>Loading AI insights...</div>;

  return (
    <div className="ai-assistant">
      {analysis && (
        <div className="spending-analysis">
          <h3>Spending Summary</h3>
          <p>Total Expenses: ${analysis.total_expenses}</p>
          <p>Total Income: ${analysis.total_income}</p>
          <p>Net Balance: ${analysis.net_balance}</p>
        </div>
      )}
      
      {recommendations && (
        <div className="recommendations">
          <h3>Personalized Recommendations</h3>
          {recommendations.recommendations.map((rec, idx) => (
            <div key={idx} className={`rec rec-${rec.priority}`}>
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
              {rec.potential_savings > 0 && (
                <p className="savings">
                  Potential savings: ${rec.potential_savings.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
```

---

## Performance Notes

- **Analyze:** ~50-100ms (depends on transaction count)
- **Predict:** ~100-200ms (model training + prediction)
- **Recommendations:** ~100-150ms (analysis + rule evaluation)
- **Anomalies:** ~150-300ms (per-category analysis + z-score calculation)
- **Categorize:** ~5-10ms (keyword matching, very fast)

For users with 1000+ transactions, consider:
- Caching analysis results (cache for 1 hour)
- Running predictions asynchronously
- Limiting historical data fetched for analysis

---

## Future Enhancements

- **Advanced ML Models:** Neural networks for better predictions
- **Seasonal Analysis:** Adjust for seasonal spending patterns
- **Peer Comparison:** Compare spending to anonymized peer group
- **Goal Tracking:** Track progress toward savings goals
- **Budget Alerts:** Real-time notifications for unusual spending
- **Natural Language:** Process transaction descriptions using NLP
- **Recurring Patterns:** Identify and track subscriptions/recurring expenses
- **Family Analytics:** Combined family spending analysis and insights

---

## Troubleshooting

**"Insufficient transaction history"**
- Add at least 3 transactions for anomaly detection
- Add at least 2 months of data for predictions
- Ensure transactions have categories assigned

**"Invalid token"**
- Verify token is correct and not expired
- Get new token via login endpoint

**"No categories found"**
- Create category records and assign to transactions
- Use the categorize endpoint to auto-suggest categories

**Low prediction confidence**
- More transaction history needed (aim for 6+ months)
- Irregular spending patterns reduce confidence
- Seasonal changes affect model accuracy

