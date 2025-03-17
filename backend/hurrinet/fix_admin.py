#!/usr/bin/env python
"""
Script to fix the admin configuration by switching to the simplified version.
"""

import os
import shutil
import sys

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
resource_management_dir = os.path.join(script_dir, "resource_management")

# Paths to the admin files
admin_file = os.path.join(resource_management_dir, "admin.py")
admin_simple_file = os.path.join(resource_management_dir, "admin_simple.py")
admin_backup_file = os.path.join(resource_management_dir, "admin_backup.py")

# Check if the files exist
if not os.path.exists(admin_simple_file):
    print(f"Error: {admin_simple_file} does not exist.")
    sys.exit(1)

# Backup the current admin.py if it exists
if os.path.exists(admin_file):
    print(f"Backing up {admin_file} to {admin_backup_file}")
    shutil.copy2(admin_file, admin_backup_file)

# Copy the simplified admin file to admin.py
print(f"Copying {admin_simple_file} to {admin_file}")
shutil.copy2(admin_simple_file, admin_file)

print("\nAdmin configuration has been updated to use the simplified version.")
print("You can now run your Django server and access the admin interface.")
print(f"The original admin configuration has been backed up to {admin_backup_file}")
print("\nIf you want to restore the original configuration, run:")
print(f"cp {admin_backup_file} {admin_file}")

# Check if django.contrib.gis is in INSTALLED_APPS
try:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
    from django.conf import settings

    if "django.contrib.gis" not in settings.INSTALLED_APPS:
        print("\nNote: 'django.contrib.gis' is not in INSTALLED_APPS.")
        print(
            "If you want to use the GIS features, add it to INSTALLED_APPS in settings.py:"
        )
        print("    INSTALLED_APPS = [")
        print("        # ... other apps")
        print("        'django.contrib.gis',")
        print("        # ... other apps")
        print("    ]")
except ImportError:
    print("\nCould not check if django.contrib.gis is in INSTALLED_APPS.")
    print("Make sure to add it if you want to use GIS features.")
