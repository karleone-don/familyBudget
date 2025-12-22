#!/usr/bin/env python
import os
import django
import sys
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from family_budget_app.models import User, Finance, Transaction, Category, Role
from rest_framework.test import APIRequestFactory
from rest_framework.authtoken.models import Token
import requests

# Get or create a test user
try:
    user = User.objects.get(email='test@test.com')
    print(f"Using existing user: {user.email}")
except User.DoesNotExist:
    print("Creating new test user...")
    try:
        role = Role.objects.get(role_name='solo')
    except Role.DoesNotExist:
        role = Role.objects.create(role_name='solo')
    
    user = User.objects.create_user(email='test@test.com', username='testuser', password='test123', role=role)
    Finance.objects.create(user=user)
    print(f"Created test user: {user.email}")

# Create token if doesn't exist
token_obj, created = Token.objects.get_or_create(user=user)
print(f"Token: {token_obj.key}")

# Check if user has finance
finance = Finance.objects.get(user=user)
print(f"\nUser {user.username} has Finance:")
print(f"  - Balance: {finance.balance}")
print(f"  - Income: {finance.income}")
print(f"  - Expenses: {finance.expenses}")

# Test the endpoint via HTTP
print("\nTesting AI Recommendations endpoint...")
headers = {
    'Authorization': f'Token {token_obj.key}',
    'Content-Type': 'application/json'
}

try:
    response = requests.post('http://127.0.0.1:8000/api/ai/recommendations/', headers=headers)
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    print(traceback.format_exc())
