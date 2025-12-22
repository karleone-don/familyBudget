# Generated migration for JoinRequest model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('family_budget_app', '0004_add_avatar'),
    ]

    operations = [
        migrations.CreateModel(
            name='JoinRequest',
            fields=[
                ('join_request_id', models.AutoField(primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('decided_at', models.DateTimeField(blank=True, null=True)),
                ('decided_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_join_requests', to=settings.AUTH_USER_MODEL)),
                ('family', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='join_requests', to='family_budget_app.family')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='join_requests', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='joinrequest',
            constraint=models.UniqueConstraint(fields=('family', 'user'), name='unique_family_user_join_request'),
        ),
    ]
