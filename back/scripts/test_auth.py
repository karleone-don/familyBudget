import requests
import json
import time
from pprint import pprint

# Wait for server to be ready
base_url = 'http://127.0.0.1:8000'
for _ in range(5):
    try:
        requests.get(base_url)
        break
    except:
        print("Waiting for server...")
        time.sleep(1)

# Test users (from create_sample_users.py)
users = [
    {
        'role': 'Admin user',
        'email': 'admin1@example.com',
        'password': 'adminpass123',
        'expected_redirect': '/admin-dashboard'
    },
    {
        'role': 'Family member',
        'email': 'member1@example.com',
        'password': 'memberpass123',
        'expected_redirect': '/member-dashboard'
    },
    {
        'role': 'Kid user',
        'email': 'kid1@example.com',
        'password': 'kidpass123',
        'expected_redirect': '/kid-dashboard'
    },
    {
        'role': 'Solo user (no family)',
        'email': 'solo@example.com',
        'password': 'solopass123',
        'expected_redirect': '/solo-dashboard'
    }
]

for user in users:
    print(f"\n=== Testing {user['role']} login ===")
    response = requests.post(
        f'{base_url}/api/auth/login/',
        json={'email': user['email'], 'password': user['password']}
    )
    
    print(f"Status code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("\nResponse:")
        print(f"Token: {data.get('token')}")
        print(f"Redirect URL: {data.get('redirect_url')}")
        
        user_data = data.get('user', {})
        print("\nUser info:")
        print(f"Email: {user_data.get('email')}")
        print(f"Role: {user_data.get('role_name')}")
        print(f"Family: {user_data.get('family_name')}")
        
        # Verify redirect matches expected
        if data.get('redirect_url') == user['expected_redirect']:
            print("\n✓ Redirect URL matches expected value")
        else:
            print(f"\n✗ Redirect URL mismatch! Expected {user['expected_redirect']}, got {data.get('redirect_url')}")
    else:
        print("Error response:", response.text)
    
    print("\n" + "="*50)