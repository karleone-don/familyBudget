"""
Create test family data with multiple users and transactions for testing dashboards.
Run with: python manage.py shell < scripts/create_test_family_data.py
"""

import os
import django
from decimal import Decimal
from datetime import datetime, timedelta
import pytz

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
django.setup()

from django.utils import timezone
from family_budget_app.models import User, Family, Finance, Role, Category, Transaction

# Clear existing test data
print("Clearing existing test data...")
Transaction.objects.all().delete()
Finance.objects.all().delete()
User.objects.filter(username__startswith='test_').delete()
Family.objects.filter(family_name__startswith='Test').delete()
Category.objects.all().delete()

# Create roles
print("Creating roles...")
admin_role, _ = Role.objects.get_or_create(role_name='admin')
member_role, _ = Role.objects.get_or_create(role_name='family_member')
kid_role, _ = Role.objects.get_or_create(role_name='kid')

# Create categories
print("Creating categories...")
categories_data = {
    'Жилье': 'housing',
    'Продукты': 'groceries',
    'Транспорт': 'transport',
    'Развлечения': 'entertainment',
    'Кафе и рестораны': 'dining',
    'Здоровье': 'health',
    'Подписки': 'subscriptions',
    'Подарки': 'gifts',
    'Коммуналка': 'utilities',
    'Фитнес': 'fitness',
    'Связь': 'communication',
    'Книги': 'books',
    'Обязательные': 'mandatory',
    'Необязательные': 'optional',
    'Накопления': 'savings',
    'Непредвиденные': 'unexpected',
}

categories = {}
for name, key in categories_data.items():
    cat, _ = Category.objects.get_or_create(category_name=name)
    categories[name] = cat

# Create family
print("Creating test family...")
admin_user = User.objects.create_user(
    username='test_admin',
    email='admin@testfamily.com',
    password='testpass123',
    age=45,
    role=admin_role
)
print(f"Created admin user: {admin_user.username}")

family = Family.objects.create(
    admin=admin_user,
    family_name='Тестовая Семья'
)
admin_user.family = family
admin_user.save()

# Create Finance profile for admin
finance_admin = Finance.objects.create(user=admin_user)
print(f"Created finance profile for {admin_user.username}")

# Create family members
print("Creating family members...")
member_user = User.objects.create_user(
    username='test_member',
    email='member@testfamily.com',
    password='testpass123',
    age=40,
    role=member_role,
    family=family
)
print(f"Created member user: {member_user.username}")

kid_user = User.objects.create_user(
    username='test_kid',
    email='kid@testfamily.com',
    password='testpass123',
    age=16,
    role=kid_role,
    family=family
)
print(f"Created kid user: {kid_user.username}")

# Create finance profiles
finance_member = Finance.objects.create(user=member_user)
finance_kid = Finance.objects.create(user=kid_user)

# Generate test transactions for the past 30 days
print("\nCreating test transactions...")
transaction_templates = [
    ('Аренда квартиры', 'Жилье', 20000, 'expense', 1),  # Monthly on 1st
    ('Покупка продуктов', 'Продукты', 3000, 'expense', None),  # Random days
    ('Такси', 'Транспорт', 500, 'expense', None),
    ('Кино', 'Развлечения', 800, 'expense', None),
    ('Кафе', 'Кафе и рестораны', 1500, 'expense', None),
    ('Фитнес', 'Фитнес', 1200, 'expense', 10),  # Monthly on 10th
    ('Интернет', 'Связь', 1000, 'expense', 5),  # Monthly on 5th
    ('Зарплата', 'Доход', 50000, 'income', 1),  # Monthly on 1st
    ('Netflix', 'Подписки', 400, 'expense', 15),  # Monthly on 15th
    ('Доставка', 'Кафе и рестораны', 300, 'expense', None),
]

now = timezone.now()
transaction_count = 0

for day in range(30, 0, -1):
    date = now - timedelta(days=day)
    
    for desc, cat_name, amount, trans_type, fixed_day in transaction_templates:
        # Skip if fixed_day is set and doesn't match
        if fixed_day and date.day != fixed_day:
            continue
        
        # Skip random transactions on some days
        if not fixed_day and day % 3 != 0:
            continue
        
        # Randomly assign to different users and finances
        if day % 3 == 0:
            finance = finance_admin
        elif day % 3 == 1:
            finance = finance_member
        else:
            finance = finance_kid if finance_kid else finance_member
        
        trans = Transaction.objects.create(
            finance=finance,
            amount=Decimal(str(amount)),
            category=categories.get(cat_name),
            type=trans_type,
            date=date,
            description=desc
        )
        transaction_count += 1
        print(f"  Created: {finance.user.username} - {desc} ({amount} ₽) on {date.strftime('%Y-%m-%d')}")

print(f"\n✅ Test data created successfully!")
print(f"   Family: {family.family_name} (ID: {family.family_id})")
print(f"   Admin: {admin_user.username} (email: {admin_user.email})")
print(f"   Member: {member_user.username} (email: {member_user.email})")
print(f"   Kid: {kid_user.username} (email: {kid_user.email})")
print(f"   Transactions created: {transaction_count}")
print(f"\n📝 Test credentials:")
print(f"   Admin - Email: admin@testfamily.com | Password: testpass123")
print(f"   Member - Email: member@testfamily.com | Password: testpass123")
print(f"   Kid - Email: kid@testfamily.com | Password: testpass123")
