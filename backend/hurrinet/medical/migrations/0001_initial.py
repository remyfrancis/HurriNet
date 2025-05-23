# Generated by Django 5.1.7 on 2025-03-22 21:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MedicalFacility',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('facility_type', models.CharField(choices=[('HOSPITAL', 'Hospital'), ('CLINIC', 'Clinic'), ('FIELD_STATION', 'Field Station'), ('EMERGENCY_CENTER', 'Emergency Center')], max_length=20)),
                ('address', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('OPERATIONAL', 'Fully Operational'), ('LIMITED', 'Limited Services'), ('CRITICAL', 'Critical Resources Only'), ('OFFLINE', 'Not Operational')], default='OPERATIONAL', max_length=20)),
                ('total_capacity', models.IntegerField(help_text='Total number of beds/patients')),
                ('current_occupancy', models.IntegerField(default=0)),
                ('has_power', models.BooleanField(default=True)),
                ('has_water', models.BooleanField(default=True)),
                ('has_oxygen', models.BooleanField(default=True)),
                ('has_ventilators', models.BooleanField(default=True)),
                ('primary_contact', models.CharField(max_length=255)),
                ('phone_number', models.CharField(max_length=20)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='MedicalEmergency',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('incident_id', models.CharField(max_length=20, unique=True)),
                ('location_lat', models.FloatField()),
                ('location_lng', models.FloatField()),
                ('description', models.TextField()),
                ('reported_time', models.DateTimeField(auto_now_add=True)),
                ('severity', models.CharField(choices=[('LOW', 'Low Priority'), ('MEDIUM', 'Medium Priority'), ('HIGH', 'High Priority'), ('CRITICAL', 'Critical Priority')], max_length=10)),
                ('status', models.CharField(choices=[('REPORTED', 'Reported'), ('ASSIGNED', 'Assigned'), ('IN_PROGRESS', 'In Progress'), ('RESOLVED', 'Resolved'), ('CLOSED', 'Closed')], default='REPORTED', max_length=15)),
                ('assignment_time', models.DateTimeField(blank=True, null=True)),
                ('resolution_notes', models.TextField(blank=True)),
                ('resolved_time', models.DateTimeField(blank=True, null=True)),
                ('assigned_facility', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_emergencies', to='medical.medicalfacility')),
            ],
        ),
        migrations.CreateModel(
            name='MedicalSupply',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('supply_type', models.CharField(choices=[('MEDICATION', 'Medication'), ('EQUIPMENT', 'Medical Equipment'), ('PPE', 'Personal Protective Equipment'), ('FIRST_AID', 'First Aid Supplies'), ('BLOOD', 'Blood Products'), ('OTHER', 'Other Supplies')], max_length=20)),
                ('quantity', models.IntegerField()),
                ('threshold_level', models.IntegerField(help_text='Minimum required quantity')),
                ('expiration_date', models.DateField(blank=True, null=True)),
                ('facility', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='supplies', to='medical.medicalfacility')),
            ],
        ),
    ]
