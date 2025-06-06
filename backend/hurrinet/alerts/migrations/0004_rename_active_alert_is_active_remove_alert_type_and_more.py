# Generated by Django 5.1.4 on 2025-03-03 04:58

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('alerts', '0003_alert_created_by'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameField(
            model_name='alert',
            old_name='active',
            new_name='is_active',
        ),
        migrations.RemoveField(
            model_name='alert',
            name='type',
        ),
        migrations.AddField(
            model_name='alert',
            name='affected_areas',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='description',
            field=models.TextField(default='No description provided'),
        ),
        migrations.AddField(
            model_name='alert',
            name='instructions',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='is_public',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='alert',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='alert',
            name='created_by',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='alert',
            name='severity',
            field=models.CharField(choices=[('LOW', 'Low'), ('MODERATE', 'Moderate'), ('HIGH', 'High'), ('EXTREME', 'Extreme')], max_length=10),
        ),
        migrations.AlterField(
            model_name='alert',
            name='title',
            field=models.CharField(max_length=255),
        ),
    ]
