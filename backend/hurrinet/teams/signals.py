from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import TeamMember, Team


@receiver(post_save, sender=TeamMember)
def update_team_on_member_change(sender, instance, created, **kwargs):
    """
    Signal to handle team member changes
    """
    if created:
        # When a new member is added, update the team's member count
        instance.team.save()  # This will trigger the team's save method


@receiver(post_delete, sender=TeamMember)
def update_team_on_member_delete(sender, instance, **kwargs):
    """
    Signal to handle team member deletion
    """
    if instance.team:
        instance.team.save()  # Update the team's member count


@receiver(post_save, sender=Team)
def handle_team_status_change(sender, instance, **kwargs):
    """
    Signal to handle team status changes
    """
    if instance.status == "OFF_DUTY":
        # When team goes off duty, update all active members to off duty
        instance.teammember_set.filter(status="ACTIVE").update(status="OFF_DUTY")
