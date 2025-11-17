from django.apps import AppConfig

class FamilyBudgetAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'family_budget_app'
    
    def ready(self):
        # Ensure default roles exist on app startup. Guard against running
        # during migrations or when DB isn't ready yet.
        try:
            from django.db.utils import OperationalError, ProgrammingError
            from .models import Role
            # create basic roles if missing
            for rn in ('admin', 'family_member', 'kid', 'solo'):
                Role.objects.get_or_create(role_name=rn)
        except (OperationalError, ProgrammingError, ImportError):
            # If DB isn't ready yet (makemigrations/migrate), skip
            pass