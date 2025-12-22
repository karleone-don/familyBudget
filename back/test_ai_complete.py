#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Complete test of the AI Recommendations endpoint
"""
import os
import django
import sys
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from family_budget_app.models import Role, Finance
from rest_framework.authtoken.models import Token

User = get_user_model()

# Create test user
print("=" * 70)
print("AI RECOMMENDATIONS ENDPOINT TEST")
print("=" * 70)

# Clean up old test user
User.objects.filter(email='test-ai@example.com').delete()

# Create user with proper role
role = Role.objects.filter(role_name='solo').first()
if not role:
    role = Role.objects.create(role_name='solo')
    
user = User.objects.create_user(
    email='test-ai@example.com',
    username='testai',
    password='testpass123',
    role=role
)

# Ensure Finance exists
finance, created = Finance.objects.get_or_create(user=user)
if created:
    print("[OK] Created Finance record")

# Get or create token
token, created = Token.objects.get_or_create(user=user)
print("[OK] User created: " + user.email)
print("[OK] Token: " + token.key[:20] + "...")

# Make HTTP request using Django test client
client = Client()

print("\n[->] Sending POST request to /api/ai/recommendations/...")
print("[->] Authorization: Token " + token.key[:20] + "...")

response = client.post(
    '/api/ai/recommendations/',
    content_type='application/json',
    HTTP_AUTHORIZATION='Token ' + token.key
)

print("\n[OK] Response Status Code: " + str(response.status_code))

if response.status_code == 200:
    try:
        data = json.loads(response.content)
        print("[OK] Response is valid JSON")
        print("[OK] Keys in response: " + str(list(data.keys())))
        
        if 'recommendations' in data:
            recs = data['recommendations']
            print("[OK] Recommendations field exists (" + str(len(recs)) + " chars)")
            print("\n[OK] First 500 characters of recommendations:\n")
            print(recs[:500])
            print("\n...")
        
        if 'finance_summary' in data:
            summary = data['finance_summary']
            print("\n[OK] Finance Summary:")
            print("     - Balance: $" + str(summary.get('balance')))
            print("     - Income: $" + str(summary.get('income')))
            print("     - Expenses: $" + str(summary.get('expenses')))
            
    except json.JSONDecodeError as e:
        print("[ERROR] Invalid JSON response: " + str(e))
        print("Response content: " + str(response.content))
else:
    print("[ERROR] Status " + str(response.status_code))
    try:
        data = json.loads(response.content)
        print("Response: " + json.dumps(data, indent=2))
    except:
        print("Response: " + str(response.content))

print("\n" + "=" * 70)
