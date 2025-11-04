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

email = 'testuser@example.com'
username = 'testuser'
password = 'testpass123'

if User.objects.filter(email=email).exists():
    user = User.objects.get(email=email)
    print('User already exists:', user.email)
else:
    user = User.objects.create_user(username=username, email=email, password=password)
    print('Created user:', user.email)

token, created = Token.objects.get_or_create(user=user)
print('Token for user:', token.key)
