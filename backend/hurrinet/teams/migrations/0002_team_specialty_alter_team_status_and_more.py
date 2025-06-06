# Generated by Django 5.1.7 on 2025-03-23 01:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='specialty',
            field=models.CharField(blank=True, choices=[('EMERGENCY', 'Emergency Medicine'), ('TRAUMA', 'Trauma Care'), ('GENERAL', 'General Medical'), ('SPECIALIZED', 'Specialized Care')], help_text='Specialty for medical teams', max_length=50, null=True, verbose_name='Specialty'),
        ),
        migrations.AlterField(
            model_name='team',
            name='status',
            field=models.CharField(help_text='Status choices depend on team type (medical or emergency)', max_length=20, verbose_name='Status'),
        ),
        migrations.AlterField(
            model_name='team',
            name='team_type',
            field=models.CharField(choices=[('MEDICAL', 'Medical Response'), ('FIRST_RESPONSE', 'First Response'), ('SEARCH_RESCUE', 'Search and Rescue'), ('EVACUATION', 'Evacuation'), ('HAZMAT', 'Hazardous Materials'), ('LOGISTICS', 'Logistics Support')], max_length=50, verbose_name='Team Type'),
        ),
    ]
