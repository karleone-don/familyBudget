# Test Credentials

## Family Budget App - Test Users

Below are the test users available in the application. Use these credentials to log in.

### TestFamily - Family Users (Shared Budget)
- **Admin Email:** admin@testfamily.com
- **Admin Password:** admin123
- **Role:** Admin
- **Family:** TestFamily

- **Member Email:** member@testfamily.com
- **Member Password:** member123
- **Role:** Family Member
- **Family:** TestFamily

- **Kid Email:** kid@testfamily.com
- **Kid Password:** kid123
- **Role:** Kid
- **Family:** TestFamily

### Solo Users (Personal Budget Only)

#### Admin User
- **Email:** admin1@example.com
- **Password:** admin123
- **Role:** Admin

#### Family Member
- **Email:** member1@example.com
- **Password:** member123
- **Role:** Family Member

#### Kid User
- **Email:** kid1@example.com
- **Password:** kid123
- **Role:** Kid

#### Solo User
- **Email:** solo@example.com
- **Password:** solo123
- **Role:** Solo

#### Additional Test Users
- **Email:** zhaks@email.com
- **Password:** password123
- **Role:** Solo

- **Email:** qq@email.com
- **Password:** password123
- **Role:** Solo

- **Email:** test@example.com
- **Password:** password123
- **Role:** Solo

## How to Login

1. Go to the application home page
2. Click "Login" button
3. Enter your email and password from the list above
4. You'll be redirected to your respective dashboard:
   - **Admin/Family Members:** Family Budget Dashboard (TestFamily)
   - **Solo User:** Personal Budget Dashboard
   - **Kid:** Limited Family Budget View (TestFamily)

## User Type Differences

### TestFamily Users
- All members of the same family (TestFamily)
- Can see each other's transactions
- Share budget information
- Can add expenses for the family

### Solo Users
- Independent users
- Can only see their own transactions
- Personal budget tracking only

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

## Troubleshooting Login Issues

If you get "Invalid email or password":

1. Make sure you're using the exact email and password from this list
2. Check that the backend server is running (`python manage.py runserver`)
3. Verify the REACT_APP_API_URL environment variable is set to `http://localhost:8000`
4. Check browser console for network errors
