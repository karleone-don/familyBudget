import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')

import django
django.setup()

from family_budget_app.models import User
from django.contrib.auth import authenticate

print('All users in database:')
print('='*70)
print(f"{'Email':<32} | {'Role':<15} | {'Family':<20}")
print('='*70)

for user in User.objects.all():
    email = user.email[:32]
    role = (user.role.role_name if user.role else 'None')[:15]
    family = (user.family.family_name if user.family else 'None')[:20]
    print(f'{email:<32} | {role:<15} | {family:<20}')

print('\n' + '='*70)
print('Testing passwords for problematic users:')
print('='*70)

test_users = [
    ('admin@testfamily.com', 'password'),
    ('admin@testfamily.com', 'admin123'),
    ('member@testfamily.com', 'password'),
    ('member@testfamily.com', 'member123'),
    ('kid@testfamily.com', 'password'),
    ('kid@testfamily.com', 'kid123'),
]

for email, password in test_users:
    user = authenticate(username=email, password=password)
    status = '✓ OK' if user else '✗ FAIL'
    print(f'{status} | {email:<32} | Password: {password:<12}')
