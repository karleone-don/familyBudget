#!/usr/bin/env python
import requests
import json

token = 'cc9fa0271bbac7313b3583d4f31dcb36f1400b44'
headers = {
    'Authorization': f'Token {token}',
    'Content-Type': 'application/json'
}

# Test 1: Get current profile
print("=" * 50)
print("TEST 1: Get current profile")
print("=" * 50)
response = requests.get('http://localhost:8000/api/users/profile/', headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    user = response.json()
    print(f"Current user: {user['username']}, Age: {user.get('age', 'N/A')}, Email: {user['email']}")
else:
    print(f"Error: {response.text}")

# Test 2: Update profile
print("\n" + "=" * 50)
print("TEST 2: Update profile data")
print("=" * 50)
data = {
    'username': 'abzal_updated_new',
    'age': 32,
    'email': 'abzal_new@mail.com'
}
response = requests.put('http://localhost:8000/api/users/update_profile/', json=data, headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"✓ Successfully updated!")
    print(f"  Username: {result['username']}")
    print(f"  Age: {result.get('age', 'N/A')}")
    print(f"  Email: {result['email']}")
else:
    print(f"Error: {response.text}")

# Test 3: Verify update persisted
print("\n" + "=" * 50)
print("TEST 3: Verify profile was saved")
print("=" * 50)
response = requests.get('http://localhost:8000/api/users/profile/', headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    user = response.json()
    print(f"Current user: {user['username']}, Age: {user.get('age', 'N/A')}, Email: {user['email']}")
    if user['username'] == 'abzal_updated_new':
        print("✓ Profile update persisted successfully!")
    else:
        print("✗ Profile update did not persist!")
else:
    print(f"Error: {response.text}")
