from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from .models import Post, Comment


@receiver(m2m_changed, sender=Post.upvotes.through)
def on_upvote(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add' and pk_set:
        from accounts.models import User
        from notifications.utils import notify_upvote
        for user_id in pk_set:
            actor = User.objects.get(pk=user_id)
            notify_upvote(instance, actor)


@receiver(post_save, sender=Comment)
def on_comment(sender, instance, created, **kwargs):
    if created:
        from notifications.utils import notify_comment
        notify_comment(instance.post, instance.author, instance.body)