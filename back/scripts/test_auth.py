import os
import sys
import requests
import json
import time
from pprint import pprint

# Add project root to Python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
import django
django.setup()

# Import Django models
from django.contrib.auth import get_user_model
from family_budget_app.models import Role, Family

User = get_user_model()

# Wait for server to be ready
base_url = 'http://127.0.0.1:8000'
for _ in range(5):
    try:
        requests.get(base_url)
        break
    except:
        print("Waiting for server...")
        time.sleep(1)

# Get users from database
def get_redirect_url(role_name):
    if role_name == 'admin':
        return '/admin-dashboard'
    elif role_name == 'family_member':
        return '/member-dashboard'
    elif role_name == 'kid':
        return '/kid-dashboard'
    else:
        return '/solo-dashboard'

users = []
for user in User.objects.all():
    role_name = user.role.role_name if user.role else 'solo'
    users.append({
        'role': f"{role_name.replace('_', ' ').title()} user",
        'email': user.email,
        'password': 'adminpass123' if role_name == 'admin' else 
                   'memberpass123' if role_name == 'family_member' else
                   'kidpass123' if role_name == 'kid' else 'solopass123',
        'expected_redirect': get_redirect_url(role_name)
    })

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