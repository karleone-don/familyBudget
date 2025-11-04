from django.core.management.base import BaseCommand
from family_budget_app.models import Role

class Command(BaseCommand):
    help = 'Create initial roles'

    def handle(self, *args, **options):
        roles = ['admin', 'family_member', 'kid']
        for role_name in roles:
            Role.objects.get_or_create(role_name=role_name)
        self.stdout.write(self.style.SUCCESS('Successfully created roles'))