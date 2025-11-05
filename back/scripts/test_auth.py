import os
import sys
import requests
import json
import time
from pprint import pprint
from typing import Dict, Any

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
from rest_framework.authtoken.models import Token
from family_budget_app.models import Role, Family

User = get_user_model()

def wait_for_server(base_url: str, max_retries: int = 5) -> bool:
    """Wait for the server to be ready."""
    for attempt in range(max_retries):
        try:
            requests.get(base_url)
            return True
        except:
            print(f"Waiting for server... (attempt {attempt + 1}/{max_retries})")
            time.sleep(1)
    return False

def get_redirect_url(role_name: str) -> str:
    """Get the expected redirect URL based on user role."""
    return {
        'admin': '/admin-dashboard',
        'family_member': '/member-dashboard',
        'kid': '/kid-dashboard',
        None: '/solo-dashboard'
    }.get(role_name, '/solo-dashboard')

def get_user_test_data() -> list:
    """Get all users from database with their test credentials."""
    print("\nFetching users from database...")
    test_data = []
    
    for user in User.objects.select_related('role', 'family').all():
        # Get the actual stored token if it exists
        token, _ = Token.objects.get_or_create(user=user)
        
        role_name = user.role.role_name if user.role else None
        role_display = role_name.replace('_', ' ').title() if role_name else 'Solo'
        
        # Map role to default test password
        password_map = {
            'admin': 'adminpass123',
            'family_member': 'memberpass123',
            'kid': 'kidpass123',
            None: 'solopass123'
        }
        
        # Special cases for specific users
        email_password_map = {
            'abzal@kbtu.kz': 'abzalpass123',
            'zhaxylyk@kbtu.kz': 'zhaxylykpass123',
            'new.user@example.com': 'newpass123'
        }
        
        password = email_password_map.get(user.email) or password_map.get(role_name, 'solopass123')
        
        test_data.append({
            'role': f"{role_display} user",
            'email': user.email,
            'username': user.username,
            'password': password,
            'family': user.family.family_name if user.family else None,
            'stored_token': token.key,
            'expected_redirect': get_redirect_url(role_name)
        })
        print(f"Found user: {user.email} (Role: {role_display})")
    
    return test_data

# Initialize
base_url = 'http://127.0.0.1:8000'
if not wait_for_server(base_url):
    print("Server is not responding. Make sure it's running!")
    sys.exit(1)

# Get users from database with their actual tokens
users = get_user_test_data()

def test_user_login(user: Dict[str, Any]) -> bool:
    """Test login for a single user and validate the response."""
    print(f"\n=== Testing {user['role']} login ===")
    print(f"Email: {user['email']}")
    
    # Try to authenticate
    response = requests.post(
        f'{base_url}/api/auth/login/',
        json={'email': user['email'], 'password': user['password']}
    )
    
    print(f"\nStatus code: {response.status_code}")
    success = True
    
    if response.status_code == 200:
        data = response.json()
        
        # Print response data
        print("\nResponse data:")
        print(f"Token received: {data.get('token')}")
        print(f"Token in DB:   {user['stored_token']}")
        print(f"Redirect URL:  {data.get('redirect_url')}")
        
        # Print user details
        user_data = data.get('user', {})
        print("\nUser details:")
        print(f"Username: {user_data.get('username')}")
        print(f"Email:    {user_data.get('email')}")
        print(f"Role:     {user_data.get('role_name')}")
        print(f"Family:   {user_data.get('family_name')}")
        
        # Validate token matches stored token
        if data.get('token') == user['stored_token']:
            print("\n✓ Token matches stored token")
        else:
            print("\n✗ Token mismatch!")
            success = False
            
        # Validate redirect URL
        if data.get('redirect_url') == user['expected_redirect']:
            print("✓ Redirect URL matches expected value")
        else:
            print(f"✗ Redirect URL mismatch! Expected {user['expected_redirect']}, got {data.get('redirect_url')}")
            success = False
            
        # Validate user data
        if user_data.get('email') == user['email']:
            print("✓ Email matches")
        else:
            print("✗ Email mismatch!")
            success = False
    else:
        print("Error response:", response.text)
        success = False
    
    print("\n" + "="*50)
    return success

# Test all users
print("\nStarting authentication tests...")
total_tests = len(users)
successful_tests = 0

for user in users:
    if test_user_login(user):
        successful_tests += 1

# Print summary
print(f"\nTest Summary:")
print(f"Total tests:      {total_tests}")
print(f"Successful tests: {successful_tests}")
print(f"Failed tests:     {total_tests - successful_tests}")
print(f"Success rate:     {(successful_tests/total_tests)*100:.1f}%")