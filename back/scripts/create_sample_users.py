import os
import sys
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from family_budget_app.models import Role, Family

User = get_user_model()

# Ensure roles exist
roles = ['admin', 'family_member', 'kid']
for r in roles:
    Role.objects.get_or_create(role_name=r)

# Create an admin user and family
admin_email = 'admin1@example.com'
admin_username = 'admin1'
admin_pass = 'adminpass123'
if not User.objects.filter(email=admin_email).exists():
    admin = User.objects.create_user(username=admin_username, email=admin_email, password=admin_pass)
else:
    admin = User.objects.get(email=admin_email)
admin_role = Role.objects.get(role_name='admin')
admin.role = admin_role
admin.save()

# Create family and assign admin
family, created = Family.objects.get_or_create(family_name='TestFamily', admin=admin)
admin.family = family
admin.save()

# Create a family member
member_email = 'member1@example.com'
member_username = 'member1'
member_pass = 'memberpass123'
if not User.objects.filter(email=member_email).exists():
    member = User.objects.create_user(username=member_username, email=member_email, password=member_pass)
else:
    member = User.objects.get(email=member_email)
member_role = Role.objects.get(role_name='family_member')
member.role = member_role
member.family = family
member.save()

# Create a kid user
kid_email = 'kid1@example.com'
kid_username = 'kid1'
kid_pass = 'kidpass123'
if not User.objects.filter(email=kid_email).exists():
    kid = User.objects.create_user(username=kid_username, email=kid_email, password=kid_pass)
else:
    kid = User.objects.get(email=kid_email)
kid_role = Role.objects.get(role_name='kid')
kid.role = kid_role
nkid_role = kid_role
kid.family = family
kid.save()

# Create standalone user (no family)
solo_email = 'solo@example.com'
solo_username = 'solo'
solo_pass = 'solopass123'
if not User.objects.filter(email=solo_email).exists():
    solo = User.objects.create_user(username=solo_username, email=solo_email, password=solo_pass)
else:
    solo = User.objects.get(email=solo_email)
solo.role = None
solo.family = None
solo.save()

# Create tokens and print credentials
users = [
    (admin, admin_pass, 'admin'),
    (member, member_pass, 'family_member'),
    (kid, kid_pass, 'kid'),
    (solo, solo_pass, 'solo'),
]

for u, pwd, role in users:
    token, _ = Token.objects.get_or_create(user=u)
    print(f"{role}: email={u.email} username={u.username} password={pwd} token={token.key}")

print('\nFamily join code (share this to join):', family.join_code)
