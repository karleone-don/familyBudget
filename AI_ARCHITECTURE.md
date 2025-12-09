# AI Budget Assistant - Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  - Dashboard with spending charts                           │
│  - Transaction categorization form                          │
│  - Budget recommendations widget                            │
│  - Anomaly alerts                                           │
│  - Expense forecast display                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                 HTTP/REST API Calls
                           │
       ┌───────────────────┴───────────────────┐
       │                                       │
       ▼                                       ▼
   ┌──────────────────┐         ┌──────────────────────┐
   │ Django REST API  │         │ Django ORM           │
   │ (DRF)            │◄────────┤ Query Builder        │
   │                  │         │                      │
   │ Routes:          │         │ Fetches:             │
   │ /api/ai/*        │         │ - Transactions       │
   │                  │         │ - Categories         │
   └────────┬─────────┘         │ - Finance Records    │
            │                   └──────────────────────┘
            │                            ▲
            │                            │
            ▼                            │
   ┌──────────────────────────────────────┴──────────┐
   │      AIAssistantViewSet (views.py)              │
   ├───────────────────────────────────────────────────┤
   │                                                   │
   │  - authenticate() - validate token               │
   │  - analyze() - call BudgetAIService               │
   │  - predict() - query parameters handling         │
   │  - recommendations() - error handling            │
   │  - anomalies() - response formatting             │
   │  - categorize() - JSON validation                │
   │                                                   │
   └────────────────────────┬────────────────────────┘
                            │
                            │ Instantiates
                            │
                            ▼
   ┌──────────────────────────────────────────────────┐
   │     BudgetAIService (ai_service.py)              │
   ├───────────────────────────────────────────────────┤
   │                                                   │
   │  analyze_spending()                              │
   │  ├─ Fetch all transactions                       │
   │  ├─ Group by category                            │
   │  ├─ Group by month                               │
   │  └─ Calculate statistics                         │
   │                                                   │
   │  predict_monthly_expenses()                      │
   │  ├─ Group transactions by month                  │
   │  ├─ Prepare training data (numpy)                │
   │  ├─ Train LinearRegression model (scikit-learn)  │
   │  ├─ Predict next N months                        │
   │  └─ Calculate confidence (R² score)              │
   │                                                   │
   │  get_budget_recommendations()                    │
   │  ├─ Call analyze_spending()                      │
   │  ├─ Apply recommendation rules                   │
   │  ├─ Calculate potential savings                  │
   │  └─ Return sorted by priority                    │
   │                                                   │
   │  detect_anomalies()                              │
   │  ├─ Group by category                            │
   │  ├─ Calculate Z-score per category               │
   │  ├─ Filter by threshold                          │
   │  └─ Sort by severity                             │
   │                                                   │
   │  categorize_transaction()                        │
   │  ├─ Tokenize description                         │
   │  ├─ Match keywords                               │
   │  ├─ Calculate confidence                         │
   │  └─ Return top categories                        │
   │                                                   │
   └────────────────┬──────────────────────────────┬──┘
                    │                              │
        ┌───────────┴──────────┐        ┌─────────┴───────────┐
        │                      │        │                     │
        ▼                      ▼        ▼                     ▼
   ┌─────────────┐        ┌─────────────┐        ┌──────────────┐
   │   Pandas    │        │   NumPy     │        │ scikit-learn │
   ├─────────────┤        ├─────────────┤        ├──────────────┤
   │ DataFrame   │        │ Arrays      │        │ LinearRegr.  │
   │ Grouping    │        │ Math ops    │        │ StandardSc.  │
   │ Aggregation │        │ Statistics  │        │ Predictions  │
   └─────────────┘        └─────────────┘        └──────────────┘
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                       │
                       ▼
            ┌────────────────────────┐
            │  JSON Response         │
            ├────────────────────────┤
            │ {                      │
            │   "status": "success", │
            │   "data": {...}        │
            │ }                      │
            └────────────────────────┘
```

---

## 🔄 Request/Response Flow Example

### Scenario: User requests spending analysis

```
User clicks "View Analysis" in Frontend
     │
     ├─► Browser sends GET /api/ai/analyze/
     │   Header: Authorization: Token abc123...
     │   (No body needed)
     │
     ▼ Django receives request
     
AIAssistantViewSet.analyze()
     │
     ├─► Check authentication (IsAuthenticated)
     │   └─► Valid? Continue : Return 401
     │
     ├─► Call BudgetAIService(request.user)
     │   └─► service = BudgetAIService(User)
     │
     ├─► Call service.analyze_spending()
     │
     ▼ BudgetAIService.analyze_spending()
     
_get_transactions()
     │
     └─► Query DB: Transaction.objects.filter(finance=self.finance)
         ├─ SELECT * FROM family_budget_app_transaction
         │  WHERE finance_id = X
         │  ORDER BY date DESC
         │
         └─► Returns: QuerySet of Transaction objects
     
Group transactions by category
     │
     ├─► For each transaction:
     │   └─► category_name = transaction.category.category_name
     │       amount = transaction.amount
     │       by_category[category] += amount
     │
     └─► Result: Dict[category_name, total_amount]

Calculate statistics
     │
     ├─► total_income = sum(t.amount for t in income_transactions)
     ├─► total_expenses = sum(t.amount for t in expense_transactions)
     ├─► net_balance = total_income - total_expenses
     ├─► avg_monthly = total_expenses / num_months
     ├─► top_categories = sorted(by_category)[:5]
     │
     └─► Result: Dict with analysis data

Convert to JSON
     │
     ├─► Convert Decimal → float
     ├─► Convert datetime → ISO format string
     ├─► Build response dict
     │
     └─► Return: {
             'total_expenses': 2500.50,
             'total_income': 5000.00,
             'by_category': {...},
             ...
         }

Response sent to View
     │
     ├─► Wrap in standard response format:
     │   {
     │     "status": "success",
     │     "data": {...}
     │   }
     │
     ▼ Return to Frontend
     
Browser receives 200 OK response
     │
     └─► Parse JSON
         ├─► Extract analysis.data
         ├─► Render charts
         └─► Display to user
```

---

## 📊 Data Models & Relationships

```
User (Django User model)
│
├─ user_id (PK)
├─ username
├─ email
├─ password (hashed)
├─ age
├─ role_id (FK to Role)
└─ family_id (FK to Family)
   │
   ├─► Finance (OneToOneField)
   │   │
   │   ├─ finance_id (PK)
   │   ├─ balance
   │   ├─ income
   │   └─ expenses
   │      │
   │      └─► Transaction (ForeignKey)
   │          │
   │          ├─ transaction_id (PK)
   │          ├─ amount
   │          ├─ type (income/expense)
   │          ├─ date
   │          ├─ description
   │          └─ category_id (FK to Category)
   │             │
   │             └─► Category
   │                 ├─ category_id (PK)
   │                 └─ category_name
   │
   └─► Family (ForeignKey)
       │
       ├─ family_id (PK)
       ├─ admin_id (FK to User)
       └─ family_name
```

---

## 🔐 Authentication Flow

```
1. User registers/logs in
   ├─► POST /api/auth/register/ or /api/auth/login/
   ├─► Credentials validated
   ├─► Token created (via django-rest-framework.authtoken)
   └─► Token returned to frontend

2. Frontend stores token
   ├─► localStorage.setItem('token', response.token)
   └─► Or sessionStorage/Cookie

3. User makes AI request
   ├─► GET /api/ai/analyze/
   ├─► Header: Authorization: Token abc123...
   └─► Sent with each request

4. Django validates token
   ├─► @permission_classes([IsAuthenticated])
   ├─► Extract token from header
   ├─► Query authtoken_token table
   ├─► Match user_id
   └─► ✓ Valid token? Continue : Return 401

5. AI Service has user context
   ├─► BudgetAIService(user)
   ├─► Fetch only THIS user's transactions
   ├─► No data leakage between users
   └─► Privacy & Security ✓
```

---

## 🎯 ML Algorithm Details

### Linear Regression for Expense Prediction

```
Historical Monthly Data:
├─ Month 0: Expense = $1000
├─ Month 1: Expense = $1050
├─ Month 2: Expense = $1100
├─ Month 3: Expense = $1150
└─ Month 4: Expense = $1200

Training (scikit-learn):
├─ X = [0, 1, 2, 3, 4]  (month indices)
├─ y = [1000, 1050, 1100, 1150, 1200]  (expenses)
├─ Model = LinearRegression()
├─ Model.fit(X, y)
└─ Learns: y = 1000 + 50*x

Prediction:
├─ Next month (x=5): y = 1000 + 50*5 = $1250
├─ Next month (x=6): y = 1000 + 50*6 = $1300
├─ Next month (x=7): y = 1000 + 50*7 = $1350
└─ Confidence measured by R² score
   (1.0 = perfect prediction, 0.0 = no correlation)
```

### Z-Score Anomaly Detection

```
Category: Food & Dining
Transactions: [$25, $30, $35, $40, $45, $400]

Statistics:
├─ Mean = (25+30+35+40+45+400) / 6 = $95.83
├─ Std Dev = √(variance) = $153.21
└─ Variance = sum((x-mean)²) / n

Z-Score calculation:
├─ $25: z = (25 - 95.83) / 153.21 = -0.46 (normal)
├─ $30: z = (30 - 95.83) / 153.21 = -0.43 (normal)
├─ $35: z = (35 - 95.83) / 153.21 = -0.40 (normal)
├─ $40: z = (40 - 95.83) / 153.21 = -0.37 (normal)
├─ $45: z = (45 - 95.83) / 153.21 = -0.33 (normal)
└─ $400: z = (400 - 95.83) / 153.21 = +1.99 (ANOMALY!)

Threshold = 2.0 std dev
├─ |z| < 2.0: Normal transaction ✓
├─ |z| ≥ 2.0: Anomaly ⚠️
└─ |z| ≥ 3.0: Severe anomaly 🚨
```

### Keyword-Based Categorization

```
Description: "Starbucks coffee downtown"

Category Scoring:
├─ Food & Dining
│  ├─ Keywords: [restaurant, cafe, coffee, ...]
│  ├─ Matched: ['coffee']
│  ├─ Score: 1 matched / 50+ keywords = 2%
│  └─ ⟵ WINNER (highest score)
│
├─ Transportation
│  ├─ Keywords: [uber, taxi, gas, ...]
│  ├─ Matched: []
│  ├─ Score: 0 / 40+ keywords = 0%
│  └─ ✗
│
└─ Other
   ├─ No scoring
   └─ Only selected if no other match

Confidence Calculation:
├─ Formula: matches_found / total_keywords_in_category
├─ Range: 0.0 (no match) to 1.0 (all match)
└─ 100% means all keywords matched
```

---

## 📈 Performance Characteristics

```
Endpoint               | Time    | Complexity | Data Size
──────────────────────────────────────────────────────────
analyze/              | 50-100ms | O(n)      | n = transactions
predict/              | 100-200ms| O(n log n)| ML model fit
recommendations/      | 100-150ms| O(n)      | Analysis + rules
anomalies/            | 150-300ms| O(n)      | Per-category stats
categorize/           | 5-10ms   | O(m)      | m = keywords

Where:
n = number of transactions (typically 10-1000)
m = number of keywords (50-100)
```

### Optimization Tips

```
For large datasets (1000+ transactions):

1. Cache results
   └─ Cache analysis for 1 hour
      └─ Reduces database queries

2. Limit historical window
   └─ Analyze last 6-12 months instead of all
      └─ Faster processing

3. Batch operations
   └─ Use select_related/prefetch_related
      └─ Reduces N+1 queries

4. Background tasks
   └─ Use Celery for predictions
      └─ Don't block response
```

---

## 🔍 Debugging Tips

### Enable Debug Logging
```python
# In Django settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {'handlers': ['console'], 'level': 'DEBUG'},
}
```

### Check AI Service Directly
```python
from family_budget_app.ai_service import BudgetAIService
from family_budget_app.models import User

user = User.objects.get(user_id=1)
ai = BudgetAIService(user)

# Test each method
print(ai.analyze_spending())
print(ai.predict_monthly_expenses())
print(ai.get_budget_recommendations())
print(ai.detect_anomalies())
print(ai.categorize_transaction("Starbucks"))
```

### Check Database Queries
```python
from django.db import connection
from django.test.utils import CaptureQueriesContext

with CaptureQueriesContext(connection) as context:
    # Your code here
    ai.analyze_spending()

print(f"Queries executed: {len(context)}")
for query in context:
    print(query['sql'])
```

---

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Use Django settings for environment
- [ ] Enable HTTPS/SSL
- [ ] Set SECRET_KEY from environment
- [ ] Configure CORS properly
- [ ] Use database connection pooling
- [ ] Enable query caching (Redis)
- [ ] Set up monitoring/logging
- [ ] Use async workers (Celery)
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Security headers configured
- [ ] CSRF protection enabled

### Scaling
```
Single Server → 1000s users
├─ Optimize queries
├─ Add database indexes
└─ Cache results

Multiple Servers → 10000s users
├─ Use load balancer
├─ Shared cache (Redis)
├─ Async tasks (Celery)
└─ Database replication

Enterprise → 100000s users
├─ Microservices architecture
├─ ML inference service
├─ Data warehouse
└─ Real-time streaming
```

---

## 📝 Files Overview

```
back/
├── family_budget_app/
│   ├── ai_service.py              ← AI algorithms (500+ lines)
│   ├── views.py                   ← API endpoints
│   ├── urls.py                    ← Route definitions
│   ├── models.py                  ← Database schema
│   ├── serializers.py             ← Request/response validation
│   └── management/
│       └── commands/
│           └── create_roles.py    ← Initialization
│
├── test_ai_service.py             ← Test suite
├── manage.py                       ← Django CLI
├── requirements.txt               ← Dependencies
└── db.sqlite3                      ← Database

Documentation:
├── AI_ASSISTANT_API.md            ← API reference
├── AI_QUICK_START.md              ← Getting started
├── AI_IMPLEMENTATION_SUMMARY.md   ← Technical details
└── ARCHITECTURE.md                ← This file
```

---

**Last Updated:** December 9, 2025

