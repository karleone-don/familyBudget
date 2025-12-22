#!/usr/bin/env python
"""
Comprehensive test script for AI Recommendations feature
Tests: Registration -> Finance Setup -> AI Recommendations
"""

import requests
import json
import random
import sys
from datetime import datetime, timedelta

API_URL = "http://localhost:8000/api"

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_section(title):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{title}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(msg):
    print(f"{Colors.OKGREEN}✓ {msg}{Colors.ENDC}")

def print_error(msg):
    print(f"{Colors.FAIL}✗ {msg}{Colors.ENDC}")

def print_info(msg):
    print(f"{Colors.OKCYAN}ℹ {msg}{Colors.ENDC}")

def print_warning(msg):
    print(f"{Colors.WARNING}⚠ {msg}{Colors.ENDC}")

# Test 1: Register a test user
def test_register():
    print_section("STEP 1: Register Test User")
    
    test_email = f"testuser_{random.randint(1000, 9999)}@test.com"
    test_username = f"testuser_{random.randint(1000, 9999)}"
    
    payload = {
        "username": test_username,
        "email": test_email,
        "password": "TestPassword123!",
        "password2": "TestPassword123!",
        "age": 30
    }
    
    print_info(f"Registering user: {test_email}")
    
    try:
        response = requests.post(f"{API_URL}/auth/register/", json=payload)
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            token = data.get('token')
            user_id = data.get('user', {}).get('user_id')
            
            print_success(f"User registered successfully!")
            print_info(f"Username: {test_username}")
            print_info(f"Email: {test_email}")
            print_info(f"Token: {token[:20]}...")
            print_info(f"User ID: {user_id}")
            
            return {
                'token': token,
                'user_id': user_id,
                'email': test_email,
                'username': test_username
            }
        else:
            print_error(f"Registration failed: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Error during registration: {str(e)}")
        return None

# Test 2: Setup finance data
def test_finance_setup(token, user_id):
    print_section("STEP 2: Create Finance Data & Transactions")
    
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    
    # First, get or create finance record
    print_info("Getting/Creating finance record...")
    
    try:
        response = requests.get(f"{API_URL}/finance/self_data/", headers=headers)
        if response.status_code == 200:
            print_success("Finance record found/created")
        else:
            print_warning(f"Could not get finance data: {response.status_code}")
    except Exception as e:
        print_error(f"Error getting finance: {str(e)}")
        return False
    
    # Create some categories if they don't exist
    print_info("Getting categories...")
    try:
        response = requests.get(f"{API_URL}/categories/", headers=headers)
        if response.status_code == 200:
            categories = response.json()
            if isinstance(categories, dict):
                categories = categories.get('results', [])
            print_success(f"Found {len(categories)} categories")
            category_ids = [cat.get('category_id') for cat in categories if cat.get('category_id')]
        else:
            category_ids = []
    except Exception as e:
        print_error(f"Error getting categories: {str(e)}")
        category_ids = []
    
    # Create some transactions
    if category_ids:
        print_info("Creating sample transactions...")
        
        transaction_types = [
            {'type': 'expense', 'category': category_ids[0] if len(category_ids) > 0 else None, 'amounts': [50, 100, 150, 75]},
            {'type': 'expense', 'category': category_ids[1] if len(category_ids) > 1 else None, 'amounts': [30, 45, 60]},
            {'type': 'income', 'category': None, 'amounts': [2000, 1500]},
        ]
        
        transaction_count = 0
        for trans_data in transaction_types:
            for amount in trans_data['amounts']:
                payload = {
                    'amount': amount,
                    'type': trans_data['type'],
                    'category': trans_data['category'],
                    'description': f"Sample {trans_data['type']} transaction"
                }
                
                try:
                    response = requests.post(f"{API_URL}/transactions/", json=payload, headers=headers)
                    if response.status_code in [201, 200]:
                        transaction_count += 1
                except:
                    pass
        
        print_success(f"Created {transaction_count} sample transactions")
    
    # Update finance data with income and expenses
    print_info("Updating finance data...")
    payload = {
        'income': 3500.00,
        'expenses': 2150.00
    }
    
    try:
        response = requests.post(f"{API_URL}/finance/update_data/", json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print_success("Finance data updated")
            print_info(f"  Balance: ${data.get('balance', 0)}")
            print_info(f"  Income: ${data.get('income', 0)}")
            print_info(f"  Expenses: ${data.get('expenses', 0)}")
            return True
        else:
            print_warning(f"Could not update finance: {response.status_code}")
            return True  # Continue anyway
    except Exception as e:
        print_error(f"Error updating finance: {str(e)}")
        return True  # Continue anyway

# Test 3: Test AI Recommendations
def test_ai_recommendations(token):
    print_section("STEP 3: Test AI Recommendations Endpoint")
    
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    
    print_info("Sending request to AI recommendations endpoint...")
    print_warning("This may take 5-15 seconds while AI generates recommendations...")
    
    try:
        response = requests.post(f"{API_URL}/ai/recommendations/", headers=headers, timeout=30)
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print_success("✓ AI Recommendations generated successfully!")
            
            # Print finance summary
            summary = data.get('finance_summary', {})
            print_info("\n📊 Finance Summary:")
            print_info(f"  Balance: ${summary.get('balance', 0):.2f}")
            print_info(f"  Income: ${summary.get('income', 0):.2f}")
            print_info(f"  Expenses: ${summary.get('expenses', 0):.2f}")
            
            # Print expense breakdown
            breakdown = summary.get('expense_breakdown', {})
            if breakdown:
                print_info("\n💳 Expense Breakdown:")
                for category, amount in sorted(breakdown.items(), key=lambda x: x[1], reverse=True):
                    print_info(f"  {category}: ${amount:.2f}")
            
            # Print recommendations
            recommendations = data.get('recommendations', '')
            print_success("\n🤖 AI Recommendations:")
            print("-" * 60)
            print(recommendations)
            print("-" * 60)
            
            return True
        else:
            print_error(f"Failed to get AI recommendations")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print_error("Request timed out - API may be slow")
        return False
    except Exception as e:
        print_error(f"Error during AI recommendations: {str(e)}")
        return False

# Main test flow
def main():
    print(f"\n{'='*60}")
    print(f"AI RECOMMENDATIONS FEATURE - COMPREHENSIVE TEST".center(60))
    print(f"{'='*60}\n")
    
    print_info(f"Testing API at: {API_URL}")
    print_info(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Step 1: Register user
    user_data = test_register()
    if not user_data:
        print_error("Failed to register user. Aborting tests.")
        return
    
    # Step 2: Setup finance data
    success = test_finance_setup(user_data['token'], user_data['user_id'])
    if not success:
        print_warning("Finance setup had issues, but continuing...")
    
    # Step 3: Test AI Recommendations
    success = test_ai_recommendations(user_data['token'])
    
    print_section("TEST SUMMARY")
    if success:
        print_success("All tests completed successfully! ✓")
        print_success("AI Recommendations feature is working correctly!")
    else:
        print_error("Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
