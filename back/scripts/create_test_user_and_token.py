import os
import sys
# Add project root (parent of this scripts folder) to sys.path so Python can import the Django project package
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def print_all_users():
    print("\nAll users in database:")
    users = User.objects.select_related('role', 'family').all()
    if not users:
        print("No users found.")
        return
    for u in users:
        token, _ = Token.objects.get_or_create(user=u)
        print('-' * 40)
        print(f"Email:     {u.email}")
        print(f"Username:  {u.username}")
        print(f"User ID:   {getattr(u, 'user_id', 'N/A')}")
        print(f"Role:      {u.role.role_name if u.role else None}")
        print(f"Family:    {u.family.family_name if u.family else None}")
        print(f"Token:     {token.key}")
    print('-' * 40)


if __name__ == '__main__':
    print_all_users()
