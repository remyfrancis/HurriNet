from django.apps import AppConfig


class TeamsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "teams"  # This should match your app directory name
    verbose_name = "Teams Management"

    def ready(self):
        try:
            import teams.signals  # noqa
        except ImportError:
            pass
