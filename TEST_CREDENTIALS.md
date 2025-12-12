# Test Credentials

## Family Budget App - Test Users

Below are the test users available in the application. Use these credentials to log in.

### Admin User (Full Family Access)
- **Email:** admin1@example.com
- **Password:** admin123
- **Role:** Admin
- **Family:** TestFamily

### Family Member
- **Email:** member1@example.com
- **Password:** member123
- **Role:** Family Member
- **Family:** TestFamily

### Kid User
- **Email:** kid1@example.com
- **Password:** kid123
- **Role:** Kid
- **Family:** TestFamily

### Solo User (Personal Budget Only)
- **Email:** solo@example.com
- **Password:** solo123
- **Role:** Solo

### Additional Test Users
- **Email:** zhaks@email.com
- **Password:** password123

- **Email:** qq@email.com
- **Password:** password123

- **Email:** test@example.com
- **Password:** password123

## How to Login

1. Go to the application home page
2. Click "Login" button
3. Enter your email and password from the list above
4. You'll be redirected to your respective dashboard:
   - **Admin/Family Members:** Family Budget Dashboard
   - **Solo User:** Personal Budget Dashboard
   - **Kid:** Limited Family Budget View

## Creating New Test Users (Backend Only)

If you need to create additional test users, you can use the Django management shell:

```bash
cd back
python manage.py shell
```

Then in the Python shell:

```python
from family_budget_app.models import User, Role

# Create solo role if needed
solo_role, _ = Role.objects.get_or_create(role_name='solo')

# Create new user
user = User.objects.create_user(
    username='newuser',
    email='newuser@example.com',
    password='password123',
    age=25
)
user.role = solo_role
user.save()
```
