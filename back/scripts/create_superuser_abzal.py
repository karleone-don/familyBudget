import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'abzal'
email = 'abzal@kbtu.kz'
password = '1234'

u = User.objects.filter(username=username).first()
if u:
    u.is_superuser = True
    u.is_staff = True
    u.set_password(password)
    u.save()
    print('Updated existing user to superuser')
else:
    User.objects.create_superuser(username, email, password)
    print('Created superuser abzal')
