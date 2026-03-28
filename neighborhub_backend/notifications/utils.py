from .models import Notification


def send_notification(recipient, notif_type, message, actor=None, link=''):
    """Create a notification. Skip if recipient == actor."""
    if actor and recipient == actor:
        return
    Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notif_type=notif_type,
        message=message,
        link=link,
    )


def notify_upvote(post, actor):
    send_notification(
        recipient=post.author,
        actor=actor,
        notif_type='upvote',
        message=f'{actor.full_name} upvoted your post "{post.title[:40]}"',
        link=f'/posts/{post.id}/',
    )


def notify_comment(post, actor, comment_body):
    send_notification(
        recipient=post.author,
        actor=actor,
        notif_type='comment',
        message=f'{actor.full_name} commented on "{post.title[:40]}"',
        link=f'/posts/{post.id}/',
    )


def notify_group_join(group, actor):
    send_notification(
        recipient=group.admin,
        actor=actor,
        notif_type='group',
        message=f'{actor.full_name} joined your group "{group.name}"',
        link=f'/groups/{group.id}/',
    )


def notify_new_message(room, sender, recipient):
    send_notification(
        recipient=recipient,
        actor=sender,
        notif_type='chat',
        message=f'New message from {sender.full_name}',
        link=f'/chat/{room.id}/',
    )