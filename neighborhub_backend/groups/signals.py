from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Group


@receiver(m2m_changed, sender=Group.members.through)
def on_member_join(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add' and pk_set:
        from accounts.models import User
        from notifications.utils import notify_group_join
        for user_id in pk_set:
            actor = User.objects.get(pk=user_id)
            notify_group_join(instance, actor)