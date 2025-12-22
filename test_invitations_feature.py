"""
Test script to verify the invitations feature works end-to-end.
This tests the backend decline_invitation endpoint.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_invitations_flow():
    """Test the invitations flow"""
    
    print("=" * 60)
    print("Testing Invitations Feature")
    print("=" * 60)
    
    # Note: You need to set a valid token from an authenticated user
    # For testing, use: python manage.py drf_create_token <username>
    
    TOKEN = "YOUR_AUTH_TOKEN_HERE"  # Replace with actual token
    
    if TOKEN == "YOUR_AUTH_TOKEN_HERE":
        print("\n⚠️  Please set a valid TOKEN from an authenticated user")
        print("To generate a token: python manage.py drf_create_token <username>")
        return
    
    headers = {
        "Authorization": f"Token {TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Get pending invitations
    print("\n1. Fetching pending invitations...")
    response = requests.get(f"{BASE_URL}/api/users/invites/", headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        invitations = response.json()
        print(f"   Invitations count: {len(invitations)}")
        if invitations:
            print(f"   First invitation: {invitations[0]}")
    else:
        print(f"   Error: {response.text}")
    
    # Test 2: Test decline_invitation endpoint (if invitations exist)
    print("\n2. Testing decline_invitation endpoint...")
    if response.status_code == 200 and invitations:
        invitation_id = invitations[0]["invitation_id"]
        decline_data = {"invitation_id": invitation_id}
        response = requests.post(
            f"{BASE_URL}/api/users/decline_invitation/",
            headers=headers,
            json=decline_data
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    else:
        print("   No invitations to test decline")
    
    print("\n" + "=" * 60)
    print("Tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    test_invitations_flow()
