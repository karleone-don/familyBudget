from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'age', 'role', 'family')
    list_filter = ('role', 'family')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('age', 'role', 'family')}),
    )

@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ('family_name', 'admin', 'created_at')

@admin.register(Finance)
class FinanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'income', 'expenses', 'updated_at')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('finance', 'amount', 'category', 'type', 'date')

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('goal_name', 'family', 'target_amount', 'current_amount', 'deadline')

admin.site.register(Role)
admin.site.register(Category)