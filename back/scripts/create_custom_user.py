import os
import sys

# Add project root to Python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from family_budget_app.models import Role, Family

User = get_user_model()

def create_user(email, password, role_name=None, family_name=None):
    # Create user
    username = email.split('@')[0]
    if User.objects.filter(email=email).exists():
        print(f"User with email {email} already exists")
        return None
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    # Assign role if specified
    if role_name:
        role, _ = Role.objects.get_or_create(role_name=role_name)
        user.role = role
        
        # If role is admin, create a new family
        if role_name == 'admin' and family_name:
            family, _ = Family.objects.get_or_create(
                family_name=family_name,
                admin=user
            )
            user.family = family
    
    user.save()
    
    # Create token
    token, _ = Token.objects.get_or_create(user=user)
    
    print(f"\nUser created successfully:")
    print(f"Email: {user.email}")
    print(f"Username: {user.username}")
    print(f"Role: {user.role.role_name if user.role else 'None'}")
    print(f"Family: {user.family.family_name if user.family else 'None'}")
    print(f"Token: {token.key}")
    
    return user

if __name__ == '__main__':
    # Create your custom user
    create_user(
        email='abzal@kbtu.kz',
        password='abzalpass123',
        role_name='admin',  # Can be 'admin', 'family_member', 'kid', or None
        family_name='AbzalFamily'
    )