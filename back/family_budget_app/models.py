from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class Role(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('family_member', 'Family Member'),
        ('kid', 'Kid'),
    ]

    role_id = models.AutoField(primary_key=True)  # Добавьте явное поле
    role_name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.get_role_name_display()


class Family(models.Model):
    family_id = models.AutoField(primary_key=True)
    admin = models.ForeignKey('User', on_delete=models.CASCADE, related_name='administered_families')
    family_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=timezone.now)
    # A join code (UUID) that can be shared to allow users to join this family
    # Use a UUIDField with a callable default; this avoids migration serialization issues
    join_code = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)

    def __str__(self):
        return self.family_name

class User(AbstractUser):
    # Inherits password hashing from AbstractUser
    # Keep primary key type compatible with existing migrations (AutoField)
    # The initial migration created `user_id` as an AutoField, so use the same
    # here to avoid datatype mismatch with the existing SQLite DB.
    user_id = models.AutoField(primary_key=True)
    age = models.IntegerField(null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    family = models.ForeignKey(Family, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')

    # Remove unused fields from AbstractUser
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.role})"

class Finance(models.Model):
    finance_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='finance')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def update_balance(self):
        from decimal import Decimal
        # Ensure all values are Decimal for proper arithmetic
        income = Decimal(str(self.income)) if self.income else Decimal('0')
        expenses = Decimal(str(self.expenses)) if self.expenses else Decimal('0')
        self.balance = income - expenses
        self.save()

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100)

    def __str__(self):
        return self.category_name

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    transaction_id = models.AutoField(primary_key=True)
    finance = models.ForeignKey(Finance, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    date = models.DateTimeField(default=timezone.now)
    description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        # Determine whether this is a new record or an update
        is_new = self.pk is None
        old_amount = None
        old_type = None
        if not is_new:
            try:
                old = Transaction.objects.get(pk=self.pk)
                old_amount = old.amount
                old_type = old.type
            except Transaction.DoesNotExist:
                # treat as new if not found
                is_new = True

        # Save the transaction first
        super().save(*args, **kwargs)

        # Ensure finance exists
        if not self.finance:
            return

        # Simple approach: on create, add amount to income/expenses; on update, adjust by difference
        if is_new:
            if self.type == 'income':
                self.finance.income = (self.finance.income or 0) + self.amount
            else:
                self.finance.expenses = (self.finance.expenses or 0) + self.amount
        else:
            # reverse old values then apply new ones
            if old_amount is not None and old_type is not None:
                if old_type == 'income':
                    self.finance.income = (self.finance.income or 0) - old_amount
                else:
                    self.finance.expenses = (self.finance.expenses or 0) - old_amount

            if self.type == 'income':
                self.finance.income = (self.finance.income or 0) + self.amount
            else:
                self.finance.expenses = (self.finance.expenses or 0) + self.amount

        # Recompute balance and save
        self.finance.update_balance()

    def delete(self, *args, **kwargs):
        # Before deleting, reverse the transaction effect on the related finance
        try:
            if self.finance:
                if self.type == 'income':
                    self.finance.income = (self.finance.income or 0) - self.amount
                else:
                    self.finance.expenses = (self.finance.expenses or 0) - self.amount
                self.finance.update_balance()
        except Exception:
            # If anything goes wrong, proceed with delete to avoid leaving stale DB state
            pass
        return super().delete(*args, **kwargs)


class Invitation(models.Model):
    invitation_id = models.AutoField(primary_key=True)
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='invitations')
    invited_email = models.EmailField()
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_invitations')
    # token stored as UUID for invitations
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Invite {self.invited_email} to {self.family.family_name}"

class Goal(models.Model):
    goal_id = models.AutoField(primary_key=True)
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='goals')
    goal_name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deadline = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)

    def progress_percentage(self):
        if self.target_amount > 0:
            return (self.current_amount / self.target_amount) * 100
        return 0