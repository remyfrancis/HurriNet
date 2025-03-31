"""
Django application configuration for the Alerts app.
This module defines the configuration class for the alerts system within HurriNet.
"""

from django.apps import AppConfig


class AlertsConfig(AppConfig):
    """
    Configuration class for the Alerts application.

    Defines core settings for the alerts system including:
    - Database auto field type
    - Application namespace
    """

    # Use BigAutoField as primary key type for all models in this app
    default_auto_field = "django.db.models.BigAutoField"

    # Python dotted path to this application
    name = "alerts"
