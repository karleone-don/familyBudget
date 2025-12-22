#!/usr/bin/env python
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from family_budget_app.models import User, Finance, Category, Role
from family_budget_app.views import AIRecommendationsView
from rest_framework.test import APIRequestFactory

print("=" * 60)
print("Testing AI Recommendations Endpoint")
print("=" * 60)

# Get or create a test user
try:
    user = User.objects.get(email='testuser@example.com')
    print(f"\n✓ Using existing user: {user.email}")
except User.DoesNotExist:
    print("\n→ Creating new test user...")
    role = Role.objects.filter(role_name='solo').first() or Role.objects.create(role_name='solo')
    user = User.objects.create_user(email='testuser@example.com', username='testuser', password='test123', role=role)
    Finance.objects.create(user=user)
    print(f"✓ Created test user: {user.email}")

# Check finance
finance = Finance.objects.get(user=user)
print(f"\n Finance Data:")
print(f"  - Balance: ${finance.balance}")
print(f"  - Income: ${finance.income}")
print(f"  - Expenses: ${finance.expenses}")

# Test the view
print(f"\n→ Testing AIRecommendationsView...")
factory = APIRequestFactory()
request = factory.post('/api/ai/recommendations/')
request.user = user

view = AIRecommendationsView()
try:
    response = view.post(request)
    print(f"\n✓ Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.data
        print(f"✓ Success!")
        print(f"  Keys in response: {list(data.keys())}")
        if 'recommendations' in data:
            recs = data['recommendations']
            print(f"  Recommendations length: {len(recs)} characters")
            print(f"  First 300 chars:\n{recs[:300]}...")
    else:
        print(f"✗ Error: {response.data}")
except Exception as e:
    import traceback
    print(f"\n✗ Exception occurred:")
    print(f"  {type(e).__name__}: {e}")
    print(f"\nFull traceback:")
    print(traceback.format_exc())

print("\n" + "=" * 60)
