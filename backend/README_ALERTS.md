# HurriNet Alert System

This document provides instructions on how to generate sample alerts for testing the HurriNet alert system.

## Generating Sample Alerts

There are two ways to generate sample alerts:

### 1. Using the Django Management Command

```bash
# Navigate to the project directory
cd HurriNet/backend

# Generate 10 random alerts (default)
python manage.py generate_sample_alerts

# Generate a specific number of alerts
python manage.py generate_sample_alerts --count 5

# Generate only active alerts
python manage.py generate_sample_alerts --active

# Generate a specific number of active alerts
python manage.py generate_sample_alerts --count 3 --active
```

### 2. Using the Standalone Script

```bash
# Navigate to the project directory
cd HurriNet/backend

# Generate 10 random alerts (default)
python generate_alerts.py

# Generate a specific number of alerts
python generate_alerts.py --count 5

# Generate only active alerts
python generate_alerts.py --active

# Generate a specific number of active alerts
python generate_alerts.py --count 3 --active
```

## Alert Types

The sample alerts include various types of weather and emergency alerts:

1. Hurricane Warning (EXTREME severity)
2. Tropical Storm Watch (HIGH severity)
3. Flash Flood Warning (HIGH severity)
4. High Wind Advisory (MODERATE severity)
5. Heavy Rain Alert (MODERATE severity)
6. Coastal Erosion Notice (LOW severity)
7. Heat Advisory (LOW severity)

Each alert includes:

- Title
- Description
- Severity level
- Instructions for the public
- Affected areas
- Random district assignment

## Viewing Alerts

After generating alerts, you can view them:

1. In the Django Admin interface: `/admin/alerts/alert/`
2. Through the API endpoint: `/api/alerts/`
3. Active alerts endpoint: `/api/alerts/current/`

## Frontend Integration

The frontend AlertContext has been updated to properly handle the alert data format from the backend. The context will:

1. Fetch active alerts from the backend
2. Sort alerts by severity (EXTREME > HIGH > MODERATE > LOW)
3. Display the highest severity alert to the user
4. Update the alert status every 30 seconds

## Alert Severity Levels

The system uses the following severity levels:

- EXTREME: Immediate action required, potential life-threatening situation
- HIGH: Significant threat, preparation needed
- MODERATE: Potential for impact, increased awareness needed
- LOW: Minor impacts expected, general awareness advised
- normal: No active alerts
