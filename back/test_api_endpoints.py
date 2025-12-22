#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Quick test to verify API is accessible
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
import sys
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

import requests
from django.contrib.auth import get_user_model
from family_budget_app.models import Role, Finance
from rest_framework.authtoken.models import Token

User = get_user_model()

# Get or create test user
User.objects.filter(email='quick-test@example.com').delete()
role = Role.objects.filter(role_name='solo').first() or Role.objects.create(role_name='solo')
user = User.objects.create_user(email='quick-test@example.com', username='quicktest', password='pass', role=role)
Finance.objects.get_or_create(user=user)
token, _ = Token.objects.get_or_create(user=user)

print("[INFO] Testing API endpoints...")
print(f"[INFO] Token: {token.key[:30]}...")

# Test 1: Check if server is running locally
print("\n[TEST 1] Checking localhost:8000...")
try:
    response = requests.post(
        'http://localhost:8000/api/ai/recommendations/',
        headers={'Authorization': f'Token {token.key}'},
        timeout=5
    )
    print(f"[OK] localhost:8000 responded with status {response.status_code}")
except Exception as e:
    print(f"[FAIL] localhost:8000: {e}")

# Test 2: Check if server is running on 127.0.0.1
print("\n[TEST 2] Checking 127.0.0.1:8000...")
try:
    response = requests.post(
        'http://127.0.0.1:8000/api/ai/recommendations/',
        headers={'Authorization': f'Token {token.key}'},
        timeout=5
    )
    print(f"[OK] 127.0.0.1:8000 responded with status {response.status_code}")
except Exception as e:
    print(f"[FAIL] 127.0.0.1:8000: {e}")

print("\n[INFO] Backend server should be accessible at:")
print("  - http://localhost:8000")
print("  - http://127.0.0.1:8000")
print("\n[INFO] Frontend should connect to: http://localhost:8000")
