#!/usr/bin/env python
"""
Script to check if django.contrib.gis is properly configured in the project.
"""

import os
import sys

# Add the project directory to the path so we can import settings
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")

try:
    from django.conf import settings

    # Check if django.contrib.gis is in INSTALLED_APPS
    if "django.contrib.gis" in settings.INSTALLED_APPS:
        print("✅ django.contrib.gis is in INSTALLED_APPS")
    else:
        print("❌ django.contrib.gis is NOT in INSTALLED_APPS")
        print("   Add 'django.contrib.gis' to INSTALLED_APPS in settings.py")

    # Check if GeoDjango database engine is configured
    db_engine = settings.DATABASES["default"]["ENGINE"]
    if "postgis" in db_engine or "spatialite" in db_engine:
        print(f"✅ GeoDjango database engine is configured: {db_engine}")
    else:
        print(f"❌ GeoDjango database engine is NOT configured: {db_engine}")
        print("   You should use 'django.contrib.gis.db.backends.postgis' or")
        print("   'django.contrib.gis.db.backends.spatialite' as your database engine")

    # Check if GDAL is available
    try:
        from django.contrib.gis.gdal import GDAL_VERSION

        print(f"✅ GDAL is available (version {GDAL_VERSION})")
    except ImportError:
        print("❌ GDAL is NOT available")
        print("   Make sure GDAL is installed on your system")

    # Check if GEOS is available
    try:
        from django.contrib.gis.geos import GEOS_VERSION

        print(f"✅ GEOS is available (version {GEOS_VERSION})")
    except ImportError:
        print("❌ GEOS is NOT available")
        print("   Make sure GEOS is installed on your system")

except ImportError as e:
    print(f"Error importing Django settings: {e}")
    print("Make sure you're running this script from the project directory")

print("\nIf you need to fix any issues:")
print("1. Add 'django.contrib.gis' to INSTALLED_APPS in settings.py")
print("2. Make sure your database engine is set to a GeoDjango-compatible engine")
print("3. Install the required GIS libraries (GDAL, GEOS, etc.)")
print("4. Restart your Django server")
