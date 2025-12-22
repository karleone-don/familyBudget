# 🤖 AI Financial Recommendations Feature

## Overview
This feature integrates Google's Gemini AI to provide personalized financial recommendations based on user financial data and spending patterns.

## Architecture

### Backend Components

#### 1. **New Endpoint**: `AIRecommendationsView`
- **Location**: `back/family_budget_app/views.py`
- **URL**: `POST /api/ai/recommendations/`
- **Method**: POST
- **Authentication**: Required (Token)

#### 2. **Response Format**
```json
{
  "recommendations": "AI-generated financial advice with sections...",
  "finance_summary": {
    "balance": 1500.00,
    "income": 5000.00,
    "expenses": 3500.00,
    "expense_breakdown": {
      "Groceries": 800.00,
      "Entertainment": 450.00,
      ...
    }
  }
}
```

#### 3. **API Key Configuration**
The Gemini API key is configured in the `AIRecommendationsView`:
```python
genai.configure(api_key='AIzaSyD5zwguno05T48ogN16dWPMt7DvDHGcBSc')
```

### Frontend Components

#### 1. **API Service**: `src/api/ai.js`
Handles communication with the backend AI endpoint.

#### 2. **Page Component**: `src/pages/AIRecommendations/AIRecommendations.jsx`
- Separate dedicated page for AI recommendations
- Does NOT modify existing pages
- Features:
  - Intro screen with feature explanation
  - Finance summary display
  - Expense breakdown visualization
  - AI-generated recommendations rendering
  - Regenerate button for new recommendations
  - Error handling

#### 3. **Styling**: `src/pages/AIRecommendations/AIRecommendations.css`
- Modern gradient background
- Responsive design
- Smooth animations
- Mobile-friendly layout

## Features

### AI Recommendations Include:
1. **Top 3 Expense Categories to Limit**
   - Specific recommendations on which categories to reduce
   - Realistic target amounts

2. **How to Increase Income**
   - 3-5 specific, actionable strategies
   - Tailored to user's current situation

3. **Savings Opportunities**
   - 2-3 areas where user can optimize spending
   - Practical implementation tips

4. **Immediate Actions**
   - 2-3 quick wins achievable this week
   - Easy-to-implement suggestions

5. **Long-term Financial Goals**
   - Sustainable financial health recommendations
   - Strategic planning advice

## Integration Steps

### 1. Backend Setup
No additional setup required. The view is already integrated:
- Added to `back/family_budget_app/views.py`
- Registered in `back/family_budget_app/urls.py`
- Requires Python package: `google-generativeai`

### 2. Install Dependencies
```bash
cd back
pip install -r requirements.txt
# or specifically:
pip install google-generativeai==0.3.0
```

### 3. Frontend Integration
Add route to your main routing configuration in `front/src/App.js`:

```jsx
import AIRecommendations from './pages/AIRecommendations/AIRecommendations';

// In your Routes:
<Route path="/ai-recommendations" element={<AIRecommendations />} />
```

### 4. Add Navigation Link
Add to your navigation menu (typically in `Main.jsx` or header component):

```jsx
<Link to="/ai-recommendations">🤖 AI Advisor</Link>
```

## Usage

### For Users
1. Navigate to the AI Recommendations page
2. Click "Generate My Recommendations"
3. Wait for AI to analyze financial data (usually 5-10 seconds)
4. View personalized recommendations
5. Click "Get New Recommendations" to regenerate

### API Call Example
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:8000/api/ai/recommendations/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`,
  },
});
const data = await response.json();
console.log(data.recommendations);
```

## Data Analysis

The AI analyzes:
- User's current balance, income, and expenses
- Transaction history (last 50 transactions)
- Expense breakdown by category
- Income vs. expense ratio
- Current financial health status

## Error Handling

The component includes comprehensive error handling:
- Authentication validation
- Network error handling
- API error responses
- User-friendly error messages

## Performance Considerations

- **Caching**: Recommendations are generated on-demand
- **API Limits**: Google Gemini API has rate limits
- **Response Time**: Typically 5-15 seconds per request
- **Database Queries**: Optimized to fetch only necessary transactions

## Security Notes

⚠️ **Important**: The API key is embedded in the backend code. For production:
1. Move API key to environment variables:
   ```python
   import os
   API_KEY = os.getenv('GEMINI_API_KEY')
   genai.configure(api_key=API_KEY)
   ```

2. Add to `.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Update `.gitignore` to exclude `.env` files

## Troubleshooting

### Error: "No finance data found"
- User must have completed initial finance setup
- Ensure user has at least some transaction history

### Error: "Failed to generate recommendations"
- Check API key validity
- Verify internet connection
- Check API rate limits haven't been exceeded

### Empty recommendations
- User might not have transaction data
- Try adding sample transactions first

## Future Enhancements

Potential improvements:
1. Add financial goal setting based on recommendations
2. Schedule periodic recommendations (weekly/monthly)
3. Compare recommendations across time
4. Add export/share functionality
5. Customize recommendation depth/style
6. Multi-language support
7. Integration with budget planning

## File Structure
```
front/src/
├── api/
│   └── ai.js                          (NEW: AI API service)
└── pages/
    └── AIRecommendations/             (NEW: AI page directory)
        ├── AIRecommendations.jsx      (NEW: Main component)
        └── AIRecommendations.css      (NEW: Styles)

back/family_budget_app/
├── views.py                           (MODIFIED: Added AIRecommendationsView)
└── urls.py                            (MODIFIED: Added AI endpoint)
```

## Dependencies Added
- `google-generativeai==0.3.0` (added to `back/requirements.txt`)

## Notes
- ✅ Isolated feature - doesn't modify existing pages
- ✅ Fully responsive design
- ✅ Beautiful gradient UI
- ✅ Smooth animations
- ✅ Comprehensive error handling
- ✅ SEO-friendly structure
