#!/usr/bin/env python
"""
Test script to verify the invitations API endpoints work correctly.
Run this with: python test_invitations_api.py
"""

import os
import sys
import django

# Add the back directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'back'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from family_budget_app.models import User, Role, Family, Invitation
from django.utils import timezone
import uuid

def test_invitations_api():
    """Test invitations API endpoints"""
    
    print("\n" + "="*70)
    print("TESTING INVITATIONS API ENDPOINTS")
    print("="*70)
    
    client = APIClient()
    
    # Create test users
    print("\n1. Creating/Getting test users...")
    try:
        admin_user, _ = User.objects.get_or_create(
            email='admin@test.com',
            defaults={
                'username': 'admin_user',
            }
        )
        if admin_user.password == '':
            admin_user.set_password('testpass123')
        admin_role = Role.objects.get(role_name='admin')
        admin_user.role = admin_role
        admin_user.save()
        
        invited_user, _ = User.objects.get_or_create(
            email='invited@test.com',
            defaults={
                'username': 'invited_user',
            }
        )
        if invited_user.password == '':
            invited_user.set_password('testpass123')
        member_role = Role.objects.get(role_name='family_member')
        invited_user.role = member_role
        invited_user.save()
        
        print(f"   ✓ Using admin user: {admin_user.email}")
        print(f"   ✓ Using invited user: {invited_user.email}")
    except Exception as e:
        print(f"   ✗ Error creating users: {e}")
        return
    
    # Create a family
    print("\n2. Creating/Getting test family...")
    try:
        family, _ = Family.objects.get_or_create(
            family_name='Test Family',
            defaults={
                'admin': admin_user
            }
        )
        print(f"   ✓ Using family: {family.family_name}")
    except Exception as e:
        print(f"   ✗ Error creating family: {e}")
        return
    
    # Create invitation
    print("\n3. Creating test invitation...")
    try:
        # Delete any existing invitations for this test
        Invitation.objects.filter(invited_email='invited@test.com', family=family).delete()
        
        invitation = Invitation.objects.create(
            family=family,
            invited_email='invited@test.com',
            invited_by=admin_user
        )
        print(f"   ✓ Created invitation for: {invitation.invited_email}")
    except Exception as e:
        print(f"   ✗ Error creating invitation: {e}")
        return
    
    # Get token for invited user
    print("\n4. Getting authentication token...")
    try:
        token, created = Token.objects.get_or_create(user=invited_user)
        client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        print(f"   ✓ Token obtained: {token.key[:20]}...")
    except Exception as e:
        print(f"   ✗ Error getting token: {e}")
        return
    
    # Test GET /api/users/invites/
    print("\n5. Testing GET /api/users/invites/")
    try:
        response = client.get('/api/users/invites/')
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Retrieved {len(data)} invitations")
            if data:
                inv = data[0]
                print(f"   Invitation details:")
                print(f"     - invitation_id: {inv.get('invitation_id')}")
                print(f"     - family_name: {inv.get('family_name')}")
                print(f"     - invited_by_name: {inv.get('invited_by_name')}")
                print(f"     - created_at: {inv.get('created_at')}")
        else:
            print(f"   ✗ Unexpected status code")
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test POST /api/users/accept_invitation/
    print("\n6. Testing POST /api/users/accept_invitation/")
    try:
        response = client.post(
            '/api/users/accept_invitation/',
            {'invitation_id': invitation.invitation_id},
            format='json'
        )
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ {data.get('message')}")
        else:
            print(f"   ✗ Unexpected status code")
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test POST /api/users/decline_invitation/
    print("\n7. Testing POST /api/users/decline_invitation/")
    try:
        # Create another invitation to decline
        invitation2 = Invitation.objects.create(
            family=family,
            invited_email='invited@test.com',
            invited_by=admin_user
        )
        response = client.post(
            '/api/users/decline_invitation/',
            {'invitation_id': invitation2.invitation_id},
            format='json'
        )
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ {data.get('message')}")
        else:
            print(f"   ✗ Unexpected status code")
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "="*70)
    print("TESTS COMPLETED")
    print("="*70 + "\n")

if __name__ == '__main__':
    test_invitations_api()
